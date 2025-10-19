const express = require('express');
const router = express.Router();
const IntegrationService = require('../services/integration.service');

/**
 * Integration Management Routes
 * Handles third-party integrations (EHR, billing, payments, etc.)
 */

// Initialize integration service
const integrationService = new IntegrationService();

/**
 * GET /api/integrations/vendors
 * Get all available integration vendors
 * Query params:
 *   - category: Filter by category
 *   - featured: Filter for featured vendors only
 */
router.get('/vendors', async (req, res) => {
  try {
    const { category, featured } = req.query;

    let query = `
      SELECT id, name, category, description, logo, website, documentation, featured
      FROM integration_vendors
      WHERE active = true
    `;
    const params = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (featured === 'true') {
      query += ` AND featured = true`;
    }

    query += ` ORDER BY featured DESC, sort_order ASC, name ASC`;

    const result = await req.db.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('GET /api/integrations/vendors error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vendors',
      details: error.message
    });
  }
});

/**
 * GET /api/integrations
 * Get all integration configurations for an organization
 * Query params:
 *   - org_id: Organization ID (required)
 *   - active: Filter for active integrations only
 *   - vendor_id: Filter by vendor ID
 */
router.get('/', async (req, res) => {
  try {
    const { org_id, active, vendor_id } = req.query;

    if (!org_id) {
      return res.status(400).json({
        success: false,
        error: 'org_id is required'
      });
    }

    const integrations = await integrationService.getIntegrations(req.db, {
      orgId: org_id,
      activeOnly: active === 'true',
      vendorId: vendor_id
    });

    res.json({
      success: true,
      data: integrations,
      count: integrations.length
    });
  } catch (error) {
    console.error('GET /api/integrations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch integrations',
      details: error.message
    });
  }
});

/**
 * GET /api/integrations/:id
 * Get a single integration configuration
 */
router.get('/:id', async (req, res) => {
  try {
    const integration = await integrationService.getIntegration(req.db, req.params.id);

    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      });
    }

    res.json({
      success: true,
      data: integration
    });
  } catch (error) {
    console.error(`GET /api/integrations/${req.params.id} error:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch integration',
      details: error.message
    });
  }
});

/**
 * POST /api/integrations
 * Create a new integration configuration
 */
router.post('/', async (req, res) => {
  try {
    const { org_id } = req.headers['x-org-id'] ? { org_id: req.headers['x-org-id'] } : req.body;

    if (!org_id) {
      return res.status(400).json({
        success: false,
        error: 'org_id is required'
      });
    }

    if (!req.body.vendor_id) {
      return res.status(400).json({
        success: false,
        error: 'vendor_id is required'
      });
    }

    const integration = await integrationService.createIntegration(req.db, {
      orgId: org_id,
      vendorId: req.body.vendor_id,
      enabled: req.body.enabled || false,
      environment: req.body.environment || 'sandbox',
      apiEndpoint: req.body.api_endpoint || '',
      credentials: req.body.credentials || {},
      usageMappings: req.body.usage_mappings || [],
      createdBy: req.user?.id || req.userContext?.userId || null
    });

    // Initialize integration if enabled
    if (integration.enabled) {
      try {
        await integrationService.initializeIntegration(integration);
      } catch (error) {
        console.error('Failed to initialize integration:', error);
        // Continue - integration is saved but not initialized
      }
    }

    res.status(201).json({
      success: true,
      data: integration,
      message: 'Integration created successfully'
    });
  } catch (error) {
    console.error('POST /api/integrations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create integration',
      details: error.message
    });
  }
});

/**
 * PUT /api/integrations/:id
 * Update an integration configuration
 */
router.put('/:id', async (req, res) => {
  try {
    const integration = await integrationService.updateIntegration(
      req.db,
      req.params.id,
      {
        ...req.body,
        updatedBy: req.user?.id || req.userContext?.userId || null
      }
    );

    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      });
    }

    // Reload integration if enabled status changed
    if (req.body.enabled !== undefined) {
      try {
        if (req.body.enabled) {
          await integrationService.initializeIntegration(integration);
        } else {
          await integrationService.stopIntegration(integration.id);
        }
      } catch (error) {
        console.error('Failed to reload integration:', error);
      }
    }

    res.json({
      success: true,
      data: integration,
      message: 'Integration updated successfully'
    });
  } catch (error) {
    console.error(`PUT /api/integrations/${req.params.id} error:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to update integration',
      details: error.message
    });
  }
});

/**
 * DELETE /api/integrations/:id
 * Delete an integration configuration
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await integrationService.deleteIntegration(req.db, req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      });
    }

    res.json({
      success: true,
      message: 'Integration deleted successfully'
    });
  } catch (error) {
    console.error(`DELETE /api/integrations/${req.params.id} error:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete integration',
      details: error.message
    });
  }
});

/**
 * POST /api/integrations/:id/toggle
 * Toggle integration enabled status
 */
router.post('/:id/toggle', async (req, res) => {
  try {
    const { enabled } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'enabled must be a boolean'
      });
    }

    const integration = await integrationService.toggleIntegration(
      req.db,
      req.params.id,
      enabled
    );

    if (!integration) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      });
    }

    // Initialize or stop integration
    try {
      if (enabled) {
        await integrationService.initializeIntegration(integration);
      } else {
        await integrationService.stopIntegration(integration.id);
      }
    } catch (error) {
      console.error('Failed to toggle integration:', error);
    }

    res.json({
      success: true,
      data: integration,
      message: `Integration ${enabled ? 'enabled' : 'disabled'} successfully`
    });
  } catch (error) {
    console.error(`POST /api/integrations/${req.params.id}/toggle error:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle integration',
      details: error.message
    });
  }
});

/**
 * POST /api/integrations/:id/test
 * Test integration connection
 */
router.post('/:id/test', async (req, res) => {
  try {
    const result = await integrationService.testConnection(req.db, req.params.id);

    res.json({
      success: result.success,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    console.error(`POST /api/integrations/${req.params.id}/test error:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to test connection',
      details: error.message
    });
  }
});

/**
 * GET /api/integrations/health
 * Get health status of all integrations
 */
router.get('/health/status', async (req, res) => {
  try {
    const { org_id } = req.query;

    if (!org_id) {
      return res.status(400).json({
        success: false,
        error: 'org_id is required'
      });
    }

    const healthStatus = await integrationService.getHealthStatus(req.db, org_id);

    res.json({
      success: true,
      data: healthStatus.integrations,
      summary: healthStatus.summary
    });
  } catch (error) {
    console.error('GET /api/integrations/health error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get health status',
      details: error.message
    });
  }
});

/**
 * POST /api/integrations/health/check
 * Trigger health check for all integrations
 */
router.post('/health/check', async (req, res) => {
  try {
    const { org_id } = req.body;

    if (!org_id) {
      return res.status(400).json({
        success: false,
        error: 'org_id is required'
      });
    }

    await integrationService.performHealthChecks(req.db, org_id);

    const healthStatus = await integrationService.getHealthStatus(req.db, org_id);

    res.json({
      success: true,
      message: 'Health checks completed',
      data: healthStatus.integrations,
      summary: healthStatus.summary
    });
  } catch (error) {
    console.error('POST /api/integrations/health/check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform health checks',
      details: error.message
    });
  }
});

module.exports = router;
