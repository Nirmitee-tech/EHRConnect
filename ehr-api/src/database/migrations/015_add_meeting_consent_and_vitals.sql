-- Migration: Add consent management and vitals capture for virtual meetings
-- Description: Adds tables for recording consent and capturing vitals during telehealth sessions

-- Create table for meeting consent records
CREATE TABLE IF NOT EXISTS virtual_meeting_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES virtual_meetings(id) ON DELETE CASCADE,

  -- Consent details
  participant_id UUID REFERENCES virtual_meeting_participants(id),
  patient_id VARCHAR(255) NOT NULL, -- FHIR Patient reference
  consent_type VARCHAR(100) NOT NULL, -- 'recording', 'vitals_capture', 'screen_sharing', 'data_storage'
  consent_status VARCHAR(50) NOT NULL, -- 'granted', 'denied', 'revoked', 'pending'

  -- Legal information
  consent_text TEXT NOT NULL, -- Full consent language shown to patient
  consent_version VARCHAR(50), -- Version of consent form
  ip_address VARCHAR(100), -- IP address when consent was given
  user_agent TEXT, -- Browser/device information

  -- Signature/verification
  signature_data JSONB, -- Digital signature or verification data
  verified_by VARCHAR(255), -- Who verified the consent (practitioner ID)
  verification_method VARCHAR(50), -- 'electronic', 'verbal', 'written'

  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  granted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ, -- Optional expiration date

  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT valid_consent_status CHECK (consent_status IN ('granted', 'denied', 'revoked', 'pending')),
  CONSTRAINT valid_consent_type CHECK (consent_type IN ('recording', 'vitals_capture', 'screen_sharing', 'data_storage', 'general'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_meeting_consents_meeting ON virtual_meeting_consents(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_consents_patient ON virtual_meeting_consents(patient_id);
CREATE INDEX IF NOT EXISTS idx_meeting_consents_participant ON virtual_meeting_consents(participant_id);
CREATE INDEX IF NOT EXISTS idx_meeting_consents_status ON virtual_meeting_consents(consent_status);
CREATE INDEX IF NOT EXISTS idx_meeting_consents_type ON virtual_meeting_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_meeting_consents_created_at ON virtual_meeting_consents(created_at);

-- Create table for vitals captured during meetings
CREATE TABLE IF NOT EXISTS virtual_meeting_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES virtual_meetings(id) ON DELETE CASCADE,

  -- Patient and encounter references
  patient_id VARCHAR(255) NOT NULL, -- FHIR Patient reference
  encounter_id VARCHAR(255), -- FHIR Encounter reference

  -- Vital measurements
  vital_type VARCHAR(100) NOT NULL, -- 'blood_pressure', 'heart_rate', 'temperature', 'oxygen_saturation', 'respiratory_rate', 'blood_glucose', 'weight', 'height'
  value_quantity NUMERIC, -- Primary value
  value_systolic NUMERIC, -- For blood pressure
  value_diastolic NUMERIC, -- For blood pressure
  unit VARCHAR(50) NOT NULL, -- 'mmHg', 'bpm', 'celsius', '%', 'breaths/min', 'mg/dL', 'kg', 'cm'

  -- Status and interpretation
  status VARCHAR(50) DEFAULT 'final', -- 'preliminary', 'final', 'amended', 'cancelled'
  interpretation VARCHAR(50), -- 'normal', 'high', 'low', 'critical'

  -- Capture method
  capture_method VARCHAR(100), -- 'manual_entry', 'patient_reported', 'device_integration', 'visual_observation'
  device_info JSONB, -- Information about the device used

  -- Provider information
  captured_by VARCHAR(255) NOT NULL, -- Practitioner ID who captured or verified
  captured_by_type VARCHAR(50) DEFAULT 'practitioner', -- 'practitioner', 'patient', 'nurse'

  -- Body site and position (if relevant)
  body_site VARCHAR(100), -- 'left_arm', 'right_arm', 'oral', 'rectal', etc.
  body_position VARCHAR(100), -- 'sitting', 'standing', 'lying', etc.

  -- Context and notes
  notes TEXT,
  clinical_significance TEXT, -- Provider's assessment

  -- Timestamps
  captured_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  effective_datetime TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, -- When the measurement was taken

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT valid_vital_type CHECK (vital_type IN (
    'blood_pressure', 'heart_rate', 'temperature', 'oxygen_saturation',
    'respiratory_rate', 'blood_glucose', 'weight', 'height', 'pain_scale', 'bmi'
  )),
  CONSTRAINT valid_status CHECK (status IN ('preliminary', 'final', 'amended', 'cancelled', 'entered_in_error')),
  CONSTRAINT valid_interpretation CHECK (interpretation IN ('normal', 'high', 'low', 'critical', 'abnormal', NULL))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_meeting_vitals_meeting ON virtual_meeting_vitals(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_vitals_patient ON virtual_meeting_vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_meeting_vitals_encounter ON virtual_meeting_vitals(encounter_id);
CREATE INDEX IF NOT EXISTS idx_meeting_vitals_type ON virtual_meeting_vitals(vital_type);
CREATE INDEX IF NOT EXISTS idx_meeting_vitals_captured_at ON virtual_meeting_vitals(captured_at);
CREATE INDEX IF NOT EXISTS idx_meeting_vitals_effective_datetime ON virtual_meeting_vitals(effective_datetime);

-- Add consent_status column to virtual_meetings table
ALTER TABLE virtual_meetings
ADD COLUMN IF NOT EXISTS consent_status JSONB DEFAULT '{}'::jsonb;

-- Add vitals_capture_enabled column to virtual_meetings table
ALTER TABLE virtual_meetings
ADD COLUMN IF NOT EXISTS vitals_capture_enabled BOOLEAN DEFAULT false;

-- Add recording_consent_obtained column to virtual_meetings table
ALTER TABLE virtual_meetings
ADD COLUMN IF NOT EXISTS recording_consent_obtained BOOLEAN DEFAULT false;

-- Add trigger for virtual_meeting_consents updated_at
CREATE OR REPLACE FUNCTION update_meeting_consents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_meeting_consents_updated_at ON virtual_meeting_consents;
CREATE TRIGGER trigger_meeting_consents_updated_at
  BEFORE UPDATE ON virtual_meeting_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_meeting_consents_updated_at();

-- Add trigger for virtual_meeting_vitals updated_at
CREATE OR REPLACE FUNCTION update_meeting_vitals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_meeting_vitals_updated_at ON virtual_meeting_vitals;
CREATE TRIGGER trigger_meeting_vitals_updated_at
  BEFORE UPDATE ON virtual_meeting_vitals
  FOR EACH ROW
  EXECUTE FUNCTION update_meeting_vitals_updated_at();

-- Add comments
COMMENT ON TABLE virtual_meeting_consents IS 'Stores patient consent records for recording, vitals capture, and data usage during virtual meetings';
COMMENT ON TABLE virtual_meeting_vitals IS 'Stores vital signs captured during virtual telehealth meetings';
COMMENT ON COLUMN virtual_meeting_consents.consent_type IS 'Type of consent: recording, vitals_capture, screen_sharing, data_storage, general';
COMMENT ON COLUMN virtual_meeting_consents.verification_method IS 'How consent was verified: electronic (checkbox), verbal (recorded), written (signed)';
COMMENT ON COLUMN virtual_meeting_vitals.capture_method IS 'How vitals were captured: manual_entry, patient_reported, device_integration, visual_observation';
COMMENT ON COLUMN virtual_meeting_vitals.interpretation IS 'Clinical interpretation: normal, high, low, critical, abnormal';
