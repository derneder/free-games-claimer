/**
 * Games Service
 *
 * Business logic for game management.
 * Handles game claiming, listing, and deletion.
 *
 * @module src/services/games
 */

import { Game } from '../models/Game.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { AppError } from '../middleware/error.js';
import { logger } from '../config/logger.js';

/**
 * Add game to user library
 *
 * @param {string} userId - User ID
 * @param {Object} gameData - Game data
 * @returns {Promise<Game>} Created game
 * @throws {AppError} If validation fails
 */
export async function addGame(userId, gameData) {
  if (!gameData.title) {
    throw new AppError('Game title is required', 400, 'INVALID_GAME');
  }

  // Check if game already exists in user's library
  const existingGame = await Game.findByUserAndTitle(userId, gameData.title, gameData.source);
  if (existingGame) {
    throw new AppError('Game already in library', 400, 'GAME_EXISTS');
  }

  const game = await Game.create({
    ...gameData,
    userId,
  });

  // Log activity
  await ActivityLog.log({
    userId,
    action: 'GAME_CLAIMED',
    description: `Game claimed: ${gameData.title}`,
    resourceType: 'game',
    resourceId: game.id,
  });

  return game;
}

/**
 * Get user's games
 *
 * @param {string} userId - User ID
 * @param {number} page - Page number
 * @param {number} pageSize - Items per page
 * @param {Object} filters - Filter options (e.g., { source: 'epic' })
 * @returns {Promise<Object>} Games and pagination info
 */
export async function getUserGames(userId, page = 1, pageSize = 20, filters = {}) {
  return Game.listByUser(userId, page, pageSize, filters);
}

/**
 * Delete game
 *
 * @param {string} userId - User ID
 * @param {string} gameId - Game ID
 * @throws {AppError} If game not found or unauthorized
 */
export async function deleteGame(userId, gameId) {
  const game = await Game.findById(gameId);

  if (!game) {
    throw new AppError('Game not found', 404, 'GAME_NOT_FOUND');
  }

  if (game.userId !== userId) {
    throw new AppError('Unauthorized', 403, 'FORBIDDEN');
  }

  await game.delete();

  // Log activity
  await ActivityLog.log({
    userId,
    action: 'GAME_DELETED',
    description: `Game deleted: ${game.title}`,
    resourceType: 'game',
    resourceId: gameId,
  });
}

/**
 * Bulk import games
 *
 * @param {string} userId - User ID
 * @param {Array} gamesData - Array of game data
 * @returns {Promise<Object>} Imported games and count
 * @throws {AppError} If validation fails
 */
export async function bulkImportGames(userId, gamesData) {
  if (!Array.isArray(gamesData) || gamesData.length === 0) {
    throw new AppError('Games array is required and must not be empty', 400, 'INVALID_INPUT');
  }

  const importedGames = [];

  for (const gameData of gamesData) {
    if (!gameData.title) {
      continue; // Skip games without title
    }

    try {
      const game = await Game.create({
        ...gameData,
        userId,
      });
      importedGames.push(game);
    } catch (error) {
      // Log but continue with other games
      logger.error(`Failed to import game ${gameData.title}:`, error);
    }
  }

  // Log activity
  await ActivityLog.log({
    userId,
    action: 'GAMES_BULK_IMPORTED',
    description: `Bulk import: ${importedGames.length} games`,
  });

  return {
    games: importedGames,
    count: importedGames.length,
  };
}
