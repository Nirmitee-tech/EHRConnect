# Cypress E2E Testing Guide - EHR Connect

## Overview

This document provides complete guidance for working with Cypress E2E tests in the EHR Connect application. All tests include proper authentication flow and are ready for automated testing.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Authentication Flow](#authentication-flow)
3. [Project Structure](#project-structure)
4. [Running Tests](#running-tests)
5. [Writing New Tests](#writing-new-tests)
6. [Custom Commands](#custom-commands)
7. [Test Users & Fixtures](#test-users--fixtures)
8. [Troubleshooting](#troubleshooting)
9. [Common Patterns](#common-patterns)
10. [CI/CD Integration](#cicd-integration)

---

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Dev server running on `http://localhost:3000`
- Valid test user credentials in fixtures

### Install Dependencies
```bash
npm install
```

### Run Tests
```bash
# Start dev server
npm run dev

# In another terminal - Open Cypress GUI
npm run cypress

# Or run headless
npm run test:e2e:headless
```

---

## Authentication Flow

### The Problem
EHR Connect uses NextAuth.js with middleware-based route protection. All routes except public paths require authentication. Tests MUST login before accessing protected routes like `/patients`, `/encounters`, `/billing`.

### The Solution
Every test suite includes authentication in `beforeEach()` hook:

```javascript
describe('My Test Suite', () => {
  beforeEach(() => {
    cy.login(); // Logs in with default admin user
  });

  it('should do something', () => {
    cy.visit('/patients'); // Now authenticated!
  });
});
```

### How It Works

1. **Middleware Protection** (`src/middleware.ts`):
   - Checks for NextAuth JWT token
   - Redirects unauthenticated users to `/`

2. **Login Command** (`cypress/support/commands.js`):
   - Visits `/auth/signin` (NOT `/login`)
   - Uses credentials from `cypress/fixtures/users.json`
   - Waits for successful redirect
   - Stores session for subsequent requests

3. **Test Execution**:
   - `beforeEach()` runs before every test
   - Logs in with fixture credentials
   - Tests can access protected routes

---

## Project Structure

```
cypress/
├── e2e/
│   ├── auth.cy.js                    # Authentication tests
│   └── patient-workflow.cy.js        # Patient workflow tests
├── fixtures/
│   └── users.json                    # Test user credentials
├── support/
│   ├── commands.js                   # Custom Cypress commands
│   └── e2e.js                        # Global configuration
└── tsconfig.json                     # TypeScript config

cypress.config.js                      # Cypress configuration
package.json                           # Test scripts
```

---

## Running Tests

### Development Mode (GUI)
```bash
# Start dev server first
npm run dev

# Open Cypress GUI
npm run cypress
```

**Benefits**: Visual feedback, step-by-step execution, time travel debugging

### Headless Mode (CI/CD)
```bash
npm run test:e2e:headless
```

**Benefits**: Fast, automated, generates videos/screenshots

### Specific Browser
```bash
npm run cypress:chrome   # Chrome
npm run cypress:firefox  # Firefox
```

### Single Test File
```bash
npx cypress run --spec "cypress/e2e/auth.cy.js"
```

### With Server Auto-Start
```bash
npm run test:e2e  # Starts server, runs tests, kills server
```

---

## Writing New Tests

### Basic Test Template

```javascript
describe('My Feature', () => {
  beforeEach(() => {
    // IMPORTANT: Always login first!
    cy.login();

    // Wait for dashboard to load
    cy.wait(1000);
  });

  it('should do something', () => {
    // Your test code here
    cy.visit('/my-route');
    cy.contains('Expected Text').should('be.visible');
  });
});
```

### Important Rules

1. **Always login in beforeEach()**
   ```javascript
   beforeEach(() => {
     cy.login(); // Required for protected routes
   });
   ```

2. **Use custom commands for common actions**
   ```javascript
   cy.loginAs('testDoctor');      // Login as specific user
   cy.goToPatients();             // Navigate to patients
   cy.createPatient({ ... });     // Create patient with data
   ```

3. **Wait for elements before interacting**
   ```javascript
   cy.contains('Button').should('be.visible').click();
   ```

4. **Add timeouts for async operations**
   ```javascript
   cy.url({ timeout: 10000 }).should('include', '/patients');
   ```

5. **Clean up after tests**
   ```javascript
   afterEach(() => {
     // Delete test data if needed
   });
   ```

---

## Custom Commands

Located in `cypress/support/commands.js`

### Authentication Commands

#### `cy.login(email, password)`
Login with credentials. Uses admin from fixture if no credentials provided.

```javascript
cy.login(); // Default admin user
cy.login('custom@email.com', 'password123'); // Custom credentials
```

#### `cy.loginAs(userType)`
Login as a specific user type from fixtures.

```javascript
cy.loginAs('admin');
cy.loginAs('testDoctor');
cy.loginAs('testNurse');
```

### Navigation Commands

#### `cy.goToPatients()`
Navigate to patients page.

```javascript
cy.goToPatients();
```

#### `cy.goToEncounters()`
Navigate to encounters page.

```javascript
cy.goToEncounters();
```

#### `cy.goToBilling()`
Navigate to billing dashboard.

```javascript
cy.goToBilling();
```

### Patient Management Commands

#### `cy.createPatient(patientData)`
Create a new patient with provided data.

```javascript
cy.createPatient({
  firstName: 'John',
  lastName: 'Doe',
  dob: '1990-01-01',
  phone: '555-123-4567',
  email: 'john.doe@email.com',
  address: '123 Main St',
  city: 'Springfield',
  state: 'IL',
  zip: '62701'
});
```

#### `cy.searchPatient(searchTerm)`
Search for a patient by name.

```javascript
cy.searchPatient('John Doe');
```

#### `cy.viewPatient(patientName)`
Click on a patient to view their details.

```javascript
cy.viewPatient('John Doe');
```

### Clinical Workflow Commands

#### `cy.createNewVisit()`
Start a new visit/encounter.

```javascript
cy.createNewVisit();
```

#### `cy.goToPatientSection(sectionName)`
Navigate to a specific section in patient view.

```javascript
cy.goToPatientSection('Medications');
cy.goToPatientSection('Allergies');
cy.goToPatientSection('Lab');
```

#### `cy.orderLabs(labTests)`
Order lab tests for patient.

```javascript
cy.orderLabs(['CBC', 'BMP', 'Lipid Panel']);
```

#### `cy.prescribeMedication(medication)`
Prescribe medication to patient.

```javascript
cy.prescribeMedication({
  name: 'Lisinopril',
  dosage: '10mg',
  frequency: 'Once Daily',
  duration: '30 days'
});
```

### Other Utility Commands

#### `cy.filterEncounters(filters)`
Apply filters to encounter list.

```javascript
cy.filterEncounters({
  status: 'Active',
  type: 'Outpatient'
});
```

#### `cy.exportData(format)`
Export data in specified format.

```javascript
cy.exportData('CSV');
```

#### `cy.checkCareGaps()`
Verify care gaps section is visible.

```javascript
cy.checkCareGaps();
```

#### `cy.verifyPatientHeader(patientInfo)`
Verify patient header information.

```javascript
cy.verifyPatientHeader({
  name: 'John Doe',
  age: '34yrs',
  provider: 'Dr. Smith'
});
```

---

## Test Users & Fixtures

### User Fixture Structure

Located in `cypress/fixtures/users.json`:

```json
{
  "admin": {
    "email": "jitendra@nirmitee.io",
    "password": "nilkamal0_Y",
    "role": "ORG_ADMIN",
    "name": "Jitendra"
  },
  "testDoctor": {
    "email": "test.doctor@ehr.test",
    "password": "Test@1234",
    "role": "DOCTOR",
    "name": "Test Doctor"
  },
  "testNurse": {
    "email": "test.nurse@ehr.test",
    "password": "Test@1234",
    "role": "NURSE",
    "name": "Test Nurse"
  }
}
```

### Adding New Test Users

1. **Add to fixture file**:
   ```json
   "testReceptionist": {
     "email": "test.receptionist@ehr.test",
     "password": "Test@1234",
     "role": "RECEPTIONIST",
     "name": "Test Receptionist"
   }
   ```

2. **Create user in database** (if needed):
   - Ensure user exists in your test database
   - Match email/password with fixture

3. **Use in tests**:
   ```javascript
   cy.loginAs('testReceptionist');
   ```

### Security Note
⚠️ **NEVER commit production credentials to fixtures!**
- Use test-only credentials
- Keep fixtures in `.gitignore` for sensitive environments
- Use environment variables for CI/CD

---

## Troubleshooting

### Common Issues

#### 1. Tests Fail with "401 Unauthorized" or "Redirect to /"

**Problem**: Tests accessing protected routes without authentication.

**Solution**:
```javascript
beforeEach(() => {
  cy.login(); // Add this!
});
```

#### 2. "cy.type() can only accept a string or number. You passed in: undefined"

**Problem**: Async fixture loading issue.

**Solution**: Already fixed in `commands.js`. Ensure you're using latest version:
```javascript
cy.fixture('users').then((users) => {
  const loginEmail = email || users.admin.email;
  const loginPassword = password || users.admin.password;
  // ... rest of login
});
```

#### 3. "Element not found" or "Timed out"

**Problem**: Element hasn't loaded yet.

**Solution**: Add visibility check and timeout:
```javascript
cy.contains('Button Text', { timeout: 10000 }).should('be.visible').click();
```

#### 4. "expected URL to include /route but was /dashboard"

**Problem**: Navigation not completing or route doesn't exist.

**Solution**:
```javascript
// Wait for page load
cy.wait(1000);

// Ensure element is visible before clicking
cy.contains('Nav Link').should('be.visible').click();

// Add timeout to URL check
cy.url({ timeout: 10000 }).should('include', '/route');
```

#### 5. Tests Pass Locally But Fail in CI

**Problem**: Race conditions, timing differences.

**Solution**:
- Increase timeouts in `cypress.config.js`
- Add explicit waits: `cy.wait(1000)`
- Use `should('be.visible')` before interactions
- Check CI environment has all dependencies

#### 6. "Network Error" or "Connection Refused"

**Problem**: Dev server not running.

**Solution**:
```bash
# Start dev server first
npm run dev

# Then run tests in another terminal
npm run cypress
```

Or use the combined script:
```bash
npm run test:e2e  # Starts server automatically
```

---

## Common Patterns

### Pattern 1: Test Form Submission

```javascript
it('should submit form successfully', () => {
  cy.login();
  cy.visit('/form-page');

  // Fill form
  cy.get('input[name="firstName"]').type('John');
  cy.get('input[name="lastName"]').type('Doe');
  cy.get('select[name="gender"]').select('Male');

  // Submit
  cy.contains('button', 'Submit').click();

  // Verify success
  cy.contains('Success').should('be.visible');
  cy.url().should('include', '/success');
});
```

### Pattern 2: Test List Filtering

```javascript
it('should filter list by search term', () => {
  cy.login();
  cy.visit('/patients');

  // Search
  cy.get('input[placeholder*="Search"]').type('John');
  cy.wait(500); // Debounce

  // Verify filtered results
  cy.contains('John Doe').should('be.visible');
  cy.contains('Jane Smith').should('not.exist');
});
```

### Pattern 3: Test Navigation Flow

```javascript
it('should navigate through workflow', () => {
  cy.login();

  // Step 1: List page
  cy.visit('/patients');
  cy.contains('John Doe').click();

  // Step 2: Detail page
  cy.url().should('include', '/patients/');
  cy.contains('Dashboard').click();

  // Step 3: Dashboard view
  cy.contains('Latest Vital Signs').should('be.visible');
});
```

### Pattern 4: Test Error Handling

```javascript
it('should show validation errors', () => {
  cy.login();
  cy.visit('/form-page');

  // Submit empty form
  cy.contains('button', 'Submit').click();

  // Verify error messages
  cy.contains('First name is required').should('be.visible');
  cy.contains('Last name is required').should('be.visible');
});
```

### Pattern 5: Test Multi-Step Workflow

```javascript
it('should complete patient creation workflow', () => {
  cy.login();
  cy.goToPatients();

  // Step 1: Open form
  cy.contains('Add Patient').click();

  // Step 2: Fill provider info
  cy.contains('Primary Provider').parent().find('button').click();
  cy.contains('Dr. Smith').click();

  // Step 3: Fill patient details
  cy.createPatient({
    firstName: 'John',
    lastName: 'Doe',
    dob: '1990-01-01'
  });

  // Step 4: Verify success
  cy.contains('Patient created').should('be.visible');
});
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  cypress-run:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run Cypress tests
        run: npm run test:e2e:headless

      - name: Upload screenshots on failure
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: cypress-screenshots
          path: cypress/screenshots

      - name: Upload videos
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: cypress-videos
          path: cypress/videos
```

### Environment Variables for CI

```bash
# .env.test
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=test-secret-key
DATABASE_URL=postgresql://test:test@localhost:5432/ehr_test
```

---

## Best Practices

### DO ✅

1. **Always login in beforeEach()**
   ```javascript
   beforeEach(() => {
     cy.login();
   });
   ```

2. **Use custom commands for reusability**
   ```javascript
   cy.createPatient({ ... });
   ```

3. **Add explicit waits for async operations**
   ```javascript
   cy.wait(1000);
   cy.url({ timeout: 10000 }).should('include', '/route');
   ```

4. **Clean up test data**
   ```javascript
   afterEach(() => {
     // Delete test records
   });
   ```

5. **Use data-testid attributes**
   ```html
   <button data-testid="submit-button">Submit</button>
   ```
   ```javascript
   cy.get('[data-testid="submit-button"]').click();
   ```

6. **Test user flows, not implementation**
   - Test what users do, not how code works
   - Focus on critical paths
   - Keep tests independent

### DON'T ❌

1. **Don't skip authentication**
   ```javascript
   // ❌ BAD
   it('test', () => {
     cy.visit('/patients'); // Will fail!
   });

   // ✅ GOOD
   it('test', () => {
     cy.login();
     cy.visit('/patients');
   });
   ```

2. **Don't use hardcoded waits excessively**
   ```javascript
   // ❌ BAD
   cy.wait(5000);

   // ✅ GOOD
   cy.contains('Text').should('be.visible');
   ```

3. **Don't test implementation details**
   ```javascript
   // ❌ BAD
   cy.get('.css-class-xyz-123').click();

   // ✅ GOOD
   cy.contains('Button Text').click();
   ```

4. **Don't share state between tests**
   ```javascript
   // ❌ BAD
   let patientId;
   it('creates patient', () => {
     patientId = 123;
   });
   it('uses patient', () => {
     cy.visit(`/patients/${patientId}`); // Fragile!
   });

   // ✅ GOOD
   it('creates and uses patient', () => {
     // Complete flow in one test
   });
   ```

5. **Don't commit sensitive data**
   ```javascript
   // ❌ BAD - in code
   cy.login('prod@company.com', 'realPassword123');

   // ✅ GOOD - in fixture
   cy.loginAs('testDoctor');
   ```

---

## Key Learnings

1. **Authentication is mandatory** - All protected routes require valid session
2. **Use fixtures for test data** - Centralized, reusable, maintainable
3. **Async operations need waits** - Authentication, navigation, API calls take time
4. **Specific selectors are better** - Use IDs when available, avoid generic selectors
5. **Test the auth flow separately** - Don't assume login works
6. **Wait for visibility** - Ensure elements are loaded before interaction

---

## Support & Resources

### Documentation
- [Cypress Docs](https://docs.cypress.io)
- [NextAuth.js Docs](https://next-auth.js.org)
- [EHR Connect README](../README.md)

### Getting Help
- Check `CYPRESS_AUTH_FIXED.md` for authentication fix details
- Review existing test files in `cypress/e2e/`
- Run tests with `--headed` flag to see what's happening
- Use Cypress GUI for debugging

### Contact
For questions about this setup, contact the development team or open an issue in the repository.

---

## Appendix: Full Configuration Reference

### cypress.config.js
```javascript
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1512,
    viewportHeight: 696,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
```

### package.json Scripts
```json
{
  "scripts": {
    "cypress": "cypress open",
    "cypress:headless": "cypress run",
    "cypress:chrome": "cypress run --browser chrome",
    "cypress:firefox": "cypress run --browser firefox",
    "test:e2e": "start-server-and-test dev http://localhost:3000 cypress:headless",
    "test:e2e:headless": "cypress run"
  }
}
```

---

**Last Updated**: 2025-12-20
**Version**: 1.0
**Maintainer**: EHR Connect Development Team
