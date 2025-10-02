// Shadow tokens for depth and elevation in healthcare interfaces
// Designed to create clear visual hierarchy without overwhelming clinical data

export const shadows = {
  // Base shadow scale
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Inner shadows
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  innerMd: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
  innerLg: 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.1)',
} as const;

// Colored shadows for different UI states
export const coloredShadows = {
  // Primary brand shadows
  primary: {
    sm: '0 1px 3px 0 rgba(102, 126, 234, 0.1), 0 1px 2px -1px rgba(102, 126, 234, 0.1)',
    md: '0 4px 6px -1px rgba(102, 126, 234, 0.15), 0 2px 4px -2px rgba(102, 126, 234, 0.15)',
    lg: '0 10px 15px -3px rgba(102, 126, 234, 0.2), 0 4px 6px -4px rgba(102, 126, 234, 0.1)',
    xl: '0 20px 25px -5px rgba(102, 126, 234, 0.25), 0 8px 10px -6px rgba(102, 126, 234, 0.1)',
  },

  // Success shadows (for positive medical indicators)
  success: {
    sm: '0 1px 3px 0 rgba(16, 185, 129, 0.1), 0 1px 2px -1px rgba(16, 185, 129, 0.1)',
    md: '0 4px 6px -1px rgba(16, 185, 129, 0.15), 0 2px 4px -2px rgba(16, 185, 129, 0.15)',
    lg: '0 10px 15px -3px rgba(16, 185, 129, 0.2), 0 4px 6px -4px rgba(16, 185, 129, 0.1)',
  },

  // Warning shadows (for attention-needed items)
  warning: {
    sm: '0 1px 3px 0 rgba(245, 158, 11, 0.1), 0 1px 2px -1px rgba(245, 158, 11, 0.1)',
    md: '0 4px 6px -1px rgba(245, 158, 11, 0.15), 0 2px 4px -2px rgba(245, 158, 11, 0.15)',
    lg: '0 10px 15px -3px rgba(245, 158, 11, 0.2), 0 4px 6px -4px rgba(245, 158, 11, 0.1)',
  },

  // Danger shadows (for critical medical alerts)
  danger: {
    sm: '0 1px 3px 0 rgba(239, 68, 68, 0.1), 0 1px 2px -1px rgba(239, 68, 68, 0.1)',
    md: '0 4px 6px -1px rgba(239, 68, 68, 0.15), 0 2px 4px -2px rgba(239, 68, 68, 0.15)',
    lg: '0 10px 15px -3px rgba(239, 68, 68, 0.2), 0 4px 6px -4px rgba(239, 68, 68, 0.1)',
  },

  // Info shadows (for informational content)
  info: {
    sm: '0 1px 3px 0 rgba(59, 130, 246, 0.1), 0 1px 2px -1px rgba(59, 130, 246, 0.1)',
    md: '0 4px 6px -1px rgba(59, 130, 246, 0.15), 0 2px 4px -2px rgba(59, 130, 246, 0.15)',
    lg: '0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -4px rgba(59, 130, 246, 0.1)',
  },
} as const;

// Elevation system for z-index management
export const elevation = {
  // Base layer (page content)
  base: 0,
  
  // Slight elevation (cards, panels)
  raised: 1,
  
  // Floating elements (dropdowns, tooltips)
  floating: 10,
  
  // Overlays (modals, drawers)
  overlay: 100,
  
  // Sticky elements (headers, navigation)
  sticky: 200,
  
  // Critical alerts and notifications
  notification: 300,
  
  // Maximum elevation (loading spinners, emergency alerts)
  maximum: 999,
} as const;

// Semantic shadows for healthcare components
export const medicalShadows = {
  // Patient card shadows
  patientCard: shadows.sm,
  patientCardHover: shadows.md,
  patientCardSelected: coloredShadows.primary.md,
  
  // Vital signs displays
  vitalsNormal: shadows.xs,
  vitalsWarning: coloredShadows.warning.sm,
  vitalsCritical: coloredShadows.danger.md,
  
  // Medical form elements
  formField: shadows.xs,
  formFieldFocus: coloredShadows.primary.sm,
  formFieldError: coloredShadows.danger.sm,
  
  // Dashboard components
  dashboardCard: shadows.sm,
  dashboardCardHover: shadows.md,
  
  // Medication displays
  medicationItem: shadows.xs,
  medicationAlert: coloredShadows.warning.md,
  medicationCritical: coloredShadows.danger.lg,
  
  // Modal and overlay shadows
  modal: shadows['2xl'],
  drawer: shadows.xl,
  dropdown: shadows.lg,
  tooltip: shadows.md,
} as const;

export type Shadow = keyof typeof shadows;
export type ColoredShadow = keyof typeof coloredShadows;
export type Elevation = keyof typeof elevation;