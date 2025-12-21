/**
 * Shared Specialty Types
 * Common types used across all specialty modules
 */

import { LucideIcon } from 'lucide-react';
import { ComponentType, LazyExoticComponent } from 'react';

/**
 * Navigation section as defined in config (uses string icon names)
 * This is what specialty modules define in their config files
 */
export interface NavigationSection {
  id: string;
  label: string;
  icon: string; // Icon name as string (e.g., 'LayoutDashboard')
  category: 'clinical' | 'administrative' | 'financial' | 'general';
  componentName?: string; // Component to render (e.g., 'PrenatalOverview')
  order?: number;
  badge?: string;
  count?: number | null;
  hidden?: boolean;
}

/**
 * Navigation item for runtime (uses actual icon components)
 * This is what the UI components work with
 */
export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon; // Actual icon component
  count: number | null;
  category: string;
  encounterId?: string;
  specialtySlug?: string; // Which specialty this belongs to
  badge?: string;
  hidden?: boolean;
  componentName?: string; // Component to render (e.g., 'PrenatalOverview')
}

/**
 * Specialty navigation configuration
 * Defined in specialty module config files
 */
export interface SpecialtyNavigationConfig {
  sections: NavigationSection[];
}

/**
 * Specialty Module Interface
 * Each specialty module must implement this interface
 */
export interface SpecialtyModule {
  slug: string;
  name: string;
  icon?: string;
  color?: string;

  /**
   * Lazy-loaded components for this specialty
   * Components are loaded on-demand when needed
   * Uses 'any' for props to allow flexible component signatures
   */
  components?: Record<string, LazyExoticComponent<ComponentType<any>>>;

  /**
   * Navigation configuration
   * Will be merged with base navigation
   */
  navigation?: SpecialtyNavigationConfig;

  /**
   * Episode handlers
   * Lifecycle hooks for episode management
   */
  episodeHandlers?: {
    onCreate?: (episodeId: string) => Promise<void> | void;
    onUpdate?: (episodeId: string) => Promise<void> | void;
    onClose?: (episodeId: string) => Promise<void> | void;
  };
}

/**
 * Sidebar view filter types
 */
export type SidebarView =
  | 'all'
  | 'clinical'
  | 'administrative'
  | 'financial'
  | string; // Allow specialty slugs (e.g., 'ob-gyn', 'orthopedics')
