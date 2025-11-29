const { Pool } = require('pg');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sql = `-- Migration: Create fhir_patients table
-- Description: FHIR-compliant patients table for managing patient demographics and identifiers
-- References FHIR Patient resource: https://www.hl7.org/fhir/patient.html

CREATE TABLE IF NOT EXISTS fhir_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Organization context
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- FHIR Resource
  resource JSONB NOT NULL,

  -- Extracted fields for querying (from resource)
  active BOOLEAN DEFAULT TRUE,
  
  -- Name fields (from name[0])
  family_name VARCHAR(255),
  given_name VARCHAR(255),
  full_name TEXT, -- Concatenated full name for search
  
  -- Demographics
  gender VARCHAR(20), -- male, female, other, unknown
  birth_date DATE,
  deceased BOOLEAN DEFAULT FALSE,
  deceased_date_time TIMESTAMPTZ,
  
  -- Contact information
  phone VARCHAR(50),
  email VARCHAR(255),
  
  -- Address (from address[0])
  address_line TEXT,
  address_city VARCHAR(100),
  address_state VARCHAR(100),
  address_postal_code VARCHAR(20),
  address_country VARCHAR(100),
  
  -- Identifiers (common ones extracted)
  mrn VARCHAR(100), -- Medical Record Number
  ssn VARCHAR(20), -- Social Security Number (encrypted/hashed in production)
  national_id VARCHAR(50), -- National ID (Aadhaar, etc.)
  
  -- Communication
  preferred_language VARCHAR(10),
  
  -- Care management
  general_practitioner_id UUID, -- Reference to practitioner
  managing_organization_id UUID REFERENCES organizations(id),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT valid_gender CHECK (gender IN ('male', 'female', 'other', 'unknown'))
);

-- Create indexes for performance
CREATE INDEX idx_fhir_patients_org ON fhir_patients(org_id);
CREATE INDEX idx_fhir_patients_active ON fhir_patients(org_id, active);
CREATE INDEX idx_fhir_patients_family_name ON fhir_patients(org_id, family_name);
CREATE INDEX idx_fhir_patients_given_name ON fhir_patients(org_id, given_name);
CREATE INDEX idx_fhir_patients_full_name ON fhir_patients USING gin(to_tsvector('english', full_name));
CREATE INDEX idx_fhir_patients_birth_date ON fhir_patients(birth_date);
CREATE INDEX idx_fhir_patients_gender ON fhir_patients(gender);
CREATE INDEX idx_fhir_patients_mrn ON fhir_patients(org_id, mrn) WHERE mrn IS NOT NULL;
CREATE INDEX idx_fhir_patients_ssn ON fhir_patients(ssn) WHERE ssn IS NOT NULL;
CREATE INDEX idx_fhir_patients_national_id ON fhir_patients(org_id, national_id) WHERE national_id IS NOT NULL;
CREATE INDEX idx_fhir_patients_phone ON fhir_patients(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_fhir_patients_email ON fhir_patients(email) WHERE email IS NOT NULL;
CREATE INDEX idx_fhir_patients_created_at ON fhir_patients(created_at);
CREATE INDEX idx_fhir_patients_resource_gin ON fhir_patients USING gin(resource);

-- Create composite index for common patient searches
CREATE INDEX idx_fhir_patients_search ON fhir_patients(org_id, active, family_name, given_name);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_fhir_patients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_fhir_patients_updated_at
  BEFORE UPDATE ON fhir_patients
  FOR EACH ROW
  EXECUTE FUNCTION update_fhir_patients_updated_at();

-- Create function to automatically populate full_name from given_name and family_name
CREATE OR REPLACE FUNCTION update_fhir_patients_full_name()
RETURNS TRIGGER AS $$
BEGIN
  NEW.full_name := TRIM(CONCAT(COALESCE(NEW.given_name, ''), ' ', COALESCE(NEW.family_name, '')));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update full_name
CREATE TRIGGER trigger_fhir_patients_full_name
  BEFORE INSERT OR UPDATE OF given_name, family_name ON fhir_patients
  FOR EACH ROW
  EXECUTE FUNCTION update_fhir_patients_full_name();

-- Add comments for documentation
COMMENT ON TABLE fhir_patients IS 'FHIR Patient resources - stores patient demographics and identifiers';
COMMENT ON COLUMN fhir_patients.resource IS 'Full FHIR Patient resource in JSONB format';
COMMENT ON COLUMN fhir_patients.active IS 'Whether the patient record is active';
COMMENT ON COLUMN fhir_patients.family_name IS 'Last name/surname extracted from resource';
COMMENT ON COLUMN fhir_patients.given_name IS 'First name(s) extracted from resource';
COMMENT ON COLUMN fhir_patients.full_name IS 'Concatenated full name for full-text search';
COMMENT ON COLUMN fhir_patients.mrn IS 'Medical Record Number - organization-specific patient identifier';
COMMENT ON COLUMN fhir_patients.ssn IS 'Social Security Number or equivalent national identifier';
COMMENT ON COLUMN fhir_patients.national_id IS 'National ID (Aadhaar, etc.) for patient identification';
COMMENT ON COLUMN fhir_patients.deceased IS 'Boolean flag indicating if patient is deceased';
COMMENT ON COLUMN fhir_patients.deceased_date_time IS 'Date/time of death if deceased';
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
      console.log('🔄 Executing 20240101000017-create_fhir_patients_table...');
      await pool.query(sql);
      console.log('✅ 20240101000017-create_fhir_patients_table completed');
    } catch (error) {
      console.error('❌ 20240101000017-create_fhir_patients_table failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback not implemented
    console.log('⚠️  Rollback not implemented for 20240101000017-create_fhir_patients_table.js');
  }
};
