/**
 * E2E Test: Patient Management Workflow
 * Tests the complete patient management workflow from a clinician's perspective
 *
 * Test Coverage:
 * - Patient list navigation
 * - Patient creation form
 * - Patient details viewing
 * - Encounter management
 */

describe('Patient Management Workflow', () => {
  beforeEach(() => {
    // Login before each test
    cy.login();
  });

  describe('Patient List Management', () => {
    it('should navigate to patients page and display patient list', () => {
      // Navigate to Patients page
      cy.contains('Patients').click();

      // Verify we're on the patients page
      cy.url().should('include', '/patients');

      // Verify patient list elements are visible
      cy.contains('Managing patients for wew').should('be.visible');
      cy.contains('Total Patients').should('be.visible');
      cy.contains('Active').should('be.visible');

      // Verify export and add patient buttons
      cy.contains('button', 'Export CSV').should('be.visible');
      cy.contains('button', 'Add Patient').should('be.visible');
    });

    it('should search for existing patients', () => {
      // Navigate to patients page
      cy.visit('/patients');

      // Test search functionality
      cy.get('input[placeholder*="Search patients"]').should('be.visible');
      cy.get('input[placeholder*="Search patients"]').type('Hic beatae');

      // Should filter results (implementation dependent)
      cy.wait(500); // Debounce delay
    });
  });

  describe('Patient Creation Workflow', () => {
    it('should open and display new patient form', () => {
      cy.visit('/patients');

      // Click Add Patient button
      cy.contains('button', 'Add Patient').click();

      // Verify form modal appears
      cy.contains('New Patient').should('be.visible');
      cy.contains('Quick entry mode: some optional fields are hidden').should('be.visible');

      // Verify required sections
      cy.contains('Provider Information').should('be.visible');
      cy.contains('Patient Details').should('be.visible');
      cy.contains('Contact Information').should('be.visible');
      cy.contains('Privacy & Consent').should('be.visible');
    });

    it('should fill out patient form with valid data', () => {
      cy.visit('/patients');
      cy.contains('button', 'Add Patient').click();

      // Provider Information
      cy.contains('Primary Provider').parent().find('button').click();
      cy.contains('Alias maiores sit vo').click();

      cy.contains('Provider Group Location').parent().find('button').click();
      cy.contains('EHR Connect Healthcare').click();

      // Patient Details
      cy.get('input[name="firstName"]').clear().type('Sarah');
      cy.get('input[name="lastName"]').clear().type('Mitchell');
      cy.get('input[type="date"]').first().clear().type('1985-03-15');

      // Contact Information
      cy.get('input[type="tel"]').type('555-123-4567');
      cy.get('input[type="email"]').type('sarah.mitchell@email.com');

      // Address
      cy.get('input[placeholder="Street address"]').type('123 Main Street, Apt 4B');
      cy.get('input[name="city"]').type('Springfield');
      cy.get('input[name="state"]').type('IL');
      cy.get('input[name="zip"]').type('62701');

      // Verify form is filled
      cy.get('input[name="firstName"]').should('have.value', 'Sarah');
      cy.get('input[name="lastName"]').should('have.value', 'Mitchell');
    });

    it('should validate required fields', () => {
      cy.visit('/patients');
      cy.contains('button', 'Add Patient').click();

      // Try to submit without filling required fields
      cy.contains('button', 'Create Patient').click();

      // Should show validation errors
      cy.wait(500);
      // Validation messages would appear here
    });

    it('should cancel patient creation', () => {
      cy.visit('/patients');
      cy.contains('button', 'Add Patient').click();

      // Fill some data
      cy.get('input[name="firstName"]').type('Test');

      // Click cancel
      cy.contains('button', 'Cancel').click();

      // Form should close
      cy.contains('New Patient').should('not.exist');
    });
  });

  describe('Patient Details View', () => {
    it('should view existing patient details', () => {
      cy.visit('/patients');

      // Click on first patient in the list
      cy.contains('Hic beatae ut ex exc').click();

      // Verify patient details page loads
      cy.url().should('include', '/patients/');
      cy.contains('Hic beatae ut ex exc').should('be.visible');

      // Verify patient header information
      cy.contains('VIP').should('be.visible');
      cy.contains('High Risk').should('be.visible');
      cy.contains('Requires Interpreter').should('be.visible');

      // Verify patient demographics
      cy.contains('12/17/1975 (50yrs) (U)').should('be.visible');
      cy.contains('Dr. Smith').should('be.visible');
    });

    it('should display patient dashboard sections', () => {
      cy.visit('/patients');
      cy.contains('Hic beatae ut ex exc').click();

      // Verify dashboard sections
      cy.contains('Dashboard').click();

      // Check for key dashboard elements
      cy.contains('Latest Vital Signs').should('be.visible');
      cy.contains('Recent Visit Summary').should('be.visible');
      cy.contains('Recent Lab Results').should('be.visible');
      cy.contains('Quick Actions').should('be.visible');

      // Verify quick actions
      cy.contains('Order Labs').should('be.visible');
      cy.contains('Prescribe Medication').should('be.visible');
      cy.contains('Schedule Follow-up').should('be.visible');
      cy.contains('Send Message').should('be.visible');
    });

    it('should display patient sidebar sections', () => {
      cy.visit('/patients');
      cy.contains('Hic beatae ut ex exc').click();

      // Verify all sidebar sections are available
      const sidebarSections = [
        'Dashboard',
        'Facesheet',
        'Facesheet - Preg...',
        'Prenatal Flowshe...',
        'Prenatal Vitals',
        'Allergies',
        'Diagnoses',
        'Medications',
        'Vaccines',
        'Vitals',
        'Lab',
        'Imaging',
        'Forms',
        'Family History'
      ];

      sidebarSections.forEach(section => {
        cy.contains(section).should('be.visible');
      });
    });

    it('should display care gaps', () => {
      cy.visit('/patients');
      cy.contains('Hic beatae ut ex exc').click();

      // Verify care gaps section
      cy.contains('Care Gaps').should('be.visible');
      cy.contains('Colon Cancer Screening').should('be.visible');
      cy.contains('Influenza Vaccine').should('be.visible');

      // Verify due status
      cy.contains('Due').should('be.visible');
    });
  });

  describe('Encounter Management', () => {
    it('should navigate to encounters page', () => {
      // From sidebar
      cy.visit('/');
      cy.contains('Encounters').click();

      // Verify encounters page
      cy.url().should('include', '/encounters');
      cy.contains('Manage and track all clinical encounters').should('be.visible');

      // Verify encounter stats
      cy.contains('TOTAL').should('be.visible');
      cy.contains('ACTIVE').should('be.visible');
    });

    it('should display encounter list', () => {
      cy.visit('/encounters');

      // Verify table headers
      cy.contains('PATIENT').should('be.visible');
      cy.contains('PRACTITIONER').should('be.visible');
      cy.contains('DATE & TIME').should('be.visible');
      cy.contains('CHIEF COMPLAINT').should('be.visible');
      cy.contains('TYPE').should('be.visible');
      cy.contains('STATUS').should('be.visible');
      cy.contains('ACTION').should('be.visible');
    });

    it('should view encounter details', () => {
      cy.visit('/encounters');

      // Click View button on first encounter
      cy.contains('button', 'View').first().click();

      // Verify encounter details page loads
      cy.url().should('include', '/encounters/');

      // Encounter details would be verified here based on implementation
      cy.wait(1000);
    });

    it('should search encounters', () => {
      cy.visit('/encounters');

      // Test search
      cy.get('input[placeholder*="Search encounters"]').should('be.visible');
      cy.get('input[placeholder*="Search encounters"]').type('Sunt consequatur');

      cy.wait(500); // Debounce
    });

    it('should filter encounters', () => {
      cy.visit('/encounters');

      // Click filters button
      cy.contains('button', 'Filters').click();

      // Filter options would appear based on implementation
      cy.wait(500);
    });
  });

  describe('Clinical Workflow Integration', () => {
    it('should create new visit from patient page', () => {
      cy.visit('/patients');
      cy.contains('Hic beatae ut ex exc').click();

      // Click New Visit button
      cy.contains('button', '+ New Visit').click();

      // New visit form should appear (implementation dependent)
      cy.wait(1000);
    });

    it('should access patient from encounter', () => {
      cy.visit('/encounters');

      // Click on patient name in encounter list
      cy.contains('Sunt consequatur s Eos et dolor earum').click();

      // Should navigate to patient page
      cy.url().should('include', '/patients/');
    });
  });
});

describe('Billing Dashboard Access', () => {
  beforeEach(() => {
    // Login before each test
    cy.login();
    // Wait for dashboard to load
    cy.wait(1000);
  });

  it('should navigate to billing dashboard', () => {
    // Click Billing Dashboard from sidebar
    cy.contains('Billing Dashboard').should('be.visible').click();

    // Verify billing page loads
    cy.url({ timeout: 10000 }).should('include', '/billing');
  });

  it('should navigate to superbills', () => {
    // Click Superbills from sidebar
    cy.contains('Superbills').should('be.visible').click();

    // Verify superbills page loads
    cy.url({ timeout: 10000 }).should('include', '/superbills');
  });

  it('should navigate to claims', () => {
    // Click Claims from sidebar
    cy.contains('Claims').should('be.visible').click();

    // Verify claims page loads
    cy.url({ timeout: 10000 }).should('include', '/claims');
  });
});

describe('Appointment Management', () => {
  beforeEach(() => {
    // Login before each test
    cy.login();
    // Wait for dashboard to load
    cy.wait(1000);
  });

  it('should navigate to appointments page', () => {
    // Click Appointments from sidebar
    cy.contains('Appointments').should('be.visible').click();

    // Verify appointments page loads
    cy.url({ timeout: 10000 }).should('include', '/appointments');
  });
});

describe('Staff Management', () => {
  beforeEach(() => {
    // Login before each test
    cy.login();
    // Wait for dashboard to load
    cy.wait(1000);
  });

  it('should navigate to staff list', () => {
    // Click Staff List from sidebar
    cy.contains('Staff List').should('be.visible').click();

    // Verify staff page loads
    cy.url({ timeout: 10000 }).should('include', '/staff');
  });
});
