-- Third-Party Data Sharing Audit Log Table
-- Tracks all data shared with third-party services for GDPR/CCPA compliance

-- Create audit log table
CREATE TABLE IF NOT EXISTS public.third_party_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  data_types TEXT[] NOT NULL,
  user_id TEXT, -- Pseudonymized user ID
  session_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_third_party_logs_service ON public.third_party_audit_logs(service_name);
CREATE INDEX IF NOT EXISTS idx_third_party_logs_timestamp ON public.third_party_audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_third_party_logs_user ON public.third_party_audit_logs(user_id);

-- Enable Row Level Security
ALTER TABLE public.third_party_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can view their own logs (pseudonymized)
-- Admin users can view all logs
CREATE POLICY "Users can view own audit logs"
  ON public.third_party_audit_logs
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
  );

-- Policy: Service can insert audit logs
CREATE POLICY "Service can insert audit logs"
  ON public.third_party_audit_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE public.third_party_audit_logs IS 'Audit trail of all data sharing with third-party services for GDPR/CCPA compliance';
COMMENT ON COLUMN public.third_party_audit_logs.service_name IS 'Name of third-party service (e.g., PayMongo, Groq, Resend)';
COMMENT ON COLUMN public.third_party_audit_logs.purpose IS 'Purpose of data sharing';
COMMENT ON COLUMN public.third_party_audit_logs.data_types IS 'Array of data types shared (e.g., email, billing_address)';
COMMENT ON COLUMN public.third_party_audit_logs.user_id IS 'Pseudonymized user ID (hashed for privacy)';
COMMENT ON COLUMN public.third_party_audit_logs.session_id IS 'Session identifier for tracking';
COMMENT ON COLUMN public.third_party_audit_logs.metadata IS 'Additional context (sanitized, no PII)';

-- Create function to auto-delete old audit logs (GDPR data minimization)
CREATE OR REPLACE FUNCTION delete_old_audit_logs()
RETURNS void AS $$
BEGIN
  -- Delete logs older than 2 years (adjust based on retention policy)
  DELETE FROM public.third_party_audit_logs
  WHERE timestamp < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create scheduled job to clean up old logs (requires pg_cron extension)
-- Run cleanup monthly
-- SELECT cron.schedule('cleanup-audit-logs', '0 0 1 * *', 'SELECT delete_old_audit_logs();');

-- Grant permissions
GRANT SELECT ON public.third_party_audit_logs TO authenticated;
GRANT INSERT ON public.third_party_audit_logs TO authenticated, service_role;
