/**
 * Cardiology Specialty Configuration
 * Defines the Cardiology & Cardiovascular Care specialty module
 */

import { lazy } from 'react';
import { SpecialtyModule } from '../shared/types';

/**
 * Cardiology Specialty Module
 * Complete configuration for cardiovascular care
 */
export const CardiologySpecialty: SpecialtyModule = {
  slug: 'cardiology',
  name: 'Cardiology & Cardiovascular Care',
  icon: 'Heart',
  color: '#EF4444',

  /**
   * Lazy-loaded components
   * These are loaded on-demand when the user accesses cardiology sections
   */
  components: {
    CardiologyOverview: lazy(() =>
      import('./components/CardiologyOverview').then(m => ({
        default: m.CardiologyOverview,
      }))
    ),
    CardiacAssessment: lazy(() =>
      import('./components/CardiacAssessment').then(m => ({
        default: m.CardiacAssessment,
      }))
    ),
  },

  /**
   * Episode lifecycle handlers
   */
  episodeHandlers: {
    onCreate: async (episodeId: string) => {
      console.log(`✅ Cardiology episode created: ${episodeId}`);
    },

    onUpdate: async (episodeId: string) => {
      console.log(`📝 Cardiology episode updated: ${episodeId}`);
    },

    onClose: async (episodeId: string) => {
      console.log(`✅ Cardiology episode closed: ${episodeId}`);
    },
  },

  /**
   * Navigation Configuration
   * Defines the sidebar menu structure for the Cardiology specialty
   */
  navigation: {
    sections: [
      {
        id: 'cardiology-overview',
        label: 'Cardiology Overview',
        icon: 'LayoutDashboard',
        category: 'clinical',
        componentName: 'CardiologyOverview',
        order: 10,
      },
      {
        id: 'cardiac-assessment',
        label: 'Cardiac Assessment',
        icon: 'Activity',
        category: 'clinical',
        componentName: 'CardiacAssessment',
        order: 20,
      },
    ],
  },
};
