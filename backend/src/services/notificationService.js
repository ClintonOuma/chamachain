const Notification = require('../models/Notification');

const createNotification = async ({ userId, chamaId = null, type = 'system', title, body, actionUrl = '' }) => {
  try {
    const notification = await Notification.create({ userId, chamaId, type, title, body, actionUrl });
    return notification;
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};

const createBulkNotifications = async (userIds, data) => {
  try {
    const notifications = userIds.map(userId => ({ userId, ...data }));
    await Notification.insertMany(notifications);
  } catch (err) {
    console.error('Bulk notification error:', err.message);
  }
};

module.exports = { createNotification, createBulkNotifications };
