const { Pool } = require('pg');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `-- Country-Specific Configuration System
-- Enables country-aware features and components per organization
-- Similar to specialty pack system but for country-specific requirements
-- Version: 1.0

-- =====================================================
-- ENABLE UUID EXTENSION
-- Required for uuid_generate_v4() function
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- COUNTRY PACKS TABLE
-- Registry of available country-specific feature packs
-- =====================================================
CREATE TABLE IF NOT EXISTS country_packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Pack identification
  country_code TEXT NOT NULL UNIQUE, -- ISO 3166-1 alpha-2: 'IN', 'US', 'AE', etc.
  country_name TEXT NOT NULL, -- 'India', 'United States', 'United Arab Emirates'
  region TEXT, -- 'Asia', 'North America', 'Middle East'

  -- Pack details
  pack_slug TEXT NOT NULL UNIQUE, -- e.g., 'india', 'usa', 'uae'
  pack_version TEXT NOT NULL DEFAULT '1.0.0',

  -- Regulatory & Compliance
  regulatory_body TEXT, -- e.g., 'NHA (National Health Authority)', 'FDA', 'MOH'
  data_residency_required BOOLEAN DEFAULT FALSE,
  gdpr_compliant BOOLEAN DEFAULT FALSE,
  hipaa_compliant BOOLEAN DEFAULT FALSE,

  -- Localization
  default_language TEXT NOT NULL DEFAULT 'en',
  supported_languages TEXT[] DEFAULT ARRAY['en'],
  default_currency TEXT NOT NULL DEFAULT 'USD', -- ISO 4217
  default_timezone TEXT NOT NULL DEFAULT 'UTC',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  number_format TEXT DEFAULT 'en-US',

  -- Features & Modules
  features JSONB DEFAULT '{}', -- Country-specific features enabled
  modules JSONB DEFAULT '{}', -- Module configurations

  -- Status
  active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_country_packs_country_code ON country_packs(country_code);
CREATE INDEX IF NOT EXISTS idx_country_packs_pack_slug ON country_packs(pack_slug);
CREATE INDEX IF NOT EXISTS idx_country_packs_active ON country_packs(active);

COMMENT ON TABLE country_packs IS 'Registry of country-specific feature packs with regulatory and localization settings';
COMMENT ON COLUMN country_packs.country_code IS 'ISO 3166-1 alpha-2 country code';
COMMENT ON COLUMN country_packs.features IS 'JSON object defining available country-specific features';
COMMENT ON COLUMN country_packs.modules IS 'JSON object with module configurations and integrations';

-- =====================================================
-- ORG COUNTRY SETTINGS
-- Stores which country pack is enabled for each organization
-- =====================================================
CREATE TABLE IF NOT EXISTS org_country_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Country pack reference
  country_code TEXT NOT NULL, -- References country_packs.country_code
  pack_slug TEXT NOT NULL, -- References country_packs.pack_slug
  pack_version TEXT NOT NULL DEFAULT '1.0.0',

  -- Enablement
  enabled BOOLEAN NOT NULL DEFAULT TRUE,

  -- Scope (typically org-wide, but can be location-specific)
  scope TEXT NOT NULL DEFAULT 'org' CHECK (scope IN ('org', 'location')),
  scope_ref_id UUID, -- References locations.id if scope='location', NULL if scope='org'

  -- Country-specific overrides
  overrides JSONB DEFAULT '{}', -- Custom configurations, feature flags, etc.

  -- Localization overrides
  language_override TEXT,
  currency_override TEXT,
  timezone_override TEXT,

  -- Regulatory compliance
  compliance_settings JSONB DEFAULT '{}', -- Consent forms, data retention, etc.

  -- Audit fields
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Ensure one country setting per org (or location if scope='location')
  UNIQUE(org_id, scope, scope_ref_id)
);

CREATE INDEX IF NOT EXISTS idx_org_country_settings_org_id ON org_country_settings(org_id);
CREATE INDEX IF NOT EXISTS idx_org_country_settings_country_code ON org_country_settings(country_code);
CREATE INDEX IF NOT EXISTS idx_org_country_settings_enabled ON org_country_settings(enabled);
CREATE INDEX IF NOT EXISTS idx_org_country_settings_scope ON org_country_settings(org_id, scope);

COMMENT ON TABLE org_country_settings IS 'Stores enabled country pack per organization with localization and compliance overrides';
COMMENT ON COLUMN org_country_settings.country_code IS 'ISO 3166-1 alpha-2 country code';
COMMENT ON COLUMN org_country_settings.scope IS 'Level at which pack is enabled: org (whole organization) or location (specific facility)';
COMMENT ON COLUMN org_country_settings.overrides IS 'JSON object with country-specific overrides (feature flags, integrations)';
COMMENT ON COLUMN org_country_settings.compliance_settings IS 'Regulatory compliance configurations (consent, data retention, reporting)';

-- =====================================================
-- COUNTRY PACK AUDITS
-- Immutable audit trail for all country pack changes
-- =====================================================
CREATE TABLE IF NOT EXISTS country_pack_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- What changed
  country_code TEXT NOT NULL,
  pack_slug TEXT NOT NULL,
  pack_version TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('enabled', 'disabled', 'updated', 'reconfigured')),

  -- Who and when
  actor_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Context
  scope TEXT,
  scope_ref_id UUID,

  -- Additional metadata
  metadata JSONB DEFAULT '{}', -- Before/after diff, reason, etc.

  -- Immutable: no updates or deletes allowed
  CHECK (created_at IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_country_pack_audits_org_id ON country_pack_audits(org_id);
CREATE INDEX IF NOT EXISTS idx_country_pack_audits_country_code ON country_pack_audits(country_code);
CREATE INDEX IF NOT EXISTS idx_country_pack_audits_actor_id ON country_pack_audits(actor_id);
CREATE INDEX IF NOT EXISTS idx_country_pack_audits_created_at ON country_pack_audits(created_at DESC);

COMMENT ON TABLE country_pack_audits IS 'Immutable audit log of all country pack configuration changes';
COMMENT ON COLUMN country_pack_audits.action IS 'Type of change: enabled, disabled, updated, or reconfigured';
COMMENT ON COLUMN country_pack_audits.metadata IS 'Additional context: diff, reason, previous values, etc.';

-- =====================================================
-- COUNTRY SPECIFIC MODULES
-- Defines country-specific modules and integrations
-- Examples: ABHA for India, VA integration for USA, DHA for UAE
-- =====================================================
CREATE TABLE IF NOT EXISTS country_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Module identification
  country_code TEXT NOT NULL, -- References country_packs.country_code
  module_code TEXT NOT NULL, -- e.g., 'abha-m1', 'abha-m2', 'abha-m3', 'va-integration'
  module_name TEXT NOT NULL,
  module_type TEXT NOT NULL CHECK (module_type IN ('identity', 'insurance', 'integration', 'compliance', 'billing', 'reporting')),

  -- Module details
  description TEXT,
  version TEXT NOT NULL DEFAULT '1.0.0',

  -- Configuration
  config_schema JSONB, -- JSON Schema for module configuration
  default_config JSONB DEFAULT '{}', -- Default configuration values

  -- Requirements
  required_integrations TEXT[], -- External systems required
  required_permissions TEXT[], -- Permissions needed to use this module

  -- UI Components
  component_path TEXT, -- Path to frontend component
  settings_component_path TEXT, -- Path to settings UI component

  -- Status
  active BOOLEAN NOT NULL DEFAULT TRUE,
  beta BOOLEAN NOT NULL DEFAULT FALSE,

  -- Metadata
  documentation_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(country_code, module_code)
);

CREATE INDEX IF NOT EXISTS idx_country_modules_country_code ON country_modules(country_code);
CREATE INDEX IF NOT EXISTS idx_country_modules_module_type ON country_modules(module_type);
CREATE INDEX IF NOT EXISTS idx_country_modules_active ON country_modules(active);

COMMENT ON TABLE country_modules IS 'Defines country-specific modules like ABHA for India, VA for USA';
COMMENT ON COLUMN country_modules.module_code IS 'Unique code for the module (abha-m1, abha-m2, va-integration)';
COMMENT ON COLUMN country_modules.config_schema IS 'JSON Schema defining configuration options for this module';
COMMENT ON COLUMN country_modules.component_path IS 'Path to React component implementing this module';

-- =====================================================
-- ORG ENABLED MODULES
-- Tracks which country-specific modules are enabled per org
-- =====================================================
CREATE TABLE IF NOT EXISTS org_enabled_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Module reference
  country_code TEXT NOT NULL,
  module_code TEXT NOT NULL, -- References country_modules.module_code

  -- Enablement
  enabled BOOLEAN NOT NULL DEFAULT TRUE,

  -- Scope
  scope TEXT NOT NULL DEFAULT 'org' CHECK (scope IN ('org', 'location', 'department')),
  scope_ref_id UUID, -- References locations.id or departments.id

  -- Configuration
  config JSONB DEFAULT '{}', -- Module-specific configuration
  credentials JSONB DEFAULT '{}', -- Encrypted credentials for integrations

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'testing', 'disabled', 'error')),
  last_sync_at TIMESTAMP,
  last_error TEXT,

  -- Audit fields
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(org_id, module_code, scope, scope_ref_id)
);

CREATE INDEX IF NOT EXISTS idx_org_enabled_modules_org_id ON org_enabled_modules(org_id);
CREATE INDEX IF NOT EXISTS idx_org_enabled_modules_country_code ON org_enabled_modules(country_code);
CREATE INDEX IF NOT EXISTS idx_org_enabled_modules_module_code ON org_enabled_modules(module_code);
CREATE INDEX IF NOT EXISTS idx_org_enabled_modules_enabled ON org_enabled_modules(enabled);
CREATE INDEX IF NOT EXISTS idx_org_enabled_modules_status ON org_enabled_modules(status);

COMMENT ON TABLE org_enabled_modules IS 'Tracks enabled country-specific modules per organization';
COMMENT ON COLUMN org_enabled_modules.config IS 'Module configuration (API endpoints, preferences, etc.)';
COMMENT ON COLUMN org_enabled_modules.credentials IS 'Encrypted credentials for external integrations';
COMMENT ON COLUMN org_enabled_modules.status IS 'Module operational status';

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_country_packs_updated_at
  BEFORE UPDATE ON country_packs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_country_settings_updated_at
  BEFORE UPDATE ON org_country_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_country_modules_updated_at
  BEFORE UPDATE ON country_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_org_enabled_modules_updated_at
  BEFORE UPDATE ON org_enabled_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create audit entry on country pack settings change
CREATE OR REPLACE FUNCTION audit_country_pack_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO country_pack_audits (org_id, country_code, pack_slug, pack_version, action, actor_id, scope, scope_ref_id, metadata)
    VALUES (NEW.org_id, NEW.country_code, NEW.pack_slug, NEW.pack_version, 'enabled', NEW.created_by, NEW.scope, NEW.scope_ref_id,
            jsonb_build_object('enabled', NEW.enabled));
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.enabled != NEW.enabled THEN
      INSERT INTO country_pack_audits (org_id, country_code, pack_slug, pack_version, action, actor_id, scope, scope_ref_id, metadata)
      VALUES (NEW.org_id, NEW.country_code, NEW.pack_slug, NEW.pack_version,
              CASE WHEN NEW.enabled THEN 'enabled' ELSE 'disabled' END,
              NEW.updated_by, NEW.scope, NEW.scope_ref_id,
              jsonb_build_object('enabled_before', OLD.enabled, 'enabled_after', NEW.enabled));
    ELSE
      INSERT INTO country_pack_audits (org_id, country_code, pack_slug, pack_version, action, actor_id, scope, scope_ref_id, metadata)
      VALUES (NEW.org_id, NEW.country_code, NEW.pack_slug, NEW.pack_version, 'updated', NEW.updated_by, NEW.scope, NEW.scope_ref_id,
              jsonb_build_object('version_before', OLD.pack_version, 'version_after', NEW.pack_version));
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_org_country_settings_changes
  AFTER INSERT OR UPDATE ON org_country_settings
  FOR EACH ROW
  EXECUTE FUNCTION audit_country_pack_change();

-- =====================================================
-- SEED DEFAULT COUNTRY PACKS
-- =====================================================

-- India Country Pack
INSERT INTO country_packs (
  country_code, country_name, region, pack_slug, pack_version,
  regulatory_body, data_residency_required,
  default_language, supported_languages, default_currency, default_timezone,
  date_format, number_format,
  features, modules, active
) VALUES (
  'IN', 'India', 'Asia', 'india', '1.0.0',
  'National Health Authority (NHA)', true,
  'en', ARRAY['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu'], 'INR', 'Asia/Kolkata',
  'DD/MM/YYYY', 'en-IN',
  '{
    "abha": true,
    "ayushman_bharat": true,
    "cghs": true,
    "esic": true,
    "digital_health_records": true,
    "telemedicine": true
  }'::jsonb,
  '{
    "abha_m1": {"enabled": true, "description": "ABHA Number Generation"},
    "abha_m2": {"enabled": true, "description": "Health Record Linking"},
    "abha_m3": {"enabled": true, "description": "Consent Management"},
    "ayushman_claims": {"enabled": true, "description": "Ayushman Bharat Claims Processing"}
  }'::jsonb,
  true
) ON CONFLICT (country_code) DO NOTHING;

-- United States Country Pack
INSERT INTO country_packs (
  country_code, country_name, region, pack_slug, pack_version,
  regulatory_body, hipaa_compliant,
  default_language, supported_languages, default_currency, default_timezone,
  date_format, number_format,
  features, modules, active
) VALUES (
  'US', 'United States', 'North America', 'usa', '1.0.0',
  'FDA / HHS', true,
  'en', ARRAY['en', 'es'], 'USD', 'America/New_York',
  'MM/DD/YYYY', 'en-US',
  '{
    "hipaa_compliance": true,
    "meaningful_use": true,
    "icd10": true,
    "cpt_codes": true,
    "npi_integration": true,
    "va_integration": true,
    "medicare": true,
    "medicaid": true
  }'::jsonb,
  '{
    "npi_lookup": {"enabled": true, "description": "National Provider Identifier Lookup"},
    "va_integration": {"enabled": true, "description": "Veterans Affairs Integration"},
    "medicare_claims": {"enabled": true, "description": "Medicare Claims Processing"},
    "medicaid_claims": {"enabled": true, "description": "Medicaid Claims Processing"}
  }'::jsonb,
  true
) ON CONFLICT (country_code) DO NOTHING;

-- United Arab Emirates Country Pack
INSERT INTO country_packs (
  country_code, country_name, region, pack_slug, pack_version,
  regulatory_body, data_residency_required,
  default_language, supported_languages, default_currency, default_timezone,
  date_format, number_format,
  features, modules, active
) VALUES (
  'AE', 'United Arab Emirates', 'Middle East', 'uae', '1.0.0',
  'Dubai Health Authority (DHA) / Abu Dhabi DOH', true,
  'en', ARRAY['en', 'ar'], 'AED', 'Asia/Dubai',
  'DD/MM/YYYY', 'en-AE',
  '{
    "dha_compliance": true,
    "haad_compliance": true,
    "ehs_integration": true,
    "visa_medical": true,
    "insurance_portal": true
  }'::jsonb,
  '{
    "dha_reporting": {"enabled": true, "description": "Dubai Health Authority Reporting"},
    "haad_reporting": {"enabled": true, "description": "Abu Dhabi Health Department Reporting"},
    "ehs_integration": {"enabled": true, "description": "Emirates Health Services Integration"},
    "visa_medical": {"enabled": true, "description": "Visa Medical Examination Module"}
  }'::jsonb,
  true
) ON CONFLICT (country_code) DO NOTHING;

-- =====================================================
-- SEED INDIA-SPECIFIC MODULES (ABHA)
-- =====================================================

-- ABHA M1: Health ID Creation
INSERT INTO country_modules (
  country_code, module_code, module_name, module_type,
  description, version,
  config_schema, default_config,
  required_integrations, required_permissions,
  component_path, settings_component_path,
  active, beta, documentation_url
) VALUES (
  'IN', 'abha-m1', 'ABHA Number Generation (M1)', 'identity',
  'Create and verify ABHA (Ayushman Bharat Health Account) numbers for patients using Aadhaar or mobile OTP',
  '1.0.0',
  '{
    "type": "object",
    "properties": {
      "api_endpoint": {"type": "string", "default": "https://healthidsbx.abdm.gov.in"},
      "client_id": {"type": "string"},
      "client_secret": {"type": "string"},
      "mode": {"type": "string", "enum": ["sandbox", "production"], "default": "sandbox"}
    },
    "required": ["api_endpoint", "client_id", "client_secret"]
  }'::jsonb,
  '{
    "api_endpoint": "https://healthidsbx.abdm.gov.in",
    "mode": "sandbox"
  }'::jsonb,
  ARRAY['ABDM API', 'Aadhaar OTP Service'],
  ARRAY['patient:create_abha', 'patient:verify_abha'],
  '/features/countries/india/abha-m1/AbhaRegistration.tsx',
  '/features/countries/india/abha-m1/AbhaSettings.tsx',
  true, false, 'https://abdm.gov.in/abdm/M1'
) ON CONFLICT (country_code, module_code) DO NOTHING;

-- ABHA M2: Health Records Linking
INSERT INTO country_modules (
  country_code, module_code, module_name, module_type,
  description, version,
  config_schema, default_config,
  required_integrations, required_permissions,
  component_path, settings_component_path,
  active, beta, documentation_url
) VALUES (
  'IN', 'abha-m2', 'ABHA Health Records Linking (M2)', 'integration',
  'Link patient health records with their ABHA address and enable record sharing',
  '1.0.0',
  '{
    "type": "object",
    "properties": {
      "hip_id": {"type": "string", "description": "Health Information Provider ID"},
      "api_endpoint": {"type": "string", "default": "https://dev.abdm.gov.in/gateway"},
      "mode": {"type": "string", "enum": ["sandbox", "production"], "default": "sandbox"}
    },
    "required": ["hip_id", "api_endpoint"]
  }'::jsonb,
  '{
    "api_endpoint": "https://dev.abdm.gov.in/gateway",
    "mode": "sandbox"
  }'::jsonb,
  ARRAY['ABDM Gateway', 'Health Information Exchange'],
  ARRAY['records:link_abha', 'records:share_abha'],
  '/features/countries/india/abha-m2/HealthRecordLinking.tsx',
  '/features/countries/india/abha-m2/HipSettings.tsx',
  true, false, 'https://abdm.gov.in/abdm/M2'
) ON CONFLICT (country_code, module_code) DO NOTHING;

-- ABHA M3: Consent Management
INSERT INTO country_modules (
  country_code, module_code, module_name, module_type,
  description, version,
  config_schema, default_config,
  required_integrations, required_permissions,
  component_path, settings_component_path,
  active, beta, documentation_url
) VALUES (
  'IN', 'abha-m3', 'ABHA Consent Management (M3)', 'compliance',
  'Manage patient consent for health information sharing through ABDM consent framework',
  '1.0.0',
  '{
    "type": "object",
    "properties": {
      "cm_id": {"type": "string", "description": "Consent Manager ID"},
      "api_endpoint": {"type": "string", "default": "https://dev.abdm.gov.in/cm"},
      "auto_approve": {"type": "boolean", "default": false},
      "consent_validity_days": {"type": "integer", "default": 365}
    },
    "required": ["cm_id", "api_endpoint"]
  }'::jsonb,
  '{
    "api_endpoint": "https://dev.abdm.gov.in/cm",
    "auto_approve": false,
    "consent_validity_days": 365
  }'::jsonb,
  ARRAY['ABDM Consent Manager'],
  ARRAY['consent:create', 'consent:approve', 'consent:revoke'],
  '/features/countries/india/abha-m3/ConsentManagement.tsx',
  '/features/countries/india/abha-m3/ConsentSettings.tsx',
  true, false, 'https://abdm.gov.in/abdm/M3'
) ON CONFLICT (country_code, module_code) DO NOTHING;

-- =====================================================
-- PERMISSIONS
-- Grant appropriate permissions
-- =====================================================
-- These are examples - adjust based on your actual role structure
-- GRANT SELECT ON country_packs TO app_user;
-- GRANT SELECT ON org_country_settings TO app_user;
-- GRANT SELECT ON country_pack_audits TO app_user;
-- GRANT SELECT ON country_modules TO app_user;
-- GRANT SELECT ON org_enabled_modules TO app_user;
`;

    const config = queryInterface.sequelize.config;
    const pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
    });

    try {
      console.log('🔄 Executing 20240101000022-country_specific_system...');
      await pool.query(sql);
      console.log('✅ 20240101000022-country_specific_system completed');
    } catch (error) {
      console.error('❌ 20240101000022-country_specific_system failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback not implemented
    console.log('⚠️  Rollback not implemented for 20240101000022-country_specific_system.js');
  }
};
