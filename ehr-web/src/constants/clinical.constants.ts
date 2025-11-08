/**
 * Clinical Constants
 * Common constants used throughout the clinical system
 */

/**
 * LOINC codes for vital signs
 */
export const LOINC_CODES = {
  BLOOD_PRESSURE: '85354-9',
  SYSTOLIC_BP: '8480-6',
  DIASTOLIC_BP: '8462-4',
  HEART_RATE: '8867-4',
  TEMPERATURE: '8310-5',
  RESPIRATORY_RATE: '9279-1',
  OXYGEN_SATURATION: '59408-5',
  WEIGHT: '29463-7',
  HEIGHT: '8302-2'
} as const;

/**
 * Vital signs configuration
 */
export const VITAL_SIGNS = [
  {
    label: 'Blood Pressure',
    loinc: LOINC_CODES.BLOOD_PRESSURE,
    componentCodes: [LOINC_CODES.SYSTOLIC_BP, LOINC_CODES.DIASTOLIC_BP],
    unit: 'mmHg',
    borderColor: 'border-blue-200',
    normal: '120/80'
  },
  {
    label: 'Heart Rate',
    loinc: LOINC_CODES.HEART_RATE,
    unit: 'bpm',
    borderColor: 'border-red-200',
    normal: '60-100 bpm'
  },
  {
    label: 'Temperature',
    loinc: LOINC_CODES.TEMPERATURE,
    unit: '°C',
    borderColor: 'border-orange-200',
    normal: '36.5-37.5°C'
  },
  {
    label: 'O2 Saturation',
    loinc: LOINC_CODES.OXYGEN_SATURATION,
    unit: '%',
    borderColor: 'border-green-200',
    normal: '95-100%'
  }
] as const;

/**
 * Normal ranges for vitals
 */
export const VITAL_RANGES = {
  systolic: { min: 90, max: 140 },
  diastolic: { min: 60, max: 90 },
  heartRate: { min: 60, max: 100 },
  temperature: { min: 36, max: 38 },
  oxygenSaturation: { min: 95, max: 100 },
  respiratoryRate: { min: 12, max: 20 }
} as const;

/**
 * Patient tabs configuration
 */
export const PATIENT_TABS = [
  { id: 'overview', label: 'Overview', icon: 'User' },
  { id: 'encounters', label: 'Encounters', icon: 'Calendar' },
  { id: 'problems', label: 'Problems', icon: 'AlertCircle' },
  { id: 'medications', label: 'Medications', icon: 'Pill' },
  { id: 'allergies', label: 'Allergies', icon: 'AlertCircle' },
  { id: 'vitals', label: 'Vitals & Obs', icon: 'Activity' },
  { id: 'documents', label: 'Documents', icon: 'FileText' }
] as const;

/**
 * Status badge colors
 */
export const STATUS_COLORS = {
  active: 'bg-green-50 text-green-700 border-green-200',
  finished: 'bg-green-50 text-green-700 border-green-200',
  'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
  resolved: 'bg-green-50 text-green-700 border-green-200',
  stopped: 'bg-red-50 text-red-700 border-red-200',
  high: 'bg-red-50 text-red-700 border-red-200',
  low: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  default: 'bg-gray-50 text-gray-700 border-gray-200'
} as const;

/**
 * Medication routes with SNOMED codes
 */
export const MEDICATION_ROUTES = {
  oral: { code: '26643006', display: 'Oral' },
  intravenous: { code: '47625008', display: 'Intravenous' },
  intramuscular: { code: '78421000', display: 'Intramuscular' },
  subcutaneous: { code: '34206005', display: 'Subcutaneous' },
  topical: { code: '6064005', display: 'Topical' }
} as const;

/**
 * Problem severity with SNOMED codes
 */
export const PROBLEM_SEVERITY = {
  severe: { code: '24484000', display: 'Severe' },
  moderate: { code: '6736007', display: 'Moderate' },
  mild: { code: '255604002', display: 'Mild' }
} as const;

/**
 * Encounter classes
 */
export const ENCOUNTER_CLASSES = [
  { value: 'ambulatory', label: 'Ambulatory - Outpatient visit' },
  { value: 'emergency', label: 'Emergency - Emergency visit' },
  { value: 'inpatient', label: 'Inpatient - Hospital admission' },
  { value: 'home', label: 'Home - Home health visit' },
  { value: 'virtual', label: 'Virtual - Telemedicine' }
] as const;

/**
 * Date filter options
 */
export const DATE_FILTERS = [
  { value: 'all', label: 'All Time' },
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: '90days', label: 'Last 90 Days' }
] as const;

/**
 * Allergy categories
 */
export const ALLERGY_CATEGORIES = [
  { value: 'food', label: 'Food' },
  { value: 'medication', label: 'Medication' },
  { value: 'environment', label: 'Environmental' },
  { value: 'biologic', label: 'Biologic' }
] as const;

/**
 * Allergy criticality levels
 */
export const ALLERGY_CRITICALITY = [
  { value: 'low', label: 'Low Risk' },
  { value: 'high', label: 'High Risk' },
  { value: 'unable-to-assess', label: 'Unable to Assess' }
] as const;

/**
 * Reaction severity levels
 */
export const REACTION_SEVERITY = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' }
] as const;

/**
 * Common vaccine types with CVX codes
 */
export const VACCINE_TYPES = [
  { code: '03', display: 'MMR (Measles, Mumps, Rubella)' },
  { code: '08', display: 'Hepatitis B' },
  { code: '10', display: 'IPV (Polio)' },
  { code: '20', display: 'DTaP (Diphtheria, Tetanus, Pertussis)' },
  { code: '21', display: 'Varicella (Chickenpox)' },
  { code: '33', display: 'Pneumococcal' },
  { code: '49', display: 'Hib (Haemophilus influenzae type b)' },
  { code: '88', display: 'Influenza (Flu)' },
  { code: '94', display: 'MMRV (Measles, Mumps, Rubella, Varicella)' },
  { code: '106', display: 'DTaP-HepB-IPV' },
  { code: '115', display: 'Tdap (Tetanus, Diphtheria, Pertussis)' },
  { code: '121', display: 'Zoster (Shingles)' },
  { code: '213', display: 'SARS-COV-2 (COVID-19) Pfizer' },
  { code: '207', display: 'SARS-COV-2 (COVID-19) Moderna' },
  { code: '212', display: 'SARS-COV-2 (COVID-19) Janssen' }
] as const;

/**
 * Body sites for immunization administration
 */
export const IMMUNIZATION_SITES = [
  { code: 'LA', display: 'Left Arm' },
  { code: 'RA', display: 'Right Arm' },
  { code: 'LT', display: 'Left Thigh' },
  { code: 'RT', display: 'Right Thigh' },
  { code: 'LD', display: 'Left Deltoid' },
  { code: 'RD', display: 'Right Deltoid' }
] as const;

/**
 * Routes of administration
 */
export const IMMUNIZATION_ROUTES = [
  { code: '20035000', display: 'Intramuscular' },
  { code: '34206005', display: 'Subcutaneous' },
  { code: '26643006', display: 'Oral' },
  { code: '46713006', display: 'Nasal' },
  { code: '372449004', display: 'Intradermal' }
] as const;

/**
 * Immunization status
 */
export const IMMUNIZATION_STATUS = [
  { value: 'completed', label: 'Completed' },
  { value: 'not-done', label: 'Not Done' },
  { value: 'entered-in-error', label: 'Entered in Error' }
] as const;

/**
 * Common lab test types with LOINC codes
 */
export const LAB_TEST_TYPES = [
  { code: '58410-2', display: 'Complete Blood Count (CBC)' },
  { code: '24323-8', display: 'Comprehensive Metabolic Panel (CMP)' },
  { code: '24331-1', display: 'Lipid Panel' },
  { code: '24356-8', display: 'Urinalysis' },
  { code: '57698-3', display: 'Lipid Panel with Direct LDL' },
  { code: '1988-5', display: 'C-Reactive Protein (CRP)' },
  { code: '4548-4', display: 'Hemoglobin A1c' },
  { code: '2339-0', display: 'Glucose' },
  { code: '2571-8', display: 'Triglycerides' },
  { code: '2085-9', display: 'HDL Cholesterol' },
  { code: '2089-1', display: 'LDL Cholesterol' },
  { code: '2160-0', display: 'Creatinine' },
  { code: '3094-0', display: 'BUN (Blood Urea Nitrogen)' },
  { code: '2951-2', display: 'Sodium' },
  { code: '2823-3', display: 'Potassium' },
  { code: '6690-2', display: 'White Blood Cell Count' },
  { code: '789-8', display: 'Red Blood Cell Count' },
  { code: '718-7', display: 'Hemoglobin' },
  { code: '4544-3', display: 'Hematocrit' },
  { code: '777-3', display: 'Platelet Count' }
] as const;

/**
 * Diagnostic report status
 */
export const DIAGNOSTIC_REPORT_STATUS = [
  { value: 'registered', label: 'Registered - Test ordered' },
  { value: 'partial', label: 'Partial - Some results available' },
  { value: 'preliminary', label: 'Preliminary - Initial results' },
  { value: 'final', label: 'Final - Verified results' },
  { value: 'amended', label: 'Amended - Corrected results' },
  { value: 'corrected', label: 'Corrected - Modified results' },
  { value: 'cancelled', label: 'Cancelled - Test cancelled' }
] as const;

/**
 * Imaging modality types
 */
export const IMAGING_MODALITIES = [
  { code: 'CT', display: 'CT Scan (Computed Tomography)' },
  { code: 'MR', display: 'MRI (Magnetic Resonance Imaging)' },
  { code: 'XR', display: 'X-Ray (Radiography)' },
  { code: 'US', display: 'Ultrasound' },
  { code: 'NM', display: 'Nuclear Medicine' },
  { code: 'PET', display: 'PET Scan' },
  { code: 'DX', display: 'Digital Radiography' },
  { code: 'CR', display: 'Computed Radiography' },
  { code: 'MG', display: 'Mammography' },
  { code: 'FL', display: 'Fluoroscopy' }
] as const;

/**
 * Imaging study status
 */
export const IMAGING_STUDY_STATUS = [
  { value: 'registered', label: 'Registered - Ordered' },
  { value: 'available', label: 'Available - Ready for review' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'entered-in-error', label: 'Entered in Error' },
  { value: 'unknown', label: 'Unknown' }
] as const;

/**
 * Document types with LOINC codes
 */
export const DOCUMENT_TYPES = [
  { code: '11488-4', display: 'Consult Note' },
  { code: '11506-3', display: 'Progress Note' },
  { code: '18842-5', display: 'Discharge Summary' },
  { code: '34117-2', display: 'History and Physical Note' },
  { code: '28570-0', display: 'Procedure Note' },
  { code: '57133-1', display: 'Referral Note' },
  { code: '11504-8', display: 'Surgical Operation Note' },
  { code: '11490-0', display: 'Physician Discharge Summary' },
  { code: '34133-9', display: 'Summary of Episode Note' },
  { code: '57016-8', display: 'Privacy Policy Organization Document' },
  { code: '64297-5', display: 'Death Certificate' },
  { code: '55188-7', display: 'Patient Data Document' },
  { code: '18748-4', display: 'Diagnostic Imaging Report' },
  { code: '11502-2', display: 'Laboratory Report' }
] as const;

/**
 * Document status
 */
export const DOCUMENT_STATUS = [
  { value: 'current', label: 'Current - Most recent version' },
  { value: 'superseded', label: 'Superseded - Replaced by newer version' },
  { value: 'entered-in-error', label: 'Entered in Error' }
] as const;

/**
 * Document categories
 */
export const DOCUMENT_CATEGORIES = [
  { value: 'clinical-note', label: 'Clinical Note' },
  { value: 'discharge-summary', label: 'Discharge Summary' },
  { value: 'laboratory', label: 'Laboratory Report' },
  { value: 'radiology', label: 'Radiology Report' },
  { value: 'pathology', label: 'Pathology Report' },
  { value: 'consent', label: 'Consent Form' },
  { value: 'administrative', label: 'Administrative Document' },
  { value: 'other', label: 'Other' }
] as const;
