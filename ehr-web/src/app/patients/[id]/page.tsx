'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { User, Edit, Calendar, Pill, AlertCircle, Activity, FileText, Loader2, Shield, ChevronLeft, ChevronRight, Plus, X, ChevronDown } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@nirmitee.io/design-system';
import { useParams, useSearchParams } from 'next/navigation';
import { fhirService } from '@/lib/medplum';
import { PatientForm } from '@/components/forms/patient-form';
import { EncounterForm } from '@/components/forms/encounter-form';
import { AllergyForm } from '@/components/forms/allergy-form';
import { patientService } from '@/services/patient.service';
import { TabPageWrapper } from '@/components/layout/tab-page-wrapper';
import { useTabNavigation } from '@/hooks/use-tab-navigation';
import { PatientHeader } from './components/PatientHeader';
import { DashboardTab } from './components/tabs/DashboardTab';
import { OverviewTab } from './components/tabs/OverviewTab';
import { VitalsTab } from './components/tabs/VitalsTab';
import { EncountersTab } from './components/tabs/EncountersTab';
import { ProblemsTab } from './components/tabs/ProblemsTab';
import { MedicationsTab } from './components/tabs/MedicationsTab';
import { AllergiesTab } from './components/tabs/AllergiesTab';
import { DocumentsTab } from './components/tabs/DocumentsTab';
import { VitalsDrawer } from './components/drawers/VitalsDrawer';
import { ProblemDrawer } from './components/drawers/ProblemDrawer';
import { MedicationDrawer } from './components/drawers/MedicationDrawer';
import { InsuranceDrawer } from './components/drawers/InsuranceDrawer';
import { MedicalInfoDrawer } from '@/components/encounters/medical-info-drawer';
import { PatientDetails, VitalsFormData, ProblemFormData, MedicationFormData, SavedSection, TelecomItem, IdentifierItem, FHIRBundleEntry, EncounterFormData } from './components/types';

export default function PatientDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const patientId = params?.id as string;
  const { openPatientEditTab } = useTabNavigation();

  // Get encounterId from query params if present
  const encounterIdFromQuery = searchParams.get('encounterId');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedEncounter, setSelectedEncounter] = useState<string | undefined>(encounterIdFromQuery || undefined);
  const [openEncounterTabs, setOpenEncounterTabs] = useState<string[]>([]);
  const [openEncounterSubTabs, setOpenEncounterSubTabs] = useState<{ [encounterId: string]: string[] }>({});
  const [activeEncounterSubTab, setActiveEncounterSubTab] = useState<{ [encounterId: string]: string }>({});
  const [encounterSavedData, setEncounterSavedData] = useState<{ [encounterId: string]: SavedSection[] }>({});
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Form states for different sections
  const [soapForms, setSoapForms] = useState<{ [encounterId: string]: { subjective: string; objective: string; assessment: string; plan: string } }>({});
  const [carePlanForms, setCarePlanForms] = useState<{ [encounterId: string]: { goals: string; interventions: string; outcomes: string } }>({});
  const [clinicalInstructionsForms, setClinicalInstructionsForms] = useState<{ [encounterId: string]: { patientInstructions: string; followUpInstructions: string } }>({});
  const [clinicalNotesForms, setClinicalNotesForms] = useState<{ [encounterId: string]: { notes: string } }>({});
  const [rosForms, setRosForms] = useState<{ [encounterId: string]: { [system: string]: string } }>({});

  // Track which saved sections are expanded in the summary
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  // Track which section is being edited (encounterId-sectionIndex)
  const [editingSection, setEditingSection] = useState<{ [encounterId: string]: number | null }>({});

  // Optimized form update helpers - memoized with useCallback
  const updateSoapForm = useCallback((encounterId: string, field: 'subjective' | 'objective' | 'assessment' | 'plan', value: string) => {
    setSoapForms(prev => {
      const current = prev[encounterId] || { subjective: '', objective: '', assessment: '', plan: '' };
      if (current[field] === value) return prev; // Skip if no change
      return {
        ...prev,
        [encounterId]: {
          ...current,
          [field]: value
        }
      };
    });
  }, []);

  const updateCarePlanForm = useCallback((encounterId: string, field: 'goals' | 'interventions' | 'outcomes', value: string) => {
    setCarePlanForms(prev => {
      const current = prev[encounterId] || { goals: '', interventions: '', outcomes: '' };
      if (current[field] === value) return prev;
      return {
        ...prev,
        [encounterId]: {
          ...current,
          [field]: value
        }
      };
    });
  }, []);

  const updateClinicalInstructionsForm = useCallback((encounterId: string, field: 'patientInstructions' | 'followUpInstructions', value: string) => {
    setClinicalInstructionsForms(prev => {
      const current = prev[encounterId] || { patientInstructions: '', followUpInstructions: '' };
      if (current[field] === value) return prev;
      return {
        ...prev,
        [encounterId]: {
          ...current,
          [field]: value
        }
      };
    });
  }, []);

  const updateClinicalNotesForm = useCallback((encounterId: string, value: string) => {
    setClinicalNotesForms(prev => {
      if (prev[encounterId]?.notes === value) return prev;
      return {
        ...prev,
        [encounterId]: { notes: value }
      };
    });
  }, []);

  const updateRosForm = useCallback((encounterId: string, system: string, value: string) => {
    setRosForms(prev => {
      const current = prev[encounterId] || {};
      if (current[system] === value) return prev;
      return {
        ...prev,
        [encounterId]: {
          ...current,
          [system]: value
        }
      };
    });
  }, []);

  // Load all data upfront - browser-style tabs
  const [encounters, setEncounters] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [allergies, setAllergies] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  const [insurances, setInsurances] = useState<any[]>([]);

  // Drawer states
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showVitalsDrawer, setShowVitalsDrawer] = useState(false);
  const [showEncounterDrawer, setShowEncounterDrawer] = useState(false);
  const [showProblemDrawer, setShowProblemDrawer] = useState(false);
  const [showMedicationDrawer, setShowMedicationDrawer] = useState(false);
  const [showAllergyDrawer, setShowAllergyDrawer] = useState(false);
  const [showMedicalInfoDrawer, setShowMedicalInfoDrawer] = useState(false);
  const [showInsuranceDrawer, setShowInsuranceDrawer] = useState(false);

  // Load ALL data upfront in parallel - browser-style tabs
  const loadAllPatientData = useCallback(async () => {
    if (!patientId) return;

    try {
      setLoading(true);

      // Load everything in parallel for instant tab switching
      const [
        patientResource,
        encounterRes,
        conditionRes,
        medicationRes,
        allergyRes,
        observationRes,
        coverageRes
      ] = (await Promise.all([
        fhirService.read('Patient', patientId),
        fhirService.search('Encounter', { patient: patientId, _count: 10, _sort: '-date' }),
        fhirService.search('Condition', { patient: patientId, _count: 20 }),
        fhirService.search('MedicationRequest', { patient: patientId, _count: 20, status: 'active' }),
        fhirService.search('AllergyIntolerance', { patient: patientId, _count: 20 }),
        fhirService.search('Observation', { patient: patientId, _count: 50, _sort: '-date', category: 'vital-signs' }),
        fhirService.search('Coverage', { patient: patientId, _count: 10 })
      ])) as [any, any, any, any, any, any, any];

      // Set patient data
      const name = patientResource.name?.[0];
      const fullName = `${name?.given?.join(' ') || ''} ${name?.family || ''}`.trim();
      const phone = patientResource.telecom?.find((t: TelecomItem) => t.system === 'phone')?.value || '-';
      const email = patientResource.telecom?.find((t: TelecomItem) => t.system === 'email')?.value || '-';
      const mrn = patientResource.identifier?.find((id: IdentifierItem) => id.type?.coding?.some((c) => c.code === 'MR'))?.value || '-';

      const age = patientResource.birthDate
        ? Math.floor((Date.now() - new Date(patientResource.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 0;

      setPatient({
        id: patientResource.id,
        name: fullName || 'Unknown',
        mrn,
        dob: patientResource.birthDate || '-',
        age,
        gender: patientResource.gender || 'unknown',
        phone,
        email
      });

      // Set all data - everything is ready
      setEncounters(encounterRes.entry?.map((e: FHIRBundleEntry<any>) => e.resource) || []);
      setProblems(conditionRes.entry?.map((e: FHIRBundleEntry<any>) => e.resource) || []);
      setMedications(medicationRes.entry?.map((e: FHIRBundleEntry<any>) => e.resource) || []);
      setAllergies(allergyRes.entry?.map((e: FHIRBundleEntry<any>) => e.resource) || []);
      setObservations(observationRes.entry?.map((e: FHIRBundleEntry<any>) => e.resource) || []);
      setInsurances(coverageRes.entry?.map((e: FHIRBundleEntry<any>) => e.resource) || []);

    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadAllPatientData();
  }, [loadAllPatientData]);

  // Handle encounterId from query params - auto-select and open that encounter
  useEffect(() => {
    if (encounterIdFromQuery && patient) {
      // Switch to encounters tab
      setActiveTab('encounters');

      // Open the encounter tab if not already open
      if (!openEncounterTabs.includes(encounterIdFromQuery)) {
        setOpenEncounterTabs(prev => [...prev, encounterIdFromQuery]);
      }

      // Set it as the selected encounter
      setSelectedEncounter(encounterIdFromQuery);
    }
  }, [encounterIdFromQuery, patient, openEncounterTabs]);

  const refreshData = () => {
    loadAllPatientData();
  };

  // Load encounter documentation (DocumentReference resources)
  const loadEncounterDocumentation = useCallback(async (encounterId: string) => {
    try {
      // Search for DocumentReference resources related to this encounter
      const docRes = await fhirService.search('DocumentReference', {
        encounter: encounterId,
        _sort: '-date'
      });

      const docs = docRes.entry?.map((e: FHIRBundleEntry<any>) => e.resource) || [];
      const sections: SavedSection[] = [];

      docs.forEach((doc: any) => {
        const content = doc.content?.[0];
        const category = doc.category?.[0]?.coding?.[0]?.code;
        const author = doc.author?.[0]?.display || 'Unknown';
        const date = doc.date || new Date().toISOString();

        try {
          // Parse the data from attachment
          const data = content?.attachment?.data
            ? JSON.parse(atob(content.attachment.data))
            : {};

          sections.push({
            id: doc.id,
            title: doc.type?.text || category,
            type: category,
            author,
            date,
            data,
            signatures: []
          });
        } catch (e) {
          console.error('Error parsing document:', e);
        }
      });

      // Load sections into state
      setEncounterSavedData(prev => ({
        ...prev,
        [encounterId]: sections
      }));
    } catch (error) {
      console.error('Error loading encounter documentation:', error);
    }
  }, []);

  // Save section as FHIR DocumentReference
  const saveDocumentReference = useCallback(async (encounterId: string, section: SavedSection, documentId?: string) => {
    try {
      const dataString = JSON.stringify(section.data);
      const base64Data = btoa(dataString);

      const docResource: Record<string, any> = {
        resourceType: 'DocumentReference',
        status: 'current',
        type: {
          coding: [{
            system: 'http://loinc.org',
            code: section.type === 'soap' ? '34133-9' :
                  section.type === 'care-plan' ? '18776-5' :
                  section.type === 'clinical-notes' ? '11506-3' :
                  section.type === 'clinical-instructions' ? '51847-2' :
                  section.type === 'review-of-systems' ? '10187-3' : '11506-3',
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
        // Update existing document
        docResource.id = documentId;
        await fhirService.update({ ...docResource, resourceType: 'DocumentReference', id: documentId });
      } else {
        // Create new document
        await fhirService.create(docResource);
      }

      // Reload documentation
      await loadEncounterDocumentation(encounterId);
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    }
  }, [patientId, loadEncounterDocumentation]);

  const handleStartVisit = async (encounterData: EncounterFormData) => {
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
        participant: encounterData.practitioner ? [{
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
        }] : [],
        period: {
          start: new Date().toISOString()
        },
        serviceProvider: encounterData.location ? {
          reference: `Organization/${encounterData.location}`
        } : undefined
      };

      await fhirService.create(encounterResource);
      setShowEncounterDrawer(false);
      refreshData();
    } catch (error) {
      console.error('Error creating encounter:', error);
      throw error;
    }
  };

  const handleSaveVitals = async (vitalsData: VitalsFormData) => {
    if (!patientId) return;

    const observations = [];

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

    await Promise.all(observations.map(obs => fhirService.create(obs)));
    setShowVitalsDrawer(false);
    refreshData();
  };

  const handleSaveProblem = async (problemData: ProblemFormData) => {
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
      severity: problemData.severity ? {
        coding: [{
          system: 'http://snomed.info/sct',
          code: problemData.severity === 'severe' ? '24484000' : problemData.severity === 'moderate' ? '6736007' : '255604002',
          display: problemData.severity.charAt(0).toUpperCase() + problemData.severity.slice(1)
        }]
      } : undefined,
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
    setShowProblemDrawer(false);
    refreshData();
  };

  const handleSaveMedication = async (medicationData: MedicationFormData) => {
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
            frequency: parseInt(medicationData.frequency),
            period: parseInt(medicationData.period),
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
    setShowMedicationDrawer(false);
    refreshData();
  };

  const handleEditPatient = async (data: any) => {
    try {
      await patientService.updatePatient({ ...data, id: patientId }, 'current-user');
      setShowEditDrawer(false);
      refreshData();
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  };

  const handleSaveInsurance = async (insuranceData: any) => {
    if (!patientId) return;

    try {
      // Create FHIR Coverage resource
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
        order: insuranceData.insuranceOrder === 'primary' ? 1 : insuranceData.insuranceOrder === 'secondary' ? 2 : 3,
        costToBeneficiary: insuranceData.copayAmount ? [{
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
        }] : undefined
      };

      await fhirService.create(coverageResource);
      setShowInsuranceDrawer(false);
      refreshData();
    } catch (error) {
      console.error('Error saving insurance:', error);
      alert('Failed to save insurance. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Patient not found</p>
      </div>
    );
  }

  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'chart', label: 'Chart', icon: FileText },
    { id: 'vitals', label: 'Vitals', icon: Activity },
    { id: 'encounters', label: 'Encounters', icon: Calendar },
    { id: 'problems', label: 'Problems', icon: AlertCircle },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'allergies', label: 'Allergies', icon: AlertCircle },
    { id: 'insurance', label: 'Insurance', icon: Shield },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  return (
    <TabPageWrapper title={patient.name} icon={<User className="h-4 w-4" />}>
      <div className="h-screen flex flex-col bg-gray-50">
        <PatientHeader
          patient={patient}
          onEdit={() => openPatientEditTab(patientId, patient.name)}
          onNewVisit={() => setShowEncounterDrawer(true)}
          encounters={encounters}
          selectedEncounter={selectedEncounter}
          onEncounterSelect={async (encounterId) => {
            setSelectedEncounter(encounterId);
            // Add encounter tab if not already open
            if (!openEncounterTabs.includes(encounterId)) {
              setOpenEncounterTabs([...openEncounterTabs, encounterId]);
            }
            // Switch to the encounter tab
            setActiveTab(`encounter-${encounterId}`);
            // Load encounter documentation
            await loadEncounterDocumentation(encounterId);
          }}
          allergies={allergies}
          problems={problems}
          insurances={insurances}
          onOpenMedicalInfo={() => setShowMedicalInfoDrawer(true)}
          onOpenAllergies={() => setShowAllergyDrawer(true)}
          onOpenProblems={() => setShowProblemDrawer(true)}
          onOpenInsurance={() => setShowInsuranceDrawer(true)}
          encounterIdFromQuery={encounterIdFromQuery}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar Navigation */}
          <div
            className={`bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 ease-in-out flex-shrink-0 ${
              sidebarCollapsed ? 'w-14' : 'w-48'
            }`}
          >
            {/* Toggle Button */}
            <div className="sticky top-0 bg-white z-10 p-3 border-b border-gray-200">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="w-full flex items-center justify-center p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200 hover:border-gray-300"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </button>
            </div>

            <nav className="p-2 space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeTab === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all
                      ${isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                      ${sidebarCollapsed ? 'justify-center px-2' : ''}
                    `}
                    title={sidebarCollapsed ? section.label : ''}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {!sidebarCollapsed && <span className="truncate">{section.label}</span>}
                  </button>
                );
              })}

              {/* Dynamic Encounter Tabs */}
              {openEncounterTabs.length > 0 && !sidebarCollapsed && (
                <>
                  <div className="pt-2 mt-2 border-t border-gray-200">
                    <p className="px-3 text-xs font-semibold text-gray-500 mb-1">ENCOUNTERS</p>
                  </div>
                  {openEncounterTabs.map((encounterId) => {
                    const encounter = encounters.find(e => e.id === encounterId);
                    const isActive = activeTab === `encounter-${encounterId}`;
                    const encounterDate = encounter?.period?.start || encounter?.startTime;
                    const dateStr = encounterDate ? new Date(encounterDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

                    return (
                      <div key={encounterId} className="relative group">
                        <button
                          onClick={() => setActiveTab(`encounter-${encounterId}`)}
                          className={`
                            w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all
                            ${isActive
                              ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
                              : 'text-gray-700 hover:bg-gray-50'
                            }
                          `}
                        >
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate flex-1 text-left text-xs">{dateStr}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenEncounterTabs(openEncounterTabs.filter(id => id !== encounterId));
                            if (activeTab === `encounter-${encounterId}`) {
                              setActiveTab('dashboard');
                            }
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                        >
                          <X className="h-3 w-3 text-gray-600" />
                        </button>
                      </div>
                    );
                  })}
                </>
              )}
            </nav>
          </div>

          {/* Main Content Area */}
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
                onRecordVitals={() => setShowVitalsDrawer(true)}
              />
            </div>
            <div style={{ display: activeTab === 'encounters' ? 'block' : 'none' }}>
              <EncountersTab
                encounters={encounters}
                observations={observations}
                onNewEncounter={() => setShowEncounterDrawer(true)}
                selectedEncounterId={selectedEncounter}
              />
            </div>
            <div style={{ display: activeTab === 'problems' ? 'block' : 'none' }}>
              <ProblemsTab
                problems={problems}
                onAddProblem={() => setShowProblemDrawer(true)}
              />
            </div>
            <div style={{ display: activeTab === 'medications' ? 'block' : 'none' }}>
              <MedicationsTab
                medications={medications}
                onPrescribe={() => setShowMedicationDrawer(true)}
              />
            </div>
            <div style={{ display: activeTab === 'allergies' ? 'block' : 'none' }}>
              <AllergiesTab
                allergies={allergies}
                onAddAllergy={() => setShowAllergyDrawer(true)}
              />
            </div>
            <div style={{ display: activeTab === 'insurance' ? 'block' : 'none' }}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Insurance Information</h2>
                  <button
                    onClick={() => setShowInsuranceDrawer(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Insurance
                  </button>
                </div>

                {insurances.length > 0 ? (
                  <div className="space-y-3">
                    {insurances.map((insurance, idx) => {
                      const payorName = insurance.payor?.[0]?.display || 'Unknown Provider';
                      const policyNumber = insurance.subscriberId || '-';
                      const planName = insurance.type?.text || insurance.class?.[0]?.name || '-';
                      const orderBadge = insurance.order === 1 ? 'Primary' : insurance.order === 2 ? 'Secondary' : 'Tertiary';
                      const orderColor = insurance.order === 1 ? 'bg-blue-100 text-blue-800' : insurance.order === 2 ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800';

                      return (
                        <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-5 w-5 text-green-600" />
                                <h3 className="text-base font-semibold text-gray-900">{payorName}</h3>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded ${orderColor}`}>
                                  {orderBadge}
                                </span>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded ${insurance.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {insurance.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <div>
                                  <span className="text-gray-500">Policy Number:</span>
                                  <span className="ml-2 text-gray-900 font-medium">{policyNumber}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Plan:</span>
                                  <span className="ml-2 text-gray-900 font-medium">{planName}</span>
                                </div>
                                {insurance.subscriber?.display && (
                                  <div>
                                    <span className="text-gray-500">Subscriber:</span>
                                    <span className="ml-2 text-gray-900 font-medium">{insurance.subscriber.display}</span>
                                  </div>
                                )}
                                {insurance.relationship?.coding?.[0]?.display && (
                                  <div>
                                    <span className="text-gray-500">Relationship:</span>
                                    <span className="ml-2 text-gray-900 font-medium">{insurance.relationship.coding[0].display}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                              <Edit className="h-4 w-4 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium">No insurance information available</p>
                    <p className="text-xs mt-1">Click "Add Insurance" to get started</p>
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: activeTab === 'documents' ? 'block' : 'none' }}>
              <DocumentsTab />
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
                  'Care Plan', 'Clinical Instructions', 'Clinical Notes', 'Eye Exam',
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
              const addSubTab = (tabId: string, tabLabel: string) => {
                const currentTabs = openEncounterSubTabs[encounterId] || [];
                if (!currentTabs.includes(tabId)) {
                  setOpenEncounterSubTabs({
                    ...openEncounterSubTabs,
                    [encounterId]: [...currentTabs, tabId]
                  });
                }
                setActiveEncounterSubTab({
                  ...activeEncounterSubTab,
                  [encounterId]: tabId
                });
              };

              // Function to remove a sub-tab
              const removeSubTab = (tabId: string) => {
                const currentTabs = openEncounterSubTabs[encounterId] || [];
                const newTabs = currentTabs.filter(t => t !== tabId);
                setOpenEncounterSubTabs({
                  ...openEncounterSubTabs,
                  [encounterId]: newTabs
                });

                // If we're closing the active tab, switch to summary
                if (activeEncounterSubTab[encounterId] === tabId) {
                  setActiveEncounterSubTab({
                    ...activeEncounterSubTab,
                    [encounterId]: 'summary'
                  });
                }
              };

              return (
                <div key={encounterId} style={{ display: isActive ? 'block' : 'none' }}>
                  {/* Top Bar with Dropdowns - OpenEMR Style */}
                  <div className="bg-white border-b border-gray-200">
                    {/* Dropdown Menus Row */}
                    <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200">
                      {Object.entries(dropdownMenus).map(([category, items]) => (
                        <div key={category} className="relative group">
                          <button className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded flex items-center gap-1">
                            {category}
                            <ChevronDown className="h-3 w-3" />
                          </button>
                          {/* Dropdown Menu */}
                          <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded shadow-lg z-50 hidden group-hover:block">
                            {items.map((item) => (
                              <button
                                key={item}
                                onClick={() => addSubTab(item.toLowerCase().replace(/\s+/g, '-'), item)}
                                className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div className="ml-auto flex items-center gap-2">
                        <button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
                          AMC Requires
                        </button>
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
                        onClick={() => setActiveEncounterSubTab({ ...activeEncounterSubTab, [encounterId]: 'summary' })}
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
                              onClick={() => setActiveEncounterSubTab({ ...activeEncounterSubTab, [encounterId]: tabId })}
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
                                        setSoapForms({
                                          ...soapForms,
                                          [encounterId]: section.data as { subjective: string; objective: string; assessment: string; plan: string }
                                        });
                                        setActiveEncounterSubTab({ ...activeEncounterSubTab, [encounterId]: 'soap' });
                                        // Add tab if not already open
                                        if (!openEncounterSubTabs[encounterId]?.includes('soap')) {
                                          setOpenEncounterSubTabs({
                                            ...openEncounterSubTabs,
                                            [encounterId]: [...(openEncounterSubTabs[encounterId] || []), 'soap']
                                          });
                                        }
                                      } else if (section.type === 'care-plan') {
                                        setCarePlanForms({
                                          ...carePlanForms,
                                          [encounterId]: section.data as { goals: string; interventions: string; outcomes: string }
                                        });
                                        setActiveEncounterSubTab({ ...activeEncounterSubTab, [encounterId]: 'care-plan' });
                                        if (!openEncounterSubTabs[encounterId]?.includes('care-plan')) {
                                          setOpenEncounterSubTabs({
                                            ...openEncounterSubTabs,
                                            [encounterId]: [...(openEncounterSubTabs[encounterId] || []), 'care-plan']
                                          });
                                        }
                                      } else if (section.type === 'clinical-instructions') {
                                        setClinicalInstructionsForms({
                                          ...clinicalInstructionsForms,
                                          [encounterId]: section.data as { patientInstructions: string; followUpInstructions: string }
                                        });
                                        setActiveEncounterSubTab({ ...activeEncounterSubTab, [encounterId]: 'clinical-instructions' });
                                        if (!openEncounterSubTabs[encounterId]?.includes('clinical-instructions')) {
                                          setOpenEncounterSubTabs({
                                            ...openEncounterSubTabs,
                                            [encounterId]: [...(openEncounterSubTabs[encounterId] || []), 'clinical-instructions']
                                          });
                                        }
                                      } else if (section.type === 'clinical-notes') {
                                        setClinicalNotesForms({
                                          ...clinicalNotesForms,
                                          [encounterId]: { notes: typeof section.data === 'string' ? section.data : section.data.notes || '' }
                                        });
                                        setActiveEncounterSubTab({ ...activeEncounterSubTab, [encounterId]: 'clinical-notes' });
                                        if (!openEncounterSubTabs[encounterId]?.includes('clinical-notes')) {
                                          setOpenEncounterSubTabs({
                                            ...openEncounterSubTabs,
                                            [encounterId]: [...(openEncounterSubTabs[encounterId] || []), 'clinical-notes']
                                          });
                                        }
                                      } else if (section.type === 'review-of-systems') {
                                        const rosData: any = {};
                                        section.data.systems?.forEach((sys: any) => {
                                          rosData[sys.name] = sys.findings;
                                        });
                                        setRosForms({
                                          ...rosForms,
                                          [encounterId]: rosData
                                        });
                                        setActiveEncounterSubTab({ ...activeEncounterSubTab, [encounterId]: 'review-of-systems' });
                                        if (!openEncounterSubTabs[encounterId]?.includes('review-of-systems')) {
                                          setOpenEncounterSubTabs({
                                            ...openEncounterSubTabs,
                                            [encounterId]: [...(openEncounterSubTabs[encounterId] || []), 'review-of-systems']
                                          });
                                        }
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
                                    onClick={() => {
                                      // Delete section
                                      const currentData = encounterSavedData[encounterId] || [];
                                      const newData = currentData.filter((_, i) => i !== idx);
                                      setEncounterSavedData({
                                        ...encounterSavedData,
                                        [encounterId]: newData
                                      });
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
                                    <div className="space-y-3 text-sm">
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
                      <div className="bg-white border border-gray-200 rounded p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Care Plan</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Goals</label>
                            <textarea
                              value={carePlanForms[encounterId]?.goals || ''}
                              onChange={(e) => updateCarePlanForm(encounterId, 'goals', e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded text-sm"
                              rows={4}
                              placeholder="Document patient care goals..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Interventions</label>
                            <textarea
                              value={carePlanForms[encounterId]?.interventions || ''}
                              onChange={(e) => updateCarePlanForm(encounterId, 'interventions', e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded text-sm"
                              rows={4}
                              placeholder="Document planned interventions..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Expected Outcomes</label>
                            <textarea
                              value={carePlanForms[encounterId]?.outcomes || ''}
                              onChange={(e) => updateCarePlanForm(encounterId, 'outcomes', e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded text-sm"
                              rows={3}
                              placeholder="Document expected outcomes..."
                            />
                          </div>
                          <button
                            onClick={async () => {
                              const currentData = encounterSavedData[encounterId] || [];
                              const carePlanData = carePlanForms[encounterId] || { goals: '', interventions: '', outcomes: '' };
                              const editingIdx = editingSection[encounterId];

                              const section = {
                                title: 'Care Plan',
                                type: 'care-plan',
                                author: 'Billy Smith',
                                date: new Date().toISOString(),
                                data: carePlanData,
                                signatures: []
                              };

                              const documentId = editingIdx !== null && editingIdx !== undefined
                                ? currentData[editingIdx]?.id
                                : undefined;

                              await saveDocumentReference(encounterId, section, documentId);
                              setEditingSection({ ...editingSection, [encounterId]: null });

                              setCarePlanForms({
                                ...carePlanForms,
                                [encounterId]: { goals: '', interventions: '', outcomes: '' }
                              });
                              setActiveEncounterSubTab({ ...activeEncounterSubTab, [encounterId]: 'summary' });
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                          >
                            {editingSection[encounterId] !== null && editingSection[encounterId] !== undefined ? 'Update Care Plan' : 'Save Care Plan'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Clinical Instructions Section */}
                    {activeSubTab === 'clinical-instructions' && (
                      <div className="bg-white border border-gray-200 rounded p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinical Instructions</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Patient Instructions</label>
                            <textarea
                              value={clinicalInstructionsForms[encounterId]?.patientInstructions || ''}
                              onChange={(e) => updateClinicalInstructionsForm(encounterId, 'patientInstructions', e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded text-sm"
                              rows={6}
                              placeholder="Enter instructions for the patient..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Instructions</label>
                            <textarea
                              value={clinicalInstructionsForms[encounterId]?.followUpInstructions || ''}
                              onChange={(e) => updateClinicalInstructionsForm(encounterId, 'followUpInstructions', e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded text-sm"
                              rows={4}
                              placeholder="Enter follow-up instructions..."
                            />
                          </div>
                          <button
                            onClick={async () => {
                              const currentData = encounterSavedData[encounterId] || [];
                              const instructionsData = clinicalInstructionsForms[encounterId] || { patientInstructions: '', followUpInstructions: '' };
                              const editingIdx = editingSection[encounterId];

                              const section = {
                                title: 'Clinical Instructions',
                                type: 'clinical-instructions',
                                author: 'Billy Smith',
                                date: new Date().toISOString(),
                                data: instructionsData,
                                signatures: []
                              };

                              const documentId = editingIdx !== null && editingIdx !== undefined
                                ? currentData[editingIdx]?.id
                                : undefined;

                              await saveDocumentReference(encounterId, section, documentId);
                              setEditingSection({ ...editingSection, [encounterId]: null });

                              setClinicalInstructionsForms({
                                ...clinicalInstructionsForms,
                                [encounterId]: { patientInstructions: '', followUpInstructions: '' }
                              });
                              setActiveEncounterSubTab({ ...activeEncounterSubTab, [encounterId]: 'summary' });
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                          >
                            {editingSection[encounterId] !== null && editingSection[encounterId] !== undefined ? 'Update Instructions' : 'Save Instructions'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Clinical Notes Section */}
                    {activeSubTab === 'clinical-notes' && (
                      <div className="bg-white border border-gray-200 rounded p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinical Notes</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Progress Notes</label>
                            <textarea
                              value={clinicalNotesForms[encounterId]?.notes || ''}
                              onChange={(e) => updateClinicalNotesForm(encounterId, e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded text-sm font-mono"
                              rows={12}
                              placeholder="Enter clinical notes..."
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={async () => {
                                const currentData = encounterSavedData[encounterId] || [];
                                const notesData = clinicalNotesForms[encounterId] || { notes: '' };
                                const editingIdx = editingSection[encounterId];

                                const section: SavedSection = {
                                  title: 'Clinical Notes',
                                  type: 'clinical-notes',
                                  author: 'Billy Smith',
                                  date: new Date().toISOString(),
                                  data: { notes: notesData.notes },
                                  signatures: []
                                };

                                const documentId = editingIdx !== null && editingIdx !== undefined
                                  ? currentData[editingIdx]?.id
                                  : undefined;

                                await saveDocumentReference(encounterId, section, documentId);
                                setEditingSection({ ...editingSection, [encounterId]: null });

                                setClinicalNotesForms({
                                  ...clinicalNotesForms,
                                  [encounterId]: { notes: '' }
                                });
                                setActiveEncounterSubTab({ ...activeEncounterSubTab, [encounterId]: 'summary' });
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                            >
                              {editingSection[encounterId] !== null && editingSection[encounterId] !== undefined ? 'Update Notes' : 'Save Notes'}
                            </button>
                            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50">
                              Add Template
                            </button>
                          </div>
                        </div>
                      </div>
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

                            setRosForms({
                              ...rosForms,
                              [encounterId]: {}
                            });
                            setActiveEncounterSubTab({ ...activeEncounterSubTab, [encounterId]: 'summary' });
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
                              setSoapForms({
                                ...soapForms,
                                [encounterId]: { subjective: '', objective: '', assessment: '', plan: '' }
                              });
                              setActiveEncounterSubTab({ ...activeEncounterSubTab, [encounterId]: 'summary' });
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
                      <div className="bg-white border border-gray-200 rounded p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Vital Signs</h3>
                          <button
                            onClick={() => setShowVitalsDrawer(true)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                          >
                            Record Vitals
                          </button>
                        </div>

                        {/* Display recent vitals */}
                        <div className="grid grid-cols-3 gap-4">
                          {observations.slice(0, 6).map((obs, idx) => {
                            const value = obs.valueQuantity?.value || obs.component?.[0]?.valueQuantity?.value;
                            const unit = obs.valueQuantity?.unit || obs.component?.[0]?.valueQuantity?.unit;
                            const display = obs.code?.text || obs.code?.coding?.[0]?.display;

                            return (
                              <div key={idx} className="border border-gray-200 rounded p-3">
                                <p className="text-xs text-gray-600 mb-1">{display}</p>
                                <p className="text-lg font-semibold text-gray-900">{value} {unit}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(obs.effectiveDateTime).toLocaleDateString()}
                                </p>
                              </div>
                            );
                          })}
                        </div>

                        {observations.length === 0 && (
                          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded border border-gray-200">
                            <p className="text-sm">No vitals recorded for this encounter</p>
                          </div>
                        )}
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
                    {!['summary', 'care-plan', 'clinical-instructions', 'clinical-notes', 'review-of-systems', 'soap', 'vitals', 'eye-exam', 'functional-and-cognitive-status', 'observation', 'review-of-systems-checks', 'speech-dictation', 'forms', 'procedure-order', 'lab-results', 'new-questionnaire'].includes(activeSubTab) && (
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Edit Patient Drawer */}
        <Drawer open={showEditDrawer} onOpenChange={setShowEditDrawer}>
          <DrawerContent side="right" size="2xl" className="overflow-y-auto">
            <DrawerHeader>
              <DrawerTitle>Edit Patient</DrawerTitle>
            </DrawerHeader>
            <div className="mt-6">
              {patient && (
                <PatientForm
                  isEditing={true}
                  onSubmit={handleEditPatient}
                  onCancel={() => setShowEditDrawer(false)}
                />
              )}
            </div>
          </DrawerContent>
        </Drawer>

        {/* New Encounter Drawer */}
        <Drawer open={showEncounterDrawer} onOpenChange={setShowEncounterDrawer}>
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
                  onBack={() => setShowEncounterDrawer(false)}
                  onStartVisit={handleStartVisit}
                />
              )}
            </div>
          </DrawerContent>
        </Drawer>

        {/* Vitals, Problem, Medication Drawers */}
        <VitalsDrawer
          open={showVitalsDrawer}
          onOpenChange={setShowVitalsDrawer}
          onSave={handleSaveVitals}
        />
        <ProblemDrawer
          open={showProblemDrawer}
          onOpenChange={setShowProblemDrawer}
          onSave={handleSaveProblem}
        />
        <MedicationDrawer
          open={showMedicationDrawer}
          onOpenChange={setShowMedicationDrawer}
          onSave={handleSaveMedication}
        />

        {/* Add Allergy Drawer */}
        <Drawer open={showAllergyDrawer} onOpenChange={setShowAllergyDrawer}>
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
                    setShowAllergyDrawer(false);
                    refreshData();
                  }}
                  onCancel={() => setShowAllergyDrawer(false)}
                />
              )}
            </div>
          </DrawerContent>
        </Drawer>

        {/* Medical Info Drawer (History, Habits, Allergies) */}
        <MedicalInfoDrawer
          isOpen={showMedicalInfoDrawer}
          onClose={() => setShowMedicalInfoDrawer(false)}
          patientHistory=""
          patientHabitsStructured={undefined}
          patientAllergiesStructured={undefined}
          onUpdate={(data) => {
            // Update patient data with the new medical info
            console.log('Medical info updated:', data);
            setShowMedicalInfoDrawer(false);
            refreshData();
          }}
        />

        {/* Insurance Drawer */}
        <InsuranceDrawer
          open={showInsuranceDrawer}
          onOpenChange={setShowInsuranceDrawer}
          onSave={handleSaveInsurance}
          patientId={patientId}
        />
      </div>
    </TabPageWrapper>
  );
}
