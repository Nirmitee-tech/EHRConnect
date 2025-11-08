'use client';

import React, { useState } from 'react';
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
import { PatientSidebar } from './patient-sidebar';
import { PatientTabsBar } from './patient-tabs-bar';
import { EncounterDetailView } from './encounter-detail-view';
import { PortalAccessTab } from './tabs/portal-access-tab';
import { InsuranceTab } from './tabs/insurance-tab';
import { ProfileTab } from './tabs/profile-tab';
import { PlaceholderTab } from './tabs/placeholder-tab';
import { VaccinesTab } from './tabs/vaccines-tab';
import { LabTab } from './tabs/lab-tab';
import { ImagingTab } from './tabs/imaging-tab';

export function PatientDetailShell() {
  const { openPatientEditTab } = useTabNavigation();

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

            {/* Dynamic Encounter Tabs */}
            {openEncounterTabs.map((encounterId) => {
              const encounter = encounters.find(e => e.id === encounterId);
              const isActive = activeTab === `encounter-${encounterId}`;
              const encounterSubTabs = openEncounterSubTabs[encounterId] || [];
              const activeSubTab = activeEncounterSubTab[encounterId] || 'summary';

              if (!encounter) return null;

              // OpenEMR-style dropdown menu structure
              const dropdownMenus = {
                Administrative: [
                  'Forms', 'Track Anything', 'Patient Reminders', 'Clinical Reminders',
                  'Amendments', 'Letters'
                ],
                Clinical: [
                  'Care Plan', 'Clinical Instructions', 'Patient Instructions', 'Clinical Notes', 'Eye Exam',
                  'Functional and Cognitive Status', 'Observation', 'Review Of Systems',
                  'Review of Systems Checks', 'SOAP', 'Speech Dictation', 'Vitals'
                ],
                Orders: [
                  'Procedure Order', 'Lab Results', 'Imaging Orders', 'Prescriptions'
                ],
                Questionnaires: [
                  'New Questionnaire', 'Questionnaire Responses'
                ]
              };

              // Function to add a new sub-tab
              const addSubTab = (tabId: string) => {
                addEncounterSubTab(encounterId, tabId);
              };

              // Function to remove a sub-tab
              const removeSubTab = (tabId: string) => {
                removeEncounterSubTab(encounterId, tabId);
              };

              return (
                <div key={encounterId} style={{ display: isActive ? 'block' : 'none' }}>
                  <EncounterDetailView encounterId={encounterId}>
                    {/* Top Bar with Dropdowns - OpenEMR Style */}
                  <div className="bg-white border-b border-gray-200">
                    {/* Dropdown Menus Row */}
                    <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200">
                      {Object.entries(dropdownMenus).map(([category, items]) => (
                        <div key={category} className="relative">
                          <button
                            onClick={() => {
                              const currentDropdown = openDropdown[encounterId];
                              setEncounterDropdown(encounterId, currentDropdown === category ? null : category);
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded flex items-center gap-1"
                          >
                            {category}
                            <ChevronDown className="h-3 w-3" />
                          </button>
                          {/* Dropdown Menu */}
                          {openDropdown[encounterId] === category && (
                            <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded shadow-lg z-50">
                              {items.map((item) => (
                                <button
                                  key={item}
                                  onClick={() => {
                                    addSubTab(item.toLowerCase().replace(/\s+/g, '-'));
                                    setEncounterDropdown(encounterId, null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                >
                                  {item}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="ml-auto flex items-center gap-2">
                        <div className="relative">
                          <button
                            onClick={() => setShowAmcPopover({ ...showAmcPopover, [encounterId]: !showAmcPopover[encounterId] })}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                          >
                            AMC Requires
                          </button>
                          <AmcRequiresPopover
                            isOpen={showAmcPopover[encounterId] || false}
                            onClose={() => setShowAmcPopover({ ...showAmcPopover, [encounterId]: false })}
                            encounterId={encounterId}
                            onSave={(requirements) => {
                              console.log('AMC Requirements saved for encounter:', encounterId, requirements);
                              // You can save this to your state or backend here
                            }}
                          />
                        </div>
                        <button className="px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded">
                          Edit
                        </button>
                        <button className="px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded">
                          eSign
                        </button>
                        <button className="px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded">
                          Delete
                        </button>
                        <button className="px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded">
                          Collapse All
                        </button>
                        <button className="px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded">
                          Expand All
                        </button>
                      </div>
                    </div>

                    {/* Sub-Tabs Row - Browser-style tabs */}
                    <div className="flex items-center gap-0.5 px-4 py-1 overflow-x-auto bg-gray-50">
                      {/* Summary Tab - Always visible */}
                      <button
                        onClick={() => setEncounterActiveSubTab(encounterId, 'summary')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-t whitespace-nowrap transition-colors border-t border-l border-r ${
                          activeSubTab === 'summary'
                            ? 'bg-white text-blue-600 border-gray-300'
                            : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        Summary
                      </button>

                      {/* Dynamic Sub-Tabs */}
                      {encounterSubTabs.map((tabId) => {
                        const tabLabel = tabId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                        return (
                          <div key={tabId} className="relative group">
                            <button
                              onClick={() => setEncounterActiveSubTab(encounterId, tabId)}
                              className={`px-3 py-1.5 pr-7 text-xs font-medium rounded-t whitespace-nowrap transition-colors border-t border-l border-r ${
                                activeSubTab === tabId
                                  ? 'bg-white text-blue-600 border-gray-300'
                                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                              }`}
                            >
                              {tabLabel}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSubTab(tabId);
                              }}
                              className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-300 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3 text-gray-600" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Encounter Content */}
                  <div className="px-4">
                    {/* Summary Section - Visit Summary Format */}
                    {activeSubTab === 'summary' && (
                      <div className="space-y-3">
                        <div className="bg-white border border-gray-200 rounded p-4">
                          <h3 className="text-base font-semibold text-gray-900 mb-3">
                            {new Date(encounter.period?.start || encounter.startTime || '').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} Encounter for {patient?.name}
                          </h3>
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div>
                              <span className="text-gray-600">Status:</span>
                              <span className="ml-2 font-medium capitalize">{encounter.status}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Type:</span>
                              <span className="ml-2 font-medium">{typeof encounter.class === 'object' ? encounter.class?.display : encounter.class}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Practitioner:</span>
                              <span className="ml-2 font-medium">{encounter.practitionerName || 'Not specified'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Display all saved sections */}
                        {encounterSavedData[encounterId]?.map((section, idx) => {
                          const sectionKey = `${encounterId}-${idx}`;
                          const isExpanded = expandedSections[sectionKey] !== false; // Default to expanded

                          return (
                            <div key={idx} className="bg-white border border-gray-200 rounded overflow-hidden">
                              {/* Section Header - Collapsible */}
                              <button
                                onClick={() => setExpandedSections({
                                  ...expandedSections,
                                  [sectionKey]: !isExpanded
                                })}
                                className="w-full flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${!isExpanded ? '-rotate-90' : ''}`} />
                                  <h4 className="text-sm font-semibold text-blue-600">{section.title}</h4>
                                  <span className="text-xs text-gray-500">(by {section.author || 'Unknown'})</span>
                                </div>
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => {
                                      // Set editing mode
                                      setEditingSection({ ...editingSection, [encounterId]: idx });

                                      // Load data into form based on section type
                                      if (section.type === 'soap') {
                                        setSoapForm(encounterId, section.data as { subjective: string; objective: string; assessment: string; plan: string });
                                        setEncounterActiveSubTab(encounterId, 'soap');
                                        addEncounterSubTab(encounterId, 'soap');
                                      } else if (section.type === 'care-plan') {
                                        // Set editing care plan
                                        setEditingCarePlanId(encounterId, section.id || null);
                                        setCurrentCarePlanData(encounterId, section.data as CarePlanFormData);
                                        setEncounterActiveSubTab(encounterId, 'care-plan');
                                        addEncounterSubTab(encounterId, 'care-plan');
                                      } else if (section.type === 'clinical-instructions') {
                                        setClinicalInstructionsForm(encounterId, section.data as { patientInstructions: string; followUpInstructions: string });
                                        setEncounterActiveSubTab(encounterId, 'clinical-instructions');
                                        addEncounterSubTab(encounterId, 'clinical-instructions');
                                      } else if (section.type === 'clinical-notes') {
                                        setClinicalNotesForm(encounterId, { notes: typeof section.data === 'string' ? section.data : section.data.notes || '' });
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
                                      }
                                    }}
                                    className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900"
                                  >
                                    Edit
                                  </button>
                                  <button className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900">
                                    eSign
                                  </button>
                                  <button
                                    onClick={async () => {
                                      // Handle delete based on section type
                                      if (section.type === 'care-plan' && section.id) {
                                        // Delete from FHIR backend
                                        if (confirm('Are you sure you want to delete this Care Plan?')) {
                                          try {
                                            await carePlanService.deleteCarePlan(section.id);
                                            // Reload encounter documentation
                                            await loadEncounterDocumentation(encounterId);
                                            alert('Care Plan deleted successfully!');
                                          } catch (error) {
                                            console.error('Error deleting care plan:', error);
                                            alert('Failed to delete Care Plan. Please try again.');
                                          }
                                        }
                                      } else {
                                        // Delete section from local state
                                        updateEncounterSavedData(encounterId, (sections) =>
                                          (sections || []).filter((_, i) => i !== idx)
                                        );
                                      }
                                    }}
                                    className="px-2 py-1 text-xs text-red-600 hover:text-red-800"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </button>

                              {/* Section Content */}
                              {isExpanded && (
                                <div className="p-4">
                                  {section.type === 'soap' && (
                                    <div className="space-y-3 text-sm">
                                      {section.data.subjective && (
                                        <div>
                                          <p className="font-semibold text-gray-900">Subjective:</p>
                                          <p className="text-gray-700 whitespace-pre-wrap">{section.data.subjective}</p>
                                        </div>
                                      )}
                                      {section.data.objective && (
                                        <div>
                                          <p className="font-semibold text-gray-900">Objective:</p>
                                          <p className="text-gray-700 whitespace-pre-wrap">{section.data.objective}</p>
                                        </div>
                                      )}
                                      {section.data.assessment && (
                                        <div>
                                          <p className="font-semibold text-gray-900">Assessment:</p>
                                          <p className="text-gray-700 whitespace-pre-wrap">{section.data.assessment}</p>
                                        </div>
                                      )}
                                      {section.data.plan && (
                                        <div>
                                          <p className="font-semibold text-gray-900">Plan:</p>
                                          <p className="text-gray-700 whitespace-pre-wrap">{section.data.plan}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {section.type === 'review-of-systems' && (
                                    <div className="space-y-2 text-sm">
                                      {section.data.systems?.map((sys: any, i: number) => (
                                        <div key={i}>
                                          <p className="font-semibold text-gray-900">{sys.name}:</p>
                                          <p className="text-gray-700">{sys.findings || 'Normal'}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {section.type === 'vitals' && (
                                    <div className="grid grid-cols-3 gap-3 text-sm">
                                      {section.data.vitals?.map((vital: any, i: number) => (
                                        <div key={i} className="p-2 bg-gray-50 rounded">
                                          <p className="text-xs text-gray-600">{vital.name}</p>
                                          <p className="font-semibold text-gray-900">{vital.value} {vital.unit}</p>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {section.type === 'care-plan' && (
                                    <div className="space-y-4 text-sm">
                                      {/* Care Plan Metadata */}
                                      {(section.data.status || section.data.intent || section.data.title) && (
                                        <div className="grid grid-cols-3 gap-3 p-3 bg-blue-50 rounded border border-blue-200">
                                          {section.data.status && (
                                            <div><span className="font-medium text-blue-900">Status:</span> <span className="text-blue-700 capitalize">{section.data.status}</span></div>
                                          )}
                                          {section.data.intent && (
                                            <div><span className="font-medium text-blue-900">Intent:</span> <span className="text-blue-700 capitalize">{section.data.intent}</span></div>
                                          )}
                                          {section.data.title && (
                                            <div className="col-span-3"><span className="font-medium text-blue-900">Title:</span> <span className="text-blue-700">{section.data.title}</span></div>
                                          )}
                                          {section.data.description && (
                                            <div className="col-span-3"><span className="font-medium text-blue-900">Description:</span> <span className="text-blue-700">{section.data.description}</span></div>
                                          )}
                                        </div>
                                      )}
                                      {/* Activities */}
                                      {section.data.activities && section.data.activities.length > 0 && (
                                        <div>
                                          <p className="font-semibold text-gray-900 mb-2">Activities:</p>
                                          <div className="space-y-3">
                                            {section.data.activities.map((activity: any, i: number) => (
                                              <div key={i} className="p-3 bg-gray-50 rounded border border-gray-200">
                                                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                                  <div><span className="font-medium">Code:</span> {activity.code}</div>
                                                  <div><span className="font-medium">Scheduled:</span> {activity.date}</div>
                                                  <div><span className="font-medium">Type:</span> {activity.type}</div>
                                                  <div><span className="font-medium">Status:</span> <span className="capitalize">{activity.status?.replace(/-/g, ' ')}</span></div>
                                                  <div className="col-span-2"><span className="font-medium">Description:</span> {activity.description}</div>
                                                </div>
                                                {/* Activity Reason */}
                                                {activity.reason && (
                                                  <div className="mt-2 pt-2 border-t border-gray-300">
                                                    <p className="text-xs font-medium text-gray-700 mb-1">Reason:</p>
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                      <div><span className="font-medium">Code:</span> {activity.reason.reasonCode}</div>
                                                      <div><span className="font-medium">Status:</span> <span className="capitalize">{activity.reason.reasonStatus?.replace(/-/g, ' ')}</span></div>
                                                      <div><span className="font-medium">Start:</span> {activity.reason.reasonRecordingDate}</div>
                                                      {activity.reason.reasonEndDate && (
                                                        <div><span className="font-medium">End:</span> {activity.reason.reasonEndDate}</div>
                                                      )}
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {/* Legacy format support */}
                                      {section.data.goals && (
                                        <div>
                                          <p className="font-semibold text-gray-900">Goals:</p>
                                          <p className="text-gray-700 whitespace-pre-wrap">{section.data.goals}</p>
                                        </div>
                                      )}
                                      {section.data.interventions && (
                                        <div>
                                          <p className="font-semibold text-gray-900">Interventions:</p>
                                          <p className="text-gray-700 whitespace-pre-wrap">{section.data.interventions}</p>
                                        </div>
                                      )}
                                      {section.data.outcomes && (
                                        <div>
                                          <p className="font-semibold text-gray-900">Expected Outcomes:</p>
                                          <p className="text-gray-700 whitespace-pre-wrap">{section.data.outcomes}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {section.type === 'clinical-instructions' && (
                                    <div className="space-y-3 text-sm">
                                      {section.data.patientInstructions && (
                                        <div>
                                          <p className="font-semibold text-gray-900">Patient Instructions:</p>
                                          <p className="text-gray-700 whitespace-pre-wrap">{section.data.patientInstructions}</p>
                                        </div>
                                      )}
                                      {section.data.followUpInstructions && (
                                        <div>
                                          <p className="font-semibold text-gray-900">Follow-up Instructions:</p>
                                          <p className="text-gray-700 whitespace-pre-wrap">{section.data.followUpInstructions}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {section.type === 'clinical-notes' && (
                                    <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                                      {typeof section.data === 'string' ? section.data : section.data.notes || JSON.stringify(section.data, null, 2)}
                                    </div>
                                  )}

                                  {/* Generic content display for other types */}
                                  {!['soap', 'review-of-systems', 'vitals', 'care-plan', 'clinical-instructions', 'clinical-notes'].includes(section.type) && (
                                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                                      {typeof section.data === 'string' ? section.data : JSON.stringify(section.data, null, 2)}
                                    </div>
                                  )}

                                  {/* eSign Log */}
                                  <div className="mt-4 pt-3 border-t border-gray-200">
                                    <p className="text-xs text-gray-500 text-right">
                                      eSign Log<br/>
                                      {section.signatures?.length > 0 ? (
                                        section.signatures.map((sig: any, i: number) => (
                                          <span key={i}>{sig.name} - {new Date(sig.date).toLocaleString()}<br/></span>
                                        ))
                                      ) : (
                                        'No signatures on file'
                                      )}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Show message if no sections saved yet */}
                        {(!encounterSavedData[encounterId] || encounterSavedData[encounterId].length === 0) && (
                          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded p-8 text-center">
                            <p className="text-sm text-gray-600">No documentation added yet</p>
                            <p className="text-xs text-gray-500 mt-2">Use the dropdown menus above to add sections</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Care Plan Section */}
                    {activeSubTab === 'care-plan' && (
                      <div className="space-y-4">
                        {/* Show form if creating/editing */}
                        {(currentCarePlanData[encounterId] || !carePlans[encounterId] || carePlans[encounterId].length === 0) && (
                          <CarePlanForm
                            encounterId={encounterId}
                            patientId={patientId}
                            initialData={currentCarePlanData[encounterId] || undefined}
                            onSave={async (formData: CarePlanFormData) => {
                              try {
                                const editingId = editingCarePlanId[encounterId];

                                // Create or update the FHIR CarePlan resource
                                if (editingId) {
                                  await carePlanService.updateCarePlan(editingId, patientId, encounterId, formData);
                                } else {
                                  await carePlanService.createCarePlan(patientId, encounterId, formData);
                                }

                                // Clear editing state
                                setEditingCarePlanId(encounterId, null);
                                setCurrentCarePlanData(encounterId, null);

                                // Reload encounter documentation (including care plans)
                                await loadEncounterDocumentation(encounterId);

                                alert(editingId ? 'Care Plan updated successfully!' : 'Care Plan created successfully!');
                              } catch (error) {
                                console.error('Error saving care plan:', error);
                                alert('Failed to save Care Plan. Please try again.');
                              }
                            }}
                            onCancel={() => {
                              setEditingCarePlanId(encounterId, null);
                              setCurrentCarePlanData(encounterId, null);
                            }}
                          />
                        )}

                        {/* Show existing care plans list */}
                        {!currentCarePlanData[encounterId] && carePlans[encounterId] && carePlans[encounterId].length > 0 && (
                          <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h2 className="text-xl font-semibold text-gray-900">Existing Care Plans</h2>
                              <button
                                onClick={() => {
                                  setCurrentCarePlanData(encounterId, {
                                    status: 'active',
                                    intent: 'plan',
                                    activities: [{
                                      code: '',
                                      date: new Date().toISOString().split('T')[0],
                                      type: 'Task',
                                      description: '',
                                      status: 'not-started'
                                    }]
                                  } as CarePlanFormData);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
                              >
                                + Add New Care Plan
                              </button>
                            </div>

                            <div className="space-y-4">
                              {carePlans[encounterId].map((carePlan: any) => {
                                const formData = carePlanService.convertToFormData(carePlan);
                                return (
                                  <div key={carePlan.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="flex items-start justify-between mb-3">
                                      <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                          {formData.title || 'Care Plan'}
                                        </h3>
                                        <div className="flex gap-4 text-sm text-gray-600 mt-1">
                                          <span>Status: <span className="font-medium capitalize">{formData.status}</span></span>
                                          <span>Intent: <span className="font-medium capitalize">{formData.intent}</span></span>
                                          <span>Activities: <span className="font-medium">{formData.activities.length}</span></span>
                                        </div>
                                        {formData.description && (
                                          <p className="text-sm text-gray-600 mt-2">{formData.description}</p>
                                        )}
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => {
                                            setEditingCarePlanId(encounterId, carePlan.id);
                                            setCurrentCarePlanData(encounterId, formData);
                                          }}
                                          className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={async () => {
                                            if (confirm('Are you sure you want to delete this Care Plan?')) {
                                              try {
                                                await carePlanService.deleteCarePlan(carePlan.id);
                                                await loadEncounterDocumentation(encounterId);
                                                alert('Care Plan deleted successfully!');
                                              } catch (error) {
                                                console.error('Error deleting care plan:', error);
                                                alert('Failed to delete Care Plan.');
                                              }
                                            }
                                          }}
                                          className="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-600 rounded hover:bg-red-50"
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    </div>

                                    {/* Activities Summary */}
                                    <div className="mt-3 space-y-2">
                                      {formData.activities.map((activity, idx) => (
                                        <div key={idx} className="text-sm bg-white p-3 rounded border border-gray-200">
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

                    {/* Clinical Instructions Section - FHIR Integrated */}
                    {activeSubTab === 'clinical-instructions' && encounter && patient && (
                      <div className="bg-white border border-gray-200 rounded p-4">
                        <ClinicalInstructionsSection
                          encounterId={encounterId}
                          patientId={patient.id}
                        />
                      </div>
                    )}

                    {/* Patient Instructions Section - FHIR Integrated */}
                    {activeSubTab === 'patient-instructions' && encounter && patient && (
                      <div className="bg-white border border-gray-200 rounded p-4">
                        <PatientInstructionsSection
                          encounterId={encounterId}
                          patientId={patient.id}
                        />
                      </div>
                    )}

                    {/* Clinical Notes Section */}
                    {activeSubTab === 'clinical-notes' && (
                      <ClinicalNotesTab
                        notes={clinicalNotes[encounterId] || []}
                        onAddNote={() => {
                          setClinicalNoteEditorState({
                            isOpen: true,
                            mode: 'create',
                            encounterId,
                            note: null
                          });
                        }}
                        onEditNote={(note) => {
                          setClinicalNoteEditorState({
                            isOpen: true,
                            mode: 'edit',
                            encounterId,
                            note
                          });
                        }}
                        onDeleteNote={(noteId) => {
                          setClinicalNotes(encounterId, (notes) =>
                            (notes || []).filter((n) => n.id !== noteId)
                          );
                        }}
                        onToggleFavorite={(noteId) => {
                          setClinicalNotes(encounterId, (notes) =>
                            (notes || []).map((n) =>
                              n.id === noteId ? { ...n, isFavorite: !n.isFavorite } : n
                            )
                          );
                        }}
                      />
                    )}

                    {/* Review of Systems Section */}
                    {activeSubTab === 'review-of-systems' && (
                      <div className="bg-white border border-gray-200 rounded p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Review of Systems</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            'Constitutional', 'Eyes', 'ENT/Mouth', 'Cardiovascular',
                            'Respiratory', 'Gastrointestinal', 'Genitourinary', 'Musculoskeletal',
                            'Integumentary', 'Neurological', 'Psychiatric', 'Endocrine',
                            'Hematologic/Lymphatic', 'Allergic/Immunologic'
                          ].map((system) => (
                            <div key={system} className="border border-gray-200 rounded p-3">
                              <label className="flex items-center gap-2 mb-2">
                                <input type="checkbox" className="rounded" />
                                <span className="text-sm font-medium text-gray-900">{system}</span>
                              </label>
                              <textarea
                                value={rosForms[encounterId]?.[system] || ''}
                                onChange={(e) => updateRosForm(encounterId, system, e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded text-xs"
                                rows={2}
                                placeholder="Details..."
                              />
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={async () => {
                            const currentData = encounterSavedData[encounterId] || [];
                            const rosData = rosForms[encounterId] || {};
                            const editingIdx = editingSection[encounterId];
                            const systems = Object.entries(rosData)
                              .filter(([, findings]) => findings)
                              .map(([name, findings]) => ({ name, findings }));

                            const section: SavedSection = {
                              title: 'Review Of Systems',
                              type: 'review-of-systems',
                              author: 'Billy Smith',
                              date: new Date().toISOString(),
                              data: { systems },
                              signatures: []
                            };

                            const documentId = editingIdx !== null && editingIdx !== undefined
                              ? currentData[editingIdx]?.id
                              : undefined;

                            await saveDocumentReference(encounterId, section, documentId);
                            setEditingSection({ ...editingSection, [encounterId]: null });

                            setRosForm(encounterId, {});
                            setEncounterActiveSubTab(encounterId, 'summary');
                          }}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                        >
                          {editingSection[encounterId] !== null && editingSection[encounterId] !== undefined ? 'Update ROS' : 'Save ROS'}
                        </button>
                      </div>
                    )}

                    {/* SOAP Section */}
                    {activeSubTab === 'soap' && (
                      <div className="bg-white border border-gray-200 rounded p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">SOAP Note</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Subjective</label>
                            <textarea
                              value={soapForms[encounterId]?.subjective || ''}
                              onChange={(e) => updateSoapForm(encounterId, 'subjective', e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded text-sm"
                              rows={4}
                              placeholder="Patient's subjective complaints and history..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Objective</label>
                            <textarea
                              value={soapForms[encounterId]?.objective || ''}
                              onChange={(e) => updateSoapForm(encounterId, 'objective', e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded text-sm"
                              rows={4}
                              placeholder="Clinical findings, vitals, exam results..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Assessment</label>
                            <textarea
                              value={soapForms[encounterId]?.assessment || ''}
                              onChange={(e) => updateSoapForm(encounterId, 'assessment', e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded text-sm"
                              rows={4}
                              placeholder="Clinical assessment and diagnosis..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Plan</label>
                            <textarea
                              value={soapForms[encounterId]?.plan || ''}
                              onChange={(e) => updateSoapForm(encounterId, 'plan', e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded text-sm"
                              rows={4}
                              placeholder="Treatment plan and follow-up..."
                            />
                          </div>
                          <button
                            onClick={async () => {
                              const currentData = encounterSavedData[encounterId] || [];
                              const soapData = soapForms[encounterId] || { subjective: '', objective: '', assessment: '', plan: '' };
                              const editingIdx = editingSection[encounterId];

                              const section = {
                                title: 'SOAP',
                                type: 'soap',
                                author: 'Billy Smith',
                                date: new Date().toISOString(),
                                data: soapData,
                                signatures: []
                              };

                              const documentId = editingIdx !== null && editingIdx !== undefined
                                ? currentData[editingIdx]?.id
                                : undefined;

                              // Save to FHIR server
                              await saveDocumentReference(encounterId, section, documentId);

                              // Clear editing state
                              setEditingSection({ ...editingSection, [encounterId]: null });

                              // Clear form and switch to summary
                              setSoapForm(encounterId, { subjective: '', objective: '', assessment: '', plan: '' });
                              setEncounterActiveSubTab(encounterId, 'summary');
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                          >
                            {editingSection[encounterId] !== null && editingSection[encounterId] !== undefined ? 'Update SOAP Note' : 'Save SOAP Note'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Vitals Section */}
                    {activeSubTab === 'vitals' && (
                      <div className="space-y-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">Vital Signs</h3>
                              <p className="text-xs text-gray-500 mt-1">Latest measurements with intelligent alerts and trends</p>
                            </div>
                            <button
                              onClick={() => setDrawerState('vitals', true)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                            >
                              Record Vitals
                            </button>
                          </div>

                          {observations.length > 0 ? (
                            <>
                              {/* Enhanced Vitals Cards */}
                              <div className="mb-6">
                                <VitalsCards observations={observations} />
                              </div>

                              {/* Enhanced Vitals Table */}
                              <VitalsTable observations={observations} />
                            </>
                          ) : (
                            <div className="text-center py-12 text-gray-500 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-dashed border-gray-300">
                              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-sm font-medium">No vitals recorded for this encounter</p>
                              <p className="text-xs mt-2">Click &ldquo;Record Vitals&rdquo; to add measurements</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Prescriptions Section */}
                    {activeSubTab === 'prescriptions' && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <PrescriptionsSectionInline
                          prescriptions={[]}
                          onUpdate={(prescriptions) => {
                            console.log('Prescriptions updated:', prescriptions);
                            // TODO: Save prescriptions to encounter or patient
                          }}
                        />
                      </div>
                    )}

                    {/* Additional Clinical Sections */}
                    {activeSubTab === 'eye-exam' && (
                      <div className="bg-white border border-gray-200 rounded p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Eye Exam</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Visual Acuity - Right Eye</label>
                            <input className="w-full p-2 border border-gray-300 rounded text-sm" placeholder="20/20" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Visual Acuity - Left Eye</label>
                            <input className="w-full p-2 border border-gray-300 rounded text-sm" placeholder="20/20" />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Findings</label>
                            <textarea className="w-full p-3 border border-gray-300 rounded text-sm" rows={6} placeholder="Document eye exam findings..." />
                          </div>
                          <div className="col-span-2">
                            <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">
                              Save Eye Exam
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeSubTab === 'functional-and-cognitive-status' && (
                      <div className="bg-white border border-gray-200 rounded p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Functional and Cognitive Status</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Functional Status</label>
                            <textarea className="w-full p-3 border border-gray-300 rounded text-sm" rows={4} placeholder="Document functional status..." />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cognitive Status</label>
                            <textarea className="w-full p-3 border border-gray-300 rounded text-sm" rows={4} placeholder="Document cognitive status..." />
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">
                            Save Assessment
                          </button>
                        </div>
                      </div>
                    )}

                    {activeSubTab === 'observation' && (
                      <div className="bg-white border border-gray-200 rounded p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinical Observation</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Observation Type</label>
                            <select className="w-full p-2 border border-gray-300 rounded text-sm">
                              <option>General Observation</option>
                              <option>Lab Result</option>
                              <option>Imaging Result</option>
                              <option>Vital Sign</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Observation Details</label>
                            <textarea className="w-full p-3 border border-gray-300 rounded text-sm" rows={6} placeholder="Document observation details..." />
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">
                            Save Observation
                          </button>
                        </div>
                      </div>
                    )}

                    {activeSubTab === 'review-of-systems-checks' && (
                      <div className="bg-white border border-gray-200 rounded p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Review of Systems Checks</h3>
                        <div className="space-y-2">
                          {[
                            'Constitutional', 'Eyes', 'ENT/Mouth', 'Cardiovascular',
                            'Respiratory', 'Gastrointestinal', 'Genitourinary', 'Musculoskeletal',
                            'Integumentary', 'Neurological', 'Psychiatric', 'Endocrine',
                            'Hematologic/Lymphatic', 'Allergic/Immunologic'
                          ].map((system) => (
                            <label key={system} className="flex items-center gap-3 p-2 border border-gray-200 rounded hover:bg-gray-50">
                              <input type="checkbox" className="rounded" />
                              <span className="text-sm font-medium text-gray-900">{system}</span>
                              <select className="ml-auto text-xs border border-gray-300 rounded p-1">
                                <option>Normal</option>
                                <option>Abnormal</option>
                                <option>Not Examined</option>
                              </select>
                            </label>
                          ))}
                        </div>
                        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">
                          Save ROS Checks
                        </button>
                      </div>
                    )}

                    {activeSubTab === 'speech-dictation' && (
                      <div className="bg-white border border-gray-200 rounded p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Speech Dictation</h3>
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <button className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700">
                              Start Recording
                            </button>
                            <span className="text-sm text-gray-600">Click to begin speech-to-text dictation</span>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Transcription</label>
                            <textarea className="w-full p-3 border border-gray-300 rounded text-sm font-mono" rows={12} placeholder="Transcribed text will appear here..." />
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">
                            Save Dictation
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Administrative Sections */}
                    {activeSubTab === 'forms' && (
                      <div className="bg-white border border-gray-200 rounded p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Forms</h3>
                        <div className="grid grid-cols-3 gap-3">
                          {['Consent Form', 'History Form', 'Physical Exam Form', 'Procedure Note', 'Discharge Summary', 'Referral Form'].map((form) => (
                            <button key={form} className="p-4 border-2 border-gray-200 rounded hover:border-blue-500 hover:bg-blue-50 text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors">
                              {form}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeSubTab === 'procedure-order' && (
                      <div className="bg-white border border-gray-200 rounded p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Procedure Order</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Procedure Type</label>
                            <input className="w-full p-2 border border-gray-300 rounded text-sm" placeholder="Enter procedure name..." />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Indication</label>
                            <textarea className="w-full p-3 border border-gray-300 rounded text-sm" rows={3} placeholder="Enter clinical indication..." />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                            <select className="w-full p-2 border border-gray-300 rounded text-sm">
                              <option>Routine</option>
                              <option>Urgent</option>
                              <option>STAT</option>
                            </select>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">
                            Order Procedure
                          </button>
                        </div>
                      </div>
                    )}

                    {activeSubTab === 'lab-results' && (
                      <div className="bg-white border border-gray-200 rounded p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lab Results</h3>
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Test</th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Result</th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Normal Range</th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
                              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-xs">No lab results available</td>
                              <td className="px-3 py-2 text-xs" colSpan={4}></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}

                    {activeSubTab === 'new-questionnaire' && (
                      <div className="bg-white border border-gray-200 rounded p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">New Questionnaire</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Questionnaire Template</label>
                            <select className="w-full p-2 border border-gray-300 rounded text-sm">
                              <option>PHQ-9 (Depression Screening)</option>
                              <option>GAD-7 (Anxiety Screening)</option>
                              <option>Pain Assessment</option>
                              <option>Fall Risk Assessment</option>
                              <option>Custom Questionnaire</option>
                            </select>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">
                            Load Questionnaire
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Default placeholder for unmapped tabs */}
                    {!['summary', 'care-plan', 'clinical-instructions', 'clinical-notes', 'review-of-systems', 'soap', 'vitals', 'prescriptions', 'eye-exam', 'functional-and-cognitive-status', 'observation', 'review-of-systems-checks', 'speech-dictation', 'forms', 'procedure-order', 'lab-results', 'new-questionnaire'].includes(activeSubTab) && (
                      <div className="bg-white border border-gray-200 rounded p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          {activeSubTab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </h3>
                        <div className="p-8 bg-gray-50 border border-gray-200 rounded text-center">
                          <p className="text-sm text-gray-600">This section is under development.</p>
                          <p className="text-xs text-gray-500 mt-2">Content will be added in a future update.</p>
                        </div>
                      </div>
                    )}
                  </div>
                  </EncounterDetailView>
                </div>
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

        {/* Medical Info Drawer (History, Habits, Allergies) */}
        <MedicalInfoDrawer
          isOpen={drawers.medicalInfo}
          onClose={() => setDrawerState('medicalInfo', false)}
          patientHistory=""
          patientHabitsStructured={undefined}
          patientAllergiesStructured={undefined}
          onUpdate={(data) => {
            // Update patient data with the new medical info
            console.log('Medical info updated:', data);
            setDrawerState('medicalInfo', false);
            refreshData();
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
