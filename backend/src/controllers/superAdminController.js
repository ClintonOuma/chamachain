const User = require('../models/User')
const Chama = require('../models/Chama')
const Membership = require('../models/Membership')
const Contribution = require('../models/Contribution')
const Loan = require('../models/Loan')
const AuditLog = require('../models/AuditLog')
const { logAction } = require('../services/auditService')

// Platform analytics
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalChamas,
      totalContributions,
      totalLoans,
      activeLoans,
      suspendedUsers,
      frozenChamas,
      superAdmins
    ] = await Promise.all([
      User.countDocuments(),
      Chama.countDocuments(),
      Contribution.countDocuments({ status: 'success' }),
      Loan.countDocuments(),
      Loan.countDocuments({ status: 'disbursed' }),
      User.countDocuments({ isSuspended: true }),
      Chama.countDocuments({ status: 'frozen' }),
      User.countDocuments({ isSuperAdmin: true })
    ])

    const totalMoneyMoved = await Contribution.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    const recentLogins = await User.find()
      .select('fullName email lastLoginAt')
      .sort({ lastLoginAt: -1 })
      .limit(5)

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalChamas,
        totalContributions,
        totalLoans,
        activeLoans,
        suspendedUsers,
        frozenChamas,
        superAdmins,
        totalMoneyMoved: totalMoneyMoved[0]?.total || 0,
        recentLogins
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Get all users with pagination + search
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const search = req.query.search || ''
    const filter = req.query.filter || 'all'

    let query = {}
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    }
    if (filter === 'suspended') query.isSuspended = true
    if (filter === 'superadmin') query.isSuperAdmin = true

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash -otpHash -refreshTokenHash')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(query)
    ])
    res.json({ success: true, users, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Get all chamas with pagination + search
const getAllChamas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const search = req.query.search || ''
    const filter = req.query.filter || 'all'

    let query = {}
    if (search) query.name = { $regex: search, $options: 'i' }
    if (filter === 'frozen') query.status = 'frozen'
    if (filter === 'active') query.status = 'active'

    const [chamas, total] = await Promise.all([
      Chama.find(query)
        .populate('createdBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Chama.countDocuments(query)
    ])

    const chamasWithCount = await Promise.all(chamas.map(async (chama) => {
      const memberCount = await Membership.countDocuments({ chamaId: chama._id, status: 'active' })
      return { ...chama.toObject(), memberCount }
    }))

    res.json({ success: true, chamas: chamasWithCount, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Suspend user
const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params
    const { reason } = req.body
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    if (user.isSuperAdmin) return res.status(403).json({ success: false, message: 'Cannot suspend a super admin' })

    user.isSuspended = true
    user.suspendedReason = reason || 'Violation of terms of service'
    await user.save()

    await logAction({
      performedBy: req.user.userId,
      action: 'USER_SUSPENDED',
      targetUserId: userId,
      metadata: { targetName: user.fullName, targetEmail: user.email, reason: user.suspendedReason }
    })

    res.json({ success: true, message: `${user.fullName} has been suspended` })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Unsuspend user
const unsuspendUser = async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    user.isSuspended = false
    user.suspendedReason = ''
    await user.save()

    await logAction({
      performedBy: req.user.userId,
      action: 'USER_UNSUSPENDED',
      targetUserId: userId,
      metadata: { targetName: user.fullName, targetEmail: user.email }
    })

    res.json({ success: true, message: `${user.fullName} has been unsuspended` })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Freeze / unfreeze any chama (platform level)
const freezeAnyChama = async (req, res) => {
  try {
    const { chamaId } = req.params
    const { reason } = req.body
    const chama = await Chama.findById(chamaId)
    if (!chama) return res.status(404).json({ success: false, message: 'Chama not found' })

    const wasFrozen = chama.status === 'frozen'
    chama.status = wasFrozen ? 'active' : 'frozen'
    if (!wasFrozen) {
      chama.frozenReason = reason || 'Frozen by platform administrator'
    } else {
      chama.frozenReason = ''
    }
    await chama.save()

    await logAction({
      performedBy: req.user.userId,
      chamaId,
      action: wasFrozen ? 'CHAMA_UNFROZEN' : 'CHAMA_FROZEN',
      metadata: { chamaName: chama.name, reason: chama.frozenReason }
    })

    res.json({ success: true, status: chama.status, message: `Chama ${wasFrozen ? 'unfrozen' : 'frozen'} successfully` })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Delete user account permanently
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    if (user.isSuperAdmin) return res.status(403).json({ success: false, message: 'Cannot delete a super admin' })

    const { fullName, email } = user

    await Promise.all([
      Membership.deleteMany({ userId }),
      Contribution.deleteMany({ userId }),
      Loan.deleteMany({ userId }),
      User.findByIdAndDelete(userId)
    ])

    await logAction({
      performedBy: req.user.userId,
      action: 'USER_DELETED',
      metadata: { deletedName: fullName, deletedEmail: email }
    })

    res.json({ success: true, message: `${fullName} deleted successfully` })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Promote user to super admin
const promoteSuperAdmin = async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    if (user.isSuperAdmin) return res.status(400).json({ success: false, message: 'User is already a super admin' })

    user.isSuperAdmin = true
    await user.save()

    await logAction({
      performedBy: req.user.userId,
      action: 'SUPER_ADMIN_PROMOTED',
      targetUserId: userId,
      metadata: { targetName: user.fullName, targetEmail: user.email }
    })

    res.json({ success: true, message: `${user.fullName} is now a Super Admin` })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Revoke super admin privileges
const revokeSuperAdmin = async (req, res) => {
  try {
    const { userId } = req.params
    if (userId === req.user.userId) {
      return res.status(400).json({ success: false, message: 'You cannot revoke your own Super Admin access' })
    }
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    if (!user.isSuperAdmin) return res.status(400).json({ success: false, message: 'User is not a super admin' })

    user.isSuperAdmin = false
    await user.save()

    await logAction({
      performedBy: req.user.userId,
      action: 'SUPER_ADMIN_REVOKED',
      targetUserId: userId,
      metadata: { targetName: user.fullName, targetEmail: user.email }
    })

    res.json({ success: true, message: `Super Admin access revoked from ${user.fullName}` })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Get system audit logs
const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50
    const search = req.query.search || ''

    const query = search ? { action: { $regex: search, $options: 'i' } } : {}

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('performedBy', 'fullName email')
        .populate('chamaId', 'name')
        .populate('targetUserId', 'fullName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      AuditLog.countDocuments(query)
    ])
    res.json({ success: true, logs, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Get all transactions (Contributions + Loans) with real pagination
const getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50
    const type = req.query.type || 'all'

    let contributions = []
    let loans = []

    if (type === 'all' || type === 'contribution') {
      contributions = await Contribution.find()
        .populate('userId', 'fullName email')
        .populate('chamaId', 'name')
        .sort({ createdAt: -1 })
        .limit(500)
    }
    if (type === 'all' || type === 'loan') {
      loans = await Loan.find()
        .populate('userId', 'fullName email')
        .populate('chamaId', 'name')
        .sort({ createdAt: -1 })
        .limit(500)
    }

    const all = [
      ...contributions.map(c => ({ ...c.toObject(), txType: 'contribution' })),
      ...loans.map(l => ({ ...l.toObject(), txType: 'loan' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    const paginated = all.slice((page - 1) * limit, page * limit)

    res.json({ success: true, transactions: paginated, total: all.length, page, pages: Math.ceil(all.length / limit) })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = {
  getStats, getAllUsers, getAllChamas, suspendUser, unsuspendUser,
  freezeAnyChama, deleteUser, promoteSuperAdmin, revokeSuperAdmin,
  getAuditLogs, getAllTransactions
}
