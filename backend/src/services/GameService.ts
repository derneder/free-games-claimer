/**
 * Game Service
 * Handles game-related business logic
 */

import type { Game, GamePlatform, CreateGameDTO, UpdateGameDTO, GameWithClaimStatus } from '@types/game';
import { NotFoundError } from '@types/errors';
import { logger } from '@utils/logger';
import { GameModel } from '@models/Game';
import type { Knex } from 'knex';

/**
 * Game Service
 */
export class GameService {
  private gameModel: GameModel;

  constructor(private db: Knex) {
    this.gameModel = new GameModel(db);
  }

  /**
   * Create a new game
   */
  async createGame(data: CreateGameDTO): Promise<Game> {
    logger.debug('Creating new game', { title: data.title, platform: data.platform });

    // Check if game already exists
    const existing = await this.gameModel.findByExternalId(data.externalId, data.platform);
    if (existing) {
      logger.warn('Game already exists', { externalId: data.externalId, platform: data.platform });
      return existing;
    }

    const game = await this.gameModel.create(data);
    logger.info('Game created successfully', { gameId: game.id, title: game.title });
    return game;
  }

  /**
   * Get game by ID with claim status
   */
  async getGameWithStatus(gameId: number, userId?: number): Promise<GameWithClaimStatus> {
    logger.debug('Getting game with status', { gameId, userId });

    const game = await this.gameModel.findById(gameId);
    if (!game) {
      throw new NotFoundError('Game not found');
    }

    let isClaimed = false;
    if (userId) {
      const claims = await this.gameModel.getUserClaims(userId);
      isClaimed = claims.includes(gameId);
    }

    return {
      ...game,
      isClaimed,
    };
  }

  /**
   * Get active games (paginated)
   */
  async getActiveGames(
    page: number = 1,
    limit: number = 10,
    platform?: GamePlatform,
    userId?: number
  ): Promise<GameWithClaimStatus[]> {
    logger.debug('Getting active games', { page, limit, platform });

    const games = await this.gameModel.getActive(page, limit, platform);
    let userClaims: number[] = [];

    if (userId) {
      userClaims = await this.gameModel.getUserClaims(userId);
    }

    return games.map((game) => ({
      ...game,
      isClaimed: userClaims.includes(game.id),
    }));
  }

  /**
   * Update game
   */
  async updateGame(gameId: number, data: UpdateGameDTO): Promise<Game> {
    logger.debug('Updating game', { gameId });

    const game = await this.gameModel.findById(gameId);
    if (!game) {
      throw new NotFoundError('Game not found');
    }

    const updated = await this.gameModel.update(gameId, data);
    logger.info('Game updated successfully', { gameId });
    return updated;
  }

  /**
   * Claim a game for user
   */
  async claimGame(gameId: number, userId: number): Promise<GameWithClaimStatus> {
    logger.debug('Claiming game', { gameId, userId });

    // Verify game exists
    const game = await this.gameModel.findById(gameId);
    if (!game) {
      throw new NotFoundError('Game not found');
    }

    // Claim the game
    await this.gameModel.claimGame(gameId, userId);
    logger.info('Game claimed successfully', { gameId, userId });

    return {
      ...game,
      isClaimed: true,
    };
  }

  /**
   * Get user claimed games
   */
  async getUserClaimedGames(userId: number, page: number = 1, limit: number = 10): Promise<Game[]> {
    logger.debug('Getting user claimed games', { userId, page, limit });

    const claimedIds = await this.gameModel.getUserClaims(userId);
    const games: Game[] = [];

    for (const id of claimedIds.slice((page - 1) * limit, page * limit)) {
      const game = await this.gameModel.findById(id);
      if (game) {
        games.push(game);
      }
    }

    return games;
  }

  /**
   * Get game statistics
   */
  async getStatistics(): Promise<{
    totalGames: number;
    platformCounts: Record<GamePlatform, number>;
  }> {
    logger.debug('Getting game statistics');

    // TODO: Implement statistics aggregation from database
    return {
      totalGames: 0,
      platformCounts: {
        epic: 0,
        gog: 0,
        steam: 0,
        amazon: 0,
      },
    };
  }
}
