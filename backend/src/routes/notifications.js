/**
 * Notifications Routes
 * @route /api/notifications
 */

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const notificationsService = require('../services/notifications');
const { catchAsync } = require('../middleware/error');

/**
 * GET /api/notifications
 * Get user notifications
 */
router.get(
  '/',
  authenticate,
  catchAsync(async (req, res) => {
    const { page = 1, pageSize = 20 } = req.query;

    const result = await notificationsService.getUserNotifications(
      req.user.id,
      parseInt(page),
      parseInt(pageSize),
    );

    res.json({
      success: true,
      data: result.notifications,
      pagination: result.pagination,
    });
  }),
);

/**
 * GET /api/notifications/unread
 * Get unread notifications count
 */
router.get(
  '/unread/count',
  authenticate,
  catchAsync(async (req, res) => {
    const { Notification } = require('../models');

    const count = await Notification.count({
      where: {
        userId: req.user.id,
        read: false,
      },
    });

    res.json({
      success: true,
      unreadCount: count,
    });
  }),
);

/**
 * PATCH /api/notifications/:id/read
 * Mark notification as read
 */
router.patch(
  '/:id/read',
  authenticate,
  catchAsync(async (req, res) => {
    const notification = await notificationsService.markAsRead(req.params.id);

    res.json({
      success: true,
      data: notification,
    });
  }),
);

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 */
router.patch(
  '/read-all',
  authenticate,
  catchAsync(async (req, res) => {
    await notificationsService.markAllAsRead(req.user.id);

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  }),
);

/**
 * DELETE /api/notifications/:id
 * Delete notification
 */
router.delete(
  '/:id',
  authenticate,
  catchAsync(async (req, res) => {
    await notificationsService.deleteNotification(req.params.id);

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  }),
);

module.exports = router;
