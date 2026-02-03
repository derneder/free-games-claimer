/**
 * Error Handling Middleware
 *
 * Global error handler for Express application.
 * Catches and formats errors consistently.
 *
 * @module src/middleware/error
 */

import { logger } from '../config/logger.js';

/**
 * Application error class
 *
 * @class AppError
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code for frontend
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handler middleware
 *
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware (unused but required)
 * @returns {void}
 */
export function globalErrorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  // Log error
  if (statusCode >= 500) {
    logger.error('Unhandled error:', {
      statusCode,
      code,
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Send response
  res.status(statusCode).json({
    error: code,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * Async error wrapper for route handlers
 *
 * Catches async errors and passes them to error handler
 *
 * @param {Function} handler - Async route handler
 * @returns {Function} Express middleware
 */
export function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
