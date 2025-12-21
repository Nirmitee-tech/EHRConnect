// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Custom command to login to EHR system
 * Usage: cy.login() or cy.login('email', 'password')
 *
 * If no credentials provided, uses default admin user from fixture
 */
Cypress.Commands.add('login', (email, password) => {
  // Always load fixture, use provided credentials if they exist
  cy.fixture('users').then((users) => {
    const loginEmail = email || users.admin.email;
    const loginPassword = password || users.admin.password;

    // Visit signin page
    cy.visit('/auth/signin');

    // Wait for page to load
    cy.get('input#email', { timeout: 10000 }).should('be.visible');

    // Fill in credentials
    cy.get('input#email').clear().type(loginEmail);
    cy.get('input#password').clear().type(loginPassword);

    // Submit form
    cy.get('button[type="submit"]').contains(/sign in/i).click();

    // Wait for redirect to dashboard or callback URL
    cy.url({ timeout: 15000 }).should('not.include', '/auth/signin');
    cy.url().should('match', /\/(dashboard|patients|encounters|billing)/);

    // Wait for page to fully load
    cy.get('body', { timeout: 10000 }).should('be.visible');
  });
});

/**
 * Custom command to login with specific user type
 * Usage: cy.loginAs('admin') or cy.loginAs('testDoctor')
 */
Cypress.Commands.add('loginAs', (userType = 'admin') => {
  cy.fixture('users').then((users) => {
    const user = users[userType];
    if (!user) {
      throw new Error(`User type "${userType}" not found in fixture`);
    }
    cy.login(user.email, user.password);
  });
});

/**
 * Custom command to navigate to patients page
 * Usage: cy.goToPatients()
 */
Cypress.Commands.add('goToPatients', () => {
  cy.contains('Patients').click();
  cy.url().should('include', '/patients');
});

/**
 * Custom command to navigate to encounters page
 * Usage: cy.goToEncounters()
 */
Cypress.Commands.add('goToEncounters', () => {
  cy.contains('Encounters').click();
  cy.url().should('include', '/encounters');
});

/**
 * Custom command to create a new patient
 * Usage: cy.createPatient({ firstName, lastName, dob, ... })
 */
Cypress.Commands.add('createPatient', (patientData) => {
  const {
    provider = 'Alias maiores sit vo',
    location = 'EHR Connect Healthcare',
    firstName,
    lastName,
    dob,
    gender = 'Male',
    phone,
    email,
    address,
    city,
    state,
    zip
  } = patientData;

  // Open form
  cy.contains('button', 'Add Patient').click();

  // Provider Information
  if (provider) {
    cy.contains('Primary Provider').parent().find('button').click();
    cy.contains(provider).click();
  }

  if (location) {
    cy.contains('Provider Group Location').parent().find('button').click();
    cy.contains(location).click();
  }

  // Patient Details
  if (firstName) cy.get('input[name="firstName"]').clear().type(firstName);
  if (lastName) cy.get('input[name="lastName"]').clear().type(lastName);
  if (dob) cy.get('input[type="date"]').first().clear().type(dob);
  if (gender) {
    cy.contains('Gender').parent().find('button').click();
    cy.contains(gender).click();
  }

  // Contact Information
  if (phone) cy.get('input[type="tel"]').type(phone);
  if (email) cy.get('input[type="email"]').type(email);
  if (address) cy.get('input[placeholder="Street address"]').type(address);
  if (city) cy.get('input[name="city"]').type(city);
  if (state) cy.get('input[name="state"]').type(state);
  if (zip) cy.get('input[name="zip"]').type(zip);

  // Submit
  cy.contains('button', 'Create Patient').click();
});

/**
 * Custom command to search for patient
 * Usage: cy.searchPatient('patient name')
 */
Cypress.Commands.add('searchPatient', (searchTerm) => {
  cy.get('input[placeholder*="Search patients"]').clear().type(searchTerm);
  cy.wait(500); // Debounce
});

/**
 * Custom command to view patient details
 * Usage: cy.viewPatient('Patient Name')
 */
Cypress.Commands.add('viewPatient', (patientName) => {
  cy.contains(patientName).click();
  cy.url().should('include', '/patients/');
});

/**
 * Custom command to create new visit/encounter
 * Usage: cy.createNewVisit()
 */
Cypress.Commands.add('createNewVisit', () => {
  cy.contains('button', '+ New Visit').click();
});

/**
 * Custom command to navigate to a patient section
 * Usage: cy.goToPatientSection('Medications')
 */
Cypress.Commands.add('goToPatientSection', (sectionName) => {
  cy.contains(sectionName).click();
});

/**
 * Custom command to order labs
 * Usage: cy.orderLabs(['CBC', 'BMP'])
 */
Cypress.Commands.add('orderLabs', (labTests) => {
  cy.contains('Order Labs').click();
  // Implementation would depend on the actual lab ordering UI
  labTests.forEach(test => {
    cy.contains(test).click();
  });
  cy.contains('button', 'Submit Order').click();
});

/**
 * Custom command to prescribe medication
 * Usage: cy.prescribeMedication({ name, dosage, frequency })
 */
Cypress.Commands.add('prescribeMedication', (medication) => {
  const { name, dosage, frequency, duration } = medication;

  cy.contains('Prescribe Medication').click();

  if (name) cy.get('input[name="medicationName"]').type(name);
  if (dosage) cy.get('input[name="dosage"]').type(dosage);
  if (frequency) cy.get('select[name="frequency"]').select(frequency);
  if (duration) cy.get('input[name="duration"]').type(duration);

  cy.contains('button', 'Prescribe').click();
});

/**
 * Custom command to navigate to billing dashboard
 * Usage: cy.goToBilling()
 */
Cypress.Commands.add('goToBilling', () => {
  cy.contains('Billing Dashboard').click();
  cy.url().should('include', '/billing');
});

/**
 * Custom command to filter encounters
 * Usage: cy.filterEncounters({ status: 'Active', type: 'Outpatient' })
 */
Cypress.Commands.add('filterEncounters', (filters) => {
  cy.contains('button', 'Filters').click();

  Object.keys(filters).forEach(key => {
    cy.get(`select[name="${key}"]`).select(filters[key]);
  });

  cy.contains('button', 'Apply Filters').click();
});

/**
 * Custom command to check for care gaps
 * Usage: cy.checkCareGaps()
 */
Cypress.Commands.add('checkCareGaps', () => {
  cy.contains('Care Gaps').should('be.visible');
  cy.get('[data-testid="care-gap-item"]').should('exist');
});

/**
 * Custom command to export data
 * Usage: cy.exportData('CSV')
 */
Cypress.Commands.add('exportData', (format = 'CSV') => {
  cy.contains('button', `Export ${format}`).click();
  // Verify download started
  cy.wait(1000);
});

/**
 * Custom command to verify patient header information
 * Usage: cy.verifyPatientHeader({ name, age, provider })
 */
Cypress.Commands.add('verifyPatientHeader', (patientInfo) => {
  const { name, age, provider } = patientInfo;

  if (name) cy.contains(name).should('be.visible');
  if (age) cy.contains(age).should('be.visible');
  if (provider) cy.contains(provider).should('be.visible');
});
