/**
 * Notifications Service
 * Manages user notifications (email, in-app)
 */

const { Notification } = require('../models');
const emailService = require('./email');
const logger = require('../config/logger');

/**
 * Create notification record
 * @param {string} userId - User ID
 * @param {string} type - Notification type
 * @param {object} data - Notification data
 * @returns {Promise<object>}
 */
async function createNotification(userId, type, data) {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title: data.title,
      message: data.message,
      data: data.metadata || {},
      read: false,
    });

    logger.info(`Notification created: ${notification.id}`);
    return notification;
  } catch (error) {
    logger.error(`Failed to create notification: ${error.message}`);
    throw error;
  }
}

/**
 * Send notification
 * @param {string} userId - User ID
 * @param {object} user - User object
 * @param {string} type - Notification type
 * @param {object} data - Notification data
 * @returns {Promise<void>}
 */
async function sendNotification(userId, user, type, data) {
  try {
    // Create in-app notification
    await createNotification(userId, type, data);

    // Send email if enabled
    if (user.notificationsEmail) {
      switch (type) {
        case 'welcome':
          await emailService.sendWelcomeEmail(user.email, user.username);
          break;
        case 'new_game':
          await emailService.sendNewGameNotification(user.email, data.game);
          break;
        case 'password_reset':
          await emailService.sendPasswordResetEmail(user.email, data.token);
          break;
        case 'email_verification':
          await emailService.sendEmailVerification(user.email, data.code);
          break;
        case 'daily_digest':
          await emailService.sendDailyDigest(user.email, data.digest);
          break;
      }
    }
  } catch (error) {
    logger.error(`Failed to send notification: ${error.message}`);
    throw error;
  }
}

/**
 * Get user notifications
 * @param {string} userId - User ID
 * @param {number} page - Page number
 * @param {number} pageSize - Page size
 * @returns {Promise<object>}
 */
async function getUserNotifications(userId, page = 1, pageSize = 20) {
  try {
    const offset = (page - 1) * pageSize;

    const { count, rows } = await Notification.findAndCountAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset,
    });

    return {
      notifications: rows,
      pagination: {
        total: count,
        page,
        pageSize,
        pages: Math.ceil(count / pageSize),
      },
    };
  } catch (error) {
    logger.error(`Failed to get notifications: ${error.message}`);
    throw error;
  }
}

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<object>}
 */
async function markAsRead(notificationId) {
  try {
    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.read = true;
    await notification.save();
    return notification;
  } catch (error) {
    logger.error(`Failed to mark notification as read: ${error.message}`);
    throw error;
  }
}

/**
 * Mark all notifications as read
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
async function markAllAsRead(userId) {
  try {
    await Notification.update({ read: true }, { where: { userId, read: false } });
  } catch (error) {
    logger.error(`Failed to mark all notifications as read: ${error.message}`);
    throw error;
  }
}

/**
 * Delete notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
async function deleteNotification(notificationId) {
  try {
    await Notification.destroy({ where: { id: notificationId } });
  } catch (error) {
    logger.error(`Failed to delete notification: ${error.message}`);
    throw error;
  }
}

module.exports = {
  createNotification,
  sendNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
