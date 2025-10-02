// Border tokens for consistent healthcare interface styling

export const borderWidths = {
  0: '0px',
  1: '1px',
  2: '2px',
  4: '4px',
  8: '8px',
} as const;

export const borderRadius = {
  none: '0px',
  xs: '0.125rem',  // 2px
  sm: '0.25rem',   // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',  // Full rounded
} as const;

export const borderStyles = {
  solid: 'solid',
  dashed: 'dashed',
  dotted: 'dotted',
  double: 'double',
  none: 'none',
} as const;

// Border colors mapped to semantic meanings
export const borderColors = {
  // Neutral borders
  default: 'hsl(var(--border))',
  light: '#e2e8f0',
  medium: '#cbd5e1',
  dark: '#94a3b8',
  
  // Input and form borders
  input: 'hsl(var(--input))',
  inputFocus: 'hsl(var(--ring))',
  
  // State borders
  primary: 'hsl(var(--primary))',
  secondary: 'hsl(var(--secondary))',
  success: 'hsl(var(--success))',
  warning: 'hsl(var(--warning))',
  danger: 'hsl(var(--danger))',
  info: 'hsl(var(--info))',
  
  // Medical specific borders
  medical: {
    normal: '#10b981',    // Green for normal values
    warning: '#f59e0b',   // Amber for warnings
    critical: '#ef4444',  // Red for critical values
    inactive: '#94a3b8',  // Gray for inactive/disabled
  },
} as const;

// Semantic border combinations for healthcare components
export const semanticBorders = {
  // Card borders
  card: {
    width: borderWidths[1],
    style: borderStyles.solid,
    color: borderColors.light,
    radius: borderRadius.lg,
  },
  
  // Input borders
  input: {
    default: {
      width: borderWidths[1],
      style: borderStyles.solid,
      color: borderColors.input,
      radius: borderRadius.md,
    },
    focus: {
      width: borderWidths[2],
      style: borderStyles.solid,
      color: borderColors.inputFocus,
      radius: borderRadius.md,
    },
    error: {
      width: borderWidths[1],
      style: borderStyles.solid,
      color: borderColors.danger,
      radius: borderRadius.md,
    },
  },
  
  // Button borders
  button: {
    primary: {
      width: borderWidths[1],
      style: borderStyles.solid,
      color: 'transparent',
      radius: borderRadius.md,
    },
    secondary: {
      width: borderWidths[1],
      style: borderStyles.solid,
      color: borderColors.primary,
      radius: borderRadius.md,
    },
    outline: {
      width: borderWidths[1],
      style: borderStyles.solid,
      color: borderColors.medium,
      radius: borderRadius.md,
    },
  },
  
  // Medical component borders
  medical: {
    patientCard: {
      width: borderWidths[1],
      style: borderStyles.solid,
      color: borderColors.light,
      radius: borderRadius.lg,
    },
    vitalsNormal: {
      width: borderWidths[2],
      style: borderStyles.solid,
      color: borderColors.medical.normal,
      radius: borderRadius.md,
    },
    vitalsWarning: {
      width: borderWidths[2],
      style: borderStyles.solid,
      color: borderColors.medical.warning,
      radius: borderRadius.md,
    },
    vitalsCritical: {
      width: borderWidths[2],
      style: borderStyles.solid,
      color: borderColors.medical.critical,
      radius: borderRadius.md,
    },
    medicationCard: {
      width: borderWidths[1],
      style: borderStyles.solid,
      color: borderColors.light,
      radius: borderRadius.md,
    },
    alertCard: {
      width: borderWidths[2],
      style: borderStyles.solid,
      color: borderColors.warning,
      radius: borderRadius.lg,
    },
  },
  
  // Table borders
  table: {
    header: {
      width: borderWidths[1],
      style: borderStyles.solid,
      color: borderColors.medium,
      radius: borderRadius.none,
    },
    cell: {
      width: borderWidths[1],
      style: borderStyles.solid,
      color: borderColors.light,
      radius: borderRadius.none,
    },
    row: {
      width: borderWidths[1],
      style: borderStyles.solid,
      color: borderColors.light,
      radius: borderRadius.none,
    },
  },
  
  // Modal and overlay borders
  modal: {
    width: borderWidths[0],
    style: borderStyles.none,
    color: 'transparent',
    radius: borderRadius.xl,
  },
  
  // Divider borders
  divider: {
    horizontal: {
      width: borderWidths[1],
      style: borderStyles.solid,
      color: borderColors.light,
      radius: borderRadius.none,
    },
    vertical: {
      width: borderWidths[1],
      style: borderStyles.solid,
      color: borderColors.light,
      radius: borderRadius.none,
    },
  },
} as const;

export type BorderWidth = keyof typeof borderWidths;
export type BorderRadius = keyof typeof borderRadius;
export type BorderStyle = keyof typeof borderStyles;
export type BorderColor = keyof typeof borderColors;