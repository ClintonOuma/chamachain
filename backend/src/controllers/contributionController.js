const mongoose = require('mongoose');
const Contribution = require('../models/Contribution');
const Membership = require('../models/Membership');
const Chama = require('../models/Chama');
const { checkAndAwardBadges } = require('../services/badgeService');
const mpesaService = require('../services/mpesaService');

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

    const chamaDoc = await Chama.findById(chamaId) 
    if (!chamaDoc) return res.status(404).json({ success: false, message: 'Chama not found' }) 
    if (chamaDoc.status === 'frozen') return res.status(403).json({ success: false, message: 'This chama is frozen. Contributions are not allowed.' }) 

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

    const periodMonth = currentPeriodMonth();

    const mpesaResponse = await mpesaService.stkPush(mpesaPhone, numAmount, chamaId);
    
    if (mpesaResponse.ResponseCode === '0') {
      const contribution = await Contribution.create({
        userId: req.user.userId,
        chamaId,
        amount: numAmount,
        mpesaRef: mpesaResponse.CheckoutRequestID,
        mpesaPhone: mpesaPhone != null ? String(mpesaPhone) : '',
        status: 'pending',
        periodMonth
      });
      return res.status(201).json({ success: true, contribution, mpesaResponse });
    } else {
      return res.status(400).json({ success: false, message: 'STK Push failed', mpesaResponse });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const mpesaCallback = async (req, res) => {
  try {
    const callbackData = mpesaService.processStkCallback(req.body);
    const checkoutRequestId = req.body.Body.stkCallback.CheckoutRequestID;

    const contribution = await Contribution.findOne({ mpesaRef: checkoutRequestId });
    if (!contribution) {
      return res.status(404).json({ success: false, message: 'Contribution not found' });
    }

    if (callbackData.success) {
      contribution.status = 'success';
      contribution.mpesaRef = callbackData.mpesaRef;
      await contribution.save();

      await Membership.findOneAndUpdate(
        { userId: contribution.userId, chamaId: contribution.chamaId },
        { $inc: { totalContributed: contribution.amount } }
      );

      await Chama.findByIdAndUpdate(contribution.chamaId, {
        $inc: { totalBalance: contribution.amount }
      });

      const updatedMembership = await Membership.findOne({ userId: contribution.userId, chamaId: contribution.chamaId })
      const contribCount = await Contribution.countDocuments({ userId: contribution.userId, chamaId: contribution.chamaId, status: 'success' })
      await checkAndAwardBadges(contribution.userId, contribution.chamaId, {
        contributionCount: contribCount,
        streak: updatedMembership?.contributionStreak || 0,
        loanRepaid: false
      })
    } else {
      contribution.status = 'failed';
      await contribution.save();
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('M-Pesa callback error:', err.message);
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
  mpesaCallback,
  getContributions,
  getMyContributions,
  getContributionSummary
};
