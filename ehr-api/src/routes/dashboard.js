const express = require('express');
const router = express.Router();
const dashboardService = require('../services/dashboard.service');

function parseLocationIds(query) {
  if (!query) {
    return undefined;
  }

  if (Array.isArray(query)) {
    return query.filter(Boolean);
  }

  if (typeof query === 'string' && query.trim().length > 0) {
    return query.split(',').map(id => id.trim()).filter(Boolean);
  }

  return undefined;
}

router.get('/overview', async (req, res) => {
  try {
    const {
      roleLevel,
      dataMode,
      from,
      to,
      locationId,
      locationIds,
      allowDemoFallback,
      allowRoleFallback
    } = req.query;

    const orgId = req.query.orgId || req.headers['x-org-id'] || null;
    const resolvedLocationIds = parseLocationIds(locationIds) || parseLocationIds(locationId);

    const response = await dashboardService.getDashboardOverview({
      orgId,
      locationIds: resolvedLocationIds,
      roleLevel,
      dataMode,
      periodStart: from,
      periodEnd: to,
      allowDemoFallback: allowDemoFallback !== 'false',
      allowRoleFallback: allowRoleFallback !== 'false'
    });

    res.json(response);
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ error: error.message || 'Failed to load dashboard metrics' });
  }
});

module.exports = router;
