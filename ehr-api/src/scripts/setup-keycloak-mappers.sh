#!/bin/bash

# Keycloak Mapper Configuration Script
# This script configures client mappers for the EHR Connect application

set -e

KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
KEYCLOAK_ADMIN_USER="${KEYCLOAK_ADMIN_USER:-admin}"
KEYCLOAK_ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-admin123}"
KEYCLOAK_REALM="${KEYCLOAK_REALM:-ehr-realm}"
CLIENT_ID="${1:-nextjs-client}"

echo "🔧 Configuring Keycloak client mappers..."
echo "🎯 Target client: $CLIENT_ID"
echo ""

# Get admin access token
echo "🔑 Getting admin access token..."
TOKEN_RESPONSE=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=admin-cli" \
  -d "username=$KEYCLOAK_ADMIN_USER" \
  -d "password=$KEYCLOAK_ADMIN_PASSWORD" \
  -d "grant_type=password")

ACCESS_TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Failed to get access token"
  echo "Response: $TOKEN_RESPONSE"
  exit 1
fi

echo "✅ Got access token"
echo ""

# Get client UUID
echo "📋 Finding client: $CLIENT_ID..."
CLIENTS=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$KEYCLOAK_REALM/clients?clientId=$CLIENT_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

CLIENT_UUID=$(echo $CLIENTS | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$CLIENT_UUID" ]; then
  echo "❌ Client '$CLIENT_ID' not found"
  exit 1
fi

echo "✅ Found client: $CLIENT_ID (UUID: $CLIENT_UUID)"
echo ""

# Create mapper function
create_mapper() {
  local name=$1
  local user_attr=$2
  local claim_name=$3
  local json_type=$4
  local multivalued=$5
  
  echo "➕ Creating mapper: $name..."
  
  MAPPER_JSON="{
    \"name\": \"$name\",
    \"protocol\": \"openid-connect\",
    \"protocolMapper\": \"oidc-usermodel-attribute-mapper\",
    \"consentRequired\": false,
    \"config\": {
      \"user.attribute\": \"$user_attr\",
      \"claim.name\": \"$claim_name\",
      \"jsonType.label\": \"$json_type\",
      \"id.token.claim\": \"true\",
      \"access.token.claim\": \"true\",
      \"userinfo.token.claim\": \"true\"
      $(if [ "$multivalued" = "true" ]; then echo ", \"multivalued\": \"true\""; fi)
    }
  }"
  
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    "$KEYCLOAK_URL/admin/realms/$KEYCLOAK_REALM/clients/$CLIENT_UUID/protocol-mappers/models" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$MAPPER_JSON")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  
  if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "409" ]; then
    echo "✅ Mapper '$name' created/exists"
  else
    echo "⚠️  Warning: Mapper '$name' response code: $HTTP_CODE"
  fi
}

# Create the mappers
create_mapper "org_id" "org_id" "org_id" "String" "false"
create_mapper "org_slug" "org_slug" "org_slug" "String" "false"
create_mapper "location_ids" "location_ids" "location_ids" "String" "false"
create_mapper "permissions" "permissions" "permissions" "String" "false"

echo ""
echo "✅ All client mappers configured successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Users need to log out and log back in for changes to take effect"
echo "2. New tokens will now include org_id, org_slug, location_ids, and permissions"
echo "3. The onboarding page should now display organization information correctly"
echo ""
