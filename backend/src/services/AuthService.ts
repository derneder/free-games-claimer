/**
 * Authentication Service
 * Handles user authentication logic
 */

import type { LoginDTO, RegisterDTO, TokenResponse, AuthResponse } from '@types/auth';
import type { UserResponse } from '@types/user';
import { UnauthorizedError, ValidationError } from '@types/errors';
import { logger } from '@utils/logger';
import { validateEmail, validatePassword } from '@utils/validators';
import { hashPassword, comparePassword, generateToken } from '@utils/encryption';
import { UserModel } from '@models/User';
import type { Knex } from 'knex';

/**
 * Authentication Service
 */
export class AuthService {
  private userModel: UserModel;

  constructor(private db: Knex) {
    this.userModel = new UserModel(db);
  }

  /**
   * Register a new user
   */
  async register(data: RegisterDTO): Promise<AuthResponse> {
    logger.debug('Register attempt', { email: data.email });

    // Validate input
    if (!validateEmail(data.email)) {
      throw new ValidationError('Invalid email format', { email: 'Invalid email address' });
    }

    if (!validatePassword(data.password)) {
      throw new ValidationError('Password does not meet requirements', {
        password: 'Password must contain uppercase, lowercase, number, and special character (min 8 chars)',
      });
    }

    if (data.password !== data.confirmPassword) {
      throw new ValidationError('Passwords do not match', {
        confirmPassword: 'Passwords do not match',
      });
    }

    // Check if user already exists
    const existingUser = await this.userModel.findByEmail(data.email);
    if (existingUser) {
      throw new ValidationError('User already exists', { email: 'Email is already registered' });
    }

    // Hash password and create user
    const passwordHash = hashPassword(data.password);
    const user = await this.userModel.create({
      email: data.email,
      name: data.email.split('@')[0], // Use email prefix as default name
      password: data.password,
      passwordHash,
    });

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    // Generate token
    const token = this.generateAccessToken(user.id, user.email);

    return {
      user: UserModel.toResponse(user),
      tokens: {
        accessToken: token,
        expiresIn: 86400, // 24 hours in seconds
        tokenType: 'Bearer',
      },
    };
  }

  /**
   * Login user
   */
  async login(data: LoginDTO): Promise<AuthResponse> {
    logger.debug('Login attempt', { email: data.email });

    // Find user by email
    const user = await this.userModel.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = comparePassword(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    // Generate token
    const token = this.generateAccessToken(user.id, user.email);

    return {
      user: UserModel.toResponse(user),
      tokens: {
        accessToken: token,
        expiresIn: 86400, // 24 hours in seconds
        tokenType: 'Bearer',
      },
    };
  }

  /**
   * Generate access token
   * Note: Actual JWT generation should be implemented with jsonwebtoken library
   */
  private generateAccessToken(userId: number, email: string): string {
    // TODO: Implement JWT token generation
    // For now, return a simple token
    const token = generateToken(32);
    logger.debug('Token generated', { userId, token: token.substring(0, 10) + '...' });
    return token;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    logger.debug('Token refresh attempt');

    // TODO: Implement refresh token verification
    throw new UnauthorizedError('Refresh token not implemented');
  }

  /**
   * Logout user
   */
  async logout(userId: number): Promise<void> {
    logger.info('User logged out', { userId });
    // TODO: Implement token blacklisting or session invalidation
  }
}
