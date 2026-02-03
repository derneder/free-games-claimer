/**
 * Analytics Routes
 * @route /api/analytics
 */

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const analyticsService = require('../services/analytics');
const { catchAsync } = require('../middleware/error');

/**
 * GET /api/analytics/system
 * Get system analytics (admin only)
 */
router.get(
  '/system',
  authenticate,
  authorize('admin'),
  catchAsync(async (req, res) => {
    const stats = await analyticsService.getSystemStats();
    res.json({ success: true, data: stats });
  })
);

/**
 * GET /api/analytics/user
 * Get user analytics
 */
router.get(
  '/user',
  authenticate,
  catchAsync(async (req, res) => {
    const analytics = await analyticsService.getUserAnalytics(req.user.id);
    res.json({ success: true, data: analytics });
  })
);

/**
 * GET /api/analytics/performance
 * Get performance metrics (admin only)
 */
router.get(
  '/performance',
  authenticate,
  authorize('admin'),
  catchAsync(async (req, res) => {
    const metrics = await analyticsService.getPerformanceMetrics();
    res.json({ success: true, data: metrics });
  })
);

module.exports = router;
