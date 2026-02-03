/**
 * Game Model
 * Represents the Game database entity
 */

import type { Game, GamePlatform, CreateGameDTO, UpdateGameDTO, GameClaim } from '@types/game';
import type { Knex } from 'knex';

/**
 * Game Model class
 * Handles database operations for games
 */
export class GameModel {
  private readonly tableName = 'games';
  private readonly claimsTableName = 'game_claims';

  constructor(private db: Knex) {}

  /**
   * Create a new game
   */
  async create(data: CreateGameDTO): Promise<Game> {
    const [id] = await this.db(this.tableName).insert({
      title: data.title,
      description: data.description,
      base_price: data.basePrice,
      platform: data.platform,
      image_url: data.imageUrl,
      external_id: data.externalId,
      claims_count: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const game = await this.findById(id);
    if (!game) {
      throw new Error('Failed to create game');
    }
    return game;
  }

  /**
   * Find game by ID
   */
  async findById(id: number): Promise<Game | null> {
    const game = await this.db(this.tableName)
      .where('id', id)
      .first();

    return game ? this.mapDbToGame(game) : null;
  }

  /**
   * Find game by external ID
   */
  async findByExternalId(externalId: string, platform: GamePlatform): Promise<Game | null> {
    const game = await this.db(this.tableName)
      .where('external_id', externalId)
      .andWhere('platform', platform)
      .first();

    return game ? this.mapDbToGame(game) : null;
  }

  /**
   * Update game
   */
  async update(id: number, data: UpdateGameDTO): Promise<Game> {
    await this.db(this.tableName)
      .where('id', id)
      .update({
        title: data.title,
        description: data.description,
        current_price: data.currentPrice,
        discount: data.discount,
        image_url: data.imageUrl,
        updated_at: new Date(),
      });

    const game = await this.findById(id);
    if (!game) {
      throw new Error('Game not found after update');
    }
    return game;
  }

  /**
   * Get all active games (paginated)
   */
  async getActive(page: number = 1, limit: number = 10, platform?: GamePlatform): Promise<Game[]> {
    const offset = (page - 1) * limit;
    let query = this.db(this.tableName)
      .whereNull('expired_at')
      .offset(offset)
      .limit(limit)
      .orderBy('created_at', 'desc');

    if (platform) {
      query = query.andWhere('platform', platform);
    }

    const games = await query;
    return games.map((game) => this.mapDbToGame(game));
  }

  /**
   * Claim a game for a user
   */
  async claimGame(gameId: number, userId: number): Promise<GameClaim> {
    // Check if already claimed
    const existing = await this.db(this.claimsTableName)
      .where('game_id', gameId)
      .andWhere('user_id', userId)
      .first();

    if (existing) {
      return this.mapDbToGameClaim(existing);
    }

    // Create claim
    const [id] = await this.db(this.claimsTableName).insert({
      game_id: gameId,
      user_id: userId,
      claimed_at: new Date(),
    });

    // Increment claims count
    await this.db(this.tableName)
      .where('id', gameId)
      .increment('claims_count', 1);

    const claim = await this.db(this.claimsTableName).where('id', id).first();
    return this.mapDbToGameClaim(claim);
  }

  /**
   * Get user claims
   */
  async getUserClaims(userId: number): Promise<number[]> {
    const claims = await this.db(this.claimsTableName)
      .where('user_id', userId)
      .select('game_id');

    return claims.map((claim) => claim.game_id);
  }

  /**
   * Map database row to Game type
   */
  private mapDbToGame(row: any): Game {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      basePrice: row.base_price,
      currentPrice: row.current_price,
      discount: row.discount,
      platform: row.platform as GamePlatform,
      imageUrl: row.image_url,
      externalId: row.external_id,
      claimsCount: row.claims_count,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      expiredAt: row.expired_at ? new Date(row.expired_at) : null,
    };
  }

  /**
   * Map database row to GameClaim type
   */
  private mapDbToGameClaim(row: any): GameClaim {
    return {
      id: row.id,
      gameId: row.game_id,
      userId: row.user_id,
      claimedAt: new Date(row.claimed_at),
    };
  }
}
