/**
 * Frontend Authentication Type Definitions
 */

import type { User } from './user';

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Register credentials
 */
export interface RegisterCredentials {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

/**
 * Auth state
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken?: string | null;
}

/**
 * Auth actions
 */
export interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  checkAuth: () => Promise<void>;
}
