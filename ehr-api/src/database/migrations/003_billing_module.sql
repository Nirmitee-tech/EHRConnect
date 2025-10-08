-- Billing Module Schema
-- Implements Claim.MD Integration with FHIR R4 Compatibility
-- Version: 2.0
-- Compatible with PostgreSQL 12+

-- =====================================================
-- TENANT SETTINGS (Claim.MD Credentials)
-- =====================================================
CREATE TABLE IF NOT EXISTS billing_tenant_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  claim_md_account_key TEXT NOT NULL,
  claim_md_token TEXT NOT NULL,
  claim_md_api_url TEXT NOT NULL DEFAULT 'https://api.claim.md/v1',
  settings JSONB DEFAULT '{}', -- Additional settings
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(org_id)
);

CREATE INDEX idx_billing_tenant_settings_org_id ON billing_tenant_settings(org_id);

-- =====================================================
-- BILLING MASTERS: CPT CODES
-- =====================================================
CREATE TABLE IF NOT EXISTS billing_cpt_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT, -- E.g., 'E&M', 'Surgery', 'Radiology'
  modifier_allowed BOOLEAN DEFAULT TRUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  effective_date DATE,
  termination_date DATE,
  version TEXT, -- CPT code version
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_billing_cpt_codes_code ON billing_cpt_codes(code);
CREATE INDEX idx_billing_cpt_codes_category ON billing_cpt_codes(category);
CREATE INDEX idx_billing_cpt_codes_active ON billing_cpt_codes(active);

-- =====================================================
-- BILLING MASTERS: ICD CODES (ICD-10)
-- =====================================================
CREATE TABLE IF NOT EXISTS billing_icd_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT, -- Chapter/category
  icd_version TEXT NOT NULL DEFAULT 'ICD-10', -- 'ICD-9', 'ICD-10', 'ICD-11'
  active BOOLEAN NOT NULL DEFAULT TRUE,
  effective_date DATE,
  termination_date DATE,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_billing_icd_codes_code ON billing_icd_codes(code);
CREATE INDEX idx_billing_icd_codes_category ON billing_icd_codes(category);
CREATE INDEX idx_billing_icd_codes_active ON billing_icd_codes(active);

-- =====================================================
-- BILLING MASTERS: MODIFIERS
-- =====================================================
CREATE TABLE IF NOT EXISTS billing_modifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  modifier_type TEXT, -- 'CPT', 'HCPCS'
  active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_billing_modifiers_code ON billing_modifiers(code);
CREATE INDEX idx_billing_modifiers_type ON billing_modifiers(modifier_type);

-- =====================================================
-- BILLING MASTERS: PROVIDERS
-- =====================================================
CREATE TABLE IF NOT EXISTS billing_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  npi TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  taxonomy_code TEXT NOT NULL,
  license_number TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_billing_providers_npi ON billing_providers(npi);
CREATE INDEX idx_billing_providers_specialty ON billing_providers(specialty);
CREATE INDEX idx_billing_providers_active ON billing_providers(active);

-- =====================================================
-- BILLING MASTERS: PAYERS (Insurance Companies)
-- =====================================================
CREATE TABLE IF NOT EXISTS billing_payers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  payer_id TEXT UNIQUE, -- National Payer ID
  payer_type TEXT CHECK (payer_type IN ('commercial', 'medicare', 'medicaid', 'self_pay', 'other')),
  address JSONB,
  contact_email TEXT,
  contact_phone TEXT,
  claim_submission_method TEXT CHECK (claim_submission_method IN ('electronic', 'paper', 'both')),
  requires_prior_auth BOOLEAN DEFAULT FALSE,
  era_supported BOOLEAN DEFAULT TRUE, -- Electronic Remittance Advice
  active BOOLEAN NOT NULL DEFAULT TRUE,
  settings JSONB DEFAULT '{}', -- Payer-specific rules
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_billing_payers_name ON billing_payers(name);
CREATE INDEX idx_billing_payers_payer_id ON billing_payers(payer_id);
CREATE INDEX idx_billing_payers_active ON billing_payers(active);

-- =====================================================
-- BILLING MASTERS: FEE SCHEDULES
-- =====================================================
CREATE TABLE IF NOT EXISTS billing_fee_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  payer_id UUID REFERENCES billing_payers(id) ON DELETE CASCADE, -- NULL means org default
  cpt_code TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(org_id, payer_id, cpt_code, effective_from)
);

CREATE INDEX idx_billing_fee_schedules_org_id ON billing_fee_schedules(org_id);
CREATE INDEX idx_billing_fee_schedules_payer_id ON billing_fee_schedules(payer_id);
CREATE INDEX idx_billing_fee_schedules_cpt_code ON billing_fee_schedules(cpt_code);

-- =====================================================
-- ELIGIBILITY HISTORY
-- =====================================================
CREATE TABLE IF NOT EXISTS billing_eligibility_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL, -- FHIR Patient ID
  payer_id UUID REFERENCES billing_payers(id) ON DELETE SET NULL,
  member_id TEXT,
  service_date DATE NOT NULL,
  eligibility_status TEXT NOT NULL CHECK (eligibility_status IN ('active', 'inactive', 'unknown', 'pending')),
  coverage_details JSONB NOT NULL, -- Plan name, copay, deductible, etc.
  response_raw JSONB, -- Raw Claim.MD response
  checked_by UUID REFERENCES users(id),
  checked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB,
  CONSTRAINT unique_eligibility_check UNIQUE(patient_id, payer_id, service_date, checked_at)
);

CREATE INDEX idx_billing_eligibility_patient_id ON billing_eligibility_history(patient_id);
CREATE INDEX idx_billing_eligibility_org_id ON billing_eligibility_history(org_id);
CREATE INDEX idx_billing_eligibility_checked_at ON billing_eligibility_history(checked_at DESC);

-- =====================================================
-- PRIOR AUTHORIZATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS billing_prior_authorizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_number TEXT UNIQUE, -- Claim.MD or payer auth number
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL, -- FHIR Patient ID
  encounter_id TEXT, -- FHIR Encounter ID
  payer_id UUID NOT NULL REFERENCES billing_payers(id) ON DELETE RESTRICT,
  provider_npi TEXT NOT NULL,
  cpt_codes TEXT[] NOT NULL,
  icd_codes TEXT[] NOT NULL,
  units INTEGER,
  service_location TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'denied', 'expired', 'cancelled')),
  requested_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_from DATE,
  valid_to DATE,
  denial_reason TEXT,
  notes TEXT,
  request_payload JSONB, -- Original request to Claim.MD
  response_payload JSONB, -- Response from Claim.MD
  requested_by UUID REFERENCES users(id),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

CREATE INDEX idx_billing_prior_auth_patient_id ON billing_prior_authorizations(patient_id);
CREATE INDEX idx_billing_prior_auth_encounter_id ON billing_prior_authorizations(encounter_id);
CREATE INDEX idx_billing_prior_auth_org_id ON billing_prior_authorizations(org_id);
CREATE INDEX idx_billing_prior_auth_status ON billing_prior_authorizations(status);
CREATE INDEX idx_billing_prior_auth_valid_to ON billing_prior_authorizations(valid_to);

-- =====================================================
-- CLAIMS
-- =====================================================
CREATE TABLE IF NOT EXISTS billing_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_number TEXT UNIQUE NOT NULL, -- Internal claim number
  claim_md_id TEXT UNIQUE, -- Claim.MD claim ID
  control_number TEXT, -- Payer control number (ICN)
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  patient_id TEXT NOT NULL, -- FHIR Patient ID
  encounter_id TEXT, -- FHIR Encounter ID
  payer_id UUID NOT NULL REFERENCES billing_payers(id) ON DELETE RESTRICT,
  auth_id UUID REFERENCES billing_prior_authorizations(id) ON DELETE SET NULL,
  auth_number TEXT, -- Denormalized for quick access

  -- Claim header
  claim_type TEXT NOT NULL CHECK (claim_type IN ('professional', 'institutional')), -- 837P or 837I
  billing_provider_npi TEXT NOT NULL,
  rendering_provider_npi TEXT,
  service_location_npi TEXT,
  subscriber_member_id TEXT NOT NULL,
  patient_account_number TEXT,

  -- Financial
  total_charge DECIMAL(10,2) NOT NULL,
  total_allowed DECIMAL(10,2),
  total_paid DECIMAL(10,2),
  total_adjustment DECIMAL(10,2),
  patient_responsibility DECIMAL(10,2),

  -- Dates
  service_date_from DATE NOT NULL,
  service_date_to DATE NOT NULL,
  admission_date DATE,
  discharge_date DATE,
  statement_from_date DATE,
  statement_to_date DATE,

  -- Status
  status TEXT NOT NULL CHECK (status IN ('draft', 'validated', 'submitted', 'accepted', 'rejected', 'paid', 'denied', 'appealed', 'cancelled')),
  submission_date TIMESTAMP,
  accepted_date TIMESTAMP,
  paid_date TIMESTAMP,

  -- Validation & Errors
  validation_errors JSONB,
  rejection_reason TEXT,
  denial_reason TEXT,

  -- Payloads
  claim_payload JSONB NOT NULL, -- 837 claim data
  response_payload JSONB, -- Claim.MD/payer response

  -- Metadata
  created_by UUID REFERENCES users(id),
  submitted_by UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

CREATE INDEX idx_billing_claims_claim_number ON billing_claims(claim_number);
CREATE INDEX idx_billing_claims_claim_md_id ON billing_claims(claim_md_id);
CREATE INDEX idx_billing_claims_patient_id ON billing_claims(patient_id);
CREATE INDEX idx_billing_claims_encounter_id ON billing_claims(encounter_id);
CREATE INDEX idx_billing_claims_org_id ON billing_claims(org_id);
CREATE INDEX idx_billing_claims_payer_id ON billing_claims(payer_id);
CREATE INDEX idx_billing_claims_status ON billing_claims(status);
CREATE INDEX idx_billing_claims_service_date ON billing_claims(service_date_from, service_date_to);
CREATE INDEX idx_billing_claims_submission_date ON billing_claims(submission_date DESC);

-- =====================================================
-- CLAIM LINE ITEMS
-- =====================================================
CREATE TABLE IF NOT EXISTS billing_claim_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID NOT NULL REFERENCES billing_claims(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,

  -- Service details
  service_date DATE NOT NULL,
  place_of_service TEXT,
  cpt_code TEXT NOT NULL,
  modifiers TEXT[], -- Array of modifier codes
  icd_codes TEXT[] NOT NULL, -- Array of diagnosis codes
  units INTEGER NOT NULL DEFAULT 1,

  -- Financial
  charge_amount DECIMAL(10,2) NOT NULL,
  allowed_amount DECIMAL(10,2),
  paid_amount DECIMAL(10,2),
  adjustment_amount DECIMAL(10,2),
  patient_responsibility DECIMAL(10,2),

  -- Status
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'denied', 'paid', 'adjusted')),
  denial_reason TEXT,
  adjustment_codes TEXT[], -- CARC codes
  remark_codes TEXT[], -- RARC codes

  -- Provider
  rendering_provider_npi TEXT,

  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(claim_id, line_number)
);

CREATE INDEX idx_billing_claim_lines_claim_id ON billing_claim_lines(claim_id);
CREATE INDEX idx_billing_claim_lines_cpt_code ON billing_claim_lines(cpt_code);
CREATE INDEX idx_billing_claim_lines_service_date ON billing_claim_lines(service_date);

-- =====================================================
-- REMITTANCE (ERA - Electronic Remittance Advice)
-- =====================================================
CREATE TABLE IF NOT EXISTS billing_remittance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  remittance_number TEXT UNIQUE NOT NULL, -- Check/EFT number
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  payer_id UUID NOT NULL REFERENCES billing_payers(id) ON DELETE RESTRICT,

  -- Payment details
  payment_method TEXT CHECK (payment_method IN ('check', 'eft', 'credit_card', 'other')),
  payment_amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,

  -- ERA file
  era_file_id TEXT, -- Claim.MD file ID
  era_content JSONB, -- Parsed 835 data

  -- Status
  status TEXT NOT NULL CHECK (status IN ('received', 'posted', 'reconciled', 'disputed')),
  posted_at TIMESTAMP,
  posted_by UUID REFERENCES users(id),
  reconciled_at TIMESTAMP,
  reconciled_by UUID REFERENCES users(id),

  -- Metadata
  received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

CREATE INDEX idx_billing_remittance_org_id ON billing_remittance(org_id);
CREATE INDEX idx_billing_remittance_payer_id ON billing_remittance(payer_id);
CREATE INDEX idx_billing_remittance_status ON billing_remittance(status);
CREATE INDEX idx_billing_remittance_payment_date ON billing_remittance(payment_date DESC);

-- =====================================================
-- REMITTANCE LINE ITEMS (Maps to Claim Lines)
-- =====================================================
CREATE TABLE IF NOT EXISTS billing_remittance_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  remittance_id UUID NOT NULL REFERENCES billing_remittance(id) ON DELETE CASCADE,
  claim_id UUID NOT NULL REFERENCES billing_claims(id) ON DELETE RESTRICT,
  claim_line_id UUID REFERENCES billing_claim_lines(id) ON DELETE SET NULL,

  -- Amounts
  billed_amount DECIMAL(10,2) NOT NULL,
  allowed_amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) NOT NULL,
  adjustment_amount DECIMAL(10,2) NOT NULL,
  patient_responsibility DECIMAL(10,2),

  -- Adjustment details
  adjustment_codes JSONB, -- Array of {code, amount, group_code}
  remark_codes TEXT[],

  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_billing_remittance_lines_remittance_id ON billing_remittance_lines(remittance_id);
CREATE INDEX idx_billing_remittance_lines_claim_id ON billing_remittance_lines(claim_id);

-- =====================================================
-- PAYMENT LEDGER (Accounting Journal)
-- =====================================================
CREATE TABLE IF NOT EXISTS billing_payment_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL, -- FHIR Patient ID
  claim_id UUID REFERENCES billing_claims(id) ON DELETE SET NULL,
  remittance_id UUID REFERENCES billing_remittance(id) ON DELETE SET NULL,

  -- Transaction details
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'adjustment', 'refund', 'charge', 'transfer')),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(10,2) NOT NULL,
  balance DECIMAL(10,2), -- Running balance

  -- Payer
  payer_type TEXT CHECK (payer_type IN ('insurance', 'patient', 'other')),
  payer_id UUID REFERENCES billing_payers(id) ON DELETE SET NULL,

  -- Description
  description TEXT,
  notes TEXT,

  -- Posting
  posted_by UUID REFERENCES users(id),
  posted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Metadata
  metadata JSONB
);

CREATE INDEX idx_billing_payment_ledger_org_id ON billing_payment_ledger(org_id);
CREATE INDEX idx_billing_payment_ledger_patient_id ON billing_payment_ledger(patient_id);
CREATE INDEX idx_billing_payment_ledger_claim_id ON billing_payment_ledger(claim_id);
CREATE INDEX idx_billing_payment_ledger_remittance_id ON billing_payment_ledger(remittance_id);
CREATE INDEX idx_billing_payment_ledger_transaction_date ON billing_payment_ledger(transaction_date DESC);

-- =====================================================
-- CLAIM STATUS HISTORY (Audit Trail)
-- =====================================================
CREATE TABLE IF NOT EXISTS billing_claim_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID NOT NULL REFERENCES billing_claims(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reason TEXT,
  metadata JSONB
);

CREATE INDEX idx_billing_claim_status_history_claim_id ON billing_claim_status_history(claim_id);
CREATE INDEX idx_billing_claim_status_history_changed_at ON billing_claim_status_history(changed_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE TRIGGER update_billing_tenant_settings_updated_at BEFORE UPDATE ON billing_tenant_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_cpt_codes_updated_at BEFORE UPDATE ON billing_cpt_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_icd_codes_updated_at BEFORE UPDATE ON billing_icd_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_modifiers_updated_at BEFORE UPDATE ON billing_modifiers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_payers_updated_at BEFORE UPDATE ON billing_payers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_fee_schedules_updated_at BEFORE UPDATE ON billing_fee_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_prior_authorizations_updated_at BEFORE UPDATE ON billing_prior_authorizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_claims_updated_at BEFORE UPDATE ON billing_claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_claim_lines_updated_at BEFORE UPDATE ON billing_claim_lines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-log claim status changes
CREATE OR REPLACE FUNCTION log_claim_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO billing_claim_status_history (claim_id, old_status, new_status, changed_at)
    VALUES (NEW.id, OLD.status, NEW.status, CURRENT_TIMESTAMP);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_claim_status_change
  AFTER UPDATE ON billing_claims
  FOR EACH ROW
  EXECUTE FUNCTION log_claim_status_change();

-- =====================================================
-- VIEWS
-- =====================================================

-- Claims with financial summary
CREATE OR REPLACE VIEW v_billing_claims_summary AS
SELECT
  c.id,
  c.claim_number,
  c.claim_md_id,
  c.org_id,
  o.name AS org_name,
  c.patient_id,
  c.payer_id,
  p.name AS payer_name,
  c.status,
  c.service_date_from,
  c.service_date_to,
  c.total_charge,
  c.total_paid,
  c.total_adjustment,
  c.patient_responsibility,
  c.submission_date,
  c.paid_date,
  CASE
    WHEN c.status = 'paid' THEN 'Paid'
    WHEN c.status IN ('rejected', 'denied') THEN 'Denied'
    WHEN c.status = 'submitted' THEN 'Pending'
    ELSE 'Draft'
  END AS status_group,
  c.created_at,
  c.updated_at
FROM billing_claims c
JOIN organizations o ON c.org_id = o.id
LEFT JOIN billing_payers p ON c.payer_id = p.id;

-- Pending prior authorizations
CREATE OR REPLACE VIEW v_billing_pending_prior_auths AS
SELECT
  pa.id,
  pa.auth_number,
  pa.org_id,
  o.name AS org_name,
  pa.patient_id,
  pa.payer_id,
  p.name AS payer_name,
  pa.status,
  pa.cpt_codes,
  pa.icd_codes,
  pa.requested_date,
  pa.valid_from,
  pa.valid_to,
  pa.created_at
FROM billing_prior_authorizations pa
JOIN organizations o ON pa.org_id = o.id
LEFT JOIN billing_payers p ON pa.payer_id = p.id
WHERE pa.status IN ('pending', 'approved')
  AND (pa.valid_to IS NULL OR pa.valid_to >= CURRENT_DATE);

-- Unpaid claims
CREATE OR REPLACE VIEW v_billing_unpaid_claims AS
SELECT
  c.id,
  c.claim_number,
  c.org_id,
  c.patient_id,
  p.name AS payer_name,
  c.total_charge,
  c.total_paid,
  (c.total_charge - COALESCE(c.total_paid, 0)) AS balance,
  c.service_date_from,
  c.submission_date,
  CURRENT_DATE - c.submission_date AS days_outstanding
FROM billing_claims c
LEFT JOIN billing_payers p ON c.payer_id = p.id
WHERE c.status NOT IN ('paid', 'cancelled', 'draft')
  AND (c.total_charge - COALESCE(c.total_paid, 0)) > 0;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE billing_tenant_settings IS 'Claim.MD API credentials per organization';
COMMENT ON TABLE billing_cpt_codes IS 'Current Procedural Terminology codes (AMA)';
COMMENT ON TABLE billing_icd_codes IS 'International Classification of Diseases codes';
COMMENT ON TABLE billing_modifiers IS 'CPT/HCPCS modifiers';
COMMENT ON TABLE billing_payers IS 'Insurance companies and payers';
COMMENT ON TABLE billing_fee_schedules IS 'CPT fee schedules per payer/org';
COMMENT ON TABLE billing_eligibility_history IS 'Insurance eligibility verification history';
COMMENT ON TABLE billing_prior_authorizations IS 'Prior authorization requests and approvals';
COMMENT ON TABLE billing_claims IS 'Claims (837P/837I) submitted to payers';
COMMENT ON TABLE billing_claim_lines IS 'Line items for each claim';
COMMENT ON TABLE billing_remittance IS 'Electronic Remittance Advice (835) from payers';
COMMENT ON TABLE billing_remittance_lines IS 'Remittance line items mapping to claims';
COMMENT ON TABLE billing_payment_ledger IS 'Accounting journal for all payments';
COMMENT ON TABLE billing_claim_status_history IS 'Audit trail of claim status changes';
