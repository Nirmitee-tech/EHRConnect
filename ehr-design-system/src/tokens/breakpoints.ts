// Breakpoints for responsive healthcare interfaces
// Optimized for tablets, desktop workstations, and mobile devices

export const breakpoints = {
  xs: '320px',    // Mobile phones (small)
  sm: '640px',    // Mobile phones (large) / Small tablets
  md: '768px',    // Tablets
  lg: '1024px',   // Small desktop / Large tablets
  xl: '1280px',   // Desktop workstations
  '2xl': '1536px', // Large desktop workstations
  '3xl': '1920px', // Ultra-wide displays
  '4xl': '2560px', // 4K displays
} as const;

// Media query helpers
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
  '3xl': `@media (min-width: ${breakpoints['3xl']})`,
  '4xl': `@media (min-width: ${breakpoints['4xl']})`,
  
  // Max-width queries
  'max-xs': `@media (max-width: ${parseInt(breakpoints.sm) - 1}px)`,
  'max-sm': `@media (max-width: ${parseInt(breakpoints.md) - 1}px)`,
  'max-md': `@media (max-width: ${parseInt(breakpoints.lg) - 1}px)`,
  'max-lg': `@media (max-width: ${parseInt(breakpoints.xl) - 1}px)`,
  'max-xl': `@media (max-width: ${parseInt(breakpoints['2xl']) - 1}px)`,
  'max-2xl': `@media (max-width: ${parseInt(breakpoints['3xl']) - 1}px)`,
  
  // Range queries
  'sm-md': `@media (min-width: ${breakpoints.sm}) and (max-width: ${parseInt(breakpoints.lg) - 1}px)`,
  'md-lg': `@media (min-width: ${breakpoints.md}) and (max-width: ${parseInt(breakpoints.xl) - 1}px)`,
  'lg-xl': `@media (min-width: ${breakpoints.lg}) and (max-width: ${parseInt(breakpoints['2xl']) - 1}px)`,
  
  // Device-specific
  mobile: `@media (max-width: ${parseInt(breakpoints.md) - 1}px)`,
  tablet: `@media (min-width: ${breakpoints.md}) and (max-width: ${parseInt(breakpoints.xl) - 1}px)`,
  desktop: `@media (min-width: ${breakpoints.xl})`,
  
  // Orientation
  portrait: '@media (orientation: portrait)',
  landscape: '@media (orientation: landscape)',
  
  // High DPI displays
  retina: '@media (-webkit-min-device-pixel-ratio: 2), @media (min-resolution: 192dpi)',
} as const;

// Container max-widths for each breakpoint
export const containerSizes = {
  xs: '100%',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Healthcare-specific breakpoints for different use cases
export const healthcareBreakpoints = {
  // Medical tablet (common in hospitals)
  medicalTablet: '768px',
  
  // Workstation monitors (common in clinical settings)
  workstation: '1440px',
  
  // Large displays (for dashboards/monitoring)
  dashboard: '1920px',
  
  // Mobile EMR access
  mobileEMR: '375px',
  
  // Kiosk displays
  kiosk: '1080px',
} as const;

export type Breakpoint = keyof typeof breakpoints;
export type MediaQuery = keyof typeof mediaQueries;