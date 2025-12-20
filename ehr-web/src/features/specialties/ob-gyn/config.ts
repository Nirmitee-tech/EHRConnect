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
    // Clinical workflow components
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
    ComplicationsPanel: lazy(() =>
      import('./components/ComplicationsPanel').then(m => ({
        default: m.ComplicationsPanel,
      }))
    ),
    BabyLinkagePanel: lazy(() =>
      import('./components/BabyLinkagePanel').then(m => ({
        default: m.BabyLinkagePanel,
      }))
    ),
    // Pre-pregnancy and history components
    PregnancyHistoryPanel: lazy(() =>
      import('./components/PregnancyHistoryPanel').then(m => ({
        default: m.PregnancyHistoryPanel,
      }))
    ),
    // Screening and monitoring components
    GeneticScreeningPanel: lazy(() =>
      import('./components/GeneticScreeningPanel').then(m => ({
        default: m.GeneticScreeningPanel,
      }))
    ),
    LabsTrackingPanel: lazy(() =>
      import('./components/LabsTrackingPanel').then(m => ({
        default: m.LabsTrackingPanel,
      }))
    ),
    FetalMovementCounter: lazy(() =>
      import('./components/FetalMovementCounter').then(m => ({
        default: m.FetalMovementCounter,
      }))
    ),
    // Planning and timeline components
    BirthPlanPanel: lazy(() =>
      import('./components/BirthPlanPanel').then(m => ({
        default: m.BirthPlanPanel,
      }))
    ),
    PregnancyTimelinePanel: lazy(() =>
      import('./components/PregnancyTimelinePanel').then(m => ({
        default: m.PregnancyTimelinePanel,
      }))
    ),
    // Advanced clinical monitoring components
    VitalsLogPanel: lazy(() =>
      import('./components/VitalsLogPanel').then(m => ({
        default: m.VitalsLogPanel,
      }))
    ),
    NSTBPPPanel: lazy(() =>
      import('./components/NSTBPPPanel').then(m => ({
        default: m.NSTBPPPanel,
      }))
    ),
    RiskAssessmentPanel: lazy(() =>
      import('./components/RiskAssessmentPanel').then(m => ({
        default: m.RiskAssessmentPanel,
      }))
    ),
    MedicationReviewPanel: lazy(() =>
      import('./components/MedicationReviewPanel').then(m => ({
        default: m.MedicationReviewPanel,
      }))
    ),
    ConsentManagementPanel: lazy(() =>
      import('./components/ConsentManagementPanel').then(m => ({
        default: m.ConsentManagementPanel,
      }))
    ),
    // IVF/Fertility components
    IVFCaseSheet: lazy(() =>
      import('./components/IVFCaseSheet').then(m => ({
        default: m.IVFCaseSheet,
      }))
    ),
    // Preterm risk monitoring
    CervicalLengthPanel: lazy(() =>
      import('./components/CervicalLengthPanel').then(m => ({
        default: m.CervicalLengthPanel,
      }))
    ),
    // Patient education tracking
    PatientEducationPanel: lazy(() =>
      import('./components/PatientEducationPanel').then(m => ({
        default: m.PatientEducationPanel,
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
