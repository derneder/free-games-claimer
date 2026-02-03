/**
 * Auth Service Unit Tests
 */

import * as authService from '../../src/services/auth.js';
import { User } from '../../src/models/User.js';
import { AppError } from '../../src/middleware/error.js';

jest.mock('../../src/models/User.js');
jest.mock('../../src/models/ActivityLog.js');

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user with valid data', async () => {
      User.findByEmail.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 'test-id',
        email: 'test@example.com',
        username: 'testuser',
      });

      const result = await authService.registerUser(
        'test@example.com',
        'testuser',
        'Test@1234'
      );

      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(User.create).toHaveBeenCalled();
    });

    it('should throw error for invalid email', async () => {
      await expect(
        authService.registerUser('invalid-email', 'testuser', 'Test@1234')
      ).rejects.toThrow(AppError);
    });

    it('should throw error for weak password', async () => {
      await expect(
        authService.registerUser('test@example.com', 'testuser', 'weak')
      ).rejects.toThrow(AppError);
    });

    it('should throw error if email already exists', async () => {
      User.findByEmail.mockResolvedValue({ email: 'test@example.com' });

      await expect(
        authService.registerUser('test@example.com', 'testuser', 'Test@1234')
      ).rejects.toThrow(AppError);
    });
  });

  describe('loginUser', () => {
    it('should login user with correct credentials', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
        isActive: true,
        verifyPassword: jest.fn().mockResolvedValue(true),
      };

      User.findByEmail.mockResolvedValue(mockUser);

      const result = await authService.loginUser('test@example.com', 'Test@1234');

      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error for non-existent user', async () => {
      User.findByEmail.mockResolvedValue(null);

      await expect(
        authService.loginUser('test@example.com', 'Test@1234')
      ).rejects.toThrow(AppError);
    });

    it('should throw error for incorrect password', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        isActive: true,
        verifyPassword: jest.fn().mockResolvedValue(false),
      };

      User.findByEmail.mockResolvedValue(mockUser);

      await expect(
        authService.loginUser('test@example.com', 'wrongpassword')
      ).rejects.toThrow(AppError);
    });

    it('should throw error for inactive user', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        isActive: false,
      };

      User.findByEmail.mockResolvedValue(mockUser);

      await expect(
        authService.loginUser('test@example.com', 'Test@1234')
      ).rejects.toThrow(AppError);
    });
  });
});
