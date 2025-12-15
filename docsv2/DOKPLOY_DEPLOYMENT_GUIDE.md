# EHR Connect - Dokploy Deployment Guide

Complete guide for deploying EHR Connect to Dokploy with multi-environment setup.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Initial Setup](#initial-setup)
4. [Dokploy Configuration](#dokploy-configuration)
5. [Multi-Environment Strategy](#multi-environment-strategy)
6. [One-Click Deployment](#one-click-deployment)
7. [Post-Deployment Steps](#post-deployment-steps)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Server Requirements
- **Minimum**: 2GB RAM, 30GB disk space
- **Recommended**: 4GB+ RAM, 50GB+ disk space
- Ubuntu 20.04+ or similar Linux distribution
- Docker and Docker Compose installed
- Dokploy installed and running

### Local Requirements
- Git installed
- Docker installed (for local testing)
- SSH access to your server

### Dokploy Installation
If you haven't installed Dokploy yet:

```bash
curl -sSL https://dokploy.com/install.sh | sh
```

---

## Architecture Overview

### Services

1. **PostgreSQL** - Primary database (includes medplum and keycloak databases)
2. **Redis** - Caching and session management
3. **Keycloak** - Authentication and authorization
4. **ehr-api** - Node.js/Express backend API (Port 8000)
5. **ehr-web** - Next.js frontend application (Port 3000)

### Network Architecture

```
Internet
   |
   v
[Dokploy Reverse Proxy]
   |
   +---> ehr-web (Port 3000)
   +---> ehr-api (Port 8000)
   +---> keycloak (Port 8080)
   |
   v
[Internal Network]
   |
   +---> postgres (Port 5432)
   +---> redis (Port 6379)
```

---

## Initial Setup

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd EHRConnect
```

### 2. Prepare Environment Files

For each environment you want to deploy (dev, staging, prod):

```bash
# Copy example environment file
cp .env.dev.example .env.dev
cp .env.staging.example .env.staging
cp .env.prod.example .env.prod

# Edit each file with your actual values
nano .env.dev
nano .env.staging
nano .env.prod
```

### 3. Generate Secrets

Generate secure secrets for production/staging:

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -base64 32

# Generate strong passwords
openssl rand -base64 24
```

Update the `.env.staging` and `.env.prod` files with these values.

---

## Dokploy Configuration

### Method 1: Docker Compose Deployment (Recommended)

This is the easiest way to deploy all services together.

#### Step 1: Access Dokploy Dashboard

1. Navigate to your Dokploy dashboard (usually `http://your-server-ip:3000`)
2. Login with your credentials

#### Step 2: Create New Project

1. Click "Create Project"
2. Name: `ehr-connect-dev` (or staging/prod)
3. Click "Create"

#### Step 3: Add Docker Compose Deployment

1. Inside the project, click "Add Service"
2. Select "Docker Compose"
3. Configure:
   - **Name**: `ehr-connect-dev`
   - **Repository URL**: Your Git repository URL
   - **Branch**: `main` (or your deployment branch)
   - **Compose File Path**: `docker-compose.dev.yml`
   - **Environment**: Select or create environment

#### Step 4: Configure Environment Variables

In the Dokploy service settings:

1. Go to "Environment" tab
2. Either:
   - **Option A**: Upload your `.env.dev` file
   - **Option B**: Paste environment variables manually

Click "Save"

#### Step 5: Deploy

1. Click "Deploy" button
2. Wait for build and deployment to complete (5-10 minutes first time)
3. Monitor logs in the "Logs" tab

### Method 2: Individual Service Deployment

If you prefer to deploy services individually:

#### Deploy PostgreSQL

1. Create new service → Database → PostgreSQL
2. Configure:
   - Database name: `medplum`
   - Username: `medplum`
   - Password: (secure password)
3. Deploy

#### Deploy Redis

1. Create new service → Database → Redis
2. Deploy with default settings

#### Deploy Keycloak

1. Create new service → Application
2. Select Docker Image
3. Image: `quay.io/keycloak/keycloak:26.0`
4. Add environment variables from compose file
5. Deploy

#### Deploy ehr-api

1. Create new service → Application
2. Select Repository
3. Configure:
   - Repository URL: Your repo
   - Branch: `main`
   - Build context: `./ehr-api`
   - Dockerfile path: `Dockerfile`
4. Add environment variables
5. Deploy

#### Deploy ehr-web

1. Create new service → Application
2. Select Repository
3. Configure:
   - Repository URL: Your repo
   - Branch: `main`
   - Build context: `./ehr-web`
   - Dockerfile path: `Dockerfile`
4. Add build args and environment variables
5. Deploy

---

## Multi-Environment Strategy

### Environment Separation

We use separate projects for each environment:

```
Dokploy
├── Project: ehr-connect-dev
│   └── Service: ehr-dev-stack (docker-compose.dev.yml)
├── Project: ehr-connect-staging
│   └── Service: ehr-staging-stack (docker-compose.staging.yml)
└── Project: ehr-connect-prod
    └── Service: ehr-prod-stack (docker-compose.prod.yml)
```

### Domain Configuration

Configure domains in Dokploy for each environment:

**Development**:
- Web: `dev.yourdomain.com`
- API: `dev-api.yourdomain.com`
- Auth: `dev-auth.yourdomain.com`

**Staging**:
- Web: `staging.yourdomain.com`
- API: `staging-api.yourdomain.com`
- Auth: `staging-auth.yourdomain.com`

**Production**:
- Web: `yourdomain.com`
- API: `api.yourdomain.com`
- Auth: `auth.yourdomain.com`

### SSL/TLS Configuration

Dokploy can automatically provision SSL certificates:

1. Go to service settings
2. Navigate to "Domains" tab
3. Add your domain
4. Enable "SSL/TLS"
5. Click "Generate Certificate"

---

## One-Click Deployment

### Using the Deployment Script

We've created a deployment script for easy local deployment and testing:

```bash
# Deploy to development
./deploy.sh dev up

# Deploy to staging
./deploy.sh staging up

# Deploy to production
./deploy.sh prod up

# View logs
./deploy.sh dev logs

# View specific service logs
./deploy.sh dev logs ehr-api

# Stop services
./deploy.sh dev down

# Restart services
./deploy.sh dev restart
```

### Dokploy Webhook Deployment

Set up automatic deployments on git push:

1. In Dokploy service settings, go to "Webhooks"
2. Copy the webhook URL
3. In your Git repository settings:
   - Go to Settings → Webhooks
   - Add the Dokploy webhook URL
   - Select events: `push` to main branch
4. Now every push will trigger automatic deployment!

---

## Post-Deployment Steps

### 1. Database Initialization

For the first deployment, you need to run migrations:

```bash
# Connect to ehr-api container
docker exec -it ehr-api-[env] /bin/sh

# Run migrations
npm run migrate

# Seed default data (if needed)
npm run seed:roles
npm run seed:providers
npm run seed:inventory
```

Or via Dokploy terminal:
1. Go to service → Terminal tab
2. Run migration commands

### 2. Keycloak Configuration

1. Access Keycloak admin console: `https://auth.yourdomain.com`
2. Login with admin credentials
3. Verify realm import: `ehr-realm` should exist
4. Configure clients:
   - Create/verify `ehr-web-client`
   - Set valid redirect URIs
   - Configure CORS settings

### 3. Verify Services

Check all services are running:

```bash
# Via deployment script
./deploy.sh [env] ps

# Via Dokploy dashboard
# Go to project → Services → Check status
```

### 4. Health Checks

Test health endpoints:

```bash
# API health check
curl https://api.yourdomain.com/health

# Web health check
curl https://yourdomain.com/api/health

# Keycloak health check
curl https://auth.yourdomain.com/health/ready
```

### 5. Sync Permissions

```bash
# Connect to ehr-api container
docker exec -it ehr-api-[env] npm run sync:permissions
```

---

## Monitoring & Maintenance

### Viewing Logs

**Via Dokploy Dashboard**:
1. Navigate to service
2. Click "Logs" tab
3. View real-time logs

**Via Command Line**:
```bash
./deploy.sh [env] logs [service-name]
```

### Backup Strategy

#### Database Backups

Create automated backup script:

```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_CONTAINER="ehr-postgres-prod"

docker exec $DB_CONTAINER pg_dump -U medplum medplum > $BACKUP_DIR/ehr_$DATE.sql
docker exec $DB_CONTAINER pg_dump -U medplum keycloak > $BACKUP_DIR/keycloak_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

Add to crontab:
```bash
0 2 * * * /path/to/backup-db.sh
```

#### Volume Backups

```bash
# Backup all volumes
docker run --rm -v postgres_prod_data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/postgres_data.tar.gz -C /data .
```

### Updates and Maintenance

#### Update Application Code

**Via Dokploy**:
1. Push code to repository
2. Webhook triggers automatic deployment
3. Or manually click "Redeploy" in Dokploy

**Via Script**:
```bash
./deploy.sh [env] down
git pull
./deploy.sh [env] up
```

#### Update Docker Images

```bash
# Pull latest images
./deploy.sh [env] pull

# Rebuild and restart
./deploy.sh [env] up
```

---

## Troubleshooting

### Common Issues

#### 1. Service Won't Start

**Check logs**:
```bash
./deploy.sh [env] logs [service-name]
```

**Common causes**:
- Missing environment variables
- Database connection issues
- Port conflicts

#### 2. Database Connection Failed

**Check**:
- Database container is running
- Credentials are correct
- Network connectivity

**Fix**:
```bash
# Restart database
docker restart ehr-postgres-[env]

# Check database logs
./deploy.sh [env] logs postgres
```

#### 3. Keycloak Not Starting

**Common causes**:
- Database not ready
- Realm import file missing
- Memory constraints

**Fix**:
```bash
# Check Keycloak logs
./deploy.sh [env] logs keycloak

# Restart Keycloak
docker restart ehr-keycloak-[env]
```

#### 4. Next.js Build Fails

**Common causes**:
- Missing environment variables at build time
- Out of memory

**Fix**:
```bash
# Increase Docker memory limit
# In docker-compose file, add:
# deploy:
#   resources:
#     limits:
#       memory: 4G
```

#### 5. CORS Errors

**Check**:
- `ALLOWED_ORIGINS` in ehr-api environment variables
- Includes your frontend domain
- No trailing slashes

### Debug Commands

```bash
# View all containers
docker ps -a

# View container resources
docker stats

# Inspect container
docker inspect [container-name]

# Execute command in container
./deploy.sh [env] exec ehr-api sh

# View environment variables
docker exec [container-name] env

# Test network connectivity
docker exec [container-name] ping postgres
```

### Performance Optimization

#### 1. Database Performance

```sql
-- Connect to database
docker exec -it ehr-postgres-prod psql -U medplum medplum

-- Check slow queries
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;

-- Analyze tables
ANALYZE;
```

#### 2. Application Performance

- Enable Redis caching
- Optimize Docker images (multi-stage builds already implemented)
- Use CDN for static assets
- Enable compression

#### 3. Resource Monitoring

```bash
# Check resource usage
docker stats

# Check disk usage
df -h
docker system df
```

---

## Checklist for First-Time Deployment

- [ ] Server meets minimum requirements
- [ ] Dokploy installed and accessible
- [ ] Repository cloned
- [ ] Environment files created and configured
- [ ] Secrets generated for production
- [ ] Git repository webhook configured (optional)
- [ ] Domain names configured
- [ ] SSL certificates generated
- [ ] Services deployed successfully
- [ ] Database migrations run
- [ ] Keycloak realm configured
- [ ] Health checks passing
- [ ] Backup strategy implemented
- [ ] Monitoring set up

---

## Support and Additional Resources

### Useful Links

- [Dokploy Documentation](https://docs.dokploy.com)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Keycloak Documentation](https://www.keycloak.org/documentation)

### Need Help?

- Check application logs first
- Review this guide
- Check GitHub issues
- Contact support team

---

## Summary

This guide provides a complete deployment strategy for EHR Connect using Dokploy. The key steps are:

1. **Prepare**: Set up environment files and generate secrets
2. **Configure**: Create Dokploy project and services
3. **Deploy**: Use Docker Compose or individual services
4. **Verify**: Run post-deployment checks
5. **Monitor**: Set up logging and backups

The deployment is designed to be as simple as possible - ideally just a few clicks in Dokploy UI or running `./deploy.sh [env] up` for local deployments.
