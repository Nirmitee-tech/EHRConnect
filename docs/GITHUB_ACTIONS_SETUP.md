# GitHub Actions & Docker Hub Setup Guide

Complete guide for setting up automated CI/CD with GitHub Actions and Docker Hub.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Docker Hub Setup](#docker-hub-setup)
3. [GitHub Secrets Configuration](#github-secrets-configuration)
4. [Branch Strategy](#branch-strategy)
5. [Workflow Triggers](#workflow-triggers)
6. [Manual Deployments](#manual-deployments)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### What Gets Automated

✅ **Automatic Image Building**: When you push to specific branches
✅ **Docker Hub Publishing**: Images pushed with appropriate tags
✅ **Multi-Architecture**: Builds for both `linux/amd64` and `linux/arm64`
✅ **Dokploy Deployment**: Automatic deployment after successful builds
✅ **Version Tagging**: Semantic versioning support (v1.0.0, v1.0.1, etc.)

### Workflow Files

```
.github/workflows/
├── build-and-push-api.yml    # Builds ehr-api and pushes to Docker Hub
├── build-and-push-web.yml    # Builds ehr-web and pushes to Docker Hub
├── deploy-dokploy.yml        # Triggers Dokploy deployment
└── manual-build.yml          # Manual build and deploy workflow
```

---

## 🐳 Docker Hub Setup

### Step 1: Create Docker Hub Account

1. Go to [hub.docker.com](https://hub.docker.com)
2. Sign up or log in
3. Create repositories:
   - `ehr-api` (can be private or public)
   - `ehr-web` (can be private or public)

### Step 2: Generate Access Token

1. Go to Account Settings → Security
2. Click "New Access Token"
3. Name: `github-actions`
4. Permissions: `Read, Write, Delete`
5. **Copy the token** (you won't see it again!)

### Step 3: Update Environment Files

Update your `.env.*` files with your Docker Hub username:

```bash
# .env.dev
DOCKERHUB_USERNAME=yourusername

# .env.staging
DOCKERHUB_USERNAME=yourusername

# .env.prod
DOCKERHUB_USERNAME=yourusername
```

---

## 🔐 GitHub Secrets Configuration

### Required Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

#### Docker Hub Secrets

| Secret Name | Value | Description |
|------------|-------|-------------|
| `DOCKERHUB_USERNAME` | your-username | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | token-from-step-2 | The access token you generated |

#### Dokploy Webhook Secrets (Optional but Recommended)

| Secret Name | Value | Description |
|------------|-------|-------------|
| `DOKPLOY_WEBHOOK_DEV` | https://your-dokploy.com/webhook/dev | Development webhook URL |
| `DOKPLOY_WEBHOOK_STAGING` | https://your-dokploy.com/webhook/staging | Staging webhook URL |
| `DOKPLOY_WEBHOOK_PROD` | https://your-dokploy.com/webhook/prod | Production webhook URL |

#### Optional Secrets

| Secret Name | Value | Description |
|------------|-------|-------------|
| `SLACK_WEBHOOK_URL` | https://hooks.slack.com/... | For deployment notifications |

### How to Get Dokploy Webhook URLs

1. Log in to your Dokploy dashboard
2. Go to your project
3. Select the service
4. Navigate to "Webhooks" tab
5. Copy the webhook URL
6. Add to GitHub secrets

---

## 🌿 Branch Strategy

### Branch-to-Environment Mapping

| Branch | Image Tag | Environment | Auto-Deploy |
|--------|-----------|-------------|-------------|
| `develop` | `dev` | Development | Yes |
| `staging` | `staging` | Staging | Yes |
| `main` | `latest`, `prod` | Production | Yes |
| `v*` tags | version number | Production | Yes |

### Image Tagging Strategy

When you push to different branches, images are automatically tagged:

**Develop Branch** (`develop`):
```
yourname/ehr-api:dev
yourname/ehr-api:develop-abc1234 (SHA)
yourname/ehr-web:dev
yourname/ehr-web:develop-abc1234 (SHA)
```

**Staging Branch** (`staging`):
```
yourname/ehr-api:staging
yourname/ehr-api:staging-abc1234 (SHA)
yourname/ehr-web:staging
yourname/ehr-web:staging-abc1234 (SHA)
```

**Main Branch** (`main`):
```
yourname/ehr-api:latest
yourname/ehr-api:prod
yourname/ehr-api:main-abc1234 (SHA)
yourname/ehr-web:latest
yourname/ehr-web:prod
yourname/ehr-web:main-abc1234 (SHA)
```

**Version Tags** (`v1.0.0`):
```
yourname/ehr-api:1.0.0
yourname/ehr-api:1.0
yourname/ehr-api:latest
yourname/ehr-web:1.0.0
yourname/ehr-web:1.0
yourname/ehr-web:latest
```

---

## 🚀 Workflow Triggers

### Automatic Triggers

#### 1. Push to Main Branch
```bash
git push origin main
```
**What happens:**
- ✅ Builds both API and Web
- ✅ Tags as `latest` and `prod`
- ✅ Pushes to Docker Hub
- ✅ Triggers production deployment

#### 2. Push to Develop Branch
```bash
git push origin develop
```
**What happens:**
- ✅ Builds both API and Web
- ✅ Tags as `dev`
- ✅ Pushes to Docker Hub
- ✅ Triggers dev deployment

#### 3. Push to Staging Branch
```bash
git push origin staging
```
**What happens:**
- ✅ Builds both API and Web
- ✅ Tags as `staging`
- ✅ Pushes to Docker Hub
- ✅ Triggers staging deployment

#### 4. Create Version Tag
```bash
git tag v1.0.0
git push origin v1.0.0
```
**What happens:**
- ✅ Builds both API and Web
- ✅ Tags with version number
- ✅ Pushes to Docker Hub
- ✅ Creates GitHub release
- ✅ Triggers production deployment

### Conditional Triggers

Workflows only run when relevant files change:

**API Changes** (`ehr-api/**`):
- Only builds and pushes `ehr-api` image
- Web image is not rebuilt

**Web Changes** (`ehr-web/**`):
- Only builds and pushes `ehr-web` image
- API image is not rebuilt

**Both Changed**:
- Builds and pushes both images

---

## 🎮 Manual Deployments

### Using GitHub UI

1. Go to Actions tab in GitHub
2. Select "Manual Build and Deploy" workflow
3. Click "Run workflow"
4. Configure:
   - **Service**: api, web, or both
   - **Environment**: dev, staging, prod, latest
   - **Deploy**: true/false
5. Click "Run workflow"

### Using GitHub CLI

```bash
# Install GitHub CLI if needed
brew install gh
gh auth login

# Trigger manual build
gh workflow run manual-build.yml \
  -f service=both \
  -f environment=staging \
  -f deploy=true

# Check workflow status
gh run list --workflow=manual-build.yml

# View workflow logs
gh run view
```

### Build Specific Service

```bash
# Build only API for staging
gh workflow run manual-build.yml \
  -f service=api \
  -f environment=staging \
  -f deploy=false

# Build only Web for prod
gh workflow run manual-build.yml \
  -f service=web \
  -f environment=prod \
  -f deploy=true
```

---

## 📊 Monitoring Workflows

### View Running Workflows

```bash
# List all workflow runs
gh run list

# Watch a specific run
gh run watch

# View logs for failed run
gh run view <run-id> --log-failed
```

### GitHub Actions Dashboard

1. Go to repository → Actions tab
2. See all workflows and their status
3. Click on any workflow run for details
4. Download logs if needed

---

## 🔄 Complete Deployment Flow

### Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes
# ... code changes ...

# 3. Commit and push
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# 4. Create PR to develop
# ... create PR on GitHub ...

# 5. Merge to develop
# ... merge PR ...
# ✅ Automatic: Build → Push → Deploy to Dev
```

### Staging Deployment

```bash
# 1. Merge develop to staging
git checkout staging
git merge develop
git push origin staging

# ✅ Automatic: Build → Push → Deploy to Staging

# 2. Test on staging
# ... manual testing ...

# 3. If OK, proceed to production
```

### Production Deployment

**Option 1: Via Main Branch**
```bash
git checkout main
git merge staging
git push origin main

# ✅ Automatic: Build → Push → Deploy to Production
```

**Option 2: Via Version Tag**
```bash
# Create and push version tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# ✅ Automatic: Build → Push → Create Release → Deploy
```

---

## 🔧 Advanced Configuration

### Custom Build Args

Edit `.github/workflows/build-and-push-*.yml`:

```yaml
build-args: |
  NODE_ENV=production
  CUSTOM_VAR=value
```

### Different Platforms

By default, builds for `linux/amd64` and `linux/arm64`. To change:

```yaml
platforms: linux/amd64  # Only amd64
# or
platforms: linux/amd64,linux/arm64,linux/arm/v7  # Add arm/v7
```

### Build Cache

Workflows use Docker layer caching for faster builds:

```yaml
cache-from: type=registry,ref=${{ secrets.DOCKERHUB_USERNAME }}/ehr-api:buildcache
cache-to: type=registry,ref=${{ secrets.DOCKERHUB_USERNAME }}/ehr-api:buildcache,mode=max
```

This significantly speeds up subsequent builds!

---

## 🐛 Troubleshooting

### Build Fails

**Error: permission denied**
- Check Docker Hub token has `Write` permission
- Verify `DOCKERHUB_TOKEN` secret is correct

**Error: repository does not exist**
- Create repositories on Docker Hub first
- Verify repository names match (ehr-api, ehr-web)

**Error: failed to solve with frontend dockerfile.v0**
- Check Dockerfile syntax
- Verify file paths in Docker context

### Deployment Not Triggered

**Webhook not firing:**
- Verify Dokploy webhook URLs are correct
- Check webhook secrets are set in GitHub
- Look at Dokploy webhook logs

**Deployment fails:**
- Check Dokploy can pull images from Docker Hub
- If private repo, add Docker Hub credentials to Dokploy
- Verify image tags match environment config

### Image Not Found

**Error: manifest not found**
- Wait for build to complete
- Check GitHub Actions tab for build status
- Verify image was pushed: `docker pull yourname/ehr-api:dev`

### Slow Builds

**First build is slow:**
- Normal! No cache exists yet
- Subsequent builds will be faster

**All builds slow:**
- Check build cache is working
- Verify cache-from/cache-to configuration
- Consider using GitHub Actions cache

---

## 📚 Best Practices

### 1. Use Branch Protection

```
Settings → Branches → Add rule
- Require pull request reviews
- Require status checks to pass
- Include administrators
```

### 2. Tag Releases Properly

```bash
# Semantic versioning
git tag v1.0.0  # Major release
git tag v1.0.1  # Patch
git tag v1.1.0  # Minor release
```

### 3. Test Before Production

Always test on staging:
```
develop → staging → test → main → production
```

### 4. Use Manual Workflow for Hotfixes

For urgent fixes:
```bash
# Fix in develop
git checkout develop
# ... fix ...
git push

# Manual deploy to prod
gh workflow run manual-build.yml -f environment=prod -f deploy=true
```

### 5. Monitor Build Times

- Check Actions usage (Settings → Billing)
- Optimize Dockerfiles to reduce build time
- Use build cache effectively

---

## 🎯 Quick Reference

### Initial Setup Checklist

- [ ] Create Docker Hub account
- [ ] Create `ehr-api` and `ehr-web` repositories
- [ ] Generate Docker Hub access token
- [ ] Add `DOCKERHUB_USERNAME` to GitHub secrets
- [ ] Add `DOCKERHUB_TOKEN` to GitHub secrets
- [ ] Update `.env.*` files with Docker Hub username
- [ ] Create Dokploy webhooks (optional)
- [ ] Add webhook URLs to GitHub secrets (optional)
- [ ] Push to develop branch to test

### Common Commands

```bash
# Trigger dev deployment
git push origin develop

# Trigger staging deployment
git push origin staging

# Trigger prod deployment
git push origin main

# Create release
git tag v1.0.0 && git push origin v1.0.0

# Manual build
gh workflow run manual-build.yml -f service=both -f environment=dev
```

---

## 🆘 Getting Help

### Check Workflow Logs

```bash
gh run list
gh run view <run-id> --log
```

### Verify Secrets

```bash
gh secret list
```

### Test Docker Hub Login

```bash
docker login -u <username>
# Use access token as password
```

### Test Image Pull

```bash
docker pull yourname/ehr-api:dev
docker pull yourname/ehr-web:dev
```

---

## 🎉 Summary

After setup, your workflow is:

1. **Push code** to branch
2. **GitHub Actions** automatically builds images
3. **Docker Hub** receives new images
4. **Dokploy** pulls and deploys new images
5. **Done!** 🚀

No manual building, no manual deployments - fully automated!
