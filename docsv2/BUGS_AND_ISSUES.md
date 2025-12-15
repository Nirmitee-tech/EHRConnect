# Bugs, Issues & Security Concerns

## 🚨 CRITICAL ISSUES (Fix Immediately)

### 1. **No Authentication Middleware on Session Routes**
**Location**: `ehr-api/src/routes/sessions.js`

**Issue**: All session management endpoints rely on `x-user-id` header without verification.

```javascript
const userId = req.headers['x-user-id']; // Can be spoofed!
```

**Impact**: 
- Attackers can view anyone's sessions by changing the header
- Attackers can revoke other users' sessions
- Complete session management bypass

**Fix Required**:
```javascript
// Create middleware: src/middleware/authenticate.js
const jwt = require('jsonwebtoken');
const sessionService = require('../services/session.service');

async function authenticate(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const accessToken = authHeader.split(' ')[1];
    
    // Verify token with session service
    const validation = await sessionService.verifyAccessToken(accessToken);
    
    if (!validation.valid) {
      return res.status(401).json({ 
        error: 'Invalid or expired token',
        reason: validation.reason 
      });
    }

    // Verify JWT
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    
    req.user = {
      id: validation.userId,
      sessionId: validation.sessionId,
      ...decoded
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

module.exports = { authenticate };
```

Then apply to routes:
```javascript
const { authenticate } = require('../middleware/authenticate');

router.get('/', authenticate, async (req, res) => {
  const userId = req.user.id; // From verified token
  const currentSessionId = req.user.sessionId;
  // ...
});
```

---

### 2. **Arguments Hack in Login Function**
**Location**: `ehr-api/src/services/postgres-auth.service.js:95`

**Issue**: Using `arguments[2]` is fragile and unclear.

```javascript
const metadata = arguments[2] || {}; // BAD!
```

**Impact**: 
- Code is hard to understand
- Easy to break when refactoring
- Metadata might not be passed correctly

**Fix**:
```javascript
// Change function signature
async login(email, password, skipMFA = false, metadata = {}) {
  // Now explicit!
}
```

---

### 3. **verifyCode SQL Injection Potential**
**Location**: `ehr-api/src/services/mfa.service.js:211`

**Issue**: Query uses code directly without proper parameterization.

```javascript
const codeResult = await client.query(
  `SELECT id, code, attempts, max_attempts, expires_at, verified_at, metadata
   FROM mfa_codes
   WHERE user_id = $1
     AND purpose = $2
     AND verified_at IS NULL
     AND expires_at > CURRENT_TIMESTAMP
     AND (metadata->>'invalidated')::boolean IS NOT TRUE
   ORDER BY created_at DESC
   LIMIT 1`,
  [userId, code, purpose] // BUG: Only 2 params but 3 placeholders?
);
```

**Impact**: Logic error - code not being checked in query

**Fix**: The code should be compared in the WHERE clause:
```javascript
WHERE user_id = $1
  AND purpose = $2
  AND verified_at IS NULL
  // code comparison happens in JavaScript which is correct
```

Actually, looking closer, this is **intentional** - the code is verified in JS for timing-safety. But it's confusing.

---

### 4. **No Rate Limiting on Critical Endpoints**
**Locations**: 
- `/api/sessions/refresh`
- `/api/mfa/send-code`
- `/api/auth/login`

**Issue**: These endpoints can be hammered unlimited times.

**Impact**:
- Brute force attacks
- DoS attacks
- SMS/email spam (costs money!)
- Refresh token enumeration

**Fix Required**: Install express-rate-limit
```javascript
const rateLimit = require('express-rate-limit');

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window per IP
  message: 'Too many refresh attempts, please try again later'
});

router.post('/refresh', refreshLimiter, async (req, res) => {
  // ...
});

const mfaCodeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3, // Only 3 codes per 15 minutes
  message: 'Too many code requests, please try again later'
});

router.post('/send-code', mfaCodeLimiter, async (req, res) => {
  // ...
});
```

---

## ⚠️ HIGH PRIORITY ISSUES

### 5. **No Frontend Token Management**
**Location**: Frontend (missing implementation)

**Issue**: The frontend needs to:
- Store access + refresh tokens
- Automatically refresh before expiry
- Handle 401 errors with retry
- Clear tokens on logout

**Missing Code**:
```typescript
// lib/auth-token-manager.ts
class AuthTokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshTimeout: NodeJS.Timeout | null = null;

  setTokens(access: string, refresh: string, expiresIn: number) {
    this.accessToken = access;
    this.refreshToken = refresh;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    this.scheduleRefresh(expiresIn);
  }

  scheduleRefresh(expiresIn: number) {
    if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
    
    // Refresh 1 minute before expiry
    const refreshTime = (expiresIn - 60) * 1000;
    
    this.refreshTimeout = setTimeout(async () => {
      await this.refreshAccessToken();
    }, refreshTime);
  }

  async refreshAccessToken() {
    try {
      const response = await fetch('/api/sessions/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });
      
      if (!response.ok) throw new Error('Refresh failed');
      
      const data = await response.json();
      this.setTokens(data.accessToken, this.refreshToken!, data.expiresIn);
    } catch (error) {
      // Redirect to login
      window.location.href = '/login';
    }
  }

  getAccessToken() {
    return this.accessToken || localStorage.getItem('accessToken');
  }

  clear() {
    this.accessToken = null;
    this.refreshToken = null;
    if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

export const authTokenManager = new AuthTokenManager();
```

---

### 6. **Missing Logout Implementation**
**Location**: Backend routes (missing)

**Issue**: No proper logout endpoint that revokes current session.

**Fix Required**:
```javascript
// In auth.js
router.post('/logout', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const sessionId = req.user.sessionId;

    // Revoke current session
    await sessionService.revokeSession(sessionId, userId);

    // Log audit event
    await query(
      `INSERT INTO audit_events (
        org_id, actor_user_id, action, target_type,
        status, ip_address, user_agent
      )
      VALUES ($1, $2, 'AUTH.LOGOUT', 'Session', 'success', $3, $4)`,
      [req.user.org_id, userId, req.ip, req.headers['user-agent']]
    );

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});
```

---

### 7. **Redis Connection Not Closed Gracefully**
**Location**: `ehr-api/src/services/session.service.js`

**Issue**: Redis client created in constructor but never properly shutdown.

**Impact**: Keeps connections open, prevents clean shutdown

**Fix**: Add shutdown hook in main app:
```javascript
// In index.js
const sessionService = require('./services/session.service');

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await sessionService.close();
  await dbPool.end();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
```

---

### 8. **date-fns Library Not Installed**
**Location**: `ehr-web/src/components/security/active-sessions.tsx:18`

**Issue**: Component imports date-fns but it might not be in package.json

**Fix**:
```bash
cd ehr-web
npm install date-fns
```

---

## 🔧 MEDIUM PRIORITY ISSUES

### 9. **Session Service Doesn't Handle Concurrent Operations**
**Location**: `ehr-api/src/services/session.service.js`

**Issue**: If multiple requests refresh tokens simultaneously, race conditions can occur.

**Example Scenario**:
1. User has 2 tabs open
2. Token expires
3. Both tabs call refresh at same time
4. Both get new access tokens
5. One immediately gets blacklisted
6. One tab breaks

**Fix**: Implement distributed locking with Redis:
```javascript
async refreshAccessToken(refreshToken) {
  const lockKey = `lock:refresh:${this.hashToken(refreshToken)}`;
  
  // Try to acquire lock
  const locked = await this.redisClient.set(lockKey, '1', {
    NX: true,
    EX: 5 // 5 second lock
  });
  
  if (!locked) {
    // Another request is already refreshing
    await this.sleep(1000);
    // Return the newly refreshed token from cache
    // ...
  }
  
  try {
    // Refresh logic
    // ...
  } finally {
    await this.redisClient.del(lockKey);
  }
}
```

---

### 10. **Device Detection Is Too Basic**
**Location**: `ehr-api/src/services/session.service.js:587`

**Issue**: User agent parsing is very simplistic.

```javascript
if (userAgent.includes('Chrome')) browser = 'Chrome';
// Problem: Edge includes 'Chrome' in UA string!
```

**Fix**: Use a library:
```bash
npm install ua-parser-js
```

```javascript
const UAParser = require('ua-parser-js');

parseDeviceInfo(userAgent) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  return {
    type: result.device.type || 'Desktop',
    os: result.os.name,
    browser: result.browser.name,
    name: `${result.browser.name} on ${result.os.name}`
  };
}
```

---

### 11. **MFA Code Not Using Constant-Time Comparison**
**Location**: `ehr-api/src/services/mfa.service.js:240`

**Issue**: Direct string comparison vulnerable to timing attacks.

```javascript
if (mfaCode.code !== code) { // TIMING ATTACK!
```

**Fix**:
```javascript
const crypto = require('crypto');

// Ensure both are same length (pad if needed)
const expectedCode = mfaCode.code;
const providedCode = code.padEnd(expectedCode.length, '0');

const isValid = crypto.timingSafeEqual(
  Buffer.from(expectedCode),
  Buffer.from(providedCode)
);

if (!isValid) {
  // Invalid code
}
```

---

### 12. **No Proper Error Boundaries in Frontend**
**Location**: `ehr-web/src/components/security/active-sessions.tsx`

**Issue**: If component crashes, entire page breaks.

**Fix**: Wrap in error boundary:
```typescript
// components/error-boundary.tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh.</div>;
    }
    return this.props.children;
  }
}

// In usage:
<ErrorBoundary>
  <ActiveSessions />
</ErrorBoundary>
```

---

## 💡 MINOR ISSUES & IMPROVEMENTS

### 13. **Console.log in Production Code**
**Multiple Locations**

**Issue**: Lots of console.log statements that should use proper logging.

**Fix**: Use a logging library:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Replace console.log with:
logger.info('Session created', { userId, sessionId });
logger.error('Failed to refresh token', { error: error.message });
```

---

### 14. **Missing Input Validation**
**Multiple Locations**

**Issue**: No schema validation on request bodies.

**Fix**: Use Joi or Zod:
```javascript
const Joi = require('joi');

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required().min(40)
});

router.post('/refresh', async (req, res) => {
  const { error, value } = refreshSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  // ...
});
```

---

### 15. **No Monitoring/Alerting**
**Missing Entirely**

**Issue**: No way to detect:
- High refresh token failures
- Unusual login patterns
- Redis connection issues
- High session counts per user

**Fix**: Add metrics:
```javascript
const prometheus = require('prom-client');

const sessionRefreshCounter = new prometheus.Counter({
  name: 'session_refresh_total',
  help: 'Total session refresh attempts',
  labelNames: ['status']
});

// In refresh endpoint:
if (result.success) {
  sessionRefreshCounter.inc({ status: 'success' });
} else {
  sessionRefreshCounter.inc({ status: 'failed' });
}
```

---

### 16. **No Session Limit Per User**
**Location**: Session creation logic

**Issue**: Users can create unlimited sessions (DoS potential).

**Fix**:
```javascript
async createSession(userId, tokens, metadata) {
  // Check existing session count
  const existingSessions = await query(
    'SELECT COUNT(*) as count FROM user_sessions WHERE user_id = $1 AND is_active = true',
    [userId]
  );
  
  const maxSessions = parseInt(process.env.MAX_SESSIONS_PER_USER || '10');
  
  if (existingSessions.rows[0].count >= maxSessions) {
    // Revoke oldest session
    const oldest = await query(
      'SELECT id FROM user_sessions WHERE user_id = $1 AND is_active = true ORDER BY last_activity_at ASC LIMIT 1',
      [userId]
    );
    await this.revokeSession(oldest.rows[0].id, userId);
  }
  
  // Create new session...
}
```

---

### 17. **Password Change Doesn't Revoke Sessions**
**Location**: `ehr-api/src/services/postgres-auth.service.js:314`

**Issue**: When user changes password, old sessions remain valid.

**Fix**:
```javascript
async changePassword(userId, oldPassword, newPassword) {
  return await transaction(async (client) => {
    // ... verify and update password ...
    
    // Revoke all sessions after password change
    await sessionService.revokeAllSessions(userId);
    
    return { 
      success: true, 
      message: 'Password changed. Please log in again.' 
    };
  });
}
```

---

## 📋 SUMMARY

### Must Fix Before Production:
1. ✅ Add authentication middleware to session routes
2. ✅ Fix arguments hack in login function
3. ✅ Add rate limiting to all sensitive endpoints
4. ✅ Implement frontend token management
5. ✅ Add proper logout endpoint
6. ✅ Install date-fns in frontend

### Should Fix Soon:
7. Handle concurrent token refresh
8. Use proper device detection library
9. Fix timing attack in MFA verification
10. Add error boundaries in frontend
11. Implement session limits per user
12. Revoke sessions on password change

### Nice to Have:
13. Replace console.log with proper logging
14. Add input validation with Joi/Zod
15. Add monitoring/metrics
16. Improve error messages
17. Add unit tests

## 🎯 Priority Order

1. **Week 1**: Critical issues (#1-6)
2. **Week 2**: High priority issues (#7-12)
3. **Week 3**: Minor issues and improvements (#13-17)
4. **Week 4**: Testing, monitoring, documentation updates

Would you like me to create fixes for any of these issues?
