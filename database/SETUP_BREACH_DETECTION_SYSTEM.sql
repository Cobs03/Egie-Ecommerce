-- =====================================================
-- AUTOMATED BREACH DETECTION SYSTEM
-- =====================================================
-- This script sets up automated detection for:
-- - Failed login attempts
-- - Brute force attacks
-- - Anomaly detection
-- - Unauthorized access attempts
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: CREATE DETECTION TABLES
-- =====================================================

-- Track failed login attempts
CREATE TABLE IF NOT EXISTS failed_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  attempt_time TIMESTAMPTZ DEFAULT NOW(),
  failure_reason TEXT, -- 'invalid_password', 'invalid_email', 'account_locked', 'too_many_attempts'
  country_code TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_failed_login_ip ON failed_login_attempts(ip_address, attempt_time);
CREATE INDEX IF NOT EXISTS idx_failed_login_email ON failed_login_attempts(email, attempt_time);
CREATE INDEX IF NOT EXISTS idx_failed_login_time ON failed_login_attempts(attempt_time);

-- Track successful logins for anomaly detection
CREATE TABLE IF NOT EXISTS login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  country_code TEXT,
  city TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  is_new_device BOOLEAN DEFAULT FALSE,
  is_new_location BOOLEAN DEFAULT FALSE,
  login_time TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for anomaly detection
CREATE INDEX IF NOT EXISTS idx_login_history_user ON login_history(user_id, login_time);
CREATE INDEX IF NOT EXISTS idx_login_history_ip ON login_history(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_history_time ON login_history(login_time);

-- Track IP blacklist
CREATE TABLE IF NOT EXISTS ip_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  blocked_until TIMESTAMPTZ, -- NULL for permanent
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  blocked_by UUID REFERENCES auth.users(id),
  incident_id UUID REFERENCES data_breach_incidents(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ip_blacklist_address ON ip_blacklist(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_blacklist_expiry ON ip_blacklist(blocked_until);

-- Track suspicious activity patterns
CREATE TABLE IF NOT EXISTS suspicious_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type TEXT NOT NULL, -- 'bulk_download', 'rapid_requests', 'unusual_location', 'data_scraping'
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'detected' CHECK (status IN ('detected', 'investigating', 'false_positive', 'confirmed_threat')),
  auto_blocked BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  
  -- Metadata
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suspicious_activities_user ON suspicious_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_type ON suspicious_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_status ON suspicious_activities(status);

-- =====================================================
-- STEP 2: DETECTION FUNCTIONS
-- =====================================================

-- Function to log failed login attempt
CREATE OR REPLACE FUNCTION log_failed_login(
  p_email TEXT,
  p_ip_address TEXT,
  p_user_agent TEXT DEFAULT NULL,
  p_failure_reason TEXT DEFAULT 'invalid_credentials'
)
RETURNS UUID AS $$
DECLARE
  v_attempt_id UUID;
  v_recent_attempts INTEGER;
  v_user_id UUID;
BEGIN
  -- Get user_id if email exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email LIMIT 1;
  
  -- Log the failed attempt
  INSERT INTO failed_login_attempts (
    email,
    ip_address,
    user_agent,
    failure_reason,
    user_id
  ) VALUES (
    p_email,
    p_ip_address,
    p_user_agent,
    p_failure_reason,
    v_user_id
  ) RETURNING id INTO v_attempt_id;
  
  -- Count recent attempts from this IP (last 15 minutes)
  SELECT COUNT(*) INTO v_recent_attempts
  FROM failed_login_attempts
  WHERE ip_address = p_ip_address
  AND attempt_time > NOW() - INTERVAL '15 minutes';
  
  -- Check for brute force attack (5+ attempts in 15 minutes)
  IF v_recent_attempts >= 5 THEN
    PERFORM detect_brute_force_attack(p_ip_address, v_recent_attempts);
  END IF;
  
  RETURN v_attempt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect brute force attacks
CREATE OR REPLACE FUNCTION detect_brute_force_attack(
  p_ip_address TEXT,
  p_attempt_count INTEGER
)
RETURNS UUID AS $$
DECLARE
  v_incident_id UUID;
  v_incident_number TEXT;
BEGIN
  -- Generate incident number
  v_incident_number := 'INC-' || to_char(NOW(), 'YYYYMMDD-HH24MISS');
  
  -- Create security incident
  INSERT INTO data_breach_incidents (
    incident_number,
    title,
    description,
    severity,
    breach_date,
    discovered_date,
    data_types_affected,
    affected_user_count,
    mitigation_steps,
    status
  ) VALUES (
    v_incident_number,
    'Brute Force Attack Detected',
    'Multiple failed login attempts (' || p_attempt_count || ') detected from IP: ' || p_ip_address || ' within 15 minutes. Possible credential stuffing or brute force attack.',
    'medium',
    NOW(),
    NOW(),
    '["login_credentials"]'::jsonb,
    0,
    '1. IP address temporarily blocked for 1 hour
2. Monitoring for additional attempts
3. CAPTCHA challenge enabled for this IP',
    'investigating'
  ) RETURNING id INTO v_incident_id;
  
  -- Add IP to blacklist (1 hour block)
  INSERT INTO ip_blacklist (
    ip_address,
    reason,
    blocked_until,
    incident_id
  ) VALUES (
    p_ip_address,
    'Brute force attack - ' || p_attempt_count || ' failed attempts in 15 minutes',
    NOW() + INTERVAL '1 hour',
    v_incident_id
  )
  ON CONFLICT (ip_address) 
  DO UPDATE SET 
    blocked_until = NOW() + INTERVAL '1 hour',
    reason = 'Repeated brute force attempts',
    incident_id = v_incident_id;
  
  RETURN v_incident_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log successful login
CREATE OR REPLACE FUNCTION log_successful_login(
  p_user_id UUID,
  p_email TEXT,
  p_ip_address TEXT,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_login_id UUID;
  v_is_new_device BOOLEAN := FALSE;
  v_is_new_location BOOLEAN := FALSE;
  v_previous_ips TEXT[];
BEGIN
  -- Get previous IP addresses for this user
  SELECT ARRAY_AGG(DISTINCT ip_address) INTO v_previous_ips
  FROM login_history
  WHERE user_id = p_user_id
  AND login_time > NOW() - INTERVAL '90 days';
  
  -- Check if this is a new location
  IF v_previous_ips IS NULL OR NOT (p_ip_address = ANY(v_previous_ips)) THEN
    v_is_new_location := TRUE;
  END IF;
  
  -- Log successful login
  INSERT INTO login_history (
    user_id,
    email,
    ip_address,
    user_agent,
    is_new_device,
    is_new_location
  ) VALUES (
    p_user_id,
    p_email,
    p_ip_address,
    p_user_agent,
    v_is_new_device,
    v_is_new_location
  ) RETURNING id INTO v_login_id;
  
  -- Create alert if login from new location
  IF v_is_new_location THEN
    PERFORM alert_new_location_login(p_user_id, p_ip_address);
  END IF;
  
  RETURN v_login_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to alert on new location login
CREATE OR REPLACE FUNCTION alert_new_location_login(
  p_user_id UUID,
  p_ip_address TEXT
)
RETURNS VOID AS $$
DECLARE
  v_user_email TEXT;
BEGIN
  -- Get user email
  SELECT email INTO v_user_email FROM auth.users WHERE id = p_user_id;
  
  -- Log suspicious activity
  INSERT INTO suspicious_activities (
    activity_type,
    user_id,
    ip_address,
    description,
    severity,
    status
  ) VALUES (
    'unusual_location',
    p_user_id,
    p_ip_address,
    'Login detected from new location/IP address: ' || p_ip_address,
    'low',
    'detected'
  );
  
  -- Note: In production, trigger email notification here
  -- Example: PERFORM send_security_alert_email(v_user_email, 'new_location', p_ip_address);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect bulk data downloads
CREATE OR REPLACE FUNCTION detect_bulk_downloads()
RETURNS TABLE(user_id UUID, download_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  WITH user_downloads AS (
    SELECT 
      pr.user_id,
      COUNT(*) as download_count
    FROM privacy_requests pr
    WHERE pr.request_type = 'data_download'
    AND pr.created_at > NOW() - INTERVAL '1 hour'
    GROUP BY pr.user_id
    HAVING COUNT(*) > 10
  )
  INSERT INTO suspicious_activities (
    activity_type,
    user_id,
    description,
    severity,
    status
  )
  SELECT 
    'bulk_download',
    ud.user_id,
    'User downloaded data ' || ud.download_count || ' times in 1 hour (possible data scraping)',
    'high',
    'detected'
  FROM user_downloads ud
  RETURNING suspicious_activities.user_id, 10::BIGINT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if IP is blacklisted
CREATE OR REPLACE FUNCTION is_ip_blacklisted(p_ip_address TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_blocked BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM ip_blacklist
    WHERE ip_address = p_ip_address
    AND (blocked_until IS NULL OR blocked_until > NOW())
  ) INTO v_blocked;
  
  RETURN v_blocked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old failed login attempts (retention: 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_failed_logins()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM failed_login_attempts
  WHERE attempt_time < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired IP blocks
CREATE OR REPLACE FUNCTION cleanup_expired_ip_blocks()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM ip_blacklist
  WHERE blocked_until IS NOT NULL
  AND blocked_until < NOW();
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 3: AUTOMATED DETECTION TRIGGERS
-- =====================================================

-- Trigger to detect anomalies on privacy requests
CREATE OR REPLACE FUNCTION trigger_detect_anomalies()
RETURNS TRIGGER AS $$
BEGIN
  -- Check for bulk downloads
  PERFORM detect_bulk_downloads();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on privacy_requests table
DROP TRIGGER IF EXISTS detect_anomalies_trigger ON privacy_requests;
CREATE TRIGGER detect_anomalies_trigger
  AFTER INSERT ON privacy_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_detect_anomalies();

-- =====================================================
-- STEP 4: SCHEDULE CRON JOBS FOR MONITORING
-- =====================================================

-- Unschedule existing monitoring jobs (if any)
SELECT cron.unschedule('cleanup-old-failed-logins') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-old-failed-logins');
SELECT cron.unschedule('cleanup-expired-ip-blocks') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup-expired-ip-blocks');
SELECT cron.unschedule('detect-suspicious-patterns') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'detect-suspicious-patterns');

-- Clean up old failed login attempts daily at 3 AM
SELECT cron.schedule(
  'cleanup-old-failed-logins',
  '0 3 * * *',
  $$SELECT cleanup_old_failed_logins();$$
);

-- Clean up expired IP blocks every hour
SELECT cron.schedule(
  'cleanup-expired-ip-blocks',
  '0 * * * *',
  $$SELECT cleanup_expired_ip_blocks();$$
);

-- Detect suspicious patterns every 15 minutes
SELECT cron.schedule(
  'detect-suspicious-patterns',
  '*/15 * * * *',
  $$SELECT detect_bulk_downloads();$$
);

-- =====================================================
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_blacklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspicious_activities ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "Admins can view failed logins"
  ON failed_login_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

CREATE POLICY "Admins can view login history"
  ON login_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

CREATE POLICY "Admins can manage IP blacklist"
  ON ip_blacklist FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

CREATE POLICY "Admins can view suspicious activities"
  ON suspicious_activities FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

-- Users can view their own login history
CREATE POLICY "Users can view own login history"
  ON login_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- =====================================================
-- STEP 6: MONITORING VIEWS
-- =====================================================

-- View: Failed login summary
CREATE OR REPLACE VIEW failed_login_summary AS
SELECT 
  DATE(attempt_time) as date,
  COUNT(*) as total_attempts,
  COUNT(DISTINCT ip_address) as unique_ips,
  COUNT(DISTINCT email) as unique_emails,
  COUNT(CASE WHEN failure_reason = 'invalid_password' THEN 1 END) as wrong_password,
  COUNT(CASE WHEN failure_reason = 'invalid_email' THEN 1 END) as wrong_email,
  COUNT(CASE WHEN failure_reason = 'account_locked' THEN 1 END) as locked_accounts
FROM failed_login_attempts
WHERE attempt_time > NOW() - INTERVAL '30 days'
GROUP BY DATE(attempt_time)
ORDER BY date DESC;

-- View: Brute force attack candidates
CREATE OR REPLACE VIEW brute_force_candidates AS
SELECT 
  ip_address,
  COUNT(*) as attempt_count,
  COUNT(DISTINCT email) as unique_emails_targeted,
  MIN(attempt_time) as first_attempt,
  MAX(attempt_time) as last_attempt,
  MAX(attempt_time) - MIN(attempt_time) as attack_duration
FROM failed_login_attempts
WHERE attempt_time > NOW() - INTERVAL '1 hour'
GROUP BY ip_address
HAVING COUNT(*) >= 5
ORDER BY attempt_count DESC;

-- View: Suspicious login patterns
CREATE OR REPLACE VIEW suspicious_login_patterns AS
SELECT 
  lh.user_id,
  au.email,
  COUNT(*) as login_count,
  COUNT(DISTINCT lh.ip_address) as unique_ips,
  COUNT(CASE WHEN lh.is_new_location THEN 1 END) as new_location_count,
  MAX(lh.login_time) as last_login
FROM login_history lh
JOIN auth.users au ON lh.user_id = au.id
WHERE lh.login_time > NOW() - INTERVAL '24 hours'
GROUP BY lh.user_id, au.email
HAVING COUNT(DISTINCT lh.ip_address) > 3
ORDER BY unique_ips DESC;

-- =====================================================
-- STEP 7: GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION log_failed_login(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION log_successful_login(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION is_ip_blacklisted(TEXT) TO anon, authenticated;
GRANT SELECT ON failed_login_summary TO authenticated;
GRANT SELECT ON brute_force_candidates TO authenticated;
GRANT SELECT ON suspicious_login_patterns TO authenticated;

-- =====================================================
-- STEP 8: TESTING QUERIES
-- =====================================================

-- Test failed login logging
SELECT log_failed_login(
  'test@example.com',
  '192.168.1.100',
  'Mozilla/5.0',
  'invalid_password'
);

-- Check if IP is blacklisted
SELECT is_ip_blacklisted('192.168.1.100');

-- View recent failed logins
SELECT * FROM failed_login_attempts
ORDER BY attempt_time DESC
LIMIT 20;

-- View brute force candidates
SELECT * FROM brute_force_candidates;

-- View suspicious activities
SELECT * FROM suspicious_activities
ORDER BY detected_at DESC;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Breach detection system setup complete!';
  RAISE NOTICE '🔍 Features enabled:';
  RAISE NOTICE '   - Failed login attempt logging';
  RAISE NOTICE '   - Brute force attack detection (5+ attempts/15min)';
  RAISE NOTICE '   - IP blacklisting (auto 1-hour block)';
  RAISE NOTICE '   - New location alerts';
  RAISE NOTICE '   - Bulk download detection';
  RAISE NOTICE '   - Suspicious activity tracking';
  RAISE NOTICE '📊 Monitoring views created:';
  RAISE NOTICE '   - failed_login_summary';
  RAISE NOTICE '   - brute_force_candidates';
  RAISE NOTICE '   - suspicious_login_patterns';
  RAISE NOTICE '⏰ Scheduled jobs:';
  RAISE NOTICE '   - Cleanup old logins: Daily at 3 AM';
  RAISE NOTICE '   - Cleanup expired blocks: Every hour';
  RAISE NOTICE '   - Detect patterns: Every 15 minutes';
END $$;
