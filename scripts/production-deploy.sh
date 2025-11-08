#!/bin/bash

# EHR Connect - Production Deployment Script
# Complete setup for new production machine

set -e

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   EHR Connect - Production Deployment                   ║"
echo "║   Custom Keycloak Theme Setup                           ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js not found. Please install Node.js 18+ first.${NC}"
    echo "   macOS: brew install node"
    echo "   Linux: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not found. Please install Docker first.${NC}"
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker Compose not found. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"
echo ""

# Step 1: Install theme dependencies
echo -e "${BLUE}📦 Step 1/10: Installing theme dependencies...${NC}"
cd keycloak-theme
npm ci

# Step 2: Build theme
echo -e "${BLUE}🔨 Step 2/10: Building Keycloak theme...${NC}"
npm run build-keycloak-theme

# Step 3: Copy JARs to keycloak folder
echo -e "${BLUE}📋 Step 3/10: Copying JARs to keycloak folder...${NC}"
cp dist_keycloak/*.jar ../keycloak/themes/
cd ..

# Step 4: Start Docker services
echo -e "${BLUE}🐳 Step 4/10: Starting Docker services...${NC}"
docker-compose up -d

# Step 5: Wait for services to initialize
echo -e "${BLUE}⏳ Step 5/10: Waiting for services to initialize (60 seconds)...${NC}"
echo "   This ensures PostgreSQL and Keycloak are fully ready"
sleep 60

# Step 6: Verify Keycloak is ready
echo -e "${BLUE}🔍 Step 6/10: Verifying Keycloak is ready...${NC}"
MAX_RETRIES=5
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:8080/health/ready &> /dev/null; then
        echo -e "${GREEN}✅ Keycloak is ready${NC}"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo "   Attempt $RETRY_COUNT/$MAX_RETRIES - Keycloak not ready yet, waiting 15 more seconds..."
        sleep 15
    fi
done

# Step 7: Copy theme JARs to container
echo -e "${BLUE}🚚 Step 7/10: Copying theme JARs to Keycloak container...${NC}"
docker cp keycloak/themes/keycloak-theme-for-kc-22-to-25.jar ehrconnect-keycloak-1:/opt/keycloak/providers/
docker cp keycloak/themes/keycloak-theme-for-kc-all-other-versions.jar ehrconnect-keycloak-1:/opt/keycloak/providers/

# Step 8: Build Keycloak with theme
echo -e "${BLUE}🔨 Step 8/10: Building Keycloak with theme...${NC}"
docker exec ehrconnect-keycloak-1 /opt/keycloak/bin/kc.sh build

# Step 9: Restart Keycloak
echo -e "${BLUE}🔄 Step 9/10: Restarting Keycloak...${NC}"
docker-compose restart keycloak

# Step 10: Wait for restart
echo -e "${BLUE}⏳ Step 10/10: Waiting for Keycloak to restart (30 seconds)...${NC}"
sleep 30

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                          ║${NC}"
echo -e "${GREEN}║   ✅  DEPLOYMENT COMPLETE!                               ║${NC}"
echo -e "${GREEN}║                                                          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📍 Next Steps:${NC}"
echo ""
echo "1. 🌐 Open your application:"
echo "   http://localhost:3000"
echo ""
echo "2. 🔐 Click 'Sign In' to see the custom theme"
echo ""
echo "3. 👨‍💼 Access Keycloak Admin (if needed):"
echo "   URL:      http://localhost:8080"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "4. ⚙️  Configure realm theme (if not auto-applied):"
echo "   - Login to admin console"
echo "   - Select 'ehr-realm'"
echo "   - Go to: Realm Settings → Themes"
echo "   - Set Login Theme: ehrconnect"
echo "   - Click Save"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT FOR PRODUCTION:${NC}"
echo "   - Change default admin password"
echo "   - Configure HTTPS/SSL"
echo "   - Set up proper CORS origins"
echo "   - Configure email SMTP"
echo "   - Enable security features"
echo "   - Review PRODUCTION_DEPLOYMENT.md for complete checklist"
echo ""
echo -e "${GREEN}Happy Healthcare! 🏥${NC}"
