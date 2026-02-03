import axios from 'axios';
import db from '../config/database.js';
import logger from '../config/logger.js';

const EPIC_API = 'https://www.epicgames.com/graphql';

export async function fetchEpicGames() {
  try {
    logger.info('🔄 Fetching Epic Games...');

    const query = `
      query {
        Catalog {
          searchStore(first: 100, sortBy: "effectiveDate", sortDir: "DESC", filter: "TYPE:GAME") {
            elements {
              id
              title
              description
              keyImages { type url }
              price { totalPrice { fmtPrice } }
              currentPrice
            }
          }
        }
      }
    `;

    const response = await axios.post(
      EPIC_API,
      { query },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      },
    );

    const games = response.data?.data?.Catalog?.searchStore?.elements || [];
    logger.info(`🌟 Found ${games.length} Epic Games`);

    return games.map((game) => ({
      title: game.title,
      source: 'epic-games',
      sourceUrl: `https://www.epicgames.com/store/en-US/p/${game.id}`,
      platform: 'windows',
      steamPrice: game.price?.totalPrice?.fmtPrice?.replace('$', '') || game.currentPrice || 0,
    }));
  } catch (error) {
    logger.error('❌ Epic Games fetch failed:', error.message);
    return [];
  }
}

export async function addEpicGamesForUser(userId) {
  const games = await fetchEpicGames();

  if (games.length === 0) return 0;

  const gamesToInsert = games.map((g) => ({
    user_id: userId,
    ...g,
    obtained_at: new Date(),
    created_at: new Date(),
  }));

  const ids = await db('games').insert(gamesToInsert).onConflict().ignore();
  logger.info(`✅ Added ${ids.length} Epic Games for user ${userId}`);

  return ids.length;
}
