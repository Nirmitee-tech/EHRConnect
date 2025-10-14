/**
 * Clinical Utilities
 * Common functions for clinical data processing
 */

/**
 * Check if vital signs are abnormal
 */
export function isVitalAbnormal(vitalType: string, value: number): boolean {
  const ranges: Record<string, { min: number; max: number }> = {
    systolic: { min: 90, max: 140 },
    diastolic: { min: 60, max: 90 },
    heartRate: { min: 60, max: 100 },
    temperature: { min: 36, max: 38 },
    oxygenSaturation: { min: 95, max: 100 },
    respiratoryRate: { min: 12, max: 20 }
  };

  const range = ranges[vitalType];
  if (!range) return false;

  return value < range.min || value > range.max;
}

/**
 * Get vital status class
 */
export function getVitalStatusClass(isAbnormal: boolean): string {
  return isAbnormal
    ? 'border-red-300 bg-red-50'
    : 'border-gray-200 bg-white';
}

/**
 * Get vital status badge
 */
export function getVitalStatusBadge(isAbnormal: boolean): string {
  return isAbnormal
    ? 'bg-red-50 text-red-700 border-red-200'
    : 'bg-green-50 text-green-700 border-green-200';
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return '-';
  }
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  
  try {
    const d = new Date(date);
    return `${d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })} at ${d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  } catch {
    return '-';
  }
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dob: string): number {
  if (!dob) return 0;
  
  try {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch {
    return 0;
  }
}

/**
 * Get status badge class
 */
export function getStatusBadgeClass(status: string): string {
  const statusMap: Record<string, string> = {
    active: 'bg-green-50 text-green-700 border-green-200',
    finished: 'bg-green-50 text-green-700 border-green-200',
    'in-progress': 'bg-blue-50 text-blue-700 border-blue-200',
    resolved: 'bg-green-50 text-green-700 border-green-200',
    stopped: 'bg-red-50 text-red-700 border-red-200',
    high: 'bg-red-50 text-red-700 border-red-200',
    low: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    default: 'bg-gray-50 text-gray-700 border-gray-200'
  };

  return statusMap[status.toLowerCase()] || statusMap.default;
}

/**
 * Extract FHIR value from resource
 */
export function extractFHIRValue(
  resource: unknown,
  path: string,
  defaultValue: string = '-'
): string {
  try {
    const parts = path.split('.');
    let value: unknown = resource;

    for (const part of parts) {
      if (Array.isArray(value)) {
        const index = Number(part);
        if (!Number.isNaN(index) && index in value) {
          value = value[index];
          continue;
        }
        return defaultValue;
      }

      if (isRecord(value) && part in value) {
        value = value[part];
      } else {
        return defaultValue;
      }
    }

    const normalized = normalizeFHIRValue(value);
    return normalized !== null ? normalized : defaultValue;
  } catch {
    return defaultValue;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeFHIRValue(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string') {
    return value.length > 0 ? value : null;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    const entries = value
      .map((item) => normalizeFHIRValue(item))
      .filter((item): item is string => item !== null);
    return entries.length > 0 ? entries.join(', ') : null;
  }

  if (isRecord(value)) {
    const preferredKeys = ['text', 'display', 'value', 'name', 'code'];
    for (const key of preferredKeys) {
      if (key in value) {
        const normalized = normalizeFHIRValue(value[key]);
        if (normalized) {
          return normalized;
        }
      }
    }
  }

  return null;
}

/**
 * Generate clinical alerts from vitals
 */
export function generateVitalAlerts(vitals: {
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
}): string[] {
  const alerts: string[] = [];

  if (vitals.systolic && vitals.diastolic) {
    if (vitals.systolic > 140 || vitals.diastolic > 90) {
      alerts.push('High Blood Pressure detected - Consider medication review');
    } else if (vitals.systolic < 90 || vitals.diastolic < 60) {
      alerts.push('Low Blood Pressure detected - Monitor for symptoms');
    }
  }

  if (vitals.heartRate) {
    if (vitals.heartRate > 100) {
      alerts.push('Elevated Heart Rate - Check for fever or anxiety');
    } else if (vitals.heartRate < 60) {
      alerts.push('Low Heart Rate - Verify patient is not an athlete');
    }
  }

  if (vitals.temperature) {
    if (vitals.temperature > 38) {
      alerts.push('Fever detected - Consider infection workup');
    } else if (vitals.temperature < 36) {
      alerts.push('Hypothermia risk - Check environmental factors');
    }
  }

  if (vitals.oxygenSaturation && vitals.oxygenSaturation < 95) {
    alerts.push('Low Oxygen Saturation - Consider supplemental O2');
  }

  return alerts;
}
