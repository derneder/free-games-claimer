import helmet from 'helmet';
import { doubleCsrf } from 'csrf-csrf';
import cookieParser from 'cookie-parser';
import { logger } from '../config/logger.js';

/**
 * Helmet middleware для безопасности headers
 */
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      fontSrc: ["'self'"],
      connectSrc: ["'self'", 'ws:', 'wss:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  referrerPolicy: {
    policy: 'no-referrer',
  },
});

/**
 * Cookie parser middleware
 */
export const cookieParserMiddleware = cookieParser();

/**
 * CSRF protection using csrf-csrf double CSRF implementation
 */
const { doubleCsrfProtection, generateToken } = doubleCsrf({
  getSecret: () => process.env.SESSION_SECRET || 'default-secret-change-in-production',
  cookieName: '__Host-psifi.x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
});

/**
 * Export CSRF protection middleware
 */
export { doubleCsrfProtection, generateToken };

/**
 * Middleware для логирования CSRF ошибок
 */
export const csrfErrorHandler = (err, req, res, next) => {
  // csrf-csrf throws errors with code 'EBADCSRFTOKEN' or messages containing 'csrf'
  if (err.code !== 'EBADCSRFTOKEN' && !err.message?.toLowerCase().includes('csrf')) {
    return next(err);
  }

  logger.warn('🚨 CSRF token mismatch', {
    ip: req.ip,
    method: req.method,
    url: req.url,
    userAgent: req.get('user-agent'),
  });

  res.status(403).json({
    error: 'Invalid CSRF token',
    message: 'Please refresh the page and try again',
  });
};

/**
 * Исключения для CSRF protection
 */
const csrfExcludedRoutes = ['/api/health', '/api/telegram', '/webhook'];

/**
 * Conditional CSRF protection
 */
export const conditionalCsrf = (req, res, next) => {
  const isExcluded = csrfExcludedRoutes.some((route) => req.path.startsWith(route));

  if (isExcluded) {
    return next();
  }

  return doubleCsrfProtection(req, res, next);
};
