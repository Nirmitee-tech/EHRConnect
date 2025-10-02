# EHRConnect Keycloak Theme Integration Guide

This guide explains how to integrate the custom Keycloak theme with your EHRConnect application.

## Quick Start

### Step 1: Build the Theme

```bash
cd keycloak-theme
npm run build-keycloak-theme
```

This creates a JAR file in `dist_keycloak/keycloak-theme-for-kc-*.jar`

### Step 2: Deploy to Keycloak

#### Option A: Using Docker Compose (Recommended for Development)

If you're using the docker-compose.yml in the project root:

```bash
# From project root
cd ..

# Copy theme to a location Docker can access
mkdir -p keycloak/themes
cp keycloak-theme/dist_keycloak/keycloak-theme-for-kc-*.jar keycloak/themes/

# Update docker-compose.yml to mount the theme
```

Add to your `docker-compose.yml` under the keycloak service:

```yaml
services:
  keycloak:
    # ... existing config
    volumes:
      - ./keycloak/themes:/opt/keycloak/providers/
    # ... rest of config
```

Then restart Keycloak:

```bash
docker-compose restart keycloak
```

#### Option B: Manual Deployment to Running Keycloak

```bash
# Copy JAR to running container
docker cp keycloak-theme/dist_keycloak/keycloak-theme-for-kc-*.jar keycloak:/opt/keycloak/providers/

# Restart Keycloak
docker restart keycloak
```

### Step 3: Configure Keycloak Realm

1. **Access Keycloak Admin Console:**
   - URL: `http://localhost:8080`
   - Default credentials from docker-compose.yml

2. **Select Your Realm:**
   - Click on the realm dropdown (top left)
   - Select your EHRConnect realm

3. **Configure Theme:**
   - Go to "Realm Settings"
   - Click on "Themes" tab
   - Under "Login theme", select `ehrconnect`
   - Click "Save"

4. **Verify:**
   - Go to `http://localhost:8080/realms/{your-realm}/account`
   - You should see the custom EHRConnect theme

### Step 4: Update NextAuth Configuration

Ensure your `ehr-web/src/lib/auth.ts` is correctly configured:

```typescript
export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}`,
    }),
  ],
  // ... rest of config
}
```

### Step 5: Test the Authentication Flow

1. **Start EHR Web Application:**
   ```bash
   cd ehr-web
   npm run dev
   ```

2. **Test Login:**
   - Navigate to `http://localhost:3000`
   - Click "Sign In"
   - You should be redirected to the custom Keycloak login page
   - Complete login
   - You should be redirected back to the app

## Environment Variables

Ensure these environment variables are set in `ehr-web/.env.local`:

```env
# Keycloak Configuration
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=ehrconnect
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=ehrconnect-client
KEYCLOAK_CLIENT_SECRET=your-client-secret-here
```

## Customizing the Theme for Your Organization

### 1. Add Your Logo

```bash
# Add your logo to the theme
cp /path/to/your/logo.png keycloak-theme/public/logo.png
```

Then update `keycloak-theme/vite.config.ts`:

```typescript
keycloakify({
  themeName: "ehrconnect",
  // ... other options
})
```

### 2. Customize Colors

Edit `keycloak-theme/src/login/styles.css`:

```css
:root {
  --ehr-primary: #YOUR_COLOR;  /* Change primary color */
  /* ... other colors */
}
```

### 3. Add Custom Text/Branding

Edit `keycloak-theme/src/login/i18n.ts` to add custom messages.

### 4. Rebuild and Redeploy

```bash
cd keycloak-theme
npm run build-keycloak-theme
# Then redeploy using steps above
```

## Production Deployment

### Option 1: Build into Docker Image

Create a `keycloak/Dockerfile`:

```dockerfile
FROM quay.io/keycloak/keycloak:26.2.0

# Copy custom theme
COPY ../keycloak-theme/dist_keycloak/keycloak-theme-for-kc-*.jar /opt/keycloak/providers/

# Build Keycloak with the theme
RUN /opt/keycloak/bin/kc.sh build

# Set environment variables
ENV KC_DB=postgres
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
```

Build and deploy:

```bash
docker build -t ehrconnect-keycloak:latest keycloak/
docker push your-registry/ehrconnect-keycloak:latest
```

### Option 2: Kubernetes Deployment

Create a ConfigMap with the theme:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: keycloak-theme
  namespace: ehrconnect
binaryData:
  keycloak-theme.jar: |
    # Base64 encoded JAR content
```

Mount it in your Keycloak deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: keycloak
spec:
  template:
    spec:
      containers:
      - name: keycloak
        image: quay.io/keycloak/keycloak:26.2.0
        volumeMounts:
        - name: theme
          mountPath: /opt/keycloak/providers/keycloak-theme.jar
          subPath: keycloak-theme.jar
      volumes:
      - name: theme
        configMap:
          name: keycloak-theme
```

### Option 3: Helm Chart

Add to your `values.yaml`:

```yaml
keycloak:
  extraVolumes: |
    - name: theme
      configMap:
        name: keycloak-theme
  extraVolumeMounts: |
    - name: theme
      mountPath: /opt/keycloak/providers/keycloak-theme.jar
      subPath: keycloak-theme.jar
```

## Continuous Integration

### GitHub Actions Example

Create `.github/workflows/build-keycloak-theme.yml`:

```yaml
name: Build Keycloak Theme

on:
  push:
    paths:
      - 'keycloak-theme/**'
  pull_request:
    paths:
      - 'keycloak-theme/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        working-directory: keycloak-theme
        run: npm ci
        
      - name: Build theme
        working-directory: keycloak-theme
        run: npm run build-keycloak-theme
        
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: keycloak-theme
          path: keycloak-theme/dist_keycloak/*.jar
```

## Troubleshooting

### Theme Not Showing

1. **Check Keycloak logs:**
   ```bash
   docker logs keycloak
   ```

2. **Verify JAR is in providers:**
   ```bash
   docker exec keycloak ls -la /opt/keycloak/providers/
   ```

3. **Check theme name in realm settings** matches "ehrconnect"

### Styles Not Applying

1. **Clear browser cache** and reload
2. **Check browser DevTools** for CSS loading errors
3. **Verify styles.css is imported** in KcPage.tsx

### Build Errors

```bash
cd keycloak-theme
rm -rf node_modules dist dist_keycloak
npm install
npm run build-keycloak-theme
```

### Docker Volume Issues

If using Docker volumes, ensure permissions are correct:

```bash
chmod 644 keycloak/themes/*.jar
```

## Development Workflow

1. **Make changes to theme:**
   ```bash
   cd keycloak-theme
   # Edit files in src/login/
   ```

2. **Test in Storybook:**
   ```bash
   npm run storybook
   ```

3. **Build and deploy:**
   ```bash
   npm run build-keycloak-theme
   docker cp dist_keycloak/*.jar keycloak:/opt/keycloak/providers/
   docker restart keycloak
   ```

4. **Test in browser:**
   - Clear browser cache
   - Navigate to Keycloak login
   - Verify changes

## Additional Resources

- [Keycloakify Documentation](https://docs.keycloakify.dev/)
- [Keycloak Themes Guide](https://www.keycloak.org/docs/latest/server_development/#_themes)
- [EHRConnect Main README](../README.md)

## Support

For integration issues:
1. Check this guide thoroughly
2. Review Keycloak and Keycloakify documentation
3. Check EHRConnect project issues
4. Ask in project Discord/Slack

---

Last Updated: February 2025
