const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth')
const Loan = require('../models/Loan')
const Membership = require('../models/Membership')
const { createLoanVote, castLoanVote, finalizeLoanVote, getLoanVote, verifyChain } = require('../services/blockchainService')
const { createNotification } = require('../services/notificationService')

// Get all pending loans for voting in a chama
router.get('/:chamaId/pending', protect, async (req, res) => {
  try {
    const membership = await Membership.findOne({
      userId: req.user.userId,
      chamaId: req.params.chamaId,
      status: 'active'
    })
    if (!membership) return res.status(403).json({ success: false, message: 'Not a member' })

    const loans = await Loan.find({
      chamaId: req.params.chamaId,
      status: { $in: ['pending', 'approved'] }
    }).populate('userId', 'fullName phone avatar')

    // Get blockchain vote data for each loan
    const loansWithVotes = await Promise.all(loans.map(async (loan) => {
      const voteData = await getLoanVote(loan._id.toString())
      return {
        ...loan.toObject(),
        blockchainVote: voteData
      }
    }))

    res.json({ success: true, loans: loansWithVotes })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Create blockchain vote for a loan (admin triggers this)
router.post('/:chamaId/create/:loanId', protect, async (req, res) => {
  try {
    const membership = await Membership.findOne({
      userId: req.user.userId,
      chamaId: req.params.chamaId,
      role: 'admin',
      status: 'active'
    })
    if (!membership) return res.status(403).json({ success: false, message: 'Admin only' })

    const loan = await Loan.findById(req.params.loanId)
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' })

    const chama = await require('../models/Chama').findById(req.params.chamaId)
    const threshold = chama?.settings?.loanVoteThreshold || 51

    const txHash = await createLoanVote(loan._id.toString(), threshold)

    loan.blockchainVoteId = txHash || 'LOCAL-' + Date.now()
    await loan.save()

    // Notify all members to vote
    const members = await Membership.find({ chamaId: req.params.chamaId, status: 'active' })
    for (const m of members) {
      if (m.userId.toString() !== req.user.userId) {
        await createNotification({
          userId: m.userId,
          chamaId: req.params.chamaId,
          type: 'vote',
          title: '🗳️ Vote Required',
          body: `A loan of KES ${loan.amount.toLocaleString()} needs your vote in your chama.`,
          actionUrl: `/chama/${req.params.chamaId}`
        })
      }
    }

    res.json({ success: true, txHash, message: 'Voting started. Members notified.' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Cast a vote
router.post('/:chamaId/vote/:loanId', protect, async (req, res) => {
  try {
    const { support } = req.body
    if (typeof support !== 'boolean') return res.status(400).json({ success: false, message: 'support must be true or false' })

    const membership = await Membership.findOne({
      userId: req.user.userId,
      chamaId: req.params.chamaId,
      status: 'active'
    })
    if (!membership) return res.status(403).json({ success: false, message: 'Not a member' })
    if (membership.role === 'observer') return res.status(403).json({ success: false, message: 'Observers cannot vote' })

    const loan = await Loan.findById(req.params.loanId)
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' })

    // Track vote in blockchain
    const txHash = await castLoanVote(loan._id.toString(), req.user.userId, support)

    // Track vote locally too (for users without wallets)
    if (!loan.votes) loan.votes = []
    const alreadyVoted = loan.votes.find(v => v.userId.toString() === req.user.userId)
    if (alreadyVoted) return res.status(400).json({ success: false, message: 'You have already voted' })

    loan.votes.push({
      userId: req.user.userId,
      support,
      txHash: txHash || 'LOCAL-' + Date.now(),
      votedAt: new Date()
    })

    // Check if threshold met
    const totalMembers = await Membership.countDocuments({ chamaId: req.params.chamaId, status: 'active', role: { $ne: 'observer' } })
    const chama = await require('../models/Chama').findById(req.params.chamaId)
    const threshold = chama?.settings?.loanVoteThreshold || 51
    const yesVotes = loan.votes.filter(v => v.support).length
    const totalVotes = loan.votes.length
    const yesPercent = (yesVotes / totalVotes) * 100

    if (totalVotes >= Math.ceil(totalMembers * 0.5)) {
      if (yesPercent >= threshold) {
        loan.status = 'approved'
        loan.approvedBy = null
        await createNotification({
          userId: loan.userId,
          chamaId: req.params.chamaId,
          type: 'vote',
          title: '🎉 Loan Approved by Vote!',
          body: `Your loan of KES ${loan.amount.toLocaleString()} was approved by member vote (${Math.round(yesPercent)}% yes).`,
          actionUrl: '/loans'
        })
        await finalizeLoanVote(loan._id.toString(), true, yesVotes, noVotes)
      } else if ((totalMembers - totalVotes) < Math.ceil(totalMembers * (threshold / 100)) - yesVotes) {
        loan.status = 'rejected'
        await createNotification({
          userId: loan.userId,
          chamaId: req.params.chamaId,
          type: 'vote',
          title: '❌ Loan Rejected by Vote',
          body: `Your loan of KES ${loan.amount.toLocaleString()} was rejected by member vote.`,
          actionUrl: '/loans'
        })
        await finalizeLoanVote(loan._id.toString(), false, yesVotes, noVotes)
      }
    }

    await loan.save()

    res.json({
      success: true,
      txHash,
      yesVotes,
      noVotes: loan.votes.filter(v => !v.support).length,
      totalVotes,
      loanStatus: loan.status
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Get vote status for a loan
router.get('/:chamaId/status/:loanId', protect, async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.loanId)
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' })

    const userId = req.user.userId
    const hasVotedLocal = loan.votes?.some(v => v.userId.toString() === userId) || false
    const yesVotes = loan.votes?.filter(v => v.support).length || 0
    const noVotes = loan.votes?.filter(v => !v.support).length || 0
    const blockchainData = await getLoanVote(loan._id.toString())

    res.json({
      success: true,
      hasVoted: hasVotedLocal,
      yesVotes,
      noVotes,
      totalVotes: loan.votes?.length || 0,
      loanStatus: loan.status,
      blockchain: blockchainData
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Add chain verification endpoint
router.get('/:chamaId/verify/:loanId', protect, async (req, res) => {
  try {
    const isValid = await verifyChain(req.params.loanId)
    const voteData = await getLoanVote(req.params.loanId)
    res.json({
      success: true,
      chainIntegrity: isValid ? '✅ Valid' : '❌ Tampered',
      isValid,
      chainLength: voteData?.chainLength || 0,
      latestHash: voteData?.chainHash,
      auditTrail: voteData?.auditTrail || []
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router