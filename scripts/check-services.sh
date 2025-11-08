#!/bin/bash

echo "🔍 Checking EHRConnect Services..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check PostgreSQL
echo "📦 PostgreSQL Database:"
if psql -U medplum -d medplum -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
else
    echo -e "${RED}❌ PostgreSQL is NOT running${NC}"
    echo "   Start with: brew services start postgresql"
fi
echo ""

# Check Redis
echo "🔴 Redis Cache:"
if redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is running${NC}"
else
    echo -e "${RED}❌ Redis is NOT running${NC}"
    echo "   Start with: brew services start redis"
    echo "   Or: docker run -d -p 6379:6379 redis:7-alpine"
fi
echo ""

# Check Backend API (port 8000)
echo "🔧 Backend API (port 8000):"
if lsof -ti:8000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running on port 8000${NC}"

    # Test FHIR endpoint
    if curl -s 'http://localhost:8000/fhir/R4/metadata' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ FHIR endpoint is accessible${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend is running but FHIR endpoint not responding${NC}"
    fi
else
    echo -e "${RED}❌ Backend is NOT running${NC}"
    echo "   Start with:"
    echo "   cd ehr-api && npm run dev"
fi
echo ""

# Check Frontend (port 3000)
echo "🌐 Frontend (port 3000):"
if lsof -ti:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running on port 3000${NC}"
else
    echo -e "${RED}❌ Frontend is NOT running${NC}"
    echo "   Start with:"
    echo "   cd ehr-web && npm run dev"
fi
echo ""

# Check environment variables
echo "⚙️  Environment Variables:"

# Check backend .env
if [ -f "ehr-api/.env" ]; then
    echo -e "${GREEN}✅ ehr-api/.env exists${NC}"

    # Check for important vars
    if grep -q "DATABASE_URL" ehr-api/.env 2>/dev/null; then
        echo "   ✓ DATABASE_URL is set"
    else
        echo -e "${YELLOW}   ⚠️  DATABASE_URL not found${NC}"
    fi

    if grep -q "REDIS_URL" ehr-api/.env 2>/dev/null; then
        echo "   ✓ REDIS_URL is set"
    else
        echo -e "${YELLOW}   ⚠️  REDIS_URL not found (should be redis://localhost:6379)${NC}"
    fi
else
    echo -e "${RED}❌ ehr-api/.env NOT found${NC}"
    echo "   Copy from: cp ehr-api/.env.example ehr-api/.env"
fi

# Check frontend .env
if [ -f "ehr-web/.env.local" ]; then
    echo -e "${GREEN}✅ ehr-web/.env.local exists${NC}"

    if grep -q "NEXT_PUBLIC_API_URL" ehr-web/.env.local 2>/dev/null; then
        echo "   ✓ NEXT_PUBLIC_API_URL is set"
    else
        echo -e "${YELLOW}   ⚠️  NEXT_PUBLIC_API_URL not found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  ehr-web/.env.local NOT found${NC}"
    echo "   Copy from: cp ehr-web/.env.example ehr-web/.env.local"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Summary
ISSUES=0

if ! psql -U medplum -d medplum -c "SELECT 1;" > /dev/null 2>&1; then
    ((ISSUES++))
fi

if ! redis-cli ping > /dev/null 2>&1; then
    ((ISSUES++))
fi

if ! lsof -ti:8000 > /dev/null 2>&1; then
    ((ISSUES++))
fi

if ! lsof -ti:3000 > /dev/null 2>&1; then
    ((ISSUES++))
fi

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ All services are running!${NC}"
    echo ""
    echo "🌐 Access the application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:8000"
    echo "   FHIR API: http://localhost:8000/fhir/R4/metadata"
else
    echo -e "${YELLOW}⚠️  Found $ISSUES issue(s) that need attention${NC}"
    echo ""
    echo "📝 Quick Start Guide:"
    echo ""
    echo "1. Start PostgreSQL:"
    echo "   brew services start postgresql"
    echo ""
    echo "2. Start Redis:"
    echo "   brew services start redis"
    echo ""
    echo "3. Start Backend:"
    echo "   cd ehr-api && npm run dev"
    echo ""
    echo "4. Start Frontend (in new terminal):"
    echo "   cd ehr-web && npm run dev"
fi

echo ""
