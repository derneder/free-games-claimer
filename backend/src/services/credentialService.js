/**
 * Credential Service
 *
 * Service layer for managing encrypted user credentials.
 * Handles CRUD operations, encryption/decryption, and audit logging.
 *
 * @module src/services/credentialService
 */

import { query } from '../config/database.js';
import { logger } from '../config/logger.js';
import {
  encryptCredentials,
  decryptCredentials,
  maskSensitiveData,
  rotateEncryption,
  getCurrentKeyVersion,
} from '../utils/encryption.js';
import { validateCredentials, VALID_PROVIDERS } from '../validators/credentials.js';

/**
 * Save or update user credentials for a provider
 *
 * @param {string} userId - User ID
 * @param {string} provider - Provider name (epic, gog, steam)
 * @param {Object} credentials - Provider credentials
 * @param {Object} metadata - Request metadata (ip, userAgent)
 * @returns {Promise<Object>} Saved credential info (without sensitive data)
 * @throws {Error} If validation or save fails
 */
export async function saveCredentials(userId, provider, credentials, metadata = {}) {
  // Validate provider
  if (!VALID_PROVIDERS.includes(provider)) {
    throw new Error(`Invalid provider: ${provider}`);
  }

  // Validate credentials structure
  const { error, value } = validateCredentials(provider, credentials);
  if (error) {
    throw new Error(`Invalid credentials: ${error.message}`);
  }

  // Encrypt credentials
  const encryptedData = encryptCredentials(value);

  try {
    // Check if credentials already exist
    const existing = await query(
      'SELECT id FROM user_credentials WHERE user_id = $1 AND provider = $2',
      [userId, provider]
    );

    let result;
    if (existing.rows.length > 0) {
      // Update existing
      result = await query(
        `UPDATE user_credentials 
         SET enc_data = $1, key_version = $2, status = $3, error_message = NULL, updated_at = NOW()
         WHERE user_id = $4 AND provider = $5
         RETURNING id, user_id, provider, status, key_version, created_at, updated_at`,
        [
          JSON.stringify(encryptedData),
          encryptedData.keyVersion,
          'active',
          userId,
          provider,
        ]
      );

      // Log audit event
      await logCredentialAudit(userId, provider, 'updated', metadata);
    } else {
      // Insert new
      result = await query(
        `INSERT INTO user_credentials (user_id, provider, enc_data, key_version, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id, provider, status, key_version, created_at, updated_at`,
        [
          userId,
          provider,
          JSON.stringify(encryptedData),
          encryptedData.keyVersion,
          'active',
        ]
      );

      // Log audit event
      await logCredentialAudit(userId, provider, 'created', metadata);
    }

    logger.info(`Credentials saved for user ${userId}, provider ${provider}`);
    return result.rows[0];
  } catch (error) {
    logger.error(`Failed to save credentials for user ${userId}, provider ${provider}:`, error);
    throw new Error('Failed to save credentials');
  }
}

/**
 * Get user credentials for a provider (decrypted, for worker use only)
 *
 * @param {string} userId - User ID
 * @param {string} provider - Provider name
 * @returns {Promise<Object|null>} Decrypted credentials or null if not found
 */
export async function getCredentials(userId, provider) {
  try {
    const result = await query(
      `SELECT id, enc_data, key_version, status, error_message, last_verified_at
       FROM user_credentials
       WHERE user_id = $1 AND provider = $2`,
      [userId, provider]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const record = result.rows[0];

    // Check if credentials are active
    if (record.status !== 'active') {
      logger.warn(
        `Attempted to get inactive credentials for user ${userId}, provider ${provider}`
      );
      return null;
    }

    // Decrypt credentials
    const decrypted = decryptCredentials(record.enc_data);

    return {
      id: record.id,
      credentials: decrypted,
      status: record.status,
      errorMessage: record.error_message,
      lastVerifiedAt: record.last_verified_at,
    };
  } catch (error) {
    logger.error(`Failed to get credentials for user ${userId}, provider ${provider}:`, error);
    throw new Error('Failed to retrieve credentials');
  }
}

/**
 * Get credential status for a provider (without sensitive data)
 *
 * @param {string} userId - User ID
 * @param {string} provider - Provider name
 * @returns {Promise<Object|null>} Credential status or null if not found
 */
export async function getCredentialStatus(userId, provider) {
  try {
    const result = await query(
      `SELECT id, provider, status, error_message, last_verified_at, created_at, updated_at
       FROM user_credentials
       WHERE user_id = $1 AND provider = $2`,
      [userId, provider]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const record = result.rows[0];
    return {
      id: record.id,
      provider: record.provider,
      hasCredentials: true,
      status: record.status,
      errorMessage: record.error_message,
      lastVerifiedAt: record.last_verified_at,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  } catch (error) {
    logger.error(
      `Failed to get credential status for user ${userId}, provider ${provider}:`,
      error
    );
    throw new Error('Failed to retrieve credential status');
  }
}

/**
 * Get all credential statuses for a user
 *
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of credential statuses
 */
export async function getAllCredentialStatuses(userId) {
  try {
    const result = await query(
      `SELECT id, provider, status, error_message, last_verified_at, created_at, updated_at
       FROM user_credentials
       WHERE user_id = $1
       ORDER BY provider`,
      [userId]
    );

    return result.rows.map((record) => ({
      id: record.id,
      provider: record.provider,
      hasCredentials: true,
      status: record.status,
      errorMessage: record.error_message,
      lastVerifiedAt: record.last_verified_at,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    }));
  } catch (error) {
    logger.error(`Failed to get credential statuses for user ${userId}:`, error);
    throw new Error('Failed to retrieve credential statuses');
  }
}

/**
 * Delete user credentials for a provider
 *
 * @param {string} userId - User ID
 * @param {string} provider - Provider name
 * @param {Object} metadata - Request metadata
 * @returns {Promise<boolean>} True if deleted
 */
export async function deleteCredentials(userId, provider, metadata = {}) {
  try {
    const result = await query(
      'DELETE FROM user_credentials WHERE user_id = $1 AND provider = $2 RETURNING id',
      [userId, provider]
    );

    if (result.rows.length > 0) {
      await logCredentialAudit(userId, provider, 'deleted', metadata);
      logger.info(`Credentials deleted for user ${userId}, provider ${provider}`);
      return true;
    }

    return false;
  } catch (error) {
    logger.error(`Failed to delete credentials for user ${userId}, provider ${provider}:`, error);
    throw new Error('Failed to delete credentials');
  }
}

/**
 * Update credential status (e.g., after verification or claim attempt)
 *
 * @param {string} userId - User ID
 * @param {string} provider - Provider name
 * @param {string} status - New status
 * @param {string} errorMessage - Error message (optional)
 * @returns {Promise<void>}
 */
export async function updateCredentialStatus(userId, provider, status, errorMessage = null) {
  try {
    await query(
      `UPDATE user_credentials
       SET status = $1, error_message = $2, updated_at = NOW()
       WHERE user_id = $3 AND provider = $4`,
      [status, errorMessage, userId, provider]
    );

    logger.info(`Credential status updated for user ${userId}, provider ${provider}: ${status}`);
  } catch (error) {
    logger.error(
      `Failed to update credential status for user ${userId}, provider ${provider}:`,
      error
    );
    throw new Error('Failed to update credential status');
  }
}

/**
 * Mark credentials as verified
 *
 * @param {string} userId - User ID
 * @param {string} provider - Provider name
 * @returns {Promise<void>}
 */
export async function markCredentialsVerified(userId, provider) {
  try {
    await query(
      `UPDATE user_credentials
       SET last_verified_at = NOW(), status = 'active', error_message = NULL
       WHERE user_id = $1 AND provider = $2`,
      [userId, provider]
    );

    await logCredentialAudit(userId, provider, 'verified');
    logger.info(`Credentials verified for user ${userId}, provider ${provider}`);
  } catch (error) {
    logger.error(`Failed to mark credentials as verified for user ${userId}, provider ${provider}:`, error);
    throw new Error('Failed to mark credentials as verified');
  }
}

/**
 * Rotate encryption key for credentials
 *
 * @param {string} userId - User ID
 * @param {string} provider - Provider name
 * @param {number} newKeyVersion - New key version
 * @returns {Promise<void>}
 */
export async function rotateCredentialKey(userId, provider, newKeyVersion) {
  try {
    // Get current encrypted data
    const result = await query(
      'SELECT enc_data FROM user_credentials WHERE user_id = $1 AND provider = $2',
      [userId, provider]
    );

    if (result.rows.length === 0) {
      throw new Error('Credentials not found');
    }

    // Rotate encryption
    const rotatedData = rotateEncryption(result.rows[0].enc_data, newKeyVersion);

    // Update with new encryption
    await query(
      `UPDATE user_credentials
       SET enc_data = $1, key_version = $2, last_rotated_at = NOW()
       WHERE user_id = $3 AND provider = $4`,
      [JSON.stringify(rotatedData), newKeyVersion, userId, provider]
    );

    logger.info(`Encryption key rotated for user ${userId}, provider ${provider}`);
  } catch (error) {
    logger.error(`Failed to rotate key for user ${userId}, provider ${provider}:`, error);
    throw new Error('Failed to rotate encryption key');
  }
}

/**
 * Log credential audit event
 *
 * @param {string} userId - User ID
 * @param {string} provider - Provider name
 * @param {string} action - Action performed
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<void>}
 */
async function logCredentialAudit(userId, provider, action, metadata = {}) {
  try {
    await query(
      `INSERT INTO credential_audit_log (user_id, provider, action, ip_address, user_agent, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        provider,
        action,
        metadata.ip || null,
        metadata.userAgent || null,
        JSON.stringify(maskSensitiveData(metadata)),
      ]
    );
  } catch (error) {
    // Log error but don't throw - audit logging should not break the main flow
    logger.error(`Failed to log credential audit for user ${userId}:`, error);
  }
}

/**
 * Get users with active credentials for a provider
 *
 * @param {string} provider - Provider name
 * @returns {Promise<Array>} Array of user IDs
 */
export async function getUsersWithCredentials(provider) {
  try {
    const result = await query(
      `SELECT user_id FROM user_credentials
       WHERE provider = $1 AND status = 'active'
       ORDER BY created_at`,
      [provider]
    );

    return result.rows.map((row) => row.user_id);
  } catch (error) {
    logger.error(`Failed to get users with credentials for provider ${provider}:`, error);
    throw new Error('Failed to get users with credentials');
  }
}
