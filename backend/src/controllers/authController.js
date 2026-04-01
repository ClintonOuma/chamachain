const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const { generateOTP, hashOTP, verifyOTP: compareOTP } = require('../utils/otp');
const { getJwtRefreshSecret } = require('../config/jwtSecrets');

const register = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' })
    }
    const normalizedEmail = String(email).toLowerCase().trim()
    const normalizedPhone = String(phone).trim()
    const normalizedFullName = String(fullName).trim()

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }]
    })
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email or phone already registered' })
    }
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({
      fullName: normalizedFullName,
      email: normalizedEmail,
      phone: normalizedPhone,
      passwordHash,
      isVerified: true
    })
    const accessToken = generateAccessToken(user._id, 'member')
    const refreshToken = generateRefreshToken(user._id)
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10)
    user.refreshTokenHash = refreshTokenHash
    await user.save()
    const userObj = {
      id: String(user._id),
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      notificationPrefs: user.notificationPrefs
    }
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      accessToken,
      refreshToken,
      user: userObj
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'userId and otp are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid userId' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired'
      });
    }

    const valid = await compareOTP(otp, user.otpHash);
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    user.isVerified = true;
    user.otpHash = null;
    user.otpExpiry = null;

    const accessToken = generateAccessToken(user._id.toString(), null);
    const refreshToken = generateRefreshToken(user._id.toString());
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 12);

    await user.save();

    const userObj = {
      id: String(user._id),
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      notificationPrefs: user.notificationPrefs
    };

    return res.json({
      success: true,
      accessToken,
      refreshToken,
      user: userObj
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' })
    }
    const normalizedEmail = String(email).toLowerCase().trim()
    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' })
    }
    const accessToken = generateAccessToken(user._id, 'member')
    const refreshToken = generateRefreshToken(user._id)
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10)
    user.refreshTokenHash = refreshTokenHash
    await user.save()
    const userObj = {
      id: String(user._id),
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      notificationPrefs: user.notificationPrefs
    }
    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: userObj
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'refreshToken is required'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, getJwtRefreshSecret());
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    user.refreshTokenHash = null;
    await user.save();

    return res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'refreshToken is required'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, getJwtRefreshSecret());
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const matches = await bcrypt.compare(token, user.refreshTokenHash);
    if (!matches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const accessToken = generateAccessToken(user._id.toString(), null);

    return res.json({ success: true, accessToken });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { userId } = req.body
    if (!userId) return res.status(400).json({ success: false, message: 'userId required' })
    const User = require('../models/User')
    const { generateOTP, hashOTP } = require('../utils/otp')
    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })
    if (user.isVerified) return res.status(400).json({ success: false, message: 'Already verified' })
    const otp = generateOTP()
    const otpHash = await hashOTP(otp)
    user.otpHash = otpHash
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()
    console.log(`[resend-otp] OTP for ${user.phone} : ${otp}`)
    res.json({ success: true, message: 'OTP resent successfully' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = {
  register,
  verifyOTP,
  login,
  logout,
  refreshToken,
  resendOTP
};
