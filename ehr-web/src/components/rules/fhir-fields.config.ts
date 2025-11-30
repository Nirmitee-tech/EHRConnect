/**
 * FHIR Resource Fields for Rule Builder
 * Comprehensive field definitions for all major FHIR resources
 */

export interface FHIRField {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'code' | 'reference';
  inputType?: string;
  category: string;
  resource: string;
  fhirPath: string;
  description?: string;
  valueSet?: string[];
  examples?: string[];
}

export const FHIR_FIELD_CATEGORIES = {
  PATIENT: 'Patient Demographics',
  VITAL_SIGNS: 'Vital Signs & Observations',
  LAB_RESULTS: 'Laboratory Results',
  MEDICATIONS: 'Medications',
  CONDITIONS: 'Diagnoses & Conditions',
  PROCEDURES: 'Procedures',
  ALLERGIES: 'Allergies & Intolerances',
  IMMUNIZATIONS: 'Immunizations',
  ENCOUNTERS: 'Encounters & Visits',
  CARE_PLANS: 'Care Plans',
  APPOINTMENTS: 'Appointments',
  DOCUMENTS: 'Clinical Documents',
  IMAGING: 'Imaging & Diagnostics',
  DEVICES: 'Medical Devices',
  FAMILY_HISTORY: 'Family History',
  GOALS: 'Care Goals',
  RISK_ASSESSMENTS: 'Risk Assessments',
  COMPUTED: 'Computed Variables',
};

export const FHIR_FIELDS: FHIRField[] = [
  // ==================== PATIENT DEMOGRAPHICS ====================
  {
    name: 'patient.age',
    label: 'Patient Age',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.PATIENT,
    resource: 'Patient',
    fhirPath: 'Patient.birthDate',
    description: 'Age in years',
    examples: ['65', '18', '45'],
  },
  {
    name: 'patient.gender',
    label: 'Gender',
    type: 'code',
    inputType: 'text',
    category: FHIR_FIELD_CATEGORIES.PATIENT,
    resource: 'Patient',
    fhirPath: 'Patient.gender',
    valueSet: ['male', 'female', 'other', 'unknown'],
    examples: ['male', 'female'],
  },
  {
    name: 'patient.birthDate',
    label: 'Birth Date',
    type: 'date',
    inputType: 'date',
    category: FHIR_FIELD_CATEGORIES.PATIENT,
    resource: 'Patient',
    fhirPath: 'Patient.birthDate',
  },
  {
    name: 'patient.deceased',
    label: 'Deceased Status',
    type: 'boolean',
    category: FHIR_FIELD_CATEGORIES.PATIENT,
    resource: 'Patient',
    fhirPath: 'Patient.deceasedBoolean',
  },
  {
    name: 'patient.maritalStatus',
    label: 'Marital Status',
    type: 'code',
    category: FHIR_FIELD_CATEGORIES.PATIENT,
    resource: 'Patient',
    fhirPath: 'Patient.maritalStatus.coding.code',
    valueSet: ['S', 'M', 'D', 'W'],
  },
  {
    name: 'patient.language',
    label: 'Preferred Language',
    type: 'code',
    category: FHIR_FIELD_CATEGORIES.PATIENT,
    resource: 'Patient',
    fhirPath: 'Patient.communication.language.coding.code',
  },

  // ==================== VITAL SIGNS & OBSERVATIONS ====================
  {
    name: 'observation.bp_systolic',
    label: 'Blood Pressure - Systolic',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.VITAL_SIGNS,
    resource: 'Observation',
    fhirPath: 'Observation.component[systolic].valueQuantity.value',
    description: 'Systolic BP in mmHg',
    examples: ['120', '140', '160'],
  },
  {
    name: 'observation.bp_diastolic',
    label: 'Blood Pressure - Diastolic',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.VITAL_SIGNS,
    resource: 'Observation',
    fhirPath: 'Observation.component[diastolic].valueQuantity.value',
    description: 'Diastolic BP in mmHg',
    examples: ['80', '90', '100'],
  },
  {
    name: 'observation.heart_rate',
    label: 'Heart Rate',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.VITAL_SIGNS,
    resource: 'Observation',
    fhirPath: 'Observation.valueQuantity.value',
    description: 'Heart rate in bpm',
    examples: ['60', '80', '100'],
  },
  {
    name: 'observation.temperature',
    label: 'Body Temperature',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.VITAL_SIGNS,
    resource: 'Observation',
    fhirPath: 'Observation.valueQuantity.value',
    description: 'Temperature in °F',
    examples: ['98.6', '100.4', '101.5'],
  },
  {
    name: 'observation.respiratory_rate',
    label: 'Respiratory Rate',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.VITAL_SIGNS,
    resource: 'Observation',
    fhirPath: 'Observation.valueQuantity.value',
    description: 'Breaths per minute',
  },
  {
    name: 'observation.oxygen_saturation',
    label: 'Oxygen Saturation (SpO2)',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.VITAL_SIGNS,
    resource: 'Observation',
    fhirPath: 'Observation.valueQuantity.value',
    description: 'O2 saturation %',
    examples: ['95', '92', '88'],
  },
  {
    name: 'observation.weight',
    label: 'Weight',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.VITAL_SIGNS,
    resource: 'Observation',
    fhirPath: 'Observation.valueQuantity.value',
    description: 'Weight in kg or lbs',
  },
  {
    name: 'observation.height',
    label: 'Height',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.VITAL_SIGNS,
    resource: 'Observation',
    fhirPath: 'Observation.valueQuantity.value',
    description: 'Height in cm or inches',
  },
  {
    name: 'observation.bmi',
    label: 'BMI',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.VITAL_SIGNS,
    resource: 'Observation',
    fhirPath: 'Observation.valueQuantity.value',
    description: 'Body Mass Index',
    examples: ['18.5', '25', '30'],
  },

  // ==================== LABORATORY RESULTS ====================
  {
    name: 'observation.lab_glucose',
    label: 'Blood Glucose',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.LAB_RESULTS,
    resource: 'Observation',
    fhirPath: 'Observation.valueQuantity.value',
    description: 'Glucose mg/dL',
    examples: ['100', '126', '200'],
  },
  {
    name: 'observation.lab_a1c',
    label: 'Hemoglobin A1c',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.LAB_RESULTS,
    resource: 'Observation',
    fhirPath: 'Observation.valueQuantity.value',
    description: 'HbA1c %',
    examples: ['5.7', '6.5', '7.0'],
  },
  {
    name: 'observation.lab_cholesterol',
    label: 'Total Cholesterol',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.LAB_RESULTS,
    resource: 'Observation',
    fhirPath: 'Observation.valueQuantity.value',
    description: 'Cholesterol mg/dL',
  },
  {
    name: 'observation.lab_ldl',
    label: 'LDL Cholesterol',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.LAB_RESULTS,
    resource: 'Observation',
    fhirPath: 'Observation.valueQuantity.value',
    description: 'LDL mg/dL',
  },
  {
    name: 'observation.lab_creatinine',
    label: 'Creatinine',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.LAB_RESULTS,
    resource: 'Observation',
    fhirPath: 'Observation.valueQuantity.value',
    description: 'Serum creatinine mg/dL',
  },
  {
    name: 'observation.lab_egfr',
    label: 'eGFR',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.LAB_RESULTS,
    resource: 'Observation',
    fhirPath: 'Observation.valueQuantity.value',
    description: 'Estimated GFR',
    examples: ['60', '45', '30'],
  },
  {
    name: 'observation.lab_interpretation',
    label: 'Lab Result Interpretation',
    type: 'code',
    category: FHIR_FIELD_CATEGORIES.LAB_RESULTS,
    resource: 'Observation',
    fhirPath: 'Observation.interpretation.coding.code',
    valueSet: ['N', 'H', 'L', 'HH', 'LL', 'A'],
  },

  // ==================== MEDICATIONS ====================
  {
    name: 'medication.code',
    label: 'Medication Code',
    type: 'code',
    category: FHIR_FIELD_CATEGORIES.MEDICATIONS,
    resource: 'MedicationRequest',
    fhirPath: 'MedicationRequest.medicationCodeableConcept.coding.code',
    description: 'RxNorm code',
  },
  {
    name: 'medication.name',
    label: 'Medication Name',
    type: 'string',
    category: FHIR_FIELD_CATEGORIES.MEDICATIONS,
    resource: 'MedicationRequest',
    fhirPath: 'MedicationRequest.medicationCodeableConcept.text',
  },
  {
    name: 'medication.status',
    label: 'Medication Status',
    type: 'code',
    category: FHIR_FIELD_CATEGORIES.MEDICATIONS,
    resource: 'MedicationRequest',
    fhirPath: 'MedicationRequest.status',
    valueSet: ['active', 'completed', 'stopped', 'draft'],
  },
  {
    name: 'medication.intent',
    label: 'Medication Intent',
    type: 'code',
    category: FHIR_FIELD_CATEGORIES.MEDICATIONS,
    resource: 'MedicationRequest',
    fhirPath: 'MedicationRequest.intent',
    valueSet: ['order', 'plan', 'proposal'],
  },
  {
    name: 'medication.dosage_quantity',
    label: 'Dosage Quantity',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.MEDICATIONS,
    resource: 'MedicationRequest',
    fhirPath: 'MedicationRequest.dosageInstruction.doseAndRate.doseQuantity.value',
  },

  // ==================== CONDITIONS ====================
  {
    name: 'condition.code',
    label: 'Condition Code',
    type: 'code',
    category: FHIR_FIELD_CATEGORIES.CONDITIONS,
    resource: 'Condition',
    fhirPath: 'Condition.code.coding.code',
    description: 'ICD-10 or SNOMED code',
    examples: ['E11.9', 'I10', 'J44.0'],
  },
  {
    name: 'condition.category',
    label: 'Condition Category',
    type: 'code',
    category: FHIR_FIELD_CATEGORIES.CONDITIONS,
    resource: 'Condition',
    fhirPath: 'Condition.category.coding.code',
    valueSet: ['problem-list-item', 'encounter-diagnosis'],
  },
  {
    name: 'condition.severity',
    label: 'Condition Severity',
    type: 'code',
    category: FHIR_FIELD_CATEGORIES.CONDITIONS,
    resource: 'Condition',
    fhirPath: 'Condition.severity.coding.code',
    valueSet: ['mild', 'moderate', 'severe'],
  },
  {
    name: 'condition.clinicalStatus',
    label: 'Clinical Status',
    type: 'code',
    category: FHIR_FIELD_CATEGORIES.CONDITIONS,
    resource: 'Condition',
    fhirPath: 'Condition.clinicalStatus.coding.code',
    valueSet: ['active', 'recurrence', 'relapse', 'inactive', 'remission', 'resolved'],
  },
  {
    name: 'condition.onsetAge',
    label: 'Condition Onset Age',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.CONDITIONS,
    resource: 'Condition',
    fhirPath: 'Condition.onsetAge.value',
  },

  // ==================== PROCEDURES ====================
  {
    name: 'procedure.code',
    label: 'Procedure Code',
    type: 'code',
    category: FHIR_FIELD_CATEGORIES.PROCEDURES,
    resource: 'Procedure',
    fhirPath: 'Procedure.code.coding.code',
    description: 'CPT or SNOMED code',
  },
  {
    name: 'procedure.status',
    label: 'Procedure Status',
    type: 'code',
    category: FHIR_FIELD_CATEGORIES.PROCEDURES,
    resource: 'Procedure',
    fhirPath: 'Procedure.status',
    valueSet: ['preparation', 'in-progress', 'completed', 'stopped'],
  },
  {
    name: 'procedure.performedDate',
    label: 'Procedure Date',
    type: 'date',
    inputType: 'date',
    category: FHIR_FIELD_CATEGORIES.PROCEDURES,
    resource: 'Procedure',
    fhirPath: 'Procedure.performedDateTime',
  },

  // ==================== ALLERGIES ====================
  {
    name: 'allergy.code',
    label: 'Allergen Code',
    type: 'code',
    category: FHIR_FIELD_CATEGORIES.ALLERGIES,
    resource: 'AllergyIntolerance',
    fhirPath: 'AllergyIntolerance.code.coding.code',
  },
  {
    name: 'allergy.category',
    label: 'Allergy Category',
    type: 'code',
    category: FHIR_FIELD_CATEGORIES.ALLERGIES,
    resource: 'AllergyIntolerance',
    fhirPath: 'AllergyIntolerance.category',
    valueSet: ['food', 'medication', 'environment', 'biologic'],
  },
  {
    name: 'allergy.criticality',
    label: 'Allergy Criticality',
    type: 'code',
    category: FHIR_FIELD_CATEGORIES.ALLERGIES,
    resource: 'AllergyIntolerance',
    fhirPath: 'AllergyIntolerance.criticality',
    valueSet: ['low', 'high', 'unable-to-assess'],
  },
  {
    name: 'allergy.type',
    label: 'Allergy Type',
    type: 'code',
    category: FHIR_FIELD_CATEGORIES.ALLERGIES,
    resource: 'AllergyIntolerance',
    fhirPath: 'AllergyIntolerance.type',
    valueSet: ['allergy', 'intolerance'],
  },

  // ==================== ENCOUNTERS ====================
  {
    name: 'encounter.type',
    label: 'Encounter Type',
    type: 'code',
    category: FHIR_FIELD_CATEGORIES.ENCOUNTERS,
    resource: 'Encounter',
    fhirPath: 'Encounter.type.coding.code',
  },
  {
    name: 'encounter.class',
    label: 'Encounter Class',
    type: 'code',
    category: FHIR_FIELD_CATEGORIES.ENCOUNTERS,
    resource: 'Encounter',
    fhirPath: 'Encounter.class.code',
    valueSet: ['AMB', 'EMER', 'HH', 'IMP', 'ACUTE', 'NONAC'],
  },
  {
    name: 'encounter.status',
    label: 'Encounter Status',
    type: 'code',
    category: FHIR_FIELD_CATEGORIES.ENCOUNTERS,
    resource: 'Encounter',
    fhirPath: 'Encounter.status',
    valueSet: ['planned', 'arrived', 'in-progress', 'finished', 'cancelled'],
  },
  {
    name: 'encounter.priority',
    label: 'Encounter Priority',
    type: 'code',
    category: FHIR_FIELD_CATEGORIES.ENCOUNTERS,
    resource: 'Encounter',
    fhirPath: 'Encounter.priority.coding.code',
    valueSet: ['routine', 'urgent', 'stat'],
  },

  // ==================== APPOINTMENTS ====================
  {
    name: 'appointment.status',
    label: 'Appointment Status',
    type: 'code',
    category: FHIR_FIELD_CATEGORIES.APPOINTMENTS,
    resource: 'Appointment',
    fhirPath: 'Appointment.status',
    valueSet: ['proposed', 'pending', 'booked', 'arrived', 'fulfilled', 'cancelled', 'noshow'],
  },
  {
    name: 'appointment.serviceType',
    label: 'Service Type',
    type: 'code',
    category: FHIR_FIELD_CATEGORIES.APPOINTMENTS,
    resource: 'Appointment',
    fhirPath: 'Appointment.serviceType.coding.code',
  },
  {
    name: 'appointment.priority',
    label: 'Appointment Priority',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.APPOINTMENTS,
    resource: 'Appointment',
    fhirPath: 'Appointment.priority',
  },

  // ==================== COMPUTED VARIABLES ====================
  {
    name: 'var.bp_systolic_avg_24h',
    label: 'Avg Systolic BP (24h)',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.COMPUTED,
    resource: 'Computed',
    fhirPath: 'computed',
    description: 'Average systolic BP over last 24 hours',
  },
  {
    name: 'var.bp_diastolic_avg_24h',
    label: 'Avg Diastolic BP (24h)',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.COMPUTED,
    resource: 'Computed',
    fhirPath: 'computed',
    description: 'Average diastolic BP over last 24 hours',
  },
  {
    name: 'var.glucose_avg_7d',
    label: 'Avg Glucose (7 days)',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.COMPUTED,
    resource: 'Computed',
    fhirPath: 'computed',
  },
  {
    name: 'var.med_adherence_score',
    label: 'Medication Adherence Score',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.COMPUTED,
    resource: 'Computed',
    fhirPath: 'computed',
    description: '0-100 score',
  },
  {
    name: 'var.fall_risk_score',
    label: 'Fall Risk Score',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.COMPUTED,
    resource: 'Computed',
    fhirPath: 'computed',
  },
  {
    name: 'var.days_since_last_visit',
    label: 'Days Since Last Visit',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.COMPUTED,
    resource: 'Computed',
    fhirPath: 'computed',
  },
];

/**
 * Get fields by category
 */
export function getFieldsByCategory(category: string): FHIRField[] {
  return FHIR_FIELDS.filter((f) => f.category === category);
}

/**
 * Get field by name
 */
export function getFieldByName(name: string): FHIRField | undefined {
  return FHIR_FIELDS.find((f) => f.name === name);
}

/**
 * Get all categories with field counts
 */
export function getCategoriesWithCounts() {
  const counts: Record<string, number> = {};
  FHIR_FIELDS.forEach((field) => {
    counts[field.category] = (counts[field.category] || 0) + 1;
  });
  return Object.entries(FHIR_FIELD_CATEGORIES).map(([key, label]) => ({
    key,
    label,
    count: counts[label] || 0,
  }));
}
