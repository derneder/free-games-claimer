/**
 * Analytics Service
 * Handles analytics and statistics
 */

const db = require('../config/database');
const logger = require('../config/logger');

/**
 * Get system statistics
 * @returns {Promise<object>}
 */
async function getSystemStats() {
  try {
    const stats = {};

    // Total users
    const usersResult = await db.query('SELECT COUNT(*) as count FROM users');
    stats.totalUsers = parseInt(usersResult.rows[0].count);

    // Active users (last 7 days)
    const activeResult = await db.query(`
      SELECT COUNT(DISTINCT user_id) as count FROM activity_logs
      WHERE created_at > NOW() - INTERVAL '7 days'
    `);
    stats.activeUsers = parseInt(activeResult.rows[0].count);

    // Total games
    const gamesResult = await db.query('SELECT COUNT(*) as count FROM games');
    stats.totalGames = parseInt(gamesResult.rows[0].count);

    // Total game value
    const valueResult = await db.query('SELECT SUM(price) as total FROM games');
    stats.totalValue = parseFloat(valueResult.rows[0].total) || 0;

    // Games this month
    const monthResult = await db.query(`
      SELECT COUNT(*) as count FROM games
      WHERE created_at > NOW() - INTERVAL '30 days'
    `);
    stats.gamesThisMonth = parseInt(monthResult.rows[0].count);

    // Average games per user
    stats.avgGamesPerUser =
      stats.totalUsers > 0 ? (stats.totalGames / stats.totalUsers).toFixed(2) : 0;

    logger.info('System statistics calculated');
    return stats;
  } catch (error) {
    logger.error(`Failed to get system statistics: ${error.message}`);
    throw error;
  }
}

/**
 * Get user analytics
 * @param {string} userId - User ID
 * @returns {Promise<object>}
 */
async function getUserAnalytics(userId) {
  try {
    const analytics = {};

    // Total games claimed
    const gamesResult = await db.query('SELECT COUNT(*) as count FROM games WHERE user_id = $1', [
      userId,
    ]);
    analytics.totalGames = parseInt(gamesResult.rows[0].count);

    // Total value
    const valueResult = await db.query('SELECT SUM(price) as total FROM games WHERE user_id = $1', [
      userId,
    ]);
    analytics.totalValue = parseFloat(valueResult.rows[0].total) || 0;

    // Games claimed this month
    const monthResult = await db.query(
      `
      SELECT COUNT(*) as count FROM games
      WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'
    `,
      [userId],
    );
    analytics.gamesThisMonth = parseInt(monthResult.rows[0].count);

    // Most used platform
    const platformResult = await db.query(
      `
      SELECT jsonb_array_elements(platforms) as platform,
             COUNT(*) as count
      FROM games WHERE user_id = $1
      GROUP BY platform
      ORDER BY count DESC LIMIT 1
    `,
      [userId],
    );
    analytics.mostUsedPlatform = platformResult.rows[0]?.platform || 'N/A';

    // Most used source
    const sourceResult = await db.query(
      `
      SELECT jsonb_array_elements(sources) as source,
             COUNT(*) as count
      FROM games WHERE user_id = $1
      GROUP BY source
      ORDER BY count DESC LIMIT 1
    `,
      [userId],
    );
    analytics.mostUsedSource = sourceResult.rows[0]?.source || 'N/A';

    // Activity streak
    const streakResult = await db.query(
      `
      SELECT COUNT(DISTINCT DATE(created_at)) as days
      FROM activity_logs
      WHERE user_id = $1
      AND created_at > NOW() - INTERVAL '30 days'
    `,
      [userId],
    );
    analytics.activityDays = parseInt(streakResult.rows[0].days);

    logger.info(`User analytics calculated for ${userId}`);
    return analytics;
  } catch (error) {
    logger.error(`Failed to get user analytics: ${error.message}`);
    throw error;
  }
}

/**
 * Get performance metrics
 * @returns {Promise<object>}
 */
async function getPerformanceMetrics() {
  try {
    const metrics = {
      apiResponseTimes: [],
      requestCounts: [],
      errorRates: [],
      cacheHitRates: [],
    };

    // Query performance data from logs
    const responseTimeResult = await db.query(`
      SELECT AVG(duration) as avg_time, MAX(duration) as max_time
      FROM api_logs
      WHERE created_at > NOW() - INTERVAL '1 hour'
    `);

    if (responseTimeResult.rows[0]) {
      metrics.avgResponseTime = parseFloat(responseTimeResult.rows[0].avg_time) || 0;
      metrics.maxResponseTime = parseFloat(responseTimeResult.rows[0].max_time) || 0;
    }

    // Error rate
    const errorResult = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status >= 400 THEN 1 ELSE 0 END) as errors
      FROM api_logs
      WHERE created_at > NOW() - INTERVAL '1 hour'
    `);

    if (errorResult.rows[0].total > 0) {
      metrics.errorRate = ((errorResult.rows[0].errors / errorResult.rows[0].total) * 100).toFixed(
        2,
      );
    }

    logger.info('Performance metrics calculated');
    return metrics;
  } catch (error) {
    logger.error(`Failed to get performance metrics: ${error.message}`);
    throw error;
  }
}

module.exports = {
  getSystemStats,
  getUserAnalytics,
  getPerformanceMetrics,
};
