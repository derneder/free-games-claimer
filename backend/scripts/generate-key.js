#!/usr/bin/env node

/**
 * Encryption Key Generator
 *
 * Generates secure 256-bit encryption keys for credential storage.
 * Run: node scripts/generate-key.js
 */

import crypto from 'crypto';

console.log('🔐 Encryption Key Generator\n');
console.log('Generating secure 256-bit encryption key...\n');

const key = crypto.randomBytes(32).toString('base64');

console.log('✅ Key generated successfully!\n');
console.log('Add this to your .env file:\n');
console.log(`CREDENTIALS_ENC_KEY=${key}`);
console.log('CREDENTIALS_KEY_VERSION=1\n');
console.log('⚠️  IMPORTANT:');
console.log('- Never commit this key to version control');
console.log('- Store securely in environment variables');
console.log('- Use different keys for dev/staging/production');
console.log('- Keep a secure backup of production keys\n');
