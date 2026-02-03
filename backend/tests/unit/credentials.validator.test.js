/**
 * Tests for credential validators
 */

import {
  validateCredentials,
  getProviderSchema,
  VALID_PROVIDERS,
  PROVIDER_NAMES,
} from '../../src/validators/credentials.js';

describe('Credential Validators', () => {
  describe('Epic Games credentials', () => {
    it('should validate email/password credentials', () => {
      const creds = {
        email: 'test@example.com',
        password: 'password123',
      };

      const { error } = validateCredentials('epic', creds);
      expect(error).toBeUndefined();
    });

    it('should validate with optional OTP secret', () => {
      const creds = {
        email: 'test@example.com',
        password: 'password123',
        otpSecret: 'JBSWY3DPEHPK3PXP',
      };

      const { error } = validateCredentials('epic', creds);
      expect(error).toBeUndefined();
    });

    it('should validate with cookies', () => {
      const creds = {
        cookies: [
          {
            name: 'EPIC_BEARER_TOKEN',
            value: 'token123',
            domain: '.epicgames.com',
          },
        ],
      };

      const { error } = validateCredentials('epic', creds);
      expect(error).toBeUndefined();
    });

    it('should validate parental PIN format', () => {
      const creds = {
        email: 'test@example.com',
        password: 'password123',
        parentalPin: '1234',
      };

      const { error } = validateCredentials('epic', creds);
      expect(error).toBeUndefined();
    });

    it('should reject invalid parental PIN', () => {
      const creds = {
        email: 'test@example.com',
        password: 'password123',
        parentalPin: '123', // Too short
      };

      const { error } = validateCredentials('epic', creds);
      expect(error).toBeDefined();
    });

    it('should reject missing all auth methods', () => {
      const creds = {
        otpSecret: 'JBSWY3DPEHPK3PXP', // No email, cookies, or sessionToken
      };

      const { error } = validateCredentials('epic', creds);
      expect(error).toBeDefined();
    });

    it('should reject invalid email', () => {
      const creds = {
        email: 'invalid-email',
        password: 'password123',
      };

      const { error } = validateCredentials('epic', creds);
      expect(error).toBeDefined();
    });

    it('should reject short password', () => {
      const creds = {
        email: 'test@example.com',
        password: '12345', // Too short
      };

      const { error } = validateCredentials('epic', creds);
      expect(error).toBeDefined();
    });
  });

  describe('GOG credentials', () => {
    it('should validate email/password credentials', () => {
      const creds = {
        email: 'test@example.com',
        password: 'password123',
      };

      const { error } = validateCredentials('gog', creds);
      expect(error).toBeUndefined();
    });

    it('should validate with unsubscribeMarketing option', () => {
      const creds = {
        email: 'test@example.com',
        password: 'password123',
        unsubscribeMarketing: true,
      };

      const { error } = validateCredentials('gog', creds);
      expect(error).toBeUndefined();
    });

    it('should default unsubscribeMarketing to false', () => {
      const creds = {
        email: 'test@example.com',
        password: 'password123',
      };

      const { error, value } = validateCredentials('gog', creds);
      expect(error).toBeUndefined();
      expect(value.unsubscribeMarketing).toBe(false);
    });
  });

  describe('Steam credentials', () => {
    it('should validate username/password credentials', () => {
      const creds = {
        username: 'steamuser',
        password: 'password123',
      };

      const { error } = validateCredentials('steam', creds);
      expect(error).toBeUndefined();
    });

    it('should validate with Steam Guard code', () => {
      const creds = {
        username: 'steamuser',
        password: 'password123',
        steamGuardCode: 'ABC12',
      };

      const { error } = validateCredentials('steam', creds);
      expect(error).toBeUndefined();
    });

    it('should validate with session token', () => {
      const creds = {
        sessionToken: 'steam_session_token',
      };

      const { error } = validateCredentials('steam', creds);
      expect(error).toBeUndefined();
    });
  });

  describe('getProviderSchema', () => {
    it('should return schema for valid provider', () => {
      const schema = getProviderSchema('epic');
      expect(schema).toBeDefined();
      expect(schema.validate).toBeDefined();
    });

    it('should throw error for invalid provider', () => {
      expect(() => getProviderSchema('invalid')).toThrow('Invalid provider');
    });
  });

  describe('VALID_PROVIDERS', () => {
    it('should contain epic, gog, steam', () => {
      expect(VALID_PROVIDERS).toContain('epic');
      expect(VALID_PROVIDERS).toContain('gog');
      expect(VALID_PROVIDERS).toContain('steam');
    });
  });

  describe('PROVIDER_NAMES', () => {
    it('should have display names for all providers', () => {
      expect(PROVIDER_NAMES.epic).toBe('Epic Games');
      expect(PROVIDER_NAMES.gog).toBe('GOG');
      expect(PROVIDER_NAMES.steam).toBe('Steam');
    });
  });

  describe('Cookie validation', () => {
    it('should validate proper cookie structure', () => {
      const creds = {
        cookies: [
          {
            name: 'session',
            value: 'abc123',
            domain: '.example.com',
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
          },
        ],
      };

      const { error } = validateCredentials('epic', creds);
      expect(error).toBeUndefined();
    });

    it('should require name and value in cookies', () => {
      const creds = {
        cookies: [
          {
            domain: '.example.com', // Missing name and value
          },
        ],
      };

      const { error } = validateCredentials('epic', creds);
      expect(error).toBeDefined();
    });

    it('should validate sameSite values', () => {
      const validSameSite = ['Strict', 'Lax', 'None'];

      for (const sameSite of validSameSite) {
        const creds = {
          cookies: [
            {
              name: 'test',
              value: 'test',
              sameSite,
            },
          ],
        };

        const { error } = validateCredentials('epic', creds);
        expect(error).toBeUndefined();
      }
    });

    it('should reject invalid sameSite value', () => {
      const creds = {
        cookies: [
          {
            name: 'test',
            value: 'test',
            sameSite: 'Invalid',
          },
        ],
      };

      const { error } = validateCredentials('epic', creds);
      expect(error).toBeDefined();
    });
  });

  describe('Strip unknown fields', () => {
    it('should strip unknown fields from credentials', () => {
      const creds = {
        email: 'test@example.com',
        password: 'password123',
        unknownField: 'should be removed',
        anotherUnknown: 123,
      };

      const { value } = validateCredentials('epic', creds);
      expect(value.unknownField).toBeUndefined();
      expect(value.anotherUnknown).toBeUndefined();
      expect(value.email).toBe('test@example.com');
      expect(value.password).toBe('password123');
    });
  });
});
