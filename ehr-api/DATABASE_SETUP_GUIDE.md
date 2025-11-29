# Database Setup & Migration Guide

## Overview
Production-grade database migration and seeding system for EHRConnect.

## ✅ What Was Fixed

### Problems Resolved:
1. ✅ **Restored deleted seeder files** - All `.bak` files restored
2. ✅ **Fixed duplicate migration numbers** - Renumbered 010, 014, 015, 022 conflicts
3. ✅ **Unified migration system** - Single source of truth with Sequelize CLI
4. ✅ **Idempotent seeders** - All seeders use `ON CONFLICT DO UPDATE`
5. ✅ **Proper tracking** - Sequelize meta tables track all migrations/seeds
6. ✅ **Zero data loss** - All tables and seeds preserved

### Migration Numbers Fixed:
- `010_create_data_mapper_table` → `026_create_data_mapper_table`
- `014_create_virtual_meetings_table_v2` → `027_create_virtual_meetings_table_v2`
- `015_create_fhir_encounters_table` → `028_create_fhir_encounters_table`
- `022_forms_sample_templates` → `029_forms_sample_templates`

## Quick Start

### 1. Fresh Database Setup
```bash
# Run all migrations + seeds
npm run db:setup:fresh
```

### 2. Run Only Migrations
```bash
# Run pending migrations
npm run db:setup

# Or using Sequelize CLI directly
npm run migrate
```

### 3. Run Only Seeds
```bash
# Run all seeds (idempotent - safe to re-run!)
npm run db:seed

# Or using Sequelize CLI directly
npm run seed
```

### 4. Check Status
```bash
# See which migrations have been run
npm run db:status
```

### 5. Rollback
```bash
# Rollback last migration
npm run db:rollback
```

## Available Commands

### High-Level Commands (Recommended)
| Command | Description |
|---------|-------------|
| `npm run db:setup` | Run all pending migrations |
| `npm run db:setup:fresh` | Fresh setup (migrate + seed) |
| `npm run db:seed` | Run all seeders (idempotent) |
| `npm run db:status` | Check migration status |
| `npm run db:rollback` | Rollback last migration |

### Sequelize CLI Commands (Advanced)
| Command | Description |
|---------|-------------|
| `npm run migrate` | Run migrations |
| `npm run migrate:status` | Show migration status |
| `npm run migrate:undo` | Undo last migration |
| `npm run migrate:undo:all` | Undo all migrations |
| `npm run seed` | Run all seeders |
| `npm run seed:undo` | Undo all seeders |

### Legacy Commands (Still Work)
| Command | Description |
|---------|-------------|
| `npm run seed:billing` | Run billing masters seed |
| `npm run seed:providers` | Run providers seed |
| `npm run seed:roles` | Run roles seed |
| `npm run seed:inventory` | Run inventory seed |

## Migration Structure

### Files Organization:
```
src/database/migrations/
├── 002_enhanced_permissions.sql
├── 20240101000002-enhanced_permissions.js (wrapper)
├── 003_billing_module.sql
├── 20240101000003-billing_module.js (wrapper)
└── ...
```

### How It Works:
1. **SQL files** contain the actual DDL statements
2. **JS files** wrap the SQL and provide Sequelize integration
3. **Sequelize tracks** execution in `SequelizeMeta` table
4. **Timestamps prevent** migration number conflicts

## Seeding System

### Seed Files:
```
src/database/seeders/
├── 20240101000000-initial-seed.js
├── 20240102000001-billing-masters.js
├── 20240102000002-providers.js
├── 20240102000003-inventory-masters.js
├── seed-billing-masters.js (actual data)
├── providers.seeder.js (actual data)
└── seed-inventory-masters.js (actual data)
```

### Key Features:
1. **Idempotent** - Uses `ON CONFLICT DO UPDATE` everywhere
2. **Safe to re-run** - Won't create duplicates
3. **Tracked** - Sequelize tracks in `SequelizeData` table
4. **Environment-aware** - Cleanup only in dev/test

### Example Idempotent Insert:
```javascript
await pool.query(
  `INSERT INTO billing_cpt_codes (code, description, category)
   VALUES ($1, $2, $3)
   ON CONFLICT (code) DO UPDATE
     SET description = EXCLUDED.description,
         category = EXCLUDED.category,
         updated_at = NOW()`,
  [code, description, category]
);
```

## Creating New Migrations

### 1. Generate Migration File
```bash
npx sequelize-cli migration:generate --name add-patient-consent-table
```

This creates: `src/database/migrations/YYYYMMDDHHMMSS-add-patient-consent-table.js`

### 2. Create SQL File
Create the matching SQL file:
```sql
-- YYYYMMDDHHMMSS_add_patient_consent_table.sql
CREATE TABLE IF NOT EXISTS patient_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  consent_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_patient_consents_patient_id ON patient_consents(patient_id);
```

### 3. Update JS Wrapper
```javascript
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sqlPath = path.resolve(__dirname, 'YYYYMMDDHHMMSS_add_patient_consent_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    const config = queryInterface.sequelize.config;
    const pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
    });

    try {
      console.log('🔄 Executing add_patient_consent_table.sql...');
      await pool.query(sql);
      console.log('✅ Migration completed');
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      throw error;
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    const rollbackPath = path.resolve(__dirname, 'YYYYMMDDHHMMSS_add_patient_consent_table_rollback.sql');

    if (!fs.existsSync(rollbackPath)) {
      throw new Error('Rollback file not found!');
    }

    // ... rollback logic
  }
};
```

### 4. Create Rollback SQL
```sql
-- YYYYMMDDHHMMSS_add_patient_consent_table_rollback.sql
DROP TABLE IF EXISTS patient_consents CASCADE;
```

### 5. Test Both Directions
```bash
# Test up migration
npm run migrate

# Test down migration
npm run migrate:undo

# Test up again
npm run migrate
```

## Creating New Seeders

### 1. Generate Seeder File
```bash
npx sequelize-cli seed:generate --name sample-patients
```

### 2. Make It Idempotent
```javascript
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const config = queryInterface.sequelize.config;
    const pool = new Pool({...config});

    const patients = [
      { id: '...', name: 'John Doe', ... },
      // ... more patients
    ];

    try {
      for (const patient of patients) {
        // Use ON CONFLICT for idempotency
        await pool.query(
          `INSERT INTO patients (id, name, email, phone)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO UPDATE
             SET name = EXCLUDED.name,
                 email = EXCLUDED.email,
                 phone = EXCLUDED.phone,
                 updated_at = NOW()`,
          [patient.id, patient.name, patient.email, patient.phone]
        );
      }
      console.log('✅ Patients seeded');
    } finally {
      await pool.end();
    }
  },

  down: async (queryInterface, Sequelize) => {
    if (process.env.NODE_ENV !== 'production') {
      await queryInterface.bulkDelete('patients', null, {});
    }
  }
};
```

## Best Practices

### ✅ DO:
- ✅ Use Sequelize CLI timestamp format for new migrations
- ✅ Always create matching SQL and JS files
- ✅ Make all seeds idempotent with `ON CONFLICT DO UPDATE`
- ✅ Test both up and down migrations
- ✅ Use transactions for data migrations
- ✅ Create rollback files for all migrations
- ✅ Run `npm run db:status` before and after migrations

### ❌ DON'T:
- ❌ Edit migrations after they've been deployed
- ❌ Manually create migration numbers
- ❌ Skip rollback implementation
- ❌ Commit `.bak` files
- ❌ Use `execSync()` in migrations (except for special cases)
- ❌ Hardcode environment-specific data

## Team Workflow

### Starting Work:
```bash
git pull
npm run db:setup        # Apply any new migrations
npm run db:seed         # Update seed data (idempotent)
```

### Creating a Migration:
```bash
# Generate timestamped migration
npx sequelize-cli migration:generate --name your-change

# Edit the generated files
# Create SQL files
# Test locally

git add src/database/migrations/
git commit -m "Add migration: your-change"
git push
```

### No More Conflicts!
- Timestamps prevent migration number conflicts
- Multiple developers can work in parallel
- Git will merge migrations cleanly

## Production Deployment

### Pre-Deployment Checklist:
- [ ] All migrations tested in staging
- [ ] Rollbacks tested in staging
- [ ] Seeds are idempotent
- [ ] Database backup created
- [ ] Migration status checked
- [ ] Rollback plan ready

### Deployment Steps:
```bash
# 1. Backup database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Check current status
npm run db:status

# 3. Run migrations
npm run db:setup

# 4. Verify
npm run db:status

# 5. Run seeds (optional, usually only in dev)
npm run db:seed
```

### Rollback Plan:
```bash
# If migration fails:
npm run db:rollback

# Or restore from backup:
psql $DATABASE_URL < backup_20241129_120000.sql
```

## Monitoring

### Check Migration Status:
```bash
npm run db:status
```

### Query Sequelize Meta Tables:
```sql
-- See executed migrations
SELECT * FROM "SequelizeMeta" ORDER BY name;

-- See executed seeds
SELECT * FROM "SequelizeData" ORDER BY name;
```

### Verify Data Integrity:
```bash
# Custom verification script
node src/migrations/verify-db.js
```

## Troubleshooting

### Migration Stuck?
```bash
# Check what's running
SELECT * FROM pg_stat_activity WHERE state = 'active';

# Check locks
SELECT * FROM pg_locks WHERE NOT granted;

# Kill stuck query (if needed)
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid = <PID>;
```

### Seed Already Run?
```bash
# Seeds are idempotent - just run again
npm run db:seed
```

### Migration Failed Mid-Way?
```bash
# Manually mark as not run
DELETE FROM "SequelizeMeta" WHERE name = 'YYYYMMDDHHMMSS-migration-name.js';

# Or restore from backup
psql $DATABASE_URL < backup.sql
```

## Why This System Scales

1. **Timestamp-based ordering** - No number conflicts
2. **Idempotent seeds** - Safe to re-run anytime
3. **Proper tracking** - Know exactly what's been run
4. **Git-friendly** - Merges cleanly
5. **Rollback support** - Can undo changes safely
6. **Environment-aware** - Different behavior in prod vs dev
7. **Zero data loss** - Preserved all existing migrations
8. **Team collaboration** - Multiple developers can work in parallel
9. **Production-ready** - Battle-tested with Sequelize
10. **Maintainable** - Clear structure and patterns

## Summary

You now have:
- ✅ **No duplicate migrations** - All conflicts resolved
- ✅ **Unified tracking** - Sequelize manages everything
- ✅ **Idempotent seeds** - Safe to run multiple times
- ✅ **Proper rollbacks** - Can undo changes
- ✅ **Zero data loss** - All tables and seeds preserved
- ✅ **Team-ready** - Timestamp-based migrations prevent conflicts
- ✅ **Production-ready** - Battle-tested patterns

## Next Steps

1. Review the changes with your team
2. Test the migration flow locally
3. Document any custom migration patterns
4. Train team on new workflow
5. Set up pre-commit hooks for migrations
6. Add migration testing to CI/CD

Need help? Check the migration logs or run `npm run db:status`
