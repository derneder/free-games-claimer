import { Telegraf, session, Markup } from 'telegraf';
import { query } from '../config/database.js';
import logger from '../config/logger.js';
import { addEpicGamesForUser } from '../workers/epicGamesWorker.js';
import { addGOGGamesForUser } from '../workers/gogWorker.js';
import { addSteamGamesForUser } from '../workers/steamWorker.js';
import {
  saveCredentials,
  getAllCredentialStatuses,
  deleteCredentials,
} from '../services/credentialService.js';
import { PROVIDER_NAMES } from '../validators/credentials.js';
import { claimForUser } from '../workers/claimOrchestrator.js';

let bot = null;
let signalHandlersRegistered = false;

/**
 * Setup signal handlers for graceful shutdown
 */
function setupSignalHandlers() {
  if (signalHandlersRegistered) return;

  const stopBot = (signal) => {
    if (bot) {
      logger.info(`Received ${signal}, stopping Telegram bot...`);
      bot.stop(signal);
      bot = null;
      signalHandlersRegistered = false;
    }
  };

  process.once('SIGINT', () => stopBot('SIGINT'));
  process.once('SIGTERM', () => stopBot('SIGTERM'));

  signalHandlersRegistered = true;
}

/**
 * Initialize and start the Telegram bot
 * Only starts if TELEGRAM_BOT_TOKEN is configured
 */
export function initializeTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token || token === 'your-telegram-bot-token-from-botfather') {
    logger.info('ℹ️ Telegram bot not configured (TELEGRAM_BOT_TOKEN not set)');
    return null;
  }

  bot = new Telegraf(token);

  bot.use(session());

  // /start - Инициализация
  bot.command('start', async (ctx) => {
    const telegramId = ctx.from.id.toString();
    const username = ctx.from.username || 'Unknown';
  
    try {
      // Проверяем, есть ли уже пользователь
      let result = await query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
      let user = result.rows[0];
  
      if (!user) {
        // Создаём нового пользователя
        const insertResult = await query(
          `INSERT INTO users (telegram_id, username, email, password, "isActive", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [telegramId, username, `${telegramId}@telegram.local`, 'telegram-user', true, new Date(), new Date()]
        );
        const userId = insertResult.rows[0].id;
        result = await query('SELECT * FROM users WHERE id = $1', [userId]);
        user = result.rows[0];
        logger.info(`✅ New Telegram user: ${username}`);
      }
  
      const keyboard = [
        ['📊 Stats', '🎮 Recent Games'],
        ['🔄 Run Collection', '⚙️ Settings'],
        ['ℹ️ Help'],
      ];
  
      await ctx.reply(
        '🎮 Welcome to Free Games Claimer PRO!\n\n' +
          "I'll help you collect free games from:\n" +
          '• 🏴󠁥󠁳󠁣󠁴󠁿 Epic Games\n' +
          '• 🕹️ GOG\n' +
          '• 🚂 Steam\n' +
          '• 👑 Prime Gaming\n\n' +
          'Choose an action:',
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
      const userResult = await query('SELECT * FROM users WHERE telegram_id = $1', [ctx.from.id.toString()]);
      const user = userResult.rows[0];
      if (!user) return ctx.reply('❌ User not found');
  
      const countResult = await query('SELECT COUNT(*) as total_games FROM games WHERE "userId" = $1', [user.id]);
      const totalGames = countResult.rows[0].total_games;
  
      const valueResult = await query('SELECT SUM(price) as total_value FROM games WHERE "userId" = $1', [user.id]);
      const totalValue = valueResult.rows[0].total_value;
  
      // Note: sources is a JSON array, we'll just count total games for now
      // A proper implementation would parse the JSON to get distribution
  
      let message = '📊 Your Statistics:\n\n';
      message += `🎮 Total Games: ${totalGames}\n`;
      message += `💰 Total Value: $${(totalValue || 0).toFixed(2)}\n`;
  
      await ctx.reply(message);
    } catch (error) {
      logger.error('Error in /stats:', error);
      await ctx.reply('❌ Error fetching statistics');
    }
  });
  
  // 🎮 Recent Games
  bot.hears('🎮 Recent Games', async (ctx) => {
    try {
      const userResult = await query('SELECT * FROM users WHERE telegram_id = $1', [ctx.from.id.toString()]);
      const user = userResult.rows[0];
      if (!user) return ctx.reply('❌ User not found');
  
      const gamesResult = await query(
        'SELECT * FROM games WHERE "userId" = $1 ORDER BY "claimedAt" DESC LIMIT 5',
        [user.id]
      );
      const games = gamesResult.rows;
  
      if (games.length === 0) {
        return ctx.reply('📭 No games yet. Click "Run Collection" to start!');
      }
  
      let message = '🎮 Your 5 Latest Games:\n\n';
      games.forEach((game, index) => {
        message += `${index + 1}. ${game.title}\n`;
        // sources is a JSON array, get first source if available
        const sources = JSON.parse(game.sources || '[]');
        const source = sources.length > 0 ? sources[0] : 'Unknown';
        message += `   Source: ${source}\n`;
        message += `   Date: ${new Date(game.claimedat).toLocaleDateString()}\n\n`;
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
      const userResult = await query('SELECT * FROM users WHERE telegram_id = $1', [ctx.from.id.toString()]);
      const user = userResult.rows[0];
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
      '⚙️ Settings\n\n' +
      '🔔 Notifications: Enabled\n' +
      '📅 Frequency: Daily at 10:00\n' +
      '🎮 Sources: All enabled\n\n' +
      'Use /settings to change preferences.';
  
    await ctx.reply(message);
  });
  
  // ℹ️ Help
  bot.hears('ℹ️ Help', async (ctx) => {
    const message =
      'ℹ️ Help\n\n' +
      '📊 Stats - View your game collection statistics\n' +
      '🎮 Recent - See your latest added games\n' +
      '🔄 Run - Start automatic game collection\n' +
      '⚙️ Settings - Configure preferences\n\n' +
      'Questions? Visit https://github.com/derneder/free-games-claimer';
  
    await ctx.reply(message);
  });
  
  // /help command
  bot.command('help', async (ctx) => {
    const message =
      'ℹ️ Help\n\n' +
      '📊 Stats - View your game collection statistics\n' +
      '🎮 Recent - See your latest added games\n' +
      '🔄 Run - Start automatic game collection\n' +
      '⚙️ Settings - Configure preferences\n\n' +
      'Questions? Visit https://github.com/derneder/free-games-claimer';

    await ctx.reply(message);
  });
  
  // 🔐 Connect Account - Show provider selection
  bot.command('connect', async (ctx) => {
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback('🏴 Epic Games', 'connect_epic'),
        Markup.button.callback('🕹️ GOG', 'connect_gog'),
      ],
      [Markup.button.callback('🚂 Steam', 'connect_steam')],
    ]);
  
    await ctx.reply(
      '🔐 Connect Provider Account\n\n' + 'Choose which provider you want to connect:',
      keyboard
    );
  });
  
  // Handle provider connection callbacks
  bot.action(/connect_(.+)/, async (ctx) => {
    const provider = ctx.match[1];
    ctx.session = ctx.session || {};
    ctx.session.connectingProvider = provider;
  
    await ctx.answerCbQuery();
    await ctx.reply(
      `📝 Connecting ${PROVIDER_NAMES[provider]}\n\n` +
        'Please send your credentials in JSON format:\n\n' +
        'For email/password:\n' +
        '{"email": "your@email.com", "password": "yourpassword"}\n\n' +
        'Or use /cancel to abort.'
    );
  });
  
  // 🗑️ Remove Account - Show provider selection
  bot.command('disconnect', async (ctx) => {
    try {
      const userResult = await query('SELECT * FROM users WHERE telegram_id = $1', [ctx.from.id.toString()]);
      const user = userResult.rows[0];
      if (!user) return ctx.reply('❌ User not found');
  
      const statuses = await getAllCredentialStatuses(user.id);
      const connected = statuses.filter((s) => s.hasCredentials);
  
      if (connected.length === 0) {
        return ctx.reply('ℹ️ No connected accounts found.');
      }
  
      const buttons = connected.map((s) => [
        Markup.button.callback(`Remove ${PROVIDER_NAMES[s.provider]}`, `disconnect_${s.provider}`),
      ]);
  
      const keyboard = Markup.inlineKeyboard(buttons);
      await ctx.reply('🗑️ Select account to remove:', keyboard);
    } catch (error) {
      logger.error('Error in /disconnect:', error);
      await ctx.reply('❌ Error fetching accounts');
    }
  });
  
  // Handle provider disconnection callbacks
  bot.action(/disconnect_(.+)/, async (ctx) => {
    const provider = ctx.match[1];
  
    try {
      const userResult = await query('SELECT * FROM users WHERE telegram_id = $1', [ctx.from.id.toString()]);
      const user = userResult.rows[0];
      if (!user) return ctx.answerCbQuery('User not found');
  
      const deleted = await deleteCredentials(user.id, provider);
  
      if (deleted) {
        await ctx.answerCbQuery('Credentials removed');
        await ctx.editMessageText(`✅ ${PROVIDER_NAMES[provider]} credentials have been removed.`);
      } else {
        await ctx.answerCbQuery('Not found');
        await ctx.editMessageText('❌ No credentials found to remove.');
      }
    } catch (error) {
      logger.error('Error removing credentials:', error);
      await ctx.answerCbQuery('Error occurred');
      await ctx.reply('❌ Error removing credentials');
    }
  });
  
  // 📋 Account Status
  bot.command('accounts', async (ctx) => {
    try {
      const userResult = await query('SELECT * FROM users WHERE telegram_id = $1', [ctx.from.id.toString()]);
      const user = userResult.rows[0];
      if (!user) return ctx.reply('❌ User not found');
  
      const statuses = await getAllCredentialStatuses(user.id);
  
      let message = '📋 Connected Accounts:\n\n';
  
      statuses.forEach((s) => {
        const statusIcon = s.hasCredentials ? (s.status === 'active' ? '✅' : '⚠️') : '❌';
        const statusText = s.hasCredentials
          ? s.status === 'active'
            ? 'Connected'
            : `${s.status}`
          : 'Not connected';
  
        message += `${statusIcon} ${PROVIDER_NAMES[s.provider]}: ${statusText}\n`;
  
        if (s.lastVerifiedAt) {
          const date = new Date(s.lastVerifiedAt).toLocaleDateString();
          message += `   Last verified: ${date}\n`;
        }
        if (s.errorMessage) {
          message += `   Error: ${s.errorMessage.substring(0, 50)}...\n`;
        }
        message += '\n';
      });
  
      message += 'Use /connect to add accounts\n';
      message += 'Use /disconnect to remove accounts';
  
      await ctx.reply(message);
    } catch (error) {
      logger.error('Error in /accounts:', error);
      await ctx.reply('❌ Error fetching account status');
    }
  });
  
  // 🚀 Claim Now - Trigger manual claim
  bot.command('claim', async (ctx) => {
    try {
      const userResult = await query('SELECT * FROM users WHERE telegram_id = $1', [ctx.from.id.toString()]);
      const user = userResult.rows[0];
      if (!user) return ctx.reply('❌ User not found');
  
      const statuses = await getAllCredentialStatuses(user.id);
      const connected = statuses.filter((s) => s.hasCredentials && s.status === 'active');
  
      if (connected.length === 0) {
        return ctx.reply('ℹ️ No active accounts. Use /connect to add accounts first.');
      }
  
      const buttons = connected.map((s) => [
        Markup.button.callback(`Claim from ${PROVIDER_NAMES[s.provider]}`, `claim_${s.provider}`),
      ]);
      buttons.push([Markup.button.callback('🚀 Claim All', 'claim_all')]);
  
      const keyboard = Markup.inlineKeyboard(buttons);
      await ctx.reply('🎮 Select provider to claim from:', keyboard);
    } catch (error) {
      logger.error('Error in /claim:', error);
      await ctx.reply('❌ Error fetching accounts');
    }
  });
  
  // Handle claim callbacks
  bot.action(/claim_(.+)/, async (ctx) => {
    const provider = ctx.match[1];
  
    try {
      const userResult = await query('SELECT * FROM users WHERE telegram_id = $1', [ctx.from.id.toString()]);
      const user = userResult.rows[0];
      if (!user) return ctx.answerCbQuery('User not found');
  
      await ctx.answerCbQuery('Starting claim...');
      await ctx.editMessageText(`⏳ Starting claim for ${PROVIDER_NAMES[provider]}...`);
  
      if (provider === 'all') {
        // Claim from all providers
        const statuses = await getAllCredentialStatuses(user.id);
        const connected = statuses.filter((s) => s.hasCredentials && s.status === 'active');
  
        let totalClaimed = 0;
        for (const status of connected) {
          const result = await claimForUser(user.id, status.provider);
          totalClaimed += result.claimed?.length || 0;
        }
  
        await ctx.reply(`✅ Claim complete! ${totalClaimed} games claimed.`);
      } else {
        // Claim from specific provider
        const result = await claimForUser(user.id, provider);
  
        let message = `📊 Claim Results for ${PROVIDER_NAMES[provider]}:\n\n`;
        message += `✅ Claimed: ${result.claimed?.length || 0}\n`;
        message += `📦 Already Owned: ${result.alreadyOwned?.length || 0}\n`;
        message += `❌ Failed: ${result.failed?.length || 0}\n`;
  
        if (result.errors?.length > 0) {
          message += '\n⚠️ Errors:\n';
          result.errors.slice(0, 3).forEach((err) => {
            message += `• ${err.error}\n`;
          });
        }
  
        await ctx.reply(message);
      }
    } catch (error) {
      logger.error('Error claiming games:', error);
      await ctx.reply('❌ Error claiming games. Please try again later.');
    }
  });
  
  // Handle credential input (when user sends JSON credentials)
  bot.on('text', async (ctx) => {
    if (!ctx.session?.connectingProvider) return;
  
    const provider = ctx.session.connectingProvider;
  
    try {
      // Parse credentials
      const credentials = JSON.parse(ctx.message.text);
  
      // Get user
      const userResult = await query('SELECT * FROM users WHERE telegram_id = $1', [ctx.from.id.toString()]);
      const user = userResult.rows[0];
      if (!user) {
        delete ctx.session.connectingProvider;
        return ctx.reply('❌ User not found');
      }
  
      // Save credentials
      await saveCredentials(user.id, provider, credentials);
  
      delete ctx.session.connectingProvider;
      await ctx.reply(
        `✅ ${PROVIDER_NAMES[provider]} credentials saved successfully!\n\n` +
          'Use /claim to start claiming games.'
      );
    } catch (error) {
      if (error instanceof SyntaxError) {
        await ctx.reply('❌ Invalid JSON format. Please try again or use /cancel to abort.');
      } else {
        logger.error('Error saving credentials:', error);
        delete ctx.session.connectingProvider;
        await ctx.reply('❌ Error saving credentials: ' + error.message);
      }
    }
  });
  
  // /cancel - Cancel current operation
  bot.command('cancel', async (ctx) => {
    if (ctx.session?.connectingProvider) {
      delete ctx.session.connectingProvider;
      await ctx.reply('❌ Operation cancelled.');
    } else {
      await ctx.reply('ℹ️ No operation to cancel.');
    }
  });

  // Start the bot
  bot.launch();
  logger.info('🤖 Telegram bot started successfully');

  // Setup graceful shutdown handlers
  setupSignalHandlers();

  return bot;
}

/**
 * Get the bot instance
 * @returns {Telegraf|null} Bot instance or null if not initialized
 */
export function getTelegramBot() {
  return bot;
}

/**
 * Stop the Telegram bot gracefully
 */
export function stopTelegramBot() {
  if (bot) {
    logger.info('Stopping Telegram bot...');
    bot.stop();
    bot = null;
  }
}

export default { initializeTelegramBot, getTelegramBot, stopTelegramBot };
