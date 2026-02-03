/**
 * Cryptography Utilities
 * 
 * Helper functions for encryption, hashing, and secure operations.
 * 
 * @module src/utils/crypto
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Hash password using bcrypt
 * 
 * @param {string} password - Password to hash
 * @param {number} saltRounds - Number of salt rounds (default: 10)
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password, saltRounds = 10) {
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 * 
 * @param {string} password - Password to compare
 * @param {string} hash - Password hash
 * @returns {Promise<boolean>} True if passwords match
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generate random token
 * 
 * @param {number} length - Token length in bytes (default: 32)
 * @returns {string} Random token
 */
export function generateRandomToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate random code (e.g., for 2FA)
 * 
 * @param {number} length - Code length (default: 6)
 * @returns {string} Random code
 */
export function generateRandomCode(length = 6) {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += digits.charAt(Math.floor(Math.random() * 10));
  }
  return code;
}

/**
 * Encrypt string using AES-256
 * 
 * @param {string} text - Text to encrypt
 * @param {string} key - Encryption key (32 bytes)
 * @returns {string} Encrypted text
 */
export function encrypt(text, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt string using AES-256
 * 
 * @param {string} text - Text to decrypt
 * @param {string} key - Encryption key (32 bytes)
 * @returns {string} Decrypted text
 */
export function decrypt(text, key) {
  const [ivHex, encrypted] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
}

/**
 * Generate SHA256 hash
 * 
 * @param {string} text - Text to hash
 * @returns {string} SHA256 hash
 */
export function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Generate HMAC SHA256
 * 
 * @param {string} text - Text to hash
 * @param {string} secret - Secret key
 * @returns {string} HMAC SHA256 hash
 */
export function hmacSha256(text, secret) {
  return crypto.createHmac('sha256', secret).update(text).digest('hex');
}
