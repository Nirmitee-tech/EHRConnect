const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');

/**
 * Team Management API Routes
 * Comprehensive team view with departments, locations, and organizational structure
 */

// Middleware to extract user context
function extractUserContext(req, res, next) {
  req.userContext = {
    userId: req.headers['x-user-id'],
    orgId: req.headers['x-org-id'],
  };
  next();
}

router.use(extractUserContext);

/**
 * GET /api/team
 * Get all team members with departments and locations
 */
router.get('/', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;

    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID required' });
    }

    // Get all users with their roles, departments, and locations
    const result = await query(
      `SELECT
        u.id,
        u.email,
        u.name,
        u.status,
        u.last_login_at,
        u.created_at,

        -- Aggregate roles
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'role_id', r.id,
              'role_key', r.key,
              'role_name', r.name,
              'scope', ra.scope,
              'scope_level', r.scope_level
            )
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'
        ) as roles,

        -- Aggregate locations
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'location_id', l.id,
              'location_name', l.name,
              'location_type', l.location_type,
              'address', l.address
            )
          ) FILTER (WHERE l.id IS NOT NULL),
          '[]'
        ) as locations,

        -- Aggregate departments
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'department_id', d.id,
              'department_name', d.name,
              'department_code', d.code
            )
          ) FILTER (WHERE d.id IS NOT NULL),
          '[]'
        ) as departments,

        -- Organization info
        o.name as org_name,
        o.slug as org_slug

      FROM users u
      LEFT JOIN role_assignments ra ON u.id = ra.user_id
        AND ra.org_id = $1
        AND ra.revoked_at IS NULL
      LEFT JOIN roles r ON ra.role_id = r.id
      LEFT JOIN locations l ON ra.location_id = l.id
      LEFT JOIN department_memberships dm ON u.id = dm.user_id AND dm.left_at IS NULL
      LEFT JOIN departments d ON dm.department_id = d.id AND d.active = true
      LEFT JOIN organizations o ON ra.org_id = o.id

      WHERE ra.org_id = $1 OR u.id IN (
        SELECT user_id FROM role_assignments WHERE org_id = $1
      )

      GROUP BY u.id, u.email, u.name, u.status, u.last_login_at, u.created_at,
               o.name, o.slug
      ORDER BY u.name`,
      [orgId]
    );

    res.json({
      team_members: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/team/by-department
 * Get team members grouped by department
 */
router.get('/by-department', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;

    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID required' });
    }

    // Get all departments for the org
    const departmentsResult = await query(
      `SELECT
        d.id,
        d.name,
        d.code,
        d.description,
        COUNT(DISTINCT dm.user_id) as member_count
       FROM departments d
       LEFT JOIN department_memberships dm ON d.id = dm.department_id
       WHERE d.org_id = $1
       GROUP BY d.id, d.name, d.code, d.description
       ORDER BY d.name`,
      [orgId]
    );

    // Get team members for each department
    const teamsResult = await query(
      `SELECT
        u.id,
        u.email,
        u.name,
        u.status,
        d.id as department_id,
        d.name as department_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'role_key', r.key,
              'role_name', r.name
            )
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'
        ) as roles
      FROM departments d
      LEFT JOIN department_memberships dm ON d.id = dm.department_id AND dm.left_at IS NULL
      LEFT JOIN users u ON dm.user_id = u.id
      LEFT JOIN role_assignments ra ON u.id = ra.user_id AND ra.org_id = $1 AND ra.revoked_at IS NULL
      LEFT JOIN roles r ON ra.role_id = r.id
      WHERE d.org_id = $1 AND d.active = true
      GROUP BY u.id, u.email, u.name, u.status, d.id, d.name
      ORDER BY d.name, u.name`,
      [orgId]
    );

    // Group members by department
    const departmentsWithMembers = departmentsResult.rows.map(dept => {
      const members = teamsResult.rows.filter(
        member => member.department_id === dept.id && member.id !== null
      );
      return {
        ...dept,
        members
      };
    });

    res.json({
      departments: departmentsWithMembers,
      total_departments: departmentsResult.rows.length,
      total_members: teamsResult.rows.filter(m => m.id !== null).length
    });
  } catch (error) {
    console.error('Get team by department error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/team/by-location
 * Get team members grouped by location
 */
router.get('/by-location', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;

    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID required' });
    }

    // Get all locations for the org
    const locationsResult = await query(
      `SELECT
        l.id,
        l.name,
        l.location_type,
        l.address,
        COUNT(DISTINCT ra.user_id) as member_count
       FROM locations l
       LEFT JOIN role_assignments ra ON l.id = ra.location_id AND ra.org_id = $1
       WHERE l.org_id = $1
       GROUP BY l.id, l.name, l.location_type, l.address
       ORDER BY l.name`,
      [orgId]
    );

    // Get team members for each location
    const teamsResult = await query(
      `SELECT
        u.id,
        u.email,
        u.name,
        u.status,
        l.id as location_id,
        l.name as location_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'role_key', r.key,
              'role_name', r.name
            )
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'
        ) as roles
      FROM locations l
      LEFT JOIN role_assignments ra ON l.id = ra.location_id AND ra.org_id = $1
      LEFT JOIN users u ON ra.user_id = u.id
      LEFT JOIN roles r ON ra.role_id = r.id
      WHERE l.org_id = $1
      GROUP BY u.id, u.email, u.name, u.status, l.id, l.name
      ORDER BY l.name, u.name`,
      [orgId]
    );

    // Group members by location
    const locationsWithMembers = locationsResult.rows.map(location => {
      const members = teamsResult.rows.filter(
        member => member.location_id === location.id && member.id !== null
      );
      return {
        ...location,
        members
      };
    });

    res.json({
      locations: locationsWithMembers,
      total_locations: locationsResult.rows.length,
      total_members: teamsResult.rows.filter(m => m.id !== null).length
    });
  } catch (error) {
    console.error('Get team by location error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/team/stats
 * Get team statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;

    if (!orgId) {
      return res.status(400).json({ error: 'Organization ID required' });
    }

    const result = await query(
      `SELECT
        COUNT(DISTINCT u.id) as total_members,
        COUNT(DISTINCT u.id) FILTER (WHERE u.status = 'active') as active_members,
        COUNT(DISTINCT u.id) FILTER (WHERE u.status = 'inactive') as inactive_members,
        COUNT(DISTINCT l.id) as total_locations,
        COUNT(DISTINCT d.id) as total_departments,
        COUNT(DISTINCT r.id) as total_roles_assigned
      FROM users u
      LEFT JOIN role_assignments ra ON u.id = ra.user_id AND ra.org_id = $1 AND ra.revoked_at IS NULL
      LEFT JOIN roles r ON ra.role_id = r.id
      LEFT JOIN locations l ON ra.location_id = l.id AND l.org_id = $1
      LEFT JOIN department_memberships dm ON u.id = dm.user_id AND dm.left_at IS NULL
      LEFT JOIN departments d ON dm.department_id = d.id AND d.org_id = $1 AND d.active = true
      WHERE ra.org_id = $1`,
      [orgId]
    );

    res.json({ stats: result.rows[0] });
  } catch (error) {
    console.error('Get team stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
