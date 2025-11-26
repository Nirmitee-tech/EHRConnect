/**
 * Form Save Handlers - Centralized save logic for all encounter forms
 * Handles empty state checks, author assignment, and document reference creation
 */

import type { SavedSection } from '@/app/patients/[id]/components/types';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { validateForm } from './form-validation';

// Global storage for client-side user info (set once on mount)
let cachedUserName: string | null = null;

/**
 * Set user name from client-side session
 * Call this once when component mounts with session data
 */
export const setCachedUserName = (name: string | null) => {
  cachedUserName = name;
};

/**
 * Get current user name for document authorship
 * Uses cached value from session (set during component mount)
 */
const getCurrentUserName = (): string => {
  return cachedUserName || 'Unknown Provider';
};

/**
 * Create a saved section with proper structure
 */
export const createSection = (
  title: string,
  type: string,
  data: any,
  authorOverride?: string
): SavedSection => {
  // Validate form data based on form type
  const validation = validateForm(type, data);

  if (!validation.isValid) {
    const errorMessage = validation.errors.join('\n');
    throw new Error(`Form validation failed:\n${errorMessage}`);
  }

  return {
    title,
    type,
    author: authorOverride || getCurrentUserName(),
    date: new Date().toISOString(),
    data,
    signatures: []
  };
};

/**
 * Export helper for getting author name
 */
export { getCurrentUserName };
