const mongoose = require('mongoose');
const Contribution = require('../models/Contribution');
const Membership = require('../models/Membership');
const Chama = require('../models/Chama');
const { checkAndAwardBadges } = require('../services/badgeService');

const currentPeriodMonth = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const initiateContribution = async (req, res) => {
  try {
    const { chamaId, amount, mpesaPhone } = req.body;

    if (!chamaId || !mongoose.Types.ObjectId.isValid(chamaId)) {
      return res.status(400).json({ success: false, message: 'Valid chamaId is required' });
    }

    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'amount must be a positive number' });
    }

    const membership = await Membership.findOne({
      userId: req.user.userId,
      chamaId,
      status: 'active'
    });
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Not a member of this chama' });
    }

    const mpesaRef = `MPESA${Date.now()}`;
    const periodMonth = currentPeriodMonth();

    const contribution = await Contribution.create({
      userId: req.user.userId,
      chamaId,
      amount: numAmount,
      mpesaRef,
      mpesaPhone: mpesaPhone != null ? String(mpesaPhone) : '',
      status: 'success',
      periodMonth
    });

    await Membership.findByIdAndUpdate(membership._id, {
      $inc: { totalContributed: numAmount }
    });

    await Chama.findByIdAndUpdate(chamaId, {
      $inc: { totalBalance: numAmount }
    });

    const updatedMembership = await Membership.findOne({ userId: req.user.userId, chamaId })
    const contribCount = await Contribution.countDocuments({ userId: req.user.userId, chamaId, status: 'success' })
    await checkAndAwardBadges(req.user.userId, chamaId, {
      contributionCount: contribCount,
      streak: updatedMembership?.contributionStreak || 0,
      loanRepaid: false
    })

    return res.status(201).json({ success: true, contribution });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getContributions = async (req, res) => {
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

    const contributions = await Contribution.find({ chamaId })
      .populate('userId', 'fullName phone')
      .sort({ createdAt: -1 });

    return res.json({ success: true, contributions });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getMyContributions = async (req, res) => {
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

    const contributions = await Contribution.find({
      chamaId,
      userId: req.user.userId
    }).sort({ createdAt: -1 });

    return res.json({ success: true, contributions });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getContributionSummary = async (req, res) => {
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

    const summary = await Contribution.aggregate([
      { $match: { chamaId: new mongoose.Types.ObjectId(chamaId) } },
      {
        $group: {
          _id: '$userId',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalAmount: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $project: {
          userId: '$_id',
          totalAmount: 1,
          count: 1,
          fullName: { $arrayElemAt: ['$user.fullName', 0] },
          phone: { $arrayElemAt: ['$user.phone', 0] }
        }
      }
    ]);

    return res.json({ success: true, summary });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  initiateContribution,
  getContributions,
  getMyContributions,
  getContributionSummary
};
