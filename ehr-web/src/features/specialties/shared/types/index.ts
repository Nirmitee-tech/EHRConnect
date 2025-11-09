/**
 * Shared Specialty Types
 * Common types used across all specialty modules
 */

import { LucideIcon } from 'lucide-react';
import { ComponentType, LazyExoticComponent } from 'react';

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
   */
  components?: Record<string, LazyExoticComponent<ComponentType<unknown>>>;

  /**
   * Navigation configuration
   * Will be merged with base navigation
   */
  navigation?: unknown;

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

/**
 * Navigation item for sidebar
 */
export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
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
 */
export interface SpecialtyNavigationConfig {
  sections: NavigationItem[];
  replaceSections?: boolean;
  mergeWith?: string;
}
