'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

export default function ReportsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to clinical reports as default
    router.push('/reports/clinical/patient-summary');
  }, [router]);

  return null;
}
