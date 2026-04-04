const Loan = require('../models/Loan')
const Membership = require('../models/Membership')
const Chama = require('../models/Chama')
const { createNotification } = require('../services/notificationService')
const { logAction } = require('../services/auditService')
const axios = require('axios')

const AI_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000'

const requestLoan = async (req, res) => {
  try {
    const { chamaId, amount, purpose, repaymentMonths } = req.body
    if (!chamaId || !amount || !purpose || !repaymentMonths) {
      return res.status(400).json({ success: false, message: 'All fields required: chamaId, amount, purpose, repaymentMonths' })
    }

    // Check chama not frozen
    const chama = await Chama.findById(chamaId)
    if (!chama) return res.status(404).json({ success: false, message: 'Chama not found' })
    if (chama.status === 'frozen') return res.status(403).json({ success: false, message: 'This chama is frozen' })

    // Check membership
    const membership = await Membership.findOne({ userId: req.user.userId, chamaId, status: 'active' })
    if (!membership) return res.status(403).json({ success: false, message: 'Not a member' })

    // Check no active loans
    const existingLoan = await Loan.findOne({
      userId: req.user.userId,
      chamaId,
      status: { $in: ['pending', 'approved', 'disbursed'] }
    })
    if (existingLoan) return res.status(400).json({ success: false, message: 'You already have an active loan in this chama' })

    // Validate amount vs contributions
    const maxLoan = membership.totalContributed * (chama.settings?.maxLoanMultiplier || 3)
    if (Number(amount) > maxLoan) {
      return res.status(400).json({
        success: false,
        message: `Loan amount exceeds maximum allowed. Max: KES ${maxLoan.toLocaleString()} (${chama.settings?.maxLoanMultiplier || 3}x your contributions of KES ${membership.totalContributed.toLocaleString()})`
      })
    }

    // Check chama has enough balance
    if (chama.totalBalance < Number(amount)) {
      return res.status(400).json({
        success: false,
        message: `Insufficient chama funds. Available: KES ${chama.totalBalance.toLocaleString()}`
      })
    }

    // Get AI credit score
    let creditScore = 50
    let riskLabel = 'medium'
    try {
      const aiRes = await axios.get(`${AI_URL}/ai/credit-score/${req.user.userId}/${chamaId}`, { timeout: 5000 })
      if (aiRes.data?.success) {
        creditScore = aiRes.data.data.score
        riskLabel = aiRes.data.data.riskLabel
      }
    } catch (aiErr) {
      console.log('[loan] AI service unavailable, using default score')
    }

    // Calculate repayment
    const interestRate = 0.10
    const totalRepayable = Number(amount) * (1 + (interestRate * repaymentMonths / 12))
    const monthlyRepayment = totalRepayable / repaymentMonths

    // AUTO APPROVAL LOGIC based on AI score
    let status = 'pending'
    let autoDecision = null

    if (creditScore >= 60) {
      status = 'approved'
      autoDecision = 'auto_approved'
    } else if (creditScore < 40) {
      status = 'rejected'
      autoDecision = 'auto_rejected'
    } else {
      // Score 40-59 → needs admin review
      status = 'pending'
      autoDecision = 'needs_review'
    }

    // Create loan
    const loan = await Loan.create({
      userId: req.user.userId,
      chamaId,
      amount: Number(amount),
      purpose,
      repaymentMonths: Number(repaymentMonths),
      monthlyRepayment,
      totalRepayable,
      creditScore,
      riskLabel,
      status,
      approvedBy: status === 'approved' ? null : undefined,
      disbursedAt: null,
      dueDate: null
    })

    // Send appropriate notification
    if (status === 'approved') {
      await createNotification({
        userId: req.user.userId,
        chamaId,
        type: 'loan',
        title: '🎉 Loan Auto-Approved!',
        body: `Your loan of KES ${Number(amount).toLocaleString()} was automatically approved based on your credit score of ${creditScore}. Choose your disbursement method.`,
        actionUrl: `/loans`
      })
    } else if (status === 'rejected') {
      await createNotification({
        userId: req.user.userId,
        chamaId,
        type: 'loan',
        title: '❌ Loan Application Declined',
        body: `Your loan request of KES ${Number(amount).toLocaleString()} was declined. Credit score: ${creditScore}/100. Improve your score by contributing consistently.`,
        actionUrl: `/ai-coach`
      })
    } else {
      await createNotification({
        userId: req.user.userId,
        chamaId,
        type: 'loan',
        title: '⏳ Loan Under Review',
        body: `Your loan of KES ${Number(amount).toLocaleString()} needs admin review. Credit score: ${creditScore}/100.`,
        actionUrl: `/loans`
      })
      // Notify admin
      const adminMemberships = await Membership.find({ chamaId, role: 'admin', status: 'active' })
      for (const admin of adminMemberships) {
        await createNotification({
          userId: admin.userId,
          chamaId,
          type: 'loan',
          title: '⚠️ Loan Needs Your Review',
          body: `A loan request of KES ${Number(amount).toLocaleString()} needs your review. Credit score: ${creditScore}/100.`,
          actionUrl: `/chama/${chamaId}`
        })
      }
    }

    await logAction({
      chamaId,
      performedBy: req.user.userId,
      action: `loan_${autoDecision}`,
      metadata: { amount, creditScore, riskLabel, status }
    })

    res.status(201).json({
      success: true,
      loan,
      autoDecision,
      message: status === 'approved'
        ? '🎉 Loan approved! Choose your disbursement method.'
        : status === 'rejected'
        ? '❌ Loan declined based on credit score. Visit AI Coach to improve.'
        : '⏳ Loan submitted for admin review.'
    })
  } catch (err) {
    console.error('requestLoan error:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
}

const getLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ chamaId: req.params.chamaId })
      .populate('userId', 'fullName phone')
      .populate('approvedBy', 'fullName')
      .sort({ createdAt: -1 })
    res.json({ success: true, loans })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

const getMyLoans = async (req, res) => {
  try {
    const membership = await Membership.findOne({ userId: req.user.userId, chamaId: req.params.chamaId, status: 'active' })
    if (!membership) return res.status(403).json({ success: false, message: 'Not a member' })
    const loans = await Loan.find({ userId: req.user.userId, chamaId: req.params.chamaId })
      .sort({ createdAt: -1 })
    res.json({ success: true, loans })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

const approveLoan = async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.loanId, chamaId: req.params.chamaId })
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' })
    if (loan.status !== 'pending') return res.status(400).json({ success: false, message: 'Only pending loans can be approved' })

    loan.status = 'approved'
    loan.approvedBy = req.user.userId
    await loan.save()

    await createNotification({
      userId: loan.userId,
      chamaId: loan.chamaId,
      type: 'loan',
      title: '✅ Loan Approved by Admin',
      body: `Your loan of KES ${loan.amount.toLocaleString()} has been approved. Choose your disbursement method.`,
      actionUrl: `/loans`
    })

    await logAction({ chamaId: loan.chamaId, performedBy: req.user.userId, action: 'loan_approved', targetUserId: loan.userId, metadata: { loanId: loan._id, amount: loan.amount } })

    res.json({ success: true, loan, message: 'Loan approved. Disburse via M-Pesa or mark manual transfer.' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

const rejectLoan = async (req, res) => {
  try {
    const { reason } = req.body
    const loan = await Loan.findOne({ _id: req.params.loanId, chamaId: req.params.chamaId })
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' })
    if (!['pending', 'approved'].includes(loan.status)) return res.status(400).json({ success: false, message: 'Cannot reject this loan' })

    loan.status = 'rejected'
    await loan.save()

    await createNotification({
      userId: loan.userId,
      chamaId: loan.chamaId,
      type: 'loan',
      title: '❌ Loan Rejected',
      body: `Your loan of KES ${loan.amount.toLocaleString()} was rejected. ${reason ? 'Reason: ' + reason : ''}`,
      actionUrl: `/loans`
    })

    await logAction({ chamaId: loan.chamaId, performedBy: req.user.userId, action: 'loan_rejected', targetUserId: loan.userId, metadata: { loanId: loan._id, reason } })

    res.json({ success: true, loan }) 
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

const markManualDisbursement = async (req, res) => {
  try {
    const { loanId } = req.params
    const { reference } = req.body
    const loan = await Loan.findById(loanId)
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' })
    if (loan.status !== 'approved') return res.status(400).json({ success: false, message: 'Loan must be approved first' })

    loan.status = 'disbursed'
    loan.mpesaDisbursementRef = reference || 'MANUAL-' + Date.now()
    loan.disbursedAt = new Date()
    loan.dueDate = new Date(Date.now() + loan.repaymentMonths * 30 * 24 * 60 * 60 * 1000)
    await loan.save()

    await Chama.findByIdAndUpdate(loan.chamaId, { $inc: { totalBalance: -loan.amount } })

    await createNotification({
      userId: loan.userId,
      chamaId: loan.chamaId,
      type: 'loan',
      title: '💰 Loan Disbursed',
      body: `KES ${loan.amount.toLocaleString()} disbursed manually. Ref: ${reference}. Repay by ${loan.dueDate.toLocaleDateString()}.`,
      actionUrl: `/loans`
    })

    res.json({ success: true, loan })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

const repayLoan = async (req, res) => {
  try {
    const { amount, mpesaRef } = req.body
    const loan = await Loan.findOne({ _id: req.params.loanId, userId: req.user.userId, status: 'disbursed' })
    if (!loan) return res.status(404).json({ success: false, message: 'Active loan not found' })

    loan.repayments.push({ amount: Number(amount), date: new Date(), mpesaRef: mpesaRef || 'MANUAL-' + Date.now() })
    const totalRepaid = loan.repayments.reduce((s, r) => s + r.amount, 0)

    if (totalRepaid >= loan.totalRepayable) {
      loan.status = 'repaid'
      await Chama.findByIdAndUpdate(loan.chamaId, { $inc: { totalBalance: loan.amount } })
      await createNotification({
        userId: req.user.userId,
        chamaId: loan.chamaId,
        type: 'loan',
        title: '🎉 Loan Fully Repaid!',
        body: `Congratulations! You have fully repaid your loan of KES ${loan.amount.toLocaleString()}.`,
        actionUrl: `/loans`
      })
    }

    await loan.save()
    res.json({ success: true, loan, totalRepaid, remaining: Math.max(0, loan.totalRepayable - totalRepaid) })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { requestLoan, getLoans, getMyLoans, approveLoan, rejectLoan, repayLoan, markManualDisbursement }