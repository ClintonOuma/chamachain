const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chamaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chama', required: true },
  role: { type: String, enum: ['admin', 'treasurer', 'member', 'observer'], default: 'member' },
  totalContributed: { type: Number, default: 0 },
  contributionStreak: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'suspended', 'left'], default: 'active' }
}, { timestamps: true });

membershipSchema.index({ userId: 1, chamaId: 1 }, { unique: true });

module.exports = mongoose.model('Membership', membershipSchema);
