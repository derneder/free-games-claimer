/**
 * Validators Unit Tests
 */

import {
  isValidEmail,
  validatePassword,
  isValidUUID,
  isValidURL,
  isInRange,
} from '../../src/utils/validators.js';

describe('Validators', () => {
  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@example.co.uk')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong password', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.isValid).toBe(true);
    });

    it('should reject weak password', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
    });

    it('should check for uppercase', () => {
      const result = validatePassword('lowercase123!');
      expect(result.requirements.hasUpperCase.met).toBe(false);
    });

    it('should check for lowercase', () => {
      const result = validatePassword('UPPERCASE123!');
      expect(result.requirements.hasLowerCase.met).toBe(false);
    });
  });

  describe('isValidUUID', () => {
    it('should validate correct UUID', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });

    it('should reject invalid UUID', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('123')).toBe(false);
    });
  });

  describe('isValidURL', () => {
    it('should validate correct URL', () => {
      expect(isValidURL('https://example.com')).toBe(true);
      expect(isValidURL('http://example.com/path')).toBe(true);
    });

    it('should reject invalid URL', () => {
      expect(isValidURL('not a url')).toBe(false);
      expect(isValidURL('example')).toBe(false);
    });
  });

  describe('isInRange', () => {
    it('should check if value is in range', () => {
      expect(isInRange(5, 1, 10)).toBe(true);
      expect(isInRange(1, 1, 10)).toBe(true);
      expect(isInRange(10, 1, 10)).toBe(true);
    });

    it('should reject value outside range', () => {
      expect(isInRange(11, 1, 10)).toBe(false);
      expect(isInRange(0, 1, 10)).toBe(false);
    });
  });
});
