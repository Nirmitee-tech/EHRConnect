-- Migration: Create fhir_appointments table
-- Description: FHIR-compliant appointments table for managing scheduled healthcare interactions
-- References FHIR Appointment resource: https://www.hl7.org/fhir/appointment.html

CREATE TABLE IF NOT EXISTS fhir_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Organization context
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- FHIR Resource
  resource JSONB NOT NULL,

  -- Extracted fields for querying (from resource)
  status VARCHAR(50) NOT NULL, -- proposed, pending, booked, arrived, fulfilled, cancelled, noshow, entered-in-error, checked-in, waitlist
  
  -- Scheduling
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER,
  
  -- Appointment details
  appointment_type VARCHAR(255), -- Routine, Emergency, Follow-up, etc.
  service_category VARCHAR(255), -- Consultation, Surgery, Diagnostic, etc.
  service_type VARCHAR(255), -- Specific service being performed
  specialty VARCHAR(255), -- Medical specialty
  
  -- Priority
  priority INTEGER DEFAULT 0, -- 0 = routine, higher numbers = more urgent
  
  -- References
  patient_id UUID REFERENCES fhir_patients(id) ON DELETE CASCADE,
  practitioner_id UUID, -- Primary practitioner
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  
  -- Slot information
  slot_id UUID,
  
  -- Description and instructions
  description TEXT,
  patient_instruction TEXT,
  
  -- Cancellation
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  
  -- Check-in
  checked_in_at TIMESTAMPTZ,
  arrived_at TIMESTAMPTZ,
  
  -- Communication preferences
  communication_method VARCHAR(50), -- email, sms, phone, video
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),

  -- Constraints
  CONSTRAINT valid_appointment_status CHECK (status IN (
    'proposed',
    'pending',
    'booked',
    'arrived',
    'fulfilled',
    'cancelled',
    'noshow',
    'entered-in-error',
    'checked-in',
    'waitlist'
  )),
  CONSTRAINT valid_times CHECK (end_time > start_time)
);

-- Create indexes for performance
CREATE INDEX idx_fhir_appointments_org ON fhir_appointments(org_id);
CREATE INDEX idx_fhir_appointments_patient ON fhir_appointments(patient_id);
CREATE INDEX idx_fhir_appointments_practitioner ON fhir_appointments(practitioner_id);
CREATE INDEX idx_fhir_appointments_location ON fhir_appointments(location_id);
CREATE INDEX idx_fhir_appointments_status ON fhir_appointments(org_id, status);
CREATE INDEX idx_fhir_appointments_start_time ON fhir_appointments(start_time);
CREATE INDEX idx_fhir_appointments_end_time ON fhir_appointments(end_time);
CREATE INDEX idx_fhir_appointments_date_range ON fhir_appointments(start_time, end_time);
CREATE INDEX idx_fhir_appointments_created_at ON fhir_appointments(created_at);
CREATE INDEX idx_fhir_appointments_resource_gin ON fhir_appointments USING gin(resource);

-- Composite indexes for common queries
CREATE INDEX idx_fhir_appointments_patient_status ON fhir_appointments(patient_id, status, start_time);
CREATE INDEX idx_fhir_appointments_practitioner_date ON fhir_appointments(practitioner_id, start_time, status);
CREATE INDEX idx_fhir_appointments_location_date ON fhir_appointments(location_id, start_time, status);
CREATE INDEX idx_fhir_appointments_upcoming ON fhir_appointments(org_id, start_time) 
  WHERE status IN ('booked', 'pending', 'checked-in', 'arrived');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_fhir_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER trigger_fhir_appointments_updated_at
  BEFORE UPDATE ON fhir_appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_fhir_appointments_updated_at();

-- Create function to automatically calculate duration_minutes
CREATE OR REPLACE FUNCTION update_fhir_appointments_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
    NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate duration
CREATE TRIGGER trigger_fhir_appointments_duration
  BEFORE INSERT OR UPDATE OF start_time, end_time ON fhir_appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_fhir_appointments_duration();

-- Create view for upcoming appointments
CREATE OR REPLACE VIEW v_upcoming_appointments AS
SELECT 
  a.id,
  a.org_id,
  a.status,
  a.start_time,
  a.end_time,
  a.duration_minutes,
  a.appointment_type,
  a.service_category,
  a.patient_id,
  p.family_name AS patient_family_name,
  p.given_name AS patient_given_name,
  p.phone AS patient_phone,
  p.email AS patient_email,
  a.practitioner_id,
  a.location_id,
  l.name AS location_name,
  a.description,
  a.checked_in_at,
  a.arrived_at
FROM fhir_appointments a
LEFT JOIN fhir_patients p ON a.patient_id = p.id
LEFT JOIN locations l ON a.location_id = l.id
WHERE a.status IN ('booked', 'pending', 'checked-in', 'arrived')
  AND a.start_time >= CURRENT_TIMESTAMP
ORDER BY a.start_time ASC;

-- Create view for today's appointments
CREATE OR REPLACE VIEW v_todays_appointments AS
SELECT 
  a.id,
  a.org_id,
  a.status,
  a.start_time,
  a.end_time,
  a.duration_minutes,
  a.appointment_type,
  a.patient_id,
  p.family_name AS patient_family_name,
  p.given_name AS patient_given_name,
  p.phone AS patient_phone,
  a.practitioner_id,
  a.location_id,
  l.name AS location_name,
  a.checked_in_at,
  a.arrived_at
FROM fhir_appointments a
LEFT JOIN fhir_patients p ON a.patient_id = p.id
LEFT JOIN locations l ON a.location_id = l.id
WHERE a.start_time >= CURRENT_DATE
  AND a.start_time < CURRENT_DATE + INTERVAL '1 day'
ORDER BY a.start_time ASC;

-- Add comments for documentation
COMMENT ON TABLE fhir_appointments IS 'FHIR Appointment resources - stores scheduled healthcare interactions between patients and practitioners';
COMMENT ON COLUMN fhir_appointments.resource IS 'Full FHIR Appointment resource in JSONB format';
COMMENT ON COLUMN fhir_appointments.status IS 'Appointment status extracted from resource for quick filtering';
COMMENT ON COLUMN fhir_appointments.start_time IS 'Scheduled start time of the appointment';
COMMENT ON COLUMN fhir_appointments.end_time IS 'Scheduled end time of the appointment';
COMMENT ON COLUMN fhir_appointments.duration_minutes IS 'Duration in minutes (auto-calculated from start/end time)';
COMMENT ON COLUMN fhir_appointments.priority IS 'Appointment priority - 0 is routine, higher numbers indicate more urgent';
COMMENT ON COLUMN fhir_appointments.patient_instruction IS 'Special instructions for the patient (e.g., fasting requirements)';
COMMENT ON COLUMN fhir_appointments.checked_in_at IS 'Timestamp when patient checked in for appointment';
COMMENT ON COLUMN fhir_appointments.arrived_at IS 'Timestamp when patient arrived at facility';
