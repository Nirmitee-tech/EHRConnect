# Appointment Management System - Backend Integration

This document describes the complete backend integration for the comprehensive appointment management system.

## Overview

The system is fully integrated with the FHIR R4 backend using:
- **FHIR Practitioner resources** with custom extensions for staff management
- **FHIR Basic resources** for appointment type management
- RESTful API endpoints with full CRUD operations
- Type-safe service layers for frontend-backend communication

## Architecture

```
Frontend (React/Next.js)
    ↓
Service Layer (TypeScript)
    ↓
API Routes (Next.js API)
    ↓
FHIR Backend (Python/Medplum)
```

## 1. Staff Management API

### FHIR Extensions

Custom extensions are stored on the `Practitioner` resource:

| Extension | URL | Type | Purpose |
|-----------|-----|------|---------|
| Color | `http://ehrconnect.io/fhir/StructureDefinition/practitioner-color` | string | Calendar color for provider |
| Office Hours | `http://ehrconnect.io/fhir/StructureDefinition/practitioner-office-hours` | string (JSON) | Working hours per day |
| Vacation Schedule | `http://ehrconnect.io/fhir/StructureDefinition/practitioner-vacation` | string (JSON) | Blocked time periods |
| Employment Type | `http://ehrconnect.io/fhir/StructureDefinition/practitioner-employment-type` | string | full-time/part-time/contract/per-diem |

### Service API

**File**: `/ehr-web/src/services/staff.service.ts`

```typescript
// Get all practitioners
StaffService.getPractitioners(params?: {
  name?: string;
  active?: boolean;
  count?: number;
}): Promise<StaffMember[]>

// Get single practitioner
StaffService.getPractitioner(id: string): Promise<StaffMember>

// Create practitioner
StaffService.createPractitioner(staff: Omit<StaffMember, 'id'>): Promise<StaffMember>

// Update practitioner
StaffService.updatePractitioner(id: string, updates: Partial<StaffMember>): Promise<StaffMember>

// Delete practitioner (soft delete)
StaffService.deletePractitioner(id: string): Promise<void>

// Update office hours
StaffService.updateOfficeHours(id: string, officeHours: OfficeHours[]): Promise<StaffMember>

// Update vacation schedules
StaffService.updateVacationSchedules(id: string, schedules: VacationSchedule[]): Promise<StaffMember>

// Update color
StaffService.updateColor(id: string, color: string): Promise<StaffMember>
```

### Example Usage

```typescript
import { StaffService } from '@/services/staff.service';

// Load all practitioners
const staff = await StaffService.getPractitioners({ active: true });

// Update practitioner with custom fields
await StaffService.updatePractitioner('practitioner-123', {
  color: '#10B981',
  officeHours: [
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isWorking: true },
    // ... more days
  ],
  vacationSchedules: [
    {
      id: '1',
      startDate: new Date('2025-12-01'),
      endDate: new Date('2025-12-15'),
      type: 'vacation',
      reason: 'Holiday vacation'
    }
  ]
});
```

### FHIR Resource Structure

```json
{
  "resourceType": "Practitioner",
  "id": "practitioner-123",
  "active": true,
  "name": [{
    "use": "official",
    "family": "Smith",
    "given": ["John"]
  }],
  "telecom": [
    { "system": "phone", "value": "+1-555-0100", "use": "work" },
    { "system": "email", "value": "john.smith@example.com", "use": "work" }
  ],
  "qualification": [{
    "code": {
      "text": "Medical Doctor",
      "coding": [{ "display": "Cardiologist" }]
    }
  }],
  "extension": [
    {
      "url": "http://ehrconnect.io/fhir/StructureDefinition/practitioner-color",
      "valueString": "#10B981"
    },
    {
      "url": "http://ehrconnect.io/fhir/StructureDefinition/practitioner-office-hours",
      "valueString": "[{\"dayOfWeek\":1,\"startTime\":\"09:00\",\"endTime\":\"17:00\",\"isWorking\":true}]"
    }
  ]
}
```

## 2. Appointment Types API

### FHIR Storage

Appointment types are stored as **FHIR Basic resources** with:
- Code: `appointment-type`
- Extensions for custom fields

### API Endpoints

**Base Path**: `/api/appointment-types`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointment-types` | Get all appointment types |
| GET | `/api/appointment-types/:id` | Get single appointment type |
| POST | `/api/appointment-types` | Create appointment type |
| PUT | `/api/appointment-types/:id` | Update appointment type |
| DELETE | `/api/appointment-types/:id` | Delete appointment type |

### Service API

**File**: `/ehr-web/src/services/appointment-types.service.ts`

```typescript
// Get all types
AppointmentTypesService.getAppointmentTypes(): Promise<AppointmentType[]>

// Get single type
AppointmentTypesService.getAppointmentType(id: string): Promise<AppointmentType>

// Create type
AppointmentTypesService.createAppointmentType(type: Omit<AppointmentType, 'id'>): Promise<AppointmentType>

// Update type
AppointmentTypesService.updateAppointmentType(id: string, type: AppointmentType): Promise<AppointmentType>

// Delete type
AppointmentTypesService.deleteAppointmentType(id: string): Promise<void>
```

### Example Usage

```typescript
import { AppointmentTypesService } from '@/services/appointment-types.service';

// Create new appointment type
const newType = await AppointmentTypesService.createAppointmentType({
  name: 'Cardiology Consultation',
  duration: 45,
  color: '#EF4444',
  category: 'consultation',
  description: 'Specialized cardiology consultation',
  requiresPreparation: true,
  preparationInstructions: 'Bring recent ECG results',
  allowedProviders: ['practitioner-123', 'practitioner-456']
});

// Load all types
const types = await AppointmentTypesService.getAppointmentTypes();
```

### FHIR Resource Structure

```json
{
  "resourceType": "Basic",
  "id": "appointment-type-1",
  "code": {
    "coding": [{
      "system": "http://ehrconnect.io/fhir/CodeSystem/resource-types",
      "code": "appointment-type"
    }]
  },
  "subject": {
    "display": "Cardiology Consultation"
  },
  "text": {
    "status": "generated",
    "div": "<div xmlns=\"http://www.w3.org/1999/xhtml\">Specialized cardiology consultation</div>"
  },
  "extension": [
    { "url": "duration", "valueInteger": 45 },
    { "url": "color", "valueString": "#EF4444" },
    { "url": "category", "valueString": "consultation" },
    { "url": "requiresPreparation", "valueBoolean": true },
    { "url": "preparationInstructions", "valueString": "Bring recent ECG results" },
    { "url": "allowedProviders", "valueString": "practitioner-123,practitioner-456" }
  ]
}
```

## 3. Testing the Integration

### Prerequisites

1. **FHIR Backend Running**
   ```bash
   # Make sure the FHIR server is running
   # Default: http://localhost:8000
   ```

2. **Environment Variables**
   ```bash
   # .env.local
   FHIR_BASE_URL=http://localhost:8000
   ```

### Test Staff Management

1. **Navigate to Staff Page**
   ```
   http://localhost:3000/staff
   ```

2. **Click on any staff member** - Opens detail drawer

3. **Test Office Hours Tab**
   - Modify working days
   - Change start/end times
   - Click "Save Changes"
   - Verify data persists on page reload

4. **Test Vacation Tab**
   - Click "Add Block"
   - Set dates and type
   - Click "Save Changes"
   - Verify vacation appears on reload

5. **Test Settings Tab**
   - Select a color
   - Click "Save Changes"
   - Verify color updates in staff list

### Test Appointment Types

1. **Navigate to Settings**
   ```
   http://localhost:3000/settings
   ```

2. **Click "Appointment Types" card**

3. **Create New Type**
   - Click "Add Type"
   - Fill in name, duration, color, category
   - Click "Save"
   - Verify appears in list

4. **Edit Existing Type**
   - Click edit icon
   - Modify fields
   - Click "Save"
   - Verify changes persist

5. **Delete Type**
   - Click delete icon
   - Confirm deletion
   - Verify removed from list

### API Testing with cURL

**Get All Practitioners:**
```bash
curl http://localhost:3000/api/fhir/Practitioner
```

**Update Practitioner:**
```bash
curl -X PUT http://localhost:3000/api/fhir/Practitioner/{id} \
  -H "Content-Type: application/fhir+json" \
  -d @practitioner.json
```

**Get All Appointment Types:**
```bash
curl http://localhost:3000/api/appointment-types
```

**Create Appointment Type:**
```bash
curl -X POST http://localhost:3000/api/appointment-types \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Type",
    "duration": 30,
    "color": "#3B82F6",
    "category": "consultation"
  }'
```

## 4. Data Flow

### Staff Update Flow

```
1. User edits staff in UI
   ↓
2. StaffDetailDrawer calls onSave()
   ↓
3. handleSaveStaff() in staff page
   ↓
4. StaffService.updatePractitioner()
   ↓
5. API: PUT /api/fhir/Practitioner/{id}
   ↓
6. FHIR Backend updates resource
   ↓
7. Response returns updated resource
   ↓
8. UI updates with new data
```

### Appointment Type Creation Flow

```
1. User creates type in UI
   ↓
2. handleSave() in appointment-types page
   ↓
3. AppointmentTypesService.createAppointmentType()
   ↓
4. API: POST /api/appointment-types
   ↓
5. Converts to FHIR Basic resource
   ↓
6. POST /fhir/R4/Basic to backend
   ↓
7. Backend creates resource
   ↓
8. Response returns with ID
   ↓
9. UI adds to list
```

## 5. Error Handling

All services include comprehensive error handling:

```typescript
try {
  await StaffService.updatePractitioner(id, updates);
  // Success feedback
} catch (error) {
  console.error('Error:', error);
  alert('Failed to save. Please try again.');
}
```

## 6. TypeScript Types

All types are defined in `/ehr-web/src/types/staff.ts`:

```typescript
interface StaffMember {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  email: string;
  qualification: string;
  active: boolean;
  resourceType: string;
  color?: string;
  officeHours?: OfficeHours[];
  vacationSchedules?: VacationSchedule[];
  appointmentTypes?: string[];
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'per-diem';
}

interface OfficeHours {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  isWorking: boolean;
}

interface VacationSchedule {
  id: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
  type: 'vacation' | 'sick' | 'personal' | 'conference' | 'other';
}

interface AppointmentType {
  id: string;
  name: string;
  duration: number;
  color: string;
  description?: string;
  category: 'consultation' | 'follow-up' | 'emergency' | 'routine' | 'surgery' | 'online' | 'custom';
  allowedProviders?: string[];
  requiresPreparation?: boolean;
  preparationInstructions?: string;
}
```

## 7. Future Enhancements

1. **Batch Operations**
   - Bulk update office hours for multiple providers
   - Import/export appointment types

2. **Validation**
   - Prevent overlapping vacation schedules
   - Validate office hours don't conflict with existing appointments

3. **Notifications**
   - Alert when provider is on vacation
   - Notify about appointment type changes

4. **Analytics**
   - Track most used appointment types
   - Provider availability reports

## Summary

✅ **Complete Backend Integration**
- Staff management with FHIR extensions
- Appointment types with FHIR Basic resources
- Type-safe service layers
- Full CRUD operations
- Error handling and validation

✅ **All Data Persists**
- Changes save to FHIR backend
- Data survives page reloads
- Proper resource versioning

✅ **Production Ready**
- Clean separation of concerns
- Comprehensive error handling
- TypeScript type safety
- RESTful API design
