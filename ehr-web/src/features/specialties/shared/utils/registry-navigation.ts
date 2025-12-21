/**
 * Registry-based Navigation Utilities
 * Works with the client-side specialty registry
 */

import * as Icons from 'lucide-react';
import { NavigationItem, NavigationSection, SpecialtyModule, SidebarView } from '../types';
import { LucideIcon } from 'lucide-react';

/**
 * Get icon component from icon name string
 */
export function getIconComponent(iconName: string): LucideIcon {
  // @ts-expect-error - Dynamic icon lookup
  const IconComponent = Icons[iconName];
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found, using Circle`);
    return Icons.Circle;
  }
  return IconComponent as LucideIcon;
}

/**
 * Convert NavigationSection (config) to NavigationItem (runtime)
 */
export function sectionToNavigationItem(
  section: NavigationSection,
  specialtySlug: string
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
    componentName: section.componentName,
  };
}

/**
 * Build navigation items from a specialty module
 */
export function buildNavigationFromModule(module: SpecialtyModule): NavigationItem[] {
  if (!module.navigation?.sections) {
    return [];
  }

  return module.navigation.sections
    .filter(section => !section.hidden)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .map(section => sectionToNavigationItem(section, module.slug));
}

/**
 * Build navigation from all specialty modules
 */
export function buildNavigationFromModules(modules: SpecialtyModule[]): NavigationItem[] {
  const allItems: NavigationItem[] = [];

  for (const module of modules) {
    const items = buildNavigationFromModule(module);
    allItems.push(...items);
  }

  // Sort by order if available, otherwise maintain insertion order
  return allItems.sort((a, b) => {
    // Find the original sections to get order
    const findSection = (item: NavigationItem) => {
      const module = modules.find(m => m.slug === item.specialtySlug);
      return module?.navigation?.sections?.find(s => s.id === item.id);
    };

    const sectionA = findSection(a);
    const sectionB = findSection(b);

    const orderA = sectionA?.order ?? 999;
    const orderB = sectionB?.order ?? 999;

    return orderA - orderB;
  });
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
    item => item.specialtySlug === specialtySlug || item.category === 'general'
  );
}

/**
 * Get navigation items based on view filter
 */
export function getNavigationForView(
  allNavigation: NavigationItem[],
  view: SidebarView,
  modules: SpecialtyModule[]
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
  const module = modules.find(m => m.slug === view);
  if (module) {
    return filterBySpecialty(allNavigation, module.slug);
  }

  // Default: show all
  return allNavigation;
}

/**
 * View option for dropdown
 */
export interface ViewOption {
  value: SidebarView;
  label: string;
  isDivider?: boolean;
  isSpecialty?: boolean;
}

/**
 * Get available view options for dropdown
 */
export function getViewOptions(modules: SpecialtyModule[]): ViewOption[] {
  const options: ViewOption[] = [
    { value: 'all', label: 'All Sections' },
    { value: 'clinical', label: 'Clinical' },
    { value: 'administrative', label: 'Admin' },
    { value: 'financial', label: 'Financial' },
  ];

  // Add specialty options if there are modules with navigation
  const specialtyModules = modules.filter(
    m => m.slug !== 'general' && m.navigation?.sections && m.navigation.sections.length > 0
  );

  if (specialtyModules.length > 0) {
    // Add divider
    options.push({ value: 'divider', label: '--- Specialties ---', isDivider: true });

    // Add each specialty
    for (const module of specialtyModules) {
      options.push({
        value: module.slug,
        label: module.name || module.slug,
        isSpecialty: true,
      });
    }
  }

  return options;
}
