import { Telegraf, session } from 'telegraf';
import db from '../config/database.js';
import logger from '../config/logger.js';
import { addEpicGamesForUser } from '../workers/epicGamesWorker.js';
import { addGOGGamesForUser } from '../workers/gogWorker.js';
import { addSteamGamesForUser } from '../workers/steamWorker.js';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

bot.use(session());

// /start - Инициализация
bot.command('start', async (ctx) => {
  const telegramId = ctx.from.id.toString();
  const username = ctx.from.username || 'Unknown';

  try {
    // Проверяем, есть ли уже пользователь
    let user = await db('users').where({ telegram_id: telegramId }).first();

    if (!user) {
      // Создаём нового пользователя
      const [userId] = await db('users').insert({
        telegram_id: telegramId,
        username,
        email: `${telegramId}@telegram.local`,
        password_hash: 'telegram-user',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      });
      user = await db('users').where({ id: userId }).first();
      logger.info(`✅ New Telegram user: ${username}`);
    }

    const keyboard = [
      ['📊 Stats', '🎮 Recent Games'],
      ['🔄 Run Collection', '⚙️ Settings'],
      ['ℹ️ Help'],
    ];

    await ctx.reply(
      `🎮 Welcome to Free Games Claimer PRO!\n\n` +
      `I'll help you collect free games from:\n` +
      `• 🏴󠁥󠁳󠁣󠁴󠁿 Epic Games\n` +
      `• 🕹️ GOG\n` +
      `• 🚂 Steam\n` +
      `• 👑 Prime Gaming\n\n` +
      `Choose an action:`,
      {
        reply_markup: {
          keyboard,
          resize_keyboard: true,
        },
      }
    );
  } catch (error) {
    logger.error('Error in /start:', error);
    await ctx.reply('❌ Error starting bot. Try again later.');
  }
});

// /stats - Статистика
bot.hears('📊 Stats', async (ctx) => {
  try {
    const user = await db('users').where({ telegram_id: ctx.from.id.toString() }).first();
    if (!user) return ctx.reply('❌ User not found');

    const [{ totalGames }] = await db('games')
      .where({ user_id: user.id })
      .count('* as totalGames');

    const [{ totalValue }] = await db('games')
      .where({ user_id: user.id })
      .sum('steam_price_usd as totalValue');

    const distribution = await db('games')
      .where({ user_id: user.id })
      .select('source')
      .count('* as count')
      .groupBy('source');

    let message = `📊 Your Statistics:\n\n`;
    message += `🎮 Total Games: ${totalGames}\n`;
    message += `💰 Total Value: $${(totalValue || 0).toFixed(2)}\n\n`;
    message += `Distribution by Source:\n`;

    distribution.forEach((d) => {
      message += `• ${d.source}: ${d.count}\n`;
    });

    await ctx.reply(message);
  } catch (error) {
    logger.error('Error in /stats:', error);
    await ctx.reply('❌ Error fetching statistics');
  }
});

// 🎮 Recent Games
bot.hears('🎮 Recent Games', async (ctx) => {
  try {
    const user = await db('users').where({ telegram_id: ctx.from.id.toString() }).first();
    if (!user) return ctx.reply('❌ User not found');

    const games = await db('games')
      .where({ user_id: user.id })
      .orderBy('obtained_at', 'desc')
      .limit(5);

    if (games.length === 0) {
      return ctx.reply('📭 No games yet. Click "Run Collection" to start!');
    }

    let message = `🎮 Your 5 Latest Games:\n\n`;
    games.forEach((game, index) => {
      message += `${index + 1}. ${game.title}\n`;
      message += `   Source: ${game.source}\n`;
      message += `   Date: ${new Date(game.obtained_at).toLocaleDateString()}\n\n`;
    });

    await ctx.reply(message);
  } catch (error) {
    logger.error('Error in /recent:', error);
    await ctx.reply('❌ Error fetching games');
  }
});

// 🔄 Run Collection
bot.hears('🔄 Run Collection', async (ctx) => {
  try {
    const user = await db('users').where({ telegram_id: ctx.from.id.toString() }).first();
    if (!user) return ctx.reply('❌ User not found');

    await ctx.reply('🔄 Starting collection process...');

    let total = 0;
    const sources = [
      { name: 'Epic Games', fn: addEpicGamesForUser },
      { name: 'GOG', fn: addGOGGamesForUser },
      { name: 'Steam', fn: addSteamGamesForUser },
    ];

    for (const source of sources) {
      const count = await source.fn(user.id);
      total += count;
      await ctx.reply(`✅ ${source.name}: Added ${count} games`);
    }

    await ctx.reply(`🎉 Collection complete! Total: ${total} new games added`);
    logger.info(`✅ Collection complete for user ${user.id}: ${total} games`);
  } catch (error) {
    logger.error('Error in /run:', error);
    await ctx.reply('❌ Error during collection');
  }
});

// ⚙️ Settings
bot.hears('⚙️ Settings', async (ctx) => {
  const message = 
    `⚙️ Settings\n\n` +
    `🔔 Notifications: Enabled\n` +
    `📅 Frequency: Daily at 10:00\n` +
    `🎮 Sources: All enabled\n\n` +
    `Use /settings to change preferences.`;

  await ctx.reply(message);
});

// ℹ️ Help
bot.hears('ℹ️ Help', async (ctx) => {
  const message =
    `ℹ️ Help\n\n` +
    `📊 Stats - View your game collection statistics\n` +
    `🎮 Recent - See your latest added games\n` +
    `🔄 Run - Start automatic game collection\n` +
    `⚙️ Settings - Configure preferences\n\n` +
    `Questions? Visit https://github.com/derneder/free-games-claimer`;

  await ctx.reply(message);
});

// /help command
bot.command('help', (ctx) => {
  ctx.hears('ℹ️ Help')(ctx);
});

bot.launch();

logger.info('🤖 Telegram bot started');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default bot;