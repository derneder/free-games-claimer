/**
 * Base Claimer
 *
 * Base class for provider claim workers.
 * Provides common functionality for claiming free games.
 *
 * @module src/workers/claimers/baseClaimer
 */

import { firefox } from 'playwright';
import { logger } from '../../config/logger.js';
import * as OTPAuth from 'otplib';

export class BaseClaimer {
  constructor(provider, options = {}) {
    this.provider = provider;
    this.options = {
      headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
      timeout: parseInt(process.env.PLAYWRIGHT_TIMEOUT || '30000', 10),
      slowMo: parseInt(process.env.PLAYWRIGHT_SLOW_MO || '0', 10),
      ...options,
    };
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  /**
   * Initialize browser and context
   *
   * @param {Object} credentials - User credentials
   * @returns {Promise<void>}
   */
  async initialize(credentials) {
    try {
      logger.info(`Initializing ${this.provider} claimer`);

      // Launch browser (Firefox recommended for better stealth)
      this.browser = await firefox.launch({
        headless: this.options.headless,
        slowMo: this.options.slowMo,
        args: this.getBrowserArgs(),
      });

      // Create context
      const contextOptions = {
        viewport: { width: 1280, height: 720 },
        userAgent: this.getUserAgent(),
        locale: 'en-US',
        timezoneId: 'America/New_York',
      };

      // Add proxy if configured
      if (process.env.PROXY_URL) {
        const proxyUrl = new URL(process.env.PROXY_URL);
        contextOptions.proxy = {
          server: `${proxyUrl.protocol}//${proxyUrl.host}`,
          username: proxyUrl.username,
          password: proxyUrl.password,
        };
      }

      this.context = await this.browser.newContext(contextOptions);

      // Load cookies if provided
      if (credentials.cookies && credentials.cookies.length > 0) {
        await this.context.addCookies(credentials.cookies);
        logger.info(`Loaded ${credentials.cookies.length} cookies`);
      }

      // Create page
      this.page = await this.context.newPage();
      this.page.setDefaultTimeout(this.options.timeout);

      // Add stealth measures
      await this.addStealthMeasures();

      logger.info(`${this.provider} claimer initialized`);
    } catch (error) {
      logger.error(`Failed to initialize ${this.provider} claimer:`, error);
      throw error;
    }
  }

  /**
   * Get browser launch arguments
   *
   * @returns {Array<string>} Browser arguments
   */
  getBrowserArgs() {
    return [
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--no-sandbox',
    ];
  }

  /**
   * Get user agent string
   *
   * @returns {string} User agent
   */
  getUserAgent() {
    return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  }

  /**
   * Add stealth measures to avoid detection
   *
   * @returns {Promise<void>}
   */
  async addStealthMeasures() {
    if (!this.page) return;

    // Override navigator properties (runs in browser context)
    /* eslint-disable no-undef */
    await this.page.addInitScript(() => {
      // Override webdriver property
      Object.defineProperty(Object.getPrototypeOf(navigator), 'webdriver', {
        get: () => undefined,
      });

      // Override plugins
      Object.defineProperty(Object.getPrototypeOf(navigator), 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });

      // Override languages
      Object.defineProperty(Object.getPrototypeOf(navigator), 'languages', {
        get: () => ['en-US', 'en'],
      });
    });
    /* eslint-enable no-undef */
  }

  /**
   * Generate TOTP code if OTP secret is provided
   *
   * @param {string} otpSecret - OTP secret
   * @returns {string} TOTP code
   */
  generateTOTP(otpSecret) {
    if (!otpSecret) return null;
    return OTPAuth.authenticator.generate(otpSecret);
  }

  /**
   * Wait for navigation with retries
   *
   * @param {Function} action - Action that triggers navigation
   * @param {Object} options - Wait options
   * @returns {Promise<void>}
   */
  async waitForNavigationWithRetries(action, options = {}) {
    const maxRetries = options.maxRetries || 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        await Promise.all([
          this.page.waitForNavigation({ timeout: this.options.timeout, ...options }),
          action(),
        ]);
        return;
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          throw error;
        }
        logger.warn(`Navigation attempt ${attempt} failed, retrying...`);
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Take screenshot for debugging
   *
   * @param {string} name - Screenshot name
   * @returns {Promise<void>}
   */
  async takeScreenshot(name) {
    if (!this.page || this.options.headless) return;

    try {
      const path = `/tmp/${this.provider}-${name}-${Date.now()}.png`;
      await this.page.screenshot({ path });
      logger.debug(`Screenshot saved: ${path}`);
    } catch (error) {
      logger.warn('Failed to take screenshot:', error.message);
    }
  }

  /**
   * Close browser and cleanup
   *
   * @returns {Promise<void>}
   */
  async cleanup() {
    try {
      if (this.page) {
        await this.page.close();
        this.page = null;
      }
      if (this.context) {
        await this.context.close();
        this.context = null;
      }
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }
      logger.info(`${this.provider} claimer cleaned up`);
    } catch (error) {
      logger.error(`Cleanup error for ${this.provider}:`, error);
    }
  }

  /**
   * Claim free games (to be implemented by subclasses)
   *
   * @param {Object} _credentials - User credentials
   * @returns {Promise<Object>} Claim result
   */
  async claim(_credentials) {
    throw new Error('claim() must be implemented by subclass');
  }
}
