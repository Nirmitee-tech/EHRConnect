const auditService = require('../services/audit.service');

/**
 * Middleware to enforce org isolation at API level
 * Must be used on all protected routes
 */
function enforceOrgIsolation(req, res, next) {
  const requestedOrgId = req.params.orgId || req.body.org_id;
  const tokenOrgId = req.headers['x-org-id'];
  const userId = req.headers['x-user-id'];

  if (!tokenOrgId || !userId) {
    return res.status(401).json({ error: 'Missing authentication context' });
  }

  if (requestedOrgId && requestedOrgId !== tokenOrgId) {
    auditService.logSecurityViolation({
      orgId: tokenOrgId,
      actorUserId: userId,
      endpoint: req.originalUrl || req.path,
      method: req.method,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: {
        requestedOrgId,
        providedOrgId: tokenOrgId
      }
    });

    return res.status(403).json({ 
      error: 'Access denied',
      code: 'ORG_ISOLATION_VIOLATION' 
    });
  }

  req.orgContext = {
    orgId: tokenOrgId,
    userId,
    roles: req.headers['x-user-roles'] ? JSON.parse(req.headers['x-user-roles']) : [],
    locationIds: req.headers['x-location-ids'] ? JSON.parse(req.headers['x-location-ids']) : [],
  };

  next();
}

module.exports = { enforceOrgIsolation };
