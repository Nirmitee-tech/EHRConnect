# EHR-Web to Design System Migration Tasks

Track progress of migrating ehr-web to use @nirmitee.io/design-system

## 📋 Migration Status

**Started:** February 10, 2025  
**Status:** In Progress  
**Estimated Completion:** TBD

---

## Phase 1: Setup & Configuration

- [x] Build design system package
- [x] Link design system to ehr-web (`npm link @nirmitee.io/design-system`)
- [ ] Update ehr-web layout.tsx to import design system CSS
- [ ] Verify Tailwind config includes design system paths

---

## Phase 2: Replace UI Component Imports

### Button Component
- [ ] Find all Button imports: `grep -r "from \"@/components/ui/button\"" src/`
- [ ] Update imports to use design system
- [ ] Test all pages using Button
- [ ] Delete `ehr-web/src/components/ui/button.tsx`

**Files to Update:**
- [ ] `src/app/page.tsx`
- [ ] `src/app/dashboard/page.tsx`
- [ ] `src/app/patients/page.tsx`
- [ ] `src/app/patients/new/page.tsx`
- [ ] `src/app/patients/[id]/edit/page.tsx`
- [ ] `src/app/admin/facilities/new/page.tsx`
- [ ] `src/components/forms/*.tsx`
- [ ] `src/components/layout/*.tsx`
- [ ] `src/components/patients/*.tsx`

### Card Component
- [ ] Find all Card imports
- [ ] Update imports to use design system
- [ ] Test all pages using Card
- [ ] Delete `ehr-web/src/components/ui/card.tsx`

**Files to Update:**
- [ ] Dashboard cards
- [ ] Patient cards
- [ ] Admin pages

### Badge Component
- [ ] Find all Badge imports
- [ ] Update imports to use design system
- [ ] Test all pages using Badge
- [ ] Delete `ehr-web/src/components/ui/badge.tsx`

### Input Component
- [ ] Find all Input imports
- [ ] Update imports to use design system
- [ ] Test all forms
- [ ] Delete `ehr-web/src/components/ui/input.tsx`

### Label Component
- [ ] Find all Label imports
- [ ] Update imports to use design system
- [ ] Test all forms
- [ ] Delete `ehr-web/src/components/ui/label.tsx`

---

## Phase 3: Add Missing Components to Design System

### Select Component
- [ ] Copy from ehr-web to design system
- [ ] Create Storybook story
- [ ] Update ehr-web imports
- [ ] Delete from ehr-web

### Sheet Component
- [ ] Copy from ehr-web to design system
- [ ] Create Storybook story
- [ ] Update ehr-web imports
- [ ] Delete from ehr-web

---

## Phase 4: Migrate Layout Components

### SearchBar (Molecule)
- [ ] Move to `ehr-design-system/src/components/molecules/SearchBar/`
- [ ] Create Storybook story
- [ ] Update ehr-web imports
- [ ] Delete from ehr-web
- [ ] Test search functionality

### UserProfile (Molecule)
- [ ] Move to `ehr-design-system/src/components/molecules/UserProfile/`
- [ ] Create Storybook story
- [ ] Update ehr-web imports
- [ ] Delete from ehr-web
- [ ] Test profile dropdown

### NavItem (Molecule)
- [ ] Move to `ehr-design-system/src/components/molecules/NavItem/`
- [ ] Create Storybook story
- [ ] Update ehr-web imports
- [ ] Delete from ehr-web
- [ ] Test navigation

### AdminSidebar (Organism)
- [ ] Move to `ehr-design-system/src/components/organisms/AdminSidebar/`
- [ ] Make configurable with props
- [ ] Create Storybook story
- [ ] Update ehr-web imports
- [ ] Delete from ehr-web
- [ ] Test admin navigation

### HealthcareSidebar (Organism)
- [ ] Move to `ehr-design-system/src/components/organisms/HealthcareSidebar/`
- [ ] Make configurable with props
- [ ] Create Storybook story
- [ ] Update ehr-web imports
- [ ] Delete from ehr-web
- [ ] Test healthcare navigation

### HealthcareHeader (Organism)
- [ ] Move to `ehr-design-system/src/components/organisms/Header/`
- [ ] Make configurable with props
- [ ] Create Storybook story
- [ ] Update ehr-web imports
- [ ] Delete from ehr-web
- [ ] Test header functionality

---

## Phase 5: Patient-Specific Components (Optional)

### PatientHeader (Molecule)
- [ ] Evaluate if should be in design system
- [ ] Move if reusable across apps
- [ ] Create Storybook story
- [ ] Update ehr-web imports

### PatientDrawer (Organism)
- [ ] Evaluate if should be in design system
- [ ] Move if reusable across apps
- [ ] Create Storybook story
- [ ] Update ehr-web imports

---

## Phase 6: Specialized Components (Keep in ehr-web)

**DO NOT MIGRATE** - These are application-specific:

- [x] `camera-capture.tsx` - Business logic
- [x] `facility-switcher.tsx` - App-specific
- [x] `forms/allergy-form.tsx` - Business logic
- [x] `forms/encounter-form.tsx` - Business logic
- [x] `forms/facility-form.tsx` - Business logic
- [x] `forms/patient-form.tsx` - Business logic

---

## Phase 7: Testing & Verification

### Visual Testing
- [ ] Compare before/after screenshots
- [ ] Verify all pages render correctly
- [ ] Test responsive layouts
- [ ] Test dark mode (if applicable)

### Functional Testing
- [ ] Test all forms submit correctly
- [ ] Test navigation works
- [ ] Test search functionality
- [ ] Test user profile dropdown
- [ ] Test patient workflows
- [ ] Test admin workflows

### Performance Testing
- [ ] Measure bundle size before/after
- [ ] Check for any performance regressions
- [ ] Verify tree-shaking works

---

## Phase 8: Cleanup & Documentation

- [ ] Remove all old UI component files
- [ ] Update ehr-web README with design system usage
- [ ] Document any ehr-web specific customizations
- [ ] Update team documentation
- [ ] Create migration changelog

---

## Phase 9: Build & Deploy

- [ ] Build ehr-web successfully
- [ ] Run all tests
- [ ] Deploy to staging
- [ ] QA testing
- [ ] Deploy to production

---

## Migration Commands Reference

```bash
# Find component usage
cd ehr-web
grep -r "from \"@/components/ui/button\"" src/
grep -r "from \"@/components/ui/card\"" src/
grep -r "from \"@/components/ui/badge\"" src/

# Update design system
cd ../ehr-design-system
npm run build
npm link

# Link in ehr-web
cd ../ehr-web
npm link @nirmitee.io/design-system

# Test ehr-web
npm run dev
npm run build
```

---

## Notes & Issues

### Issues Found
- [ ] List any issues discovered during migration

### Breaking Changes
- [ ] Document any breaking changes

### Improvements Made
- [ ] Document any improvements or optimizations

---

## Sign-off

- [ ] Developer sign-off
- [ ] Code review completed
- [ ] QA sign-off
- [ ] Product owner approval

---

**Last Updated:** February 10, 2025  
**Updated By:** Cline AI Assistant
