# Theme Builder Feature

## Overview
The Theme Builder feature allows organizations to customize the appearance of their EHR Connect instance by configuring colors, fonts, and branding elements like logos.

## Features

### 1. Customizable Colors
- **Primary Color**: Main brand color used for buttons and highlights
- **Secondary Color**: Complementary color for secondary actions
- **Accent Color**: Used for status indicators and badges
- **Sidebar Background**: Navigation sidebar background color
- **Sidebar Text**: Text color for sidebar menu items
- **Active Item Color**: Background color for active/selected menu items

### 2. Typography
- Select from pre-defined font families (Inter, Roboto, Open Sans, Lato, Poppins, Montserrat)
- Font applied globally across the application

### 3. Logo Upload
- Upload organization logo (PNG, JPG, SVG)
- Logo appears in sidebar
- Recommended: Square image, at least 200x200px

### 4. Live Preview
- Real-time preview of theme changes
- See how colors and logo will appear in sidebar
- Preview buttons and UI elements with custom colors

## Usage

### Accessing Theme Settings
1. Navigate to **Settings** from the main menu
2. Click on **Appearance** card
3. You'll be redirected to `/settings/appearance`

### Customizing Colors
1. Click on the color picker for any color field
2. Choose a color from the picker or enter a hex code
3. Changes appear in the live preview immediately
4. Click **Save Changes** to apply

### Uploading Logo
1. Click **Upload Logo** button
2. Select an image file from your computer
3. Preview appears immediately
4. Click **Save Changes** to apply

### Resetting Theme
1. Click **Reset to Default** button
2. Confirm the action
3. Theme reverts to default EHR Connect colors

## Technical Implementation

### Backend

#### Database Schema
```sql
-- organizations table has theme_settings column
theme_settings JSONB DEFAULT '{
  "primaryColor": "#4A90E2",
  "secondaryColor": "#9B59B6",
  "sidebarBackgroundColor": "#0F1E56",
  "sidebarTextColor": "#B0B7D0",
  "sidebarActiveColor": "#3342A5",
  "accentColor": "#10B981",
  "fontFamily": "Inter, sans-serif",
  "logoUrl": null,
  "faviconUrl": null
}'
```

#### API Endpoints

**GET /api/orgs/:orgId/theme**
- Retrieve organization theme settings
- Returns theme object

**PUT /api/orgs/:orgId/theme**
- Update organization theme settings
- Body: Partial theme settings object
- Validates color formats (hex codes)

**POST /api/orgs/:orgId/theme/logo**
- Upload organization logo
- Body: { logoUrl: "data:image/png;base64,..." }

### Frontend

#### Theme Context
```typescript
// src/contexts/theme-context.tsx
const { themeSettings, updateTheme, resetTheme, isLoading, error } = useTheme();
```

#### Using Theme in Components
```tsx
import { useTheme } from '@/contexts/theme-context';

function MyComponent() {
  const { themeSettings } = useTheme();
  
  return (
    <div style={{ backgroundColor: themeSettings.primaryColor }}>
      Custom themed content
    </div>
  );
}
```

#### CSS Variables
Theme colors are automatically applied as CSS variables:
```css
:root {
  --theme-primary: #4A90E2;
  --theme-secondary: #9B59B6;
  --theme-sidebar-bg: #0F1E56;
  --theme-sidebar-text: #B0B7D0;
  --theme-sidebar-active: #3342A5;
  --theme-accent: #10B981;
  --theme-font-family: 'Inter', sans-serif;
}
```

Use in CSS:
```css
.my-element {
  background-color: var(--theme-primary);
  color: var(--theme-sidebar-text);
  font-family: var(--theme-font-family);
}
```

#### Themed Components
```tsx
import { ThemedButton, ThemedBadge } from '@/components/ui/themed-components';

// Primary button with theme color
<ThemedButton variant="primary">Click Me</ThemedButton>

// Secondary button
<ThemedButton variant="secondary">Cancel</ThemedButton>

// Badge with theme color
<ThemedBadge variant="accent">New</ThemedBadge>
```

## Migration

To add theme settings to existing organizations, run the migration:

```bash
cd ehr-api
npm run migrate
```

This will:
1. Add `theme_settings` JSONB column to `organizations` table
2. Set default theme values for all organizations
3. Create index for faster theme queries

## Security Considerations

1. **Color Validation**: Only valid hex colors are accepted (#RRGGBB format)
2. **Logo Upload**: In production, logos should be uploaded to cloud storage (S3, Cloudinary)
3. **RBAC**: Only users with organization admin permissions can modify theme
4. **XSS Prevention**: Logo URLs and colors are sanitized before rendering

## Future Enhancements

1. **Advanced Color Picker**: Color palettes and gradients
2. **Multiple Logos**: Different logos for sidebar, header, reports
3. **Dark Mode Support**: Separate theme for dark mode
4. **Theme Templates**: Pre-built themes for different specialties
5. **Custom CSS**: Allow organizations to add custom CSS
6. **Font Upload**: Upload custom fonts
7. **Favicon Upload**: Custom favicon for browser tabs
8. **Email Branding**: Apply theme to email notifications
9. **Export/Import Theme**: Share themes between organizations
10. **Theme Preview URL**: Share a preview link before applying

## Troubleshooting

### Theme not applying
- Clear browser cache and reload
- Check console for errors
- Verify theme settings saved correctly in database

### Colors look wrong
- Ensure hex color format (#RRGGBB)
- Check contrast for accessibility
- Preview changes before saving

### Logo not displaying
- Verify image format (PNG, JPG, SVG)
- Check image size (recommended 200x200px or larger)
- Ensure logo URL is accessible

## Related Documentation
- [Organization Management](./organization-management.md)
- [Settings Module](./settings-module.md)
- [RBAC Permissions](./rbac-permissions.md)
