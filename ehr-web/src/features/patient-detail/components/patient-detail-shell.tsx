'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { User, Edit, Calendar, Pill, AlertCircle, Activity, FileText, Loader2, Shield, ChevronLeft, ChevronRight, Plus, X, ChevronDown, LayoutDashboard, Search, Syringe, TestTube, ImageIcon, History, CreditCard, DollarSign, FileCheck, UserCircle, Globe } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@nirmitee.io/design-system';
import { PatientForm } from '@/components/forms/patient-form';
import { EncounterForm } from '@/components/forms/encounter-form';
import { AllergyForm } from '@/components/forms/allergy-form';
import { ImmunizationForm } from '@/components/forms/immunization-form';
import { LabForm } from '@/components/forms/lab-form';
import { ImagingForm } from '@/components/forms/imaging-form';
import { DocumentForm } from '@/components/forms/document-form';
import { TabPageWrapper } from '@/components/layout/tab-page-wrapper';
import { useTabNavigation } from '@/hooks/use-tab-navigation';
import { PatientHeader } from '@/app/patients/[id]/components/PatientHeader';
import { DashboardTab } from '@/app/patients/[id]/components/tabs/DashboardTab';
import { OverviewTab } from '@/app/patients/[id]/components/tabs/OverviewTab';
import { VitalsTab } from '@/app/patients/[id]/components/tabs/VitalsTab';
import { VitalsCards } from '@/app/patients/[id]/components/tabs/VitalsTab/VitalsCards';
import { VitalsTable } from '@/app/patients/[id]/components/tabs/VitalsTab/VitalsTable';
import { ClinicalNotesTab } from '@/app/patients/[id]/components/tabs/ClinicalNotesTab';
import { ClinicalNoteEditor } from '@/app/patients/[id]/components/tabs/ClinicalNotesTab/ClinicalNoteEditor';
import { EncountersTab } from '@/app/patients/[id]/components/tabs/EncountersTab';
import { ProblemsTab } from '@/app/patients/[id]/components/tabs/ProblemsTab';
import { MedicationsTab } from '@/app/patients/[id]/components/tabs/MedicationsTab';
import { AllergiesTab } from '@/app/patients/[id]/components/tabs/AllergiesTab';
import { DocumentsTab as OldDocumentsTab } from '@/app/patients/[id]/components/tabs/DocumentsTab';
import { DocumentsTab } from './tabs/documents-tab';
import { FamilyHistoryTab } from '@/app/patients/[id]/components/tabs/FamilyHistoryTab';
import { VitalsDrawer } from '@/app/patients/[id]/components/drawers/VitalsDrawer';
import { ProblemDrawer } from '@/app/patients/[id]/components/drawers/ProblemDrawer';
import { MedicationDrawer } from '@/app/patients/[id]/components/drawers/MedicationDrawer';
import { InsuranceDrawer } from '@/app/patients/[id]/components/drawers/InsuranceDrawer';
import { MedicalInfoDrawer } from '@/components/encounters/medical-info-drawer';
import AmcRequiresPopover from '@/components/encounters/AmcRequiresPopover';
import { CarePlanForm } from '@/components/forms/care-plan-form';
import { carePlanService, CarePlanFormData } from '@/services/careplan.service';
import { ClinicalInstructionsSection } from '@/components/encounters/clinical-instructions-section';
import { PatientInstructionsSection } from '@/components/encounters/patient-instructions-section';
import { PrescriptionsSectionInline } from '@/components/encounters/prescriptions-section-inline';
import { SavedSection } from '@/app/patients/[id]/components/types';
import { PortalAccessDialog } from '@/components/patients/portal-access-dialog';
import { usePatientDetailStore } from '../store/patient-detail-store';
import { setCachedUserName } from '../utils/form-save-handlers';
import { PatientSidebar } from './patient-sidebar';
import { PatientTabsBar } from './patient-tabs-bar';
import { ContextualActionsBar } from './contextual-actions-bar';
import { EncounterDetailView } from './encounter-detail-view';
import { EncounterTab } from './encounter/EncounterTab';
import { PortalAccessTab } from './tabs/portal-access-tab';
import { InsuranceTab } from './tabs/insurance-tab';
import { ProfileTab } from './tabs/profile-tab';
import { PlaceholderTab } from './tabs/placeholder-tab';
import { VaccinesTab } from './tabs/vaccines-tab';
import { LabTab } from './tabs/lab-tab';
import { ImagingTab } from './tabs/imaging-tab';
import { FormsTab } from './tabs/forms-tab';
import { FacesheetTab } from './tabs/facesheet-tab';
import { PrenatalFacesheetTab } from './tabs/prenatal-facesheet-tab';
import { PrenatalFlowsheet, PrenatalVitals } from '@/features/specialties/ob-gyn/components';
import { TasksTab } from './tabs/tasks-tab';
// Phase 2: Specialty system imports
import { specialtyRegistry } from '@/features/specialties';
import { useRegistryNavigation } from '@/features/specialties/shared/hooks/useRegistryNavigation';
import { EpisodeProvider } from '@/contexts/episode-context';

export function PatientDetailShell() {
  const { openPatientEditTab } = useTabNavigation();
  const { data: session } = useSession();

  // Cache user name for document authorship
  useEffect(() => {
    if (session?.user?.name) {
      setCachedUserName(session.user.name);
    }
  }, [session]);

  // Get all store state - Zustand handles reactivity automatically
  const store = usePatientDetailStore();
  const {
    patientId,
    patient,
    loading,
    activeTab,
    openTabs,
    selectedEncounter,
    openEncounterTabs,
    openEncounterSubTabs,
    activeEncounterSubTab,
    encounterSavedData,
    openDropdown,
    sidebarCollapsed,
    soapForms,
    carePlanForms,
    clinicalInstructionsForms,
    clinicalNotesForms,
    rosForms,
    encounters,
    problems,
    medications,
    allergies,
    observations,
    insurances,
    immunizations,
    imagingStudies,
    labResults,
    documents,
    carePlans,
    editingCarePlanId,
    currentCarePlanData,
    drawers,
    portalAccessDialogOpen,
    portalAccessStatus,
    loadingPortalAccess,
    clinicalNotes,
    showClinicalNoteEditor,
    editingClinicalNote,
    clinicalNoteMode,
    currentEditingEncounterId,
    encounterIdFromQuery,
    setActiveTab,
    closeTab,
    toggleSidebar,
    setSelectedEncounter,
    setOpenEncounterTab,
    closeEncounterTab,
    addEncounterSubTab,
    removeEncounterSubTab,
    setEncounterActiveSubTab,
    setEncounterDropdown,
    updateSoapForm,
    setSoapForm,
    updateCarePlanForm,
    setCarePlanForm,
    updateClinicalInstructionsForm,
    setClinicalInstructionsForm,
    updateClinicalNotesForm,
    setClinicalNotesForm,
    updateRosForm,
    setRosForm,
    setEyeExamForm,
    setFunctionalCognitiveForm,
    setObservationForm,
    setSpeechDictationForm,
    setProcedureOrderForm,
    setLabResultsForm,
    setImagingOrdersForm,
    setQuestionnaireForm,
    setGenericAdminForm,
    setEditingCarePlanId,
    setCurrentCarePlanData,
    setDrawerState,
    setPortalAccessDialogOpen,
    setClinicalNotes,
    setClinicalNoteEditorState,
    updateEncounterSavedData,
    loadAllPatientData,
    checkPortalAccess,
    loadEncounterDocumentation,
    saveDocumentReference,
    handleStartVisit,
    handleSaveVitals,
    handleSaveProblem,
    handleSaveMedication,
    handleSaveInsurance,
    handleEditPatient
  } = store;

  const refreshData = () => {
    loadAllPatientData();
  };

  // Clinical Notes enhanced state
  interface ClinicalNote {
    id: string;
    date: Date | string;
    noteType: string;
    category: string;
    narrative: string;
    createdBy?: string;
    createdByName?: string;
    isFavorite?: boolean;
    tags?: string[];
  }

  // Track which saved sections are expanded in the summary
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  // Track which section is being edited (encounterId-sectionIndex)
  const [editingSection, setEditingSection] = useState<{ [encounterId: string]: number | null }>({});

  // AMC Requires popover state - per encounter
  const [showAmcPopover, setShowAmcPopover] = useState<{ [encounterId: string]: boolean }>({});

  // Patient data is loaded via zustand in parent, child components handle their own loading states

  // Show loading state if patient is not loaded yet
  if (!patient) {
    return (
      <TabPageWrapper title="Patient Details" icon={<User className="h-4 w-4" />}>
        <div className="h-screen flex flex-col bg-gray-50">
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Loading patient details...</p>
          </div>
        </div>
      </TabPageWrapper>
    );
  }

  if (!patientId) {
    return (
      <TabPageWrapper title="Patient Details" icon={<User className="h-4 w-4" />}>
        <div className="h-screen flex flex-col bg-gray-50">
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm">Loading patient ID...</p>
          </div>
        </div>
      </TabPageWrapper>
    );
  }

  // Navigation sections used for the sidebar and browser-style tabs
  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, count: null },
    { id: 'allergies', label: 'Allergies', icon: AlertCircle, count: allergies.length },
    { id: 'problems', label: 'Diagnoses', icon: Search, count: problems.length },
    { id: 'medications', label: 'Medications', icon: Pill, count: medications.length },
    { id: 'vaccines', label: 'Vaccines', icon: Syringe, count: immunizations.length },
    { id: 'vitals', label: 'Vitals', icon: Activity, count: null },
    { id: 'lab', label: 'Lab', icon: TestTube, count: labResults.length },
    { id: 'imaging', label: 'Imaging', icon: ImageIcon, count: imagingStudies.length },
    { id: 'history', label: 'History', icon: History, count: null },
    { id: 'documents', label: 'Documents', icon: FileText, count: documents.length },
    { id: 'encounters', label: 'Visit Details', icon: Calendar, count: null },
    { id: 'financial', label: 'Financial', icon: DollarSign, count: null },
    { id: 'billing', label: 'Billing', icon: FileCheck, count: null },
    { id: 'insurance', label: 'Insurance', icon: Shield, count: null },
    { id: 'card-details', label: 'Card Details', icon: CreditCard, count: null },
    { id: 'profile', label: 'Profile', icon: UserCircle, count: null },
    { id: 'portal-access', label: 'Portal Access', icon: Globe, count: null }
  ];

  const handleOpenEditTab = () => {
    if (!patientId || !patient?.name) {
      console.warn('Cannot open patient edit tab without patient id and name');
      return;
    }
    openPatientEditTab(patientId, patient.name);
  };

  return (
    <TabPageWrapper title={patient.name} icon={<User className="h-4 w-4" />}>
      <div className="h-screen flex flex-col bg-gray-50">
        <PatientHeader
          patient={patient}
          onEdit={handleOpenEditTab}
          onNewVisit={() => setDrawerState('encounter', true)}
          encounters={encounters}
          selectedEncounter={selectedEncounter}
          onEncounterSelect={async (encounterId) => {
            setSelectedEncounter(encounterId);
            // Add encounter tab if not already open
            setOpenEncounterTab(encounterId);
            // Switch to the encounter tab
            setActiveTab(`encounter-${encounterId}`);
            // Load encounter documentation
            await loadEncounterDocumentation(encounterId);
          }}
          allergies={allergies}
          problems={problems}
          insurances={insurances}
          onOpenMedicalInfo={() => setDrawerState('medicalInfo', true)}
          onOpenAllergies={() => setDrawerState('allergy', true)}
          onOpenProblems={() => setDrawerState('problem', true)}
          onOpenInsurance={() => setDrawerState('insurance', true)}
          encounterIdFromQuery={encounterIdFromQuery}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar Navigation */}
          <PatientSidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Browser-Style Tab Bar */}
            <PatientTabsBar />

            {/* Contextual Actions Bar */}
            <ContextualActionsBar activeTab={activeTab} encounters={encounters} />

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-2">
              {/* Browser-style tabs - all tabs rendered and cached, instant switching */}
              <div style={{ display: activeTab === 'dashboard' ? 'block' : 'none' }}>
                <DashboardTab
                  patient={patient}
                  allergies={allergies}
                  problems={problems}
                  medications={medications}
                  encounters={encounters}
                  observations={observations}
                />
              </div>
              <div style={{ display: activeTab === 'chart' ? 'block' : 'none' }}>
                <OverviewTab
                  encounters={encounters}
                  problems={problems}
                  medications={medications}
                  allergies={allergies}
                />
              </div>
              <div style={{ display: activeTab === 'vitals' ? 'block' : 'none' }}>
                <VitalsTab
                  observations={observations}
                  onRecordVitals={() => setDrawerState('vitals', true)}
                />
              </div>
              <div style={{ display: activeTab === 'encounters' ? 'block' : 'none' }}>
                <EncountersTab
                  encounters={encounters}
                  observations={observations}
                  onNewEncounter={() => setDrawerState('encounter', true)}
                  selectedEncounterId={selectedEncounter}
                  onEncounterClick={async (encounterId) => {
                    setSelectedEncounter(encounterId);
                    setOpenEncounterTab(encounterId);
                    // Switch to the encounter tab
                    setActiveTab(`encounter-${encounterId}`);
                    // Load encounter documentation
                    await loadEncounterDocumentation(encounterId);
                  }}
                />
              </div>
              <div style={{ display: activeTab === 'problems' ? 'block' : 'none' }}>
                <ProblemsTab
                  problems={problems}
                  onAddProblem={() => setDrawerState('problem', true)}
                />
              </div>
              <div style={{ display: activeTab === 'medications' ? 'block' : 'none' }}>
                <MedicationsTab
                  patientId={patientId}
                  medications={medications}
                  onPrescribe={() => setDrawerState('medication', true)}
                />
              </div>
              <div style={{ display: activeTab === 'allergies' ? 'block' : 'none' }}>
                <AllergiesTab
                  allergies={allergies}
                  onAddAllergy={() => setDrawerState('allergy', true)}
                />
              </div>
              <div style={{ display: activeTab === 'family-history' ? 'block' : 'none' }}>
                <FamilyHistoryTab patientId={patientId} />
              </div>
              <div style={{ display: activeTab === 'insurance' ? 'block' : 'none' }}>
                <InsuranceTab />
              </div>
              <div style={{ display: activeTab === 'documents' ? 'block' : 'none' }}>
                <DocumentsTab />
              </div>

              {/* Tasks Tab */}
              <div style={{ display: activeTab === 'tasks' ? 'block' : 'none' }}>
                <TasksTab patientId={patientId} />
              </div>

              {/* Vaccines Tab */}
              <div style={{ display: activeTab === 'vaccines' ? 'block' : 'none' }}>
                <VaccinesTab />
              </div>

              {/* Lab Tab */}
              <div style={{ display: activeTab === 'lab' ? 'block' : 'none' }}>
                <LabTab />
              </div>

              {/* Imaging Tab */}
              <div style={{ display: activeTab === 'imaging' ? 'block' : 'none' }}>
                <ImagingTab />
              </div>

              {/* Forms Tab */}
              <div style={{ display: activeTab === 'forms' ? 'block' : 'none' }}>
                <FormsTab patientId={patientId} encounterId={selectedEncounter || undefined} />
              </div>

              {/* Facesheet Tab */}
              <div style={{ display: activeTab === 'facesheet' ? 'block' : 'none' }}>
                <FacesheetTab patientId={patientId} />
              </div>

              {/* Prenatal Facesheet Tab */}
              <div style={{ display: activeTab === 'facesheet-pregnancy' ? 'block' : 'none' }}>
                <PrenatalFacesheetTab patientId={patientId} />
              </div>

              {/* Prenatal Flowsheet Tab */}
              <div style={{ display: activeTab === 'flowsheet-prenatal' ? 'block' : 'none' }}>
                <PrenatalFlowsheet patientId={patientId} />
              </div>

              {/* Prenatal Vitals Tab */}
              <div style={{ display: activeTab === 'vitals-prenatal' ? 'block' : 'none' }}>
                <PrenatalVitals patientId={patientId} />
              </div>

              {/* History Tab */}
              <div style={{ display: activeTab === 'history' ? 'block' : 'none' }}>
                <PlaceholderTab
                  title="Medical History"
                  icon={History}
                  message="No medical history recorded"
                />
              </div>

              {/* Financial Tab */}
              <div style={{ display: activeTab === 'financial' ? 'block' : 'none' }}>
                <PlaceholderTab
                  title="Financial Information"
                  icon={DollarSign}
                  message="No financial information available"
                />
              </div>

              {/* Billing Tab */}
              <div style={{ display: activeTab === 'billing' ? 'block' : 'none' }}>
                <PlaceholderTab
                  title="Billing"
                  icon={FileCheck}
                  message="No billing information available"
                />
              </div>

              {/* Card Details Tab */}
              <div style={{ display: activeTab === 'card-details' ? 'block' : 'none' }}>
                <PlaceholderTab
                  title="Payment Methods"
                  icon={CreditCard}
                  message="No payment methods on file"
                  showButton={true}
                  buttonLabel="Add Card"
                  onButtonClick={() => console.log('Add card clicked')}
                />
              </div>

              {/* Profile Tab */}
              <div style={{ display: activeTab === 'profile' ? 'block' : 'none' }}>
                <ProfileTab />
              </div>

              {/* Portal Access Tab */}
              <div style={{ display: activeTab === 'portal-access' ? 'block' : 'none' }}>
                <PortalAccessTab />
              </div>

              {/* Phase 2: Dynamic Specialty Component Renderer */}
              <SpecialtyComponentRenderer activeTab={activeTab} patientId={patientId} />

              {/* Dynamic Encounter Tabs */}
              {openEncounterTabs.map((encounterId) => {
                const encounter = encounters.find(e => e.id === encounterId);
                const isActive = activeTab === `encounter-${encounterId}`;
                const encounterSubTabs = openEncounterSubTabs[encounterId] || [];
                const activeSubTab = activeEncounterSubTab[encounterId] || 'summary';

                if (!encounter) return null;

                return (
                  <EncounterTab
                    key={encounterId}
                    encounterId={encounterId}
                    encounter={encounter}
                    patient={patient}
                    patientId={patientId}
                    isActive={isActive}
                    openSubTabs={encounterSubTabs}
                    activeSubTab={activeSubTab}
                    onSubTabChange={(tabId) => setEncounterActiveSubTab(encounterId, tabId)}
                    onSubTabAdd={(tabId) => addEncounterSubTab(encounterId, tabId)}
                    onSubTabRemove={(tabId) => removeEncounterSubTab(encounterId, tabId)}
                    openDropdown={openDropdown[encounterId] || null}
                    onDropdownToggle={(category) => setEncounterDropdown(encounterId, category)}
                    showAmcPopover={showAmcPopover[encounterId] || false}
                    onAmcPopoverToggle={() =>
                      setShowAmcPopover({ ...showAmcPopover, [encounterId]: !showAmcPopover[encounterId] })
                    }
                    onAmcPopoverClose={() =>
                      setShowAmcPopover({ ...showAmcPopover, [encounterId]: false })
                    }
                    onAmcSave={(requirements) => {
                      console.log('AMC Requirements saved for encounter:', encounterId, requirements);
                    }}
                    savedSections={encounterSavedData[encounterId] || []}
                    expandedSections={expandedSections}
                    onToggleSectionExpand={(sectionKey) =>
                      setExpandedSections({
                        ...expandedSections,
                        [sectionKey]: !expandedSections[sectionKey]
                      })
                    }
                    onEditSection={(idx, section) => {
                      setEditingSection({ ...editingSection, [encounterId]: idx });

                      if (section.type === 'soap') {
                        setSoapForm(encounterId, section.data as any);
                        setEncounterActiveSubTab(encounterId, 'soap');
                        addEncounterSubTab(encounterId, 'soap');
                      } else if (section.type === 'care-plan') {
                        setEditingCarePlanId(encounterId, section.id || null);
                        setCurrentCarePlanData(encounterId, section.data as any);
                        setEncounterActiveSubTab(encounterId, 'care-plan');
                        addEncounterSubTab(encounterId, 'care-plan');
                      } else if (section.type === 'clinical-instructions') {
                        setClinicalInstructionsForm(encounterId, section.data as any);
                        setEncounterActiveSubTab(encounterId, 'clinical-instructions');
                        addEncounterSubTab(encounterId, 'clinical-instructions');
                      } else if (section.type === 'clinical-notes') {
                        setClinicalNotesForm(encounterId, {
                          notes: typeof section.data === 'string' ? section.data : section.data.notes || ''
                        });
                        setEncounterActiveSubTab(encounterId, 'clinical-notes');
                        addEncounterSubTab(encounterId, 'clinical-notes');
                      } else if (section.type === 'review-of-systems') {
                        const rosData: any = {};
                        section.data.systems?.forEach((sys: any) => {
                          rosData[sys.name] = sys.findings;
                        });
                        setRosForm(encounterId, rosData);
                        setEncounterActiveSubTab(encounterId, 'review-of-systems');
                        addEncounterSubTab(encounterId, 'review-of-systems');
                      } else if (section.type === 'eye-exam') {
                        setEyeExamForm(encounterId, section.data as any);
                        setEncounterActiveSubTab(encounterId, 'eye-exam');
                        addEncounterSubTab(encounterId, 'eye-exam');
                      } else if (section.type === 'functional-and-cognitive-status') {
                        setFunctionalCognitiveForm(encounterId, section.data as any);
                        setEncounterActiveSubTab(encounterId, 'functional-and-cognitive-status');
                        addEncounterSubTab(encounterId, 'functional-and-cognitive-status');
                      } else if (section.type === 'observation') {
                        setObservationForm(encounterId, section.data as any);
                        setEncounterActiveSubTab(encounterId, 'observation');
                        addEncounterSubTab(encounterId, 'observation');
                      } else if (section.type === 'speech-dictation') {
                        setSpeechDictationForm(encounterId, section.data as any);
                        setEncounterActiveSubTab(encounterId, 'speech-dictation');
                        addEncounterSubTab(encounterId, 'speech-dictation');
                      } else if (section.type === 'procedure-order') {
                        setProcedureOrderForm(encounterId, section.data as any);
                        setEncounterActiveSubTab(encounterId, 'procedure-order');
                        addEncounterSubTab(encounterId, 'procedure-order');
                      } else if (section.type === 'lab-results') {
                        setLabResultsForm(encounterId, section.data as any);
                        setEncounterActiveSubTab(encounterId, 'lab-results');
                        addEncounterSubTab(encounterId, 'lab-results');
                      } else if (section.type === 'imaging-orders') {
                        setImagingOrdersForm(encounterId, section.data as any);
                        setEncounterActiveSubTab(encounterId, 'imaging-orders');
                        addEncounterSubTab(encounterId, 'imaging-orders');
                      } else if (section.type === 'new-questionnaire' || section.type === 'questionnaire-responses') {
                        setQuestionnaireForm(encounterId, section.data as any);
                        setEncounterActiveSubTab(encounterId, section.type as any);
                        addEncounterSubTab(encounterId, section.type as any);
                      } else if (['forms', 'track-anything', 'patient-reminders', 'clinical-reminders', 'amendments', 'letters', 'review-of-systems-checks'].includes(section.type)) {
                        setGenericAdminForm(encounterId, section.data as any);
                        setEncounterActiveSubTab(encounterId, section.type as any);
                        addEncounterSubTab(encounterId, section.type as any);
                      }
                    }}
                    onDeleteSection={async (idx, section) => {
                      if (section.type === 'care-plan' && section.id) {
                        if (confirm('Are you sure you want to delete this Care Plan?')) {
                          try {
                            await carePlanService.deleteCarePlan(section.id);
                            await loadEncounterDocumentation(encounterId);
                            alert('Care Plan deleted successfully!');
                          } catch (error) {
                            console.error('Error deleting care plan:', error);
                            alert('Failed to delete Care Plan. Please try again.');
                          }
                        }
                      } else {
                        updateEncounterSavedData(encounterId, (sections) =>
                          (sections || []).filter((_, i) => i !== idx)
                        );
                      }
                    }}
                    soapForm={soapForms[encounterId] || { subjective: '', objective: '', assessment: '', plan: '' }}
                    rosForm={rosForms[encounterId] || {}}
                    clinicalNotes={clinicalNotes[encounterId] || []}
                    onSoapFieldChange={(field, value) => updateSoapForm(encounterId, field, value)}
                    onRosFieldChange={(system, value) => updateRosForm(encounterId, system, value)}
                    onSoapSave={async () => {
                      const currentData = encounterSavedData[encounterId] || [];
                      const soapData = soapForms[encounterId] || {
                        subjective: '',
                        objective: '',
                        assessment: '',
                        plan: ''
                      };
                      const editingIdx = editingSection[encounterId];

                      const section = {
                        title: 'SOAP',
                        type: 'soap',
                        author: 'Billy Smith',
                        date: new Date().toISOString(),
                        data: soapData,
                        signatures: []
                      };

                      const documentId =
                        editingIdx !== null && editingIdx !== undefined
                          ? currentData[editingIdx]?.id
                          : undefined;

                      await saveDocumentReference(encounterId, section, documentId);
                      setEditingSection({ ...editingSection, [encounterId]: null });
                      setSoapForm(encounterId, { subjective: '', objective: '', assessment: '', plan: '' });
                      setEncounterActiveSubTab(encounterId, 'summary');
                    }}
                    onRosSave={async () => {
                      const currentData = encounterSavedData[encounterId] || [];
                      const rosData = rosForms[encounterId] || {};
                      const editingIdx = editingSection[encounterId];
                      const systems = Object.entries(rosData)
                        .filter(([, findings]) => findings)
                        .map(([name, findings]) => ({ name, findings }));

                      const section: any = {
                        title: 'Review Of Systems',
                        type: 'review-of-systems',
                        author: 'Billy Smith',
                        date: new Date().toISOString(),
                        data: { systems },
                        signatures: []
                      };

                      const documentId =
                        editingIdx !== null && editingIdx !== undefined
                          ? currentData[editingIdx]?.id
                          : undefined;

                      await saveDocumentReference(encounterId, section, documentId);
                      setEditingSection({ ...editingSection, [encounterId]: null });
                      setRosForm(encounterId, {});
                      setEncounterActiveSubTab(encounterId, 'summary');
                    }}
                    carePlans={carePlans[encounterId] || []}
                    currentCarePlanData={currentCarePlanData[encounterId] || null}
                    editingCarePlanId={editingCarePlanId[encounterId] || null}
                    onCarePlanSave={async (formData) => {
                      try {
                        const editingId = editingCarePlanId[encounterId];

                        if (editingId) {
                          await carePlanService.updateCarePlan(editingId, patientId, encounterId, formData);
                        } else {
                          await carePlanService.createCarePlan(patientId, encounterId, formData);
                        }

                        setEditingCarePlanId(encounterId, null);
                        setCurrentCarePlanData(encounterId, null);
                        await loadEncounterDocumentation(encounterId);

                        alert(editingId ? 'Care Plan updated successfully!' : 'Care Plan created successfully!');
                      } catch (error) {
                        console.error('Error saving care plan:', error);
                        alert('Failed to save Care Plan. Please try again.');
                      }
                    }}
                    onCarePlanCancel={() => {
                      setEditingCarePlanId(encounterId, null);
                      setCurrentCarePlanData(encounterId, null);
                    }}
                    onCarePlanEdit={(carePlan) => {
                      setEditingCarePlanId(encounterId, carePlan.id);
                      setCurrentCarePlanData(encounterId, carePlanService.convertToFormData(carePlan));
                    }}
                    onCarePlanDelete={async (carePlanId) => {
                      if (confirm('Are you sure you want to delete this Care Plan?')) {
                        try {
                          await carePlanService.deleteCarePlan(carePlanId);
                          await loadEncounterDocumentation(encounterId);
                          alert('Care Plan deleted successfully!');
                        } catch (error) {
                          console.error('Error deleting care plan:', error);
                          alert('Failed to delete Care Plan.');
                        }
                      }
                    }}
                    onCarePlanAdd={() => {
                      setCurrentCarePlanData(encounterId, {
                        status: 'active',
                        intent: 'plan',
                        activities: [
                          {
                            code: '',
                            date: new Date().toISOString().split('T')[0],
                            type: 'Task',
                            description: '',
                            status: 'not-started'
                          }
                        ]
                      } as any);
                    }}
                    onAddClinicalNote={() => {
                      setClinicalNoteEditorState({
                        isOpen: true,
                        mode: 'create',
                        encounterId,
                        note: null
                      });
                    }}
                    onEditClinicalNote={(note) => {
                      setClinicalNoteEditorState({
                        isOpen: true,
                        mode: 'edit',
                        encounterId,
                        note
                      });
                    }}
                    onDeleteClinicalNote={(noteId) => {
                      setClinicalNotes(encounterId, (notes) => (notes || []).filter((n) => n.id !== noteId));
                    }}
                    onToggleFavoriteClinicalNote={(noteId) => {
                      setClinicalNotes(encounterId, (notes) =>
                        (notes || []).map((n) => (n.id === noteId ? { ...n, isFavorite: !n.isFavorite } : n))
                      );
                    }}
                    observations={observations}
                    onRecordVitals={() => setDrawerState('vitals', true)}
                    isEditing={editingSection[encounterId] !== null && editingSection[encounterId] !== undefined}
                    loadEncounterDocumentation={loadEncounterDocumentation}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Edit Patient Drawer */}
        <Drawer open={drawers.edit} onOpenChange={(open) => setDrawerState('edit', open)}>
          <DrawerContent side="right" size="2xl" className="overflow-y-auto">
            <DrawerHeader>
              <DrawerTitle>Edit Patient</DrawerTitle>
            </DrawerHeader>
            <div className="mt-6">
              {patient && (
                <PatientForm
                  isEditing={true}
                  onSubmit={handleEditPatient}
                  onCancel={() => setDrawerState('edit', false)}
                />
              )}
            </div>
          </DrawerContent>
        </Drawer>

        {/* New Encounter Drawer */}
        <Drawer open={drawers.encounter} onOpenChange={(open) => setDrawerState('encounter', open)}>
          <DrawerContent side="right" size="2xl" className="overflow-y-auto">
            <DrawerHeader>
              <DrawerTitle>New Encounter</DrawerTitle>
            </DrawerHeader>
            <div className="mt-6">
              {patient && (
                <EncounterForm
                  patient={{
                    id: patient.id,
                    name: patient.name,
                    age: patient.age,
                    gender: patient.gender,
                    mrn: patient.mrn,
                    phone: patient.phone,
                    email: patient.email
                  }}
                  onBack={() => setDrawerState('encounter', false)}
                  onStartVisit={handleStartVisit}
                />
              )}
            </div>
          </DrawerContent>
        </Drawer>

        {/* Vitals, Problem, Medication Drawers */}
        <VitalsDrawer
          open={drawers.vitals}
          onOpenChange={(open) => setDrawerState('vitals', open)}
          onSave={handleSaveVitals}
        />
        <ProblemDrawer
          open={drawers.problem}
          onOpenChange={(open) => setDrawerState('problem', open)}
          onSave={handleSaveProblem}
        />
        <MedicationDrawer
          open={drawers.medication}
          onOpenChange={(open) => setDrawerState('medication', open)}
          onSave={handleSaveMedication}
        />

        {/* Add Allergy Drawer */}
        <Drawer open={drawers.allergy} onOpenChange={(open) => setDrawerState('allergy', open)}>
          <DrawerContent side="right" size="md" className="overflow-y-auto">
            <DrawerHeader>
              <DrawerTitle>Add Allergy</DrawerTitle>
            </DrawerHeader>
            <div className="mt-6">
              {patient && (
                <AllergyForm
                  patientId={patient.id}
                  patientName={patient.name}
                  onSuccess={() => {
                    setDrawerState('allergy', false);
                    refreshData();
                  }}
                  onCancel={() => setDrawerState('allergy', false)}
                />
              )}
            </div>
          </DrawerContent>
        </Drawer>

        {/* Add Immunization Drawer */}
        <Drawer open={drawers.immunization} onOpenChange={(open) => setDrawerState('immunization', open)}>
          <DrawerContent side="right" size="md" className="overflow-hidden">
            <DrawerHeader className="border-b border-gray-200">
              <DrawerTitle>Add Vaccine</DrawerTitle>
            </DrawerHeader>
            {patient && (
              <ImmunizationForm
                patientId={patient.id}
                patientName={patient.name}
                onSuccess={() => {
                  setDrawerState('immunization', false);
                  refreshData();
                }}
                onCancel={() => setDrawerState('immunization', false)}
              />
            )}
          </DrawerContent>
        </Drawer>

        {/* Add Lab Result Drawer */}
        <Drawer open={drawers.lab} onOpenChange={(open) => setDrawerState('lab', open)}>
          <DrawerContent side="right" size="md" className="overflow-hidden">
            <DrawerHeader className="border-b border-gray-200">
              <DrawerTitle>Add Lab Result</DrawerTitle>
            </DrawerHeader>
            {patient && (
              <LabForm
                patientId={patient.id}
                patientName={patient.name}
                onSuccess={() => {
                  setDrawerState('lab', false);
                  refreshData();
                }}
                onCancel={() => setDrawerState('lab', false)}
              />
            )}
          </DrawerContent>
        </Drawer>

        {/* Add Imaging Study Drawer */}
        <Drawer open={drawers.imaging} onOpenChange={(open) => setDrawerState('imaging', open)}>
          <DrawerContent side="right" size="md" className="overflow-hidden">
            <DrawerHeader className="border-b border-gray-200">
              <DrawerTitle>Add Imaging Study</DrawerTitle>
            </DrawerHeader>
            {patient && (
              <ImagingForm
                patientId={patient.id}
                patientName={patient.name}
                onSuccess={() => {
                  setDrawerState('imaging', false);
                  refreshData();
                }}
                onCancel={() => setDrawerState('imaging', false)}
              />
            )}
          </DrawerContent>
        </Drawer>

        {/* Add Document Drawer */}
        <Drawer open={drawers.document} onOpenChange={(open) => setDrawerState('document', open)}>
          <DrawerContent side="right" size="md" className="overflow-hidden">
            <DrawerHeader className="border-b border-gray-200">
              <DrawerTitle>Add Document</DrawerTitle>
            </DrawerHeader>
            {patient && (
              <DocumentForm
                patientId={patient.id}
                patientName={patient.name}
                onSuccess={() => {
                  setDrawerState('document', false);
                  refreshData();
                }}
                onCancel={() => setDrawerState('document', false)}
              />
            )}
          </DrawerContent>
        </Drawer>

        {/* Medical Info Drawer */}
        <MedicalInfoDrawer
          isOpen={drawers.medicalInfo}
          onClose={() => setDrawerState('medicalInfo', false)}
          patientHistory={""}
          patientHabitsStructured={undefined}
          patientAllergiesStructured={undefined}
          onUpdate={async (data) => {
            // In a real app, this would update the backend
            console.log('Updating medical info:', data);
            // Refresh data
            /*
console.log('Medical info updated:', data);
            setDrawerState('medicalInfo', false);
            refreshData();
            */
            loadAllPatientData();
          }}
        />

        {/* Insurance Drawer */}
        <InsuranceDrawer
          open={drawers.insurance}
          onOpenChange={(open) => setDrawerState('insurance', open)}
          onSave={handleSaveInsurance}
          patientId={patientId}
        />

        {/* Clinical Note Editor Drawer */}
        <ClinicalNoteEditor
          open={showClinicalNoteEditor}
          onOpenChange={(isOpen) =>
            setClinicalNoteEditorState({
              isOpen,
              mode: clinicalNoteMode,
              encounterId: isOpen ? currentEditingEncounterId : '',
              note: isOpen ? editingClinicalNote : null
            })
          }
          onSave={async (note) => {
            if (clinicalNoteMode === 'create') {
              // Create new note
              const newNote = {
                ...note,
                id: `note-${Date.now()}`,
                createdBy: 'practitioner-123',
                createdByName: 'Dr. Smith',
              };
              setClinicalNotes(currentEditingEncounterId, (notes) => [...(notes || []), newNote]);
            } else {
              // Update existing note
              setClinicalNotes(currentEditingEncounterId, (notes) =>
                (notes || []).map((n) => (n.id === note.id ? note : n))
              );
            }
            setClinicalNoteEditorState({ isOpen: false, encounterId: '', note: null });
          }}
          note={editingClinicalNote}
          mode={clinicalNoteMode}
        />
      </div>

      {/* Portal Access Dialog */}
      <PortalAccessDialog
        open={portalAccessDialogOpen}
        onOpenChange={setPortalAccessDialogOpen}
        patientId={patientId}
        patientEmail={patient?.email}
        patientName={patient?.name}
        onSuccess={() => {
          // Refresh patient data and portal access status
          void loadAllPatientData();
          void checkPortalAccess();
        }}
      />
    </TabPageWrapper>
  );
}

/**
 * Phase 2: Dynamic Specialty Component Renderer
 * Dynamically loads and renders specialty components based on active tab
 */
interface SpecialtyComponentRendererProps {
  activeTab: string;
  patientId: string;
}

function SpecialtyComponentRenderer({ activeTab, patientId }: SpecialtyComponentRendererProps) {
  // Get specialty navigation to find component mappings
  const { navigation } = useRegistryNavigation('all');

  console.log('🔍 SpecialtyComponentRenderer - activeTab:', activeTab);
  console.log('🔍 Navigation sections:', navigation.map(n => ({ id: n.id, componentName: n.componentName })));

  // Find matching navigation section
  const matchingSection = navigation.find(section => section.id === activeTab && section.componentName);

  if (!matchingSection || !matchingSection.componentName) {
    console.log('❌ No matching section for activeTab:', activeTab);
    return null; // Not a specialty tab
  }

  console.log('✅ Found matching section:', matchingSection);

  // Find specialty module that has this component
  const allModules = specialtyRegistry.getAll();
  console.log('📦 Registry modules:', allModules.map(m => ({
    slug: m.slug,
    components: m.components ? Object.keys(m.components) : 'NO COMPONENTS',
    hasComponents: !!m.components
  })));
  console.log('🔎 Looking for component:', matchingSection.componentName);

  let SpecialtyComponent = null;
  let moduleSlug = null;

  for (const module of allModules) {
    console.log('🔍 Checking module:', module.slug, 'components:', module.components);
    if (module.components && module.components[matchingSection.componentName]) {
      console.log('✅ Found component in module:', module.slug);
      SpecialtyComponent = module.components[matchingSection.componentName];
      moduleSlug = module.slug;
      break;
    } else {
      console.log('❌ Component not in module:', module.slug);
    }
  }

  console.log('🎯 Final result - Found component:', !!SpecialtyComponent, 'from module:', moduleSlug);

  if (!SpecialtyComponent || !moduleSlug) {
    return (
      <div style={{ display: activeTab === matchingSection.id ? 'block' : 'none' }}>
        <div className="p-8 text-center text-gray-500">
          <p>Component "{matchingSection.componentName}" not found</p>
          <p className="text-sm mt-2">Please ensure the specialty module is properly registered</p>
        </div>
      </div>
    );
  }

  // Render the specialty component wrapped in EpisodeProvider
  // IMPORTANT: Only show when this tab is active (same pattern as other tabs)
  return (
    <div style={{ display: activeTab === matchingSection.id ? 'block' : 'none' }}>
      <EpisodeProvider patientId={patientId} autoLoad={true}>
        <Suspense
          fallback={
            <div className="p-8 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Loading specialty component...</span>
            </div>
          }
        >
          <SpecialtyComponent patientId={patientId} />
        </Suspense>
      </EpisodeProvider>
    </div>
  );
}
