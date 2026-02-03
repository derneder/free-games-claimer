/**
 * Frontend User Type Definitions
 */

/**
 * User entity (without passwordHash)
 */
export interface User {
  id: number;
  email: string;
  name: string;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User profile
 */
export interface UserProfile extends User {
  claimedGamesCount: number;
  totalGamesValue: number;
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
