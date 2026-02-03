import redis from '../config/redis.js';
import logger from '../config/logger.js';

/**
 * Middleware to cache GET requests
 * @param {number} duration - Cache duration in seconds
 * @returns {Function} Express middleware
 */
export function cacheMiddleware(duration = 300) {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching if query has specific flags
    if (req.query.noCache || req.query.nocache) {
      return next();
    }

    try {
      // Create cache key from URL + user ID (if authenticated)
      const userId = req.user?.id || 'anonymous';
      const cacheKey = `cache:${userId}:${req.originalUrl}`;

      // Try to get from cache
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        logger.debug(`💾 Cache HIT for ${req.originalUrl}`);
        return res.json(JSON.parse(cachedData));
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = function (data) {
        try {
          // Cache the response
          redis
            .setex(cacheKey, duration, JSON.stringify(data))
            .catch((err) => logger.error('Cache store error:', err));

          logger.debug(`📞 Cache SET for ${req.originalUrl} (${duration}s)`);
        } catch (error) {
          logger.error('Error caching response:', error);
        }

        // Call original json method
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
}

/**
 * Invalidate cache for a specific pattern
 * @param {string} pattern - Redis key pattern (can use *)
 */
export async function invalidateCache(pattern) {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.info(`🗑 Invalidated ${keys.length} cache entries matching ${pattern}`);
    }
  } catch (error) {
    logger.error('Error invalidating cache:', error);
  }
}

/**
 * Invalidate cache for a user
 * @param {number} userId - User ID
 */
export async function invalidateUserCache(userId) {
  await invalidateCache(`cache:${userId}:*`);
}

/**
 * Invalidate all cache
 */
export async function clearAllCache() {
  try {
    await redis.flushdb();
    logger.warn('🏅 All cache cleared');
  } catch (error) {
    logger.error('Error clearing cache:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats() {
  try {
    const info = await redis.info('stats');
    const keys = await redis.keys('cache:*');

    return {
      totalCacheKeys: keys.length,
      cachePattern: 'cache:*',
      info,
    };
  } catch (error) {
    logger.error('Error getting cache stats:', error);
    return null;
  }
}

/**
 * Specific cache middleware for games list
 */
export function cacheGames(duration = 600) {
  return async (req, res, next) => {
    if (req.method !== 'GET' || !req.user) return next();

    try {
      const cacheKey = `cache:games:${req.user.id}:${req.query.page || 1}:${req.query.sort || 'date'}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        return res.json(JSON.parse(cached));
      }

      const originalJson = res.json.bind(res);
      res.json = function (data) {
        redis
          .setex(cacheKey, duration, JSON.stringify(data))
          .catch((err) => logger.error('Cache error:', err));
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Games cache middleware error:', error);
      next();
    }
  };
}

/**
 * Specific cache middleware for analytics
 */
export function cacheAnalytics(duration = 1800) {
  return async (req, res, next) => {
    if (req.method !== 'GET' || !req.user) return next();

    try {
      const cacheKey = `cache:analytics:${req.user.id}:${req.path}`;
      const cached = await redis.get(cacheKey);

      if (cached) {
        logger.debug('💾 Analytics cache HIT');
        return res.json(JSON.parse(cached));
      }

      const originalJson = res.json.bind(res);
      res.json = function (data) {
        redis
          .setex(cacheKey, duration, JSON.stringify(data))
          .catch((err) => logger.error('Analytics cache error:', err));
        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Analytics cache middleware error:', error);
      next();
    }
  };
}

/**
 * Cache invalidation trigger for when games are added/deleted
 * @param {number} userId - User ID
 */
export async function invalidateGamesCacheForUser(userId) {
  await invalidateCache(`cache:games:${userId}:*`);
  await invalidateCache(`cache:analytics:${userId}:*`);
  logger.info(`🗑 Invalidated games cache for user ${userId}`);
}

export default cacheMiddleware;
