import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Returns either 'white' or 'black' based on the contrast requirement of the input hex color.
 * Uses YIQ luminance formula.
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
