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
    const { page = 1, limit = 20, source } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const result = await gamesService.getUserGames(
      req.user.id,
      pageNum,
      limitNum,
      source ? { source } : {}
    );

    const totalPages = Math.ceil(result.total / limitNum);
    res.json({
      games: result.games,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: result.total,
        pages: totalPages,
      },
    });
  } catch (error) {
    logger.error('List games error:', error);
    res.status(500).json({ error: 'Failed to list games' });
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
      return res.status(404).json({ error: 'Game not found' });
    }

    const game = await Game.findById(id);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to access this game' });
    }

    res.json({ game });
  } catch (error) {
    logger.error('Get game error:', error);
    res.status(500).json({ error: 'Failed to get game' });
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

    res.status(201).json({ game });
  } catch (error) {
    logger.error('Add game error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to add game' });
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
      return res.status(400).json({ error: 'Invalid game ID format' });
    }

    await gamesService.deleteGame(req.user.id, id);

    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    logger.error('Delete game error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete game' });
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

    res.json({
      totalGames: parseInt(stats.total, 10),
      totalValue: parseFloat(stats.totalValue) || 0,
      platforms: platformsResult.rows,
      sources: sourcesResult.rows,
    });
  } catch (error) {
    logger.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
}

/**
 * Bulk import games
 *
 * @param {Object} req - Express request (with user attached)
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
export async function bulkImport(req, res) {
  try {
    const { games } = req.body;

    const result = await gamesService.bulkImportGames(req.user.id, games);

    res.status(201).json(result);
  } catch (error) {
    logger.error('Bulk import error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to import games' });
  }
}
