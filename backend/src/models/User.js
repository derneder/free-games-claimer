/**
 * User Model
 *
 * Represents a user in the system.
 * Handles user data structure and database operations.
 *
 * @module src/models/User
 */

import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/crypto.js';

/**
 * User model class
 */
export class User {
  /**
   * Constructor
   *
   * @param {Object} data - User data
   */
  constructor(data) {
    this.id = data.id || uuidv4();
    this.email = data.email;
    this.username = data.username;
    this.password = data.password;
    this.role = data.role || 'user';
    this.twoFaSecret = data.twoFaSecret || null;
    this.twoFaEnabled = data.twoFaEnabled || false;
    this.isActive = data.isActive !== false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Find user by email
   *
   * @param {string} email - User email
   * @returns {Promise<User|null>} User object or null
   */
  static async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  /**
   * Find user by username
   *
   * @param {string} username - Username
   * @returns {Promise<User|null>} User object or null
   */
  static async findByUsername(username) {
    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  /**
   * Find user by ID
   *
   * @param {string} id - User ID
   * @returns {Promise<User|null>} User object or null
   */
  static async findById(id) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  /**
   * Create new user
   *
   * @param {Object} userData - User data
   * @returns {Promise<User>} Created user
   */
  static async create(userData) {
    const hashedPassword = await hashPassword(userData.password);
    const user = new User({
      ...userData,
      password: hashedPassword,
    });

    await query(
      'INSERT INTO users (id, email, username, password, role, isActive) VALUES ($1, $2, $3, $4, $5, $6)',
      [user.id, user.email, user.username, user.password, user.role, user.isActive]
    );

    return user;
  }

  /**
   * Update user
   *
   * @returns {Promise<void>}
   */
  async save() {
    this.updatedAt = new Date();
    await query(
      'UPDATE users SET email = $1, username = $2, role = $3, twoFaSecret = $4, twoFaEnabled = $5, isActive = $6, updatedAt = $7 WHERE id = $8',
      [
        this.email,
        this.username,
        this.role,
        this.twoFaSecret,
        this.twoFaEnabled,
        this.isActive,
        this.updatedAt,
        this.id,
      ]
    );
  }

  /**
   * Verify password
   *
   * @param {string} password - Password to verify
   * @returns {Promise<boolean>} True if password matches
   */
  async verifyPassword(password) {
    return comparePassword(password, this.password);
  }

  /**
   * List all users with pagination
   *
   * @param {number} page - Page number
   * @param {number} pageSize - Items per page
   * @returns {Promise<Object>} Users and total count
   */
  static async list(page = 1, pageSize = 20) {
    const offset = (page - 1) * pageSize;
    const result = await query('SELECT * FROM users ORDER BY createdAt DESC LIMIT $1 OFFSET $2', [
      pageSize,
      offset,
    ]);
    const countResult = await query('SELECT COUNT(*) FROM users');
    return {
      users: result.rows.map((row) => new User(row)),
      total: parseInt(countResult.rows[0].count, 10),
    };
  }
}
