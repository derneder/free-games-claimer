/**
 * Input Validation Utilities
 */

/**
 * Email regex pattern
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  return EMAIL_REGEX.test(email.trim().toLowerCase());
}

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePassword(password: string): boolean {
  if (!password || typeof password !== 'string' || password.length < 8) {
    return false;
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
}

/**
 * Get password strength message
 */
export function getPasswordStrengthMessage(password: string): string {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain an uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain a lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain a number';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must contain a special character';
  }
  return 'Password is strong';
}

/**
 * Validate input string length
 */
export function validateInputLength(
  input: string,
  minLength: number = 1,
  maxLength: number = 255
): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }
  const length = input.trim().length;
  return length >= minLength && length <= maxLength;
}

/**
 * Validate input object
 */
export function validateInput(data: Record<string, unknown>, schema: Record<string, Function>): boolean {
  for (const [key, validator] of Object.entries(schema)) {
    if (!validator(data[key])) {
      return false;
    }
  }
  return true;
}

/**
 * Sanitize string input
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return input
    .trim()
    .replace(/[<>"']/g, (char) => {
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return escapeMap[char] || char;
    });
}
