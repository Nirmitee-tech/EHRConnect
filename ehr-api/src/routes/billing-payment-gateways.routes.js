/**
 * Billing Payment Gateways API Routes
 * Handles payment gateway configuration
 */

const express = require('express');
const router = express.Router();
const paymentGatewayService = require('../services/payment-gateway.service');

/**
 * GET /api/billing/payment-gateways
 * List all payment gateways
 */
router.get('/', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.query.orgId;
    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID required' });
    }

    const gateways = await paymentGatewayService.getGateways(orgId, req.query.includeInactive);
    res.json(gateways);
  } catch (error) {
    console.error('Get payment gateways error:', error);
    res.status(500).json({ error: 'Failed to fetch payment gateways', message: error.message });
  }
});

/**
 * GET /api/billing/payment-gateways/:id
 * Get gateway by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.query.orgId;
    const gateway = await paymentGatewayService.getGatewayById(orgId, req.params.id);

    if (!gateway) {
      return res.status(404).json({ error: 'Payment gateway not found' });
    }

    res.json(gateway);
  } catch (error) {
    console.error('Get payment gateway error:', error);
    res.status(500).json({ error: 'Failed to fetch payment gateway', message: error.message });
  }
});

/**
 * POST /api/billing/payment-gateways
 * Create payment gateway
 */
router.post('/', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.body.orgId;
    const gateway = await paymentGatewayService.createGateway(orgId, req.body);
    res.status(201).json(gateway);
  } catch (error) {
    console.error('Create payment gateway error:', error);
    res.status(500).json({ error: 'Failed to create payment gateway', message: error.message });
  }
});

/**
 * PUT /api/billing/payment-gateways/:id
 * Update payment gateway
 */
router.put('/:id', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.body.orgId;
    const gateway = await paymentGatewayService.updateGateway(orgId, req.params.id, req.body);
    res.json(gateway);
  } catch (error) {
    console.error('Update payment gateway error:', error);
    res.status(500).json({ error: 'Failed to update payment gateway', message: error.message });
  }
});

/**
 * DELETE /api/billing/payment-gateways/:id
 * Deactivate payment gateway
 */
router.delete('/:id', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.query.orgId;
    const gateway = await paymentGatewayService.updateGateway(orgId, req.params.id, { is_active: false });
    res.json(gateway);
  } catch (error) {
    console.error('Delete payment gateway error:', error);
    res.status(500).json({ error: 'Failed to deactivate payment gateway', message: error.message });
  }
});

/**
 * POST /api/billing/payment-gateways/:id/test
 * Test gateway connection
 */
router.post('/:id/test', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.body.orgId;
    const result = await paymentGatewayService.testGateway(orgId, req.params.id);
    res.json(result);
  } catch (error) {
    console.error('Test payment gateway error:', error);
    res.status(500).json({ error: 'Failed to test payment gateway', message: error.message });
  }
});

/**
 * PUT /api/billing/payment-gateways/:id/set-default
 * Set default payment gateway
 */
router.put('/:id/set-default', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.body.orgId;
    const gateway = await paymentGatewayService.setDefaultGateway(orgId, req.params.id);
    res.json(gateway);
  } catch (error) {
    console.error('Set default gateway error:', error);
    res.status(500).json({ error: 'Failed to set default gateway', message: error.message });
  }
});

module.exports = router;
