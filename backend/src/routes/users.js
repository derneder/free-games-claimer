/**
 * Users Routes
 * 
 * API endpoints for user management.
 * Handles profile updates and user settings.
 * 
 * @module src/routes/users
 */

import { Router } from 'express';
import Joi from 'joi';
import * as usersController from '../controllers/usersController.js';
import { validate } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/error.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(verifyToken);

/**
 * @route GET /api/users/profile
 * @desc Get current user profile
 * @access Private
 */
router.get(
  '/profile',
  asyncHandler(usersController.getProfile)
);

/**
 * @route PUT /api/users/profile
 * @desc Update user profile
 * @access Private
 */
router.put(
  '/profile',
  validate({
    body: Joi.object({
      username: Joi.string().min(3).max(30).optional(),
      email: Joi.string().email().optional(),
    }).min(1),
  }),
  asyncHandler(usersController.updateProfile)
);

/**
 * @route POST /api/users/change-password
 * @desc Change user password
 * @access Private
 */
router.post(
  '/change-password',
  validate({
    body: Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().min(8).required(),
      confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
    }),
  }),
  asyncHandler(usersController.changePassword)
);

/**
 * @route DELETE /api/users/account
 * @desc Delete user account
 * @access Private
 */
router.delete(
  '/account',
  validate({
    body: Joi.object({
      password: Joi.string().required(),
    }),
  }),
  asyncHandler(usersController.deleteAccount)
);

export default router;
