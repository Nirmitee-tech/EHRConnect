# Bed Management & Hospitalization Module - Implementation Guide

## 📋 Overview

This document describes the complete implementation of the Bed Management & Hospitalization module for the EHR Connect system. The module provides comprehensive inpatient care management, including bed allocation, ward management, patient admissions, transfers, discharges, and real-time occupancy tracking.

## 🎯 Features Implemented

### Core Features
- ✅ **Ward & Room Management** - Hierarchical organization of beds
- ✅ **Bed Management** - Individual bed tracking with status management
- ✅ **Patient Admission** - Complete admission workflow
- ✅ **Bed Assignment** - Assign patients to beds with history tracking
- ✅ **Patient Discharge** - Discharge workflow with summaries
- ✅ **Occupancy Analytics** - Real-time bed occupancy statistics
- ✅ **Ward Occupancy Reports** - Ward-wise occupancy data
- ✅ **Hospitalization Summary** - Overall hospitalization metrics

### Database Schema
- ✅ **8 New Tables** for comprehensive bed management
- ✅ **Automated Triggers** for capacity updates and status changes
- ✅ **FHIR-Compliant** data structure
- ✅ **Audit Trail** integration

### API Endpoints
- ✅ **Ward Management** - CRUD operations for wards
- ✅ **Bed Management** - CRUD operations for beds with status updates
- ✅ **Hospitalization** - Admission, discharge, bed assignment APIs
- ✅ **Analytics** - Occupancy stats, ward occupancy, summary endpoints
- ✅ **Permission-Based** access control

### Type Safety
- ✅ **Complete TypeScript Definitions** for all entities
- ✅ **FHIR Location Mapping** for standards compliance
- ✅ **Request/Response Types** for all API operations

## 📂 Files Created

### Database Layer
```
ehr-api/src/migrations/002_bed_management.sql
```
- Complete database schema with 8 tables
- Automated triggers for capacity and status management
- FHIR-compliant structure

### Backend API
```
ehr-api/src/services/bed-management.js
ehr-api/src/routes/bed-management.js
ehr-api/src/index.js (updated)
```
- Comprehensive service layer with business logic
- RESTful API routes with permission checks
- Integrated with existing auth and RBAC system

### Frontend
```
ehr-web/src/types/bed-management.ts
ehr-web/src/services/bed-management.ts
```
- Complete TypeScript type definitions
- Frontend service for API integration
- Utility functions for common operations

## 🗄️ Database Schema

### Tables Created

1. **`wards`** - Organizational units for bed grouping
   - Ward types: ICU, General, Private, Emergency, etc.
   - Capacity tracking
   - Staff assignments
   - Gender/age restrictions

2. **`rooms`** - Optional bed grouping within wards
   - Room types: Single, Double, Shared, Suite, Isolation
   - Medical equipment tracking (oxygen, suction, monitors, etc.)
   - Maintenance mode support

3. **`beds`** - Individual bed entities
   - Bed types: Standard, ICU, Electric, Pediatric, Bariatric, etc.
   - Real-time status: Available, Occupied, Reserved, Cleaning, Maintenance, Out of Service
   - Current occupancy tracking
   - Equipment features

4. **`hospitalizations`** - Inpatient admission records
   - Complete admission details
   - Clinical information (diagnoses, complaints, notes)
   - Care team assignments
   - Discharge information
   - Length of stay calculation
   - Insurance and billing integration

5. **`bed_assignments`** - Historical bed assignment tracking
   - Complete assignment history
   - Assignment and release tracking
   - Reason codes for changes

6. **`bed_transfers`** - Transfer workflow management
   - Transfer requests and approvals
   - Source and destination tracking
   - Clinical justification
   - Status workflow (requested → approved → completed)

7. **`nursing_rounds`** - Bedside care documentation
   - Vitals recording
   - Medication administration
   - Procedures performed
   - Nursing assessments and notes
   - Escalation tracking

8. **`bed_reservations`** - Pre-admission bed blocking
   - Elective surgery reservations
   - Scheduled admissions
   - Auto-expiration support

### Automated Triggers

1. **`update_ward_capacity()`** - Auto-updates ward capacity when beds added/removed
2. **`update_bed_on_assignment()`** - Auto-updates bed status on assignment/release
3. **`calculate_los()`** - Auto-calculates length of stay on discharge
4. **`auto_expire_reservations()`** - Auto-expires old reservations
5. **`update_timestamp()`** - Auto-updates timestamps on record changes

## 🔌 API Endpoints

### Ward Management

#### `GET /api/bed-management/wards`
Get all wards with filters
- Query params: `locationId`, `active`, `wardType`
- Returns: Array of wards with occupancy stats

#### `GET /api/bed-management/wards/:id`
Get specific ward details
- Returns: Ward with detailed occupancy breakdown

#### `POST /api/bed-management/wards`
Create a new ward
- Body: `CreateWardRequest`
- Returns: Created ward

#### `PUT /api/bed-management/wards/:id`
Update ward details
- Body: Partial `CreateWardRequest`
- Returns: Updated ward

### Bed Management

#### `GET /api/bed-management/beds`
Get all beds with filters
- Query params: `locationId`, `wardId`, `status`, `bedType`, `active`
- Returns: Array of beds with ward/room info

#### `GET /api/bed-management/beds/:id`
Get specific bed details
- Returns: Bed with current patient info (if occupied)

#### `POST /api/bed-management/beds`
Create a new bed
- Body: `CreateBedRequest`
- Returns: Created bed

#### `PATCH /api/bed-management/beds/:id/status`
Update bed status
- Body: `{ status, notes }`
- Returns: Updated bed

### Hospitalization Management

#### `GET /api/bed-management/hospitalizations`
Get all hospitalizations
- Query params: `locationId`, `status`, `wardId`, `attendingDoctorId`, `patientId`
- Returns: Array of hospitalizations

#### `GET /api/bed-management/hospitalizations/:id`
Get specific hospitalization
- Returns: Hospitalization with bed/ward details

#### `POST /api/bed-management/admissions`
Admit a patient
- Body: `AdmitPatientRequest`
- Returns: Created hospitalization record

#### `POST /api/bed-management/hospitalizations/:id/assign-bed`
Assign bed to patient
- Body: `{ bedId, notes }`
- Returns: Success response

#### `POST /api/bed-management/hospitalizations/:id/discharge`
Discharge a patient
- Body: `DischargePatientRequest`
- Returns: Updated hospitalization

### Analytics & Dashboard

#### `GET /api/bed-management/analytics/occupancy`
Get bed occupancy statistics
- Query params: `locationId`
- Returns: `BedOccupancyStats`

#### `GET /api/bed-management/analytics/ward-occupancy`
Get ward-wise occupancy data
- Query params: `locationId`
- Returns: Array of `WardOccupancyData`

#### `GET /api/bed-management/analytics/summary`
Get hospitalization summary
- Query params: `locationId`
- Returns: `HospitalizationSummary`

## 🔐 Permissions Required

The module uses the existing RBAC system with the following permissions:

- `beds:read` - View beds, wards, and occupancy data
- `beds:write` - Create/update beds and wards, change bed status
- `inpatient:read` - View hospitalization records
- `inpatient:write` - Admit, discharge, transfer patients

## 💻 Usage Examples

### Frontend Service Usage

```typescript
import bedManagementService from '@/services/bed-management';

// Get all wards
const wards = await bedManagementService.getWards({
  locationId: 'location-123',
  active: true
});

// Get available beds in ICU
const icuBeds = await bedManagementService.getBeds({
  wardType: 'icu',
  status: 'available',
  active: true
});

// Admit a patient
const admission = await bedManagementService.admitPatient({
  patientId: 'patient-456',
  patientName: 'John Doe',
  locationId: 'location-123',
  admissionDate: new Date().toISOString(),
  admissionType: 'emergency',
  admissionReason: 'Chest pain',
  chiefComplaint: 'Severe chest pain for 2 hours',
  attendingDoctorId: 'doctor-789',
  priority: 'urgent',
  bedId: 'bed-101' // Optional - can assign later
});

// Assign bed to patient
await bedManagementService.assignBed({
  hospitalizationId: admission.id,
  bedId: 'bed-102',
  notes: 'Patient requires cardiac monitoring'
});

// Get occupancy stats
const stats = await bedManagementService.getBedOccupancyStats('location-123');
console.log(`Occupancy Rate: ${stats.occupancyRate}%`);

// Discharge patient
await bedManagementService.dischargePatient({
  hospitalizationId: admission.id,
  dischargeDate: new Date().toISOString(),
  dischargeType: 'normal',
  dischargeSummary: 'Patient recovered, stable for discharge',
  dischargeDisposition: 'home'
});
```

### Backend Service Usage

```javascript
const bedManagementService = require('./services/bed-management');

// In your route handler
router.post('/custom-admission', async (req, res) => {
  try {
    const admission = await bedManagementService.admitPatient(
      req.user.orgId,
      req.user.id,
      req.body
    );

    res.json({ success: true, data: admission });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

## 🚀 Next Steps (UI Implementation)

The following UI components need to be built:

### 1. Ward & Bed Configuration (Admin)
- Ward list with capacity indicators
- Ward creation/edit forms
- Bed list/grid view
- Bulk bed creation wizard
- Bed status management interface

### 2. Bed Status Dashboard
- Real-time bed map (color-coded by status)
- Ward occupancy overview
- Available beds quick view
- Filter by ward type, status, features

### 3. Patient Admission Flow
- Patient search/select
- Admission form with clinical details
- Available bed selection
- Care team assignment
- Insurance/pre-auth capture

### 4. Inpatient List
- Current inpatients table
- Filter by ward, doctor, status
- Quick actions (view, transfer, discharge)
- Patient search
- Export to CSV/PDF

### 5. Transfer Workflow
- Transfer request form
- Available beds for transfer
- Approval workflow (if required)
- Transfer history

### 6. Discharge Workflow
- Discharge form
- Discharge summary
- Final diagnosis and codes
- Discharge instructions
- Billing integration trigger

### 7. Nursing Rounds (Bedside Charting)
- Quick vitals entry
- Medication administration log
- Procedure documentation
- Patient assessment notes
- Alert/escalation buttons

### 8. Reports & Analytics
- Occupancy trends (charts)
- Average length of stay
- Bed turnover rate
- Census reports
- Ward utilization reports
- Export capabilities

### 9. Interactive Ward Map
- Drag-and-drop bed assignment
- Visual bed status indicators
- Floor/ward navigation
- Hover tooltips with patient info
- Click to view details/take action

## 📊 FHIR Compliance

The implementation follows FHIR R4 standards:

### Resource Mapping

| Feature | FHIR Resource | Implementation |
|---------|---------------|----------------|
| Ward | Location (type: ward) | `wards` table |
| Room | Location (type: room) | `rooms` table |
| Bed | Location (type: bed) | `beds` table |
| Admission | Encounter (class: inpatient) | `hospitalizations` table |
| Bed Assignment | Encounter.location | `bed_assignments` table |
| Nursing Notes | Observation | `nursing_rounds` table |
| Care Team | Encounter.participant | `hospitalizations.attending_doctor_id` etc. |

### Location Status Mapping

| Our Status | FHIR operationalStatus |
|-----------|------------------------|
| available | U (Unoccupied) |
| occupied | O (Occupied) |
| cleaning | C (Cleaning) |
| maintenance | C (Closed) |
| reserved | K (Housekeeping) |
| out_of_service | I (Inactive) |

## 🔄 Integration Points

### With Existing Modules

1. **Encounters** - Create inpatient encounter on admission
2. **Billing** - Trigger billing on admission/discharge, capture room charges
3. **Orders** - Link lab/radiology orders to hospitalization
4. **Pharmacy** - Medication orders for inpatients
5. **RBAC** - Use existing permission system
6. **Audit** - Log all bed management activities

### Future Integrations

1. **Notifications** - Real-time alerts for bed status changes
2. **Scheduling** - Schedule elective admissions
3. **Housekeeping** - Auto-notify for bed cleaning
4. **IoT Sensors** - Auto-update bed status from sensors
5. **Mobile App** - Nurse mobile app for bedside documentation
6. **HL7/FHIR Interface** - Export bed census to external systems

## 🧪 Testing Recommendations

### Database Testing
```sql
-- Test ward capacity auto-update
INSERT INTO beds (org_id, location_id, ward_id, bed_number, bed_type, status, status_updated_by)
VALUES ('org-123', 'loc-456', 'ward-789', 'B-101', 'standard', 'available', 'user-123');

-- Verify ward capacity increased
SELECT total_capacity FROM wards WHERE id = 'ward-789';

-- Test bed status auto-update on assignment
INSERT INTO bed_assignments (org_id, hospitalization_id, patient_id, bed_id, ward_id, assigned_by, is_current)
VALUES ('org-123', 'hosp-abc', 'patient-def', 'bed-101', 'ward-789', 'user-123', true);

-- Verify bed status changed to occupied
SELECT status FROM beds WHERE id = 'bed-101';
```

### API Testing
```bash
# Get wards
curl -X GET http://localhost:8000/api/bed-management/wards \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-org-id: $ORG_ID"

# Create a bed
curl -X POST http://localhost:8000/api/bed-management/beds \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-org-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "locationId": "loc-123",
    "wardId": "ward-456",
    "bedNumber": "B-101",
    "bedType": "standard",
    "hasOxygen": true
  }'

# Admit patient
curl -X POST http://localhost:8000/api/bed-management/admissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-org-id: $ORG_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient-789",
    "patientName": "John Doe",
    "locationId": "loc-123",
    "admissionDate": "2025-10-19T10:00:00Z",
    "admissionType": "emergency",
    "admissionReason": "Chest pain",
    "bedId": "bed-101"
  }'
```

## 📝 Migration Instructions

### 1. Run Database Migration

```bash
cd ehr-api
psql -U your_user -d your_database -f src/migrations/002_bed_management.sql
```

### 2. Restart API Server

```bash
cd ehr-api
npm run dev
```

The API will automatically load the new routes.

### 3. Verify API Endpoints

```bash
curl http://localhost:8000/health
# Should return healthy status
```

### 4. Seed Initial Data (Optional)

Create a seed script for:
- Default wards (ICU, General, Emergency)
- Sample beds
- Test admissions

## 🎨 UI Design Guidelines

### Color Coding for Bed Status
- 🟢 **Available** - Green
- 🔴 **Occupied** - Red
- 🟡 **Reserved** - Yellow
- 🔵 **Cleaning** - Blue
- 🟠 **Maintenance** - Orange
- ⚫ **Out of Service** - Gray

### Ward Type Icons
- 🏥 **ICU** - Heart with pulse
- 🛏️ **General** - Bed icon
- 👤 **Private** - Single person
- 👥 **Semi-Private** - Two people
- 🚨 **Emergency** - Emergency icon
- 👶 **Pediatric** - Baby icon
- 🤰 **Maternity** - Pregnant woman icon
- 🔒 **Isolation** - Lock icon

### Priority Indicators
- 🔴 **Emergency** - Red badge
- 🟠 **Urgent** - Orange badge
- 🟢 **Routine** - Green badge

## 📊 Performance Considerations

1. **Indexing** - All foreign keys and commonly queried fields are indexed
2. **Denormalization** - Current bed status stored in `beds` table for quick access
3. **Aggregations** - Use database-level aggregations for occupancy stats
4. **Caching** - Consider caching ward/bed lists (change infrequently)
5. **Real-time Updates** - Use WebSockets for live bed status updates

## 🔒 Security Considerations

1. **Permission Checks** - All endpoints require appropriate permissions
2. **Org Isolation** - All queries filtered by organization ID
3. **Audit Logging** - All bed management activities logged
4. **Data Validation** - Input validation on all API endpoints
5. **Transaction Safety** - Critical operations use database transactions

## 📚 Additional Resources

- [FHIR Location Resource](https://hl7.org/fhir/location.html)
- [FHIR Encounter Resource](https://hl7.org/fhir/encounter.html)
- [FHIR operationalStatus ValueSet](https://terminology.hl7.org/ValueSet-v2-0116.html)

## ✅ Summary

This implementation provides a solid foundation for bed management and hospitalization workflows. The database schema is comprehensive, the API is well-structured and permission-protected, and the type definitions ensure type safety throughout the stack.

**What's Complete:**
- ✅ Complete database schema with triggers
- ✅ Backend API with service layer
- ✅ Frontend TypeScript types and service
- ✅ Permission integration
- ✅ Audit logging
- ✅ Analytics endpoints

**What's Next:**
- 🔲 UI components for ward/bed management
- 🔲 Admission/discharge forms
- 🔲 Interactive bed status dashboard
- 🔲 Transfer workflow UI
- 🔲 Nursing rounds interface
- 🔲 Reports and analytics dashboards
- 🔲 Real-time updates via WebSockets

The foundation is solid and production-ready. UI components can now be built on top of this infrastructure!
