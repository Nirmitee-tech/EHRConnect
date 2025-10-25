const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query, transaction } = require('../database/connection');

/**
 * Postgres-based Authentication Service
 * Provides email/password authentication without Keycloak
 */
class PostgresAuthService {
  /**
   * Login with email and password
   */
  async login(email, password) {
    const userResult = await query(
      `SELECT
        u.id, u.email, u.name, u.password_hash, u.status,
        ra.org_id, o.name as org_name, o.slug as org_slug,
        o.onboarding_completed,
        ra.scope,
        ARRAY_AGG(DISTINCT ra.location_id) FILTER (WHERE ra.location_id IS NOT NULL) as location_ids,
        ARRAY_AGG(DISTINCT r.key) FILTER (WHERE r.key IS NOT NULL) as role_keys,
        jsonb_agg(DISTINCT r.permissions) FILTER (WHERE r.permissions IS NOT NULL) as permissions
      FROM users u
      LEFT JOIN role_assignments ra ON u.id = ra.user_id AND ra.revoked_at IS NULL
      LEFT JOIN organizations o ON ra.org_id = o.id
      LEFT JOIN roles r ON ra.role_id = r.id
      WHERE u.email = $1 AND u.status = 'active'
      GROUP BY u.id, u.email, u.name, u.password_hash, u.status,
               ra.org_id, o.name, o.slug, o.onboarding_completed, ra.scope
      LIMIT 1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = userResult.rows[0];

    // Check if user has password_hash set
    if (!user.password_hash) {
      throw new Error('Password authentication not configured for this user');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      // Log failed attempt
      await this.logAuthEvent(user.id, user.org_id, 'AUTH.LOGIN_FAILED', 'Invalid password');
      throw new Error('Invalid email or password');
    }

    // Update last login
    await query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Log successful login
    await this.logAuthEvent(user.id, user.org_id, 'AUTH.LOGIN_SUCCESS', 'Postgres auth');

    // Generate JWT token
    const token = this.generateToken(user);

    // Flatten permissions array (it comes as array of arrays from jsonb_agg)
    let permissions = [];
    if (user.permissions && Array.isArray(user.permissions)) {
      user.permissions.forEach(permArray => {
        if (Array.isArray(permArray)) {
          permissions = [...permissions, ...permArray];
        }
      });
      // Remove duplicates
      permissions = [...new Set(permissions)];
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        org_id: user.org_id,
        org_name: user.org_name,
        org_slug: user.org_slug,
        onboarding_completed: user.onboarding_completed,
        scope: user.scope,
        location_ids: user.location_ids || [],
        roles: user.role_keys || [],
        permissions: permissions
      },
      token
    };
  }

  /**
   * Register new user with password
   */
  async register(email, password, name, orgData) {
    return await transaction(async (client) => {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('User already exists');
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Create organization first if orgData provided
      let orgId;
      if (orgData) {
        // Check if org slug already exists
        const existingOrg = await client.query(
          'SELECT id FROM organizations WHERE slug = $1',
          [orgData.slug]
        );

        if (existingOrg.rows.length > 0) {
          throw new Error('Organization slug already exists');
        }

        const orgResult = await client.query(
          `INSERT INTO organizations (
            name, slug, legal_name, contact_email, contact_phone,
            address, timezone, status, created_by, onboarding_completed, metadata
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', uuid_generate_v4(), false, $8)
          RETURNING id`,
          [
            orgData.name,
            orgData.slug,
            orgData.legal_name || orgData.name,
            email,
            orgData.contact_phone || null,
            orgData.address ? JSON.stringify(orgData.address) : null,
            orgData.timezone || 'Asia/Kolkata',
            JSON.stringify({
              terms_accepted: orgData.terms_accepted || false,
              baa_accepted: orgData.baa_accepted || false,
              registration_source: 'self_registration'
            })
          ]
        );
        orgId = orgResult.rows[0].id;

        // Update created_by with the actual user_id after user creation
      }

      // Create user
      const userResult = await client.query(
        `INSERT INTO users (email, name, password_hash, status)
         VALUES ($1, $2, $3, 'active')
         RETURNING id, email, name, status`,
        [email, name, password_hash]
      );

      const user = userResult.rows[0];

      // Update org created_by if org was created
      if (orgId) {
        await client.query(
          'UPDATE organizations SET created_by = $1 WHERE id = $2',
          [user.id, orgId]
        );

        // Assign default admin role to user
        const roleResult = await client.query(
          `SELECT id FROM roles WHERE key = 'ORG_ADMIN' AND org_id = $1
           UNION ALL
           SELECT id FROM roles WHERE key = 'ORG_ADMIN' AND org_id IS NULL AND is_system = true
           LIMIT 1`,
          [orgId]
        );

        if (roleResult.rows.length > 0) {
          await client.query(
            `INSERT INTO role_assignments (user_id, role_id, org_id, scope)
             VALUES ($1, $2, $3, 'ORG')`,
            [user.id, roleResult.rows[0].id, orgId]
          );
        }
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          org_id: orgId
        }
      };
    });
  }

  /**
   * Change password
   */
  async changePassword(userId, oldPassword, newPassword) {
    return await transaction(async (client) => {
      const userResult = await client.query(
        'SELECT id, email, password_hash FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = userResult.rows[0];

      // Verify old password
      const isValid = await bcrypt.compare(oldPassword, user.password_hash);
      if (!isValid) {
        throw new Error('Invalid current password');
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Update password
      await client.query(
        'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [newPasswordHash, userId]
      );

      return { success: true, message: 'Password changed successfully' };
    });
  }

  /**
   * Generate JWT token
   */
  generateToken(user) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      org_id: user.org_id,
      org_slug: user.org_slug,
      location_ids: user.location_ids || [],
      roles: user.role_keys || [],
      permissions: user.permissions || []
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Log authentication event
   */
  async logAuthEvent(userId, orgId, action, details) {
    try {
      await query(
        `INSERT INTO audit_events (
          org_id, actor_user_id, action, target_type, target_id,
          target_name, status, metadata
        )
        VALUES ($1, $2, $3, 'User', $2,
                (SELECT email FROM users WHERE id = $2),
                'success', $4)`,
        [orgId, userId, action, JSON.stringify({ details })]
      );
    } catch (error) {
      console.error('Failed to log auth event:', error);
    }
  }
}

module.exports = new PostgresAuthService();
