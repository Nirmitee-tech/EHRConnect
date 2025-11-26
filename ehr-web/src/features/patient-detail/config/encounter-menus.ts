/**
 * Encounter menu configuration
 * Defines the dropdown menu structure for encounter documentation
 */

export interface EncounterMenuConfig {
  [category: string]: string[];
}

/**
 * OpenEMR-style dropdown menu structure for encounter documentation
 */
export const ENCOUNTER_DROPDOWN_MENUS: EncounterMenuConfig = {
  Administrative: [
    'Forms',
    'Track Anything',
    'Patient Reminders',
    'Clinical Reminders',
    'Amendments',
    'Letters'
  ],
  Clinical: [
    'Care Plan',
    'Clinical Instructions',
    'Patient Instructions',
    'Clinical Notes',
    'Eye Exam',
    'Functional and Cognitive Status',
    'Observation',
    'Review Of Systems',
    'Review of Systems Checks',
    'SOAP',
    'Speech Dictation',
    'Vitals'
  ],
  Orders: [
    'Procedure Order',
    'Lab Results',
    'Imaging Orders',
    'Prescriptions'
  ],
  Questionnaires: [
    'New Questionnaire',
    'Questionnaire Responses'
  ]
};

/**
 * Convert menu item label to tab ID
 */
export function menuItemToTabId(label: string): string {
  return label.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Convert tab ID to display label
 */
export function tabIdToLabel(tabId: string): string {
  return tabId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * List of implemented sub-tabs
 */
export const IMPLEMENTED_SUB_TABS = [
  'summary',
  'care-plan',
  'clinical-instructions',
  'patient-instructions',
  'clinical-notes',
  'review-of-systems',
  'soap',
  'vitals',
  'prescriptions',
  'eye-exam',
  'functional-and-cognitive-status',
  'observation',
  'review-of-systems-checks',
  'speech-dictation',
  'forms',
  'procedure-order',
  'lab-results',
  'imaging-orders',
  'new-questionnaire',
  'questionnaire-responses',
  'track-anything',
  'patient-reminders',
  'clinical-reminders',
  'amendments',
  'letters'
] as const;

export type ImplementedSubTab = typeof IMPLEMENTED_SUB_TABS[number];
