-- Create privacy objections tracking for GDPR compliance
-- This stores user objections to specific data processing activities

-- Add data_processing_objections column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS data_processing_objections JSONB DEFAULT '{
  "profiling": false,
  "marketingAnalysis": false,
  "thirdPartyAnalytics": false
}'::jsonb;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS objections_updated_at TIMESTAMP WITH TIME ZONE;

-- Create data_processing_objections table for detailed tracking
CREATE TABLE IF NOT EXISTS public.data_processing_objections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  objections JSONB NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'implemented')),
  processed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create privacy_requests table for general privacy requests
CREATE TABLE IF NOT EXISTS public.privacy_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN (
    'object_processing',
    'restrict_processing',
    'data_portability',
    'correction',
    'access_request',
    'other'
  )),
  details TEXT NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  processed_by UUID REFERENCES auth.users(id),
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_objections_user_id ON data_processing_objections(user_id);
CREATE INDEX IF NOT EXISTS idx_objections_status ON data_processing_objections(status);
CREATE INDEX IF NOT EXISTS idx_privacy_requests_user_id ON privacy_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_requests_status ON privacy_requests(status);
CREATE INDEX IF NOT EXISTS idx_privacy_requests_type ON privacy_requests(request_type);

-- Enable Row Level Security
ALTER TABLE data_processing_objections ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for data_processing_objections

-- Users can only see their own objections
CREATE POLICY "Users can view own objections"
  ON data_processing_objections
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own objections
CREATE POLICY "Users can create own objections"
  ON data_processing_objections
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all objections
CREATE POLICY "Admins can view all objections"
  ON data_processing_objections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

-- Admins can update objections
CREATE POLICY "Admins can update objections"
  ON data_processing_objections
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

-- RLS Policies for privacy_requests

-- Users can only see their own privacy requests
CREATE POLICY "Users can view own privacy requests"
  ON privacy_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own privacy requests
CREATE POLICY "Users can create own privacy requests"
  ON privacy_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all privacy requests
CREATE POLICY "Admins can view all privacy requests"
  ON privacy_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

-- Admins can update privacy requests
CREATE POLICY "Admins can update privacy requests"
  ON privacy_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin' OR profiles.is_admin = true)
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_objections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_privacy_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
DROP TRIGGER IF EXISTS objections_updated_at ON data_processing_objections;
CREATE TRIGGER objections_updated_at
  BEFORE UPDATE ON data_processing_objections
  FOR EACH ROW
  EXECUTE FUNCTION update_objections_updated_at();

DROP TRIGGER IF EXISTS privacy_requests_updated_at ON privacy_requests;
CREATE TRIGGER privacy_requests_updated_at
  BEFORE UPDATE ON privacy_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_privacy_requests_updated_at();

-- Grant permissions
GRANT SELECT, INSERT ON data_processing_objections TO authenticated;
GRANT SELECT, INSERT ON privacy_requests TO authenticated;
GRANT ALL ON data_processing_objections TO service_role;
GRANT ALL ON privacy_requests TO service_role;

-- Add comments
COMMENT ON TABLE data_processing_objections IS 'Tracks user objections to specific data processing activities';
COMMENT ON TABLE privacy_requests IS 'General privacy requests from users (right to object, restrict, correct, etc.)';
COMMENT ON COLUMN data_processing_objections.status IS 'Status: pending, approved, rejected, implemented';
COMMENT ON COLUMN privacy_requests.request_type IS 'Type: object_processing, restrict_processing, data_portability, correction, access_request, other';
COMMENT ON COLUMN profiles.data_processing_objections IS 'Current objections to data processing activities';

-- Example queries:
-- Get all pending objections:
-- SELECT * FROM data_processing_objections WHERE status = 'pending' ORDER BY requested_at DESC;

-- Get user's current objections:
-- SELECT data_processing_objections FROM profiles WHERE id = 'user-uuid';

-- Get all privacy requests by type:
-- SELECT * FROM privacy_requests WHERE request_type = 'object_processing' ORDER BY requested_at DESC;
