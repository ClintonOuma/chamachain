const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  chamaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chama', default: null },
  type: { type: String, enum: ['contribution','loan','vote','reminder','system','badge'], default: 'system' },
  title: { type: String, required: true },
  body: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  actionUrl: { type: String, default: '' }
}, { timestamps: true });

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
