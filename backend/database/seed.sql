/**
 * Database Seed
 * 
 * Creates test data for development.
 */

-- Insert test users
INSERT INTO users (email, username, password, role, isActive) VALUES
(
  'admin@example.com',
  'admin',
  '$2a$10$u8QNxjpJXyGHbmrLjf1S0ORvYsNpQ9h7Kk2eVf5zQxI8uC7U7lYrm', -- password: Admin@1234
  'admin',
  TRUE
),
(
  'user@example.com',
  'testuser',
  '$2a$10$u8QNxjpJXyGHbmrLjf1S0ORvYsNpQ9h7Kk2eVf5zQxI8uC7U7lYrm', -- password: Admin@1234
  'user',
  TRUE
),
(
  'user2@example.com',
  'testuser2',
  '$2a$10$u8QNxjpJXyGHbmrLjf1S0ORvYsNpQ9h7Kk2eVf5zQxI8uC7U7lYrm', -- password: Admin@1234
  'user',
  TRUE
);

-- Insert test games
INSERT INTO games (userId, title, description, image, price, platforms, sources, claimedAt, expiresAt) VALUES
(
  (SELECT id FROM users WHERE email = 'user@example.com'),
  'Fortnite',
  'Battle royale game',
  'https://example.com/fortnite.jpg',
  29.99,
  '["PC", "PlayStation", "Xbox"]',
  '["Epic Games"]',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP + INTERVAL '30 days'
),
(
  (SELECT id FROM users WHERE email = 'user@example.com'),
  'The Witcher 3',
  'Open-world RPG',
  'https://example.com/witcher3.jpg',
  39.99,
  '["PC", "PlayStation", "Xbox"]',
  '["GOG"]',
  CURRENT_TIMESTAMP - INTERVAL '5 days',
  CURRENT_TIMESTAMP + INTERVAL '25 days'
),
(
  (SELECT id FROM users WHERE email = 'user2@example.com'),
  'Cyberpunk 2077',
  'Sci-fi RPG',
  'https://example.com/cyberpunk.jpg',
  49.99,
  '["PC", "PlayStation", "Xbox"]',
  '["GOG"]',
  CURRENT_TIMESTAMP - INTERVAL '10 days',
  CURRENT_TIMESTAMP + INTERVAL '20 days'
);

-- Insert test activity logs
INSERT INTO activityLogs (userId, action, description, resourceType, resourceId) VALUES
(
  (SELECT id FROM users WHERE email = 'user@example.com'),
  'USER_LOGIN',
  'User logged in',
  NULL,
  NULL
),
(
  (SELECT id FROM users WHERE email = 'user@example.com'),
  'GAME_CLAIMED',
  'Game claimed: Fortnite',
  'game',
  (SELECT id FROM games WHERE title = 'Fortnite' LIMIT 1)
),
(
  (SELECT id FROM users WHERE email = 'admin@example.com'),
  'ADMIN_LOGIN',
  'Admin logged in',
  NULL,
  NULL
);
