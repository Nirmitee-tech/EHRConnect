/**
 * Wound Care Specialty Configuration
 * Defines the Wound Care & Hyperbaric Medicine specialty module
 */

import { lazy } from 'react';
import { SpecialtyModule } from '../shared/types';

/**
 * Wound Care Specialty Module
 * Configuration for wound care and hyperbaric medicine
 */
export const WoundCareSpecialty: SpecialtyModule = {
  slug: 'wound-care',
  name: 'Wound Care & Hyperbaric Medicine',
  icon: 'Bandage',
  color: '#F59E0B',

  /**
   * Lazy-loaded components
   * These are loaded on-demand when the user accesses wound care sections
   */
  components: {
    WoundCareOverview: lazy(() =>
      import('./components/WoundCareOverview').then(m => ({
        default: m.WoundCareOverview,
      }))
    ),
    WoundAssessment: lazy(() =>
      import('./components/WoundAssessment').then(m => ({
        default: m.WoundAssessment,
      }))
    ),
  },

  /**
   * Episode lifecycle handlers
   */
  episodeHandlers: {
    onCreate: async (episodeId: string) => {
      console.log(`✅ Wound Care episode created: ${episodeId}`);
    },

    onUpdate: async (episodeId: string) => {
      console.log(`📝 Wound Care episode updated: ${episodeId}`);
    },

    onClose: async (episodeId: string) => {
      console.log(`✅ Wound Care episode closed: ${episodeId}`);
    },
  },

  /**
   * Navigation Configuration
   * Defines the sidebar menu structure for the Wound Care specialty
   */
  navigation: {
    sections: [
      {
        id: 'wound-care-overview',
        label: 'Wound Care Overview',
        icon: 'LayoutDashboard',
        category: 'clinical',
        componentName: 'WoundCareOverview',
        order: 10,
      },
      {
        id: 'wound-assessment',
        label: 'Wound Assessment',
        icon: 'FileText',
        category: 'clinical',
        componentName: 'WoundAssessment',
        order: 20,
      },
    ],
  },
};
