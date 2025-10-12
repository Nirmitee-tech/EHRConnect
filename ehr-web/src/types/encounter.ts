export type EncounterStatus = 'planned' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled' | 'entered-in-error';

export type EncounterClass = 'ambulatory' | 'emergency' | 'inpatient' | 'outpatient' | 'virtual';

// Clinical Note Finding
export interface ClinicalFinding {
  id: string;
  toothNumber?: string;
  surface?: string;
  pop?: string;
  top?: string;
  pulpSensibility?: string;
  conclusion?: string;
}

// Investigation
export interface Investigation {
  id: string;
  name: string;
  result?: string;
  notes?: string;
}

// Diagnosis
export interface Diagnosis {
  id: string;
  code?: string;
  display: string;
  type: 'primary' | 'secondary' | 'differential';
  notes?: string;
}

// Treatment Plan Item
export interface TreatmentPlanItem {
  id: string;
  treatment: string;
  charges: number;
  grossAmount: number;
  discount: number;
  netAmount: number;
  gst: number;
  total: number;
  note?: string;
}

// Prescription
export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

// Instruction
export interface Instruction {
  id: string;
  text: string;
}

// Package
export interface Package {
  id: string;
  name: string;
  description?: string;
  items: string[];
  price: number;
}

// Note Data (for social and internal notes)
export interface NoteData {
  id: string;
  type: 'social' | 'internal';
  content: string;
  createdBy: string;
  createdByName: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
  remarks?: string;
}

// Insurance Data
export type InsuranceType = 'primary' | 'secondary' | 'tertiary';
export type CoverageType = 'medical' | 'dental' | 'vision' | 'pharmacy';
export type InsurancePlan = 'PPO' | 'HMO' | 'EPO' | 'POS' | 'HDHP' | 'Medicare' | 'Medicaid' | 'Other';

export interface InsuranceData {
  id: string;
  type: InsuranceType; // Primary, Secondary, Tertiary
  insuranceName: string; // Insurance company name (e.g., Blue Cross, Aetna)
  planType: string; // Plan type/name
  memberId: string; // Member/Policy ID
  groupId?: string; // Group ID number
  groupName?: string; // Group Name
  planName?: string; // Specific plan name

  // Patient relationship
  relationship: 'self' | 'spouse' | 'child' | 'other';

  // Dates
  effectiveStartDate?: Date | string;
  effectiveEndDate?: Date | string;

  // Insurance card images
  cardFrontImage?: string; // Base64 or URL to front of insurance card
  cardBackImage?: string; // Base64 or URL to back of insurance card

  // Additional US Healthcare specific fields
  coverageType?: CoverageType; // Medical, Dental, Vision, Pharmacy
  plan?: InsurancePlan; // PPO, HMO, EPO, etc.
  subscriberName?: string; // Primary policyholder name
  subscriberId?: string; // Subscriber ID (if different from member)
  rxBin?: string; // Pharmacy Benefit Manager BIN
  rxPcn?: string; // Pharmacy Benefit Manager PCN
  rxGroup?: string; // Pharmacy group number
  copay?: {
    primaryCare?: number;
    specialist?: number;
    emergency?: number;
    urgentCare?: number;
  };
  deductible?: {
    individual?: number;
    family?: number;
    remaining?: number;
  };
  outOfPocketMax?: {
    individual?: number;
    family?: number;
  };

  isPrimary: boolean;
  isActive: boolean;
  verificationDate?: Date | string;
  verificationStatus?: 'verified' | 'pending' | 'failed' | 'not-verified';
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Address Data
export interface AddressData {
  id: string;
  type: 'Home' | 'Work' | 'Other';
  addressLine1: string;
  addressLine2: string;
  locality: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
  areaCode: string;
  landlineNumber: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  spouseName: string;
  spouseContactNumber: string;
  generalPractitioner: string;
  isActive: boolean;
  isPrimary: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Structured Habits Data
export type HabitStatus = 'unknown' | 'noHabits' | 'haveHabits';
export type HabitItemStatus = 'active' | 'toBeConfirmed' | 'inactive' | 'notSelected';
export type HabitFrequency = 'never' | 'rare' | 'occasional' | 'low' | 'medium' | 'high' | 'other' | 'unknown';

export interface HabitItem {
  name: string;
  status: HabitItemStatus;
  frequency: HabitFrequency;
}

export interface HabitsData {
  status: HabitStatus;
  habits: HabitItem[];
}

// Structured Allergies Data
export type AllergyStatus = 'unknown' | 'noAllergies' | 'haveAllergies';
export type AllergyItemStatus = 'active' | 'toBeConfirmed' | 'inactive' | 'notSelected';
export type AllergySeverity = 'mild' | 'moderate' | 'severe' | 'unknown';

export interface AllergyItem {
  name: string;
  status: AllergyItemStatus;
  severity: AllergySeverity;
}

// Drug Allergies Data
export type DrugAllergyType = 'medication' | 'anesthesia' | 'antibiotic' | 'other';

export interface DrugAllergyItem {
  id: string;
  type: DrugAllergyType;
  drugName: string;
  reaction: string;
  severity: AllergySeverity;
  status: AllergyItemStatus;
}

export interface AllergiesData {
  status: AllergyStatus;
  allergies: AllergyItem[];
  drugAllergies?: DrugAllergyItem[];
}

export interface Encounter {
  id: string;
  appointmentId?: string;
  patientId: string;
  patientName: string;
  practitionerId: string;
  practitionerName: string;
  status: EncounterStatus;
  class: EncounterClass;
  startTime: Date | string;
  endTime?: Date | string;
  duration?: number;
  reasonCode?: string;
  reasonDisplay?: string;
  type?: string;
  priority?: 'routine' | 'urgent' | 'emergency';
  location?: string;

  // Clinical information
  chiefComplaint?: string;
  findings?: ClinicalFinding[];
  findingsText?: string; // Free text notes for findings
  investigations?: Investigation[];
  investigationsText?: string; // Free text notes for investigations
  diagnoses?: Diagnosis[];
  diagnosesText?: string; // Free text notes for diagnoses
  clinicalNotes?: string;

  // Treatment
  treatmentPlan?: TreatmentPlanItem[];
  prescriptions?: Prescription[];
  instructions?: Instruction[];
  packages?: Package[];

  // Vitals
  vitals?: {
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
    bmi?: number;
  };

  // Patient Medical History (for reference)
  patientHistory?: string;
  patientAllergies?: string;
  patientHabits?: string;
  patientActive?: boolean;

  // Structured medical data
  patientHabitsStructured?: HabitsData;
  patientAllergiesStructured?: AllergiesData;

  // Patient Address and Contact Information (array to support multiple addresses)
  addresses?: AddressData[];

  // Patient Notes
  socialNotes?: NoteData[];
  internalNotes?: NoteData[];

  // Insurance Information
  insuranceCards?: InsuranceData[];

  // Legacy fields
  presentingProblem?: string;
  notes?: string;

  // Billing
  billingCodes?: Array<{
    code: string;
    display: string;
    system: 'CPT' | 'ICD-10' | 'HCPCS';
  }>;

  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface EncounterSummary {
  total: number;
  inProgress: number;
  completed: number;
  planned: number;
}
