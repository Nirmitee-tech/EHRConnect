#!/bin/bash

# Keycloak Permission Mappers Setup Script
# This script creates protocol mappers to include user permissions in JWT tokens

set -e

# Configuration
KEYCLOAK_URL="${KEYCLOAK_URL:-http://localhost:8080}"
REALM="${KEYCLOAK_REALM:-ehr-realm}"
CLIENT_ID="${KEYCLOAK_CLIENT_ID:-nextjs-client}"
ADMIN_USER="${KEYCLOAK_ADMIN_USER:-admin}"
ADMIN_PASSWORD="${KEYCLOAK_ADMIN_PASSWORD:-admin123}"

echo "================================================"
echo "Keycloak Permission Mappers Setup"
echo "================================================"
echo "Keycloak URL: $KEYCLOAK_URL"
echo "Realm: $REALM"
echo "Client ID: $CLIENT_ID"
echo ""

# Function to get admin token
get_admin_token() {
    echo "Authenticating with Keycloak..."
    TOKEN=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "username=$ADMIN_USER" \
        -d "password=$ADMIN_PASSWORD" \
        -d "grant_type=password" \
        -d "client_id=admin-cli" | jq -r '.access_token')

    if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
        echo "Error: Failed to authenticate with Keycloak"
        exit 1
    fi
    echo "✓ Authentication successful"
}

# Function to get client UUID
get_client_uuid() {
    echo "Getting client UUID for $CLIENT_ID..."
    CLIENT_UUID=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM/clients?clientId=$CLIENT_ID" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" | jq -r '.[0].id')

    if [ -z "$CLIENT_UUID" ] || [ "$CLIENT_UUID" = "null" ]; then
        echo "Error: Client $CLIENT_ID not found in realm $REALM"
        exit 1
    fi
    echo "✓ Client UUID: $CLIENT_UUID"
}

# Function to create mapper
create_mapper() {
    local mapper_name=$1
    local mapper_config=$2

    echo "Creating mapper: $mapper_name..."

    response=$(curl -s -w "\n%{http_code}" -X POST \
        "$KEYCLOAK_URL/admin/realms/$REALM/clients/$CLIENT_UUID/protocol-mappers/models" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "$mapper_config")

    http_code=$(echo "$response" | tail -n1)

    if [ "$http_code" -eq 201 ] || [ "$http_code" -eq 204 ]; then
        echo "✓ Mapper created: $mapper_name"
    elif [ "$http_code" -eq 409 ]; then
        echo "⚠ Mapper already exists: $mapper_name"
    else
        echo "✗ Failed to create mapper: $mapper_name (HTTP $http_code)"
    fi
}

# Main setup
get_admin_token
get_client_uuid

echo ""
echo "Creating protocol mappers..."
echo "----------------------------"

# 1. User Permissions Mapper (from database via script)
# This will be populated by a custom script that queries user permissions
create_mapper "user-permissions" '{
  "name": "user-permissions",
  "protocol": "openid-connect",
  "protocolMapper": "oidc-usermodel-attribute-mapper",
  "consentRequired": false,
  "config": {
    "userinfo.token.claim": "true",
    "user.attribute": "permissions",
    "id.token.claim": "true",
    "access.token.claim": "true",
    "claim.name": "permissions",
    "jsonType.label": "JSON",
    "multivalued": "true"
  }
}'

# 2. Organization ID Mapper
create_mapper "org-id" '{
  "name": "org-id",
  "protocol": "openid-connect",
  "protocolMapper": "oidc-usermodel-attribute-mapper",
  "consentRequired": false,
  "config": {
    "userinfo.token.claim": "true",
    "user.attribute": "org_id",
    "id.token.claim": "true",
    "access.token.claim": "true",
    "claim.name": "org_id",
    "jsonType.label": "String"
  }
}'

# 3. Organization Slug Mapper
create_mapper "org-slug" '{
  "name": "org-slug",
  "protocol": "openid-connect",
  "protocolMapper": "oidc-usermodel-attribute-mapper",
  "consentRequired": false,
  "config": {
    "userinfo.token.claim": "true",
    "user.attribute": "org_slug",
    "id.token.claim": "true",
    "access.token.claim": "true",
    "claim.name": "org_slug",
    "jsonType.label": "String"
  }
}'

# 4. Location IDs Mapper
create_mapper "location-ids" '{
  "name": "location-ids",
  "protocol": "openid-connect",
  "protocolMapper": "oidc-usermodel-attribute-mapper",
  "consentRequired": false,
  "config": {
    "userinfo.token.claim": "true",
    "user.attribute": "location_ids",
    "id.token.claim": "true",
    "access.token.claim": "true",
    "claim.name": "location_ids",
    "jsonType.label": "JSON",
    "multivalued": "true"
  }
}'

# 5. User ID Mapper
create_mapper "user-id" '{
  "name": "user-id",
  "protocol": "openid-connect",
  "protocolMapper": "oidc-usermodel-attribute-mapper",
  "consentRequired": false,
  "config": {
    "userinfo.token.claim": "true",
    "user.attribute": "user_id",
    "id.token.claim": "true",
    "access.token.claim": "true",
    "claim.name": "user_id",
    "jsonType.label": "String"
  }
}'

# 6. Roles Mapper (existing realm roles)
create_mapper "realm-roles" '{
  "name": "realm-roles",
  "protocol": "openid-connect",
  "protocolMapper": "oidc-usermodel-realm-role-mapper",
  "consentRequired": false,
  "config": {
    "userinfo.token.claim": "true",
    "id.token.claim": "true",
    "access.token.claim": "true",
    "claim.name": "realm_access.roles",
    "jsonType.label": "String",
    "multivalued": "true"
  }
}'

echo ""
echo "================================================"
echo "✓ Protocol mappers setup complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Verify mappers in Keycloak admin console:"
echo "   $KEYCLOAK_URL/admin/$REALM/console/#/$REALM/clients/$CLIENT_UUID/mappers"
echo ""
echo "2. Set user attributes via Keycloak admin API or database sync"
echo "3. Test token generation to verify claims are included"
echo ""
