'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { PatientDetailProvider } from '@/features/patient-detail/components/patient-detail-provider';
import { PatientDetailShell } from '@/features/patient-detail/components/patient-detail-shell';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

export default function PatientDetailPage() {
  const params = useParams<{ id?: string }>();
  const searchParams = useSearchParams();
  const patientId = params?.id as string | undefined;
  const encounterIdFromQuery = searchParams?.get('encounterId');
  const tabFromQuery = searchParams?.get('tab');

  if (!patientId) {
    return null;
  }

  return (
    <PatientDetailProvider
      patientId={patientId}
      encounterIdFromQuery={encounterIdFromQuery}
      tabFromQuery={tabFromQuery}
    >
      <PatientDetailShell />
    </PatientDetailProvider>
  );
}
