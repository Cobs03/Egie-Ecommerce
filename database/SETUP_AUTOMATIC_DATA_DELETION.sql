-- =====================================================
-- AUTOMATIC DATA DELETION & RETENTION SYSTEM
-- =====================================================
-- This script sets up automatic deletion/anonymization
-- based on defined retention periods
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: ENABLE PG_CRON EXTENSION
-- =====================================================
-- Note: This may require Supabase Pro plan or contact support
-- For free tier, use Supabase Edge Functions as alternative

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- =====================================================
-- STEP 2: ADD ANONYMIZATION COLUMNS TO TABLES
-- =====================================================

-- Add anonymization tracking to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS anonymized BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ;

-- Add anonymization tracking to shipping addresses
ALTER TABLE shipping_addresses
ADD COLUMN IF NOT EXISTS anonymized BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS anonymized_at TIMESTAMPTZ;

-- Add deletion tracking to various tables
ALTER TABLE user_consents
ADD COLUMN IF NOT EXISTS auto_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- =====================================================
-- STEP 3: DELETION FUNCTIONS
-- =====================================================

-- 1. Delete AI Chat History Older Than 90 Days
CREATE OR REPLACE FUNCTION delete_old_ai_chat_history()
RETURNS TABLE(deleted_count INTEGER) AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Delete messages older than 90 days
  DELETE FROM ai_chat_messages
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Log deletion to audit trail
  IF v_deleted_count > 0 THEN
    INSERT INTO data_processing_audit_log (
      activity_id,
      change_type,
      description,
      changed_at
    ) 
    SELECT 
      id,
      'automatic_deletion',
      'Deleted ' || v_deleted_count || ' AI chat messages older than 90 days',
      NOW()
    FROM data_processing_activities 
    WHERE activity_name = 'AI Shopping Assistant'
    LIMIT 1;
  END IF;
  
  RETURN QUERY SELECT v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Anonymize IP Addresses Older Than 90 Days
CREATE OR REPLACE FUNCTION anonymize_old_ip_addresses()
RETURNS TABLE(anonymized_count INTEGER) AS $$
DECLARE
  v_anonymized_count INTEGER;
BEGIN
  -- Clear IP addresses from user consent audit
  UPDATE user_consent_audit
  SET ip_address = NULL
  WHERE created_at < NOW() - INTERVAL '90 days'
  AND ip_address IS NOT NULL;
  
  GET DIAGNOSTICS v_anonymized_count = ROW_COUNT;
  
  -- Log anonymization
  IF v_anonymized_count > 0 THEN
    INSERT INTO data_processing_audit_log (
      activity_id,
      change_type,
      description,
      changed_at
    )
    SELECT 
      id,
      'automatic_anonymization',
      'Anonymized ' || v_anonymized_count || ' IP addresses older than 90 days',
      NOW()
    FROM data_processing_activities 
    WHERE activity_name = 'Website Analytics'
    LIMIT 1;
  END IF;
  
  RETURN QUERY SELECT v_anonymized_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Anonymize Orders Older Than 7 Years
CREATE OR REPLACE FUNCTION anonymize_old_orders()
RETURNS TABLE(anonymized_count INTEGER) AS $$
DECLARE
  v_anonymized_count INTEGER;
BEGIN
  -- Anonymize order data (keep for tax purposes, remove PII)
  UPDATE orders
  SET 
    user_email = 'anonymized_' || LEFT(id::text, 8) || '@deleted.user',
    user_phone = NULL,
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
  WHERE sa.order_id IN (
    SELECT id FROM orders
    WHERE created_at < NOW() - INTERVAL '7 years'
  )
  AND (sa.anonymized = FALSE OR sa.anonymized IS NULL);
  
  -- Log anonymization
  IF v_anonymized_count > 0 THEN
    INSERT INTO data_processing_audit_log (
      activity_id,
      change_type,
      description,
      changed_at
    )
    SELECT 
      id,
      'automatic_anonymization',
      'Anonymized ' || v_anonymized_count || ' orders older than 7 years (GDPR compliance)',
      NOW()
    FROM data_processing_activities 
    WHERE activity_name = 'Order Processing'
    LIMIT 1;
  END IF;
  
  RETURN QUERY SELECT v_anonymized_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Delete Old Customer Support Tickets (2 Years)
CREATE OR REPLACE FUNCTION delete_old_support_tickets()
RETURNS TABLE(deleted_count INTEGER) AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Delete resolved/closed tickets older than 2 years
  DELETE FROM contact_submissions
  WHERE created_at < NOW() - INTERVAL '2 years'
  AND status IN ('resolved', 'closed');
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Log deletion
  IF v_deleted_count > 0 THEN
    INSERT INTO data_processing_audit_log (
      activity_id,
      change_type,
      description,
      changed_at
    )
    SELECT 
      id,
      'automatic_deletion',
      'Deleted ' || v_deleted_count || ' support tickets older than 2 years',
      NOW()
    FROM data_processing_activities 
    WHERE activity_name = 'Customer Support'
    LIMIT 1;
  END IF;
  
  RETURN QUERY SELECT v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Delete Expired Marketing Consents (3 Years)
CREATE OR REPLACE FUNCTION delete_old_marketing_consents()
RETURNS TABLE(deleted_count INTEGER) AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Mark consents as auto-deleted
  UPDATE user_consents
  SET 
    auto_deleted = TRUE,
    deleted_at = NOW()
  WHERE consent_type = 'marketing_emails'
  AND updated_at < NOW() - INTERVAL '3 years'
  AND (auto_deleted = FALSE OR auto_deleted IS NULL);
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  -- Log deletion
  IF v_deleted_count > 0 THEN
    INSERT INTO data_processing_audit_log (
      activity_id,
      change_type,
      description,
      changed_at
    )
    SELECT 
      id,
      'automatic_deletion',
      'Deleted ' || v_deleted_count || ' marketing consents older than 3 years',
      NOW()
    FROM data_processing_activities 
    WHERE activity_name = 'Marketing Communications'
    LIMIT 1;
  END IF;
  
  RETURN QUERY SELECT v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Process Pending Account Deletions (After 48 Hours)
CREATE OR REPLACE FUNCTION process_pending_account_deletions()
RETURNS TABLE(processed_count INTEGER) AS $$
DECLARE
  deletion_record RECORD;
  v_processed_count INTEGER := 0;
BEGIN
  -- Find accounts pending deletion for more than 48 hours
  FOR deletion_record IN 
    SELECT * FROM account_deletion_requests
    WHERE status = 'pending'
    AND requested_at < NOW() - INTERVAL '48 hours'
  LOOP
    -- Anonymize user profile
    UPDATE profiles
    SET 
      email = 'deleted_' || deletion_record.user_id || '@deleted.user',
      first_name = 'Deleted',
      last_name = 'User',
      phone_number = NULL,
      avatar_url = NULL,
      status = 'deleted',
      deleted_at = NOW()
    WHERE id = deletion_record.user_id;
    
    -- Anonymize orders
    UPDATE orders
    SET 
      user_email = 'deleted_user@deleted.user',
      user_phone = NULL,
      anonymized = TRUE,
      anonymized_at = NOW()
    WHERE user_id = deletion_record.user_id;
    
    -- Delete personal data
    DELETE FROM user_consents WHERE user_id = deletion_record.user_id;
    DELETE FROM saved_builds WHERE user_id = deletion_record.user_id;
    DELETE FROM wishlist WHERE user_id = deletion_record.user_id;
    DELETE FROM cart_items WHERE user_id = deletion_record.user_id;
    
    -- Delete AI chat history
    DELETE FROM ai_chat_messages WHERE user_id = deletion_record.user_id;
    
    -- Update deletion request status
    UPDATE account_deletion_requests
    SET 
      status = 'completed',
      processed_at = NOW()
    WHERE id = deletion_record.id;
    
    v_processed_count := v_processed_count + 1;
    
    -- Log completion
    INSERT INTO data_processing_audit_log (
      change_type,
      description,
      changed_at
    ) VALUES (
      'account_deletion',
      'Completed automatic account deletion for user: ' || deletion_record.email,
      NOW()
    );
  END LOOP;
  
  RETURN QUERY SELECT v_processed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Master Cleanup Function (Runs All Deletions)
CREATE OR REPLACE FUNCTION run_all_data_cleanup()
RETURNS TABLE(
  ai_chat_deleted INTEGER,
  ip_anonymized INTEGER,
  orders_anonymized INTEGER,
  tickets_deleted INTEGER,
  consents_deleted INTEGER,
  accounts_processed INTEGER,
  total_operations INTEGER
) AS $$
DECLARE
  v_ai_chat INTEGER;
  v_ip INTEGER;
  v_orders INTEGER;
  v_tickets INTEGER;
  v_consents INTEGER;
  v_accounts INTEGER;
BEGIN
  -- Run all cleanup functions
  SELECT * INTO v_ai_chat FROM delete_old_ai_chat_history();
  SELECT * INTO v_ip FROM anonymize_old_ip_addresses();
  SELECT * INTO v_orders FROM anonymize_old_orders();
  SELECT * INTO v_tickets FROM delete_old_support_tickets();
  SELECT * INTO v_consents FROM delete_old_marketing_consents();
  SELECT * INTO v_accounts FROM process_pending_account_deletions();
  
  -- Return summary
  RETURN QUERY SELECT 
    v_ai_chat,
    v_ip,
    v_orders,
    v_tickets,
    v_consents,
    v_accounts,
    (v_ai_chat + v_ip + v_orders + v_tickets + v_consents + v_accounts) as total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 4: SCHEDULE CRON JOBS
-- =====================================================

-- Unschedule existing jobs (if any)
SELECT cron.unschedule('delete-old-ai-chat-history') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'delete-old-ai-chat-history');
SELECT cron.unschedule('anonymize-old-ip-addresses') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'anonymize-old-ip-addresses');
SELECT cron.unschedule('anonymize-old-orders') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'anonymize-old-orders');
SELECT cron.unschedule('delete-old-support-tickets') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'delete-old-support-tickets');
SELECT cron.unschedule('delete-old-marketing-consents') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'delete-old-marketing-consents');
SELECT cron.unschedule('process-pending-deletions') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'process-pending-deletions');

-- Schedule daily cleanup at 2 AM UTC
SELECT cron.schedule(
  'delete-old-ai-chat-history',
  '0 2 * * *', -- Every day at 2 AM
  $$SELECT delete_old_ai_chat_history();$$
);

SELECT cron.schedule(
  'anonymize-old-ip-addresses',
  '0 2 * * *', -- Every day at 2 AM
  $$SELECT anonymize_old_ip_addresses();$$
);

-- Schedule weekly order anonymization (Sunday at 3 AM)
SELECT cron.schedule(
  'anonymize-old-orders',
  '0 3 * * 0', -- Every Sunday at 3 AM
  $$SELECT anonymize_old_orders();$$
);

-- Schedule weekly ticket deletion (Monday at 3 AM)
SELECT cron.schedule(
  'delete-old-support-tickets',
  '0 3 * * 1', -- Every Monday at 3 AM
  $$SELECT delete_old_support_tickets();$$
);

-- Schedule daily consent cleanup at 4 AM
SELECT cron.schedule(
  'delete-old-marketing-consents',
  '0 4 * * *', -- Every day at 4 AM
  $$SELECT delete_old_marketing_consents();$$
);

-- Schedule account deletions every 6 hours
SELECT cron.schedule(
  'process-pending-deletions',
  '0 */6 * * *', -- Every 6 hours
  $$SELECT process_pending_account_deletions();$$
);

-- =====================================================
-- STEP 5: VERIFICATION QUERIES
-- =====================================================

-- View all scheduled jobs
SELECT 
  jobid,
  schedule,
  command,
  nodename,
  nodeport,
  database,
  username,
  active,
  jobname
FROM cron.job
ORDER BY jobname;

-- View job run history
SELECT 
  jobid,
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;

-- =====================================================
-- STEP 6: MANUAL TESTING
-- =====================================================

-- Test individual functions manually
SELECT * FROM delete_old_ai_chat_history();
SELECT * FROM anonymize_old_ip_addresses();
SELECT * FROM anonymize_old_orders();
SELECT * FROM delete_old_support_tickets();
SELECT * FROM delete_old_marketing_consents();
SELECT * FROM process_pending_account_deletions();

-- Run all cleanup operations at once
SELECT * FROM run_all_data_cleanup();

-- =====================================================
-- STEP 7: MONITORING QUERIES
-- =====================================================

-- Check what data is eligible for deletion/anonymization
SELECT 
  'AI Chat Messages (90 days)' as category,
  COUNT(*) as records_to_delete
FROM ai_chat_messages
WHERE created_at < NOW() - INTERVAL '90 days'

UNION ALL

SELECT 
  'IP Addresses (90 days)',
  COUNT(*)
FROM user_consent_audit
WHERE created_at < NOW() - INTERVAL '90 days'
AND ip_address IS NOT NULL

UNION ALL

SELECT 
  'Orders (7 years)',
  COUNT(*)
FROM orders
WHERE created_at < NOW() - INTERVAL '7 years'
AND (anonymized = FALSE OR anonymized IS NULL)

UNION ALL

SELECT 
  'Support Tickets (2 years)',
  COUNT(*)
FROM contact_submissions
WHERE created_at < NOW() - INTERVAL '2 years'
AND status IN ('resolved', 'closed')

UNION ALL

SELECT 
  'Marketing Consents (3 years)',
  COUNT(*)
FROM user_consents
WHERE consent_type = 'marketing_emails'
AND updated_at < NOW() - INTERVAL '3 years'
AND (auto_deleted = FALSE OR auto_deleted IS NULL)

UNION ALL

SELECT 
  'Pending Account Deletions (48+ hours)',
  COUNT(*)
FROM account_deletion_requests
WHERE status = 'pending'
AND requested_at < NOW() - INTERVAL '48 hours';

-- View recent automatic deletions
SELECT 
  changed_at,
  change_type,
  description
FROM data_processing_audit_log
WHERE change_type IN ('automatic_deletion', 'automatic_anonymization', 'account_deletion')
ORDER BY changed_at DESC
LIMIT 50;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION delete_old_ai_chat_history() TO service_role;
GRANT EXECUTE ON FUNCTION anonymize_old_ip_addresses() TO service_role;
GRANT EXECUTE ON FUNCTION anonymize_old_orders() TO service_role;
GRANT EXECUTE ON FUNCTION delete_old_support_tickets() TO service_role;
GRANT EXECUTE ON FUNCTION delete_old_marketing_consents() TO service_role;
GRANT EXECUTE ON FUNCTION process_pending_account_deletions() TO service_role;
GRANT EXECUTE ON FUNCTION run_all_data_cleanup() TO service_role;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Automatic data deletion system setup complete!';
  RAISE NOTICE '📅 Scheduled jobs:';
  RAISE NOTICE '   - AI chat deletion: Daily at 2 AM UTC';
  RAISE NOTICE '   - IP anonymization: Daily at 2 AM UTC';
  RAISE NOTICE '   - Order anonymization: Weekly (Sunday 3 AM)';
  RAISE NOTICE '   - Support ticket deletion: Weekly (Monday 3 AM)';
  RAISE NOTICE '   - Marketing consent deletion: Daily at 4 AM UTC';
  RAISE NOTICE '   - Account deletions: Every 6 hours';
  RAISE NOTICE '🔍 Run: SELECT * FROM cron.job; to verify';
  RAISE NOTICE '📊 Run: SELECT * FROM run_all_data_cleanup(); to test';
END $$;
