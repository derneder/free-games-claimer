/**
 * Games Routes
 *
 * API endpoints for game management.
 * Handles game listing, adding, and deletion.
 *
 * @module src/routes/games
 */

import { Router } from 'express';
import Joi from 'joi';
import * as gamesController from '../controllers/gamesController.js';
import { validate } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/error.js';
import { verifyToken } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiter for games routes: limit to 100 requests per 15 minutes per IP
const gamesRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route GET /api/games
 * @desc Get user's games with pagination
 * @access Private
 */
router.get(
  '/',
  verifyToken,
  gamesRateLimiter,
  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).optional(),
      pageSize: Joi.number().integer().min(1).max(100).default(20),
      source: Joi.string().optional(),
      sortBy: Joi.string().valid('claimedAt', 'title', 'price').default('claimedAt'),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    }),
  }),
  asyncHandler(gamesController.listGames)
);

/**
 * @route GET /api/games/:id
 * @desc Get game by ID
 * @access Private
 */
router.get(
  '/:id',
  verifyToken,
  gamesRateLimiter,
  validate({
    params: Joi.object({
      id: Joi.string().required(),
    }),
  }),
  asyncHandler(gamesController.getGame)
);

/**
 * @route POST /api/games
 * @desc Add new claimed game
 * @access Private
 */
router.post(
  '/',
  verifyToken,
  gamesRateLimiter,
  validate({
    body: Joi.object({
      title: Joi.string().required(),
      description: Joi.string().optional(),
      price: Joi.number().min(0).optional(),
      steamPrice: Joi.number().min(0).optional(),
      image: Joi.string().uri().optional(),
      platform: Joi.string().optional(),
      platforms: Joi.array().items(Joi.string()).optional(),
      source: Joi.string().optional(),
      sources: Joi.array().items(Joi.string()).optional(),
      url: Joi.string().uri().optional(),
      sourceUrl: Joi.string().uri().optional(),
      claimedAt: Joi.date().optional(),
      expiresAt: Joi.date().optional(),
    }),
  }),
  asyncHandler(gamesController.addGame)
);

/**
 * @route DELETE /api/games/:id
 * @desc Delete game
 * @access Private
 */
router.delete(
  '/:id',
  verifyToken,
  gamesRateLimiter,
  validate({
    params: Joi.object({
      id: Joi.string().required(),
    }),
  }),
  asyncHandler(gamesController.deleteGame)
);

/**
 * @route POST /api/games/import/bulk
 * @desc Bulk import games
 * @access Private
 */
router.post(
  '/import/bulk',
  verifyToken,
  gamesRateLimiter,
  validate({
    body: Joi.object({
      games: Joi.array()
        .items(
          Joi.object({
            title: Joi.string().required(),
            description: Joi.string().optional(),
            source: Joi.string().optional(),
            sourceUrl: Joi.string().uri().optional(),
            platform: Joi.string().optional(),
            steamPrice: Joi.number().min(0).optional(),
            price: Joi.number().min(0).optional(),
          })
        )
        .required(),
    }),
  }),
  asyncHandler(gamesController.bulkImport)
);

/**
 * @route GET /api/games/stats/summary
 * @desc Get games statistics
 * @access Private
 */
router.get('/stats/summary', verifyToken, gamesRateLimiter, asyncHandler(gamesController.getStats));

export default router;
