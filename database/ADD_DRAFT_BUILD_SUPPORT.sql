-- Add support for draft builds (auto-saved builds)
-- This allows users to have their work-in-progress builds saved automatically

-- First, disable RLS temporarily to add columns
ALTER TABLE saved_builds DISABLE ROW LEVEL SECURITY;

-- Add is_draft column to saved_builds table
ALTER TABLE saved_builds
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false;

-- Add index for faster draft queries
CREATE INDEX IF NOT EXISTS idx_saved_builds_draft 
ON saved_builds(user_id, is_draft) 
WHERE is_draft = true;

-- Add updated_at column to track when draft was last modified
ALTER TABLE saved_builds
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger to auto-update updated_at column
CREATE OR REPLACE FUNCTION update_saved_builds_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_saved_builds_updated_at ON saved_builds;
CREATE TRIGGER trigger_update_saved_builds_updated_at
    BEFORE UPDATE ON saved_builds
    FOR EACH ROW
    EXECUTE FUNCTION update_saved_builds_updated_at();

-- Re-enable RLS
ALTER TABLE saved_builds ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view their own builds" ON saved_builds;
DROP POLICY IF EXISTS "Users can view their own drafts" ON saved_builds;
DROP POLICY IF EXISTS "Users can insert their own builds" ON saved_builds;
DROP POLICY IF EXISTS "Users can update their own builds" ON saved_builds;
DROP POLICY IF EXISTS "Users can update their own drafts" ON saved_builds;
DROP POLICY IF EXISTS "Users can delete their own builds" ON saved_builds;
DROP POLICY IF EXISTS "Users can delete their own drafts" ON saved_builds;
DROP POLICY IF EXISTS "Public builds are viewable by everyone" ON saved_builds;
DROP POLICY IF EXISTS "Users can view public builds" ON saved_builds;
DROP POLICY IF EXISTS "Users can view their own builds and public builds" ON saved_builds;

-- Create comprehensive policies
-- 1. Users can view their own builds (drafts and saved) AND public builds from others
CREATE POLICY "Users can view their own builds and public builds"
ON saved_builds FOR SELECT
USING (
  auth.uid() = user_id OR is_public = true
);

-- 2. Users can insert their own builds
CREATE POLICY "Users can insert their own builds"
ON saved_builds FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own builds
CREATE POLICY "Users can update their own builds"
ON saved_builds FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Users can delete their own builds
CREATE POLICY "Users can delete their own builds"
ON saved_builds FOR DELETE
USING (auth.uid() = user_id);

-- Add comments
COMMENT ON COLUMN saved_builds.is_draft IS 'True if this is an auto-saved draft build, false if it is a named saved build';
COMMENT ON COLUMN saved_builds.updated_at IS 'Timestamp of last update, used for draft builds';
