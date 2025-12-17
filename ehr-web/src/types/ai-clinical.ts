// AI Clinical Intelligence Type Definitions

export interface NoteCompletion {
  completion: string;
  suggestions: string[];
  aiEnabled: boolean;
  error?: string;
}

export interface Diagnosis {
  icd10: string;
  diagnosis: string;
  confidence: number;
  supportingFactors: string[];
  nextSteps: string[];
}

export interface DifferentialDiagnosisResult {
  diagnoses: Diagnosis[];
  aiEnabled: boolean;
  error?: string;
}

export interface MedicationInteraction {
  drugs: string[];
  risk: string;
  action: string;
}

export interface MedicationInteractions {
  critical: MedicationInteraction[];
  moderate: MedicationInteraction[];
  minor: MedicationInteraction[];
  overallRisk: 'low' | 'medium' | 'high';
  aiEnabled: boolean;
  error?: string;
}

export interface RiskAssessment {
  type: string;
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  recommendations: string[];
}

export interface PatientRiskResult {
  risks: RiskAssessment[];
  overallRisk: 'low' | 'medium' | 'high';
  aiEnabled: boolean;
  error?: string;
}

export interface NaturalQueryResult {
  sql: string | null;
  explanation: string;
  resultColumns?: string[];
  parameters?: Record<string, any>;
  aiEnabled: boolean;
  error?: string;
}

export interface MedicalCode {
  code: string;
  description: string;
  confidence: number;
  position?: string;
  modifiers?: string[];
}

export interface CodingSuggestions {
  icd10: MedicalCode[];
  cpt: MedicalCode[];
  estimatedReimbursement?: string;
  documentationGaps?: string[];
  aiEnabled: boolean;
  error?: string;
}

export interface ClinicalGuideline {
  source: string;
  recommendation: string;
  evidenceLevel: string;
  references: string[];
}

export interface GuidelinesResult {
  guidelines: ClinicalGuideline[];
  keyActions: string[];
  aiEnabled: boolean;
  error?: string;
}

export interface DocumentationIssue {
  type: string;
  element: string;
  severity: string;
}

export interface DocumentationImprovement {
  issue: string;
  suggestion: string;
}

export interface QualityCheckResult {
  score: number;
  issues: DocumentationIssue[];
  strengths?: string[];
  improvements: DocumentationImprovement[];
  aiEnabled: boolean;
  error?: string;
}

export interface PatientContext {
  age: number;
  gender: string;
  chiefComplaint?: string;
  medicalHistory?: string;
  medications?: string;
}

export interface AIServiceStatus {
  enabled: boolean;
  model: string;
  apiUrl: string;
  features: string[];
}
