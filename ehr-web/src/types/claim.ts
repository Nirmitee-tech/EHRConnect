// Comprehensive Medical Claims Type Definitions

export type ClaimStatus =
  | 'draft'
  | 'ready-to-submit'
  | 'submitted'
  | 'accepted'
  | 'rejected'
  | 'paid'
  | 'denied'
  | 'appealed';

export type ClaimType = 'professional' | 'institutional' | 'dental' | 'pharmacy';

export type ClaimFrequency =
  | 'original'
  | 'replacement'
  | 'void'
  | 'corrected';

export type BillType =
  | '11x' // Hospital Inpatient
  | '12x' // Hospital Inpatient Part B
  | '13x' // Hospital Outpatient
  | '21x' // Skilled Nursing - Inpatient
  | '22x' // Skilled Nursing - Inpatient Part B
  | '23x' // Skilled Nursing - Outpatient
  | '71x' // Clinic - Rural Health
  | '72x' // Clinic - Hospital Based
  | '73x' // Clinic - Independent
  | '81x' // Clinic - FQHC
  | 'other';

// Place of Service Codes (CMS-1500)
export interface PlaceOfService {
  code: string;
  name: string;
  description: string;
}

export const PLACE_OF_SERVICE_CODES: PlaceOfService[] = [
  { code: '11', name: 'Office', description: 'Office' },
  { code: '12', name: 'Home', description: 'Home' },
  { code: '21', name: 'Inpatient Hospital', description: 'Inpatient Hospital' },
  { code: '22', name: 'Outpatient Hospital', description: 'On Campus-Outpatient Hospital' },
  { code: '23', name: 'Emergency Room', description: 'Emergency Room - Hospital' },
  { code: '24', name: 'ASC', description: 'Ambulatory Surgical Center' },
  { code: '31', name: 'Skilled Nursing Facility', description: 'Skilled Nursing Facility' },
  { code: '32', name: 'Nursing Facility', description: 'Nursing Facility' },
  { code: '02', name: 'Telehealth', description: 'Telehealth Provided Other than in Patient\'s Home' },
  { code: '10', name: 'Telehealth Home', description: 'Telehealth Provided in Patient\'s Home' },
];

// ICD-10 Diagnosis Code
export interface DiagnosisCode {
  id: string;
  code: string; // e.g., "F43.23"
  description: string;
  pointer: string; // A, B, C, D (for linking to procedures)
  isPrimary: boolean;
}

// CPT/HCPCS Procedure Code
export interface ProcedureCode {
  id: string;
  code: string; // e.g., "99213"
  description: string;
  modifiers: string[]; // e.g., ["25", "GT"]
  diagnosisPointers: string[]; // e.g., ["A", "B"] - links to diagnosis codes
  dateOfService: string;
  placeOfService: string;
  units: number;
  chargeAmount: number;
  expectedReimbursement?: number;
  renderingProviderId?: string;
  ndc?: string; // National Drug Code (for drugs)
  ndcUnits?: string; // Unit of measurement
}

// Provider Information
export interface ClaimProvider {
  id: string;
  name: string;
  npi: string;
  taxonomyCode?: string;
  taxId?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  phone?: string;
}

// Insurance Information
export interface ClaimInsurance {
  payerId: string;
  payerName: string;
  memberIdNumber: string;
  groupNumber?: string;
  planName?: string;
  policyHolderName?: string;
  policyHolderRelationship?: 'self' | 'spouse' | 'child' | 'other';
  policyHolderDOB?: string;
  insuranceType: 'primary' | 'secondary' | 'tertiary';
  priorAuthNumber?: string;
  priorAuthDate?: string;
}

// Eligibility Check Result
export interface EligibilityCheck {
  checkDate: string;
  status: 'active' | 'inactive' | 'unknown';
  planActive: boolean;
  copay?: number;
  coinsurance?: number;
  deductible?: number;
  deductibleMet?: number;
  outOfPocketMax?: number;
  outOfPocketMet?: number;
  effectiveDate?: string;
  terminationDate?: string;
  messages?: string[];
}

// Claim Validation Error
export interface ClaimValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// Main Claim Interface
export interface Claim {
  id?: string;
  claimNumber?: string;
  status: ClaimStatus;
  claimType: ClaimType;
  claimFrequency: ClaimFrequency;

  // Patient Information
  patientId: string;
  patientName: string;
  patientDOB: string;
  patientGender?: string;
  patientAddress?: string;
  patientPhone?: string;

  // Appointment Linkage
  appointmentId?: string;
  appointmentDate?: string;

  // Clinical Information
  diagnosisCodes: DiagnosisCode[];
  procedureCodes: ProcedureCode[];

  // Provider Information
  billingProvider: ClaimProvider;
  renderingProvider?: ClaimProvider;
  referringProvider?: ClaimProvider;
  facilityProvider?: ClaimProvider;

  // Insurance Information
  primaryInsurance: ClaimInsurance;
  secondaryInsurance?: ClaimInsurance;
  tertiaryInsurance?: ClaimInsurance;

  // Claim Details
  placeOfService: string;
  admissionDate?: string;
  dischargeDate?: string;
  onsetDate?: string;
  accidentDate?: string;
  accidentState?: string;

  // Financial Information
  totalCharges: number;
  expectedReimbursement?: number;
  patientResponsibility?: number;
  amountPaid?: number;

  // Additional Information
  billingNotes?: string;
  claimNotes?: string;
  attachments?: string[]; // File URLs or IDs

  // Eligibility
  eligibilityCheck?: EligibilityCheck;

  // Validation
  validationErrors?: ClaimValidationError[];
  isValid?: boolean;

  // Submission Information
  submittedDate?: string;
  submittedBy?: string;
  clearinghouseId?: string;

  // Audit Trail
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}

// Form Data for Creating/Editing Claims
export interface ClaimFormData {
  claimType: ClaimType;
  claimFrequency: ClaimFrequency;
  paymentMethod?: 'insurance' | 'self-pay' | 'workers-comp' | 'other';

  patientId: string;
  appointmentId?: string;

  diagnosisCodes: DiagnosisCode[];
  procedureCodes: ProcedureCode[];

  billingProviderId: string;
  renderingProviderId?: string;
  referringProviderId?: string;
  facilityProviderId?: string;

  primaryInsuranceId?: string; // Optional - only required for insurance payment
  secondaryInsuranceId?: string;

  placeOfService: string;
  admissionDate?: string;
  dischargeDate?: string;

  billingNotes?: string;
  claimNotes?: string;
}

// Search/Filter for ICD-10 Codes
export interface ICD10SearchResult {
  code: string;
  description: string;
  category?: string;
}

// Search/Filter for CPT/HCPCS Codes
export interface CPTSearchResult {
  code: string;
  description: string;
  category?: string;
  mediumDescription?: string;
  shortDescription?: string;
  relativeValueUnit?: number;
}
