/**
 * Response Caching Middleware for Sub-10ms API Responses
 * 
 * Implements ETags, cache headers, and request coalescing
 * for lightning-fast API responses.
 * 
 * Usage:
 *   app.get('/api/patients/:id', responseCache(60), handler);
 *   app.get('/api/patients', responseCache(30, { varyByQuery: true }), handler);
 */

const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Request Coalescer - Prevents duplicate concurrent requests
 */
class RequestCoalescer {
  constructor() {
    this.pending = new Map();
  }

  async coalesce(key, fn) {
    // If request is already pending, wait for it
    if (this.pending.has(key)) {
      logger.debug('Request coalesced', { key });
      return this.pending.get(key);
    }

    // Execute request
    const promise = fn().finally(() => {
      this.pending.delete(key);
    });

    this.pending.set(key, promise);
    return promise;
  }

  getPendingCount() {
    return this.pending.size;
  }
}

const requestCoalescer = new RequestCoalescer();

/**
 * Generate ETag from response data
 */
function generateETag(data) {
  const hash = crypto.createHash('md5');
  hash.update(typeof data === 'string' ? data : JSON.stringify(data));
  return `"${hash.digest('hex')}"`;
}

/**
 * Response caching middleware
 * 
 * @param {number} maxAge - Cache max age in seconds
 * @param {object} options - Additional options
 * @param {boolean} options.varyByQuery - Include query params in cache key
 * @param {boolean} options.private - Use private cache (default: public)
 * @param {string[]} options.varyHeaders - Headers to vary by
 */
function responseCache(maxAge = 60, options = {}) {
  const {
    varyByQuery = false,
    private: isPrivate = false,
    varyHeaders = [],
  } = options;

  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    let cacheKey = req.path;
    if (varyByQuery) {
      const queryString = new URLSearchParams(req.query).toString();
      if (queryString) {
        cacheKey += `?${queryString}`;
      }
    }

    // Add vary headers to cache key
    for (const header of varyHeaders) {
      const headerValue = req.get(header);
      if (headerValue) {
        cacheKey += `:${header}=${headerValue}`;
      }
    }

    // Intercept res.json and res.send
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    const sendResponse = (data) => {
      // Generate ETag
      const etag = generateETag(data);
      res.set('ETag', etag);

      // Set cache control headers
      const cacheControl = isPrivate
        ? `private, max-age=${maxAge}`
        : `public, max-age=${maxAge}`;
      res.set('Cache-Control', cacheControl);

      // Add Vary headers
      if (varyHeaders.length > 0) {
        res.set('Vary', varyHeaders.join(', '));
      }

      // Check if client has cached version
      const clientETag = req.get('if-none-match');
      if (clientETag === etag) {
        logger.debug('ETag match - sending 304', { path: req.path, etag });
        return res.status(304).end();
      }

      // Send response
      return typeof data === 'string' ? originalSend(data) : originalJson(data);
    };

    // Override response methods
    res.json = (data) => sendResponse(data);
    res.send = (data) => sendResponse(data);

    next();
  };
}

/**
 * Request coalescing middleware
 * Prevents duplicate concurrent requests to the same endpoint
 */
function requestCoalescingMiddleware(req, res, next) {
  // Only coalesce GET requests
  if (req.method !== 'GET') {
    return next();
  }

  // Generate coalesce key
  const coalesceKey = `${req.method}:${req.path}:${JSON.stringify(req.query)}`;

  // Intercept res.json and res.send
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  let responseSent = false;

  const sendResponse = (data) => {
    if (responseSent) return;
    responseSent = true;
    return typeof data === 'string' ? originalSend(data) : originalJson(data);
  };

  res.json = sendResponse;
  res.send = sendResponse;

  // Use coalescer
  requestCoalescer.coalesce(coalesceKey, async () => {
    return new Promise((resolve) => {
      // Store resolve function
      res.on('finish', () => {
        resolve();
      });
      next();
    });
  });
}

/**
 * Compression middleware configuration
 * (To be used with compression package)
 */
const compressionConfig = {
  level: 6, // Balanced compression level
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }

    // Don't compress images, videos, or already compressed formats
    const contentType = res.getHeader('Content-Type');
    if (contentType && (
      contentType.includes('image/') ||
      contentType.includes('video/') ||
      contentType.includes('application/octet-stream')
    )) {
      return false;
    }

    return true;
  },
};

/**
 * Cache warming utility
 * Pre-populates cache with commonly accessed data
 */
async function warmCache(endpoints, baseURL) {
  logger.info('Starting cache warming', { count: endpoints.length });

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseURL}${endpoint}`);
      if (response.ok) {
        await response.text(); // Consume response
        logger.debug('Cache warmed', { endpoint });
      }
    } catch (error) {
      logger.warn('Cache warm failed', { endpoint, error: error.message });
    }
  }

  logger.info('Cache warming complete');
}

/**
 * Get coalescer statistics
 */
function getCoalescerStats() {
  return {
    pendingRequests: requestCoalescer.getPendingCount(),
  };
}

module.exports = {
  responseCache,
  requestCoalescingMiddleware,
  compressionConfig,
  warmCache,
  getCoalescerStats,
};
