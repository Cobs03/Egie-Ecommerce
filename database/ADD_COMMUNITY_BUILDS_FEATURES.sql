-- =====================================================
-- ADD COMMUNITY BUILDS FEATURES
-- =====================================================
-- This migration adds social features to saved_builds:
-- - Public/private builds
-- - Likes system
-- - View tracking
-- - Purchase tracking
-- - Creator username
-- =====================================================

-- Step 1: Add new columns to saved_builds table
ALTER TABLE saved_builds
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS purchase_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_by_username TEXT;

-- Step 2: Create build_likes table to track who liked which build
CREATE TABLE IF NOT EXISTS build_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  build_id UUID NOT NULL REFERENCES saved_builds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(build_id, user_id)
);

-- Step 3: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_build_likes_build_id ON build_likes(build_id);
CREATE INDEX IF NOT EXISTS idx_build_likes_user_id ON build_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_builds_is_public ON saved_builds(is_public);
CREATE INDEX IF NOT EXISTS idx_saved_builds_popularity ON saved_builds(likes_count DESC, purchase_count DESC, view_count DESC);

-- Step 4: Enable RLS on build_likes table
ALTER TABLE build_likes ENABLE ROW LEVEL SECURITY;

-- Step 5: RLS Policies for build_likes

-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can view build likes" ON build_likes;
DROP POLICY IF EXISTS "Users can like public builds" ON build_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON build_likes;

-- Policy: Users can view all likes
CREATE POLICY "Anyone can view build likes"
ON build_likes FOR SELECT
USING (true);

-- Policy: Users can like any public build
CREATE POLICY "Users can like public builds"
ON build_likes FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM saved_builds 
    WHERE id = build_likes.build_id 
    AND is_public = true
  )
);

-- Policy: Users can unlike their own likes
CREATE POLICY "Users can delete their own likes"
ON build_likes FOR DELETE
USING (auth.uid() = user_id);

-- Step 6: Update RLS policies on saved_builds to allow viewing public builds

-- Drop ALL existing policies for saved_builds
DROP POLICY IF EXISTS "Users can view their own builds" ON saved_builds;
DROP POLICY IF EXISTS "Users can view their own builds and public builds" ON saved_builds;
DROP POLICY IF EXISTS "Anyone can increment view count on public builds" ON saved_builds;
DROP POLICY IF EXISTS "Users can insert their own builds" ON saved_builds;
DROP POLICY IF EXISTS "Users can update their own builds" ON saved_builds;
DROP POLICY IF EXISTS "Users can delete their own builds" ON saved_builds;

-- 1. SELECT: Users can view their own builds and public builds
CREATE POLICY "Users can view their own builds and public builds"
ON saved_builds FOR SELECT
USING (
  auth.uid() = user_id OR is_public = true
);

-- 2. INSERT: Users can insert their own builds
CREATE POLICY "Users can insert their own builds"
ON saved_builds FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE: Users can update their own builds OR anyone can update public build stats
CREATE POLICY "Users can update their own builds"
ON saved_builds FOR UPDATE
USING (
  auth.uid() = user_id OR is_public = true
)
WITH CHECK (
  auth.uid() = user_id OR is_public = true
);

-- 4. DELETE: Users can delete their own builds
CREATE POLICY "Users can delete their own builds"
ON saved_builds FOR DELETE
USING (auth.uid() = user_id);

-- Step 7: Create function to automatically update likes_count
CREATE OR REPLACE FUNCTION update_build_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE saved_builds
    SET likes_count = likes_count + 1
    WHERE id = NEW.build_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE saved_builds
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.build_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create trigger to automatically update likes_count
DROP TRIGGER IF EXISTS trigger_update_build_likes_count ON build_likes;
CREATE TRIGGER trigger_update_build_likes_count
AFTER INSERT OR DELETE ON build_likes
FOR EACH ROW
EXECUTE FUNCTION update_build_likes_count();

-- Step 9: Create function to get username from profiles table
CREATE OR REPLACE FUNCTION get_user_username(user_id_param UUID)
RETURNS TEXT AS $$
DECLARE
  username_result TEXT;
BEGIN
  -- Try to get first_name and last_name, fallback to email
  SELECT COALESCE(
    NULLIF(TRIM(CONCAT(first_name, ' ', last_name)), ''),
    email,
    'Anonymous User'
  )
  INTO username_result
  FROM profiles
  WHERE id = user_id_param;
  
  RETURN COALESCE(username_result, 'Anonymous User');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Update existing builds to populate created_by_username
UPDATE saved_builds
SET created_by_username = get_user_username(user_id)
WHERE created_by_username IS NULL;

-- =====================================================
-- VERIFICATION QUERIES (Optional - for testing)
-- =====================================================
-- Check if columns were added:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'saved_builds';

-- Check if build_likes table was created:
-- SELECT * FROM information_schema.tables WHERE table_name = 'build_likes';

-- Check RLS policies:
-- SELECT * FROM pg_policies WHERE tablename IN ('saved_builds', 'build_likes');

-- =====================================================
-- RPC FUNCTIONS FOR INCREMENTING COUNTS
-- =====================================================

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_build_views(build_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE saved_builds
  SET view_count = view_count + 1
  WHERE id = build_id AND is_public = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment purchase count
CREATE OR REPLACE FUNCTION increment_build_purchases(build_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE saved_builds
  SET purchase_count = purchase_count + 1
  WHERE id = build_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
