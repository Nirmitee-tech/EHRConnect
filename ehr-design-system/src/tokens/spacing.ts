// Spacing tokens following 4px/8px base grid system
// Optimized for healthcare interfaces with touch-friendly sizing

export const spacing = {
  // Base spacing scale (4px increments)
  0: '0px',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  28: '7rem',      // 112px
  32: '8rem',      // 128px
  36: '9rem',      // 144px
  40: '10rem',     // 160px
  44: '11rem',     // 176px
  48: '12rem',     // 192px
  52: '13rem',     // 208px
  56: '14rem',     // 224px
  60: '15rem',     // 240px
  64: '16rem',     // 256px
  72: '18rem',     // 288px
  80: '20rem',     // 320px
  96: '24rem',     // 384px
} as const;

// Semantic spacing for healthcare components
export const semanticSpacing = {
  // Component internal spacing
  component: {
    xxs: spacing[1],    // 4px - Very tight
    xs: spacing[2],     // 8px - Tight
    sm: spacing[3],     // 12px - Small
    md: spacing[4],     // 16px - Medium (base)
    lg: spacing[6],     // 24px - Large
    xl: spacing[8],     // 32px - Extra large
    xxl: spacing[12],   // 48px - Very large
  },

  // Layout spacing
  layout: {
    xs: spacing[4],     // 16px - Minimal sections
    sm: spacing[6],     // 24px - Small sections
    md: spacing[8],     // 32px - Medium sections
    lg: spacing[12],    // 48px - Large sections
    xl: spacing[16],    // 64px - Extra large sections
    xxl: spacing[24],   // 96px - Major sections
  },

  // Touch targets (minimum 44px for accessibility)
  touch: {
    min: spacing[11],   // 44px - Minimum touch target
    comfortable: spacing[12], // 48px - Comfortable touch
    large: spacing[16], // 64px - Large touch target
  },

  // Healthcare specific
  medical: {
    vitals: spacing[6],     // 24px - Between vital signs
    formFields: spacing[4], // 16px - Between form fields
    cards: spacing[6],      // 24px - Between patient cards
    sections: spacing[8],   // 32px - Between major sections
    dashboard: spacing[6],  // 24px - Dashboard grid gaps
  },
} as const;

// Container sizes
export const containers = {
  xs: '20rem',    // 320px
  sm: '24rem',    // 384px
  md: '28rem',    // 448px
  lg: '32rem',    // 512px
  xl: '36rem',    // 576px
  '2xl': '42rem', // 672px
  '3xl': '48rem', // 768px
  '4xl': '56rem', // 896px
  '5xl': '64rem', // 1024px
  '6xl': '72rem', // 1152px
  '7xl': '80rem', // 1280px
  full: '100%',
  screen: '100vw',
} as const;

// Grid system
export const grid = {
  columns: 12,
  gutters: {
    xs: spacing[4],  // 16px
    sm: spacing[6],  // 24px
    md: spacing[8],  // 32px
    lg: spacing[12], // 48px
    xl: spacing[16], // 64px
  },
  margins: {
    xs: spacing[4],  // 16px
    sm: spacing[6],  // 24px
    md: spacing[8],  // 32px
    lg: spacing[12], // 48px
    xl: spacing[16], // 64px
  },
} as const;

export type SpacingToken = keyof typeof spacing;
export type SemanticSpacing = keyof typeof semanticSpacing;
export type ContainerSize = keyof typeof containers;