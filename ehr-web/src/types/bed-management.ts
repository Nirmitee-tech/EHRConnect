// Bed Management & Hospitalization Types
// FHIR-compliant types for inpatient bed management

// =====================================================
// WARD TYPES
// =====================================================
export type WardType =
  | 'icu'
  | 'general'
  | 'private'
  | 'semi_private'
  | 'emergency'
  | 'pediatric'
  | 'maternity'
  | 'isolation'
  | 'other';

export type GenderRestriction = 'none' | 'male' | 'female';
export type AgeRestriction = 'none' | 'adult' | 'pediatric' | 'neonatal';

export interface Ward {
  id: string;
  orgId: string;
  locationId: string;
  departmentId?: string;

  name: string;
  code: string;
  wardType: WardType;
  specialty?: string;

  floorNumber?: string;
  floor?: string; // Alias for floorNumber (for backward compatibility)
  building?: string;
  description?: string;

  totalCapacity: number;
  capacity?: number; // Alias for totalCapacity (for backward compatibility)
  occupiedBeds?: number; // Calculated field
  availableBeds?: number; // Calculated field
  totalBeds?: number; // Calculated field

  headNurseId?: string;
  headNurseName?: string;

  genderRestriction?: GenderRestriction;
  ageRestriction?: AgeRestriction;

  active: boolean;
  notes?: string;
  metadata?: Record<string, unknown>;

  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string;
}

export interface WardSummary {
  id: string;
  name: string;
  wardType: WardType;
  floorNumber?: string;
  totalCapacity: number;
  occupied: number;
  available: number;
  occupancyRate: number;
}

// =====================================================
// ROOM TYPES
// =====================================================
export type RoomType = 'single' | 'double' | 'shared' | 'suite' | 'isolation';

export interface Room {
  id: string;
  orgId: string;
  wardId: string;

  roomNumber: string;
  roomType?: RoomType;
  capacity: number;
  floorNumber?: string;

  // Features
  hasOxygen: boolean;
  hasSuction: boolean;
  hasMonitor: boolean;
  hasVentilator: boolean;
  hasBathroom: boolean;
  isIsolationCapable: boolean;

  active: boolean;
  maintenanceMode: boolean;
  notes?: string;
  metadata?: Record<string, unknown>;

  createdAt: Date | string;
  updatedAt: Date | string;

  // Calculated fields
  occupiedBeds?: number;
  availableBeds?: number;
}

// =====================================================
// BED TYPES
// =====================================================
export type BedStatus =
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'cleaning'
  | 'maintenance'
  | 'out_of_service';

export type BedType =
  | 'standard'
  | 'icu'
  | 'electric'
  | 'pediatric'
  | 'bariatric'
  | 'isolation'
  | 'stretcher'
  | 'cot';

export interface Bed {
  id: string;
  orgId: string;
  locationId: string;
  wardId: string;
  roomId?: string;

  bedNumber: string;
  bedType: BedType;

  status: BedStatus;
  statusUpdatedAt: Date | string;
  statusUpdatedBy?: string;

  // Features
  hasOxygen: boolean;
  hasSuction: boolean;
  hasMonitor: boolean;
  hasIvPole: boolean;
  isElectric: boolean;

  genderRestriction?: GenderRestriction;

  // Current occupancy
  currentPatientId?: string;
  currentPatientName?: string;
  currentAdmissionId?: string;
  occupiedSince?: Date | string;

  active: boolean;
  notes?: string;
  metadata?: Record<string, unknown>;

  createdAt: Date | string;
  updatedAt: Date | string;

  // Populated relations
  ward?: Ward;
  room?: Room;
}

export interface BedSummary {
  id: string;
  bedNumber: string;
  bedType: BedType;
  status: BedStatus;
  wardName: string;
  roomNumber?: string;
  currentPatientName?: string;
  occupiedSince?: Date | string;
}

// =====================================================
// HOSPITALIZATION TYPES
// =====================================================
export type AdmissionType =
  | 'emergency'
  | 'elective'
  | 'urgent'
  | 'newborn'
  | 'transfer_in';

export type AdmissionSource =
  | 'emergency'
  | 'opd'
  | 'external_referral'
  | 'direct';

export type HospitalizationStatus =
  | 'pre_admit'
  | 'admitted'
  | 'transferred'
  | 'discharged'
  | 'absconded'
  | 'deceased'
  | 'cancelled';

export type DischargeType =
  | 'normal'
  | 'transfer'
  | 'against_medical_advice'
  | 'deceased'
  | 'absconded';

export type DischargeDisposition =
  | 'home'
  | 'transfer'
  | 'rehabilitation'
  | 'nursing_home'
  | 'deceased';

export type IsolationType = 'contact' | 'droplet' | 'airborne' | 'protective';

export interface Diagnosis {
  code?: string;
  display: string;
  system?: string; // ICD-10, SNOMED, etc.
}

export interface ConsultingDoctor {
  id: string;
  name: string;
  specialty?: string;
}

export interface Hospitalization {
  id: string;
  orgId: string;
  locationId: string;

  // Patient & Clinical Info
  patientId: string;
  patientName: string;
  patientMrn?: string;

  // Encounter link
  encounterId?: string;
  admissionEncounterType: string;

  // Admission details
  admissionDate: Date | string;
  admissionType: AdmissionType;
  admissionSource?: AdmissionSource;

  // Clinical
  admittingPractitionerId?: string;
  admittingPractitionerName?: string;
  primaryDiagnosis?: string;
  primaryDiagnosisCode?: string;
  secondaryDiagnoses?: Diagnosis[];

  chiefComplaint?: string;
  admissionReason: string;
  clinicalNotes?: string;

  // Current bed assignment
  currentBedId?: string;
  currentWardId?: string;
  currentRoomId?: string;
  bedAssignedAt?: Date | string;

  // Assigned care team
  attendingDoctorId?: string;
  attendingDoctorName?: string;
  consultingDoctors?: ConsultingDoctor[];
  primaryNurseId?: string;
  primaryNurseName?: string;

  // Status
  status: HospitalizationStatus;

  // Discharge information
  dischargeDate?: Date | string;
  dischargeType?: DischargeType;
  dischargePractitionerId?: string;
  dischargePractitionerName?: string;
  dischargeSummary?: string;
  dischargeDiagnosis?: string;
  dischargeDiagnosisCode?: string;
  dischargeInstructions?: string;
  dischargeDisposition?: DischargeDisposition;

  // Length of stay
  losDays?: number;

  // Insurance & Billing
  insuranceInfo?: {
    provider?: string;
    policyNumber?: string;
    authorization?: string;
  };
  preAuthorizationNumber?: string;
  estimatedCost?: number;
  finalBillAmount?: number;

  // Administrative
  priority: 'routine' | 'urgent' | 'emergency';
  isolationRequired: boolean;
  isolationType?: IsolationType;

  specialRequirements?: string;
  dietRequirements?: string;
  allergies?: string;

  // Metadata
  notes?: string;
  metadata?: Record<string, unknown>;

  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string;

  // Populated relations
  currentBed?: Bed;
  currentWard?: Ward;
}

export interface HospitalizationSummary {
  total: number;
  preAdmit: number;
  admitted: number;
  discharged: number;
  averageLos: number;
  occupancyRate: number;
}

// =====================================================
// BED ASSIGNMENT TYPES
// =====================================================
export type ReleaseReason =
  | 'transfer'
  | 'discharge'
  | 'upgrade'
  | 'downgrade'
  | 'patient_request';

export interface BedAssignment {
  id: string;
  orgId: string;

  hospitalizationId: string;
  patientId: string;

  bedId: string;
  wardId: string;
  roomId?: string;

  assignedAt: Date | string;
  assignedBy?: string;
  assignedByName?: string;

  releasedAt?: Date | string;
  releasedBy?: string;
  releasedByName?: string;
  releaseReason?: ReleaseReason;

  isCurrent: boolean;

  notes?: string;
  metadata?: Record<string, unknown>;

  createdAt: Date | string;

  // Populated relations
  bed?: Bed;
  ward?: Ward;
  room?: Room;
}

// =====================================================
// BED TRANSFER TYPES
// =====================================================
export type TransferType =
  | 'same_ward'
  | 'different_ward'
  | 'upgrade'
  | 'downgrade'
  | 'clinical_need'
  | 'patient_request';

export type TransferStatus =
  | 'requested'
  | 'approved'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export interface BedTransfer {
  id: string;
  orgId: string;

  hospitalizationId: string;
  patientId: string;
  patientName: string;

  // Source
  fromBedId?: string;
  fromWardId?: string;
  fromRoomId?: string;

  // Destination
  toBedId: string;
  toWardId: string;
  toRoomId?: string;

  // Transfer details
  transferType: TransferType;
  transferReason: string;
  clinicalJustification?: string;

  requestedAt: Date | string;
  requestedBy?: string;
  requestedByName?: string;

  approvedAt?: Date | string;
  approvedBy?: string;
  approvedByName?: string;

  completedAt?: Date | string;
  completedBy?: string;
  completedByName?: string;

  status: TransferStatus;

  notes?: string;
  metadata?: Record<string, unknown>;

  createdAt: Date | string;
  updatedAt: Date | string;

  // Populated relations
  fromBed?: Bed;
  toBed?: Bed;
  fromWard?: Ward;
  toWard?: Ward;
}

// =====================================================
// NURSING ROUND TYPES
// =====================================================
export type RoundType =
  | 'scheduled'
  | 'prn'
  | 'admission'
  | 'transfer'
  | 'discharge'
  | 'emergency';

export interface VitalsRecord {
  bp?: string; // e.g., "120/80"
  hr?: number; // Heart rate
  temp?: number; // Temperature
  rr?: number; // Respiratory rate
  spo2?: number; // Oxygen saturation
  painScore?: number; // 0-10
}

export interface NursingRound {
  id: string;
  orgId: string;

  hospitalizationId: string;
  patientId: string;
  bedId: string;

  nurseId: string;
  nurseName: string;

  roundTime: Date | string;
  roundType?: RoundType;

  // Assessments
  vitals?: VitalsRecord;
  consciousnessLevel?: string;
  mobilityStatus?: string;
  painScore?: number;

  // Activities
  medicationsGiven?: Array<{
    name: string;
    dose: string;
    time: string;
  }>;
  proceduresPerformed?: Array<{
    name: string;
    time: string;
  }>;

  // Observations
  generalCondition?: string;
  patientComplaints?: string;
  nursingNotes?: string;
  carePlanUpdates?: string;

  // Alerts/Concerns
  concernsNoted: boolean;
  escalationRequired: boolean;
  escalatedTo?: string;

  notes?: string;
  metadata?: Record<string, unknown>;

  createdAt: Date | string;
}

// =====================================================
// BED RESERVATION TYPES
// =====================================================
export type ReservationType =
  | 'elective_surgery'
  | 'scheduled_admission'
  | 'transfer_expected'
  | 'emergency_hold';

export type ReservationStatus = 'active' | 'fulfilled' | 'cancelled' | 'expired';

export interface BedReservation {
  id: string;
  orgId: string;
  locationId: string;

  bedId: string;
  wardId: string;

  patientId?: string;
  patientName?: string;

  reservedForDate: Date | string;
  reservedForTime?: string;
  expectedAdmissionDatetime?: Date | string;

  reservationType: ReservationType;
  reason: string;

  reservedBy: string;
  reservedByName: string;
  reservedAt: Date | string;

  status: ReservationStatus;

  fulfilledAt?: Date | string;
  cancelledAt?: Date | string;
  cancelledBy?: string;
  cancellationReason?: string;

  expiresAt: Date | string;

  notes?: string;
  metadata?: Record<string, unknown>;

  createdAt: Date | string;
  updatedAt: Date | string;

  // Populated relations
  bed?: Bed;
  ward?: Ward;
}

// =====================================================
// FHIR LOCATION MAPPING
// =====================================================
export interface FHIRLocation {
  resourceType: 'Location';
  id?: string;
  identifier?: Array<{
    system?: string;
    value?: string;
  }>;
  status: 'active' | 'suspended' | 'inactive';
  operationalStatus?: {
    system?: string;
    code?: string; // 'O' = Occupied, 'U' = Unoccupied, 'C' = Closed, etc.
    display?: string;
  };
  name: string;
  alias?: string[];
  description?: string;
  mode?: 'instance' | 'kind';
  type?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  }>;
  telecom?: Array<{
    system?: 'phone' | 'email';
    value?: string;
  }>;
  address?: {
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  physicalType?: {
    coding?: Array<{
      system?: string;
      code?: string; // 'bd' = Bed, 'ro' = Room, 'wa' = Ward
      display?: string;
    }>;
  };
  position?: {
    longitude: number;
    latitude: number;
    altitude?: number;
  };
  managingOrganization?: {
    reference?: string;
    display?: string;
  };
  partOf?: {
    reference?: string; // Reference to parent Location (e.g., Room is part of Ward)
    display?: string;
  };
}

// =====================================================
// API REQUEST/RESPONSE TYPES
// =====================================================
export interface CreateWardRequest {
  locationId: string;
  departmentId?: string;
  name: string;
  code: string;
  wardType: WardType;
  specialty?: string;
  floorNumber?: string;
  floor?: string; // Alias for floorNumber
  building?: string;
  description?: string;
  capacity?: number;
  totalCapacity?: number; // Alias for capacity
  headNurseId?: string;
  genderRestriction?: GenderRestriction;
  ageRestriction?: AgeRestriction;
  active?: boolean;
  notes?: string;
}

export interface CreateBedRequest {
  locationId?: string; // Optional - will be derived from ward if not provided
  wardId: string;
  roomId?: string;
  bedNumber: string;
  bedType: BedType;
  hasOxygen?: boolean;
  hasSuction?: boolean;
  hasMonitor?: boolean;
  hasIvPole?: boolean;
  isElectric?: boolean;
  genderRestriction?: GenderRestriction;
  notes?: string;
}

export interface CreateHospitalizationRequest {
  patientId: string;
  locationId: string;
  admissionDate: Date | string;
  admissionType: AdmissionType;
  admissionReason: string;
  chiefComplaint?: string;
  primaryDiagnosis?: string;
  primaryDiagnosisCode?: string;
  admittingPractitionerId?: string;
  attendingDoctorId?: string;
  priority?: 'routine' | 'urgent' | 'emergency';
  isolationRequired?: boolean;
  specialRequirements?: string;
  dietRequirements?: string;
}

export interface AdmitPatientRequest extends CreateHospitalizationRequest {
  bedId?: string; // Optional - can assign bed later
}

export interface AssignBedRequest {
  hospitalizationId: string;
  bedId: string;
  notes?: string;
}

export interface TransferBedRequest {
  hospitalizationId: string;
  toBedId: string;
  transferType: TransferType;
  transferReason: string;
  clinicalJustification?: string;
}

export interface DischargePatientRequest {
  hospitalizationId: string;
  dischargeDate: Date | string;
  dischargeType: DischargeType;
  dischargeSummary?: string;
  dischargeDiagnosis?: string;
  dischargeDiagnosisCode?: string;
  dischargeInstructions?: string;
  dischargeDisposition?: DischargeDisposition;
}

export interface BedStatusChangeRequest {
  bedId: string;
  status: BedStatus;
  notes?: string;
}

export interface CreateNursingRoundRequest {
  hospitalizationId: string;
  bedId: string;
  roundType?: RoundType;
  vitals?: VitalsRecord;
  consciousnessLevel?: string;
  mobilityStatus?: string;
  painScore?: number;
  medicationsGiven?: Array<{ name: string; dose: string; time: string }>;
  proceduresPerformed?: Array<{ name: string; time: string }>;
  generalCondition?: string;
  patientComplaints?: string;
  nursingNotes?: string;
  carePlanUpdates?: string;
  concernsNoted?: boolean;
  escalationRequired?: boolean;
  escalatedTo?: string;
  notes?: string;
}

export interface CreateBedReservationRequest {
  bedId: string;
  locationId: string;
  patientId?: string;
  patientName?: string;
  reservedForDate: Date | string;
  reservedForTime?: string;
  reservationType: ReservationType;
  reason: string;
  expiresAt: Date | string;
  notes?: string;
}

// =====================================================
// DASHBOARD & ANALYTICS TYPES
// =====================================================
export interface BedOccupancyStats {
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  reservedBeds: number;
  cleaningBeds: number;
  maintenanceBeds: number;
  outOfServiceBeds: number;
  occupancyRate: number;
}

export interface WardOccupancyData {
  wardId: string;
  wardName: string;
  wardType: WardType;
  totalBeds: number;
  occupied: number;
  available: number;
  occupancyRate: number;
}

export interface AdmissionTrendsData {
  date: string;
  admissions: number;
  discharges: number;
  transfers: number;
}

export interface BedTurnoverMetrics {
  totalAdmissions: number;
  totalDischarges: number;
  averageLos: number;
  medianLos: number;
  bedTurnoverRate: number;
}

export interface CensusReport {
  date: Date | string;
  totalInpatients: number;
  admissionsToday: number;
  dischargesToday: number;
  transfersToday: number;
  byWard: Array<{
    wardName: string;
    count: number;
  }>;
  byDepartment: Array<{
    departmentName: string;
    count: number;
  }>;
}
