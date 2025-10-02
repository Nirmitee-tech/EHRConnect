# EHRConnect Keycloak Theme - Development Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or 20+
- Docker & Docker Compose
- EHRConnect project running

### Installation
```bash
cd keycloak-theme
npm install
```

## 💻 Development Workflows

### 1. Hot Reloading Development (Recommended)

For rapid UI development with instant feedback:

```bash
npm run dev:keycloak
```

**What this does:**
- Starts Keycloakify development server
- Provides hot reloading for CSS and component changes
- Shows live preview of login pages
- No need to rebuild or restart Keycloak

**Access:** `http://localhost:5173` (or displayed port)

**Perfect for:**
- Tweaking CSS styles
- Adjusting layouts
- Testing responsive design
- Quick iterations

### 2. Automated Deployment

Once you're happy with changes, deploy to your running Keycloak:

```bash
npm run deploy
```

**What this script does:**
1. ✅ Builds the theme
2. 📋 Copies JARs to keycloak folder
3. 🐳 Copies JARs to Docker container
4. 🔨 Builds Keycloak with new themes
5. 🔄 Restarts Keycloak
6. ⏳ Waits for Keycloak to be ready

**Time:** ~1-2 minutes

### 3. Manual Development (If needed)

**Step 1: Build Theme**
```bash
npm run build-keycloak-theme
```

**Step 2: Deploy to Keycloak**
```bash
# Copy JARs to keycloak folder
cp dist_keycloak/*.jar ../keycloak/themes/

# Copy to container
docker cp ../keycloak/themes/keycloak-theme-for-kc-22-to-25.jar ehrconnect-keycloak-1:/opt/keycloak/providers/
docker cp ../keycloak/themes/keycloak-theme-for-kc-all-other-versions.jar ehrconnect-keycloak-1:/opt/keycloak/providers/

# Build Keycloak
docker exec ehrconnect-keycloak-1 /opt/keycloak/bin/kc.sh build

# Restart
cd .. && docker-compose restart keycloak
```

## 📁 Project Structure

```
keycloak-theme/
├── src/
│   └── login/
│       ├── KcPage.tsx       # Main login page component
│       ├── styles.css       # Custom theme styles
│       ├── KcContext.ts     # Keycloak context
│       └── i18n.ts          # Internationalization
├── public/                  # Static assets
├── dist/                    # Built React app
├── dist_keycloak/          # Built Keycloak theme JARs
├── deploy-theme.sh         # Automated deployment script
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🎨 Customization Guide

### Updating Colors

Edit `src/login/styles.css`:

```css
:root {
  --ehr-primary: #4A90E2;        /* Main brand color */
  --ehr-primary-hover: #357ABD;  /* Hover state */
  --ehr-background: linear-gradient(...); /* Background gradient */
  --ehr-card: #FFFFFF;           /* Card background */
  /* ... more colors */
}
```

### Modifying Components

Edit `src/login/KcPage.tsx`:

```tsx
// Add custom logic or components here
export default function KcPage({ kcContext }: { kcContext: KcContext }) {
  // Your customizations
}
```

### Adding Custom Pages

Keycloakify supports customizing these pages:
- Login
- Register
- Forgot Password
- Update Password
- Verify Email
- Terms & Conditions
- And more!

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run dev:keycloak` | **Hot reloading for theme development** |
| `npm run build` | Build React app |
| `npm run build-keycloak-theme` | Build Keycloak theme JARs |
| `npm run deploy` | **Automated deployment to Keycloak** |
| `npm run storybook` | Start Storybook for component development |
| `npm run format` | Format code with Prettier |

## 🧪 Testing

### 1. Development Testing (Hot Reload)
```bash
npm run dev:keycloak
```
- Test all pages in the browser
- See changes instantly
- No Docker needed

### 2. Keycloak Integration Testing
```bash
# Deploy theme
npm run deploy

# Wait for Keycloak to restart (~30 seconds)

# Test in your app
# Visit: http://localhost:3000
# Click "Sign In"
```

### 3. Test Different Pages

**Login Page:**
- http://localhost:8080/realms/ehr-realm/protocol/openid-connect/auth?client_id=nextjs-client&redirect_uri=http://localhost:3000&response_type=code

**Register Page:**
- http://localhost:8080/realms/ehr-realm/protocol/openid-connect/registrations?client_id=nextjs-client&redirect_uri=http://localhost:3000

## 🐛 Troubleshooting

### Theme not appearing

**1. Check Keycloak is using correct version**
```bash
docker exec ehrconnect-keycloak-1 /opt/keycloak/bin/kc.sh --version
# Should be 26.0 or higher
```

**2. Check theme is loaded**
```bash
docker exec ehrconnect-keycloak-1 ls -la /opt/keycloak/providers/
# Should see: keycloak-theme-for-kc-22-to-25.jar
```

**3. Verify realm configuration**
- Go to http://localhost:8080
- Login as admin / admin123
- Select "ehr-realm"
- Realm Settings → Themes
- Login Theme should be "ehrconnect"

**4. Clear browser cache**
- Hard refresh: Cmd/Ctrl + Shift + R
- Or open in incognito/private mode

### Hot reload not working

```bash
# Stop any running dev servers
# Make sure port 5173 is free
lsof -ti:5173 | xargs kill

# Start dev server
npm run dev:keycloak
```

### Build errors

```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build-keycloak-theme
```

## 📚 Learn More

### Keycloakify Documentation
- [Official Docs](https://docs.keycloakify.dev)
- [GitHub](https://github.com/keycloakify/keycloakify)

### Keycloak Themes
- [Keycloak Theme Guide](https://www.keycloak.org/docs/latest/server_development/#_themes)
- [Theme API](https://www.keycloak.org/docs/latest/server_development/index.html#theme-types)

## 🎯 Best Practices

1. **Use Hot Reload for Development**
   - Faster iteration
   - Instant feedback
   - No Docker restarts needed

2. **Test in Real Keycloak Before Committing**
   - Run `npm run deploy`
   - Test in actual auth flow
   - Verify all pages work

3. **Keep Styles Organized**
   - Use CSS variables for colors
   - Group related styles together
   - Comment complex sections

4. **Version Control**
   - Commit frequently
   - Test after each major change
   - Keep deployment script updated

## 🚢 Deployment Checklist

Before deploying to production:

- [ ] Test all authentication flows
- [ ] Verify responsive design (mobile, tablet, desktop)
- [ ] Check all form validations
- [ ] Test error states
- [ ] Verify accessibility
- [ ] Check browser compatibility
- [ ] Test with real Keycloak realm
- [ ] Verify theme loads correctly
- [ ] Test logout flow
- [ ] Check forgot password flow

## 💡 Tips & Tricks

### Quick CSS Changes
```bash
# Edit src/login/styles.css
# Run hot reload to see changes
npm run dev:keycloak
```

### Adding a Logo
1. Add logo image to `public/` folder
2. Reference in CSS or KcPage.tsx
3. Deploy with `npm run deploy`

### Custom Fonts
Add to `src/login/styles.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

### Environment-Specific Themes
- Development: Use hot reload
- Staging: Manual testing with `npm run deploy`
- Production: Automated CI/CD pipeline

## 🤝 Contributing

When contributing theme changes:

1. Create a feature branch
2. Make changes using hot reload
3. Test with `npm run deploy`
4. Commit with descriptive messages
5. Create pull request

## 📞 Support

For issues or questions:
- Check TROUBLESHOOTING section above
- Review Keycloakify docs
- Check Keycloak 26+ compatibility
- Review EHRConnect documentation

---

Happy theming! 🎨
