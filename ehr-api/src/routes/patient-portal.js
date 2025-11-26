const express = require('express');
const router = express.Router();
const patientPortalService = require('../services/patient-portal.service');

/**
 * POST /api/patient-portal/grant-access
 * Grant portal access to a patient (provider action)
 * Requires provider authentication
 */
router.post('/grant-access', async (req, res) => {
  try {
    const { fhirPatientId, email, password } = req.body;
    const grantedByUserId = req.headers['x-user-id'];
    const orgId = req.headers['x-org-id'];

    if (!fhirPatientId || !email || !password) {
      return res.status(400).json({
        error: 'FHIR Patient ID, email, and password are required'
      });
    }

    if (!grantedByUserId || !orgId) {
      return res.status(401).json({
        error: 'Provider authentication required'
      });
    }

    const result = await patientPortalService.grantPortalAccess(
      fhirPatientId,
      email,
      password,
      grantedByUserId,
      orgId
    );

    res.json({
      success: true,
      message: 'Portal access granted successfully',
      data: result
    });
  } catch (error) {
    console.error('Error granting portal access:', error);
    res.status(500).json({
      error: error.message || 'Failed to grant portal access'
    });
  }
});

/**
 * POST /api/patient-portal/login
 * Patient login with email and password
 * Public endpoint
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    const result = await patientPortalService.authenticatePatient(
      email,
      password,
      ipAddress,
      userAgent
    );

    res.json({
      success: true,
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    console.error('Patient login error:', error);
    res.status(401).json({
      error: error.message || 'Login failed'
    });
  }
});

/**
 * POST /api/patient-portal/logout
 * Patient logout
 * Requires patient authentication
 */
router.post('/logout', async (req, res) => {
  try {
    const sessionToken = req.headers['x-session-token'] || req.body.sessionToken;

    if (!sessionToken) {
      return res.status(400).json({
        error: 'Session token required'
      });
    }

    const result = await patientPortalService.logout(sessionToken);

    res.json(result);
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: error.message || 'Logout failed'
    });
  }
});

/**
 * GET /api/patient-portal/check-access
 * Check if patient has portal access
 * Query parameter: fhirPatientId
 */
router.get('/check-access', async (req, res) => {
  try {
    const { fhirPatientId } = req.query;

    if (!fhirPatientId) {
      return res.status(400).json({
        error: 'FHIR Patient ID is required'
      });
    }

    const result = await patientPortalService.checkPortalAccess(fhirPatientId);

    res.json(result);
  } catch (error) {
    console.error('Error checking portal access:', error);
    res.status(500).json({
      error: error.message || 'Failed to check portal access'
    });
  }
});

/**
 * POST /api/patient-portal/revoke-access
 * Revoke patient portal access (provider action)
 * Requires provider authentication
 */
router.post('/revoke-access', async (req, res) => {
  try {
    const { fhirPatientId } = req.body;
    const revokedByUserId = req.headers['x-user-id'];

    if (!fhirPatientId) {
      return res.status(400).json({
        error: 'FHIR Patient ID is required'
      });
    }

    if (!revokedByUserId) {
      return res.status(401).json({
        error: 'Provider authentication required'
      });
    }

    const result = await patientPortalService.revokePortalAccess(
      fhirPatientId,
      revokedByUserId
    );

    res.json(result);
  } catch (error) {
    console.error('Error revoking portal access:', error);
    res.status(500).json({
      error: error.message || 'Failed to revoke portal access'
    });
  }
});

/**
 * POST /api/patient-portal/validate-session
 * Validate patient session token
 */
router.post('/validate-session', async (req, res) => {
  try {
    const sessionToken = req.headers['x-session-token'] || req.body.sessionToken;

    if (!sessionToken) {
      return res.status(400).json({
        error: 'Session token required'
      });
    }

    const result = await patientPortalService.validateSession(sessionToken);

    if (!result.valid) {
      return res.status(401).json({
        error: 'Invalid or expired session'
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error validating session:', error);
    res.status(500).json({
      error: error.message || 'Session validation failed'
    });
  }
});

/**
 * POST /api/patient-portal/change-password
 * Change patient password
 * Requires patient authentication
 */
router.post('/change-password', async (req, res) => {
  try {
    const { oldPassword, newPassword, patientPortalUserId } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        error: 'Old and new passwords are required'
      });
    }

    if (!patientPortalUserId) {
      return res.status(401).json({
        error: 'Patient authentication required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'New password must be at least 8 characters long'
      });
    }

    const result = await patientPortalService.changePassword(
      patientPortalUserId,
      oldPassword,
      newPassword
    );

    res.json(result);
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(400).json({
      error: error.message || 'Failed to change password'
    });
  }
});

/**
 * POST /api/patient-portal/request-password-reset
 * Request password reset (future implementation)
 */
router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }

    // TODO: Implement password reset token generation and email sending
    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({
      error: 'Failed to process password reset request'
    });
  }
});

/**
 * GET /api/patient-portal/stats
 * Get portal usage statistics (admin/provider)
 * Requires provider authentication
 */
router.get('/stats', async (req, res) => {
  try {
    const orgId = req.headers['x-org-id'];

    if (!orgId) {
      return res.status(401).json({
        error: 'Organization context required'
      });
    }

    const stats = await patientPortalService.getPortalStats(orgId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting portal stats:', error);
    res.status(500).json({
      error: error.message || 'Failed to get portal statistics'
    });
  }
});

/**
 * POST /api/patient-portal/audit-log
 * Log patient portal action (for frontend tracking)
 * Requires patient authentication
 */
router.post('/audit-log', async (req, res) => {
  try {
    const { patientPortalUserId, action, resourceType, resourceId, metadata } = req.body;

    if (!patientPortalUserId || !action) {
      return res.status(400).json({
        error: 'Patient ID and action are required'
      });
    }

    await patientPortalService.logAudit(
      patientPortalUserId,
      action,
      resourceType,
      resourceId,
      metadata || {},
      'success'
    );

    res.json({
      success: true,
      message: 'Audit log recorded'
    });
  } catch (error) {
    console.error('Error logging audit:', error);
    res.status(500).json({
      error: 'Failed to log audit event'
    });
  }
});

module.exports = router;
