# Application-Wide Security & Code Quality Audit Report

**Date**: 2024-12-01
**Scope**: Complete EHRConnect codebase
**Focus**: Security vulnerabilities, technical debt, patchwork code, and production readiness

---

## 🚨 CRITICAL SECURITY VULNERABILITIES (Fix Immediately)

### 1. **MASSIVE Authentication Bypass - x-user-id Header Spoofing**

**Severity**: 🔴 **CRITICAL** - Complete authentication bypass
**Impact**: Any attacker can impersonate ANY user by changing a header
**Locations**: 36+ instances across the application

**Affected Files**:
- `ehr-api/src/routes/sessions.js:52,87,134` - Session management completely bypassable
- `ehr-api/src/routes/mfa.js:121,169,214,253,280,334` - MFA can be enabled/disabled for any user
- `ehr-api/src/routes/auth.js:82,222,340,407` - Authentication routes trust spoofable header
- `ehr-api/src/routes/notification-settings.js:105,190` - Can change any user's settings
- `ehr-api/src/routes/patient-portal.js:13,147` - Portal access control bypassable
- `ehr-api/src/routes/episodes.js:36,139,176` - Medical records accessible
- `ehr-api/src/routes/audit.js:65` - Audit logs can be forged
- `ehr-api/src/middleware/org-isolation.js:10` - Organization isolation bypassable
- `ehr-api/src/middleware/auth.js:10` - Even the auth middleware trusts it!
- 20+ more route files affected

**Proof of Concept**:
```bash
# Attacker can view anyone's sessions
curl -H "x-user-id: victim-user-uuid" \
     -H "x-org-id: victim-org-uuid" \
     http://api/sessions

# Attacker can revoke anyone's sessions
curl -X DELETE -H "x-user-id: victim-user-uuid" http://api/sessions
```

**Root Cause**: Application relies on client-provided headers without verification

**Fix Required**:
- ✅ Authentication middleware already created: `ehr-api/src/middleware/authenticate.js`
- ❌ NOT APPLIED to routes yet!
- **Action**: Apply `authenticate()` middleware to ALL routes (documented in FIXES_APPLIED.md #10)

---

### 2. **Hardcoded JWT Secret with Insecure Fallback**

**Severity**: 🔴 **CRITICAL** - All tokens compromised if env var missing
**Location**: `ehr-api/src/services/patient-portal.service.js:433,448`

**Code**:
```javascript
const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production-min-32-chars';
```

**Impact**:
- If JWT_SECRET env var is not set, predictable secret is used
- Attackers can forge tokens for patient portal
- All patient data exposed

**Fix Required**:
```javascript
// NEVER have a fallback for secrets
const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error('JWT_SECRET environment variable is required');
}
```

---

### 3. **Hardcoded API Key Exposed in Source Code**

**Severity**: 🔴 **CRITICAL** - Third-party API credentials exposed
**Location**: `ehr-api/src/routes/integrations.js:440`

**Code**:
```javascript
const apiKey = process.env.CLAIM_MD_ACCOUNT_KEY || '24995_*n0kREh@vAxWKyfeSHT4aWs6';
```

**Impact**:
- ClaimMD API key exposed in Git history
- Must be rotated immediately
- Could lead to unauthorized billing operations

**Fix Required**:
1. Rotate the exposed API key immediately
2. Remove hardcoded fallback
3. Audit Git history and remove from all commits

---

### 4. **Placeholder RBAC Implementation - No Actual Permission Checks**

**Severity**: 🔴 **CRITICAL** - Authorization completely broken
**Location**: `ehr-api/src/middleware/rbac.js:12,23,34,45`

**Code**:
```javascript
function checkPermission(permission) {
  return (req, res, next) => {
    // TODO: Implement actual permission checking logic
    // For now, just pass through
    next();
  };
}

function checkRole(role) {
  return (req, res, next) => {
    // TODO: Implement actual role checking logic
    next();
  };
}
```

**Impact**:
- **NO AUTHORIZATION CHECKS ARE HAPPENING**
- All permission checks are placeholders
- Any authenticated user can access anything
- This is worse than no middleware - it gives false sense of security

**Files Using Broken Middleware**:
- Multiple routes import and use these functions
- All believe they're protected, but they're not

**Fix Required**: Implement actual permission checking using `requirePermissions()` from `authenticate.js`

---

### 5. **Missing Admin Role Check in MFA Global Settings**

**Severity**: 🟠 **HIGH** - Any user can modify global MFA settings
**Location**: `ehr-api/src/routes/mfa.js:341`

**Code**:
```javascript
router.put('/global-settings', async (req, res) => {
  // TODO: Add permission check for admin role
  const userId = req.headers['x-user-id']; // Also vulnerable to spoofing!
```

**Impact**: Regular users can disable MFA system-wide

**Fix Required**: Add `authenticate()` and `requireAdmin` middleware

---

### 6. **MFA Code Timing Attack Vulnerability**

**Severity**: 🟠 **HIGH** - Attackers can guess MFA codes faster
**Location**: `ehr-api/src/services/mfa.service.js:240`

**Code**:
```javascript
if (mfaCode.code !== code) {
  // String comparison leaks timing information
```

**Impact**:
- Timing attacks can determine correct digits one at a time
- Reduces 6-digit code (1,000,000 attempts) to 60 attempts (10 per digit)

**Fix**: Use `crypto.timingSafeEqual()` (documented in FIXES_APPLIED.md #8)

---

### 7. **No Rate Limiting on Critical Endpoints**

**Severity**: 🟠 **HIGH** - Brute force attacks possible
**Affected Endpoints**:
- `/api/sessions/refresh` - Token enumeration
- `/api/mfa/send-code` - SMS/email spam (costs money!)
- `/api/mfa/verify` - Code brute forcing
- `/api/auth/login` - Password brute forcing
- `/api/auth/password-reset/request` - Email spam

**Fix**:
- ✅ Rate limiting middleware created: `ehr-api/src/middleware/rate-limit.js`
- ❌ NOT APPLIED to routes yet!
- **Action**: Apply limiters to routes (documented in FIXES_APPLIED.md #10)

---

## ⚠️ HIGH PRIORITY SECURITY ISSUES

### 8. **Arguments Hack - Fragile Function Signature**

**Severity**: 🟠 **HIGH** - Code smell, easy to break
**Location**: `ehr-api/src/services/postgres-auth.service.js:95`

**Code**:
```javascript
async login(email, password, skipMFA = false) {
  const metadata = arguments[2] || {}; // HACK: Using undocumented 4th param!
}
```

**Issues**:
- Function signature says 3 params, but expects 4
- IDE autocompletion shows wrong signature
- Easy to break during refactoring
- Fails silently if metadata not passed

**Fix**: Change signature to `async login(email, password, skipMFA = false, metadata = {})`

---

### 9. **Missing Input Validation on ALL Routes**

**Severity**: 🟠 **HIGH** - No request body validation
**Scope**: Every single POST/PUT/PATCH endpoint

**Issues**:
- No schema validation (no Joi, Zod, or similar)
- Type coercion vulnerabilities
- Unexpected data types crash the app
- Missing required fields not caught early

**Example Vulnerable Endpoint**:
```javascript
router.post('/mfa/send-code', async (req, res) => {
  const { userId, purpose, medium } = req.body; // No validation!
  // What if purpose is an object? What if medium is missing?
});
```

**Fix Required**: Implement request validation middleware with Joi or Zod

---

### 10. **Password Change Doesn't Revoke Sessions**

**Severity**: 🟠 **HIGH** - Security best practice violation
**Location**: `ehr-api/src/services/postgres-auth.service.js:314`

**Issue**: When user changes password, all old sessions remain valid

**Impact**:
- Stolen password continues to work after victim changes it
- Compromised device sessions not terminated
- Suspicious activity sessions not invalidated

**Fix**: Call `sessionService.revokeAllSessions(userId)` after password change (documented in FIXES_APPLIED.md #9)

---

### 11. **Socket.IO Authentication Has Insecure Fallback**

**Severity**: 🟠 **HIGH** - WebSocket security weakness
**Location**: `ehr-api/src/services/socket.service.js:50`

**Code**:
```javascript
const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
```

**Issues**:
- Fallback to weak secret if env var missing
- Same issue as patient portal JWT

---

## 🔶 MEDIUM PRIORITY ISSUES

### 12. **Production Code Uses console.log (361 Instances)**

**Severity**: 🟡 **MEDIUM** - Operations & debugging issues
**Scope**: 33 route files, multiple services

**Highest Offenders**:
- `ehr-api/src/routes/billing.js` - 34 console.log statements
- `ehr-api/src/routes/public.js` - 29 statements
- `ehr-api/src/routes/tasks.js` - 25 statements
- `ehr-api/src/routes/forms.js` - 22 statements
- All other routes have 5-15 each

**Issues**:
- Can't control log levels
- No structured logging
- No correlation IDs for request tracing
- Sensitive data may be logged
- Performance overhead in production

**Fix Required**: Implement winston or pino logger

---

### 13. **TODO Comments Indicate Incomplete Features (32 Total)**

**Severity**: 🟡 **MEDIUM** - Technical debt & missing functionality

**Critical TODOs**:

#### Authentication/Authorization (CRITICAL):
- `ehr-api/src/middleware/rbac.js:12` - "TODO: Implement actual permission checking logic"
- `ehr-api/src/middleware/rbac.js:23` - "TODO: Implement actual role checking logic"
- `ehr-api/src/middleware/rbac.js:34` - "TODO: Implement permission validation"
- `ehr-api/src/middleware/rbac.js:45` - "TODO: Implement role validation"
- `ehr-api/src/routes/mfa.js:341` - "TODO: Add permission check for admin role"

#### Missing Integrations (HIGH):
- `ehr-api/src/services/task-notification.service.js:465` - "TODO: Integrate with email service"
- `ehr-api/src/services/virtual-meetings.service.js:819` - "TODO: Implement Twilio integration"
- `ehr-api/src/services/virtual-meetings.service.js:839` - "TODO: Implement email notification"

#### Missing Features (MEDIUM):
- `ehr-api/src/services/episode.service.js:108` - "TODO: Fetch from practitioner table"
- `ehr-api/src/services/episode.service.js:115` - "TODO: Fetch actual chief complaints"
- Multiple bed-management, rule-engine, and integration TODOs

**Full TODO List**:
```
ehr-api/src/services/episode.service.js:108 - TODO: Fetch from practitioner table
ehr-api/src/services/episode.service.js:115 - TODO: Fetch actual chief complaints
ehr-api/src/services/task-notification.service.js:465 - TODO: Integrate with email service
ehr-api/src/services/virtual-meetings.service.js:819 - TODO: Implement Twilio SMS
ehr-api/src/services/virtual-meetings.service.js:839 - TODO: Implement Exotel SMS
ehr-api/src/middleware/rbac.js:12,23,34,45 - TODO: Implement permission checking (4 instances)
ehr-api/src/routes/mfa.js:341 - TODO: Add admin role check
ehr-api/src/routes/bed-management.js (multiple TODOs)
ehr-api/src/routes/rule-engine.js (multiple TODOs)
ehr-api/src/routes/integrations.js (multiple TODOs)
```

---

### 14. **No Session Limit Per User - DoS Potential**

**Severity**: 🟡 **MEDIUM** - Resource exhaustion
**Location**: Session creation in `session.service.js`

**Issue**: Users can create unlimited sessions

**Impact**:
- Malicious user creates 10,000 sessions
- Database/Redis fills up
- Legitimate users can't log in

**Fix**: Limit to 10 sessions per user, revoke oldest (documented in BUGS_AND_ISSUES.md #16)

---

### 15. **Concurrent Token Refresh Race Conditions**

**Severity**: 🟡 **MEDIUM** - Multi-tab token refresh issues
**Location**: `ehr-api/src/services/session.service.js`

**Scenario**:
1. User has 2 tabs open
2. Token expires
3. Both tabs call /refresh simultaneously
4. Both get new access tokens
5. First token immediately blacklisted
6. Second tab fails

**Fix**: Implement distributed locking with Redis (documented in FIXES_APPLIED.md #7)

---

### 16. **User Agent Parsing Too Simplistic**

**Severity**: 🟡 **MEDIUM** - Incorrect device detection
**Location**: `ehr-api/src/services/session.service.js:587`

**Code**:
```javascript
if (userAgent.includes('Chrome')) browser = 'Chrome';
// Problem: Edge includes 'Chrome' in its user agent!
```

**Impact**: Sessions show wrong browser names in UI

**Fix**: Use `ua-parser-js` library (documented in BUGS_AND_ISSUES.md #10)

---

### 17. **Redis/Database Connections Not Closed Gracefully**

**Severity**: 🟡 **MEDIUM** - Unclean shutdowns
**Locations**: Multiple services

**Issues**:
- No SIGTERM/SIGINT handlers
- Connections left open on exit
- Can cause connection leaks
- Database complains about dropped connections

**Fix**: Implement graceful shutdown (documented in FIXES_APPLIED.md #6)

---

## 💡 LOW PRIORITY / CODE QUALITY ISSUES

### 18. **Development Environment Checks in Production Code**

**Locations**:
```javascript
ehr-api/src/services/invitation.service.js:116 - if (process.env.NODE_ENV === 'development')
ehr-api/src/routes/invitations.js:111 - if (process.env.NODE_ENV === 'development')
ehr-api/src/database/seeders/* - Multiple production checks
```

**Issue**: Environment-specific logic scattered throughout

**Best Practice**: Use configuration management (e.g., node-config)

---

### 19. **Inconsistent Error Response Format**

**Issue**: Different routes return errors in different formats
```javascript
// Some routes:
{ error: 'message' }

// Other routes:
{ message: 'message' }

// Others:
{ success: false, error: 'message' }
```

**Fix**: Standardize on a single error format

---

### 20. **No Error Boundaries in Frontend**

**Location**: React components (especially `active-sessions.tsx`)

**Issue**: Component crashes break entire page

**Fix**: Wrap components in ErrorBoundary (documented in BUGS_AND_ISSUES.md #12)

---

### 21. **Missing Dependency - date-fns**

**Location**: `ehr-web/src/components/security/active-sessions.tsx:18`

**Fix**: Run `npm install date-fns` in ehr-web

---

### 22. **Commented Out Code**

**Examples**:
```javascript
ehr-api/src/services/virtual-meetings.service.js:824
// const token = jwt.sign(payload, client.apiSecret, { algorithm: 'HS256' });
```

**Issue**: Indicates uncertainty or incomplete implementation

**Fix**: Remove commented code, use version control instead

---

## 📊 AUDIT STATISTICS

### Security Issues by Severity:
- 🔴 **CRITICAL**: 7 issues
- 🟠 **HIGH**: 5 issues
- 🟡 **MEDIUM**: 10 issues
- 💡 **LOW**: 5+ issues

### Code Quality Metrics:
- **TODO/FIXME Comments**: 32 (4 critical in RBAC)
- **console.log Statements**: 361 across 33 files
- **x-user-id Usage**: 36+ instances (all vulnerable)
- **Hardcoded Secrets**: 3 instances
- **Routes Without Auth**: 90%+ of routes
- **Routes Without Rate Limiting**: 95%+ of routes
- **Routes Without Validation**: 100% of routes

### Files Requiring Immediate Attention:
1. `ehr-api/src/middleware/rbac.js` - Completely broken, giving false security
2. `ehr-api/src/routes/sessions.js` - Authentication bypass
3. `ehr-api/src/routes/mfa.js` - Multiple vulnerabilities
4. `ehr-api/src/services/patient-portal.service.js` - Hardcoded secret
5. `ehr-api/src/routes/integrations.js` - Exposed API key

---

## 🎯 REMEDIATION PLAN

### Phase 1: Critical Security Fixes (Week 1)
**Must complete before ANY production use**

1. **Day 1-2**: Apply Authentication Middleware
   - Apply `authenticate()` to ALL protected routes
   - Remove all `x-user-id` header usage
   - Test thoroughly with real tokens

2. **Day 2-3**: Fix Hardcoded Secrets
   - Rotate exposed ClaimMD API key
   - Remove JWT secret fallbacks
   - Add startup validation for required env vars

3. **Day 3-4**: Implement Real RBAC
   - Replace placeholder `rbac.js` middleware
   - Use `requirePermissions()` from `authenticate.js`
   - Test all permission checks

4. **Day 4-5**: Apply Rate Limiting
   - Apply rate limiters to all sensitive endpoints
   - Test limits don't block legitimate users
   - Monitor Redis connection

5. **Day 5**: Apply Remaining Security Fixes
   - MFA timing attack fix
   - Password change session revocation
   - Admin permission checks

**Deliverable**: Security-hardened application ready for staging

---

### Phase 2: High Priority Fixes (Week 2)

1. **Input Validation**
   - Install Joi or Zod
   - Create schemas for all request bodies
   - Add validation middleware

2. **Production Logging**
   - Replace console.log with winston/pino
   - Add correlation IDs
   - Implement log levels
   - Set up log aggregation

3. **Complete TODOs**
   - Implement all critical TODOs (RBAC, admin checks)
   - Complete high-priority integrations
   - Document postponed features

4. **Testing**
   - Add unit tests for security-critical functions
   - Integration tests for auth flow
   - Load testing for rate limits

**Deliverable**: Production-ready application with proper observability

---

### Phase 3: Medium Priority Improvements (Week 3)

1. **Code Quality**
   - Remove commented code
   - Standardize error responses
   - Add JSDoc comments
   - Fix code smells (arguments hack, etc.)

2. **Operational Improvements**
   - Implement graceful shutdown
   - Add health check endpoints
   - Implement circuit breakers
   - Add retry logic

3. **Frontend Hardening**
   - Add error boundaries
   - Install missing dependencies
   - Implement proper token management
   - Add loading states

**Deliverable**: Maintainable, observable, production-grade application

---

### Phase 4: Low Priority & Nice-to-Haves (Week 4)

1. Session limits per user
2. Distributed locking for token refresh
3. Better device detection
4. Monitoring & alerting
5. Performance optimization
6. Documentation updates

---

## 🔍 DETAILED VULNERABILITY BREAKDOWN

### Authentication Bypass Files (Complete List):

**Critical (Direct x-user-id usage without ANY validation)**:
1. `ehr-api/src/routes/sessions.js` - Lines: 52, 87, 134
2. `ehr-api/src/routes/mfa.js` - Lines: 121, 169, 214, 253, 280, 334
3. `ehr-api/src/routes/auth.js` - Lines: 82, 222, 340, 407
4. `ehr-api/src/routes/notification-settings.js` - Lines: 105, 190
5. `ehr-api/src/routes/patient-portal.js` - Lines: 13, 147
6. `ehr-api/src/routes/episodes.js` - Lines: 36, 139, 176
7. `ehr-api/src/middleware/org-isolation.js` - Line: 10
8. `ehr-api/src/middleware/auth.js` - Line: 10 (Even the auth middleware!)

**High (Indirect usage through middleware)**:
9. `ehr-api/src/routes/organizations.js` - Line: 13
10. `ehr-api/src/routes/roles.js` - Line: 13
11. `ehr-api/src/routes/specialties.js` - Line: 13
12. `ehr-api/src/routes/notifications.js` - Line: 7
13. `ehr-api/src/routes/team.js` - Line: 13
14. `ehr-api/src/routes/invitations.js` - Line: 13
15. `ehr-api/src/routes/rbac.js` - Line: 13
16. `ehr-api/src/routes/rbac.enhanced.js` - Line: 14
17. `ehr-api/src/routes/countries.js` - Line: 13
18. `ehr-api/src/routes/inventory.js` - Line: 30
19. `ehr-api/src/routes/bed-management.js` - Line: 19
20. `ehr-api/src/routes/user-data.js` - Line: 19
21. `ehr-api/src/routes/audit.js` - Line: 65
22. `ehr-api/src/middleware/audit-logger.js` - Line: 17

---

## 🛡️ SECURITY IMPROVEMENTS SUMMARY

### Before Fixes:
| Security Aspect | Status |
|----------------|--------|
| Authentication | ❌ Bypassable (x-user-id spoofing) |
| Authorization | ❌ Broken (placeholder RBAC) |
| Rate Limiting | ❌ None |
| Input Validation | ❌ None |
| Token Revocation | ❌ Not possible |
| Session Management | ⚠️ Partial (created but not applied) |
| MFA Security | ⚠️ Timing attack vulnerable |
| Secret Management | ❌ Hardcoded fallbacks |
| Audit Logging | ⚠️ Can be forged |
| Error Handling | ⚠️ Info leakage |

### After Phase 1 Fixes:
| Security Aspect | Status |
|----------------|--------|
| Authentication | ✅ JWT + Session validation |
| Authorization | ✅ Permission-based (RBAC) |
| Rate Limiting | ✅ Redis-backed, 11 limiters |
| Input Validation | ⏳ Phase 2 |
| Token Revocation | ✅ Redis blacklist |
| Session Management | ✅ Multi-device tracking |
| MFA Security | ✅ Constant-time comparison |
| Secret Management | ✅ No fallbacks, validated |
| Audit Logging | ✅ Cannot be forged |
| Error Handling | ✅ No info leakage |

---

## ✅ WHAT'S ALREADY DONE (Don't Need to Redo)

1. ✅ **Authentication middleware created** (`authenticate.js`) - production-ready
2. ✅ **Rate limiting middleware created** (`rate-limit.js`) - 11 pre-configured limiters
3. ✅ **Session management service** (`session.service.js`) - full lifecycle management
4. ✅ **Frontend token manager** (`auth-token-manager.ts`) - auto-refresh, multi-tab sync
5. ✅ **Active Sessions UI** - beautiful React component
6. ✅ **Database migrations** - session tables ready
7. ✅ **Session API routes** - refresh, list, revoke endpoints
8. ✅ **Documentation** - comprehensive guides created

**The problem**: These production-ready solutions exist but are NOT APPLIED to routes yet!

---

## 📝 RECOMMENDED IMMEDIATE ACTIONS

### Critical (Do Today):
1. **Rotate ClaimMD API key** (already exposed in Git)
2. **Add JWT_SECRET validation** at startup (fail if missing)
3. **Apply authenticate() middleware** to sessions.js and mfa.js routes
4. **Implement real RBAC checks** (replace placeholder rbac.js)

### High Priority (This Week):
5. Apply authentication to ALL routes systematically
6. Apply rate limiting to all sensitive endpoints
7. Fix MFA timing attack
8. Fix password change to revoke sessions
9. Remove all x-user-id header usage

### Can Wait (But Document):
10. Input validation (Phase 2)
11. Logging infrastructure (Phase 2)
12. Code cleanup (Phase 3)
13. Session limits and distributed locking (Phase 3-4)

---

## 🎓 LESSONS LEARNED

1. **Patchwork Code Identified**:
   - Authentication middleware created but not applied
   - Placeholder RBAC giving false security
   - Production code with TODOs and console.log
   - Hardcoded credentials "temporarily" in code

2. **Root Causes**:
   - Incremental development without security-first approach
   - Missing security review process
   - No checklist for new endpoints
   - Lack of automated security testing

3. **Process Improvements Needed**:
   - Security checklist for all new routes
   - Pre-commit hooks for console.log and TODOs
   - Automated scanning for hardcoded secrets
   - Required authentication/rate-limiting on all routes
   - Code review focusing on security

---

## 📞 SUPPORT

For questions about this audit or implementation of fixes:
- See `docs/FIXES_APPLIED.md` for copy-paste ready solutions
- See `docs/BUGS_AND_ISSUES.md` for detailed issue descriptions
- See `docs/SESSION_MANAGEMENT_GUIDE.md` for session system details

---

**Remember**: The hardest part is already done. The authentication middleware, rate limiting, and session management are production-ready and tested. You just need to apply them to the routes.

**Estimated effort to reach production-ready**: 2-3 weeks with 1 developer focusing on security fixes.
