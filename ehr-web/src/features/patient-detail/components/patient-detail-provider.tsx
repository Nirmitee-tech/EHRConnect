'use client';

import { type ReactNode, useEffect } from 'react';
import { usePatientDetailStore } from '../store/patient-detail-store';

interface PatientDetailProviderProps {
  patientId: string;
  encounterIdFromQuery?: string | null;
  tabFromQuery?: string | null;
  children: ReactNode;
}

export function PatientDetailProvider({
  patientId,
  encounterIdFromQuery = null,
  tabFromQuery = null,
  children
}: PatientDetailProviderProps) {
  const initialize = usePatientDetailStore((state) => state.initialize);
  const loadAllPatientData = usePatientDetailStore((state) => state.loadAllPatientData);
  const checkPortalAccess = usePatientDetailStore((state) => state.checkPortalAccess);
  const hydrateEncounterFromQuery = usePatientDetailStore((state) => state.hydrateEncounterFromQuery);
  const loadEncounterDocumentation = usePatientDetailStore((state) => state.loadEncounterDocumentation);

  const storePatientId = usePatientDetailStore((state) => state.patientId);
  const patient = usePatientDetailStore((state) => state.patient);
  const selectedEncounter = usePatientDetailStore((state) => state.selectedEncounter);
  const encounterIdFromStore = usePatientDetailStore((state) => state.encounterIdFromQuery);
  const hasHydratedFromQuery = usePatientDetailStore((state) => state.hasHydratedFromQuery);

  useEffect(() => {
    console.log('🎬 PatientDetailProvider: Initializing with', { patientId, encounterIdFromQuery, tabFromQuery });
    initialize({ patientId, encounterIdFromQuery, tabFromQuery });
  }, [initialize, patientId, encounterIdFromQuery, tabFromQuery]);

  useEffect(() => {
    if (!storePatientId) {
      console.log('⏸️  PatientDetailProvider: No storePatientId, skipping loadAllPatientData');
      return;
    }
    console.log('📥 PatientDetailProvider: Calling loadAllPatientData for', storePatientId);
    void loadAllPatientData();
  }, [storePatientId, loadAllPatientData]);

  useEffect(() => {
    if (!storePatientId) return;
    void checkPortalAccess();
  }, [storePatientId, checkPortalAccess]);

  useEffect(() => {
    if (hasHydratedFromQuery) return;
    if (!patient || !encounterIdFromStore) return;
    hydrateEncounterFromQuery();
  }, [hydrateEncounterFromQuery, patient, encounterIdFromStore, hasHydratedFromQuery]);

  useEffect(() => {
    if (selectedEncounter && patient) {
      void loadEncounterDocumentation(selectedEncounter);
    }
  }, [selectedEncounter, patient, loadEncounterDocumentation]);

  return <>{children}</>;
}
