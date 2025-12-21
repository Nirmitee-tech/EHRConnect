/**
 * Registry-based Specialty Navigation Hook
 * Uses the client-side specialty registry for navigation
 * This is the proper, scalable approach for the specialty system
 */

import { useMemo } from 'react';
import { specialtyRegistry } from '../../registry';
import { NavigationItem, SidebarView } from '../types';
import {
  buildNavigationFromModules,
  getNavigationForView,
  getViewOptions,
  ViewOption,
} from '../utils/registry-navigation';

/**
 * Hook to get navigation items from the specialty registry
 * Returns merged navigation from all registered specialty modules
 */
export function useRegistryNavigation(view: SidebarView = 'all') {
  /**
   * Get all registered modules and build navigation
   */
  const allNavigation = useMemo(() => {
    const modules = specialtyRegistry.getAll();
    return buildNavigationFromModules(modules);
  }, []); // Stable - registry doesn't change after initial load

  /**
   * Filter navigation based on current view
   */
  const filteredNavigation = useMemo(() => {
    const modules = specialtyRegistry.getAll();
    return getNavigationForView(allNavigation, view, modules);
  }, [allNavigation, view]);

  /**
   * Get available view options for dropdown
   */
  const viewOptions = useMemo(() => {
    const modules = specialtyRegistry.getAll();
    return getViewOptions(modules);
  }, []);

  return {
    navigation: filteredNavigation,
    allNavigation,
    viewOptions,
    loading: false,
    hasSpecialtyNavigation: allNavigation.length > 0,
  };
}

/**
 * Hook to check if specialty navigation is available
 * Returns true if any specialty modules have navigation sections
 */
export function useHasRegistryNavigation(): boolean {
  return useMemo(() => {
    const modules = specialtyRegistry.getAll();
    return modules.some(
      module =>
        module.navigation?.sections &&
        module.navigation.sections.length > 0
    );
  }, []);
}

/**
 * Hook to get view options for dropdown
 */
export function useRegistryViewOptions(): ViewOption[] {
  return useMemo(() => {
    const modules = specialtyRegistry.getAll();
    return getViewOptions(modules);
  }, []);
}
