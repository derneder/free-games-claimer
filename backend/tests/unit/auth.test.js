/**
 * Auth Service Unit Tests
 */

import { jest } from '@jest/globals';

// Mock the modules before importing them
const mockUser = {
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
};

const mockActivityLog = {
  log: jest.fn(),
};

// Mock the modules
jest.unstable_mockModule('../../src/models/User.js', () => ({
  User: mockUser,
}));

jest.unstable_mockModule('../../src/models/ActivityLog.js', () => ({
  ActivityLog: mockActivityLog,
}));

// Now import the auth service after mocks are set up
const { registerUser, loginUser } = await import('../../src/services/auth.js');
const { AppError } = await import('../../src/middleware/error.js');

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user with valid data', async () => {
      mockUser.findByEmail.mockResolvedValue(null);
      mockUser.findByUsername.mockResolvedValue(null);
      mockUser.create.mockResolvedValue({
        id: 'test-id',
        email: 'test@example.com',
        username: 'testuser',
      });

      const result = await registerUser('test@example.com', 'testuser', 'Test@1234');

      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockUser.create).toHaveBeenCalled();
    });

    it('should throw error for invalid email', async () => {
      await expect(registerUser('invalid-email', 'testuser', 'Test@1234')).rejects.toThrow(
        AppError
      );
    });

    it('should throw error for weak password', async () => {
      await expect(registerUser('test@example.com', 'testuser', 'weak')).rejects.toThrow(AppError);
    });

    it('should throw error if email already exists', async () => {
      mockUser.findByEmail.mockResolvedValue({ email: 'test@example.com' });
      mockUser.findByUsername.mockResolvedValue(null);

      await expect(registerUser('test@example.com', 'testuser', 'Test@1234')).rejects.toThrow(
        AppError
      );
    });
  });

  describe('loginUser', () => {
    it('should login user with correct credentials', async () => {
      const mockUserData = {
        id: 'test-id',
        email: 'test@example.com',
        username: 'testuser',
        role: 'user',
        isActive: true,
        verifyPassword: jest.fn().mockResolvedValue(true),
      };

      mockUser.findByEmail.mockResolvedValue(mockUserData);

      const result = await loginUser('test@example.com', 'Test@1234');

      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error for non-existent user', async () => {
      mockUser.findByEmail.mockResolvedValue(null);

      await expect(loginUser('test@example.com', 'Test@1234')).rejects.toThrow(AppError);
    });

    it('should throw error for incorrect password', async () => {
      const mockUserData = {
        id: 'test-id',
        email: 'test@example.com',
        isActive: true,
        verifyPassword: jest.fn().mockResolvedValue(false),
      };

      mockUser.findByEmail.mockResolvedValue(mockUserData);

      await expect(loginUser('test@example.com', 'wrongpassword')).rejects.toThrow(AppError);
    });

    it('should throw error for inactive user', async () => {
      const mockUserData = {
        id: 'test-id',
        email: 'test@example.com',
        isActive: false,
      };

      mockUser.findByEmail.mockResolvedValue(mockUserData);

      await expect(loginUser('test@example.com', 'Test@1234')).rejects.toThrow(AppError);
    });
  });
});
