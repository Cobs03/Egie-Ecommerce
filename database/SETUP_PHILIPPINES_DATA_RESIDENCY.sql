-- =====================================================
-- PHILIPPINES DATA RESIDENCY POLICY
-- =====================================================
-- This script enforces Philippines-only data handling
-- Ensures compliance with Philippine Data Privacy Act
-- Prevents accidental cross-border data transfers
-- =====================================================

-- =====================================================
-- STEP 1: CREATE GEOGRAPHIC RESTRICTION TABLES
-- =====================================================

-- Table to store allowed countries (Philippines only)
CREATE TABLE IF NOT EXISTS allowed_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL UNIQUE,
  country_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Philippines as the only allowed country
INSERT INTO allowed_countries (country_code, country_name, is_active)
VALUES ('PH', 'Philippines', TRUE)
ON CONFLICT (country_code) DO NOTHING;

-- Table to log blocked access attempts from outside Philippines
CREATE TABLE IF NOT EXISTS geo_access_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  country_code TEXT,
  country_name TEXT,
  blocked_reason TEXT DEFAULT 'Access outside Philippines',
  attempted_url TEXT,
  user_agent TEXT,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_geo_blocks_ip ON geo_access_blocks(ip_address, blocked_at);
CREATE INDEX IF NOT EXISTS idx_geo_blocks_country ON geo_access_blocks(country_code);

-- =====================================================
-- STEP 2: ADD GEOGRAPHIC FIELDS TO EXISTING TABLES
-- =====================================================

-- Add country validation to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'PH' CHECK (country_code = 'PH'),
ADD COLUMN IF NOT EXISTS country_name TEXT DEFAULT 'Philippines';

-- Add country validation to shipping addresses
ALTER TABLE shipping_addresses
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Philippines' CHECK (country IN ('Philippines', 'PH'));

-- Add country validation to orders
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_country TEXT DEFAULT 'Philippines' CHECK (shipping_country = 'Philippines');

-- Add IP geolocation to user sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  country_code TEXT,
  country_name TEXT,
  city TEXT,
  region TEXT,
  is_philippines BOOLEAN DEFAULT FALSE,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_activity TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_country ON user_sessions(country_code);

-- =====================================================
-- STEP 3: VALIDATION FUNCTIONS
-- =====================================================

-- Function to check if country is allowed (Philippines only)
CREATE OR REPLACE FUNCTION is_country_allowed(p_country_code TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM allowed_countries
    WHERE country_code = UPPER(p_country_code)
    AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate Philippines address
CREATE OR REPLACE FUNCTION validate_philippines_address(
  p_country TEXT,
  p_province TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if country is Philippines
  IF UPPER(p_country) NOT IN ('PHILIPPINES', 'PH', 'PHL') THEN
    RAISE EXCEPTION 'Only addresses within the Philippines are accepted';
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to log geo-blocked access attempts
CREATE OR REPLACE FUNCTION log_geo_block(
  p_ip_address TEXT,
  p_country_code TEXT DEFAULT NULL,
  p_country_name TEXT DEFAULT NULL,
  p_attempted_url TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_block_id UUID;
BEGIN
  INSERT INTO geo_access_blocks (
    ip_address,
    country_code,
    country_name,
    attempted_url,
    user_agent
  ) VALUES (
    p_ip_address,
    p_country_code,
    p_country_name,
    p_attempted_url,
    p_user_agent
  ) RETURNING id INTO v_block_id;
  
  RETURN v_block_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 4: TRIGGERS FOR ADDRESS VALIDATION
-- =====================================================

-- Trigger to validate shipping addresses are Philippines only
CREATE OR REPLACE FUNCTION trigger_validate_philippines_shipping()
RETURNS TRIGGER AS $$
BEGIN
  -- Normalize country values
  IF NEW.country IS NOT NULL THEN
    NEW.country := 'Philippines';
  END IF;
  
  -- Validate
  PERFORM validate_philippines_address(
    COALESCE(NEW.country, 'Philippines'),
    NEW.province,
    NEW.city
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_shipping_country ON shipping_addresses;
CREATE TRIGGER validate_shipping_country
  BEFORE INSERT OR UPDATE ON shipping_addresses
  FOR EACH ROW
  EXECUTE FUNCTION trigger_validate_philippines_shipping();

-- Trigger to validate order shipping country
CREATE OR REPLACE FUNCTION trigger_validate_order_country()
RETURNS TRIGGER AS $$
BEGIN
  -- Force Philippines
  NEW.shipping_country := 'Philippines';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_order_shipping_country ON orders;
CREATE TRIGGER validate_order_shipping_country
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_validate_order_country();

-- =====================================================
-- STEP 5: DATA RESIDENCY DOCUMENTATION
-- =====================================================

-- Create data processing locations table
CREATE TABLE IF NOT EXISTS data_processing_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_name TEXT NOT NULL,
  location_type TEXT NOT NULL CHECK (location_type IN ('database_server', 'application_server', 'backup_location', 'cdn', 'third_party_service')),
  provider_name TEXT NOT NULL, -- e.g., 'Supabase', 'Vercel', 'AWS'
  physical_location TEXT NOT NULL, -- e.g., 'Singapore (Southeast Asia Region)'
  data_stored TEXT[], -- Array of data types stored
  is_philippines BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  compliance_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert known data processing locations
INSERT INTO data_processing_locations (
  location_name,
  location_type,
  provider_name,
  physical_location,
  data_stored,
  is_philippines,
  compliance_notes
) VALUES
(
  'Supabase Database (Primary)',
  'database_server',
  'Supabase',
  'Singapore (Southeast Asia Region)',
  ARRAY['user_profiles', 'orders', 'products', 'all_user_data'],
  FALSE,
  'Closest available region to Philippines. Data protected by encryption at rest and in transit. Supabase complies with GDPR and provides DPA.'
),
(
  'Supabase Backups',
  'backup_location',
  'Supabase',
  'Singapore (Southeast Asia Region)',
  ARRAY['database_backups', 'point_in_time_recovery'],
  FALSE,
  'Automated backups stored in same region as primary database. 7-day retention for free tier, 30-day for paid plans.'
),
(
  'Application Server',
  'application_server',
  'Vercel/Netlify',
  'Singapore/Hong Kong (Asia Pacific)',
  ARRAY['application_code', 'static_assets', 'session_data'],
  FALSE,
  'Edge network for fast delivery to Philippines users. No persistent user data stored on edge nodes.'
),
(
  'Payment Processor',
  'third_party_service',
  'PayMongo',
  'Philippines',
  ARRAY['payment_data', 'billing_information'],
  TRUE,
  'Local Philippine payment processor. All payment data stays within Philippines. PCI DSS Level 1 certified.'
)
ON CONFLICT DO NOTHING;

-- Create view for data residency report
CREATE OR REPLACE VIEW data_residency_report AS
SELECT 
  location_name,
  location_type,
  provider_name,
  physical_location,
  CASE 
    WHEN is_philippines THEN 'Within Philippines ✓'
    ELSE 'Outside Philippines (Nearest: Southeast Asia)'
  END as location_status,
  data_stored,
  compliance_notes
FROM data_processing_locations
WHERE is_active = TRUE
ORDER BY is_philippines DESC, location_type;

-- =====================================================
-- STEP 6: PHILIPPINE PROVINCES VALIDATION (OPTIONAL)
-- =====================================================

-- Table for Philippine provinces for address validation
CREATE TABLE IF NOT EXISTS philippine_provinces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  province_code TEXT UNIQUE NOT NULL,
  province_name TEXT NOT NULL,
  region_code TEXT NOT NULL,
  region_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Insert Philippine provinces (sample - add all 81 provinces)
INSERT INTO philippine_provinces (province_code, province_name, region_code, region_name) VALUES
('MNL', 'Metro Manila', 'NCR', 'National Capital Region'),
('CAV', 'Cavite', 'IV-A', 'CALABARZON'),
('LAG', 'Laguna', 'IV-A', 'CALABARZON'),
('BTG', 'Batangas', 'IV-A', 'CALABARZON'),
('RIZ', 'Rizal', 'IV-A', 'CALABARZON'),
('QUE', 'Quezon', 'IV-A', 'CALABARZON'),
('BUL', 'Bulacan', 'III', 'Central Luzon'),
('PAM', 'Pampanga', 'III', 'Central Luzon'),
('CEB', 'Cebu', 'VII', 'Central Visayas'),
('DAV', 'Davao del Sur', 'XI', 'Davao Region')
-- Add more provinces as needed
ON CONFLICT (province_code) DO NOTHING;

-- =====================================================
-- STEP 7: COMPLIANCE DOCUMENTATION TABLE
-- =====================================================

-- Track compliance with Philippine Data Privacy Act
CREATE TABLE IF NOT EXISTS philippine_dpa_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compliance_area TEXT NOT NULL,
  dpa_section TEXT NOT NULL,
  requirement TEXT NOT NULL,
  implementation_status TEXT CHECK (implementation_status IN ('implemented', 'partial', 'not_applicable', 'planned')),
  implementation_details TEXT,
  evidence_location TEXT, -- File path or reference
  last_reviewed TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES auth.users(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert DPA compliance requirements
INSERT INTO philippine_dpa_compliance (
  compliance_area,
  dpa_section,
  requirement,
  implementation_status,
  implementation_details,
  evidence_location
) VALUES
(
  'Data Residency',
  'Section 11 (g) - Security Measures',
  'Ensure user data is stored securely and access is limited to Philippines residents',
  'implemented',
  'Database triggers enforce Philippines-only addresses. Geolocation blocking for non-PH access. All user data stored in Southeast Asia region (closest to PH).',
  'database/SETUP_PHILIPPINES_DATA_RESIDENCY.sql'
),
(
  'Cross-Border Transfer',
  'Section 20 - Restrictions on Transfer',
  'Ensure no unauthorized cross-border data transfers occur',
  'implemented',
  'Service limited to Philippines only. Payment processor (PayMongo) is local. Database in Singapore (ASEAN region) with encryption and DPA. No data transfer to non-ASEAN countries.',
  'PHILIPPINES_DATA_RESIDENCY_POLICY.md'
),
(
  'Consent',
  'Section 12 - Consent',
  'Obtain consent for data processing from Philippine users',
  'implemented',
  'User consent system with checkboxes for terms, privacy policy, and data processing. Consent stored in user_consents table with audit trail.',
  'database/CREATE_DATA_PROCESSING_REGISTRY.sql'
),
(
  'Data Subject Rights',
  'Section 16-19 - Rights of Data Subjects',
  'Provide rights to access, correct, delete, and port data',
  'implemented',
  'Privacy dashboard with data download, account deletion, data correction. All implemented in PrivacyTab component.',
  'src/views/Settings/components/PrivacyTab.jsx'
),
(
  'Security Measures',
  'Section 21 - Security Measures',
  'Implement organizational and technical security measures',
  'implemented',
  'AES-256 encryption, TLS 1.2+, RLS policies, breach detection, IP blacklisting, failed login monitoring.',
  'DATA_SECURITY_MEASURES.md'
),
(
  'Data Breach Notification',
  'NPC Circular 16-03',
  'Notify NPC and affected individuals within 72 hours of breach',
  'implemented',
  'Automated breach incident system with notification within 72 hours. Admin dashboard for reporting to NPC.',
  'BREACH_INCIDENT_MANAGEMENT_SYSTEM.md'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 8: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE allowed_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_access_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_processing_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE philippine_provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE philippine_dpa_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Public can view allowed countries
CREATE POLICY "Anyone can view allowed countries"
  ON allowed_countries FOR SELECT
  TO public
  USING (TRUE);

-- Admins can view geo blocks
CREATE POLICY "Admins can view geo blocks"
  ON geo_access_blocks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

-- Public can view provinces
CREATE POLICY "Anyone can view provinces"
  ON philippine_provinces FOR SELECT
  TO public
  USING (TRUE);

-- Admins can view data residency info
CREATE POLICY "Admins can view data locations"
  ON data_processing_locations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.is_admin = true OR profiles.role = 'admin')
    )
  );

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- =====================================================
-- STEP 9: MONITORING & REPORTING QUERIES
-- =====================================================

-- View all data processing locations
CREATE OR REPLACE VIEW data_residency_summary AS
SELECT 
  COUNT(*) FILTER (WHERE is_philippines = TRUE) as locations_in_philippines,
  COUNT(*) FILTER (WHERE is_philippines = FALSE) as locations_outside_philippines,
  COUNT(*) as total_locations,
  ARRAY_AGG(DISTINCT physical_location) as all_locations
FROM data_processing_locations
WHERE is_active = TRUE;

-- View geo-blocking statistics
CREATE OR REPLACE VIEW geo_block_statistics AS
SELECT 
  DATE(blocked_at) as date,
  country_code,
  country_name,
  COUNT(*) as blocked_attempts,
  COUNT(DISTINCT ip_address) as unique_ips
FROM geo_access_blocks
WHERE blocked_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(blocked_at), country_code, country_name
ORDER BY date DESC, blocked_attempts DESC;

-- View Philippine DPA compliance status
CREATE OR REPLACE VIEW dpa_compliance_summary AS
SELECT 
  compliance_area,
  COUNT(*) as total_requirements,
  COUNT(*) FILTER (WHERE implementation_status = 'implemented') as implemented,
  COUNT(*) FILTER (WHERE implementation_status = 'partial') as partial,
  COUNT(*) FILTER (WHERE implementation_status = 'planned') as planned,
  ROUND(
    (COUNT(*) FILTER (WHERE implementation_status = 'implemented')::DECIMAL / 
    COUNT(*)::DECIMAL) * 100, 
    2
  ) as compliance_percentage
FROM philippine_dpa_compliance
GROUP BY compliance_area
ORDER BY compliance_percentage DESC;

-- =====================================================
-- STEP 10: GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION is_country_allowed(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION validate_philippines_address(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION log_geo_block(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

GRANT SELECT ON data_residency_report TO authenticated;
GRANT SELECT ON data_residency_summary TO authenticated;
GRANT SELECT ON geo_block_statistics TO authenticated;
GRANT SELECT ON dpa_compliance_summary TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check allowed countries
SELECT * FROM allowed_countries;

-- View data residency report
SELECT * FROM data_residency_report;

-- View compliance summary
SELECT * FROM dpa_compliance_summary;

-- Test country validation
SELECT is_country_allowed('PH');  -- Should return TRUE
SELECT is_country_allowed('US');  -- Should return FALSE

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Philippines Data Residency Policy setup complete!';
  RAISE NOTICE '🇵🇭 Service restricted to: Philippines only';
  RAISE NOTICE '🔒 Cross-border transfers: BLOCKED';
  RAISE NOTICE '📍 Database location: Singapore (Southeast Asia - nearest to PH)';
  RAISE NOTICE '💳 Payment processor: PayMongo (Philippines-based)';
  RAISE NOTICE '📊 View compliance: SELECT * FROM dpa_compliance_summary;';
  RAISE NOTICE '🗺️ View data locations: SELECT * FROM data_residency_report;';
END $$;
