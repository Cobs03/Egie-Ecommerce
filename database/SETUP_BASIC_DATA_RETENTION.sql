-- =====================================================
-- BASIC DATA RETENTION SYSTEM (Works with existing tables only)
-- =====================================================
-- Simplified version that only uses tables that exist in your database
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: ADD ANONYMIZATION COLUMNS TO EXISTING TABLES
-- =====================================================

-- Add anonymization tracking to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS anonymized BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ;

-- Add anonymization tracking to shipping addresses
ALTER TABLE shipping_addresses
ADD COLUMN IF NOT EXISTS anonymized BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ;

-- =====================================================
-- STEP 2: BASIC DELETION FUNCTIONS
-- =====================================================

-- 1. Delete AI Chat History Older Than 90 Days
CREATE OR REPLACE FUNCTION delete_old_ai_chat_history()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Delete messages older than 90 days
  DELETE FROM chat_history
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Anonymize Orders Older Than 7 Years
CREATE OR REPLACE FUNCTION anonymize_old_orders()
RETURNS INTEGER AS $$
DECLARE
  v_anonymized_count INTEGER;
BEGIN
  -- Anonymize order data (keep for tax purposes, remove PII)
  UPDATE orders
  SET 
    customer_notes = NULL,
    anonymized = TRUE,
    anonymized_at = NOW()
  WHERE created_at < NOW() - INTERVAL '7 years'
  AND (anonymized = FALSE OR anonymized IS NULL);
  
  GET DIAGNOSTICS v_anonymized_count = ROW_COUNT;
  
  -- Anonymize related shipping addresses
  UPDATE shipping_addresses sa
  SET 
    recipient_name = 'Anonymized User',
    phone_number = NULL,
    street_address = 'REDACTED FOR PRIVACY',
    apartment_unit = NULL,
    notes = NULL,
    anonymized = TRUE,
    anonymized_at = NOW()
  WHERE sa.id IN (
    SELECT shipping_address_id FROM orders
    WHERE created_at < NOW() - INTERVAL '7 years'
    AND shipping_address_id IS NOT NULL
  )
  AND (sa.anonymized = FALSE OR sa.anonymized IS NULL);
  
  RETURN v_anonymized_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Delete Old Contact Form Submissions (Resolved, 2 Years)
CREATE OR REPLACE FUNCTION delete_old_contact_submissions()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Delete resolved/closed contact forms older than 2 years
  DELETE FROM contact_submissions
  WHERE created_at < NOW() - INTERVAL '2 years'
  AND status IN ('resolved', 'closed');
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Delete Old Cart Items (Abandoned, 90 Days)
CREATE OR REPLACE FUNCTION delete_abandoned_carts()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Delete cart items not updated in 90 days
  DELETE FROM cart_items
  WHERE updated_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Master Cleanup Function (Runs All Deletions)
CREATE OR REPLACE FUNCTION run_data_cleanup()
RETURNS TABLE(
  ai_chat_deleted INTEGER,
  orders_anonymized INTEGER,
  contacts_deleted INTEGER,
  carts_deleted INTEGER,
  total_operations INTEGER
) AS $$
DECLARE
  v_ai_chat INTEGER;
  v_orders INTEGER;
  v_contacts INTEGER;
  v_carts INTEGER;
BEGIN
  -- Run all cleanup functions
  v_ai_chat := delete_old_ai_chat_history();
  v_orders := anonymize_old_orders();
  v_contacts := delete_old_contact_submissions();
  v_carts := delete_abandoned_carts();
  
  -- Return summary
  RETURN QUERY SELECT 
    v_ai_chat,
    v_orders,
    v_contacts,
    v_carts,
    (v_ai_chat + v_orders + v_contacts + v_carts) as total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 3: MONITORING QUERIES
-- =====================================================

-- Check what data is eligible for deletion/anonymization
CREATE OR REPLACE FUNCTION check_retention_status()
RETURNS TABLE(
  category TEXT,
  records_to_process INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'AI Chat Messages (90 days)'::TEXT as category,
    COUNT(*)::INTEGER as records_to_process
  FROM chat_history
  WHERE created_at < NOW() - INTERVAL '90 days'
  
  UNION ALL
  
  SELECT 
    'Orders (7 years)'::TEXT,
    COUNT(*)::INTEGER
  FROM orders
  WHERE created_at < NOW() - INTERVAL '7 years'
  AND (anonymized = FALSE OR anonymized IS NULL)
  
  UNION ALL
  
  SELECT 
    'Contact Forms (2 years)'::TEXT,
    COUNT(*)::INTEGER
  FROM contact_submissions
  WHERE created_at < NOW() - INTERVAL '2 years'
  AND status IN ('resolved', 'closed')
  
  UNION ALL
  
  SELECT 
    'Abandoned Carts (90 days)'::TEXT,
    COUNT(*)::INTEGER
  FROM cart_items
  WHERE updated_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 4: GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION delete_old_ai_chat_history() TO service_role;
GRANT EXECUTE ON FUNCTION anonymize_old_orders() TO service_role;
GRANT EXECUTE ON FUNCTION delete_old_contact_submissions() TO service_role;
GRANT EXECUTE ON FUNCTION delete_abandoned_carts() TO service_role;
GRANT EXECUTE ON FUNCTION run_data_cleanup() TO service_role;
GRANT EXECUTE ON FUNCTION check_retention_status() TO service_role;

-- =====================================================
-- STEP 5: MANUAL TESTING
-- =====================================================

-- Check what will be deleted/anonymized
SELECT * FROM check_retention_status();

-- Run cleanup manually (uncomment to execute)
-- SELECT * FROM run_data_cleanup();

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Basic data retention system setup complete!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Check what will be processed:';
  RAISE NOTICE '   SELECT * FROM check_retention_status();';
  RAISE NOTICE '';
  RAISE NOTICE '🧹 Run manual cleanup:';
  RAISE NOTICE '   SELECT * FROM run_data_cleanup();';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ For automatic scheduling, you need:';
  RAISE NOTICE '   - Supabase Pro plan (for pg_cron)';
  RAISE NOTICE '   - OR set calendar reminder to run monthly';
END $$;
