const jwt = require('jsonwebtoken')
const { getJwtAccessSecret } = require('../config/jwtSecrets')
const User = require('../models/User')

const protect = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' })
  }
  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, getJwtAccessSecret())
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' })
  }
}

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, getJwtAccessSecret());
    const user = await User.findById(decoded.userId).select('-passwordHash -otpHash -refreshTokenHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    req.user = {
      id: user._id,
      email: user.email,
      phone: user.phone
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

const requireRole = (role) => {
  return async (req, res, next) => {
    try {
      const Membership = require('../models/Membership');
      const { chamaId } = req.params;

      const membership = await Membership.findOne({
        userId: req.user.id,
        chamaId,
        role,
        status: 'active'
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: `Access denied. ${role} role required.`
        });
      }

      req.membership = membership;
      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
};

module.exports = { protect, authenticateToken, requireRole }
