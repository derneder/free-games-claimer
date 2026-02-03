/**
 * Environment Configuration
 * 
 * Centralized configuration management using environment variables.
 * Validates required variables and provides defaults.
 * 
 * @module src/config/env
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment file based on NODE_ENV
const envFile =
  process.env.NODE_ENV === 'test'
    ? path.join(__dirname, '../../.env.test')
    : path.join(__dirname, '../../.env');

dotenv.config({ path: envFile });

/**
 * Validate required environment variables
 * 
 * @param {string} variable - Environment variable name
 * @returns {string} Environment variable value
 * @throws {Error} If required variable is not set
 */
function requireEnv(variable) {
  const value = process.env[variable];
  if (!value) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
  return value;
}

/**
 * Configuration object
 * 
 * @type {Object}
 * @property {string} nodeEnv - Node environment (development, test, production)
 * @property {number} port - Server port
 * @property {string} host - Server host
 */
export const config = {
  // Application
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || 'localhost',

  // Database
  database: {
    url: requireEnv('DATABASE_URL'),
    poolMin: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DATABASE_POOL_MAX || '20', 10),
  },

  // Redis
  redis: {
    url: requireEnv('REDIS_URL'),
    password: process.env.REDIS_PASSWORD,
  },

  // JWT
  jwt: {
    secret: requireEnv('JWT_SECRET'),
    expiration: process.env.JWT_EXPIRATION || '24h',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },

  // 2FA
  twoFa: {
    window: parseInt(process.env.TWO_FA_WINDOW || '2', 10),
  },

  // Email
  email: {
    host: requireEnv('SMTP_HOST'),
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: requireEnv('SMTP_USER'),
    pass: requireEnv('SMTP_PASS'),
    from: process.env.SMTP_FROM || 'noreply@freegamesclaimer.com',
  },

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    format: process.env.LOG_FORMAT || 'json',
  },

  // API
  api: {
    prefix: process.env.API_PREFIX || '/api',
    version: process.env.API_VERSION || 'v1',
  },

  // Security
  security: {
    sessionSecret: requireEnv('SESSION_SECRET'),
    csrfTokenMaxAge: parseInt(process.env.CSRF_TOKEN_MAX_AGE || '86400', 10),
  },
};
