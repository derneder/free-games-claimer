import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis from '../config/redis.js';
import logger from '../config/logger.js';

// ============ GENERAL API LIMITER ============
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for GET requests
    return req.method === 'GET';
  },
  onLimitReached: (req) => {
    logger.warn(`Rate limit reached for IP: ${req.ip}`);
  },
});

// ============ AUTH LIMITER (Strict) ============
export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:auth:', // Rate limit: auth
    sendCommand: async (client, args) => {
      return client.sendCommand(args);
    },
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 attempts per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful attempts
  message: 'Too many login/register attempts, please try again later.',
  handler: (req, res) => {
    logger.warn(`❌ Auth rate limit hit for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many attempts. Try again in 15 minutes.',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

// ============ 2FA LIMITER (Very Strict) ============
export const twoFactorLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:2fa:',
  }),
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, // Only 3 attempts
  skipSuccessfulRequests: true,
  message: '2FA verification attempts exceeded. Try again later.',
  handler: (req, res) => {
    logger.error(`🔒 2FA rate limit hit for user: ${req.body.email}`);
    res.status(429).json({
      error: '2FA verification limit exceeded',
      lockoutMinutes: 10,
    });
  },
});

// ============ SCRAPING LIMITER (For game collection) ============
export const scrapingLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:scrape:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 scraping operations per hour
  message: 'Too many scraping requests. Please wait before trying again.',
  handler: (req, res) => {
    logger.warn(`🔄 Scraping rate limit hit for user: ${req.user?.id}`);
    res.status(429).json({
      error: 'Scraping rate limit exceeded',
      resetTime: req.rateLimit.resetTime,
    });
  },
});

// ============ DOWNLOAD LIMITER (CSV/JSON export) ============
export const downloadLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:download:',
  }),
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 downloads per 10 minutes
  message: 'Too many downloads. Please wait before downloading again.',
});

// ============ ADMIN OPERATIONS LIMITER ============
export const adminLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:admin:',
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 operations per hour
  message: 'Admin operation rate limit exceeded',
});

// ============ TELEGRAM WEBHOOK LIMITER ============
export const telegramLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:telegram:',
  }),
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 webhook calls per minute
  skip: (req) => {
    // Skip rate limiting for specific telegram tokens
    return req.body?.message?.from?.is_bot === true;
  },
});

// ============ GLOBAL RATE LIMITER (Fallback) ============
export const globalLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:global:',
  }),
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // 300 requests per minute
  message: 'Server rate limit exceeded',
  skip: (req) => {
    // Skip health check endpoint
    return req.path === '/api/health';
  },
});

// ============ CUSTOM RATE LIMITER FACTORY ============
export function createLimiter(options = {}) {
  return rateLimit({
    store: new RedisStore({
      client: redis,
      prefix: options.prefix || 'rl:custom:',
    }),
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || 'Too many requests',
    handler: options.handler,
    skip: options.skip,
    keyGenerator: options.keyGenerator || ((req) => req.ip),
    ...options,
  });
}

export default apiLimiter;
