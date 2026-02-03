/**
 * Migration 007: Add Telegram ID to Users Table
 * 
 * Adds telegram_id column to support Telegram bot integration.
 */

-- Add telegram_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS telegram_id VARCHAR(50) UNIQUE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
