/**
 * Billing Settings API Routes
 * Handles billing tenant settings and validation
 */

const express = require('express');
const router = express.Router();
const billingSettingsService = require('../services/billing-settings.service');
const billingValidationService = require('../services/billing-validation.service');

/**
 * GET /api/billing/settings
 * Get billing settings for organization
 */
router.get('/', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.query.orgId;
    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID required' });
    }

    const settings = await billingSettingsService.getSettings(orgId);
    res.json(settings || {});
  } catch (error) {
    console.error('Get billing settings error:', error);
    res.status(500).json({ error: 'Failed to fetch billing settings', message: error.message });
  }
});

/**
 * PUT /api/billing/settings
 * Create or update billing settings
 */
router.put('/', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.body.orgId;
    const settings = await billingSettingsService.upsertSettings(orgId, req.body);
    res.json(settings);
  } catch (error) {
    console.error('Update billing settings error:', error);
    res.status(500).json({ error: 'Failed to update billing settings', message: error.message });
  }
});

/**
 * PUT /api/billing/settings/:section
 * Update specific settings section
 */
router.put('/:section', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.body.orgId;
    const settings = await billingSettingsService.updateSettingsSection(
      orgId,
      req.params.section,
      req.body
    );
    res.json(settings);
  } catch (error) {
    console.error('Update settings section error:', error);
    res.status(500).json({ error: 'Failed to update settings section', message: error.message });
  }
});

/**
 * GET /api/billing/settings/validate
 * Validate master data setup
 */
router.get('/validate', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.query.orgId;
    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID required' });
    }

    const validation = await billingValidationService.validateMasterDataSetup(orgId);
    res.json(validation);
  } catch (error) {
    console.error('Validate master data error:', error);
    res.status(500).json({ error: 'Failed to validate master data', message: error.message });
  }
});

/**
 * GET /api/billing/settings/setup-progress
 * Get setup progress percentage
 */
router.get('/setup-progress', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.query.orgId;
    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID required' });
    }

    const progress = await billingValidationService.getSetupProgress(orgId);
    res.json(progress);
  } catch (error) {
    console.error('Get setup progress error:', error);
    res.status(500).json({ error: 'Failed to get setup progress', message: error.message });
  }
});

module.exports = router;
