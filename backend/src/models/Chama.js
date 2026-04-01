const mongoose = require('mongoose');

const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const chamaSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  inviteCode: { type: String, unique: true, default: generateInviteCode },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'frozen', 'archived'], default: 'active' },
  settings: {
    minContribution: { type: Number, default: 500 },
    contributionFrequency: { type: String, enum: ['weekly', 'monthly'], default: 'monthly' },
    contributionDueDay: { type: Number, default: 1 },
    loanVotingEnabled: { type: Boolean, default: true },
    loanVoteThreshold: { type: Number, default: 51 },
    maxLoanMultiplier: { type: Number, default: 3 },
    latePenaltyRate: { type: Number, default: 0.5 }
  },
  totalBalance: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Chama', chamaSchema);
