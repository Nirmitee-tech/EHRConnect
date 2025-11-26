/**
 * Forms Tab Component
 * Displays patient forms in the patient detail view
 */

import React from 'react';
import { PatientFormsList } from '@/features/forms/components/form-responses/patient-forms-list';

interface FormsTabProps {
  patientId: string;
  encounterId?: string;
}

export function FormsTab({ patientId, encounterId }: FormsTabProps) {
  return (
    <div className="p-4">
      <PatientFormsList
        patientId={patientId}
        encounterId={encounterId}
        compact={false}
        maxHeight="calc(100vh - 200px)"
      />
    </div>
  );
}
