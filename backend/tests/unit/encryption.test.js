/**
 * Tests for encryption utilities
 */

import {
  encryptCredentials,
  decryptCredentials,
  maskSensitiveData,
  isValidEncryptedData,
  generateEncryptionKey,
} from '../../src/utils/encryption.js';

// Mock environment
process.env.CREDENTIALS_ENC_KEY = generateEncryptionKey();
process.env.CREDENTIALS_KEY_VERSION = '1';

describe('Encryption Utilities', () => {
  describe('encryptCredentials', () => {
    it('should encrypt data successfully', () => {
      const data = { email: 'test@example.com', password: 'secret123' };
      const encrypted = encryptCredentials(data);

      expect(encrypted).toHaveProperty('ciphertext');
      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('tag');
      expect(encrypted).toHaveProperty('keyVersion');
      expect(encrypted.keyVersion).toBe(1);
    });

    it('should generate different IV for each encryption', () => {
      const data = { email: 'test@example.com', password: 'secret123' };
      const encrypted1 = encryptCredentials(data);
      const encrypted2 = encryptCredentials(data);

      expect(encrypted1.iv).not.toBe(encrypted2.iv);
      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
    });
  });

  describe('decryptCredentials', () => {
    it('should decrypt data successfully', () => {
      const original = { email: 'test@example.com', password: 'secret123' };
      const encrypted = encryptCredentials(original);
      const decrypted = decryptCredentials(encrypted);

      expect(decrypted).toEqual(original);
    });

    it('should throw error for invalid encrypted data', () => {
      const invalid = {
        ciphertext: 'invalid',
        iv: 'invalid',
        tag: 'invalid',
        keyVersion: 1,
      };

      expect(() => decryptCredentials(invalid)).toThrow();
    });

    it('should throw error for missing fields', () => {
      const incomplete = {
        ciphertext: 'test',
        iv: 'test',
        // missing tag and keyVersion
      };

      expect(() => decryptCredentials(incomplete)).toThrow();
    });
  });

  describe('maskSensitiveData', () => {
    it('should mask password field', () => {
      const data = { email: 'test@example.com', password: 'verylongpassword123' };
      const masked = maskSensitiveData(data);

      expect(masked.email).toBe('test@example.com');
      expect(masked.password).not.toBe('verylongpassword123');
      expect(masked.password).toContain('...');
    });

    it('should mask multiple sensitive fields', () => {
      const data = {
        email: 'test@example.com',
        password: 'secret123',
        token: 'bearer_token_value',
        otpSecret: 'TOTP_SECRET',
      };
      const masked = maskSensitiveData(data);

      expect(masked.email).toBe('test@example.com');
      expect(masked.password).toBe('***');
      expect(masked.token).toContain('...');
      expect(masked.otpSecret).toContain('...');
    });

    it('should handle short sensitive values', () => {
      const data = { password: 'short' };
      const masked = maskSensitiveData(data);

      expect(masked.password).toBe('***');
    });

    it('should return null for null input', () => {
      const masked = maskSensitiveData(null);
      expect(masked).toBeNull();
    });
  });

  describe('isValidEncryptedData', () => {
    it('should return true for valid encrypted data', () => {
      const data = { email: 'test@example.com', password: 'secret123' };
      const encrypted = encryptCredentials(data);

      expect(isValidEncryptedData(encrypted)).toBe(true);
    });

    it('should return false for missing fields', () => {
      const invalid = {
        ciphertext: 'test',
        iv: 'test',
        // missing tag and keyVersion
      };

      expect(isValidEncryptedData(invalid)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isValidEncryptedData(null)).toBe(false);
    });

    it('should return false for wrong types', () => {
      const invalid = {
        ciphertext: 'test',
        iv: 'test',
        tag: 'test',
        keyVersion: 'not-a-number',
      };

      expect(isValidEncryptedData(invalid)).toBe(false);
    });
  });

  describe('generateEncryptionKey', () => {
    it('should generate a 32-byte base64 key', () => {
      const key = generateEncryptionKey();

      // Base64 encoding of 32 bytes should be 44 characters
      expect(key.length).toBe(44);

      // Should be valid base64
      const buffer = Buffer.from(key, 'base64');
      expect(buffer.length).toBe(32);
    });

    it('should generate different keys each time', () => {
      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();

      expect(key1).not.toBe(key2);
    });
  });

  describe('end-to-end encryption/decryption', () => {
    it('should handle complex nested objects', () => {
      const complex = {
        email: 'user@example.com',
        password: 'secret',
        metadata: {
          nested: 'value',
          array: [1, 2, 3],
        },
        cookies: [
          { name: 'session', value: 'abc123' },
          { name: 'auth', value: 'def456' },
        ],
      };

      const encrypted = encryptCredentials(complex);
      const decrypted = decryptCredentials(encrypted);

      expect(decrypted).toEqual(complex);
    });

    it('should handle unicode characters', () => {
      const unicode = {
        email: 'test@example.com',
        password: '密码123',
        note: 'Hello 世界',
      };

      const encrypted = encryptCredentials(unicode);
      const decrypted = decryptCredentials(encrypted);

      expect(decrypted).toEqual(unicode);
    });
  });
});
