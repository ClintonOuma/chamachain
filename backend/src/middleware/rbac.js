const Membership = require('../models/Membership')

const requireRole = (...roles) => {
  return async (req, res, next) => {
    try {
      const chamaId = req.params.chamaId || req.body.chamaId
      if (!chamaId) return res.status(400).json({ success: false, message: 'chamaId required' })
      const membership = await Membership.findOne({
        userId: req.user.userId,
        chamaId,
        status: 'active'
      })
      if (!membership) return res.status(403).json({ success: false, message: 'You are not a member of this chama' })
      if (!roles.includes(membership.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${roles.join(' or ')}. Your role: ${membership.role}`
        })
      }
      req.membership = membership
      next()
    } catch (err) {
      res.status(500).json({ success: false, message: err.message })
    }
  }
}

// Middleware that attaches membership to req without blocking 
const attachMembership = async (req, res, next) => {
  try {
    const chamaId = req.params.chamaId || req.body.chamaId
    if (chamaId && req.user?.userId) {
      const membership = await Membership.findOne({
        userId: req.user.userId,
        chamaId,
        status: 'active'
      })
      req.membership = membership
    }
    next()
  } catch (err) {
    next()
  }
}

module.exports = { requireRole, attachMembership }
