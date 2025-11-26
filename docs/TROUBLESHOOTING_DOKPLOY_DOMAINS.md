# Troubleshooting Dokploy Domain Issues

## Issue: 404 on Domain but Container Running

If containers are running but domains return 404, follow these steps:

---

## Step 1: Test Direct Container Access

First, verify the service works internally:

```bash
# SSH into your Dokploy server
ssh your-server

# Test Keycloak directly (use your actual container ID)
docker exec -it 29c20bfab662 curl http://localhost:8080/
# Should return HTML (Keycloak homepage)

# Test the health endpoint
docker exec -it 29c20bfab662 curl http://localhost:8080/health
# If 404, try:
docker exec -it 29c20bfab662 curl http://localhost:8080/q/health
docker exec -it 29c20bfab662 curl http://localhost:8080/health/ready
```

---

## Step 2: Check Service is Exposed

In Docker Compose, services need to expose ports to Dokploy's proxy:

### Check Current Compose File

Look at your `docker-compose.dokploy-dev.yml` - does Keycloak have ports exposed?

**Current issue**: The Dokploy compose file might not be exposing ports!

### Fix: Add Port Exposure

The services need to expose their ports for Traefik to route to them.

**Option A: Add ports in compose file**

Update `docker-compose.dokploy-dev.yml`:

```yaml
keycloak:
  image: quay.io/keycloak/keycloak:26.0
  container_name: ehr-keycloak-dev
  ports:
    - "8080:8080"  # Add this line!
  environment:
    # ... rest of config
```

**Option B: Use labels for Traefik (Dokploy method)**

```yaml
keycloak:
  image: quay.io/keycloak/keycloak:26.0
  container_name: ehr-keycloak-dev
  labels:
    - "traefik.enable=true"
    - "traefik.http.routers.keycloak.rule=Host(`auth-dev.nirmitee.io`)"
    - "traefik.http.services.keycloak.loadbalancer.server.port=8080"
  environment:
    # ... rest of config
```

---

## Step 3: DNS Configuration

Verify DNS is pointing to your server:

```bash
# From your local machine
nslookup auth-dev.nirmitee.io
# Should return: Your Dokploy server IP

# Or use dig
dig auth-dev.nirmitee.io
```

**If DNS doesn't resolve:**

1. Go to your domain registrar (where you manage nirmitee.io)
2. Add A records:
   ```
   auth-dev.nirmitee.io    A    <your-dokploy-server-ip>
   api-dev.nirmitee.io     A    <your-dokploy-server-ip>
   ehr-dev.nirmitee.io     A    <your-dokploy-server-ip>
   ```
3. Wait 5-10 minutes for DNS propagation

---

## Step 4: Configure Domain in Dokploy UI

1. **Access Dokploy** → Your Project → Services

2. **For Keycloak Service**:
   - Click on "ehr-keycloak-dev" or your Keycloak service
   - Go to "Domains" tab
   - Click "Add Domain"
   - Fill in:
     ```
     Domain: auth-dev.nirmitee.io
     Port: 8080
     Path Prefix: /
     HTTPS: Enable
     ```
   - Click "Save"
   - Click "Generate Certificate" (for SSL)

3. **Repeat for other services**:
   - **ehr-api**: `api-dev.nirmitee.io` → Port 8000
   - **ehr-web**: `ehr-dev.nirmitee.io` → Port 3000

---

## Step 5: Check Traefik Logs

Dokploy uses Traefik as reverse proxy. Check if it's routing correctly:

```bash
# Find Traefik container
docker ps | grep traefik

# View logs
docker logs dokploy-traefik -f --tail 100

# Or if different name:
docker logs $(docker ps | grep traefik | awk '{print $1}') -f
```

Look for errors like:
- "backend not found"
- "service not found"
- "no router found"

---

## Step 6: Temporary Port Forwarding Test

If domains still don't work, test with direct port access:

```bash
# Open port 8080 temporarily
# In docker-compose.dokploy-dev.yml, ensure ports are exposed:

keycloak:
  ports:
    - "8080:8080"
```

Then test:
```bash
# From your local machine
curl http://<dokploy-server-ip>:8080/
```

If this works, the issue is with domain routing (DNS or Traefik).

---

## Step 7: Check Network Configuration

Ensure containers are on the same network:

```bash
# Check networks
docker network ls

# Inspect the network your services use
docker network inspect ehr-network

# Should show all containers (keycloak, ehr-api, ehr-web, redis)
```

---

## Common Issues & Solutions

### Issue: "502 Bad Gateway"
**Cause**: Service is running but proxy can't reach it
**Fix**:
- Check container is on correct network
- Verify port is correct
- Check service name resolution

### Issue: "404 Not Found"
**Cause**: Domain not configured or routing rule missing
**Fix**:
- Configure domain in Dokploy UI
- Or add Traefik labels to compose file
- Verify DNS points to server

### Issue: "SSL Certificate Error"
**Cause**: Certificate not generated
**Fix**:
- In Dokploy, click "Generate Certificate"
- Wait 1-2 minutes
- Ensure port 80 and 443 are open on server

### Issue: "Connection Refused"
**Cause**: Service not running or wrong port
**Fix**:
- Check service is running: `docker ps`
- Verify port in compose file matches service

---

## Quick Fix Checklist

Try these in order:

1. **Test container internally**: ✅ Works? → Continue
2. **Check DNS**: A record pointing to server? → Add if missing
3. **Configure domain in Dokploy**: Added in UI? → Add it
4. **Generate SSL certificate**: Certificate valid? → Regenerate
5. **Check Traefik logs**: Errors? → Fix routing
6. **Restart services**: Sometimes needed after domain config

---

## Alternative: Use Dokploy's Built-in Domain

If custom domains aren't working, use Dokploy's provided domain temporarily:

1. In Dokploy, services get auto-generated domains like:
   ```
   <service-name>.<project-name>.<dokploy-domain>
   ```

2. Check if these work first to isolate DNS vs routing issues

---

## Verification Commands

After fixing, verify everything works:

```bash
# Test Keycloak
curl -I https://auth-dev.nirmitee.io/
# Should return: HTTP/2 200 or 302

# Test API
curl https://api-dev.nirmitee.io/health
# Should return: {"status":"ok",...}

# Test Web
curl -I https://ehr-dev.nirmitee.io/
# Should return: HTTP/2 200

# Test Keycloak Admin
curl -I https://auth-dev.nirmitee.io/admin/
# Should return: HTTP/2 200 or 302
```

---

## Need More Help?

Share these outputs:

1. `docker ps` - Show all running containers
2. `docker logs 29c20bfab662 --tail 50` - Keycloak logs
3. `docker logs dokploy-traefik --tail 50` - Traefik logs
4. Screenshot of Dokploy Domains configuration
5. `nslookup auth-dev.nirmitee.io` - DNS check
