# 🚀 EHR Connect - 1-Click Dokploy Setup Guide

**Complete setup in 15 minutes with managed databases!**

---

## 🎯 Domain Structure for nirmitee.io

Your deployment will use these subdomains:

### Development
- **Frontend**: `ehr-dev.nirmitee.io`
- **API**: `api-dev.nirmitee.io`
- **Auth (Keycloak)**: `auth-dev.nirmitee.io`

### Staging
- **Frontend**: `ehr-staging.nirmitee.io`
- **API**: `api-staging.nirmitee.io`
- **Auth (Keycloak)**: `auth-staging.nirmitee.io`

### Production
- **Frontend**: `ehr.nirmitee.io` or `app.nirmitee.io`
- **API**: `api.nirmitee.io`
- **Auth (Keycloak)**: `auth.nirmitee.io`

---

## ⚡ Quick Start (15 Minutes)

### Phase 1: Docker Hub Setup (5 minutes)

#### ⚠️ IMPORTANT: Use Access Token, Not Password!

Your Docker Hub credentials:
- Username: `jitendratech`

**Instead, create an access token:**

1. **Go to Docker Hub**
   - Visit: https://hub.docker.com/settings/security
   - Login with `jitendratech` 

2. **Create Access Token**
   - Click "New Access Token"
   - Description: `github-actions-ehr`
   - Access permissions: **Read, Write, Delete**
   - Click "Generate"
   - **Copy the token** (looks like: `dckr_pat_xxxxxxxxxxxxx`)
   - ⚠️ Save it! You won't see it again

3. **Create Repositories**
   - Create repository: `ehr-api`
   - Create repository: `ehr-web`
   - Can be private or public (your choice)

---

### Phase 2: GitHub Configuration (3 minutes)

1. **Add GitHub Secrets**

   Go to: Your GitHub Repo → Settings → Secrets and variables → Actions

   Click "New repository secret" and add:

   ```
   Name: DOCKERHUB_USERNAME
   Value: jitendratech
   ```

   ```
   Name: DOCKERHUB_TOKEN
   Value: <paste-the-access-token-you-generated>
   ```

2. **Trigger First Build**

   ```bash
   # Push to develop branch to trigger build
   git checkout develop || git checkout -b develop
   git push origin develop
   ```

3. **Wait for Build** (~7 minutes)
   - Go to: Actions tab in GitHub
   - Watch workflows complete
   - Images will appear on Docker Hub

---

### Phase 3: Dokploy Setup - Database First! (7 minutes)

#### Step 1: Create PostgreSQL Database (2 minutes)

1. **Access Dokploy** → `http://your-server-ip:3000`

2. **Create Database Service**
   - Click "Services" → "Add Service"
   - Select "Database" → "PostgreSQL"
   - **Configuration**:
     ```
     Name: ehr-postgres-dev
     PostgreSQL Version: 15
     Database Name: ehrconnect
     Username: ehruser
     Password: <generate-strong-password>

     # Click "Generate" for strong password!
     ```
   - Click "Create"
   - **Save these credentials!** You'll need them next

3. **Note the Connection Details**
   ```
   Host: ehr-postgres-dev (internal hostname)
   Port: 5432
   Database: ehrconnect
   Username: ehruser
   Password: <password-you-generated> 

   Connection String:
   postgresql://ehruser:<password>@ehr-postgres-dev:5432/ehrconnect
   ```

#### Step 2: Create Application Stack (5 minutes)

1. **Create New Project**
   - Click "Create Project"
   - Name: `ehr-connect-dev`
   - Click "Create"

2. **Add Docker Compose Service**
   - Inside project, click "Add Service"
   - Select "Docker Compose"
   - **Configuration**:
     ```
     Name: ehr-dev-stack
     Repository: https://github.com/<your-username>/EHRConnect
     Branch: develop
     Compose File: docker-compose.dokploy-dev.yml
     ```

3. **Set Environment Variables**

   Click "Environment" tab, paste this (update values marked with ⚠️):

   ```bash
   # Docker Hub
   DOCKERHUB_USERNAME=jitendratech
   API_IMAGE_TAG=dev
   WEB_IMAGE_TAG=dev

   # Database Connection (⚠️ USE YOUR ACTUAL VALUES FROM STEP 1)
   DB_HOST=ehr-postgres-dev
   DB_PORT=5432
   DB_NAME=ehrconnect
   DB_USER=ehruser
   DB_PASSWORD=<password-from-step-1>

   # Keycloak Database Connection (⚠️ SAME AS ABOVE)
   KC_DB_URL=jdbc:postgresql://ehr-postgres-dev:5432/ehrconnect

   # Keycloak Admin
   KEYCLOAK_ADMIN_USER=admin
   KEYCLOAK_ADMIN_PASSWORD=<generate-strong-password>
   KEYCLOAK_REALM=ehr-realm
   KEYCLOAK_HOSTNAME=auth-dev.nirmitee.io

   # Generate these secrets! (run: openssl rand -base64 32)
NEXTAUTH_SECRET=<run-openssl-rand-base64-32>
JWT_SECRET=<run-openssl-rand-base64-32>

   # Application URLs
NEXT_PUBLIC_API_URL=https://api-dev.nirmitee.io
NEXT_PUBLIC_KEYCLOAK_URL=https://auth-dev.nirmitee.io
NEXT_PUBLIC_KEYCLOAK_REALM=ehr-realm
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=ehr-web-client
ALLOWED_ORIGINS=https://ehr-dev.nirmitee.io
NEXTAUTH_URL=https://ehr-dev.nirmitee.io

   # External APIs
CLAIMMD_API_URL=https://api.claim.md/v1
   ```

4. **Deploy!**
   - Click "Deploy" button
   - Wait 3-5 minutes for deployment
   - Monitor in "Logs" tab

---

### Phase 4: Domain Configuration (Automatic SSL)

Once services are running, configure domains for SSL:

1. **Configure ehr-web Domain**
   - Select `ehr-web` service
   - Go to "Domains" tab
   - Add domain: `ehr-dev.nirmitee.io`
   - Enable SSL/TLS
   - Click "Generate Certificate"

2. **Configure ehr-api Domain**
   - Select `ehr-api` service (if exposed separately)
   - Go to "Domains" tab
   - Add domain: `api-dev.nirmitee.io`
   - Enable SSL/TLS
   - Click "Generate Certificate"

3. **Configure Keycloak Domain**
   - Select `keycloak` service
   - Go to "Domains" tab
   - Add domain: `auth-dev.nirmitee.io`
   - Enable SSL/TLS
   - Click "Generate Certificate"

**Note**: Make sure DNS records point to your Dokploy server first!

---

### Phase 5: Post-Deployment Setup (3 minutes)

#### Run Database Migrations

**Option 1: Via Dokploy Terminal**
1. Go to `ehr-api` service
2. Click "Terminal" tab
3. Run:
   ```bash
   npm run migrate
   npm run seed:roles
   npm run seed:providers
   npm run seed:inventory
   ```

**Option 2: Via SSH**
```bash
ssh your-server
docker exec -it 6f528ffff7f2 npm run migrate
docker exec -it ehr-api-dev npm run seed:roles
docker exec -it ehr-api-dev npm run seed:providers
docker exec -it ehr-api-dev npm run seed:inventory
```

---

## ✅ Verification Checklist

### Check Services Running

In Dokploy dashboard:
- [ ] ehr-postgres-dev: Running (green)
- [ ] ehr-redis-dev: Running (green)
- [ ] ehr-keycloak-dev: Running (green)
- [ ] ehr-api-dev: Running (green)
- [ ] ehr-web-dev: Running (green)

### Check Health Endpoints

```bash
# API health
curl https://api-dev.nirmitee.io/health

# Expected: {"status":"ok","timestamp":"...","service":"ehr-api"}

# Web health
curl https://ehr-dev.nirmitee.io/api/health

# Expected: {"status":"ok","timestamp":"...","service":"ehr-web"}

# Keycloak health
curl https://auth-dev.nirmitee.io/health/ready

# Expected: {"status":"UP"}
```

### Access Application

1. Open browser: `https://ehr-dev.nirmitee.io`
2. Should see EHR Connect login page
3. Keycloak authentication should work

---

## 🔄 For Staging and Production

### Staging Setup

Repeat the same process but use:

**Database:**
```
Name: ehr-postgres-staging
Database: ehrconnect_staging
Username: ehruser_staging
```

**Docker Compose:**
```
Branch: staging
Compose File: docker-compose.dokploy-staging.yml
Environment: Use .env.staging.example
Domains:
  - ehr-staging.nirmitee.io
  - api-staging.nirmitee.io
  - auth-staging.nirmitee.io
```

### Production Setup

**Database:**
```
Name: ehr-postgres-prod
Database: ehrconnect_prod
Username: ehruser_prod
⚠️ Use VERY strong passwords!
```

**Docker Compose:**
```
Branch: main
Compose File: docker-compose.dokploy-prod.yml
Environment: Use .env.prod.example (UPDATE ALL SECRETS!)
Domains:
  - ehr.nirmitee.io
  - api.nirmitee.io
  - auth.nirmitee.io
```

---

## 🎯 Automated Deployment Flow

After initial setup, deployments are automatic:

```bash
# 1. Make changes
git checkout develop
# ... edit code ...
git commit -m "Add feature"
git push origin develop

# 2. GitHub Actions automatically:
#    ✅ Builds images
#    ✅ Pushes to Docker Hub (jitendratech/ehr-api:dev, ehr-web:dev)
#    ✅ (Optional) Triggers Dokploy webhook

# 3. Dokploy automatically:
#    ✅ Pulls new images
#    ✅ Rolling restart
#    ✅ Zero downtime deployment

# Total time: ~8-10 minutes from push to live!
```

---

## 🔐 Security Best Practices

### Development
- ✅ Can use simpler passwords
- ✅ SSL recommended but not critical

### Staging
- ⚠️ Use strong passwords (20+ chars)
- ✅ SSL required
- ⚠️ Limit access

### Production
- ❌ MUST use very strong passwords (32+ chars)
- ✅ SSL enforced
- ✅ Regular backups (Dokploy has built-in backup)
- ✅ Monitoring enabled
- ✅ Limit admin access

### Generate Strong Secrets

```bash
# For NEXTAUTH_SECRET and JWT_SECRET
openssl rand -base64 32

# For passwords
openssl rand -base64 24
```

---

## 💾 Database Backups

### Automatic Backups (Dokploy Built-in)

1. Go to database service in Dokploy
2. Navigate to "Backups" tab
3. Configure:
   ```
   Schedule: Daily at 2 AM
   Retention: 7 days
   Destination: Local storage
   ```
4. Enable backups

### Manual Backup

```bash
# Via Dokploy Terminal
docker exec ehr-postgres-dev pg_dump -U ehruser ehrconnect > backup.sql

# Via SSH
ssh your-server
docker exec ehr-postgres-dev pg_dump -U ehruser ehrconnect > /backups/ehr_$(date +%Y%m%d).sql
```

### Restore Backup

```bash
docker exec -i ehr-postgres-dev psql -U ehruser ehrconnect < backup.sql
```

---

## 🐛 Troubleshooting

### Issue: Can't Pull Images

**Error**: `pull access denied for jitendratech/ehr-api`

**Solutions**:
1. Verify images exist on Docker Hub
2. Check build completed in GitHub Actions
3. For private repos, add Docker Hub credentials in Dokploy:
   - Settings → Registry → Add Registry
   - Registry: `docker.io`
   - Username: `jitendratech`
   - Password/Token: Your Docker Hub password or token

### Issue: Database Connection Failed

**Error**: `connect ECONNREFUSED` or `password authentication failed`

**Solutions**:
1. Verify database service is running in Dokploy
2. Check credentials match in environment variables:
   ```bash
   DB_HOST=ehr-postgres-dev  # Use Dokploy internal hostname!
   DB_USER=ehruser
   DB_PASSWORD=<correct-password>
   ```
3. Test connection from API container:
   ```bash
   docker exec -it ehr-api-dev sh
   nc -zv ehr-postgres-dev 5432
   ```

### Issue: Keycloak Won't Start

**Error**: Keycloak health check failing

**Solutions**:
1. Check database connection:
   ```bash
   KC_DB_URL=jdbc:postgresql://ehr-postgres-dev:5432/ehrconnect
   ```
2. Increase startup time (already set to 60s)
3. Check logs:
   ```bash
   docker logs ehr-keycloak-dev
   ```

### Issue: 502 Bad Gateway

**Symptoms**: Domain shows 502 error

**Solutions**:
1. Check services are running (not restarting)
2. Verify health checks pass
3. Check Dokploy reverse proxy logs
4. Ensure ports are exposed correctly

---

## 📊 Monitoring

### Via Dokploy Dashboard

1. **Service Status**
   - Green = healthy
   - Yellow = unhealthy
   - Red = stopped

2. **View Logs**
   - Select service → Logs tab
   - Real-time streaming
   - Filter by service

3. **Resource Usage**
   - CPU and memory graphs
   - Disk usage
   - Network traffic

### Via CLI

```bash
# View all containers
docker ps

# View logs
docker logs ehr-api-dev -f --tail 100

# Check resources
docker stats

# Execute command
docker exec -it ehr-api-dev npm run migrate
```

---

## 🎉 Success! You're Done!

Your EHR Connect application is now:

✅ Running on Dokploy with managed databases
✅ Accessible via nirmitee.io subdomains
✅ Secured with automatic SSL certificates
✅ Connected to Docker Hub for images
✅ Automated deployments via GitHub Actions

### Next Steps

1. **Configure Keycloak**
   - Access `https://auth-dev.nirmitee.io`
   - Login with admin credentials
   - Configure clients and roles

2. **Test Application**
   - Access `https://ehr-dev.nirmitee.io`
   - Create test organization
   - Create test users

3. **Set Up Staging/Production**
   - Repeat process for staging
   - Test on staging before production
   - Deploy to production

4. **Enable Monitoring**
   - Set up alerts in Dokploy
   - Configure backup notifications
   - Monitor resource usage

---

## 📚 Quick Reference

### Environment Variables Template

```bash
# Copy and fill in:
DOCKERHUB_USERNAME=jitendratech
API_IMAGE_TAG=dev
WEB_IMAGE_TAG=dev
DB_HOST=ehr-postgres-dev
DB_PORT=5432
DB_NAME=ehrconnect
DB_USER=ehruser
DB_PASSWORD=<from-dokploy-database>
KC_DB_URL=jdbc:postgresql://ehr-postgres-dev:5432/ehrconnect
KEYCLOAK_ADMIN_PASSWORD=<generate-strong>
NEXTAUTH_SECRET=<openssl-rand-base64-32>
JWT_SECRET=<openssl-rand-base64-32>
NEXT_PUBLIC_API_URL=https://api-dev.nirmitee.io
NEXT_PUBLIC_KEYCLOAK_URL=https://auth-dev.nirmitee.io
NEXTAUTH_URL=https://ehr-dev.nirmitee.io
ALLOWED_ORIGINS=https://ehr-dev.nirmitee.io
```

### Useful Commands

```bash
# Check service status
docker ps | grep ehr

# View API logs
docker logs ehr-api-dev -f

# Run migrations
docker exec -it ehr-api-dev npm run migrate

# Access database
docker exec -it ehr-postgres-dev psql -U ehruser ehrconnect

# Restart service
docker restart ehr-api-dev

# Pull latest images
docker pull jitendratech/ehr-api:dev
docker pull jitendratech/ehr-web:dev
```

---

**Questions or Issues?**

1. Check Dokploy logs first
2. Verify Docker Hub images exist
3. Test database connectivity
4. Review this guide's troubleshooting section

**Happy Deploying! 🚀**
