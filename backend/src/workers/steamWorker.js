import axios from 'axios';
import db from '../config/database.js';
import logger from '../config/logger.js';
import { addEpicGamesForUser } from './epicGamesWorker.js';
import { addGOGGamesForUser } from './gogWorker.js';

const STEAM_API = 'https://api.steampowered.com';

export async function fetchSteamFreeGames() {
  try {
    logger.info('🔄 Fetching Steam free games...');

    const response = await axios.get(
      `${STEAM_API}/ISteamApps/GetAppList/v2/`,
      { timeout: 10000 },
    );

    const games = response.data?.applist?.apps || [];
    logger.info(`🌟 Found ${games.length} Steam games`);

    // Filter only free games (would need additional API call for details)
    return games.slice(0, 50).map((game) => ({
      title: game.name,
      source: 'steam',
      sourceUrl: `https://store.steampowered.com/app/${game.appid}`,
      platform: 'windows',
      steamPrice: 0,
    }));
  } catch (error) {
    logger.error('❌ Steam fetch failed:', error.message);
    return [];
  }
}

export async function addSteamGamesForUser(userId) {
  const games = await fetchSteamFreeGames();

  if (games.length === 0) return 0;

  const gamesToInsert = games.map((g) => ({
    user_id: userId,
    ...g,
    obtained_at: new Date(),
    created_at: new Date(),
  }));

  const ids = await db('games').insert(gamesToInsert).onConflict().ignore();
  logger.info(`✅ Added ${ids.length} Steam games for user ${userId}`);

  return ids.length;
}

export async function runPeriodicScraping() {
  logger.info('🔁 Starting periodic game scraping...');

  const users = await db('users').select('id');

  for (const user of users) {
    await addEpicGamesForUser(user.id);
    await addGOGGamesForUser(user.id);
    await addSteamGamesForUser(user.id);
  }

  logger.info('✅ Periodic scraping completed');
}

// Run every 6 hours
setInterval(runPeriodicScraping, 6 * 60 * 60 * 1000);
