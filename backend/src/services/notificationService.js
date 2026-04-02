const Notification = require('../models/Notification');
const socketService = require('./socketService');

const createNotification = async ({ userId, chamaId = null, type = 'system', title, body, actionUrl = '' }) => {
  try {
    const notification = await Notification.create({ userId, chamaId, type, title, body, actionUrl });
    socketService.emitNotification(userId, notification);
    return notification;
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};

const createBulkNotifications = async (userIds, data) => {
  try {
    const notifications = userIds.map(userId => ({ userId, ...data }));
    const result = await Notification.insertMany(notifications);
    
    // Emit to each user (could be optimized for large groups)
    result.forEach(notif => {
      socketService.emitNotification(notif.userId, notif);
    });
  } catch (err) {
    console.error('Bulk notification error:', err.message);
  }
};

module.exports = { createNotification, createBulkNotifications };
