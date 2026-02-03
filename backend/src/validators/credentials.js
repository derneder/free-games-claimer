/**
 * Credential Validation Schemas
 *
 * Joi schemas for validating provider credentials.
 * Each provider has specific requirements for credentials.
 *
 * @module src/validators/credentials
 */

import Joi from 'joi';

/**
 * Epic Games credentials schema
 * Supports: email/password, optional OTP secret, cookies
 */
export const epicCredentialsSchema = Joi.object({
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  otpSecret: Joi.string().optional(),
  cookies: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        value: Joi.string().required(),
        domain: Joi.string().optional(),
        path: Joi.string().optional(),
        expires: Joi.number().optional(),
        httpOnly: Joi.boolean().optional(),
        secure: Joi.boolean().optional(),
        sameSite: Joi.string().valid('Strict', 'Lax', 'None').optional(),
      })
    )
    .optional(),
  sessionToken: Joi.string().optional(),
  parentalPin: Joi.string()
    .length(4)
    .pattern(/^\d{4}$/)
    .optional(),
}).or('email', 'cookies', 'sessionToken'); // At least one authentication method

/**
 * GOG credentials schema
 * Supports: email/password, optional OTP secret, cookies
 */
export const gogCredentialsSchema = Joi.object({
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  otpSecret: Joi.string().optional(),
  cookies: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        value: Joi.string().required(),
        domain: Joi.string().optional(),
        path: Joi.string().optional(),
        expires: Joi.number().optional(),
        httpOnly: Joi.boolean().optional(),
        secure: Joi.boolean().optional(),
        sameSite: Joi.string().valid('Strict', 'Lax', 'None').optional(),
      })
    )
    .optional(),
  sessionToken: Joi.string().optional(),
  unsubscribeMarketing: Joi.boolean().optional().default(false),
}).or('email', 'cookies', 'sessionToken');

/**
 * Steam credentials schema
 * Supports: username/password, optional OTP secret, cookies, session token
 */
export const steamCredentialsSchema = Joi.object({
  username: Joi.string().optional(),
  password: Joi.string().min(6).optional(),
  otpSecret: Joi.string().optional(),
  cookies: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().required(),
        value: Joi.string().required(),
        domain: Joi.string().optional(),
        path: Joi.string().optional(),
        expires: Joi.number().optional(),
        httpOnly: Joi.boolean().optional(),
        secure: Joi.boolean().optional(),
        sameSite: Joi.string().valid('Strict', 'Lax', 'None').optional(),
      })
    )
    .optional(),
  sessionToken: Joi.string().optional(),
  steamGuardCode: Joi.string().optional(),
}).or('username', 'cookies', 'sessionToken');

/**
 * Get validation schema for provider
 *
 * @param {string} provider - Provider name ('epic', 'gog', 'steam')
 * @returns {Joi.Schema} Validation schema
 * @throws {Error} If provider is invalid
 */
export function getProviderSchema(provider) {
  const schemas = {
    epic: epicCredentialsSchema,
    gog: gogCredentialsSchema,
    steam: steamCredentialsSchema,
  };

  const schema = schemas[provider];
  if (!schema) {
    throw new Error(`Invalid provider: ${provider}`);
  }

  return schema;
}

/**
 * Validate provider credentials
 *
 * @param {string} provider - Provider name
 * @param {Object} credentials - Credentials to validate
 * @returns {Object} Validation result { error, value }
 */
export function validateCredentials(provider, credentials) {
  const schema = getProviderSchema(provider);
  return schema.validate(credentials, { stripUnknown: true });
}

/**
 * List of valid providers
 */
export const VALID_PROVIDERS = ['epic', 'gog', 'steam'];

/**
 * Provider display names
 */
export const PROVIDER_NAMES = {
  epic: 'Epic Games',
  gog: 'GOG',
  steam: 'Steam',
};
