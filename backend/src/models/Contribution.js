const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chamaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chama', required: true },
  amount: { type: Number, required: true },
  mpesaRef: { type: String, default: '' },
  mpesaPhone: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
  periodMonth: { type: String, default: '' },
  blockchainHash: { type: String, default: '' }
}, { timestamps: true });

contributionSchema.index({ userId: 1, chamaId: 1 });
contributionSchema.index({ chamaId: 1, periodMonth: 1 });

module.exports = mongoose.model('Contribution', contributionSchema);
