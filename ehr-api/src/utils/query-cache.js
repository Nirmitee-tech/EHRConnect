/**
 * Query Result Cache Utility
 * 
 * Provides in-memory caching for database query results to reduce
 * repeated queries for static or rarely-changing data.
 * 
 * Features:
 * - TTL-based expiration
 * - Automatic cache invalidation
 * - Memory-efficient storage
 * - Cache statistics
 * 
 * Usage:
 *   const queryCache = require('./utils/query-cache');
 *   
 *   // Cache a query result
 *   const roles = await queryCache.wrap('roles:org:123', 600, async () => {
 *     return await db.query('SELECT * FROM roles WHERE org_id = $1', ['123']);
 *   });
 *   
 *   // Invalidate cache
 *   queryCache.invalidate('roles:org:123');
 *   queryCache.invalidatePattern('roles:*');
 */

const logger = require('./logger');

class QueryCache {
  constructor() {
    // Simple in-memory cache using Map
    this.cache = new Map();
    this.defaultTTL = 600; // 10 minutes in seconds
    this.maxKeys = 1000;

    // Track cache statistics
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      invalidations: 0,
    };

    // Cleanup expired entries every 2 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 120000);
  }

  /**
   * Cleanup expired cache entries
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt && entry.expiresAt < now) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.debug('Cache cleanup completed', { cleaned });
    }
  }

  /**
   * Get value from cache or execute function and cache result
   * @param {string} key - Cache key
   * @param {number} ttl - Time to live in seconds (optional, uses default if not provided)
   * @param {Function} fn - Async function to execute if cache miss
   * @returns {Promise<any>} Cached or fresh value
   */
  async wrap(key, ttl, fn) {
    // If ttl is a function, it means ttl was omitted
    if (typeof ttl === 'function') {
      fn = ttl;
      ttl = this.defaultTTL;
    }

    // Try to get from cache
    const cached = this.get(key);
    if (cached !== undefined) {
      this.stats.hits++;
      logger.debug('Cache hit', { key });
      return cached;
    }

    // Cache miss - execute function
    this.stats.misses++;
    logger.debug('Cache miss', { key });

    try {
      const result = await fn();
      
      // Cache the result
      this.set(key, result, ttl);
      this.stats.sets++;
      logger.debug('Cache set', { key, ttl });
      
      return result;
    } catch (error) {
      logger.error('Error executing cached function', {
        key,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {any|undefined} Cached value or undefined if not found
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Set value in cache with LRU eviction
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (optional)
   */
  set(key, value, ttl) {
    // Enforce max keys limit with LRU eviction
    if (this.cache.size >= this.maxKeys && !this.cache.has(key)) {
      // Find and remove least recently used entry (first expired or oldest)
      let oldestKey = null;
      let oldestTime = Infinity;
      
      for (const [k, entry] of this.cache.entries()) {
        // Remove if expired
        if (entry.expiresAt && entry.expiresAt < Date.now()) {
          this.cache.delete(k);
          break;
        }
        // Track oldest by expiration time
        const entryTime = entry.expiresAt || entry.createdAt || 0;
        if (entryTime < oldestTime) {
          oldestTime = entryTime;
          oldestKey = k;
        }
      }
      
      // If no expired entry found, remove oldest
      if (this.cache.size >= this.maxKeys && oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    const expiresAt = ttl ? Date.now() + (ttl * 1000) : null;
    this.cache.set(key, { 
      value, 
      expiresAt,
      createdAt: Date.now() // Track creation time for LRU
    });
    
    return true;
  }

  /**
   * Invalidate (delete) a single cache key
   * @param {string} key - Cache key to invalidate
   * @returns {number} Number of deleted entries
   */
  invalidate(key) {
    const deleted = this.cache.delete(key) ? 1 : 0;
    if (deleted > 0) {
      this.stats.invalidations++;
    }
    logger.debug('Cache invalidated', { key, deleted });
    return deleted;
  }

  /**
   * Invalidate all keys matching a pattern
   * @param {string} pattern - Pattern to match (supports * wildcard)
   * @returns {number} Number of deleted entries
   */
  invalidatePattern(pattern) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    let deleted = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }
    
    this.stats.invalidations += deleted;
    logger.debug('Cache pattern invalidated', { pattern, deleted });
    return deleted;
  }

  /**
   * Clear all cached entries
   */
  flush() {
    this.cache.clear();
    logger.info('Cache flushed');
  }

  /**
   * Get cache statistics
   * @returns {object} Statistics object
   */
  getStats() {
    return {
      keys: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0,
      sets: this.stats.sets,
      invalidations: this.stats.invalidations,
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      invalidations: 0,
    };
  }

  /**
   * Get all cache keys
   * @returns {string[]} Array of cache keys
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Check if cache has a key
   * @param {string} key - Cache key
   * @returns {boolean} True if key exists
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Get TTL for a key
   * @param {string} key - Cache key
   * @returns {number|undefined} TTL in milliseconds or undefined if not found
   */
  getTtl(key) {
    const entry = this.cache.get(key);
    if (!entry || !entry.expiresAt) {
      return undefined;
    }
    return entry.expiresAt - Date.now();
  }

  /**
   * Cleanup on destroy
   */
  destroy() {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

// Export singleton instance
const queryCache = new QueryCache();

// Export cache keys patterns for consistency
queryCache.KEYS = {
  ROLES: (orgId) => `roles:${orgId}`,
  ROLES_SYSTEM: 'roles:system',
  PERMISSIONS: (roleId) => `permissions:${roleId}`,
  MEDICAL_CODES: (type, search) => `medical-codes:${type}:${search}`,
  ORGANIZATION: (orgId) => `org:${orgId}`,
  USER_PERMISSIONS: (userId) => `user-permissions:${userId}`,
  SPECIALTY_PACK: (slug, version) => `specialty:${slug}:${version}`,
  COUNTRY_SETTINGS: (countryCode) => `country:${countryCode}`,
  FORM_TEMPLATE: (templateId) => `form-template:${templateId}`,
};

module.exports = queryCache;
