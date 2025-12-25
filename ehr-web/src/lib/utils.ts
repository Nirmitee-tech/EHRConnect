import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculate relative luminance using WCAG formula
 * Returns value between 0 (darkest) and 1 (lightest)
 */
export function getRelativeLuminance(hexcolor: string): number {
  if (!hexcolor) return 0;

  const hex = hexcolor.replace("#", "");
  let r, g, b;

  if (hex.length === 3) {
    r = parseInt(hex.substring(0, 1).repeat(2), 16);
    g = parseInt(hex.substring(1, 2).repeat(2), 16);
    b = parseInt(hex.substring(2, 3).repeat(2), 16);
  } else {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }

  // Convert to sRGB
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  // Apply gamma correction
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate WCAG contrast ratio between two colors
 * Returns ratio between 1 (no contrast) and 21 (maximum contrast)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards (4.5:1 for normal text)
 */
export function hasGoodContrast(foreground: string, background: string, largeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return largeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Returns either 'white' or 'black' based on the contrast requirement of the input hex color.
 * Uses YIQ luminance formula for quick calculation.
 */
export function getContrastColor(hexcolor: string): "white" | "black" {
  if (!hexcolor || hexcolor.length < 6) return "white";

  // Normalize hex
  const hex = hexcolor.replace("#", "");

  // Handle shorter hex if needed (though we mostly use #RRGGBB)
  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex.substring(0, 1).repeat(2), 16);
    g = parseInt(hex.substring(1, 2).repeat(2), 16);
    b = parseInt(hex.substring(2, 3).repeat(2), 16);
  } else {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }

  // Calculate YIQ luminance
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  return yiq >= 128 ? "black" : "white";
}

/**
 * Get optimal text color for a background ensuring WCAG AA compliance
 * Returns either white or black, whichever has better contrast
 */
export function getOptimalTextColor(backgroundColor: string): string {
  const whiteContrast = getContrastRatio("#FFFFFF", backgroundColor);
  const blackContrast = getContrastRatio("#000000", backgroundColor);

  // If neither meets minimum contrast, use the better one
  return whiteContrast > blackContrast ? "#FFFFFF" : "#000000";
}

/**
 * Validate and auto-fix theme colors to ensure visibility
 * Returns adjusted colors that meet contrast requirements
 */
export function validateThemeColors(theme: {
  primaryColor: string;
  backgroundColor: string;
  sidebarBackgroundColor: string;
  sidebarTextColor?: string;
  primaryTextColor?: string;
}) {
  const warnings: string[] = [];
  const fixes: Record<string, string> = {};

  // Check primary color vs white background
  const primaryVsWhite = getContrastRatio(theme.primaryColor, "#FFFFFF");
  if (primaryVsWhite < 3) {
    warnings.push("Primary color has poor contrast against white backgrounds");
  }

  // Check sidebar text vs sidebar background
  const sidebarText = theme.sidebarTextColor || getOptimalTextColor(theme.sidebarBackgroundColor);
  const sidebarContrast = getContrastRatio(sidebarText, theme.sidebarBackgroundColor);
  if (sidebarContrast < 4.5) {
    const optimalText = getOptimalTextColor(theme.sidebarBackgroundColor);
    fixes.sidebarTextColor = optimalText;
    warnings.push(`Sidebar text color adjusted from ${sidebarText} to ${optimalText} for better readability`);
  }

  // Check primary text color
  if (theme.primaryTextColor) {
    const primaryTextContrast = getContrastRatio(theme.primaryTextColor, "#FFFFFF");
    if (primaryTextContrast < 4.5) {
      const optimalText = getOptimalTextColor("#FFFFFF");
      fixes.primaryTextColor = optimalText;
      warnings.push(`Primary text color adjusted to ${optimalText} for better readability`);
    }
  }

  return { warnings, fixes, isValid: warnings.length === 0 };
}
