const Membership = require('../models/Membership');

const requireRole = (...roles) => {
  return async (req, res, next) => {
    try {
      const chamaId = req.params.chamaId || req.body.chamaId;
      if (!chamaId) return res.status(400).json({ success: false, message: 'chamaId required' });
      const membership = await Membership.findOne({
        userId: req.user.userId,
        chamaId,
        status: 'active'
      });
      if (!membership) return res.status(403).json({ success: false, message: 'Not a member of this chama' });
      if (!roles.includes(membership.role)) return res.status(403).json({ success: false, message: 'Insufficient permissions' });
      req.membership = membership;
      next();
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };
};

module.exports = { requireRole };
