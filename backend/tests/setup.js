/**
 * Jest Setup File
 *
 * Configures test environment before running tests.
 */

import dotenv from 'dotenv';
import { initializeDatabase, closeDatabase } from '../src/config/database.js';
import { initializeRedis, closeRedis } from '../src/config/redis.js';
import { initializeRedis, closeRedis } from '../src/config/redis.js';

// Load test environment
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Initialize database and Redis before all tests
beforeAll(async () => {
  await initializeDatabase();
  await initializeRedis();
  await initializeRedis();
});

// Close database and Redis after all tests
afterAll(async () => {
  await closeRedis();
  await closeRedis();
  await closeDatabase();
});

// Suppress logging during tests (comment out as jest is not available in setup)
// global.console.log = jest.fn();
// global.console.error = jest.fn();

// Note: jest.setTimeout is called in individual test files if needed
