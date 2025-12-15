/**
 * useFormPreview Hook - Phase 3: Responsive Preview System
 *
 * Custom hook for form preview functionality:
 * - Preview state management
 * - Validation helpers
 * - Device preset utilities
 */

import { useCallback, useMemo } from 'react';
import { usePreviewStore, DEVICE_PRESETS } from '@/stores/preview-store';
import {
  validateTestData,
  getRequiredFields,
  flattenQuestions
} from '@/services/preview.service';

interface QuestionnaireItem {
  linkId: string;
  text?: string;
  type: string;
  required?: boolean;
  item?: QuestionnaireItem[];
  [key: string]: any;
}

/**
 * Hook for managing form preview state and validation
 */
export function useFormPreview(questions: QuestionnaireItem[]) {
  const store = usePreviewStore();

  // Validation status
  const validation = useMemo(() => {
    return validateTestData(questions, store.testData);
  }, [questions, store.testData]);

  // Required fields list
  const requiredFields = useMemo(() => {
    return getRequiredFields(questions);
  }, [questions]);

  // All fields (flattened)
  const allFields = useMemo(() => {
    return flattenQuestions(questions);
  }, [questions]);

  // Completion percentage
  const completionRate = useMemo(() => {
    if (requiredFields.length === 0) return 100;
    return Math.round((validation.completedFields.length / requiredFields.length) * 100);
  }, [requiredFields, validation]);

  // Device preset helpers
  const getDevicePreset = useCallback((device: keyof typeof DEVICE_PRESETS) => {
    return DEVICE_PRESETS[device];
  }, []);

  // Reset preview to defaults
  const resetPreview = useCallback(() => {
    store.reset();
  }, [store]);

  // Set device with preset
  const setDevicePreset = useCallback((device: keyof typeof DEVICE_PRESETS) => {
    store.setDevice(device);
  }, [store]);

  return {
    // Store state
    device: store.device,
    dimensions: store.dimensions,
    orientation: store.orientation,
    zoom: store.zoom,
    testMode: store.testMode,
    testData: store.testData,

    // Store actions
    setDevice: store.setDevice,
    setDimensions: store.setDimensions,
    toggleOrientation: store.toggleOrientation,
    setZoom: store.setZoom,
    toggleTestMode: store.toggleTestMode,
    updateTestData: store.updateTestData,
    resetTestData: store.resetTestData,

    // Computed values
    validation,
    requiredFields,
    allFields,
    completionRate,

    // Helper functions
    getDevicePreset,
    resetPreview,
    setDevicePreset,
    isValid: validation.isValid
  };
}
