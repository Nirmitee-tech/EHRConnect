/**
 * Shared types for patient detail components
 */

export interface PatientDetails {
  id: string;
  name: string;
  mrn: string;
  dob: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
}

export interface VitalsFormData {
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  heartRate: string;
  temperature: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  weight: string;
  height: string;
}

export interface ProblemFormData {
  condition: string;
  category: 'problem-list-item' | 'encounter-diagnosis';
  severity: 'mild' | 'moderate' | 'severe' | '';
  onsetDate: string;
}

export interface MedicationFormData {
  medication: string;
  dosageValue: string;
  dosageUnit: string;
  route: string;
  frequency: string;
  period: string;
  periodUnit: string;
  instructions: string;
}

export interface TabConfig {
  id: string;
  label: string;
  icon: any;
  count?: number;
}

export interface SavedSection {
  id?: string;
  title: string;
  type: string;
  author: string;
  date: string;
  data: Record<string, any>;
  signatures: string[];
}

export interface TelecomItem {
  system: string;
  value?: string;
}

export interface IdentifierItem {
  type?: {
    coding?: Array<{
      code?: string;
    }>;
  };
  value?: string;
}

export interface FHIRBundleEntry<T> {
  resource: T;
}

export interface EncounterFormData {
  encounterClass: string;
  practitioner?: string;
  location?: string;
}
