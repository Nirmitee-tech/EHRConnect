/**
 * Form Persistence Utilities
 * Manages localStorage for encounter form drafts
 */

const DRAFT_KEY_PREFIX = 'encounter-form-draft';

/**
 * Generate a unique key for a form draft
 */
const getDraftKey = (encounterId: string, formType: string): string => {
  return `${DRAFT_KEY_PREFIX}-${encounterId}-${formType}`;
};

/**
 * Save form draft to localStorage
 */
export const saveDraft = <T>(
  encounterId: string,
  formType: string,
  data: T
): void => {
  try {
    const key = getDraftKey(encounterId, formType);
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Failed to save draft to localStorage:', error);
  }
};

/**
 * Load form draft from localStorage
 */
export const loadDraft = <T>(
  encounterId: string,
  formType: string
): T | null => {
  try {
    const key = getDraftKey(encounterId, formType);
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const { data, timestamp } = JSON.parse(stored);

    // Check if draft is older than 7 days
    const draftAge = Date.now() - new Date(timestamp).getTime();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

    if (draftAge > maxAge) {
      // Draft is too old, remove it
      clearDraft(encounterId, formType);
      return null;
    }

    return data as T;
  } catch (error) {
    console.error('Failed to load draft from localStorage:', error);
    return null;
  }
};

/**
 * Clear form draft from localStorage
 */
export const clearDraft = (
  encounterId: string,
  formType: string
): void => {
  try {
    const key = getDraftKey(encounterId, formType);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear draft from localStorage:', error);
  }
};

/**
 * Check if a draft exists for a form
 */
export const hasDraft = (
  encounterId: string,
  formType: string
): boolean => {
  try {
    const key = getDraftKey(encounterId, formType);
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error('Failed to check draft in localStorage:', error);
    return false;
  }
};

/**
 * Clear all drafts for an encounter
 */
export const clearAllDrafts = (encounterId: string): void => {
  try {
    const keys = Object.keys(localStorage);
    const prefix = `${DRAFT_KEY_PREFIX}-${encounterId}`;

    keys.forEach(key => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear all drafts from localStorage:', error);
  }
};

/**
 * Get list of all form types with drafts for an encounter
 */
export const getDraftFormTypes = (encounterId: string): string[] => {
  try {
    const keys = Object.keys(localStorage);
    const prefix = `${DRAFT_KEY_PREFIX}-${encounterId}-`;

    return keys
      .filter(key => key.startsWith(prefix))
      .map(key => key.replace(prefix, ''));
  } catch (error) {
    console.error('Failed to get draft form types from localStorage:', error);
    return [];
  }
};
