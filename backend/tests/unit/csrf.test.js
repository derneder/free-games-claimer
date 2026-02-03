/**
 * CSRF Middleware Tests
 * Tests for the csrf-csrf double CSRF protection implementation
 */

import { describe, it, expect, beforeAll } from '@jest/globals';

describe('CSRF Middleware', () => {
  let csrfModule;

  beforeAll(async () => {
    // Set required environment variable
    process.env.SESSION_SECRET = 'test-secret';
    // Import the module
    csrfModule = await import('../../src/middleware/csrf.js');
  });

  describe('Module exports', () => {
    it('should export doubleCsrfProtection', () => {
      expect(csrfModule.doubleCsrfProtection).toBeDefined();
      expect(typeof csrfModule.doubleCsrfProtection).toBe('function');
    });

    it('should export generateToken', () => {
      expect(csrfModule.generateToken).toBeDefined();
      expect(typeof csrfModule.generateToken).toBe('function');
    });

    it('should export cookieParserMiddleware', () => {
      expect(csrfModule.cookieParserMiddleware).toBeDefined();
      expect(typeof csrfModule.cookieParserMiddleware).toBe('function');
    });

    it('should export conditionalCsrf', () => {
      expect(csrfModule.conditionalCsrf).toBeDefined();
      expect(typeof csrfModule.conditionalCsrf).toBe('function');
    });

    it('should export csrfErrorHandler', () => {
      expect(csrfModule.csrfErrorHandler).toBeDefined();
      expect(typeof csrfModule.csrfErrorHandler).toBe('function');
    });

    it('should export helmetMiddleware', () => {
      expect(csrfModule.helmetMiddleware).toBeDefined();
      expect(typeof csrfModule.helmetMiddleware).toBe('function');
    });
  });

  describe('generateToken', () => {
    it('should generate a token when called with req and res', () => {
      const mockReq = {};
      const mockRes = {
        cookie: jest.fn(),
      };

      const token = csrfModule.generateToken(mockReq, mockRes);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);

      // Verify that a cookie was set
      expect(mockRes.cookie).toHaveBeenCalled();
      expect(mockRes.cookie.mock.calls[0][0]).toMatch(/csrf-token/);
    });
  });

  describe('conditionalCsrf', () => {
    it('should skip CSRF for excluded routes', () => {
      const mockReq = {
        path: '/api/health',
      };
      const mockRes = {};
      const mockNext = jest.fn();

      csrfModule.conditionalCsrf(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should skip CSRF for /api/telegram routes', () => {
      const mockReq = {
        path: '/api/telegram/webhook',
      };
      const mockRes = {};
      const mockNext = jest.fn();

      csrfModule.conditionalCsrf(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should skip CSRF for /webhook routes', () => {
      const mockReq = {
        path: '/webhook/test',
      };
      const mockRes = {};
      const mockNext = jest.fn();

      csrfModule.conditionalCsrf(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  describe('csrfErrorHandler', () => {
    it('should handle CSRF errors with EBADCSRFTOKEN code', () => {
      const mockErr = {
        code: 'EBADCSRFTOKEN',
      };
      const mockReq = {
        ip: '127.0.0.1',
        method: 'POST',
        url: '/api/test',
        get: jest.fn().mockReturnValue('test-agent'),
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      csrfModule.csrfErrorHandler(mockErr, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid CSRF token',
        message: 'Please refresh the page and try again',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle CSRF errors with csrf in message', () => {
      const mockErr = {
        message: 'invalid csrf token provided',
      };
      const mockReq = {
        ip: '127.0.0.1',
        method: 'POST',
        url: '/api/test',
        get: jest.fn().mockReturnValue('test-agent'),
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      csrfModule.csrfErrorHandler(mockErr, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid CSRF token',
        message: 'Please refresh the page and try again',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should pass non-CSRF errors to next handler', () => {
      const mockErr = {
        message: 'Some other error',
      };
      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();

      csrfModule.csrfErrorHandler(mockErr, mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockErr);
    });
  });
});
