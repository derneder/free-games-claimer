/**
 * Migration 004: Create Refresh Tokens Table
 * 
 * Creates the refreshTokens table for token management.
 */

CREATE TABLE refreshTokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(512) NOT NULL UNIQUE,
  expiresAt TIMESTAMP NOT NULL,
  revokedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_refreshTokens_userId ON refreshTokens(userId);
CREATE INDEX idx_refreshTokens_token ON refreshTokens(token);
CREATE INDEX idx_refreshTokens_expiresAt ON refreshTokens(expiresAt);
CREATE INDEX idx_refreshTokens_revokedAt ON refreshTokens(revokedAt) WHERE revokedAt IS NOT NULL;
