/**
 * Encryption Utilities
 *
 * Provides AES-256-GCM encryption/decryption for sensitive data.
 * Implements per-record IV, authentication tags, and key versioning.
 *
 * @module src/utils/encryption
 */

import crypto from 'crypto';
import { logger } from '../config/logger.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const KEY_LENGTH = 32; // 256 bits

/**
 * Get encryption key from environment
 *
 * @param {number} version - Key version (default: 1)
 * @returns {Buffer} Encryption key
 * @throws {Error} If key is not configured
 */
function getEncryptionKey(version = 1) {
  const keyEnvVar = version === 1 ? 'CREDENTIALS_ENC_KEY' : `CREDENTIALS_ENC_KEY_V${version}`;
  const keyBase64 = process.env[keyEnvVar];

  if (!keyBase64) {
    throw new Error(`Encryption key not configured: ${keyEnvVar}`);
  }

  const key = Buffer.from(keyBase64, 'base64');

  if (key.length !== KEY_LENGTH) {
    throw new Error(
      `Invalid encryption key length: expected ${KEY_LENGTH} bytes, got ${key.length} bytes`
    );
  }

  return key;
}

/**
 * Get current key version from environment
 *
 * @returns {number} Current key version
 */
export function getCurrentKeyVersion() {
  return parseInt(process.env.CREDENTIALS_KEY_VERSION || '1', 10);
}

/**
 * Encrypt sensitive data using AES-256-GCM
 *
 * @param {Object} data - Data to encrypt
 * @param {number} keyVersion - Key version to use (optional, defaults to current)
 * @returns {Object} Encrypted payload with metadata
 * @throws {Error} If encryption fails
 */
export function encryptCredentials(data, keyVersion = null) {
  try {
    const version = keyVersion || getCurrentKeyVersion();
    const key = getEncryptionKey(version);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Serialize data to JSON
    const plaintext = JSON.stringify(data);

    // Encrypt
    let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
    ciphertext += cipher.final('base64');

    // Get authentication tag
    const authTag = cipher.getAuthTag();

    return {
      ciphertext,
      iv: iv.toString('base64'),
      tag: authTag.toString('base64'),
      keyVersion: version,
    };
  } catch (error) {
    logger.error('Encryption failed:', error);
    throw new Error('Failed to encrypt credentials');
  }
}

/**
 * Decrypt sensitive data using AES-256-GCM
 *
 * @param {Object} encryptedData - Encrypted payload with metadata
 * @param {string} encryptedData.ciphertext - Base64 encrypted data
 * @param {string} encryptedData.iv - Base64 initialization vector
 * @param {string} encryptedData.tag - Base64 authentication tag
 * @param {number} encryptedData.keyVersion - Key version used for encryption
 * @returns {Object} Decrypted data
 * @throws {Error} If decryption fails or authentication fails
 */
export function decryptCredentials(encryptedData) {
  try {
    const { ciphertext, iv, tag, keyVersion } = encryptedData;

    if (!ciphertext || !iv || !tag || !keyVersion) {
      throw new Error('Missing required encryption metadata');
    }

    const key = getEncryptionKey(keyVersion);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'base64'));

    // Set authentication tag
    decipher.setAuthTag(Buffer.from(tag, 'base64'));

    // Decrypt
    let plaintext = decipher.update(ciphertext, 'base64', 'utf8');
    plaintext += decipher.final('utf8');

    // Parse JSON
    return JSON.parse(plaintext);
  } catch (error) {
    logger.error('Decryption failed:', error.message);
    throw new Error('Failed to decrypt credentials');
  }
}

/**
 * Re-encrypt data with a new key version
 *
 * @param {Object} encryptedData - Currently encrypted data
 * @param {number} newKeyVersion - New key version to use
 * @returns {Object} Re-encrypted payload
 */
export function rotateEncryption(encryptedData, newKeyVersion) {
  try {
    // Decrypt with old key
    const plainData = decryptCredentials(encryptedData);

    // Re-encrypt with new key
    return encryptCredentials(plainData, newKeyVersion);
  } catch (error) {
    logger.error('Key rotation failed:', error);
    throw new Error('Failed to rotate encryption key');
  }
}

/**
 * Mask sensitive data for logging
 *
 * @param {Object} data - Data to mask
 * @param {string[]} sensitiveFields - Fields to mask (default: common sensitive fields)
 * @returns {Object} Masked data
 */
export function maskSensitiveData(
  data,
  sensitiveFields = ['password', 'token', 'secret', 'otpSecret', 'cookies', 'sessionToken']
) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const masked = { ...data };

  for (const field of sensitiveFields) {
    if (masked[field]) {
      if (typeof masked[field] === 'string') {
        const value = masked[field];
        // Always fully mask passwords for security
        if (field === 'password') {
          masked[field] = '***';
        } else if (value.length > 8) {
          // Show first 2 and last 2 characters for other sensitive fields
          masked[field] = `${value.substring(0, 2)}...${value.substring(value.length - 2)}`;
        } else {
          masked[field] = '***';
        }
      } else {
        masked[field] = '***';
      }
    }
  }

  return masked;
}

/**
 * Generate a new encryption key (for setup/rotation)
 * This is a utility function for administrators
 *
 * @returns {string} Base64 encoded 256-bit key
 */
export function generateEncryptionKey() {
  return crypto.randomBytes(KEY_LENGTH).toString('base64');
}

/**
 * Validate encrypted data structure
 *
 * @param {Object} data - Data to validate
 * @returns {boolean} True if valid
 */
export function isValidEncryptedData(data) {
  return !!(
    data &&
    typeof data === 'object' &&
    typeof data.ciphertext === 'string' &&
    typeof data.iv === 'string' &&
    typeof data.tag === 'string' &&
    typeof data.keyVersion === 'number'
  );
}
