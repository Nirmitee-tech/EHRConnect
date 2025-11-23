'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import type {
  CountryContext,
  CountryPack,
  CountryModule,
  Localization
} from '@/types/country';

interface CountryContextValue {
  context: CountryContext | null;
  countryPack: CountryPack | null;
  enabledModules: CountryModule[];
  localization: Localization;
  loading: boolean;
  error: string | null;
  refreshContext: () => Promise<void>;
  isModuleEnabled: (moduleCode: string) => boolean;
  getModuleByCode: (moduleCode: string) => CountryModule | undefined;
  hasCountryPack: boolean;
}

const CountryContext = createContext<CountryContextValue | undefined>(undefined);

interface CountryProviderProps {
  children: React.ReactNode;
}

export function CountryProvider({ children }: CountryProviderProps) {
  const { data: session } = useSession();
  const [context, setContext] = useState<CountryContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContext = useCallback(async () => {
    if (!session?.org_id) {
      setContext(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/countries/context`, {
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': session.org_id,
          'x-user-id': session.user?.id || '',
          'x-user-roles': JSON.stringify(session.roles || []),
          'x-location-id': session.location_ids?.[0] || '',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch country context');
      }

      const data = await response.json();

      if (data.success && data.context) {
        setContext(data.context);
      } else {
        throw new Error('Invalid context response');
      }
    } catch (err) {
      console.error('Error fetching country context:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');

      // Set default context on error
      setContext({
        orgId: session.org_id,
        countryPack: null,
        enabledModules: [],
        localization: {
          language: 'en',
          currency: 'USD',
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
          numberFormat: 'en-US'
        }
      });
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchContext();
  }, [fetchContext]);

  const isModuleEnabled = useCallback((moduleCode: string): boolean => {
    return context?.enabledModules.some(
      module => module.moduleCode === moduleCode && module.status === 'active'
    ) || false;
  }, [context]);

  const getModuleByCode = useCallback((moduleCode: string): CountryModule | undefined => {
    return context?.enabledModules.find(module => module.moduleCode === moduleCode);
  }, [context]);

  const value: CountryContextValue = {
    context,
    countryPack: context?.countryPack || null,
    enabledModules: context?.enabledModules || [],
    localization: context?.localization || {
      language: 'en',
      currency: 'USD',
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      numberFormat: 'en-US'
    },
    loading,
    error,
    refreshContext: fetchContext,
    isModuleEnabled,
    getModuleByCode,
    hasCountryPack: !!context?.countryPack
  };

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
}

/**
 * Hook to access country context
 * @returns CountryContextValue
 */
export function useCountryContext() {
  const context = useContext(CountryContext);
  if (context === undefined) {
    throw new Error('useCountryContext must be used within a CountryProvider');
  }
  return context;
}

/**
 * Hook to check if a specific module is enabled
 * @param moduleCode - Module code (e.g., 'abha-m1', 'va-integration')
 * @returns boolean
 */
export function useIsModuleEnabled(moduleCode: string): boolean {
  const { isModuleEnabled } = useCountryContext();
  return isModuleEnabled(moduleCode);
}

/**
 * Hook to access a specific country module
 * @param moduleCode - Module code
 * @returns CountryModule or undefined
 */
export function useCountryModule(moduleCode: string): CountryModule | undefined {
  const { getModuleByCode } = useCountryContext();
  return getModuleByCode(moduleCode);
}

/**
 * Hook to access localization settings
 * @returns Localization
 */
export function useLocalization(): Localization {
  const { localization } = useCountryContext();
  return localization;
}

/**
 * Hook to check if organization has any country pack enabled
 * @returns boolean
 */
export function useHasCountryPack(): boolean {
  const { hasCountryPack } = useCountryContext();
  return hasCountryPack;
}
