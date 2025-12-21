#!/bin/bash

# Cypress Verification Script
# Checks if Cypress is properly installed and configured

set -e

echo "🔍 Verifying Cypress Installation..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    echo "Please run this script from the ehr-web directory"
    exit 1
fi

echo "✓ Found package.json"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${RED}❌ node_modules not found${NC}"
    echo "Please run: npm install"
    exit 1
fi

echo "✓ Found node_modules"

# Check if Cypress is installed
if [ ! -d "node_modules/cypress" ]; then
    echo -e "${RED}❌ Cypress not installed${NC}"
    echo "Please run: npm install --save-dev cypress"
    exit 1
fi

echo "✓ Cypress package installed"

# Check if cypress directory exists
if [ ! -d "cypress" ]; then
    echo -e "${RED}❌ cypress directory not found${NC}"
    echo "Test files are missing"
    exit 1
fi

echo "✓ Found cypress directory"

# Check if cypress.config.js exists
if [ ! -f "cypress.config.js" ]; then
    echo -e "${RED}❌ cypress.config.js not found${NC}"
    exit 1
fi

echo "✓ Found cypress.config.js"

# Check if test files exist
if [ ! -f "cypress/e2e/patient-workflow.cy.js" ]; then
    echo -e "${YELLOW}⚠️  Warning: patient-workflow.cy.js not found${NC}"
else
    echo "✓ Found test file: patient-workflow.cy.js"
fi

# Verify Cypress binary
echo ""
echo "Verifying Cypress binary..."
if npx cypress verify > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Cypress binary verified${NC}"
else
    echo -e "${RED}❌ Cypress binary verification failed${NC}"
    echo "Try running: npx cypress install"
    exit 1
fi

# Check if dev server can start (just check the command exists)
if grep -q '"dev"' package.json; then
    echo "✓ Dev server command found in package.json"
else
    echo -e "${YELLOW}⚠️  Warning: 'dev' script not found in package.json${NC}"
fi

# Check Cypress version
CYPRESS_VERSION=$(npx cypress version --component binary 2>/dev/null || echo "unknown")
echo ""
echo -e "${GREEN}✅ Cypress Installation Verified!${NC}"
echo ""
echo "Cypress Version: $CYPRESS_VERSION"
echo ""
echo "Next steps:"
echo "  1. Start dev server: npm run dev"
echo "  2. Run Cypress: npm run cypress"
echo ""
echo "Or use all-in-one command: npm run test:e2e"
