/**
 * Frontend Game Type Definitions
 */

/**
 * Supported game platforms
 */
export type GamePlatform = 'epic' | 'gog' | 'steam' | 'amazon';

/**
 * Game entity
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

/**
 * Game filters
 */
export interface GameFilters {
  platform?: GamePlatform;
  searchQuery?: string;
  sortBy?: 'newest' | 'price' | 'name';
  page?: number;
  limit?: number;
}
