# 🚀 EHR Connect - START HERE

## Your Complete Deployment Setup

**Updated for:**
- Docker Hub: `jitendratech`
- Domain: `nirmitee.io`
- Managed databases in Dokploy

---

## 🎯 What You Need to Do (15 Minutes Total)

### 1️⃣ Docker Hub Access Token (5 min)

⚠️ **IMPORTANT**: Don't use your password in GitHub!

**Your credentials:**
- Username: `jitendratech`
- Password: `` (only for logging into Docker Hub website)

**Create access token:**
1. Go to https://hub.docker.com/settings/security
2. Login with your credentials
3. Click "New Access Token"
4. Name: `github-actions-ehr`
5. Permissions: Read, Write, Delete
6. Copy the token (starts with `dckr_pat_...`)

**Full instructions**: [DOCKER_HUB_TOKEN_SETUP.md](./DOCKER_HUB_TOKEN_SETUP.md)

---

### 2️⃣ GitHub Secrets (2 min)

Add to GitHub: Settings → Secrets and variables → Actions

```
DOCKERHUB_USERNAME = jitendratech
DOCKERHUB_TOKEN = <paste your access token>
```

---

### 3️⃣ Trigger First Build (1 min)

```bash
git checkout develop || git checkout -b develop
git push origin develop
```

Wait ~7 minutes for build to complete. Check Actions tab.

---

### 4️⃣ Dokploy Setup (7 min)

**Follow this guide**: [DOKPLOY_1CLICK_SETUP.md](./DOKPLOY_1CLICK_SETUP.md)

Quick summary:
1. Create PostgreSQL database in Dokploy
2. Create Docker Compose service
3. Set environment variables
4. Deploy!

Your domains will be:
- Dev: `ehr-dev.nirmitee.io`, `api-dev.nirmitee.io`, `auth-dev.nirmitee.io`
- Staging: `ehr-staging.nirmitee.io`, `api-staging.nirmitee.io`, `auth-staging.nirmitee.io`
- Production: `ehr.nirmitee.io`, `api.nirmitee.io`, `auth.nirmitee.io`

---

## 📚 All Documentation

### 🎯 Quick Guides
1. **[START_HERE.md](./START_HERE.md)** ← You are here!
2. **[DOKPLOY_1CLICK_SETUP.md](./DOKPLOY_1CLICK_SETUP.md)** - Complete Dokploy setup with managed DB
3. **[DOCKER_HUB_TOKEN_SETUP.md](./DOCKER_HUB_TOKEN_SETUP.md)** - How to create access token
4. **[QUICK_START.md](./QUICK_START.md)** - Local development setup

### 📖 Detailed Guides
5. **[DEPLOYMENT_COMPLETE_GUIDE.md](./DEPLOYMENT_COMPLETE_GUIDE.md)** - Master guide
6. **[GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)** - CI/CD details
7. **[DOCKER_HUB_DEPLOYMENT.md](./DOCKER_HUB_DEPLOYMENT.md)** - Image management
8. **[DOKPLOY_DEPLOYMENT_GUIDE.md](./DOKPLOY_DEPLOYMENT_GUIDE.md)** - Full Dokploy guide

---

## 🎯 Your Recommended Path

### For First-Time Setup:

**Day 1: Development Environment**
1. Read: [DOCKER_HUB_TOKEN_SETUP.md](./DOCKER_HUB_TOKEN_SETUP.md)
2. Create Docker Hub access token
3. Add GitHub secrets
4. Read: [DOKPLOY_1CLICK_SETUP.md](./DOKPLOY_1CLICK_SETUP.md)
5. Set up dev environment on Dokploy
6. Test: Push code and watch auto-deployment

**Day 2: Staging Environment**
1. Use same guide but for staging
2. Set up staging database in Dokploy
3. Deploy staging stack
4. Configure domains
5. Test full workflow

**Day 3: Production**
1. Review security checklist
2. Generate strong production secrets
3. Set up production database
4. Deploy production stack
5. Configure SSL certificates
6. Set up backups and monitoring

---

## 🔑 Key Benefits of This Setup

### ✅ Managed Databases
- Dokploy handles PostgreSQL
- Automatic backups
- Easy scaling
- Better reliability

### ✅ Separate Compose Files
- `docker-compose.dokploy-dev.yml` - For Dokploy dev
- `docker-compose.dokploy-staging.yml` - For Dokploy staging
- `docker-compose.dokploy-prod.yml` - For Dokploy production
- `docker-compose.dev.yml` - For local development (includes database)

### ✅ Docker Hub Images
- Pre-built images
- Fast deployments (3-5 minutes)
- Easy rollbacks
- Version control

### ✅ Automated Deployments
- Push to `develop` → Auto-deploy to dev
- Push to `staging` → Auto-deploy to staging
- Push to `main` → Auto-deploy to production

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   GitHub Repository                      │
│              (Your EHRConnect Code)                      │
└───────────────────┬─────────────────────────────────────┘
                    │ Push code
                    ▼
┌─────────────────────────────────────────────────────────┐
│                 GitHub Actions                           │
│     Builds: jitendratech/ehr-api:dev                    │
│             jitendratech/ehr-web:dev                    │
└───────────────────┬─────────────────────────────────────┘
                    │ Push images
                    ▼
┌─────────────────────────────────────────────────────────┐
│                   Docker Hub                             │
│           (jitendratech repository)                      │
└───────────────────┬─────────────────────────────────────┘
                    │ Pull images
                    ▼
┌─────────────────────────────────────────────────────────┐
│                     Dokploy                              │
│  ┌──────────────┐  ┌────────────────────────┐          │
│  │ PostgreSQL   │  │  Application Stack     │          │
│  │ (Managed)    │  │  ┌──────┐  ┌────────┐ │          │
│  │              │──│  │ API  │  │  Web   │ │          │
│  │ ehrconnect   │  │  └──────┘  └────────┘ │          │
│  │              │  │  ┌──────┐  ┌────────┐ │          │
│  └──────────────┘  │  │Redis │  │Keycloak│ │          │
│                    │  └──────┘  └────────┘ │          │
│                    └────────────────────────┘          │
└─────────────────────────────────────────────────────────┘
                    │
                    ▼
            nirmitee.io domains
```

---

## 🔄 Daily Workflow

### Making Changes
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes
# ... edit code ...

# 3. Commit and push
git commit -m "Add new feature"
git push origin feature/new-feature

# 4. Create PR to develop
# ... merge on GitHub ...

# 5. Automatic deployment!
# ✅ Build images
# ✅ Push to Docker Hub
# ✅ Deploy to dev environment
```

### Deploying to Staging
```bash
git checkout staging
git merge develop
git push origin staging
# ✅ Automatic: Build → Push → Deploy
```

### Deploying to Production
```bash
git checkout main
git merge staging
git push origin main
# ✅ Automatic: Build → Push → Deploy
```

---

## 🌐 Your Domain Setup

### Development (ehr-dev.nirmitee.io)
- **Frontend**: https://ehr-dev.nirmitee.io
- **API**: https://api-dev.nirmitee.io
- **Auth**: https://auth-dev.nirmitee.io

### Staging (ehr-staging.nirmitee.io)
- **Frontend**: https://ehr-staging.nirmitee.io
- **API**: https://api-staging.nirmitee.io
- **Auth**: https://auth-staging.nirmitee.io

### Production (ehr.nirmitee.io)
- **Frontend**: https://ehr.nirmitee.io
- **API**: https://api.nirmitee.io
- **Auth**: https://auth.nirmitee.io

**Note**: Make sure DNS A records point to your Dokploy server!

---

## ✅ Setup Verification

After setup, verify:

### 1. Docker Hub
- [ ] Repositories exist: `ehr-api`, `ehr-web`
- [ ] Images with tags: `dev`, `staging`, `latest`
- [ ] Can see recent pushes

### 2. GitHub
- [ ] Secrets configured: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`
- [ ] Workflows running successfully
- [ ] No build failures

### 3. Dokploy
- [ ] Database service running (green)
- [ ] Application stack running (all green)
- [ ] Domains configured with SSL
- [ ] Health checks passing

### 4. Application
- [ ] Can access frontend URL
- [ ] Can login with Keycloak
- [ ] API endpoints responding
- [ ] No console errors

---

## 🐛 Common Issues

### Images Not Found
**Solution**: Wait for GitHub Actions build to complete, check Docker Hub

### Database Connection Failed
**Solution**: Verify DB_HOST=ehr-postgres-dev (Dokploy internal name)

### 502 Bad Gateway
**Solution**: Check all services are running, not restarting

### SSL Certificate Failed
**Solution**: Ensure DNS points to Dokploy server first

**Full troubleshooting**: [DOKPLOY_1CLICK_SETUP.md](./DOKPLOY_1CLICK_SETUP.md#-troubleshooting)

---

## 📞 Need Help?

1. **Check logs**:
   - GitHub Actions: Repo → Actions tab
   - Docker Hub: hub.docker.com
   - Dokploy: Service → Logs tab

2. **Read relevant guide**:
   - Setup issues: [DOKPLOY_1CLICK_SETUP.md](./DOKPLOY_1CLICK_SETUP.md)
   - CI/CD issues: [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)
   - Image issues: [DOCKER_HUB_DEPLOYMENT.md](./DOCKER_HUB_DEPLOYMENT.md)

3. **Test locally**:
   ```bash
   ./deploy.sh dev up
   ```

---

## 🎉 Quick Win!

Get your dev environment running in 15 minutes:

1. ⏱️ 5 min: [Create Docker Hub token](./DOCKER_HUB_TOKEN_SETUP.md)
2. ⏱️ 2 min: Add GitHub secrets
3. ⏱️ 1 min: Push to develop (trigger build)
4. ⏱️ 7 min: [Set up Dokploy](./DOKPLOY_1CLICK_SETUP.md)

**Total**: 15 minutes to live application!

---

## 🚀 Let's Get Started!

**Your next steps:**

1. Open [DOCKER_HUB_TOKEN_SETUP.md](./DOCKER_HUB_TOKEN_SETUP.md)
2. Create access token
3. Add to GitHub
4. Open [DOKPLOY_1CLICK_SETUP.md](./DOKPLOY_1CLICK_SETUP.md)
5. Follow the guide
6. Deploy!

---

**Ready to deploy?** Start with [DOCKER_HUB_TOKEN_SETUP.md](./DOCKER_HUB_TOKEN_SETUP.md) now! 🚀
