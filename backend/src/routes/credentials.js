/**
 * Credentials Routes
 *
 * API endpoints for managing provider credentials.
 * All routes require authentication.
 *
 * @module src/routes/credentials
 */

import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { doubleCsrfProtection } from '../middleware/csrf.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import {
  getAllStatuses,
  getStatus,
  saveProviderCredentials,
  deleteProviderCredentials,
} from '../controllers/credentialsController.js';

const router = express.Router();

/**
 * Rate limiter for credential operations
 * More restrictive than regular API endpoints
 */
const credentialRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: 'Too many credential operations. Please try again later.',
});

/**
 * @swagger
 * /api/credentials:
 *   get:
 *     summary: Get all credential statuses
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of credential statuses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CredentialStatus'
 */
router.get('/', authenticate, getAllStatuses);

/**
 * @swagger
 * /api/credentials/{provider}:
 *   get:
 *     summary: Get credential status for a provider
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: provider
 *         required: true
 *         schema:
 *           type: string
 *           enum: [epic, gog, steam]
 *     responses:
 *       200:
 *         description: Credential status
 *       400:
 *         description: Invalid provider
 */
router.get('/:provider', authenticate, getStatus);

/**
 * @swagger
 * /api/credentials/{provider}:
 *   post:
 *     summary: Save credentials for a provider
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: provider
 *         required: true
 *         schema:
 *           type: string
 *           enum: [epic, gog, steam]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/EpicCredentials'
 *               - $ref: '#/components/schemas/GOGCredentials'
 *               - $ref: '#/components/schemas/SteamCredentials'
 *     responses:
 *       200:
 *         description: Credentials saved successfully
 *       400:
 *         description: Validation error
 */
router.post(
  '/:provider',
  authenticate,
  doubleCsrfProtection,
  credentialRateLimiter,
  saveProviderCredentials
);

/**
 * @swagger
 * /api/credentials/{provider}:
 *   put:
 *     summary: Update credentials for a provider
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: provider
 *         required: true
 *         schema:
 *           type: string
 *           enum: [epic, gog, steam]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/EpicCredentials'
 *               - $ref: '#/components/schemas/GOGCredentials'
 *               - $ref: '#/components/schemas/SteamCredentials'
 *     responses:
 *       200:
 *         description: Credentials updated successfully
 *       400:
 *         description: Validation error
 */
router.put(
  '/:provider',
  authenticate,
  doubleCsrfProtection,
  credentialRateLimiter,
  saveProviderCredentials
);

/**
 * @swagger
 * /api/credentials/{provider}:
 *   delete:
 *     summary: Delete credentials for a provider
 *     tags: [Credentials]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: provider
 *         required: true
 *         schema:
 *           type: string
 *           enum: [epic, gog, steam]
 *     responses:
 *       200:
 *         description: Credentials deleted successfully
 *       404:
 *         description: Credentials not found
 */
router.delete(
  '/:provider',
  authenticate,
  doubleCsrfProtection,
  credentialRateLimiter,
  deleteProviderCredentials
);

export default router;
