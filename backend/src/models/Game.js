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
    // Handle both camelCase and lowercase column names from database
    this.userId = data.userId || data.userid || data.user_id;
    this.user_id = data.userId || data.userid || data.user_id; // Alias for compatibility
    this.title = data.title;
    this.description = data.description || null;
    this.image = data.image || null;
    this.price = data.price || data.steamprice || data.steamPrice || 0;

    // Handle both array and JSON string for platforms/sources
    this.platforms = Array.isArray(data.platforms)
      ? data.platforms
      : typeof data.platforms === 'string'
        ? JSON.parse(data.platforms)
        : data.platform
          ? [data.platform]
          : [];

    this.sources = Array.isArray(data.sources)
      ? data.sources
      : typeof data.sources === 'string'
        ? JSON.parse(data.sources)
        : data.source
          ? [data.source]
          : [];

    this.source = this.sources[0] || null; // Alias for compatibility

    this.claimedAt = data.claimedat || data.claimedAt || new Date();
    this.expiresAt = data.expiresat || data.expiresAt || null;
    this.url = data.url || data.sourceurl || data.sourceUrl || null;
    this.createdAt = data.createdat || data.createdAt || new Date();
    this.updatedAt = data.updatedat || data.updatedAt || new Date();
  }

  /**
   * Create new game
   *
   * @param {Object} gameData - Game data
   * @returns {Promise<Game>} Created game
   */
  static async create(gameData) {
    const game = new Game(gameData);

    // Handle legacy field names from tests
    const sources = gameData.sources || (gameData.source ? [gameData.source] : []);
    const platforms = gameData.platforms || (gameData.platform ? [gameData.platform] : []);
    const url = gameData.url || gameData.sourceUrl || null;
    const price = gameData.price || gameData.steamPrice || 0;

    await query(
      'INSERT INTO games (id, userId, title, description, image, price, platforms, sources, claimedAt, expiresAt, url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
      [
        game.id,
        game.userId,
        game.title,
        game.description,
        game.image,
        price,
        JSON.stringify(platforms),
        JSON.stringify(sources),
        game.claimedAt,
        game.expiresAt,
        url,
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
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Games and total count
   */
  static async listByUser(userId, page = 1, pageSize = 20, filters = {}) {
    const offset = (page - 1) * pageSize;
    let whereClause = 'WHERE userId = $1';
    const params = [userId, pageSize, offset];
    let paramIndex = 1;

    if (filters.source) {
      paramIndex++;
      whereClause += ` AND sources::text LIKE $${paramIndex}`;
      params.splice(1, 0, `%${filters.source}%`);
    }

    const result = await query(
      `SELECT * FROM games ${whereClause} ORDER BY claimedAt DESC LIMIT $${paramIndex + 1} OFFSET $${paramIndex + 2}`,
      params
    );
    const countResult = await query(
      `SELECT COUNT(*) FROM games ${whereClause}`,
      params.slice(0, paramIndex)
    );
    return {
      games: result.rows.map((row) => new Game(row)),
      total: parseInt(countResult.rows[0].count, 10),
    };
  }

  /**
   * Find game by user and title
   *
   * @param {string} userId - User ID
   * @param {string} title - Game title
   * @param {string} source - Game source (optional)
   * @returns {Promise<Game|null>} Game object or null
   */
  static async findByUserAndTitle(userId, title, source = null) {
    let queryText = 'SELECT * FROM games WHERE userId = $1 AND LOWER(title) = LOWER($2)';
    const params = [userId, title];

    if (source) {
      queryText += ' AND sources::text LIKE $3';
      params.push(`%${source}%`);
    }

    queryText += ' LIMIT 1';

    const result = await query(queryText, params);
    return result.rows[0] ? new Game(result.rows[0]) : null;
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
