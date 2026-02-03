/**
 * Credentials Controller
 *
 * Handles HTTP requests for credential management.
 * Provides CRUD operations for provider credentials.
 *
 * @module src/controllers/credentialsController
 */

import {
  saveCredentials,
  getCredentialStatus,
  getAllCredentialStatuses,
  deleteCredentials,
} from '../services/credentialService.js';
import { VALID_PROVIDERS, PROVIDER_NAMES } from '../validators/credentials.js';
import { logger } from '../config/logger.js';

/**
 * Get all credential statuses for authenticated user
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
export async function getAllStatuses(req, res, next) {
  try {
    const userId = req.user.id;
    const statuses = await getAllCredentialStatuses(userId);

    // Add providers without credentials
    const providersWithCredentials = statuses.map((s) => s.provider);
    const allProviders = VALID_PROVIDERS.map((provider) => {
      const existing = statuses.find((s) => s.provider === provider);
      if (existing) {
        return existing;
      }
      return {
        provider,
        hasCredentials: false,
        status: null,
        errorMessage: null,
        lastVerifiedAt: null,
        createdAt: null,
        updatedAt: null,
      };
    });

    res.json({
      success: true,
      data: allProviders,
    });
  } catch (error) {
    logger.error('Get all credential statuses failed:', error);
    next(error);
  }
}

/**
 * Get credential status for a specific provider
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
export async function getStatus(req, res, next) {
  try {
    const userId = req.user.id;
    const { provider } = req.params;

    if (!VALID_PROVIDERS.includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PROVIDER',
        message: `Invalid provider: ${provider}`,
      });
    }

    const status = await getCredentialStatus(userId, provider);

    if (!status) {
      return res.json({
        success: true,
        data: {
          provider,
          hasCredentials: false,
          status: null,
          errorMessage: null,
          lastVerifiedAt: null,
          createdAt: null,
          updatedAt: null,
        },
      });
    }

    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    logger.error(`Get credential status failed for provider ${req.params.provider}:`, error);
    next(error);
  }
}

/**
 * Save or update credentials for a provider
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
export async function saveProviderCredentials(req, res, next) {
  try {
    const userId = req.user.id;
    const { provider } = req.params;
    const credentials = req.body;

    if (!VALID_PROVIDERS.includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PROVIDER',
        message: `Invalid provider: ${provider}`,
      });
    }

    // Extract metadata
    const metadata = {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };

    const result = await saveCredentials(userId, provider, credentials, metadata);

    res.json({
      success: true,
      message: `Credentials saved for ${PROVIDER_NAMES[provider]}`,
      data: {
        id: result.id,
        provider: result.provider,
        status: result.status,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      },
    });
  } catch (error) {
    logger.error(`Save credentials failed for provider ${req.params.provider}:`, error);

    if (error.message.includes('Invalid credentials')) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: error.message,
      });
    }

    next(error);
  }
}

/**
 * Delete credentials for a provider
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
export async function deleteProviderCredentials(req, res, next) {
  try {
    const userId = req.user.id;
    const { provider } = req.params;

    if (!VALID_PROVIDERS.includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PROVIDER',
        message: `Invalid provider: ${provider}`,
      });
    }

    // Extract metadata
    const metadata = {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };

    const deleted = await deleteCredentials(userId, provider, metadata);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: `No credentials found for ${PROVIDER_NAMES[provider]}`,
      });
    }

    res.json({
      success: true,
      message: `Credentials deleted for ${PROVIDER_NAMES[provider]}`,
    });
  } catch (error) {
    logger.error(`Delete credentials failed for provider ${req.params.provider}:`, error);
    next(error);
  }
}
