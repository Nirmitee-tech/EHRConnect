const colors = {
  // Neutral Colors - Healthcare friendly grays
  neutral: {
    0: '#ffffff',
    25: '#fafafa',
    50: '#f5f7fa',
    100: '#eef2f7',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#1a202c',
    950: '#0f172a',
  },

  // Primary Brand - Medical Blue/Purple
  primary: {
    50: '#f0f4ff',
    100: '#e0e9ff',
    200: '#c7d5fe',
    300: '#a5b6fc',
    400: '#8189f8',
    500: '#667eea',
    600: '#5568d3',
    700: '#4f5ab7',
    800: '#434e94',
    900: '#3b4477',
    950: '#262b47',
  },

  // Secondary - Healthcare Purple
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#764ba2',
    600: '#6d3d94',
    700: '#5e3280',
    800: '#4f2a6a',
    900: '#422357',
    950: '#2a1240',
  },

  // Success - Medical Green
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },

  // Warning - Amber for attention
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  // Danger/Error - Medical Red
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // Info - Medical Blue
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Healthcare Specific Colors
  medical: {
    // Vital signs colors
    heartRate: '#e11d48', // Red for heart rate
    bloodPressure: '#8b5cf6', // Purple for BP
    temperature: '#f97316', // Orange for temp
    oxygenSat: '#3b82f6', // Blue for O2 sat
    bloodGlucose: '#f59e0b', // Amber for glucose
    
    // Department colors
    emergency: '#dc2626',
    cardiology: '#e11d48',
    neurology: '#8b5cf6',
    oncology: '#6366f1',
    pediatrics: '#06b6d4',
    radiology: '#64748b',
    surgery: '#84cc16',
    pharmacy: '#10b981',
  },
} as const;

export type ColorToken = keyof typeof colors;
export type ColorShade = keyof typeof colors.neutral;

export { colors };