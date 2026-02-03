/**
 * Redis Configuration
 * 
 * Redis client setup for caching and session management.
 * Provides utilities for cache operations.
 * 
 * @module src/config/redis
 */

import { createClient } from 'redis';
import { config } from './env.js';
import { logger } from './logger.js';

/**
 * Redis client instance
 * 
 * @type {Object}
 */
let redisClient = null;

/**
 * Initialize Redis connection
 * 
 * @returns {Promise<void>}
 * @throws {Error} If connection fails
 */
export async function initializeRedis() {
  try {
    redisClient = createClient({
      url: config.redis.url,
      password: config.redis.password,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
      },
    });

    redisClient.on('error', (err) => logger.error('Redis error:', err));
    redisClient.on('connect', () => logger.info('Redis connected'));

    await redisClient.connect();
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
    throw error;
  }
}

/**
 * Get Redis client
 * 
 * @returns {Object} Redis client
 * @throws {Error} If client is not initialized
 */
export function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call initializeRedis() first.');
  }
  return redisClient;
}

/**
 * Set cache value
 * 
 * @param {string} key - Cache key
 * @param {*} value - Value to cache
 * @param {number} ttl - Time to live in seconds (optional)
 * @returns {Promise<void>}
 */
export async function setCache(key, value, ttl = null) {
  try {
    const options = ttl ? { EX: ttl } : {};
    await getRedisClient().set(key, JSON.stringify(value), options);
  } catch (error) {
    logger.error('Failed to set cache:', error);
    throw error;
  }
}

/**
 * Get cache value
 * 
 * @param {string} key - Cache key
 * @returns {Promise<*>} Cached value or null
 */
export async function getCache(key) {
  try {
    const value = await getRedisClient().get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    logger.error('Failed to get cache:', error);
    return null;
  }
}

/**
 * Delete cache value
 * 
 * @param {string} key - Cache key
 * @returns {Promise<void>}
 */
export async function deleteCache(key) {
  try {
    await getRedisClient().del(key);
  } catch (error) {
    logger.error('Failed to delete cache:', error);
    throw error;
  }
}

/**
 * Clear all cache
 * 
 * @returns {Promise<void>}
 */
export async function clearCache() {
  try {
    await getRedisClient().flushDb();
  } catch (error) {
    logger.error('Failed to clear cache:', error);
    throw error;
  }
}

/**
 * Close Redis connection
 * 
 * @returns {Promise<void>}
 */
export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
}
