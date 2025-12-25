/**
 * useAutoContrast Hook
 * Intelligently calculates optimal text color based on background color
 * Gives developers full control over when to apply auto-contrast
 */

import { useMemo } from 'react';
import { getOptimalTextColor, getContrastRatio } from '@/lib/utils';

interface AutoContrastOptions {
  /**
   * Background color to calculate contrast against
   */
  backgroundColor: string;

  /**
   * Fallback text color if calculation fails
   * @default '#000000'
   */
  fallbackColor?: string;

  /**
   * Disable auto-contrast calculation
   * @default false
   */
  disabled?: boolean;

  /**
   * Minimum contrast ratio to enforce
   * @default 4.5 (WCAG AA for normal text)
   */
  minContrastRatio?: number;

  /**
   * Force specific text color (bypasses calculation)
   */
  forceColor?: string;
}

export interface AutoContrastResult {
  /**
   * Calculated optimal text color
   */
  textColor: string;

  /**
   * Contrast ratio between text and background
   */
  contrastRatio: number;

  /**
   * Whether the contrast meets WCAG AA standards
   */
  isAccessible: boolean;

  /**
   * CSS style object ready to spread into elements
   */
  style: {
    color: string;
  };

  /**
   * Data attribute to add to element
   */
  dataAttribute: {
    'data-auto-contrast': string;
  };
}

/**
 * Calculate optimal text color for a given background
 *
 * @example
 * ```tsx
 * const MyCard = ({ bgColor }) => {
 *   const { style, isAccessible } = useAutoContrast({
 *     backgroundColor: bgColor
 *   });
 *
 *   return (
 *     <div style={{ backgroundColor: bgColor, ...style }}>
 *       Text with perfect contrast!
 *     </div>
 *   );
 * };
 * ```
 *
 * @example
 * ```tsx
 * // Disable auto-contrast for specific elements
 * const MyColoredCard = ({ bgColor }) => {
 *   const { style } = useAutoContrast({
 *     backgroundColor: bgColor,
 *     disabled: true,  // Keep original colors
 *     forceColor: '#FFFFFF'
 *   });
 *
 *   return <div style={{ backgroundColor: bgColor, ...style }}>...</div>;
 * };
 * ```
 */
export function useAutoContrast(options: AutoContrastOptions): AutoContrastResult {
  const {
    backgroundColor,
    fallbackColor = '#000000',
    disabled = false,
    minContrastRatio = 4.5,
    forceColor,
  } = options;

  const result = useMemo(() => {
    // If disabled, use force color or fallback
    if (disabled) {
      const color = forceColor || fallbackColor;
      return {
        textColor: color,
        contrastRatio: getContrastRatio(color, backgroundColor),
        isAccessible: false,
        style: { color },
        dataAttribute: { 'data-auto-contrast': 'false' },
      };
    }

    // If force color is specified, use it
    if (forceColor) {
      const ratio = getContrastRatio(forceColor, backgroundColor);
      return {
        textColor: forceColor,
        contrastRatio: ratio,
        isAccessible: ratio >= minContrastRatio,
        style: { color: forceColor },
        dataAttribute: { 'data-auto-contrast': 'forced' },
      };
    }

    // Calculate optimal text color
    try {
      const optimalColor = getOptimalTextColor(backgroundColor);
      const ratio = getContrastRatio(optimalColor, backgroundColor);

      return {
        textColor: optimalColor,
        contrastRatio: ratio,
        isAccessible: ratio >= minContrastRatio,
        style: { color: optimalColor },
        dataAttribute: { 'data-auto-contrast': 'true' },
      };
    } catch (error) {
      console.warn('Auto-contrast calculation failed:', error);
      return {
        textColor: fallbackColor,
        contrastRatio: 1,
        isAccessible: false,
        style: { color: fallbackColor },
        dataAttribute: { 'data-auto-contrast': 'error' },
      };
    }
  }, [backgroundColor, fallbackColor, disabled, minContrastRatio, forceColor]);

  return result;
}

/**
 * Get optimal text color without using React hooks (for utility use)
 */
export function getAutoContrastColor(
  backgroundColor: string,
  options: Omit<AutoContrastOptions, 'backgroundColor'> = {}
): string {
  const { fallbackColor = '#000000', disabled = false, forceColor } = options;

  if (disabled || forceColor) {
    return forceColor || fallbackColor;
  }

  try {
    return getOptimalTextColor(backgroundColor);
  } catch {
    return fallbackColor;
  }
}
