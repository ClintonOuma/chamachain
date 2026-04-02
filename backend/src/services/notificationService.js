const Notification = require('../models/Notification');
const User = require('../models/User');
const socketService = require('./socketService');
const smsService = require('./smsService');
const whatsappService = require('./whatsappService');
const emailService = require('./emailService');

const createNotification = async ({ userId, chamaId = null, type = 'system', title, body, actionUrl = '' }) => {
  try {
    // 1. Create in-app notification
    const notification = await Notification.create({ userId, chamaId, type, title, body, actionUrl });
    
    // 2. Fetch user preferences
    const user = await User.findById(userId);
    if (!user) return notification;

    const { notificationPrefs, phone, email } = user;

    // 3. Emit real-time socket event
    if (notificationPrefs.inApp) {
      socketService.emitNotification(userId, notification);
    }

    // 4. Send external notifications based on preferences
    const message = `${title}: ${body}`;

    if (notificationPrefs.sms && phone) {
      smsService.sendSMS(phone, message).catch(err => console.error('Delayed SMS error:', err.message));
    }

    if (notificationPrefs.whatsapp && phone) {
      whatsappService.sendWhatsApp(phone, message).catch(err => console.error('Delayed WhatsApp error:', err.message));
    }

    if (notificationPrefs.email && email) {
      emailService.sendEmail(email, title, body).catch(err => console.error('Delayed Email error:', err.message));
    }

    return notification;
  } catch (err) {
    console.error('Notification error:', err.message);
  }
};

const createBulkNotifications = async (userIds, data) => {
  try {
    const notifications = userIds.map(userId => ({ userId, ...data }));
    const result = await Notification.insertMany(notifications);
    
    // For bulk, we'll just do real-time and in-app for now to avoid hitting rate limits on external services
    // unless it's a critical system alert
    result.forEach(async (notif) => {
      const user = await User.findById(notif.userId).select('notificationPrefs');
      if (user?.notificationPrefs?.inApp) {
        socketService.emitNotification(notif.userId, notif);
      }
    });
  } catch (err) {
    console.error('Bulk notification error:', err.message);
  }
};

module.exports = { createNotification, createBulkNotifications };
