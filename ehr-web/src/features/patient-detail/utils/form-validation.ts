/**
 * Form Validation Configuration
 * Defines required fields and validation rules for each form type
 */

export interface ValidationRule {
  field: string;
  label: string;
  required: boolean;
}

export interface FormValidationConfig {
  [formType: string]: ValidationRule[];
}

/**
 * Validation rules for all encounter form types
 */
export const FORM_VALIDATION_RULES: FormValidationConfig = {
  'eye-exam': [
    { field: 'visualAcuityOD', label: 'Visual Acuity (OD)', required: true },
    { field: 'visualAcuityOS', label: 'Visual Acuity (OS)', required: true }
  ],
  'functional-and-cognitive-status': [
    { field: 'functionalStatus', label: 'Functional Status', required: true },
    { field: 'cognitiveStatus', label: 'Cognitive Status', required: true }
  ],
  'observation': [
    { field: 'observationType', label: 'Observation Type', required: true },
    { field: 'observationCode', label: 'Observation Code', required: true },
    { field: 'value', label: 'Value', required: true }
  ],
  'speech-dictation': [
    { field: 'transcription', label: 'Transcription', required: true }
  ],
  'procedure-order': [
    { field: 'procedureCode', label: 'Procedure Code', required: true },
    { field: 'procedureName', label: 'Procedure Name', required: true },
    { field: 'priority', label: 'Priority', required: true }
  ],
  'lab-results': [
    { field: 'testName', label: 'Test Name', required: true },
    { field: 'result', label: 'Result', required: true },
    { field: 'interpretation', label: 'Interpretation', required: true }
  ],
  'imaging-orders': [
    { field: 'imagingType', label: 'Imaging Type', required: true },
    { field: 'bodySite', label: 'Body Site', required: true },
    { field: 'indication', label: 'Indication', required: true }
  ],
  'new-questionnaire': [
    { field: 'questionnaireTitle', label: 'Questionnaire Title', required: true },
    { field: 'responses', label: 'Responses', required: true }
  ],
  'questionnaire-responses': [
    { field: 'questionnaireTitle', label: 'Questionnaire Title', required: true },
    { field: 'responses', label: 'Responses', required: true }
  ],
  'forms': [
    { field: 'title', label: 'Title', required: true },
    { field: 'content', label: 'Content', required: true }
  ],
  'track-anything': [
    { field: 'title', label: 'Title', required: true },
    { field: 'content', label: 'Content', required: true }
  ],
  'patient-reminders': [
    { field: 'title', label: 'Title', required: true },
    { field: 'dueDate', label: 'Due Date', required: true }
  ],
  'clinical-reminders': [
    { field: 'title', label: 'Title', required: true },
    { field: 'dueDate', label: 'Due Date', required: true }
  ],
  'amendments': [
    { field: 'title', label: 'Title', required: true },
    { field: 'content', label: 'Content', required: true }
  ],
  'letters': [
    { field: 'title', label: 'Title', required: true },
    { field: 'content', label: 'Content', required: true }
  ],
  'review-of-systems-checks': [
    { field: 'title', label: 'Title', required: true },
    { field: 'content', label: 'Content', required: true }
  ],
  'soap': [
    { field: 'subjective', label: 'Subjective', required: true }
  ],
  'care-plan': [
    { field: 'title', label: 'Title', required: true }
  ],
  'clinical-instructions': [
    { field: 'instructions', label: 'Instructions', required: true }
  ],
  'clinical-notes': [
    { field: 'notes', label: 'Notes', required: true }
  ],
  'review-of-systems': [
    { field: 'systems', label: 'Systems', required: true }
  ],
  'vitals': [
    { field: 'temperature', label: 'Temperature', required: false },
    { field: 'bloodPressure', label: 'Blood Pressure', required: false }
  ],
  'prescriptions': [
    { field: 'medication', label: 'Medication', required: true }
  ]
};

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate form data based on form type
 */
export const validateForm = (
  formType: string,
  data: Record<string, any>
): ValidationResult => {
  const rules = FORM_VALIDATION_RULES[formType];

  if (!rules) {
    // No specific rules for this form type, fall back to generic validation
    return validateGenericForm(data);
  }

  const errors: string[] = [];

  rules.forEach(rule => {
    if (rule.required) {
      const value = data[rule.field];

      // Check if value is empty
      if (value === undefined || value === null || value === '') {
        errors.push(`${rule.label} is required`);
      }

      // Check array fields (like responses)
      if (Array.isArray(value) && value.length === 0) {
        errors.push(`${rule.label} must have at least one item`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generic form validation (at least one field must have data)
 */
const validateGenericForm = (data: Record<string, any>): ValidationResult => {
  const hasData = Object.values(data).some(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => v !== '' && v !== null && v !== undefined);
    }
    return value !== '' && value !== null && value !== undefined;
  });

  if (!hasData) {
    return {
      isValid: false,
      errors: ['At least one field must be filled in']
    };
  }

  return {
    isValid: true,
    errors: []
  };
};
