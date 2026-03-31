const mongoose = require('mongoose')

const auditLogSchema = new mongoose.Schema({
  chamaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chama', default: null },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  metadata: { type: Object, default: {} }
}, { timestamps: true })

module.exports = mongoose.model('AuditLog', auditLogSchema)
