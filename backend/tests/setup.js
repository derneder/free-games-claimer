/**
 * Jest Setup File
 *
 * Configures test environment before running tests.
 */

import dotenv from 'dotenv';
import { initializeDatabase, closeDatabase, query } from '../src/config/database.js';
import { initializeRedis, closeRedis, getRedisClient } from '../src/config/redis.js';

// Load test environment
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Initialize database and Redis before all tests
beforeAll(async () => {
  await initializeDatabase();
  await initializeRedis();
});

// Reset database before each test to prevent data pollution
beforeEach(async () => {
  // Truncate all tables in the correct order (respecting foreign key constraints)
  // Note: PostgreSQL converts unquoted identifiers to lowercase
  await query('TRUNCATE TABLE notifications RESTART IDENTITY CASCADE');
  await query('TRUNCATE TABLE refreshtokens RESTART IDENTITY CASCADE');
  await query('TRUNCATE TABLE activitylogs RESTART IDENTITY CASCADE');
  await query('TRUNCATE TABLE games RESTART IDENTITY CASCADE');
  await query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');

  // Clear Redis cache
  const redis = getRedisClient();
  if (redis && redis.isOpen) {
    await redis.flushDb();
  }
});

// Close database and Redis after all tests
afterAll(async () => {
  await closeRedis();
  await closeDatabase();
});

// Suppress logging during tests (comment out as jest is not available in setup)
// global.console.log = jest.fn();
// global.console.error = jest.fn();

// Note: jest.setTimeout is called in individual test files if needed
