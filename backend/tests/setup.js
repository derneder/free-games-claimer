/**
 * Jest Setup File
 *
 * Configures test environment before running tests.
 */

import dotenv from 'dotenv';

// Load test environment
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Suppress logging during tests (comment out as jest is not available in setup)
// global.console.log = jest.fn();
// global.console.error = jest.fn();

// Note: jest.setTimeout is called in individual test files if needed
