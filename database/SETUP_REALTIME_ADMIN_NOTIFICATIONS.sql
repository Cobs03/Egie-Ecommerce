-- =====================================================
-- REAL-TIME ADMIN NOTIFICATION SYSTEM
-- =====================================================
-- This script sets up real-time notifications for
-- administrators about suspicious activity and breaches
-- =====================================================

-- =====================================================
-- STEP 1: ADMIN NOTIFICATION TABLES
-- =====================================================

-- Table to store admin notifications
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Notification details
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'security_breach',
    'suspicious_activity',
    'failed_login_threshold',
    'brute_force_attack',
    'critical_vulnerability',
    'data_breach',
    'unauthorized_access',
    'system_error',
    'compliance_violation',
    'data_deletion_request',
    'high_value_transaction',
    'unusual_activity_pattern'
  )),
  
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Related entities
  related_entity_type TEXT, -- 'user', 'ip', 'incident', 'finding', etc.
  related_entity_id UUID,
  
  -- Delivery status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  read_by UUID REFERENCES auth.users(id),
  
  -- Notification channels
  sent_via_email BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  sent_via_sms BOOLEAN DEFAULT FALSE,
  sms_sent_at TIMESTAMPTZ,
  sent_via_in_app BOOLEAN DEFAULT TRUE,
  
  -- Action tracking
  requires_action BOOLEAN DEFAULT FALSE,
  action_taken BOOLEAN DEFAULT FALSE,
  action_taken_at TIMESTAMPTZ,
  action_taken_by UUID REFERENCES auth.users(id),
  action_notes TEXT,
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days'
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_severity ON admin_notifications(severity);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_read ON admin_notifications(is_read, created_at);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created ON admin_notifications(created_at DESC);

-- Table to track notification preferences
CREATE TABLE IF NOT EXISTS admin_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Channel preferences
  email_enabled BOOLEAN DEFAULT TRUE,
  email_address TEXT,
  sms_enabled BOOLEAN DEFAULT FALSE,
  sms_number TEXT,
  in_app_enabled BOOLEAN DEFAULT TRUE,
  
  -- Notification type preferences
  notify_security_breach BOOLEAN DEFAULT TRUE,
  notify_suspicious_activity BOOLEAN DEFAULT TRUE,
  notify_failed_logins BOOLEAN DEFAULT TRUE,
  notify_vulnerabilities BOOLEAN DEFAULT TRUE,
  notify_compliance BOOLEAN DEFAULT TRUE,
  
  -- Severity thresholds
  min_severity_email TEXT DEFAULT 'medium',
  min_severity_sms TEXT DEFAULT 'critical',
  min_severity_in_app TEXT DEFAULT 'low',
  
  -- Quiet hours (optional)
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  quiet_hours_timezone TEXT DEFAULT 'Asia/Manila',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(admin_user_id)
);

-- Table to track notification delivery
CREATE TABLE IF NOT EXISTS notification_delivery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID REFERENCES admin_notifications(id) ON DELETE CASCADE,
  
  -- Delivery details
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'in_app', 'push')),
  recipient_id UUID REFERENCES auth.users(id),
  recipient_email TEXT,
  recipient_phone TEXT,
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Provider details
  provider TEXT, -- 'resend', 'twilio', etc.
  provider_message_id TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_delivery_notification ON notification_delivery_log(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_status ON notification_delivery_log(status);

-- =====================================================
-- STEP 2: NOTIFICATION TRIGGER FUNCTIONS
-- =====================================================

-- Function to create admin notification
CREATE OR REPLACE FUNCTION create_admin_notification(
  p_notification_type TEXT,
  p_severity TEXT,
  p_title TEXT,
  p_message TEXT,
  p_related_entity_type TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL,
  p_requires_action BOOLEAN DEFAULT FALSE,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  -- Insert notification
  INSERT INTO admin_notifications (
    notification_type,
    severity,
    title,
    message,
    related_entity_type,
    related_entity_id,
    requires_action,
    metadata
  ) VALUES (
    p_notification_type,
    p_severity,
    p_title,
    p_message,
    p_related_entity_type,
    p_related_entity_id,
    p_requires_action,
    p_metadata
  ) RETURNING id INTO v_notification_id;
  
  -- Queue notifications for delivery
  PERFORM queue_notification_delivery(v_notification_id);
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to queue notification delivery to admins
CREATE OR REPLACE FUNCTION queue_notification_delivery(p_notification_id UUID)
RETURNS VOID AS $$
DECLARE
  v_notification RECORD;
  v_admin RECORD;
  v_should_send BOOLEAN;
BEGIN
  -- Get notification details
  SELECT * INTO v_notification
  FROM admin_notifications
  WHERE id = p_notification_id;
  
  -- Get all admin users with notification preferences
  FOR v_admin IN 
    SELECT 
      u.id,
      u.email,
      COALESCE(np.email_enabled, TRUE) as email_enabled,
      COALESCE(np.email_address, u.email) as email_address,
      COALESCE(np.sms_enabled, FALSE) as sms_enabled,
      np.sms_number,
      COALESCE(np.min_severity_email, 'medium') as min_severity_email,
      COALESCE(np.min_severity_sms, 'critical') as min_severity_sms
    FROM auth.users u
    JOIN profiles p ON u.id = p.id
    LEFT JOIN admin_notification_preferences np ON u.id = np.admin_user_id
    WHERE p.is_admin = TRUE OR p.role = 'admin'
  LOOP
    -- Queue email delivery
    IF v_admin.email_enabled THEN
      v_should_send := CASE v_notification.severity
        WHEN 'critical' THEN TRUE
        WHEN 'high' THEN v_admin.min_severity_email IN ('low', 'medium', 'high')
        WHEN 'medium' THEN v_admin.min_severity_email IN ('low', 'medium')
        WHEN 'low' THEN v_admin.min_severity_email = 'low'
        ELSE FALSE
      END;
      
      IF v_should_send THEN
        INSERT INTO notification_delivery_log (
          notification_id,
          channel,
          recipient_id,
          recipient_email,
          status
        ) VALUES (
          p_notification_id,
          'email',
          v_admin.id,
          v_admin.email_address,
          'pending'
        );
      END IF;
    END IF;
    
    -- Queue SMS delivery
    IF v_admin.sms_enabled AND v_admin.sms_number IS NOT NULL THEN
      v_should_send := CASE v_notification.severity
        WHEN 'critical' THEN TRUE
        WHEN 'high' THEN v_admin.min_severity_sms IN ('high', 'medium', 'low')
        ELSE FALSE
      END;
      
      IF v_should_send THEN
        INSERT INTO notification_delivery_log (
          notification_id,
          channel,
          recipient_id,
          recipient_phone,
          status
        ) VALUES (
          p_notification_id,
          'sms',
          v_admin.id,
          v_admin.sms_number,
          'pending'
        );
      END IF;
    END IF;
    
    -- In-app notifications are always created (can be filtered client-side)
    INSERT INTO notification_delivery_log (
      notification_id,
      channel,
      recipient_id,
      status
    ) VALUES (
      p_notification_id,
      'in_app',
      v_admin.id,
      'delivered'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 3: AUTOMATIC NOTIFICATION TRIGGERS
-- =====================================================

-- Trigger for brute force attacks
CREATE OR REPLACE FUNCTION notify_brute_force_attack()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification when brute force incident is created
  IF NEW.title LIKE '%Brute Force%' THEN
    PERFORM create_admin_notification(
      'brute_force_attack',
      'critical',
      'Brute Force Attack Detected',
      'IP address ' || NEW.metadata->>'ip_address' || ' has attempted multiple failed logins. Automatic blocking has been applied.',
      'incident',
      NEW.id,
      TRUE,
      jsonb_build_object(
        'ip_address', NEW.metadata->>'ip_address',
        'attempt_count', NEW.metadata->>'attempt_count',
        'incident_id', NEW.id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_brute_force ON data_breach_incidents;
CREATE TRIGGER trigger_notify_brute_force
  AFTER INSERT ON data_breach_incidents
  FOR EACH ROW
  EXECUTE FUNCTION notify_brute_force_attack();

-- Trigger for critical security findings
CREATE OR REPLACE FUNCTION notify_critical_finding()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.severity IN ('critical', 'high') THEN
    PERFORM create_admin_notification(
      'critical_vulnerability',
      NEW.severity,
      'Critical Security Finding: ' || NEW.title,
      NEW.description || ' - Remediation required by: ' || COALESCE(NEW.remediation_deadline::TEXT, 'ASAP'),
      'finding',
      NEW.id,
      TRUE,
      jsonb_build_object(
        'finding_id', NEW.id,
        'affected_component', NEW.affected_component,
        'cvss_score', NEW.cvss_score,
        'remediation_deadline', NEW.remediation_deadline
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_critical_finding ON security_findings;
CREATE TRIGGER trigger_notify_critical_finding
  AFTER INSERT ON security_findings
  FOR EACH ROW
  EXECUTE FUNCTION notify_critical_finding();

-- Trigger for suspicious activities
CREATE OR REPLACE FUNCTION notify_suspicious_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.severity IN ('critical', 'high') THEN
    PERFORM create_admin_notification(
      'suspicious_activity',
      NEW.severity,
      'Suspicious Activity Detected: ' || NEW.activity_type,
      NEW.description,
      'suspicious_activity',
      NEW.id,
      TRUE,
      jsonb_build_object(
        'activity_id', NEW.id,
        'activity_type', NEW.activity_type,
        'user_id', NEW.user_id,
        'ip_address', NEW.ip_address
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_suspicious_activity ON suspicious_activities;
CREATE TRIGGER trigger_notify_suspicious_activity
  AFTER INSERT ON suspicious_activities
  FOR EACH ROW
  EXECUTE FUNCTION notify_suspicious_activity();

-- Trigger for account deletion requests
CREATE OR REPLACE FUNCTION notify_deletion_request()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' THEN
    PERFORM create_admin_notification(
      'data_deletion_request',
      'medium',
      'New Account Deletion Request',
      'User ' || NEW.email || ' has requested account deletion. Please review within 48 hours.',
      'deletion_request',
      NEW.id,
      TRUE,
      jsonb_build_object(
        'user_id', NEW.user_id,
        'email', NEW.email,
        'requested_at', NEW.requested_at
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_deletion_request ON account_deletion_requests;
CREATE TRIGGER trigger_notify_deletion_request
  AFTER INSERT ON account_deletion_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_deletion_request();

-- Trigger for failed login threshold
CREATE OR REPLACE FUNCTION check_failed_login_threshold()
RETURNS TRIGGER AS $$
DECLARE
  v_recent_attempts INTEGER;
BEGIN
  -- Count recent failed attempts from this email (last hour)
  SELECT COUNT(*) INTO v_recent_attempts
  FROM failed_login_attempts
  WHERE email = NEW.email
  AND attempt_time > NOW() - INTERVAL '1 hour';
  
  -- Notify if threshold exceeded (3 attempts)
  IF v_recent_attempts = 3 THEN
    PERFORM create_admin_notification(
      'failed_login_threshold',
      'medium',
      'Multiple Failed Login Attempts',
      'User ' || NEW.email || ' has had ' || v_recent_attempts || ' failed login attempts in the past hour.',
      'failed_login',
      NEW.id,
      FALSE,
      jsonb_build_object(
        'email', NEW.email,
        'ip_address', NEW.ip_address,
        'attempt_count', v_recent_attempts
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_failed_login_threshold ON failed_login_attempts;
CREATE TRIGGER trigger_check_failed_login_threshold
  AFTER INSERT ON failed_login_attempts
  FOR EACH ROW
  EXECUTE FUNCTION check_failed_login_threshold();

-- =====================================================
-- STEP 4: NOTIFICATION VIEWS
-- =====================================================

-- View for unread notifications
CREATE OR REPLACE VIEW unread_admin_notifications AS
SELECT 
  n.*,
  COUNT(DISTINCT dl.id) FILTER (WHERE dl.channel = 'in_app') as total_recipients,
  COUNT(DISTINCT dl.id) FILTER (WHERE dl.channel = 'email' AND dl.status = 'sent') as emails_sent
FROM admin_notifications n
LEFT JOIN notification_delivery_log dl ON n.id = dl.notification_id
WHERE n.is_read = FALSE
AND n.expires_at > NOW()
GROUP BY n.id
ORDER BY n.created_at DESC;

-- View for notification statistics
CREATE OR REPLACE VIEW notification_statistics AS
SELECT 
  DATE(created_at) as date,
  notification_type,
  severity,
  COUNT(*) as total_notifications,
  COUNT(*) FILTER (WHERE is_read = TRUE) as read_count,
  COUNT(*) FILTER (WHERE requires_action = TRUE) as action_required_count,
  COUNT(*) FILTER (WHERE action_taken = TRUE) as action_taken_count
FROM admin_notifications
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), notification_type, severity
ORDER BY date DESC;

-- =====================================================
-- STEP 5: HELPER FUNCTIONS
-- =====================================================

-- Mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(
  p_notification_id UUID,
  p_admin_user_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE admin_notifications
  SET 
    is_read = TRUE,
    read_at = NOW(),
    read_by = p_admin_user_id
  WHERE id = p_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark notification action taken
CREATE OR REPLACE FUNCTION mark_notification_action_taken(
  p_notification_id UUID,
  p_admin_user_id UUID,
  p_action_notes TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE admin_notifications
  SET 
    action_taken = TRUE,
    action_taken_at = NOW(),
    action_taken_by = p_admin_user_id,
    action_notes = p_action_notes,
    is_read = TRUE,
    read_at = COALESCE(read_at, NOW()),
    read_by = COALESCE(read_by, p_admin_user_id)
  WHERE id = p_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get unread notification count for admin
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_admin_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM admin_notifications n
  WHERE n.is_read = FALSE
  AND n.expires_at > NOW()
  AND EXISTS (
    SELECT 1 FROM notification_delivery_log dl
    WHERE dl.notification_id = n.id
    AND dl.recipient_id = p_admin_user_id
    AND dl.channel = 'in_app'
  );
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM admin_notifications
  WHERE expires_at < NOW()
  AND is_read = TRUE;
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 6: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_delivery_log ENABLE ROW LEVEL SECURITY;

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
  ON admin_notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

-- Admins can update their own notifications
CREATE POLICY "Admins can update notifications"
  ON admin_notifications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

-- Users can manage their own notification preferences
CREATE POLICY "Users can manage own notification preferences"
  ON admin_notification_preferences FOR ALL
  TO authenticated
  USING (admin_user_id = auth.uid())
  WITH CHECK (admin_user_id = auth.uid());

-- =====================================================
-- STEP 7: GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION create_admin_notification(TEXT, TEXT, TEXT, TEXT, TEXT, UUID, BOOLEAN, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_action_taken(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notification_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_notifications() TO service_role;

GRANT SELECT ON unread_admin_notifications TO authenticated;
GRANT SELECT ON notification_statistics TO authenticated;

-- =====================================================
-- VERIFICATION & TESTING
-- =====================================================

-- Create test notification
SELECT create_admin_notification(
  'security_breach',
  'critical',
  'Test Security Alert',
  'This is a test notification to verify the system is working correctly.',
  'test',
  NULL,
  TRUE,
  '{"test": true}'::jsonb
);

-- View unread notifications
SELECT * FROM unread_admin_notifications;

-- Get notification count
SELECT get_unread_notification_count(auth.uid());

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Real-time Admin Notification System setup complete!';
  RAISE NOTICE '🔔 Features enabled:';
  RAISE NOTICE '   - Auto-notify on brute force attacks';
  RAISE NOTICE '   - Auto-notify on critical vulnerabilities';
  RAISE NOTICE '   - Auto-notify on suspicious activities';
  RAISE NOTICE '   - Auto-notify on account deletion requests';
  RAISE NOTICE '   - Auto-notify on failed login thresholds';
  RAISE NOTICE '📧 Notification channels: Email, SMS, In-app';
  RAISE NOTICE '⚙️ Admins can configure preferences per channel';
  RAISE NOTICE '🧪 Test: SELECT * FROM unread_admin_notifications;';
END $$;
