const bcrypt = require('bcryptjs')
const User = require('../models/User')
const Membership = require('../models/Membership')
const Contribution = require('../models/Contribution')
const Loan = require('../models/Loan')
const Notification = require('../models/Notification')

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    const userObj = user.toObject()
    delete userObj.passwordHash
    delete userObj.otpHash
    delete userObj.refreshTokenHash

    return res.json({ success: true, user: userObj })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

const updateProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body

    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    if (fullName !== undefined) user.fullName = String(fullName).trim()
    if (phone !== undefined) user.phone = String(phone).trim()

    await user.save()
    const userObj = user.toObject()
    delete userObj.passwordHash
    delete userObj.otpHash
    delete userObj.refreshTokenHash
    return res.json({ success: true, user: userObj })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'currentPassword and newPassword are required' })
    }

    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    const match = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!match) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' })
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12)
    await user.save()

    return res.json({ success: true, message: 'Password updated successfully' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

const updateNotificationPrefs = async (req, res) => {
  try {
    const prefs = req.body?.prefs || req.body
    const { sms, whatsapp, email, inApp } = prefs || {}

    const user = await User.findById(req.user.userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    if (sms !== undefined) user.notificationPrefs.sms = Boolean(sms)
    if (whatsapp !== undefined) user.notificationPrefs.whatsapp = Boolean(whatsapp)
    if (email !== undefined) user.notificationPrefs.email = Boolean(email)
    if (inApp !== undefined) user.notificationPrefs.inApp = Boolean(inApp)

    await user.save()
    return res.json({ success: true })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    await Promise.all([
      Membership.deleteMany({ userId }),
      Contribution.deleteMany({ userId }),
      Loan.deleteMany({ userId }),
      Notification.deleteMany({ userId })
    ])

    await User.deleteOne({ _id: userId })

    return res.json({ success: true, message: 'Account deleted' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  updateNotificationPrefs,
  deleteAccount
}

