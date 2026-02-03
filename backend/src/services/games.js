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
 * @returns {Promise<Object>} Games and pagination info
 */
export async function getUserGames(userId, page = 1, pageSize = 20) {
  return Game.listByUser(userId, page, pageSize);
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
