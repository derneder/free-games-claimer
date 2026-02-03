/**
 * Authentication Service
 *
 * Business logic for user authentication.
 * Handles login, registration, and token management.
 *
 * @module src/services/auth
 */

import { User } from '../models/User.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { generateToken, generateRefreshToken } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';
import { validatePassword, isValidEmail } from '../utils/validators.js';

/**
 * Register new user
 *
 * @param {string} email - User email
 * @param {string} username - Username
 * @param {string} password - User password
 * @returns {Promise<Object>} Tokens and user data
 * @throws {AppError} If validation fails
 */
export async function registerUser(email, username, password, confirmPassword) {
  // Validate input
  if (!isValidEmail(email)) {
    throw new AppError('Invalid email format', 400, 'INVALID_EMAIL');
  }

  if (username.length < 3) {
    throw new AppError('Username must be at least 3 characters', 400, 'INVALID_USERNAME');
  }

  // Check password confirmation
  if (password !== confirmPassword) {
    throw new AppError('Passwords do not match', 400, 'PASSWORD_MISMATCH');
  }

  const pwValidation = validatePassword(password);
  if (!pwValidation.isValid) {
    const unmetRequirements = Object.values(pwValidation.requirements)
      .filter((req) => !req.met)
      .map((req) => req.message);
    throw new AppError(
      `Password must meet the following requirements: ${unmetRequirements.join(', ')}`,
      400,
      'WEAK_PASSWORD'
    );
  }

  // Check if user exists by email
  const existingUserByEmail = await User.findByEmail(email);
  if (existingUserByEmail) {
    throw new AppError('User with this email already exists', 400, 'USER_EXISTS');
  }

  // Check if user exists by username
  const existingUserByUsername = await User.findByUsername(username);
  if (existingUserByUsername) {
    throw new AppError('User with this username already exists', 400, 'USER_EXISTS');
  }

  // Create user
  const user = await User.create({ email, username, password });

  // Log activity
  await ActivityLog.log({
    userId: user.id,
    action: 'USER_REGISTERED',
    description: `User registered with email ${email}`,
  });

  // Generate tokens
  const accessToken = generateToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  return {
    user: { id: user.id, email: user.email, username: user.username },
    accessToken,
    refreshToken,
  };
}

/**
 * Login user
 *
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Tokens and user data
 * @throws {AppError} If credentials invalid
 */
export async function loginUser(email, password) {
  // Find user
  const user = await User.findByEmail(email);
  if (!user) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError('User account is disabled', 403, 'USER_DISABLED');
  }

  // Verify password
  const isValidPassword = await user.verifyPassword(password);
  if (!isValidPassword) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // Log activity
  await ActivityLog.log({
    userId: user.id,
    action: 'USER_LOGIN',
    description: 'User logged in',
  });

  // Generate tokens
  const accessToken = generateToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  return {
    user: { id: user.id, email: user.email, username: user.username },
    accessToken,
    refreshToken,
  };
}
