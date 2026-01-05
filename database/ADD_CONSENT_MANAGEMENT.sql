-- Create consent management tables for GDPR compliance
-- This stores user consent for different types of data processing

-- Add user_consents column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS user_consents JSONB DEFAULT '{
  "marketing": true,
  "analytics": true,
  "personalization": true,
  "thirdPartySharing": false,
  "cookies": true,
  "research": false
}'::jsonb;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS consents_updated_at TIMESTAMP WITH TIME ZONE;

-- Create user_consent_audit table for tracking consent changes
CREATE TABLE IF NOT EXISTS public.user_consent_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  consents JSONB NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consent_audit_user_id ON user_consent_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_audit_created_at ON user_consent_audit(created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_consent_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_consent_audit

-- Users can only see their own consent history
CREATE POLICY "Users can view own consent history"
  ON user_consent_audit
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own consent records
CREATE POLICY "Users can insert own consent records"
  ON user_consent_audit
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all consent records for compliance
CREATE POLICY "Admins can view all consent records"
  ON user_consent_audit
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

-- Grant permissions
GRANT SELECT, INSERT ON user_consent_audit TO authenticated;
GRANT ALL ON user_consent_audit TO service_role;

-- Add comments
COMMENT ON TABLE user_consent_audit IS 'Audit trail of user consent changes for GDPR compliance';
COMMENT ON COLUMN user_consent_audit.consents IS 'JSON object containing all consent preferences at the time of update';
COMMENT ON COLUMN profiles.user_consents IS 'Current user consent preferences for various data processing activities';

-- Create function to automatically log consent changes
CREATE OR REPLACE FUNCTION log_consent_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if consents actually changed
  IF (OLD.user_consents IS DISTINCT FROM NEW.user_consents) THEN
    INSERT INTO user_consent_audit (user_id, consents)
    VALUES (NEW.id, NEW.user_consents);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically log consent changes
DROP TRIGGER IF EXISTS trigger_log_consent_change ON profiles;
CREATE TRIGGER trigger_log_consent_change
  AFTER UPDATE OF user_consents ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_consent_change();

-- Example query to check consent for specific user
-- SELECT user_consents->>'marketing' as marketing_consent FROM profiles WHERE id = 'user-uuid';

-- Example query to get consent history
-- SELECT * FROM user_consent_audit WHERE user_id = 'user-uuid' ORDER BY created_at DESC;
