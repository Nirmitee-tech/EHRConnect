const KeycloakService = require('../services/keycloak.service');

/**
 * Script to configure Keycloak client mappers for custom user attributes
 * Run this once after setting up Keycloak to ensure JWT tokens include org_id, org_slug, etc.
 */

async function configureClientMappers() {
  console.log('🔧 Configuring Keycloak client mappers...\n');

  try {
    // Use the client ID from command line arg or default to 'nextjs-client'
    const clientId = process.argv[2] || 'nextjs-client';
    console.log(`🎯 Target client: ${clientId}\n`);

    // Get the client's internal ID
    console.log(`📋 Finding client: ${clientId}`);
    const clients = await KeycloakService.adminRequest('GET', `/clients?clientId=${clientId}`);

    if (clients.length === 0) {
      throw new Error(`Client '${clientId}' not found in Keycloak`);
    }

    const client = clients[0];
    console.log(`✅ Found client: ${client.clientId} (ID: ${client.id})\n`);

    // Define the mappers to create
    const mappers = [
      {
        name: 'org_id',
        protocol: 'openid-connect',
        protocolMapper: 'oidc-usermodel-attribute-mapper',
        consentRequired: false,
        config: {
          'user.attribute': 'org_id',
          'claim.name': 'org_id',
          'jsonType.label': 'String',
          'id.token.claim': 'true',
          'access.token.claim': 'true',
          'userinfo.token.claim': 'true'
        }
      },
      {
        name: 'org_slug',
        protocol: 'openid-connect',
        protocolMapper: 'oidc-usermodel-attribute-mapper',
        consentRequired: false,
        config: {
          'user.attribute': 'org_slug',
          'claim.name': 'org_slug',
          'jsonType.label': 'String',
          'id.token.claim': 'true',
          'access.token.claim': 'true',
          'userinfo.token.claim': 'true'
        }
      },
      {
        name: 'location_ids',
        protocol: 'openid-connect',
        protocolMapper: 'oidc-usermodel-attribute-mapper',
        consentRequired: false,
        config: {
          'user.attribute': 'location_ids',
          'claim.name': 'location_ids',
          'jsonType.label': 'JSON',
          'id.token.claim': 'true',
          'access.token.claim': 'true',
          'userinfo.token.claim': 'true',
          'multivalued': 'true'
        }
      },
      {
        name: 'permissions',
        protocol: 'openid-connect',
        protocolMapper: 'oidc-usermodel-attribute-mapper',
        consentRequired: false,
        config: {
          'user.attribute': 'permissions',
          'claim.name': 'permissions',
          'jsonType.label': 'JSON',
          'id.token.claim': 'true',
          'access.token.claim': 'true',
          'userinfo.token.claim': 'true',
          'multivalued': 'true'
        }
      }
    ];

    // Get existing mappers
    const existingMappers = await KeycloakService.adminRequest('GET', `/clients/${client.id}/protocol-mappers/models`);

    // Create or update mappers
    for (const mapper of mappers) {
      const existing = existingMappers.find(m => m.name === mapper.name);
      
      if (existing) {
        console.log(`🔄 Updating mapper: ${mapper.name}`);
        await KeycloakService.adminRequest('PUT', `/clients/${client.id}/protocol-mappers/models/${existing.id}`, {
          ...existing,
          ...mapper
        });
      } else {
        console.log(`➕ Creating mapper: ${mapper.name}`);
        await KeycloakService.adminRequest('POST', `/clients/${client.id}/protocol-mappers/models`, mapper);
      }
    }

    console.log('\n✅ All client mappers configured successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Users need to log out and log back in for changes to take effect');
    console.log('2. New tokens will now include org_id, org_slug, location_ids, and permissions');
    console.log('3. The onboarding page should now display organization information correctly\n');

  } catch (error) {
    console.error('\n❌ Error configuring mappers:', error.message);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

// Run the script if executed directly
if (require.main === module) {
  require('dotenv').config();
  
  configureClientMappers()
    .then(() => {
      console.log('✨ Configuration complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { configureClientMappers };
