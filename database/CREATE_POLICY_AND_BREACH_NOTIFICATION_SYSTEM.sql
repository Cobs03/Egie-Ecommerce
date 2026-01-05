-- Policy Version Tracking and Notification System
-- Tracks privacy policy and terms of service versions
-- Enables notification of users when policies change

-- Table to track policy versions
CREATE TABLE IF NOT EXISTS policy_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_type VARCHAR(50) NOT NULL, -- 'privacy_policy', 'terms_of_service', 'cookie_policy'
  version VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT, -- Brief summary of changes
  changes JSONB, -- Detailed list of changes
  effective_date DATE NOT NULL,
  published_date TIMESTAMPTZ DEFAULT NOW(),
  published_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT false,
  notification_sent BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(policy_type, version)
);

-- Table to track user policy acceptances
CREATE TABLE IF NOT EXISTS user_policy_acceptances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_version_id UUID NOT NULL REFERENCES policy_versions(id) ON DELETE CASCADE,
  policy_type VARCHAR(50) NOT NULL,
  version VARCHAR(20) NOT NULL,
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  UNIQUE(user_id, policy_version_id)
);

-- Table to track data breach incidents
CREATE TABLE IF NOT EXISTS data_breach_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
  
  -- Breach details
  breach_date TIMESTAMPTZ NOT NULL,
  discovered_date TIMESTAMPTZ NOT NULL,
  contained_date TIMESTAMPTZ,
  
  -- Affected data
  data_types_affected JSONB, -- ['email', 'name', 'address', 'payment_info', etc.]
  affected_user_count INTEGER,
  affected_users JSONB, -- Array of user IDs or 'all'
  
  -- Response
  mitigation_steps TEXT,
  user_actions_required TEXT,
  support_contact TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'investigating', -- 'investigating', 'contained', 'resolved', 'closed'
  reported_to_authorities BOOLEAN DEFAULT false,
  authority_reference VARCHAR(100),
  
  -- Notifications
  users_notified BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMPTZ,
  notification_method VARCHAR(50), -- 'email', 'in_app', 'both'
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to track security incident notifications
CREATE TABLE IF NOT EXISTS security_incident_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id UUID REFERENCES data_breach_incidents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL, -- 'data_breach', 'security_incident', 'policy_change', 'tos_change'
  
  -- Notification details
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20),
  
  -- Delivery
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivery_method VARCHAR(50), -- 'email', 'in_app', 'sms'
  email_sent BOOLEAN DEFAULT false,
  email_delivered BOOLEAN DEFAULT false,
  email_opened BOOLEAN DEFAULT false,
  in_app_read BOOLEAN DEFAULT false,
  in_app_read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to track policy change notifications
CREATE TABLE IF NOT EXISTS policy_change_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_version_id UUID NOT NULL REFERENCES policy_versions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification details
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  changes_summary TEXT,
  
  -- Delivery
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivery_method VARCHAR(50),
  email_sent BOOLEAN DEFAULT false,
  email_delivered BOOLEAN DEFAULT false,
  email_opened BOOLEAN DEFAULT false,
  in_app_read BOOLEAN DEFAULT false,
  in_app_read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(policy_version_id, user_id)
);

-- Create indexes
CREATE INDEX idx_policy_versions_type ON policy_versions(policy_type);
CREATE INDEX idx_policy_versions_active ON policy_versions(is_active);
CREATE INDEX idx_user_policy_acceptances_user ON user_policy_acceptances(user_id);
CREATE INDEX idx_user_policy_acceptances_policy ON user_policy_acceptances(policy_version_id);
CREATE INDEX idx_breach_incidents_status ON data_breach_incidents(status);
CREATE INDEX idx_breach_incidents_date ON data_breach_incidents(breach_date);
CREATE INDEX idx_security_notifications_user ON security_incident_notifications(user_id);
CREATE INDEX idx_security_notifications_type ON security_incident_notifications(notification_type);
CREATE INDEX idx_policy_notifications_user ON policy_change_notifications(user_id);
CREATE INDEX idx_policy_notifications_read ON policy_change_notifications(in_app_read);

-- Enable Row Level Security
ALTER TABLE policy_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_policy_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_breach_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_incident_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_change_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for policy_versions
CREATE POLICY "Anyone can view active policies"
  ON policy_versions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage policies"
  ON policy_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for user_policy_acceptances
CREATE POLICY "Users can view own acceptances"
  ON user_policy_acceptances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own acceptances"
  ON user_policy_acceptances FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for data_breach_incidents
CREATE POLICY "Users can view breaches affecting them"
  ON data_breach_incidents FOR SELECT
  USING (
    affected_users @> jsonb_build_array(auth.uid()::text)
    OR affected_users @> jsonb_build_array('all')
  );

CREATE POLICY "Admins can manage breach incidents"
  ON data_breach_incidents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for security_incident_notifications
CREATE POLICY "Users can view own security notifications"
  ON security_incident_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification read status"
  ON security_incident_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for policy_change_notifications
CREATE POLICY "Users can view own policy notifications"
  ON policy_change_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own policy notification read status"
  ON policy_change_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to get users who need policy change notification
CREATE OR REPLACE FUNCTION get_users_for_policy_notification(
  p_policy_type VARCHAR,
  p_policy_version_id UUID
)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  notification_enabled BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    au.email,
    p.first_name,
    p.last_name,
    CASE 
      WHEN p_policy_type = 'privacy_policy' THEN COALESCE(np.email_privacy_policy_updates, true)
      WHEN p_policy_type = 'terms_of_service' THEN COALESCE(np.email_tos_updates, true)
      ELSE true
    END as notification_enabled
  FROM profiles p
  INNER JOIN auth.users au ON au.id = p.id
  LEFT JOIN notification_preferences np ON np.user_id = p.id
  WHERE p.status = 'active'
    AND au.email IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM user_policy_acceptances upa
      WHERE upa.user_id = p.id 
      AND upa.policy_version_id = p_policy_version_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get users affected by breach
CREATE OR REPLACE FUNCTION get_users_for_breach_notification(
  p_incident_id UUID
)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  notification_enabled BOOLEAN
) AS $$
DECLARE
  v_affected_users JSONB;
BEGIN
  -- Get affected users from incident
  SELECT affected_users INTO v_affected_users
  FROM data_breach_incidents
  WHERE id = p_incident_id;
  
  -- If 'all' users affected
  IF v_affected_users @> jsonb_build_array('all') THEN
    RETURN QUERY
    SELECT 
      p.id as user_id,
      au.email,
      p.first_name,
      p.last_name,
      COALESCE(np.email_data_breach, true) as notification_enabled
    FROM profiles p
    INNER JOIN auth.users au ON au.id = p.id
    LEFT JOIN notification_preferences np ON np.user_id = p.id
    WHERE p.status = 'active' AND au.email IS NOT NULL;
  ELSE
    -- Specific users affected
    RETURN QUERY
    SELECT 
      p.id as user_id,
      au.email,
      p.first_name,
      p.last_name,
      COALESCE(np.email_data_breach, true) as notification_enabled
    FROM profiles p
    INNER JOIN auth.users au ON au.id = p.id
    LEFT JOIN notification_preferences np ON np.user_id = p.id
    WHERE p.id = ANY(
      SELECT (jsonb_array_elements_text(v_affected_users))::UUID
    )
    AND p.status = 'active' 
    AND au.email IS NOT NULL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark policy notification as read
CREATE OR REPLACE FUNCTION mark_policy_notification_read(
  p_notification_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE policy_change_notifications
  SET 
    in_app_read = true,
    in_app_read_at = NOW()
  WHERE id = p_notification_id
    AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark security notification as read
CREATE OR REPLACE FUNCTION mark_security_notification_read(
  p_notification_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE security_incident_notifications
  SET 
    in_app_read = true,
    in_app_read_at = NOW()
  WHERE id = p_notification_id
    AND user_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update data_breach_incidents updated_at
CREATE OR REPLACE FUNCTION update_breach_incident_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_breach_incident_timestamp
  BEFORE UPDATE ON data_breach_incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_breach_incident_timestamp();

-- Grant necessary permissions
GRANT SELECT ON policy_versions TO authenticated;
GRANT SELECT, INSERT ON user_policy_acceptances TO authenticated;
GRANT SELECT ON data_breach_incidents TO authenticated;
GRANT SELECT, UPDATE ON security_incident_notifications TO authenticated;
GRANT SELECT, UPDATE ON policy_change_notifications TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_for_policy_notification(VARCHAR, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_for_breach_notification(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_policy_notification_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_security_notification_read(UUID) TO authenticated;

-- Insert initial policy versions (examples)
INSERT INTO policy_versions (policy_type, version, title, content, summary, effective_date, is_active)
VALUES 
  (
    'privacy_policy',
    '1.0',
    'Privacy Policy',
    'Initial privacy policy content...',
    'Initial version of privacy policy',
    CURRENT_DATE,
    true
  ),
  (
    'terms_of_service',
    '1.0',
    'Terms of Service',
    'Initial terms of service content...',
    'Initial version of terms of service',
    CURRENT_DATE,
    true
  )
ON CONFLICT (policy_type, version) DO NOTHING;
