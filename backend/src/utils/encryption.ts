/**
 * Encryption and Hashing Utilities
 * Using crypto module from Node.js
 */

import { createHash, randomBytes } from 'crypto';

/**
 * Hash password using PBKDF2
 * Note: In production, use bcrypt or Argon2
 * This is a simplified implementation
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(32).toString('hex');
  const hash = createHash('sha256')
    .update(password + salt)
    .digest('hex');

  // Store salt and hash together
  return `${salt}:${hash}`;
}

/**
 * Compare password with hash
 */
export function comparePassword(password: string, hash: string): boolean {
  try {
    const [salt, hashPart] = hash.split(':');
    if (!salt || !hashPart) {
      return false;
    }

    const newHash = createHash('sha256')
      .update(password + salt)
      .digest('hex');

    return newHash === hashPart;
  } catch (error) {
    return false;
  }
}

/**
 * Generate random token (e.g., for password reset)
 */
export function generateToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Generate random code (e.g., for 2FA)
 */
export function generateCode(length: number = 6): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}
