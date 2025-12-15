/**
 * Preview Store - Phase 3: Responsive Preview System
 *
 * Manages preview state for form builder:
 * - Device viewport settings (mobile/tablet/desktop)
 * - Orientation and zoom controls
 * - Test mode for interactive preview
 * - Isolated from builder state
 */

import { create } from 'zustand';

// Device viewport presets (Chrome DevTools standard dimensions)
const DEVICE_PRESETS = {
  mobile: { width: 375, height: 667 }, // iPhone SE
  tablet: { width: 768, height: 1024 }, // iPad
  desktop: { width: 1920, height: 1080 } // Full HD
} as const;

export type DeviceType = keyof typeof DEVICE_PRESETS | 'custom';

interface PreviewState {
  // Device settings
  device: DeviceType;
  dimensions: { width: number; height: number };
  orientation: 'portrait' | 'landscape';
  zoom: number;

  // Test mode
  testMode: boolean;
  testData: Record<string, any>;
  currentStep: number;

  // Actions
  setDevice: (device: DeviceType) => void;
  setDimensions: (dimensions: { width: number; height: number }) => void;
  toggleOrientation: () => void;
  setZoom: (zoom: number) => void;
  toggleTestMode: () => void;
  updateTestData: (data: Record<string, any>) => void;
  resetTestData: () => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

const initialState = {
  device: 'desktop' as DeviceType,
  dimensions: DEVICE_PRESETS.desktop,
  orientation: 'portrait' as const,
  zoom: 100,
  testMode: false,
  testData: {},
  currentStep: 0,
};

export const usePreviewStore = create<PreviewState>((set, get) => ({
  ...initialState,

  /**
   * Set device preset and update dimensions
   */
  setDevice: (device) => {
    if (device === 'custom') {
      set({ device });
      return;
    }
    const dimensions = DEVICE_PRESETS[device];
    set({ device, dimensions, orientation: 'portrait' });
  },

  /**
   * Set custom dimensions (switches to custom device)
   */
  setDimensions: (dimensions) => {
    set({ dimensions, device: 'custom' });
  },

  /**
   * Toggle between portrait and landscape orientation
   */
  toggleOrientation: () => {
    const { dimensions, orientation } = get();
    set({
      dimensions: { width: dimensions.height, height: dimensions.width },
      orientation: orientation === 'portrait' ? 'landscape' : 'portrait'
    });
  },

  /**
   * Set zoom level (clamped between 50% and 200%)
   */
  setZoom: (zoom) => {
    const clampedZoom = Math.min(Math.max(zoom, 50), 200);
    set({ zoom: clampedZoom });
  },

  /**
   * Toggle test mode (interactive preview)
   */
  toggleTestMode: () => {
    set({ testMode: !get().testMode });
  },

  /**
   * Update test data (merge with existing)
   */
  updateTestData: (data) => {
    set({ testData: { ...get().testData, ...data } });
  },

  /**
   * Reset all test data
   */
  resetTestData: () => {
    set({ testData: {}, currentStep: 0 });
  },

  /**
   * Set current step in multi-step preview
   */
  setCurrentStep: (step) => {
    set({ currentStep: step });
  },

  /**
   * Reset entire preview state
   */
  reset: () => {
    set(initialState);
  }
}));

// Export device presets for external use
export { DEVICE_PRESETS };
