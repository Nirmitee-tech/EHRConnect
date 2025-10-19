-- Data Mapper Tables for Integration Field Mapping
-- Stores field mapping configurations for data transformation between systems

-- Main data mapper configurations table
CREATE TABLE IF NOT EXISTS integration_data_mappers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    source_system VARCHAR(100) NOT NULL, -- e.g., 'ehr', 'custom', 'api'
    target_system VARCHAR(100) NOT NULL, -- e.g., 'hl7', 'fhir', 'custom'
    message_type VARCHAR(50), -- HL7: ADT, ORM, ORU, etc. or FHIR resource type
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    UNIQUE(org_id, integration_id, name)
);

-- Individual field mappings within a mapper configuration
CREATE TABLE IF NOT EXISTS integration_field_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mapper_id UUID NOT NULL REFERENCES integration_data_mappers(id) ON DELETE CASCADE,
    source_path VARCHAR(500) NOT NULL, -- JSONPath or dot notation: e.g., 'patient.name.family'
    target_path VARCHAR(500) NOT NULL, -- HL7 field: e.g., 'PID-5.1' or FHIR path: 'Patient.name[0].family'
    transform_type VARCHAR(50), -- uppercase, lowercase, date, datetime, phone, concat, static, lookup, custom
    transform_config JSONB DEFAULT '{}', -- Configuration for the transform
    required BOOLEAN DEFAULT false,
    default_value TEXT, -- Default value if source is null/empty
    validation_regex VARCHAR(500), -- Regex pattern for validation
    sort_order INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lookup tables for value mapping (e.g., gender codes, status codes)
CREATE TABLE IF NOT EXISTS integration_value_lookups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mapper_id UUID NOT NULL REFERENCES integration_data_mappers(id) ON DELETE CASCADE,
    field_mapping_id UUID REFERENCES integration_field_mappings(id) ON DELETE CASCADE,
    lookup_name VARCHAR(255) NOT NULL, -- e.g., 'gender_codes', 'status_codes'
    source_value VARCHAR(255) NOT NULL,
    target_value VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mapper_id, lookup_name, source_value)
);

-- Test cases for data mapper validation
CREATE TABLE IF NOT EXISTS integration_mapper_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mapper_id UUID NOT NULL REFERENCES integration_data_mappers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sample_input JSONB NOT NULL, -- Sample source data
    expected_output JSONB, -- Expected mapped output
    last_run_at TIMESTAMP,
    last_run_result VARCHAR(20), -- success, failed, error
    last_run_output JSONB,
    last_run_errors TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_data_mappers_org_integration ON integration_data_mappers(org_id, integration_id);
CREATE INDEX IF NOT EXISTS idx_data_mappers_active ON integration_data_mappers(active);
CREATE INDEX IF NOT EXISTS idx_field_mappings_mapper ON integration_field_mappings(mapper_id);
CREATE INDEX IF NOT EXISTS idx_field_mappings_sort ON integration_field_mappings(mapper_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_value_lookups_mapper ON integration_value_lookups(mapper_id);
CREATE INDEX IF NOT EXISTS idx_value_lookups_field ON integration_value_lookups(field_mapping_id);
CREATE INDEX IF NOT EXISTS idx_mapper_tests_mapper ON integration_mapper_tests(mapper_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_integration_mapper_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER integration_data_mappers_updated_at
    BEFORE UPDATE ON integration_data_mappers
    FOR EACH ROW
    EXECUTE FUNCTION update_integration_mapper_updated_at();

CREATE TRIGGER integration_field_mappings_updated_at
    BEFORE UPDATE ON integration_field_mappings
    FOR EACH ROW
    EXECUTE FUNCTION update_integration_mapper_updated_at();

CREATE TRIGGER integration_mapper_tests_updated_at
    BEFORE UPDATE ON integration_mapper_tests
    FOR EACH ROW
    EXECUTE FUNCTION update_integration_mapper_updated_at();

-- Insert sample data mapper for demo
-- This will be used as a template for HL7 ADT message mapping
INSERT INTO integration_data_mappers (
    id,
    org_id,
    integration_id,
    name,
    description,
    source_system,
    target_system,
    message_type,
    active
)
SELECT
    gen_random_uuid(),
    '2211a660-88f0-4fba-9961-1a43ef3b42d5'::uuid, -- Sample org_id
    i.id,
    'Patient Demographics to HL7 ADT',
    'Maps patient demographics from EHR format to HL7 ADT^A01 message',
    'ehr',
    'hl7',
    'ADT^A01',
    true
FROM integrations i
WHERE i.vendor_id = 'custom-hl7'
AND i.org_id = '2211a660-88f0-4fba-9961-1a43ef3b42d5'::uuid
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert sample field mappings
INSERT INTO integration_field_mappings (
    mapper_id,
    source_path,
    target_path,
    transform_type,
    transform_config,
    required,
    sort_order,
    notes
)
SELECT
    dm.id,
    'patient.mrn',
    'PID-3.1',
    'uppercase',
    '{}',
    true,
    1,
    'Patient Medical Record Number'
FROM integration_data_mappers dm
WHERE dm.name = 'Patient Demographics to HL7 ADT'
ON CONFLICT DO NOTHING;

INSERT INTO integration_field_mappings (
    mapper_id,
    source_path,
    target_path,
    transform_type,
    transform_config,
    required,
    sort_order,
    notes
)
SELECT
    dm.id,
    'patient.name.family',
    'PID-5.1',
    'uppercase',
    '{}',
    true,
    2,
    'Patient Family Name (Last Name)'
FROM integration_data_mappers dm
WHERE dm.name = 'Patient Demographics to HL7 ADT'
ON CONFLICT DO NOTHING;

INSERT INTO integration_field_mappings (
    mapper_id,
    source_path,
    target_path,
    transform_type,
    transform_config,
    required,
    sort_order,
    notes
)
SELECT
    dm.id,
    'patient.name.given',
    'PID-5.2',
    NULL,
    '{}',
    true,
    3,
    'Patient Given Name (First Name)'
FROM integration_data_mappers dm
WHERE dm.name = 'Patient Demographics to HL7 ADT'
ON CONFLICT DO NOTHING;

INSERT INTO integration_field_mappings (
    mapper_id,
    source_path,
    target_path,
    transform_type,
    transform_config,
    required,
    sort_order,
    notes
)
SELECT
    dm.id,
    'patient.birthDate',
    'PID-7',
    'date',
    '{"format": "YYYYMMDD"}',
    true,
    4,
    'Patient Date of Birth'
FROM integration_data_mappers dm
WHERE dm.name = 'Patient Demographics to HL7 ADT'
ON CONFLICT DO NOTHING;

INSERT INTO integration_field_mappings (
    mapper_id,
    source_path,
    target_path,
    transform_type,
    transform_config,
    required,
    sort_order,
    notes
)
SELECT
    dm.id,
    'patient.gender',
    'PID-8',
    'lookup',
    '{"lookupName": "gender_codes"}',
    true,
    5,
    'Patient Gender'
FROM integration_data_mappers dm
WHERE dm.name = 'Patient Demographics to HL7 ADT'
ON CONFLICT DO NOTHING;

-- Insert gender code lookups
INSERT INTO integration_value_lookups (mapper_id, lookup_name, source_value, target_value, description)
SELECT dm.id, 'gender_codes', 'male', 'M', 'Male'
FROM integration_data_mappers dm WHERE dm.name = 'Patient Demographics to HL7 ADT'
ON CONFLICT DO NOTHING;

INSERT INTO integration_value_lookups (mapper_id, lookup_name, source_value, target_value, description)
SELECT dm.id, 'gender_codes', 'female', 'F', 'Female'
FROM integration_data_mappers dm WHERE dm.name = 'Patient Demographics to HL7 ADT'
ON CONFLICT DO NOTHING;

INSERT INTO integration_value_lookups (mapper_id, lookup_name, source_value, target_value, description)
SELECT dm.id, 'gender_codes', 'other', 'O', 'Other'
FROM integration_data_mappers dm WHERE dm.name = 'Patient Demographics to HL7 ADT'
ON CONFLICT DO NOTHING;

INSERT INTO integration_value_lookups (mapper_id, lookup_name, source_value, target_value, description)
SELECT dm.id, 'gender_codes', 'unknown', 'U', 'Unknown'
FROM integration_data_mappers dm WHERE dm.name = 'Patient Demographics to HL7 ADT'
ON CONFLICT DO NOTHING;
