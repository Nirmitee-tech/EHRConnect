# Bed Management Module - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

This guide will help you quickly deploy and test the Bed Management & Hospitalization module.

## Step 1: Run Database Migration (2 minutes)

```bash
# Navigate to API directory
cd ehr-api

# Run the migration
PGPASSWORD=medplum123 psql -U medplum -d medplum -f src/migrations/002_bed_management.sql

# Verify tables were created
PGPASSWORD=medplum123 psql -U medplum -d medplum -c "\dt" | grep -E "wards|beds|hospitalizations"
```

Expected output:
```
public | bed_assignments        | table | medplum
public | bed_reservations       | table | medplum
public | bed_transfers          | table | medplum
public | beds                   | table | medplum
public | hospitalizations       | table | medplum
public | nursing_rounds         | table | medplum
public | rooms                  | table | medplum
public | wards                  | table | medplum
```

## Step 2: Restart API Server (1 minute)

```bash
# Still in ehr-api directory
npm run dev
```

You should see:
```
✅ Connected to PostgreSQL database
🚀 FHIR R4 Server running on http://localhost:8000
```

## Step 3: Test API Endpoints (2 minutes)

### Set Environment Variables

```bash
# Get your auth token and org ID from the browser localStorage
# or use the login endpoint

export TOKEN="your-auth-token-here"
export ORG_ID="your-org-id-here"
```

### Test 1: Create a Ward

```bash
curl -X POST http://localhost:8000/api/bed-management/wards \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-org-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "locationId": "'$LOCATION_ID'",
    "name": "ICU Ward 1",
    "code": "ICU-1",
    "wardType": "icu",
    "specialty": "critical_care",
    "floorNumber": "2",
    "genderRestriction": "none",
    "ageRestriction": "adult"
  }'
```

### Test 2: Create Beds

```bash
# Save the ward ID from previous response
export WARD_ID="ward-id-from-response"

# Create bed 1
curl -X POST http://localhost:8000/api/bed-management/beds \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-org-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "locationId": "'$LOCATION_ID'",
    "wardId": "'$WARD_ID'",
    "bedNumber": "ICU-101",
    "bedType": "icu",
    "hasOxygen": true,
    "hasMonitor": true,
    "hasVentilator": true
  }'

# Create bed 2
curl -X POST http://localhost:8000/api/bed-management/beds \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-org-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "locationId": "'$LOCATION_ID'",
    "wardId": "'$WARD_ID'",
    "bedNumber": "ICU-102",
    "bedType": "icu",
    "hasOxygen": true,
    "hasMonitor": true,
    "hasVentilator": true
  }'
```

### Test 3: Get Occupancy Stats

```bash
curl -X GET "http://localhost:8000/api/bed-management/analytics/occupancy" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-org-id: $ORG_ID"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "total_beds": "2",
    "occupied_beds": "0",
    "available_beds": "2",
    "reserved_beds": "0",
    "cleaning_beds": "0",
    "maintenance_beds": "0",
    "out_of_service_beds": "0",
    "occupancy_rate": "0.00"
  }
}
```

### Test 4: Admit a Patient

```bash
# You need a patient ID from your FHIR patients
export PATIENT_ID="your-patient-id"
export BED_ID="bed-id-from-previous-step"

curl -X POST http://localhost:8000/api/bed-management/admissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-org-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "'$PATIENT_ID'",
    "patientName": "John Doe",
    "patientMrn": "MRN-12345",
    "locationId": "'$LOCATION_ID'",
    "admissionDate": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "admissionType": "emergency",
    "admissionSource": "emergency",
    "admissionReason": "Chest pain and shortness of breath",
    "chiefComplaint": "Severe chest pain for 2 hours",
    "primaryDiagnosis": "Acute Coronary Syndrome",
    "priority": "urgent",
    "bedId": "'$BED_ID'"
  }'
```

### Test 5: Check Updated Occupancy

```bash
curl -X GET "http://localhost:8000/api/bed-management/analytics/occupancy" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-org-id: $ORG_ID"
```

Now you should see:
```json
{
  "total_beds": "2",
  "occupied_beds": "1",
  "available_beds": "1",
  "occupancy_rate": "50.00"
}
```

## Step 4: Seed Sample Data (Optional)

Create a file `ehr-api/src/scripts/seed-bed-management.js`:

```javascript
const db = require('../database/connection');

async function seedBedManagement() {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // Get first organization and location
    const orgResult = await client.query(
      'SELECT id FROM organizations WHERE status = $1 LIMIT 1',
      ['active']
    );
    const orgId = orgResult.rows[0].id;

    const locationResult = await client.query(
      'SELECT id FROM locations WHERE org_id = $1 AND active = true LIMIT 1',
      [orgId]
    );
    const locationId = locationResult.rows[0].id;

    // Create wards
    const wards = [
      { name: 'ICU Ward', code: 'ICU', type: 'icu', floor: '2' },
      { name: 'General Ward A', code: 'GEN-A', type: 'general', floor: '1' },
      { name: 'Private Wing', code: 'PVT', type: 'private', floor: '3' },
      { name: 'Emergency Ward', code: 'ER', type: 'emergency', floor: 'G' }
    ];

    for (const ward of wards) {
      const wardResult = await client.query(
        `INSERT INTO wards (org_id, location_id, name, code, ward_type, floor_number, active)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         RETURNING id`,
        [orgId, locationId, ward.name, ward.code, ward.type, ward.floor]
      );

      const wardId = wardResult.rows[0].id;

      // Create beds for each ward
      const bedCount = ward.type === 'icu' ? 8 : ward.type === 'private' ? 10 : 20;

      for (let i = 1; i <= bedCount; i++) {
        const bedNumber = `${ward.code}-${String(i).padStart(2, '0')}`;
        await client.query(
          `INSERT INTO beds (
            org_id, location_id, ward_id, bed_number, bed_type,
            has_oxygen, has_monitor, status, active
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'available', true)`,
          [
            orgId,
            locationId,
            wardId,
            bedNumber,
            ward.type === 'icu' ? 'icu' : 'standard',
            ward.type === 'icu',
            ward.type === 'icu',
          ]
        );
      }

      console.log(`✅ Created ${ward.name} with ${bedCount} beds`);
    }

    await client.query('COMMIT');
    console.log('✅ Bed management data seeded successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    client.release();
  }
}

seedBedManagement()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

Run it:
```bash
cd ehr-api
node src/scripts/seed-bed-management.js
```

## 🎯 What's Next?

Now that the backend is working, you can:

1. **Build the UI Components** - Start with the bed status dashboard
2. **Test Workflows** - Try admitting, transferring, and discharging patients
3. **Customize** - Modify ward types, bed types, or add custom fields
4. **Integrate** - Connect with encounters, billing, and orders modules

## 🔧 Troubleshooting

### Issue: "relation wards does not exist"
**Solution:** Run the migration again. Make sure you're connected to the correct database.

### Issue: "permission denied"
**Solution:** Check your user has the required permissions:
```sql
SELECT key FROM roles r
JOIN role_assignments ra ON r.id = ra.role_id
WHERE ra.user_id = 'your-user-id';
```

You need roles with `beds:read`, `beds:write`, `inpatient:read`, `inpatient:write` permissions.

### Issue: "Token invalid"
**Solution:** Get a fresh token by logging in again through the UI or auth API.

### Issue: API returns 404
**Solution:** Make sure you restarted the API server after adding the routes.

## 📱 Frontend Integration

To use in your Next.js app:

```typescript
// In any page or component
import bedManagementService from '@/services/bed-management';

export default function BedManagementPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function loadStats() {
      const data = await bedManagementService.getBedOccupancyStats();
      setStats(data);
    }
    loadStats();
  }, []);

  return (
    <div>
      <h1>Bed Occupancy</h1>
      {stats && (
        <div>
          <p>Total Beds: {stats.totalBeds}</p>
          <p>Occupied: {stats.occupiedBeds}</p>
          <p>Available: {stats.availableBeds}</p>
          <p>Occupancy Rate: {stats.occupancyRate}%</p>
        </div>
      )}
    </div>
  );
}
```

## 📊 Sample Queries

### Get all admitted patients
```sql
SELECT
  h.patient_name,
  b.bed_number,
  w.name as ward_name,
  h.admission_date,
  EXTRACT(DAY FROM (CURRENT_TIMESTAMP - h.admission_date)) as days_admitted
FROM hospitalizations h
JOIN beds b ON h.current_bed_id = b.id
JOIN wards w ON h.current_ward_id = w.id
WHERE h.status = 'admitted'
ORDER BY h.admission_date DESC;
```

### Get ward occupancy summary
```sql
SELECT
  w.name,
  w.ward_type,
  COUNT(b.id) as total_beds,
  COUNT(CASE WHEN b.status = 'occupied' THEN 1 END) as occupied,
  COUNT(CASE WHEN b.status = 'available' THEN 1 END) as available,
  ROUND(
    COUNT(CASE WHEN b.status = 'occupied' THEN 1 END)::numeric /
    NULLIF(COUNT(b.id), 0) * 100, 2
  ) as occupancy_rate
FROM wards w
LEFT JOIN beds b ON b.ward_id = w.id AND b.active = true
WHERE w.active = true
GROUP BY w.id, w.name, w.ward_type
ORDER BY w.name;
```

### Find available ICU beds with ventilators
```sql
SELECT
  b.bed_number,
  w.name as ward_name,
  w.floor_number,
  b.has_oxygen,
  b.has_monitor,
  b.has_ventilator
FROM beds b
JOIN wards w ON b.ward_id = w.id
WHERE b.status = 'available'
  AND b.bed_type = 'icu'
  AND b.has_ventilator = true
  AND b.active = true
ORDER BY w.name, b.bed_number;
```

## ✅ Checklist

- [ ] Database migration completed successfully
- [ ] API server restarted
- [ ] Created at least one ward
- [ ] Created at least one bed
- [ ] Tested occupancy stats endpoint
- [ ] Successfully admitted a test patient
- [ ] Verified bed status updated to "occupied"
- [ ] Tested discharge workflow
- [ ] Verified bed status updated to "cleaning"

## 🎉 Success!

If you've completed all the tests above, your Bed Management module is fully operational and ready for UI development!

For detailed implementation information, see [BED_MANAGEMENT_IMPLEMENTATION.md](./BED_MANAGEMENT_IMPLEMENTATION.md)
