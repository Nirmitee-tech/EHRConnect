# Fix "column resource_data does not exist" Error

## Problem
The booking widget shows: "column 'resource_data' does not exist"

## Root Cause
The database schema hasn't been initialized yet. The `fhir_resources` table needs to be created.

## Solution - Step by Step

### Step 1: Start PostgreSQL

```bash
brew services start postgresql
```

Verify it's running:
```bash
psql -U medplum -d medplum -c "SELECT 1;"
```

Expected output:
```
 ?column?
----------
        1
(1 row)
```

### Step 2: Start Redis

```bash
brew services start redis
```

Verify it's running:
```bash
redis-cli ping
```

Expected output:
```
PONG
```

### Step 3: Start Backend (This will initialize the database)

```bash
cd ehr-api
npm run dev
```

**Important:** Wait for these messages:
```
✅ Database initialized successfully
✅ Redis connected successfully
✅ Connected to PostgreSQL database
🚀 Server running on port 8000
```

The backend automatically creates all database tables on startup, including `fhir_resources` with the `resource_data` column.

### Step 4: Run the Multi-Tenant Security Migration

In a **new terminal** (keep the backend running):

```bash
cd ehr-api
node src/database/run-migration.js 001_add_org_id_to_fhir_resources.sql
```

Expected output:
```
🔄 Running migration: 001_add_org_id_to_fhir_resources.sql
✅ Migration completed: 001_add_org_id_to_fhir_resources.sql
✅ All migrations completed successfully!
```

### Step 5: Start Frontend

In another **new terminal**:

```bash
cd ehr-web
npm run dev
```

### Step 6: Test the Booking Widget

1. Login to the application at http://localhost:3000
2. Click your profile dropdown (top right)
3. Click "Book Appointment (Public Widget)"
4. The widget should now load without errors!

## Troubleshooting

### If PostgreSQL won't start:

```bash
# Check status
brew services list

# If it shows error, try:
brew services restart postgresql

# Or check logs
tail -f /opt/homebrew/var/log/postgres.log
```

### If database exists but table is missing:

```bash
# Connect to database
psql -U medplum -d medplum

# Check if table exists
\dt fhir_resources

# If table doesn't exist, restart the backend
# It will automatically create it
```

### If you see "org_id column already exists" error:

This means the migration already ran. You can ignore this or run:

```bash
psql -U medplum -d medplum -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'fhir_resources' ORDER BY ordinal_position;"
```

This shows all columns. You should see both `resource_data` and `org_id`.

## Quick Check Script

Run this to verify everything is set up correctly:

```bash
cd /Users/apple/EHRConnect/EHRConnect
./check-services.sh
```

This will show you what services are running and what needs to be started.

## Summary

The error happens because:
1. ❌ PostgreSQL wasn't running
2. ❌ Backend wasn't started (so database wasn't initialized)
3. ❌ Tables don't exist yet

The fix is simple:
1. ✅ Start PostgreSQL
2. ✅ Start backend (auto-creates tables)
3. ✅ Run migration (adds org_id column)
4. ✅ Test the widget

After following these steps, the booking widget will work properly!
