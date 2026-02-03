/**
 * Frontend API Response and Request Type Definitions
 */

import type { User, Game, GamePlatform } from './index';

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

/**
 * API error response
 */
export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Auth API responses
 */
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
  expiresIn: number;
}

/**
 * Game API responses
 */
export interface GamesListResponse extends PaginatedResponse<Game> {}

export interface GameStatisticsResponse {
  totalGames: number;
  totalValue: number;
  claimedGames: number;
  claimedValue: number;
  byPlatform: Record<GamePlatform, number>;
}

/**
 * User API responses
 */
export interface UserProfileResponse {
  user: User;
  statistics: GameStatisticsResponse;
}
