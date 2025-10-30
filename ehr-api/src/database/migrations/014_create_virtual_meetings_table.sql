-- Migration: Create virtual_meetings table for 100ms integration
-- Description: Stores virtual meeting information for telehealth consultations
-- FHIR-aligned with Appointment resource

CREATE TABLE IF NOT EXISTS virtual_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- FHIR Appointment reference
  appointment_id UUID REFERENCES fhir_appointments(id) ON DELETE CASCADE,

  -- FHIR Encounter reference (created when meeting starts)
  encounter_id UUID,

  -- Organization context
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Meeting details
  meeting_id VARCHAR(255) UNIQUE NOT NULL, -- 100ms room ID
  meeting_code VARCHAR(50) UNIQUE, -- Short code for easy access

  -- Participants
  host_practitioner_id UUID REFERENCES fhir_practitioners(id),
  patient_id UUID REFERENCES fhir_patients(id),

  -- Meeting URLs
  room_url TEXT NOT NULL, -- Full meeting URL
  public_link TEXT NOT NULL, -- Public join link (no auth required)
  host_link TEXT, -- Link with host privileges

  -- Meeting status
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, active, ended, cancelled
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,

  -- 100ms specific
  room_details JSONB, -- Full room response from 100ms API
  template_id VARCHAR(255), -- 100ms template used

  -- Recording
  recording_enabled BOOLEAN DEFAULT false,
  recording_id VARCHAR(255),
  recording_url TEXT,
  recording_started_at TIMESTAMPTZ,
  recording_stopped_at TIMESTAMPTZ,

  -- Meeting configuration
  config JSONB DEFAULT '{}'::jsonb, -- Additional meeting settings

  -- Metadata
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('scheduled', 'active', 'ended', 'cancelled'))
);

-- Create indexes for performance
CREATE INDEX idx_virtual_meetings_appointment ON virtual_meetings(appointment_id);
CREATE INDEX idx_virtual_meetings_org ON virtual_meetings(org_id);
CREATE INDEX idx_virtual_meetings_status ON virtual_meetings(status);
CREATE INDEX idx_virtual_meetings_meeting_id ON virtual_meetings(meeting_id);
CREATE INDEX idx_virtual_meetings_meeting_code ON virtual_meetings(meeting_code);
CREATE INDEX idx_virtual_meetings_host ON virtual_meetings(host_practitioner_id);
CREATE INDEX idx_virtual_meetings_patient ON virtual_meetings(patient_id);
CREATE INDEX idx_virtual_meetings_created_at ON virtual_meetings(created_at);

-- Create table for meeting participants/sessions
CREATE TABLE IF NOT EXISTS virtual_meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES virtual_meetings(id) ON DELETE CASCADE,

  -- Participant details
  user_id UUID, -- Can be practitioner or patient
  user_type VARCHAR(50), -- 'practitioner', 'patient', 'guest'
  display_name VARCHAR(255) NOT NULL,

  -- Session tracking
  peer_id VARCHAR(255), -- 100ms peer ID
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Auth token for this participant
  auth_token TEXT,
  role VARCHAR(50), -- host, guest, viewer

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_meeting_participants_meeting ON virtual_meeting_participants(meeting_id);
CREATE INDEX idx_meeting_participants_user ON virtual_meeting_participants(user_id);
CREATE INDEX idx_meeting_participants_peer ON virtual_meeting_participants(peer_id);

-- Create table for meeting events/logs
CREATE TABLE IF NOT EXISTS virtual_meeting_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES virtual_meetings(id) ON DELETE CASCADE,

  -- Event details
  event_type VARCHAR(100) NOT NULL, -- room_started, room_ended, peer_joined, peer_left, recording_started, etc.
  event_data JSONB,

  -- Event source
  triggered_by UUID,
  triggered_by_type VARCHAR(50), -- user, system, webhook

  -- Timestamp
  occurred_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_meeting_events_meeting ON virtual_meeting_events(meeting_id);
CREATE INDEX idx_meeting_events_type ON virtual_meeting_events(event_type);
CREATE INDEX idx_meeting_events_occurred_at ON virtual_meeting_events(occurred_at);

-- Add 100ms configuration to integrations_config table (if it doesn't exist)
-- This stores org-specific 100ms settings
CREATE TABLE IF NOT EXISTS integrations_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_vendor_id UUID REFERENCES integration_vendors(id),

  -- Configuration
  config_key VARCHAR(255) NOT NULL,
  config_value TEXT,
  is_encrypted BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(org_id, integration_vendor_id, config_key)
);

CREATE INDEX IF NOT EXISTS idx_integrations_config_org ON integrations_config(org_id);
CREATE INDEX IF NOT EXISTS idx_integrations_config_vendor ON integrations_config(integration_vendor_id);

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_virtual_meetings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_virtual_meetings_updated_at
  BEFORE UPDATE ON virtual_meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_virtual_meetings_updated_at();

-- Add comments for documentation
COMMENT ON TABLE virtual_meetings IS 'Stores virtual meeting information for telehealth consultations using 100ms';
COMMENT ON COLUMN virtual_meetings.meeting_code IS 'Short alphanumeric code for easy meeting access';
COMMENT ON COLUMN virtual_meetings.public_link IS 'Public join link that works without authentication';
COMMENT ON TABLE virtual_meeting_participants IS 'Tracks all participants and their sessions in virtual meetings';
COMMENT ON TABLE virtual_meeting_events IS 'Audit log of all events that occur during virtual meetings';
