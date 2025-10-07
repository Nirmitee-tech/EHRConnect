#!/usr/bin/env node

/**
 * Sync User Permissions to Keycloak
 *
 * This script fetches user permissions from the database and syncs them
 * to Keycloak as user attributes, so they're included in JWT tokens.
 */

const { query } = require('../database/connection');
const KeycloakService = require('../services/keycloak.service');

require('dotenv').config();

async function getUsersWithPermissions() {
  const sql = `
    SELECT
      u.id,
      u.email,
      u.keycloak_user_id,
      ra.org_id,
      o.slug as org_slug,
      ARRAY_AGG(DISTINCT ra.location_id) FILTER (WHERE ra.location_id IS NOT NULL) as location_ids,
      ARRAY_AGG(DISTINCT jsonb_array_elements_text(r.permissions)) FILTER (WHERE r.permissions IS NOT NULL) as permissions
    FROM users u
    LEFT JOIN role_assignments ra ON u.id = ra.user_id AND ra.revoked_at IS NULL
    LEFT JOIN organizations o ON ra.org_id = o.id
    LEFT JOIN roles r ON ra.role_id = r.id
    WHERE u.status = 'active'
      AND u.keycloak_user_id IS NOT NULL
    GROUP BY u.id, u.email, u.keycloak_user_id, ra.org_id, o.slug
  `;

  const result = await query(sql);
  return result.rows;
}

async function updateKeycloakUserAttributes(keycloakUserId, attributes) {
  try {
    const token = await KeycloakService.getAdminToken();
    const realm = process.env.KEYCLOAK_REALM || 'ehr-realm';
    const keycloakUrl = process.env.KEYCLOAK_URL || 'http://localhost:8080';

    // Update user attributes
    const response = await fetch(
      `${keycloakUrl}/admin/realms/${realm}/users/${keycloakUserId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          attributes,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update Keycloak user: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error(`Error updating Keycloak user ${keycloakUserId}:`, error.message);
    return false;
  }
}

async function syncPermissions() {
  console.log('==============================================');
  console.log('Syncing User Permissions to Keycloak');
  console.log('==============================================\n');

  try {
    const users = await getUsersWithPermissions();
    console.log(`Found ${users.length} active users to sync\n`);

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      console.log(`Syncing user: ${user.email}`);

      // Prepare attributes
      const attributes = {
        user_id: [user.id],
        org_id: user.org_id ? [user.org_id] : [],
        org_slug: user.org_slug ? [user.org_slug] : [],
        permissions: user.permissions || [],
        location_ids: user.location_ids || [],
      };

      console.log(`  - Permissions: ${attributes.permissions.length}`);
      console.log(`  - Org: ${attributes.org_slug[0] || 'N/A'}`);
      console.log(`  - Locations: ${attributes.location_ids.length}`);

      const success = await updateKeycloakUserAttributes(
        user.keycloak_user_id,
        attributes
      );

      if (success) {
        console.log('  ✓ Synced successfully\n');
        successCount++;
      } else {
        console.log('  ✗ Failed to sync\n');
        failCount++;
      }
    }

    console.log('==============================================');
    console.log('Sync Complete');
    console.log('==============================================');
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    console.log(`Total: ${users.length}`);

    process.exit(failCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('Error during sync:', error);
    process.exit(1);
  }
}

// Run sync
syncPermissions();
