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
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/authController.js';
import { validate } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/error.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// Rate limiting for authentication routes
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs for public auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
});

const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // tighter limit for sensitive operations like login and 2FA
  standardHeaders: true,
  legacyHeaders: false,
});

const twoFARateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // stricter limit for 2FA-related operations
  standardHeaders: true,
  legacyHeaders: false,
});

const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // allow more frequent profile access but still bounded
  standardHeaders: true,
  legacyHeaders: false,
});

const logoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 logout requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route POST /api/auth/register
 * @desc Register new user
 * @access Public
 */
router.post(
  '/register',
  authRateLimiter,
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
  strictAuthLimiter,
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
  authRateLimiter,
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
router.get('/profile', profileLimiter, verifyToken, asyncHandler(authController.getProfile));

/**
 * @route POST /api/auth/2fa/setup
 * @desc Setup two-factor authentication
 * @access Private
 */
router.post('/2fa/setup', twoFARateLimiter, verifyToken, asyncHandler(authController.setup2FA));

/**
 * @route POST /api/auth/2fa/verify
 * @desc Verify 2FA token
 * @access Private
 */
router.post(
  '/2fa/verify',
  twoFARateLimiter,
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
router.post('/logout', logoutLimiter, verifyToken, asyncHandler(authController.logout));

export default router;
