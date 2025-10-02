// Typography tokens based on Atlassian Design System principles
// Optimized for healthcare readability and accessibility

export const fontFamilies = {
  sans: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
  mono: [
    'Fira Code',
    'Monaco',
    'Cascadia Code',
    'Consolas',
    'Liberation Mono',
    'monospace',
  ],
  display: [
    'Cal Sans',
    'Inter',
    'system-ui',
    'sans-serif',
  ],
} as const;

export const fontWeights = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const fontSizes = {
  // Body text sizes
  xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
  sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
  base: ['1rem', { lineHeight: '1.5rem' }],     // 16px (primary reading)
  lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
  xl: ['1.25rem', { lineHeight: '1.875rem' }],  // 20px
  
  // Heading sizes (following Atlassian scale)
  '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px - Medium headings
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px - Large headings
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px - XL headings
  '5xl': ['3rem', { lineHeight: '1' }],         // 48px - Display
  '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px - Hero display
  '7xl': ['4.5rem', { lineHeight: '1' }],       // 72px - Large hero
  '8xl': ['6rem', { lineHeight: '1' }],         // 96px - Extra large hero
  '9xl': ['8rem', { lineHeight: '1' }],         // 128px - Massive display
  
  // Medical specific sizes
  vitals: ['1.5rem', { lineHeight: '1.25' }],   // Large, easy-read vitals
  dosage: ['0.875rem', { lineHeight: '1.25rem' }], // Small but readable dosages
  labels: ['0.75rem', { lineHeight: '1rem' }],  // Form labels
} as const;

export const lineHeights = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

// Typography scale following Atlassian patterns
export const typography = {
  // Headings
  heading: {
    xxl: {
      fontSize: '2.1875rem', // 35px
      lineHeight: '2.5rem',  // 40px
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.tight,
    },
    xl: {
      fontSize: '1.8125rem', // 29px
      lineHeight: '2rem',    // 32px
      fontWeight: fontWeights.semibold,
      letterSpacing: letterSpacing.tight,
    },
    large: {
      fontSize: '1.5rem',    // 24px
      lineHeight: '1.75rem', // 28px
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.normal,
    },
    medium: {
      fontSize: '1.25rem',   // 20px
      lineHeight: '1.5rem',  // 24px
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.normal,
    },
    small: {
      fontSize: '1rem',      // 16px
      lineHeight: '1.25rem', // 20px
      fontWeight: fontWeights.semibold,
      letterSpacing: letterSpacing.normal,
    },
    xs: {
      fontSize: '0.875rem',  // 14px
      lineHeight: '1rem',    // 16px
      fontWeight: fontWeights.semibold,
      letterSpacing: letterSpacing.normal,
    },
    xxs: {
      fontSize: '0.75rem',   // 12px
      lineHeight: '1rem',    // 16px
      fontWeight: fontWeights.semibold,
      letterSpacing: letterSpacing.wide,
    },
  },

  // Body text
  body: {
    large: {
      fontSize: '1rem',      // 16px
      lineHeight: '1.5rem',  // 24px
      fontWeight: fontWeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    medium: {
      fontSize: '1rem',      // 16px
      lineHeight: '1.5rem',  // 24px
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.normal,
    },
    bold: {
      fontSize: '1rem',      // 16px
      lineHeight: '1.5rem',  // 24px
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacing.normal,
    },
    default: {
      fontSize: '0.875rem',  // 14px
      lineHeight: '1.25rem', // 20px
      fontWeight: fontWeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    defaultMedium: {
      fontSize: '0.875rem',  // 14px
      lineHeight: '1.25rem', // 20px
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.normal,
    },
    defaultBold: {
      fontSize: '0.875rem',  // 14px
      lineHeight: '1.25rem', // 20px
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacing.normal,
    },
    small: {
      fontSize: '0.75rem',   // 12px
      lineHeight: '1rem',    // 16px
      fontWeight: fontWeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    smallMedium: {
      fontSize: '0.75rem',   // 12px
      lineHeight: '1rem',    // 16px
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.normal,
    },
    smallBold: {
      fontSize: '0.75rem',   // 12px
      lineHeight: '1rem',    // 16px
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacing.normal,
    },
  },

  // Medical/Healthcare specific
  medical: {
    vital: {
      fontSize: '1.5rem',    // 24px
      lineHeight: '1.75rem', // 28px
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacing.normal,
    },
    vitalLabel: {
      fontSize: '0.75rem',   // 12px
      lineHeight: '1rem',    // 16px
      fontWeight: fontWeights.medium,
      letterSpacing: letterSpacing.wide,
    },
    dosage: {
      fontSize: '0.875rem',  // 14px
      lineHeight: '1.25rem', // 20px
      fontWeight: fontWeights.semibold,
      letterSpacing: letterSpacing.normal,
    },
    patientId: {
      fontSize: '1rem',      // 16px
      lineHeight: '1.5rem',  // 24px
      fontWeight: fontWeights.bold,
      letterSpacing: letterSpacing.wider,
    },
  },

  // Code/Technical
  code: {
    fontSize: '0.875rem',    // 14px
    lineHeight: '1.25rem',   // 20px
    fontFamily: fontFamilies.mono,
    fontWeight: fontWeights.normal,
    letterSpacing: letterSpacing.normal,
  },
} as const;

export type TypographyToken = keyof typeof typography;
export type HeadingSize = keyof typeof typography.heading;
export type BodySize = keyof typeof typography.body;