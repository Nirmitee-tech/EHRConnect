/**
 * Shared Specialty Exports
 * Central export point for all shared specialty functionality
 */

// Types
export type { SpecialtyModule, SidebarView, NavigationItem, SpecialtyNavigationConfig } from './types';

// Components
export { SpecialtyBadge, EpisodeIndicator } from './components';

// Hooks
export { useSpecialtyNavigation, useHasSpecialtyNavigation, useViewOptions } from './hooks/useSpecialtyNavigation';

// Utils
export {
  getIconComponent,
  toNavigationItem,
  buildNavigationFromPack,
  mergeNavigation,
  filterByCategory,
  filterBySpecialty,
  getNavigationForView,
  getViewOptions,
} from './utils/navigation';

export type { ViewOption } from './utils/navigation';
