/**
 * ActivityLog Model
 *
 * Represents user activity for audit trail.
 * Logs all important actions in the system.
 *
 * @module src/models/ActivityLog
 */

import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';

/**
 * ActivityLog model class
 */
export class ActivityLog {
  /**
   * Constructor
   *
   * @param {Object} data - Activity log data
   */
  constructor(data) {
    this.id = data.id || uuidv4();
    this.userId = data.userId;
    this.action = data.action;
    this.description = data.description || null;
    this.resourceType = data.resourceType || null;
    this.resourceId = data.resourceId || null;
    this.ipAddress = data.ipAddress || null;
    this.userAgent = data.userAgent || null;
    this.createdAt = data.createdAt || new Date();
  }

  /**
   * Log an activity
   *
   * @param {Object} data - Activity data
   * @returns {Promise<ActivityLog>} Created activity log
   */
  static async log(data) {
    const log = new ActivityLog(data);

    await query(
      'INSERT INTO activityLogs (id, userId, action, description, resourceType, resourceId, ipAddress, userAgent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        log.id,
        log.userId,
        log.action,
        log.description,
        log.resourceType,
        log.resourceId,
        log.ipAddress,
        log.userAgent,
      ],
    );

    return log;
  }

  /**
   * Get user activity
   *
   * @param {string} userId - User ID
   * @param {number} page - Page number
   * @param {number} pageSize - Items per page
   * @returns {Promise<Object>} Activity logs and total count
   */
  static async getUserActivity(userId, page = 1, pageSize = 50) {
    const offset = (page - 1) * pageSize;
    const result = await query(
      'SELECT * FROM activityLogs WHERE userId = $1 ORDER BY createdAt DESC LIMIT $2 OFFSET $3',
      [userId, pageSize, offset],
    );
    const countResult = await query(
      'SELECT COUNT(*) FROM activityLogs WHERE userId = $1',
      [userId],
    );
    return {
      logs: result.rows.map((row) => new ActivityLog(row)),
      total: parseInt(countResult.rows[0].count, 10),
    };
  }
}
