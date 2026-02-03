/**
 * Migration 006: Create User Credentials Table
 * 
 * Creates the user_credentials table for storing encrypted provider credentials.
 * Supports Epic Games, GOG, and Steam providers with encrypted data storage.
 */

-- Create enum for provider types
CREATE TYPE provider_type AS ENUM ('epic', 'gog', 'steam');

-- Create enum for credential status
CREATE TYPE credential_status AS ENUM ('active', 'inactive', 'verification_failed', 'expired');

-- Create user_credentials table
CREATE TABLE user_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider provider_type NOT NULL,
  
  -- Encrypted credential data (JSONB containing ciphertext, iv, tag)
  enc_data JSONB NOT NULL,
  
  -- Encryption metadata
  key_version INTEGER NOT NULL DEFAULT 1,
  
  -- Status tracking
  status credential_status DEFAULT 'active',
  error_message TEXT,
  last_verified_at TIMESTAMP,
  last_rotated_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  UNIQUE(user_id, provider)
);

-- Create indexes for performance
CREATE INDEX idx_user_credentials_user_id ON user_credentials(user_id);
CREATE INDEX idx_user_credentials_provider ON user_credentials(provider);
CREATE INDEX idx_user_credentials_status ON user_credentials(status);
CREATE INDEX idx_user_credentials_created_at ON user_credentials(created_at DESC);

-- Create trigger to update updatedAt
CREATE OR REPLACE FUNCTION update_user_credentials_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_credentials_timestamp_trigger
BEFORE UPDATE ON user_credentials
FOR EACH ROW
EXECUTE FUNCTION update_user_credentials_timestamp();

-- Create audit log table for credential operations
CREATE TABLE credential_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider provider_type NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'created', 'updated', 'deleted', 'verified', 'claim_success', 'claim_failed'
  ip_address INET,
  user_agent TEXT,
  metadata JSONB, -- Non-sensitive metadata about the operation
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for audit log
CREATE INDEX idx_credential_audit_log_user_id ON credential_audit_log(user_id);
CREATE INDEX idx_credential_audit_log_provider ON credential_audit_log(provider);
CREATE INDEX idx_credential_audit_log_created_at ON credential_audit_log(created_at DESC);

-- Add comment to tables
COMMENT ON TABLE user_credentials IS 'Stores encrypted provider credentials for auto-claiming';
COMMENT ON TABLE credential_audit_log IS 'Audit trail for credential operations';
