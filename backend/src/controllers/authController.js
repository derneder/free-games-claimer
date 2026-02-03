/**
 * Authentication Controller
 *
 * Handles HTTP requests for authentication endpoints.
 * Processes registration, login, token refresh, and 2FA.
 *
 * @module src/controllers/authController
 */

import { User } from '../models/User.js';
import { ActivityLog } from '../models/ActivityLog.js';
import * as authService from '../services/auth.js';
import { generateToken } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';
import { logger } from '../config/logger.js';
import { config } from '../config/env.js';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import { getRedisClient } from '../config/redis.js';

/**
 * Register new user
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
export async function register(req, res) {
  try {
    const { email, username, password, confirmPassword } = req.body;

    const result = await authService.registerUser(email, username, password, confirmPassword);

    res.status(201).json({
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    logger.error('Registration error:', error);

    // Handle Postgres unique constraint violations
    if (error.code === '23505') {
      let message = 'User already exists';
      if (error.constraint === 'users_email_key') {
        message = 'User with this email already exists';
      } else if (error.constraint === 'users_username_key') {
        message = 'User with this username already exists';
      }
      return res.status(400).json({ error: message });
    }

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
}

/**
 * Login user
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser(email, password);

    res.json({
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error) {
    logger.error('Login error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Login failed' });
  }
}

/**
 * Refresh access token
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
export async function refreshToken(req, res) {
  try {
    const { refreshToken } = req.body;

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.jwt.secret);
    } catch (error) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
    }

    // Get user
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401, 'USER_NOT_FOUND');
    }

    // Generate new tokens
    const accessToken = generateToken({ id: user.id, email: user.email, role: user.role });
    res.json({
      accessToken,
      refreshToken, // возвращаем входной токен без лишней переменной
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Token refresh failed' });
  }
}

/**
 * Get current user profile
 *
 * @param {Object} req - Express request (with user attached)
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        twoFaEnabled: user.twoFaEnabled,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to get profile' });
  }
}

/**
 * Setup two-factor authentication
 *
 * @param {Object} req - Express request (with user attached)
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
export async function setup2FA(req, res) {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Free Games Claimer (${user.email})`,
      length: 32,
    });

    // Generate 10 backup codes
    const { generateRandomCode } = await import('../utils/crypto.js');
    const backupCodes = Array.from({ length: 10 }, () => generateRandomCode(8));

    // Store temporary secret and backup codes in Redis
    const redis = getRedisClient();
    await redis.setEx(
      `2fa_temp:${user.id}`,
      300, // 5 minutes
      JSON.stringify({ secret, backupCodes })
    );

    res.json({
      secret: secret.base32,
      qrCode: secret.otpauth_url,
      backupCodes,
    });
  } catch (error) {
    logger.error('2FA setup error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: '2FA setup failed' });
  }
}

/**
 * Verify 2FA token and enable
 *
 * @param {Object} req - Express request (with user attached)
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
export async function verify2FA(req, res) {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Get temporary secret from Redis
    const redis = getRedisClient();
    const tempData = await redis.get(`2fa_temp:${user.id}`);

    if (!tempData) {
      throw new AppError('2FA setup expired. Please try again.', 400, 'SETUP_EXPIRED');
    }

    const { secret } = JSON.parse(tempData);

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: secret.base32,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!verified) {
      throw new AppError('Invalid 2FA token', 400, 'INVALID_TOKEN');
    }

    // Enable 2FA for user
    user.twoFaSecret = secret.base32;
    user.twoFaEnabled = true;
    await user.save();

    // Clear temporary secret
    await redis.del(`2fa_temp:${user.id}`);

    // Log activity
    await ActivityLog.log({
      userId: user.id,
      action: '2FA_ENABLED',
      description: 'Two-factor authentication enabled',
    });

    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    logger.error('2FA verification error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: '2FA verification failed' });
  }
}

/**
 * Logout user
 *
 * @param {Object} req - Express request (with user attached)
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
export async function logout(req, res) {
  try {
    // Log activity
    await ActivityLog.log({
      userId: req.user.id,
      action: 'USER_LOGOUT',
      description: 'User logged out',
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
}
