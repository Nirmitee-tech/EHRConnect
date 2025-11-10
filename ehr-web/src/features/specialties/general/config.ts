/**
 * General Specialty Configuration
 * Defines the General Primary Care specialty module
 */

import { lazy } from 'react';
import { SpecialtyModule } from '../shared/types';

/**
 * General Specialty Module
 * Complete configuration for general primary care
 */
export const GeneralSpecialty: SpecialtyModule = {
  slug: 'general',
  name: 'General Primary Care',
  icon: 'Stethoscope',
  color: '#3B82F6',

  /**
   * Lazy-loaded components
   * These are loaded on-demand when the user accesses General sections
   */
  components: {
    GeneralFacesheet: lazy(() =>
      import('../shared/components/GeneralFacesheet').then(m => ({
        default: m.GeneralFacesheet,
      }))
    ),
  },

  /**
   * Episode lifecycle handlers
   */
  episodeHandlers: {
    onCreate: async (episodeId: string) => {
      console.log(`✅ General care episode created: ${episodeId}`);
    },

    onUpdate: async (episodeId: string) => {
      console.log(`📝 General care episode updated: ${episodeId}`);
    },

    onClose: async (episodeId: string) => {
      console.log(`✅ General care episode closed: ${episodeId}`);
    },
  },
};
