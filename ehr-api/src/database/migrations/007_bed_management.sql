-- Bed Management & Hospitalization Module
-- Migration: 002_bed_management
-- Description: Creates tables for bed/ward management, inpatient admissions, and transfers

-- =====================================================
-- WARDS (Organizational units for bed management)
-- =====================================================
CREATE TABLE IF NOT EXISTS wards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,

  name TEXT NOT NULL, -- e.g., "ICU", "General Ward 1", "Private Wing"
  code TEXT NOT NULL, -- Unique within location
  ward_type TEXT NOT NULL CHECK (ward_type IN ('icu', 'general', 'private', 'semi_private', 'emergency', 'pediatric', 'maternity', 'isolation', 'other')),
  specialty TEXT, -- 'cardiology', 'orthopedics', 'pediatrics', etc.

  floor_number TEXT, -- e.g., "2", "Ground", "Basement"
  building TEXT, -- Building name if multi-building facility
  description TEXT,

  -- Capacity
  total_capacity INTEGER NOT NULL DEFAULT 0, -- Total number of beds

  -- Staff assignment
  head_nurse_id UUID REFERENCES users(id), -- Head nurse/charge nurse

  -- Configuration
  gender_restriction TEXT CHECK (gender_restriction IN ('none', 'male', 'female')),
  age_restriction TEXT CHECK (age_restriction IN ('none', 'adult', 'pediatric', 'neonatal')),

  -- Metadata
  active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),

  UNIQUE(org_id, location_id, code)
);

CREATE INDEX idx_wards_org_location ON wards(org_id, location_id);
CREATE INDEX idx_wards_location_active ON wards(location_id, active);
CREATE INDEX idx_wards_department ON wards(department_id);
CREATE INDEX idx_wards_type ON wards(ward_type);

-- =====================================================
-- ROOMS (Optional grouping within wards)
-- =====================================================
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  ward_id UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,

  room_number TEXT NOT NULL, -- "101", "ICU-A", etc.
  room_type TEXT CHECK (room_type IN ('single', 'double', 'shared', 'suite', 'isolation')),

  capacity INTEGER NOT NULL DEFAULT 1, -- Number of beds in this room
  floor_number TEXT,

  -- Features
  has_oxygen BOOLEAN DEFAULT FALSE,
  has_suction BOOLEAN DEFAULT FALSE,
  has_monitor BOOLEAN DEFAULT FALSE,
  has_ventilator BOOLEAN DEFAULT FALSE,
  has_bathroom BOOLEAN DEFAULT FALSE,
  is_isolation_capable BOOLEAN DEFAULT FALSE,

  -- Status
  active BOOLEAN NOT NULL DEFAULT TRUE,
  maintenance_mode BOOLEAN DEFAULT FALSE,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(ward_id, room_number)
);

CREATE INDEX idx_rooms_ward ON rooms(ward_id);
CREATE INDEX idx_rooms_org ON rooms(org_id);
CREATE INDEX idx_rooms_active ON rooms(active);

-- =====================================================
-- BEDS
-- =====================================================
CREATE TABLE IF NOT EXISTS beds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  ward_id UUID NOT NULL REFERENCES wards(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL, -- Optional room assignment

  bed_number TEXT NOT NULL, -- "B-101-1", "ICU-01", etc.
  bed_type TEXT NOT NULL CHECK (bed_type IN ('standard', 'icu', 'electric', 'pediatric', 'bariatric', 'isolation', 'stretcher', 'cot')),

  -- Current status
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning', 'maintenance', 'out_of_service')),
  status_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status_updated_by UUID REFERENCES users(id),

  -- Features
  has_oxygen BOOLEAN DEFAULT FALSE,
  has_suction BOOLEAN DEFAULT FALSE,
  has_monitor BOOLEAN DEFAULT FALSE,
  has_iv_pole BOOLEAN DEFAULT FALSE,
  is_electric BOOLEAN DEFAULT FALSE,

  -- Restrictions
  gender_restriction TEXT CHECK (gender_restriction IN ('none', 'male', 'female')),

  -- Current occupancy (denormalized for quick access)
  current_patient_id UUID, -- Will reference the patient when occupied
  current_admission_id UUID, -- Will reference the admission record
  occupied_since TIMESTAMP,

  -- Metadata
  active BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(org_id, location_id, bed_number)
);

CREATE INDEX idx_beds_org_location ON beds(org_id, location_id);
CREATE INDEX idx_beds_ward ON beds(ward_id);
CREATE INDEX idx_beds_room ON beds(room_id);
CREATE INDEX idx_beds_status ON beds(status);
CREATE INDEX idx_beds_location_status ON beds(location_id, status);
CREATE INDEX idx_beds_current_patient ON beds(current_patient_id);
CREATE INDEX idx_beds_current_admission ON beds(current_admission_id);

-- =====================================================
-- HOSPITALIZATIONS (Inpatient Admissions)
-- =====================================================
CREATE TABLE IF NOT EXISTS hospitalizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,

  -- Patient & Clinical Info
  patient_id UUID NOT NULL, -- FHIR Patient ID (external reference)
  patient_name TEXT NOT NULL,
  patient_mrn TEXT,

  -- Encounter link
  encounter_id UUID, -- Link to the inpatient encounter
  admission_encounter_type TEXT DEFAULT 'inpatient',

  -- Admission details
  admission_date TIMESTAMP NOT NULL,
  admission_type TEXT NOT NULL CHECK (admission_type IN ('emergency', 'elective', 'urgent', 'newborn', 'transfer_in')),
  admission_source TEXT, -- 'emergency', 'opd', 'external_referral', 'direct'

  -- Clinical
  admitting_practitioner_id UUID REFERENCES users(id),
  admitting_practitioner_name TEXT,
  primary_diagnosis TEXT,
  primary_diagnosis_code TEXT, -- ICD-10 code
  secondary_diagnoses JSONB DEFAULT '[]'::JSONB, -- Array of {code, display}

  chief_complaint TEXT,
  admission_reason TEXT NOT NULL,
  clinical_notes TEXT,

  -- Current bed assignment
  current_bed_id UUID REFERENCES beds(id),
  current_ward_id UUID REFERENCES wards(id),
  current_room_id UUID REFERENCES rooms(id),
  bed_assigned_at TIMESTAMP,

  -- Assigned care team
  attending_doctor_id UUID REFERENCES users(id),
  attending_doctor_name TEXT,
  consulting_doctors JSONB DEFAULT '[]'::JSONB, -- Array of {id, name, specialty}
  primary_nurse_id UUID REFERENCES users(id),
  primary_nurse_name TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'admitted' CHECK (status IN (
    'pre_admit', -- Reserved/scheduled admission
    'admitted', -- Currently admitted
    'transferred', -- Transferred to another facility
    'discharged', -- Normal discharge
    'absconded', -- Left without discharge
    'deceased', -- Patient deceased during stay
    'cancelled' -- Pre-admission cancelled
  )),

  -- Discharge information
  discharge_date TIMESTAMP,
  discharge_type TEXT CHECK (discharge_type IN ('normal', 'transfer', 'against_medical_advice', 'deceased', 'absconded')),
  discharge_practitioner_id UUID REFERENCES users(id),
  discharge_practitioner_name TEXT,
  discharge_summary TEXT,
  discharge_diagnosis TEXT,
  discharge_diagnosis_code TEXT,
  discharge_instructions TEXT,
  discharge_disposition TEXT, -- 'home', 'transfer', 'rehabilitation', 'nursing_home', 'deceased'

  -- Length of stay (calculated)
  los_days INTEGER, -- Length of stay in days

  -- Insurance & Billing
  insurance_info JSONB DEFAULT '{}'::JSONB, -- {provider, policy_number, authorization}
  pre_authorization_number TEXT,
  estimated_cost DECIMAL(10, 2),
  final_bill_amount DECIMAL(10, 2),

  -- Administrative
  priority TEXT DEFAULT 'routine' CHECK (priority IN ('routine', 'urgent', 'emergency')),
  isolation_required BOOLEAN DEFAULT FALSE,
  isolation_type TEXT, -- 'contact', 'droplet', 'airborne', 'protective'

  special_requirements TEXT,
  diet_requirements TEXT,
  allergies TEXT,

  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_hospitalizations_org ON hospitalizations(org_id);
CREATE INDEX idx_hospitalizations_location ON hospitalizations(location_id);
CREATE INDEX idx_hospitalizations_patient ON hospitalizations(patient_id);
CREATE INDEX idx_hospitalizations_encounter ON hospitalizations(encounter_id);
CREATE INDEX idx_hospitalizations_status ON hospitalizations(status);
CREATE INDEX idx_hospitalizations_current_bed ON hospitalizations(current_bed_id);
CREATE INDEX idx_hospitalizations_admission_date ON hospitalizations(admission_date DESC);
CREATE INDEX idx_hospitalizations_attending_doctor ON hospitalizations(attending_doctor_id);
CREATE INDEX idx_hospitalizations_org_status ON hospitalizations(org_id, status);
CREATE INDEX idx_hospitalizations_location_status ON hospitalizations(location_id, status);

-- =====================================================
-- BED ASSIGNMENTS (History of bed changes)
-- =====================================================
CREATE TABLE IF NOT EXISTS bed_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  hospitalization_id UUID NOT NULL REFERENCES hospitalizations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL,

  bed_id UUID NOT NULL REFERENCES beds(id),
  ward_id UUID NOT NULL REFERENCES wards(id),
  room_id UUID REFERENCES rooms(id),

  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  assigned_by UUID REFERENCES users(id),
  assigned_by_name TEXT,

  released_at TIMESTAMP,
  released_by UUID REFERENCES users(id),
  released_by_name TEXT,
  release_reason TEXT, -- 'transfer', 'discharge', 'upgrade', 'downgrade', 'patient_request'

  is_current BOOLEAN NOT NULL DEFAULT TRUE, -- Only one current assignment per hospitalization

  notes TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bed_assignments_hospitalization ON bed_assignments(hospitalization_id);
CREATE INDEX idx_bed_assignments_bed ON bed_assignments(bed_id);
CREATE INDEX idx_bed_assignments_patient ON bed_assignments(patient_id);
CREATE INDEX idx_bed_assignments_current ON bed_assignments(is_current);
CREATE INDEX idx_bed_assignments_assigned_at ON bed_assignments(assigned_at DESC);
CREATE INDEX idx_bed_assignments_org ON bed_assignments(org_id);

-- =====================================================
-- BED TRANSFERS (Movement between beds/wards)
-- =====================================================
CREATE TABLE IF NOT EXISTS bed_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  hospitalization_id UUID NOT NULL REFERENCES hospitalizations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL,
  patient_name TEXT NOT NULL,

  -- Source
  from_bed_id UUID REFERENCES beds(id),
  from_ward_id UUID REFERENCES wards(id),
  from_room_id UUID REFERENCES rooms(id),

  -- Destination
  to_bed_id UUID NOT NULL REFERENCES beds(id),
  to_ward_id UUID NOT NULL REFERENCES wards(id),
  to_room_id UUID REFERENCES rooms(id),

  -- Transfer details
  transfer_type TEXT NOT NULL CHECK (transfer_type IN ('same_ward', 'different_ward', 'upgrade', 'downgrade', 'clinical_need', 'patient_request')),
  transfer_reason TEXT NOT NULL,
  clinical_justification TEXT,

  requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  requested_by UUID REFERENCES users(id),
  requested_by_name TEXT,

  approved_at TIMESTAMP,
  approved_by UUID REFERENCES users(id),
  approved_by_name TEXT,

  completed_at TIMESTAMP,
  completed_by UUID REFERENCES users(id),
  completed_by_name TEXT,

  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'in_progress', 'completed', 'cancelled', 'rejected')),

  notes TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bed_transfers_hospitalization ON bed_transfers(hospitalization_id);
CREATE INDEX idx_bed_transfers_patient ON bed_transfers(patient_id);
CREATE INDEX idx_bed_transfers_from_bed ON bed_transfers(from_bed_id);
CREATE INDEX idx_bed_transfers_to_bed ON bed_transfers(to_bed_id);
CREATE INDEX idx_bed_transfers_status ON bed_transfers(status);
CREATE INDEX idx_bed_transfers_org ON bed_transfers(org_id);
CREATE INDEX idx_bed_transfers_requested_at ON bed_transfers(requested_at DESC);

-- =====================================================
-- NURSING ROUNDS (Bedside care tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS nursing_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  hospitalization_id UUID NOT NULL REFERENCES hospitalizations(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL,
  bed_id UUID NOT NULL REFERENCES beds(id),

  nurse_id UUID NOT NULL REFERENCES users(id),
  nurse_name TEXT NOT NULL,

  round_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  round_type TEXT CHECK (round_type IN ('scheduled', 'prn', 'admission', 'transfer', 'discharge', 'emergency')),

  -- Assessments
  vitals JSONB, -- {bp, hr, temp, rr, spo2, pain_score}
  consciousness_level TEXT,
  mobility_status TEXT,
  pain_score INTEGER CHECK (pain_score BETWEEN 0 AND 10),

  -- Activities
  medications_given JSONB DEFAULT '[]'::JSONB,
  procedures_performed JSONB DEFAULT '[]'::JSONB,

  -- Observations
  general_condition TEXT,
  patient_complaints TEXT,
  nursing_notes TEXT,
  care_plan_updates TEXT,

  -- Alerts/Concerns
  concerns_noted BOOLEAN DEFAULT FALSE,
  escalation_required BOOLEAN DEFAULT FALSE,
  escalated_to UUID REFERENCES users(id),

  notes TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_nursing_rounds_hospitalization ON nursing_rounds(hospitalization_id);
CREATE INDEX idx_nursing_rounds_patient ON nursing_rounds(patient_id);
CREATE INDEX idx_nursing_rounds_bed ON nursing_rounds(bed_id);
CREATE INDEX idx_nursing_rounds_nurse ON nursing_rounds(nurse_id);
CREATE INDEX idx_nursing_rounds_time ON nursing_rounds(round_time DESC);
CREATE INDEX idx_nursing_rounds_org ON nursing_rounds(org_id);

-- =====================================================
-- BED RESERVATIONS (Pre-admission bed blocking)
-- =====================================================
CREATE TABLE IF NOT EXISTS bed_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,

  bed_id UUID NOT NULL REFERENCES beds(id),
  ward_id UUID NOT NULL REFERENCES wards(id),

  patient_id UUID, -- May not be assigned yet for elective cases
  patient_name TEXT,

  reserved_for_date DATE NOT NULL,
  reserved_for_time TIME,
  expected_admission_datetime TIMESTAMP,

  reservation_type TEXT NOT NULL CHECK (reservation_type IN ('elective_surgery', 'scheduled_admission', 'transfer_expected', 'emergency_hold')),
  reason TEXT NOT NULL,

  reserved_by UUID NOT NULL REFERENCES users(id),
  reserved_by_name TEXT NOT NULL,
  reserved_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'cancelled', 'expired')),

  fulfilled_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancelled_by UUID REFERENCES users(id),
  cancellation_reason TEXT,

  expires_at TIMESTAMP NOT NULL,

  notes TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bed_reservations_bed ON bed_reservations(bed_id);
CREATE INDEX idx_bed_reservations_ward ON bed_reservations(ward_id);
CREATE INDEX idx_bed_reservations_patient ON bed_reservations(patient_id);
CREATE INDEX idx_bed_reservations_status ON bed_reservations(status);
CREATE INDEX idx_bed_reservations_org ON bed_reservations(org_id);
CREATE INDEX idx_bed_reservations_location ON bed_reservations(location_id);
CREATE INDEX idx_bed_reservations_date ON bed_reservations(reserved_for_date);

-- =====================================================
-- TRIGGERS & FUNCTIONS
-- =====================================================

-- Update ward capacity when beds are added/removed
CREATE OR REPLACE FUNCTION update_ward_capacity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE wards
    SET total_capacity = total_capacity + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.ward_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE wards
    SET total_capacity = GREATEST(total_capacity - 1, 0),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.ward_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.ward_id != NEW.ward_id THEN
    -- Bed moved to different ward
    UPDATE wards
    SET total_capacity = GREATEST(total_capacity - 1, 0),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.ward_id;

    UPDATE wards
    SET total_capacity = total_capacity + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.ward_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ward_capacity
AFTER INSERT OR UPDATE OR DELETE ON beds
FOR EACH ROW
EXECUTE FUNCTION update_ward_capacity();

-- Update bed status when assignment changes
CREATE OR REPLACE FUNCTION update_bed_on_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.is_current = TRUE THEN
    -- Mark bed as occupied
    UPDATE beds
    SET status = 'occupied',
        current_patient_id = NEW.patient_id,
        current_admission_id = NEW.hospitalization_id,
        occupied_since = NEW.assigned_at,
        status_updated_at = NEW.assigned_at,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.bed_id;

  ELSIF TG_OP = 'UPDATE' AND OLD.is_current = TRUE AND NEW.is_current = FALSE THEN
    -- Release bed (set to cleaning status)
    UPDATE beds
    SET status = 'cleaning',
        current_patient_id = NULL,
        current_admission_id = NULL,
        occupied_since = NULL,
        status_updated_at = NEW.released_at,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.bed_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bed_on_assignment
AFTER INSERT OR UPDATE ON bed_assignments
FOR EACH ROW
EXECUTE FUNCTION update_bed_on_assignment();

-- Calculate Length of Stay on discharge
CREATE OR REPLACE FUNCTION calculate_los()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.discharge_date IS NOT NULL AND OLD.discharge_date IS NULL THEN
    NEW.los_days := EXTRACT(DAY FROM (NEW.discharge_date - NEW.admission_date))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_los
BEFORE UPDATE ON hospitalizations
FOR EACH ROW
EXECUTE FUNCTION calculate_los();

-- Auto-expire reservations
CREATE OR REPLACE FUNCTION auto_expire_reservations()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND NEW.expires_at < CURRENT_TIMESTAMP THEN
    NEW.status := 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_expire_reservations
BEFORE UPDATE ON bed_reservations
FOR EACH ROW
EXECUTE FUNCTION auto_expire_reservations();

-- Update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_wards_timestamp
BEFORE UPDATE ON wards
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_rooms_timestamp
BEFORE UPDATE ON rooms
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_beds_timestamp
BEFORE UPDATE ON beds
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_hospitalizations_timestamp
BEFORE UPDATE ON hospitalizations
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_bed_transfers_timestamp
BEFORE UPDATE ON bed_transfers
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_bed_reservations_timestamp
BEFORE UPDATE ON bed_reservations
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE wards IS 'Organizational units for grouping beds (ICU, General Ward, Private Wing, etc.)';
COMMENT ON TABLE rooms IS 'Optional grouping of beds within wards (room-based bed management)';
COMMENT ON TABLE beds IS 'Individual bed entities with status, type, and current occupancy';
COMMENT ON TABLE hospitalizations IS 'Inpatient admission records with clinical and administrative details';
COMMENT ON TABLE bed_assignments IS 'Historical record of all bed assignments for each hospitalization';
COMMENT ON TABLE bed_transfers IS 'Workflow tracking for bed-to-bed and ward-to-ward transfers';
COMMENT ON TABLE nursing_rounds IS 'Bedside nursing assessments, vitals, and care documentation';
COMMENT ON TABLE bed_reservations IS 'Pre-admission bed blocking for scheduled admissions and surgeries';
