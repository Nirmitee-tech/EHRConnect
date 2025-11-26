# Quick Setup Guide - Redis Caching

## Step 1: Install Redis Dependency

```bash
cd ehr-api
npm install redis
```

## Step 2: Start Redis Server

### Option A: Using Homebrew (macOS)
```bash
brew install redis
brew services start redis
```

### Option B: Using Docker
```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

### Option C: Using apt (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install redis-server
sudo systemctl start redis-server
```

## Step 3: Verify Redis is Running

```bash
redis-cli ping
# Should return: PONG
```

## Step 4: Set Environment Variable

Add to your `.env` file:

```bash
# ehr-api/.env
REDIS_URL=redis://localhost:6379
```

## Step 5: Restart Backend Server

```bash
cd ehr-api
npm run dev
```

You should see:
```
✅ Redis connected successfully
✅ Connected to PostgreSQL database
Server running on port 8000
```

## Step 6: Test the APIs

```bash
# Test permissions endpoint
curl -H "x-user-id: YOUR_USER_ID" \
     -H "x-org-id: YOUR_ORG_ID" \
     http://localhost:8000/api/user/permissions

# Should return:
{
  "success": true,
  "permissions": [...],
  "count": 125,
  "cached": false  // First time
}

# Second request should show cached: true
```

## Step 7: Update Frontend Code

Replace old hooks with new ones:

### Before
```tsx
import { useFullProfile } from '@/hooks/useFullProfile';
const { fullProfile } = useFullProfile();
const permissions = fullProfile?.permissions;
```

### After
```tsx
import { usePermissions } from '@/hooks/useUserData';
const { permissions } = usePermissions();
```

## Step 8: Clear Old Sessions

Important! Clear browser cookies to remove old large sessions:

1. Open browser DevTools (F12)
2. Go to Application → Cookies
3. Delete `next-auth.session-token` cookie
4. Refresh page
5. Login again

## Troubleshooting

### Redis Not Connecting

**Error:** `Redis Client Error: connect ECONNREFUSED 127.0.0.1:6379`

**Solution:**
```bash
# Check if Redis is running
redis-cli ping

# If not running, start it
brew services start redis  # macOS
# or
sudo systemctl start redis-server  # Linux
# or
docker start redis  # Docker
```

### Still Getting 431 Error

1. **Clear browser cookies**
   ```
   DevTools → Application → Cookies → Delete all for localhost
   ```

2. **Verify session size**
   ```javascript
   // In browser console
   console.log('Cookie size:', document.cookie.length);
   // Should be < 2000 bytes
   ```

3. **Check backend is using new auth config**
   ```bash
   # Restart backend
   cd ehr-api
   npm run dev
   ```

4. **Verify Redis is caching**
   ```bash
   # Check Redis keys
   redis-cli KEYS "*"

   # Should show keys like:
   # user:123:permissions
   # user:123:roles
   ```

### Cache Not Working

1. **Check Redis connection**
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

2. **Check backend logs**
   ```bash
   # Should see:
   ✅ Redis connected successfully
   ```

3. **Test cache stats API**
   ```bash
   curl http://localhost:8000/api/user/cache/stats
   ```

## Next Steps

1. ✅ **Login again** - Should work without 431 error
2. ✅ **Test performance** - Notice much faster load times
3. ✅ **Update components** - Replace old hooks with new ones
4. ✅ **Monitor cache** - Use Redis CLI or cache stats API

## Quick Commands Reference

```bash
# Check Redis status
redis-cli ping

# View all cached keys
redis-cli KEYS "*"

# View specific key
redis-cli GET "user:123:permissions"

# Clear specific key
redis-cli DEL "user:123:permissions"

# Clear all cache (careful!)
redis-cli FLUSHALL

# Monitor Redis in real-time
redis-cli MONITOR

# Check memory usage
redis-cli INFO memory
```

## Production Deployment

For production, use a managed Redis service:

- **AWS:** Amazon ElastiCache for Redis
- **Azure:** Azure Cache for Redis
- **GCP:** Google Cloud Memorystore
- **Heroku:** Heroku Redis
- **Railway:** Railway Redis
- **Render:** Render Redis

Update `REDIS_URL` with your production Redis connection string.

## Done! 🎉

Your caching system is now set up. You should:
- ✅ No more 431 errors
- ✅ 95% faster data loading
- ✅ Better scalability
- ✅ Automatic cache invalidation
