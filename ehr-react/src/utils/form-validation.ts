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
