/**
 * Epic Games Claimer
 *
 * Automated claiming of free games from Epic Games Store.
 * Implements login, 2FA, and claim logic.
 *
 * NOTE: This claimer uses text-based selectors which are fragile and may break
 * when Epic Games updates their UI or with different localizations.
 * See epicSelectors.js for centralized selector management.
 *
 * @module src/workers/claimers/epicClaimer
 */

import { BaseClaimer } from './baseClaimer.js';
import { logger } from '../../config/logger.js';

export class EpicClaimer extends BaseClaimer {
  constructor(options = {}) {
    super('epic', options);
    this.baseUrl = 'https://www.epicgames.com';
    this.storeUrl = 'https://store.epicgames.com/en-US';
  }

  /**
   * Claim free games from Epic Games Store
   *
   * @param {Object} credentials - User credentials
   * @param {Object} options - Claim options
   * @returns {Promise<Object>} Claim result
   */
  async claim(credentials, options = {}) {
    const result = {
      success: false,
      claimed: [],
      failed: [],
      alreadyOwned: [],
      errors: [],
    };

    try {
      await this.initialize(credentials);

      // Login if not using cookies
      if (!credentials.cookies && credentials.email && credentials.password) {
        const loginSuccess = await this.login(credentials);
        if (!loginSuccess) {
          throw new Error('Login failed');
        }
      }

      // Navigate to free games page
      await this.page.goto(`${this.storeUrl}/free-games`, { waitUntil: 'networkidle' });
      await this.page.waitForTimeout(2000);

      // Find free games
      const freeGames = await this.findFreeGames();
      logger.info(`Found ${freeGames.length} free games`);

      // Attempt to claim each game
      for (const game of freeGames) {
        try {
          const claimResult = await this.claimGame(game);
          if (claimResult.success) {
            if (claimResult.alreadyOwned) {
              result.alreadyOwned.push(game);
            } else {
              result.claimed.push(game);
            }
          } else {
            result.failed.push(game);
          }
        } catch (error) {
          logger.error(`Failed to claim ${game.title}:`, error);
          result.failed.push(game);
          result.errors.push({ game: game.title, error: error.message });
        }
      }

      result.success = result.errors.length === 0 || result.claimed.length > 0;
    } catch (error) {
      logger.error('Epic Games claim process failed:', error);
      result.errors.push({ error: error.message });
    } finally {
      await this.cleanup();
    }

    return result;
  }

  /**
   * Login to Epic Games
   *
   * @param {Object} credentials - Login credentials
   * @returns {Promise<boolean>} Success status
   */
  async login(credentials) {
    try {
      logger.info('Logging in to Epic Games...');

      // Navigate to login page
      await this.page.goto(`${this.baseUrl}/login`, { waitUntil: 'networkidle' });

      // Wait for login form
      await this.page.waitForSelector('#email', { timeout: 10000 });

      // Fill in email and password
      await this.page.fill('#email', credentials.email);
      await this.page.fill('#password', credentials.password);

      // Submit login form
      await this.waitForNavigationWithRetries(async () => {
        await this.page.click('#sign-in');
      });

      // Handle 2FA if OTP secret is provided
      if (credentials.otpSecret) {
        const needs2FA = await this.page.$('input[name="code"]').catch(() => null);
        if (needs2FA) {
          const otpCode = this.generateTOTP(credentials.otpSecret);
          await this.page.fill('input[name="code"]', otpCode);
          await this.page.click('button[type="submit"]');
          await this.page.waitForNavigation({ waitUntil: 'networkidle' });
        }
      }

      // Handle parental PIN if needed
      if (process.env.EPIC_PARENTAL_PIN || credentials.parentalPin) {
        const needsPin = await this.page.$('input[type="password"][maxlength="4"]').catch(() => null);
        if (needsPin) {
          const pin = credentials.parentalPin || process.env.EPIC_PARENTAL_PIN;
          await this.page.fill('input[type="password"][maxlength="4"]', pin);
          await this.page.click('button[type="submit"]');
          await this.page.waitForTimeout(1000);
        }
      }

      // Verify login success
      await this.page.waitForTimeout(2000);
      const loggedIn = await this.isLoggedIn();

      if (loggedIn) {
        logger.info('Epic Games login successful');
        return true;
      } else {
        logger.error('Epic Games login failed - not logged in');
        return false;
      }
    } catch (error) {
      logger.error('Epic Games login error:', error);
      await this.takeScreenshot('login-error');
      return false;
    }
  }

  /**
   * Check if user is logged in
   *
   * @returns {Promise<boolean>} Login status
   */
  async isLoggedIn() {
    try {
      // Check for user menu or account icon
      const userMenu = await this.page.$('[data-component="AccountMenu"]').catch(() => null);
      return !!userMenu;
    } catch (error) {
      return false;
    }
  }

  /**
   * Find available free games
   *
   * @returns {Promise<Array>} List of free games
   */
  async findFreeGames() {
    const games = [];

    try {
      // Wait for game cards to load
      await this.page.waitForSelector('[data-testid="offer-card"]', { timeout: 10000 });

      // Extract game information
      const gameCards = await this.page.$$('[data-testid="offer-card"]');

      for (const card of gameCards) {
        try {
          const title = await card.$eval('[data-testid="offer-title"]', el => el.textContent).catch(() => 'Unknown');
          const price = await card.$eval('[data-testid="offer-price"]', el => el.textContent).catch(() => '');
          const url = await card.$eval('a', el => el.href).catch(() => '');

          // Only include if it's free
          if (price.includes('Free') || price.includes('$0')) {
            games.push({ title, url });
          }
        } catch (error) {
          logger.warn('Failed to extract game info:', error.message);
        }
      }
    } catch (error) {
      logger.error('Failed to find free games:', error);
    }

    return games;
  }

  /**
   * Claim a specific game
   *
   * @param {Object} game - Game to claim
   * @returns {Promise<Object>} Claim result
   */
  async claimGame(game) {
    try {
      logger.info(`Claiming game: ${game.title}`);

      // Navigate to game page
      await this.page.goto(game.url, { waitUntil: 'networkidle' });
      await this.page.waitForTimeout(2000);

      // Check if already owned
      const ownedButton = await this.page.$('button:has-text("In Library")').catch(() => null);
      if (ownedButton) {
        logger.info(`Game already owned: ${game.title}`);
        return { success: true, alreadyOwned: true };
      }

      // Click "Get" button
      const getButton = await this.page.$('button:has-text("Get")').catch(() => null);
      if (!getButton) {
        logger.warn(`No "Get" button found for ${game.title}`);
        return { success: false };
      }

      await getButton.click();
      await this.page.waitForTimeout(1000);

      // Handle purchase flow
      const placeOrderButton = await this.page.$('button:has-text("Place Order")').catch(() => null);
      if (placeOrderButton) {
        await placeOrderButton.click();
        await this.page.waitForTimeout(2000);
      }

      // Verify claim success
      const successIndicator = await this.page.$('text=Thank you for your order').catch(() => null);
      if (successIndicator) {
        logger.info(`Successfully claimed: ${game.title}`);
        return { success: true, alreadyOwned: false };
      }

      logger.warn(`Claim status unclear for ${game.title}`);
      return { success: false };
    } catch (error) {
      logger.error(`Failed to claim ${game.title}:`, error);
      await this.takeScreenshot(`claim-error-${game.title}`);
      return { success: false };
    }
  }
}

/**
 * Factory function to create and run Epic claimer
 *
 * @param {Object} credentials - User credentials
 * @param {Object} options - Claim options
 * @returns {Promise<Object>} Claim result
 */
export async function runEpicClaimer(credentials, options = {}) {
  const claimer = new EpicClaimer(options);
  return await claimer.claim(credentials, options);
}
