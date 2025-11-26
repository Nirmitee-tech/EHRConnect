'use client';

import React from 'react';
import { usePatientDetailStore } from '../store/patient-detail-store';

interface EncounterDetailViewProps {
  encounterId: string;
  children: React.ReactNode;
}

/**
 * Wrapper component for encounter detail view
 * Handles encounter-specific state and rendering
 * Gets all data from Zustand store
 */
export function EncounterDetailView({ encounterId, children }: EncounterDetailViewProps) {
  const encounters = usePatientDetailStore((state) => state.encounters);
  const encounter = encounters.find((e) => e.id === encounterId);

  if (!encounter) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>Encounter not found</p>
      </div>
    );
  }

  return <>{children}</>;
}
