
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRequired(value, fieldName) {
  return value && value.trim() ? null : `${fieldName} is required`;
}

function validateEmail(email) {
  if (!email) return null;
  return emailRegex.test(email) ? null : 'Please enter a valid email address';
}

function validateDate(dateString, fieldName) {
  if (!dateString) return `${fieldName} is required`;
  
  const date = new Date(dateString);
  const today = new Date();
  
  if (date > today) {
    return `${fieldName} cannot be in the future`;
  }
  
  return null;
}

function validatePatientForm(formData) {
  const errors = {};

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
}

module.exports = {
  emailRegex,
  validateRequired,
  validateEmail,
  validateDate,
  validatePatientForm,
};
