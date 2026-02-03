import nodemailer from 'nodemailer';
import logger from '../config/logger.js';

let transporter;

/**
 * Инициализация email сервиса
 */
export const initEmailService = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    logger.warn('⚠️ Email service not configured - emails will not be sent');
    return;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  transporter.verify((error, success) => {
    if (error) {
      logger.error('❌ Email service connection error:', error);
    } else {
      logger.info('✅ Email service initialized successfully');
    }
  });
};

/**
 * Отправить email
 */
export const sendEmail = async (to, subject, html, options = {}) => {
  if (!transporter) {
    logger.warn(`📧 Email service not initialized, skipping email to ${to}`);
    return null;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@free-games-claimer.com',
      to,
      subject,
      html,
      ...options,
    });

    logger.info(`✅ Email sent to ${to} - ID: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`❌ Email error to ${to}:`, error.message);
    throw error;
  }
};

/**
 * Email шаблоны
 */
const getEmailTemplate = (type, data) => {
  const templates = {
    welcome: (data) => `
      <h1>Welcome to Free Games Claimer! 🎮</h1>
      <p>Hi ${data.username},</p>
      <p>Thank you for joining us! We're excited to help you collect free games.</p>
      <p>
        <a href="${process.env.FRONTEND_URL}/dashboard" style="
          display: inline-block;
          padding: 12px 24px;
          background-color: #3b82f6;
          color: white;
          text-decoration: none;
          border-radius: 6px;
        ">
          Go to Dashboard
        </a>
      </p>
      <p>Best regards,<br>Free Games Claimer Team</p>
    `,

    passwordReset: (data) => `
      <h1>Reset Your Password</h1>
      <p>Hi ${data.username},</p>
      <p>Click the link below to reset your password:</p>
      <p>
        <a href="${process.env.FRONTEND_URL}/reset-password?token=${data.token}" style="
          display: inline-block;
          padding: 12px 24px;
          background-color: #3b82f6;
          color: white;
          text-decoration: none;
          border-radius: 6px;
        ">
          Reset Password
        </a>
      </p>
      <p><small>This link expires in 24 hours</small></p>
      <p>Best regards,<br>Free Games Claimer Team</p>
    `,

    gamesClaimed: (data) => `
      <h1>🎮 New Games Available!</h1>
      <p>Hi ${data.username},</p>
      <p>Great news! ${data.count} new free games have been added to your library:</p>
      <ul>
        ${data.games.map(game => `<li><strong>${game.title}</strong> (${game.source})</li>`).join('')}
      </ul>
      <p>
        <a href="${process.env.FRONTEND_URL}/dashboard" style="
          display: inline-block;
          padding: 12px 24px;
          background-color: #10b981;
          color: white;
          text-decoration: none;
          border-radius: 6px;
        ">
          View All Games
        </a>
      </p>
      <p>Best regards,<br>Free Games Claimer Team</p>
    `,

    adminAlert: (data) => `
      <h1>🚨 System Alert</h1>
      <p><strong>Alert Type:</strong> ${data.type}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <p><strong>Details:</strong></p>
      <pre style="background-color: #f3f4f6; padding: 10px; border-radius: 4px;">
${JSON.stringify(data.details, null, 2)}
      </pre>
      <p>Free Games Claimer Admin</p>
    `,
  };

  return templates[type]?.(data) || null;
};

/**
 * Отправить email на основе события
 */
export const sendNotificationEmail = async (action, userId, data = {}) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  switch (action) {
    case 'user_registered':
      return await sendEmail(
        data.email,
        '🎮 Welcome to Free Games Claimer',
        getEmailTemplate('welcome', { username: data.username })
      );

    case 'password_reset_request':
      return await sendEmail(
        data.email,
        'Reset Your Password',
        getEmailTemplate('passwordReset', {
          username: data.username,
          token: data.resetToken,
        })
      );

    case 'games_claimed':
      return await sendEmail(
        data.email,
        `🎮 ${data.count} New Games Claimed!`,
        getEmailTemplate('gamesClaimed', {
          username: data.username,
          count: data.count,
          games: data.games,
        })
      );

    case 'scraper_error':
      if (adminEmail) {
        return await sendEmail(
          adminEmail,
          `⚠️ Scraper Error: ${data.source}`,
          getEmailTemplate('adminAlert', {
            type: 'Scraper Error',
            details: {
              source: data.source,
              error: data.error,
              timestamp: new Date().toISOString(),
            },
          })
        );
      }
      break;

    case 'bulk_import':
      if (adminEmail) {
        return await sendEmail(
          adminEmail,
          `📦 Bulk Import Report: ${data.count} games`,
          getEmailTemplate('adminAlert', {
            type: 'Bulk Import',
            details: {
              user: data.username,
              count: data.count,
              sources: data.sources,
              timestamp: new Date().toISOString(),
            },
          })
        );
      }
      break;

    default:
      logger.warn(`Unknown email action: ${action}`);
  }
};

export default {
  initEmailService,
  sendEmail,
  sendNotificationEmail,
  getEmailTemplate,
};