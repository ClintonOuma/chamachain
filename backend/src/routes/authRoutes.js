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

router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refreshToken);

module.exports = router;
