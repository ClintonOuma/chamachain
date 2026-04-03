const User = require('../models/User')
const Chama = require('../models/Chama')
const Membership = require('../models/Membership')
const Contribution = require('../models/Contribution')
const Loan = require('../models/Loan')
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
      frozenChamas
    ] = await Promise.all([
      User.countDocuments(),
      Chama.countDocuments(),
      Contribution.countDocuments({ status: 'success' }),
      Loan.countDocuments(),
      Loan.countDocuments({ status: 'disbursed' }),
      User.countDocuments({ isSuspended: true }),
      Chama.countDocuments({ status: 'frozen' })
    ])

    const totalMoneyMoved = await Contribution.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

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
        totalMoneyMoved: totalMoneyMoved[0]?.total || 0
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Get all users with pagination
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const search = req.query.search || ''
    const query = search
      ? { $or: [{ fullName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {}
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

// Get all chamas
const getAllChamas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const search = req.query.search || ''
    const query = search ? { name: { $regex: search, $options: 'i' } } : {}
    const [chamas, total] = await Promise.all([
      Chama.find(query)
        .populate('createdBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Chama.countDocuments(query)
    ])

    // Add member count to each chama
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
    res.json({ success: true, message: `User ${user.fullName} suspended` })
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
    res.json({ success: true, message: `User ${user.fullName} unsuspended` })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Freeze any chama (platform level)
const freezeAnyChama = async (req, res) => {
  try {
    const { chamaId } = req.params
    const { reason } = req.body
    const chama = await Chama.findById(chamaId)
    if (!chama) return res.status(404).json({ success: false, message: 'Chama not found' })
    chama.status = chama.status === 'frozen' ? 'active' : 'frozen'
    await chama.save()
    res.json({ success: true, status: chama.status, message: `Chama ${chama.status}` })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Delete user account
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    if (user.isSuperAdmin) return res.status(403).json({ success: false, message: 'Cannot delete a super admin' })
    await Promise.all([
      Membership.deleteMany({ userId }),
      Contribution.deleteMany({ userId }),
      Loan.deleteMany({ userId }),
      User.findByIdAndDelete(userId)
    ])
    res.json({ success: true, message: 'User deleted successfully' })
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
    user.isSuperAdmin = true
    await user.save()
    res.json({ success: true, message: `${user.fullName} is now a Super Admin` })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// Revoke super admin
const revokeSuperAdmin = async (req, res) => {
  try {
    const { userId } = req.params
    if (userId === req.user.userId) return res.status(400).json({ success: false, message: 'Cannot revoke your own super admin access' })
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    user.isSuperAdmin = false
    await user.save()
    res.json({ success: true, message: `Super Admin access revoked from ${user.fullName}` })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { getStats, getAllUsers, getAllChamas, suspendUser, unsuspendUser, freezeAnyChama, deleteUser, promoteSuperAdmin, revokeSuperAdmin }