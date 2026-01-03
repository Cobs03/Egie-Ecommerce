-- ==========================================
-- FIX: Allow Anonymous Users to Read Website Settings
-- ==========================================
-- This is the EXACT issue - your ecommerce site visits as 
-- anonymous users, but the RLS policy isn't allowing them to read!
-- ==========================================

-- Drop old policies (in case they're misconfigured)
DROP POLICY IF EXISTS "Public can read website settings" ON website_settings;
DROP POLICY IF EXISTS "Authenticated users can read website settings" ON website_settings;
DROP POLICY IF EXISTS "Enable read access for all users" ON website_settings;

-- Create NEW policy that DEFINITELY allows anonymous reads
CREATE POLICY "enable_read_for_anon_and_authenticated"
ON website_settings
FOR SELECT
USING (true);

-- Verify RLS is enabled
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;

-- Test it works
SELECT * FROM website_settings WHERE id = 1;
