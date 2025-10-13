const express = require('express');
const auditService = require('../services/audit.service');
const { enforceOrgIsolation } = require('../middleware/org-isolation');

const router = express.Router({ mergeParams: true });

router.use(enforceOrgIsolation);

router.get('/events', async (req, res) => {
  try {
    const { orgId } = req.params;
    const { format, ...filters } = req.query;

    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const normalizedFilters = {
      limit: filters.limit ? parseInt(filters.limit, 10) : undefined,
      offset: filters.offset ? parseInt(filters.offset, 10) : undefined,
      status: filters.status || undefined,
      action: filters.action || undefined,
      category: filters.category || undefined,
      actorUserId: filters.actorUserId || filters.actor_user_id || undefined,
      targetType: filters.targetType || filters.target_type || undefined,
      search: filters.search || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined
    };

    if (format === 'csv') {
      const csv = await auditService.exportEvents(orgId, normalizedFilters);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="audit-events.csv"');
      return res.send(csv);
    }

    const data = await auditService.fetchEvents(orgId, normalizedFilters);
    return res.json(data);
  } catch (error) {
    console.error('Failed to load audit events:', error);
    return res.status(500).json({ error: 'Failed to load audit events' });
  }
});

router.get('/settings', async (req, res) => {
  try {
    const { orgId } = req.params;

    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    const settings = await auditService.getSettings(orgId);
    return res.json({ settings });
  } catch (error) {
    console.error('Failed to load audit settings:', error);
    return res.status(500).json({ error: 'Failed to load audit settings' });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const { orgId } = req.params;
    const actorUserId = req.headers['x-user-id'] || null;
    const updates = req.body?.settings || req.body;

    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID is required' });
    }

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: 'Invalid settings payload' });
    }

    const settings = await auditService.updateSettings(orgId, updates, actorUserId);
    return res.json({ settings });
  } catch (error) {
    console.error('Failed to update audit settings:', error);
    return res.status(500).json({ error: error.message || 'Failed to update audit settings' });
  }
});

module.exports = router;
