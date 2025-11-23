const express = require('express');
const router = express.Router();
const countryRegistry = require('../services/country-registry.service');

/**
 * Country Pack API Routes
 * Handles country-specific configuration, modules, and localization
 */

// Middleware to extract user context
function extractUserContext(req, res, next) {
  req.userContext = {
    userId: req.headers['x-user-id'],
    orgId: req.headers['x-org-id'],
    roles: req.headers['x-user-roles'] ? JSON.parse(req.headers['x-user-roles']) : [],
    locationId: req.headers['x-location-id'] || null,
    departmentId: req.headers['x-department-id'] || null
  };
  next();
}

// Apply user context middleware to all routes
router.use(extractUserContext);

// Middleware to check org access
function checkOrgAccess(req, res, next) {
  const requestedOrgId = req.params.orgId || req.body.orgId;

  if (!req.userContext.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (requestedOrgId && requestedOrgId !== req.userContext.orgId) {
    return res.status(403).json({ error: 'Access denied to this organization' });
  }

  next();
}

// Middleware to check admin permissions
function checkAdminPermission(req, res, next) {
  const roles = req.userContext.roles || [];

  // Check if user has admin permissions
  const hasAdminAccess = roles.some(role =>
    ['ADMIN', 'SUPER_ADMIN', 'ORG_OWNER', 'org:manage_settings'].includes(role)
  );

  if (!hasAdminAccess) {
    return res.status(403).json({ error: 'Admin access required to manage country settings' });
  }

  next();
}

// =====================================================
// PUBLIC ROUTES - Country Context & Resolution
// =====================================================

/**
 * GET /api/countries/context
 * Resolve country context for current organization
 * Returns enabled country pack, modules, and localization settings
 */
router.get('/context', async (req, res) => {
  try {
    const { orgId, locationId } = req.userContext;

    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID required' });
    }

    const context = await countryRegistry.resolveContext(orgId, locationId);

    res.json({
      success: true,
      context
    });
  } catch (error) {
    console.error('Error resolving country context:', error);
    res.status(500).json({ error: 'Failed to resolve country context' });
  }
});

/**
 * GET /api/countries/packs
 * List all available country packs
 */
router.get('/packs', async (req, res) => {
  try {
    const { active = 'true' } = req.query;
    const activeOnly = active === 'true';

    const packs = await countryRegistry.getAllCountryPacks(activeOnly);

    res.json({
      success: true,
      packs
    });
  } catch (error) {
    console.error('Error fetching country packs:', error);
    res.status(500).json({ error: 'Failed to fetch country packs' });
  }
});

/**
 * GET /api/countries/packs/:countryCode
 * Get details for a specific country pack
 */
router.get('/packs/:countryCode', async (req, res) => {
  try {
    const { countryCode } = req.params;

    const pack = await countryRegistry.getCountryPack(countryCode.toUpperCase());

    res.json({
      success: true,
      pack
    });
  } catch (error) {
    console.error('Error loading country pack:', error);
    res.status(404).json({ error: `Country pack not found: ${error.message}` });
  }
});

/**
 * GET /api/countries/packs/:countryCode/modules
 * Get all modules available for a country
 */
router.get('/packs/:countryCode/modules', async (req, res) => {
  try {
    const { countryCode } = req.params;
    const { active = 'true' } = req.query;
    const activeOnly = active === 'true';

    const modules = await countryRegistry.getCountryModules(countryCode.toUpperCase(), activeOnly);

    res.json({
      success: true,
      countryCode: countryCode.toUpperCase(),
      modules
    });
  } catch (error) {
    console.error('Error loading country modules:', error);
    res.status(404).json({ error: `Failed to load modules: ${error.message}` });
  }
});

// =====================================================
// ADMIN ROUTES - Country Pack Management
// =====================================================

/**
 * PUT /api/admin/orgs/:orgId/country
 * Enable country pack for organization
 * Admin only
 */
router.put('/admin/orgs/:orgId/country', checkOrgAccess, checkAdminPermission, async (req, res) => {
  try {
    const { orgId } = req.params;
    const { countryCode, scope = 'org', scopeRefId = null, overrides = {} } = req.body;
    const { userId } = req.userContext;

    if (!countryCode) {
      return res.status(400).json({ error: 'Country code is required' });
    }

    const result = await countryRegistry.enableCountryPack(
      orgId,
      countryCode.toUpperCase(),
      userId,
      scope,
      scopeRefId,
      overrides
    );

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error enabling country pack:', error);
    res.status(500).json({ error: `Failed to enable country pack: ${error.message}` });
  }
});

/**
 * PUT /api/admin/orgs/:orgId/country/modules
 * Enable/disable modules for organization
 * Admin only
 */
router.put('/admin/orgs/:orgId/country/modules', checkOrgAccess, checkAdminPermission, async (req, res) => {
  try {
    const { orgId } = req.params;
    const { enable = [], disable = [] } = req.body;
    const { userId } = req.userContext;

    const results = {
      enabled: [],
      disabled: [],
      errors: []
    };

    // Enable modules
    for (const moduleConfig of enable) {
      try {
        const {
          countryCode,
          moduleCode,
          config = {},
          scope = 'org',
          scopeRefId = null
        } = moduleConfig;

        if (!countryCode || !moduleCode) {
          throw new Error('countryCode and moduleCode are required');
        }

        const result = await countryRegistry.enableModule(
          orgId,
          countryCode.toUpperCase(),
          moduleCode,
          userId,
          config,
          scope,
          scopeRefId
        );

        results.enabled.push(result);
      } catch (error) {
        results.errors.push({
          action: 'enable',
          moduleCode: moduleConfig.moduleCode,
          error: error.message
        });
      }
    }

    // Disable modules
    for (const moduleConfig of disable) {
      try {
        const { moduleCode, scope = 'org', scopeRefId = null } = moduleConfig;

        if (!moduleCode) {
          throw new Error('moduleCode is required');
        }

        const result = await countryRegistry.disableModule(
          orgId,
          moduleCode,
          userId,
          scope,
          scopeRefId
        );

        results.disabled.push(result);
      } catch (error) {
        results.errors.push({
          action: 'disable',
          moduleCode: moduleConfig.moduleCode,
          error: error.message
        });
      }
    }

    // Return 207 Multi-Status if there were partial failures
    const statusCode = results.errors.length > 0 ? 207 : 200;

    res.status(statusCode).json({
      success: results.errors.length === 0,
      ...results
    });
  } catch (error) {
    console.error('Error updating country modules:', error);
    res.status(500).json({ error: 'Failed to update country modules' });
  }
});

/**
 * PATCH /api/admin/orgs/:orgId/country/modules/:moduleCode
 * Update module configuration
 * Admin only
 */
router.patch('/admin/orgs/:orgId/country/modules/:moduleCode', checkOrgAccess, checkAdminPermission, async (req, res) => {
  try {
    const { orgId, moduleCode } = req.params;
    const { config, scope = 'org', scopeRefId = null } = req.body;
    const { userId } = req.userContext;

    if (!config) {
      return res.status(400).json({ error: 'Configuration is required' });
    }

    const result = await countryRegistry.updateModuleConfig(
      orgId,
      moduleCode,
      config,
      userId,
      scope,
      scopeRefId
    );

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error updating module config:', error);
    res.status(500).json({ error: `Failed to update module config: ${error.message}` });
  }
});

/**
 * GET /api/admin/orgs/:orgId/country/history
 * Get audit history for country pack changes
 * Admin only
 */
router.get('/admin/orgs/:orgId/country/history', checkOrgAccess, checkAdminPermission, async (req, res) => {
  try {
    const { orgId } = req.params;
    const { countryCode = null, limit = 50 } = req.query;

    const history = await countryRegistry.getCountryPackAuditHistory(
      orgId,
      countryCode ? countryCode.toUpperCase() : null,
      parseInt(limit, 10)
    );

    res.json({
      success: true,
      orgId,
      countryCode,
      history
    });
  } catch (error) {
    console.error('Error fetching audit history:', error);
    res.status(500).json({ error: 'Failed to fetch audit history' });
  }
});

/**
 * DELETE /api/admin/countries/cache
 * Clear country pack cache
 * Admin only - Use with caution
 */
router.delete('/admin/countries/cache', checkAdminPermission, async (req, res) => {
  try {
    countryRegistry.clearCache();

    res.json({
      success: true,
      message: 'Country pack cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

/**
 * GET /api/admin/countries/cache/stats
 * Get cache statistics
 * Admin only
 */
router.get('/admin/countries/cache/stats', checkAdminPermission, async (req, res) => {
  try {
    const stats = countryRegistry.getCacheStats();

    res.json({
      success: true,
      cache: stats
    });
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    res.status(500).json({ error: 'Failed to fetch cache stats' });
  }
});

module.exports = router;
