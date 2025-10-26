/**
 * Cache Invalidation Middleware
 *
 * Automatically invalidates cache when data is modified
 * Prevents stale data from being served after updates
 */

const cache = require('../utils/cache');

/**
 * Invalidate user cache after user data modifications
 *
 * Usage:
 * router.put('/users/:id', invalidateUserCache, async (req, res) => { ... })
 */
async function invalidateUserCache(req, res, next) {
  // Store original send function
  const originalSend = res.send;

  // Override send to invalidate cache after successful response
  res.send = function(data) {
    // Check if response was successful (2xx status)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      // Extract user ID from params, body, or custom property
      const userId = req.params.id || req.params.userId || req.body.userId || req.userId;

      if (userId) {
        // Invalidate asynchronously (don't wait)
        cache.invalidateUser(userId).catch(err => {
          console.error('Cache invalidation error:', err);
        });
      }
    }

    // Call original send
    originalSend.call(this, data);
  };

  next();
}

/**
 * Invalidate organization cache after org data modifications
 *
 * Usage:
 * router.put('/organizations/:id', invalidateOrgCache, async (req, res) => { ... })
 */
async function invalidateOrgCache(req, res, next) {
  const originalSend = res.send;

  res.send = function(data) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const orgId = req.params.id || req.params.orgId || req.body.orgId || req.orgId;

      if (orgId) {
        cache.invalidateOrg(orgId).catch(err => {
          console.error('Cache invalidation error:', err);
        });
      }
    }

    originalSend.call(this, data);
  };

  next();
}

/**
 * Invalidate specific user data type
 *
 * Usage:
 * router.post('/users/:id/roles', invalidateUserRoles, async (req, res) => { ... })
 */
function invalidateUserDataType(type) {
  return async function(req, res, next) {
    const originalSend = res.send;

    res.send = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.params.id || req.params.userId || req.body.userId || req.userId;

        if (userId) {
          cache.invalidateUserData(userId, type).catch(err => {
            console.error('Cache invalidation error:', err);
          });
        }
      }

      originalSend.call(this, data);
    };

    next();
  };
}

// Convenience middleware for specific data types
const invalidateUserPermissions = invalidateUserDataType('permissions');
const invalidateUserRoles = invalidateUserDataType('roles');
const invalidateUserLocations = invalidateUserDataType('locations');
const invalidateUserProfile = invalidateUserDataType('profile');

/**
 * Invalidate multiple users' cache
 * Useful when batch operations affect multiple users
 *
 * Usage:
 * router.post('/roles/:id/assign-users', invalidateMultipleUsers, async (req, res) => {
 *   req.affectedUserIds = ['user1', 'user2', 'user3'];
 *   // ... your logic
 * })
 */
async function invalidateMultipleUsers(req, res, next) {
  const originalSend = res.send;

  res.send = function(data) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const userIds = req.affectedUserIds || req.body.userIds || [];

      if (Array.isArray(userIds) && userIds.length > 0) {
        Promise.all(
          userIds.map(userId => cache.invalidateUser(userId))
        ).catch(err => {
          console.error('Batch cache invalidation error:', err);
        });
      }
    }

    originalSend.call(this, data);
  };

  next();
}

/**
 * Smart cache invalidation based on route patterns
 * Automatically detects what to invalidate based on the route
 *
 * Usage:
 * router.put('/users/:id', smartInvalidate, async (req, res) => { ... })
 * router.post('/roles/:id/users', smartInvalidate, async (req, res) => { ... })
 */
async function smartInvalidate(req, res, next) {
  const originalSend = res.send;

  res.send = function(data) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const path = req.route.path;

      // Invalidate based on route patterns
      if (path.includes('/users/') || path.includes('/user/')) {
        const userId = req.params.id || req.params.userId;
        if (userId) {
          cache.invalidateUser(userId).catch(console.error);
        }
      }

      if (path.includes('/organizations/') || path.includes('/org/')) {
        const orgId = req.params.id || req.params.orgId;
        if (orgId) {
          cache.invalidateOrg(orgId).catch(console.error);
        }
      }

      if (path.includes('/roles')) {
        // Invalidate all affected users' permissions
        const userIds = req.affectedUserIds || req.body.userIds || [];
        if (userIds.length > 0) {
          userIds.forEach(userId => {
            cache.invalidateUserData(userId, 'permissions').catch(console.error);
            cache.invalidateUserData(userId, 'roles').catch(console.error);
          });
        }
      }

      if (path.includes('/locations')) {
        const userId = req.params.userId || req.body.userId;
        if (userId) {
          cache.invalidateUserData(userId, 'locations').catch(console.error);
        }
      }
    }

    originalSend.call(this, data);
  };

  next();
}

module.exports = {
  invalidateUserCache,
  invalidateOrgCache,
  invalidateUserDataType,
  invalidateUserPermissions,
  invalidateUserRoles,
  invalidateUserLocations,
  invalidateUserProfile,
  invalidateMultipleUsers,
  smartInvalidate,
};
