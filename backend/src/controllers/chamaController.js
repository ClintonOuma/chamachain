const mongoose = require('mongoose');
const Chama = require('../models/Chama');
const Membership = require('../models/Membership');
const generateInviteCode = require('../utils/generateInviteCode');

const buildUniqueInviteCode = async () => {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const code = generateInviteCode();
    const taken = await Chama.findOne({ inviteCode: code }).lean();
    if (!taken) return code;
  }
  throw new Error('Could not generate a unique invite code');
};

const createChama = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ success: false, message: 'name is required' });
    }

    const inviteCode = await buildUniqueInviteCode();

    const chama = await Chama.create({
      name: name.trim(),
      description: description != null ? String(description) : '',
      inviteCode,
      createdBy: req.user.userId
    });

    await Membership.create({
      userId: req.user.userId,
      chamaId: chama._id,
      role: 'admin',
      status: 'active'
    });

    return res.status(201).json({ success: true, chama });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getMyChamas = async (req, res) => {
  try {
    const memberships = await Membership.find({
      userId: req.user.userId,
      status: 'active'
    }).populate('chamaId');

    return res.json({ success: true, chamas: memberships });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getChamaById = async (req, res) => {
  try {
    const { chamaId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(chamaId)) {
      return res.status(400).json({ success: false, message: 'Invalid chamaId' });
    }

    const membership = await Membership.findOne({
      userId: req.user.userId,
      chamaId,
      status: 'active'
    });
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Not a member of this chama' });
    }

    const chama = await Chama.findById(chamaId).populate('createdBy', 'fullName email');
    if (!chama) {
      return res.status(404).json({ success: false, message: 'Chama not found' });
    }

    return res.json({ success: true, chama });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateChama = async (req, res) => {
  try {
    const { chamaId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(chamaId)) {
      return res.status(400).json({ success: false, message: 'Invalid chamaId' });
    }

    const chama = await Chama.findById(chamaId);
    if (!chama) {
      return res.status(404).json({ success: false, message: 'Chama not found' });
    }

    const { name, description, settings } = req.body;

    if (name !== undefined) chama.name = String(name).trim();
    if (description !== undefined) chama.description = String(description);
    if (settings !== undefined && typeof settings === 'object' && settings !== null) {
      chama.settings = {
        ...chama.settings.toObject(),
        ...settings
      };
    }

    await chama.save();

    return res.json({ success: true, chama });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const joinChama = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode || typeof inviteCode !== 'string') {
      return res.status(400).json({ success: false, message: 'inviteCode is required' });
    }

    const normalized = inviteCode.trim().toUpperCase();
    const chama = await Chama.findOne({ inviteCode: normalized });
    if (!chama) {
      return res.status(404).json({ success: false, message: 'Chama not found' });
    }

    if (chama.status !== 'active') {
      return res.status(400).json({ success: false, message: 'This chama is not accepting new members' });
    }

    const existing = await Membership.findOne({
      userId: req.user.userId,
      chamaId: chama._id,
      status: 'active'
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Already a member of this chama' });
    }

    const leftBefore = await Membership.findOne({
      userId: req.user.userId,
      chamaId: chama._id,
      status: 'left'
    });
    if (leftBefore) {
      leftBefore.status = 'active';
      leftBefore.role = 'member';
      await leftBefore.save();
      return res.json({
        success: true,
        message: 'Joined successfully',
        chama
      });
    }

    await Membership.create({
      userId: req.user.userId,
      chamaId: chama._id,
      role: 'member',
      status: 'active'
    });

    return res.json({
      success: true,
      message: 'Joined successfully',
      chama
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Already a member of this chama' });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getMembers = async (req, res) => {
  try {
    const { chamaId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(chamaId)) {
      return res.status(400).json({ success: false, message: 'Invalid chamaId' });
    }

    const membership = await Membership.findOne({
      userId: req.user.userId,
      chamaId,
      status: 'active'
    });
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Not a member of this chama' });
    }

    const members = await Membership.find({
      chamaId,
      status: 'active'
    }).populate('userId', 'fullName email phone avatar');

    return res.json({ success: true, members });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const changeMemberRole = async (req, res) => {
  try {
    const { chamaId, userId } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(chamaId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }

    const allowed = ['admin', 'treasurer', 'member', 'observer'];
    if (!role || !allowed.includes(role)) {
      return res.status(400).json({ success: false, message: 'Valid role is required' });
    }

    const target = await Membership.findOne({
      userId,
      chamaId,
      status: 'active'
    });
    if (!target) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    target.role = role;
    await target.save();

    return res.json({ success: true, message: 'Role updated' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const { chamaId, userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chamaId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }

    const target = await Membership.findOne({
      userId,
      chamaId,
      status: 'active'
    });
    if (!target) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    target.status = 'left';
    await target.save();

    return res.json({ success: true, message: 'Member removed' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createChama,
  getMyChamas,
  getChamaById,
  updateChama,
  joinChama,
  getMembers,
  changeMemberRole,
  removeMember
};
