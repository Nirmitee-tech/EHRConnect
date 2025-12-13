const express = require('express');
const router = express.Router();
const mfaService = require('../services/mfa.service');
const { query } = require('../database/connection');

/**
 * MFA Routes
 *
 * Endpoints:
 * - POST /api/mfa/check - Check if 2FA is required for user
 * - POST /api/mfa/send-code - Generate and send MFA code
 * - POST /api/mfa/verify - Verify MFA code
 * - POST /api/mfa/enable - Enable 2FA for user
 * - POST /api/mfa/disable - Disable 2FA for user
 * - POST /api/mfa/setup/verify - Verify 2FA setup
 * - GET /api/mfa/settings - Get user 2FA settings
 * - GET /api/mfa/stats - Get user MFA statistics
 *
 * Admin endpoints:
 * - GET /api/mfa/global-settings - Get global 2FA settings
 * - PUT /api/mfa/global-settings - Update global 2FA settings
 */

/**
 * POST /api/mfa/check
 * Check if 2FA is required for a user
 */
router.post('/check', async (req, res) => {
  try {
    const { userId, orgId } = req.body;

    if (!userId || !orgId) {
      return res.status(400).json({
        error: 'userId and orgId are required',
      });
    }

    const result = await mfaService.is2FARequired(userId, orgId);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error checking 2FA requirement:', error);
    res.status(500).json({
      error: 'Failed to check 2FA requirement',
      message: error.message,
    });
  }
});

/**
 * POST /api/mfa/send-code
 * Generate and send MFA code to user
 */
router.post('/send-code', async (req, res) => {
  try {
    const { userId, purpose = 'login' } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    const result = await mfaService.generateAndSendCode(
      userId,
      purpose,
      ipAddress,
      userAgent
    );

    res.json(result);
  } catch (error) {
    console.error('Error sending MFA code:', error);
    res.status(500).json({
      error: 'Failed to send MFA code',
      message: error.message,
    });
  }
});

/**
 * POST /api/mfa/verify
 * Verify MFA code
 */
router.post('/verify', async (req, res) => {
  try {
    const { userId, code, purpose = 'login' } = req.body;

    if (!userId || !code) {
      return res.status(400).json({
        error: 'userId and code are required',
      });
    }

    const result = await mfaService.verifyCode(userId, code, purpose);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error verifying MFA code:', error);
    res.status(500).json({
      error: 'Failed to verify MFA code',
      message: error.message,
    });
  }
});

/**
 * POST /api/mfa/enable
 * Enable 2FA for the authenticated user
 */
router.post('/enable', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { method = 'email', phoneNumber = null } = req.body;

    // Validate phone number for SMS
    if (method === 'sms' && !phoneNumber) {
      return res.status(400).json({
        error: 'Phone number is required for SMS authentication',
      });
    }

    const result = await mfaService.enable2FA(userId, method, phoneNumber);

    // Log audit event
    const orgId = req.headers['x-org-id'];
    if (orgId) {
      await query(
        `INSERT INTO audit_events (
          org_id, actor_user_id, action, target_type, target_id,
          target_name, status, ip_address, user_agent
        )
        VALUES ($1, $2, 'MFA.ENABLE_INITIATED', 'User', $2,
                (SELECT email FROM users WHERE id = $2),
                'success', $3, $4)`,
        [orgId, userId, req.ip, req.headers['user-agent']]
      );
    }

    res.json(result);
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    res.status(500).json({
      error: 'Failed to enable 2FA',
      message: error.message,
    });
  }
});

/**
 * POST /api/mfa/setup/verify
 * Verify 2FA setup with code
 */
router.post('/setup/verify', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'code is required' });
    }

    const result = await mfaService.verify2FASetup(userId, code);

    // Log audit event
    const orgId = req.headers['x-org-id'];
    if (orgId && result.success) {
      await query(
        `INSERT INTO audit_events (
          org_id, actor_user_id, action, target_type, target_id,
          target_name, status, ip_address, user_agent
        )
        VALUES ($1, $2, 'MFA.ENABLED', 'User', $2,
                (SELECT email FROM users WHERE id = $2),
                'success', $3, $4)`,
        [orgId, userId, req.ip, req.headers['user-agent']]
      );
    }

    res.json(result);
  } catch (error) {
    console.error('Error verifying 2FA setup:', error);
    res.status(500).json({
      error: 'Failed to verify 2FA setup',
      message: error.message,
    });
  }
});

/**
 * POST /api/mfa/disable
 * Disable 2FA for the authenticated user
 */
router.post('/disable', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await mfaService.disable2FA(userId);

    // Log audit event
    const orgId = req.headers['x-org-id'];
    if (orgId) {
      await query(
        `INSERT INTO audit_events (
          org_id, actor_user_id, action, target_type, target_id,
          target_name, status, ip_address, user_agent
        )
        VALUES ($1, $2, 'MFA.DISABLED', 'User', $2,
                (SELECT email FROM users WHERE id = $2),
                'success', $3, $4)`,
        [orgId, userId, req.ip, req.headers['user-agent']]
      );
    }

    res.json(result);
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    res.status(500).json({
      error: 'Failed to disable 2FA',
      message: error.message,
    });
  }
});

/**
 * GET /api/mfa/settings
 * Get user's 2FA settings
 */
router.get('/settings', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const settings = await mfaService.getUserSettings(userId);

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Error getting user 2FA settings:', error);
    res.status(500).json({
      error: 'Failed to get 2FA settings',
      message: error.message,
    });
  }
});

/**
 * GET /api/mfa/stats
 * Get user's MFA statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const stats = await mfaService.getUserMFAStats(userId);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error getting user MFA stats:', error);
    res.status(500).json({
      error: 'Failed to get MFA statistics',
      message: error.message,
    });
  }
});

/**
 * GET /api/mfa/global-settings
 * Get organization's global 2FA settings
 */
router.get('/global-settings', async (req, res) => {
  try {
    const orgId = req.headers['x-org-id'];

    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const settings = await mfaService.getGlobalSettings(orgId);

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Error getting global 2FA settings:', error);
    res.status(500).json({
      error: 'Failed to get global 2FA settings',
      message: error.message,
    });
  }
});

/**
 * PUT /api/mfa/global-settings
 * Update organization's global 2FA settings (Admin only)
 */
router.put('/global-settings', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const orgId = req.headers['x-org-id'];

    if (!userId || !orgId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // TODO: Add permission check for admin role
    // For now, we'll allow any authenticated user to update

    const {
      enabled,
      enforcement_level,
      allowed_methods,
      grace_period_days,
      config,
    } = req.body;

    if (enforcement_level && !['disabled', 'optional', 'mandatory'].includes(enforcement_level)) {
      return res.status(400).json({
        error: 'Invalid enforcement_level. Must be: disabled, optional, or mandatory',
      });
    }

    const settings = await mfaService.updateGlobalSettings(
      orgId,
      {
        enabled,
        enforcement_level,
        allowed_methods,
        grace_period_days,
        config,
      },
      userId
    );

    // Log audit event
    await query(
      `INSERT INTO audit_events (
        org_id, actor_user_id, action, target_type, target_id,
        target_name, status, metadata, ip_address, user_agent
      )
      VALUES ($1, $2, 'MFA.GLOBAL_SETTINGS_UPDATED', 'Organization', $1,
              (SELECT name FROM organizations WHERE id = $1),
              'success', $3, $4, $5)`,
      [
        orgId,
        userId,
        JSON.stringify({ new_settings: settings }),
        req.ip,
        req.headers['user-agent'],
      ]
    );

    res.json({
      success: true,
      message: 'Global 2FA settings updated successfully',
      settings,
    });
  } catch (error) {
    console.error('Error updating global 2FA settings:', error);
    res.status(500).json({
      error: 'Failed to update global 2FA settings',
      message: error.message,
    });
  }
});

/**
 * POST /api/mfa/cleanup
 * Clean up expired MFA codes (Admin only - can be called by cron job)
 */
router.post('/cleanup', async (req, res) => {
  try {
    // In production, you might want to protect this with an API key or admin check
    const result = await mfaService.cleanupExpiredCodes();

    res.json(result);
  } catch (error) {
    console.error('Error cleaning up expired codes:', error);
    res.status(500).json({
      error: 'Failed to cleanup expired codes',
      message: error.message,
    });
  }
});

module.exports = router;
