/**
 * Migration 002: Create Games Table
 * 
 * Creates the games table for storing claimed games.
 */

CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(1024),
  price DECIMAL(10, 2) DEFAULT 0,
  platforms JSON DEFAULT '[]',
  sources JSON DEFAULT '[]',
  url VARCHAR(1024),
  claimedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiresAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_games_userId ON games(userId);
CREATE INDEX idx_games_claimedAt ON games(claimedAt DESC);
CREATE INDEX idx_games_expiresAt ON games(expiresAt);
CREATE INDEX idx_games_title ON games(title);
CREATE INDEX idx_games_createdAt ON games(createdAt DESC);

-- Create trigger to update updatedAt
CREATE OR REPLACE FUNCTION update_games_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER games_timestamp_trigger
BEFORE UPDATE ON games
FOR EACH ROW
EXECUTE FUNCTION update_games_timestamp();
