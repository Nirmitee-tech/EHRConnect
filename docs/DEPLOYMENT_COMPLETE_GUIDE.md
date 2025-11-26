# EHR Connect - Complete Deployment Guide
## Docker Hub + GitHub Actions + Dokploy

🎉 **Fully Automated Multi-Environment Deployment**

---

## 📚 Documentation Index

This is your central guide to all deployment documentation:

### 🚀 Getting Started
1. **[QUICK_START.md](./QUICK_START.md)** - Get running in 5-10 minutes
2. **[GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)** - Set up CI/CD pipeline
3. **[DOCKER_HUB_DEPLOYMENT.md](./DOCKER_HUB_DEPLOYMENT.md)** - Image management strategy

### 📖 Detailed Guides
4. **[DOKPLOY_DEPLOYMENT_GUIDE.md](./DOKPLOY_DEPLOYMENT_GUIDE.md)** - Complete Dokploy setup
5. **[DEPLOYMENT_FILES_SUMMARY.md](./DEPLOYMENT_FILES_SUMMARY.md)** - All deployment files explained

---

## 🎯 Complete Setup (Start Here!)

### Prerequisites Checklist
Before starting, ensure you have:

- [ ] **GitHub Repository** with your EHR Connect code
- [ ] **Docker Hub Account** (free or paid)
- [ ] **Server with Dokploy** installed (2GB+ RAM, 30GB+ disk)
- [ ] **Domain names** configured (for staging/prod)
- [ ] **SSH access** to your server

**Total Setup Time**: ~30 minutes for first-time setup

---

## 🚦 Step-by-Step Setup

### Phase 1: Docker Hub Setup (5 minutes)

1. **Create Docker Hub Account**
   - Go to [hub.docker.com](https://hub.docker.com)
   - Sign up (free tier is fine)

2. **Create Repositories**
   - Create `ehr-api` repository
   - Create `ehr-web` repository
   - Can be private or public

3. **Generate Access Token**
   - Go to Account Settings → Security
   - Create new access token with Read/Write permissions
   - **Save this token** - you'll need it for GitHub!

### Phase 2: GitHub Configuration (10 minutes)

1. **Add GitHub Secrets**

   Go to: Repository → Settings → Secrets and variables → Actions

   Add these secrets:
   ```
   DOCKERHUB_USERNAME = your-dockerhub-username
   DOCKERHUB_TOKEN = token-from-previous-step
   ```

2. **Update Environment Files**

   In your repository, update:

   ```bash
   # .env.dev.example
   DOCKERHUB_USERNAME=your-dockerhub-username

   # .env.staging.example
   DOCKERHUB_USERNAME=your-dockerhub-username

   # .env.prod.example
   DOCKERHUB_USERNAME=your-dockerhub-username
   ```

3. **Commit and Push**
   ```bash
   git add .env.*
   git commit -m "Configure Docker Hub credentials"
   git push origin main
   ```

### Phase 3: Initial Image Build (5 minutes)

**Trigger your first build:**

```bash
# Option 1: Push to develop branch
git checkout develop  # or create it
git push origin develop

# Option 2: Use GitHub Actions UI
# Go to Actions → Manual Build → Run workflow
```

**Wait for build to complete** (check Actions tab)

### Phase 4: Dokploy Setup (10 minutes)

1. **Access Dokploy Dashboard**
   - Navigate to `http://your-server-ip:3000`
   - Login

2. **Create Project**
   - Click "Create Project"
   - Name: `ehr-connect-dev`

3. **Add Docker Compose Service**
   - Click "Add Service" → "Docker Compose"
   - **Name**: ehr-dev-stack
   - **Repository**: Your GitHub repo URL
   - **Branch**: `develop` (or `main` for prod)
   - **Compose File**: `docker-compose.dev.yml`

4. **Configure Environment Variables**

   Copy from `.env.dev.example` and update:

   ```bash
   # Docker Hub (IMPORTANT!)
   DOCKERHUB_USERNAME=your-actual-username
   API_IMAGE_TAG=dev
   WEB_IMAGE_TAG=dev

   # Database
   DB_NAME=medplum
   DB_USER=medplum
   DB_PASSWORD=medplum123

   # Secrets (generate these!)
   NEXTAUTH_SECRET=<run: openssl rand -base64 32>
   JWT_SECRET=<run: openssl rand -base64 32>

   # Keycloak
   KEYCLOAK_ADMIN_PASSWORD=<strong-password>

   # ... rest of variables ...
   ```

5. **Deploy**
   - Click "Deploy" button
   - Wait for deployment (2-3 minutes)

6. **Verify**
   - Check all containers are running
   - Access your application

### Phase 5: Post-Deployment (5 minutes)

1. **Run Database Migrations**

   Via Dokploy Terminal or SSH:
   ```bash
   docker exec -it ehr-api-dev npm run migrate
   docker exec -it ehr-api-dev npm run seed:roles
   docker exec -it ehr-api-dev npm run seed:providers
   ```

2. **Test Application**
   ```bash
   # Health checks
   curl http://your-domain:8000/health
   curl http://your-domain:3000/api/health
   ```

3. **Configure Keycloak** (if needed)
   - Access Keycloak admin console
   - Verify realm import
   - Configure clients

---

## 🔄 Daily Development Workflow

Once setup is complete, your workflow is incredibly simple:

### Making Changes

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make your changes
# ... edit code ...

# 3. Commit and push
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# 4. Create Pull Request to develop
# ... on GitHub ...

# 5. Merge PR
# ✅ Automatic: Build → Push to Docker Hub → Deploy to Dev
```

### Deploying to Staging

```bash
git checkout staging
git merge develop
git push origin staging

# ✅ Automatic: Build → Push → Deploy to Staging
```

### Deploying to Production

```bash
# Option 1: Via main branch
git checkout main
git merge staging
git push origin main

# Option 2: Via version tag (recommended)
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0

# ✅ Automatic: Build → Push → Deploy to Production
```

**That's it!** No manual building, no SSH, no complexity.

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                     Developer                             │
│                  Pushes Code to Git                       │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│                  GitHub Actions                           │
│  ┌────────────┐              ┌────────────┐             │
│  │ Build API  │              │ Build Web  │             │
│  │  Container │              │ Container  │             │
│  └─────┬──────┘              └─────┬──────┘             │
└────────┼─────────────────────────────┼───────────────────┘
         │                             │
         └──────────┬──────────────────┘
                    │ Push Images
                    ▼
┌──────────────────────────────────────────────────────────┐
│                    Docker Hub                             │
│  📦 yourname/ehr-api:dev,staging,prod,latest             │
│  📦 yourname/ehr-web:dev,staging,prod,latest             │
└────────────────────┬─────────────────────────────────────┘
                     │
                     │ Webhook Trigger
                     ▼
┌──────────────────────────────────────────────────────────┐
│                     Dokploy                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Pull & Deploy Stack                 │    │
│  │  ┌─────────┐ ┌─────────┐ ┌──────────┐          │    │
│  │  │ ehr-web │ │ ehr-api │ │ postgres │          │    │
│  │  └─────────┘ └─────────┘ └──────────┘          │    │
│  │  ┌─────────┐ ┌──────────┐                      │    │
│  │  │ keycloak│ │  redis   │                      │    │
│  │  └─────────┘ └──────────┘                      │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## 🌿 Branch Strategy

```
develop  ─────────────────────────────────> (Dev Environment)
         └──> PR ──> merge
                     │
staging  ────────────┴─────────────────────> (Staging Environment)
         └──> Test ──> merge
                       │
main     ──────────────┴─────────────────────> (Production)
         └──> Tag v1.0.0 ──> Release
```

**Tags**: `v1.0.0`, `v1.0.1`, `v2.0.0`, etc.

---

## 📦 Image Tag Strategy

### Development
- **Branch**: `develop`
- **Tags**: `:dev`, `:develop-sha`
- **Auto-Deploy**: Yes → Dev environment

### Staging
- **Branch**: `staging`
- **Tags**: `:staging`, `:staging-sha`
- **Auto-Deploy**: Yes → Staging environment

### Production
- **Branch**: `main`
- **Tags**: `:latest`, `:prod`, `:main-sha`
- **Auto-Deploy**: Yes → Production

### Releases
- **Tag**: `v1.0.0`
- **Tags**: `:1.0.0`, `:1.0`, `:1`, `:latest`
- **Auto-Deploy**: Yes → Production
- **Creates**: GitHub Release

---

## 🎛️ Environment Configuration

### Development (.env.dev)
```bash
DOCKERHUB_USERNAME=yourname
API_IMAGE_TAG=dev
WEB_IMAGE_TAG=dev

# Use default passwords (OK for dev)
DB_PASSWORD=medplum123
KEYCLOAK_ADMIN_PASSWORD=admin123

# Local URLs
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Staging (.env.staging)
```bash
DOCKERHUB_USERNAME=yourname
API_IMAGE_TAG=staging
WEB_IMAGE_TAG=staging

# Strong passwords
DB_PASSWORD=<generate-strong-password>
KEYCLOAK_ADMIN_PASSWORD=<generate-strong-password>
NEXTAUTH_SECRET=<openssl rand -base64 32>
JWT_SECRET=<openssl rand -base64 32>

# Staging domains
NEXT_PUBLIC_API_URL=https://staging-api.yourdomain.com
```

### Production (.env.prod)
```bash
DOCKERHUB_USERNAME=yourname
API_IMAGE_TAG=latest
WEB_IMAGE_TAG=latest

# Very strong passwords
DB_PASSWORD=<32+ chars>
REDIS_PASSWORD=<32+ chars>
KEYCLOAK_ADMIN_PASSWORD=<32+ chars>
NEXTAUTH_SECRET=<32+ chars>
JWT_SECRET=<32+ chars>

# Production domains
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## 🔐 Security Best Practices

### Development
- ✅ Default passwords OK
- ✅ HTTP OK
- ✅ Exposed ports OK

### Staging
- ⚠️ Use strong passwords
- ✅ HTTPS required
- ⚠️ Limit exposed ports

### Production
- ❌ NEVER use default passwords
- ✅ HTTPS enforced
- ✅ All secrets 32+ characters
- ✅ Redis password protected
- ✅ Limited port exposure
- ✅ Regular backups
- ✅ Monitoring enabled

---

## 🛠️ Available Commands

### Development
```bash
# Deploy development
./deploy.sh dev up

# View logs
./deploy.sh dev logs

# Restart
./deploy.sh dev restart

# Stop
./deploy.sh dev down
```

### GitHub Actions
```bash
# Trigger manual build
gh workflow run manual-build.yml -f service=both -f environment=dev

# View running workflows
gh run list

# Watch workflow
gh run watch
```

### Docker Hub
```bash
# Pull specific image
docker pull yourname/ehr-api:staging

# View tags
docker search yourname/ehr-api
```

---

## 📊 Monitoring & Maintenance

### Check Build Status

**GitHub Actions**:
- Repository → Actions tab
- View workflow runs
- Check logs for failures

**Docker Hub**:
- hub.docker.com
- View your repositories
- See all tags and push times

**Dokploy**:
- Dokploy dashboard
- Check service status
- View deployment logs

### Health Checks

```bash
# API health
curl https://api.yourdomain.com/health

# Web health
curl https://yourdomain.com/api/health

# Keycloak health
curl https://auth.yourdomain.com/health/ready
```

### Backups

**Automated Daily Backups** (recommended):

```bash
#!/bin/bash
# /root/backup-ehr.sh

DATE=$(date +%Y%m%d_%H%M%S)
docker exec ehr-postgres-prod pg_dump -U medplum medplum > /backups/ehr_$DATE.sql

# Keep only last 7 days
find /backups -name "*.sql" -mtime +7 -delete
```

Add to crontab:
```bash
0 2 * * * /root/backup-ehr.sh
```

---

## 🐛 Common Issues & Solutions

### Issue: Images Not Pulling

**Symptoms**: Dokploy can't find images

**Solutions**:
1. Verify images exist on Docker Hub
2. Check `DOCKERHUB_USERNAME` is correct
3. For private repos, add Docker Hub credentials to Dokploy
4. Check image tag matches environment config

### Issue: Old Code Running

**Symptoms**: Changes not reflected after deployment

**Solutions**:
1. Check GitHub Actions completed successfully
2. Verify new images pushed to Docker Hub (check timestamp)
3. Force Dokploy to pull:
   ```bash
   docker pull yourname/ehr-api:dev --no-cache
   ```
4. Restart service in Dokploy

### Issue: Build Failures

**Symptoms**: GitHub Actions build fails

**Solutions**:
1. Check Actions logs for specific error
2. Common issues:
   - Dockerfile syntax error
   - Missing files
   - Out of disk space
   - Docker Hub rate limits
3. Test build locally:
   ```bash
   docker build -t test ./ehr-api
   ```

### Issue: Deployment Webhook Not Working

**Symptoms**: Images built but not deployed

**Solutions**:
1. Check webhook URL is correct in GitHub secrets
2. Verify webhook is enabled in Dokploy
3. Check Dokploy webhook logs
4. Manually trigger deployment in Dokploy

---

## 📈 Performance Optimization

### Image Size Optimization
✅ Already implemented:
- Multi-stage builds
- .dockerignore files
- Minimal base images (alpine)

### Build Speed Optimization
✅ Already implemented:
- Docker layer caching
- Registry cache on Docker Hub
- Parallel builds for API and Web

### Deployment Speed
- Images pre-built (no build on server)
- Pull takes 1-2 minutes
- Restart takes 30 seconds
- **Total**: ~3-5 minutes deployment time

---

## 🎓 Learning Resources

### External Documentation
- [Docker Hub Docs](https://docs.docker.com/docker-hub/)
- [GitHub Actions Docs](https://docs.github.com/actions)
- [Dokploy Docs](https://docs.dokploy.com)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

### Your Documentation
- [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) - CI/CD details
- [DOCKER_HUB_DEPLOYMENT.md](./DOCKER_HUB_DEPLOYMENT.md) - Image strategy
- [DOKPLOY_DEPLOYMENT_GUIDE.md](./DOKPLOY_DEPLOYMENT_GUIDE.md) - Dokploy specifics

---

## ✅ Setup Verification Checklist

### Initial Setup
- [ ] Docker Hub account created
- [ ] `ehr-api` and `ehr-web` repositories created
- [ ] Docker Hub access token generated
- [ ] GitHub secrets configured
- [ ] Environment files updated with Docker Hub username
- [ ] First build successful (check Actions tab)
- [ ] Images visible on Docker Hub

### Dokploy Configuration
- [ ] Dokploy project created
- [ ] Docker Compose service configured
- [ ] Environment variables set
- [ ] First deployment successful
- [ ] All containers running
- [ ] Database migrations completed
- [ ] Keycloak configured

### Verification
- [ ] API health check passing
- [ ] Web health check passing
- [ ] Can login to application
- [ ] Test user can create records
- [ ] Keycloak authentication working

### Production Readiness
- [ ] Staging environment tested
- [ ] All secrets generated (32+ chars)
- [ ] SSL certificates configured
- [ ] Domain names pointed correctly
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] Disaster recovery plan documented

---

## 🎉 You're All Set!

After completing this setup, you have:

✅ **Fully Automated CI/CD**
- Push code → Auto build → Auto deploy

✅ **Multi-Environment Support**
- Development, Staging, Production

✅ **Version Control**
- Semantic versioning with rollback capability

✅ **Production-Ready**
- Secure, scalable, maintainable

✅ **Easy Operations**
- Simple commands, minimal maintenance

---

## 🚀 What's Next?

1. **Test the workflow**: Make a small change and push to `develop`
2. **Set up staging**: Configure staging environment
3. **Configure monitoring**: Set up logging and alerts
4. **Document custom processes**: Add any team-specific procedures
5. **Train your team**: Share this documentation

---

## 📞 Need Help?

**Troubleshooting Steps**:
1. Check relevant documentation section
2. Review GitHub Actions logs
3. Check Docker Hub for images
4. Verify Dokploy service status
5. Check application logs

**Resources**:
- GitHub Issues
- Dokploy Community
- Docker Hub Support
- Your team's DevOps channel

---

## 📄 Documentation Quick Links

| Document | Purpose | When to Use |
|----------|---------|-------------|
| [QUICK_START.md](./QUICK_START.md) | Fast setup | First time setup |
| [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) | CI/CD config | Setting up automation |
| [DOCKER_HUB_DEPLOYMENT.md](./DOCKER_HUB_DEPLOYMENT.md) | Image management | Understanding deployments |
| [DOKPLOY_DEPLOYMENT_GUIDE.md](./DOKPLOY_DEPLOYMENT_GUIDE.md) | Full Dokploy | Detailed Dokploy setup |
| [DEPLOYMENT_FILES_SUMMARY.md](./DEPLOYMENT_FILES_SUMMARY.md) | File reference | Understanding file structure |

---

**Happy Deploying! 🎉🚀**

Your EHR Connect application is now enterprise-ready with a modern, automated deployment pipeline!
