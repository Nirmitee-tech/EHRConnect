/**
 * Billing Codes API Routes
 * Handles CPT, ICD, and modifier endpoints with search
 */

const express = require('express');
const router = express.Router();
const billingCodesService = require('../services/billing-codes.service');

// =====================================================
// CPT CODES ROUTES
// =====================================================

/**
 * GET /api/billing/codes/cpt
 * List CPT codes with pagination
 */
router.get('/cpt', async (req, res) => {
  try {
    const result = await billingCodesService.getCPTCodes(req.query);
    res.json(result);
  } catch (error) {
    console.error('Get CPT codes error:', error);
    res.status(500).json({ error: 'Failed to fetch CPT codes', message: error.message });
  }
});

/**
 * GET /api/billing/codes/cpt/search
 * Full-text search CPT codes
 */
router.get('/cpt/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const results = await billingCodesService.searchCPTCodes(q, parseInt(limit));
    res.json(results);
  } catch (error) {
    console.error('Search CPT codes error:', error);
    res.status(500).json({ error: 'Failed to search CPT codes', message: error.message });
  }
});

/**
 * GET /api/billing/codes/cpt/:code
 * Get single CPT code
 */
router.get('/cpt/:code', async (req, res) => {
  try {
    const cptCode = await billingCodesService.getCPTCodeByCode(req.params.code);
    if (!cptCode) {
      return res.status(404).json({ error: 'CPT code not found' });
    }
    res.json(cptCode);
  } catch (error) {
    console.error('Get CPT code error:', error);
    res.status(500).json({ error: 'Failed to fetch CPT code', message: error.message });
  }
});

/**
 * POST /api/billing/codes/cpt
 * Create CPT code
 */
router.post('/cpt', async (req, res) => {
  try {
    const cptCode = await billingCodesService.createCPTCode(req.body);
    res.status(201).json(cptCode);
  } catch (error) {
    console.error('Create CPT code error:', error);
    res.status(500).json({ error: 'Failed to create CPT code', message: error.message });
  }
});

/**
 * POST /api/billing/codes/cpt/bulk
 * Bulk import CPT codes
 */
router.post('/cpt/bulk', async (req, res) => {
  try {
    const { codes } = req.body;
    if (!Array.isArray(codes)) {
      return res.status(400).json({ error: 'Codes array required' });
    }

    const result = await billingCodesService.bulkImportCPTCodes(codes);
    res.json(result);
  } catch (error) {
    console.error('Bulk import CPT codes error:', error);
    res.status(500).json({ error: 'Failed to bulk import CPT codes', message: error.message });
  }
});

// =====================================================
// ICD CODES ROUTES
// =====================================================

/**
 * GET /api/billing/codes/icd
 * List ICD codes with pagination
 */
router.get('/icd', async (req, res) => {
  try {
    const result = await billingCodesService.getICDCodes(req.query);
    res.json(result);
  } catch (error) {
    console.error('Get ICD codes error:', error);
    res.status(500).json({ error: 'Failed to fetch ICD codes', message: error.message });
  }
});

/**
 * GET /api/billing/codes/icd/search
 * Full-text search ICD codes
 */
router.get('/icd/search', async (req, res) => {
  try {
    const { q, icd_version = 'ICD-10', limit = 20 } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const results = await billingCodesService.searchICDCodes(q, icd_version, parseInt(limit));
    res.json(results);
  } catch (error) {
    console.error('Search ICD codes error:', error);
    res.status(500).json({ error: 'Failed to search ICD codes', message: error.message });
  }
});

/**
 * GET /api/billing/codes/icd/:code
 * Get single ICD code
 */
router.get('/icd/:code', async (req, res) => {
  try {
    const icdCode = await billingCodesService.getICDCodeByCode(req.params.code);
    if (!icdCode) {
      return res.status(404).json({ error: 'ICD code not found' });
    }
    res.json(icdCode);
  } catch (error) {
    console.error('Get ICD code error:', error);
    res.status(500).json({ error: 'Failed to fetch ICD code', message: error.message });
  }
});

/**
 * POST /api/billing/codes/icd
 * Create ICD code
 */
router.post('/icd', async (req, res) => {
  try {
    const icdCode = await billingCodesService.createICDCode(req.body);
    res.status(201).json(icdCode);
  } catch (error) {
    console.error('Create ICD code error:', error);
    res.status(500).json({ error: 'Failed to create ICD code', message: error.message });
  }
});

/**
 * POST /api/billing/codes/icd/bulk
 * Bulk import ICD codes
 */
router.post('/icd/bulk', async (req, res) => {
  try {
    const { codes } = req.body;
    if (!Array.isArray(codes)) {
      return res.status(400).json({ error: 'Codes array required' });
    }

    const result = await billingCodesService.bulkImportICDCodes(codes);
    res.json(result);
  } catch (error) {
    console.error('Bulk import ICD codes error:', error);
    res.status(500).json({ error: 'Failed to bulk import ICD codes', message: error.message });
  }
});

// =====================================================
// MODIFIERS ROUTES
// =====================================================

/**
 * GET /api/billing/codes/modifiers
 * List all modifiers
 */
router.get('/modifiers', async (req, res) => {
  try {
    const modifiers = await billingCodesService.getModifiers(req.query);
    res.json(modifiers);
  } catch (error) {
    console.error('Get modifiers error:', error);
    res.status(500).json({ error: 'Failed to fetch modifiers', message: error.message });
  }
});

/**
 * POST /api/billing/codes/modifiers
 * Create modifier
 */
router.post('/modifiers', async (req, res) => {
  try {
    const modifier = await billingCodesService.createModifier(req.body);
    res.status(201).json(modifier);
  } catch (error) {
    console.error('Create modifier error:', error);
    res.status(500).json({ error: 'Failed to create modifier', message: error.message });
  }
});

module.exports = router;
