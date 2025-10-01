'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { User, Edit, Calendar, Pill, AlertCircle, Activity, FileText, Loader2, Plus, TrendingUp, TrendingDown, AlertTriangle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useParams } from 'next/navigation';
import { fhirService } from '@/lib/medplum';
import { PatientForm } from '@/components/forms/patient-form';
import { EncounterForm } from '@/components/forms/encounter-form';
import { patientService } from '@/services/patient.service';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface PatientDetails {
  id: string;
  name: string;
  mrn: string;
  dob: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
}

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params?.id as string;
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [encounters, setEncounters] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [allergies, setAllergies] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  const [showEditDrawer, setShowEditDrawer] = useState(false);
  const [showVitalsDrawer, setShowVitalsDrawer] = useState(false);
  const [showEncounterDrawer, setShowEncounterDrawer] = useState(false);
  const [showProblemDrawer, setShowProblemDrawer] = useState(false);
  const [showMedicationDrawer, setShowMedicationDrawer] = useState(false);
  const [savingVitals, setSavingVitals] = useState(false);
  const [savingProblem, setSavingProblem] = useState(false);
  const [savingMedication, setSavingMedication] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [vitalsData, setVitalsData] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    temperature: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    height: ''
  });
  
  const [problemData, setProblemData] = useState({
    condition: '',
    category: 'problem-list-item',
    severity: '',
    onsetDate: new Date().toISOString().split('T')[0]
  });

  const [medicationData, setMedicationData] = useState({
    medication: '',
    dosageValue: '',
    dosageUnit: 'mg',
    route: 'oral',
    frequency: '1',
    period: '1',
    periodUnit: 'd',
    instructions: ''
  });

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

  const handleSaveProblem = async () => {
    if (!patientId || !problemData.condition) return;

    setSavingProblem(true);
    try {
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

      setProblemData({
        condition: '',
        category: 'problem-list-item',
        severity: '',
        onsetDate: new Date().toISOString().split('T')[0]
      });
      setShowProblemDrawer(false);
      refreshData();
    } catch (error) {
      console.error('Error saving problem:', error);
      alert('Failed to save problem');
    } finally {
      setSavingProblem(false);
    }
  };

  const handleSaveMedication = async () => {
    if (!patientId || !medicationData.medication) return;

    setSavingMedication(true);
    try {
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

      setMedicationData({
        medication: '',
        dosageValue: '',
        dosageUnit: 'mg',
        route: 'oral',
        frequency: '1',
        period: '1',
        periodUnit: 'd',
        instructions: ''
      });
      setShowMedicationDrawer(false);
      refreshData();
    } catch (error) {
      console.error('Error saving medication:', error);
      alert('Failed to save medication');
    } finally {
      setSavingMedication(false);
    }
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

  const handleSaveVitals = async () => {
    if (!patientId) return;

    setSavingVitals(true);
    try {
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

      if (vitalsData.heartRate) {
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
              code: '8867-4',
              display: 'Heart rate'
            }],
            text: 'Heart Rate'
          },
          subject: { reference: `Patient/${patientId}` },
          effectiveDateTime: new Date().toISOString(),
          valueQuantity: {
            value: parseFloat(vitalsData.heartRate),
            unit: 'beats/minute',
            system: 'http://unitsofmeasure.org',
            code: '/min'
          }
        });
      }

      if (vitalsData.temperature) {
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
              code: '8310-5',
              display: 'Body temperature'
            }],
            text: 'Temperature'
          },
          subject: { reference: `Patient/${patientId}` },
          effectiveDateTime: new Date().toISOString(),
          valueQuantity: {
            value: parseFloat(vitalsData.temperature),
            unit: 'Cel',
            system: 'http://unitsofmeasure.org',
            code: 'Cel'
          }
        });
      }

      if (vitalsData.respiratoryRate) {
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
              code: '9279-1',
              display: 'Respiratory rate'
            }],
            text: 'Respiratory Rate'
          },
          subject: { reference: `Patient/${patientId}` },
          effectiveDateTime: new Date().toISOString(),
          valueQuantity: {
            value: parseFloat(vitalsData.respiratoryRate),
            unit: 'breaths/minute',
            system: 'http://unitsofmeasure.org',
            code: '/min'
          }
        });
      }

      if (vitalsData.oxygenSaturation) {
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
              code: '59408-5',
              display: 'Oxygen saturation'
            }],
            text: 'O2 Saturation'
          },
          subject: { reference: `Patient/${patientId}` },
          effectiveDateTime: new Date().toISOString(),
          valueQuantity: {
            value: parseFloat(vitalsData.oxygenSaturation),
            unit: '%',
            system: 'http://unitsofmeasure.org',
            code: '%'
          }
        });
      }

      if (vitalsData.weight) {
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
              code: '29463-7',
              display: 'Body weight'
            }],
            text: 'Weight'
          },
          subject: { reference: `Patient/${patientId}` },
          effectiveDateTime: new Date().toISOString(),
          valueQuantity: {
            value: parseFloat(vitalsData.weight),
            unit: 'kg',
            system: 'http://unitsofmeasure.org',
            code: 'kg'
          }
        });
      }

      if (vitalsData.height) {
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
              code: '8302-2',
              display: 'Body height'
            }],
            text: 'Height'
          },
          subject: { reference: `Patient/${patientId}` },
          effectiveDateTime: new Date().toISOString(),
          valueQuantity: {
            value: parseFloat(vitalsData.height),
            unit: 'cm',
            system: 'http://unitsofmeasure.org',
            code: 'cm'
          }
        });
      }

      await Promise.all(observations.map(obs => fhirService.create(obs)));

      setVitalsData({
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        heartRate: '',
        temperature: '',
        respiratoryRate: '',
        oxygenSaturation: '',
        weight: '',
        height: ''
      });
      setShowVitalsDrawer(false);
      refreshData();
    } catch (error) {
      console.error('Error saving vitals:', error);
      alert('Failed to save vitals');
    } finally {
      setSavingVitals(false);
    }
  };

  const filteredObservations = useMemo(() => {
    if (dateFilter === 'all') return observations;
    
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (dateFilter) {
      case '7days':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      default:
        return observations;
    }
    
    return observations.filter((obs: any) => {
      if (!obs.effectiveDateTime) return false;
      return new Date(obs.effectiveDateTime) >= cutoffDate;
    });
  }, [observations, dateFilter]);

  const chartData = useMemo(() => {
    const dataMap: { [key: string]: any } = {};
    
    filteredObservations.forEach((obs: any) => {
      const date = obs.effectiveDateTime ? new Date(obs.effectiveDateTime).toLocaleDateString() : 'Unknown';
      
      if (!dataMap[date]) {
        dataMap[date] = { date };
      }
      
      const code = obs.code?.coding?.[0]?.code;
      
      if (code === '85354-9' && obs.component) {
        const sys = obs.component.find((c: any) =>
          c.code?.coding?.some((code: any) => code.code === '8480-6')
        );
        const dia = obs.component.find((c: any) =>
          c.code?.coding?.some((code: any) => code.code === '8462-4')
        );
        dataMap[date].systolic = sys?.valueQuantity?.value;
        dataMap[date].diastolic = dia?.valueQuantity?.value;
      } else if (code === '8867-4') {
        dataMap[date].heartRate = obs.valueQuantity?.value;
      } else if (code === '8310-5') {
        dataMap[date].temperature = obs.valueQuantity?.value;
      } else if (code === '59408-5') {
        dataMap[date].o2sat = obs.valueQuantity?.value;
      }
    });
    
    return Object.values(dataMap).reverse();
  }, [filteredObservations]);

  const vitalAlerts = useMemo(() => {
    const alerts: string[] = [];
    const latest: any = {};
    
    filteredObservations.forEach((obs: any) => {
      const code = obs.code?.coding?.[0]?.code;
      
      if (code === '85354-9' && obs.component && !latest.bp) {
        const sys = obs.component.find((c: any) =>
          c.code?.coding?.some((code: any) => code.code === '8480-6')
        );
        const dia = obs.component.find((c: any) =>
          c.code?.coding?.some((code: any) => code.code === '8462-4')
        );
        const sysValue = sys?.valueQuantity?.value;
        const diaValue = dia?.valueQuantity?.value;
        
        if (sysValue > 140 || diaValue > 90) {
          alerts.push('⚠️ High Blood Pressure detected - Consider medication review');
        } else if (sysValue < 90 || diaValue < 60) {
          alerts.push('⚠️ Low Blood Pressure detected - Monitor for symptoms');
        }
        latest.bp = true;
      } else if (code === '8867-4' && !latest.hr) {
        const hr = obs.valueQuantity?.value;
        if (hr > 100) {
          alerts.push('⚠️ Elevated Heart Rate - Check for fever or anxiety');
        } else if (hr < 60) {
          alerts.push('⚠️ Low Heart Rate - Verify patient is not an athlete');
        }
        latest.hr = true;
      } else if (code === '8310-5' && !latest.temp) {
        const temp = obs.valueQuantity?.value;
        if (temp > 38) {
          alerts.push('🔥 Fever detected - Consider infection workup');
        } else if (temp < 36) {
          alerts.push('❄️ Hypothermia risk - Check environmental factors');
        }
        latest.temp = true;
      } else if (code === '59408-5' && !latest.o2) {
        const o2 = obs.valueQuantity?.value;
        if (o2 < 95) {
          alerts.push('⚠️ Low Oxygen Saturation - Consider supplemental O2');
        }
        latest.o2 = true;
      }
    });
    
    return alerts;
  }, [filteredObservations]);

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
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900">{patient.name}</h1>
                <Badge className="bg-green-50 text-green-700 border-green-200">Active</Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span>MRN: {patient.mrn}</span>
                <span>•</span>
                <span>{patient.age}y, {patient.gender}</span>
                <span>•</span>
                <span>DOB: {patient.dob}</span>
                <span>•</span>
                <span>{patient.phone}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowEditDrawer(true)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button size="sm" className="bg-primary" onClick={() => setShowEncounterDrawer(true)}>
              <Calendar className="h-4 w-4 mr-1" />
              New Visit
            </Button>
          </div>
        </div>
      </div>

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
        {activeTab === 'vitals' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Vitals & Observations</h2>
              <div className="flex gap-2">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" className="bg-primary" onClick={() => setShowVitalsDrawer(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Record Vitals
                </Button>
              </div>
            </div>

            {vitalAlerts.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
                      Clinical Alerts
                      <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                        {vitalAlerts.length}
                      </span>
                    </h3>
                    <ul className="space-y-1.5">
                      {vitalAlerts.map((alert, i) => (
                        <li key={i} className="text-xs text-red-800 flex items-start gap-1.5">
                          <span className="text-red-600 mt-0.5">•</span>
                          <span>{alert.replace(/[⚠️🔥❄️💨]/g, '').trim()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Blood Pressure', loinc: '85354-9', componentCodes: ['8480-6', '8462-4'], unit: 'mmHg', borderColor: 'border-blue-200', normal: '120/80', icon: Activity },
                { label: 'Heart Rate', loinc: '8867-4', unit: 'bpm', borderColor: 'border-red-200', normal: '60-100 bpm', icon: Activity },
                { label: 'Temperature', loinc: '8310-5', unit: '°C', borderColor: 'border-orange-200', normal: '36.5-37.5°C', icon: Activity },
                { label: 'O2 Saturation', loinc: '59408-5', unit: '%', borderColor: 'border-green-200', normal: '95-100%', icon: Activity }
              ].map((vital) => {
                let latestValue = '-';
                let trend = null;
                let isAbnormal = false;
                
                if (vital.componentCodes) {
                  const latestObs = filteredObservations.find((obs: any) =>
                    obs.code?.coding?.some((c: any) => c.code === vital.loinc)
                  );
                  if (latestObs?.component) {
                    const sys = latestObs.component.find((c: any) =>
                      c.code?.coding?.some((code: any) => code.code === vital.componentCodes[0])
                    );
                    const dia = latestObs.component.find((c: any) =>
                      c.code?.coding?.some((code: any) => code.code === vital.componentCodes[1])
                    );
                    latestValue = `${sys?.valueQuantity?.value || '-'}/${dia?.valueQuantity?.value || '-'}`;
                    const sysVal = sys?.valueQuantity?.value;
                    const diaVal = dia?.valueQuantity?.value;
                    isAbnormal = (sysVal > 140 || sysVal < 90) || (diaVal > 90 || diaVal < 60);
                  }
                } else {
                  const relevantObs = filteredObservations.filter((obs: any) =>
                    obs.code?.coding?.some((c: any) => c.code === vital.loinc)
                  );
                  if (relevantObs.length > 0) {
                    const latest = relevantObs[0];
                    const value = latest.valueQuantity?.value;
                    latestValue = `${value} ${latest.valueQuantity?.unit || vital.unit}`;
                    
                    if (vital.loinc === '8867-4') {
                      isAbnormal = value > 100 || value < 60;
                    } else if (vital.loinc === '8310-5') {
                      isAbnormal = value > 38 || value < 36;
                    } else if (vital.loinc === '59408-5') {
                      isAbnormal = value < 95;
                    }
                    
                    if (relevantObs.length > 1) {
                      const previous = relevantObs[1];
                      const latestVal = latest.valueQuantity?.value;
                      const prevVal = previous.valueQuantity?.value;
                      if (latestVal && prevVal) {
                        trend = latestVal > prevVal ? 'up' : latestVal < prevVal ? 'down' : null;
                      }
                    }
                  }
                }
                
                const Icon = vital.icon;
                
                return (
                  <div key={vital.loinc} className={`bg-white rounded-lg border ${isAbnormal ? 'border-red-300 bg-red-50' : vital.borderColor} p-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-gray-600" />
                        <span className="text-xs font-medium text-gray-700">{vital.label}</span>
                      </div>
                      {trend && (
                        <div className="flex items-center gap-0.5">
                          {trend === 'up' ? 
                            <TrendingUp className="h-3 w-3 text-red-500" /> : 
                            <TrendingDown className="h-3 w-3 text-green-500" />
                          }
                        </div>
                      )}
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className={`text-lg font-semibold ${isAbnormal ? 'text-red-600' : 'text-gray-900'}`}>{latestValue}</span>
                      {isAbnormal && (
                        <span className="text-xs font-medium text-red-600">High</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Norm: {vital.normal}</div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold mb-3">Blood Pressure Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} name="Systolic" />
                    <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} name="Diastolic" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold mb-3">Heart Rate Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="heartRate" stroke="#10b981" fill="#10b98120" name="Heart Rate" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold mb-3">Temperature Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={[35, 40]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} name="Temperature" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-semibold mb-3">O2 Saturation Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={[90, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="o2sat" stroke="#6366f1" fill="#6366f120" name="O2 Saturation" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Complete Table View */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b">
                <h3 className="text-sm font-semibold">Complete Vitals History by Date</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date & Time</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Blood Pressure</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Heart Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Temperature</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Resp. Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">O2 Sat</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Weight</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Height</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(() => {
                      const grouped: { [key: string]: any[] } = {};
                      
                      filteredObservations.forEach((obs: any) => {
                        const dateTime = obs.effectiveDateTime 
                          ? new Date(obs.effectiveDateTime).toISOString()
                          : 'unknown';
                        
                        if (!grouped[dateTime]) {
                          grouped[dateTime] = [];
                        }
                        grouped[dateTime].push(obs);
                      });

                      const sortedDates = Object.keys(grouped).sort((a, b) => 
                        new Date(b).getTime() - new Date(a).getTime()
                      );

                      return sortedDates.map((dateTime) => {
                        const obsGroup = grouped[dateTime];
                        const date = dateTime !== 'unknown' ? new Date(dateTime) : null;
                        
                        let bp = '-';
                        let hr = '-';
                        let temp = '-';
                        let rr = '-';
                        let o2 = '-';
                        let weight = '-';
                        let height = '-';

                        obsGroup.forEach((obs: any) => {
                          const code = obs.code?.coding?.[0]?.code;
                          
                          if (code === '85354-9' && obs.component) {
                            const sys = obs.component.find((c: any) =>
                              c.code?.coding?.some((code: any) => code.code === '8480-6')
                            );
                            const dia = obs.component.find((c: any) =>
                              c.code?.coding?.some((code: any) => code.code === '8462-4')
                            );
                            bp = `${sys?.valueQuantity?.value || '-'}/${dia?.valueQuantity?.value || '-'}`;
                          } else if (code === '8867-4') {
                            hr = `${obs.valueQuantity?.value || '-'} ${obs.valueQuantity?.unit || 'bpm'}`;
                          } else if (code === '8310-5') {
                            temp = `${obs.valueQuantity?.value || '-'} ${obs.valueQuantity?.unit || '°C'}`;
                          } else if (code === '9279-1') {
                            rr = `${obs.valueQuantity?.value || '-'} ${obs.valueQuantity?.unit || '/min'}`;
                          } else if (code === '59408-5') {
                            o2 = `${obs.valueQuantity?.value || '-'} ${obs.valueQuantity?.unit || '%'}`;
                          } else if (code === '29463-7') {
                            weight = `${obs.valueQuantity?.value || '-'} ${obs.valueQuantity?.unit || 'kg'}`;
                          } else if (code === '8302-2') {
                            height = `${obs.valueQuantity?.value || '-'} ${obs.valueQuantity?.unit || 'cm'}`;
                          }
                        });

                        return (
                          <tr key={dateTime} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">
                              {date ? (
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {date.toLocaleDateString()}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {date.toLocaleTimeString()}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-500">Unknown</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">{bp}</td>
                            <td className="px-4 py-3 text-sm font-medium">{hr}</td>
                            <td className="px-4 py-3 text-sm font-medium">{temp}</td>
                            <td className="px-4 py-3 text-sm font-medium">{rr}</td>
                            <td className="px-4 py-3 text-sm font-medium">{o2}</td>
                            <td className="px-4 py-3 text-sm font-medium">{weight}</td>
                            <td className="px-4 py-3 text-sm font-medium">{height}</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
                {observations.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No vitals recorded yet
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {/* Quick Stats */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Recent Encounters</p>
                    <p className="text-2xl font-bold text-gray-900">{encounters.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Active Problems</p>
                    <p className="text-2xl font-bold text-gray-900">{problems.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Pill className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Active Medications</p>
                    <p className="text-2xl font-bold text-gray-900">{medications.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b">
                  <h3 className="text-sm font-semibold">Recent Encounters</h3>
                </div>
                <div className="p-4 space-y-3">
                  {encounters.slice(0, 3).map((encounter: any) => (
                    <div key={encounter.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {encounter.type?.[0]?.text || encounter.class?.display || 'Visit'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {encounter.period?.start ? new Date(encounter.period.start).toLocaleDateString() : 'Date unknown'}
                        </p>
                      </div>
                      <Badge className={`text-xs ${
                        encounter.status === 'finished' ? 'bg-green-50 text-green-700 border-green-200' :
                        encounter.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {encounter.status}
                      </Badge>
                    </div>
                  ))}
                  {encounters.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No encounters recorded</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b">
                  <h3 className="text-sm font-semibold">Active Problems</h3>
                </div>
                <div className="p-4 space-y-3">
                  {problems.slice(0, 3).map((problem: any) => (
                    <div key={problem.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {problem.code?.text || problem.code?.coding?.[0]?.display || 'Unknown condition'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Onset: {problem.onsetDateTime ? new Date(problem.onsetDateTime).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {problems.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No active problems</p>
                  )}
                </div>
              </div>
            </div>

            {/* Allergies Alert */}
            {allergies.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-yellow-900 mb-2">Known Allergies ({allergies.length})</h3>
                    <div className="flex flex-wrap gap-2">
                      {allergies.map((allergy: any) => (
                        <Badge key={allergy.id} className="bg-yellow-100 text-yellow-800 border-yellow-300">
                          {allergy.code?.text || allergy.code?.coding?.[0]?.display || 'Unknown allergen'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'encounters' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Encounter Timeline</h2>
              <Button size="sm" className="bg-primary" onClick={() => setShowEncounterDrawer(true)}>
                <Plus className="h-4 w-4 mr-1" />
                New Encounter
              </Button>
            </div>

            {/* Timeline View */}
            <div className="relative">
              {encounters.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
                  No encounters recorded
                </div>
              ) : (
                <div className="space-y-4">
                  {encounters.map((encounter: any, index: number) => {
                    const encounterDate = encounter.period?.start ? new Date(encounter.period.start) : null;
                    const encounterDateStr = encounterDate?.toISOString().split('T')[0];
                    
                    // Find vitals captured on the same day
                    const encounterVitals = observations.filter((obs: any) => {
                      if (!obs.effectiveDateTime) return false;
                      const obsDate = new Date(obs.effectiveDateTime).toISOString().split('T')[0];
                      return obsDate === encounterDateStr;
                    });

                    return (
                      <div key={encounter.id} className="relative">
                        {/* Timeline connector */}
                        {index < encounters.length - 1 && (
                          <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200" style={{ height: 'calc(100% + 1rem)' }} />
                        )}
                        
                        <div className="bg-white rounded-lg border border-gray-200 p-4 ml-0">
                          <div className="flex items-start gap-4">
                            {/* Timeline dot */}
                            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                              encounter.status === 'in-progress' ? 'bg-blue-100' :
                              encounter.status === 'finished' ? 'bg-green-100' :
                              'bg-gray-100'
                            }`}>
                              <Calendar className={`h-6 w-6 ${
                                encounter.status === 'in-progress' ? 'text-blue-600' :
                                encounter.status === 'finished' ? 'text-green-600' :
                                'text-gray-600'
                              }`} />
                            </div>

                            {/* Encounter details */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-sm font-bold text-gray-900">
                                      {encounter.type?.[0]?.text || encounter.class?.display || 'Visit'}
                                    </h3>
                                    <Badge className={`text-xs ${
                                      encounter.status === 'finished' ? 'bg-green-50 text-green-700 border-green-200' :
                                      encounter.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                      'bg-gray-50 text-gray-700 border-gray-200'
                                    }`}>
                                      {encounter.status}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    {encounterDate ? (
                                      <>
                                        {encounterDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        {' at '}
                                        {encounterDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                      </>
                                    ) : 'Date unknown'}
                                  </p>
                                </div>
                              </div>

                              {/* Encounter metadata */}
                              <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                                <div>
                                  <span className="text-gray-500">Class</span>
                                  <p className="font-medium text-gray-900">{encounter.class?.display || '-'}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Practitioner</span>
                                  <p className="font-medium text-gray-900">
                                    {encounter.participant?.[0]?.individual?.display || '-'}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Location</span>
                                  <p className="font-medium text-gray-900">
                                    {encounter.serviceProvider?.display || encounter.location?.[0]?.location?.display || '-'}
                                  </p>
                                </div>
                              </div>

                              {/* Vitals captured during this encounter */}
                              {encounterVitals.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Activity className="h-4 w-4 text-primary" />
                                    <span className="text-xs font-semibold text-gray-700">
                                      Vitals Captured ({encounterVitals.length})
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-4 gap-2">
                                    {encounterVitals.map((vital: any) => {
                                      const code = vital.code?.coding?.[0]?.code;
                                      let label = '';
                                      let value = '';
                                      
                                      if (code === '85354-9' && vital.component) {
                                        label = 'BP';
                                        const sys = vital.component.find((c: any) =>
                                          c.code?.coding?.some((code: any) => code.code === '8480-6')
                                        );
                                        const dia = vital.component.find((c: any) =>
                                          c.code?.coding?.some((code: any) => code.code === '8462-4')
                                        );
                                        value = `${sys?.valueQuantity?.value || '-'}/${dia?.valueQuantity?.value || '-'}`;
                                      } else if (code === '8867-4') {
                                        label = 'HR';
                                        value = `${vital.valueQuantity?.value} bpm`;
                                      } else if (code === '8310-5') {
                                        label = 'Temp';
                                        value = `${vital.valueQuantity?.value}°C`;
                                      } else if (code === '59408-5') {
                                        label = 'O2';
                                        value = `${vital.valueQuantity?.value}%`;
                                      } else if (code === '9279-1') {
                                        label = 'RR';
                                        value = `${vital.valueQuantity?.value}/min`;
                                      } else if (code === '29463-7') {
                                        label = 'Weight';
                                        value = `${vital.valueQuantity?.value} kg`;
                                      } else if (code === '8302-2') {
                                        label = 'Height';
                                        value = `${vital.valueQuantity?.value} cm`;
                                      }

                                      return label ? (
                                        <div key={vital.id} className="bg-gray-50 rounded px-2 py-1.5">
                                          <p className="text-xs text-gray-600">{label}</p>
                                          <p className="text-xs font-semibold text-gray-900">{value}</p>
                                        </div>
                                      ) : null;
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Reason for visit */}
                              {encounter.reasonCode?.[0] && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                  <span className="text-xs text-gray-500">Reason for visit</span>
                                  <p className="text-xs font-medium text-gray-900 mt-1">
                                    {encounter.reasonCode[0].text || encounter.reasonCode[0].coding?.[0]?.display || '-'}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'problems' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-sm font-semibold">Active Problems & Conditions</h3>
                <Button size="sm" className="bg-primary" onClick={() => setShowProblemDrawer(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Problem
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Condition</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Onset</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Severity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {problems.map((problem: any) => (
                      <tr key={problem.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">
                          {problem.code?.text || problem.code?.coding?.[0]?.display || 'Unknown condition'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {problem.category?.[0]?.coding?.[0]?.display || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`text-xs ${
                            problem.clinicalStatus?.coding?.[0]?.code === 'active' ? 'bg-red-50 text-red-700 border-red-200' :
                            problem.clinicalStatus?.coding?.[0]?.code === 'resolved' ? 'bg-green-50 text-green-700 border-green-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }`}>
                            {problem.clinicalStatus?.coding?.[0]?.display || problem.clinicalStatus?.coding?.[0]?.code || 'Unknown'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {problem.onsetDateTime ? new Date(problem.onsetDateTime).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {problem.severity?.coding?.[0]?.display || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {problems.length === 0 && (
                  <div className="p-8 text-center text-gray-500">No problems recorded</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'medications' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-sm font-semibold">Active Medications</h3>
                <Button size="sm" className="bg-primary" onClick={() => setShowMedicationDrawer(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Prescribe Medication
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Medication</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Dosage</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Route</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Frequency</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Prescribed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {medications.map((med: any) => (
                      <tr key={med.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">
                          {med.medicationCodeableConcept?.text || 
                           med.medicationCodeableConcept?.coding?.[0]?.display || 
                           'Unknown medication'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {med.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.value || '-'} {med.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.unit || ''}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {med.dosageInstruction?.[0]?.route?.coding?.[0]?.display || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {med.dosageInstruction?.[0]?.timing?.repeat?.frequency || '-'}x / 
                          {med.dosageInstruction?.[0]?.timing?.repeat?.period || '-'} 
                          {med.dosageInstruction?.[0]?.timing?.repeat?.periodUnit || ''}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`text-xs ${
                            med.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                            med.status === 'stopped' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }`}>
                            {med.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {med.authoredOn ? new Date(med.authoredOn).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {medications.length === 0 && (
                  <div className="p-8 text-center text-gray-500">No active medications</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'allergies' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-sm font-semibold">Allergies & Intolerances</h3>
                <Button size="sm" className="bg-primary">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Allergy
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Allergen</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Criticality</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Reaction</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Recorded</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {allergies.map((allergy: any) => (
                      <tr key={allergy.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium">
                          {allergy.code?.text || allergy.code?.coding?.[0]?.display || 'Unknown allergen'}
                        </td>
                        <td className="px-4 py-3 text-sm">{allergy.type || '-'}</td>
                        <td className="px-4 py-3 text-sm">
                          {allergy.category?.[0] ? allergy.category[0].charAt(0).toUpperCase() + allergy.category[0].slice(1) : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={`text-xs ${
                            allergy.criticality === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                            allergy.criticality === 'low' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }`}>
                            {allergy.criticality || 'Unknown'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {allergy.reaction?.[0]?.manifestation?.[0]?.text || 
                           allergy.reaction?.[0]?.manifestation?.[0]?.coding?.[0]?.display || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {allergy.recordedDate ? new Date(allergy.recordedDate).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {allergies.length === 0 && (
                  <div className="p-8 text-center text-gray-500">No known allergies</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Documents</h3>
              <p className="text-sm text-gray-600 mb-4">Document management coming soon</p>
              <Button size="sm" className="bg-primary">
                <Plus className="h-4 w-4 mr-1" />
                Upload Document
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Patient Drawer */}
      <Sheet open={showEditDrawer} onOpenChange={setShowEditDrawer}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Patient</SheetTitle>
          </SheetHeader>
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
        </SheetContent>
      </Sheet>

      {/* New Encounter Drawer */}
      <Sheet open={showEncounterDrawer} onOpenChange={setShowEncounterDrawer}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>New Encounter</SheetTitle>
          </SheetHeader>
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
        </SheetContent>
      </Sheet>

      {/* Add Problem Drawer */}
      <Sheet open={showProblemDrawer} onOpenChange={setShowProblemDrawer}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Problem / Condition</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div>
              <Label>Condition / Problem <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Enter condition name"
                value={problemData.condition}
                onChange={(e) => setProblemData({ ...problemData, condition: e.target.value })}
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select value={problemData.category} onValueChange={(value) => setProblemData({ ...problemData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="problem-list-item">Problem List Item</SelectItem>
                  <SelectItem value="encounter-diagnosis">Encounter Diagnosis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Severity</Label>
              <Select value={problemData.severity} onValueChange={(value) => setProblemData({ ...problemData, severity: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Onset Date</Label>
              <Input
                type="date"
                value={problemData.onsetDate}
                onChange={(e) => setProblemData({ ...problemData, onsetDate: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => setShowProblemDrawer(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveProblem} disabled={savingProblem || !problemData.condition} className="flex-1 bg-primary">
                {savingProblem ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Add Problem'
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Medication Drawer */}
      <Sheet open={showMedicationDrawer} onOpenChange={setShowMedicationDrawer}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Prescribe Medication</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div>
              <Label>Medication Name <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Enter medication name"
                value={medicationData.medication}
                onChange={(e) => setMedicationData({ ...medicationData, medication: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Dosage <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="10"
                  value={medicationData.dosageValue}
                  onChange={(e) => setMedicationData({ ...medicationData, dosageValue: e.target.value })}
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Select value={medicationData.dosageUnit} onValueChange={(value) => setMedicationData({ ...medicationData, dosageUnit: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mg">mg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="mcg">mcg</SelectItem>
                    <SelectItem value="units">units</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Route</Label>
              <Select value={medicationData.route} onValueChange={(value) => setMedicationData({ ...medicationData, route: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oral">Oral</SelectItem>
                  <SelectItem value="intravenous">Intravenous</SelectItem>
                  <SelectItem value="intramuscular">Intramuscular</SelectItem>
                  <SelectItem value="subcutaneous">Subcutaneous</SelectItem>
                  <SelectItem value="topical">Topical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Frequency</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={medicationData.frequency}
                  onChange={(e) => setMedicationData({ ...medicationData, frequency: e.target.value })}
                />
              </div>
              <div>
                <Label>Per</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={medicationData.period}
                  onChange={(e) => setMedicationData({ ...medicationData, period: e.target.value })}
                />
              </div>
              <div>
                <Label>Period</Label>
                <Select value={medicationData.periodUnit} onValueChange={(value) => setMedicationData({ ...medicationData, periodUnit: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="h">Hour(s)</SelectItem>
                    <SelectItem value="d">Day(s)</SelectItem>
                    <SelectItem value="wk">Week(s)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Instructions</Label>
              <Input
                placeholder="Take with food"
                value={medicationData.instructions}
                onChange={(e) => setMedicationData({ ...medicationData, instructions: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => setShowMedicationDrawer(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveMedication} disabled={savingMedication || !medicationData.medication || !medicationData.dosageValue} className="flex-1 bg-primary">
                {savingMedication ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Prescribe'
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Record Vitals Drawer */}
      <Sheet open={showVitalsDrawer} onOpenChange={setShowVitalsDrawer}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Record Vitals</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Blood Pressure - Systolic</Label>
                <Input
                  type="number"
                  placeholder="120"
                  value={vitalsData.bloodPressureSystolic}
                  onChange={(e) => setVitalsData({ ...vitalsData, bloodPressureSystolic: e.target.value })}
                />
              </div>
              <div>
                <Label>Blood Pressure - Diastolic</Label>
                <Input
                  type="number"
                  placeholder="80"
                  value={vitalsData.bloodPressureDiastolic}
                  onChange={(e) => setVitalsData({ ...vitalsData, bloodPressureDiastolic: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Heart Rate (bpm)</Label>
                <Input
                  type="number"
                  placeholder="72"
                  value={vitalsData.heartRate}
                  onChange={(e) => setVitalsData({ ...vitalsData, heartRate: e.target.value })}
                />
              </div>
              <div>
                <Label>Temperature (°C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="37.0"
                  value={vitalsData.temperature}
                  onChange={(e) => setVitalsData({ ...vitalsData, temperature: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Respiratory Rate (/min)</Label>
                <Input
                  type="number"
                  placeholder="16"
                  value={vitalsData.respiratoryRate}
                  onChange={(e) => setVitalsData({ ...vitalsData, respiratoryRate: e.target.value })}
                />
              </div>
              <div>
                <Label>O2 Saturation (%)</Label>
                <Input
                  type="number"
                  placeholder="98"
                  value={vitalsData.oxygenSaturation}
                  onChange={(e) => setVitalsData({ ...vitalsData, oxygenSaturation: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="70.0"
                  value={vitalsData.weight}
                  onChange={(e) => setVitalsData({ ...vitalsData, weight: e.target.value })}
                />
              </div>
              <div>
                <Label>Height (cm)</Label>
                <Input
                  type="number"
                  placeholder="170"
                  value={vitalsData.height}
                  onChange={(e) => setVitalsData({ ...vitalsData, height: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={() => setShowVitalsDrawer(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveVitals} disabled={savingVitals} className="flex-1 bg-primary">
                {savingVitals ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Vitals'
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
