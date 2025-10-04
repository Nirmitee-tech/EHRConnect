const express = require('express');
const router = express.Router();
const invitationService = require('../services/invitation.service');

/**
 * Invitation API Routes
 * Handles staff invitation creation, acceptance, and management
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
 * GET /api/invitations/:token
 * Get invitation details by token (public for accept page)
 */
router.get('/:token', async (req, res) => {
  try {
    const invitation = await invitationService.getInvitationByToken(req.params.token);
    
    // Return limited info for privacy
    res.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        org_name: invitation.org_name,
        org_slug: invitation.org_slug,
        invited_by_name: invitation.invited_by_name,
        role_keys: invitation.role_keys,
        scope: invitation.scope,
        expires_at: invitation.expires_at
      }
    });
  } catch (error) {
    console.error('Get invitation error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/invitations/:token/accept
 * Accept invitation and provision user (public endpoint)
 */
router.post('/:token/accept', async (req, res) => {
  try {
    const result = await invitationService.acceptInvitation(
      req.params.token,
      req.body
    );
    res.status(201).json(result);
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(400).json({ error: error.message });
  }
});

// =====================================================
// PROTECTED ROUTES (Auth required)
// =====================================================

router.use(extractUserContext);

// Middleware to check org access
function checkOrgAccess(req, res, next) {
  if (!req.userContext.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!req.userContext.orgId) {
    return res.status(403).json({ error: 'Organization context required' });
  }

  next();
}

/**
 * POST /api/orgs/:orgId/invitations
 * Create a new staff invitation
 */
router.post('/orgs/:orgId/invitations', checkOrgAccess, async (req, res) => {
  try {
    if (req.params.orgId !== req.userContext.orgId) {
      return res.status(403).json({ error: 'Access denied to this organization' });
    }

    const invitationData = {
      ...req.body,
      org_id: req.params.orgId
    };

    const invitation = await invitationService.createInvitation(
      invitationData,
      req.userContext.userId
    );

    res.status(201).json({ invitation });
  } catch (error) {
    console.error('Create invitation error:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/orgs/:orgId/invitations
 * Get pending invitations for an organization
 */
router.get('/orgs/:orgId/invitations', checkOrgAccess, async (req, res) => {
  try {
    if (req.params.orgId !== req.userContext.orgId) {
      return res.status(403).json({ error: 'Access denied to this organization' });
    }

    const invitations = await invitationService.getPendingInvitations(req.params.orgId);
    res.json({ invitations });
  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/orgs/:orgId/invitations/:invitationId
 * Revoke an invitation
 */
router.delete('/orgs/:orgId/invitations/:invitationId', checkOrgAccess, async (req, res) => {
  try {
    if (req.params.orgId !== req.userContext.orgId) {
      return res.status(403).json({ error: 'Access denied to this organization' });
    }

    const { reason } = req.body;

    const result = await invitationService.revokeInvitation(
      req.params.invitationId,
      req.userContext.userId,
      reason
    );

    res.json(result);
  } catch (error) {
    console.error('Revoke invitation error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
