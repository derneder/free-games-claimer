/**
 * User Service
 * Handles user-related business logic
 */

import type { UpdateUserDTO, UserProfile } from '@types/user';
import { NotFoundError } from '@types/errors';
import { logger } from '@utils/logger';
import { UserModel } from '@models/User';
import { GameModel } from '@models/Game';
import type { Knex } from 'knex';

/**
 * User Service
 */
export class UserService {
  private userModel: UserModel;
  private gameModel: GameModel;

  constructor(private db: Knex) {
    this.userModel = new UserModel(db);
    this.gameModel = new GameModel(db);
  }

  /**
   * Get user profile
   */
  async getProfile(userId: number): Promise<UserProfile> {
    logger.debug('Getting user profile', { userId });

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Get claimed games
    const claimedGameIds = await this.gameModel.getUserClaims(userId);
    const claimedCount = claimedGameIds.length;

    // Calculate total value (simplified)
    // In production, would sum actual game prices
    const totalValue = claimedCount * 10; // Placeholder

    const response = UserModel.toResponse(user);
    return {
      ...response,
      claimedGamesCount: claimedCount,
      totalGamesValue: totalValue,
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: number, data: UpdateUserDTO): Promise<UserProfile> {
    logger.debug('Updating user profile', { userId });

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Update user
    const updatedUser = await this.userModel.update(userId, data);

    // Get claimed games
    const claimedGameIds = await this.gameModel.getUserClaims(userId);
    const claimedCount = claimedGameIds.length;
    const totalValue = claimedCount * 10; // Placeholder

    logger.info('User profile updated', { userId });

    const response = UserModel.toResponse(updatedUser);
    return {
      ...response,
      claimedGamesCount: claimedCount,
      totalGamesValue: totalValue,
    };
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: number): Promise<void> {
    logger.debug('Deleting user account', { userId });

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Delete user
    await this.userModel.delete(userId);

    logger.info('User account deleted', { userId, email: user.email });
  }

  /**
   * Get user count (admin only)
   */
  async getUserCount(): Promise<number> {
    logger.debug('Getting total user count');
    return this.userModel.count();
  }
}
