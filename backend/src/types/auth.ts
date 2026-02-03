/**
 * Authentication Type Definitions
 */

/**
 * Login credentials DTO
 */
export interface LoginDTO {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Register credentials DTO
 */
export interface RegisterDTO {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

/**
 * Token response
 */
export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

/**
 * Authentication response
 */
export interface AuthResponse {
  user: {
    id: number;
    email: string;
    name: string;
  };
  tokens: TokenResponse;
}

/**
 * Refresh token DTO
 */
export interface RefreshTokenDTO {
  refreshToken: string;
}

/**
 * JWT payload
 */
export interface JWTPayload {
  userId: number;
  email: string;
  iat: number;
  exp: number;
  iss?: string;
  aud?: string;
}

/**
 * Session data
 */
export interface SessionData {
  userId: number;
  email: string;
  name: string;
  createdAt: Date;
  expiresAt: Date;
}
