'use client';

import { useState, useEffect } from 'react';

interface ResourceCounts {
  patients: number;
  staff: number;
  loading: boolean;
}

export function useResourceCounts(facilityId?: string): ResourceCounts {
  const [counts, setCounts] = useState<ResourceCounts>({
    patients: 0,
    staff: 0,
    loading: true
  });

  useEffect(() => {
    let mounted = true;

    const loadCounts = async () => {
      try {
        const [patientsRes, staffRes] = await Promise.all([
          fetch('/api/fhir/Patient?_count=1'),
          fetch('/api/fhir/Practitioner?_count=1')
        ]);

        if (!mounted) return;

        const [patientsData, staffData] = await Promise.all([
          patientsRes.ok ? patientsRes.json() : { total: 0 },
          staffRes.ok ? staffRes.json() : { total: 0 }
        ]);

        setCounts({
          patients: patientsData.total || 0,
          staff: staffData.total || 0,
          loading: false
        });
      } catch (error) {
        console.error('Failed to load resource counts:', error);
        if (mounted) {
          setCounts(prev => ({ ...prev, loading: false }));
        }
      }
    };

    loadCounts();

    return () => {
      mounted = false;
    };
  }, [facilityId]);

  return counts;
}
