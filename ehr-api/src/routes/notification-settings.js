const express = require('express');
const router = express.Router();
const notificationSettingsService = require('../services/notification-settings.service');
const emailService = require('../services/email.service');
const smsService = require('../services/sms.service');
const { query } = require('../database/connection');

/**
 * Notification Settings Routes
 *
 * Endpoints for managing email (SMTP) and SMS provider configurations
 * Admin-only endpoints for UI-based provider management
 */

/**
 * GET /api/notification-settings/providers
 * Get all notification providers for an organization
 */
router.get('/providers', async (req, res) => {
  try {
    const orgId = req.headers['x-org-id'];

    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const { type } = req.query;
    const providers = await notificationSettingsService.getAllProviders(orgId, type);

    // Mask credentials in response
    const sanitizedProviders = providers.map((provider) => ({
      ...provider,
      credentials: provider.credentials
        ? Object.keys(provider.credentials).reduce((acc, key) => {
            acc[key] = '***';
            return acc;
          }, {})
        : {},
    }));

    res.json({
      success: true,
      providers: sanitizedProviders,
    });
  } catch (error) {
    console.error('Error getting notification providers:', error);
    res.status(500).json({
      error: 'Failed to get notification providers',
      message: error.message,
    });
  }
});

/**
 * GET /api/notification-settings/providers/:id
 * Get a specific notification provider
 */
router.get('/providers/:id', async (req, res) => {
  try {
    const orgId = req.headers['x-org-id'];
    const { id } = req.params;

    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const result = await query(
      'SELECT * FROM notification_providers WHERE id = $1 AND org_id = $2',
      [id, orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const provider = result.rows[0];

    // Mask credentials
    if (provider.credentials) {
      provider.credentials = Object.keys(provider.credentials).reduce((acc, key) => {
        acc[key] = '***';
        return acc;
      }, {});
    }

    res.json({
      success: true,
      provider,
    });
  } catch (error) {
    console.error('Error getting notification provider:', error);
    res.status(500).json({
      error: 'Failed to get notification provider',
      message: error.message,
    });
  }
});

/**
 * POST /api/notification-settings/providers
 * Create or update a notification provider
 */
router.post('/providers', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const orgId = req.headers['x-org-id'];

    if (!userId || !orgId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // TODO: Add admin permission check

    const {
      provider_type,
      provider_name,
      enabled,
      is_default,
      config,
      credentials,
      metadata,
    } = req.body;

    if (!provider_type || !provider_name) {
      return res.status(400).json({
        error: 'provider_type and provider_name are required',
      });
    }

    const provider = await notificationSettingsService.upsertProvider(
      orgId,
      {
        provider_type,
        provider_name,
        enabled,
        is_default,
        config,
        credentials,
        metadata,
      },
      userId
    );

    // Clear cache after updating settings
    if (provider_type === 'email_smtp') {
      emailService.clearCache(orgId);
    } else if (provider_type.startsWith('sms_')) {
      smsService.clearCache(orgId);
    }

    // Log audit event
    await query(
      `INSERT INTO audit_events (
        org_id, actor_user_id, action, target_type, target_id,
        target_name, status, metadata, ip_address, user_agent
      )
      VALUES ($1, $2, 'NOTIFICATION_PROVIDER.UPSERT', 'NotificationProvider', $3,
              $4, 'success', $5, $6, $7)`,
      [
        orgId,
        userId,
        provider.id,
        provider_name,
        JSON.stringify({ provider_type, enabled, is_default }),
        req.ip,
        req.headers['user-agent'],
      ]
    );

    res.json({
      success: true,
      message: 'Notification provider saved successfully',
      provider,
    });
  } catch (error) {
    console.error('Error saving notification provider:', error);
    res.status(500).json({
      error: 'Failed to save notification provider',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/notification-settings/providers/:id
 * Delete a notification provider
 */
router.delete('/providers/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const orgId = req.headers['x-org-id'];
    const { id } = req.params;

    if (!userId || !orgId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // TODO: Add admin permission check

    const result = await notificationSettingsService.deleteProvider(orgId, id, userId);

    // Log audit event
    await query(
      `INSERT INTO audit_events (
        org_id, actor_user_id, action, target_type, target_id,
        target_name, status, ip_address, user_agent
      )
      VALUES ($1, $2, 'NOTIFICATION_PROVIDER.DELETE', 'NotificationProvider', $3,
              $4, 'success', $5, $6)`,
      [
        orgId,
        userId,
        id,
        result.deleted.provider_name,
        req.ip,
        req.headers['user-agent'],
      ]
    );

    res.json(result);
  } catch (error) {
    console.error('Error deleting notification provider:', error);
    res.status(500).json({
      error: 'Failed to delete notification provider',
      message: error.message,
    });
  }
});

/**
 * POST /api/notification-settings/providers/:id/test
 * Test a notification provider configuration
 */
router.post('/providers/:id/test', async (req, res) => {
  try {
    const orgId = req.headers['x-org-id'];
    const { id } = req.params;

    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const result = await notificationSettingsService.testProvider(orgId, id);

    res.json(result);
  } catch (error) {
    console.error('Error testing notification provider:', error);
    res.status(500).json({
      error: 'Failed to test notification provider',
      message: error.message,
    });
  }
});

/**
 * GET /api/notification-settings/provider-types
 * Get available provider types and their config schema
 */
router.get('/provider-types', (req, res) => {
  res.json({
    success: true,
    providerTypes: [
      {
        type: 'email_smtp',
        name: 'Email (SMTP)',
        description: 'Send emails via SMTP server',
        configSchema: {
          host: { type: 'string', required: true, label: 'SMTP Host' },
          port: { type: 'number', required: true, label: 'SMTP Port', default: 587 },
          secure: { type: 'boolean', required: false, label: 'Use SSL/TLS', default: false },
          from_name: { type: 'string', required: true, label: 'From Name' },
          from_email: { type: 'string', required: true, label: 'From Email' },
        },
        credentialsSchema: {
          user: { type: 'string', required: false, label: 'SMTP Username' },
          password: { type: 'password', required: false, label: 'SMTP Password' },
        },
      },
      {
        type: 'sms_twilio',
        name: 'SMS (Twilio)',
        description: 'Send SMS via Twilio',
        configSchema: {
          from_number: { type: 'string', required: true, label: 'Twilio Phone Number' },
        },
        credentialsSchema: {
          account_sid: { type: 'string', required: true, label: 'Account SID' },
          auth_token: { type: 'password', required: true, label: 'Auth Token' },
        },
      },
    ],
  });
});

module.exports = router;
