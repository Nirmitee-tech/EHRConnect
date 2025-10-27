const { query, transaction } = require('../database/connection');
const crypto = require('crypto');
const KeycloakService = require('./keycloak.service');
const RBACService = require('./rbac.service');
const { syncUserLocations } = require('../utils/user-location-sync');

/**
 * Staff Invitation Service
 * Handles invitation creation, acceptance, and provisioning
 */

class InvitationService {
  /**
   * Create staff invitation
   */
  async createInvitation(invitationData, invitedBy) {
    const {
      org_id,
      email,
      role_keys,
      scope,
      location_ids = [],
      department_ids = [],
      expires_in_days = 7
    } = invitationData;

    const normalizedLocationIds = Array.isArray(location_ids)
      ? [...new Set(location_ids.filter(Boolean))]
      : [];

    // Validate
    if (!org_id || !email || !role_keys || role_keys.length === 0 || !scope) {
      throw new Error('Missing required fields');
    }

    if (scope === 'LOCATION' && normalizedLocationIds.length === 0) {
      throw new Error('Location scoped invitations require at least one location_id');
    }

    // Check if user already exists in this org
    const existingUser = await query(
      `SELECT u.id FROM users u
       JOIN role_assignments ra ON u.id = ra.user_id
       WHERE u.email = $1 AND ra.org_id = $2 AND ra.revoked_at IS NULL
       LIMIT 1`,
      [email, org_id]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User already exists in this organization');
    }

    return await transaction(async (client) => {
      // Verify roles exist
      const roleCheck = await client.query(
        `SELECT key FROM roles 
         WHERE key = ANY($1) AND (is_system = true OR org_id = $2)`,
        [role_keys, org_id]
      );

      if (roleCheck.rows.length !== role_keys.length) {
        throw new Error('One or more roles not found');
      }

      // Generate secure token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expires_in_days);

      // Create invitation
      const result = await client.query(
        `INSERT INTO invitations (
          org_id, email, invited_by, role_keys, scope,
          location_ids, department_ids, token, expires_at, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'sent')
        RETURNING *`,
        [
          org_id,
          email,
          invitedBy,
          role_keys,
          scope,
          normalizedLocationIds,
          department_ids,
          token,
          expiresAt
        ]
      );

      // Audit log
      await client.query(
        `INSERT INTO audit_events (
          org_id, actor_user_id, action, target_type, target_id,
          target_name, status, metadata
        )
        VALUES ($1, $2, 'USER.INVITED', 'Invitation', $3, $4, 'success', $5)`,
        [org_id, invitedBy, result.rows[0].id, email, JSON.stringify({ role_keys, scope })]
      );

      return result.rows[0];
    });
  }

  /**
   * Get invitation by token
   */
  async getInvitationByToken(token) {
    const result = await query(
      `SELECT 
        i.*,
        o.name as org_name,
        o.slug as org_slug,
        ib.name as invited_by_name
       FROM invitations i
       JOIN organizations o ON i.org_id = o.id
       JOIN users ib ON i.invited_by = ib.id
       WHERE i.token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      throw new Error('Invitation not found');
    }

    const invitation = result.rows[0];

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error('Invitation has expired');
    }

    // Check if already accepted
    if (invitation.status !== 'sent') {
      throw new Error(`Invitation already ${invitation.status}`);
    }

    return invitation;
  }

  /**
   * Accept invitation and provision user
   */
  async acceptInvitation(token, acceptanceData) {
    const { name, password } = acceptanceData;

    if (!name || !password) {
      throw new Error('Name and password are required');
    }

    // Get invitation
    const invitation = await this.getInvitationByToken(token);

    return await transaction(async (client) => {
      // Create user in Keycloak first
      const keycloakUser = await KeycloakService.createUser({
        email: invitation.email,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' '),
        password: password,
        emailVerified: true, // Auto-verify since they accepted invite
        enabled: true,
        attributes: {
          org_id: invitation.org_id,
          org_slug: invitation.org_slug,
          location_ids: invitation.location_ids || [],
          permissions: [] // Will be set after role assignment
        }
      });

      // Create user in database
      const userResult = await client.query(
        `INSERT INTO users (
          email, name, keycloak_user_id, status
        )
        VALUES ($1, $2, $3, 'active')
        RETURNING *`,
        [invitation.email, name, keycloakUser.id]
      );

      const user = userResult.rows[0];

      // Assign roles
      const roleResults = await client.query(
        `SELECT id, key, permissions FROM roles WHERE key = ANY($1)`,
        [invitation.role_keys]
      );

      for (const role of roleResults.rows) {
        if (invitation.scope === 'LOCATION') {
          for (const locationId of invitation.location_ids || []) {
            const exists = await client.query(
              `SELECT 1 FROM role_assignments
               WHERE user_id = $1 AND org_id = $2 AND role_id = $3
                 AND scope = $4 AND location_id = $5
                 AND revoked_at IS NULL
               LIMIT 1`,
              [user.id, invitation.org_id, role.id, invitation.scope, locationId]
            );

            if (exists.rows.length > 0) {
              continue;
            }

            await client.query(
              `INSERT INTO role_assignments (
                user_id, org_id, role_id, scope, location_id, assigned_by
              )
              VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                user.id,
                invitation.org_id,
                role.id,
                invitation.scope,
                locationId,
                invitation.invited_by
              ]
            );
          }
        } else {
          const exists = await client.query(
            `SELECT 1 FROM role_assignments
             WHERE user_id = $1 AND org_id = $2 AND role_id = $3
               AND scope = $4 AND location_id IS NULL
               AND revoked_at IS NULL
             LIMIT 1`,
            [user.id, invitation.org_id, role.id, invitation.scope]
          );

          if (exists.rows.length === 0) {
            await client.query(
              `INSERT INTO role_assignments (
                user_id, org_id, role_id, scope, location_id, assigned_by
              )
              VALUES ($1, $2, $3, $4, NULL, $5)`,
              [
                user.id,
                invitation.org_id,
                role.id,
                invitation.scope,
                invitation.invited_by
              ]
            );
          }
        }
      }

      const syncedLocationIds = await syncUserLocations({
        userId: user.id,
        orgId: invitation.org_id,
        client
      });

      // Get aggregated permissions (returns array directly)
      const permissions = await RBACService.getUserPermissions(user.id, invitation.org_id);

      // Update Keycloak user with permissions
      await KeycloakService.updateUserAttributes(keycloakUser.id, {
        permissions: Array.isArray(permissions) ? permissions : [],
        location_ids: syncedLocationIds
      });

      // Mark invitation as accepted
      await client.query(
        `UPDATE invitations
         SET status = 'accepted', accepted_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [invitation.id]
      );

      // Audit log
      await client.query(
        `INSERT INTO audit_events (
          org_id, actor_user_id, action, target_type, target_id,
          target_name, status, metadata
        )
        VALUES ($1, $2, 'INVITE.ACCEPTED', 'User', $3, $4, 'success', $5)`,
        [invitation.org_id, user.id, user.id, user.email, JSON.stringify({ invitation_id: invitation.id })]
      );

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        organization: {
          id: invitation.org_id,
          name: invitation.org_name,
          slug: invitation.org_slug
        },
        message: 'Invitation accepted successfully. You can now login.'
      };
    });
  }

  /**
   * Revoke invitation
   */
  async revokeInvitation(invitationId, revokedBy, reason = null) {
    return await transaction(async (client) => {
      const invitation = await client.query(
        'SELECT * FROM invitations WHERE id = $1 AND status = \'sent\'',
        [invitationId]
      );

      if (invitation.rows.length === 0) {
        throw new Error('Invitation not found or already processed');
      }

      await client.query(
        `UPDATE invitations
         SET status = 'revoked', 
             revoked_at = CURRENT_TIMESTAMP,
             revoked_by = $1,
             revocation_reason = $2
         WHERE id = $3`,
        [revokedBy, reason, invitationId]
      );

      // Audit log
      await client.query(
        `INSERT INTO audit_events (
          org_id, actor_user_id, action, target_type, target_id,
          target_name, status, metadata
        )
        VALUES ($1, $2, 'INVITE.REVOKED', 'Invitation', $3, $4, 'success', $5)`,
        [
          invitation.rows[0].org_id,
          revokedBy,
          invitationId,
          invitation.rows[0].email,
          JSON.stringify({ reason })
        ]
      );

      return { success: true, message: 'Invitation revoked successfully' };
    });
  }

  /**
   * Get pending invitations for an organization
   */
  async getPendingInvitations(orgId) {
    const result = await query(
      `SELECT 
        i.*,
        ib.name as invited_by_name,
        ib.email as invited_by_email
       FROM invitations i
       JOIN users ib ON i.invited_by = ib.id
       WHERE i.org_id = $1 
         AND i.status = 'sent'
         AND i.expires_at > CURRENT_TIMESTAMP
       ORDER BY i.created_at DESC`,
      [orgId]
    );

    return result.rows;
  }

  /**
   * Clean up expired invitations (can be run as a cron job)
   */
  async cleanupExpiredInvitations() {
    const result = await query(
      `UPDATE invitations
       SET status = 'expired'
       WHERE status = 'sent' 
         AND expires_at < CURRENT_TIMESTAMP
       RETURNING id, org_id, email`,
      []
    );

    console.log(`Marked ${result.rows.length} invitations as expired`);
    return result.rows;
  }
}

module.exports = new InvitationService();
