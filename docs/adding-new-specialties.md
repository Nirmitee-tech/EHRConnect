# Adding New Specialties to EHRConnect

**Complete guide for implementing new specialty modules in the EHRConnect system**

Last Updated: 2025-12-21
Authors: Development Team

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Implementation](#step-by-step-implementation)
4. [Verification Checklist](#verification-checklist)
5. [Common Pitfalls](#common-pitfalls)
6. [Troubleshooting](#troubleshooting)
7. [Example: Adding Dermatology Specialty](#example-adding-dermatology-specialty)

---

## Overview

The EHRConnect specialty system consists of **three critical layers** that must be configured:

1. **Database Layer**: Tables for specialty-specific data
2. **Backend Layer**: API endpoints, services, and seed data
3. **Frontend Layer**: React components, navigation, and registry

**⚠️ CRITICAL**: All three layers must be configured, or the specialty will not appear in the UI.

---

## Prerequisites

Before adding a new specialty, ensure you have:

- [ ] PostgreSQL database access
- [ ] Node.js and npm installed
- [ ] Understanding of the specialty's clinical workflows
- [ ] Database schema design completed
- [ ] List of required components/forms

**File Structure Overview**:
```
ehr-api/
├── src/
│   ├── migrations/              # Database schema
│   └── database/
│       ├── seed-scripts/        # Standalone seed scripts
│       └── seeders/             # Sequelize seeders

ehr-web/
├── src/
│   ├── app/
│   │   ├── specialty-init-client.tsx    # ⚠️ CLIENT REGISTRATION (CRITICAL!)
│   │   └── admin/specialties/page.tsx   # Admin UI list
│   └── features/specialties/
│       ├── [specialty-name]/
│       │   ├── config.ts               # Specialty configuration
│       │   ├── index.ts                # Exports
│       │   ├── components/             # React components
│       │   └── hooks/                  # React hooks
│       └── index.ts                    # ⚠️ MUST EXPORT HERE
```

---

## Step-by-Step Implementation

### Phase 1: Database Setup

#### 1.1 Create Migration File

**Location**: `ehr-api/src/migrations/add-[specialty]-tables.js`

```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'medplum',
  user: process.env.DB_USER || 'medplum',
  password: process.env.DB_PASSWORD || 'medplum123'
});

async function up() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Create specialty-specific tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS [specialty]_patients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL UNIQUE,
        org_id UUID NOT NULL,
        -- Add specialty-specific fields here
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_[specialty]_patients_patient_id
      ON [specialty]_patients(patient_id);

      CREATE INDEX IF NOT EXISTS idx_[specialty]_patients_org_id
      ON [specialty]_patients(org_id);
    `);

    // 3. Add foreign keys if needed
    await client.query(`
      ALTER TABLE [specialty]_patients
      ADD CONSTRAINT fk_[specialty]_patients_org
      FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE;
    `);

    await client.query('COMMIT');
    console.log('✅ [Specialty] tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating [specialty] tables:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function down() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Drop tables in reverse order
    await client.query('DROP TABLE IF EXISTS [specialty]_patients CASCADE;');

    await client.query('COMMIT');
    console.log('✅ [Specialty] tables dropped successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error dropping [specialty] tables:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// CLI support
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'up') {
    up().then(() => process.exit(0)).catch(() => process.exit(1));
  } else if (command === 'down') {
    down().then(() => process.exit(0)).catch(() => process.exit(1));
  } else {
    console.log('Usage: node add-[specialty]-tables.js [up|down]');
    process.exit(1);
  }
}

module.exports = { up, down };
```

#### 1.2 Run Migration

```bash
cd ehr-api
node src/migrations/add-[specialty]-tables.js up

# Verify tables were created
PGPASSWORD=medplum123 psql -h localhost -U medplum -d medplum -c "\dt *[specialty]*"
```

---

### Phase 2: Backend Configuration

#### 2.1 Update Seed Script

**Location**: `ehr-api/src/database/seed-scripts/seed-specialty-packs.js`

Add your specialty to the `SPECIALTY_PACKS` array:

```javascript
const SPECIALTY_PACKS = [
  {
    pack_slug: 'general',
    pack_version: '1.0.0',
    description: 'Primary Care & General Medicine',
    enabled_by_default: true,
  },
  {
    pack_slug: 'ob-gyn',
    pack_version: '1.0.0',
    description: 'Obstetrics, Gynecology & IVF',
    enabled_by_default: true,
  },
  {
    pack_slug: 'pediatrics',
    pack_version: '1.0.0',
    description: 'Pediatrics & Child Health',
    enabled_by_default: true,
  },
  // 👇 ADD YOUR NEW SPECIALTY HERE
  {
    pack_slug: 'dermatology',
    pack_version: '1.0.0',
    description: 'Dermatology & Skin Care',
    enabled_by_default: false,  // Set to true to auto-enable for all orgs
  },
];
```

#### 2.2 Run Seed Script

```bash
cd ehr-api
node src/database/seed-scripts/seed-specialty-packs.js

# Verify specialty was seeded
PGPASSWORD=medplum123 psql -h localhost -U medplum -d medplum \
  -c "SELECT pack_slug, enabled FROM org_specialty_settings;"
```

---

### Phase 3: Frontend Setup

#### 3.1 Create Specialty Module

**Location**: `ehr-web/src/features/specialties/[specialty-name]/`

Create directory structure:
```bash
cd ehr-web/src/features/specialties
mkdir -p [specialty-name]/components
mkdir -p [specialty-name]/hooks
```

#### 3.2 Create Configuration File

**Location**: `ehr-web/src/features/specialties/[specialty-name]/config.ts`

```typescript
import { lazy } from 'react';
import { SpecialtyModule } from '../shared/types';

export const [Specialty]Specialty: SpecialtyModule = {
  slug: '[specialty-slug]',
  name: '[Specialty Display Name]',
  icon: 'Stethoscope', // Lucide icon name
  color: '#10B981',

  // Lazy-loaded components
  components: {
    [SpecialtyName]Overview: lazy(() =>
      import('./components/[SpecialtyName]Overview').then(m => ({
        default: m.[SpecialtyName]Overview,
      }))
    ),
    // Add more components...
  },

  // Episode lifecycle handlers
  episodeHandlers: {
    onCreate: async (episodeId: string) => {
      console.log(`✅ [Specialty] episode created: ${episodeId}`);
    },
    onUpdate: async (episodeId: string) => {
      console.log(`📝 [Specialty] episode updated: ${episodeId}`);
    },
    onClose: async (episodeId: string) => {
      console.log(`✅ [Specialty] episode closed: ${episodeId}`);
    },
  },

  // Navigation configuration
  navigation: {
    sections: [
      {
        id: '[specialty]-overview',
        label: '[Specialty] Overview',
        icon: 'LayoutDashboard',
        category: 'clinical',
        componentName: '[SpecialtyName]Overview',
        order: 10,
      },
      // Add more navigation sections...
    ],
  },
};
```

#### 3.3 Create Index File

**Location**: `ehr-web/src/features/specialties/[specialty-name]/index.ts`

```typescript
export { [Specialty]Specialty } from './config';
export { [SpecialtyName]Overview } from './components/[SpecialtyName]Overview';
// Export other components...
```

#### 3.4 Update Main Specialties Index

**⚠️ CRITICAL STEP**

**Location**: `ehr-web/src/features/specialties/index.ts`

```typescript
// Registry
export { specialtyRegistry, registerSpecialtyModules } from './registry';
export type { SpecialtyRegistry } from './registry';

// Shared functionality
export * from './shared';

// Individual specialty modules
export { GeneralSpecialty } from './general';
export { ObGynSpecialty } from './ob-gyn';
export { PediatricsSpecialty } from './pediatrics';
export { [Specialty]Specialty } from './[specialty-name]';  // 👈 ADD THIS LINE
```

---

### Phase 4: Client-Side Registration

#### 4.1 Register in Client Initializer

**⚠️ MOST CRITICAL STEP - THIS IS WHERE MISTAKES HAPPEN**

**Location**: `ehr-web/src/app/specialty-init-client.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import {
  specialtyRegistry,
  GeneralSpecialty,
  ObGynSpecialty,
  PediatricsSpecialty,
  [Specialty]Specialty,  // 👈 ADD IMPORT
} from '@/features/specialties';

export function SpecialtyInitializer() {
  useEffect(() => {
    console.log('🚀 Initializing specialty modules...');

    specialtyRegistry.register(GeneralSpecialty);
    specialtyRegistry.register(ObGynSpecialty);
    specialtyRegistry.register(PediatricsSpecialty);
    specialtyRegistry.register([Specialty]Specialty);  // 👈 ADD REGISTRATION

    const stats = specialtyRegistry.getStats();
    console.log(`✅ Registered ${stats.totalModules} specialty module(s):`);
    stats.modules.forEach(m => {
      console.log(`   - ${m.name} (${m.slug}): ${m.components} components`);
    });
  }, []);

  return null;
}
```

**⚠️ WARNING**: If you forget this step, the specialty will NOT appear in the UI even though everything else is configured correctly!

---

### Phase 5: Admin UI Configuration

#### 5.1 Add to Admin Page

**Location**: `ehr-web/src/app/admin/specialties/page.tsx`

Find the `availablePacks` array and add your specialty:

```typescript
const availablePacks = [
  { slug: 'general', version: '1.0.0', name: 'General Primary Care', description: 'Default specialty pack for general primary care practice' },
  { slug: 'ob-gyn', version: '1.0.0', name: 'OB/GYN & Prenatal', description: 'Obstetrics, gynecology, prenatal care, and postpartum workflows' },
  { slug: 'pediatrics', version: '1.0.0', name: 'Pediatrics & Child Health', description: 'Pediatric care, growth monitoring, immunizations, and developmental screening' },
  // 👇 ADD YOUR SPECIALTY HERE
  { slug: 'dermatology', version: '1.0.0', name: 'Dermatology', description: 'Skin conditions, treatments, and cosmetic procedures' },
];
```

---

## Verification Checklist

After implementing all steps, verify:

### Database Verification

```bash
# 1. Check tables exist
PGPASSWORD=medplum123 psql -h localhost -U medplum -d medplum \
  -c "\dt *[specialty]*"

# 2. Check specialty pack is enabled
PGPASSWORD=medplum123 psql -h localhost -U medplum -d medplum \
  -c "SELECT pack_slug, enabled FROM org_specialty_settings WHERE pack_slug = '[specialty-slug]';"

# 3. Check audit trail
PGPASSWORD=medplum123 psql -h localhost -U medplum -d medplum \
  -c "SELECT pack_slug, action, created_at FROM specialty_pack_audits WHERE pack_slug = '[specialty-slug]';"
```

### Frontend Verification

**1. Open Browser Console (F12)**

Look for initialization message:
```
🚀 Initializing specialty modules...
✅ Registered X specialty module(s):
   - General Medicine (general): X components
   - OB/GYN & IVF (ob-gyn): X components
   - Pediatrics & Child Health (pediatrics): X components
   - [Your Specialty] ([specialty-slug]): X components  👈 SHOULD BE HERE
```

**2. Check Admin Page**

- Navigate to `/admin/specialties`
- Verify your specialty appears in the list
- Click "Enable Pack" (if not already enabled)

**3. Check Patient Sidebar**

- Open any patient record
- Click the view dropdown in the sidebar
- Should see:
  ```
  All Sections
  Clinical
  Admin
  Financial
  --- Specialties ---
  OB/GYN & Prenatal Care
  Pediatrics & Child Health
  [Your Specialty Name]  👈 SHOULD BE HERE
  ```

**4. Test Navigation**

- Select your specialty from the dropdown
- Verify all navigation sections appear
- Click each section to ensure components load

---

## Common Pitfalls

### ❌ Pitfall 1: Forgot Client-Side Registration

**Symptom**: Specialty doesn't appear in sidebar dropdown, but shows in admin page

**Cause**: Not added to `specialty-init-client.tsx`

**Solution**:
```typescript
// ehr-web/src/app/specialty-init-client.tsx
import { [Specialty]Specialty } from '@/features/specialties';
specialtyRegistry.register([Specialty]Specialty);
```

---

### ❌ Pitfall 2: Forgot Main Export

**Symptom**: Import error in `specialty-init-client.tsx`

**Cause**: Not exported from `ehr-web/src/features/specialties/index.ts`

**Solution**:
```typescript
// ehr-web/src/features/specialties/index.ts
export { [Specialty]Specialty } from './[specialty-name]';
```

---

### ❌ Pitfall 3: Database Not Seeded

**Symptom**: Specialty appears in admin UI but not in sidebar

**Cause**: Specialty pack not enabled in database

**Solution**:
```bash
node src/database/seed-scripts/seed-specialty-packs.js
```

---

### ❌ Pitfall 4: Admin Page Not Updated

**Symptom**: Specialty doesn't appear in `/admin/specialties` page

**Cause**: Not added to `availablePacks` array

**Solution**:
```typescript
// ehr-web/src/app/admin/specialties/page.tsx
const availablePacks = [
  // ... existing packs
  { slug: 'your-specialty', version: '1.0.0', name: 'Your Specialty', description: '...' },
];
```

---

### ❌ Pitfall 5: Browser Cache

**Symptom**: Changes not visible after refresh

**Cause**: Browser cached old JavaScript bundle

**Solution**:
```bash
# Hard refresh
Mac: Cmd + Shift + R
Windows/Linux: Ctrl + Shift + R

# Or clear cache in DevTools
F12 → Right-click refresh → "Empty Cache and Hard Reload"
```

---

## Troubleshooting

### Issue: "Module not found" error

**Check**:
1. File exists at specified path
2. Exported from index.ts
3. Import path is correct
4. No circular dependencies

**Debug**:
```bash
# Verify file exists
ls -la ehr-web/src/features/specialties/[specialty-name]/

# Check exports
grep "export" ehr-web/src/features/specialties/[specialty-name]/index.ts
grep "[Specialty]Specialty" ehr-web/src/features/specialties/index.ts
```

---

### Issue: Specialty not in dropdown

**Check**:
1. ✅ Registered in `specialty-init-client.tsx`
2. ✅ Exported from `index.ts`
3. ✅ Navigation sections defined in `config.ts`
4. ✅ Browser cache cleared

**Debug**:
```javascript
// In browser console
console.log(specialtyRegistry.getAll());
// Should show your specialty in the array
```

---

### Issue: Components not loading

**Check**:
1. ✅ Components lazy-loaded correctly in `config.ts`
2. ✅ Component files exist
3. ✅ Component exported correctly

**Debug**:
```typescript
// Temporarily remove lazy loading for debugging
components: {
  [SpecialtyName]Overview: [SpecialtyName]Overview,  // Direct import instead of lazy
}
```

---

## Example: Adding Dermatology Specialty

### Complete Implementation Example

#### Step 1: Create Migration

**File**: `ehr-api/src/migrations/add-dermatology-tables.js`

```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'medplum',
  user: process.env.DB_USER || 'medplum',
  password: process.env.DB_PASSWORD || 'medplum123'
});

async function up() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Dermatology patient profile
    await client.query(`
      CREATE TABLE IF NOT EXISTS dermatology_patients (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL UNIQUE,
        skin_type VARCHAR(50),
        primary_concern TEXT,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Skin assessments
    await client.query(`
      CREATE TABLE IF NOT EXISTS dermatology_assessments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id VARCHAR(255) NOT NULL,
        episode_id UUID REFERENCES patient_specialty_episodes(id),
        assessment_date DATE NOT NULL,
        body_location VARCHAR(100),
        condition_type VARCHAR(100),
        severity VARCHAR(50),
        photos JSONB DEFAULT '[]',
        notes TEXT,
        org_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_dermatology_patients_patient_id
      ON dermatology_patients(patient_id);

      CREATE INDEX IF NOT EXISTS idx_dermatology_assessments_patient_id
      ON dermatology_assessments(patient_id);

      CREATE INDEX IF NOT EXISTS idx_dermatology_assessments_episode_id
      ON dermatology_assessments(episode_id);
    `);

    await client.query('COMMIT');
    console.log('✅ Dermatology tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating dermatology tables:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function down() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query('DROP TABLE IF EXISTS dermatology_assessments CASCADE;');
    await client.query('DROP TABLE IF EXISTS dermatology_patients CASCADE;');

    await client.query('COMMIT');
    console.log('✅ Dermatology tables dropped successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error dropping dermatology tables:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  const command = process.argv[2];

  if (command === 'up') {
    up().then(() => process.exit(0)).catch(() => process.exit(1));
  } else if (command === 'down') {
    down().then(() => process.exit(0)).catch(() => process.exit(1));
  } else {
    console.log('Usage: node add-dermatology-tables.js [up|down]');
    process.exit(1);
  }
}

module.exports = { up, down };
```

Run migration:
```bash
cd ehr-api
node src/migrations/add-dermatology-tables.js up
```

#### Step 2: Update Seed Script

**File**: `ehr-api/src/database/seed-scripts/seed-specialty-packs.js`

Add to `SPECIALTY_PACKS` array:
```javascript
{
  pack_slug: 'dermatology',
  pack_version: '1.0.0',
  description: 'Dermatology & Skin Care',
  enabled_by_default: false,
},
```

Run seed:
```bash
node src/database/seed-scripts/seed-specialty-packs.js
```

#### Step 3: Create Frontend Module

**File**: `ehr-web/src/features/specialties/dermatology/config.ts`

```typescript
import { lazy } from 'react';
import { SpecialtyModule } from '../shared/types';

export const DermatologySpecialty: SpecialtyModule = {
  slug: 'dermatology',
  name: 'Dermatology & Skin Care',
  icon: 'Sparkles',
  color: '#EC4899',

  components: {
    DermatologyOverview: lazy(() =>
      import('./components/DermatologyOverview').then(m => ({
        default: m.DermatologyOverview,
      }))
    ),
    SkinAssessment: lazy(() =>
      import('./components/SkinAssessment').then(m => ({
        default: m.SkinAssessment,
      }))
    ),
  },

  episodeHandlers: {
    onCreate: async (episodeId: string) => {
      console.log(`✅ Dermatology episode created: ${episodeId}`);
    },
    onUpdate: async (episodeId: string) => {
      console.log(`📝 Dermatology episode updated: ${episodeId}`);
    },
    onClose: async (episodeId: string) => {
      console.log(`✅ Dermatology episode closed: ${episodeId}`);
    },
  },

  navigation: {
    sections: [
      {
        id: 'dermatology-overview',
        label: 'Dermatology Overview',
        icon: 'LayoutDashboard',
        category: 'clinical',
        componentName: 'DermatologyOverview',
        order: 10,
      },
      {
        id: 'skin-assessment',
        label: 'Skin Assessment',
        icon: 'Scan',
        category: 'clinical',
        componentName: 'SkinAssessment',
        order: 20,
      },
    ],
  },
};
```

**File**: `ehr-web/src/features/specialties/dermatology/index.ts`

```typescript
export { DermatologySpecialty } from './config';
export { DermatologyOverview } from './components/DermatologyOverview';
export { SkinAssessment } from './components/SkinAssessment';
```

#### Step 4: Update Main Export

**File**: `ehr-web/src/features/specialties/index.ts`

```typescript
// Add this line
export { DermatologySpecialty } from './dermatology';
```

#### Step 5: Register in Client

**File**: `ehr-web/src/app/specialty-init-client.tsx`

```typescript
import {
  specialtyRegistry,
  GeneralSpecialty,
  ObGynSpecialty,
  PediatricsSpecialty,
  DermatologySpecialty,  // 👈 ADD IMPORT
} from '@/features/specialties';

export function SpecialtyInitializer() {
  useEffect(() => {
    console.log('🚀 Initializing specialty modules...');

    specialtyRegistry.register(GeneralSpecialty);
    specialtyRegistry.register(ObGynSpecialty);
    specialtyRegistry.register(PediatricsSpecialty);
    specialtyRegistry.register(DermatologySpecialty);  // 👈 ADD REGISTRATION

    // ... rest of code
  }, []);

  return null;
}
```

#### Step 6: Update Admin UI

**File**: `ehr-web/src/app/admin/specialties/page.tsx`

```typescript
const availablePacks = [
  { slug: 'general', version: '1.0.0', name: 'General Primary Care', description: 'Default specialty pack for general primary care practice' },
  { slug: 'ob-gyn', version: '1.0.0', name: 'OB/GYN & Prenatal', description: 'Obstetrics, gynecology, prenatal care, and postpartum workflows' },
  { slug: 'pediatrics', version: '1.0.0', name: 'Pediatrics & Child Health', description: 'Pediatric care, growth monitoring, immunizations, and developmental screening' },
  { slug: 'dermatology', version: '1.0.0', name: 'Dermatology', description: 'Skin conditions, treatments, and cosmetic procedures' },  // 👈 ADD THIS
];
```

#### Step 7: Verify

```bash
# 1. Restart dev server
npm run dev

# 2. Check browser console (F12)
# Should see: "✅ Registered 4 specialty module(s):"

# 3. Navigate to /admin/specialties
# Should see Dermatology in the list

# 4. Open patient → Check sidebar dropdown
# Should see "Dermatology & Skin Care" in specialties section
```

---

## Quick Reference Checklist

When adding a new specialty, check off each item:

### Database Layer
- [ ] Created migration file in `ehr-api/src/migrations/`
- [ ] Ran migration: `node src/migrations/add-[specialty]-tables.js up`
- [ ] Verified tables exist in PostgreSQL

### Backend Layer
- [ ] Added specialty to `SPECIALTY_PACKS` in `seed-specialty-packs.js`
- [ ] Ran seed script: `node src/database/seed-scripts/seed-specialty-packs.js`
- [ ] Verified `org_specialty_settings` has entry

### Frontend Layer - Module
- [ ] Created directory: `ehr-web/src/features/specialties/[specialty-name]/`
- [ ] Created `config.ts` with `SpecialtyModule` configuration
- [ ] Created `index.ts` with exports
- [ ] Created component files in `components/` directory

### Frontend Layer - Registration (CRITICAL!)
- [ ] ✅ Exported from `ehr-web/src/features/specialties/index.ts`
- [ ] ✅ Imported in `ehr-web/src/app/specialty-init-client.tsx`
- [ ] ✅ Registered in `specialty-init-client.tsx` useEffect
- [ ] Added to `availablePacks` in `ehr-web/src/app/admin/specialties/page.tsx`

### Verification
- [ ] Browser console shows specialty registered
- [ ] Admin page shows specialty
- [ ] Sidebar dropdown shows specialty
- [ ] Navigation sections load correctly
- [ ] Components load without errors

---

## Additional Resources

- [Specialty System Architecture](./system-architecture.md)
- [Database Schema Design](./database-schema.md)
- [Component Development Guide](./component-development.md)
- [Testing Specialty Modules](./testing-specialty-modules.md)

---

## Maintenance Notes

**When to update this document**:
- New layers added to specialty system
- Registration process changes
- New configuration options added
- Common pitfalls discovered

**Document Owner**: Development Team
**Review Frequency**: After each specialty implementation
**Last Review**: 2025-12-21
