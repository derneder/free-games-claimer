import helmet from 'helmet';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import logger from '../config/logger.js';

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
 * CSRF protection middleware
 */
export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
});

/**
 * Middleware для логирования CSRF ошибок
 */
export const csrfErrorHandler = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') {
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
 * Middleware для добавления CSRF token
 */
export const csrfTokenMiddleware = (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};

/**
 * Исключения для CSRF protection
 */
const csrfExcludedRoutes = [
  '/api/health',
  '/api/telegram',
  '/webhook',
];

/**
 * Conditional CSRF protection
 */
export const conditionalCsrf = (req, res, next) => {
  const isExcluded = csrfExcludedRoutes.some(route => 
    req.path.startsWith(route)
  );

  if (isExcluded) {
    return next();
  }

  return csrfProtection(req, res, next);
};