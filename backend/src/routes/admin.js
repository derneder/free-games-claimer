/**
 * Admin Routes
 *
 * API endpoints for admin operations.
 * Handles user management, system stats, and activity logs.
 *
 * @module src/routes/admin
 */

import { Router } from 'express';
import Joi from 'joi';
import * as adminController from '../controllers/adminController.js';
import { validate } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/error.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(verifyToken, requireAdmin);

/**
 * @route GET /api/admin/stats
 * @desc Get system statistics
 * @access Admin
 */
router.get(
  '/stats',
  asyncHandler(adminController.getSystemStats),
);

/**
 * @route GET /api/admin/users
 * @desc Get all users with pagination
 * @access Admin
 */
router.get(
  '/users',
  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      pageSize: Joi.number().integer().min(1).max(100).default(20),
      sortBy: Joi.string().valid('createdAt', 'email', 'username').default('createdAt'),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
      isActive: Joi.boolean().optional(),
    }),
  }),
  asyncHandler(adminController.listUsers),
);

/**
 * @route GET /api/admin/users/:userId
 * @desc Get user details
 * @access Admin
 */
router.get(
  '/users/:userId',
  validate({
    params: Joi.object({
      userId: Joi.string().uuid().required(),
    }),
  }),
  asyncHandler(adminController.getUser),
);

/**
 * @route POST /api/admin/users/:userId/deactivate
 * @desc Deactivate user account
 * @access Admin
 */
router.post(
  '/users/:userId/deactivate',
  validate({
    params: Joi.object({
      userId: Joi.string().uuid().required(),
    }),
  }),
  asyncHandler(adminController.deactivateUser),
);

/**
 * @route POST /api/admin/users/:userId/activate
 * @desc Activate user account
 * @access Admin
 */
router.post(
  '/users/:userId/activate',
  validate({
    params: Joi.object({
      userId: Joi.string().uuid().required(),
    }),
  }),
  asyncHandler(adminController.activateUser),
);

/**
 * @route GET /api/admin/activity-logs
 * @desc Get activity logs with pagination
 * @access Admin
 */
router.get(
  '/activity-logs',
  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      pageSize: Joi.number().integer().min(1).max(100).default(50),
      userId: Joi.string().uuid().optional(),
      action: Joi.string().optional(),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    }),
  }),
  asyncHandler(adminController.getActivityLogs),
);

/**
 * @route GET /api/admin/activity-logs/:userId
 * @desc Get user activity logs
 * @access Admin
 */
router.get(
  '/activity-logs/:userId',
  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      pageSize: Joi.number().integer().min(1).max(100).default(50),
    }),
    params: Joi.object({
      userId: Joi.string().uuid().required(),
    }),
  }),
  asyncHandler(adminController.getUserActivityLogs),
);

export default router;
