#!/bin/bash

# Cypress Setup Script for EHR Connect
# This script installs Cypress and its dependencies

set -e

echo "🚀 Setting up Cypress for EHR Connect..."
echo ""

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the ehr-web directory."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing all dependencies..."
    npm install
else
    echo "📦 Installing Cypress dependencies..."
    npm install --save-dev cypress@^13.17.0 start-server-and-test@^2.0.10
fi

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Verify Cypress installation
echo "🔍 Verifying Cypress installation..."
npx cypress verify

echo ""
echo "✅ Cypress setup complete!"
echo ""
echo "📚 Available commands:"
echo "  npm run cypress              - Open Cypress Test Runner (interactive)"
echo "  npm run cypress:headless     - Run tests in headless mode"
echo "  npm run cypress:chrome       - Run tests in Chrome browser"
echo "  npm run cypress:firefox      - Run tests in Firefox browser"
echo "  npm run test:e2e             - Start dev server and run Cypress interactively"
echo "  npm run test:e2e:headless    - Start dev server and run tests headlessly"
echo ""
echo "🎯 Quick start:"
echo "  1. Make sure your dev server is running: npm run dev"
echo "  2. Open Cypress: npm run cypress"
echo "  3. Select 'patient-workflow.cy.js' from the E2E specs"
echo ""
echo "📖 For more information, see cypress/README.md"
