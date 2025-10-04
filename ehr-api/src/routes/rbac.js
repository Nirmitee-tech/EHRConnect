const express = require('express');
const router = express.Router();
const rbacService = require('../services/rbac.service');

/**
 * RBAC API Routes
 * All routes require authentication and org context
 */

// Middleware to extract user context from headers (set by auth middleware)
function extractUserContext(req, res, next) {
  req.userContext = {
    userId: req.headers['x-user-id'],
    orgId: req.headers['x-org-id'],
    roles: req.headers['x-user-roles'] ? JSON.parse(req.headers['x-user-roles']) : [],
    locationIds: req.headers['x-location-ids'] ? JSON.parse(req.headers['x-location-ids']) : [],
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  };

  if (!req.userContext.userId || !req.userContext.orgId) {
    return res.status(401).json({ error: 'Missing authentication context' });
  }

  next();
}

router.use(extractUserContext);

// =====================================================
// ROLES ENDPOINTS
// =====================================================

/**
 * GET /api/rbac/roles
 * Get all roles (system + custom for org)
 */
router.get('/roles', async (req, res) => {
  try {
    const { includeSystem = 'true', includeCustom = 'true' } = req.query;
    
    const roles = await rbacService.getRoles({
      org_id: req.userContext.orgId,
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
 * Requires: org:roles:create permission
 */
router.post('/roles', async (req, res) => {
  try {
    const { key, name, description, scope_level, permissions } = req.body;

    const role = await rbacService.createRole(
      { key, name, description, scope_level, permissions },
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
 * Update a role
 * Requires: org:roles:update permission
 */
router.patch('/roles/:roleId', async (req, res) => {
  try {
    const { name, description, permissions, allowSystemRoleUpdate } = req.body;

    const role = await rbacService.updateRole(
      req.params.roleId,
      { name, description, permissions, allowSystemRoleUpdate },
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
 * DELETE /api/rbac/roles/:roleId
 * Delete a custom role
 * Requires: org:roles:delete permission
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
 * Requires: org:roles:assign permission
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
 * Requires: org:roles:revoke permission
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
    const { permission } = req.body;

    if (!permission) {
      return res.status(400).json({ error: 'Permission is required' });
    }

    const permissions = await rbacService.getUserPermissions(
      req.userContext.userId,
      req.userContext.orgId
    );

    // Check if permission matches (including wildcard matching)
    const hasPermission = permissions.some(userPerm => {
      if (userPerm === permission) return true;
      
      // Wildcard matching
      const userParts = userPerm.split(':');
      const reqParts = permission.split(':');
      
      return (userParts[0] === '*' || userParts[0] === reqParts[0]) &&
             (userParts[1] === '*' || userParts[1] === reqParts[1]) &&
             (!reqParts[2] || userParts[2] === '*' || userParts[2] === reqParts[2]);
    });

    res.json({ hasPermission });
  } catch (error) {
    console.error('Error checking permission:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
