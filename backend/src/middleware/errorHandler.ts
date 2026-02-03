/**
 * Error Handling Middleware
 */

import type { Request, Response, NextFunction } from 'express';
import type { AppError } from '@types/errors';
import { logger } from '@utils/logger';

/**
 * Type guard for AppError
 */
function isAppError(error: unknown): error is AppError {
  return error instanceof Error && 'code' in error && 'statusCode' in error;
}

/**
 * Global error handler middleware
 */
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  logger.error('Request error', err instanceof Error ? err : new Error(String(err)));

  if (isAppError(err)) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        statusCode: err.statusCode,
        details: err.details,
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (err instanceof Error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        statusCode: 500,
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
      statusCode: 500,
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * 404 Not Found middleware
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
      statusCode: 404,
    },
    timestamp: new Date().toISOString(),
  });
}
