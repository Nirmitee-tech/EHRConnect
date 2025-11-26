'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ReportsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to clinical reports as default
    router.push('/reports/clinical/patient-summary');
  }, [router]);

  return null;
}
