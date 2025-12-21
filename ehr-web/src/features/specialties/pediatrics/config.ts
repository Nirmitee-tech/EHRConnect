/**
 * Pediatrics Specialty Configuration
 * Defines the Pediatrics & Child Health specialty module
 */

import { lazy } from 'react';
import { SpecialtyModule } from '../shared/types';

/**
 * Pediatrics Specialty Module
 * Complete configuration for pediatric care (0-18 years)
 */
export const PediatricsSpecialty: SpecialtyModule = {
  slug: 'pediatrics',
  name: 'Pediatrics & Child Health',
  icon: 'Baby',
  color: '#10B981',

  /**
   * Lazy-loaded components
   * These are loaded on-demand when the user accesses pediatric sections
   */
  components: {
    PediatricOverview: lazy(() =>
      import('./components/PediatricOverview').then(m => ({
        default: m.PediatricOverview,
      }))
    ),
    GrowthChart: lazy(() =>
      import('./components/GrowthChart').then(m => ({
        default: m.GrowthChart,
      }))
    ),
    VitalSignsPanel: lazy(() =>
      import('./components/VitalSignsPanel').then(m => ({
        default: m.VitalSignsPanel,
      }))
    ),
    WellVisitPanel: lazy(() =>
      import('./components/WellVisitPanel').then(m => ({
        default: m.WellVisitPanel,
      }))
    ),
    ImmunizationPanel: lazy(() =>
      import('./components/ImmunizationPanel').then(m => ({
        default: m.ImmunizationPanel,
      }))
    ),
    DevelopmentalScreening: lazy(() =>
      import('./components/DevelopmentalScreening').then(m => ({
        default: m.DevelopmentalScreening,
      }))
    ),
    NewbornScreeningPanel: lazy(() =>
      import('./components/NewbornScreeningPanel').then(m => ({
        default: m.NewbornScreeningPanel,
      }))
    ),
    HEADSSAssessment: lazy(() =>
      import('./components/HEADSSAssessment').then(m => ({
        default: m.HEADSSAssessment,
      }))
    ),
    NutritionPanel: lazy(() =>
      import('./components/NutritionPanel').then(m => ({
        default: m.NutritionPanel,
      }))
    ),
    LeadScreeningPanel: lazy(() =>
      import('./components/LeadScreeningPanel').then(m => ({
        default: m.LeadScreeningPanel,
      }))
    ),
    TBScreeningPanel: lazy(() =>
      import('./components/TBScreeningPanel').then(m => ({
        default: m.TBScreeningPanel,
      }))
    ),
    AutismScreeningPanel: lazy(() =>
      import('./components/AutismScreeningPanel').then(m => ({
        default: m.AutismScreeningPanel,
      }))
    ),
    BehavioralAssessmentPanel: lazy(() =>
      import('./components/BehavioralAssessmentPanel').then(m => ({
        default: m.BehavioralAssessmentPanel,
      }))
    ),
    MentalHealthPanel: lazy(() =>
      import('./components/MentalHealthPanel').then(m => ({
        default: m.MentalHealthPanel,
      }))
    ),
    SubstanceUsePanel: lazy(() =>
      import('./components/SubstanceUsePanel').then(m => ({
        default: m.SubstanceUsePanel,
      }))
    ),
    SexualHealthPanel: lazy(() =>
      import('./components/SexualHealthPanel').then(m => ({
        default: m.SexualHealthPanel,
      }))
    ),
    InjuryPreventionPanel: lazy(() =>
      import('./components/InjuryPreventionPanel').then(m => ({
        default: m.InjuryPreventionPanel,
      }))
    ),
    VisionScreeningPanel: lazy(() =>
      import('./components/VisionScreeningPanel').then(m => ({
        default: m.VisionScreeningPanel,
      }))
    ),
    HearingScreeningPanel: lazy(() =>
      import('./components/HearingScreeningPanel').then(m => ({
        default: m.HearingScreeningPanel,
      }))
    ),
    PediatricMedicationsPanel: lazy(() =>
      import('./components/PediatricMedicationsPanel').then(m => ({
        default: m.PediatricMedicationsPanel,
      }))
    ),
    AllergiesPanel: lazy(() =>
      import('./components/AllergiesPanel').then(m => ({
        default: m.AllergiesPanel,
      }))
    ),
    MedicalHistoryPanel: lazy(() =>
      import('./components/MedicalHistoryPanel').then(m => ({
        default: m.MedicalHistoryPanel,
      }))
    ),
    FamilyHistoryPanel: lazy(() =>
      import('./components/FamilyHistoryPanel').then(m => ({
        default: m.FamilyHistoryPanel,
      }))
    ),
    SocialDeterminantsPanel: lazy(() =>
      import('./components/SocialDeterminantsPanel').then(m => ({
        default: m.SocialDeterminantsPanel,
      }))
    ),
    SportsPhysicalPanel: lazy(() =>
      import('./components/SportsPhysicalPanel').then(m => ({
        default: m.SportsPhysicalPanel,
      }))
    ),
    CareCoordinationPanel: lazy(() =>
      import('./components/CareCoordinationPanel').then(m => ({
        default: m.CareCoordinationPanel,
      }))
    ),
  },

  /**
   * Episode lifecycle handlers
   */
  episodeHandlers: {
    onCreate: async (episodeId: string) => {
      console.log(`✅ Pediatrics episode created: ${episodeId}`);
    },

    onUpdate: async (episodeId: string) => {
      console.log(`📝 Pediatrics episode updated: ${episodeId}`);
    },

    onClose: async (episodeId: string) => {
      console.log(`✅ Pediatrics episode closed: ${episodeId}`);
    },
  },

  /**
   * Navigation Configuration
   * Defines the sidebar menu structure for the Pediatrics specialty
   */
  navigation: {
    sections: [
      // Overview & Growth
      {
        id: 'pediatric-overview',
        label: 'Pediatric Overview',
        icon: 'LayoutDashboard',
        category: 'clinical',
        componentName: 'PediatricOverview',
        order: 10,
      },
      {
        id: 'growth-chart',
        label: 'Growth Chart',
        icon: 'TrendingUp',
        category: 'clinical',
        componentName: 'GrowthChart',
        order: 15,
      },
      {
        id: 'vitals',
        label: 'Vital Signs',
        icon: 'Activity',
        category: 'clinical',
        componentName: 'VitalSignsPanel',
        order: 20,
      },

      // Well-Child Care & Immunizations
      {
        id: 'well-visits',
        label: 'Well-Child Visits',
        icon: 'Calendar',
        category: 'clinical',
        componentName: 'WellVisitPanel',
        order: 25,
      },
      {
        id: 'immunizations',
        label: 'Immunizations',
        icon: 'Syringe',
        category: 'clinical',
        componentName: 'ImmunizationPanel',
        badge: 'Important',
        order: 30,
      },

      // Developmental & Behavioral
      {
        id: 'developmental-screening',
        label: 'Developmental Screening',
        icon: 'Brain',
        category: 'clinical',
        componentName: 'DevelopmentalScreening',
        order: 35,
      },
      {
        id: 'behavioral-assessment',
        label: 'Behavioral Assessment',
        icon: 'MessageSquare',
        category: 'clinical',
        componentName: 'BehavioralAssessmentPanel',
        order: 40,
      },

      // Newborn & Infant Care
      {
        id: 'newborn-screening',
        label: 'Newborn Screening',
        icon: 'Baby',
        category: 'clinical',
        componentName: 'NewbornScreeningPanel',
        order: 45,
      },
      {
        id: 'nutrition',
        label: 'Nutrition',
        icon: 'Utensils',
        category: 'clinical',
        componentName: 'NutritionPanel',
        order: 50,
      },

      // Adolescent Care
      {
        id: 'headss-assessment',
        label: 'HEADSS Assessment',
        icon: 'UserCheck',
        category: 'clinical',
        componentName: 'HEADSSAssessment',
        order: 55,
      },
      {
        id: 'mental-health',
        label: 'Mental Health',
        icon: 'Heart',
        category: 'clinical',
        componentName: 'MentalHealthPanel',
        order: 60,
      },
      {
        id: 'substance-use',
        label: 'Substance Use',
        icon: 'AlertTriangle',
        category: 'clinical',
        componentName: 'SubstanceUsePanel',
        order: 65,
      },
      {
        id: 'sexual-health',
        label: 'Sexual Health',
        icon: 'Shield',
        category: 'clinical',
        componentName: 'SexualHealthPanel',
        order: 70,
      },

      // Screening & Prevention
      {
        id: 'autism-screening',
        label: 'Autism Screening',
        icon: 'ScanFace',
        category: 'clinical',
        componentName: 'AutismScreeningPanel',
        order: 75,
      },
      {
        id: 'lead-screening',
        label: 'Lead Screening',
        icon: 'TestTube',
        category: 'clinical',
        componentName: 'LeadScreeningPanel',
        order: 80,
      },
      {
        id: 'tb-screening',
        label: 'TB Risk Assessment',
        icon: 'Stethoscope',
        category: 'clinical',
        componentName: 'TBScreeningPanel',
        order: 85,
      },
      {
        id: 'injury-prevention',
        label: 'Injury Prevention',
        icon: 'ShieldCheck',
        category: 'clinical',
        componentName: 'InjuryPreventionPanel',
        order: 90,
      },
      {
        id: 'vision-screening',
        label: 'Vision Screening',
        icon: 'Eye',
        category: 'clinical',
        componentName: 'VisionScreeningPanel',
        order: 95,
      },
      {
        id: 'hearing-screening',
        label: 'Hearing Screening',
        icon: 'Ear',
        category: 'clinical',
        componentName: 'HearingScreeningPanel',
        order: 100,
      },

      // Medications & History
      {
        id: 'medications',
        label: 'Medications',
        icon: 'Pill',
        category: 'clinical',
        componentName: 'PediatricMedicationsPanel',
        order: 105,
      },
      {
        id: 'allergies',
        label: 'Allergies',
        icon: 'AlertCircle',
        category: 'clinical',
        componentName: 'AllergiesPanel',
        order: 110,
      },
      {
        id: 'medical-history',
        label: 'Medical History',
        icon: 'History',
        category: 'clinical',
        componentName: 'MedicalHistoryPanel',
        order: 115,
      },
      {
        id: 'family-history',
        label: 'Family History',
        icon: 'Users',
        category: 'clinical',
        componentName: 'FamilyHistoryPanel',
        order: 120,
      },

      // Additional Services
      {
        id: 'social-determinants',
        label: 'Social Determinants',
        icon: 'Home',
        category: 'clinical',
        componentName: 'SocialDeterminantsPanel',
        order: 125,
      },
      {
        id: 'sports-physical',
        label: 'Sports Physical',
        icon: 'Dumbbell',
        category: 'clinical',
        componentName: 'SportsPhysicalPanel',
        order: 130,
      },
      {
        id: 'care-coordination',
        label: 'Care Coordination',
        icon: 'Network',
        category: 'clinical',
        componentName: 'CareCoordinationPanel',
        order: 135,
      },
    ],
  },
};
