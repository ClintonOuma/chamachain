const mongoose = require('mongoose')
const Membership = require('../models/Membership')
const Contribution = require('../models/Contribution')
const Loan = require('../models/Loan')
const Chama = require('../models/Chama')

function toObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id)
    ? new mongoose.Types.ObjectId(String(id))
    : null
}

function calculateRiskLabel(score) {
  if (score >= 80) return 'low'
  if (score >= 60) return 'medium'
  if (score >= 40) return 'high'
  return 'very_high'
}

const getCreditScore = async (req, res) => {
  try {
    const { userId, chamaId } = req.params
    const userOid = toObjectId(userId)
    const chamaOid = toObjectId(chamaId)
    if (!userOid || !chamaOid) {
      return res.status(400).json({ success: false, message: 'Invalid userId or chamaId' })
    }

    const membership = await Membership.findOne({ userId: userOid, chamaId: chamaOid, status: 'active' }).lean()
    if (!membership) {
      return res.json({
        success: true,
        data: {
          creditScore: 0,
          riskLabel: 'very_high',
          breakdown: {},
          tips: ['You are not an active member of this chama.'],
          totalContributed: 0,
          contributionCount: 0,
        },
      })
    }

    const [contributions, loans, chama] = await Promise.all([
      Contribution.find({ userId: userOid, chamaId: chamaOid, status: 'success' }).lean(),
      Loan.find({ userId: userOid, chamaId: chamaOid }).lean(),
      Chama.findById(chamaOid).lean(),
    ])

    const totalContributed = contributions.reduce((sum, c) => sum + (Number(c.amount) || 0), 0)
    const contributionCount = contributions.length

    const repaidLoans = loans.filter((l) => l.status === 'repaid')
    const defaultedLoans = loans.filter((l) => l.status === 'defaulted')

    const minContribution = chama?.settings?.minContribution || 500

    let score = 0
    const breakdown = {}

    let consistency = 0
    if (contributionCount >= 12) consistency = 25
    else if (contributionCount >= 6) consistency = 18
    else if (contributionCount >= 3) consistency = 12
    else if (contributionCount >= 1) consistency = 6
    score += consistency
    breakdown.contributionConsistency = consistency

    let amountScore = 0
    if (totalContributed >= minContribution * 12) amountScore = 20
    else if (totalContributed >= minContribution * 6) amountScore = 15
    else if (totalContributed >= minContribution * 3) amountScore = 10
    else if (totalContributed >= minContribution) amountScore = 5
    score += amountScore
    breakdown.contributionAmount = amountScore

    const totalLoans = repaidLoans.length + defaultedLoans.length
    let repaymentScore = 0
    if (totalLoans === 0) repaymentScore = 12
    else if (defaultedLoans.length === 0) repaymentScore = 25
    else if (repaidLoans.length > defaultedLoans.length) repaymentScore = 15
    else repaymentScore = 5
    score += repaymentScore
    breakdown.repaymentHistory = repaymentScore

    const joinedAt = membership.createdAt ? new Date(membership.createdAt) : new Date()
    const monthsMember = Math.floor((Date.now() - joinedAt.getTime()) / (1000 * 60 * 60 * 24 * 30))
    let tenureScore = 2
    if (monthsMember >= 12) tenureScore = 15
    else if (monthsMember >= 6) tenureScore = 10
    else if (monthsMember >= 3) tenureScore = 6
    score += tenureScore
    breakdown.membershipTenure = tenureScore

    const streak = Number(membership.contributionStreak) || 0
    let streakScore = 0
    if (streak >= 12) streakScore = 15
    else if (streak >= 6) streakScore = 10
    else if (streak >= 3) streakScore = 6
    score += streakScore
    breakdown.contributionStreak = streakScore

    score = Math.max(0, Math.min(100, score))
    const riskLabel = calculateRiskLabel(score)

    const tips = []
    if (consistency < 18) {
      tips.push(`Increase your contribution frequency. You have made ${contributionCount} contributions so far.`)
    }
    if (amountScore < 15) {
      tips.push(`Your total contributions are KES ${totalContributed}. Contribute more consistently to increase your loan limit.`)
    }
    if (streak < 6) {
      tips.push(`Your contribution streak is ${streak} months. A streak of 6+ months adds significant points to your score.`)
    }
    if (repaymentScore < 20 && totalLoans > 0) {
      tips.push('You have loan defaults on record. Repaying loans on time significantly improves your score.')
    }
    if (tips.length === 0) {
      tips.push('Great score! Keep contributing consistently to maintain your loan eligibility.')
    }

    return res.json({
      success: true,
      data: {
        creditScore: score,
        riskLabel,
        breakdown,
        tips,
        totalContributed,
        contributionCount,
      },
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

const getGroupHealth = async (req, res) => {
  try {
    const { chamaId } = req.params
    const chamaOid = toObjectId(chamaId)
    if (!chamaOid) {
      return res.status(400).json({ success: false, message: 'Invalid chamaId' })
    }

    const [members, loans, chama] = await Promise.all([
      Membership.find({ chamaId: chamaOid, status: 'active' }).lean(),
      Loan.find({ chamaId: chamaOid }).lean(),
      Chama.findById(chamaOid).lean(),
    ])

    const totalMembers = members.length
    if (totalMembers === 0) {
      return res.json({
        success: true,
        data: { groupHealthScore: 0, label: 'poor', totalMembers: 0, activeLoans: 0, defaultedLoans: 0, totalBalance: 0 },
      })
    }

    const defaultedLoans = loans.filter((l) => l.status === 'defaulted').length
    const activeLoans = loans.filter((l) => l.status === 'disbursed').length
    const totalBalance = Number(chama?.totalBalance) || 0

    let score = 70
    if (defaultedLoans === 0) score += 15
    else score -= defaultedLoans * 10
    if (totalBalance > 0) score += 10
    if (activeLoans > totalMembers * 0.5) score -= 10
    score = Math.max(0, Math.min(100, score))

    let label = 'poor'
    if (score >= 80) label = 'excellent'
    else if (score >= 60) label = 'good'
    else if (score >= 40) label = 'fair'

    return res.json({
      success: true,
      data: {
        groupHealthScore: score,
        label,
        totalMembers,
        activeLoans,
        defaultedLoans,
        totalBalance,
      },
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { getCreditScore, getGroupHealth }
