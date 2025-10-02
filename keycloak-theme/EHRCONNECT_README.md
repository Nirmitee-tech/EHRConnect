# EHRConnect Custom Keycloak Theme

This is a custom Keycloak theme for EHRConnect, built with Keycloakify. It provides a modern, healthcare-focused authentication experience that matches the EHRConnect design system.

## Features

- ✨ Custom login and signup pages matching EHRConnect branding
- 🎨 Professional healthcare color palette (#4F7CFF primary blue)
- 📱 Fully responsive design
- ♿ Accessible form controls and navigation
- 🔒 Secure authentication with Keycloak
- 🚀 Built with React and TypeScript
- 📦 Ready to deploy to Keycloak

## Design System

The theme uses the EHRConnect design system with the following colors:

```css
--ehr-primary: #4F7CFF          /* Primary blue */
--ehr-background: #F5F6F8       /* Background gray */
--ehr-card: #FFFFFF             /* Card white */
--ehr-border: #E5E7EB           /* Border gray */
--ehr-text-primary: #1F2937     /* Primary text */
--ehr-text-secondary: #6B7280   /* Secondary text */
```

## Prerequisites

- Node.js 18+ and npm/yarn
- Docker (for local Keycloak testing)
- Basic knowledge of React and Keycloak

## Installation

The theme is already installed. If you need to reinstall dependencies:

```bash
npm install
```

## Development

### Testing in Storybook

Storybook allows you to preview and test your theme pages without running a Keycloak instance:

1. **Start Storybook:**

```bash
npm run storybook
```

2. **Add stories for specific pages:**

```bash
# Add a story for a specific page
npx keycloakify add-story

# Select the page you want to test (e.g., login.ftl, register.ftl)
```

3. **View pages at:** `http://localhost:6006`

### Testing with Local Keycloak

To test the theme in an actual Keycloak instance:

1. **Build the theme:**

```bash
npm run build-keycloak-theme
```

This creates a JAR file in `dist_keycloak/`.

2. **Start Keycloak with Docker:**

```bash
# From the project root (EHRConnect)
docker-compose up -d keycloak
```

3. **Deploy the theme:**

Copy the JAR file to Keycloak's providers directory:

```bash
# Copy the JAR from dist_keycloak/ to Keycloak container
docker cp dist_keycloak/keycloak-theme-for-kc*.jar keycloak:/opt/keycloak/providers/

# Restart Keycloak to load the theme
docker restart keycloak
```

4. **Configure Keycloak to use the theme:**

- Log in to Keycloak Admin Console: `http://localhost:8080`
- Go to your realm settings
- Under "Themes" tab, select "ehrconnect" for Login theme
- Save changes

5. **Test the login page:**

Navigate to: `http://localhost:8080/realms/{your-realm}/account`

## Building for Production

To build the theme for production deployment:

```bash
npm run build-keycloak-theme
```

The output JAR file will be in `dist_keycloak/` directory.

## Deployment to Production Keycloak

### Option 1: Manual Deployment

1. Build the theme JAR
2. Copy to Keycloak's `providers` directory:
   ```bash
   cp dist_keycloak/keycloak-theme-for-kc*.jar /path/to/keycloak/providers/
   ```
3. Restart Keycloak
4. Configure the realm to use the theme

### Option 2: Docker Deployment

Add to your Keycloak Dockerfile:

```dockerfile
FROM quay.io/keycloak/keycloak:latest

# Copy custom theme
COPY dist_keycloak/keycloak-theme-for-kc-*.jar /opt/keycloak/providers/

# Build Keycloak
RUN /opt/keycloak/bin/kc.sh build

ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
```

### Option 3: Kubernetes/Helm

Add the theme JAR as a config map or init container that copies it to the providers directory.

## Customization

### Changing Colors

Edit `src/login/styles.css` and modify the CSS variables:

```css
:root {
  --ehr-primary: #4F7CFF;          /* Your primary color */
  --ehr-background: #F5F6F8;       /* Background color */
  /* ... more variables */
}
```

### Adding a Custom Logo

1. Add your logo to `public/` directory
2. Update `vite.config.ts` to reference it
3. The logo will appear in the theme automatically

### Customizing Specific Pages

To customize a specific page (e.g., login, register):

1. Create a custom component in `src/login/pages/`
2. Import it in `KcPage.tsx`
3. Add it to the switch statement:

```typescript
switch (kcContext.pageId) {
    case "login.ftl":
        return <CustomLogin kcContext={kcContext} i18n={i18n} />;
    case "register.ftl":
        return <CustomRegister kcContext={kcContext} i18n={i18n} />;
    default:
        return <DefaultPage ... />;
}
```

### Adding Custom Translations

Edit `src/login/i18n.ts` to add or modify translations:

```typescript
export const { useI18n } = createUseI18n({
    en: {
        // Add your custom messages
        "custom.message": "Your custom message"
    }
});
```

## Available Pages

The theme supports all standard Keycloak pages:

- ✅ Login (`login.ftl`)
- ✅ Registration (`register.ftl`)
- ✅ Forgot Password (`login-reset-password.ftl`)
- ✅ Update Password (`login-update-password.ftl`)
- ✅ Verify Email (`login-verify-email.ftl`)
- ✅ Terms and Conditions (`terms.ftl`)
- ✅ Update Profile (`login-update-profile.ftl`)
- ✅ OTP (`login-otp.ftl`)
- ✅ And more...

## Configuration

The theme is configured in `vite.config.ts`:

```typescript
keycloakify({
    accountThemeImplementation: "none",  // Focus on login theme only
    themeName: "ehrconnect",             // Theme name in Keycloak
})
```

## Environment Variables

You can use environment variables in your theme:

```typescript
// In vite.config.ts
keycloakify({
    environmentVariables: [
        "MY_ENV_VAR"
    ]
})

// Access in components
const myVar = import.meta.env.MY_ENV_VAR;
```

## Integration with EHRConnect

This theme is designed to work with the main EHRConnect application located in `../ehr-web/`. The authentication flow:

1. User visits EHRConnect app
2. NextAuth redirects to Keycloak (with this theme)
3. User logs in/registers
4. Keycloak redirects back to EHRConnect with tokens
5. NextAuth creates session

Make sure your Keycloak realm is configured with the EHRConnect client settings.

## Troubleshooting

### Theme not showing in Keycloak

1. Check that the JAR is in `/opt/keycloak/providers/`
2. Restart Keycloak
3. Verify the theme name matches in realm settings

### Build errors

```bash
# Clean and rebuild
rm -rf node_modules dist_keycloak
npm install
npm run build-keycloak-theme
```

### Storybook not starting

```bash
# Try clearing Storybook cache
npx storybook@latest clear-cache
npm run storybook
```

### Styles not applying

1. Make sure `styles.css` is imported in `KcPage.tsx`
2. Check browser DevTools for CSS loading errors
3. Clear browser cache

## Resources

- [Keycloakify Documentation](https://docs.keycloakify.dev/)
- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Keycloakify GitHub](https://github.com/keycloakify/keycloakify)
- [Keycloakify Discord](https://discord.gg/kYFZG7fQmn)

## Support

For issues specific to this theme:
1. Check the main EHRConnect repository issues
2. Review Keycloakify documentation
3. Ask in the Keycloakify Discord community

## License

This theme follows the EHRConnect project license.

## Contributing

When contributing to this theme:

1. Test changes in Storybook first
2. Test in local Keycloak instance
3. Ensure responsive design works
4. Follow the EHRConnect design system
5. Update this README if adding new features

---

Built with ❤️ for EHRConnect using Keycloakify
