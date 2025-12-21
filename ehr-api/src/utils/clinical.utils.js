
/**
 * Generate unique Medical Record Number (MRN)
 * Format: PT + 8-digit timestamp + 3-digit random number
 * Example: PT123456789042
 */
function generateMRN() {
  const prefix = 'PT';
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');

  return `${prefix}${timestamp}${random}`;
}

/**
 * Check if vital signs are abnormal
 */
function isVitalAbnormal(vitalType, value) {
  const ranges = {
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
 * Calculate age from date of birth
 */
function calculateAge(dob) {
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
 * Extract FHIR value from resource
 */
function extractFHIRValue(resource, path, defaultValue = '-') {
  try {
    const parts = path.split('.');
    let value = resource;
    
    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return defaultValue;
      }
    }
    
    return value || defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Generate clinical alerts from vitals
 */
function generateVitalAlerts(vitals) {
  const alerts = [];

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

module.exports = {
  generateMRN,
  isVitalAbnormal,
  calculateAge,
  extractFHIRValue,
  generateVitalAlerts,
};
