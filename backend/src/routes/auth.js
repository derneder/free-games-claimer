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
const logoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 logout requests per windowMs
});


// Rate limiter for authentication-related endpoints to mitigate abuse/DoS
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per window for auth routes
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const router = Router();
// Rate limiting for authentication routes
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs for public auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
});

const twoFARateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // stricter limit for 2FA-related operations
  standardHeaders: true,
  legacyHeaders: false,
});


// Rate limiters for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 auth requests per windowMs
});

  authRateLimiter,
const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // tighter limit for sensitive operations like login and 2FA
});

const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // allow more frequent profile access but still bounded
});

/**
 * @route POST /api/auth/register
 * @desc Register new user
 * @access Public
 */
router.post(
  '/register',
  authRateLimiter,
  authLimiter,
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
  authRateLimiter,
router.post(
router.post('/2fa/setup', authLimiter, verifyToken, asyncHandler(authController.setup2FA));
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
router.post('/logout', logoutLimiter, verifyToken, asyncHandler(authController.logout));
 */
router.post(
  '/refresh',
  authLimiter,
router.post(
  '/2fa/setup',
  twoFARateLimiter,
  verifyToken,
  asyncHandler(authController.setup2FA),
);
    body: Joi.object({
      refreshToken: Joi.string().required(),
    }),
  }),
  asyncHandler(authController.refreshToken),
);

/**
  twoFARateLimiter,
 * @route GET /api/auth/profile
 * @desc Get current user profile
 * @access Private
 */
router.get(
  '/profile',
  profileLimiter,
  verifyToken,
  asyncHandler(authController.getProfile),
);

/**
 * @route POST /api/auth/2fa/setup
 * @desc Setup two-factor authentication
 * @access Private
 */
router.post(
  '/2fa/setup',
  authLimiter,
  verifyToken,
  asyncHandler(authController.setup2FA),
);

/**
  strictAuthLimiter,
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
router.post(
  '/logout',
  authLimiter,
  verifyToken,
  asyncHandler(authController.logout),
);

export default router;
