# Cypress E2E Testing for EHR Connect

This directory contains automated end-to-end tests for the EHR Connect application.

## Setup

### 1. Install Cypress

```bash
npm install --save-dev cypress
```

### 2. Verify Installation

```bash
npx cypress verify
```

## Running Tests

### Open Cypress Test Runner (Interactive Mode)

```bash
npx cypress open
```

This will open the Cypress Test Runner UI where you can:
- Select and run individual test files
- See tests execute in a real browser
- Debug tests with time-travel
- View screenshots and videos

### Run Tests in Headless Mode

```bash
# Run all tests
npx cypress run

# Run specific test file
npx cypress run --spec "cypress/e2e/patient-workflow.cy.js"

# Run in specific browser
npx cypress run --browser chrome
npx cypress run --browser firefox
npx cypress run --browser edge
```

## Test Structure

### Patient Workflow Tests (`patient-workflow.cy.js`)

Comprehensive tests covering:

1. **Patient List Management**
   - Navigation to patients page
   - Patient list display
   - Search functionality

2. **Patient Creation Workflow**
   - Form display and validation
   - Data entry
   - Form submission
   - Error handling

3. **Patient Details View**
   - Patient header information
   - Dashboard sections
   - Sidebar navigation
   - Care gaps display

4. **Encounter Management**
   - Encounter list display
   - Encounter creation
   - Encounter details view
   - Search and filtering

5. **Clinical Workflow Integration**
   - Cross-navigation between modules
   - Visit creation from patient page
   - Patient access from encounters

6. **Billing Dashboard**
   - Navigation to billing sections
   - Superbills access
   - Claims access

7. **Appointment & Staff Management**
   - Appointments navigation
   - Staff list access

## Custom Commands

Custom Cypress commands are available in `cypress/support/commands.js`:

### Authentication
```javascript
cy.login('user@example.com', 'password');
```

### Navigation
```javascript
cy.goToPatients();
cy.goToEncounters();
cy.goToBilling();
cy.goToPatientSection('Medications');
```

### Patient Management
```javascript
// Create patient
cy.createPatient({
  firstName: 'John',
  lastName: 'Doe',
  dob: '1980-01-01',
  phone: '555-0100',
  email: 'john.doe@example.com',
  address: '123 Main St',
  city: 'Springfield',
  state: 'IL',
  zip: '62701'
});

// Search patient
cy.searchPatient('John Doe');

// View patient
cy.viewPatient('John Doe');
```

### Clinical Operations
```javascript
// Create new visit
cy.createNewVisit();

// Order labs
cy.orderLabs(['CBC', 'BMP']);

// Prescribe medication
cy.prescribeMedication({
  name: 'Amoxicillin',
  dosage: '500mg',
  frequency: 'TID',
  duration: '10 days'
});
```

### Utility Commands
```javascript
// Filter encounters
cy.filterEncounters({ status: 'Active', type: 'Outpatient' });

// Check care gaps
cy.checkCareGaps();

// Export data
cy.exportData('CSV');

// Verify patient header
cy.verifyPatientHeader({
  name: 'John Doe',
  age: '45yrs',
  provider: 'Dr. Smith'
});
```

## Configuration

Cypress configuration is in `cypress.config.js`:

- **Base URL**: `http://localhost:3000`
- **Viewport**: 1512x696 (matching the browser dimensions used during testing)
- **Timeouts**: 10 seconds for commands, requests, and responses
- **Video Recording**: Enabled for all test runs
- **Screenshots**: Captured on test failure

## Best Practices

1. **Before Running Tests**
   - Ensure the application is running on `http://localhost:3000`
   - Database should be seeded with test data
   - Test user credentials should be available

2. **Writing Tests**
   - Use data-testid attributes for stable selectors
   - Avoid hard-coded waits; use `cy.wait()` only when necessary
   - Use custom commands for repeated actions
   - Group related tests in describe blocks
   - Keep tests independent and isolated

3. **Debugging**
   - Use `cy.pause()` to stop test execution
   - Use `cy.debug()` to print debug information
   - Check screenshots in `cypress/screenshots/`
   - Check videos in `cypress/videos/`

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Start application
        run: npm start &

      - name: Wait for app
        run: npx wait-on http://localhost:3000

      - name: Run Cypress tests
        uses: cypress-io/github-action@v5
        with:
          wait-on: 'http://localhost:3000'
          browser: chrome

      - name: Upload screenshots
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots

      - name: Upload videos
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: cypress-videos
          path: cypress/videos
```

## Troubleshooting

### Tests are flaky
- Increase timeout values in `cypress.config.js`
- Add explicit waits for async operations
- Use `cy.intercept()` to wait for API calls

### Cannot find elements
- Check if elements are rendered conditionally
- Verify selector specificity
- Use Cypress selector playground in Test Runner

### Application not loading
- Verify application is running on correct port
- Check baseUrl in configuration
- Review network requests in Cypress Test Runner

## Next Steps

1. Add more test coverage for:
   - Medication management
   - Lab orders and results
   - Imaging orders
   - Forms and documentation
   - Billing workflows
   - Claims processing

2. Implement authentication tests
3. Add API testing with `cy.request()`
4. Integrate with visual regression testing
5. Add performance testing metrics

## Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Cypress API](https://docs.cypress.io/api/table-of-contents)
