# EHR Connect - Quick Start Guide

Get your EHR system deployed in minutes!

## 🚀 Fastest Way to Deploy

### Option 1: Dokploy (Recommended for Production)

**Time: ~10 minutes**

1. **Access Dokploy**
   ```
   Navigate to your Dokploy dashboard
   ```

2. **Create Project**
   - Click "Create Project" → Name it "ehr-connect-dev"

3. **Add Docker Compose Service**
   - Click "Add Service" → "Docker Compose"
   - **Repository**: Your Git repo URL
   - **Branch**: main
   - **Compose File**: `docker-compose.dev.yml`

4. **Set Environment Variables**
   - Copy content from `.env.dev.example`
   - Update the values:
     ```bash
     # Quick generate secrets
     openssl rand -base64 32  # Use for NEXTAUTH_SECRET
     openssl rand -base64 32  # Use for JWT_SECRET
     ```
   - Paste in Dokploy Environment tab

5. **Deploy**
   - Click "Deploy" button
   - ☕ Wait 5-10 minutes for first build
   - ✅ Done!

### Option 2: Local Development

**Time: ~5 minutes**

```bash
# 1. Clone and setup
git clone <your-repo>
cd EHRConnect

# 2. Copy environment file
cp .env.dev.example .env.dev

# 3. Deploy
./deploy.sh dev up

# 4. Wait for services to start (2-3 minutes)
# 5. Access the app at http://localhost:3000
```

---

## 📋 Minimum Configuration Required

Before deploying, you only need to set these in your environment file:

```bash
# Database (can use defaults for dev)
DB_NAME=medplum
DB_USER=medplum
DB_PASSWORD=medplum123

# Secrets (MUST change for production!)
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
JWT_SECRET=<generate-with-openssl-rand-base64-32>

# Admin password (MUST change for production!)
KEYCLOAK_ADMIN_PASSWORD=<strong-password>
```

Everything else has sensible defaults!

---

## 🔧 One-Command Deployment

### Development
```bash
./deploy.sh dev up
```

### Staging
```bash
# 1. Configure environment
cp .env.staging.example .env.staging
nano .env.staging  # Update secrets and domains

# 2. Deploy
./deploy.sh staging up
```

### Production
```bash
# 1. Configure environment
cp .env.prod.example .env.prod
nano .env.prod  # Update ALL values!

# 2. Deploy
./deploy.sh prod up
```

---

## 🎯 Post-Deployment (First Time Only)

After deployment, run these once:

```bash
# Access the API container
docker exec -it ehr-api-dev sh

# Run migrations
npm run migrate

# Seed initial data
npm run seed:roles
npm run seed:providers
```

Or via Dokploy: Service → Terminal → Run commands

---

## ✅ Verify Deployment

Check if everything is working:

```bash
# Check services status
./deploy.sh dev ps

# Check logs
./deploy.sh dev logs

# Test health endpoints
curl http://localhost:8000/health     # API
curl http://localhost:3000/api/health # Web
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-...",
  "service": "ehr-api"
}
```

---

## 🌐 Access Your Application

After successful deployment:

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **Keycloak Admin**: http://localhost:8080
  - Username: `admin`
  - Password: (from your .env file)

---

## 🔄 Common Commands

```bash
# View logs
./deploy.sh dev logs              # All services
./deploy.sh dev logs ehr-api      # Specific service

# Restart services
./deploy.sh dev restart

# Stop everything
./deploy.sh dev down

# Rebuild and restart
./deploy.sh dev up
```

---

## 🏗️ Multi-Environment Setup

Deploy to multiple environments:

```bash
# Development
./deploy.sh dev up

# Staging
./deploy.sh staging up

# Production
./deploy.sh prod up
```

Each environment:
- Uses separate Docker volumes
- Has isolated databases
- Can run simultaneously on different servers

---

## 📚 Need More Details?

- **Full Guide**: See [DOKPLOY_DEPLOYMENT_GUIDE.md](./DOKPLOY_DEPLOYMENT_GUIDE.md)
- **Troubleshooting**: Check the guide's troubleshooting section
- **Architecture**: See [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 🆘 Quick Troubleshooting

### Service won't start?
```bash
./deploy.sh dev logs [service-name]
```

### Need to reset everything?
```bash
./deploy.sh dev down
docker volume prune -f  # ⚠️ This deletes all data!
./deploy.sh dev up
```

### Database connection errors?
```bash
# Check if postgres is running
docker ps | grep postgres

# Restart postgres
docker restart ehr-postgres-dev
```

---

## 🎉 That's It!

Your EHR Connect system should now be running. The setup is designed to work with minimal configuration.

**Next Steps:**
1. Create your first organization
2. Set up users and roles
3. Configure integrations
4. Start using the system!

For production deployments, make sure to:
- ✅ Use strong passwords
- ✅ Configure SSL/TLS
- ✅ Set up backups
- ✅ Configure monitoring

See the full deployment guide for production best practices.
