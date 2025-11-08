# Keycloak Setup in Dokploy (Separate Service)

## Overview

Since you're running Keycloak as a separate service in Dokploy (not in docker-compose), here's the complete setup guide.

---

## 🎯 Architecture

```
Dokploy Project: ehr-connect-dev
├── PostgreSQL Service (keycloak-postgres-dev)
│   └── Database: keycloak
├── Keycloak Service (ehr-keycloak-dev)
│   └── Image: jitendratech/ehr-keycloak:dev (with theme)
├── PostgreSQL Service (ehr-postgres-dev)
│   └── Database: ehrconnect
└── Application Stack (ehr-api, ehr-web, redis)
```

---

## 📦 Option 1: Use Custom Image (Recommended)

### Step 1: Build Custom Keycloak Image

Your custom image includes your theme and realm export.

1. **Push code to trigger build**:
   ```bash
   git add keycloak/
   git commit -m "Add custom Keycloak with theme"
   git push origin develop
   ```

2. **Wait for GitHub Actions** (~5-7 minutes)
   - Check Actions tab
   - Workflow: "Build and Push Keycloak with Theme"
   - Image will be: `jitendratech/ehr-keycloak:dev`

### Step 2: Create Keycloak Service in Dokploy

1. **Go to Dokploy** → Your Project → Add Service → Application

2. **Configuration**:
   ```
   Name: ehr-keycloak-dev
   Type: Docker Image
   Image: jitendratech/ehr-keycloak:dev
   Port: 8080
   ```

3. **Environment Variables**:
   ```bash
   # Admin Credentials
   KEYCLOAK_ADMIN=admin
   KEYCLOAK_ADMIN_PASSWORD=g7qgoynkydyrs8ojqxlygslvaa4pdzln

   # Database Connection
   KC_DB=postgres
   KC_DB_URL=jdbc:postgresql://keycloak-postgres-dev:5432/keycloak
   KC_DB_USERNAME=keycloakuser
   KC_DB_PASSWORD=je8yde8v1ppksccnsqigt1oh4ccvgbbw

   # Hostname & Proxy
   KC_HOSTNAME=auth-dev.nirmitee.io
   KC_HOSTNAME_STRICT=false
   KC_HOSTNAME_STRICT_HTTPS=false
   KC_PROXY=edge
   KC_HTTP_ENABLED=true

   # Features
   KC_HEALTH_ENABLED=true
   KC_METRICS_ENABLED=true
   KC_LOG_LEVEL=info
   ```

4. **Command** (in Advanced settings):
   ```
   start --import-realm
   ```

5. **Health Check**:
   ```
   Path: /health/ready
   Port: 8080
   Interval: 30s
   ```

6. **Deploy**!

### Step 3: Configure Domain

1. **Domains tab** → Add Domain
2. **Settings**:
   ```
   Domain: auth-dev.nirmitee.io
   Port: 8080
   HTTPS: Enabled
   ```
3. **Generate Certificate**

### Step 4: Verify

```bash
# Test Keycloak
curl https://auth-dev.nirmitee.io/

# Test admin console
https://auth-dev.nirmitee.io/admin
# Login: admin / g7qgoynkydyrs8ojqxlygslvaa4pdzln

# Test your realm
https://auth-dev.nirmitee.io/realms/ehr-realm
```

---

## 📦 Option 2: Use Standard Image with Volumes

If you want to use the standard Keycloak image and mount theme files:

### Create Keycloak Service

1. **Image**: `quay.io/keycloak/keycloak:26.0`

2. **Environment Variables**: (same as above)

3. **Volumes/Mounts** (if Dokploy supports):
   ```
   # Theme files
   Host Path: /path/to/keycloak/themes
   Container Path: /opt/keycloak/providers/

   # Realm export
   Host Path: /path/to/keycloak/realm-export.json
   Container Path: /opt/keycloak/data/import/realm-export.json
   ```

4. **Command**:
   ```
   start --import-realm
   ```

**Note**: This requires your theme files to be on the Dokploy server.

---

## 🔧 Update Application Services

Since Keycloak is now a separate service, update your application stack environment variables:

### In ehr-api and ehr-web environment:

```bash
# Change Keycloak URL to use service name
KEYCLOAK_URL=http://ehr-keycloak-dev:8080

# OR if in different project, use full domain
KEYCLOAK_URL=https://auth-dev.nirmitee.io
```

---

## 🔗 Network Configuration

Ensure services can communicate:

### If in Same Dokploy Project

Services can reach each other by service name:
- `keycloak-postgres-dev:5432`
- `ehr-keycloak-dev:8080`
- `ehr-postgres-dev:5432`

### If in Different Projects

Services need to use public domains:
- `https://auth-dev.nirmitee.io`
- Or configure Docker network bridge

---

## 📝 Complete Environment Variables Reference

### Keycloak Service Environment:

```bash
# === Admin Credentials ===
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=g7qgoynkydyrs8ojqxlygslvaa4pdzln

# === Database ===
KC_DB=postgres
KC_DB_URL=jdbc:postgresql://keycloak-postgres-dev:5432/keycloak
KC_DB_USERNAME=keycloakuser
KC_DB_PASSWORD=je8yde8v1ppksccnsqigt1oh4ccvgbbw

# === Hostname ===
KC_HOSTNAME=auth-dev.nirmitee.io
KC_HOSTNAME_STRICT=false
KC_HOSTNAME_STRICT_HTTPS=false

# === Proxy ===
KC_PROXY=edge
KC_HTTP_ENABLED=true

# === Features ===
KC_HEALTH_ENABLED=true
KC_METRICS_ENABLED=true
KC_LOG_LEVEL=info

# === Optional: Performance ===
KC_CACHE=ispn
KC_CACHE_STACK=kubernetes

# === Optional: Observability ===
KC_METRICS_ENABLED=true
```

### EHR API Environment (update):

```bash
# Internal communication (if same project)
KEYCLOAK_URL=http://ehr-keycloak-dev:8080

# External communication (if different project or for web)
NEXT_PUBLIC_KEYCLOAK_URL=https://auth-dev.nirmitee.io
```

---

## 🎨 Theme Structure

Ensure your theme is in the correct structure:

```
keycloak/
├── Dockerfile
├── realm-export.json
└── themes/
    └── ehr-theme/
        ├── theme.properties
        ├── login/
        │   ├── theme.properties
        │   ├── login.ftl
        │   ├── resources/
        │   │   ├── css/
        │   │   ├── js/
        │   │   └── img/
        └── account/
            └── ...
```

---

## 🔍 Troubleshooting

### Keycloak Can't Connect to Database

**Error**: "Connection refused" or "Unknown host"

**Fix**: Check database service name in `KC_DB_URL`:
```bash
# Should match your PostgreSQL service name in Dokploy
KC_DB_URL=jdbc:postgresql://keycloak-postgres-dev:5432/keycloak
```

### Theme Not Loading

**Check**:
1. Theme files are in correct location: `/opt/keycloak/providers/`
2. Theme is selected in realm settings
3. Restart Keycloak after adding theme

**Fix**:
```bash
# Build custom image with theme
git push origin develop

# Wait for build
# Redeploy Keycloak service in Dokploy
```

### Realm Not Imported

**Check**:
1. `realm-export.json` is in `/opt/keycloak/data/import/`
2. Keycloak started with `--import-realm` flag

**Logs**:
```bash
docker logs ehr-keycloak-dev | grep import
# Should see: "Importing from directory"
```

### Health Check Failing

**Try different paths**:
```bash
curl http://localhost:8080/health/ready
curl http://localhost:8080/health
curl http://localhost:8080/q/health/ready
```

Update health check path in Dokploy accordingly.

---

## 🚀 Quick Commands

```bash
# View Keycloak logs
docker logs ehr-keycloak-dev -f

# Check Keycloak is listening
docker exec -it ehr-keycloak-dev netstat -tlnp | grep 8080

# Test internal connectivity
docker exec -it ehr-api-dev curl http://ehr-keycloak-dev:8080/health

# Access Keycloak CLI
docker exec -it ehr-keycloak-dev /opt/keycloak/bin/kc.sh show-config
```

---

## ✅ Verification Checklist

- [ ] PostgreSQL database created for Keycloak
- [ ] Custom Keycloak image built (with theme)
- [ ] Keycloak service created in Dokploy
- [ ] All environment variables set
- [ ] Domain configured (auth-dev.nirmitee.io)
- [ ] SSL certificate generated
- [ ] Keycloak admin accessible
- [ ] Theme visible in admin console
- [ ] Realm imported successfully
- [ ] API can connect to Keycloak
- [ ] Web can authenticate via Keycloak

---

## 🎉 Success Criteria

1. **Admin Console**: https://auth-dev.nirmitee.io/admin works
2. **Realm**: https://auth-dev.nirmitee.io/realms/ehr-realm returns JSON
3. **Theme Applied**: Login page shows your custom theme
4. **API Integration**: ehr-api can validate tokens
5. **Web Integration**: ehr-web can authenticate users

---

**Need help?** Check logs and ensure all services are in the same Docker network or can reach each other via domains!
