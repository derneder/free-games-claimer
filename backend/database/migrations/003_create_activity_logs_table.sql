/**
 * Migration 003: Create Activity Logs Table
 * 
 * Creates the activityLogs table for audit trail.
 */

CREATE TABLE activityLogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  description TEXT,
  resourceType VARCHAR(50),
  resourceId UUID,
  ipAddress INET,
  userAgent TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_activityLogs_userId ON activityLogs(userId);
CREATE INDEX idx_activityLogs_action ON activityLogs(action);
CREATE INDEX idx_activityLogs_createdAt ON activityLogs(createdAt DESC);
CREATE INDEX idx_activityLogs_resourceType ON activityLogs(resourceType);

-- Create composite index for common queries
CREATE INDEX idx_activityLogs_user_action ON activityLogs(userId, action, createdAt DESC);
