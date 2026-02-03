import db from '../config/database.js';
import bot from '../telegram/bot.js';
import logger from '../config/logger.js';

// ============ NOTIFICATION TYPES ============
const NOTIFICATION_TYPES = {
  USER_REGISTERED: 'user_registered',
  USER_DEACTIVATED: 'user_deactivated',
  FAILED_LOGIN_ATTEMPT: 'failed_login',
  RATE_LIMIT_HIT: 'rate_limit',
  SECURITY_ALERT: 'security_alert',
  SYSTEM_ERROR: 'system_error',
  NEW_FEATURE: 'new_feature',
};

/**
 * Send notification to all admins
 * @param {object} notification - Notification data
 */
export async function notifyAdmins(notification) {
  try {
    const {
      type,
      title,
      message,
      severity = 'info', // info, warning, error, critical
      metadata = {},
    } = notification;

    // Get all admin users
    const admins = await db('users')
      .where({ role: 'admin', is_active: true })
      .select('id', 'email', 'telegram_id');

    if (admins.length === 0) {
      logger.warn('No active admins found for notification');
      return;
    }

    // Save to database
    for (const admin of admins) {
      await db('notifications').insert({
        user_id: admin.id,
        type,
        title,
        message,
        severity,
        metadata: JSON.stringify(metadata),
        is_read: false,
        created_at: new Date(),
      });

      // Send Telegram notification
      if (admin.telegram_id) {
        await sendTelegramNotification(admin.telegram_id, {
          type,
          title,
          message,
          severity,
        });
      }
    }

    logger.info(`💬 Notification sent to ${admins.length} admins`);
  } catch (error) {
    logger.error('Error sending admin notification:', error);
  }
}

/**
 * Send Telegram notification
 * @param {string} chatId - Telegram chat ID
 * @param {object} notification - Notification data
 */
async function sendTelegramNotification(chatId, notification) {
  try {
    const { title, message, severity } = notification;

    // Emoji based on severity
    const severityEmoji = {
      info: 'ℹ️',
      warning: '⚠️',
      error: '❌',
      critical: '🚨',
    };

    const emoji = severityEmoji[severity] || 'ℹ️';
    const text = `${emoji} *${title}*\n\n${message}`;

    await bot.telegram.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
    });
  } catch (error) {
    logger.error('Error sending Telegram notification:', error);
  }
}

/**
 * Notify about new user registration
 * @param {object} user - User data
 */
export async function notifyNewUserRegistration(user) {
  await notifyAdmins({
    type: NOTIFICATION_TYPES.USER_REGISTERED,
    title: '👤 New User Registered',
    message: `New user registered: ${user.email} (@${user.username})`,
    severity: 'info',
    metadata: {
      userId: user.id,
      email: user.email,
      username: user.username,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Notify about user deactivation
 * @param {object} user - User data
 */
export async function notifyUserDeactivation(user, adminId) {
  await notifyAdmins({
    type: NOTIFICATION_TYPES.USER_DEACTIVATED,
    title: '🔐 User Deactivated',
    message: `User ${user.email} has been deactivated by admin`,
    severity: 'warning',
    metadata: {
      userId: user.id,
      email: user.email,
      deactivatedBy: adminId,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Notify about failed login attempts
 * @param {string} email - User email
 * @param {string} ipAddress - IP address of attacker
 */
export async function notifyFailedLoginAttempt(email, ipAddress) {
  await notifyAdmins({
    type: NOTIFICATION_TYPES.FAILED_LOGIN_ATTEMPT,
    title: '🔓 Failed Login Attempt',
    message: `Failed login attempt for ${email} from IP: ${ipAddress}`,
    severity: 'warning',
    metadata: {
      email,
      ipAddress,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Notify about rate limit hits
 * @param {string} endpoint - API endpoint
 * @param {string} ipAddress - IP address
 */
export async function notifyRateLimitHit(endpoint, ipAddress) {
  await notifyAdmins({
    type: NOTIFICATION_TYPES.RATE_LIMIT_HIT,
    title: '🚫 Rate Limit Hit',
    message: `Rate limit exceeded on ${endpoint} from IP: ${ipAddress}`,
    severity: 'warning',
    metadata: {
      endpoint,
      ipAddress,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Notify about security alerts
 * @param {string} description - Alert description
 * @param {object} metadata - Additional metadata
 */
export async function notifySecurityAlert(description, metadata = {}) {
  await notifyAdmins({
    type: NOTIFICATION_TYPES.SECURITY_ALERT,
    title: '🔒 Security Alert',
    message: description,
    severity: 'critical',
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Notify about system errors
 * @param {string} errorMessage - Error description
 * @param {string} service - Service that errored
 */
export async function notifySystemError(errorMessage, service = 'Unknown') {
  await notifyAdmins({
    type: NOTIFICATION_TYPES.SYSTEM_ERROR,
    title: '❌ System Error',
    message: `Error in ${service}: ${errorMessage}`,
    severity: 'error',
    metadata: {
      service,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Get unread notifications for admin
 * @param {number} adminId - Admin user ID
 * @returns {Promise<Array>}
 */
export async function getUnreadNotifications(adminId) {
  try {
    const notifications = await db('notifications')
      .where({ user_id: adminId, is_read: false })
      .orderBy('created_at', 'desc')
      .limit(50);

    return notifications.map((n) => ({
      ...n,
      metadata: JSON.parse(n.metadata || '{}'),
    }));
  } catch (error) {
    logger.error('Error fetching unread notifications:', error);
    return [];
  }
}

/**
 * Mark notification as read
 * @param {number} notificationId - Notification ID
 */
export async function markAsRead(notificationId) {
  try {
    await db('notifications').where({ id: notificationId }).update({
      is_read: true,
      read_at: new Date(),
    });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
  }
}

/**
 * Delete old notifications (older than 30 days)
 */
export async function cleanupOldNotifications() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const deleted = await db('notifications').where('created_at', '<', thirtyDaysAgo).delete();

    logger.info(`🧹 Cleaned up ${deleted} old notifications`);
  } catch (error) {
    logger.error('Error cleaning up old notifications:', error);
  }
}

export default {
  NOTIFICATION_TYPES,
  notifyAdmins,
  notifyNewUserRegistration,
  notifyUserDeactivation,
  notifyFailedLoginAttempt,
  notifyRateLimitHit,
  notifySecurityAlert,
  notifySystemError,
  getUnreadNotifications,
  markAsRead,
  cleanupOldNotifications,
};
