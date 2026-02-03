/**
 * Game Model
 *
 * Represents a claimed game.
 * Handles game data structure and database operations.
 *
 * @module src/models/Game
 */

import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';

/**
 * Game model class
 */
export class Game {
  /**
   * Constructor
   *
   * @param {Object} data - Game data
   */
  constructor(data) {
    this.id = data.id || uuidv4();
    this.userId = data.userId;
    this.title = data.title;
    this.description = data.description || null;
    this.image = data.image || null;
    this.price = data.price || 0;
    this.platforms = data.platforms || [];
    this.sources = data.sources || [];
    this.claimedAt = data.claimedAt || new Date();
    this.expiresAt = data.expiresAt || null;
    this.url = data.url || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Create new game
   *
   * @param {Object} gameData - Game data
   * @returns {Promise<Game>} Created game
   */
  static async create(gameData) {
    const game = new Game(gameData);

    await query(
      'INSERT INTO games (id, userId, title, description, image, price, platforms, sources, claimedAt, expiresAt, url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
      [
        game.id,
        game.userId,
        game.title,
        game.description,
        game.image,
        game.price,
        JSON.stringify(game.platforms),
        JSON.stringify(game.sources),
        game.claimedAt,
        game.expiresAt,
        game.url,
      ]
    );

    return game;
  }

  /**
   * Find game by ID
   *
   * @param {string} id - Game ID
   * @returns {Promise<Game|null>} Game object or null
   */
  static async findById(id) {
    const result = await query('SELECT * FROM games WHERE id = $1', [id]);
    return result.rows[0] ? new Game(result.rows[0]) : null;
  }

  /**
   * List games for user with pagination
   *
   * @param {string} userId - User ID
   * @param {number} page - Page number
   * @param {number} pageSize - Items per page
   * @returns {Promise<Object>} Games and total count
   */
  static async listByUser(userId, page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;
    const result = await query(
      'SELECT * FROM games WHERE userId = $1 ORDER BY claimedAt DESC LIMIT $2 OFFSET $3',
      [userId, pageSize, offset]
    );
    const countResult = await query('SELECT COUNT(*) FROM games WHERE userId = $1', [userId]);
    return {
      games: result.rows.map((row) => new Game(row)),
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  /**
   * Delete game
   *
   * @returns {Promise<void>}
   */
  async delete() {
    await query('DELETE FROM games WHERE id = $1', [this.id]);
  }
}
