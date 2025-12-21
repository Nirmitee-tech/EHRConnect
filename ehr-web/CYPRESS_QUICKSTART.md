# Cypress E2E Testing - Quick Start Guide

## 🚀 One-Time Setup

### Option 1: Automated Setup (Recommended)

Run the setup script to install everything automatically:

```bash
cd ehr-web
./cypress-setup.sh
```

This will:
- ✅ Install Cypress and all dependencies
- ✅ Verify the installation
- ✅ Show available commands

### Option 2: Manual Setup

If you prefer to install manually:

```bash
cd ehr-web
npm install --save-dev cypress@^13.17.0 start-server-and-test@^2.0.10
npx cypress verify
```

## 🎯 Running Tests

### Quick Start (Most Common)

1. **Start your dev server** (in one terminal):
   ```bash
   cd ehr-web
   npm run dev
   ```

2. **Open Cypress** (in another terminal):
   ```bash
   cd ehr-web
   npm run cypress
   ```

3. **Select a test** from the Cypress Test Runner UI:
   - Click on "E2E Testing"
   - Choose a browser (Chrome recommended)
   - Click on `patient-workflow.cy.js`

### All-in-One Command

Start dev server AND run Cypress in one command:

```bash
npm run test:e2e
```

This will:
- Start the Next.js dev server
- Wait for it to be ready at http://localhost:3000
- Open Cypress Test Runner automatically

## 📋 Available NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run cypress` | Open Cypress Test Runner (interactive mode) |
| `npm run cypress:headless` | Run all tests in headless mode (no UI) |
| `npm run cypress:chrome` | Run tests in Chrome browser |
| `npm run cypress:firefox` | Run tests in Firefox browser |
| `npm run test:e2e` | Start dev server + open Cypress |
| `npm run test:e2e:headless` | Start dev server + run tests headlessly |

## 🎬 Test Files

Current test coverage:

### `cypress/e2e/patient-workflow.cy.js`

Comprehensive workflow testing including:
- ✅ Patient list navigation
- ✅ Patient creation with form validation
- ✅ Patient details viewing
- ✅ Encounter management
- ✅ Billing dashboard access
- ✅ Appointment scheduling
- ✅ Staff management

**Test Count:** 20+ tests covering complete patient workflow

## 🔧 Custom Commands

We've added custom Cypress commands to make testing easier:

```javascript
// Login
cy.login('user@example.com', 'password');

// Create patient
cy.createPatient({
  firstName: 'John',
  lastName: 'Doe',
  dob: '1980-01-01',
  phone: '555-0100',
  email: 'john.doe@example.com'
});

// Navigation
cy.goToPatients();
cy.goToEncounters();
cy.goToBilling();

// Search
cy.searchPatient('John Doe');

// View patient
cy.viewPatient('John Doe');

// Order labs
cy.orderLabs(['CBC', 'BMP']);

// Prescribe medication
cy.prescribeMedication({
  name: 'Amoxicillin',
  dosage: '500mg',
  frequency: 'TID'
});
```

See `cypress/support/commands.js` for all available commands.

## 📊 Viewing Results

### Interactive Mode

When running `npm run cypress`:
- Watch tests run in real-time
- Time-travel through test steps
- See network requests
- View console logs
- Take manual snapshots

### Headless Mode

When running `npm run cypress:headless`:
- Videos saved to `cypress/videos/`
- Screenshots (on failure) saved to `cypress/screenshots/`
- Test results in terminal

## 🐛 Debugging

### In Cypress Test Runner

```javascript
// Pause test execution
cy.pause();

// Print debug info to console
cy.debug();

// Take a screenshot
cy.screenshot('my-screenshot');
```

### Common Issues

**Issue:** Tests can't find elements
```bash
# Solution: Increase timeout
// In test file:
cy.get('button', { timeout: 10000 })
```

**Issue:** Application not loading
```bash
# Solution: Check if dev server is running
curl http://localhost:3000

# Or check the baseUrl in cypress.config.js
```

**Issue:** Flaky tests
```bash
# Solution: Add explicit waits
cy.intercept('GET', '/api/patients').as('getPatients');
cy.wait('@getPatients');
```

## 📁 File Structure

```
ehr-web/
├── cypress/
│   ├── e2e/
│   │   └── patient-workflow.cy.js    # Main test file
│   ├── support/
│   │   ├── commands.js                # Custom commands
│   │   └── e2e.js                     # Global config
│   ├── tsconfig.json                  # TypeScript config
│   └── README.md                      # Detailed docs
├── cypress.config.js                  # Cypress configuration
└── cypress-setup.sh                   # Setup script
```

## 🔄 CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/cypress.yml`:

```yaml
name: Cypress E2E Tests

on: [push, pull_request]

jobs:
  cypress-run:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
          cache-dependency-path: ehr-web/package-lock.json

      - name: Install dependencies
        working-directory: ./ehr-web
        run: npm ci

      - name: Cypress run
        uses: cypress-io/github-action@v6
        with:
          working-directory: ./ehr-web
          start: npm run dev
          wait-on: 'http://localhost:3000'
          wait-on-timeout: 120
          browser: chrome

      - name: Upload screenshots
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots
          path: ehr-web/cypress/screenshots

      - name: Upload videos
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: cypress-videos
          path: ehr-web/cypress/videos
```

## 📚 Next Steps

1. **Run your first test:**
   ```bash
   npm run test:e2e
   ```

2. **Review test results** in the Cypress Test Runner

3. **Add more tests** by creating new files in `cypress/e2e/`

4. **Customize configuration** in `cypress.config.js`

5. **Create custom commands** in `cypress/support/commands.js`

## 🆘 Need Help?

- **Cypress Docs:** https://docs.cypress.io/
- **Best Practices:** https://docs.cypress.io/guides/references/best-practices
- **Examples:** Check `cypress/e2e/patient-workflow.cy.js` for working examples
- **Full Documentation:** See `cypress/README.md`

## ✅ Verification Checklist

Before running tests, ensure:

- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] Dev server runs (`npm run dev`)
- [ ] Application loads at http://localhost:3000
- [ ] Cypress installed (`npx cypress verify`)

---

**Ready to test!** 🎉

Run `npm run test:e2e` to start your first automated test.
