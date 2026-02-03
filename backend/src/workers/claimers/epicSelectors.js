/**
 * Epic Games Selectors
 *
 * Centralized selectors for Epic Games Store elements.
 * These may need to be updated when Epic changes their UI.
 *
 * NOTE: Text-based selectors are fragile and may break with:
 * - Localization (different languages)
 * - UI updates
 * - A/B testing
 *
 * @module src/workers/claimers/epicSelectors
 */

export const EPIC_SELECTORS = {
  // Login page
  LOGIN: {
    EMAIL_INPUT: '#email',
    PASSWORD_INPUT: '#password',
    SUBMIT_BUTTON: '#sign-in',
    OTP_INPUT: 'input[name="code"]',
    PARENTAL_PIN_INPUT: 'input[type="password"][maxlength="4"]',
  },

  // Account menu
  ACCOUNT: {
    USER_MENU: '[data-component="AccountMenu"]',
  },

  // Store page
  STORE: {
    OFFER_CARD: '[data-testid="offer-card"]',
    OFFER_TITLE: '[data-testid="offer-title"]',
    OFFER_PRICE: '[data-testid="offer-price"]',
  },

  // Game page (text-based - may need updates)
  GAME: {
    IN_LIBRARY_BUTTON: 'button:has-text("In Library")',
    GET_BUTTON: 'button:has-text("Get")',
    PLACE_ORDER_BUTTON: 'button:has-text("Place Order")',
    SUCCESS_TEXT: 'text=Thank you for your order',
  },
};

/**
 * Alternative selectors to try if primary fails
 */
export const EPIC_SELECTORS_FALLBACK = {
  GAME: {
    // Try these if text-based selectors fail
    IN_LIBRARY_BUTTON_ALT: '[data-component="PurchaseCTA"][disabled]',
    GET_BUTTON_ALT: '[data-component="PurchaseCTA"]:not([disabled])',
  },
};

/**
 * Get selector with fallback
 *
 * @param {Object} page - Playwright page
 * @param {string} primary - Primary selector
 * @param {string} fallback - Fallback selector
 * @returns {Promise<Element|null>} Element or null
 */
export async function getSelectorWithFallback(page, primary, fallback) {
  try {
    const element = await page.$(primary);
    if (element) return element;

    if (fallback) {
      return await page.$(fallback);
    }

    return null;
  } catch (error) {
    if (fallback) {
      return await page.$(fallback).catch(() => null);
    }
    return null;
  }
}
