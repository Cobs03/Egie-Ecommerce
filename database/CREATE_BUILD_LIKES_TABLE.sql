-- Create build_likes table for Community Builds like/unlike functionality
-- This table tracks which users have liked which PC builds

-- Create the table
CREATE TABLE IF NOT EXISTS build_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  build_id UUID NOT NULL REFERENCES community_builds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure a user can only like a build once
  UNIQUE(build_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_build_likes_build_id ON build_likes(build_id);
CREATE INDEX IF NOT EXISTS idx_build_likes_user_id ON build_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_build_likes_created_at ON build_likes(created_at DESC);

-- Enable Row Level Security
ALTER TABLE build_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view likes" ON build_likes;
DROP POLICY IF EXISTS "Users can like builds" ON build_likes;
DROP POLICY IF EXISTS "Users can unlike builds" ON build_likes;

-- Policy: Anyone can view likes (for displaying like counts)
CREATE POLICY "Anyone can view likes"
  ON build_likes
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can like builds
CREATE POLICY "Users can like builds"
  ON build_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only unlike their own likes
CREATE POLICY "Users can unlike builds"
  ON build_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE build_likes IS 'Tracks user likes for community PC builds';

-- After running this SQL, uncomment the build_likes code in:
-- src/services/BuildService.js (likeBuild, unlikeBuild, hasLiked methods)
