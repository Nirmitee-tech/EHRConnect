const express = require('express');
const router = express.Router();
const rbacService = require('../services/rbac.service.enhanced');
const { FEATURE_PERMISSIONS } = require('../constants/permissions');

/**
 * Enhanced RBAC API Routes with Permission Matrix
 * All routes require authentication and org context
 */

// Middleware to extract user context from headers (optional for some routes)
function extractUserContext(req, res, next) {
  req.userContext = {
    userId: req.headers['x-user-id'],
    orgId: req.headers['x-org-id'],
    roles: req.headers['x-user-roles'] ? JSON.parse(req.headers['x-user-roles']) : [],
    locationIds: req.headers['x-location-ids'] ? JSON.parse(req.headers['x-location-ids']) : [],
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  };

  next();
}

// Middleware to require authentication
function requireAuth(req, res, next) {
  if (!req.userContext.userId || !req.userContext.orgId) {
    return res.status(401).json({ error: 'Missing authentication context' });
  }
  next();
}

router.use(extractUserContext);

// =====================================================
// PERMISSION MATRIX ENDPOINTS
// =====================================================

/**
 * GET /api/rbac/permission-matrix
 * Get the permission matrix structure for UI
 */
router.get('/permission-matrix', async (req, res) => {
  try {
    const matrix = await rbacService.getPermissionMatrix();
    res.json({ matrix });
  } catch (error) {
    console.error('Error fetching permission matrix:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/rbac/feature-permissions
 * Get feature-to-permission mappings
 */
router.get('/feature-permissions', async (req, res) => {
  try {
    res.json({ featurePermissions: FEATURE_PERMISSIONS });
  } catch (error) {
    console.error('Error fetching feature permissions:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// ROLES ENDPOINTS
// =====================================================

/**
 * GET /api/rbac/roles
 * Get all roles (system + custom for org)
 * No auth required for reading system roles
 */
router.get('/roles', async (req, res) => {
  try {
    const { includeSystem = 'true', includeCustom = 'true' } = req.query;

    const roles = await rbacService.getRoles({
      org_id: req.userContext.orgId || null,
      includeSystem: includeSystem === 'true',
      includeCustom: includeCustom === 'true'
    });

    res.json({ roles });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/rbac/roles/:identifier
 * Get a single role by ID or key
 */
router.get('/roles/:identifier', async (req, res) => {
  try {
    const role = await rbacService.getRole(
      req.params.identifier,
      req.userContext.orgId
    );

    res.json({ role });
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(error.message === 'Role not found' ? 404 : 500).json({
      error: error.message
    });
  }
});

/**
 * POST /api/rbac/roles
 * Create a custom role
 * Requires: roles:create permission
 */
router.post('/roles', requireAuth, async (req, res) => {
  try {
    const { key, name, description, scope_level, permissions, parent_role_id } = req.body;

    const role = await rbacService.createRole(
      { key, name, description, scope_level, permissions, parent_role_id },
      req.userContext.orgId,
      req.userContext.userId
    );

    res.status(201).json({ role });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * PATCH /api/rbac/roles/:roleId
 * Update a role (with copy-on-write for system roles)
 * Requires: roles:edit permission
 */
router.patch('/roles/:roleId', async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    const role = await rbacService.updateRole(
      req.params.roleId,
      { name, description, permissions },
      req.userContext.orgId,
      req.userContext.userId
    );

    res.json({ role });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/rbac/roles/:roleId/copy
 * Explicitly copy a system role for organization customization
 * Requires: roles:create permission
 */
router.post('/roles/:roleId/copy', async (req, res) => {
  try {
    const role = await rbacService.copySystemRoleForOrg(
      req.params.roleId,
      req.userContext.orgId,
      req.userContext.userId
    );

    res.status(201).json({ role });
  } catch (error) {
    console.error('Error copying role:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/rbac/roles/:roleId
 * Delete a custom role or org-specific copy
 * Requires: roles:delete permission
 */
router.delete('/roles/:roleId', async (req, res) => {
  try {
    const result = await rbacService.deleteRole(
      req.params.roleId,
      req.userContext.orgId,
      req.userContext.userId
    );

    res.json(result);
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(400).json({ error: error.message });
  }
});

// =====================================================
// USER PERMISSIONS & ASSIGNMENTS ENDPOINTS
// =====================================================

/**
 * GET /api/rbac/users/:userId/permissions
 * Get all permissions for a user
 */
router.get('/users/:userId/permissions', async (req, res) => {
  try {
    const permissions = await rbacService.getUserPermissions(
      req.params.userId,
      req.userContext.orgId
    );

    res.json({ permissions });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/rbac/users/:userId/role-assignments
 * Get all role assignments for a user
 */
router.get('/users/:userId/role-assignments', async (req, res) => {
  try {
    const assignments = await rbacService.getUserRoleAssignments(
      req.params.userId,
      req.userContext.orgId
    );

    res.json({ assignments });
  } catch (error) {
    console.error('Error fetching role assignments:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/rbac/role-assignments
 * Assign a role to a user
 * Requires: roles:assign permission
 */
router.post('/role-assignments', async (req, res) => {
  try {
    const {
      user_id,
      role_id,
      scope,
      location_id,
      department_id,
      expires_at
    } = req.body;

    if (!user_id || !role_id || !scope) {
      return res.status(400).json({
        error: 'Missing required fields: user_id, role_id, scope'
      });
    }

    const assignment = await rbacService.assignRole(
      {
        user_id,
        org_id: req.userContext.orgId,
        role_id,
        scope,
        location_id,
        department_id,
        expires_at
      },
      req.userContext.userId
    );

    res.status(201).json({ assignment });
  } catch (error) {
    console.error('Error assigning role:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/rbac/role-assignments/:assignmentId
 * Revoke a role assignment
 * Requires: roles:revoke permission
 */
router.delete('/role-assignments/:assignmentId', async (req, res) => {
  try {
    const { reason } = req.body;

    const result = await rbacService.revokeRole(
      req.params.assignmentId,
      req.userContext.orgId,
      req.userContext.userId,
      reason
    );

    res.json(result);
  } catch (error) {
    console.error('Error revoking role:', error);
    res.status(400).json({ error: error.message });
  }
});

// =====================================================
// PERMISSION CHECKING ENDPOINTS
// =====================================================

/**
 * POST /api/rbac/check-permission
 * Check if current user has a specific permission
 */
router.post('/check-permission', async (req, res) => {
  try {
    const { permission, permissions: multiplePermissions, requireAll = false } = req.body;

    if (!permission && !multiplePermissions) {
      return res.status(400).json({ error: 'Permission(s) required' });
    }

    const userPermissions = await rbacService.getUserPermissions(
      req.userContext.userId,
      req.userContext.orgId
    );

    let hasPermission;

    if (multiplePermissions) {
      // Check multiple permissions
      hasPermission = requireAll
        ? rbacService.checkAllPermissions(userPermissions, multiplePermissions)
        : rbacService.checkPermission(userPermissions, multiplePermissions);
    } else {
      // Check single permission
      hasPermission = rbacService.checkPermission(userPermissions, permission);
    }

    res.json({ hasPermission });
  } catch (error) {
    console.error('Error checking permission:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/rbac/check-feature
 * Check if current user has permission for a feature
 */
router.post('/check-feature', async (req, res) => {
  try {
    const { feature } = req.body;

    if (!feature) {
      return res.status(400).json({ error: 'Feature is required' });
    }

    const requiredPermissions = FEATURE_PERMISSIONS[feature];

    if (!requiredPermissions) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    const userPermissions = await rbacService.getUserPermissions(
      req.userContext.userId,
      req.userContext.orgId
    );

    const hasPermission = rbacService.checkPermission(userPermissions, requiredPermissions);

    res.json({
      hasPermission,
      feature,
      requiredPermissions
    });
  } catch (error) {
    console.error('Error checking feature permission:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// PERMISSION CHANGES (Real-time sync)
// =====================================================

/**
 * GET /api/rbac/permission-changes
 * Get recent permission changes for real-time sync
 */
router.get('/permission-changes', async (req, res) => {
  try {
    const { since, limit = 100 } = req.query;

    const changes = await rbacService.getPermissionChanges(
      req.userContext.orgId,
      since ? new Date(since) : null,
      parseInt(limit)
    );

    res.json({ changes });
  } catch (error) {
    console.error('Error fetching permission changes:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/rbac/permission-changes/mark-processed
 * Mark permission changes as processed
 */
router.post('/permission-changes/mark-processed', async (req, res) => {
  try {
    const { changeIds } = req.body;

    if (!Array.isArray(changeIds)) {
      return res.status(400).json({ error: 'changeIds must be an array' });
    }

    await rbacService.markPermissionChangesProcessed(changeIds);

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking changes as processed:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
