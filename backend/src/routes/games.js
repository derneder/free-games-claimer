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

const router = Router();

/**
 * @route GET /api/games
 * @desc Get user's games with pagination
 * @access Private
 */
router.get(
  '/',
  verifyToken,
  validate({
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      pageSize: Joi.number().integer().min(1).max(100).default(20),
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
  validate({
    params: Joi.object({
      id: Joi.string().uuid().required(),
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
  validate({
    body: Joi.object({
      title: Joi.string().required(),
      description: Joi.string().optional(),
      price: Joi.number().min(0).required(),
      image: Joi.string().uri().optional(),
      platforms: Joi.array().items(Joi.string()).optional(),
      sources: Joi.array().items(Joi.string()).optional(),
      url: Joi.string().uri().optional(),
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
  validate({
    params: Joi.object({
      id: Joi.string().uuid().required(),
    }),
  }),
  asyncHandler(gamesController.deleteGame)
);

/**
 * @route GET /api/games/stats/summary
 * @desc Get games statistics
 * @access Private
 */
router.get(
  '/stats/summary',
  verifyToken,
  asyncHandler(gamesController.getStats)
);

export default router;
