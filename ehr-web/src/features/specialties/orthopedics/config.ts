/**
 * Orthopedics Specialty Configuration
 * Defines the Orthopedics & Sports Medicine specialty module
 */

import { lazy } from 'react';
import { SpecialtyModule } from '../shared/types';

/**
 * Orthopedics Specialty Module
 * Complete configuration for orthopedic surgery and sports medicine
 */
export const OrthopedicsSpecialty: SpecialtyModule = {
  slug: 'orthopedics',
  name: 'Orthopedics & Sports Medicine',
  icon: 'Bone',
  color: '#3B82F6',

  /**
   * Lazy-loaded components
   * These are loaded on-demand when the user accesses orthopedics sections
   */
  components: {
    OrthopedicsOverview: lazy(() =>
      import('./components/OrthopedicsOverview').then(m => ({
        default: m.OrthopedicsOverview,
      }))
    ),
    JointAssessment: lazy(() =>
      import('./components/JointAssessment').then(m => ({
        default: m.JointAssessment,
      }))
    ),
  },

  /**
   * Episode lifecycle handlers
   */
  episodeHandlers: {
    onCreate: async (episodeId: string) => {
      console.log(`✅ Orthopedics episode created: ${episodeId}`);
    },

    onUpdate: async (episodeId: string) => {
      console.log(`📝 Orthopedics episode updated: ${episodeId}`);
    },

    onClose: async (episodeId: string) => {
      console.log(`✅ Orthopedics episode closed: ${episodeId}`);
    },
  },

  /**
   * Navigation Configuration
   * Defines the sidebar menu structure for the Orthopedics specialty
   */
  navigation: {
    sections: [
      {
        id: 'orthopedics-overview',
        label: 'Orthopedics Overview',
        icon: 'LayoutDashboard',
        category: 'clinical',
        componentName: 'OrthopedicsOverview',
        order: 10,
      },
      {
        id: 'joint-assessment',
        label: 'Joint Assessment',
        icon: 'Activity',
        category: 'clinical',
        componentName: 'JointAssessment',
        order: 20,
      },
    ],
  },
};
