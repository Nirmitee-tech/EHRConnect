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
