const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  isSuperAdmin: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },
  suspendedReason: { type: String, default: '' },
  otpHash: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  refreshTokenHash: { type: String, default: null },
  lastLoginAt: { type: Date, default: null },
  notificationPrefs: {
    sms: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: true },
    email: { type: Boolean, default: true },
    inApp: { type: Boolean, default: true }
  }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema);
