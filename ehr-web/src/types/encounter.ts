export type EncounterStatus = 'planned' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled' | 'entered-in-error';

export type EncounterClass = 'ambulatory' | 'emergency' | 'inpatient' | 'outpatient' | 'virtual';

export interface Encounter {
  id: string;
  appointmentId?: string; // Link to the originating appointment
  patientId: string;
  patientName: string;
  practitionerId: string;
  practitionerName: string;
  status: EncounterStatus;
  class: EncounterClass;
  startTime: Date | string;
  endTime?: Date | string;
  duration?: number; // in minutes
  reasonCode?: string;
  reasonDisplay?: string;
  type?: string;
  priority?: 'routine' | 'urgent' | 'emergency';
  location?: string;

  // Clinical information
  chiefComplaint?: string;
  presentingProblem?: string;
  diagnosis?: Array<{
    code: string;
    display: string;
    type: 'primary' | 'secondary' | 'differential';
  }>;

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

  // Documentation
  notes?: string;
  clinicalNotes?: string;

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
