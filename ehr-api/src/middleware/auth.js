/**
 * Authentication Middleware
 */

/**
 * Extract user context from headers
 */
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

/**
 * Require authentication
 */
function requireAuth(req, res, next) {
  // Extract user context first if not already done
  if (!req.userContext) {
    extractUserContext(req, res, () => {});
  }

  if (!req.userContext.userId || !req.userContext.orgId) {
    return res.status(401).json({
      error: 'Missing authentication context',
      message: 'Please provide x-user-id and x-org-id headers'
    });
  }

  next();
}

/**
 * Optional auth - extracts context but doesn't require it
 */
function optionalAuth(req, res, next) {
  extractUserContext(req, res, next);
}

module.exports = {
  extractUserContext,
  requireAuth,
  optionalAuth
};
