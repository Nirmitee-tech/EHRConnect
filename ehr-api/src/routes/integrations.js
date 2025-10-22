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
 * GET /api/integrations
 * List all available integrations
 */
router.get('/', (req, res) => {
  try {
    const metadata = integrationOrchestrator.getAllMetadata();
    res.json(metadata);
  } catch (error) {
    console.error('List integrations error:', error);
    res.status(500).json({
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
 * POST /api/integrations/:vendorId/test
 * Test connection to an integration
 */
router.post('/:vendorId/test', extractOrgContext, async (req, res) => {
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
