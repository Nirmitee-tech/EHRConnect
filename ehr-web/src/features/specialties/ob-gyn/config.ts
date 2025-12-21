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

  /**
   * Navigation Configuration
   * Defines the sidebar menu structure for the OB/GYN specialty
   */
  navigation: {
    sections: [
      // Overview
      {
        id: 'obgyn-overview',
        label: 'Prenatal Overview',
        icon: 'LayoutDashboard',
        category: 'clinical',
        componentName: 'PrenatalOverview',
        order: 10,
      },
      {
        id: 'obgyn-timeline',
        label: 'Pregnancy Timeline',
        icon: 'CalendarClock',
        category: 'clinical',
        componentName: 'PregnancyTimelinePanel',
        order: 15,
      },

      // Clinical Assessments & Monitoring
      {
        id: 'obgyn-flowsheet',
        label: 'Prenatal Flowsheet',
        icon: 'Table2',
        category: 'clinical',
        componentName: 'PrenatalFlowsheet',
        order: 20,
      },
      {
        id: 'obgyn-vitals',
        label: 'Vitals & Weight',
        icon: 'Activity',
        category: 'clinical',
        componentName: 'VitalsLogPanel',
        order: 25,
      },
      {
        id: 'obgyn-risks',
        label: 'Risk Assessment',
        icon: 'AlertTriangle',
        category: 'clinical',
        componentName: 'RiskAssessmentPanel',
        badge: 'Critical',
        order: 30,
      },
      {
        id: 'obgyn-meds',
        label: 'Medications',
        icon: 'Pill',
        category: 'clinical',
        componentName: 'MedicationReviewPanel',
        order: 35,
      },

      // Fetal Monitoring
      {
        id: 'obgyn-fetal-movement',
        label: 'Kick Counts',
        icon: 'Footprints',
        category: 'clinical',
        componentName: 'FetalMovementCounter',
        order: 40,
      },
      {
        id: 'obgyn-nst',
        label: 'NST & BPP',
        icon: 'ActivitySquare',
        category: 'clinical',
        componentName: 'NSTBPPPanel',
        order: 45,
      },
      {
        id: 'obgyn-ultrasound',
        label: 'Ultrasound Tracking',
        icon: 'Scan',
        category: 'clinical',
        componentName: 'UltrasoundTrackingPanel',
        order: 50,
      },
      {
        id: 'obgyn-cervical',
        label: 'Cervical Length',
        icon: 'Ruler',
        category: 'clinical',
        componentName: 'CervicalLengthPanel', // Assuming this component exists based on commits
        order: 55,
      },

      // Labs & Genetics
      {
        id: 'obgyn-labs',
        label: 'Labs Tracking',
        icon: 'TestTube2',
        category: 'clinical',
        componentName: 'LabsTrackingPanel',
        order: 60,
      },
      {
        id: 'obgyn-genetics',
        label: 'Genetic Screening',
        icon: 'Dna',
        category: 'clinical',
        componentName: 'GeneticScreeningPanel',
        order: 65,
      },

      // Case Management
      {
        id: 'obgyn-history',
        label: 'Pregnancy History',
        icon: 'History',
        category: 'clinical',
        componentName: 'PregnancyHistoryPanel',
        order: 70,
      },
      {
        id: 'obgyn-ivf',
        label: 'IVF Case Sheet',
        icon: 'Microscope',
        category: 'clinical',
        componentName: 'IVFCaseSheet',
        order: 75,
      },
      {
        id: 'obgyn-complications',
        label: 'Complications',
        icon: 'AlertOctagon',
        category: 'clinical',
        componentName: 'ComplicationsPanel',
        order: 80,
      },
      {
        id: 'obgyn-birth-plan',
        label: 'Birth Plan',
        icon: 'ScrollText',
        category: 'clinical',
        componentName: 'BirthPlanPanel',
        order: 85,
      },

      // Labor, Delivery & Postpartum
      {
        id: 'obgyn-labor',
        label: 'Labor & Delivery',
        icon: 'Baby',
        category: 'clinical',
        componentName: 'LaborDeliverySummary',
        order: 90,
      },
      {
        id: 'obgyn-baby',
        label: 'Baby Linkage',
        icon: 'Link',
        category: 'administrative',
        componentName: 'BabyLinkagePanel',
        order: 95,
      },
      {
        id: 'obgyn-postpartum',
        label: 'Postpartum Care',
        icon: 'HeartHandshake',
        category: 'clinical',
        componentName: 'PostpartumCarePanel',
        order: 100,
      },

      // Education & Admin
      {
        id: 'obgyn-consent',
        label: 'Consents',
        icon: 'FileSignature',
        category: 'administrative',
        componentName: 'ConsentManagementPanel',
        order: 105,
      },
      {
        id: 'obgyn-education',
        label: 'Patient Education',
        icon: 'BookOpen',
        category: 'clinical',
        componentName: 'PatientEducationPanel',
        order: 110,
      },
      {
        id: 'obgyn-epds',
        label: 'EPDS Screening',
        icon: 'BrainCircuit',
        category: 'clinical',
        componentName: 'EPDSCalculator',
        order: 115,
      },
    ],
  },
};
