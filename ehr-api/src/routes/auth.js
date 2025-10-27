const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');
const postgresAuthService = require('../services/postgres-auth.service');
const { query } = require('../database/connection');

// Get AUTH_PROVIDER from environment (defaults to 'keycloak')
const AUTH_PROVIDER = process.env.AUTH_PROVIDER || 'keycloak';

/**
 * POST /api/auth/login
 * Login with email/password (Postgres auth only)
 */
router.post('/login', async (req, res) => {
  try {
    if (AUTH_PROVIDER !== 'postgres') {
      return res.status(400).json({
        error: 'Postgres authentication not enabled',
        message: 'Set AUTH_PROVIDER=postgres to use email/password login'
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await postgresAuthService.login(email, password);
    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message });
  }
});

/**
 * POST /api/auth/register
 * Register new user with password (Postgres auth only)
 */
router.post('/register', async (req, res) => {
  try {
    if (AUTH_PROVIDER !== 'postgres') {
      return res.status(400).json({
        error: 'Postgres authentication not enabled',
        message: 'Set AUTH_PROVIDER=postgres to use registration'
      });
    }

    const { email, password, name, organization } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const result = await postgresAuthService.register(email, password, name, organization);
    res.json(result);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/auth/change-password
 * Change user password (Postgres auth only)
 */
router.post('/change-password', async (req, res) => {
  try {
    if (AUTH_PROVIDER !== 'postgres') {
      return res.status(400).json({
        error: 'Postgres authentication not enabled'
      });
    }

    const userId = req.headers['x-user-id'];
    const { oldPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old and new passwords are required' });
    }

    const result = await postgresAuthService.changePassword(userId, oldPassword, newPassword);
    res.json(result);
  } catch (error) {
    console.error('Change password error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/auth/provider
 * Get current authentication provider
 */
router.get('/provider', (req, res) => {
  res.json({
    provider: AUTH_PROVIDER,
    supportsPasswordAuth: AUTH_PROVIDER === 'postgres'
  });
});

/**
 * POST /api/auth/password-reset/request
 * Request password reset
 */
router.post('/password-reset/request', async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.requestPasswordReset(email);
    res.json(result);
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/auth/password-reset/confirm
 * Reset password with token
 */
router.post('/password-reset/confirm', async (req, res) => {
  try {
    const { token, password } = req.body;
    const result = await authService.resetPassword(token, password);
    res.json(result);
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/auth/user-context
 * Get user context including org_id for authenticated user
 */
router.get('/user-context', async (req, res) => {
  try {
    const email = req.query.email;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Get user and their primary organization
    const result = await query(
      `SELECT 
        u.id,
        u.email,
        u.name,
        u.status,
        u.keycloak_user_id,
        ra.org_id,
        o.name as org_name,
        o.slug as org_slug,
        o.onboarding_completed,
        ra.scope,
        ARRAY_AGG(DISTINCT ra.location_id) FILTER (WHERE ra.location_id IS NOT NULL) as location_ids,
        ARRAY_AGG(DISTINCT r.role_key) FILTER (WHERE r.role_key IS NOT NULL) as role_keys
      FROM users u
      LEFT JOIN role_assignments ra ON u.id = ra.user_id AND ra.revoked_at IS NULL
      LEFT JOIN organizations o ON ra.org_id = o.id
      LEFT JOIN roles r ON ra.role_id = r.id
      WHERE u.email = $1 AND u.status = 'active'
      GROUP BY u.id, u.email, u.name, u.status, u.keycloak_user_id, 
               ra.org_id, o.name, o.slug, o.onboarding_completed, ra.scope
      LIMIT 1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found or inactive' });
    }

    const userContext = result.rows[0];
    
    // Clean up the response
    res.json({
      user_id: userContext.id,
      email: userContext.email,
      name: userContext.name,
      org_id: userContext.org_id,
      org_name: userContext.org_name,
      org_slug: userContext.org_slug,
      onboarding_completed: userContext.onboarding_completed,
      scope: userContext.scope,
      location_ids: userContext.location_ids || [],
      roles: userContext.role_keys || []
    });
  } catch (error) {
    console.error('Get user context error:', error);
    res.status(500).json({ error: 'Failed to fetch user context' });
  }
});

/**
 * GET /api/auth/me
 * Get full user profile with all permissions, roles, and organization data
 *
 * This endpoint returns complete user data that's not stored in the NextAuth session
 * to prevent "431 Request Header Fields Too Large" errors.
 *
 * Returns:
 * - All user permissions (not limited)
 * - All user roles (not limited)
 * - All location IDs (not limited)
 * - Organization logo and complete data
 * - All org specialties
 */
router.get('/me', async (req, res) => {
  try {
    // Extract user and org ID from headers (set by NextAuth middleware)
    const userId = req.headers['x-user-id'] || req.headers['authorization']?.split(' ')[1];
    const orgId = req.headers['x-org-id'];

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - No user ID provided'
      });
    }

    // Fetch user with all related data
    const userQuery = `
      SELECT
        u.id,
        u.email,
        u.name,
        u.org_id,
        u.onboarding_completed,
        u.location_ids,
        u.scope,
        o.name as org_name,
        o.slug as org_slug,
        o.type as org_type,
        o.logo_url as org_logo,
        o.specialties as org_specialties,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', r.id,
              'name', r.name,
              'description', r.description
            )
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'
        ) as roles,
        COALESCE(
          json_agg(
            DISTINCT p.name
          ) FILTER (WHERE p.name IS NOT NULL),
          '[]'
        ) as permissions
      FROM users u
      LEFT JOIN organizations o ON u.org_id = o.id
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE u.id = $1
      GROUP BY u.id, u.email, u.name, u.org_id, u.onboarding_completed,
               u.location_ids, u.scope, o.name, o.slug, o.type, o.logo_url, o.specialties
    `;

    const result = await query(userQuery, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = result.rows[0];

    const locationResult = await query(
      `SELECT
         ARRAY_AGG(DISTINCT ra.location_id) FILTER (WHERE ra.location_id IS NOT NULL) AS location_ids
       FROM role_assignments ra
       WHERE ra.user_id = $1
         AND ra.revoked_at IS NULL
         AND (ra.expires_at IS NULL OR ra.expires_at > CURRENT_TIMESTAMP)`,
      [user.id]
    );

    const locationIds = (locationResult.rows[0]?.location_ids || []).filter(Boolean);

    // Format response
    const profile = {
      id: user.id,
      email: user.email,
      name: user.name,
      org_id: user.org_id,
      org_slug: user.org_slug,
      org_name: user.org_name,
      org_type: user.org_type,
      org_logo: user.org_logo,
      org_specialties: user.org_specialties || [],
      onboarding_completed: user.onboarding_completed,
      location_ids: locationIds,
      scope: user.scope,
      roles: user.roles || [],
      permissions: user.permissions || [],
      // Additional metadata
      total_roles: (user.roles || []).length,
      total_permissions: (user.permissions || []).length,
      total_locations: locationIds.length,
    };

    res.json({
      success: true,
      profile: profile
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch user profile'
    });
  }
});

/**
 * POST /api/auth/logout
 * Log logout event
 */
router.post('/logout', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const orgId = req.headers['x-org-id'];
    const { reason } = req.body;

    if (userId && orgId) {
      await query(
        `INSERT INTO audit_events (
          org_id, actor_user_id, action, target_type, target_id,
          target_name, status, metadata, ip_address, user_agent
        )
        VALUES ($1, $2, 'AUTH.LOGOUT', 'User', $2,
                (SELECT email FROM users WHERE id = $2),
                'success', $3, $4, $5)`,
        [
          orgId,
          userId,
          JSON.stringify({ reason }),
          req.ip,
          req.headers['user-agent'],
        ]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Logout logging error:', error);
    res.json({ success: true });
  }
});

module.exports = router;
