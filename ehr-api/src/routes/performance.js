/**
 * Performance Metrics API Routes
 * Exposes application performance metrics for monitoring
 */

const express = require('express');
const router = express.Router();
const { getMetrics, resetMetrics } = require('../middleware/performance-monitoring');
const { requireAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/rbac');

/**
 * GET /api/performance/metrics
 * Get current performance metrics
 * Requires admin permission
 */
router.get('/metrics', requireAuth, requirePermission('admin:read'), (req, res) => {
  try {
    const metrics = getMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get metrics', 
      message: error.message 
    });
  }
});

/**
 * POST /api/performance/metrics/reset
 * Reset performance metrics
 * Requires admin permission
 */
router.post('/metrics/reset', requireAuth, requirePermission('admin:write'), (req, res) => {
  try {
    resetMetrics();
    res.json({ success: true, message: 'Metrics reset successfully' });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to reset metrics', 
      message: error.message 
    });
  }
});

/**
 * GET /api/performance/health
 * Basic health check endpoint
 */
router.get('/health', (req, res) => {
  const metrics = getMetrics();
  
  // Determine health status
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: metrics.uptime,
    database: {
      connected: metrics.database.pool.total > 0,
      poolUtilization: `${((metrics.database.pool.total - metrics.database.pool.idle) / metrics.database.pool.max * 100).toFixed(1)}%`,
    },
    memory: metrics.memory,
  };

  // Check for issues
  if (metrics.database.pool.waiting > 5) {
    health.status = 'degraded';
    health.warnings = ['High database connection wait queue'];
  }

  res.json(health);
});

module.exports = router;
