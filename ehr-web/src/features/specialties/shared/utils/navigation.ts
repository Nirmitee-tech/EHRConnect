/**
 * Specialty Navigation Utilities
 * Helper functions for building dynamic navigation from specialty packs
 */

import * as Icons from 'lucide-react';
import { NavigationItem, SidebarView } from '../types';
import { SpecialtyPack, SpecialtyNavigationSection } from '@/types/specialty';

/**
 * Get icon component from icon name string
 */
export function getIconComponent(iconName: string): React.ComponentType {
  // @ts-expect-error - Dynamic icon lookup
  const IconComponent = Icons[iconName];
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found, using default`);
    return Icons.Circle;
  }
  return IconComponent;
}

/**
 * Convert specialty navigation section to NavigationItem
 */
export function toNavigationItem(
  section: SpecialtyNavigationSection,
  specialtySlug?: string
): NavigationItem {
  return {
    id: section.id,
    label: section.label,
    icon: getIconComponent(section.icon),
    count: section.count ?? null,
    category: section.category,
    specialtySlug,
    badge: section.badge,
    hidden: section.hidden || false,
    componentName: section.componentName, // ✅ COPY componentName for dynamic rendering!
  };
}

/**
 * Build navigation items from specialty pack
 */
export function buildNavigationFromPack(
  pack: SpecialtyPack
): NavigationItem[] {
  if (!pack.navigation?.sections) {
    return [];
  }

  return pack.navigation.sections
    .filter(section => !section.hidden)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .map(section => toNavigationItem(section, pack.slug));
}

/**
 * Merge navigation from multiple packs
 */
export function mergeNavigation(
  baseNavigation: NavigationItem[],
  ...packNavigations: NavigationItem[][]
): NavigationItem[] {
  const merged = [...baseNavigation];

  for (const packNav of packNavigations) {
    for (const item of packNav) {
      // Check if item already exists (by id)
      const existingIndex = merged.findIndex(m => m.id === item.id);

      if (existingIndex >= 0) {
        // Replace existing item (specialty-specific takes precedence)
        merged[existingIndex] = item;
      } else {
        // Add new item
        merged.push(item);
      }
    }
  }

  return merged;
}

/**
 * Filter navigation by category
 */
export function filterByCategory(
  navigation: NavigationItem[],
  category: 'clinical' | 'administrative' | 'financial' | 'general'
): NavigationItem[] {
  if (category === 'general') {
    return navigation;
  }

  return navigation.filter(
    item => item.category === category || item.category === 'general'
  );
}

/**
 * Filter navigation by specialty
 */
export function filterBySpecialty(
  navigation: NavigationItem[],
  specialtySlug: string
): NavigationItem[] {
  return navigation.filter(
    item =>
      item.specialtySlug === specialtySlug ||
      item.category === 'general'
  );
}

/**
 * Get navigation items based on view filter
 */
export function getNavigationForView(
  allNavigation: NavigationItem[],
  view: SidebarView,
  packs: SpecialtyPack[]
): NavigationItem[] {
  // "All" view shows everything
  if (view === 'all') {
    return allNavigation;
  }

  // Category views (clinical, administrative, financial)
  if (view === 'clinical' || view === 'administrative' || view === 'financial') {
    return filterByCategory(allNavigation, view);
  }

  // Specialty-specific view
  const pack = packs.find(p => p.slug === view);
  if (pack) {
    return filterBySpecialty(allNavigation, pack.slug);
  }

  // Default: show all
  return allNavigation;
}

/**
 * Get available view options for dropdown
 */
export interface ViewOption {
  value: SidebarView;
  label: string;
  isDivider?: boolean;
  isSpecialty?: boolean;
}

export function getViewOptions(packs: SpecialtyPack[]): ViewOption[] {
  const options: ViewOption[] = [
    { value: 'all', label: 'All Sections' },
    { value: 'clinical', label: 'Clinical' },
    { value: 'administrative', label: 'Admin' },
    { value: 'financial', label: 'Financial' },
  ];

  // Add specialty options if there are multiple packs
  const specialtyPacks = packs.filter(p => p.slug !== 'general');

  if (specialtyPacks.length > 0) {
    // Add divider
    options.push({ value: 'divider', label: '--- Specialties ---', isDivider: true });

    // Add each specialty
    for (const pack of specialtyPacks) {
      options.push({
        value: pack.slug,
        label: pack.name || pack.slug,
        isSpecialty: true,
      });
    }
  }

  return options;
}
