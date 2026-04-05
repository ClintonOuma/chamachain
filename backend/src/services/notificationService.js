const Notification = require('../models/Notification')

const createNotification = async ({ userId, chamaId = null, type = 'system', title, body, actionUrl = '' }) => {
  try {
    const notification = await Notification.create({
      userId, chamaId, type, title, body, actionUrl
    })

    // Emit real-time notification to user's socket room
    if (global.io) {
      global.io.to(`user:${userId.toString()}`).emit('notification', {
        _id: notification._id,
        type,
        title,
        body,
        actionUrl,
        isRead: false,
        createdAt: notification.createdAt
      })
      console.log(`[socket] Notification emitted to user:${userId}`)
    }

    return notification
  } catch (err) {
    console.error('Notification error:', err.message)
  }
}

const createBulkNotifications = async (userIds, data) => {
  try {
    const notifications = userIds.map(userId => ({ userId, ...data }))
    const created = await Notification.insertMany(notifications)

    // Emit to each user
    if (global.io) {
      for (const notif of created) {
        global.io.to(`user:${notif.userId.toString()}`).emit('notification', {
          _id: notif._id,
          type: notif.type,
          title: notif.title,
          body: notif.body,
          actionUrl: notif.actionUrl,
          isRead: false,
          createdAt: notif.createdAt
        })
      }
    }
  } catch (err) {
    console.error('Bulk notification error:', err.message)
  }
}

module.exports = { createNotification, createBulkNotifications }
