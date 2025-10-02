# EHR Connect Theme Guide

## Overview

The EHR Connect Design System uses a centralized theme configuration that aligns with the Keycloak login theme, ensuring consistent branding across all applications.

## Theme Colors

### Primary Brand Colors
Based on the Keycloak login gradient (`#667eea` to `#764ba2`):

```css
--primary-start: #667eea;  /* Purple start */
--primary-end: #764ba2;    /* Purple end */
--primary: #667eea;        /* Main primary color */
```

### Accent Colors
```css
--accent-green: #10b981;       /* Success/positive actions */
--accent-green-dark: #059669;
--accent-green-light: #34d399;
```

### Semantic Colors
```css
--success: #10b981;  /* Green for success states */
--warning: #f59e0b;  /* Orange for warnings */
--error: #ef4444;    /* Red for errors */
--info: #3b82f6;     /* Blue for informational */
```

## Usage

### In CSS Files

```css
/* Use CSS variables */
.my-component {
  background: var(--primary);
  color: var(--text-inverse);
  border: 1px solid var(--border-light);
}

/* Use gradient utilities */
.header {
  @apply medical-gradient;
}
```

### In Tailwind Classes

The theme integrates with Tailwind CSS:

```tsx
<div className="bg-primary text-white">
  <h1 className="text-gray-900">Title</h1>
</div>
```

### Custom Gradient Utilities

Available utility classes:
- `.medical-gradient` - Purple gradient (main brand)
- `.success-gradient` - Green gradient
- `.warning-gradient` - Orange gradient  
- `.danger-gradient` - Red gradient
- `.info-gradient` - Blue gradient
- `.glass-effect` - Frosted glass effect
- `.shadow-ehr` - Primary shadow
- `.shadow-ehr-lg` - Large primary shadow

## Dark Mode Support

The theme includes dark mode CSS variables that activate when `data-theme="dark"` is set on the root element:

```tsx
// To enable dark mode
document.documentElement.setAttribute('data-theme', 'dark');

// To disable dark mode
document.documentElement.removeAttribute('data-theme');
```

## Theme Switching Implementation (Future)

To implement theme switching:

1. Create a theme context provider:
```tsx
// contexts/theme-context.tsx
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

2. Use the theme hook:
```tsx
const { theme, setTheme } = useTheme();
<button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
  Toggle Theme
</button>
```

## Color Palette Reference

### Purple Theme (Primary)
- **#667eea** - Main purple (Keycloak gradient start)
- **#764ba2** - Deep purple (Keycloak gradient end)
- **#5568d3** - Darker shade
- **#7e8ff2** - Lighter shade

### Green Accent
- **#10b981** - Main green (links, success)
- **#059669** - Dark green
- **#34d399** - Light green

### Neutral Grays
- **#1a202c** - Near black (text)
- **#334155** - Dark gray
- **#475569** - Medium dark
- **#64748b** - Medium gray
- **#94a3b8** - Light gray
- **#cbd5e1** - Lighter gray
- **#e2e8f0** - Very light gray
- **#f5f7fa** - Near white background
- **#fafafa** - Off-white

## Best Practices

1. **Always use CSS variables** instead of hardcoded colors for theme switching support
2. **Use semantic color names** (--success, --error) over generic names when applicable
3. **Test in both light and dark modes** before finalizing designs
4. **Use gradient utilities** for consistent brand application
5. **Maintain accessibility** - ensure sufficient color contrast ratios

## File Locations

- **Theme Variables**: `ehr-design-system/src/styles/theme.css`
- **Global Styles**: `ehr-design-system/src/styles/globals.css`
- **Keycloak Login**: `keycloak-theme/src/login/styles.css`

## Integration

The theme is automatically included when you import the design system's global CSS:

```tsx
// In your app layout
import '@ehrconnect/design-system/style.css';
```

Or when published to npm:
```tsx
import '@ehrconnect/design-system/style.css';
