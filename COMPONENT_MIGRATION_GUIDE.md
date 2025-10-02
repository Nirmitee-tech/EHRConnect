# Component Migration Guide: Local UI → Design System

## Overview

This guide documents the strategy for migrating from local `@/components/ui/*` components to centralized `@ehrconnect/design-system` components.

## Components Already in Design System

### Atoms
- ✅ **Button** - `@ehrconnect/design-system`
- ✅ **Input** - `@ehrconnect/design-system`
- ✅ **Label** - `@ehrconnect/design-system`
- ✅ **Card** - `@ehrconnect/design-system`
- ✅ **Badge** - `@ehrconnect/design-system`
- ✅ **LoadingState** - `@ehrconnect/design-system`

### Molecules
- ✅ **Drawer** (replaces Sheet) - `@ehrconnect/design-system`
- ✅ **Table** - `@ehrconnect/design-system`
- ✅ **Sidebar** - `@ehrconnect/design-system`
- ✅ **Header** - `@ehrconnect/design-system`

### Components Still Using Local UI
- ⏳ **Select** - `@/components/ui/select` (Radix UI wrapper, consider migrating)
- ⏳ Other shadcn/ui components as needed

## Migration Status

### ✅ Completed Migrations

1. **ehr-web/src/components/forms/encounter-form.tsx**
   ```tsx
   // BEFORE
   import { Button } from '@/components/ui/button';
   import { Label } from '@/components/ui/label';
   import { Input } from '@/components/ui/input';
   import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
   
   // AFTER
   import { Button, Label, Input, Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@ehrconnect/design-system';
   ```

2. **ehr-web/src/components/patients/patient-drawer.tsx**
   ```tsx
   // BEFORE
   import { Sheet, SheetContent } from '@/components/ui/sheet';
   
   // AFTER
   import { Drawer, DrawerContent } from '@ehrconnect/design-system';
   ```

### ⏳ Files Pending Migration

Run this command to find all files using local UI components:

```bash
# Find Button imports
grep -r "from '@/components/ui/button'" ehr-web/src

# Find Label imports
grep -r "from '@/components/ui/label'" ehr-web/src

# Find Input imports  
grep -r "from '@/components/ui/input'" ehr-web/src

# Find Card imports
grep -r "from '@/components/ui/card'" ehr-web/src

# Find Badge imports
grep -r "from '@/components/ui/badge'" ehr-web/src

# Find Sheet imports (migrate to Drawer)
grep -r "from '@/components/ui/sheet'" ehr-web/src
```

## Migration Strategy

### Phase 1: High-Priority Files (Patient & Clinical Workflows)

#### Forms
- [ ] `ehr-web/src/components/forms/patient-form.tsx`
- [ ] `ehr-web/src/components/forms/allergy-form.tsx`
- [ ] `ehr-web/src/components/forms/facility-form.tsx`
- [x] `ehr-web/src/components/forms/encounter-form.tsx` ✅

#### Patient Components
- [x] `ehr-web/src/components/patients/patient-drawer.tsx` ✅
- [ ] `ehr-web/src/components/patients/patient-header.tsx`

#### Pages
- [ ] `ehr-web/src/app/patients/page.tsx`
- [ ] `ehr-web/src/app/patients/[id]/page.tsx`
- [ ] `ehr-web/src/app/staff/page.tsx`

### Phase 2: Layout & Navigation
- [ ] `ehr-web/src/components/layout/healthcare-header.tsx`
- [ ] `ehr-web/src/components/layout/healthcare-sidebar.tsx`
- [ ] `ehr-web/src/components/layout/admin-sidebar.tsx`
- [ ] `ehr-web/src/components/layout/user-profile.tsx`
- [ ] `ehr-web/src/components/layout/search-bar.tsx`

### Phase 3: Admin & Settings
- [ ] `ehr-web/src/app/admin/users/page.tsx`
- [ ] `ehr-web/src/app/admin/facilities/page.tsx`

## Migration Examples

### Example 1: Simple Component Migration

**Before:**
```tsx
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

function MyForm() {
  return (
    <div>
      <Label>Name</Label>
      <Input placeholder="Enter name" />
      <Button>Submit</Button>
    </div>
  );
}
```

**After:**
```tsx
import { Button, Label, Input } from '@ehrconnect/design-system';

function MyForm() {
  return (
    <div>
      <Label>Name</Label>
      <Input placeholder="Enter name" />
      <Button>Submit</Button>
    </div>
  );
}
```

### Example 2: Sheet → Drawer Migration

**Before:**
```tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

function MyDrawer() {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Title</SheetTitle>
        </SheetHeader>
        <div>Content</div>
      </SheetContent>
    </Sheet>
  );
}
```

**After:**
```tsx
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@ehrconnect/design-system';

function MyDrawer() {
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent side="right" size="lg">
        <DrawerHeader>
          <DrawerTitle>Title</DrawerTitle>
        </DrawerHeader>
        <div>Content</div>
      </DrawerContent>
    </Drawer>
  );
}
```

### Example 3: Table Migration

**Before:**
```tsx
function PatientList() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Age</th>
          </tr>
        </thead>
        <tbody>
          {patients.map(p => (
            <tr key={p.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2">{p.name}</td>
              <td className="px-4 py-2">{p.age}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**After:**
```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableContainer
} from '@ehrconnect/design-system';

function PatientList() {
  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Age</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map(p => (
            <TableRow key={p.id}>
              <TableCell>{p.name}</TableCell>
              <TableCell>{p.age}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
```

## Automated Migration Script

Create a script to help with bulk migrations:

```bash
#!/bin/bash
# migrate-to-design-system.sh

# Find and replace Button imports
find ehr-web/src -name "*.tsx" -type f -exec sed -i '' \
  "s/import { Button } from '@\/components\/ui\/button'/import { Button } from '@ehrconnect\/design-system'/g" {} +

# Find and replace Label imports
find ehr-web/src -name "*.tsx" -type f -exec sed -i '' \
  "s/import { Label } from '@\/components\/ui\/label'/import { Label } from '@ehrconnect\/design-system'/g" {} +

# Find and replace Input imports
find ehr-web/src -name "*.tsx" -type f -exec sed -i '' \
  "s/import { Input } from '@\/components\/ui\/input'/import { Input } from '@ehrconnect\/design-system'/g" {} +

# Find and replace Card imports
find ehr-web/src -name "*.tsx" -type f -exec sed -i '' \
  "s/import { Card } from '@\/components\/ui\/card'/import { Card } from '@ehrconnect\/design-system'/g" {} +

# Find and replace Badge imports
find ehr-web/src -name "*.tsx" -type f -exec sed -i '' \
  "s/import { Badge } from '@\/components\/ui\/badge'/import { Badge } from '@ehrconnect\/design-system'/g" {} +
```

## Testing Checklist

After migrating each file:

- [ ] Component renders correctly
- [ ] All props work as expected
- [ ] Styling is consistent
- [ ] Interactive elements function properly
- [ ] TypeScript types are correct
- [ ] No console errors
- [ ] Accessibility features work

## Benefits of Migration

1. **Single Source of Truth** - All components defined in one place
2. **Consistency** - Uniform styling and behavior across the app
3. **Maintainability** - Easier to update and improve components
4. **Reusability** - Components can be used in multiple projects
5. **Documentation** - Storybook provides comprehensive examples
6. **Type Safety** - Better TypeScript support
7. **Testing** - Easier to test components in isolation

## Next Steps

1. **Build the design system** to ensure all changes are compiled:
   ```bash
   cd ehr-design-system
   npm run build
   ```

2. **Update ehr-web package.json** if needed to link to the design system

3. **Start migrating files** following the phase order above

4. **Test thoroughly** after each migration

5. **Remove unused local UI components** once migration is complete

## Notes

- Keep Select component local for now until we create a design system version
- Some components may need minor adjustments to work with the design system version
- Always test in both development and production builds
- Consider creating a migration branch for safety
