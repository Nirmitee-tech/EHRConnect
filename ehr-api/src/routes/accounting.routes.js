/**
 * Accounting API Routes
 * Handles chart of accounts, cost centers, and bank accounts endpoints
 */

const express = require('express');
const router = express.Router();
const accountingService = require('../services/accounting.service');

// =====================================================
// CHART OF ACCOUNTS ROUTES
// =====================================================

/**
 * GET /api/accounting/chart-of-accounts
 * List all accounts with filters
 */
router.get('/chart-of-accounts', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.query.orgId;
    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID required' });
    }

    const result = await accountingService.getChartOfAccounts(orgId, req.query);
    res.json(result);
  } catch (error) {
    console.error('Get chart of accounts error:', error);
    res.status(500).json({ error: 'Failed to fetch chart of accounts', message: error.message });
  }
});

/**
 * GET /api/accounting/chart-of-accounts/:id
 * Get single account
 */
router.get('/chart-of-accounts/:id', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.query.orgId;
    const account = await accountingService.getAccountById(orgId, req.params.id);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(account);
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ error: 'Failed to fetch account', message: error.message });
  }
});

/**
 * POST /api/accounting/chart-of-accounts
 * Create new account
 */
router.post('/chart-of-accounts', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.body.orgId;
    const account = await accountingService.createAccount(orgId, req.body);
    res.status(201).json(account);
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ error: 'Failed to create account', message: error.message });
  }
});

/**
 * PUT /api/accounting/chart-of-accounts/:id
 * Update account
 */
router.put('/chart-of-accounts/:id', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.body.orgId;
    const account = await accountingService.updateAccount(orgId, req.params.id, req.body);
    res.json(account);
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ error: 'Failed to update account', message: error.message });
  }
});

/**
 * DELETE /api/accounting/chart-of-accounts/:id
 * Soft delete account
 */
router.delete('/chart-of-accounts/:id', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.query.orgId;
    const account = await accountingService.deleteAccount(orgId, req.params.id);
    res.json(account);
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account', message: error.message });
  }
});

// =====================================================
// COST CENTERS ROUTES
// =====================================================

/**
 * GET /api/accounting/cost-centers
 * List all cost centers
 */
router.get('/cost-centers', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.query.orgId;
    const costCenters = await accountingService.getCostCenters(orgId, req.query);
    res.json(costCenters);
  } catch (error) {
    console.error('Get cost centers error:', error);
    res.status(500).json({ error: 'Failed to fetch cost centers', message: error.message });
  }
});

/**
 * POST /api/accounting/cost-centers
 * Create cost center
 */
router.post('/cost-centers', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.body.orgId;
    const costCenter = await accountingService.createCostCenter(orgId, req.body);
    res.status(201).json(costCenter);
  } catch (error) {
    console.error('Create cost center error:', error);
    res.status(500).json({ error: 'Failed to create cost center', message: error.message });
  }
});

/**
 * PUT /api/accounting/cost-centers/:id
 * Update cost center
 */
router.put('/cost-centers/:id', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.body.orgId;
    const costCenter = await accountingService.updateCostCenter(orgId, req.params.id, req.body);
    res.json(costCenter);
  } catch (error) {
    console.error('Update cost center error:', error);
    res.status(500).json({ error: 'Failed to update cost center', message: error.message });
  }
});

// =====================================================
// BANK ACCOUNTS ROUTES
// =====================================================

/**
 * GET /api/accounting/bank-accounts
 * List all bank accounts
 */
router.get('/bank-accounts', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.query.orgId;
    const bankAccounts = await accountingService.getBankAccounts(orgId, req.query.is_active);
    res.json(bankAccounts);
  } catch (error) {
    console.error('Get bank accounts error:', error);
    res.status(500).json({ error: 'Failed to fetch bank accounts', message: error.message });
  }
});

/**
 * POST /api/accounting/bank-accounts
 * Create bank account
 */
router.post('/bank-accounts', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.body.orgId;
    const bankAccount = await accountingService.createBankAccount(orgId, req.body);
    res.status(201).json(bankAccount);
  } catch (error) {
    console.error('Create bank account error:', error);
    res.status(500).json({ error: 'Failed to create bank account', message: error.message });
  }
});

/**
 * PUT /api/accounting/bank-accounts/:id/set-default
 * Set default bank account
 */
router.put('/bank-accounts/:id/set-default', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.body.orgId;
    const bankAccount = await accountingService.setDefaultBankAccount(orgId, req.params.id);
    res.json(bankAccount);
  } catch (error) {
    console.error('Set default bank account error:', error);
    res.status(500).json({ error: 'Failed to set default bank account', message: error.message });
  }
});

module.exports = router;
