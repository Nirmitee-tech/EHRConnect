/**
 * Specialty Navigation Hook
 * Provides dynamic navigation based on enabled specialty packs
 */

import { useMemo } from 'react';
import { useSpecialtyContext } from '@/contexts/specialty-context';
import { NavigationItem, SidebarView } from '../types';
import {
  buildNavigationFromPack,
  mergeNavigation,
  getNavigationForView,
  getViewOptions,
  ViewOption,
} from '../utils/navigation';

/**
 * Hook to get navigation items from specialty packs
 * Returns merged navigation from all enabled packs
 */
export function useSpecialtyNavigation(view: SidebarView = 'all') {
  const { packs, loading } = useSpecialtyContext();

  /**
   * Build navigation from all enabled packs
   */
  const allNavigation = useMemo(() => {
    if (loading || packs.length === 0) {
      return [];
    }

    // Get navigation from each pack
    const packNavigations = packs.map(pack => buildNavigationFromPack(pack));

    // Merge all navigations (first pack is base)
    const [baseNav = [], ...otherNavs] = packNavigations;
    return mergeNavigation(baseNav, ...otherNavs);
  }, [packs, loading]);

  /**
   * Filter navigation based on current view
   */
  const filteredNavigation = useMemo(() => {
    return getNavigationForView(allNavigation, view, packs);
  }, [allNavigation, view, packs]);

  /**
   * Get available view options for dropdown
   */
  const viewOptions = useMemo(() => {
    return getViewOptions(packs);
  }, [packs]);

  return {
    navigation: filteredNavigation,
    allNavigation,
    viewOptions,
    loading,
    hasSpecialtyPacks: packs.length > 1, // More than just 'general'
  };
}

/**
 * Hook to check if navigation should use specialty system
 * Returns true if specialty navigation is available and has sections
 */
export function useHasSpecialtyNavigation(): boolean {
  const { packs, loading } = useSpecialtyContext();

  return useMemo(() => {
    if (loading || packs.length === 0) {
      return false;
    }

    // Check if any pack has navigation sections
    return packs.some(pack =>
      pack.navigation?.sections &&
      pack.navigation.sections.length > 0
    );
  }, [packs, loading]);
}

/**
 * Hook to get view options for dropdown
 */
export function useViewOptions(): ViewOption[] {
  const { packs } = useSpecialtyContext();
  return useMemo(() => getViewOptions(packs), [packs]);
}
