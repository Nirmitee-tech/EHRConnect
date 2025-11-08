'use client';

import { create } from 'zustand';
import { carePlanService, type CarePlanFormData } from '@/services/careplan.service';
import { patientService } from '@/services/patient.service';
import { fhirService } from '@/lib/medplum';
import { saveDraft, clearDraft } from '../utils/form-persistence';

/**
 * Map form types to LOINC codes for FHIR DocumentReference
 */
const getLoincCode = (formType: string): string => {
  const loincCodes: Record<string, string> = {
    'soap': '34133-9',                              // SOAP note
    'care-plan': '18776-5',                         // Plan of care
    'clinical-notes': '11506-3',                    // Progress note
    'clinical-instructions': '51847-2',             // Assessment and plan
    'review-of-systems': '10187-3',                 // Review of systems
    'eye-exam': '70936-0',                          // Ophthalmology note
    'functional-and-cognitive-status': '47420-5',   // Functional status
    'observation': '11506-3',                       // Clinical observation
    'speech-dictation': '28570-0',                  // Procedure note
    'procedure-order': '18776-5',                   // Plan of care
    'lab-results': '11502-2',                       // Laboratory report
    'imaging-orders': '18748-4',                    // Diagnostic imaging study
    'new-questionnaire': '74468-0',                 // Questionnaire
    'questionnaire-responses': '74468-0',           // Questionnaire
    'forms': '51855-5',                             // Patient note
    'track-anything': '51855-5',                    // Patient note
    'patient-reminders': '51855-5',                 // Patient note
    'clinical-reminders': '51855-5',                // Patient note
    'amendments': '51855-5',                        // Patient note
    'letters': '51855-5',                           // Patient note
    'review-of-systems-checks': '10187-3',          // Review of systems
    'vitals': '8716-3',                             // Vital signs
    'prescriptions': '57833-6'                      // Prescription
  };

  return loincCodes[formType] || '11506-3'; // Default to progress note
};
import type {
  EncounterFormData,
  FHIRBundleEntry,
  IdentifierItem,
  MedicationFormData,
  PatientDetails,
  ProblemFormData,
  SavedSection,
  TelecomItem,
  VitalsFormData
} from '@/app/patients/[id]/components/types';

type DrawerKey =
  | 'edit'
  | 'vitals'
  | 'encounter'
  | 'problem'
  | 'medication'
  | 'allergy'
  | 'medicalInfo'
  | 'insurance'
  | 'immunization'
  | 'imaging'
  | 'lab'
  | 'document';

type SoapForm = {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
};

type ClinicalInstructionsForm = {
  patientInstructions: string;
  followUpInstructions: string;
};

type ClinicalNotesForm = {
  notes: string;
};

type EyeExamForm = {
  visualAcuityOD: string;
  visualAcuityOS: string;
  intraocularPressureOD: string;
  intraocularPressureOS: string;
  pupilsOD: string;
  pupilsOS: string;
  externalExam: string;
  anteriorSegment: string;
  posteriorSegment: string;
  fundusOD: string;
  fundusOS: string;
  notes: string;
};

type FunctionalCognitiveForm = {
  functionalStatus: string;
  mobility: string;
  adlIndependence: string;
  cognitiveStatus: string;
  orientation: string;
  memory: string;
  attention: string;
  language: string;
  executiveFunction: string;
  behavioralObservations: string;
  notes: string;
};

type ObservationForm = {
  observationType: string;
  observationCode: string;
  value: string;
  unit: string;
  interpretation: string;
  method: string;
  bodySite: string;
  notes: string;
};

type SpeechDictationForm = {
  transcription: string;
  category: string;
};

type ProcedureOrderForm = {
  procedureCode: string;
  procedureName: string;
  priority: string;
  status: string;
  reasonCode: string;
  reasonDescription: string;
  bodySite: string;
  performerType: string;
  scheduledDate: string;
  instructions: string;
  notes: string;
};

type LabResultsForm = {
  testName: string;
  testCode: string;
  result: string;
  unit: string;
  referenceRange: string;
  interpretation: string;
  specimenType: string;
  collectionDate: string;
  resultDate: string;
  performingLab: string;
  notes: string;
};

type ImagingOrdersForm = {
  imagingType: string;
  procedureCode: string;
  bodySite: string;
  laterality: string;
  priority: string;
  indication: string;
  clinicalQuestion: string;
  contrast: string;
  scheduledDate: string;
  performingFacility: string;
  specialInstructions: string;
  notes: string;
};

type QuestionnaireForm = {
  questionnaireTitle: string;
  questionnaireType: string;
  responses: Array<{
    question: string;
    answer: string;
  }>;
  notes: string;
};

type GenericAdministrativeForm = {
  title: string;
  category: string;
  content: string;
  dueDate?: string;
  priority?: string;
  status?: string;
  assignedTo?: string;
  notes: string;
};

type PortalAccessStatus = {
  hasAccess: boolean;
  email?: string;
  grantedAt?: string;
};

type ClinicalNote = {
  id: string;
  date: Date | string;
  noteType: string;
  category: string;
  narrative: string;
  createdBy?: string;
  createdByName?: string;
  isFavorite?: boolean;
  tags?: string[];
};

type CarePlanFormStringField = {
  [K in keyof CarePlanFormData]: CarePlanFormData[K] extends string | undefined ? K : never;
}[keyof CarePlanFormData];

interface PatientDetailStore {
  patientId: string | null;
  encounterIdFromQuery: string | null;
  tabFromQuery: string | null;
  hasHydratedFromQuery: boolean;
  loading: boolean;
  patient: PatientDetails | null;

  activeTab: string;
  openTabs: string[];
  selectedEncounter?: string;
  openEncounterTabs: string[];
  openEncounterSubTabs: Record<string, string[]>;
  activeEncounterSubTab: Record<string, string>;
  encounterSavedData: Record<string, SavedSection[]>;
  openDropdown: Record<string, string | null>;
  sidebarCollapsed: boolean;

  soapForms: Record<string, SoapForm>;
  carePlanForms: Record<string, CarePlanFormData>;
  clinicalInstructionsForms: Record<string, ClinicalInstructionsForm>;
  clinicalNotesForms: Record<string, ClinicalNotesForm>;
  rosForms: Record<string, Record<string, string>>;
  eyeExamForms: Record<string, EyeExamForm>;
  functionalCognitiveForms: Record<string, FunctionalCognitiveForm>;
  observationForms: Record<string, ObservationForm>;
  speechDictationForms: Record<string, SpeechDictationForm>;
  procedureOrderForms: Record<string, ProcedureOrderForm>;
  labResultsForms: Record<string, LabResultsForm>;
  imagingOrdersForms: Record<string, ImagingOrdersForm>;
  questionnaireForms: Record<string, QuestionnaireForm>;
  genericAdminForms: Record<string, GenericAdministrativeForm>;

  encounters: any[];
  problems: any[];
  medications: any[];
  allergies: any[];
  observations: any[];
  insurances: any[];
  immunizations: any[];
  imagingStudies: any[];
  labResults: any[];
  documents: any[];
  carePlans: Record<string, any[]>;
  editingCarePlanId: Record<string, string | null>;
  currentCarePlanData: Record<string, CarePlanFormData | null>;

  clinicalNotes: Record<string, ClinicalNote[]>;
  showClinicalNoteEditor: boolean;
  editingClinicalNote: ClinicalNote | null;
  clinicalNoteMode: 'create' | 'edit';
  currentEditingEncounterId: string;

  drawers: Record<DrawerKey, boolean>;
  portalAccessDialogOpen: boolean;
  portalAccessStatus: PortalAccessStatus;
  loadingPortalAccess: boolean;

  initialize: (payload: {
    patientId: string;
    encounterIdFromQuery?: string | null;
    tabFromQuery?: string | null;
  }) => void;
  setActiveTab: (tabId: string) => void;
  closeTab: (tabId: string) => void;
  toggleSidebar: () => void;
  setSelectedEncounter: (encounterId?: string) => void;
  setOpenEncounterTab: (encounterId: string) => void;
  closeEncounterTab: (encounterId: string) => void;
  addEncounterSubTab: (encounterId: string, tabId: string) => void;
  removeEncounterSubTab: (encounterId: string, tabId: string) => void;
  setEncounterActiveSubTab: (encounterId: string, tabId: string) => void;
  setEncounterDropdown: (encounterId: string, dropdown: string | null) => void;

  updateSoapForm: (encounterId: string, field: keyof SoapForm, value: string) => void;
  setSoapForm: (encounterId: string, form: SoapForm) => void;
  updateCarePlanForm: (encounterId: string, field: CarePlanFormStringField, value: string) => void;
  setCarePlanForm: (encounterId: string, form: CarePlanFormData) => void;
  updateClinicalInstructionsForm: (encounterId: string, field: keyof ClinicalInstructionsForm, value: string) => void;
  setClinicalInstructionsForm: (encounterId: string, form: ClinicalInstructionsForm) => void;
  updateClinicalNotesForm: (encounterId: string, value: string) => void;
  setClinicalNotesForm: (encounterId: string, form: ClinicalNotesForm) => void;
  updateRosForm: (encounterId: string, system: string, value: string) => void;
  setRosForm: (encounterId: string, form: Record<string, string>) => void;

  updateEyeExamForm: (encounterId: string, field: keyof EyeExamForm, value: string) => void;
  setEyeExamForm: (encounterId: string, form: EyeExamForm) => void;
  updateFunctionalCognitiveForm: (encounterId: string, field: keyof FunctionalCognitiveForm, value: string) => void;
  setFunctionalCognitiveForm: (encounterId: string, form: FunctionalCognitiveForm) => void;
  updateObservationForm: (encounterId: string, field: keyof ObservationForm, value: string) => void;
  setObservationForm: (encounterId: string, form: ObservationForm) => void;
  updateSpeechDictationForm: (encounterId: string, field: keyof SpeechDictationForm, value: string) => void;
  setSpeechDictationForm: (encounterId: string, form: SpeechDictationForm) => void;
  updateProcedureOrderForm: (encounterId: string, field: keyof ProcedureOrderForm, value: string) => void;
  setProcedureOrderForm: (encounterId: string, form: ProcedureOrderForm) => void;
  updateLabResultsForm: (encounterId: string, field: keyof LabResultsForm, value: string) => void;
  setLabResultsForm: (encounterId: string, form: LabResultsForm) => void;
  updateImagingOrdersForm: (encounterId: string, field: keyof ImagingOrdersForm, value: string) => void;
  setImagingOrdersForm: (encounterId: string, form: ImagingOrdersForm) => void;
  updateQuestionnaireForm: (encounterId: string, field: keyof QuestionnaireForm, value: any) => void;
  setQuestionnaireForm: (encounterId: string, form: QuestionnaireForm) => void;
  updateGenericAdminForm: (encounterId: string, field: keyof GenericAdministrativeForm, value: any) => void;
  setGenericAdminForm: (encounterId: string, form: GenericAdministrativeForm) => void;
  setEditingCarePlanId: (encounterId: string, carePlanId: string | null) => void;
  setCurrentCarePlanData: (encounterId: string, data: CarePlanFormData | null) => void;

  setDrawerState: (drawer: DrawerKey, isOpen: boolean) => void;
  setPortalAccessDialogOpen: (isOpen: boolean) => void;

  setClinicalNotes: (encounterId: string, updater: (notes: ClinicalNote[]) => ClinicalNote[]) => void;
  setClinicalNoteEditorState: (payload: {
    isOpen: boolean;
    mode?: 'create' | 'edit';
    encounterId?: string;
    note?: ClinicalNote | null;
  }) => void;
  updateEncounterSavedData: (encounterId: string, updater: (sections: SavedSection[]) => SavedSection[]) => void;

  loadAllPatientData: () => Promise<void>;
  refreshData: () => Promise<void>;
  checkPortalAccess: () => Promise<void>;
  hydrateEncounterFromQuery: () => void;
  loadEncounterDocumentation: (encounterId: string) => Promise<void>;
  saveDocumentReference: (encounterId: string, section: SavedSection, documentId?: string) => Promise<void>;
  handleStartVisit: (encounterData: EncounterFormData) => Promise<void>;
  handleSaveVitals: (vitalsData: VitalsFormData) => Promise<void>;
  handleSaveProblem: (problemData: ProblemFormData) => Promise<void>;
  handleSaveMedication: (medicationData: MedicationFormData) => Promise<void>;
  handleSaveInsurance: (insuranceData: any) => Promise<void>;
  handleEditPatient: (data: any) => Promise<void>;
}

const defaultSoapForm: SoapForm = {
  subjective: '',
  objective: '',
  assessment: '',
  plan: ''
};

const defaultEyeExamForm: EyeExamForm = {
  visualAcuityOD: '',
  visualAcuityOS: '',
  intraocularPressureOD: '',
  intraocularPressureOS: '',
  pupilsOD: '',
  pupilsOS: '',
  externalExam: '',
  anteriorSegment: '',
  posteriorSegment: '',
  fundusOD: '',
  fundusOS: '',
  notes: ''
};

const defaultFunctionalCognitiveForm: FunctionalCognitiveForm = {
  functionalStatus: '',
  mobility: '',
  adlIndependence: '',
  cognitiveStatus: '',
  orientation: '',
  memory: '',
  attention: '',
  language: '',
  executiveFunction: '',
  behavioralObservations: '',
  notes: ''
};

const defaultObservationForm: ObservationForm = {
  observationType: '',
  observationCode: '',
  value: '',
  unit: '',
  interpretation: '',
  method: '',
  bodySite: '',
  notes: ''
};

const defaultSpeechDictationForm: SpeechDictationForm = {
  transcription: '',
  category: ''
};

const defaultProcedureOrderForm: ProcedureOrderForm = {
  procedureCode: '',
  procedureName: '',
  priority: '',
  status: '',
  reasonCode: '',
  reasonDescription: '',
  bodySite: '',
  performerType: '',
  scheduledDate: '',
  instructions: '',
  notes: ''
};

const defaultLabResultsForm: LabResultsForm = {
  testName: '',
  testCode: '',
  result: '',
  unit: '',
  referenceRange: '',
  interpretation: '',
  specimenType: '',
  collectionDate: '',
  resultDate: '',
  performingLab: '',
  notes: ''
};

const defaultImagingOrdersForm: ImagingOrdersForm = {
  imagingType: '',
  procedureCode: '',
  bodySite: '',
  laterality: '',
  priority: '',
  indication: '',
  clinicalQuestion: '',
  contrast: '',
  scheduledDate: '',
  performingFacility: '',
  specialInstructions: '',
  notes: ''
};

const defaultQuestionnaireForm: QuestionnaireForm = {
  questionnaireTitle: '',
  questionnaireType: '',
  responses: [],
  notes: ''
};

const defaultGenericAdminForm: GenericAdministrativeForm = {
  title: '',
  category: '',
  content: '',
  notes: ''
};

const defaultCarePlanForm: CarePlanFormData = {
  title: '',
  description: '',
  status: 'draft',
  intent: 'plan',
  activities: [],
  goals: '',
  interventions: '',
  outcomes: ''
};

const defaultClinicalInstructionsForm: ClinicalInstructionsForm = {
  patientInstructions: '',
  followUpInstructions: ''
};

const defaultClinicalNotesForm: ClinicalNotesForm = {
  notes: ''
};

const initialDrawerState: Record<DrawerKey, boolean> = {
  edit: false,
  vitals: false,
  encounter: false,
  problem: false,
  medication: false,
  allergy: false,
  medicalInfo: false,
  insurance: false,
  immunization: false,
  imaging: false,
  lab: false,
  document: false
};

const initialState = {
  patientId: null,
  encounterIdFromQuery: null,
  tabFromQuery: null,
  hasHydratedFromQuery: false,
  loading: true,
  patient: null,
  activeTab: 'dashboard',
  openTabs: ['dashboard'],
  selectedEncounter: undefined,
  openEncounterTabs: [],
  openEncounterSubTabs: {},
  activeEncounterSubTab: {},
  encounterSavedData: {},
  openDropdown: {},
  sidebarCollapsed: false,
  soapForms: {},
  carePlanForms: {},
  clinicalInstructionsForms: {},
  clinicalNotesForms: {},
  rosForms: {},
  eyeExamForms: {},
  functionalCognitiveForms: {},
  observationForms: {},
  speechDictationForms: {},
  procedureOrderForms: {},
  labResultsForms: {},
  imagingOrdersForms: {},
  questionnaireForms: {},
  genericAdminForms: {},
  encounters: [],
  problems: [],
  medications: [],
  allergies: [],
  observations: [],
  insurances: [],
  immunizations: [],
  imagingStudies: [],
  labResults: [],
  documents: [],
  carePlans: {},
  editingCarePlanId: {},
  currentCarePlanData: {},
  clinicalNotes: {},
  showClinicalNoteEditor: false,
  editingClinicalNote: null,
  clinicalNoteMode: 'create' as const,
  currentEditingEncounterId: '',
  drawers: initialDrawerState,
  portalAccessDialogOpen: false,
  portalAccessStatus: { hasAccess: false },
  loadingPortalAccess: false
};

export const usePatientDetailStore = create<PatientDetailStore>((set, get) => ({
  ...initialState,
  initialize: ({ patientId, encounterIdFromQuery = null, tabFromQuery = null }) => {
    const currentState = get();

    // Only fully reset if patient ID changes, otherwise just update query params
    if (currentState.patientId !== patientId) {
      set({
        ...initialState,
        patientId,
        encounterIdFromQuery,
        tabFromQuery,
        activeTab: tabFromQuery || 'dashboard',
        openTabs: [tabFromQuery || 'dashboard'],
        loading: true
      });
    } else {
      // Same patient, just update query params without resetting patient data
      set({
        encounterIdFromQuery,
        tabFromQuery,
        hasHydratedFromQuery: false // Reset this so hydration can happen again
      });
    }
  },
  setActiveTab: (tabId) => {
    set((state) => {
      if (state.activeTab === tabId && state.openTabs.includes(tabId)) {
        return state;
      }
      const openTabs = state.openTabs.includes(tabId)
        ? state.openTabs
        : [...state.openTabs, tabId];
      return {
        ...state,
        activeTab: tabId,
        openTabs
      };
    });
  },
  closeTab: (tabId) => {
    set((state) => {
      const openTabs = state.openTabs.filter((id) => id !== tabId);
      if (!openTabs.length) {
        return {
          ...state,
          openTabs: ['dashboard'],
          activeTab: 'dashboard'
        };
      }
      const nextActiveTab = state.activeTab === tabId ? openTabs[openTabs.length - 1] : state.activeTab;
      return {
        ...state,
        openTabs,
        activeTab: nextActiveTab
      };
    });
  },
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSelectedEncounter: (encounterId) => {
    set({ selectedEncounter: encounterId });
  },
  setOpenEncounterTab: (encounterId) => {
    set((state) => {
      const tabId = `encounter-${encounterId}`;
      const openEncounterTabs = state.openEncounterTabs.includes(encounterId)
        ? state.openEncounterTabs
        : [...state.openEncounterTabs, encounterId];
      const openTabs = state.openTabs.includes(tabId)
        ? state.openTabs
        : [...state.openTabs, tabId];
      return {
        ...state,
        activeTab: tabId,
        openTabs,
        openEncounterTabs,
        selectedEncounter: encounterId
      };
    });
  },
  closeEncounterTab: (encounterId) => {
    set((state) => {
      const openEncounterTabs = state.openEncounterTabs.filter((id) => id !== encounterId);
      const openTabs = state.openTabs.filter((tab) => tab !== `encounter-${encounterId}`);
      const nextActiveTab = state.activeTab === `encounter-${encounterId}` ? 'dashboard' : state.activeTab;
      return {
        ...state,
        openEncounterTabs,
        openTabs: openTabs.length ? openTabs : ['dashboard'],
        activeTab: openTabs.length ? nextActiveTab : 'dashboard',
        selectedEncounter: state.selectedEncounter === encounterId ? undefined : state.selectedEncounter
      };
    });
  },
  addEncounterSubTab: (encounterId, tabId) => {
    set((state) => {
      const currentTabs = state.openEncounterSubTabs[encounterId] || [];
      if (currentTabs.includes(tabId)) {
        return state;
      }
      return {
        ...state,
        openEncounterSubTabs: {
          ...state.openEncounterSubTabs,
          [encounterId]: [...currentTabs, tabId]
        },
        activeEncounterSubTab: {
          ...state.activeEncounterSubTab,
          [encounterId]: tabId
        }
      };
    });
  },
  removeEncounterSubTab: (encounterId, tabId) => {
    set((state) => {
      const currentTabs = state.openEncounterSubTabs[encounterId] || [];
      const filtered = currentTabs.filter((tab) => tab !== tabId);
      const updatedActive = state.activeEncounterSubTab[encounterId] === tabId
        ? 'summary'
        : state.activeEncounterSubTab[encounterId];
      return {
        ...state,
        openEncounterSubTabs: {
          ...state.openEncounterSubTabs,
          [encounterId]: filtered
        },
        activeEncounterSubTab: {
          ...state.activeEncounterSubTab,
          [encounterId]: updatedActive || 'summary'
        }
      };
    });
  },
  setEncounterActiveSubTab: (encounterId, tabId) => {
    set((state) => ({
      activeEncounterSubTab: {
        ...state.activeEncounterSubTab,
        [encounterId]: tabId
      }
    }));
  },
  setEncounterDropdown: (encounterId, dropdown) => {
    set((state) => ({
      openDropdown: {
        ...state.openDropdown,
        [encounterId]: dropdown
      }
    }));
  },
  updateSoapForm: (encounterId, field, value) => {
    set((state) => {
      const current = state.soapForms[encounterId] || defaultSoapForm;
      if (current[field] === value) {
        return state;
      }
      return {
        ...state,
        soapForms: {
          ...state.soapForms,
          [encounterId]: {
            ...current,
            [field]: value
          }
        }
      };
    });
  },
  setSoapForm: (encounterId, form) => {
    set((state) => ({
      soapForms: {
        ...state.soapForms,
        [encounterId]: form
      }
    }));
  },
  updateCarePlanForm: (encounterId, field, value) => {
    set((state) => {
      const current = state.carePlanForms[encounterId] || defaultCarePlanForm;
      const key = field as keyof CarePlanFormData;
      const currentValue = current[key];
      if ((currentValue ?? '') === value) {
        return state;
      }
      return {
        ...state,
        carePlanForms: {
          ...state.carePlanForms,
          [encounterId]: {
            ...current,
            [key]: value
          }
        }
      };
    });
  },
  setCarePlanForm: (encounterId, form) => {
    set((state) => ({
      carePlanForms: {
        ...state.carePlanForms,
        [encounterId]: form
      }
    }));
  },
  updateClinicalInstructionsForm: (encounterId, field, value) => {
    set((state) => {
      const current = state.clinicalInstructionsForms[encounterId] || defaultClinicalInstructionsForm;
      if (current[field] === value) {
        return state;
      }
      return {
        ...state,
        clinicalInstructionsForms: {
          ...state.clinicalInstructionsForms,
          [encounterId]: {
            ...current,
            [field]: value
          }
        }
      };
    });
  },
  setClinicalInstructionsForm: (encounterId, form) => {
    set((state) => ({
      clinicalInstructionsForms: {
        ...state.clinicalInstructionsForms,
        [encounterId]: form
      }
    }));
  },
  updateClinicalNotesForm: (encounterId, value) => {
    set((state) => {
      if (state.clinicalNotesForms[encounterId]?.notes === value) {
        return state;
      }
      return {
        ...state,
        clinicalNotesForms: {
          ...state.clinicalNotesForms,
          [encounterId]: {
            notes: value
          }
        }
      };
    });
  },
  setClinicalNotesForm: (encounterId, form) => {
    set((state) => ({
      clinicalNotesForms: {
        ...state.clinicalNotesForms,
        [encounterId]: form
      }
    }));
  },
  updateRosForm: (encounterId, system, value) => {
    set((state) => {
      const current = state.rosForms[encounterId] || {};
      if (current[system] === value) {
        return state;
      }
      return {
        ...state,
        rosForms: {
          ...state.rosForms,
          [encounterId]: {
            ...current,
            [system]: value
          }
        }
      };
    });
  },
  setRosForm: (encounterId, form) => {
    set((state) => ({
      rosForms: {
        ...state.rosForms,
        [encounterId]: form
      }
    }));
  },

  // Eye Exam Form
  updateEyeExamForm: (encounterId, field, value) => {
    set((state) => {
      const current = state.eyeExamForms[encounterId] || defaultEyeExamForm;
      if (current[field] === value) return state;
      const updatedForm = { ...current, [field]: value };
      saveDraft(encounterId, 'eye-exam', updatedForm);
      return {
        ...state,
        eyeExamForms: {
          ...state.eyeExamForms,
          [encounterId]: updatedForm
        }
      };
    });
  },
  setEyeExamForm: (encounterId, form) => {
    set((state) => ({
      eyeExamForms: { ...state.eyeExamForms, [encounterId]: form }
    }));
  },

  // Functional Cognitive Form
  updateFunctionalCognitiveForm: (encounterId, field, value) => {
    set((state) => {
      const current = state.functionalCognitiveForms[encounterId] || defaultFunctionalCognitiveForm;
      if (current[field] === value) return state;
      const updatedForm = { ...current, [field]: value };
      saveDraft(encounterId, 'functional-and-cognitive-status', updatedForm);
      return {
        ...state,
        functionalCognitiveForms: {
          ...state.functionalCognitiveForms,
          [encounterId]: updatedForm
        }
      };
    });
  },
  setFunctionalCognitiveForm: (encounterId, form) => {
    set((state) => ({
      functionalCognitiveForms: { ...state.functionalCognitiveForms, [encounterId]: form }
    }));
  },

  // Observation Form
  updateObservationForm: (encounterId, field, value) => {
    set((state) => {
      const current = state.observationForms[encounterId] || defaultObservationForm;
      if (current[field] === value) return state;
      const updatedForm = { ...current, [field]: value };
      saveDraft(encounterId, 'observation', updatedForm);
      return {
        ...state,
        observationForms: {
          ...state.observationForms,
          [encounterId]: updatedForm
        }
      };
    });
  },
  setObservationForm: (encounterId, form) => {
    set((state) => ({
      observationForms: { ...state.observationForms, [encounterId]: form }
    }));
  },

  // Speech Dictation Form
  updateSpeechDictationForm: (encounterId, field, value) => {
    set((state) => {
      const current = state.speechDictationForms[encounterId] || defaultSpeechDictationForm;
      if (current[field] === value) return state;
      const updatedForm = { ...current, [field]: value };
      saveDraft(encounterId, 'speech-dictation', updatedForm);
      return {
        ...state,
        speechDictationForms: {
          ...state.speechDictationForms,
          [encounterId]: updatedForm
        }
      };
    });
  },
  setSpeechDictationForm: (encounterId, form) => {
    set((state) => ({
      speechDictationForms: { ...state.speechDictationForms, [encounterId]: form }
    }));
  },

  // Procedure Order Form
  updateProcedureOrderForm: (encounterId, field, value) => {
    set((state) => {
      const current = state.procedureOrderForms[encounterId] || defaultProcedureOrderForm;
      if (current[field] === value) return state;
      const updatedForm = { ...current, [field]: value };
      saveDraft(encounterId, 'procedure-order', updatedForm);
      return {
        ...state,
        procedureOrderForms: {
          ...state.procedureOrderForms,
          [encounterId]: updatedForm
        }
      };
    });
  },
  setProcedureOrderForm: (encounterId, form) => {
    set((state) => ({
      procedureOrderForms: { ...state.procedureOrderForms, [encounterId]: form }
    }));
  },

  // Lab Results Form
  updateLabResultsForm: (encounterId, field, value) => {
    set((state) => {
      const current = state.labResultsForms[encounterId] || defaultLabResultsForm;
      if (current[field] === value) return state;
      const updatedForm = { ...current, [field]: value };
      saveDraft(encounterId, 'lab-results', updatedForm);
      return {
        ...state,
        labResultsForms: {
          ...state.labResultsForms,
          [encounterId]: updatedForm
        }
      };
    });
  },
  setLabResultsForm: (encounterId, form) => {
    set((state) => ({
      labResultsForms: { ...state.labResultsForms, [encounterId]: form }
    }));
  },

  // Imaging Orders Form
  updateImagingOrdersForm: (encounterId, field, value) => {
    set((state) => {
      const current = state.imagingOrdersForms[encounterId] || defaultImagingOrdersForm;
      if (current[field] === value) return state;
      const updatedForm = { ...current, [field]: value };
      saveDraft(encounterId, 'imaging-orders', updatedForm);
      return {
        ...state,
        imagingOrdersForms: {
          ...state.imagingOrdersForms,
          [encounterId]: updatedForm
        }
      };
    });
  },
  setImagingOrdersForm: (encounterId, form) => {
    set((state) => ({
      imagingOrdersForms: { ...state.imagingOrdersForms, [encounterId]: form }
    }));
  },

  // Questionnaire Form
  updateQuestionnaireForm: (encounterId, field, value) => {
    set((state) => {
      const current = state.questionnaireForms[encounterId] || defaultQuestionnaireForm;
      const updatedForm = { ...current, [field]: value };
      saveDraft(encounterId, 'questionnaire', updatedForm);
      return {
        ...state,
        questionnaireForms: {
          ...state.questionnaireForms,
          [encounterId]: updatedForm
        }
      };
    });
  },
  setQuestionnaireForm: (encounterId, form) => {
    set((state) => ({
      questionnaireForms: { ...state.questionnaireForms, [encounterId]: form }
    }));
  },

  // Generic Administrative Form
  updateGenericAdminForm: (encounterId, field, value) => {
    set((state) => {
      const current = state.genericAdminForms[encounterId] || defaultGenericAdminForm;
      const updatedForm = { ...current, [field]: value };
      saveDraft(encounterId, 'generic-admin', updatedForm);
      return {
        ...state,
        genericAdminForms: {
          ...state.genericAdminForms,
          [encounterId]: updatedForm
        }
      };
    });
  },
  setGenericAdminForm: (encounterId, form) => {
    set((state) => ({
      genericAdminForms: { ...state.genericAdminForms, [encounterId]: form }
    }));
  },

  setEditingCarePlanId: (encounterId, carePlanId) => {
    set((state) => ({
      editingCarePlanId: {
        ...state.editingCarePlanId,
        [encounterId]: carePlanId
      }
    }));
  },
  setCurrentCarePlanData: (encounterId, data) => {
    set((state) => ({
      currentCarePlanData: {
        ...state.currentCarePlanData,
        [encounterId]: data
      }
    }));
  },
  setDrawerState: (drawer, isOpen) => {
    set((state) => ({
      drawers: {
        ...state.drawers,
        [drawer]: isOpen
      }
    }));
  },
  setPortalAccessDialogOpen: (isOpen) => set({ portalAccessDialogOpen: isOpen }),
  setClinicalNotes: (encounterId, updater) => {
    set((state) => ({
      clinicalNotes: {
        ...state.clinicalNotes,
        [encounterId]: updater(state.clinicalNotes[encounterId] || [])
      }
    }));
  },
  setClinicalNoteEditorState: ({ isOpen, mode = 'create', encounterId = '', note = null }) => {
    set({
      showClinicalNoteEditor: isOpen,
      clinicalNoteMode: mode,
      editingClinicalNote: note ?? null,
      currentEditingEncounterId: encounterId
    });
  },
  updateEncounterSavedData: (encounterId, updater) => {
    set((state) => ({
      encounterSavedData: {
        ...state.encounterSavedData,
        [encounterId]: updater(state.encounterSavedData[encounterId] || [])
      }
    }));
  },
  loadAllPatientData: async () => {
    const patientId = get().patientId;
    if (!patientId) return;

    set({ loading: true });
    try {
      const [patientResource, encounterRes, conditionRes, medicationRes, allergyRes, observationRes, coverageRes, immunizationRes, imagingRes, labRes, documentRes] = (await Promise.all([
        fhirService.read('Patient', patientId),
        fhirService.search('Encounter', { patient: patientId, _count: 10, _sort: '-date' }),
        fhirService.search('Condition', { patient: patientId, _count: 20 }),
        fhirService.search('MedicationRequest', { patient: patientId, _count: 20, status: 'active' }),
        fhirService.search('AllergyIntolerance', { patient: patientId, _count: 20 }),
        fhirService.search('Observation', { patient: patientId, _count: 50, _sort: '-date', category: 'vital-signs' }),
        fhirService.search('Coverage', { patient: patientId, _count: 10 }),
        fhirService.search('Immunization', { patient: patientId, _count: 50, _sort: '-date' }),
        fhirService.search('ImagingStudy', { patient: patientId, _count: 50, _sort: '-date' }),
        fhirService.search('DiagnosticReport', { patient: patientId, _count: 50, _sort: '-date', category: 'LAB' }),
        fhirService.search('DocumentReference', { patient: patientId, _count: 50, _sort: '-date' })
      ])) as [any, any, any, any, any, any, any, any, any, any, any];

      const name = patientResource.name?.[0];
      const fullName = `${name?.given?.join(' ') || ''} ${name?.family || ''}`.trim();
      const phone = patientResource.telecom?.find((t: TelecomItem) => t.system === 'phone')?.value || '-';
      const email = patientResource.telecom?.find((t: TelecomItem) => t.system === 'email')?.value || '-';
      const mrn = patientResource.identifier?.find((id: IdentifierItem) => id.type?.coding?.some((c) => c.code === 'MR'))?.value || '-';
      const age = patientResource.birthDate
        ? Math.floor((Date.now() - new Date(patientResource.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 0;

      const patient: PatientDetails = {
        id: patientResource.id,
        name: fullName || 'Unknown',
        mrn,
        dob: patientResource.birthDate || '-',
        age,
        gender: patientResource.gender || 'unknown',
        phone,
        email
      };

      set({
        patient,
        encounters: encounterRes.entry?.map((e: FHIRBundleEntry<any>) => e.resource) || [],
        problems: conditionRes.entry?.map((e: FHIRBundleEntry<any>) => e.resource) || [],
        medications: medicationRes.entry?.map((e: FHIRBundleEntry<any>) => e.resource) || [],
        allergies: allergyRes.entry?.map((e: FHIRBundleEntry<any>) => e.resource) || [],
        observations: observationRes.entry?.map((e: FHIRBundleEntry<any>) => e.resource) || [],
        insurances: coverageRes.entry?.map((e: FHIRBundleEntry<any>) => e.resource) || [],
        immunizations: immunizationRes.entry?.map((e: FHIRBundleEntry<any>) => e.resource) || [],
        imagingStudies: imagingRes.entry?.map((e: FHIRBundleEntry<any>) => e.resource) || [],
        labResults: labRes.entry?.map((e: FHIRBundleEntry<any>) => e.resource) || [],
        documents: documentRes.entry?.map((e: FHIRBundleEntry<any>) => e.resource) || []
      });
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      set({ loading: false });
    }
  },
  refreshData: async () => {
    await get().loadAllPatientData();
  },
  checkPortalAccess: async () => {
    const patientId = get().patientId;
    if (!patientId) return;

    set({ loadingPortalAccess: true });
    try {
      const response = await fetch(`/api/patient/check-portal-access?patientId=${patientId}`);
      const data = await response.json();
      set({
        portalAccessStatus: {
          hasAccess: data.hasAccess || false,
          email: data.email,
          grantedAt: data.grantedAt
        }
      });
    } catch (error) {
      console.error('Error checking portal access:', error);
    } finally {
      set({ loadingPortalAccess: false });
    }
  },
  hydrateEncounterFromQuery: () => {
    const state = get();
    if (!state.patient || !state.encounterIdFromQuery || state.hasHydratedFromQuery) {
      return;
    }

    const encounterId = state.encounterIdFromQuery;
    const tabFromQuery = state.tabFromQuery;

    set({ hasHydratedFromQuery: true });
    get().setActiveTab('encounters');
    get().setOpenEncounterTab(encounterId);
    if (tabFromQuery) {
      get().addEncounterSubTab(encounterId, tabFromQuery);
    }
  },
  loadEncounterDocumentation: async (encounterId) => {
    try {
      const docRes = await fhirService.search('DocumentReference', {
        encounter: encounterId,
        _sort: '-date'
      });

      const docs = docRes.entry?.map((e: FHIRBundleEntry<any>) => e.resource) || [];
      const sections: SavedSection[] = [];

      try {
        const carePlansList = await carePlanService.getCarePlansByEncounter(encounterId);
        set((state) => ({
          carePlans: {
            ...state.carePlans,
            [encounterId]: carePlansList
          }
        }));

        carePlansList.forEach((carePlan: any) => {
          const formData = carePlanService.convertToFormData(carePlan);
          sections.push({
            id: carePlan.id,
            title: formData.title || 'Care Plan',
            type: 'care-plan',
            author: 'System',
            date: carePlan.created || carePlan.meta?.lastUpdated || new Date().toISOString(),
            data: formData,
            signatures: []
          });
        });
      } catch (carePlanError) {
        console.error('Error loading care plans:', carePlanError);
      }

      docs.forEach((doc: any) => {
        const content = doc.content?.[0];
        const category = doc.category?.[0]?.coding?.[0]?.code;
        const author = doc.author?.[0]?.display || 'Unknown';
        const date = doc.date || new Date().toISOString();

        try {
          const data = content?.attachment?.data
            ? JSON.parse(atob(content.attachment.data))
            : {};

          if (category !== 'care-plan') {
            sections.push({
              id: doc.id,
              title: doc.type?.text || category,
              type: category,
              author,
              date,
              data,
              signatures: []
            });
          }
        } catch (e) {
          console.error('Error parsing document:', e);
        }
      });

      sections.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      set((state) => ({
        encounterSavedData: {
          ...state.encounterSavedData,
          [encounterId]: sections
        }
      }));
    } catch (error) {
      console.error('Error loading encounter documentation:', error);
    }
  },
  saveDocumentReference: async (encounterId, section, documentId) => {
    const patientId = get().patientId;
    if (!patientId) return;

    try {
      const dataString = JSON.stringify(section.data);
      const base64Data = btoa(dataString);
      const docResource: Record<string, any> = {
        resourceType: 'DocumentReference',
        status: 'current',
        type: {
          coding: [{
            system: 'http://loinc.org',
            code: getLoincCode(section.type),
            display: section.title
          }],
          text: section.title
        },
        category: [{
          coding: [{
            system: 'http://hl7.org/fhir/us/core/CodeSystem/us-core-documentreference-category',
            code: section.type,
            display: section.title
          }]
        }],
        subject: {
          reference: `Patient/${patientId}`
        },
        date: new Date().toISOString(),
        author: [{
          display: section.author
        }],
        content: [{
          attachment: {
            contentType: 'application/json',
            data: base64Data,
            title: section.title
          }
        }],
        context: {
          encounter: [{
            reference: `Encounter/${encounterId}`
          }]
        }
      };

      if (documentId) {
        docResource.id = documentId;
        await fhirService.update({ ...docResource, resourceType: 'DocumentReference', id: documentId });
      } else {
        await fhirService.create(docResource);
      }

      await get().loadEncounterDocumentation(encounterId);
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    }
  },
  handleStartVisit: async (encounterData) => {
    const patientId = get().patientId;
    const patient = get().patient;
    if (!patientId) return;

    try {
      const encounterResource = {
        resourceType: 'Encounter',
        status: 'in-progress',
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: encounterData.encounterClass,
          display: encounterData.encounterClass.charAt(0).toUpperCase() + encounterData.encounterClass.slice(1)
        },
        subject: {
          reference: `Patient/${patientId}`,
          display: patient?.name
        },
        participant: encounterData.practitioner
          ? [{
              type: [{
                coding: [{
                  system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                  code: 'PPRF',
                  display: 'Primary Performer'
                }]
              }],
              individual: {
                reference: `Practitioner/${encounterData.practitioner}`
              }
            }]
          : [],
        period: {
          start: new Date().toISOString()
        },
        serviceProvider: encounterData.location
          ? {
              reference: `Organization/${encounterData.location}`
            }
          : undefined
      };

      await fhirService.create(encounterResource);
      set((state) => ({
        drawers: {
          ...state.drawers,
          encounter: false
        }
      }));
      await get().refreshData();
    } catch (error) {
      console.error('Error creating encounter:', error);
      throw error;
    }
  },
  handleSaveVitals: async (vitalsData) => {
    const patientId = get().patientId;
    if (!patientId) return;

    const observations: any[] = [];

    if (vitalsData.bloodPressureSystolic && vitalsData.bloodPressureDiastolic) {
      observations.push({
        resourceType: 'Observation',
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: '85354-9',
            display: 'Blood pressure panel'
          }],
          text: 'Blood Pressure'
        },
        subject: { reference: `Patient/${patientId}` },
        effectiveDateTime: new Date().toISOString(),
        component: [
          {
            code: {
              coding: [{
                system: 'http://loinc.org',
                code: '8480-6',
                display: 'Systolic blood pressure'
              }]
            },
            valueQuantity: {
              value: parseFloat(vitalsData.bloodPressureSystolic),
              unit: 'mmHg',
              system: 'http://unitsofmeasure.org',
              code: 'mm[Hg]'
            }
          },
          {
            code: {
              coding: [{
                system: 'http://loinc.org',
                code: '8462-4',
                display: 'Diastolic blood pressure'
              }]
            },
            valueQuantity: {
              value: parseFloat(vitalsData.bloodPressureDiastolic),
              unit: 'mmHg',
              system: 'http://unitsofmeasure.org',
              code: 'mm[Hg]'
            }
          }
        ]
      });
    }

    const vitalMappings = [
      { field: 'heartRate', code: '8867-4', display: 'Heart rate', unit: 'beats/minute', ucumCode: '/min' },
      { field: 'temperature', code: '8310-5', display: 'Body temperature', unit: 'Cel', ucumCode: 'Cel' },
      { field: 'respiratoryRate', code: '9279-1', display: 'Respiratory rate', unit: 'breaths/minute', ucumCode: '/min' },
      { field: 'oxygenSaturation', code: '59408-5', display: 'Oxygen saturation', unit: '%', ucumCode: '%' },
      { field: 'weight', code: '29463-7', display: 'Body weight', unit: 'kg', ucumCode: 'kg' },
      { field: 'height', code: '8302-2', display: 'Body height', unit: 'cm', ucumCode: 'cm' }
    ];

    vitalMappings.forEach(({ field, code, display, unit, ucumCode }) => {
      const value = vitalsData[field as keyof VitalsFormData];
      if (value) {
        observations.push({
          resourceType: 'Observation',
          status: 'final',
          category: [{
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'vital-signs'
            }]
          }],
          code: {
            coding: [{
              system: 'http://loinc.org',
              code,
              display
            }],
            text: display
          },
          subject: { reference: `Patient/${patientId}` },
          effectiveDateTime: new Date().toISOString(),
          valueQuantity: {
            value: parseFloat(value),
            unit,
            system: 'http://unitsofmeasure.org',
            code: ucumCode
          }
        });
      }
    });

    await Promise.all(observations.map((obs) => fhirService.create(obs)));
    set((state) => ({
      drawers: {
        ...state.drawers,
        vitals: false
      }
    }));
    await get().refreshData();
  },
  handleSaveProblem: async (problemData) => {
    const patientId = get().patientId;
    const patient = get().patient;
    if (!patientId) return;

    const conditionResource = {
      resourceType: 'Condition',
      clinicalStatus: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
          code: 'active',
          display: 'Active'
        }]
      },
      verificationStatus: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
          code: 'confirmed',
          display: 'Confirmed'
        }]
      },
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/condition-category',
          code: problemData.category,
          display: problemData.category === 'problem-list-item' ? 'Problem List Item' : 'Encounter Diagnosis'
        }]
      }],
      severity: problemData.severity
        ? {
            coding: [{
              system: 'http://snomed.info/sct',
              code:
                problemData.severity === 'severe'
                  ? '24484000'
                  : problemData.severity === 'moderate'
                  ? '6736007'
                  : '255604002',
              display: problemData.severity.charAt(0).toUpperCase() + problemData.severity.slice(1)
            }]
          }
        : undefined,
      code: {
        text: problemData.condition
      },
      subject: {
        reference: `Patient/${patientId}`,
        display: patient?.name
      },
      onsetDateTime: problemData.onsetDate,
      recordedDate: new Date().toISOString()
    };

    await fhirService.create(conditionResource);
    set((state) => ({
      drawers: {
        ...state.drawers,
        problem: false
      }
    }));
    await get().refreshData();
  },
  handleSaveMedication: async (medicationData) => {
    const patientId = get().patientId;
    const patient = get().patient;
    if (!patientId) return;

    const medicationResource = {
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: {
        text: medicationData.medication
      },
      subject: {
        reference: `Patient/${patientId}`,
        display: patient?.name
      },
      authoredOn: new Date().toISOString(),
      dosageInstruction: [{
        text: medicationData.instructions || undefined,
        route: {
          coding: [{
            system: 'http://snomed.info/sct',
            code: medicationData.route === 'oral' ? '26643006' : '372449004',
            display: medicationData.route.charAt(0).toUpperCase() + medicationData.route.slice(1)
          }]
        },
        timing: {
          repeat: {
            frequency: parseInt(medicationData.frequency, 10),
            period: parseInt(medicationData.period, 10),
            periodUnit: medicationData.periodUnit
          }
        },
        doseAndRate: [{
          doseQuantity: {
            value: parseFloat(medicationData.dosageValue),
            unit: medicationData.dosageUnit
          }
        }]
      }]
    };

    await fhirService.create(medicationResource);
    set((state) => ({
      drawers: {
        ...state.drawers,
        medication: false
      }
    }));
    await get().refreshData();
  },
  handleSaveInsurance: async (insuranceData) => {
    const patientId = get().patientId;
    const patient = get().patient;
    if (!patientId) return;

    try {
      const coverageResource = {
        resourceType: 'Coverage',
        status: insuranceData.active ? 'active' : 'inactive',
        type: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
            code: insuranceData.insuranceOrder === 'primary' ? 'PUBLICPOL' : 'HEALTHPOL',
            display: insuranceData.planName || insuranceData.insuranceOrder
          }],
          text: insuranceData.planName || insuranceData.insuranceProvider
        },
        policyHolder: {
          display: insuranceData.subscriberName
        },
        subscriber: {
          display: insuranceData.subscriberName
        },
        subscriberId: insuranceData.policyNumber,
        beneficiary: {
          reference: `Patient/${patientId}`,
          display: patient?.name
        },
        relationship: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/subscriber-relationship',
            code: insuranceData.relationship,
            display: insuranceData.relationship.charAt(0).toUpperCase() + insuranceData.relationship.slice(1)
          }]
        },
        period: {
          start: new Date().toISOString().split('T')[0]
        },
        payor: [{
          display: insuranceData.insuranceProvider,
          identifier: {
            value: insuranceData.payerId
          }
        }],
        class: [{
          type: {
            coding: [{
              system: 'http://terminology.hl7.org/CodeSystem/coverage-class',
              code: 'group',
              display: 'Group'
            }]
          },
          value: insuranceData.policyNumber,
          name: insuranceData.planName
        }],
        order:
          insuranceData.insuranceOrder === 'primary'
            ? 1
            : insuranceData.insuranceOrder === 'secondary'
            ? 2
            : 3,
        costToBeneficiary: insuranceData.copayAmount
          ? [{
              type: {
                coding: [{
                  system: 'http://terminology.hl7.org/CodeSystem/coverage-copay-type',
                  code: 'copay',
                  display: 'Copay'
                }]
              },
              valueMoney: {
                value: parseFloat(insuranceData.copayAmount),
                currency: 'USD'
              }
            }]
          : undefined
      };

      await fhirService.create(coverageResource);
      set((state) => ({
        drawers: {
          ...state.drawers,
          insurance: false
        }
      }));
      await get().refreshData();
    } catch (error) {
      console.error('Error saving insurance:', error);
      throw error;
    }
  },
  handleEditPatient: async (data) => {
    const patientId = get().patientId;
    if (!patientId) return;

    try {
      await patientService.updatePatient({ ...data, id: patientId }, 'current-user');
      set((state) => ({
        drawers: {
          ...state.drawers,
          edit: false
        }
      }));
      await get().refreshData();
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }
}));

export type { ClinicalNote };
