/**
 * Authentication Routes
 *
 * API endpoints for user authentication.
 * Handles registration, login, token refresh, and 2FA.
 *
 * @module src/routes/auth
 */

import { Router } from 'express';
import Joi from 'joi';
import * as authController from '../controllers/authController.js';
import { validate } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/error.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

/**
 * @route POST /api/auth/register
 * @desc Register new user
 * @access Public
 */
router.post(
  '/register',
  validate({
    body: Joi.object({
      email: Joi.string().email().required(),
      username: Joi.string().min(3).max(30).required(),
      password: Joi.string().min(8).required(),
    }),
  }),
  asyncHandler(authController.register),
);

/**
 * @route POST /api/auth/login
 * @desc User login
 * @access Public
 */
router.post(
  '/login',
  validate({
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
  asyncHandler(authController.login),
);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token
 * @access Public
 */
router.post(
  '/refresh',
  validate({
    body: Joi.object({
      refreshToken: Joi.string().required(),
    }),
  }),
  asyncHandler(authController.refreshToken),
);

/**
 * @route GET /api/auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', verifyToken, asyncHandler(authController.getProfile));

/**
 * @route POST /api/auth/2fa/setup
 * @desc Setup two-factor authentication
 * @access Private
 */
router.post('/2fa/setup', verifyToken, asyncHandler(authController.setup2FA));

/**
 * @route POST /api/auth/2fa/verify
 * @desc Verify 2FA token
 * @access Private
 */
router.post(
  '/2fa/verify',
  verifyToken,
  validate({
    body: Joi.object({
      token: Joi.string().length(6).required(),
    }),
  }),
  asyncHandler(authController.verify2FA),
);

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', verifyToken, asyncHandler(authController.logout));

export default router;
