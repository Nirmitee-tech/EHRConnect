/**
 * Integration Management API Routes
 * Provides endpoints for managing integrations
 */

const express = require('express');
const router = express.Router();
const integrationOrchestrator = require('../services/integration-orchestrator.service');

// Middleware to extract org context
const extractOrgContext = (req, res, next) => {
  const orgId = req.headers['x-org-id'] || req.user?.orgId;
  if (!orgId) {
    return res.status(400).json({ error: 'Organization context required' });
  }
  req.orgId = orgId;
  next();
};

/**
 * GET /api/integrations/vendors
 * Get all integration vendors from database
 */
router.get('/vendors', async (req, res) => {
  try {
    const { pool } = require('../database/connection');
    const { category, featured } = req.query;

    let query = 'SELECT * FROM integration_vendors WHERE active = true';
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

    query += ' ORDER BY sort_order, name';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vendors',
      message: error.message
    });
  }
});

/**
 * GET /api/integrations
 * List all available integrations
 */
router.get('/', async (req, res) => {
  try {
    const { pool } = require('../database/connection');
    const { org_id, active, vendor_id } = req.query;

    if (!org_id) {
      return res.status(400).json({
        success: false,
        error: 'org_id query parameter is required'
      });
    }

    let query = 'SELECT * FROM integrations WHERE org_id = $1';
    const params = [org_id];
    let paramIndex = 2;

    if (active === 'true') {
      query += ` AND enabled = true`;
    }

    if (vendor_id) {
      query += ` AND vendor_id = $${paramIndex}`;
      params.push(vendor_id);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('List integrations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list integrations',
      message: error.message,
    });
  }
});

/**
 * GET /api/integrations/:vendorId
 * Get integration metadata
 */
router.get('/:vendorId', (req, res) => {
  try {
    const { vendorId } = req.params;
    const metadata = integrationOrchestrator.getMetadata(vendorId);
    res.json(metadata);
  } catch (error) {
    console.error('Get integration metadata error:', error);
    res.status(404).json({
      error: 'Integration not found',
      message: error.message,
    });
  }
});

/**
 * GET /api/integrations/:vendorId/operations
 * Get available operations for an integration
 */
router.get('/:vendorId/operations', (req, res) => {
  try {
    const { vendorId } = req.params;
    const operations = integrationOrchestrator.getAvailableOperations(vendorId);
    res.json(operations);
  } catch (error) {
    console.error('Get operations error:', error);
    res.status(404).json({
      error: 'Integration not found',
      message: error.message,
    });
  }
});

/**
 * POST /api/integrations
 * Create a new integration
 */
router.post('/', async (req, res) => {
  try {
    const { pool } = require('../database/connection');
    const { org_id, vendor_id, enabled, environment, api_endpoint, credentials, usage_mappings } = req.body;

    if (!org_id || !vendor_id) {
      return res.status(400).json({
        success: false,
        error: 'org_id and vendor_id are required'
      });
    }

    const query = `
      INSERT INTO integrations (
        org_id, vendor_id, enabled, environment, api_endpoint, credentials, usage_mappings
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await pool.query(query, [
      org_id,
      vendor_id,
      enabled || false,
      environment || 'sandbox',
      api_endpoint || '',
      JSON.stringify(credentials || {}),
      JSON.stringify(usage_mappings || [])
    ]);

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create integration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create integration',
      message: error.message
    });
  }
});

/**
 * PUT /api/integrations/:integrationId
 * Update an existing integration
 */
router.put('/:integrationId', async (req, res) => {
  try {
    const { pool } = require('../database/connection');
    const { integrationId } = req.params;
    const { enabled, environment, api_endpoint, credentials, usage_mappings } = req.body;

    const query = `
      UPDATE integrations
      SET
        enabled = COALESCE($1, enabled),
        environment = COALESCE($2, environment),
        api_endpoint = COALESCE($3, api_endpoint),
        credentials = COALESCE($4, credentials),
        usage_mappings = COALESCE($5, usage_mappings),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;

    const result = await pool.query(query, [
      enabled,
      environment,
      api_endpoint,
      credentials ? JSON.stringify(credentials) : null,
      usage_mappings ? JSON.stringify(usage_mappings) : null,
      integrationId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Update integration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update integration',
      message: error.message
    });
  }
});

/**
 * DELETE /api/integrations/:integrationId
 * Delete an integration
 */
router.delete('/:integrationId', async (req, res) => {
  try {
    const { pool } = require('../database/connection');
    const { integrationId } = req.params;

    const result = await pool.query('DELETE FROM integrations WHERE id = $1 RETURNING id', [integrationId]);

    if (result.rows.length === 0) {
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
    console.error('Delete integration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete integration',
      message: error.message
    });
  }
});

/**
 * POST /api/integrations/:integrationId/toggle
 * Toggle integration enabled status
 */
router.post('/:integrationId/toggle', async (req, res) => {
  try {
    const { pool } = require('../database/connection');
    const { integrationId } = req.params;
    const { enabled } = req.body;

    const query = `
      UPDATE integrations
      SET enabled = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [enabled, integrationId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Integration not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Toggle integration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle integration',
      message: error.message
    });
  }
});

/**
 * POST /api/integrations/:integrationId/test
 * Test connection to an integration
 */
router.post('/:integrationId/test', async (req, res) => {
  try {
    const { vendorId } = req.params;
    const isHealthy = await integrationOrchestrator.testConnection(req.orgId, vendorId);
    
    res.json({
      success: isHealthy,
      vendorId,
      orgId: req.orgId,
      message: isHealthy ? 'Connection successful' : 'Connection failed',
    });
  } catch (error) {
    console.error('Test connection error:', error);
    res.status(500).json({
      success: false,
      error: 'Connection test failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/integrations/:vendorId/execute
 * Execute an operation with a specific integration
 */
router.post('/:vendorId/execute', extractOrgContext, async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { operation, params } = req.body;
    
    if (!operation) {
      return res.status(400).json({ error: 'Operation name required' });
    }
    
    const result = await integrationOrchestrator.execute(
      req.orgId,
      vendorId,
      operation,
      { ...params, userId: req.user?.id }
    );
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Execute operation error:', error);
    res.status(500).json({
      success: false,
      error: 'Operation failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/integrations/execute-with-failover
 * Execute operation with automatic failover
 */
router.post('/execute-with-failover', extractOrgContext, async (req, res) => {
  try {
    const { category, operation, params } = req.body;
    
    if (!category || !operation) {
      return res.status(400).json({ 
        error: 'Category and operation required' 
      });
    }
    
    const result = await integrationOrchestrator.executeWithFailover(
      req.orgId,
      category,
      operation,
      { ...params, userId: req.user?.id }
    );
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Execute with failover error:', error);
    res.status(500).json({
      success: false,
      error: 'All integrations failed',
      message: error.message,
    });
  }
});

/**
 * POST /api/integrations/cache/clear
 * Clear integration cache
 */
router.post('/cache/clear', extractOrgContext, (req, res) => {
  try {
    const { vendorId } = req.body;
    integrationOrchestrator.clearCache(req.orgId, vendorId);

    res.json({
      success: true,
      message: 'Cache cleared',
    });
  } catch (error) {
    console.error('Clear cache error:', error);
    res.status(500).json({
      error: 'Failed to clear cache',
      message: error.message,
    });
  }
});

/**
 * GET /api/integrations/claimmd/payers
 * Get list of payers from Claim.MD with optional search
 */
router.get('/claimmd/payers', async (req, res) => {
  try {
    const axios = require('axios');
    const apiKey = process.env.CLAIM_MD_ACCOUNT_KEY || '24995_*n0kREh@vAxWKyfeSHT4aWs6';
    const searchTerm = req.query.search || '';

    console.log('📋 Fetching payers from Claim.MD API...', { searchTerm });

    const response = await axios.post(
      'https://svc.claim.md/services/payerlist/',
      `AccountKey=${encodeURIComponent(apiKey)}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 60000,
      }
    );

    console.log('📡 Claim.MD API response status:', response.status);
    console.log('📄 Response data structure:', {
      hasPayerList: !!response.data?.PayerList,
      hasPayer: !!response.data?.payer,
      keys: Object.keys(response.data || {})
    });

    // Parse and format payer data - handle different response formats
    let rawPayers = response.data?.PayerList || response.data?.payer || [];

    // If response.data is an array directly
    if (Array.isArray(response.data)) {
      rawPayers = response.data;
    }

    console.log(`✅ Found ${rawPayers.length} payers from Claim.MD`);

    // If no payers found, throw error
    if (rawPayers.length === 0) {
      throw new Error('No payers returned from Claim.MD API. Please check API key and endpoint.');
    }

    // Format for easier consumption
    const formattedPayers = rawPayers.map((payer) => ({
      payerId: payer.PayerId || payer.payerid || payer.payer_id || '',
      payerName: payer.PayerName || payer.payer_name || payer.name || '',
      services: payer.Services || payer.services || [],
      electronicPayerId: payer.ElectronicPayerId || payer.electronic_payer_id || '',
      phone: payer.Phone || payer.phone || '',
      address: payer.Address || payer.address || ''
    }));

    // Apply search filter if provided
    let filteredPayers = formattedPayers;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filteredPayers = formattedPayers.filter(payer =>
        payer.payerName.toLowerCase().includes(search) ||
        payer.payerId.toLowerCase().includes(search)
      );
      console.log(`🔍 Filtered to ${filteredPayers.length} payers matching "${searchTerm}"`);
    }

    res.json({
      success: true,
      payers: filteredPayers,
      total: filteredPayers.length
    });
  } catch (error) {
    console.error('❌ Error fetching payers:', error.message);
    console.error('Error details:', error.response?.data);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch payers',
      details: error.response?.data || null
    });
  }
});

module.exports = router;
