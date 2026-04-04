const { stkPush, b2cPayment } = require('../services/mpesaService')
const Contribution = require('../models/Contribution')
const Loan = require('../models/Loan')
const Chama = require('../models/Chama')
const Membership = require('../models/Membership')
const User = require('../models/User')
const { createNotification } = require('../services/notificationService')

// Initiate STK Push for contribution
const initiateSTKPush = async (req, res) => {
  try {
    const { chamaId, amount, phone } = req.body
    if (!chamaId || !amount || !phone) {
      return res.status(400).json({ success: false, message: 'chamaId, amount and phone are required' })
    }

    // Check chama exists and is not frozen
    const chama = await Chama.findById(chamaId)
    if (!chama) return res.status(404).json({ success: false, message: 'Chama not found' })
    if (chama.status === 'frozen') return res.status(403).json({ success: false, message: 'This chama is frozen' })

    // Check membership
    const membership = await Membership.findOne({ userId: req.user.userId, chamaId, status: 'active' })
    if (!membership) return res.status(403).json({ success: false, message: 'Not a member of this chama' })

    // Create pending contribution first
    const now = new Date()
    const periodMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const contribution = await Contribution.create({
      userId: req.user.userId,
      chamaId,
      amount: Number(amount),
      mpesaPhone: phone,
      status: 'pending',
      periodMonth
    })

    // Initiate STK push
    const stkResult = await stkPush({
      phone,
      amount: Number(amount),
      reference: `CHAMA-${chamaId.toString().slice(-6).toUpperCase()}`,
      description: `Contribution to ${chama.name}`
    })

    // Save checkout request ID for callback matching
    contribution.mpesaRef = stkResult.CheckoutRequestID
    await contribution.save()

    res.json({
      success: true,
      message: 'STK Push sent. Check your phone and enter PIN.',
      checkoutRequestId: stkResult.CheckoutRequestID,
      contributionId: contribution._id
    })
  } catch (err) {
    console.error('STK Push error:', err.response?.data || err.message)
    res.status(500).json({ success: false, message: 'M-Pesa request failed. Please try again.' })
  }
}

// M-Pesa callback after user pays
const stkCallback = async (req, res) => {
  try {
    const callback = req.body?.Body?.stkCallback
    if (!callback) return res.status(400).json({ success: false })

    const checkoutRequestId = callback.CheckoutRequestID
    const resultCode = callback.ResultCode

    // Find pending contribution
    const contribution = await Contribution.findOne({ mpesaRef: checkoutRequestId })
    if (!contribution) return res.status(404).json({ success: false })

    if (resultCode === 0) {
      // Payment successful
      const items = callback.CallbackMetadata?.Item || []
      const mpesaReceiptNumber = items.find(i => i.Name === 'MpesaReceiptNumber')?.Value
      const amount = items.find(i => i.Name === 'Amount')?.Value
      const phone = items.find(i => i.Name === 'PhoneNumber')?.Value

      contribution.status = 'success'
      contribution.mpesaRef = mpesaReceiptNumber || checkoutRequestId
      contribution.mpesaPhone = phone?.toString() || contribution.mpesaPhone
      if (amount) contribution.amount = amount
      await contribution.save()

      // Update chama balance and membership
      await Chama.findByIdAndUpdate(contribution.chamaId, { $inc: { totalBalance: contribution.amount } })
      await Membership.findOneAndUpdate(
        { userId: contribution.userId, chamaId: contribution.chamaId },
        { $inc: { totalContributed: contribution.amount } }
      )

      // Notify user
      await createNotification({
        userId: contribution.userId,
        chamaId: contribution.chamaId,
        type: 'contribution',
        title: '✅ Contribution Confirmed',
        body: `Your contribution of KES ${contribution.amount.toLocaleString()} has been received. Ref: ${mpesaReceiptNumber}`,
        actionUrl: `/chama/${contribution.chamaId}`
      })

      console.log(`[mpesa] Payment confirmed: ${mpesaReceiptNumber} KES ${contribution.amount}`)
    } else {
      // Payment failed/cancelled
      contribution.status = 'failed'
      await contribution.save()
      console.log(`[mpesa] Payment failed. ResultCode: ${resultCode}`)
    }

    res.json({ success: true })
  } catch (err) {
    console.error('STK Callback error:', err.message)
    res.status(500).json({ success: false })
  }
}

// Check STK push status (frontend polls this)
const checkSTKStatus = async (req, res) => {
  try {
    const { contributionId } = req.params
    const contribution = await Contribution.findById(contributionId)
    if (!contribution) return res.status(404).json({ success: false, message: 'Contribution not found' })
    res.json({ success: true, status: contribution.status, amount: contribution.amount, mpesaRef: contribution.mpesaRef })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Initiate B2C loan disbursement
const disburseLoan = async (req, res) => {
  try {
    const { loanId, phone } = req.body
    if (!loanId || !phone) return res.status(400).json({ success: false, message: 'loanId and phone required' })

    const loan = await Loan.findById(loanId).populate('userId', 'fullName phone')
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' })
    if (loan.status !== 'approved') return res.status(400).json({ success: false, message: 'Loan is not approved' })

    const b2cResult = await b2cPayment({
      phone,
      amount: loan.amount,
      reference: `LOAN-${loanId.toString().slice(-6).toUpperCase()}`
    })

    loan.status = 'disbursed'
    loan.mpesaDisbursementRef = b2cResult.ConversationID || 'B2C-' + Date.now()
    loan.disbursedAt = new Date()
    loan.dueDate = new Date(Date.now() + loan.repaymentMonths * 30 * 24 * 60 * 60 * 1000)
    await loan.save()

    await Chama.findByIdAndUpdate(loan.chamaId, { $inc: { totalBalance: -loan.amount } })

    await createNotification({
      userId: loan.userId._id,
      chamaId: loan.chamaId,
      type: 'loan',
      title: '💰 Loan Disbursed!',
      body: `KES ${loan.amount.toLocaleString()} has been sent to ${phone}. Repay by ${loan.dueDate.toLocaleDateString()}.`,
      actionUrl: `/loans`
    })

    res.json({ success: true, message: 'Loan disbursed via M-Pesa', loan })
  } catch (err) {
    console.error('B2C error:', err.response?.data || err.message)
    res.status(500).json({ success: false, message: 'M-Pesa B2C failed. Please try manual transfer.' })
  }
}

// B2C callback
const b2cCallback = async (req, res) => {
  try {
    const result = req.body?.Result
    if (!result) return res.status(400).json({ success: false })
    console.log('[mpesa-b2c] Callback received:', JSON.stringify(result))
    res.json({ success: true })
  } catch (err) {
    console.error('B2C callback error:', err.message)
    res.status(500).json({ success: false })
  }
}

module.exports = { initiateSTKPush, stkCallback, checkSTKStatus, disburseLoan, b2cCallback }