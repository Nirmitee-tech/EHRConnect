/**
 * Performance Monitoring Middleware
 * 
 * Tracks API endpoint performance metrics including:
 * - Response times
 * - Status codes
 * - Database pool stats
 * - Memory usage
 */

const logger = require('../utils/logger');
const { getPoolStats } = require('../database/connection');

// Track performance metrics
const metrics = {
  requests: {
    total: 0,
    byStatus: {},
    byEndpoint: {},
  },
  responseTimes: {
    p50: [],
    p95: [],
    p99: [],
  },
  slowRequests: [],
};

/**
 * Middleware to track request performance
 */
function performanceMonitoring(req, res, next) {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;
    const endMemory = process.memoryUsage();
    
    // Track metrics
    metrics.requests.total++;
    metrics.requests.byStatus[res.statusCode] = (metrics.requests.byStatus[res.statusCode] || 0) + 1;
    
    const endpoint = `${req.method} ${req.route?.path || req.path}`;
    if (!metrics.requests.byEndpoint[endpoint]) {
      metrics.requests.byEndpoint[endpoint] = { count: 0, totalTime: 0, avgTime: 0 };
    }
    metrics.requests.byEndpoint[endpoint].count++;
    metrics.requests.byEndpoint[endpoint].totalTime += duration;
    metrics.requests.byEndpoint[endpoint].avgTime = 
      metrics.requests.byEndpoint[endpoint].totalTime / metrics.requests.byEndpoint[endpoint].count;

    // Track response times for percentile calculation
    metrics.responseTimes.p50.push(duration);
    if (metrics.responseTimes.p50.length > 1000) {
      metrics.responseTimes.p50.shift(); // Keep last 1000
    }

    // Log request completion
    const logData = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length'),
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    };

    // Log slow requests as warnings
    if (duration > 3000) {
      logger.warn('Slow request detected', {
        ...logData,
        memoryDelta: {
          heapUsed: `${((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024).toFixed(2)}MB`,
          external: `${((endMemory.external - startMemory.external) / 1024 / 1024).toFixed(2)}MB`,
        },
      });
      
      // Track slow requests
      metrics.slowRequests.push({
        ...logData,
        timestamp: new Date().toISOString(),
      });
      
      // Keep only last 100 slow requests
      if (metrics.slowRequests.length > 100) {
        metrics.slowRequests.shift();
      }
    } else if (duration > 1000) {
      logger.info('Request completed', logData);
    } else {
      logger.debug('Request completed', logData);
    }

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Calculate percentile from sorted array
 */
function calculatePercentile(arr, percentile) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}

/**
 * Get current performance metrics
 */
function getMetrics() {
  const poolStats = getPoolStats();
  const memUsage = process.memoryUsage();
  
  return {
    requests: {
      total: metrics.requests.total,
      byStatus: metrics.requests.byStatus,
      topEndpoints: Object.entries(metrics.requests.byEndpoint)
        .sort((a, b) => b[1].avgTime - a[1].avgTime)
        .slice(0, 10)
        .map(([endpoint, stats]) => ({
          endpoint,
          ...stats,
          avgTime: `${stats.avgTime.toFixed(2)}ms`,
        })),
    },
    responseTimes: {
      p50: `${calculatePercentile(metrics.responseTimes.p50, 50)}ms`,
      p95: `${calculatePercentile(metrics.responseTimes.p50, 95)}ms`,
      p99: `${calculatePercentile(metrics.responseTimes.p50, 99)}ms`,
      count: metrics.responseTimes.p50.length,
    },
    slowRequests: {
      count: metrics.slowRequests.length,
      latest: metrics.slowRequests.slice(-10), // Last 10
    },
    database: {
      pool: poolStats,
    },
    memory: {
      heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
      heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
      external: `${(memUsage.external / 1024 / 1024).toFixed(2)}MB`,
      rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)}MB`,
    },
    uptime: `${(process.uptime() / 60).toFixed(2)} minutes`,
  };
}

/**
 * Reset metrics (useful for testing)
 */
function resetMetrics() {
  metrics.requests.total = 0;
  metrics.requests.byStatus = {};
  metrics.requests.byEndpoint = {};
  metrics.responseTimes.p50 = [];
  metrics.slowRequests = [];
}

module.exports = {
  performanceMonitoring,
  getMetrics,
  resetMetrics,
};
