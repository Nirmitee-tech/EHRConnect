/**
 * User Data API Routes
 *
 * Separate, efficient endpoints for user data with Redis caching
 * to prevent "431 Request Header Fields Too Large" errors.
 *
 * These endpoints replace storing large data in JWT/session.
 */

const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');
const cache = require('../utils/cache');

/**
 * Middleware to extract user ID from headers
 */
function requireAuth(req, res, next) {
  const userId = req.headers['x-user-id'];
  const orgId = req.headers['x-org-id'];

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - No user ID provided'
    });
  }

  req.userId = userId;
  req.orgId = orgId;
  next();
}

/**
 * GET /api/user/permissions
 *
 * Returns all user permissions (not limited to 20 like in session)
 * Cached for 1 hour, invalidated when user roles change
 */
router.get('/permissions', requireAuth, async (req, res) => {
  try {
    const { userId } = req;

    // Try cache first
    const result = await cache.getOrSet(
      cache.CACHE_KEYS.USER_PERMISSIONS(userId),
      async () => {
        // Fetch from database
        const dbResult = await query(
          `SELECT DISTINCT p.name, p.description, p.category
           FROM permissions p
           JOIN role_permissions rp ON p.id = rp.permission_id
           JOIN roles r ON rp.role_id = r.id
           JOIN user_roles ur ON r.id = ur.role_id
           WHERE ur.user_id = $1
           ORDER BY p.category, p.name`,
          [userId]
        );

        return dbResult.rows;
      },
      cache.DEFAULT_TTL.USER_DATA
    );

    res.json({
      success: true,
      permissions: result.data,
      count: result.data.length,
      cached: result.fromCache,
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch permissions'
    });
  }
});

/**
 * GET /api/user/roles
 *
 * Returns all user roles (not limited to 3 like in session)
 * Cached for 1 hour, invalidated when user roles change
 */
router.get('/roles', requireAuth, async (req, res) => {
  try {
    const { userId } = req;

    const result = await cache.getOrSet(
      cache.CACHE_KEYS.USER_ROLES(userId),
      async () => {
        const dbResult = await query(
          `SELECT r.id, r.name, r.description, r.level
           FROM roles r
           JOIN user_roles ur ON r.id = ur.role_id
           WHERE ur.user_id = $1
           ORDER BY r.level DESC, r.name`,
          [userId]
        );

        return dbResult.rows;
      },
      cache.DEFAULT_TTL.USER_DATA
    );

    res.json({
      success: true,
      roles: result.data,
      count: result.data.length,
      cached: result.fromCache,
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch roles'
    });
  }
});

/**
 * GET /api/user/locations
 *
 * Returns all user location IDs with location details
 * Cached for 1 hour, invalidated when user location assignments change
 */
router.get('/locations', requireAuth, async (req, res) => {
  try {
    const { userId } = req;

    const result = await cache.getOrSet(
      cache.CACHE_KEYS.USER_LOCATIONS(userId),
      async () => {
        // Get user's location_ids array
        const userResult = await query(
          'SELECT location_ids FROM users WHERE id = $1',
          [userId]
        );

        if (userResult.rows.length === 0) {
          return { location_ids: [], locations: [] };
        }

        const locationIds = userResult.rows[0].location_ids || [];

        if (locationIds.length === 0) {
          return { location_ids: [], locations: [] };
        }

        // Fetch location details from FHIR resources
        const locationsResult = await query(
          `SELECT resource_data
           FROM fhir_resources
           WHERE resource_type = 'Location'
             AND deleted = FALSE
             AND id = ANY($1)`,
          [locationIds]
        );

        const locations = locationsResult.rows.map(row => ({
          id: row.resource_data.id,
          name: row.resource_data.name,
          status: row.resource_data.status,
          address: row.resource_data.address,
        }));

        return {
          location_ids: locationIds,
          locations: locations,
        };
      },
      cache.DEFAULT_TTL.USER_DATA
    );

    res.json({
      success: true,
      location_ids: result.data.location_ids,
      locations: result.data.locations,
      count: result.data.location_ids.length,
      cached: result.fromCache,
    });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch locations'
    });
  }
});

/**
 * GET /api/user/profile
 *
 * Returns complete user profile with all data
 * Cached for 1 hour, invalidated when user data changes
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const { userId } = req;

    const result = await cache.getOrSet(
      cache.CACHE_KEYS.USER_PROFILE(userId),
      async () => {
        const dbResult = await query(
          `SELECT
            u.id,
            u.email,
            u.name,
            u.org_id,
            u.onboarding_completed,
            u.location_ids,
            u.scope,
            u.created_at,
            u.updated_at
           FROM users u
           WHERE u.id = $1`,
          [userId]
        );

        if (dbResult.rows.length === 0) {
          throw new Error('User not found');
        }

        return dbResult.rows[0];
      },
      cache.DEFAULT_TTL.USER_DATA
    );

    res.json({
      success: true,
      profile: result.data,
      cached: result.fromCache,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch profile'
    });
  }
});

/**
 * GET /api/user/organization
 *
 * Returns organization data including logo and settings
 * Cached for 2 hours, invalidated when org data changes
 */
router.get('/organization', requireAuth, async (req, res) => {
  try {
    const { orgId } = req;

    if (!orgId) {
      return res.status(400).json({
        success: false,
        error: 'Organization ID not provided'
      });
    }

    const result = await cache.getOrSet(
      cache.CACHE_KEYS.ORG_DATA(orgId),
      async () => {
        const dbResult = await query(
          `SELECT
            id,
            name,
            slug,
            type,
            logo_url,
            specialties,
            active,
            created_at
           FROM organizations
           WHERE id = $1`,
          [orgId]
        );

        if (dbResult.rows.length === 0) {
          throw new Error('Organization not found');
        }

        return dbResult.rows[0];
      },
      cache.DEFAULT_TTL.ORG_DATA
    );

    res.json({
      success: true,
      organization: result.data,
      cached: result.fromCache,
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch organization'
    });
  }
});

/**
 * POST /api/user/cache/invalidate
 *
 * Manually invalidate user cache (for testing/debugging)
 * In production, cache is automatically invalidated on data updates
 */
router.post('/cache/invalidate', requireAuth, async (req, res) => {
  try {
    const { userId } = req;
    const { type } = req.body;

    let count = 0;

    if (type === 'all') {
      count = await cache.invalidateUser(userId);
    } else if (type) {
      await cache.invalidateUserData(userId, type);
      count = 1;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Please specify type: permissions, roles, locations, profile, or all'
      });
    }

    res.json({
      success: true,
      message: `Invalidated ${count} cache key(s)`,
      type: type,
    });
  } catch (error) {
    console.error('Error invalidating cache:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to invalidate cache'
    });
  }
});

/**
 * GET /api/user/cache/stats
 *
 * Get cache statistics (for debugging)
 */
router.get('/cache/stats', async (req, res) => {
  try {
    const stats = await cache.getStats();

    res.json({
      success: true,
      stats: stats,
    });
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch cache stats'
    });
  }
});

module.exports = router;
