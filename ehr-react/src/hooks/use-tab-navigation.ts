'use client';

import { useCallback } from 'react';
import { useTabs } from '@/contexts/tab-context';

interface OpenTabOptions {
  title: string;
  path: string;
  icon?: React.ReactNode;
  closeable?: boolean;
}

/**
 * Hook for easy tab navigation throughout the app
 */
export function useTabNavigation() {
  const { addTab } = useTabs();

  const openTab = useCallback(
    (options: OpenTabOptions) => {
      return addTab(options);
    },
    [addTab]
  );

  // Common navigation helpers
  const openPatientTab = useCallback(
    (patientId: string, patientName: string) => {
      return openTab({
        title: patientName,
        path: `/patients/${patientId}`,
      });
    },
    [openTab]
  );

  const openPatientEditTab = useCallback(
    (patientId: string, patientName: string) => {
      return openTab({
        title: `Edit ${patientName}`,
        path: `/patients/${patientId}/edit`,
      });
    },
    [openTab]
  );

  const openNewPatientTab = useCallback(() => {
    return openTab({
      title: 'New Patient',
      path: '/patients/new',
    });
  }, [openTab]);

  const openDashboardTab = useCallback(() => {
    return openTab({
      title: 'Dashboard',
      path: '/dashboard',
    });
  }, [openTab]);

  const openPatientsListTab = useCallback(() => {
    return openTab({
      title: 'Patients',
      path: '/patients',
    });
  }, [openTab]);

  const openStaffTab = useCallback(() => {
    return openTab({
      title: 'Staff',
      path: '/staff',
    });
  }, [openTab]);

  const openAdminTab = useCallback(() => {
    return openTab({
      title: 'Admin',
      path: '/admin',
    });
  }, [openTab]);

  const openFacilitiesTab = useCallback(() => {
    return openTab({
      title: 'Facilities',
      path: '/admin/facilities',
    });
  }, [openTab]);

  const openUsersTab = useCallback(() => {
    return openTab({
      title: 'Users',
      path: '/admin/users',
    });
  }, [openTab]);

  return {
    openTab,
    openPatientTab,
    openPatientEditTab,
    openNewPatientTab,
    openDashboardTab,
    openPatientsListTab,
    openStaffTab,
    openAdminTab,
    openFacilitiesTab,
    openUsersTab,
  };
}
