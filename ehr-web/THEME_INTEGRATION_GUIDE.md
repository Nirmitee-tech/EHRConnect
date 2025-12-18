# Theme Integration Guide

## Quick Reference: Applying Theme to Components

### Method 1: Using CSS Variables (Recommended for Most Cases)

All Tailwind utility classes that use color names will automatically use theme colors:

```tsx
// These automatically use theme colors via CSS variables
<button className="bg-primary text-white">Primary Button</button>
<div className="text-primary">Primary Text</div>
<div className="border-primary">Primary Border</div>
```

**CSS variables available:**
- `--primary` → `themeSettings.primaryColor`
- `--theme-secondary` → `themeSettings.secondaryColor`
- `--theme-accent` → `themeSettings.accentColor`
- `--theme-sidebar-bg` → `themeSettings.sidebarBackgroundColor`
- `--theme-sidebar-text` → `themeSettings.sidebarTextColor`
- `--theme-sidebar-active` → `themeSettings.sidebarActiveColor`

### Method 2: Direct Theme Context (For Custom Styling)

Use when you need direct access to theme values:

```tsx
import { useTheme } from '@/contexts/theme-context';

function MyComponent() {
  const { themeSettings } = useTheme();
  
  return (
    <div style={{ backgroundColor: themeSettings.primaryColor }}>
      Custom styled with theme
    </div>
  );
}
```

### Method 3: Themed Components (For Consistent UI)

Use pre-built themed components:

```tsx
import { ThemedButton, ThemedBadge } from '@/components/ui/themed-components';

function MyComponent() {
  return (
    <>
      <ThemedButton variant="primary">Save</ThemedButton>
      <ThemedButton variant="secondary">Cancel</ThemedButton>
      <ThemedButton variant="accent">New</ThemedButton>
      
      <ThemedBadge variant="primary">Active</ThemedBadge>
      <ThemedBadge variant="secondary">Pending</ThemedBadge>
      <ThemedBadge variant="accent">New</ThemedBadge>
    </>
  );
}
```

## Components Already Themed ✅

### Layout Components
- ✅ `HealthcareSidebar` - Uses all sidebar theme colors + logo
- ✅ `NavItem` - Uses sidebar text and active colors
- ✅ `Dashboard Header` - Uses sidebar background and text colors

### UI Components
- ✅ `ThemedButton` - Primary/Secondary/Accent variants
- ✅ `ThemedBadge` - Primary/Secondary/Accent variants

### Pages
- ✅ Appearance Settings Page - Full theme customization UI

## Components Using CSS Variables (Auto-Themed) 🔄

Any component using these Tailwind classes will automatically use theme:

```tsx
// Primary color
bg-primary, text-primary, border-primary

// Secondary (if needed)
bg-secondary, text-secondary, border-secondary

// Accent (if needed)  
bg-accent, text-accent, border-accent
```

**Examples of auto-themed components:**
- All buttons with `className="bg-primary"`
- Form submit buttons
- Action buttons in headers
- Navigation highlights

## How to Theme New Components

### Example 1: Theme a Card Component

```tsx
'use client';

import { useTheme } from '@/contexts/theme-context';

export function ThemedCard({ children, variant = 'default' }) {
  const { themeSettings } = useTheme();
  
  const getBorderColor = () => {
    switch(variant) {
      case 'primary': return themeSettings.primaryColor;
      case 'accent': return themeSettings.accentColor;
      default: return '#E5E7EB'; // default gray
    }
  };
  
  return (
    <div 
      className="rounded-lg p-4 bg-white"
      style={{ borderLeft: `4px solid ${getBorderColor()}` }}
    >
      {children}
    </div>
  );
}
```

### Example 2: Theme a Status Badge

```tsx
import { hexToRgba } from '@/lib/theme-utils';
import { useTheme } from '@/contexts/theme-context';

export function StatusBadge({ status, children }) {
  const { themeSettings } = useTheme();
  
  const getColors = () => {
    switch(status) {
      case 'active':
        return {
          bg: hexToRgba(themeSettings.accentColor, 0.1),
          text: themeSettings.accentColor
        };
      case 'pending':
        return {
          bg: hexToRgba(themeSettings.secondaryColor, 0.1),
          text: themeSettings.secondaryColor
        };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };
  
  const colors = getColors();
  
  return (
    <span
      className="px-2 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {children}
    </span>
  );
}
```

### Example 3: Theme a Header/Banner

```tsx
import { useTheme } from '@/contexts/theme-context';

export function PageBanner({ title, subtitle }) {
  const { themeSettings } = useTheme();
  
  return (
    <div 
      className="p-6 rounded-lg"
      style={{ 
        backgroundColor: themeSettings.primaryColor,
        color: 'white'
      }}
    >
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-sm opacity-90">{subtitle}</p>
    </div>
  );
}
```

### Example 4: Theme Dashboard KPI Cards

```tsx
import { useTheme } from '@/contexts/theme-context';
import { hexToRgba } from '@/lib/theme-utils';

export function KPICard({ title, value, icon: Icon, variant = 'primary' }) {
  const { themeSettings } = useTheme();
  
  const getColor = () => {
    switch(variant) {
      case 'primary': return themeSettings.primaryColor;
      case 'secondary': return themeSettings.secondaryColor;
      case 'accent': return themeSettings.accentColor;
      default: return themeSettings.primaryColor;
    }
  };
  
  const color = getColor();
  const bgColor = hexToRgba(color, 0.1);
  
  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">{title}</span>
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: bgColor }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
```

## Common Patterns

### Pattern 1: Hover States

```tsx
const [isHovered, setIsHovered] = useState(false);

<button
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
  style={{
    backgroundColor: isHovered 
      ? themeSettings.primaryColor 
      : 'transparent',
    color: isHovered ? 'white' : themeSettings.primaryColor
  }}
>
  Hover Me
</button>
```

### Pattern 2: Active/Selected States

```tsx
<div
  className="p-3 rounded-lg cursor-pointer"
  style={{
    backgroundColor: isActive 
      ? themeSettings.primaryColor 
      : 'transparent',
    color: isActive ? 'white' : 'inherit'
  }}
>
  {item.name}
</div>
```

### Pattern 3: Icons with Theme Colors

```tsx
import { Check } from 'lucide-react';

<Check 
  className="h-5 w-5" 
  style={{ color: themeSettings.accentColor }} 
/>
```

## Testing Theme Integration

To test if your component respects the theme:

1. Navigate to `/settings/appearance`
2. Change colors (especially primary color)
3. Click "Save Changes"
4. Navigate to your component
5. Verify colors changed

## Best Practices

1. **Use CSS Variables First**: For standard colors, use Tailwind classes with `bg-primary`, `text-primary`, etc.

2. **Use Theme Context for Custom**: When you need custom styling, use `useTheme()` hook.

3. **Use Themed Components**: For buttons and badges, use pre-built `ThemedButton` and `ThemedBadge`.

4. **Maintain Contrast**: Ensure text is readable on themed backgrounds.

5. **Test All Variants**: Test with light and dark theme colors.

6. **Fallback Colors**: Always provide fallback colors for edge cases.

## Troubleshooting

### Theme Not Applying
- Verify `ThemeProvider` wraps your app in `layout.tsx` ✅
- Check that component is inside the app tree
- Clear browser cache

### Colors Not Updating
- Ensure you're using CSS variables or `useTheme()` hook
- Don't hardcode colors like `bg-[#4A90E2]`
- Use `bg-primary` or `style={{ backgroundColor: themeSettings.primaryColor }}`

### Session Error
- Theme requires valid session with `orgId`
- Error message will indicate if session is not loaded
- Wait for session to load before accessing theme

## Examples in Codebase

Refer to these components for working examples:

1. **Sidebar**: `src/components/layout/healthcare-sidebar.tsx`
2. **Navigation**: `src/components/layout/nav-item.tsx`
3. **Dashboard**: `src/app/dashboard/page.tsx`
4. **Themed Components**: `src/components/ui/themed-components.tsx`
5. **Settings UI**: `src/app/settings/appearance/page.tsx`

## Need Help?

Check the main documentation:
- `THEME_BUILDER_FEATURE.md` - User guide
- `THEME_BUILDER_IMPLEMENTATION.md` - Technical details
- `theme-utils.ts` - Utility functions
