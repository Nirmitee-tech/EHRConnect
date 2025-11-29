# Database Setup Guide

## Quick Start

To set up the complete database with all tables and seed data:

```bash
npm run db:setup:fresh
```

This command will:
1. ✅ Run all 26 migrations (create tables, indexes, triggers)
2. ✅ Run all 4 seeders (roles, billing, providers, inventory)
3. ✅ Complete in seconds with full rollback on errors

## Available Commands

### Main Commands

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run db:setup:fresh` | **Complete setup** (migrations + seeds) | ⭐ First time setup or fresh install |
| `npm run db:setup` | Run pending migrations only | Adding new tables/columns |
| `npm run db:seed` | Run pending seeders only | Adding new data |
| `npm run db:status` | Check migration status | See what's been applied |
| `npm run db:rollback` | Rollback last migration | Undo last change |

### Individual Seed Scripts

```bash
npm run seed:roles           # Seed 29 system roles
npm run seed:billing         # Seed CPT/ICD codes, payers
npm run seed:providers       # Seed 15 sample providers
npm run seed:inventory       # Seed categories, suppliers, locations
```

## Database Structure

### Migrations (26 total)
- ✅ Core schema (users, organizations, roles, permissions)
- ✅ Clinical modules (patients, appointments, encounters)
- ✅ Billing system (CPT codes, ICD codes, claims)
- ✅ Inventory management
- ✅ Integrations (HL7, FHIR, data mappers)
- ✅ Virtual meetings (100ms integration)
- ✅ Forms and consents
- ✅ Patient portal

### Seeders (4 total)

**1. Initial Seed** - 29 system roles
- Platform Admin, Org Owner, Org Admin
- Clinical: Doctor, Nurse, Clinician, Therapist
- Operations: Front Desk, Scheduler, Billing
- Specialized: Lab Tech, Radiologist, Pharmacist

**2. Billing Masters** - Healthcare billing data
- 4 CPT codes (E&M, Cardiology, Lab)
- 4 ICD-10 codes (Diabetes, Hypertension, etc.)
- 3 Billing modifiers
- 3 Payers (Medicare, Blue Cross, UnitedHealth)

**3. Providers** - 15 sample healthcare providers
- Multiple specialties represented
- Complete NPI, license, taxonomy data

**4. Inventory Masters** - Locations, categories, suppliers
- Note: Requires organizations to exist first

## Idempotent Design

All seeders use `ON CONFLICT DO UPDATE`:
- Safe to re-run multiple times
- No duplicate data
- Updates existing records if changed

```bash
# Run as many times as you want - always safe!
npm run db:seed
```

## Reset Database

To completely reset and rebuild:

```bash
node src/database/reset-db.js  # Drops all tables
npm run db:setup:fresh         # Rebuild everything
```

## Verification

Check what's been applied:

```bash
npm run db:status
```

Sample output:
```
up 20240101000000-initial-schema.js
up 20240101000002-enhanced_permissions.js
up 20240101000003-billing_module.js
...
✅ 26 migrations applied
✅ 4 seeders completed
```

## Architecture

### Migration Files
- Location: `src/database/migrations/`
- Format: `YYYYMMDDHHMMSS-description.js`
- SQL embedded directly in JS (no external .sql files)
- Tracked in `SequelizeMeta` table

### Seeder Files
- Location: `src/database/seeders/`
- Support scripts: `src/database/seed-scripts/`
- Tracked in `SequelizeData` table
- All idempotent with UPSERT logic

## Troubleshooting

### "No organizations found"
Some seeders (inventory locations) need organizations first:
1. Create an organization via API or admin panel
2. Re-run: `npm run seed:inventory`

### Migration Conflicts
If migrations conflict:
```bash
npm run db:rollback    # Undo last migration
# Fix the migration file
npm run db:setup       # Try again
```

### Seed Data Issues
Safe to re-run:
```bash
npm run db:seed        # Idempotent - no duplicates
```

## Production Notes

### Safety Features
- ✅ Transaction-based migrations
- ✅ Idempotent seeders
- ✅ Automatic timestamp tracking
- ✅ Rollback support
- ✅ No data loss on re-runs

### Deployment
```bash
# Production database setup
NODE_ENV=production npm run db:setup:fresh

# Or migrations only (preserve data)
NODE_ENV=production npm run db:setup
```

### Backup Before Changes
```bash
pg_dump medplum > backup-$(date +%Y%m%d).sql
npm run db:setup:fresh
```

## Development Workflow

### Adding New Migration
```bash
npx sequelize-cli migration:generate --name add_new_feature
# Edit the generated file in src/database/migrations/
npm run db:setup
```

### Adding New Seeder
```bash
npx sequelize-cli seed:generate --name seed_new_data
# Edit the generated file in src/database/seeders/
npm run db:seed
```

## Summary

The database system is production-ready with:
- 26 working migrations
- 4 idempotent seeders
- Zero data loss on re-runs
- Complete FHIR R4 compatibility
- Scalable architecture

For complete setup, just run:
```bash
npm run db:setup:fresh
```

Done! 🎉
