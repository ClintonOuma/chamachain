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
const {
  googleAuthStart,
  googleAuthCallback
} = require('../controllers/googleAuthController');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/verify-otp', authLimiter, verifyOTP);
router.post('/resend-otp', authLimiter, resendOTP);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.post('/refresh', authLimiter, refreshToken);
router.get('/google', googleAuthStart);
router.get('/google/callback', googleAuthCallback);

module.exports = router;
