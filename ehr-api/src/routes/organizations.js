const express = require('express');
const router = express.Router();
const organizationService = require('../services/organization.service');

/**
 * Organization API Routes
 * Handles org registration, onboarding, and management
 */

// Middleware to extract user context
function extractUserContext(req, res, next) {
  req.userContext = {
    userId: req.headers['x-user-id'],
    orgId: req.headers['x-org-id'],
    roles: req.headers['x-user-roles'] ? JSON.parse(req.headers['x-user-roles']) : [],
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  };
  next();
}

// =====================================================
// PUBLIC ROUTES (No auth required)
// =====================================================

/**
 * POST /api/orgs
 * Register a new organization (signup flow)
 * Public endpoint - no auth required
 */
router.post('/', async (req, res) => {
  try {
    const result = await organizationService.registerOrganization(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Organization registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// =====================================================
// PROTECTED ROUTES (Auth required)
// =====================================================

router.use(extractUserContext);

// Middleware to check org access
function checkOrgAccess(req, res, next) {
  const requestedOrgId = req.params.orgId;
  
  if (!req.userContext.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (requestedOrgId && requestedOrgId !== req.userContext.orgId) {
    return res.status(403).json({ error: 'Access denied to this organization' });
  }

  next();
}

/**
 * GET /api/orgs/:orgId
 * Get organization details
 */
router.get('/:orgId', checkOrgAccess, async (req, res) => {
  try {
    const org = await organizationService.getOrganization(req.params.orgId);
    res.json({ organization: org });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(404).json({ error: error.message });
  }
});

/**
 * PATCH /api/orgs/:orgId
 * Update organization profile
 */
router.patch('/:orgId', checkOrgAccess, async (req, res) => {
  try {
    const org = await organizationService.updateOrganization(
      req.params.orgId,
      req.body,
      req.userContext.userId
    );
    res.json({ organization: org });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * PUT /api/orgs/:orgId/onboarding
 * Update onboarding progress
 */
router.put('/:orgId/onboarding', checkOrgAccess, async (req, res) => {
  try {
    const { step, completed } = req.body;
    const result = await organizationService.updateOnboardingStep(
      req.params.orgId,
      step,
      completed
    );
    res.json(result);
  } catch (error) {
    console.error('Update onboarding error:', error);
    res.status(400).json({ error: error.message });
  }
});

// =====================================================
// LOCATION ROUTES
// =====================================================

/**
 * POST /api/orgs/:orgId/locations
 * Create a new location
 */
router.post('/:orgId/locations', checkOrgAccess, async (req, res) => {
  try {
    const locationData = {
      ...req.body,
      org_id: req.params.orgId
    };
    
    const location = await organizationService.createLocation(
      locationData,
      req.userContext.userId
    );
    
    res.status(201).json({ location });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/orgs/:orgId/locations
 * Get all locations for an organization
 */
router.get('/:orgId/locations', checkOrgAccess, async (req, res) => {
  try {
    const { activeOnly } = req.query;
    const locations = await organizationService.getLocations(
      req.params.orgId,
      activeOnly === 'true'
    );
    res.json({ locations });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/orgs/:orgId/locations/:locationId
 * Update a location
 */
router.patch('/:orgId/locations/:locationId', checkOrgAccess, async (req, res) => {
  try {
    const location = await organizationService.updateLocation(
      req.params.locationId,
      req.body,
      req.userContext.userId
    );
    res.json({ location });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(400).json({ error: error.message });
  }
});

// =====================================================
// DEPARTMENT ROUTES
// =====================================================

/**
 * POST /api/orgs/:orgId/departments
 * Create a new department
 */
router.post('/:orgId/departments', checkOrgAccess, async (req, res) => {
  try {
    const departmentData = {
      ...req.body,
      org_id: req.params.orgId
    };

    const department = await organizationService.createDepartment(
      departmentData,
      req.userContext.userId
    );

    res.status(201).json({ department });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/orgs/:orgId/departments
 * Get all departments for an organization
 */
router.get('/:orgId/departments', checkOrgAccess, async (req, res) => {
  try {
    const { activeOnly } = req.query;
    const departments = await organizationService.getDepartments(
      req.params.orgId,
      activeOnly === 'true'
    );
    res.json({ departments });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/orgs/:orgId/departments/:departmentId
 * Update a department
 */
router.patch('/:orgId/departments/:departmentId', checkOrgAccess, async (req, res) => {
  try {
    const department = await organizationService.updateDepartment(
      req.params.departmentId,
      req.body,
      req.userContext.userId
    );
    res.json({ department });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(400).json({ error: error.message });
  }
});

// =====================================================
// THEME SETTINGS ROUTES
// =====================================================

/**
 * GET /api/orgs/:orgId/theme
 * Get organization theme settings
 */
router.get('/:orgId/theme', checkOrgAccess, async (req, res) => {
  try {
    const themeSettings = await organizationService.getThemeSettings(req.params.orgId);
    res.json({ themeSettings });
  } catch (error) {
    console.error('Get theme settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/orgs/:orgId/theme
 * Update organization theme settings
 */
router.put('/:orgId/theme', checkOrgAccess, async (req, res) => {
  try {
    const themeSettings = await organizationService.updateThemeSettings(
      req.params.orgId,
      req.body,
      req.userContext.userId
    );
    res.json({ themeSettings });
  } catch (error) {
    console.error('Update theme settings error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/orgs/:orgId/theme/logo
 * Upload organization logo
 */
router.post('/:orgId/theme/logo', checkOrgAccess, async (req, res) => {
  try {
    // Logo upload will be handled by multer middleware
    const { logoUrl } = req.body;
    const themeSettings = await organizationService.updateThemeSettings(
      req.params.orgId,
      { logoUrl },
      req.userContext.userId
    );
    res.json({ themeSettings });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
