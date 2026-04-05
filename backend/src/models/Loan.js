const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chamaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chama', required: true },
  amount: { type: Number, required: true },
  purpose: { type: String, enum: ['medical','education','business','emergency','other'], required: true },
  repaymentMonths: { type: Number, required: true },
  monthlyRepayment: { type: Number, default: 0 },
  totalRepayable: { type: Number, default: 0 },
  status: { type: String, enum: ['pending','approved','rejected','disbursed','repaid','defaulted'], default: 'pending' },
  creditScore: { type: Number, default: 0 },
  riskLabel: { type: String, enum: ['low','medium','high','very_high'], default: 'medium' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  disbursedAt: { type: Date, default: null },
  dueDate: { type: Date, default: null },
  mpesaDisbursementRef: { type: String, default: '' },
  votes: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    support: { type: Boolean },
    txHash: { type: String },
    votedAt: { type: Date, default: Date.now }
  }],
  blockchainVoteId: { type: String, default: '' },
  repayments: [{
    amount: { type: Number },
    date: { type: Date },
    mpesaRef: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Loan', loanSchema);
