-- Migration: Create fhir_encounters table
-- Description: FHIR-compliant encounters table for tracking patient-practitioner interactions
-- References FHIR Encounter resource: https://www.hl7.org/fhir/encounter.html

CREATE TABLE IF NOT EXISTS fhir_encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Organization context
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- FHIR Resource
  resource JSONB NOT NULL,

  -- Extracted fields for querying (from resource)
  status VARCHAR(50) NOT NULL, -- planned, arrived, triaged, in-progress, onleave, finished, cancelled
  class VARCHAR(50), -- inpatient, outpatient, ambulatory, emergency, virtual, etc.

  -- References
  patient_id UUID REFERENCES fhir_patients(id),
  practitioner_id UUID, -- Primary practitioner
  appointment_id UUID REFERENCES fhir_appointments(id),

  -- Period
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,

  -- Encounter type
  encounter_type VARCHAR(255),
  service_type VARCHAR(255),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT valid_encounter_status CHECK (status IN (
    'planned',
    'arrived',
    'triaged',
    'in-progress',
    'onleave',
    'finished',
    'cancelled',
    'entered-in-error',
    'unknown'
  ))
);

-- Create indexes for performance
CREATE INDEX idx_fhir_encounters_org ON fhir_encounters(org_id);
CREATE INDEX idx_fhir_encounters_patient ON fhir_encounters(patient_id);
CREATE INDEX idx_fhir_encounters_practitioner ON fhir_encounters(practitioner_id);
CREATE INDEX idx_fhir_encounters_appointment ON fhir_encounters(appointment_id);
CREATE INDEX idx_fhir_encounters_status ON fhir_encounters(status);
CREATE INDEX idx_fhir_encounters_period_start ON fhir_encounters(period_start);
CREATE INDEX idx_fhir_encounters_created_at ON fhir_encounters(created_at);
CREATE INDEX idx_fhir_encounters_resource_gin ON fhir_encounters USING gin(resource);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_fhir_encounters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_fhir_encounters_updated_at
  BEFORE UPDATE ON fhir_encounters
  FOR EACH ROW
  EXECUTE FUNCTION update_fhir_encounters_updated_at();

-- Add comments for documentation
COMMENT ON TABLE fhir_encounters IS 'FHIR Encounter resources - tracks all patient-practitioner interactions';
COMMENT ON COLUMN fhir_encounters.resource IS 'Full FHIR Encounter resource in JSONB format';
COMMENT ON COLUMN fhir_encounters.status IS 'Encounter status extracted from resource for quick filtering';
COMMENT ON COLUMN fhir_encounters.class IS 'Encounter class (inpatient, outpatient, virtual, etc.)';
