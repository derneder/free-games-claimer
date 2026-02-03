import redis from '../config/redis.js';
import jwt from 'jsonwebtoken';
import logger from '../config/logger.js';

// ============ TOKEN ROTATION FUNCTIONS ============

/**
 * Add token to blacklist (revoke)
 * @param {string} token - JWT token
 * @param {number} expiresIn - Token expiration time in seconds
 */
export async function blacklistToken(token) {
  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redis.setex(`blacklist:${token}`, ttl, 'true');
        logger.info('🔘 Token blacklisted');
      }
    }
  } catch (error) {
    logger.error('Error blacklisting token:', error);
  }
}

/**
 * Check if token is blacklisted
 * @param {string} token - JWT token
 * @returns {Promise<boolean>}
 */
export async function isTokenBlacklisted(token) {
  try {
    const result = await redis.get(`blacklist:${token}`);
    return result === 'true';
  } catch (error) {
    logger.error('Error checking token blacklist:', error);
    return false;
  }
}

/**
 * Store used refresh token
 * @param {string} refreshToken - Refresh token
 * @param {number} userId - User ID
 */
export async function storeUsedRefreshToken(refreshToken, userId) {
  try {
    const decoded = jwt.decode(refreshToken);
    if (decoded && decoded.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redis.setex(
          `used_refresh:${userId}:${refreshToken}`,
          ttl,
          'true',
        );
      }
    }
  } catch (error) {
    logger.error('Error storing used refresh token:', error);
  }
}

/**
 * Check if refresh token was already used (prevent replay attacks)
 * @param {string} refreshToken - Refresh token
 * @param {number} userId - User ID
 * @returns {Promise<boolean>}
 */
export async function hasRefreshTokenBeenUsed(refreshToken, userId) {
  try {
    const result = await redis.get(`used_refresh:${userId}:${refreshToken}`);
    return result === 'true';
  } catch (error) {
    logger.error('Error checking used refresh token:', error);
    return false;
  }
}

/**
 * Get all active refresh tokens for user (to detect unauthorized sessions)
 * @param {number} userId - User ID
 * @returns {Promise<Array>}
 */
export async function getUserRefreshTokens(userId) {
  try {
    const pattern = `user_refresh:${userId}:*`;
    const keys = await redis.keys(pattern);
    return keys.map(key => key.replace(`user_refresh:${userId}:`, ''));
  } catch (error) {
    logger.error('Error getting user refresh tokens:', error);
    return [];
  }
}

/**
 * Invalidate all refresh tokens for user (logout all devices)
 * @param {number} userId - User ID
 */
export async function invalidateAllUserTokens(userId) {
  try {
    const pattern = `user_refresh:${userId}:*`;
    const keys = await redis.keys(pattern);

    for (const key of keys) {
      await redis.del(key);
    }

    logger.info(`🚪 All refresh tokens invalidated for user ${userId}`);
  } catch (error) {
    logger.error('Error invalidating all user tokens:', error);
  }
}

/**
 * Store new refresh token
 * @param {number} userId - User ID
 * @param {string} refreshToken - Refresh token
 * @param {object} metadata - Device/session metadata
 */
export async function storeRefreshToken(userId, refreshToken, metadata = {}) {
  try {
    const decoded = jwt.decode(refreshToken);
    if (decoded && decoded.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        const tokenId = Math.random().toString(36).substring(7);
        const data = {
          token: refreshToken,
          created_at: new Date().toISOString(),
          user_agent: metadata.userAgent || 'Unknown',
          ip_address: metadata.ipAddress || 'Unknown',
          device_name: metadata.deviceName || 'Unknown Device',
        };

        await redis.setex(
          `user_refresh:${userId}:${tokenId}`,
          ttl,
          JSON.stringify(data),
        );

        logger.info(`💾 Refresh token stored for user ${userId}`);
      }
    }
  } catch (error) {
    logger.error('Error storing refresh token:', error);
  }
}

/**
 * Middleware to check token rotation status
 * Use in routes to detect token reuse
 */
export async function checkTokenRotation(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const isBlacklisted = await isTokenBlacklisted(token);

    if (isBlacklisted) {
      logger.warn(`⚠️ Attempt to use blacklisted token from IP: ${req.ip}`);
      return res.status(401).json({ error: 'Token has been revoked' });
    }

    next();
  } catch (error) {
    logger.error('Token rotation check error:', error);
    next(error);
  }
}

export default {
  blacklistToken,
  isTokenBlacklisted,
  storeUsedRefreshToken,
  hasRefreshTokenBeenUsed,
  getUserRefreshTokens,
  invalidateAllUserTokens,
  storeRefreshToken,
  checkTokenRotation,
};
