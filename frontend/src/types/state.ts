/**
 * Frontend Application State Type Definitions
 */

import type { AuthState, AuthActions } from './auth';
import type { GameFilters, GameStatistics } from './game';
import type { Game, User } from './index';

/**
 * Game store state
 */
export interface GameStoreState {
  games: Game[];
  claimed: Set<number>;
  loading: boolean;
  error: string | null;
  filters: GameFilters;
  statistics: GameStatistics | null;
  totalGames: number;
  currentPage: number;
}

/**
 * Game store actions
 */
export interface GameStoreActions {
  fetchGames: (filters?: GameFilters) => Promise<void>;
  claimGame: (gameId: number) => Promise<void>;
  setFilters: (filters: Partial<GameFilters>) => void;
  clearFilters: () => void;
  resetGames: () => void;
}

/**
 * User store state
 */
export interface UserStoreState {
  profile: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * User store actions
 */
export interface UserStoreActions {
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  resetUser: () => void;
}

/**
 * Notification state
 */
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

/**
 * Root app state
 */
export interface RootState {
  auth: AuthState;
  games: GameStoreState;
  user: UserStoreState;
  notifications: Notification[];
}

/**
 * Root app actions
 */
export interface RootActions extends AuthActions, GameStoreActions, UserStoreActions {
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}
