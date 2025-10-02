'use client';

import { useState, useEffect, useCallback } from 'react';
import { fhirService } from '@/lib/medplum';

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

interface UsePatientDetailReturn {
  patient: PatientDetails | null;
  encounters: any[];
  problems: any[];
  medications: any[];
  allergies: any[];
  observations: any[];
  loading: boolean;
  refreshData: () => Promise<void>;
}

export function usePatientDetail(patientId: string): UsePatientDetailReturn {
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [encounters, setEncounters] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [allergies, setAllergies] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPatientData = useCallback(async () => {
    if (!patientId) return;

    try {
      setLoading(true);

      const patientResource = await fhirService.read('Patient', patientId) as any;
      const name = patientResource.name?.[0];
      const fullName = `${name?.given?.join(' ') || ''} ${name?.family || ''}`.trim();
      const phone = patientResource.telecom?.find((t: any) => t.system === 'phone')?.value || '-';
      const email = patientResource.telecom?.find((t: any) => t.system === 'email')?.value || '-';
      const mrn = patientResource.identifier?.find((id: any) =>
        id.type?.coding?.some((c: any) => c.code === 'MR')
      )?.value || '-';

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
  }, [patientId]);

  useEffect(() => {
    loadPatientData();
  }, [loadPatientData]);

  return {
    patient,
    encounters,
    problems,
    medications,
    allergies,
    observations,
    loading,
    refreshData: loadPatientData
  };
}
