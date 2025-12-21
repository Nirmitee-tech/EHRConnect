# Specialty Implementation Checklist

**Quick reference for adding new specialties - print this and check off as you go!**

Specialty Name: ________________
Slug: ________________
Date Started: ________________
Developer: ________________

---

## Phase 1: Database (Backend)

### Migration
- [ ] Created migration file: `ehr-api/src/migrations/add-[specialty]-tables.js`
- [ ] Added all required tables
- [ ] Added indexes
- [ ] Added foreign keys
- [ ] Implemented `up()` function
- [ ] Implemented `down()` function
- [ ] Tested migration up: `node src/migrations/add-[specialty]-tables.js up`
- [ ] Verified tables exist: `\dt *[specialty]*` in psql
- [ ] Tested migration down: `node src/migrations/add-[specialty]-tables.js down`

### Seed Script
- [ ] Opened: `ehr-api/src/database/seed-scripts/seed-specialty-packs.js`
- [ ] Added specialty to `SPECIALTY_PACKS` array
- [ ] Set correct `pack_slug`
- [ ] Set correct `pack_version`
- [ ] Set correct `description`
- [ ] Set `enabled_by_default` (true/false)
- [ ] Ran seed: `node src/database/seed-scripts/seed-specialty-packs.js`
- [ ] Verified in DB: `SELECT * FROM org_specialty_settings WHERE pack_slug = '[specialty]';`

---

## Phase 2: Frontend Module

### Directory Structure
- [ ] Created: `ehr-web/src/features/specialties/[specialty-name]/`
- [ ] Created: `ehr-web/src/features/specialties/[specialty-name]/components/`
- [ ] Created: `ehr-web/src/features/specialties/[specialty-name]/hooks/`

### Configuration File
- [ ] Created: `ehr-web/src/features/specialties/[specialty-name]/config.ts`
- [ ] Set `slug` property
- [ ] Set `name` property
- [ ] Set `icon` property (Lucide icon name)
- [ ] Set `color` property
- [ ] Defined `components` with lazy loading
- [ ] Defined `episodeHandlers` (onCreate, onUpdate, onClose)
- [ ] Defined `navigation.sections` array
- [ ] Set correct `order` for each section
- [ ] Set correct `category` for each section
- [ ] Set correct `componentName` for each section

### Module Index
- [ ] Created: `ehr-web/src/features/specialties/[specialty-name]/index.ts`
- [ ] Exported `[Specialty]Specialty` from config
- [ ] Exported all components

### Components
- [ ] Created overview component: `[SpecialtyName]Overview.tsx`
- [ ] Created other required components
- [ ] All components properly exported

---

## Phase 3: Registration (MOST CRITICAL!)

### Main Specialties Export
- [ ] Opened: `ehr-web/src/features/specialties/index.ts`
- [ ] Added line: `export { [Specialty]Specialty } from './[specialty-name]';`
- [ ] Saved file
- [ ] No TypeScript errors

### Client-Side Registration
- [ ] Opened: `ehr-web/src/app/specialty-init-client.tsx`
- [ ] Added import: `import { [Specialty]Specialty } from '@/features/specialties';`
- [ ] Added registration: `specialtyRegistry.register([Specialty]Specialty);`
- [ ] Import is inside the imports block (line ~9-14)
- [ ] Registration is inside useEffect (line ~17-27)
- [ ] Saved file
- [ ] No TypeScript errors

### Admin UI
- [ ] Opened: `ehr-web/src/app/admin/specialties/page.tsx`
- [ ] Found `availablePacks` array (around line 23-30)
- [ ] Added specialty object with slug, version, name, description
- [ ] Saved file
- [ ] No TypeScript errors

---

## Phase 4: Verification

### Build/Dev Server
- [ ] Killed existing dev server
- [ ] Started dev server: `npm run dev`
- [ ] No compilation errors
- [ ] Server started successfully

### Browser Console
- [ ] Opened browser (navigate to app)
- [ ] Opened DevTools (F12)
- [ ] Opened Console tab
- [ ] Found message: "🚀 Initializing specialty modules..."
- [ ] Found message: "✅ Registered X specialty module(s):"
- [ ] **MY SPECIALTY IS LISTED** with correct name and slug
- [ ] Component count shows correctly

### Admin Page
- [ ] Navigated to `/admin/specialties`
- [ ] Page loaded without errors
- [ ] **MY SPECIALTY APPEARS** in the list
- [ ] Correct name displayed
- [ ] Correct description displayed
- [ ] "Enable Pack" button visible (if not already enabled)
- [ ] Clicked "Enable Pack"
- [ ] Success message appeared
- [ ] Button changed to checkmark

### Patient Sidebar
- [ ] Opened any patient record
- [ ] Found sidebar on the left
- [ ] Found dropdown at top of sidebar
- [ ] Clicked dropdown to open menu
- [ ] Saw "All Sections", "Clinical", "Admin", "Financial"
- [ ] Saw "--- Specialties ---" divider
- [ ] **MY SPECIALTY APPEARS** in dropdown menu
- [ ] Selected my specialty from dropdown
- [ ] **NAVIGATION SECTIONS APPEAR** in sidebar
- [ ] All expected sections are visible
- [ ] Section icons display correctly
- [ ] Section labels are correct

### Component Loading
- [ ] Clicked each navigation section
- [ ] Overview component loaded
- [ ] Other components loaded
- [ ] No 404 or loading errors
- [ ] No console errors
- [ ] Components render correctly

---

## Phase 5: Testing

### Functional Testing
- [ ] Can create episode for specialty
- [ ] Can view specialty sections
- [ ] Can enter data in forms
- [ ] Data persists after refresh
- [ ] Can switch between specialties
- [ ] Can disable specialty in admin
- [ ] Specialty disappears from sidebar when disabled
- [ ] Can re-enable specialty

### Database Testing
- [ ] Data saves to correct tables
- [ ] Foreign keys work correctly
- [ ] Indexes improve query performance
- [ ] Audit trail created correctly

### Browser Testing
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works on mobile viewport

---

## Common Issues Checklist

If specialty doesn't appear, check:

### Not in Console Log
- [ ] Checked `specialty-init-client.tsx` has import
- [ ] Checked `specialty-init-client.tsx` has registration
- [ ] Checked `index.ts` exports specialty
- [ ] Restarted dev server
- [ ] Hard refreshed browser (Cmd+Shift+R / Ctrl+Shift+R)

### Not in Admin Page
- [ ] Checked `availablePacks` array in `admin/specialties/page.tsx`
- [ ] Refreshed admin page
- [ ] Hard refreshed browser

### Not in Sidebar Dropdown
- [ ] Checked console log shows specialty registered
- [ ] Checked database has `org_specialty_settings` entry
- [ ] Checked `enabled = true` in database
- [ ] Ran seed script
- [ ] Hard refreshed browser
- [ ] Cleared browser cache completely

### Components Don't Load
- [ ] Checked `componentName` matches component key in `components` object
- [ ] Checked lazy loading syntax is correct
- [ ] Checked component files exist
- [ ] Checked component exports are correct
- [ ] Checked for console errors
- [ ] Checked Network tab in DevTools

---

## Final Sign-Off

- [ ] All checklist items complete
- [ ] Specialty fully functional
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Ready for commit

**Developer Signature**: ________________
**Date Completed**: ________________
**Reviewed By**: ________________

---

## Files Modified Summary

List all files you created/modified:

**Database:**
1. `ehr-api/src/migrations/add-[specialty]-tables.js`
2. `ehr-api/src/database/seed-scripts/seed-specialty-packs.js`

**Frontend Module:**
3. `ehr-web/src/features/specialties/[specialty-name]/config.ts`
4. `ehr-web/src/features/specialties/[specialty-name]/index.ts`
5. `ehr-web/src/features/specialties/[specialty-name]/components/[Component].tsx`
6. (add more component files as needed)

**Registration:**
7. `ehr-web/src/features/specialties/index.ts`
8. `ehr-web/src/app/specialty-init-client.tsx`
9. `ehr-web/src/app/admin/specialties/page.tsx`

**Total Files Modified**: _____ files

---

## Notes

Use this space to note any issues, workarounds, or future improvements:

```
[Your notes here]
```
