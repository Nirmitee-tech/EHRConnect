# Session Management & Refresh Token Implementation Guide

## Overview

This guide documents the complete session management system with refresh tokens, Redis-based token blacklist, and multi-device session support that has been implemented to address the security vulnerability where compromised tokens remained valid for 24 hours.

## Architecture

### Components

1. **Session Service** (`ehr-api/src/services/session.service.js`)
   - Manages session lifecycle
   - Handles token generation and validation
   - Implements Redis-based token blacklist
   - Provides session revocation capabilities

2. **Database Table** (`user_sessions`)
   - Stores session metadata
   - Tracks access and refresh token hashes
   - Records device and location information

3. **API Endpoints** (`ehr-api/src/routes/sessions.js`)
   - Token refresh endpoint
   - Session listing and revocation
   - Cleanup utilities

4. **Frontend Components**
   - Active Sessions UI (`ehr-web/src/components/security/active-sessions.tsx`)
   - Security Settings Page (`ehr-web/src/app/settings/security/page.tsx`)

## Security Features

### 1. Short-Lived Access Tokens
- **Duration**: 15 minutes
- **Purpose**: Minimize exposure window if compromised
- **Storage**: Hash stored in database, original sent to client

### 2. Long-Lived Refresh Tokens
- **Duration**: 7 days
- **Purpose**: Allow users to obtain new access tokens without re-authentication
- **Security**: Cannot be used for API access, only for token refresh

### 3. Token Rotation
- When refresh token is used, a new access token is generated
- Old access token is immediately blacklisted
- Prevents token reuse attacks

### 4. Redis Blacklist
- Revoked tokens added to Redis with TTL
- Fast O(1) lookup for token validation
- Automatic cleanup when tokens expire
- Graceful fallback to database if Redis unavailable

### 5. Multi-Device Session Tracking
- Each login creates a new session
- Sessions tracked with device info, IP, and user agent
- Users can view and revoke individual sessions
- "Sign out of all other devices" feature

## Setup Instructions

### 1. Prerequisites

```bash
# Install Redis
brew install redis  # macOS
# or
sudo apt-get install redis  # Ubuntu

# Start Redis
redis-server
```

### 2. Environment Variables

Add to `.env`:

```bash
# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration (change in production!)
JWT_SECRET=your-super-secret-key-minimum-64-characters-cryptographically-secure

# Session Configuration (optional, defaults provided)
ACCESS_TOKEN_TTL=900        # 15 minutes in seconds
REFRESH_TOKEN_TTL=604800    # 7 days in seconds
```

### 3. Database Migration

Run the migration to create the `user_sessions` table:

```bash
cd ehr-api
npm run db:setup
```

This creates:
- `user_sessions` table
- Indexes for performance
- Cleanup functions
- Triggers for activity tracking

### 4. Start the Application

```bash
# Backend
cd ehr-api
npm run dev

# Frontend
cd ehr-web
npm run dev
```

## API Usage

### 1. Login (Returns Tokens)

```javascript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "user": { ... },
  "token": "jwt-token",                    // JWT for user info
  "accessToken": "access-token",            // Use for API requests
  "refreshToken": "refresh-token",          // Use to get new access token
  "expiresIn": 900,                         // Access token expiry (seconds)
  "sessionId": "session-uuid"
}
```

### 2. Refresh Access Token

```javascript
POST /api/sessions/refresh
{
  "refreshToken": "refresh-token"
}

Response:
{
  "success": true,
  "accessToken": "new-access-token",
  "expiresIn": 900,
  "sessionId": "session-uuid"
}
```

### 3. List Active Sessions

```javascript
GET /api/sessions

Headers:
  x-user-id: user-uuid
  x-session-id: current-session-id (optional)

Response:
{
  "success": true,
  "sessions": [
    {
      "id": "session-uuid",
      "createdAt": "2024-12-01T10:00:00Z",
      "lastActivityAt": "2024-12-01T12:30:00Z",
      "expiresAt": "2024-12-08T10:00:00Z",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "deviceInfo": {
        "type": "Desktop",
        "os": "macOS",
        "browser": "Chrome",
        "name": "Chrome on macOS"
      },
      "isActive": true,
      "isCurrent": true
    }
  ],
  "total": 3
}
```

### 4. Revoke Specific Session

```javascript
DELETE /api/sessions/:sessionId

Headers:
  x-user-id: user-uuid

Response:
{
  "success": true,
  "message": "Session revoked successfully"
}
```

### 5. Revoke All Other Sessions

```javascript
DELETE /api/sessions

Headers:
  x-user-id: user-uuid
  x-session-id: current-session-id

Response:
{
  "success": true,
  "revokedCount": 2,
  "message": "2 session(s) revoked successfully"
}
```

## Frontend Usage

### Using the Active Sessions Component

```tsx
import ActiveSessions from '@/components/security/active-sessions';

function SecurityPage() {
  return (
    <div>
      <h1>Security Settings</h1>
      <ActiveSessions />
    </div>
  );
}
```

### Token Refresh Logic (Client-Side)

```typescript
// Implement automatic token refresh
let refreshTokenTimeout: NodeJS.Timeout;

function scheduleTokenRefresh(expiresIn: number) {
  // Refresh 1 minute before expiry
  const refreshTime = (expiresIn - 60) * 1000;
  
  clearTimeout(refreshTokenTimeout);
  refreshTokenTimeout = setTimeout(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await fetch('/api/sessions/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('accessToken', data.accessToken);
        scheduleTokenRefresh(data.expiresIn);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Redirect to login
      window.location.href = '/login';
    }
  }, refreshTime);
}

// After login
scheduleTokenRefresh(expiresIn);
```

## Database Schema

```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_token_hash TEXT NOT NULL,
  refresh_token_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT true,
  ip_address TEXT,
  user_agent TEXT,
  device_info JSONB DEFAULT '{}'::JSONB,
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Indexes for performance
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_access_token ON user_sessions(access_token_hash);
CREATE INDEX idx_user_sessions_refresh_token ON user_sessions(refresh_token_hash);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX idx_user_sessions_active ON user_sessions(user_id, is_active);
```

## Redis Key Structure

```
# Active access tokens
session:access:{token_hash} => { userId, sessionId, active }
TTL: 15 minutes

# Active refresh tokens
session:refresh:{token_hash} => { userId, sessionId, active }
TTL: 7 days

# Blacklisted tokens
blacklist:{token_hash} => { blacklistedAt }
TTL: Token's remaining lifetime
```

## Security Best Practices

### 1. Token Storage (Frontend)

```typescript
// ✅ GOOD: Store in httpOnly cookie (if possible)
// Set from backend with httpOnly flag

// ⚠️ ACCEPTABLE: localStorage with XSS protection
localStorage.setItem('accessToken', token);
localStorage.setItem('refreshToken', refreshToken);

// ❌ BAD: Don't store in regular cookies or global variables
```

### 2. Token Transmission

```typescript
// ✅ GOOD: Send in Authorization header
headers: {
  'Authorization': `Bearer ${accessToken}`
}

// ❌ BAD: Don't send in URL parameters
```

### 3. Error Handling

```typescript
// Handle 401 Unauthorized responses
if (response.status === 401) {
  // Try to refresh token
  const refreshed = await refreshAccessToken();
  if (refreshed) {
    // Retry original request
  } else {
    // Redirect to login
    redirectToLogin();
  }
}
```

## Monitoring & Maintenance

### 1. Session Cleanup

Run periodic cleanup to mark expired sessions as inactive:

```bash
# Via cron job
curl -X POST http://localhost:8000/api/sessions/cleanup \
  -H "x-api-key: your-cron-api-key"
```

### 2. Redis Monitoring

```bash
# Check Redis memory usage
redis-cli INFO memory

# Monitor active keys
redis-cli DBSIZE

# View sample session data
redis-cli KEYS "session:*" | head -10
```

### 3. Database Queries

```sql
-- Active sessions by user
SELECT COUNT(*) as active_sessions, user_id
FROM user_sessions
WHERE is_active = true
GROUP BY user_id
ORDER BY active_sessions DESC;

-- Sessions by device type
SELECT 
  device_info->>'type' as device_type,
  COUNT(*) as count
FROM user_sessions
WHERE is_active = true
GROUP BY device_type;

-- Old sessions to cleanup
SELECT COUNT(*)
FROM user_sessions
WHERE is_active = true
  AND expires_at < CURRENT_TIMESTAMP;
```

## Troubleshooting

### Redis Connection Issues

```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# Check connection from Node.js
node -e "const redis = require('redis'); const client = redis.createClient(); client.connect().then(() => console.log('Connected')).catch(console.error);"
```

### Token Validation Failures

1. **Check token hasn't expired**
   ```javascript
   const jwt = require('jsonwebtoken');
   const decoded = jwt.decode(token);
   console.log('Expires:', new Date(decoded.exp * 1000));
   ```

2. **Verify token isn't blacklisted**
   ```bash
   redis-cli GET blacklist:{token_hash}
   ```

3. **Check database session exists**
   ```sql
   SELECT * FROM user_sessions WHERE access_token_hash = '{hash}';
   ```

### Session Not Appearing in UI

1. Check API endpoint returns sessions
2. Verify CORS headers allow requests
3. Check browser console for errors
4. Ensure `x-user-id` header is set correctly

## Performance Considerations

### Redis vs Database

| Operation | Redis | Database |
|-----------|-------|----------|
| Token validation | ~1ms | ~10-50ms |
| Blacklist check | ~0.5ms | ~10-20ms |
| Session lookup | ~1ms | ~5-15ms |

### Caching Strategy

- Active sessions cached in Redis for 5 minutes
- Token blacklist uses Redis with automatic TTL
- Database is source of truth, Redis is cache layer

## Migration from Old System

If upgrading from the previous 24-hour token system:

1. Deploy new code (backward compatible)
2. Run database migration
3. Update frontend to use refresh tokens
4. Gradually expire old 24-hour tokens
5. Update client applications
6. Remove old token logic after 24 hours

## Security Audit Checklist

- [ ] JWT_SECRET changed from default
- [ ] Redis password configured (production)
- [ ] HTTPS enabled for all API requests
- [ ] Token expiry times appropriate
- [ ] Session cleanup cron job configured
- [ ] Rate limiting on /sessions/refresh endpoint
- [ ] Audit logging enabled
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info

## Additional Resources

- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Redis Security](https://redis.io/topics/security)

## Support

For issues or questions:
1. Check this documentation
2. Review error logs
3. Check Redis connection
4. Verify database migrations ran
5. Contact development team
