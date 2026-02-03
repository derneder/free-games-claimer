/**
 * Email Service
 * Handles all email notifications
 */

const nodemailer = require('nodemailer');
const logger = require('../config/logger');

/**
 * Email transporter configuration
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Send welcome email
 * @param {string} email - User email
 * @param {string} username - User username
 * @returns {Promise<void>}
 */
async function sendWelcomeEmail(email, username) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Welcome to Free Games Claimer!',
    html: `
      <h1>Welcome, ${username}!</h1>
      <p>Thank you for joining Free Games Claimer.</p>
      <p>You can now start tracking free games from multiple platforms.</p>
      <p>Features:</p>
      <ul>
        <li>Track free games</li>
        <li>Get notifications about new free games</li>
        <li>Manage your game library</li>
        <li>View statistics</li>
      </ul>
      <p>Best regards,<br>Free Games Claimer Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Welcome email sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send welcome email: ${error.message}`);
    throw error;
  }
}

/**
 * Send new game notification
 * @param {string} email - User email
 * @param {object} game - Game object
 * @returns {Promise<void>}
 */
async function sendNewGameNotification(email, game) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: `🎮 New Free Game: ${game.title}!`,
    html: `
      <h2>${game.title}</h2>
      <img src="${game.image}" style="max-width: 300px;" />
      <p>${game.description}</p>
      <p><strong>Platforms:</strong> ${game.platforms.join(', ')}</p>
      <p><strong>Available on:</strong> ${game.sources.join(', ')}</p>
      <p><strong>Original Price:</strong> $${game.price}</p>
      <a href="${game.url}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Claim Game
      </a>
      <p><small>Expires: ${new Date(game.expiresAt).toLocaleDateString()}</small></p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`New game notification sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send new game notification: ${error.message}`);
    throw error;
  }
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} token - Reset token
 * @returns {Promise<void>}
 */
async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
      <p><small>This link expires in 24 hours.</small></p>
      <p>If you didn't request this, ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send password reset email: ${error.message}`);
    throw error;
  }
}

/**
 * Send email verification
 * @param {string} email - User email
 * @param {string} code - Verification code
 * @returns {Promise<void>}
 */
async function sendEmailVerification(email, code) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verify Your Email',
    html: `
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1 style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 5px;">${code}</h1>
      <p>This code expires in 10 minutes.</p>
      <p>Do not share this code with anyone.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Verification email sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send verification email: ${error.message}`);
    throw error;
  }
}

/**
 * Send daily digest
 * @param {string} email - User email
 * @param {object} digest - Digest data
 * @returns {Promise<void>}
 */
async function sendDailyDigest(email, digest) {
  const gamesList = digest.games
    .map(g => `<li>${g.title} - ${g.sources.join(', ')}</li>`)
    .join('');

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: `📊 Your Daily Digest - ${digest.games.length} Free Games Today!`,
    html: `
      <h2>Daily Digest</h2>
      <p>Here are the free games available today:</p>
      <ul>${gamesList}</ul>
      <p><strong>Total Games:</strong> ${digest.games.length}</p>
      <p><strong>Total Value:</strong> $${digest.totalValue}</p>
      <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        View All Games
      </a>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Daily digest sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send daily digest: ${error.message}`);
    throw error;
  }
}

module.exports = {
  sendWelcomeEmail,
  sendNewGameNotification,
  sendPasswordResetEmail,
  sendEmailVerification,
  sendDailyDigest,
};
