/**
 * Claim Orchestrator
 *
 * Manages claim operations across all providers.
 * Handles user credential retrieval, claim execution, and result reporting.
 *
 * @module src/workers/claimOrchestrator
 */

import { logger } from '../config/logger.js';
import {
  getCredentials,
  getUsersWithCredentials,
  updateCredentialStatus,
  markCredentialsVerified,
} from '../services/credentialService.js';
import { runEpicClaimer } from './claimers/epicClaimer.js';
import { query } from '../config/database.js';

/**
 * Claim free games for a specific user and provider
 *
 * @param {string} userId - User ID
 * @param {string} provider - Provider name
 * @param {Object} options - Claim options
 * @returns {Promise<Object>} Claim result
 */
export async function claimForUser(userId, provider, options = {}) {
  const result = {
    userId,
    provider,
    success: false,
    claimed: [],
    failed: [],
    alreadyOwned: [],
    errors: [],
    timestamp: new Date(),
  };

  try {
    logger.info(`Starting claim for user ${userId}, provider ${provider}`);

    // Get user credentials
    const credentialData = await getCredentials(userId, provider);
    if (!credentialData) {
      throw new Error(`No credentials found for provider ${provider}`);
    }

    // Run provider-specific claimer
    let claimResult;
    switch (provider) {
      case 'epic':
        claimResult = await runEpicClaimer(credentialData.credentials, options);
        break;
      case 'gog':
        // TODO: Implement GOG claimer
        throw new Error('GOG claimer not yet implemented');
      case 'steam':
        // TODO: Implement Steam claimer
        throw new Error('Steam claimer not yet implemented');
      default:
        throw new Error(`Invalid provider: ${provider}`);
    }

    // Merge results
    result.claimed = claimResult.claimed || [];
    result.failed = claimResult.failed || [];
    result.alreadyOwned = claimResult.alreadyOwned || [];
    result.errors = claimResult.errors || [];
    result.success = claimResult.success;

    // Update credential status
    if (result.success) {
      await markCredentialsVerified(userId, provider);

      // Log successful claims to database
      for (const game of result.claimed) {
        await logClaimedGame(userId, provider, game);
      }
    } else if (result.errors.length > 0) {
      await updateCredentialStatus(
        userId,
        provider,
        'verification_failed',
        result.errors[0]?.error || 'Claim failed'
      );
    }

    // Log audit event
    await logClaimAttempt(userId, provider, result);

    logger.info(
      `Claim completed for user ${userId}, provider ${provider}: ` +
        `${result.claimed.length} claimed, ${result.failed.length} failed, ` +
        `${result.alreadyOwned.length} already owned`
    );
  } catch (error) {
    logger.error(`Claim failed for user ${userId}, provider ${provider}:`, error);
    result.errors.push({ error: error.message });

    // Update credential status
    await updateCredentialStatus(userId, provider, 'verification_failed', error.message);
  }

  return result;
}

/**
 * Claim free games for all users with credentials for a provider
 *
 * @param {string} provider - Provider name
 * @param {Object} options - Claim options
 * @returns {Promise<Array>} Array of claim results
 */
export async function claimForAllUsers(provider, options = {}) {
  try {
    logger.info(`Starting batch claim for provider ${provider}`);

    const userIds = await getUsersWithCredentials(provider);
    logger.info(`Found ${userIds.length} users with ${provider} credentials`);

    const results = [];
    const maxConcurrent = parseInt(process.env.CLAIM_MAX_CONCURRENT || '3', 10);

    // Process users in batches
    for (let i = 0; i < userIds.length; i += maxConcurrent) {
      const batch = userIds.slice(i, i + maxConcurrent);

      const batchPromises = batch.map(async (userId) => {
        try {
          const result = await claimForUser(userId, provider, options);
          return result;
        } catch (error) {
          logger.error(`Error claiming for user ${userId}:`, error);
          return {
            userId,
            provider,
            success: false,
            errors: [{ error: error.message }],
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add delay between batches to avoid rate limiting
      if (i + maxConcurrent < userIds.length) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    logger.info(
      `Batch claim completed for ${provider}: ${results.length} users processed`
    );
    return results;
  } catch (error) {
    logger.error(`Batch claim failed for provider ${provider}:`, error);
    throw error;
  }
}

/**
 * Run claims for all providers
 *
 * @param {Object} options - Claim options
 * @returns {Promise<Object>} Combined results
 */
export async function runAllClaims(options = {}) {
  const providers = ['epic']; // Add 'gog', 'steam' when implemented
  const results = {};

  for (const provider of providers) {
    try {
      results[provider] = await claimForAllUsers(provider, options);
    } catch (error) {
      logger.error(`Failed to run claims for ${provider}:`, error);
      results[provider] = {
        error: error.message,
      };
    }
  }

  return results;
}

/**
 * Log claimed game to database
 *
 * @param {string} userId - User ID
 * @param {string} provider - Provider name
 * @param {Object} game - Game information
 * @returns {Promise<void>}
 */
async function logClaimedGame(userId, provider, game) {
  try {
    await query(
      `INSERT INTO games (user_id, title, source, source_url, platform, obtained_at, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT DO NOTHING`,
      [
        userId,
        game.title || 'Unknown Game',
        provider === 'epic' ? 'epic-games' : provider,
        game.url || '',
        'windows',
      ]
    );
  } catch (error) {
    logger.error('Failed to log claimed game:', error);
  }
}

/**
 * Log claim attempt to audit log
 *
 * @param {string} userId - User ID
 * @param {string} provider - Provider name
 * @param {Object} result - Claim result
 * @returns {Promise<void>}
 */
async function logClaimAttempt(userId, provider, result) {
  try {
    const action = result.success ? 'claim_success' : 'claim_failed';
    const metadata = {
      claimed: result.claimed?.length || 0,
      failed: result.failed?.length || 0,
      alreadyOwned: result.alreadyOwned?.length || 0,
      hasErrors: result.errors?.length > 0,
    };

    await query(
      `INSERT INTO credential_audit_log (user_id, provider, action, metadata)
       VALUES ($1, $2, $3, $4)`,
      [userId, provider, action, JSON.stringify(metadata)]
    );
  } catch (error) {
    logger.error('Failed to log claim attempt:', error);
  }
}

/**
 * Schedule periodic claims using cron
 *
 * @returns {void}
 */
export function scheduleClaims() {
  // Import at module level would be better, but keeping here for now to avoid circular deps
  import('node-cron').then((cronModule) => {
    const cron = cronModule.default || cronModule;
    const schedule = process.env.CLAIM_CRON_SCHEDULE || '0 10 * * *'; // Daily at 10 AM
    const enabled = process.env.CLAIM_CRON_ENABLED !== 'false';

    if (!enabled) {
      logger.info('Claim scheduler disabled');
      return;
    }

    logger.info(`Scheduling claims with pattern: ${schedule}`);

    cron.schedule(schedule, async () => {
      logger.info('Running scheduled claims...');
      try {
        const results = await runAllClaims();
        logger.info('Scheduled claims completed:', results);
      } catch (error) {
        logger.error('Scheduled claims failed:', error);
      }
    });

    logger.info('Claim scheduler started');
  });
}
