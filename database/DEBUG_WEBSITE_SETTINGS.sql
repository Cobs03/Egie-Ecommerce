-- ==========================================
-- DEBUG SCRIPT: Check Website Settings Setup
-- ==========================================

-- 1. Check if table exists and has data
SELECT 'Table Data:' as step;
SELECT * FROM website_settings;

-- 2. Check RLS is enabled
SELECT 'RLS Status:' as step;
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'website_settings';

-- 3. Check all policies
SELECT 'RLS Policies:' as step;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'website_settings';

-- 4. Test anonymous access (THIS IS THE KEY TEST)
-- You need to run this query in Supabase SQL Editor
-- with the "RLS enabled" toggle ON to simulate anon user
SELECT 'Testing Anonymous Access:' as step;
SELECT * FROM website_settings WHERE id = 1;

-- ==========================================
-- IF THE LAST QUERY RETURNS 0 ROWS:
-- The RLS policy is blocking anonymous users!
-- 
-- SOLUTION: Run this to fix:
-- ==========================================

DROP POLICY IF EXISTS "Public can read website settings" ON website_settings;

CREATE POLICY "Public can read website settings"
ON website_settings
FOR SELECT
TO anon
USING (true);

-- Also ensure authenticated users can still read
DROP POLICY IF EXISTS "Authenticated users can read website settings" ON website_settings;

CREATE POLICY "Authenticated users can read website settings"
ON website_settings
FOR SELECT
TO authenticated
USING (true);

-- ==========================================
-- AFTER RUNNING THE FIX, TEST AGAIN:
-- ==========================================
SELECT * FROM website_settings WHERE id = 1;
