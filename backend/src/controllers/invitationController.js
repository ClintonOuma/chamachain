const Chama = require('../models/Chama');
const Membership = require('../models/Membership');
const User = require('../models/User');

const joinChamaByCode = async (req, res) => {
  try {
    const { inviteCode, role = 'member' } = req.body;
    const userId = req.user.id;

    if (!inviteCode) {
      return res.status(400).json({
        success: false,
        message: 'Invite code is required'
      });
    }

    const chama = await Chama.findOne({ inviteCode });
    if (!chama) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite code'
      });
    }

    if (chama.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Chama is not active'
      });
    }

    const existingMembership = await Membership.findOne({
      userId,
      chamaId: chama._id
    });

    if (existingMembership) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this chama'
      });
    }

    const membership = new Membership({
      userId,
      chamaId: chama._id,
      role
    });

    await membership.save();

    const populatedMembership = await Membership.findById(membership._id)
      .populate('userId', 'fullName email phone avatar')
      .populate('chamaId', 'name description inviteCode');

    res.status(201).json({
      success: true,
      message: 'Successfully joined chama',
      data: populatedMembership
    });

  } catch (error) {
    console.error('Join chama error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getChamaByInviteCode = async (req, res) => {
  try {
    const { inviteCode } = req.params;

    const chama = await Chama.findOne({ 
      inviteCode, 
      status: 'active' 
    }).populate('createdBy', 'fullName avatar');

    if (!chama) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invite code'
      });
    }

    const memberCount = await Membership.countDocuments({
      chamaId: chama._id,
      status: 'active'
    });

    res.status(200).json({
      success: true,
      data: {
        ...chama.toObject(),
        memberCount
      }
    });

  } catch (error) {
    console.error('Get chama by invite code error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const regenerateInviteCode = async (req, res) => {
  try {
    const { chamaId } = req.params;
    const userId = req.user.id;

    const membership = await Membership.findOne({
      userId,
      chamaId,
      role: 'admin'
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can regenerate invite codes'
      });
    }

    const generateInviteCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let newCode;
    let codeExists = true;
    let attempts = 0;

    while (codeExists && attempts < 10) {
      newCode = generateInviteCode();
      codeExists = await Chama.findOne({ inviteCode: newCode });
      attempts++;
    }

    if (codeExists) {
      return res.status(500).json({
        success: false,
        message: 'Could not generate unique invite code'
      });
    }

    const updatedChama = await Chama.findByIdAndUpdate(
      chamaId,
      { inviteCode: newCode },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Invite code regenerated successfully',
      data: {
        inviteCode: updatedChama.inviteCode
      }
    });

  } catch (error) {
    console.error('Regenerate invite code error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  joinChamaByCode,
  getChamaByInviteCode,
  regenerateInviteCode
};
