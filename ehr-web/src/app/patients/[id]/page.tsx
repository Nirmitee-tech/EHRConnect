'use client';

import React, { useState, useEffect } from 'react';
import { User, Edit, Calendar, Pill, AlertCircle, Activity, FileText, Loader2 } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@nirmitee.io/design-system';
import { useParams } from 'next/navigation';
import { fhirService } from '@/lib/medplum';
import { PatientForm } from '@/components/forms/patient-form';
import { EncounterForm } from '@/components/forms/encounter-form';
import { AllergyForm } from '@/components/forms/allergy-form';
import { patientService } from '@/services/patient.service';
import { TabPageWrapper } from '@/components/layout/tab-page-wrapper';
import { useTabNavigation } from '@/hooks/use-tab-navigation';
import { PatientHeader } from './components/PatientHeader';
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
import { PatientDetails, VitalsFormData, ProblemFormData, MedicationFormData } from './components/types';

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params?.id as string;
  const { openPatientEditTab } = useTabNavigation();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [encounters, setEncounters] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [allergies, setAllergies] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);

  // Drawer states
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showVitalsDrawer, setShowVitalsDrawer] = useState(false);
  const [showEncounterDrawer, setShowEncounterDrawer] = useState(false);
  const [showProblemDrawer, setShowProblemDrawer] = useState(false);
  const [showMedicationDrawer, setShowMedicationDrawer] = useState(false);
  const [showAllergyDrawer, setShowAllergyDrawer] = useState(false);

  const loadPatientData = async () => {
    if (!patientId) return;

    try {
      setLoading(true);

      const patientResource = await fhirService.read('Patient', patientId) as any;
      const name = patientResource.name?.[0];
      const fullName = `${name?.given?.join(' ') || ''} ${name?.family || ''}`.trim();
      const phone = patientResource.telecom?.find((t: any) => t.system === 'phone')?.value || '-';
      const email = patientResource.telecom?.find((t: any) => t.system === 'email')?.value || '-';
      const mrn = patientResource.identifier?.find((id: any) => id.type?.coding?.some((c: any) => c.code === 'MR'))?.value || '-';

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

      const [encounterRes, conditionRes, medicationRes, allergyRes, observationRes] = await Promise.all([
        fhirService.search('Encounter', { patient: patientId, _count: 10, _sort: '-date' }),
        fhirService.search('Condition', { patient: patientId, _count: 20 }),
        fhirService.search('MedicationRequest', { patient: patientId, _count: 20, status: 'active' }),
        fhirService.search('AllergyIntolerance', { patient: patientId, _count: 20 }),
        fhirService.search('Observation', { patient: patientId, _count: 100, _sort: '-date' })
      ]);

      setEncounters(encounterRes.entry?.map((e: any) => e.resource) || []);
      setProblems(conditionRes.entry?.map((e: any) => e.resource) || []);
      setMedications(medicationRes.entry?.map((e: any) => e.resource) || []);
      setAllergies(allergyRes.entry?.map((e: any) => e.resource) || []);
      setObservations(observationRes.entry?.map((e: any) => e.resource) || []);

    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const refreshData = () => {
    loadPatientData();
  };

  const handleStartVisit = async (encounterData: any) => {
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'encounters', label: 'Encounters', icon: Calendar, count: encounters.length },
    { id: 'problems', label: 'Problems', icon: AlertCircle, count: problems.length },
    { id: 'medications', label: 'Medications', icon: Pill, count: medications.length },
    { id: 'allergies', label: 'Allergies', icon: AlertCircle, count: allergies.length },
    { id: 'vitals', label: 'Vitals & Obs', icon: Activity, count: observations.length },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  return (
    <TabPageWrapper title={patient.name} icon={<User className="h-4 w-4" />}>
      <div className="h-screen flex flex-col bg-gray-50">
        <PatientHeader
          patient={patient}
          onEdit={() => openPatientEditTab(patientId, patient.name)}
          onNewVisit={() => setShowEncounterDrawer(true)}
        />

        <div className="bg-white border-b border-gray-200 px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
                    ${activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`
                      px-1.5 py-0.5 rounded-full text-xs font-semibold
                      ${activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <OverviewTab
              encounters={encounters}
              problems={problems}
              medications={medications}
              allergies={allergies}
            />
          )}
          {activeTab === 'vitals' && (
            <VitalsTab
              observations={observations}
              onRecordVitals={() => setShowVitalsDrawer(true)}
            />
          )}
          {activeTab === 'encounters' && (
            <EncountersTab
              encounters={encounters}
              observations={observations}
              onNewEncounter={() => setShowEncounterDrawer(true)}
            />
          )}
          {activeTab === 'problems' && (
            <ProblemsTab
              problems={problems}
              onAddProblem={() => setShowProblemDrawer(true)}
            />
          )}
          {activeTab === 'medications' && (
            <MedicationsTab
              medications={medications}
              onPrescribe={() => setShowMedicationDrawer(true)}
            />
          )}
          {activeTab === 'allergies' && (
            <AllergiesTab
              allergies={allergies}
              onAddAllergy={() => setShowAllergyDrawer(true)}
            />
          )}
          {activeTab === 'documents' && <DocumentsTab />}
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
                  initialData={{
                    firstName: patient.name.split(' ')[0] || '',
                    lastName: patient.name.split(' ').slice(1).join(' ') || '',
                    dateOfBirth: patient.dob,
                    gender: patient.gender,
                    phone: patient.phone !== '-' ? patient.phone : '',
                    email: patient.email !== '-' ? patient.email : ''
                  }}
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
      </div>
    </TabPageWrapper>
  );
}
