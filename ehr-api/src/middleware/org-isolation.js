const { query } = require('../database/connection');

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
    logSecurityViolation({
      type: 'ORG_ISOLATION_VIOLATION',
      userId,
      tokenOrgId,
      requestedOrgId,
      endpoint: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
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

async function logSecurityViolation(event) {
  try {
    await query(
      `INSERT INTO audit_events (
        org_id, actor_user_id, action, target_type,
        status, metadata, ip_address, user_agent
      )
      VALUES ($1, $2, $3, $4, 'failure', $5, $6, $7)`,
      [
        event.tokenOrgId,
        event.userId,
        event.type,
        'SecurityViolation',
        JSON.stringify({
          requestedOrgId: event.requestedOrgId,
          endpoint: event.endpoint,
          method: event.method,
        }),
        event.ip,
        event.userAgent,
      ]
    );
  } catch (error) {
    console.error('Failed to log security violation:', error);
  }
}

module.exports = { enforceOrgIsolation };
