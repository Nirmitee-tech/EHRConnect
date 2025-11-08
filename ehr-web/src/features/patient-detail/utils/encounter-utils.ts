/**
 * Encounter Utilities
 * Helper functions for working with encounter IDs and active encounter state
 */

/**
 * Extract encounter ID from a tab ID
 * @param tabId - The active tab ID (e.g., "encounter-abc123" or "dashboard")
 * @returns The encounter ID or null if not an encounter tab
 */
export const getEncounterIdFromTab = (tabId: string): string | null => {
  if (tabId.startsWith('encounter-')) {
    return tabId.replace('encounter-', '');
  }
  return null;
};

/**
 * Check if the current tab is an encounter tab
 * @param tabId - The active tab ID
 * @returns True if this is an encounter tab
 */
export const isEncounterTab = (tabId: string): boolean => {
  return tabId.startsWith('encounter-');
};

/**
 * Create a tab ID from an encounter ID
 * @param encounterId - The encounter ID
 * @returns The tab ID for this encounter
 */
export const createEncounterTabId = (encounterId: string): string => {
  return `encounter-${encounterId}`;
};
