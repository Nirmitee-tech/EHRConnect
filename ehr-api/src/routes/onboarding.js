const express = require('express');
const router = express.Router();
const db = require('../database/connection');

/**
 * GET /api/orgs/:orgId/onboarding-status
 * Check if organization has completed onboarding
 */
router.get('/:orgId/onboarding-status', async (req, res) => {
  try {
    const { orgId } = req.params;

    // Query organization onboarding status
    const result = await db.query(
      'SELECT id, onboarding_completed, onboarding_step FROM organizations WHERE id = $1',
      [orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Organization not found'
      });
    }

    const org = result.rows[0];

    res.json({
      org_id: org.id,
      onboarding_completed: org.onboarding_completed,
      onboarding_step: org.onboarding_step
    });
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    res.status(500).json({
      error: 'Failed to check onboarding status',
      details: error.message
    });
  }
});

/**
 * POST /api/orgs/:orgId/complete-onboarding
 * Mark organization onboarding as completed
 */
router.post('/:orgId/complete-onboarding', async (req, res) => {
  try {
    const { orgId } = req.params;

    // Update organization to mark onboarding as completed
    const result = await db.query(
      `UPDATE organizations 
       SET onboarding_completed = true, 
           onboarding_step = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, onboarding_completed`,
      [orgId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Organization not found'
      });
    }

    res.json({
      message: 'Onboarding completed successfully',
      org_id: result.rows[0].id,
      onboarding_completed: result.rows[0].onboarding_completed
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    res.status(500).json({
      error: 'Failed to complete onboarding',
      details: error.message
    });
  }
});

module.exports = router;
