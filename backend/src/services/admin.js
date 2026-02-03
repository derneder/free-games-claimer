/**
 * Admin Service
 *
 * Business logic for admin operations.
 * Handles user management and system statistics.
 *
 * @module src/services/admin
 */

import { User } from '../models/User.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { query } from '../config/database.js';

/**
 * Get system statistics
 *
 * @returns {Promise<Object>} System stats
 */
export async function getSystemStats() {
  const usersResult = await query('SELECT COUNT(*) FROM users');
  const gamesResult = await query('SELECT COUNT(*) FROM games');
  const activitiesResult = await query('SELECT COUNT(*) FROM activityLogs');

  return {
    totalUsers: parseInt(usersResult.rows[0].count, 10),
    totalGames: parseInt(gamesResult.rows[0].count, 10),
    totalActivities: parseInt(activitiesResult.rows[0].count, 10),
  };
}

/**
 * Get all users
 *
 * @param {number} page - Page number
 * @param {number} pageSize - Items per page
 * @returns {Promise<Object>} Users and pagination
 */
export async function listAllUsers(page = 1, pageSize = 20) {
  return User.list(page, pageSize);
}

/**
 * Deactivate user
 *
 * @param {string} userId - User ID to deactivate
 * @returns {Promise<void>}
 */
export async function deactivateUser(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  user.isActive = false;
  await user.save();

  // Log activity
  await ActivityLog.log({
    userId,
    action: 'ACCOUNT_DEACTIVATED',
    description: 'Account deactivated',
  });
}

/**
 * Get activity logs
 *
 * @param {number} page - Page number
 * @param {number} pageSize - Items per page
 * @returns {Promise<Object>} Activity logs
 */
export async function getActivityLogs(page = 1, pageSize = 50) {
  const offset = (page - 1) * pageSize;
  const result = await query(
    'SELECT * FROM activityLogs ORDER BY createdAt DESC LIMIT $1 OFFSET $2',
    [pageSize, offset]
  );
  const countResult = await query('SELECT COUNT(*) FROM activityLogs');

  return {
    logs: result.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
}
