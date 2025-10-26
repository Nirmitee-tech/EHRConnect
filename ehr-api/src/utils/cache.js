/**
 * Redis Cache Utility
 *
 * Provides caching for user data to reduce database queries and improve performance.
 * Automatically invalidates cache when data is updated.
 */

const redis = require('redis');

// Create Redis client
const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Redis reconnection failed after 10 attempts');
        return new Error('Redis reconnection limit exceeded');
      }
      return retries * 100; // Exponential backoff
    }
  }
});

client.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

client.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

client.on('reconnecting', () => {
  console.log('⚠️ Redis reconnecting...');
});

// Connect to Redis
(async () => {
  try {
    await client.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
})();

/**
 * Cache key patterns for different data types
 * Organized by user/org to make invalidation easier
 */
const CACHE_KEYS = {
  USER_PERMISSIONS: (userId) => `user:${userId}:permissions`,
  USER_ROLES: (userId) => `user:${userId}:roles`,
  USER_LOCATIONS: (userId) => `user:${userId}:locations`,
  USER_PROFILE: (userId) => `user:${userId}:profile`,
  ORG_DATA: (orgId) => `org:${orgId}:data`,
  ORG_SETTINGS: (orgId) => `org:${orgId}:settings`,
  // Pattern for bulk deletion
  USER_ALL: (userId) => `user:${userId}:*`,
  ORG_ALL: (orgId) => `org:${orgId}:*`,
};

/**
 * Default cache TTL (Time To Live) in seconds
 */
const DEFAULT_TTL = {
  USER_DATA: 3600,        // 1 hour - user permissions, roles
  ORG_DATA: 7200,         // 2 hours - org settings rarely change
  SHORT_LIVED: 300,       // 5 minutes - frequently changing data
  LONG_LIVED: 86400,      // 24 hours - rarely changing data
};

/**
 * Get data from cache
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Cached data or null if not found
 */
async function get(key) {
  try {
    if (!client.isOpen) {
      console.warn('Redis not connected, skipping cache get');
      return null;
    }

    const data = await client.get(key);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null; // Fail gracefully - return null to fetch from DB
  }
}

/**
 * Set data in cache
 * @param {string} key - Cache key
 * @param {any} value - Data to cache
 * @param {number} ttl - Time to live in seconds (optional)
 * @returns {Promise<boolean>} Success status
 */
async function set(key, value, ttl = DEFAULT_TTL.USER_DATA) {
  try {
    if (!client.isOpen) {
      console.warn('Redis not connected, skipping cache set');
      return false;
    }

    await client.setEx(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false; // Fail gracefully
  }
}

/**
 * Delete specific cache key
 * @param {string} key - Cache key to delete
 * @returns {Promise<boolean>} Success status
 */
async function del(key) {
  try {
    if (!client.isOpen) {
      console.warn('Redis not connected, skipping cache delete');
      return false;
    }

    await client.del(key);
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
}

/**
 * Delete all cache keys matching a pattern
 * @param {string} pattern - Pattern to match (e.g., "user:123:*")
 * @returns {Promise<number>} Number of keys deleted
 */
async function delPattern(pattern) {
  try {
    if (!client.isOpen) {
      console.warn('Redis not connected, skipping pattern delete');
      return 0;
    }

    const keys = await client.keys(pattern);
    if (keys.length === 0) return 0;

    await client.del(keys);
    return keys.length;
  } catch (error) {
    console.error('Cache pattern delete error:', error);
    return 0;
  }
}

/**
 * Invalidate all cache for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of keys deleted
 */
async function invalidateUser(userId) {
  console.log(`🗑️ Invalidating cache for user: ${userId}`);
  return await delPattern(CACHE_KEYS.USER_ALL(userId));
}

/**
 * Invalidate all cache for a specific organization
 * @param {string} orgId - Organization ID
 * @returns {Promise<number>} Number of keys deleted
 */
async function invalidateOrg(orgId) {
  console.log(`🗑️ Invalidating cache for org: ${orgId}`);
  return await delPattern(CACHE_KEYS.ORG_ALL(orgId));
}

/**
 * Invalidate specific user data type
 * @param {string} userId - User ID
 * @param {string} type - Type: 'permissions', 'roles', 'locations', 'profile'
 * @returns {Promise<boolean>} Success status
 */
async function invalidateUserData(userId, type) {
  const keyMap = {
    permissions: CACHE_KEYS.USER_PERMISSIONS,
    roles: CACHE_KEYS.USER_ROLES,
    locations: CACHE_KEYS.USER_LOCATIONS,
    profile: CACHE_KEYS.USER_PROFILE,
  };

  if (!keyMap[type]) {
    console.error(`Invalid cache type: ${type}`);
    return false;
  }

  console.log(`🗑️ Invalidating ${type} cache for user: ${userId}`);
  return await del(keyMap[type](userId));
}

/**
 * Get or set cache with a function (cache-aside pattern)
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Function to fetch data if cache miss
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<any>} Data from cache or fetched
 */
async function getOrSet(key, fetchFn, ttl = DEFAULT_TTL.USER_DATA) {
  // Try to get from cache
  const cached = await get(key);
  if (cached !== null) {
    return { data: cached, fromCache: true };
  }

  // Cache miss - fetch from source
  const data = await fetchFn();

  // Store in cache for next time
  await set(key, data, ttl);

  return { data, fromCache: false };
}

/**
 * Flush all cache (use with caution!)
 * @returns {Promise<boolean>} Success status
 */
async function flushAll() {
  try {
    if (!client.isOpen) {
      console.warn('Redis not connected, skipping flush');
      return false;
    }

    await client.flushAll();
    console.log('🗑️ All cache flushed');
    return true;
  } catch (error) {
    console.error('Cache flush error:', error);
    return false;
  }
}

/**
 * Get cache statistics
 * @returns {Promise<object>} Cache statistics
 */
async function getStats() {
  try {
    if (!client.isOpen) {
      return { connected: false };
    }

    const info = await client.info('stats');
    const dbSize = await client.dbSize();

    return {
      connected: true,
      totalKeys: dbSize,
      info: info,
    };
  } catch (error) {
    console.error('Cache stats error:', error);
    return { connected: false, error: error.message };
  }
}

module.exports = {
  client,
  CACHE_KEYS,
  DEFAULT_TTL,
  get,
  set,
  del,
  delPattern,
  invalidateUser,
  invalidateOrg,
  invalidateUserData,
  getOrSet,
  flushAll,
  getStats,
};
