/**
 * Color utility functions for theme management
 */

/**
 * Validates if a string is a valid 6-digit hex color
 * @param color - Color string to validate
 * @returns true if valid, false otherwise
 * @example
 * isValidHexColor('#4A90E2') // true
 * isValidHexColor('#FFF') // false (3-digit not supported)
 * isValidHexColor('blue') // false
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Converts hex color to rgba format
 * @param hex - 6-digit hex color (#RRGGBB)
 * @param alpha - Alpha channel value (0-1)
 * @returns rgba color string
 * @example
 * hexToRgba('#4A90E2', 0.5) // 'rgba(74, 144, 226, 0.5)'
 */
export function hexToRgba(hex: string, alpha: number): string {
  if (!isValidHexColor(hex)) {
    console.warn(`Invalid hex color: ${hex}, using fallback`);
    return `rgba(74, 144, 226, ${alpha})`; // Fallback to primary color
  }
  
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Validates an object containing theme color settings
 * @param colors - Object with color properties
 * @returns Validation result with errors if any
 */
export function validateThemeColors(colors: Record<string, string>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const colorFields = [
    'primaryColor',
    'secondaryColor',
    'sidebarBackgroundColor',
    'sidebarTextColor',
    'sidebarActiveColor',
    'accentColor'
  ];

  for (const field of colorFields) {
    if (colors[field] && !isValidHexColor(colors[field])) {
      errors.push(
        `Invalid color format for ${field}: "${colors[field]}". ` +
        `Use 6-digit hex format (#RRGGBB, e.g., #4A90E2). ` +
        `Note: 3-digit hex colors (#RGB) are not supported.`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Default theme colors
 */
export const DEFAULT_THEME = {
  primaryColor: '#4A90E2',
  secondaryColor: '#9B59B6',
  sidebarBackgroundColor: '#0F1E56',
  sidebarTextColor: '#B0B7D0',
  sidebarActiveColor: '#3342A5',
  accentColor: '#10B981',
  fontFamily: 'Inter, sans-serif',
  logoUrl: null,
  faviconUrl: null
} as const;
