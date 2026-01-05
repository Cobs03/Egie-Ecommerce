-- Create user_consents table for third-party service consent management
-- This table stores user consent preferences for data sharing with third parties

CREATE TABLE IF NOT EXISTS user_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- General consents
  marketing BOOLEAN DEFAULT false,
  analytics BOOLEAN DEFAULT false,
  personalization BOOLEAN DEFAULT false,
  cookies BOOLEAN DEFAULT false,
  third_party_sharing BOOLEAN DEFAULT false,
  research BOOLEAN DEFAULT false,
  
  -- Third-party service consents
  ai_assistant BOOLEAN DEFAULT true, -- Groq AI (optional)
  email_service BOOLEAN DEFAULT true, -- Resend (required, always true)
  payment_processing BOOLEAN DEFAULT true, -- PayMongo (required, always true)
  
  -- Metadata
  consent_version VARCHAR(20) DEFAULT '1.0',
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX idx_user_consents_user_id ON user_consents(user_id);

-- Enable Row Level Security
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only view their own consents
CREATE POLICY "Users can view own consents"
  ON user_consents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own consents
CREATE POLICY "Users can insert own consents"
  ON user_consents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own consents
CREATE POLICY "Users can update own consents"
  ON user_consents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_consents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_user_consents_timestamp
  BEFORE UPDATE ON user_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_user_consents_updated_at();

-- Insert default consents for existing users (optional migration)
-- This ensures backward compatibility - existing users get default consents
INSERT INTO user_consents (user_id, ai_assistant, email_service, payment_processing)
SELECT 
  id as user_id,
  true as ai_assistant,
  true as email_service,
  true as payment_processing
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_consents)
ON CONFLICT (user_id) DO NOTHING;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON user_consents TO authenticated;
GRANT USAGE ON SEQUENCE user_consents_id_seq TO authenticated;
