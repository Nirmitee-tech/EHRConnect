#!/bin/bash

# Country-Specific System Setup Script
# This script sets up and tests the country-specific configuration system

set -e

echo "================================================"
echo "Country-Specific System Setup"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DB_USER="medplum"
DB_NAME="medplum"
DB_HOST="localhost"
DB_PORT="5432"
API_URL="http://localhost:8000"

echo -e "${BLUE}Step 1: Verifying database connection...${NC}"
if docker exec ehrconnect-postgres-1 psql -U $DB_USER -d $DB_NAME -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${YELLOW}✗ Database connection failed. Make sure PostgreSQL is running.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}Step 2: Checking if migration is already applied...${NC}"
TABLE_COUNT=$(docker exec ehrconnect-postgres-1 psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'country_packs'" 2>/dev/null | tr -d ' ')

if [ "$TABLE_COUNT" -eq "1" ]; then
    echo -e "${GREEN}✓ Country tables already exist${NC}"
else
    echo -e "${YELLOW}! Country tables not found. Running migration...${NC}"
    docker exec -i ehrconnect-postgres-1 psql -U $DB_USER -d $DB_NAME < ehr-api/src/database/migrations/022_country_specific_system.sql
    echo -e "${GREEN}✓ Migration completed${NC}"
fi

echo ""
echo -e "${BLUE}Step 3: Verifying seeded data...${NC}"

# Check country packs
COUNTRY_COUNT=$(docker exec ehrconnect-postgres-1 psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM country_packs" 2>/dev/null | tr -d ' ')
echo "   - Country packs: $COUNTRY_COUNT"

# Check modules
MODULE_COUNT=$(docker exec ehrconnect-postgres-1 psql -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM country_modules WHERE country_code = 'IN'" 2>/dev/null | tr -d ' ')
echo "   - India modules: $MODULE_COUNT"

if [ "$COUNTRY_COUNT" -ge "3" ] && [ "$MODULE_COUNT" -ge "3" ]; then
    echo -e "${GREEN}✓ Seed data verified${NC}"
else
    echo -e "${YELLOW}✗ Seed data incomplete. Re-running migration...${NC}"
    docker exec -i ehrconnect-postgres-1 psql -U $DB_USER -d $DB_NAME < ehr-api/src/database/migrations/022_country_specific_system.sql
fi

echo ""
echo -e "${BLUE}Step 4: Testing API endpoints...${NC}"

# Test country packs endpoint
echo "   Testing GET /api/countries/packs..."
if curl -s "${API_URL}/api/countries/packs" | grep -q "India"; then
    echo -e "${GREEN}   ✓ Country packs endpoint working${NC}"
else
    echo -e "${YELLOW}   ✗ Country packs endpoint not responding${NC}"
    echo -e "${YELLOW}   Note: Make sure the API server is running with 'npm start' in ehr-api${NC}"
fi

# Test India modules endpoint
echo "   Testing GET /api/countries/packs/IN/modules..."
if curl -s "${API_URL}/api/countries/packs/IN/modules" | grep -q "abha-m1"; then
    echo -e "${GREEN}   ✓ India modules endpoint working${NC}"
else
    echo -e "${YELLOW}   ✗ India modules endpoint not responding${NC}"
fi

echo ""
echo -e "${BLUE}Step 5: Sample organization setup${NC}"

# Get a sample org and user
ORG_DATA=$(docker exec ehrconnect-postgres-1 psql -U $DB_USER -d $DB_NAME -t -c "SELECT id, name FROM organizations LIMIT 1" 2>/dev/null)
ORG_ID=$(echo "$ORG_DATA" | awk '{print $1}' | tr -d ' ')
ORG_NAME=$(echo "$ORG_DATA" | awk '{print $3}')

USER_ID=$(docker exec ehrconnect-postgres-1 psql -U $DB_USER -d $DB_NAME -t -c "SELECT id FROM users WHERE status = 'active' LIMIT 1" 2>/dev/null | tr -d ' ')

if [ -n "$ORG_ID" ] && [ -n "$USER_ID" ]; then
    echo "   Sample Organization: $ORG_NAME"
    echo "   Org ID: $ORG_ID"
    echo "   User ID: $USER_ID"

    echo ""
    echo -e "${YELLOW}To enable India pack for this org, run:${NC}"
    echo ""
    echo "curl -X PUT \"${API_URL}/api/admin/orgs/${ORG_ID}/country\" \\"
    echo "  -H \"Content-Type: application/json\" \\"
    echo "  -H \"x-org-id: ${ORG_ID}\" \\"
    echo "  -H \"x-user-id: ${USER_ID}\" \\"
    echo "  -H \"x-user-roles: [\\\"ADMIN\\\"]\" \\"
    echo "  -d '{\"countryCode\": \"IN\", \"scope\": \"org\"}'"

    echo ""
    echo -e "${YELLOW}To enable ABHA M1 module:${NC}"
    echo ""
    echo "curl -X PUT \"${API_URL}/api/admin/orgs/${ORG_ID}/country/modules\" \\"
    echo "  -H \"Content-Type: application/json\" \\"
    echo "  -H \"x-org-id: ${ORG_ID}\" \\"
    echo "  -H \"x-user-id: ${USER_ID}\" \\"
    echo "  -H \"x-user-roles: [\\\"ADMIN\\\"]\" \\"
    echo "  -d '{\"enable\": [{\"countryCode\": \"IN\", \"moduleCode\": \"abha-m1\", \"config\": {\"mode\": \"sandbox\"}}]}'"
else
    echo -e "${YELLOW}   ✗ Could not find sample organization/user${NC}"
fi

echo ""
echo "================================================"
echo -e "${GREEN}Setup Complete!${NC}"
echo "================================================"
echo ""
echo "📚 Documentation:"
echo "   - Full Guide: docs/COUNTRY_SPECIFIC_SYSTEM.md"
echo "   - Quick Start: docs/COUNTRY_SPECIFIC_QUICK_START.md"
echo "   - API Reference: docs/COUNTRY_API_REFERENCE.md"
echo ""
echo "🎯 Next Steps:"
echo "   1. Start the API server: cd ehr-api && npm start"
echo "   2. Navigate to: http://localhost:3000/admin/settings/country"
echo "   3. Select India and enable ABHA modules"
echo "   4. Use the hooks in your components:"
echo "      import { useIsModuleEnabled } from '@/contexts/country-context';"
echo ""
echo "🔧 Frontend Integration:"
echo "   - CountryProvider is already added to app/layout.tsx"
echo "   - Types available in: src/types/country.ts"
echo "   - Service available in: src/services/country.service.ts"
echo "   - ABHA component: src/features/countries/india/abha-m1/"
echo ""
echo "✅ All files created and ready to use!"
echo ""
