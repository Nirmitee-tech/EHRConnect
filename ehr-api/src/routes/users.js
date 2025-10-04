const express = require('express');
const router = express.Router();
const userService = require('../services/user.service');
const { enforceOrgIsolation } = require('../middleware/org-isolation');

router.use(enforceOrgIsolation);

/**
 * GET /api/orgs/:orgId/users
 * Get all users in organization
 */
router.get('/:orgId/users', async (req, res) => {
  try {
    const { activeOnly, page, limit } = req.query;
    
    const users = await userService.getUsers(req.params.orgId, {
      activeOnly: activeOnly === 'true',
      page: parseInt(page) || 0,
      limit: parseInt(limit) || 50
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/orgs/:orgId/users
 * Create user directly (not invitation-based)
 */
router.post('/:orgId/users', async (req, res) => {
  try {
    const result = await userService.createUser(
      req.body,
      req.orgContext.userId,
      req.params.orgId
    );

    res.status(201).json(result);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * PATCH /api/orgs/:orgId/users/:userId/status
 * Deactivate or reactivate user
 */
router.patch('/:orgId/users/:userId/status', async (req, res) => {
  try {
    const { status, reason } = req.body;

    if (status === 'disabled') {
      const result = await userService.deactivateUser(
        req.params.userId,
        req.params.orgId,
        req.orgContext.userId,
        reason
      );
      res.json(result);
    } else {
      res.status(400).json({ error: 'Only deactivation is currently supported' });
    }
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
