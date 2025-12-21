
/* eslint-disable @typescript-eslint/no-explicit-any */
//@ts-no-check

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
   * Extract FHIR value from resource
   */
  export function extractFHIRValue(resource: any, path: string, defaultValue: string = '-'): string {
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

export interface ValidationError {
  [key: string]: string;
}

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRequired = (value: string, fieldName: string): string | null => {
  return value.trim() ? null : `${fieldName} is required`;
};

export const validateEmail = (email: string): string | null => {
  if (!email) return null;
  return emailRegex.test(email) ? null : 'Please enter a valid email address';
};

export const validateDate = (dateString: string, fieldName: string): string | null => {
  if (!dateString) return `${fieldName} is required`;
  
  const date = new Date(dateString);
  const today = new Date();
  
  if (date > today) {
    return `${fieldName} cannot be in the future`;
  }
  
  return null;
};

export const validatePatientForm = (formData: {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  facilityId?: string;
}): ValidationError => {
  const errors: ValidationError = {};

  const firstNameError = validateRequired(formData.firstName, 'First name');
  if (firstNameError) errors.firstName = firstNameError;

  const lastNameError = validateRequired(formData.lastName, 'Last name');
  if (lastNameError) errors.lastName = lastNameError;

  const dobError = validateDate(formData.dateOfBirth, 'Date of birth');
  if (dobError) errors.dateOfBirth = dobError;

  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  if (!formData.facilityId) {
    errors.facility = 'No facility selected. Please select a facility to continue.';
  }

  return errors;
};
