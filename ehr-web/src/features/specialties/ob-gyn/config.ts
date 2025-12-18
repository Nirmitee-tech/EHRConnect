/**
 * OB/GYN Specialty Configuration
 * Defines the OB/GYN specialty module
 */

import { lazy } from 'react';
import { SpecialtyModule } from '../shared/types';

/**
 * OB/GYN Specialty Module
 * Complete configuration for obstetrics and prenatal care
 */
export const ObGynSpecialty: SpecialtyModule = {
  slug: 'ob-gyn',
  name: 'OB/GYN & Prenatal Care',
  icon: 'Baby',
  color: '#EC4899',

  /**
   * Lazy-loaded components
   * These are loaded on-demand when the user accesses OB/GYN sections
   */
  components: {
    PrenatalOverview: lazy(() =>
      import('./components/PrenatalOverview').then(m => ({
        default: m.PrenatalOverview,
      }))
    ),
    PrenatalFlowsheet: lazy(() =>
      import('./components/PrenatalFlowsheet').then(m => ({
        default: m.PrenatalFlowsheet,
      }))
    ),
    PrenatalVitals: lazy(() =>
      import('./components/PrenatalVitals').then(m => ({
        default: m.PrenatalVitals,
      }))
    ),
    ObGynFacesheet: lazy(() =>
      import('./components/ObGynFacesheet').then(m => ({
        default: m.ObGynFacesheet,
      }))
    ),
    // New components for enhanced clinical workflow
    EPDSCalculator: lazy(() =>
      import('./components/EPDSCalculator').then(m => ({
        default: m.EPDSCalculator,
      }))
    ),
    LaborDeliverySummary: lazy(() =>
      import('./components/LaborDeliverySummary').then(m => ({
        default: m.LaborDeliverySummary,
      }))
    ),
    PostpartumCarePanel: lazy(() =>
      import('./components/PostpartumCarePanel').then(m => ({
        default: m.PostpartumCarePanel,
      }))
    ),
    UltrasoundTrackingPanel: lazy(() =>
      import('./components/UltrasoundTrackingPanel').then(m => ({
        default: m.UltrasoundTrackingPanel,
      }))
    ),
  },

  /**
   * Episode lifecycle handlers
   */
  episodeHandlers: {
    onCreate: async (episodeId: string) => {
      console.log(`✅ OB/GYN episode created: ${episodeId}`);
      // Could trigger:
      // - Welcome email to patient
      // - Initial appointment scheduling
      // - Care team notification
    },

    onUpdate: async (episodeId: string) => {
      console.log(`📝 OB/GYN episode updated: ${episodeId}`);
      // Could trigger:
      // - Progress notifications
      // - Milestone tracking
      // - Care plan adjustments
    },

    onClose: async (episodeId: string) => {
      console.log(`✅ OB/GYN episode closed: ${episodeId}`);
      // Could trigger:
      // - Postpartum care scheduling
      // - Episode summary generation
      // - Quality metrics calculation
    },
  },
};
