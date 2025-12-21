/**
 * Dermatology Specialty Configuration
 * Defines the Dermatology & Skin Care specialty module
 */

import { lazy } from 'react';
import { SpecialtyModule } from '../shared/types';

/**
 * Dermatology Specialty Module
 * Complete configuration for dermatology and skin care
 */
export const DermatologySpecialty: SpecialtyModule = {
  slug: 'dermatology',
  name: 'Dermatology & Skin Care',
  icon: 'Sparkles',
  color: '#EC4899',

  /**
   * Lazy-loaded components
   * These are loaded on-demand when the user accesses dermatology sections
   */
  components: {
    DermatologyOverview: lazy(() =>
      import('./components/DermatologyOverview').then(m => ({
        default: m.DermatologyOverview,
      }))
    ),
    SkinAssessment: lazy(() =>
      import('./components/SkinAssessment').then(m => ({
        default: m.SkinAssessment,
      }))
    ),
  },

  /**
   * Episode lifecycle handlers
   */
  episodeHandlers: {
    onCreate: async (episodeId: string) => {
      console.log(`✅ Dermatology episode created: ${episodeId}`);
    },

    onUpdate: async (episodeId: string) => {
      console.log(`📝 Dermatology episode updated: ${episodeId}`);
    },

    onClose: async (episodeId: string) => {
      console.log(`✅ Dermatology episode closed: ${episodeId}`);
    },
  },

  /**
   * Navigation Configuration
   * Defines the sidebar menu structure for the Dermatology specialty
   */
  navigation: {
    sections: [
      {
        id: 'dermatology-overview',
        label: 'Dermatology Overview',
        icon: 'LayoutDashboard',
        category: 'clinical',
        componentName: 'DermatologyOverview',
        order: 10,
      },
      {
        id: 'skin-assessment',
        label: 'Skin Assessment',
        icon: 'Scan',
        category: 'clinical',
        componentName: 'SkinAssessment',
        order: 20,
      },
    ],
  },
};
