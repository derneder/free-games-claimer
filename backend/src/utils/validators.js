/**
 * Validation Utility Functions
 *
 * Helper functions for common validation patterns.
 *
 * @module src/utils/validators
 */

/**
 * Validate email format
 *
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 *
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one digit
 * - At least one special character
 *
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
export function validatePassword(password) {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  const isValid = minLength && hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar;

  return {
    isValid,
    requirements: {
      minLength: { met: minLength, message: 'At least 8 characters' },
      hasUpperCase: { met: hasUpperCase, message: 'At least one uppercase letter' },
      hasLowerCase: { met: hasLowerCase, message: 'At least one lowercase letter' },
      hasDigit: { met: hasDigit, message: 'At least one digit' },
      hasSpecialChar: { met: hasSpecialChar, message: 'At least one special character' },
    },
  };
}

/**
 * Validate UUID format
 *
 * @param {string} uuid - UUID to validate
 * @returns {boolean} True if valid UUID
 */
export function isValidUUID(uuid) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate URL format
 *
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Validate number range
 *
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value (inclusive)
 * @param {number} max - Maximum value (inclusive)
 * @returns {boolean} True if within range
 */
export function isInRange(value, min, max) {
  return value >= min && value <= max;
}
