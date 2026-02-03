import axios from 'axios';
import db from '../config/database.js';
import logger from '../config/logger.js';

const PRIME_GAMING_URL = 'https://www.primegaming.com';

export async function fetchPrimeGamingFreeGames() {
  try {
    logger.info('🔄 Fetching Prime Gaming free games...');

    // Note: Prime Gaming requires authentication and dynamic content rendering
    // This is a basic implementation - in production, use Playwright/Puppeteer

    await axios.get(`${PRIME_GAMING_URL}/games`, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      timeout: 10000,
    });

    // Parse HTML or use Prime Gaming API if available
    // For now, return empty array
    logger.info('🌟 Prime Gaming games (placeholder)');

    return [];
  } catch (error) {
    logger.error('❌ Prime Gaming fetch failed:', error.message);
    return [];
  }
}

export async function addPrimeGamingForUser(userId) {
  const games = await fetchPrimeGamingFreeGames();

  if (games.length === 0) return 0;

  const gamesToInsert = games.map((g) => ({
    user_id: userId,
    ...g,
    obtained_at: new Date(),
    created_at: new Date(),
  }));

  const ids = await db('games').insert(gamesToInsert).onConflict().ignore();
  logger.info(`✅ Added ${ids.length} Prime Gaming games for user ${userId}`);

  return ids.length;
}
