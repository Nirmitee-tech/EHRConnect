# EHR Connect - Docker Hub Deployment Strategy

## 🎯 Overview

EHR Connect uses a Docker Hub-based deployment strategy where:
- Images are built by GitHub Actions
- Pushed to Docker Hub with environment-specific tags
- Pulled by Dokploy for deployment
- Fully automated via CI/CD pipelines

## 🏗️ Architecture

```
┌─────────────┐
│   GitHub    │
│ Repository  │
└──────┬──────┘
       │ Push code
       │
       ▼
┌─────────────────┐
│ GitHub Actions  │
│  - Build API    │
│  - Build Web    │
└──────┬──────────┘
       │ Push images
       │
       ▼
┌─────────────────┐
│   Docker Hub    │
│  - ehr-api:*    │
│  - ehr-web:*    │
└──────┬──────────┘
       │ Pull images
       │
       ▼
┌─────────────────┐
│    Dokploy      │
│   Deploy Stack  │
└─────────────────┘
```

## 📦 Image Repositories

### Docker Hub Structure

```
yourname/ehr-api:
├── latest       # Production (from main branch)
├── prod         # Production (from main branch)
├── staging      # Staging environment
├── dev          # Development environment
├── v1.0.0       # Version tags
├── v1.0.1       # Version tags
└── main-abc123  # SHA-based tags

yourname/ehr-web:
├── latest       # Production (from main branch)
├── prod         # Production (from main branch)
├── staging      # Staging environment
├── dev          # Development environment
├── v1.0.0       # Version tags
├── v1.0.1       # Version tags
└── main-abc123  # SHA-based tags
```

## 🔄 Deployment Workflow

### 1. Development Environment

**Trigger**: Push to `develop` branch

```bash
git checkout develop
git add .
git commit -m "Feature: Add new functionality"
git push origin develop
```

**What Happens**:
1. GitHub Actions detects push to `develop`
2. Builds `ehr-api` and `ehr-web` images
3. Tags as `:dev`
4. Pushes to Docker Hub
5. Triggers Dokploy dev webhook
6. Dokploy pulls `:dev` images and redeploys

**Time**: ~5-10 minutes total

### 2. Staging Environment

**Trigger**: Push to `staging` branch

```bash
git checkout staging
git merge develop
git push origin staging
```

**What Happens**:
1. GitHub Actions detects push to `staging`
2. Builds images
3. Tags as `:staging`
4. Pushes to Docker Hub
5. Triggers Dokploy staging webhook
6. Dokploy pulls `:staging` images and redeploys

**Time**: ~5-10 minutes total

### 3. Production Environment

**Option A: Via Main Branch**

```bash
git checkout main
git merge staging
git push origin main
```

**What Happens**:
1. Builds images
2. Tags as `:latest` and `:prod`
3. Pushes to Docker Hub
4. Triggers Dokploy prod webhook
5. Deployment to production

**Option B: Via Version Tag**

```bash
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0
```

**What Happens**:
1. Builds images
2. Tags as `:1.0.0`, `:1.0`, `:latest`
3. Pushes to Docker Hub
4. Creates GitHub Release
5. Triggers production deployment

## 🎛️ Configuration

### Environment Files

Each environment specifies which images to use:

**.env.dev**
```bash
DOCKERHUB_USERNAME=yourname
API_IMAGE_TAG=dev
WEB_IMAGE_TAG=dev
```

**.env.staging**
```bash
DOCKERHUB_USERNAME=yourname
API_IMAGE_TAG=staging
WEB_IMAGE_TAG=staging
```

**.env.prod**
```bash
DOCKERHUB_USERNAME=yourname
API_IMAGE_TAG=latest
WEB_IMAGE_TAG=latest
```

### Docker Compose Files

Automatically pull from Docker Hub:

```yaml
services:
  ehr-api:
    image: ${DOCKERHUB_USERNAME}/ehr-api:${API_IMAGE_TAG}
    # ... rest of config

  ehr-web:
    image: ${DOCKERHUB_USERNAME}/ehr-web:${WEB_IMAGE_TAG}
    # ... rest of config
```

## 🚀 Deployment Methods

### Method 1: Automatic (Recommended)

Simply push to the appropriate branch:

```bash
# Development
git push origin develop

# Staging
git push origin staging

# Production
git push origin main
```

Everything else is automated!

### Method 2: Manual via GitHub Actions

Use the Manual Build workflow:

1. Go to GitHub Actions tab
2. Select "Manual Build and Deploy"
3. Choose:
   - Service: api/web/both
   - Environment: dev/staging/prod
   - Deploy: true/false
4. Run workflow

### Method 3: Local Build and Push

For testing or emergency:

```bash
# Build locally
docker build -t yourname/ehr-api:test ./ehr-api
docker build -t yourname/ehr-web:test ./ehr-web

# Push to Docker Hub
docker push yourname/ehr-api:test
docker push yourname/ehr-web:test

# Update .env to use :test tag
API_IMAGE_TAG=test
WEB_IMAGE_TAG=test

# Deploy
./deploy.sh dev up
```

## 🔒 Private Repositories

If using private Docker Hub repositories:

### On Dokploy

1. Go to Dokploy → Settings → Registry
2. Add Docker Hub credentials:
   - Registry: `docker.io`
   - Username: your Docker Hub username
   - Password: Docker Hub access token
3. Save

### On Your Server

```bash
# Login to Docker Hub
docker login -u yourname

# Use token when prompted for password
```

Now Dokploy can pull private images.

## 📊 Image Versioning Strategy

### Semantic Versioning

Follow semantic versioning for releases:

```bash
# Major release (breaking changes)
git tag v2.0.0

# Minor release (new features, backwards compatible)
git tag v1.1.0

# Patch release (bug fixes)
git tag v1.0.1
```

### Tag Examples

```
v1.0.0 → Tags: 1.0.0, 1.0, 1, latest
v1.0.1 → Tags: 1.0.1, 1.0, 1, latest
v1.1.0 → Tags: 1.1.0, 1.1, 1, latest
v2.0.0 → Tags: 2.0.0, 2.0, 2, latest
```

### Rolling Back

To rollback to a previous version:

**Option 1: Change Image Tag**
```bash
# In .env.prod
API_IMAGE_TAG=v1.0.0  # Instead of latest
WEB_IMAGE_TAG=v1.0.0

# Redeploy
./deploy.sh prod up
```

**Option 2: Redeploy Old Tag**
```bash
# Pull specific version
docker pull yourname/ehr-api:v1.0.0
docker tag yourname/ehr-api:v1.0.0 yourname/ehr-api:latest
docker push yourname/ehr-api:latest

# Dokploy will automatically detect and redeploy
```

## 🔍 Monitoring Builds

### Via GitHub

1. Go to repository → Actions
2. View running workflows
3. Check logs for any failures

### Via Docker Hub

1. Go to hub.docker.com
2. Navigate to your repository
3. See all tags and when they were pushed

### Via CLI

```bash
# View GitHub Actions status
gh run list --workflow=build-and-push-api.yml

# View workflow logs
gh run view --log

# Check Docker Hub tags
curl -s "https://hub.docker.com/v2/repositories/yourname/ehr-api/tags/" | jq '.'
```

## 🐛 Troubleshooting

### Image Not Found

**Problem**: Dokploy can't find image

**Solutions**:
1. Check image exists on Docker Hub
2. Verify tag is correct in .env file
3. Check Docker Hub repository is public (or credentials configured)
4. Wait for build to complete

### Old Image Being Used

**Problem**: Changes not reflected after deployment

**Solutions**:
1. Check GitHub Actions completed successfully
2. Verify new image was pushed to Docker Hub
3. Force pull new image:
   ```bash
   docker pull yourname/ehr-api:dev --no-cache
   ```
4. Restart Dokploy service

### Build Failures

**Problem**: GitHub Actions build fails

**Common Causes**:
1. Syntax errors in Dockerfile
2. Missing files in build context
3. Out of disk space in runner
4. Docker Hub rate limits

**Solutions**:
1. Check GitHub Actions logs
2. Test build locally first
3. Fix issues and push again

### Slow Pulls

**Problem**: Dokploy takes long to pull images

**Solutions**:
1. Use closer Docker Hub region
2. Consider using a registry cache
3. Optimize image size (multi-stage builds already implemented)

## 📈 Benefits of This Approach

### ✅ Advantages

1. **Consistent Images**: Same image across all environments
2. **Fast Deployments**: Just pull and run, no building on server
3. **Easy Rollbacks**: Just change tag to previous version
4. **Version History**: All versions stored on Docker Hub
5. **Multi-Platform**: Built for amd64 and arm64
6. **Automated**: Push code → Auto build → Auto deploy
7. **Cacheable**: Faster builds with layer caching

### 💡 Best Practices

1. **Always tag releases**: Use semantic versioning
2. **Test on staging first**: Before production
3. **Keep old versions**: Don't delete old tags
4. **Monitor build times**: Optimize if too slow
5. **Use SHA tags**: For traceability
6. **Private repos for production**: Enhance security

## 🎯 Quick Command Reference

```bash
# Push to development
git push origin develop

# Push to staging
git push origin staging

# Create production release
git tag v1.0.0
git push origin v1.0.0

# Manual build
gh workflow run manual-build.yml -f service=both -f environment=prod

# View builds
gh run list

# Pull specific version
docker pull yourname/ehr-api:v1.0.0

# Deploy specific version
API_IMAGE_TAG=v1.0.0 ./deploy.sh prod up

# View available tags
curl -s "https://hub.docker.com/v2/repositories/yourname/ehr-api/tags/?page_size=100" | jq '.results[].name'
```

## 🔗 Related Documentation

- [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md) - GitHub Actions configuration
- [DOKPLOY_DEPLOYMENT_GUIDE.md](./DOKPLOY_DEPLOYMENT_GUIDE.md) - Full deployment guide
- [QUICK_START.md](./QUICK_START.md) - Quick start guide

---

## 🎉 Summary

With this Docker Hub strategy:

1. **Developers** push code
2. **GitHub Actions** builds images
3. **Docker Hub** stores images
4. **Dokploy** deploys images
5. **Zero manual steps** required!

Your deployment is now fully automated and version-controlled! 🚀
