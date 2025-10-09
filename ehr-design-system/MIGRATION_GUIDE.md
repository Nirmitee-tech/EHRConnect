# Migration Guide: EHR-Web to Design System

This guide explains how to migrate ehr-web to use the @nirmitee.io/design-system package, making the codebase cleaner and more maintainable.

## 📋 Overview

The design system now includes all reusable UI components that were previously in `ehr-web/src/components/ui/`. This allows for:

- ✅ Cleaner ehr-web repository
- ✅ Shared components across all EHRConnect projects
- ✅ Centralized component maintenance
- ✅ Consistent design across applications
- ✅ Easier testing and documentation via Storybook

## 🔄 Components to Migrate

### Currently in Design System
- ✅ Button
- ✅ Input  
- ✅ Card (with CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- ✅ Badge
- ✅ Label

### Need to Add to Design System (from ehr-web)
- Select
- Sheet

### EHR-Specific Components (Keep in ehr-web)
- ✅ Forms (allergy-form, encounter-form, facility-form, patient-form)
- ✅ Layout components (admin-sidebar, authenticated-layout, healthcare-header, healthcare-sidebar)
- ✅ Patient components (patient-drawer, patient-header)
- ✅ Specialized components (camera-capture, facility-switcher, search-bar, user-profile)

## 🚀 Migration Steps

### Step 1: Build the Design System

```bash
cd ehr-design-system
npm run build
```

This creates `dist/` folder with:
- `index.js` - CommonJS bundle
- `index.esm.js` - ES Module bundle  
- `index.css` - Compiled styles
- Type definitions

### Step 2: Link the Package Locally

```bash
# In design system directory
cd ehr-design-system
npm link

# In ehr-web directory
cd ../ehr-web
npm link @nirmitee.io/design-system
```

### Step 3: Update ehr-web/src/app/layout.tsx

Replace the local styles import with design system styles:

```tsx
// BEFORE
import "./globals.css";

// AFTER
import "@nirmitee.io/design-system/dist/index.css";
import "./globals.css"; // Keep for app-specific styles
```

### Step 4: Update Component Imports

Replace imports from `@/components/ui/*` with design system imports:

```tsx
// BEFORE
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// AFTER
import { 
  Button, 
  Card, CardHeader, CardTitle, CardContent,
  Badge,
  Input,
  Label 
} from "@nirmitee.io/design-system";
```

### Step 5: Update Utils Import

```tsx
// BEFORE
import { cn } from "@/lib/utils";

// AFTER  
import { cn, formatDate, getInitials } from "@nirmitee.io/design-system";
```

### Step 6: Delete Migrated UI Components

Once all imports are updated, you can safely delete:

```bash
cd ehr-web
rm src/components/ui/button.tsx
rm src/components/ui/card.tsx
rm src/components/ui/badge.tsx
rm src/components/ui/input.tsx
rm src/components/ui/label.tsx
```

**Note:** Keep `select.tsx` and `sheet.tsx` until they're added to the design system.

### Step 7: Update Tailwind Config (Optional)

If needed, extend the design system's Tailwind config:

```js
// ehr-web/tailwind.config.ts
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nirmitee.io/design-system/dist/**/*.js",
  ],
  // Your customizations
}
```

## 📝 Component Mapping

| Old Path | New Import |
|----------|-----------|
| `@/components/ui/button` | `@nirmitee.io/design-system` |
| `@/components/ui/card` | `@nirmitee.io/design-system` |
| `@/components/ui/badge` | `@nirmitee.io/design-system` |
| `@/components/ui/input` | `@nirmitee.io/design-system` |
| `@/components/ui/label` | `@nirmitee.io/design-system` |
| `@/lib/utils` (cn, formatDate, etc.) | `@nirmitee.io/design-system` |

## 🎯 Example Migration

### Before
```tsx
// ehr-web/src/app/patients/page.tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function PatientsPage() {
  return (
    <div className={cn("container")}>
      <Button>Add Patient</Button>
      <Card>
        <CardHeader>
          <CardTitle>Patients</CardTitle>
        </CardHeader>
      </Card>
      <Badge>Active</Badge>
    </div>
  );
}
```

### After
```tsx
// ehr-web/src/app/patients/page.tsx
import { 
  Button, 
  Card, CardHeader, CardTitle,
  Badge,
  cn 
} from "@nirmitee.io/design-system";

export default function PatientsPage() {
  return (
    <div className={cn("container")}>
      <Button>Add Patient</Button>
      <Card>
        <CardHeader>
          <CardTitle>Patients</CardTitle>
        </CardHeader>
      </Card>
      <Badge>Active</Badge>
    </div>
  );
}
```

## ⚠️ Important Notes

1. **Medical Variant**: The design system includes a `medical` variant for healthcare-specific styling:
   ```tsx
   <Button variant="medical">Patient Care</Button>
   <Badge variant="medical">Critical</Badge>
   ```

2. **Keep Application-Specific Components**: Don't migrate forms, layouts, or business logic components. Only migrate reusable UI primitives.

3. **Gradual Migration**: You can migrate one component at a time. Both old and new imports can coexist during transition.

4. **Testing**: Test each page after migration to ensure styling and functionality remain intact.

## 🔍 Finding Components to Update

Search for imports from ui components:

```bash
cd ehr-web
grep -r "from \"@/components/ui" src/
```

## 🆘 Troubleshooting

### Styles Not Applied
- Ensure `@nirmitee.io/design-system/dist/index.css` is imported in layout.tsx
- Check that Tailwind content includes the design system path

### Type Errors
- Run `npm link @nirmitee.io/design-system` again
- Restart TypeScript server in VS Code (Cmd+Shift+P > TypeScript: Restart TS Server)

### Build Errors
- Ensure design system is built: `cd ehr-design-system && npm run build`
- Check package.json peer dependencies are installed

## 📊 Migration Checklist

- [ ] Build design system (`npm run build`)
- [ ] Link packages (`npm link`)
- [ ] Update layout.tsx with CSS import
- [ ] Find all component imports (`grep` command)
- [ ] Update imports file by file
- [ ] Test each updated page
- [ ] Delete old UI component files
- [ ] Update documentation
- [ ] Commit changes

## 🎉 Benefits After Migration

1. **Cleaner Codebase**: Fewer files in ehr-web
2. **Consistent Design**: All apps use same components
3. **Easier Maintenance**: Update once, use everywhere
4. **Better Documentation**: Storybook shows all components
5. **Faster Development**: Reusable components speed up feature development

## 📚 Additional Resources

- [Design System README](./README.md)
- [Setup Guide](./SETUP_GUIDE.md)
- [Storybook](http://localhost:6006)
- [Component Examples](./src/components/atoms/)

---

Need help? Check the main repository issues or contact the EHR Connect team.
