-- Create saved_builds table for storing user PC builds
CREATE TABLE IF NOT EXISTS saved_builds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  build_name VARCHAR(255) NOT NULL,
  components JSONB NOT NULL, -- Store selected components as JSON
  total_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_saved_builds_user_id ON saved_builds(user_id);
CREATE INDEX idx_saved_builds_created_at ON saved_builds(created_at DESC);

-- Enable Row Level Security
ALTER TABLE saved_builds ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own builds
CREATE POLICY "Users can view their own builds"
  ON saved_builds
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own builds
CREATE POLICY "Users can create their own builds"
  ON saved_builds
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own builds
CREATE POLICY "Users can update their own builds"
  ON saved_builds
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own builds
CREATE POLICY "Users can delete their own builds"
  ON saved_builds
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_saved_builds_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_saved_builds_updated_at
  BEFORE UPDATE ON saved_builds
  FOR EACH ROW
  EXECUTE FUNCTION update_saved_builds_updated_at();
