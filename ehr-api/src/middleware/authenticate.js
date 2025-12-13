const jwt = require('jsonwebtoken');
const sessionService = require('../services/session.service');

/**
 * Authentication Middleware
 * 
 * Validates JWT tokens and checks session validity against Redis/DB
 * Supports both Authorization header and custom token headers
 * 
 * Usage:
 *   router.get('/protected', authenticate, handler);
 *   router.get('/optional', authenticate({ required: false }), handler);
 */

/**
 * Extract token from request
 */
function extractToken(req) {
  // Try Authorization header first (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try x-access-token header (for clients that can't use Authorization)
  if (req.headers['x-access-token']) {
    return req.headers['x-access-token'];
  }

  // Try query parameter (only for GET requests, not recommended but sometimes necessary)
  if (req.method === 'GET' && req.query.token) {
    return req.query.token;
  }

  return null;
}

/**
 * Main authentication middleware
 */
function authenticate(options = {}) {
  const {
    required = true,
    validateSession = true,
    skipBlacklist = false,
  } = options;

  return async (req, res, next) => {
    try {
      const token = extractToken(req);

      // If no token and not required, continue
      if (!token && !required) {
        req.user = null;
        return next();
      }

      // If no token but required, reject
      if (!token) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'No authentication token provided',
        });
      }

      // Validate token format
      if (token.length < 32) {
        return res.status(401).json({
          error: 'Invalid token format',
          message: 'Token appears to be malformed',
        });
      }

      // Verify session if enabled
      if (validateSession && !skipBlacklist) {
        const validation = await sessionService.verifyAccessToken(token);

        if (!validation.valid) {
          const errorMessages = {
            token_revoked: 'This session has been revoked',
            session_not_found: 'Session not found or expired',
            session_revoked: 'Session has been terminated',
            session_inactive: 'Session is no longer active',
            session_expired: 'Session has expired',
          };

          return res.status(401).json({
            error: 'Invalid session',
            message: errorMessages[validation.reason] || 'Session validation failed',
            reason: validation.reason,
          });
        }

        // Attach validated session info
        req.session = {
          id: validation.sessionId,
          userId: validation.userId,
        };
      }

      // Verify JWT signature and decode
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (jwtError) {
        if (jwtError.name === 'TokenExpiredError') {
          return res.status(401).json({
            error: 'Token expired',
            message: 'Your session has expired. Please refresh your token.',
            expiredAt: jwtError.expiredAt,
          });
        }

        if (jwtError.name === 'JsonWebTokenError') {
          return res.status(401).json({
            error: 'Invalid token',
            message: 'Token signature verification failed',
          });
        }

        throw jwtError;
      }

      // Validate token claims
      if (!decoded.sub || !decoded.email) {
        return res.status(401).json({
          error: 'Invalid token claims',
          message: 'Token is missing required claims',
        });
      }

      // Check if session ID matches (if available)
      if (validateSession && decoded.session_id && req.session) {
        if (decoded.session_id !== req.session.id) {
          return res.status(401).json({
            error: 'Session mismatch',
            message: 'Token session does not match active session',
          });
        }
      }

      // Attach user info to request
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        org_id: decoded.org_id,
        org_slug: decoded.org_slug,
        org_type: decoded.org_type,
        location_ids: decoded.location_ids || [],
        roles: decoded.roles || [],
        permissions: decoded.permissions || [],
        session_id: decoded.session_id,
      };

      // Attach original token for potential refresh operations
      req.accessToken = token;

      next();
    } catch (error) {
      console.error('Authentication middleware error:', error);
      return res.status(500).json({
        error: 'Authentication failed',
        message: 'An error occurred during authentication',
      });
    }
  };
}

/**
 * Require specific permissions
 * Must be used after authenticate middleware
 */
function requirePermissions(...permissions) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource',
      });
    }

    const userPermissions = req.user.permissions || [];
    const hasAllPermissions = permissions.every(perm => 
      userPermissions.includes(perm)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'You do not have permission to access this resource',
        required: permissions,
        current: userPermissions,
      });
    }

    next();
  };
}

/**
 * Require specific roles
 * Must be used after authenticate middleware
 */
function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource',
      });
    }

    const userRoles = req.user.roles || [];
    const hasAnyRole = roles.some(role => userRoles.includes(role));

    if (!hasAnyRole) {
      return res.status(403).json({
        error: 'Insufficient privileges',
        message: 'You do not have the required role to access this resource',
        required: roles,
        current: userRoles,
      });
    }

    next();
  };
}

/**
 * Check if user is admin (has ORG_ADMIN or SYSTEM_ADMIN role)
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'You must be logged in to access this resource',
    });
  }

  const userRoles = req.user.roles || [];
  const isAdmin = userRoles.includes('ORG_ADMIN') || userRoles.includes('SYSTEM_ADMIN');

  if (!isAdmin) {
    return res.status(403).json({
      error: 'Admin access required',
      message: 'This resource requires administrator privileges',
    });
  }

  next();
}

/**
 * Optional authentication
 * If token provided, validates it. If not, continues without user
 */
const optionalAuth = authenticate({ required: false });

module.exports = {
  authenticate,
  requirePermissions,
  requireRoles,
  requireAdmin,
  optionalAuth,
  extractToken,
};
