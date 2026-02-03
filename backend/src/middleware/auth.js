/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens and validates user authentication.
 * Attaches user information to request object.
 * 
 * @module src/middleware/auth
 */

import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { logger } from '../config/logger.js';

/**
 * Verify JWT token and attach user to request
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 * @returns {void}
 */
export function verifyToken(req, res, next) {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'No authentication token provided',
      });
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    req.token = token;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'TOKEN_EXPIRED',
        message: 'Authentication token has expired',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'INVALID_TOKEN',
        message: 'Invalid authentication token',
      });
    }

    logger.error('Token verification error:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to verify token',
    });
  }
}

/**
 * Extract token from request headers or cookies
 * 
 * @param {Object} req - Express request object
 * @returns {string|null} JWT token or null
 */
function extractToken(req) {
  // Try Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Try cookies
  if (req.cookies?.token) {
    return req.cookies.token;
  }

  return null;
}

/**
 * Check if user is admin
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 * @returns {void}
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Admin access required',
    });
  }

  next();
}

/**
 * Generate JWT token
 * 
 * @param {Object} payload - Token payload
 * @param {string} expiresIn - Token expiration (optional)
 * @returns {string} JWT token
 */
export function generateToken(payload, expiresIn = config.jwt.expiration) {
  return jwt.sign(payload, config.jwt.secret, { expiresIn });
}

/**
 * Generate refresh token
 * 
 * @param {Object} payload - Token payload
 * @returns {string} Refresh token
 */
export function generateRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiration,
  });
}
