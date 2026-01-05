-- Create compliance tracking tables for DPA and third-party service management

-- Table to track compliance warnings
CREATE TABLE IF NOT EXISTS compliance_warnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name VARCHAR(100) NOT NULL,
  warning_type VARCHAR(50) NOT NULL, -- 'missing_dpa', 'review_overdue', 'certification_expired'
  message TEXT NOT NULL,
  reported_by UUID REFERENCES auth.users(id),
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to track DPA status updates
CREATE TABLE IF NOT EXISTS compliance_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_name VARCHAR(100) NOT NULL,
  dpa_executed BOOLEAN NOT NULL,
  review_date DATE,
  notes TEXT,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_compliance_warnings_service ON compliance_warnings(service_name);
CREATE INDEX idx_compliance_warnings_resolved ON compliance_warnings(resolved);
CREATE INDEX idx_compliance_updates_service ON compliance_updates(service_name);
CREATE INDEX idx_compliance_updates_date ON compliance_updates(created_at);

-- Enable Row Level Security
ALTER TABLE compliance_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for compliance_warnings
-- Admins can view all warnings
CREATE POLICY "Admins can view all compliance warnings"
  ON compliance_warnings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admins can insert warnings
CREATE POLICY "Admins can insert compliance warnings"
  ON compliance_warnings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admins can update warnings (to mark as resolved)
CREATE POLICY "Admins can update compliance warnings"
  ON compliance_warnings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for compliance_updates
-- Admins can view all updates
CREATE POLICY "Admins can view all compliance updates"
  ON compliance_updates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Admins can insert updates
CREATE POLICY "Admins can insert compliance updates"
  ON compliance_updates
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON compliance_warnings TO authenticated;
GRANT SELECT, INSERT ON compliance_updates TO authenticated;

-- Create a view for latest DPA status per service
CREATE OR REPLACE VIEW latest_dpa_status AS
SELECT DISTINCT ON (service_name)
  service_name,
  dpa_executed,
  review_date,
  updated_by,
  created_at as last_updated
FROM compliance_updates
ORDER BY service_name, created_at DESC;

-- Grant view access to authenticated users
GRANT SELECT ON latest_dpa_status TO authenticated;

-- Function to get unresolved compliance warnings
CREATE OR REPLACE FUNCTION get_unresolved_compliance_warnings()
RETURNS TABLE (
  service_name VARCHAR,
  warning_count BIGINT,
  latest_warning TEXT,
  oldest_warning_date TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cw.service_name,
    COUNT(*) as warning_count,
    MAX(cw.message) as latest_warning,
    MIN(cw.created_at) as oldest_warning_date
  FROM compliance_warnings cw
  WHERE cw.resolved = false
  GROUP BY cw.service_name
  ORDER BY oldest_warning_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_unresolved_compliance_warnings() TO authenticated;
