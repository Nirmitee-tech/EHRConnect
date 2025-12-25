/**
 * Billing Fee Schedules API Routes
 * Handles fee schedule management and lookups
 */

const express = require('express');
const router = express.Router();
const feeScheduleService = require('../services/fee-schedule.service');

/**
 * GET /api/billing/fee-schedules
 * List fee schedules
 */
router.get('/', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.query.orgId;
    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID required' });
    }

    const result = await feeScheduleService.getFeeSchedules(orgId, req.query);
    res.json(result);
  } catch (error) {
    console.error('Get fee schedules error:', error);
    res.status(500).json({ error: 'Failed to fetch fee schedules', message: error.message });
  }
});

/**
 * GET /api/billing/fee-schedules/lookup
 * Look up fee for CPT code, payer, and date
 */
router.get('/lookup', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.query.orgId;
    const { cpt, payer, modifier, date } = req.query;

    if (!orgId || !cpt) {
      return res.status(400).json({ error: 'Organization ID and CPT code required' });
    }

    const fee = await feeScheduleService.lookupFee(
      orgId,
      cpt,
      payer || null,
      modifier || null,
      date ? new Date(date) : new Date()
    );

    if (!fee) {
      return res.status(404).json({ error: 'Fee not found for the given criteria' });
    }

    res.json(fee);
  } catch (error) {
    console.error('Fee lookup error:', error);
    res.status(500).json({ error: 'Failed to lookup fee', message: error.message });
  }
});

/**
 * POST /api/billing/fee-schedules
 * Create fee schedule entry
 */
router.post('/', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.body.orgId;
    const feeSchedule = await feeScheduleService.createFeeSchedule(orgId, req.body);
    res.status(201).json(feeSchedule);
  } catch (error) {
    console.error('Create fee schedule error:', error);
    res.status(500).json({ error: 'Failed to create fee schedule', message: error.message });
  }
});

/**
 * PUT /api/billing/fee-schedules/:id
 * Update fee schedule
 */
router.put('/:id', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.body.orgId;
    const feeSchedule = await feeScheduleService.updateFeeSchedule(orgId, req.params.id, req.body);
    res.json(feeSchedule);
  } catch (error) {
    console.error('Update fee schedule error:', error);
    res.status(500).json({ error: 'Failed to update fee schedule', message: error.message });
  }
});

/**
 * POST /api/billing/fee-schedules/bulk
 * Bulk import fee schedules
 */
router.post('/bulk', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.body.orgId;
    const { schedules } = req.body;

    if (!Array.isArray(schedules)) {
      return res.status(400).json({ error: 'Schedules array required' });
    }

    const result = await feeScheduleService.bulkImportFeeSchedules(orgId, schedules);
    res.json(result);
  } catch (error) {
    console.error('Bulk import fee schedules error:', error);
    res.status(500).json({ error: 'Failed to bulk import fee schedules', message: error.message });
  }
});

/**
 * POST /api/billing/fee-schedules/copy-from-payer
 * Copy fee schedule from one payer to another with multiplier
 */
router.post('/copy-from-payer', async (req, res) => {
  try {
    const orgId = req.user?.orgId || req.body.orgId;
    const { sourcePayerId, targetPayerId, multiplier = 1.0, effectiveFrom } = req.body;

    if (!sourcePayerId || !targetPayerId || !effectiveFrom) {
      return res.status(400).json({ 
        error: 'Source payer, target payer, and effective date required' 
      });
    }

    const result = await feeScheduleService.copyFeeSchedule(
      orgId,
      sourcePayerId,
      targetPayerId,
      parseFloat(multiplier),
      effectiveFrom
    );

    res.json(result);
  } catch (error) {
    console.error('Copy fee schedule error:', error);
    res.status(500).json({ error: 'Failed to copy fee schedule', message: error.message });
  }
});

module.exports = router;
