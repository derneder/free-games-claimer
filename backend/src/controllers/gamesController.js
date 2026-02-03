/**
 * Games Controller
 *
 * Handles HTTP requests for games endpoints.
 * Processes game listing, claiming, and deletion.
 *
 * @module src/controllers/gamesController
 */

import { Game } from '../models/Game.js';
import { query } from '../config/database.js';
import * as gamesService from '../services/games.js';
import { AppError } from '../middleware/error.js';
import { formatSuccess, formatError, formatPaginated, formatGame } from '../utils/formatters.js';
import { logger } from '../config/logger.js';
import { isValidUUID } from '../utils/validators.js';

/**
 * List user's games
 *
 * @param {Object} req - Express request (with user attached)
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
export async function listGames(req, res) {
  try {
    const { page, pageSize } = req.query;

    const result = await gamesService.getUserGames(req.user.id, page, pageSize);

    res.json(formatPaginated(result.games.map(formatGame), page, pageSize, result.total));
  } catch (error) {
    logger.error('List games error:', error);
    res.status(500).json(formatError('INTERNAL_ERROR', 'Failed to list games'));
  }
}

/**
 * Get single game
 *
 * @param {Object} req - Express request (with user attached)
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
export async function getGame(req, res) {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json(formatError('INVALID_ID', 'Invalid game ID format'));
    }

    const game = await Game.findById(id);

    if (!game) {
      throw new AppError('Game not found', 404, 'GAME_NOT_FOUND');
    }

    if (game.userId !== req.user.id) {
      throw new AppError('Unauthorized to access this game', 403, 'FORBIDDEN');
    }

    res.json(formatSuccess(formatGame(game)));
  } catch (error) {
    logger.error('Get game error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(formatError(error.code, error.message));
    }
    res.status(500).json(formatError('INTERNAL_ERROR', 'Failed to get game'));
  }
}

/**
 * Add new game
 *
 * @param {Object} req - Express request (with user attached)
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
export async function addGame(req, res) {
  try {
    const gameData = req.body;

    const game = await gamesService.addGame(req.user.id, gameData);

    res.status(201).json(formatSuccess(formatGame(game), 'Game added successfully'));
  } catch (error) {
    logger.error('Add game error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(formatError(error.code, error.message));
    }
    res.status(500).json(formatError('INTERNAL_ERROR', 'Failed to add game'));
  }
}

/**
 * Delete game
 *
 * @param {Object} req - Express request (with user attached)
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
export async function deleteGame(req, res) {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json(formatError('INVALID_ID', 'Invalid game ID format'));
    }

    await gamesService.deleteGame(req.user.id, id);

    res.json(formatSuccess({ message: 'Game deleted successfully' }, 'Game removed'));
  } catch (error) {
    logger.error('Delete game error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json(formatError(error.code, error.message));
    }
    res.status(500).json(formatError('INTERNAL_ERROR', 'Failed to delete game'));
  }
}

/**
 * Get games statistics
 *
 * @param {Object} req - Express request (with user attached)
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
export async function getStats(req, res) {
  try {
    const userId = req.user.id;

    // Get total games
    const gamesResult = await query(
      'SELECT COUNT(*) as total, SUM(price) as totalValue FROM games WHERE userId = $1',
      [userId]
    );

    const stats = gamesResult.rows[0];

    // Get games by platform
    const platformsResult = await query(
      `SELECT 
        jsonb_array_elements(platforms)::text as platform, 
        COUNT(*) as count 
       FROM games 
       WHERE userId = $1 
       GROUP BY platform`,
      [userId]
    );

    // Get games by source
    const sourcesResult = await query(
      `SELECT 
        jsonb_array_elements(sources)::text as source, 
        COUNT(*) as count 
       FROM games 
       WHERE userId = $1 
       GROUP BY source`,
      [userId]
    );

    res.json(
      formatSuccess({
        totalGames: parseInt(stats.total, 10),
        totalValue: parseFloat(stats.totalValue) || 0,
        platforms: platformsResult.rows,
        sources: sourcesResult.rows,
      })
    );
  } catch (error) {
    logger.error('Get stats error:', error);
    res.status(500).json(formatError('INTERNAL_ERROR', 'Failed to get statistics'));
  }
}
