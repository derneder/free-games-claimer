import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import logger from '../config/logger.js';

// CSRF protection setup
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Middleware to get CSRF token
export const getCsrfToken = (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
};

// Middleware to apply CSRF protection to specific routes
export const protectWithCsrf = csrfProtection;

// Error handler for CSRF errors
export const csrfErrorHandler = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);

  logger.warn(`⚠️ CSRF token mismatch for IP: ${req.ip}`);

  res.status(403).json({
    error: 'Invalid CSRF token',
    message: 'Please try again'
  });
};

// Middleware configuration for Express app
export function setupCsrfProtection(app) {
  // Parse cookies for CSRF
  app.use(cookieParser());

  // Create CSRF tokens
  app.use(csrf({
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    }
  }));

  // CSRF token endpoint (GET)
  app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });

  // CSRF error handler
  app.use(csrfErrorHandler);

  logger.info('🔐 CSRF protection enabled');
}

export default csrfProtection;
