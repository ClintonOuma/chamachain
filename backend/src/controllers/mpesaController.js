const { stkPush, b2cPayment, formatPhone } = require('../services/mpesaService')
const Contribution = require('../models/Contribution')
const Loan = require('../models/Loan')
const Chama = require('../models/Chama')
const Membership = require('../models/Membership')
const User = require('../models/User')
const { createNotification } = require('../services/notificationService')

const MPESA_ENV = process.env.MPESA_ENV || 'sandbox'

// Initiate STK Push
const initiateSTKPush = async (req, res) => {
  try {
    const { chamaId, amount, phone } = req.body
    if (!chamaId || !amount || !phone) {
      return res.status(400).json({ success: false, message: 'chamaId, amount and phone are required' })
    }
    if (Number(amount) < 1) {
      return res.status(400).json({ success: false, message: 'Amount must be at least KES 1' })
    }

    const chama = await Chama.findById(chamaId)
    if (!chama) return res.status(404).json({ success: false, message: 'Chama not found' })
    if (chama.status === 'frozen') return res.status(403).json({ success: false, message: 'This chama is frozen' })

    const membership = await Membership.findOne({ userId: req.user.userId, chamaId, status: 'active' })
    if (!membership) return res.status(403).json({ success: false, message: 'Not a member of this chama' })

    const now = new Date()
    const periodMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    // Create pending contribution
    const contribution = await Contribution.create({
      userId: req.user.userId,
      chamaId,
      amount: Number(amount),
      mpesaPhone: formatPhone(phone),
      status: 'pending',
      periodMonth
    })

    // In sandbox mode — auto-simulate success after STK push
    if (MPESA_ENV === 'sandbox') {
      try {
        // Send real STK push to sandbox (phone will ring in test)
        const stkResult = await stkPush({
          phone,
          amount: Number(amount),
          reference: `CC-${chamaId.toString().slice(-6).toUpperCase()}`,
          description: `Contribution to ${chama.name}`
        })

        contribution.mpesaRef = stkResult.CheckoutRequestID || 'SANDBOX-' + Date.now()
        await contribution.save()

        console.log(`[mpesa-sandbox] STK Push sent. CheckoutRequestID: ${contribution.mpesaRef}`)

        // Auto-confirm after 10 seconds in sandbox
        // (simulates user entering PIN successfully)
        setTimeout(async () => {
          try {
            const c = await Contribution.findById(contribution._id)
            if (c && c.status === 'pending') {
              const sandboxRef = 'SBX' + Math.random().toString(36).substring(2, 12).toUpperCase()
              c.status = 'success'
              c.mpesaRef = sandboxRef
              await c.save()

              await Chama.findByIdAndUpdate(chamaId, { $inc: { totalBalance: c.amount } })
              await Membership.findOneAndUpdate(
                { userId: c.userId, chamaId },
                { $inc: { totalContributed: c.amount } }
              )

              await createNotification({
                userId: c.userId,
                chamaId,
                type: 'contribution',
                title: '✅ Contribution Confirmed!',
                body: `KES ${c.amount.toLocaleString()} successfully added to ${chama.name}. Ref: ${sandboxRef}`,
                actionUrl: `/chama/${chamaId}`
              })

              // Emit socket event
              if (global.io) {
                global.io.to(`user:${c.userId.toString()}`).emit('contribution_confirmed', {
                  contributionId: c._id,
                  amount: c.amount,
                  status: 'success',
                  mpesaRef: sandboxRef
                })
              }

              console.log(`[mpesa-sandbox] Auto-confirmed contribution ${c._id}. Ref: ${sandboxRef}`)
            }
          } catch (autoErr) {
            console.error('[mpesa-sandbox] Auto-confirm error:', autoErr.message)
          }
        }, 10000) // 10 seconds delay simulates PIN entry

      } catch (stkErr) {
        console.log('[mpesa-sandbox] Real STK failed, using pure simulation:', stkErr.message)

        // Pure simulation fallback if sandbox STK fails
        contribution.mpesaRef = 'SIM-' + Date.now()
        await contribution.save()

        setTimeout(async () => {
          try {
            const c = await Contribution.findById(contribution._id)
            if (c && c.status === 'pending') {
              const sandboxRef = 'SBX' + Math.random().toString(36).substring(2, 12).toUpperCase()
              c.status = 'success'
              c.mpesaRef = sandboxRef
              await c.save()

              await Chama.findByIdAndUpdate(chamaId, { $inc: { totalBalance: c.amount } })
              await Membership.findOneAndUpdate(
                { userId: c.userId, chamaId },
                { $inc: { totalContributed: c.amount } }
              )

              await createNotification({
                userId: c.userId,
                chamaId,
                type: 'contribution',
                title: '✅ Contribution Confirmed!',
                body: `KES ${c.amount.toLocaleString()} added to ${chama.name}. Ref: ${sandboxRef}`,
                actionUrl: `/chama/${chamaId}`
              })

              if (global.io) {
                global.io.to(`user:${c.userId.toString()}`).emit('contribution_confirmed', {
                  contributionId: c._id,
                  amount: c.amount,
                  status: 'success',
                  mpesaRef: sandboxRef
                })
              }
            }
          } catch (err) {
            console.error('[mpesa-sandbox] Simulation error:', err.message)
          }
        }, 10000)
      }

      return res.json({
        success: true,
        message: MPESA_ENV === 'sandbox'
          ? '📱 STK Push sent! Check your phone. If using sandbox test number (254708374149), enter PIN 1234. Your balance will update in ~10 seconds.'
          : 'STK Push sent. Check your phone.',
        contributionId: contribution._id,
        checkoutRequestId: contribution.mpesaRef,
        sandboxMode: true,
        sandboxInstructions: {
          testPhone: '254708374149',
          testPIN: '1234',
          note: 'This is a sandbox simulation. No real money will be deducted. Balance updates automatically in 10 seconds.'
        }
      })
    }

    // PRODUCTION MODE
    const stkResult = await stkPush({
      phone,
      amount: Number(amount),
      reference: `CC-${chamaId.toString().slice(-6).toUpperCase()}`,
      description: `Contribution to ${chama.name}`
    })

    contribution.mpesaRef = stkResult.CheckoutRequestID
    await contribution.save()

    res.json({
      success: true,
      message: 'STK Push sent. Enter your M-Pesa PIN.',
      contributionId: contribution._id,
      checkoutRequestId: stkResult.CheckoutRequestID
    })
  } catch (err) {
    console.error('[mpesa] initiateSTKPush error:', err.message)
    res.status(500).json({ success: false, message: err.message || 'M-Pesa request failed' })
  }
}

// M-Pesa callback (for production)
const stkCallback = async (req, res) => {
  try {
    const callback = req.body?.Body?.stkCallback
    if (!callback) return res.status(400).json({ success: false })

    const checkoutRequestId = callback.CheckoutRequestID
    const resultCode = callback.ResultCode

    const contribution = await Contribution.findOne({ mpesaRef: checkoutRequestId })
    if (!contribution) return res.status(404).json({ success: false })

    if (resultCode === 0) {
      const items = callback.CallbackMetadata?.Item || []
      const mpesaReceiptNumber = items.find(i => i.Name === 'MpesaReceiptNumber')?.Value
      const amount = items.find(i => i.Name === 'Amount')?.Value

      contribution.status = 'success'
      contribution.mpesaRef = mpesaReceiptNumber || checkoutRequestId
      if (amount) contribution.amount = amount
      await contribution.save()

      const chama = await Chama.findById(contribution.chamaId)
      await Chama.findByIdAndUpdate(contribution.chamaId, { $inc: { totalBalance: contribution.amount } })
      await Membership.findOneAndUpdate(
        { userId: contribution.userId, chamaId: contribution.chamaId },
        { $inc: { totalContributed: contribution.amount } }
      )

      await createNotification({
        userId: contribution.userId,
        chamaId: contribution.chamaId,
        type: 'contribution',
        title: '✅ Contribution Confirmed!',
        body: `KES ${contribution.amount.toLocaleString()} received. Ref: ${mpesaReceiptNumber}`,
        actionUrl: `/chama/${contribution.chamaId}`
      })

      if (global.io) {
        global.io.to(`user:${contribution.userId.toString()}`).emit('contribution_confirmed', {
          contributionId: contribution._id,
          amount: contribution.amount,
          status: 'success',
          mpesaRef: mpesaReceiptNumber
        })
      }
    } else {
      contribution.status = 'failed'
      await contribution.save()
    }

    res.json({ success: true })
  } catch (err) {
    console.error('[mpesa] stkCallback error:', err.message)
    res.status(500).json({ success: false })
  }
}

// Check contribution status (frontend polls this)
const checkSTKStatus = async (req, res) => {
  try {
    const contribution = await Contribution.findById(req.params.contributionId)
    if (!contribution) return res.status(404).json({ success: false, message: 'Not found' })
    res.json({
      success: true,
      status: contribution.status,
      amount: contribution.amount,
      mpesaRef: contribution.mpesaRef
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Disburse loan via M-Pesa B2C
const disburseLoan = async (req, res) => {
  try {
    const { loanId, phone } = req.body
    if (!loanId || !phone) return res.status(400).json({ success: false, message: 'loanId and phone required' })

    const loan = await Loan.findById(loanId)
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' })
    if (loan.status !== 'approved') return res.status(400).json({ success: false, message: 'Loan must be approved first' })

    let disbursementRef = ''

    if (MPESA_ENV === 'sandbox') {
      // Simulate B2C in sandbox
      disbursementRef = 'SBOX2C' + Math.random().toString(36).substring(2, 10).toUpperCase()
      console.log(`[mpesa-sandbox] Simulated B2C disbursement. Ref: ${disbursementRef}`)
    } else {
      const b2cResult = await b2cPayment({
        phone,
        amount: loan.amount,
        reference: `LOAN-${loanId.toString().slice(-6).toUpperCase()}`
      })
      disbursementRef = b2cResult.ConversationID || 'B2C-' + Date.now()
    }

    loan.status = 'disbursed'
    loan.mpesaDisbursementRef = disbursementRef
    loan.disbursedAt = new Date()
    loan.dueDate = new Date(Date.now() + loan.repaymentMonths * 30 * 24 * 60 * 60 * 1000)
    await loan.save()

    await Chama.findByIdAndUpdate(loan.chamaId, { $inc: { totalBalance: -loan.amount } })

    await createNotification({
      userId: loan.userId,
      chamaId: loan.chamaId,
      type: 'loan',
      title: '💰 Loan Disbursed!',
      body: `KES ${loan.amount.toLocaleString()} ${MPESA_ENV === 'sandbox' ? '(simulated)' : ''} sent to ${phone}. Repay by ${loan.dueDate.toLocaleDateString()}. Ref: ${disbursementRef}`,
      actionUrl: '/loans'
    })

    res.json({
      success: true,
      message: MPESA_ENV === 'sandbox'
        ? `✅ Loan disbursed (sandbox simulation). In production, KES ${loan.amount.toLocaleString()} would be sent to ${phone}.`
        : `Loan disbursed successfully to ${phone}`,
      loan,
      disbursementRef,
      sandboxMode: MPESA_ENV === 'sandbox'
    })
  } catch (err) {
    console.error('[mpesa] disburseLoan error:', err.message)
    res.status(500).json({ success: false, message: err.message })
  }
}

// B2C callback
const b2cCallback = async (req, res) => {
  try {
    const result = req.body?.Result
    console.log('[mpesa-b2c] Callback:', JSON.stringify(result))
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false })
  }
}

module.exports = { initiateSTKPush, stkCallback, checkSTKStatus, disburseLoan, b2cCallback }