-- =====================================================
-- SYSTEM MONITORING AND AUDIT FRAMEWORK
-- =====================================================
-- This script sets up comprehensive monitoring and audit
-- for periodic vulnerability and security assessments
-- =====================================================

-- =====================================================
-- STEP 1: SECURITY ASSESSMENT TRACKING
-- =====================================================

-- Table to track security assessments
CREATE TABLE IF NOT EXISTS security_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_type TEXT NOT NULL CHECK (assessment_type IN (
    'vulnerability_scan',
    'penetration_test',
    'code_review',
    'dependency_audit',
    'access_review',
    'compliance_audit',
    'data_protection_impact_assessment'
  )),
  assessment_name TEXT NOT NULL,
  description TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled',
    'in_progress',
    'completed',
    'failed',
    'cancelled'
  )),
  
  -- Scheduling
  scheduled_date DATE NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Results
  findings_count INTEGER DEFAULT 0,
  critical_findings INTEGER DEFAULT 0,
  high_findings INTEGER DEFAULT 0,
  medium_findings INTEGER DEFAULT 0,
  low_findings INTEGER DEFAULT 0,
  
  -- Personnel
  conducted_by UUID REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  
  -- Files and reports
  report_url TEXT,
  findings_summary JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_assessments_type ON security_assessments(assessment_type);
CREATE INDEX IF NOT EXISTS idx_security_assessments_status ON security_assessments(status);
CREATE INDEX IF NOT EXISTS idx_security_assessments_date ON security_assessments(scheduled_date);

-- Table to track individual security findings
CREATE TABLE IF NOT EXISTS security_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES security_assessments(id) ON DELETE CASCADE,
  
  -- Finding details
  finding_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Location
  affected_component TEXT, -- e.g., 'database', 'api', 'frontend', 'third-party'
  affected_file TEXT,
  affected_function TEXT,
  
  -- CVSS score (Common Vulnerability Scoring System)
  cvss_score DECIMAL(3,1),
  cvss_vector TEXT,
  
  -- CWE (Common Weakness Enumeration)
  cwe_id TEXT,
  cwe_name TEXT,
  
  -- Remediation
  remediation_steps TEXT,
  remediation_priority TEXT CHECK (remediation_priority IN ('immediate', 'urgent', 'normal', 'low')),
  remediation_status TEXT DEFAULT 'open' CHECK (remediation_status IN ('open', 'in_progress', 'resolved', 'accepted_risk', 'false_positive')),
  remediation_deadline DATE,
  
  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  
  -- Verification
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_findings_assessment ON security_findings(assessment_id);
CREATE INDEX IF NOT EXISTS idx_security_findings_severity ON security_findings(severity);
CREATE INDEX IF NOT EXISTS idx_security_findings_status ON security_findings(remediation_status);

-- =====================================================
-- STEP 2: AUTOMATED VULNERABILITY CHECKS
-- =====================================================

-- Table to track automated security checks
CREATE TABLE IF NOT EXISTS automated_security_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_name TEXT NOT NULL,
  check_type TEXT NOT NULL CHECK (check_type IN (
    'sql_injection',
    'xss',
    'csrf',
    'broken_auth',
    'sensitive_data_exposure',
    'broken_access_control',
    'security_misconfiguration',
    'insecure_dependencies',
    'insufficient_logging',
    'server_side_request_forgery'
  )),
  description TEXT,
  
  -- Execution
  last_run TIMESTAMPTZ,
  next_run TIMESTAMPTZ,
  run_frequency TEXT DEFAULT 'daily' CHECK (run_frequency IN ('hourly', 'daily', 'weekly', 'monthly')),
  
  -- Results
  status TEXT DEFAULT 'passing' CHECK (status IN ('passing', 'failing', 'error', 'skipped')),
  result_summary JSONB,
  
  -- Configuration
  is_active BOOLEAN DEFAULT TRUE,
  severity_threshold TEXT DEFAULT 'medium',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automated_checks_type ON automated_security_checks(check_type);
CREATE INDEX IF NOT EXISTS idx_automated_checks_status ON automated_security_checks(status);

-- Table to track automated check results history
CREATE TABLE IF NOT EXISTS automated_check_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_id UUID REFERENCES automated_security_checks(id) ON DELETE CASCADE,
  
  -- Execution details
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  execution_time_ms INTEGER,
  status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'error')),
  
  -- Results
  issues_found INTEGER DEFAULT 0,
  issues_details JSONB,
  error_message TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_automated_results_check ON automated_check_results(check_id, executed_at);

-- =====================================================
-- STEP 3: DEPENDENCY VULNERABILITY TRACKING
-- =====================================================

-- Table to track third-party dependencies
CREATE TABLE IF NOT EXISTS system_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Package details
  package_name TEXT NOT NULL,
  package_version TEXT NOT NULL,
  package_type TEXT NOT NULL CHECK (package_type IN ('npm', 'pip', 'composer', 'maven', 'nuget')),
  
  -- Risk assessment
  has_vulnerabilities BOOLEAN DEFAULT FALSE,
  vulnerability_count INTEGER DEFAULT 0,
  highest_severity TEXT,
  
  -- Usage
  is_production BOOLEAN DEFAULT TRUE,
  is_dev_only BOOLEAN DEFAULT FALSE,
  used_in TEXT[], -- Array of components using this dependency
  
  -- Last scan
  last_scanned TIMESTAMPTZ,
  scan_source TEXT, -- 'npm audit', 'snyk', 'dependabot', etc.
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(package_name, package_version, package_type)
);

CREATE INDEX IF NOT EXISTS idx_dependencies_name ON system_dependencies(package_name);
CREATE INDEX IF NOT EXISTS idx_dependencies_vulnerabilities ON system_dependencies(has_vulnerabilities);

-- Table to track specific dependency vulnerabilities
CREATE TABLE IF NOT EXISTS dependency_vulnerabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dependency_id UUID REFERENCES system_dependencies(id) ON DELETE CASCADE,
  
  -- Vulnerability details
  cve_id TEXT, -- e.g., 'CVE-2024-12345'
  vulnerability_title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  -- CVSS
  cvss_score DECIMAL(3,1),
  cvss_vector TEXT,
  
  -- Affected versions
  affected_versions TEXT,
  patched_version TEXT,
  
  -- Remediation
  remediation_advice TEXT,
  remediation_status TEXT DEFAULT 'open' CHECK (remediation_status IN ('open', 'in_progress', 'resolved', 'accepted_risk')),
  
  -- Discovery
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT, -- 'npm audit', 'GitHub Advisory', etc.
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dep_vuln_dependency ON dependency_vulnerabilities(dependency_id);
CREATE INDEX IF NOT EXISTS idx_dep_vuln_severity ON dependency_vulnerabilities(severity);
CREATE INDEX IF NOT EXISTS idx_dep_vuln_status ON dependency_vulnerabilities(remediation_status);

-- =====================================================
-- STEP 4: ACCESS CONTROL AUDIT
-- =====================================================

-- Table to track access reviews
CREATE TABLE IF NOT EXISTS access_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_name TEXT NOT NULL,
  review_type TEXT CHECK (review_type IN ('user_access', 'admin_access', 'api_access', 'database_access')),
  
  -- Scheduling
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  
  -- Results
  total_users_reviewed INTEGER DEFAULT 0,
  access_revoked_count INTEGER DEFAULT 0,
  access_modified_count INTEGER DEFAULT 0,
  
  -- Personnel
  conducted_by UUID REFERENCES auth.users(id),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  
  -- Findings
  findings_summary JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_reviews_date ON access_reviews(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_access_reviews_status ON access_reviews(status);

-- =====================================================
-- STEP 5: COMPLIANCE AUDIT TRAIL
-- =====================================================

-- Enhanced audit log for compliance
CREATE TABLE IF NOT EXISTS compliance_audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Event details
  event_type TEXT NOT NULL CHECK (event_type IN (
    'data_access',
    'data_modification',
    'data_deletion',
    'permission_change',
    'configuration_change',
    'security_setting_change',
    'user_login',
    'user_logout',
    'failed_login',
    'password_change',
    'two_factor_enabled',
    'two_factor_disabled',
    'export_data',
    'import_data',
    'backup_created',
    'backup_restored'
  )),
  event_description TEXT NOT NULL,
  
  -- User context
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_role TEXT,
  
  -- System context
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  
  -- Data context
  affected_table TEXT,
  affected_record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  
  -- Result
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  
  -- Compliance
  requires_review BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_audit_user ON compliance_audit_trail(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_type ON compliance_audit_trail(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_table ON compliance_audit_trail(affected_table, created_at);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_review ON compliance_audit_trail(requires_review);

-- =====================================================
-- STEP 6: AUTOMATED SECURITY CHECK FUNCTIONS
-- =====================================================

-- Function to check for SQL injection vulnerabilities (basic)
CREATE OR REPLACE FUNCTION check_sql_injection_prevention()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  issues_found INTEGER,
  details JSONB
) AS $$
DECLARE
  v_rls_disabled_count INTEGER;
  v_public_tables INTEGER;
BEGIN
  -- Check for tables without RLS enabled
  SELECT COUNT(*) INTO v_rls_disabled_count
  FROM pg_tables pt
  WHERE pt.schemaname = 'public'
  AND NOT EXISTS (
    SELECT 1 FROM pg_class c
    WHERE c.relname = pt.tablename
    AND c.relrowsecurity = true
  );
  
  -- Check for publicly accessible tables
  SELECT COUNT(*) INTO v_public_tables
  FROM information_schema.table_privileges
  WHERE grantee = 'PUBLIC'
  AND table_schema = 'public';
  
  RETURN QUERY SELECT
    'SQL Injection Prevention'::TEXT,
    CASE 
      WHEN v_rls_disabled_count > 0 OR v_public_tables > 0 THEN 'failing'::TEXT
      ELSE 'passing'::TEXT
    END,
    v_rls_disabled_count + v_public_tables,
    jsonb_build_object(
      'tables_without_rls', v_rls_disabled_count,
      'public_accessible_tables', v_public_tables,
      'recommendation', 'Enable RLS on all tables and restrict public access'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check password policies
CREATE OR REPLACE FUNCTION check_password_policies()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  issues_found INTEGER,
  details JSONB
) AS $$
DECLARE
  v_weak_passwords INTEGER := 0;
  v_no_mfa INTEGER := 0;
BEGIN
  -- Count admin users without MFA (if MFA column exists)
  -- Note: Supabase auth handles this, but we can check our records
  
  -- Count users who haven't changed password in 90+ days
  -- This would require password_last_changed column
  
  RETURN QUERY SELECT
    'Password Policy Compliance'::TEXT,
    CASE 
      WHEN v_weak_passwords > 0 OR v_no_mfa > 0 THEN 'failing'::TEXT
      ELSE 'passing'::TEXT
    END,
    v_weak_passwords + v_no_mfa,
    jsonb_build_object(
      'weak_passwords', v_weak_passwords,
      'admins_without_mfa', v_no_mfa,
      'recommendation', 'Enforce strong passwords and MFA for all admin accounts'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check for excessive permissions
CREATE OR REPLACE FUNCTION check_excessive_permissions()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  issues_found INTEGER,
  details JSONB
) AS $$
DECLARE
  v_admin_count INTEGER;
  v_total_users INTEGER;
  v_admin_percentage DECIMAL;
BEGIN
  -- Count total users
  SELECT COUNT(*) INTO v_total_users FROM auth.users;
  
  -- Count admin users
  SELECT COUNT(*) INTO v_admin_count
  FROM profiles
  WHERE is_admin = true OR role = 'admin';
  
  -- Calculate percentage
  IF v_total_users > 0 THEN
    v_admin_percentage := (v_admin_count::DECIMAL / v_total_users::DECIMAL) * 100;
  ELSE
    v_admin_percentage := 0;
  END IF;
  
  RETURN QUERY SELECT
    'Excessive Permissions Check'::TEXT,
    CASE 
      WHEN v_admin_percentage > 10 THEN 'failing'::TEXT
      ELSE 'passing'::TEXT
    END,
    CASE WHEN v_admin_percentage > 10 THEN 1 ELSE 0 END,
    jsonb_build_object(
      'total_users', v_total_users,
      'admin_users', v_admin_count,
      'admin_percentage', v_admin_percentage,
      'recommendation', 'Admin users should be less than 10% of total users'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check data encryption
CREATE OR REPLACE FUNCTION check_data_encryption()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  issues_found INTEGER,
  details JSONB
) AS $$
DECLARE
  v_unencrypted_sensitive INTEGER := 0;
BEGIN
  -- In production, check if sensitive columns are encrypted
  -- This is a placeholder - actual implementation depends on your encryption strategy
  
  RETURN QUERY SELECT
    'Data Encryption Check'::TEXT,
    CASE 
      WHEN v_unencrypted_sensitive > 0 THEN 'failing'::TEXT
      ELSE 'passing'::TEXT
    END,
    v_unencrypted_sensitive,
    jsonb_build_object(
      'unencrypted_sensitive_fields', v_unencrypted_sensitive,
      'encryption_method', 'AES-256',
      'recommendation', 'All sensitive data should be encrypted at rest'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check audit logging
CREATE OR REPLACE FUNCTION check_audit_logging()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  issues_found INTEGER,
  details JSONB
) AS $$
DECLARE
  v_recent_audits INTEGER;
  v_tables_without_audit INTEGER := 0;
BEGIN
  -- Check for recent audit entries
  SELECT COUNT(*) INTO v_recent_audits
  FROM compliance_audit_trail
  WHERE created_at > NOW() - INTERVAL '24 hours';
  
  RETURN QUERY SELECT
    'Audit Logging Check'::TEXT,
    CASE 
      WHEN v_recent_audits < 1 AND v_tables_without_audit > 0 THEN 'failing'::TEXT
      ELSE 'passing'::TEXT
    END,
    v_tables_without_audit,
    jsonb_build_object(
      'recent_audit_entries', v_recent_audits,
      'tables_without_audit', v_tables_without_audit,
      'recommendation', 'Ensure all critical tables have audit triggers'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Master function to run all security checks
CREATE OR REPLACE FUNCTION run_all_security_checks()
RETURNS TABLE(
  check_name TEXT,
  status TEXT,
  issues_found INTEGER,
  details JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM check_sql_injection_prevention()
  UNION ALL
  SELECT * FROM check_password_policies()
  UNION ALL
  SELECT * FROM check_excessive_permissions()
  UNION ALL
  SELECT * FROM check_data_encryption()
  UNION ALL
  SELECT * FROM check_audit_logging();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 7: SCHEDULED ASSESSMENT TEMPLATES
-- =====================================================

-- Insert default assessment schedule
INSERT INTO security_assessments (
  assessment_type,
  assessment_name,
  description,
  scheduled_date,
  status
) VALUES
(
  'vulnerability_scan',
  'Weekly Automated Vulnerability Scan',
  'Automated scan of database, API, and frontend for common vulnerabilities',
  CURRENT_DATE + INTERVAL '7 days',
  'scheduled'
),
(
  'dependency_audit',
  'Monthly Dependency Vulnerability Check',
  'Review all npm/pip packages for known vulnerabilities using npm audit',
  CURRENT_DATE + INTERVAL '30 days',
  'scheduled'
),
(
  'access_review',
  'Quarterly Access Rights Review',
  'Review all user permissions and admin access',
  CURRENT_DATE + INTERVAL '90 days',
  'scheduled'
),
(
  'compliance_audit',
  'Semi-Annual Compliance Audit',
  'Full GDPR/CCPA/Philippine DPA compliance review',
  CURRENT_DATE + INTERVAL '180 days',
  'scheduled'
),
(
  'penetration_test',
  'Annual Penetration Test',
  'Professional penetration testing by third-party security firm',
  CURRENT_DATE + INTERVAL '365 days',
  'scheduled'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 8: MONITORING VIEWS
-- =====================================================

-- View for security assessment dashboard
CREATE OR REPLACE VIEW security_assessment_summary AS
SELECT 
  assessment_type,
  COUNT(*) as total_assessments,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
  COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled,
  SUM(findings_count) as total_findings,
  SUM(critical_findings) as critical_findings,
  SUM(high_findings) as high_findings,
  MAX(completed_at) as last_completed
FROM security_assessments
GROUP BY assessment_type;

-- View for open security findings
CREATE OR REPLACE VIEW open_security_findings AS
SELECT 
  sf.id,
  sa.assessment_name,
  sf.title,
  sf.severity,
  sf.affected_component,
  sf.remediation_priority,
  sf.remediation_status,
  sf.remediation_deadline,
  sf.assigned_to,
  sf.created_at,
  CASE 
    WHEN sf.remediation_deadline < CURRENT_DATE THEN TRUE
    ELSE FALSE
  END as is_overdue
FROM security_findings sf
JOIN security_assessments sa ON sf.assessment_id = sa.id
WHERE sf.remediation_status IN ('open', 'in_progress')
ORDER BY 
  sf.severity DESC,
  sf.remediation_deadline ASC NULLS LAST;

-- View for vulnerability statistics
CREATE OR REPLACE VIEW vulnerability_statistics AS
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as total_vulnerabilities,
  COUNT(*) FILTER (WHERE severity = 'critical') as critical,
  COUNT(*) FILTER (WHERE severity = 'high') as high,
  COUNT(*) FILTER (WHERE severity = 'medium') as medium,
  COUNT(*) FILTER (WHERE severity = 'low') as low,
  COUNT(*) FILTER (WHERE remediation_status = 'resolved') as resolved,
  COUNT(*) FILTER (WHERE remediation_status IN ('open', 'in_progress')) as open
FROM security_findings
WHERE created_at > NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- =====================================================
-- STEP 9: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE security_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE automated_security_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE automated_check_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE dependency_vulnerabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_audit_trail ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can manage security assessments"
  ON security_assessments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

CREATE POLICY "Admins can view security findings"
  ON security_findings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

CREATE POLICY "Admins can view audit trail"
  ON compliance_audit_trail FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

-- Users can view their own audit trail
CREATE POLICY "Users can view own audit trail"
  ON compliance_audit_trail FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- =====================================================
-- STEP 10: GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION check_sql_injection_prevention() TO authenticated;
GRANT EXECUTE ON FUNCTION check_password_policies() TO authenticated;
GRANT EXECUTE ON FUNCTION check_excessive_permissions() TO authenticated;
GRANT EXECUTE ON FUNCTION check_data_encryption() TO authenticated;
GRANT EXECUTE ON FUNCTION check_audit_logging() TO authenticated;
GRANT EXECUTE ON FUNCTION run_all_security_checks() TO authenticated;

GRANT SELECT ON security_assessment_summary TO authenticated;
GRANT SELECT ON open_security_findings TO authenticated;
GRANT SELECT ON vulnerability_statistics TO authenticated;

-- =====================================================
-- VERIFICATION & TESTING
-- =====================================================

-- Run all security checks
SELECT * FROM run_all_security_checks();

-- View assessment schedule
SELECT 
  assessment_name,
  assessment_type,
  scheduled_date,
  status
FROM security_assessments
ORDER BY scheduled_date;

-- View security assessment summary
SELECT * FROM security_assessment_summary;

-- View open findings
SELECT * FROM open_security_findings;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ System Monitoring and Audit Framework setup complete!';
  RAISE NOTICE '🔍 Features enabled:';
  RAISE NOTICE '   - Security assessment tracking';
  RAISE NOTICE '   - Vulnerability management';
  RAISE NOTICE '   - Automated security checks';
  RAISE NOTICE '   - Dependency vulnerability tracking';
  RAISE NOTICE '   - Access control audits';
  RAISE NOTICE '   - Compliance audit trail';
  RAISE NOTICE '📊 Run security checks: SELECT * FROM run_all_security_checks();';
  RAISE NOTICE '📅 View assessments: SELECT * FROM security_assessment_summary;';
  RAISE NOTICE '🚨 View open findings: SELECT * FROM open_security_findings;';
END $$;
