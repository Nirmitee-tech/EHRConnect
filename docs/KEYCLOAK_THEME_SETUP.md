# 🎨 Keycloak Custom Theme - Automatic Setup Guide

This guide explains how the EHRConnect custom Keycloak theme is **automatically configured** without manual intervention.

## ✨ What's Been Set Up

1. **Custom Theme Created** (`keycloak-theme/`)
   - Modern React-based theme using Keycloakify
   - Matches EHRConnect's design system (#4F7CFF blue, professional healthcare styling)
   - Fully responsive and accessible

2. **Automatic Configuration**
   - ✅ Realm export updated with `"loginTheme": "ehrconnect"`
   - ✅ Docker-compose configured to mount theme automatically
   - ✅ Setup script created for one-command deployment

## 🚀 Quick Start (3 Steps)

### Step 1: Build the Theme

```bash
./setup-keycloak-theme.sh
```

This script will:
- Build the theme JAR file (requires Maven - now installed!)
- Copy it to `keycloak/themes/`
- Confirm docker-compose is configured

### Step 2: Start/Restart Keycloak

```bash
docker-compose up -d keycloak
```

Or if already running:

```bash
docker-compose restart keycloak
```

### Step 3: Test It!

Visit: http://localhost:8080/realms/ehr-realm/account

**The custom theme is automatically applied!** No manual configuration needed.

## 🔄 How It Works

### Automatic Theme Loading

1. **Realm Configuration**
   - `keycloak/realm-export.json` contains `"loginTheme": "ehrconnect"`
   - Keycloak automatically imports this on startup with `--import-realm` flag

2. **Theme Mounting**
   - `docker-compose.yml` mounts `./keycloak/themes/` to `/opt/keycloak/providers/`
   - Keycloak automatically detects and loads the theme JAR

3. **No Manual Steps Required**
   - Theme is applied immediately on first startup
   - No need to access Admin Console
   - No manual realm configuration

## 📁 Project Structure

```
EHRConnect/
├── keycloak-theme/              # Custom theme source
│   ├── src/login/
│   │   ├── KcPage.tsx          # Main theme component
│   │   ├── styles.css          # EHR design system styles
│   │   └── i18n.ts             # Translations
│   ├── package.json
│   └── vite.config.ts
│
├── keycloak/
│   ├── realm-export.json       # ✅ Configured with "loginTheme": "ehrconnect"
│   └── themes/                 # Theme JARs automatically mounted
│
├── docker-compose.yml          # ✅ Volume mount configured
└── setup-keycloak-theme.sh     # ✅ One-command setup script
```

## 🎨 Design System

The theme uses EHRConnect's professional healthcare design:

```css
Primary Color:     #4F7CFF  (Healthcare Blue)
Background:        #F5F6F8  (Soft Gray)
Cards:             #FFFFFF  (Clean White)
Borders:           #E5E7EB  (Subtle Gray)
Text Primary:      #1F2937  (Dark Gray)
Text Secondary:    #6B7280  (Medium Gray)
```

- Professional form styling
- Smooth animations
- Responsive design
- Accessible controls

## 🔧 Customization (Optional)

### Change Colors

Edit `keycloak-theme/src/login/styles.css`:

```css
:root {
  --ehr-primary: #YOUR_COLOR;
  /* ... other colors */
}
```

Then rebuild:

```bash
cd keycloak-theme
npm run build-keycloak-theme
cd ..
docker-compose restart keycloak
```

### Add Your Logo

1. Add logo to `keycloak-theme/public/logo.png`
2. Rebuild and restart

### Test Changes in Storybook

```bash
cd keycloak-theme
npm run storybook
```

Preview at: http://localhost:6006

## 🐛 Troubleshooting

### Theme Not Showing?

```bash
# Check if JAR exists
ls -la keycloak/themes/

# Check Keycloak logs
docker logs keycloak

# Verify realm settings (should show loginTheme: "ehrconnect")
docker exec keycloak cat /opt/keycloak/data/import/realm-export.json | grep loginTheme
```

### Rebuild Theme

```bash
cd keycloak-theme
rm -rf dist dist_keycloak
npm run build-keycloak-theme
cd ..
docker-compose restart keycloak
```

### Reset Everything

```bash
docker-compose down -v
./setup-keycloak-theme.sh
docker-compose up -d
```

## 📚 Full Documentation

- **Theme Development**: `keycloak-theme/EHRCONNECT_README.md`
- **Integration Guide**: `keycloak-theme/INTEGRATION_GUIDE.md`
- **Keycloakify Docs**: https://docs.keycloakify.dev

## 🎯 What's Next?

1. ✅ Theme is automatically configured
2. ✅ Docker-compose mounts it
3. ✅ Realm uses it by default

You can now:
- Start building your EHR application
- Customize the theme further if needed
- Deploy to production with the same setup

## 🚢 Production Deployment

For production, build the theme into your Keycloak Docker image:

```dockerfile
FROM quay.io/keycloak/keycloak:23.0

# Copy theme
COPY keycloak/themes/*.jar /opt/keycloak/providers/

# Build Keycloak with theme
RUN /opt/keycloak/bin/kc.sh build

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
```

## ✨ Summary

The custom Keycloak theme is **fully automated**:

- ✅ No manual Admin Console configuration
- ✅ Theme applies automatically on startup
- ✅ One command setup: `./setup-keycloak-theme.sh`
- ✅ Matches EHRConnect design perfectly
- ✅ Production-ready

Just run the setup script and start Keycloak - the theme works immediately!

---

**Questions?** Check the full documentation in `keycloak-theme/` directory.
