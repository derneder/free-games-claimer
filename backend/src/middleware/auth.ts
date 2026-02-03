/**
 * Authentication Middleware
 */

import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '@types/errors';
import { logger } from '@utils/logger';

/**
 * Extended Request with user data
 */
export interface AuthenticatedRequest extends Request {
  userId?: number;
  email?: string;
  iat?: number;
  exp?: number;
}

/**
 * Extract Bearer token from request
 */
function extractToken(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 * Note: Actual JWT verification should be implemented with jsonwebtoken library
 */
export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    const token = extractToken(authHeader);

    if (!token) {
      throw new UnauthorizedError('Missing authorization token');
    }

    // TODO: Implement actual JWT verification
    // const decoded = jwt.verify(token, config.jwtSecret);
    // req.userId = decoded.userId;
    // req.email = decoded.email;
    // req.iat = decoded.iat;
    // req.exp = decoded.exp;

    logger.debug('Auth middleware: token verified', { token: token.substring(0, 10) + '...' });
    next();
  } catch (error) {
    logger.error('Auth middleware error', error instanceof Error ? error : new Error(String(error)));
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: error instanceof Error ? error.message : 'Unauthorized',
        statusCode: 401,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
