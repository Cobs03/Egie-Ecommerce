-- =====================================================
-- DATA PROCESSING REGISTRY SYSTEM
-- GDPR Article 30: Records of Processing Activities
-- =====================================================
-- This creates a comprehensive system to document:
-- - What data is collected
-- - Why it's collected (purpose)
-- - Legal basis for processing
-- - Retention periods
-- - Data categories
-- - Third-party processors
-- =====================================================

-- 1. DATA PROCESSING ACTIVITIES TABLE
-- Tracks all data processing activities in the system
CREATE TABLE IF NOT EXISTS data_processing_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Activity Information
  activity_name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  department TEXT, -- e.g., 'Sales', 'Marketing', 'Customer Support'
  
  -- Purpose of Processing (GDPR Article 13)
  processing_purpose TEXT NOT NULL,
  
  -- Legal Basis (GDPR Article 6)
  legal_basis TEXT NOT NULL CHECK (legal_basis IN (
    'consent',
    'contract',
    'legal_obligation',
    'vital_interests',
    'public_task',
    'legitimate_interests'
  )),
  
  -- Legitimate Interest Assessment (if applicable)
  legitimate_interest_details TEXT,
  
  -- Data Categories
  data_categories TEXT[] NOT NULL, -- e.g., ['Personal data', 'Financial data']
  
  -- Data Fields Collected
  data_fields JSONB NOT NULL, -- Detailed field-level documentation
  
  -- Data Subjects
  data_subject_categories TEXT[] NOT NULL, -- e.g., ['Customers', 'Employees']
  
  -- Recipients (who has access)
  recipients TEXT[] NOT NULL, -- e.g., ['Internal staff', 'Payment processor']
  
  -- Third-Party Transfers
  third_party_transfers BOOLEAN DEFAULT FALSE,
  third_party_recipients JSONB, -- Details of third parties
  transfer_safeguards TEXT, -- e.g., 'Standard Contractual Clauses'
  
  -- Retention
  retention_period TEXT NOT NULL,
  retention_justification TEXT NOT NULL,
  
  -- Security Measures
  security_measures TEXT[] NOT NULL,
  encryption_used BOOLEAN DEFAULT FALSE,
  pseudonymization_used BOOLEAN DEFAULT FALSE,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'under_review')),
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  
  -- DPIA Required (Data Protection Impact Assessment)
  dpia_required BOOLEAN DEFAULT FALSE,
  dpia_completed BOOLEAN DEFAULT FALSE,
  dpia_document_url TEXT,
  
  -- Metadata
  responsible_person TEXT,
  last_reviewed_at TIMESTAMPTZ,
  next_review_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DATA FIELDS CATALOG
-- Detailed catalog of all data fields collected
CREATE TABLE IF NOT EXISTS data_fields_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Field Information
  field_name TEXT NOT NULL UNIQUE,
  field_type TEXT NOT NULL, -- e.g., 'string', 'email', 'phone', 'address'
  category TEXT NOT NULL, -- e.g., 'Personal', 'Financial', 'Behavioral'
  
  -- Classification
  sensitivity_level TEXT NOT NULL CHECK (sensitivity_level IN (
    'public',
    'internal',
    'confidential',
    'restricted',
    'critical'
  )),
  is_special_category BOOLEAN DEFAULT FALSE, -- GDPR Article 9 special categories
  is_personal_data BOOLEAN DEFAULT TRUE,
  
  -- Processing Details
  collection_method TEXT, -- e.g., 'User input', 'Automatic', 'Third-party'
  storage_location TEXT, -- e.g., 'Supabase PostgreSQL', 'Local storage'
  
  -- Purpose
  primary_purpose TEXT NOT NULL,
  secondary_purposes TEXT[],
  
  -- Legal Basis
  legal_basis TEXT NOT NULL,
  
  -- Access Control
  who_can_access TEXT[] NOT NULL,
  
  -- Retention
  default_retention_period TEXT NOT NULL,
  
  -- Examples
  example_value TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LEGAL BASIS DOCUMENTATION
-- Documents legal basis for each processing activity
CREATE TABLE IF NOT EXISTS legal_basis_documentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference
  processing_activity_id UUID REFERENCES data_processing_activities(id) ON DELETE CASCADE,
  
  -- Legal Basis Details
  legal_basis TEXT NOT NULL,
  justification TEXT NOT NULL,
  
  -- Supporting Evidence
  evidence_type TEXT, -- e.g., 'Consent record', 'Contract', 'Legal requirement'
  evidence_location TEXT,
  
  -- For Consent
  consent_mechanism TEXT, -- How consent is obtained
  consent_withdrawal_method TEXT, -- How users can withdraw
  
  -- For Legitimate Interests
  legitimate_interest_purpose TEXT,
  balancing_test_result TEXT,
  user_rights_protected TEXT[],
  
  -- For Contracts
  contract_type TEXT,
  contract_necessity TEXT,
  
  -- Metadata
  documented_by TEXT,
  documented_at TIMESTAMPTZ DEFAULT NOW(),
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DATA RETENTION POLICIES
-- Centralized retention policy management
CREATE TABLE IF NOT EXISTS data_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Policy Information
  policy_name TEXT NOT NULL UNIQUE,
  data_category TEXT NOT NULL,
  
  -- Retention Details
  retention_period_value INTEGER NOT NULL,
  retention_period_unit TEXT NOT NULL CHECK (retention_period_unit IN (
    'days',
    'months',
    'years'
  )),
  retention_period_description TEXT NOT NULL,
  
  -- Justification
  retention_reason TEXT NOT NULL,
  legal_requirement TEXT, -- e.g., 'Tax law requires 7 years'
  
  -- Deletion Process
  deletion_method TEXT NOT NULL, -- e.g., 'Automatic', 'Manual', 'Scheduled'
  deletion_verification BOOLEAN DEFAULT TRUE,
  
  -- Review
  review_frequency_months INTEGER DEFAULT 12,
  last_reviewed_at TIMESTAMPTZ,
  next_review_date TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'under_review')),
  
  -- Metadata
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. THIRD-PARTY PROCESSORS REGISTRY
-- Extended from DPA compliance system
CREATE TABLE IF NOT EXISTS third_party_processor_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Processor Information
  processor_name TEXT NOT NULL UNIQUE,
  processor_type TEXT NOT NULL, -- e.g., 'Payment processor', 'Email service', 'Analytics'
  
  -- Contact Details
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  
  -- Location
  country TEXT NOT NULL,
  is_eu_based BOOLEAN DEFAULT FALSE,
  is_adequacy_decision BOOLEAN DEFAULT FALSE, -- EU adequacy decision exists
  
  -- Processing Details
  data_categories_processed TEXT[] NOT NULL,
  processing_purpose TEXT NOT NULL,
  
  -- Legal Framework
  dpa_status TEXT NOT NULL CHECK (dpa_status IN (
    'executed',
    'pending',
    'not_required',
    'expired'
  )),
  dpa_signed_date TIMESTAMPTZ,
  dpa_expiry_date TIMESTAMPTZ,
  dpa_document_url TEXT,
  
  -- Transfer Safeguards (for non-EU)
  transfer_mechanism TEXT, -- e.g., 'Standard Contractual Clauses', 'Binding Corporate Rules'
  
  -- Certifications
  certifications TEXT[], -- e.g., ['ISO 27001', 'SOC 2', 'Privacy Shield']
  
  -- Security
  security_measures TEXT[] NOT NULL,
  last_security_audit TIMESTAMPTZ,
  
  -- Sub-processors
  uses_sub_processors BOOLEAN DEFAULT FALSE,
  sub_processors JSONB, -- List of sub-processors
  
  -- Review
  last_reviewed_at TIMESTAMPTZ,
  next_review_date TIMESTAMPTZ,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DATA PROCESSING AUDIT LOG
-- Tracks changes to processing activities
CREATE TABLE IF NOT EXISTS data_processing_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference
  processing_activity_id UUID REFERENCES data_processing_activities(id) ON DELETE SET NULL,
  
  -- Action
  action TEXT NOT NULL CHECK (action IN (
    'created',
    'updated',
    'deleted',
    'reviewed',
    'status_changed'
  )),
  
  -- Changes
  field_changed TEXT,
  old_value JSONB,
  new_value JSONB,
  
  -- Context
  changed_by TEXT NOT NULL,
  change_reason TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_processing_activities_status 
  ON data_processing_activities(status);

CREATE INDEX IF NOT EXISTS idx_processing_activities_legal_basis 
  ON data_processing_activities(legal_basis);

CREATE INDEX IF NOT EXISTS idx_processing_activities_risk_level 
  ON data_processing_activities(risk_level);

CREATE INDEX IF NOT EXISTS idx_data_fields_category 
  ON data_fields_catalog(category);

CREATE INDEX IF NOT EXISTS idx_data_fields_sensitivity 
  ON data_fields_catalog(sensitivity_level);

CREATE INDEX IF NOT EXISTS idx_third_party_status 
  ON third_party_processor_registry(status);

CREATE INDEX IF NOT EXISTS idx_third_party_dpa_status 
  ON third_party_processor_registry(dpa_status);

CREATE INDEX IF NOT EXISTS idx_audit_log_activity 
  ON data_processing_audit_log(processing_activity_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_created 
  ON data_processing_audit_log(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE data_processing_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_fields_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_basis_documentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE third_party_processor_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_processing_audit_log ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "Admins can view processing activities"
  ON data_processing_activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage processing activities"
  ON data_processing_activities FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Similar policies for other tables
CREATE POLICY "Admins can view data fields"
  ON data_fields_catalog FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage data fields"
  ON data_fields_catalog FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- SAMPLE DATA: Pre-populate common processing activities
-- =====================================================

INSERT INTO data_processing_activities (
  activity_name,
  description,
  department,
  processing_purpose,
  legal_basis,
  data_categories,
  data_fields,
  data_subject_categories,
  recipients,
  third_party_transfers,
  retention_period,
  retention_justification,
  security_measures,
  encryption_used,
  status,
  risk_level,
  responsible_person,
  last_reviewed_at
) VALUES
(
  'User Registration and Account Management',
  'Collection and processing of user data for account creation and management',
  'Customer Operations',
  'To create and manage user accounts, provide access to services, and maintain customer relationships',
  'contract',
  ARRAY['Personal data', 'Contact information'],
  '{"email": "User email address", "name": "First and last name", "phone": "Phone number (optional)", "password_hash": "Encrypted password", "address": "Shipping and billing addresses"}'::jsonb,
  ARRAY['Customers', 'Registered users'],
  ARRAY['Internal customer support', 'Admin staff'],
  FALSE,
  'Until account deletion or 2 years after last activity',
  'Required for contract performance and customer relationship management',
  ARRAY['Encryption at rest', 'Password hashing', 'Access controls', 'RLS policies'],
  TRUE,
  'active',
  'low',
  'Data Protection Officer',
  NOW()
),
(
  'Order Processing and Fulfillment',
  'Processing of customer orders including payment and shipping',
  'Sales',
  'To process customer orders, manage payments, arrange shipping, and provide customer support',
  'contract',
  ARRAY['Personal data', 'Financial data', 'Transaction data'],
  '{"order_items": "Products ordered", "total_amount": "Order total", "payment_method": "Payment method used", "shipping_address": "Delivery address", "billing_address": "Billing address", "payment_info": "Payment reference (not full card details)", "order_status": "Current order status"}'::jsonb,
  ARRAY['Customers'],
  ARRAY['Internal staff', 'Payment processor (PayMongo)', 'Shipping couriers'],
  TRUE,
  '7 years',
  'Legal requirement for tax and accounting purposes (RA 8424 Philippine Tax Code)',
  ARRAY['PCI-DSS compliant payment processing', 'Encrypted transmission', 'Access logging', 'Data minimization'],
  TRUE,
  'active',
  'high',
  'Finance Manager',
  NOW()
),
(
  'Marketing and Promotional Communications',
  'Sending marketing emails, promotions, and product recommendations',
  'Marketing',
  'To provide users with relevant offers, promotions, and product recommendations',
  'consent',
  ARRAY['Personal data', 'Behavioral data'],
  '{"email": "User email", "preferences": "Product interests", "browsing_history": "Products viewed", "purchase_history": "Past purchases"}'::jsonb,
  ARRAY['Customers', 'Newsletter subscribers'],
  ARRAY['Marketing team', 'Email service provider (Resend)'],
  TRUE,
  '3 years after last consent or until withdrawal',
  'Reasonable period for marketing purposes while consent is active',
  ARRAY['Opt-out mechanism', 'Consent tracking', 'Encryption', 'Access controls'],
  TRUE,
  'active',
  'medium',
  'Marketing Manager',
  NOW()
),
(
  'AI Shopping Assistant',
  'Processing user queries for AI-powered shopping assistance',
  'Customer Service',
  'To provide personalized shopping assistance and product recommendations via AI',
  'consent',
  ARRAY['Personal data', 'Behavioral data', 'Usage data'],
  '{"chat_messages": "User queries and responses", "product_preferences": "Inferred preferences", "user_id": "User identifier", "session_data": "Conversation context"}'::jsonb,
  ARRAY['Customers', 'AI service users'],
  ARRAY['Internal staff', 'AI service provider (Groq, OpenAI)'],
  TRUE,
  '90 days',
  'Sufficient for service improvement while respecting privacy',
  ARRAY['Consent verification', 'Data minimization', 'Audit logging', 'Third-party DPA'],
  TRUE,
  'active',
  'medium',
  'Technical Lead',
  NOW()
),
(
  'Website Analytics and Performance Monitoring',
  'Tracking website usage and performance metrics',
  'IT/Technical',
  'To improve website performance, user experience, and identify technical issues',
  'legitimate_interests',
  ARRAY['Usage data', 'Technical data'],
  '{"ip_address": "IP address (pseudonymized)", "browser": "Browser type", "device": "Device information", "pages_visited": "Page views", "session_duration": "Time on site", "referrer": "Traffic source"}'::jsonb,
  ARRAY['All website visitors'],
  ARRAY['Internal technical team', 'Analytics team'],
  FALSE,
  '90 days',
  'Sufficient for analytics and troubleshooting purposes',
  ARRAY['IP pseudonymization', 'Aggregation', 'Access controls', 'Data minimization'],
  FALSE,
  'active',
  'low',
  'Technical Lead',
  NOW()
),
(
  'Customer Support and Communication',
  'Handling customer inquiries, support tickets, and communications',
  'Customer Support',
  'To provide customer support, resolve issues, and maintain customer satisfaction',
  'contract',
  ARRAY['Personal data', 'Communication data'],
  '{"name": "Customer name", "email": "Contact email", "phone": "Contact phone", "message": "Support inquiry", "order_reference": "Related order number", "support_history": "Previous interactions"}'::jsonb,
  ARRAY['Customers'],
  ARRAY['Support staff', 'Admin staff'],
  FALSE,
  '2 years after resolution',
  'Necessary for quality assurance and handling potential disputes',
  ARRAY['Access controls', 'Audit logging', 'Encryption in transit'],
  TRUE,
  'active',
  'low',
  'Support Manager',
  NOW()
),
(
  'Product Reviews and Ratings',
  'Collection and display of customer product reviews',
  'Customer Engagement',
  'To display authentic customer feedback and help other customers make informed decisions',
  'consent',
  ARRAY['Personal data', 'User-generated content'],
  '{"reviewer_name": "Display name", "rating": "Star rating", "review_text": "Review content", "product_id": "Product reviewed", "verified_purchase": "Purchase verification"}'::jsonb,
  ARRAY['Customers'],
  ARRAY['Public (website visitors)', 'Internal moderation team'],
  FALSE,
  'Until user deletion or review removal',
  'Maintains value for other customers while allowing user control',
  ARRAY['User consent', 'Moderation', 'Deletion rights'],
  FALSE,
  'active',
  'low',
  'Product Manager',
  NOW()
);

-- =====================================================
-- INSERT SAMPLE DATA FIELDS
-- =====================================================

INSERT INTO data_fields_catalog (
  field_name,
  field_type,
  category,
  sensitivity_level,
  is_special_category,
  collection_method,
  storage_location,
  primary_purpose,
  legal_basis,
  who_can_access,
  default_retention_period
) VALUES
('user_email', 'email', 'Personal', 'confidential', FALSE, 'User input', 'Supabase PostgreSQL', 'Account identification and communication', 'contract', ARRAY['Admin', 'Support staff'], 'Until account deletion'),
('user_name', 'string', 'Personal', 'internal', FALSE, 'User input', 'Supabase PostgreSQL', 'Account personalization', 'contract', ARRAY['Admin', 'Support staff'], 'Until account deletion'),
('user_phone', 'phone', 'Personal', 'confidential', FALSE, 'User input', 'Supabase PostgreSQL', 'Order delivery contact', 'contract', ARRAY['Admin', 'Support staff', 'Shipping team'], 'Until account deletion'),
('shipping_address', 'address', 'Personal', 'confidential', FALSE, 'User input', 'Supabase PostgreSQL', 'Order delivery', 'contract', ARRAY['Admin', 'Shipping team'], '2 years after last use'),
('payment_reference', 'string', 'Financial', 'restricted', FALSE, 'Third-party (PayMongo)', 'Supabase PostgreSQL', 'Payment verification', 'contract', ARRAY['Admin', 'Finance team'], '7 years (tax requirement)'),
('ip_address', 'string', 'Technical', 'internal', FALSE, 'Automatic', 'Supabase PostgreSQL (pseudonymized)', 'Security and fraud prevention', 'legitimate_interests', ARRAY['Security team'], '90 days'),
('browsing_history', 'array', 'Behavioral', 'internal', FALSE, 'Automatic', 'Supabase PostgreSQL', 'Personalization', 'consent', ARRAY['Marketing team', 'Analytics team'], '90 days'),
('order_history', 'jsonb', 'Transaction', 'confidential', FALSE, 'System generated', 'Supabase PostgreSQL', 'Order management', 'contract', ARRAY['Admin', 'Support staff'], '7 years (tax requirement)');

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT '✅ Data Processing Registry created successfully!' AS status;
SELECT 'Tables created:' AS info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'data_%'
OR table_name LIKE '%processing%'
OR table_name LIKE '%third_party_processor%';

SELECT 
  COUNT(*) AS sample_activities_created 
FROM data_processing_activities;

SELECT 
  COUNT(*) AS sample_fields_created 
FROM data_fields_catalog;
