const User = require('../models/User')

const requireSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user?.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Super Admin access required'
      })
    }
    // Double check in DB (token might be stale)
    const user = await User.findById(req.user.userId)
    if (!user || !user.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Super Admin access required'
      })
    }
    next()
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { requireSuperAdmin }