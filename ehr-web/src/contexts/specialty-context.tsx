'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import type { SpecialtyContext, SpecialtyPack, PackSetting } from '@/types/specialty';

interface SpecialtyContextValue {
  context: SpecialtyContext | null;
  packs: SpecialtyPack[];
  loading: boolean;
  error: string | null;
  refreshContext: () => Promise<void>;
  getPackBySlug: (slug: string) => SpecialtyPack | undefined;
  isPackEnabled: (slug: string) => boolean;
}

const SpecialtyContext = createContext<SpecialtyContextValue | undefined>(undefined);

interface SpecialtyProviderProps {
  children: React.ReactNode;
}

export function SpecialtyProvider({ children }: SpecialtyProviderProps) {
  const { data: session } = useSession();
  const [context, setContext] = useState<SpecialtyContext | null>(null);
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/specialties/context`, {
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': session.org_id,
          'x-user-id': session.user?.id || '',
          'x-user-roles': JSON.stringify(session.roles || []),
          'x-location-id': session.location_ids?.[0] || '',
          'x-department-id': ''
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch specialty context');
      }

      const data = await response.json();

      if (data.success && data.context) {
        setContext(data.context);
      } else {
        throw new Error('Invalid context response');
      }
    } catch (err) {
      console.error('Error fetching specialty context:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchContext();
  }, [fetchContext]);

  const getPackBySlug = useCallback((slug: string): SpecialtyPack | undefined => {
    return context?.packs.find(pack => pack.slug === slug);
  }, [context]);

  const isPackEnabled = useCallback((slug: string): boolean => {
    return context?.packs.some(pack => pack.slug === slug) || false;
  }, [context]);

  const value: SpecialtyContextValue = {
    context,
    packs: context?.packs || [],
    loading,
    error,
    refreshContext: fetchContext,
    getPackBySlug,
    isPackEnabled
  };

  return (
    <SpecialtyContext.Provider value={value}>
      {children}
    </SpecialtyContext.Provider>
  );
}

/**
 * Hook to access specialty context
 * @returns SpecialtyContextValue
 */
export function useSpecialtyContext() {
  const context = useContext(SpecialtyContext);
  if (context === undefined) {
    throw new Error('useSpecialtyContext must be used within a SpecialtyProvider');
  }
  return context;
}

/**
 * Hook to access a specific specialty pack
 * @param slug - Pack slug (e.g., 'ob-gyn', 'general')
 * @returns SpecialtyPack or undefined
 */
export function useSpecialtyPack(slug: string): SpecialtyPack | undefined {
  const { getPackBySlug } = useSpecialtyContext();
  return getPackBySlug(slug);
}

/**
 * Hook to check if a pack is enabled
 * @param slug - Pack slug
 * @returns boolean
 */
export function useIsPackEnabled(slug: string): boolean {
  const { isPackEnabled } = useSpecialtyContext();
  return isPackEnabled(slug);
}
