const express = require('express');
const router = express.Router();
const specialtyRegistry = require('../services/specialty-registry.service');

/**
 * Specialty Pack API Routes
 * Handles pack enablement, configuration, and context resolution
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
    ['ADMIN', 'SUPER_ADMIN', 'ORG_OWNER', 'org:manage_specialties'].includes(role)
  );

  if (!hasAdminAccess) {
    return res.status(403).json({ error: 'Admin access required to manage specialty packs' });
  }

  next();
}

// =====================================================
// PACK CONTEXT & RESOLUTION
// =====================================================

/**
 * GET /api/specialties/context
 * Resolve specialty context for current request
 * Returns enabled packs based on org/location/department
 */
router.get('/context', async (req, res) => {
  try {
    const { orgId, locationId, departmentId } = req.userContext;

    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID required' });
    }

    const context = await specialtyRegistry.resolveContext(orgId, locationId, departmentId);

    res.json({
      success: true,
      context
    });
  } catch (error) {
    console.error('Error resolving specialty context:', error);
    res.status(500).json({ error: 'Failed to resolve specialty context' });
  }
});

/**
 * GET /api/specialties/packs
 * List all enabled packs for current organization
 */
router.get('/packs', checkOrgAccess, async (req, res) => {
  try {
    const { orgId, locationId, departmentId } = req.userContext;
    const { scope, scopeRefId } = req.query;

    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID required' });
    }

    // Determine scope based on query params or context
    const resolvedScope = scope || (departmentId ? 'department' : locationId ? 'location' : 'org');
    const resolvedScopeRefId = scopeRefId || (departmentId || locationId || null);

    const packs = await specialtyRegistry.getEnabledPacks(orgId, resolvedScope, resolvedScopeRefId);

    res.json({
      success: true,
      packs,
      scope: resolvedScope,
      scopeRefId: resolvedScopeRefId
    });
  } catch (error) {
    console.error('Error fetching enabled packs:', error);
    res.status(500).json({ error: 'Failed to fetch packs' });
  }
});

/**
 * GET /api/specialties/packs/:slug
 * Get details for a specific pack
 */
router.get('/packs/:slug', checkOrgAccess, async (req, res) => {
  try {
    const { slug } = req.params;
    const { version = '1.0.0' } = req.query;

    const packData = await specialtyRegistry.loadPack(slug, version);

    res.json({
      success: true,
      pack: packData
    });
  } catch (error) {
    console.error('Error loading pack:', error);
    res.status(404).json({ error: `Pack not found: ${error.message}` });
  }
});

/**
 * GET /api/specialties/packs/:slug/components
 * Get specific components from a pack (templates, visit types, workflows)
 */
router.get('/packs/:slug/components', checkOrgAccess, async (req, res) => {
  try {
    const { slug } = req.params;
    const { version = '1.0.0', component = 'all' } = req.query;

    const packData = await specialtyRegistry.loadPack(slug, version);

    let responseData = {};

    switch (component) {
      case 'templates':
        responseData = { templates: packData.templates };
        break;
      case 'visitTypes':
        responseData = { visitTypes: packData.visitTypes };
        break;
      case 'workflows':
        responseData = { workflows: packData.workflows };
        break;
      case 'reports':
        responseData = { reports: packData.reports };
        break;
      case 'all':
      default:
        responseData = {
          templates: packData.templates,
          visitTypes: packData.visitTypes,
          workflows: packData.workflows,
          reports: packData.reports
        };
    }

    res.json({
      success: true,
      slug,
      version: packData.version,
      ...responseData
    });
  } catch (error) {
    console.error('Error loading pack components:', error);
    res.status(404).json({ error: `Failed to load components: ${error.message}` });
  }
});

// =====================================================
// ADMIN ROUTES - Pack Management
// =====================================================

/**
 * GET /api/admin/orgs/:orgId/specialties
 * List all specialty pack settings for an organization (both enabled and disabled)
 * Admin only
 */
router.get('/admin/orgs/:orgId/specialties', checkOrgAccess, async (req, res) => {
  try {
    const { orgId } = req.params;
    const { scope = 'org', scopeRefId = null } = req.query;

    // Use getAllPackSettings to include both enabled and disabled packs
    const packs = await specialtyRegistry.getAllPackSettings(orgId, scope, scopeRefId);

    res.json({
      success: true,
      orgId,
      packs
    });
  } catch (error) {
    console.error('Error fetching org specialty settings:', error);
    res.status(500).json({ error: 'Failed to fetch specialty settings' });
  }
});

/**
 * PUT /api/admin/orgs/:orgId/specialties
 * Enable/disable specialty packs
 * Admin only
 */
router.put('/admin/orgs/:orgId/specialties', checkOrgAccess, async (req, res) => {
  try {
    const { orgId } = req.params;
    const { enable = [], disable = [] } = req.body;
    const { userId } = req.userContext;

    const results = {
      enabled: [],
      disabled: [],
      errors: []
    };

    // Enable packs
    for (const packConfig of enable) {
      try {
        const { slug, version = '1.0.0', scope = 'org', scopeRefId = null, overrides = {} } = packConfig;

        const result = await specialtyRegistry.enablePack(
          orgId,
          slug,
          version,
          scope,
          scopeRefId,
          userId,
          overrides
        );

        results.enabled.push(result);
      } catch (error) {
        results.errors.push({
          action: 'enable',
          slug: packConfig.slug,
          error: error.message
        });
      }
    }

    // Disable packs
    for (const packConfig of disable) {
      try {
        const { slug, scope = 'org', scopeRefId = null } = packConfig;

        const result = await specialtyRegistry.disablePack(
          orgId,
          slug,
          scope,
          scopeRefId,
          userId
        );

        results.disabled.push(result);
      } catch (error) {
        results.errors.push({
          action: 'disable',
          slug: packConfig.slug,
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
    console.error('Error updating specialty packs:', error);
    res.status(500).json({ error: 'Failed to update specialty packs' });
  }
});

/**
 * GET /api/admin/orgs/:orgId/specialties/:slug/history
 * Get audit history for a specific pack
 * Admin only
 */
router.get('/admin/orgs/:orgId/specialties/:slug/history', checkOrgAccess, async (req, res) => {
  try {
    const { orgId, slug } = req.params;
    const { limit = 50 } = req.query;

    const history = await specialtyRegistry.getPackAuditHistory(orgId, slug, parseInt(limit, 10));

    res.json({
      success: true,
      orgId,
      packSlug: slug,
      history
    });
  } catch (error) {
    console.error('Error fetching audit history:', error);
    res.status(500).json({ error: 'Failed to fetch audit history' });
  }
});

/**
 * GET /api/admin/orgs/:orgId/specialties/history
 * Get audit history for all packs in organization
 * Admin only
 */
router.get('/admin/orgs/:orgId/specialties/history', checkOrgAccess, async (req, res) => {
  try {
    const { orgId } = req.params;
    const { limit = 100 } = req.query;

    const history = await specialtyRegistry.getPackAuditHistory(orgId, null, parseInt(limit, 10));

    res.json({
      success: true,
      orgId,
      history
    });
  } catch (error) {
    console.error('Error fetching audit history:', error);
    res.status(500).json({ error: 'Failed to fetch audit history' });
  }
});

/**
 * POST /api/admin/specialties/packs/:slug/reload
 * Invalidate cache and reload pack
 * Admin only
 */
router.post('/admin/specialties/packs/:slug/reload', async (req, res) => {
  try {
    const { slug } = req.params;
    const { version = '1.0.0' } = req.body;

    // Invalidate cache
    specialtyRegistry.invalidateCache(slug, version);

    // Reload pack
    const packData = await specialtyRegistry.loadPack(slug, version);

    res.json({
      success: true,
      message: `Pack ${slug}:${version} reloaded successfully`,
      pack: {
        slug: packData.slug,
        version: packData.version,
        dependencies: packData.dependencies
      }
    });
  } catch (error) {
    console.error('Error reloading pack:', error);
    res.status(500).json({ error: `Failed to reload pack: ${error.message}` });
  }
});

/**
 * GET /api/admin/specialties/cache/stats
 * Get cache statistics
 * Admin only
 */
router.get('/admin/specialties/cache/stats', async (req, res) => {
  try {
    const stats = specialtyRegistry.getCacheStats();

    res.json({
      success: true,
      cache: stats
    });
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    res.status(500).json({ error: 'Failed to fetch cache stats' });
  }
});

/**
 * DELETE /api/admin/specialties/cache
 * Clear all pack cache
 * Admin only - Use with caution
 */
router.delete('/admin/specialties/cache', async (req, res) => {
  try {
    specialtyRegistry.clearCache();

    res.json({
      success: true,
      message: 'Pack cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

module.exports = router;
