/**
 * Users Controller
 *
 * Handles HTTP requests for user management endpoints.
 * Processes profile updates and account settings.
 *
 * @module src/controllers/usersController
 */

import { User } from '../models/User.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { AppError } from '../middleware/error.js';
import { formatSuccess, formatError } from '../utils/formatters.js';
import { logger } from '../config/logger.js';
import { hashPassword } from '../utils/crypto.js';
import { isValidEmail } from '../utils/validators.js';

/**
 * Get user profile
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

    res.json(
      formatSuccess({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        twoFaEnabled: user.twoFaEnabled,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
    );
  } catch (error) {
    logger.error('Get profile error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(formatError(error.code, error.message));
    }
    res.status(500).json(formatError('INTERNAL_ERROR', 'Failed to get profile'));
  }
}

/**
 * Update user profile
 *
 * @param {Object} req - Express request (with user attached)
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
export async function updateProfile(req, res) {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Validate email if provided
    if (email && email !== user.email) {
      if (!isValidEmail(email)) {
        throw new AppError('Invalid email format', 400, 'INVALID_EMAIL');
      }

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw new AppError('Email already in use', 409, 'EMAIL_EXISTS');
      }

      user.email = email;
    }

    // Update username if provided
    if (username && username !== user.username) {
      if (username.length < 3) {
        throw new AppError('Username must be at least 3 characters', 400, 'INVALID_USERNAME');
      }
      user.username = username;
    }

    await user.save();

    // Log activity
    await ActivityLog.log({
      userId: user.id,
      action: 'PROFILE_UPDATED',
      description: 'User updated profile',
    });

    res.json(
      formatSuccess(
        {
          id: user.id,
          email: user.email,
          username: user.username,
          updatedAt: user.updatedAt,
        },
        'Profile updated successfully'
      )
    );
  } catch (error) {
    logger.error('Update profile error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(formatError(error.code, error.message));
    }
    res.status(500).json(formatError('INTERNAL_ERROR', 'Failed to update profile'));
  }
}

/**
 * Change user password
 *
 * @param {Object} req - Express request (with user attached)
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Verify current password
    const isValid = await user.verifyPassword(currentPassword);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 401, 'INVALID_PASSWORD');
    }

    // Hash and update new password
    user.password = await hashPassword(newPassword);
    await user.save();

    // Log activity
    await ActivityLog.log({
      userId: user.id,
      action: 'PASSWORD_CHANGED',
      description: 'User changed password',
    });

    res.json(formatSuccess({ message: 'Password changed successfully' }, 'Password updated'));
  } catch (error) {
    logger.error('Change password error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(formatError(error.code, error.message));
    }
    res.status(500).json(formatError('INTERNAL_ERROR', 'Failed to change password'));
  }
}

/**
 * Delete user account
 *
 * @param {Object} req - Express request (with user attached)
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
export async function deleteAccount(req, res) {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Verify password
    const isValid = await user.verifyPassword(password);
    if (!isValid) {
      throw new AppError('Password is incorrect', 401, 'INVALID_PASSWORD');
    }

    // Mark as inactive instead of deleting
    user.isActive = false;
    await user.save();

    // Log activity
    await ActivityLog.log({
      userId: user.id,
      action: 'ACCOUNT_DELETED',
      description: 'User deleted account',
    });

    res.json(formatSuccess({ message: 'Account deleted successfully' }, 'Account deactivated'));
  } catch (error) {
    logger.error('Delete account error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(formatError(error.code, error.message));
    }
    res.status(500).json(formatError('INTERNAL_ERROR', 'Failed to delete account'));
  }
}
