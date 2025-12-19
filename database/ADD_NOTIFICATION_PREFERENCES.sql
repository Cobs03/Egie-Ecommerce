-- ================================================
-- ADD NOTIFICATION PREFERENCES TO PROFILES TABLE
-- ================================================
-- This migration adds a notification_preferences column to store
-- user notification settings (email and push notifications)
-- ================================================

-- Add notification_preferences column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "email_order_updates": true,
  "email_promotions": true,
  "email_stock_alerts": false,
  "push_order_updates": true,
  "push_promotions": false
}'::jsonb;

-- Add comment to explain the column
COMMENT ON COLUMN profiles.notification_preferences IS 
'JSON object storing user notification preferences for email and push notifications. Controls which types of notifications the user wants to receive.';

-- Create index for faster queries on notification preferences
CREATE INDEX IF NOT EXISTS idx_profiles_notification_preferences 
ON profiles USING GIN (notification_preferences);

COMMENT ON INDEX idx_profiles_notification_preferences IS 
'GIN index for efficient queries on notification preferences.';

-- Example queries:

-- Get users who want email order updates
-- SELECT id, email, notification_preferences 
-- FROM profiles 
-- WHERE notification_preferences->>'email_order_updates' = 'true';

-- Get users who want promotional emails
-- SELECT id, email, notification_preferences 
-- FROM profiles 
-- WHERE notification_preferences->>'email_promotions' = 'true';

-- Update notification preference for a user
-- UPDATE profiles 
-- SET notification_preferences = jsonb_set(
--   notification_preferences, 
--   '{email_promotions}', 
--   'false'
-- )
-- WHERE id = 'user-id';
