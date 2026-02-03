/**
 * Database Configuration
 *
 * PostgreSQL database connection pool setup.
 * Manages connections and provides utilities for database operations.
 *
 * @module src/config/database
 */

import pg from 'pg';
import { config } from './env.js';
import { logger } from './logger.js';

const { Pool } = pg;

/**
 * PostgreSQL connection pool
 *
 * @type {pg.Pool}
 */
let pool = null;

/**
 * Initialize database connection pool
 *
 * @returns {Promise<void>}
 * @throws {Error} If connection fails
 */
export async function initializeDatabase() {
  try {
    // Support both connection string and individual PG environment variables
    const poolConfig = config.database.url
      ? {
          connectionString: config.database.url,
          min: config.database.poolMin,
          max: config.database.poolMax,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        }
      : {
          host: process.env.PGHOST || 'localhost',
          port: parseInt(process.env.PGPORT || '5432', 10),
          user: process.env.PGUSER || 'postgres',
          password: process.env.PGPASSWORD || 'postgres',
          database: process.env.PGDATABASE || 'postgres',
          min: config.database.poolMin,
          max: config.database.poolMax,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        };

    pool = new Pool(poolConfig);

    // Test connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    logger.info('Database connection pool initialized');
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Get database connection pool
 *
 * @returns {pg.Pool} PostgreSQL connection pool
 * @throws {Error} If pool is not initialized
 */
export function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initializeDatabase() first.');
  }
  return pool;
}

/**
 * Execute query on database
 *
 * @param {string} query - SQL query string
 * @param {Array} values - Query parameters
 * @returns {Promise<Object>} Query result
 * @throws {Error} If query execution fails
 */
export async function query(query, values = []) {
  const client = await getPool().connect();
  try {
    const result = await client.query(query, values);
    return result;
  } finally {
    client.release();
  }
}

/**
 * Close database connection pool
 *
 * @returns {Promise<void>}
 */
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    logger.info('Database connection pool closed');
  }
}

// Export pool as default to support both import styles
export default pool;
