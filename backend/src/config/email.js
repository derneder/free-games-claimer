import nodemailer from 'nodemailer';
import logger from './logger.js';

// ============ EMAIL TRANSPORTER SETUP ============

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true' || false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    logger.error('Email transporter error:', error);
  } else {
    logger.info('📧 Email service ready');
  }
});

/**
 * Send email
 * @param {object} options - Email options
 */
export async function sendEmail(options) {
  try {
    const {
      to,
      subject,
      html,
      text,
      from = process.env.SMTP_FROM || 'noreply@freegamesclaimer.com',
    } = options;

    const result = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      text,
    });

    logger.info(`📧 Email sent to ${to}`);
    return result;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send welcome email
 * @param {string} email - User email
 * @param {string} username - Username
 */
export async function sendWelcomeEmail(email, username) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h1>Welcome to Free Games Claimer! 🌟</h1>
          <p>Hello ${username},</p>
          <p>Thank you for registering! You can now start collecting free games from Epic Games, GOG, Steam, and Prime Gaming.</p>
          <p>To get started, <a href="${process.env.FRONTEND_URL}/dashboard">click here</a>.</p>
          <hr>
          <p>Free Games Claimer</p>
        </body>
      </html>
    `;

    await sendEmail({
      to: email,
      subject: 'Welcome to Free Games Claimer!',
      html,
    });
  } catch (error) {
    logger.error('Error sending welcome email:', error);
  }
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} resetToken - Reset token
 */
export async function sendPasswordResetEmail(email, resetToken) {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password.</p>
          <p><a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>This link expires in 1 hour.</p>
          <hr>
          <p>Free Games Claimer</p>
        </body>
      </html>
    `;

    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html,
    });
  } catch (error) {
    logger.error('Error sending password reset email:', error);
  }
}

/**
 * Send 2FA setup email
 * @param {string} email - User email
 * @param {string} qrCodeUrl - QR code URL
 */
export async function send2FASetupEmail(email, qrCodeUrl) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>Two-Factor Authentication Setup</h2>
          <p>You've enabled two-factor authentication for your account.</p>
          <p>Scan this QR code with Google Authenticator or similar app:</p>
          <img src="${qrCodeUrl}" alt="2FA QR Code" style="max-width: 300px;">
          <p>If you can't scan, enter this code manually in your authenticator app.</p>
          <p><strong>Keep your backup codes safe!</strong></p>
          <hr>
          <p>Free Games Claimer</p>
        </body>
      </html>
    `;

    await sendEmail({
      to: email,
      subject: 'Two-Factor Authentication Enabled',
      html,
    });
  } catch (error) {
    logger.error('Error sending 2FA email:', error);
  }
}

/**
 * Send new game notification
 * @param {string} email - User email
 * @param {object} game - Game data
 */
export async function sendNewGameNotification(email, game) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>🎮 New Free Game Available!</h2>
          <p><strong>${game.title}</strong></p>
          <p>Platform: ${game.platform}</p>
          <p>Source: ${game.source.toUpperCase()}</p>
          <p style="color: #007bff; font-size: 20px; font-weight: bold;">
            Regular price: $${game.steam_price_usd || 'N/A'}
          </p>
          <p><a href="${process.env.FRONTEND_URL}/games/${game.id}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Game</a></p>
          <hr>
          <p>Free Games Claimer</p>
        </body>
      </html>
    `;

    await sendEmail({
      to: email,
      subject: `New Free Game: ${game.title}`,
      html,
    });
  } catch (error) {
    logger.error('Error sending game notification email:', error);
  }
}

/**
 * Send account activity alert
 * @param {string} email - User email
 * @param {string} activity - Activity description
 */
export async function sendActivityAlert(email, activity) {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>🔐 Account Activity Alert</h2>
          <p>We detected the following activity on your account:</p>
          <p><strong>${activity}</strong></p>
          <p>Time: ${new Date().toLocaleString()}</p>
          <p>If this wasn't you, please change your password immediately.</p>
          <p><a href="${process.env.FRONTEND_URL}/settings" style="background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Change Password</a></p>
          <hr>
          <p>Free Games Claimer</p>
        </body>
      </html>
    `;

    await sendEmail({
      to: email,
      subject: 'Account Activity Alert',
      html,
    });
  } catch (error) {
    logger.error('Error sending activity alert:', error);
  }
}

/**
 * Send weekly digest
 * @param {string} email - User email
 * @param {object} digestData - Digest data
 */
export async function sendWeeklyDigest(email, digestData) {
  try {
    const gamesHtml = digestData.games
      .map(g => `<li>${g.title} (${g.source.toUpperCase()}) - $${g.price}</li>`)
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif;">
          <h2>💰 Weekly Free Games Digest</h2>
          <p>Here are the free games available this week:</p>
          <ul>${gamesHtml}</ul>
          <p>Total value: <strong>$${digestData.totalValue}</strong></p>
          <p><a href="${process.env.FRONTEND_URL}/games" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View All Games</a></p>
          <hr>
          <p>Free Games Claimer</p>
        </body>
      </html>
    `;

    await sendEmail({
      to: email,
      subject: 'Weekly Free Games Digest',
      html,
    });
  } catch (error) {
    logger.error('Error sending weekly digest:', error);
  }
}

export default transporter;
