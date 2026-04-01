const mongoose = require('mongoose');
const Loan = require('../models/Loan');
const Membership = require('../models/Membership');
const Chama = require('../models/Chama');
const { createNotification } = require('../services/notificationService');
const { logAction } = require('../services/auditService');

const PURPOSES = ['medical', 'education', 'business', 'emergency', 'other'];

const riskLabelFromScore = (score) => {
  if (score >= 80) return 'low';
  if (score >= 60) return 'medium';
  if (score >= 40) return 'high';
  return 'very_high';
};

const requestLoan = async (req, res) => {
  try {
    const { chamaId, amount, purpose, repaymentMonths } = req.body;

    if (!chamaId || !mongoose.Types.ObjectId.isValid(chamaId)) {
      return res.status(400).json({ success: false, message: 'Valid chamaId is required' });
    }

    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'amount must be a positive number' });
    }

    if (!purpose || !PURPOSES.includes(purpose)) {
      return res.status(400).json({ success: false, message: 'Valid purpose is required' });
    }

    const months = Number(repaymentMonths);
    if (!Number.isFinite(months) || months <= 0 || !Number.isInteger(months)) {
      return res.status(400).json({ success: false, message: 'repaymentMonths must be a positive integer' });
    }

    const membership = await Membership.findOne({
      userId: req.user.userId,
      chamaId,
      status: 'active'
    });
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Not a member of this chama' });
    }

    const activeLoan = await Loan.findOne({
      userId: req.user.userId,
      chamaId,
      status: { $in: ['pending', 'disbursed'] }
    });
    if (activeLoan) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active loan'
      });
    }

    const totalContributed = membership.totalContributed || 0;
    const maxLoan = totalContributed * 3;
    if (numAmount > maxLoan) {
      return res.status(400).json({
        success: false,
        message: 'Loan amount exceeds maximum allowed (3x your contributions)'
      });
    }

    const totalRepayable = numAmount * (1 + 0.1 * (months / 12));
    const monthlyRepayment = totalRepayable / months;

    let creditScore = 50;
    if (totalContributed > numAmount) creditScore += 10;
    if (months <= 3) creditScore += 10;
    if ((membership.contributionStreak || 0) >= 3) creditScore += 10;
    creditScore = Math.min(100, creditScore);

    const riskLabel = riskLabelFromScore(creditScore);

    const loan = await Loan.create({
      userId: req.user.userId,
      chamaId,
      amount: numAmount,
      purpose,
      repaymentMonths: months,
      monthlyRepayment,
      totalRepayable,
      status: 'pending',
      creditScore,
      riskLabel
    });

    await createNotification({
      userId: req.user.userId,
      chamaId,
      type: 'loan',
      title: 'Loan Request Submitted',
      body: `Your loan request of KES ${amount} has been submitted and is pending approval.`,
      actionUrl: `/chama/${chamaId}`
    });

    await logAction({
      chamaId,
      performedBy: req.user.userId,
      action: 'loan_requested',
      metadata: { loanId: loan._id, amount: numAmount }
    });

    return res.status(201).json({ success: true, loan });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getLoans = async (req, res) => {
  try {
    const { chamaId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(chamaId)) {
      return res.status(400).json({ success: false, message: 'Invalid chamaId' });
    }

    const loans = await Loan.find({ chamaId })
      .populate('userId', 'fullName phone')
      .sort({ createdAt: -1 });

    return res.json({ success: true, loans });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getMyLoans = async (req, res) => {
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

    const loans = await Loan.find({
      chamaId,
      userId: req.user.userId
    }).sort({ createdAt: -1 });

    return res.json({ success: true, loans });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const approveLoan = async (req, res) => {
  try {
    const { chamaId, loanId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(chamaId) || !mongoose.Types.ObjectId.isValid(loanId)) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }

    const loan = await Loan.findOne({ _id: loanId, chamaId });
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Loan is not pending approval' });
    }

    const now = new Date();
    const dueDate = new Date(now);
    dueDate.setMonth(dueDate.getMonth() + loan.repaymentMonths);

    loan.approvedBy = req.user.userId;
    loan.disbursedAt = now;
    loan.dueDate = dueDate;
    loan.mpesaDisbursementRef = `DISBURSE${Date.now()}`;
    loan.status = 'disbursed';

    await loan.save();

    await Chama.findByIdAndUpdate(chamaId, {
      $inc: { totalBalance: -loan.amount }
    });

    await createNotification({
      userId: loan.userId,
      chamaId: loan.chamaId,
      type: 'loan',
      title: 'Loan Approved!',
      body: `Your loan of KES ${loan.amount} has been approved and disbursed to your M-Pesa.`,
      actionUrl: `/chama/${loan.chamaId}`
    });

    await logAction({
      chamaId: loan.chamaId,
      performedBy: req.user.userId,
      action: 'loan_approved',
      targetUserId: loan.userId,
      metadata: { loanId: loan._id, amount: loan.amount }
    })

    return res.json({ success: true, loan });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const rejectLoan = async (req, res) => {
  try {
    const { chamaId, loanId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(chamaId) || !mongoose.Types.ObjectId.isValid(loanId)) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
    }

    const loan = await Loan.findOne({ _id: loanId, chamaId });
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    if (loan.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Loan is not pending' });
    }

    loan.status = 'rejected';
    await loan.save();

    await logAction({
      chamaId: loan.chamaId,
      performedBy: req.user.userId,
      action: 'loan_rejected',
      targetUserId: loan.userId,
      metadata: { loanId: loan._id }
    })

    return res.json({ success: true, loan });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const repayLoan = async (req, res) => {
  try {
    const { chamaId, loanId } = req.params;
    const { amount, mpesaRef } = req.body;

    if (!mongoose.Types.ObjectId.isValid(chamaId) || !mongoose.Types.ObjectId.isValid(loanId)) {
      return res.status(400).json({ success: false, message: 'Invalid id' });
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

    const loan = await Loan.findOne({
      _id: loanId,
      chamaId,
      userId: req.user.userId,
      status: 'disbursed'
    });
    if (!loan) {
      return res.status(404).json({ success: false, message: 'No active disbursed loan found' });
    }

    loan.repayments.push({
      amount: numAmount,
      date: new Date(),
      mpesaRef: mpesaRef != null ? String(mpesaRef) : ''
    });

    const totalRepaid = loan.repayments.reduce((sum, r) => sum + (r.amount || 0), 0);

    if (totalRepaid >= loan.totalRepayable) {
      loan.status = 'repaid';
      await Chama.findByIdAndUpdate(chamaId, {
        $inc: { totalBalance: loan.amount }
      });
    }

    await loan.save();

    await logAction({
      chamaId,
      performedBy: req.user.userId,
      action: 'loan_repayment',
      metadata: { loanId, amount: numAmount, mpesaRef }
    });

    return res.json({ success: true, loan });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  requestLoan,
  getLoans,
  getMyLoans,
  approveLoan,
  rejectLoan,
  repayLoan
};
