/**
 * Game Entity and DTO Type Definitions
 */

/**
 * Supported game platforms
 */
export type GamePlatform = 'epic' | 'gog' | 'steam' | 'amazon';

/**
 * Game database entity
 */
export interface Game {
  id: number;
  title: string;
  description: string;
  basePrice: number;
  currentPrice: number | null;
  discount: number | null;
  platform: GamePlatform;
  imageUrl: string;
  externalId: string;
  claimsCount: number;
  createdAt: Date;
  updatedAt: Date;
  expiredAt: Date | null;
}

/**
 * Create game DTO
 */
export interface CreateGameDTO {
  title: string;
  description: string;
  basePrice: number;
  platform: GamePlatform;
  imageUrl: string;
  externalId: string;
}

/**
 * Update game DTO
 */
export interface UpdateGameDTO {
  title?: string;
  description?: string;
  currentPrice?: number;
  discount?: number;
  imageUrl?: string;
}

/**
 * Game claim record
 */
export interface GameClaim {
  id: number;
  gameId: number;
  userId: number;
  claimedAt: Date;
}

/**
 * Game with claim status
 */
export interface GameWithClaimStatus extends Game {
  isClaimed?: boolean;
  claimedAt?: Date | null;
}

/**
 * Game statistics
 */
export interface GameStatistics {
  totalGames: number;
  totalValue: number;
  claimedGames: number;
  claimedValue: number;
  byPlatform: Record<GamePlatform, number>;
}
