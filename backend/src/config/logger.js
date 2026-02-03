/**
 * Logger Configuration
 *
 * Winston logger setup for consistent logging across the application.
 * Handles both console and file logging with proper formatting.
 *
 * @module src/config/logger
 */

import winston from 'winston';
import { config } from './env.js';

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

/**
 * Custom format for development mode
 *
 * @type {winston.Logform.Format}
 */
const devFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
  return `${timestamp} [${level}]: ${message} ${metaStr}`;
});

/**
 * Winston logger instance
 *
 * @type {winston.Logger}
 */
export const logger = winston.createLogger({
  level: config.logging.level,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    config.nodeEnv === 'development' ? devFormat : json()
  ),
  defaultMeta: { service: 'free-games-claimer-api' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(colorize(), devFormat),
    }),

    // File transports (production)
    ...(config.nodeEnv !== 'test'
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: json(),
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            format: json(),
          }),
        ]
      : []),
  ],
});

/**
 * Express middleware for request logging
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
export function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
}
