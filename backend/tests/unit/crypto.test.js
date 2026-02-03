/**
 * Crypto Utils Unit Tests
 */

import {
  hashPassword,
  comparePassword,
  generateRandomToken,
  generateRandomCode,
  sha256,
} from '../../src/utils/crypto.js';

describe('Crypto Utils', () => {
  describe('hashPassword', () => {
    it('should hash password', async () => {
      const password = 'Test@1234';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(30);
    });
  });

  describe('comparePassword', () => {
    it('should compare correct password', async () => {
      const password = 'Test@1234';
      const hash = await hashPassword(password);
      const match = await comparePassword(password, hash);

      expect(match).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'Test@1234';
      const hash = await hashPassword(password);
      const match = await comparePassword('WrongPassword', hash);

      expect(match).toBe(false);
    });
  });

  describe('generateRandomToken', () => {
    it('should generate random token', () => {
      const token1 = generateRandomToken();
      const token2 = generateRandomToken();

      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBe(64);
    });
  });

  describe('generateRandomCode', () => {
    it('should generate random code', () => {
      const code = generateRandomCode(6);

      expect(code).toBeDefined();
      expect(code.length).toBe(6);
      expect(/^\d+$/.test(code)).toBe(true);
    });
  });

  describe('sha256', () => {
    it('should hash text with SHA256', () => {
      const hash = sha256('test');

      expect(hash).toBeDefined();
      expect(hash.length).toBe(64);
    });

    it('should produce same hash for same input', () => {
      const hash1 = sha256('test');
      const hash2 = sha256('test');

      expect(hash1).toBe(hash2);
    });
  });
});
