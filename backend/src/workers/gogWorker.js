import axios from 'axios';
import cheerio from 'cheerio';
import db from '../config/database.js';
import logger from '../config/logger.js';

const GOG_API = 'https://www.gog.com/api/products';

export async function fetchGOGFreeGames() {
  try {
    logger.info('🔄 Fetching GOG free games...');

    const response = await axios.get(`${GOG_API}?status=free`, {
      timeout: 10000,
    });

    const games = response.data?.products || [];
    logger.info(`🌟 Found ${games.length} GOG free games`);

    return games.map((game) => ({
      title: game.title,
      source: 'gog',
      sourceUrl: `https://www.gog.com${game.url}`,
      platform: game.os?.includes('Linux') ? 'linux' : 'windows',
      steamPrice: 0,
    }));
  } catch (error) {
    logger.error('❌ GOG fetch failed:', error.message);
    return [];
  }
}

export async function addGOGGamesForUser(userId) {
  const games = await fetchGOGFreeGames();

  if (games.length === 0) return 0;

  const gamesToInsert = games.map((g) => ({
    user_id: userId,
    ...g,
    obtained_at: new Date(),
    created_at: new Date(),
  }));

  const ids = await db('games').insert(gamesToInsert).onConflict().ignore();
  logger.info(`✅ Added ${ids.length} GOG games for user ${userId}`);

  return ids.length;
}
