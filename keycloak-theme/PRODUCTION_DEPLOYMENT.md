# EHR Connect Keycloak Theme - Production Deployment Guide

## 📋 Prerequisites for Production Machine

### Required Software
1. **Node.js** 18+ or 20+
   ```bash
   # Check version
   node --version
   
   # Install if needed (macOS)
   brew install node
   
   # Install if needed (Linux)
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Docker & Docker Compose**
   ```bash
   # Check versions
   docker --version
   docker-compose --version
   
   # Install Docker Desktop (macOS/Windows)
   # Visit: https://www.docker.com/products/docker-desktop
   
   # Install Docker (Linux)
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

3. **Git** (for cloning repository)
   ```bash
   git --version
   ```

## 🚀 Production Deployment Steps

### Step 1: Clone the Repository
```bash
# Clone the EHRConnect repository
git clone https://github.com/Nirmitee-tech/EHRConnect.git
cd EHRConnect
```

### Step 2: Install Keycloak Theme Dependencies
```bash
cd keycloak-theme
npm install
```

### Step 3: Build the Theme
```bash
# Build the production-ready Keycloak theme
npm run build-keycloak-theme
```

This creates JAR files in `dist_keycloak/`:
- `keycloak-theme-for-kc-22-to-25.jar`
- `keycloak-theme-for-kc-all-other-versions.jar`

### Step 4: Copy Theme JARs
```bash
# Copy built JARs to keycloak themes folder
cp dist_keycloak/*.jar ../keycloak/themes/
```

### Step 5: Start Docker Services
```bash
# Go back to project root
cd ..

# Start all services
docker-compose up -d

# Check services are running
docker-compose ps
```

### Step 6: Wait for Services to Initialize
```bash
# Wait for Keycloak to fully start (~60 seconds)
sleep 60

# Check Keycloak is ready
curl -f http://localhost:8080/health/ready || echo "Not ready yet, wait 30 more seconds"
```

### Step 7: Copy Theme to Running Container
```bash
# Copy JARs to Keycloak container
docker cp keycloak/themes/keycloak-theme-for-kc-22-to-25.jar ehrconnect-keycloak-1:/opt/keycloak/providers/
docker cp keycloak/themes/keycloak-theme-for-kc-all-other-versions.jar ehrconnect-keycloak-1:/opt/keycloak/providers/
```

### Step 8: Build Keycloak with Theme
```bash
# Build Keycloak to install the theme
docker exec ehrconnect-keycloak-1 /opt/keycloak/bin/kc.sh build
```

### Step 9: Restart Keycloak
```bash
# Restart to load the theme
docker-compose restart keycloak

# Wait for restart
sleep 30
```

### Step 10: Verify Theme is Active
```bash
# Open browser to test
open http://localhost:3000
# Click "Sign In" - should see custom EHR Connect theme
```

## 🔄 All-in-One Production Script

Create this script for easy production deployment:

```bash
#!/bin/bash
# production-deploy.sh

set -e

echo "🚀 EHR Connect Production Deployment"
echo "======================================"

# Step 1: Install theme dependencies
echo "📦 Installing dependencies..."
cd keycloak-theme
npm ci  # Use ci for production (faster, uses lock file)

# Step 2: Build theme
echo "🔨 Building Keycloak theme..."
npm run build-keycloak-theme

# Step 3: Copy to keycloak folder
echo "📋 Copying JARs..."
cp dist_keycloak/*.jar ../keycloak/themes/

# Step 4: Start services if not running
cd ..
echo "🐳 Starting Docker services..."
docker-compose up -d

# Step 5: Wait for services
echo "⏳ Waiting for services to initialize..."
sleep 60

# Step 6: Deploy theme to container
echo "📦 Deploying theme to Keycloak..."
docker cp keycloak/themes/keycloak-theme-for-kc-22-to-25.jar ehrconnect-keycloak-1:/opt/keycloak/providers/
docker cp keycloak/themes/keycloak-theme-for-kc-all-other-versions.jar ehrconnect-keycloak-1:/opt/keycloak/providers/

# Step 7: Build Keycloak
echo "🔨 Building Keycloak with theme..."
docker exec ehrconnect-keycloak-1 /opt/keycloak/bin/kc.sh build

# Step 8: Restart Keycloak
echo "🔄 Restarting Keycloak..."
docker-compose restart keycloak

# Step 9: Wait for restart
echo "⏳ Waiting for Keycloak to restart..."
sleep 30

# Step 10: Verify
echo "✅ Deployment complete!"
echo ""
echo "🔍 Verification steps:"
echo "1. Visit: http://localhost:3000"
echo "2. Click 'Sign In'"
echo "3. You should see the custom EHR Connect theme"
echo ""
echo "📍 Admin panel: http://localhost:8080"
echo "   Username: admin"
echo "   Password: admin123"
```

Save as `production-deploy.sh` and run:
```bash
chmod +x production-deploy.sh
./production-deploy.sh
```

## 🌐 Production Environment Setup

### For Cloud Deployment (AWS, Azure, GCP)

#### 1. Update docker-compose.yml for Production
```yaml
# Change from development to production settings
keycloak:
  image: quay.io/keycloak/keycloak:26.0
  environment:
    KC_DB: postgres
    KC_DB_URL: jdbc:postgresql://your-prod-db:5432/keycloak
    KC_DB_USERNAME: ${DB_USERNAME}
    KC_DB_PASSWORD: ${DB_PASSWORD}
    KC_HOSTNAME: your-domain.com  # Your production domain
    KC_HOSTNAME_STRICT: true
    KC_HOSTNAME_STRICT_HTTPS: true
    KC_HTTP_ENABLED: false  # HTTPS only in production
    KC_PROXY: edge  # If behind load balancer
  volumes:
    - ./keycloak/themes:/opt/keycloak/providers/
    # Don't import realm in prod - manage via admin UI
```

#### 2. Environment Variables
Create `.env` file:
```env
# Database
DB_USERNAME=keycloak_user
DB_PASSWORD=secure_password_here

# Keycloak Admin
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=very_secure_password

# URLs
APP_URL=https://your-domain.com
KEYCLOAK_URL=https://auth.your-domain.com
```

#### 3. SSL/TLS Certificates
```bash
# Add SSL certificates
keycloak:
  volumes:
    - ./certs/cert.pem:/opt/keycloak/conf/server.crt.pem
    - ./certs/key.pem:/opt/keycloak/conf/server.key.pem
```

### For Kubernetes Deployment

#### 1. Build and Push Theme to Registry
```bash
# Build theme
cd keycloak-theme
npm run build-keycloak-theme

# Create custom Keycloak image with theme
cat > Dockerfile <<EOF
FROM quay.io/keycloak/keycloak:26.0

# Copy theme JARs
COPY keycloak/themes/*.jar /opt/keycloak/providers/

# Build with themes
RUN /opt/keycloak/bin/kc.sh build
EOF

# Build and push
docker build -t your-registry/ehrconnect-keycloak:latest .
docker push your-registry/ehrconnect-keycloak:latest
```

#### 2. Deploy to Kubernetes
```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/keycloak-deployment.yaml
kubectl apply -f k8s/keycloak-service.yaml
```

## 🔐 Security Checklist for Production

- [ ] Change default admin password
- [ ] Use strong database passwords
- [ ] Enable HTTPS only
- [ ] Configure proper CORS origins
- [ ] Set up proper redirect URIs
- [ ] Enable email verification
- [ ] Configure password policies
- [ ] Set up 2FA/MFA
- [ ] Configure session timeouts
- [ ] Enable brute force protection
- [ ] Set up logging and monitoring
- [ ] Regular security updates

## 📝 Production Configuration

### Keycloak Realm Settings (Manual via Admin UI)

1. **Access Admin Console:**
   - URL: https://your-keycloak-domain.com
   - Login with admin credentials

2. **Select ehr-realm**

3. **Configure Theme:**
   - Realm Settings → Themes
   - Login Theme: `ehrconnect`
   - Click Save

4. **Configure Email:**
   - Realm Settings → Email
   - Add SMTP settings for production emails

5. **Configure Security:**
   - Realm Settings → Security Defenses
   - Enable brute force detection
   - Configure password policies

6. **Configure Tokens:**
   - Realm Settings → Tokens
   - Set appropriate token lifespans
   - Configure refresh token settings

### Client Configuration

Update client redirect URIs for production:
```
Redirect URIs:
- https://your-app-domain.com/*
- https://your-app-domain.com/api/auth/callback/*

Web Origins:
- https://your-app-domain.com
```

## 🔄 Updating Theme in Production

### Quick Update Process
```bash
# 1. Make changes in keycloak-theme/src
# 2. Build theme
cd keycloak-theme
npm run build-keycloak-theme

# 3. Copy to production server (if separate)
scp dist_keycloak/*.jar user@prod-server:/path/to/EHRConnect/keycloak/themes/

# 4. On production server
ssh user@prod-server
cd /path/to/EHRConnect
docker cp keycloak/themes/*.jar ehrconnect-keycloak-1:/opt/keycloak/providers/
docker exec ehrconnect-keycloak-1 /opt/keycloak/bin/kc.sh build
docker-compose restart keycloak
```

### Zero-Downtime Update
```bash
# 1. Build theme locally
cd keycloak-theme
npm run build-keycloak-theme

# 2. Create new Keycloak image with theme
docker build -t ehrconnect-keycloak:v2 .

# 3. Update docker-compose with new image
# 4. Rolling update
docker-compose up -d --no-deps keycloak
```

## 📊 Monitoring & Health Checks

### Check if Theme is Loaded
```bash
# SSH to production
ssh user@prod-server

# Check theme files exist
docker exec ehrconnect-keycloak-1 ls -la /opt/keycloak/providers/
# Should see: keycloak-theme-for-kc-22-to-25.jar

# Check Keycloak health
curl https://your-keycloak-domain.com/health/ready
```

### View Logs
```bash
# Keycloak logs
docker logs ehrconnect-keycloak-1 --tail 100 -f

# Check for theme errors
docker logs ehrconnect-keycloak-1 2>&1 | grep -i "theme\|error"
```

## 🆘 Troubleshooting Production

### Theme Not Showing
1. Clear browser cache
2. Check realm theme setting (Admin UI)
3. Verify JAR files in container:
   ```bash
   docker exec ehrconnect-keycloak-1 ls /opt/keycloak/providers/
   ```
4. Check Keycloak logs for errors
5. Rebuild Keycloak:
   ```bash
   docker exec ehrconnect-keycloak-1 /opt/keycloak/bin/kc.sh build
   docker-compose restart keycloak
   ```

### Database Connection Issues
```bash
# Check database is running
docker-compose ps postgres

# Check connection
docker exec ehrconnect-postgres-1 psql -U medplum -d keycloak -c "SELECT 1;"
```

### Performance Issues
1. Check resource limits in docker-compose
2. Monitor container resources:
   ```bash
   docker stats
   ```
3. Increase JVM heap if needed:
   ```yaml
   keycloak:
     environment:
       JAVA_OPTS: "-Xms512m -Xmx2048m"
   ```

## 📦 Backup & Restore

### Backup Keycloak Data
```bash
# Backup database
docker exec ehrconnect-postgres-1 pg_dump -U medplum keycloak > keycloak-backup.sql

# Backup theme files
cp -r keycloak/themes/ keycloak-themes-backup/
```

### Restore
```bash
# Restore database
docker exec -i ehrconnect-postgres-1 psql -U medplum keycloak < keycloak-backup.sql

# Restore theme files
cp -r keycloak-themes-backup/* keycloak/themes/
```

## 🔒 Production Security Best Practices

1. **Use Secrets Management**
   - Store passwords in AWS Secrets Manager / Azure Key Vault
   - Use Docker secrets for sensitive data

2. **Enable HTTPS**
   - Use Let's Encrypt for SSL certificates
   - Configure reverse proxy (Nginx/Traefik)

3. **Network Security**
   - Use private networks for database
   - Firewall rules for Keycloak admin
   - Rate limiting on auth endpoints

4. **Regular Updates**
   ```bash
   # Update Keycloak image
   docker pull quay.io/keycloak/keycloak:26.0
   docker-compose up -d
   ```

## 📈 Scaling for Production

### Horizontal Scaling
```yaml
# docker-compose.yml
keycloak:
  deploy:
    replicas: 3
    resources:
      limits:
        cpus: '2'
        memory: 2G
```

### Load Balancer Setup
```nginx
# nginx.conf
upstream keycloak {
    server keycloak1:8080;
    server keycloak2:8080;
    server keycloak3:8080;
}

server {
    listen 443 ssl;
    server_name auth.your-domain.com;
    
    location / {
        proxy_pass http://keycloak;
    }
}
```

## 🧪 Production Testing Checklist

Before going live:

- [ ] Test login flow
- [ ] Test registration
- [ ] Test password reset
- [ ] Test social login (if enabled)
- [ ] Test session management
- [ ] Test logout
- [ ] Verify theme on all browsers
- [ ] Test mobile responsiveness
- [ ] Load test authentication endpoints
- [ ] Verify SSL certificates
- [ ] Test database failover
- [ ] Backup and restore testing

## 📞 Support & Maintenance

### Regular Maintenance Tasks

**Weekly:**
- [ ] Check logs for errors
- [ ] Monitor disk space
- [ ] Check backup status

**Monthly:**
- [ ] Update dependencies
- [ ] Security patches
- [ ] Performance review
- [ ] Database optimization

**Quarterly:**
- [ ] Major version updates
- [ ] Security audit
- [ ] Disaster recovery drill

## 🎯 Quick Production Commands

### Start All Services
```bash
docker-compose up -d
```

### Stop All Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Keycloak only
docker-compose logs -f keycloak
```

### Update Theme
```bash
cd keycloak-theme
npm run build-keycloak-theme
cp dist_keycloak/*.jar ../keycloak/themes/
cd ..
docker cp keycloak/themes/*.jar ehrconnect-keycloak-1:/opt/keycloak/providers/
docker exec ehrconnect-keycloak-1 /opt/keycloak/bin/kc.sh build
docker-compose restart keycloak
```

### Clean Restart
```bash
# Stop everything
docker-compose down

# Remove volumes (CAREFUL - deletes data!)
docker-compose down -v

# Fresh start
docker-compose up -d
```

## 📋 Production Deployment Checklist

### Initial Setup
- [ ] Clone repository
- [ ] Install Node.js 18+
- [ ] Install Docker & Docker Compose
- [ ] Configure environment variables
- [ ] Update docker-compose.yml for production
- [ ] Set up SSL certificates
- [ ] Configure firewall rules

### Theme Deployment
- [ ] Navigate to keycloak-theme directory
- [ ] Run `npm install`
- [ ] Run `npm run build-keycloak-theme`
- [ ] Copy JARs to keycloak/themes/
- [ ] Start Docker services
- [ ] Copy JARs to container
- [ ] Build Keycloak
- [ ] Restart Keycloak
- [ ] Verify theme in browser

### Post-Deployment
- [ ] Configure realm via admin UI
- [ ] Set login theme to "ehrconnect"
- [ ] Configure email settings
- [ ] Set up user roles
- [ ] Configure clients (redirect URIs)
- [ ] Test complete auth flow
- [ ] Set up monitoring
- [ ] Document admin credentials securely

## 🚨 Emergency Procedures

### Rollback Theme
```bash
# Use previous JAR version
docker cp keycloak/themes/backup/old-theme.jar ehrconnect-keycloak-1:/opt/keycloak/providers/
docker exec ehrconnect-keycloak-1 /opt/keycloak/bin/kc.sh build
docker-compose restart keycloak
```

### Service Won't Start
```bash
# Check logs
docker-compose logs keycloak

# Reset database (CAREFUL!)
docker-compose down
docker volume rm ehrconnect_postgres_data
docker-compose up -d
```

### Performance Degradation
```bash
# Check resources
docker stats

# Restart services
docker-compose restart

# Scale up if needed
docker-compose up -d --scale keycloak=3
```

---

## 📞 Contact & Support

For production issues:
- Check documentation in this file
- Review Docker logs
- Check Keycloak admin console
- Monitor system resources

**Remember:** Always test in staging before production deployment!
