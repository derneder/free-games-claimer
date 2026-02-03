/**
 * Admin Controller
 * 
 * Handles HTTP requests for admin endpoints.
 * Manages users, system stats, and activity logs.
 * 
 * @module src/controllers/adminController
 */

import { User } from '../models/User.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { query } from '../config/database.js';
import * as adminService from '../services/admin.js';
import { AppError } from '../middleware/error.js';
import { formatSuccess, formatError, formatPaginated } from '../utils/formatters.js';
import { logger } from '../config/logger.js';
import { isValidUUID } from '../utils/validators.js';

/**
 * Get system statistics
 * 
 * @param {Object} req - Express request (with admin user attached)
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
export async function getSystemStats(req, res) {
  try {
    const stats = await adminService.getSystemStats();

    res.json(
      formatSuccess(
        {
          ...stats,
          timestamp: new Date().toISOString(),
        },
        'System statistics retrieved'
      )
    );
  } catch (error) {
    logger.error('Get system stats error:', error);
    res.status(500).json(formatError('INTERNAL_ERROR', 'Failed to get system statistics'));
  }
}

/**
 * List all users
 * 
 * @param {Object} req - Express request (with admin user attached)
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
export async function listUsers(req, res) {
  try {
    const { page, pageSize, isActive } = req.query;

    let sql = 'SELECT * FROM users';
    const params = [];

    if (isActive !== undefined) {
      sql += ` WHERE isActive = $${params.length + 1}`;
      params.push(isActive);
    }

    sql += ` ORDER BY createdAt DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(pageSize, (page - 1) * pageSize);

    const result = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) FROM users';
    const countParams = [];
    if (isActive !== undefined) {
      countSql += ` WHERE isActive = $1`;
      countParams.push(isActive);
    }
    const countResult = await query(countSql, countParams);

    const users = result.rows.map((user) => ({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      isActive: user.isActive,
      twoFaEnabled: user.twoFaEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    res.json(
      formatPaginated(
        users,
        page,
        pageSize,
        parseInt(countResult.rows[0].count, 10)
      )
    );
  } catch (error) {
    logger.error('List users error:', error);
    res.status(500).json(formatError('INTERNAL_ERROR', 'Failed to list users'));
  }
}

/**
 * Get user details
 * 
 * @param {Object} req - Express request (with admin user attached)
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
export async function getUser(req, res) {
  try {
    const { userId } = req.params;

    if (!isValidUUID(userId)) {
      return res.status(400).json(formatError('INVALID_ID', 'Invalid user ID format'));
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.json(
      formatSuccess({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        twoFaEnabled: user.twoFaEnabled,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
    );
  } catch (error) {
    logger.error('Get user error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(formatError(error.code, error.message));
    }
    res.status(500).json(formatError('INTERNAL_ERROR', 'Failed to get user'));
  }
}

/**
 * Deactivate user account
 * 
 * @param {Object} req - Express request (with admin user attached)
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
export async function deactivateUser(req, res) {
  try {
    const { userId } = req.params;

    if (!isValidUUID(userId)) {
      return res.status(400).json(formatError('INVALID_ID', 'Invalid user ID format'));
    }

    if (userId === req.user.id) {
      throw new AppError('Cannot deactivate your own account', 400, 'INVALID_ACTION');
    }

    await adminService.deactivateUser(userId);

    // Log admin action
    await ActivityLog.log({
      userId: req.user.id,
      action: 'ADMIN_DEACTIVATE_USER',
      description: `Admin deactivated user: ${userId}`,
      resourceType: 'user',
      resourceId: userId,
    });

    res.json(
      formatSuccess(
        { message: 'User account deactivated' },
        'User deactivated successfully'
      )
    );
  } catch (error) {
    logger.error('Deactivate user error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(formatError(error.code, error.message));
    }
    res.status(500).json(formatError('INTERNAL_ERROR', 'Failed to deactivate user'));
  }
}

/**
 * Activate user account
 * 
 * @param {Object} req - Express request (with admin user attached)
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
export async function activateUser(req, res) {
  try {
    const { userId } = req.params;

    if (!isValidUUID(userId)) {
      return res.status(400).json(formatError('INVALID_ID', 'Invalid user ID format'));
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    user.isActive = true;
    await user.save();

    // Log admin action
    await ActivityLog.log({
      userId: req.user.id,
      action: 'ADMIN_ACTIVATE_USER',
      description: `Admin activated user: ${userId}`,
      resourceType: 'user',
      resourceId: userId,
    });

    res.json(
      formatSuccess(
        { message: 'User account activated' },
        'User activated successfully'
      )
    );
  } catch (error) {
    logger.error('Activate user error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(formatError(error.code, error.message));
    }
    res.status(500).json(formatError('INTERNAL_ERROR', 'Failed to activate user'));
  }
}

/**
 * Get activity logs
 * 
 * @param {Object} req - Express request (with admin user attached)
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
export async function getActivityLogs(req, res) {
  try {
    const { page, pageSize, userId, action } = req.query;

    let sql = 'SELECT * FROM activityLogs';
    const params = [];
    const conditions = [];

    if (userId) {
      conditions.push(`userId = $${params.length + 1}`);
      params.push(userId);
    }

    if (action) {
      conditions.push(`action = $${params.length + 1}`);
      params.push(action);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    sql += ` ORDER BY createdAt DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(pageSize, (page - 1) * pageSize);

    const result = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) FROM activityLogs';
    if (conditions.length > 0) {
      countSql += ` WHERE ${conditions.slice(0, conditions.length).join(' AND ')}`;
    }
    const countParams = params.slice(0, params.length - 2);
    const countResult = await query(countSql, countParams);

    res.json(
      formatPaginated(
        result.rows,
        page,
        pageSize,
        parseInt(countResult.rows[0].count, 10)
      )
    );
  } catch (error) {
    logger.error('Get activity logs error:', error);
    res.status(500).json(formatError('INTERNAL_ERROR', 'Failed to get activity logs'));
  }
}

/**
 * Get user activity logs
 * 
 * @param {Object} req - Express request (with admin user attached)
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
export async function getUserActivityLogs(req, res) {
  try {
    const { userId } = req.params;
    const { page, pageSize } = req.query;

    if (!isValidUUID(userId)) {
      return res.status(400).json(formatError('INVALID_ID', 'Invalid user ID format'));
    }

    const result = await ActivityLog.getUserActivity(userId, page, pageSize);

    res.json(
      formatPaginated(result.logs, page, pageSize, result.total)
    );
  } catch (error) {
    logger.error('Get user activity logs error:', error);
    res.status(500).json(formatError('INTERNAL_ERROR', 'Failed to get user activity logs'));
  }
}
