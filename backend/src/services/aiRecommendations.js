import db from '../config/database.js';
import redis from '../config/redis.js';
import logger from '../config/logger.js';

/**
 * AI Recommendations Engine
 * Uses collaborative filtering to recommend games
 */

// ============ SIMILARITY CALCULATION ============

/**
 * Calculate Cosine Similarity between two vectors
 * @param {Array} vector1 - First vector
 * @param {Array} vector2 - Second vector
 * @returns {number} Similarity score (0-1)
 */
function cosineSimilarity(vector1, vector2) {
  if (vector1.length === 0 || vector2.length === 0) return 0;

  const dotProduct = vector1.reduce((sum, a, i) => sum + a * vector2[i], 0);
  const magnitude1 = Math.sqrt(vector1.reduce((sum, a) => sum + a * a, 0));
  const magnitude2 = Math.sqrt(vector2.reduce((sum, a) => sum + a * a, 0));

  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Build feature vector for a game
 * @param {object} game - Game data
 * @returns {Array} Feature vector
 */
function buildGameVector(game) {
  // Features: [price_normalized, rating, popularity, platform_weight]
  const priceNorm = Math.min(game.steam_price_usd || 0, 100) / 100;
  const rating = (game.rating || 0) / 100;
  const popularity = (game.claimed_count || 0) / 1000; // Normalize by max
  const platformWeight = game.platform === 'windows' ? 0.9 : 0.5; // PC games are more popular

  return [priceNorm, rating, popularity, platformWeight];
}

/**
 * Get collaborative filtering recommendations
 * @param {number} userId - User ID
 * @param {number} limit - Number of recommendations
 * @returns {Promise<Array>} Recommended games
 */
export async function getCollaborativeFilteringRecommendations(userId, limit = 5) {
  try {
    // Get user's claimed games
    const userGames = await db('user_games')
      .join('games', 'user_games.game_id', 'games.id')
      .where('user_games.user_id', userId)
      .select('games.*');

    if (userGames.length === 0) {
      // New user - return popular games
      return getPopularGames(limit);
    }

    // Build user preference vector
    const userVector = userGames.length > 0
      ? userGames[0]
        .map(g => buildGameVector(g))
        .reduce((acc, v) => acc.map((a, i) => a + v[i]))
      : [];

    // Get all games
    const allGames = await db('games')
      .whereNotIn('id', userGames.map(g => g.id))
      .limit(100);

    // Calculate similarity for each game
    const scored = allGames.map(game => ({
      ...game,
      score: cosineSimilarity(userVector, buildGameVector(game)),
    }));

    // Sort by score and return top N
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    logger.error('Error getting collaborative filtering recommendations:', error);
    return [];
  }
}

/**
 * Get content-based recommendations
 * @param {number} gameId - Reference game ID
 * @param {number} limit - Number of recommendations
 * @returns {Promise<Array>} Similar games
 */
export async function getContentBasedRecommendations(gameId, limit = 5) {
  try {
    const game = await db('games').where('id', gameId).first();
    if (!game) return [];

    const gameVector = buildGameVector(game);

    const similarGames = await db('games')
      .where('id', '!=', gameId)
      .where('source', game.source) // Same source often means similar catalog
      .limit(50);

    const scored = similarGames.map(g => ({
      ...g,
      score: cosineSimilarity(gameVector, buildGameVector(g)),
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (error) {
    logger.error('Error getting content-based recommendations:', error);
    return [];
  }
}

/**
 * Get trending games
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} Trending games
 */
export async function getTrendingGames(limit = 5) {
  try {
    return await db('games')
      .where('claimed_count', '>', 0)
      .orderBy('claimed_count', 'desc')
      .orderBy('updated_at', 'desc')
      .limit(limit);
  } catch (error) {
    logger.error('Error getting trending games:', error);
    return [];
  }
}

/**
 * Get popular games (by value and claims)
 * @param {number} limit - Number of results
 * @returns {Promise<Array>} Popular games
 */
export async function getPopularGames(limit = 5) {
  try {
    return await db('games')
      .orderBy(db.raw('steam_price_usd * claimed_count'), 'desc')
      .limit(limit);
  } catch (error) {
    logger.error('Error getting popular games:', error);
    return [];
  }
}

/**
 * Get personalized recommendations (hybrid approach)
 * @param {number} userId - User ID
 * @param {number} limit - Number of recommendations
 * @returns {Promise<Array>} Personalized recommendations
 */
export async function getPersonalizedRecommendations(userId, limit = 10) {
  try {
    // Check cache first
    const cacheKey = `recommendations:${userId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Get different types of recommendations
    const [collaborative, trending, popular] = await Promise.all([
      getCollaborativeFilteringRecommendations(userId, Math.ceil(limit * 0.5)),
      getTrendingGames(Math.ceil(limit * 0.25)),
      getPopularGames(Math.ceil(limit * 0.25)),
    ]);

    // Merge and deduplicate
    const merged = [...collaborative, ...trending, ...popular];
    const unique = Array.from(
      new Map(merged.map(g => [g.id, g])).values(),
    ).slice(0, limit);

    // Cache for 6 hours
    await redis.setex(cacheKey, 6 * 60 * 60, JSON.stringify(unique));

    return unique;
  } catch (error) {
    logger.error('Error getting personalized recommendations:', error);
    return [];
  }
}

/**
 * Invalidate recommendation cache for user
 * @param {number} userId - User ID
 */
export async function invalidateRecommendationCache(userId) {
  try {
    await redis.del(`recommendations:${userId}`);
    logger.info(`Invalidated recommendations cache for user ${userId}`);
  } catch (error) {
    logger.error('Error invalidating cache:', error);
  }
}

/**
 * Train recommendation model (batch job)
 * Update game vectors and similarity matrices
 */
export async function trainRecommendationModel() {
  try {
    logger.info('🤖 Training recommendation model...');

    // Calculate game statistics for better scoring
    const games = await db('games').select('*');
    const maxPrice = Math.max(...games.map(g => g.steam_price_usd || 0), 1);
    const maxClaims = Math.max(...games.map(g => g.claimed_count || 0), 1);

    // Update game vectors
    for (const game of games) {
      const vector = [
        (game.steam_price_usd || 0) / maxPrice,
        (game.rating || 0) / 100,
        (game.claimed_count || 0) / maxClaims,
        game.platform === 'windows' ? 0.9 : 0.5,
      ];

      await db('games')
        .where('id', game.id)
        .update({
          feature_vector: JSON.stringify(vector),
          updated_at: new Date(),
        });
    }

    logger.info(`✅ Trained on ${games.length} games`);
  } catch (error) {
    logger.error('Error training model:', error);
  }
}

export default {
  getCollaborativeFilteringRecommendations,
  getContentBasedRecommendations,
  getTrendingGames,
  getPopularGames,
  getPersonalizedRecommendations,
  invalidateRecommendationCache,
  trainRecommendationModel,
};
