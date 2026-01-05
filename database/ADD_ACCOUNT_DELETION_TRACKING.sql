-- Create account_deletion_requests table for tracking deletion requests
-- This table stores user requests for account deletion for GDPR compliance

CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  processed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add status and deletion_requested_at columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deletion_requested', 'deleted', 'banned'));

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS deletion_requested_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deletion_requests_user_id ON account_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON account_deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);

-- Enable Row Level Security
ALTER TABLE account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for account_deletion_requests

-- Users can only see their own deletion requests
CREATE POLICY "Users can view own deletion requests"
  ON account_deletion_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only create their own deletion requests
CREATE POLICY "Users can create own deletion requests"
  ON account_deletion_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only admins can update deletion requests
CREATE POLICY "Admins can update deletion requests"
  ON account_deletion_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

-- Only admins can view all deletion requests
CREATE POLICY "Admins can view all deletion requests"
  ON account_deletion_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_account_deletion_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS account_deletion_requests_updated_at ON account_deletion_requests;
CREATE TRIGGER account_deletion_requests_updated_at
  BEFORE UPDATE ON account_deletion_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_account_deletion_requests_updated_at();

-- Grant permissions
GRANT SELECT, INSERT ON account_deletion_requests TO authenticated;
GRANT ALL ON account_deletion_requests TO service_role;

COMMENT ON TABLE account_deletion_requests IS 'Stores user account deletion requests for GDPR compliance';
COMMENT ON COLUMN account_deletion_requests.status IS 'Status: pending, approved, rejected, completed';
COMMENT ON COLUMN profiles.status IS 'User account status: active, deletion_requested, deleted, banned';
