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
