import React from 'react';
import { EncounterDetailView } from '../encounter-detail-view';
import { EncounterHeader } from './EncounterHeader';
import { EncounterSubTabs } from './EncounterSubTabs';
import { SummaryTab } from './summary/SummaryTab';
import { SOAPSubTab } from './sub-tabs/SOAPSubTab';
import { ReviewOfSystemsSubTab } from './sub-tabs/ReviewOfSystemsSubTab';
import { VitalsSubTab } from './sub-tabs/VitalsSubTab';
import { EyeExamSubTab } from './sub-tabs/EyeExamSubTab';
import { FunctionalCognitiveSubTab } from './sub-tabs/FunctionalCognitiveSubTab';
import { ObservationSubTab } from './sub-tabs/ObservationSubTab';
import { SpeechDictationSubTab } from './sub-tabs/SpeechDictationSubTab';
import { ProcedureOrderSubTab } from './sub-tabs/ProcedureOrderSubTab';
import { LabResultsSubTab } from './sub-tabs/LabResultsSubTab';
import { ImagingOrdersSubTab } from './sub-tabs/ImagingOrdersSubTab';
import { QuestionnaireSubTab } from './sub-tabs/QuestionnaireSubTab';
import { GenericAdministrativeSubTab } from './sub-tabs/GenericAdministrativeSubTab';
import { CarePlanForm } from '@/components/forms/care-plan-form';
import { ClinicalInstructionsSection } from '@/components/encounters/clinical-instructions-section';
import { PatientInstructionsSection } from '@/components/encounters/patient-instructions-section';
import { ClinicalNotesTab } from '@/app/patients/[id]/components/tabs/ClinicalNotesTab';
import { PrescriptionsSectionInline } from '@/components/encounters/prescriptions-section-inline';
import { SavedSection } from '@/app/patients/[id]/components/types';
import { carePlanService, CarePlanFormData } from '@/services/careplan.service';
import { IMPLEMENTED_SUB_TABS } from '../../config/encounter-menus';
import { usePatientDetailStore } from '../../store/patient-detail-store';
import { createSection } from '../../utils/form-save-handlers';
import { clearDraft } from '../../utils/form-persistence';

interface EncounterTabProps {
  // Encounter data
  encounterId: string;
  encounter: any;
  patient: any;
  patientId: string;
  isActive: boolean;

  // Sub-tabs state
  openSubTabs: string[];
  activeSubTab: string;
  onSubTabChange: (tabId: string) => void;
  onSubTabAdd: (tabId: string) => void;
  onSubTabRemove: (tabId: string) => void;

  // Dropdown state
  openDropdown: string | null;
  onDropdownToggle: (category: string | null) => void;

  // AMC Popover state
  showAmcPopover: boolean;
  onAmcPopoverToggle: () => void;
  onAmcPopoverClose: () => void;
  onAmcSave: (requirements: any) => void;

  // Saved sections
  savedSections: SavedSection[];
  expandedSections: { [key: string]: boolean };
  onToggleSectionExpand: (sectionKey: string) => void;
  onEditSection: (idx: number, section: SavedSection) => void;
  onDeleteSection: (idx: number, section: SavedSection) => Promise<void>;

  // Form data
  soapForm: any;
  rosForm: any;
  clinicalNotes: any[];

  // Form handlers
  onSoapFieldChange: (field: 'subjective' | 'objective' | 'assessment' | 'plan', value: string) => void;
  onRosFieldChange: (system: string, value: string) => void;
  onSoapSave: () => void;
  onRosSave: () => void;

  // Care Plan
  carePlans: any[];
  currentCarePlanData: CarePlanFormData | null;
  editingCarePlanId: string | null;
  onCarePlanSave: (formData: CarePlanFormData) => Promise<void>;
  onCarePlanCancel: () => void;
  onCarePlanEdit: (carePlan: any) => void;
  onCarePlanDelete: (carePlanId: string) => Promise<void>;
  onCarePlanAdd: () => void;

  // Clinical Notes
  onAddClinicalNote: () => void;
  onEditClinicalNote: (note: any) => void;
  onDeleteClinicalNote: (noteId: string) => void;
  onToggleFavoriteClinicalNote: (noteId: string) => void;

  // Other
  observations: any[];
  onRecordVitals: () => void;
  isEditing: boolean;
  loadEncounterDocumentation: (encounterId: string) => Promise<void>;
}

/**
 * EncounterTab - Main container for encounter documentation
 * Manages header, sub-tabs, and content rendering
 */
export function EncounterTab({
  encounterId,
  encounter,
  patient,
  patientId,
  isActive,
  openSubTabs,
  activeSubTab,
  onSubTabChange,
  onSubTabAdd,
  onSubTabRemove,
  openDropdown,
  onDropdownToggle,
  showAmcPopover,
  onAmcPopoverToggle,
  onAmcPopoverClose,
  onAmcSave,
  savedSections,
  expandedSections,
  onToggleSectionExpand,
  onEditSection,
  onDeleteSection,
  soapForm,
  rosForm,
  clinicalNotes,
  onSoapFieldChange,
  onRosFieldChange,
  onSoapSave,
  onRosSave,
  carePlans,
  currentCarePlanData,
  editingCarePlanId,
  onCarePlanSave,
  onCarePlanCancel,
  onCarePlanEdit,
  onCarePlanDelete,
  onCarePlanAdd,
  onAddClinicalNote,
  onEditClinicalNote,
  onDeleteClinicalNote,
  onToggleFavoriteClinicalNote,
  observations,
  onRecordVitals,
  isEditing,
  loadEncounterDocumentation
}: EncounterTabProps) {
  // Get form state from store for new forms
  const {
    eyeExamForms,
    functionalCognitiveForms,
    observationForms,
    speechDictationForms,
    procedureOrderForms,
    labResultsForms,
    imagingOrdersForms,
    questionnaireForms,
    genericAdminForms,
    updateEyeExamForm,
    updateFunctionalCognitiveForm,
    updateObservationForm,
    updateSpeechDictationForm,
    updateProcedureOrderForm,
    updateLabResultsForm,
    updateImagingOrdersForm,
    updateQuestionnaireForm,
    updateGenericAdminForm,
    setEyeExamForm,
    setFunctionalCognitiveForm,
    setObservationForm,
    setSpeechDictationForm,
    setProcedureOrderForm,
    setLabResultsForm,
    setImagingOrdersForm,
    setQuestionnaireForm,
    setGenericAdminForm,
    saveDocumentReference,
    setEncounterActiveSubTab
  } = usePatientDetailStore();

  // Save handlers for new forms
  const handleSaveNewForm = async (type: string, title: string, formData: any) => {
    try {
      const section = createSection(title, type, formData);
      await saveDocumentReference(encounterId, section);
      // Clear draft from localStorage after successful save
      clearDraft(encounterId, type);
      // Switch to summary after save
      setEncounterActiveSubTab(encounterId, 'summary');
      // Reload documentation
      await loadEncounterDocumentation(encounterId);
    } catch (error: any) {
      alert(error.message || 'Failed to save. Please try again.');
    }
  };

  return (
    <div style={{ display: isActive ? 'block' : 'none' }}>
      <EncounterDetailView encounterId={encounterId}>
        {/* Header with dropdowns and action buttons */}
        <EncounterHeader
          encounterId={encounterId}
          openDropdown={openDropdown}
          onDropdownToggle={onDropdownToggle}
          onMenuItemClick={onSubTabAdd}
          showAmcPopover={showAmcPopover}
          onAmcPopoverToggle={onAmcPopoverToggle}
          onAmcPopoverClose={onAmcPopoverClose}
          onAmcSave={onAmcSave}
        />

        {/* Sub-tabs navigation */}
        <EncounterSubTabs
          activeSubTab={activeSubTab}
          openSubTabs={openSubTabs}
          onSubTabClick={onSubTabChange}
          onSubTabClose={onSubTabRemove}
        />

        {/* Content area */}
        <div className="px-4">
          {/* Summary Tab */}
          {activeSubTab === 'summary' && (
            <SummaryTab
              encounterId={encounterId}
              encounter={encounter}
              patient={patient}
              savedSections={savedSections}
              expandedSections={expandedSections}
              onToggleSectionExpand={onToggleSectionExpand}
              onEditSection={onEditSection}
              onDeleteSection={onDeleteSection}
            />
          )}

          {/* SOAP Sub-Tab */}
          {activeSubTab === 'soap' && (
            <SOAPSubTab
              encounterId={encounterId}
              formData={soapForm}
              onFieldChange={onSoapFieldChange}
              onSave={onSoapSave}
              isEditing={isEditing}
            />
          )}

          {/* Review of Systems Sub-Tab */}
          {activeSubTab === 'review-of-systems' && (
            <ReviewOfSystemsSubTab
              encounterId={encounterId}
              formData={rosForm}
              onFieldChange={onRosFieldChange}
              onSave={onRosSave}
              isEditing={isEditing}
            />
          )}

          {/* Vitals Sub-Tab */}
          {activeSubTab === 'vitals' && (
            <VitalsSubTab observations={observations} onRecordVitals={onRecordVitals} />
          )}

          {/* Care Plan Sub-Tab */}
          {activeSubTab === 'care-plan' && (
            <div className="space-y-4">
              {/* Show form if creating/editing */}
              {(currentCarePlanData || !carePlans || carePlans.length === 0) && (
                <CarePlanForm
                  encounterId={encounterId}
                  patientId={patientId}
                  initialData={currentCarePlanData || undefined}
                  onSave={onCarePlanSave}
                  onCancel={onCarePlanCancel}
                />
              )}

              {/* Show existing care plans list */}
              {!currentCarePlanData && carePlans && carePlans.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Existing Care Plans
                    </h2>
                    <button
                      onClick={onCarePlanAdd}
                      className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90"
                    >
                      + Add New Care Plan
                    </button>
                  </div>

                  <div className="space-y-4">
                    {carePlans.map((carePlan: any) => {
                      const formData = carePlanService.convertToFormData(carePlan);
                      return (
                        <div
                          key={carePlan.id}
                          className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {formData.title || 'Care Plan'}
                              </h3>
                              <div className="flex gap-4 text-sm text-gray-600 mt-1">
                                <span>
                                  Status:{' '}
                                  <span className="font-medium capitalize">{formData.status}</span>
                                </span>
                                <span>
                                  Intent:{' '}
                                  <span className="font-medium capitalize">{formData.intent}</span>
                                </span>
                                <span>
                                  Activities:{' '}
                                  <span className="font-medium">{formData.activities.length}</span>
                                </span>
                              </div>
                              {formData.description && (
                                <p className="text-sm text-gray-600 mt-2">{formData.description}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => onCarePlanEdit(carePlan)}
                                className="px-3 py-1.5 text-sm font-medium text-primary bg-white border border-primary rounded hover:bg-primary/10"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => onCarePlanDelete(carePlan.id)}
                                className="px-3 py-1.5 text-sm font-medium text-destructive bg-white border border-destructive rounded hover:bg-destructive/10"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          {/* Activities Summary */}
                          <div className="mt-3 space-y-2">
                            {formData.activities.map((activity, idx) => (
                              <div
                                key={idx}
                                className="text-sm bg-white p-3 rounded border border-gray-200"
                              >
                                <div className="flex justify-between">
                                  <span className="font-medium">{activity.code}</span>
                                  <span className="text-gray-600">{activity.type}</span>
                                </div>
                                <p className="text-gray-600 text-xs mt-1">{activity.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Clinical Instructions Sub-Tab */}
          {activeSubTab === 'clinical-instructions' && encounter && patient && (
            <div className="bg-white border border-gray-200 rounded p-4">
              <ClinicalInstructionsSection encounterId={encounterId} patientId={patient.id} />
            </div>
          )}

          {/* Patient Instructions Sub-Tab */}
          {activeSubTab === 'patient-instructions' && encounter && patient && (
            <div className="bg-white border border-gray-200 rounded p-4">
              <PatientInstructionsSection encounterId={encounterId} patientId={patient.id} />
            </div>
          )}

          {/* Clinical Notes Sub-Tab */}
          {activeSubTab === 'clinical-notes' && (
            <ClinicalNotesTab
              notes={clinicalNotes}
              onAddNote={onAddClinicalNote}
              onEditNote={onEditClinicalNote}
              onDeleteNote={onDeleteClinicalNote}
              onToggleFavorite={onToggleFavoriteClinicalNote}
            />
          )}

          {/* Prescriptions Sub-Tab */}
          {activeSubTab === 'prescriptions' && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <PrescriptionsSectionInline
                prescriptions={[]}
                onUpdate={(prescriptions) => {
                  console.log('Prescriptions updated:', prescriptions);
                }}
              />
            </div>
          )}

          {/* Eye Exam Sub-Tab */}
          {activeSubTab === 'eye-exam' && (
            <EyeExamSubTab
              encounterId={encounterId}
              formData={eyeExamForms[encounterId] || {
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
              }}
              onFieldChange={(field, value) => updateEyeExamForm(encounterId, field, value)}
              onSave={() => handleSaveNewForm('eye-exam', 'Eye Examination', eyeExamForms[encounterId] || {})}
              isEditing={isEditing}
            />
          )}

          {/* Functional and Cognitive Status Sub-Tab */}
          {activeSubTab === 'functional-and-cognitive-status' && (
            <FunctionalCognitiveSubTab
              encounterId={encounterId}
              formData={functionalCognitiveForms[encounterId] || {
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
              }}
              onFieldChange={(field, value) => updateFunctionalCognitiveForm(encounterId, field, value)}
              onSave={() => handleSaveNewForm('functional-and-cognitive-status', 'Functional and Cognitive Status', functionalCognitiveForms[encounterId] || {})}
              isEditing={isEditing}
            />
          )}

          {/* Observation Sub-Tab */}
          {activeSubTab === 'observation' && (
            <ObservationSubTab
              encounterId={encounterId}
              formData={observationForms[encounterId] || {
                observationType: '',
                observationCode: '',
                value: '',
                unit: '',
                interpretation: '',
                method: '',
                bodySite: '',
                notes: ''
              }}
              onFieldChange={(field, value) => updateObservationForm(encounterId, field, value)}
              onSave={() => handleSaveNewForm('observation', 'Clinical Observation', observationForms[encounterId] || {})}
              isEditing={isEditing}
            />
          )}

          {/* Speech Dictation Sub-Tab */}
          {activeSubTab === 'speech-dictation' && (
            <SpeechDictationSubTab
              encounterId={encounterId}
              formData={speechDictationForms[encounterId] || {
                transcription: '',
                category: ''
              }}
              onFieldChange={(field, value) => updateSpeechDictationForm(encounterId, field, value)}
              onSave={() => handleSaveNewForm('speech-dictation', 'Speech Dictation', speechDictationForms[encounterId] || {})}
              isEditing={isEditing}
            />
          )}

          {/* Procedure Order Sub-Tab */}
          {activeSubTab === 'procedure-order' && (
            <ProcedureOrderSubTab
              encounterId={encounterId}
              formData={procedureOrderForms[encounterId] || {
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
              }}
              onFieldChange={(field, value) => updateProcedureOrderForm(encounterId, field, value)}
              onSave={() => handleSaveNewForm('procedure-order', 'Procedure Order', procedureOrderForms[encounterId] || {})}
              isEditing={isEditing}
            />
          )}

          {/* Lab Results Sub-Tab */}
          {activeSubTab === 'lab-results' && (
            <LabResultsSubTab
              encounterId={encounterId}
              formData={labResultsForms[encounterId] || {
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
              }}
              onFieldChange={(field, value) => updateLabResultsForm(encounterId, field, value)}
              onSave={() => handleSaveNewForm('lab-results', 'Lab Results', labResultsForms[encounterId] || {})}
              isEditing={isEditing}
            />
          )}

          {/* Imaging Orders Sub-Tab */}
          {activeSubTab === 'imaging-orders' && (
            <ImagingOrdersSubTab
              encounterId={encounterId}
              formData={imagingOrdersForms[encounterId] || {
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
              }}
              onFieldChange={(field, value) => updateImagingOrdersForm(encounterId, field, value)}
              onSave={() => handleSaveNewForm('imaging-orders', 'Imaging Order', imagingOrdersForms[encounterId] || {})}
              isEditing={isEditing}
            />
          )}

          {/* Questionnaire Sub-Tab */}
          {activeSubTab === 'new-questionnaire' && (
            <QuestionnaireSubTab
              encounterId={encounterId}
              formData={questionnaireForms[encounterId] || {
                questionnaireTitle: '',
                questionnaireType: '',
                responses: [],
                notes: ''
              }}
              onFieldChange={(field, value) => updateQuestionnaireForm(encounterId, field, value)}
              onSave={() => handleSaveNewForm('new-questionnaire', 'Questionnaire', questionnaireForms[encounterId] || {})}
              isEditing={isEditing}
            />
          )}

          {/* Questionnaire Responses Sub-Tab (same as new questionnaire) */}
          {activeSubTab === 'questionnaire-responses' && (
            <QuestionnaireSubTab
              encounterId={encounterId}
              formData={questionnaireForms[encounterId] || {
                questionnaireTitle: '',
                questionnaireType: '',
                responses: [],
                notes: ''
              }}
              onFieldChange={(field, value) => updateQuestionnaireForm(encounterId, field, value)}
              onSave={() => handleSaveNewForm('questionnaire-responses', 'Questionnaire Response', questionnaireForms[encounterId] || {})}
              isEditing={isEditing}
            />
          )}

          {/* Forms Sub-Tab */}
          {activeSubTab === 'forms' && (
            <GenericAdministrativeSubTab
              encounterId={encounterId}
              sectionType="forms"
              sectionTitle="Forms"
              formData={genericAdminForms[encounterId] || {
                title: '',
                category: '',
                content: '',
                notes: ''
              }}
              onFieldChange={(field, value) => updateGenericAdminForm(encounterId, field, value)}
              onSave={() => handleSaveNewForm('forms', 'Form', genericAdminForms[encounterId] || {})}
              isEditing={isEditing}
            />
          )}

          {/* Track Anything Sub-Tab */}
          {activeSubTab === 'track-anything' && (
            <GenericAdministrativeSubTab
              encounterId={encounterId}
              sectionType="track-anything"
              sectionTitle="Track Anything"
              formData={genericAdminForms[encounterId] || {
                title: '',
                category: '',
                content: '',
                notes: ''
              }}
              onFieldChange={(field, value) => updateGenericAdminForm(encounterId, field, value)}
              onSave={() => handleSaveNewForm('track-anything', 'Track Item', genericAdminForms[encounterId] || {})}
              isEditing={isEditing}
            />
          )}

          {/* Patient Reminders Sub-Tab */}
          {activeSubTab === 'patient-reminders' && (
            <GenericAdministrativeSubTab
              encounterId={encounterId}
              sectionType="patient-reminders"
              sectionTitle="Patient Reminders"
              formData={genericAdminForms[encounterId] || {
                title: '',
                category: '',
                content: '',
                notes: ''
              }}
              onFieldChange={(field, value) => updateGenericAdminForm(encounterId, field, value)}
              onSave={() => handleSaveNewForm('patient-reminders', 'Patient Reminder', genericAdminForms[encounterId] || {})}
              isEditing={isEditing}
            />
          )}

          {/* Clinical Reminders Sub-Tab */}
          {activeSubTab === 'clinical-reminders' && (
            <GenericAdministrativeSubTab
              encounterId={encounterId}
              sectionType="clinical-reminders"
              sectionTitle="Clinical Reminders"
              formData={genericAdminForms[encounterId] || {
                title: '',
                category: '',
                content: '',
                notes: ''
              }}
              onFieldChange={(field, value) => updateGenericAdminForm(encounterId, field, value)}
              onSave={() => handleSaveNewForm('clinical-reminders', 'Clinical Reminder', genericAdminForms[encounterId] || {})}
              isEditing={isEditing}
            />
          )}

          {/* Amendments Sub-Tab */}
          {activeSubTab === 'amendments' && (
            <GenericAdministrativeSubTab
              encounterId={encounterId}
              sectionType="amendments"
              sectionTitle="Amendments"
              formData={genericAdminForms[encounterId] || {
                title: '',
                category: '',
                content: '',
                notes: ''
              }}
              onFieldChange={(field, value) => updateGenericAdminForm(encounterId, field, value)}
              onSave={() => handleSaveNewForm('amendments', 'Amendment', genericAdminForms[encounterId] || {})}
              isEditing={isEditing}
            />
          )}

          {/* Letters Sub-Tab */}
          {activeSubTab === 'letters' && (
            <GenericAdministrativeSubTab
              encounterId={encounterId}
              sectionType="letters"
              sectionTitle="Letters"
              formData={genericAdminForms[encounterId] || {
                title: '',
                category: '',
                content: '',
                notes: ''
              }}
              onFieldChange={(field, value) => updateGenericAdminForm(encounterId, field, value)}
              onSave={() => handleSaveNewForm('letters', 'Letter', genericAdminForms[encounterId] || {})}
              isEditing={isEditing}
            />
          )}

          {/* Review of Systems Checks Sub-Tab */}
          {activeSubTab === 'review-of-systems-checks' && (
            <GenericAdministrativeSubTab
              encounterId={encounterId}
              sectionType="review-of-systems-checks"
              sectionTitle="Review of Systems Checks"
              formData={genericAdminForms[encounterId] || {
                title: '',
                category: '',
                content: '',
                notes: ''
              }}
              onFieldChange={(field, value) => updateGenericAdminForm(encounterId, field, value)}
              onSave={() => handleSaveNewForm('review-of-systems-checks', 'ROS Check', genericAdminForms[encounterId] || {})}
              isEditing={isEditing}
            />
          )}

          {/* Placeholder for other sub-tabs */}
          {!IMPLEMENTED_SUB_TABS.includes(activeSubTab as any) && (
            <div className="bg-white border border-gray-200 rounded p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {activeSubTab
                  .split('-')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
              </h3>
              <div className="p-8 bg-gray-50 border border-gray-200 rounded text-center">
                <p className="text-sm text-gray-600">This section is under development.</p>
                <p className="text-xs text-gray-500 mt-2">
                  Content will be added in a future update.
                </p>
              </div>
            </div>
          )}
        </div>
      </EncounterDetailView>
    </div>
  );
}
