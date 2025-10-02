#!/bin/bash

# EHRConnect Keycloak Theme Setup Script
# This script automates the build and deployment of the custom Keycloak theme

set -e

echo "🎨 EHRConnect Keycloak Theme Setup"
echo "==================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo -e "${YELLOW}⚠️  Maven is not installed${NC}"
    echo "Maven is required to build the Keycloak theme JAR file."
    echo ""
    echo "Install Maven:"
    echo "  macOS:   brew install maven"
    echo "  Ubuntu:  sudo apt-get install maven"
    echo "  Windows: choco install maven"
    echo ""
    echo -e "${YELLOW}Skipping JAR build. You can build it later with:${NC}"
    echo "  cd keycloak-theme && npm run build-keycloak-theme"
    echo ""
else
    # Build the theme
    echo "📦 Building Keycloak theme..."
    cd keycloak-theme
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo "📥 Installing dependencies..."
        npm install
    fi
    
    # Build the theme JAR
    echo "🔨 Building theme JAR file..."
    npm run build-keycloak-theme
    
    cd ..
    
    # Create themes directory
    mkdir -p keycloak/themes
    
    # Copy the JAR file
    echo "📋 Copying theme JAR to keycloak/themes/..."
    cp keycloak-theme/dist_keycloak/keycloak-theme-for-kc-*.jar keycloak/themes/ 2>/dev/null || {
        echo -e "${RED}❌ Failed to copy JAR file${NC}"
        echo "Make sure the build completed successfully"
        exit 1
    }
    
    echo -e "${GREEN}✅ Theme JAR built and copied successfully${NC}"
fi

# Update docker-compose.yml to mount the theme
echo ""
echo "🔧 Configuring docker-compose.yml..."

# Check if volume mount already exists
if grep -q "./keycloak/themes:/opt/keycloak/providers" docker-compose.yml; then
    echo -e "${GREEN}✅ docker-compose.yml already configured${NC}"
else
    echo -e "${YELLOW}⚠️  Updating docker-compose.yml to mount theme...${NC}"
    
    # Backup original file
    cp docker-compose.yml docker-compose.yml.backup
    
    # Add volume mount to keycloak service
    # This is a simple approach - in production you might want a more robust solution
    sed -i.bak '/volumes:/a\
      - ./keycloak/themes:/opt/keycloak/providers/
' docker-compose.yml
    
    echo -e "${GREEN}✅ docker-compose.yml updated (backup saved as docker-compose.yml.backup)${NC}"
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Start/restart Keycloak:"
echo "   docker-compose up -d keycloak"
echo ""
echo "2. Wait for Keycloak to start (check with: docker logs keycloak)"
echo ""
echo "3. The 'ehrconnect' theme is now automatically configured as the default!"
echo ""
echo "4. Test the theme:"
echo "   Open: http://localhost:8080/realms/ehr-realm/account"
echo ""
echo -e "${GREEN}✨ The custom theme will be applied automatically on first login!${NC}"
