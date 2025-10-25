# Keycloak Standalone Deployment

Complete guide for deploying Keycloak as a standalone service.

---

## 🚀 Quick Start (Local)

### Step 1: Create Environment File

```bash
cp .env.keycloak.example .env.keycloak
nano .env.keycloak
```

Update with your values:
```bash
POSTGRES_PASSWORD=je8yde8v1ppksccnsqigt1oh4ccvgbbw
KEYCLOAK_ADMIN_PASSWORD=g7qgoynkydyrs8ojqxlygslvaa4pdzln
KC_HOSTNAME=auth-dev.nirmitee.io
```

### Step 2: Start Keycloak

```bash
docker compose -f docker-compose.keycloak.yml --env-file .env.keycloak up -d
```

### Step 3: Wait for Startup (~30-60 seconds)

```bash
# Watch logs
docker logs keycloak-server -f

# Look for: "Listening on: http://0.0.0.0:8080"
```

### Step 4: Access

```bash
# Local access
http://localhost:8080/admin

# Domain access (if DNS configured)
https://auth-dev.nirmitee.io/admin

# Login with:
# Username: admin
# Password: g7qgoynkydyrs8ojqxlygslvaa4pdzln
```

---

## 📦 For Dokploy Deployment

### Option 1: Use This Compose File

1. **In Dokploy** → Add Service → Docker Compose
2. **Repository**: Your GitHub repo
3. **Compose File**: `docker-compose.keycloak.yml`
4. **Environment**: Paste content from `.env.keycloak.example`
5. **Deploy**!

### Option 2: Copy Services to Dokploy Compose

Add the services from `docker-compose.keycloak.yml` to your `docker-compose.dokploy-dev.yml`:

```yaml
services:
  postgres-keycloak:
    image: postgres:16.2
    # ... configuration from docker-compose.keycloak.yml

  keycloak:
    image: jitendratech/ehr-keycloak:dev
    # ... configuration from docker-compose.keycloak.yml
```

---

## 🔧 Configuration Details

### Key Changes from Your Version

**1. Added Health Check for PostgreSQL**
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U keycloakuser"]
  interval: 10s
  timeout: 5s
  retries: 5
```

**2. Changed Command**
```yaml
# Before:
command: start-dev

# After (for production-like setup):
command: start --import-realm
```

**3. Added Required Environment Variables**
```yaml
KC_HOSTNAME_STRICT: "false"
KC_HOSTNAME_STRICT_HTTPS: "false"
KC_PROXY: edge
KC_METRICS_ENABLED: "true"
```

**4. Added Port Exposure**
```yaml
ports:
  - "8080:8080"
```

**5. Added Network**
```yaml
networks:
  - keycloak-network
```

**6. Added Health Check for Keycloak**
```yaml
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost:8080/health/ready || exit 1"]
  interval: 30s
  timeout: 10s
  retries: 5
  start_period: 60s
```

---

## 🎨 Using Custom Theme

Your custom image `jitendratech/ehr-keycloak:dev` already includes:
- Custom theme files
- Realm export configuration

No additional volumes needed!

---

## 🔍 Troubleshooting

### Issue: Keycloak Won't Start

**Check logs:**
```bash
docker logs keycloak-server -f
```

**Common issues:**

1. **Database not ready**
   - Wait for postgres healthcheck: `docker ps` shows `healthy`
   - Check postgres logs: `docker logs keycloak-postgres`

2. **Wrong database URL**
   - Should be: `jdbc:postgresql://postgres:5432/keycloak`
   - Service name must match: `postgres` (as defined in compose)

3. **Port already in use**
   - Change port: `KEYCLOAK_PORT=8081` in `.env.keycloak`
   - Or stop conflicting service

### Issue: Can't Access Admin Console

**Test internally first:**
```bash
docker exec -it keycloak-server curl http://localhost:8080/
# Should return HTML

docker exec -it keycloak-server curl http://localhost:8080/admin/
# Should return admin console HTML
```

**If internal works but external doesn't:**
- Check firewall: Port 8080 must be open
- Check DNS: `nslookup auth-dev.nirmitee.io`
- For Dokploy: Configure domain in UI

### Issue: Theme Not Showing

**Verify theme is in image:**
```bash
docker exec -it keycloak-server ls -la /opt/keycloak/providers/
# Should show your theme files
```

**Rebuild image if needed:**
```bash
git push origin develop
# Wait for GitHub Actions to build new image
docker pull jitendratech/ehr-keycloak:dev
docker compose -f docker-compose.keycloak.yml down
docker compose -f docker-compose.keycloak.yml up -d
```

### Issue: Realm Not Imported

**Check realm file exists:**
```bash
docker exec -it keycloak-server ls -la /opt/keycloak/data/import/
# Should show realm-export.json
```

**Check import logs:**
```bash
docker logs keycloak-server | grep -i import
# Should see: "Importing from directory"
```

---

## 📊 Monitoring

### View Logs
```bash
# All logs
docker compose -f docker-compose.keycloak.yml logs -f

# Just Keycloak
docker logs keycloak-server -f

# Just PostgreSQL
docker logs keycloak-postgres -f
```

### Check Status
```bash
# Service status
docker compose -f docker-compose.keycloak.yml ps

# Health checks
docker ps
# Look for: (healthy) status
```

### Check Metrics
```bash
# Keycloak metrics endpoint
curl http://localhost:8080/metrics

# Or from outside
curl https://auth-dev.nirmitee.io/metrics
```

---

## 🔄 Management Commands

### Start Services
```bash
docker compose -f docker-compose.keycloak.yml --env-file .env.keycloak up -d
```

### Stop Services
```bash
docker compose -f docker-compose.keycloak.yml down
```

### Restart Keycloak Only
```bash
docker restart keycloak-server
```

### View Logs
```bash
docker compose -f docker-compose.keycloak.yml logs -f
```

### Update Image
```bash
docker pull jitendratech/ehr-keycloak:dev
docker compose -f docker-compose.keycloak.yml up -d --force-recreate keycloak
```

### Backup Database
```bash
docker exec keycloak-postgres pg_dump -U keycloakuser keycloak > keycloak_backup.sql
```

### Restore Database
```bash
docker exec -i keycloak-postgres psql -U keycloakuser keycloak < keycloak_backup.sql
```

---

## 🌐 Production Considerations

For production deployment, update these:

```yaml
keycloak:
  environment:
    # Stricter hostname settings
    KC_HOSTNAME_STRICT: "true"
    KC_HOSTNAME_STRICT_HTTPS: "true"

    # Disable HTTP, use HTTPS only
    KC_HTTP_ENABLED: "false"
    KC_HTTPS_ENABLED: "true"

    # Production optimizations
    KC_CACHE: ispn
    KC_CACHE_STACK: kubernetes

  # Use optimized command
  command: start --optimized --import-realm

  # Add resource limits
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
```

---

## 📋 Environment Variables Reference

### Required
```bash
POSTGRES_PASSWORD           # Database password
KEYCLOAK_ADMIN_PASSWORD     # Admin console password
KC_HOSTNAME                 # Your domain
```

### Optional
```bash
POSTGRES_DB=keycloak       # Database name
POSTGRES_USER=keycloakuser # Database user
KEYCLOAK_ADMIN=admin       # Admin username
KEYCLOAK_PORT=8080         # External port
KEYCLOAK_TAG=dev           # Image tag
KC_LOG_LEVEL=info          # Logging level
```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] PostgreSQL is running and healthy
- [ ] Keycloak is running and healthy
- [ ] Can access: http://localhost:8080/
- [ ] Admin console works: http://localhost:8080/admin
- [ ] Can login with admin credentials
- [ ] Realm is imported (check Realms dropdown)
- [ ] Custom theme is visible (check theme settings)
- [ ] Health endpoint works: /health/ready

---

## 🎯 Integration with EHR App

Once Keycloak is running, update your EHR application:

### In ehr-api environment:
```bash
KEYCLOAK_URL=http://keycloak-server:8080
KEYCLOAK_REALM=ehr-realm
```

### In ehr-web environment:
```bash
NEXT_PUBLIC_KEYCLOAK_URL=https://auth-dev.nirmitee.io
NEXT_PUBLIC_KEYCLOAK_REALM=ehr-realm
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=ehr-web-client
```

---

## 🚀 Quick Commands Summary

```bash
# Start
docker compose -f docker-compose.keycloak.yml --env-file .env.keycloak up -d

# Stop
docker compose -f docker-compose.keycloak.yml down

# Logs
docker logs keycloak-server -f

# Restart
docker restart keycloak-server

# Update
docker pull jitendratech/ehr-keycloak:dev && docker compose -f docker-compose.keycloak.yml up -d --force-recreate

# Backup
docker exec keycloak-postgres pg_dump -U keycloakuser keycloak > backup.sql

# Access
open http://localhost:8080/admin
```

---

**Ready to deploy!** 🎉

For Dokploy: Use this compose file or copy the services to your main compose file.
