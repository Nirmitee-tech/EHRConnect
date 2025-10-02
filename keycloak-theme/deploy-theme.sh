#!/bin/bash

# EHRConnect Keycloak Theme Deployment Script
# This script automates the theme build and deployment process

set -e  # Exit on error

echo "🚀 Starting EHRConnect Keycloak Theme Deployment..."

# Step 1: Build the theme
echo "📦 Building theme..."
npm run build-keycloak-theme

# Step 2: Copy JARs to keycloak folder
echo "📋 Copying JARs to keycloak folder..."
cp dist_keycloak/*.jar ../keycloak/themes/

# Step 3: Copy JARs to running Keycloak container
echo "🐳 Copying JARs to Keycloak container..."
docker cp ../keycloak/themes/keycloak-theme-for-kc-22-to-25.jar ehrconnect-keycloak-1:/opt/keycloak/providers/
docker cp ../keycloak/themes/keycloak-theme-for-kc-all-other-versions.jar ehrconnect-keycloak-1:/opt/keycloak/providers/

# Step 4: Build Keycloak to install themes
echo "🔨 Building Keycloak with new themes..."
docker exec ehrconnect-keycloak-1 /opt/keycloak/bin/kc.sh build

# Step 5: Restart Keycloak
echo "🔄 Restarting Keycloak..."
cd .. && docker-compose restart keycloak

echo "✅ Theme deployment complete!"
echo "⏳ Waiting for Keycloak to start (30 seconds)..."
sleep 30

echo "🎉 Done! Your custom theme should now be active."
echo "📍 Visit: http://localhost:8080/realms/ehr-realm/account"
