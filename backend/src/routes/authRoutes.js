const express = require('express');
const router = express.Router();
const {
  register,
  verifyOTP,
  login,
  logout,
  refreshToken,
  resendOTP
} = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/verify-otp', authLimiter, verifyOTP);
router.post('/resend-otp', authLimiter, resendOTP);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.post('/refresh', authLimiter, refreshToken);

module.exports = router;
