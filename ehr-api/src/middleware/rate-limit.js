const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

/**
 * Rate Limiting Middleware Configuration
 * 
 * Provides different rate limiters for various endpoints
 * Uses Redis for distributed rate limiting (falls back to memory if unavailable)
 * 
 * Features:
 * - Per-IP rate limiting
 * - Per-user rate limiting
 * - Customizable time windows
 * - Detailed error messages
 * - Redis-backed for multi-instance deployments
 */

// Create Redis client for rate limiting
let redisClient;
try {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  redisClient = redis.createClient({ url: redisUrl, legacyMode: true });
  
  redisClient.connect().catch(err => {
    console.warn('⚠️ Redis unavailable for rate limiting, falling back to memory store:', err.message);
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis rate limit error:', err);
  });

  redisClient.on('ready', () => {
    console.log('✅ Redis rate limiter ready');
  });
} catch (error) {
  console.warn('⚠️ Could not create Redis client for rate limiting:', error.message);
}

/**
 * Create rate limiter with Redis or memory store
 */
function createRateLimiter(options) {
  const {
    windowMs,
    max,
    message,
    keyPrefix = 'rl:',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  const limiterConfig = {
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      message,
      retryAfter: windowMs / 1000,
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
    skipSuccessfulRequests,
    skipFailedRequests,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise IP
      return req.user?.id || req.ip;
    },
  };

  // Use Redis store if available
  if (redisClient && redisClient.isOpen) {
    limiterConfig.store = new RedisStore({
      client: redisClient,
      prefix: keyPrefix,
    });
  }

  return rateLimit(limiterConfig);
}

/**
 * Authentication Endpoints Rate Limiter
 * Strict limits to prevent brute force attacks
 */
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts. Please try again in 15 minutes.',
  keyPrefix: 'rl:auth:',
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

/**
 * MFA Code Generation Rate Limiter
 * Prevent SMS/email spam and cost abuse
 */
const mfaCodeLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 codes per window
  message: 'Too many verification code requests. Please try again in 15 minutes.',
  keyPrefix: 'rl:mfa:code:',
  skipSuccessfulRequests: false,
});

/**
 * MFA Verification Rate Limiter
 * Prevent code guessing attacks
 */
const mfaVerifyLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 attempts per window
  message: 'Too many verification attempts. Please try again in 5 minutes.',
  keyPrefix: 'rl:mfa:verify:',
  skipSuccessfulRequests: true, // Reset on successful verification
});

/**
 * Token Refresh Rate Limiter
 * Moderate limits - users need to refresh every 15 minutes
 */
const refreshTokenLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 refreshes per window (allows multiple tabs/devices)
  message: 'Too many token refresh requests. Please try again in a few minutes.',
  keyPrefix: 'rl:refresh:',
  skipSuccessfulRequests: false,
});

/**
 * Password Reset Request Rate Limiter
 * Prevent email spam
 */
const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: 'Too many password reset requests. Please try again in an hour.',
  keyPrefix: 'rl:pwd:reset:',
});

/**
 * Password Change Rate Limiter
 * Prevent rapid password changes (suspicious behavior)
 */
const passwordChangeLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 changes per hour
  message: 'Too many password change attempts. Please try again later.',
  keyPrefix: 'rl:pwd:change:',
});

/**
 * General API Rate Limiter
 * Applied to all API endpoints as a baseline
 */
const apiLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests. Please slow down.',
  keyPrefix: 'rl:api:',
  skipSuccessfulRequests: true,
});

/**
 * Strict API Rate Limiter
 * For sensitive operations
 */
const strictApiLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Rate limit exceeded for this operation. Please try again later.',
  keyPrefix: 'rl:api:strict:',
});

/**
 * Session Management Rate Limiter
 * Moderate limits for session operations
 */
const sessionLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // 20 operations per 5 minutes
  message: 'Too many session management requests. Please try again in a few minutes.',
  keyPrefix: 'rl:session:',
});

/**
 * Registration Rate Limiter
 * Prevent bulk account creation
 */
const registrationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: 'Too many registration attempts. Please try again in an hour.',
  keyPrefix: 'rl:register:',
});

/**
 * 2FA Settings Change Rate Limiter
 * Prevent rapid 2FA enable/disable (suspicious)
 */
const twoFactorSettingsLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 changes per 15 minutes
  message: 'Too many 2FA setting changes. Please try again in 15 minutes.',
  keyPrefix: 'rl:2fa:settings:',
});

/**
 * Custom rate limiter for user-specific actions
 * Tracks by user ID instead of IP
 */
function createUserRateLimiter(options) {
  const limiter = createRateLimiter(options);
  
  return (req, res, next) => {
    // Skip if no user authenticated
    if (!req.user) {
      return next();
    }
    
    // Override key generator to use user ID
    const originalKeyGenerator = limiter.keyGenerator;
    limiter.keyGenerator = () => req.user.id;
    
    limiter(req, res, (err) => {
      // Restore original key generator
      limiter.keyGenerator = originalKeyGenerator;
      
      if (err) return next(err);
      next();
    });
  };
}

/**
 * Conditional rate limiter
 * Apply different limits based on conditions
 */
function conditionalRateLimiter(condition, limiterTrue, limiterFalse) {
  return (req, res, next) => {
    const limiter = condition(req) ? limiterTrue : limiterFalse;
    limiter(req, res, next);
  };
}

/**
 * Get rate limit info from headers
 */
function getRateLimitInfo(res) {
  return {
    limit: res.getHeader('RateLimit-Limit'),
    remaining: res.getHeader('RateLimit-Remaining'),
    reset: res.getHeader('RateLimit-Reset'),
  };
}

/**
 * Graceful shutdown
 */
async function closeRateLimitStore() {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    console.log('✅ Redis rate limiter closed');
  }
}

module.exports = {
  // Pre-configured limiters
  authLimiter,
  mfaCodeLimiter,
  mfaVerifyLimiter,
  refreshTokenLimiter,
  passwordResetLimiter,
  passwordChangeLimiter,
  apiLimiter,
  strictApiLimiter,
  sessionLimiter,
  registrationLimiter,
  twoFactorSettingsLimiter,
  
  // Custom limiter creators
  createRateLimiter,
  createUserRateLimiter,
  conditionalRateLimiter,
  
  // Utilities
  getRateLimitInfo,
  closeRateLimitStore,
};
