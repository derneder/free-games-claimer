/**
 * User Entity and DTO Type Definitions
 */

/**
 * User database entity
 */
export interface User {
  id: number;
  email: string;
  name: string;
  passwordHash: string;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User response (without sensitive data)
 */
export type UserResponse = Omit<User, 'passwordHash'>;

/**
 * Create user DTO
 */
export interface CreateUserDTO {
  email: string;
  name: string;
  password: string;
}

/**
 * Update user DTO
 */
export interface UpdateUserDTO {
  name?: string;
  email?: string;
}

/**
 * Update password DTO
 */
export interface UpdatePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * User profile with games
 */
export interface UserProfile extends UserResponse {
  claimedGamesCount: number;
  totalGamesValue: number;
}
