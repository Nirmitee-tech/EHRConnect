const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');

/**
 * Roles API Routes
 * Provides access to system roles for team management
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
 * GET /api/roles/grouped
 * Get all available roles grouped by category
 */
router.get('/grouped', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;

    // Get all system roles and org-specific roles
    const result = await query(
      `SELECT
        key, name, description, scope_level, permissions, is_system
       FROM roles
       WHERE is_system = true OR org_id = $1
       ORDER BY
         CASE scope_level
           WHEN 'PLATFORM' THEN 1
           WHEN 'ORG' THEN 2
           WHEN 'LOCATION' THEN 3
         END,
         name`,
      [orgId]
    );

    // Group roles by category
    const grouped = {
      administration: [],
      clinical: [],
      diagnostic: [],
      billing_finance: [],
      care_coordination: [],
      technical: [],
      analytics: [],
      patient_portal: [],
      other: []
    };

    const categoryMap = {
      // Administration
      'PLATFORM_ADMIN': 'administration',
      'ORG_OWNER': 'administration',
      'ORG_ADMIN': 'administration',
      'CLINIC_MANAGER': 'administration',
      'NURSING_DIRECTOR': 'administration',
      'COO': 'administration',
      'FRONT_DESK': 'administration',
      'SCHEDULER': 'administration',

      // Clinical
      'DOCTOR': 'clinical',
      'CLINICIAN': 'clinical',
      'NURSE': 'clinical',
      'THERAPIST': 'clinical',
      'ALLIED_HEALTH': 'clinical',

      // Diagnostic
      'LAB_TECHNICIAN': 'diagnostic',
      'RADIOLOGIST': 'diagnostic',
      'PHARMACIST': 'diagnostic',

      // Billing & Finance
      'BILLING_CLERK': 'billing_finance',
      'MEDICAL_CODER': 'billing_finance',
      'AUDITOR': 'billing_finance',

      // Care Coordination
      'CASE_MANAGER': 'care_coordination',
      'CARE_COORDINATOR': 'care_coordination',
      'SOCIAL_WORKER': 'care_coordination',

      // Technical
      'IT_ADMIN': 'technical',
      'INTEGRATION_SPECIALIST': 'technical',

      // Analytics
      'RESEARCHER': 'analytics',
      'POPULATION_HEALTH_ANALYST': 'analytics',

      // Patient Portal
      'PATIENT': 'patient_portal',
      'CAREGIVER': 'patient_portal',

      // Viewer (other)
      'VIEWER': 'other'
    };

    result.rows.forEach(role => {
      const category = categoryMap[role.key] || 'other';
      grouped[category].push({
        key: role.key,
        name: role.name,
        description: role.description,
        scope_level: role.scope_level,
        is_system: role.is_system
      });
    });

    // Remove empty categories
    Object.keys(grouped).forEach(key => {
      if (grouped[key].length === 0) {
        delete grouped[key];
      }
    });

    res.json({
      roles: result.rows,
      grouped: grouped,
      categories: {
        administration: 'Administration & Management',
        clinical: 'Clinical Staff',
        diagnostic: 'Diagnostic Services',
        billing_finance: 'Billing & Finance',
        care_coordination: 'Care Coordination',
        technical: 'IT & Technical',
        analytics: 'Analytics & Research',
        patient_portal: 'Patient Portal',
        other: 'Other'
      }
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/roles
 * Get all available roles (simple list)
 */
router.get('/', async (req, res) => {
  try {
    const orgId = req.userContext.orgId;

    const result = await query(
      `SELECT
        key, name, description, scope_level, is_system
       FROM roles
       WHERE is_system = true OR org_id = $1
       ORDER BY name`,
      [orgId]
    );

    res.json({ roles: result.rows });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
