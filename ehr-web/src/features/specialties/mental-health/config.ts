/**
 * Mental Health Specialty Configuration
 * Defines the Mental Health & Psychiatry specialty module
 */

import { lazy } from 'react';
import { SpecialtyModule } from '../shared/types';

/**
 * Mental Health Specialty Module
 * Configuration for mental health and psychiatry care
 */
export const MentalHealthSpecialty: SpecialtyModule = {
  slug: 'mental-health',
  name: 'Mental Health & Psychiatry',
  icon: 'Brain',
  color: '#8B5CF6',

  /**
   * Lazy-loaded components
   * Loaded on-demand when user accesses mental health sections
   */
  components: {
    MentalHealthOverview: lazy(() =>
      import('./components/MentalHealthOverview').then(m => ({
        default: m.MentalHealthOverview,
      }))
    ),
    MoodAssessment: lazy(() =>
      import('./components/MoodAssessment').then(m => ({
        default: m.MoodAssessment,
      }))
    ),
  },

  /**
   * Episode lifecycle handlers
   */
  episodeHandlers: {
    onCreate: async (episodeId: string) => {
      console.log(`✅ Mental Health episode created: ${episodeId}`);
    },

    onUpdate: async (episodeId: string) => {
      console.log(`📝 Mental Health episode updated: ${episodeId}`);
    },

    onClose: async (episodeId: string) => {
      console.log(`✅ Mental Health episode closed: ${episodeId}`);
    },
  },

  /**
   * Navigation Configuration
   * Defines sidebar menu structure for Mental Health specialty
   */
  navigation: {
    sections: [
      {
        id: 'mental-health-overview',
        label: 'Mental Health Overview',
        icon: 'LayoutDashboard',
        category: 'clinical',
        componentName: 'MentalHealthOverview',
        order: 10,
      },
      {
        id: 'mood-assessment',
        label: 'Mood Assessment',
        icon: 'Heart',
        category: 'clinical',
        componentName: 'MoodAssessment',
        order: 20,
      },
    ],
  },
};
