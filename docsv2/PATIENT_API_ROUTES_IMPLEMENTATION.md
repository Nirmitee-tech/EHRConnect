# Patient Portal API Routes Implementation

## Overview

All patient portal API endpoints were returning 404 errors because the route files didn't exist. This document details the implementation of all required patient portal API routes.

**Status:** ✅ COMPLETE
**Version:** 2.0.5
**Date:** 2025-11-02

---

## Problem

Patient portal pages were calling API endpoints that didn't exist:

```
GET  /api/patient/appointments?filter=past          → 404
GET  /api/patient/appointments/book                 → 404
GET  /api/patient/health-records                    → 404
GET  /api/patient/messages/conversations            → 404
GET  /api/patient/messages/{conversationId}         → 404
POST /api/patient/messages/send                     → 404
POST /api/patient/messages/new                      → 404
GET  /api/patient/providers                         → 404
```

Only these routes existed:
- `/api/patient/dashboard` ✓
- `/api/patient/register` ✓
- `/api/patient/grant-portal-access` ✓
- `/api/patient/check-portal-access` ✓

---

## Solution

Created all missing API routes with proper authentication and session handling.

---

## API Routes Implemented

### 1. GET `/api/patient/appointments`

**Purpose:** Get patient appointments with filtering

**Query Parameters:**
- `filter` (optional): `upcoming` | `past` | `all` | custom status list

**Response:**
```json
[
  {
    "resourceType": "Appointment",
    "id": "appt-123",
    "status": "booked",
    "start": "2025-11-05T10:00:00Z",
    "end": "2025-11-05T10:30:00Z",
    "participant": [...],
    "serviceType": [...]
  }
]
```

**Implementation:**
- Authenticates user via session
- Extracts `patientId` from `session.patientId`
- Calls `PatientPortalService.getPatientAppointments(patientId, searchParams)`
- Supports filtering by:
  - `upcoming`: Future appointments (booked, pending, arrived, checked-in)
  - `past`: Historical appointments (fulfilled, cancelled, noshow)
  - `all`: No filter
  - Custom: Comma-separated status list

**File:** `/src/app/api/patient/appointments/route.ts`

---

### 2. POST `/api/patient/appointments/book`

**Purpose:** Book a new appointment

**Request Body:**
```json
{
  "practitionerId": "prac-123",
  "serviceType": "Consultation",
  "start": "2025-11-05T10:00:00Z",
  "end": "2025-11-05T10:30:00Z",
  "reason": "Follow-up visit"
}
```

**Response:**
```json
{
  "resourceType": "Appointment",
  "id": "appt-456",
  "status": "pending",
  ...
}
```

**Implementation:**
- Authenticates user
- Gets `patientId` from session
- Validates required fields
- Calls `PatientPortalService.bookAppointment(patientId, appointmentData)`
- Creates FHIR Appointment resource with status "pending" (awaiting approval)

**File:** `/src/app/api/patient/appointments/book/route.ts`

---

### 3. GET `/api/patient/health-records`

**Purpose:** Get comprehensive patient health records

**Response:**
```json
{
  "medications": [...],      // MedicationRequest resources
  "allergies": [...],        // AllergyIntolerance resources
  "conditions": [...],       // Condition resources
  "observations": [...],     // Observation resources (including vitals)
  "immunizations": [...]     // Immunization resources
}
```

**Implementation:**
- Authenticates user
- Gets `patientId` from session
- Calls `PatientPortalService.getPatientHealthRecords(patientId)`
- Fetches all health data in parallel from FHIR:
  - Active medications
  - Active allergies
  - Active conditions
  - Recent observations (100 max)
  - All immunizations

**File:** `/src/app/api/patient/health-records/route.ts`

---

### 4. GET `/api/patient/messages/conversations`

**Purpose:** Get list of message conversations

**Response:**
```json
[
  {
    "id": "Practitioner/prac-123",
    "otherParty": "Practitioner/prac-123",
    "lastMessage": {...},
    "messageCount": 5,
    "unreadCount": 0
  }
]
```

**Implementation:**
- Authenticates user
- Gets `patientId` from session
- Calls `PatientPortalService.getPatientMessages(patientId)`
- Groups messages into conversations by sender/recipient
- Returns conversation summary with last message and counts

**Note:** FHIR Communication resources don't have a native "conversation" concept, so we group messages by the other party (practitioner/provider).

**File:** `/src/app/api/patient/messages/conversations/route.ts`

---

### 5. GET `/api/patient/messages/[conversationId]`

**Purpose:** Get all messages in a specific conversation

**URL Parameter:**
- `conversationId`: The FHIR reference of the other party (e.g., `Practitioner/prac-123`)

**Response:**
```json
[
  {
    "resourceType": "Communication",
    "id": "comm-123",
    "status": "completed",
    "sender": { "reference": "Patient/pat-456" },
    "recipient": [{ "reference": "Practitioner/prac-123" }],
    "sent": "2025-11-01T10:00:00Z",
    "subject": { "display": "Question about medication" },
    "payload": [{ "contentString": "Hello doctor..." }]
  }
]
```

**Implementation:**
- Authenticates user
- Gets `patientId` from session
- Gets all patient messages
- Filters messages between patient and the specified conversation party
- Sorts by date (oldest first)

**File:** `/src/app/api/patient/messages/[conversationId]/route.ts`

---

### 6. POST `/api/patient/messages/send`

**Purpose:** Send a message in an existing conversation

**Request Body:**
```json
{
  "recipientId": "Practitioner/prac-123",
  "subject": "Follow-up question",
  "message": "Thank you for the information..."
}
```

**Response:**
```json
{
  "resourceType": "Communication",
  "id": "comm-789",
  "status": "completed",
  ...
}
```

**Implementation:**
- Authenticates user
- Gets `patientId` from session
- Validates required fields
- Calls `PatientPortalService.sendMessage(patientId, recipientId, subject, message)`
- Creates FHIR Communication resource

**File:** `/src/app/api/patient/messages/send/route.ts`

---

### 7. POST `/api/patient/messages/new`

**Purpose:** Start a new conversation (send first message)

**Request Body:**
```json
{
  "recipientId": "Practitioner/prac-123",
  "subject": "Question about my prescription",
  "message": "Hello, I have a question..."
}
```

**Response:**
```json
{
  "resourceType": "Communication",
  "id": "comm-101",
  "status": "completed",
  ...
}
```

**Implementation:**
- Same as `/send` but requires all fields (recipientId, subject, message)
- Creates the first message in a new conversation thread

**File:** `/src/app/api/patient/messages/new/route.ts`

---

### 8. GET `/api/patient/providers`

**Purpose:** Get list of healthcare providers/practitioners

**Response:**
```json
{
  "providers": [
    {
      "id": "prac-123",
      "reference": "Practitioner/prac-123",
      "name": "Dr. John Smith",
      "specialty": "Family Medicine",
      "photo": "https://..."
    }
  ]
}
```

**Implementation:**
- Authenticates user
- Gets `patientId` from session
- First tries to get practitioners from patient's CareTeam
- If no CareTeam found, returns all active practitioners
- Formats practitioner data with name, specialty, and photo

**File:** `/src/app/api/patient/providers/route.ts`

---

## Common Patterns

### Authentication

All routes follow this pattern:

```typescript
const session = await getServerSession(authOptions)

if (!session?.user) {
  return NextResponse.json(
    { message: 'Unauthorized' },
    { status: 401 }
  )
}

// Get patient ID from session - stored at top level
const patientId = session.patientId

if (!patientId) {
  return NextResponse.json(
    { message: 'Patient ID not found' },
    { status: 400 }
  )
}
```

**Key Points:**
- ✅ Use `session.patientId` (top level), NOT `session.user.patientId`
- ✅ Check both session existence and patientId presence
- ✅ Return appropriate HTTP status codes (401, 400, 500)

---

### Error Handling

All routes include try-catch blocks:

```typescript
try {
  // Route logic
  return NextResponse.json(data)
} catch (error: any) {
  console.error('Error description:', error)
  return NextResponse.json(
    { message: error.message || 'Generic error message' },
    { status: 500 }
  )
}
```

---

### Service Layer

All routes delegate business logic to `PatientPortalService`:

```typescript
import { PatientPortalService } from '@/services/patient-portal.service'

// In route handler
const data = await PatientPortalService.getPatientDashboard(patientId)
```

This keeps routes thin and testable.

---

## Directory Structure

```
src/app/api/patient/
├── appointments/
│   ├── route.ts                    # GET appointments
│   └── book/
│       └── route.ts                # POST book appointment
├── check-portal-access/
│   └── route.ts                    # GET check access (existing)
├── dashboard/
│   └── route.ts                    # GET dashboard (existing, fixed)
├── grant-portal-access/
│   └── route.ts                    # POST grant access (existing)
├── health-records/
│   └── route.ts                    # GET health records
├── messages/
│   ├── conversations/
│   │   └── route.ts                # GET conversations list
│   ├── [conversationId]/
│   │   └── route.ts                # GET conversation messages
│   ├── send/
│   │   └── route.ts                # POST send message
│   └── new/
│       └── route.ts                # POST new conversation
├── providers/
│   └── route.ts                    # GET providers list
└── register/
    └── route.ts                    # POST register patient (existing)
```

---

## Testing

### Test Appointments Endpoint

```bash
# Login first to get session cookie, then:

# Get upcoming appointments
curl http://localhost:3000/api/patient/appointments?filter=upcoming \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Get past appointments
curl http://localhost:3000/api/patient/appointments?filter=past \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Book appointment
curl -X POST http://localhost:3000/api/patient/appointments/book \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "practitionerId": "prac-123",
    "serviceType": "Consultation",
    "start": "2025-11-05T10:00:00Z",
    "end": "2025-11-05T10:30:00Z",
    "reason": "Follow-up"
  }'
```

### Test Health Records

```bash
curl http://localhost:3000/api/patient/health-records \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

### Test Messages

```bash
# Get conversations
curl http://localhost:3000/api/patient/messages/conversations \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Get specific conversation
curl http://localhost:3000/api/patient/messages/Practitioner%2Fprac-123 \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# Send message
curl -X POST http://localhost:3000/api/patient/messages/send \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "Practitioner/prac-123",
    "subject": "Question",
    "message": "Hello doctor"
  }'
```

### Test Providers

```bash
curl http://localhost:3000/api/patient/providers \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

---

## Integration with PatientPortalService

The service layer provides these methods:

```typescript
class PatientPortalService {
  // Dashboard
  static async getPatientDashboard(patientId: string)

  // Appointments
  static async getPatientAppointments(patientId: string, params?: AppointmentSearchParams)
  static async bookAppointment(patientId: string, appointmentData: {...})
  static async cancelAppointment(appointmentId: string, patientId: string, reason?: string)

  // Health Records
  static async getPatientHealthRecords(patientId: string)

  // Messages
  static async getPatientMessages(patientId: string)
  static async sendMessage(patientId: string, recipientId: string, subject: string, message: string)

  // Registration
  static async findPatientByEmail(email: string)
  static async registerPatient(data: PatientRegistrationData, hashedPassword: string)
}
```

All routes map to these service methods.

---

## Security Considerations

### Session Validation

✅ All routes validate session before proceeding
✅ All routes extract `patientId` from session (not from request)
✅ Patients can only access their own data

### FHIR Access Control

The routes use the Medplum client which applies FHIR access control rules. Patients automatically get filtered results based on their patient ID.

### Input Validation

✅ Required fields validated before processing
✅ Proper HTTP status codes returned
✅ Error messages don't leak sensitive information

---

## Performance Considerations

### Parallel Requests

Health records endpoint uses `Promise.all()` to fetch multiple resource types in parallel:

```typescript
const [medications, allergies, conditions, observations, immunizations] =
  await Promise.all([...])
```

### Pagination

Most FHIR searches include `_count` parameter to limit results:
- Appointments: 5 upcoming, no limit on search with filters
- Messages: 50 max
- Observations: 100 max
- Providers: 50 max

### Caching

Consider adding caching for:
- Providers list (rarely changes)
- Health records (can cache for 1-5 minutes)

---

## Related Documentation

- **`PATIENT_AUTH_COMPLETE.md`** - Complete authentication system
- **`PATIENT_DASHBOARD_API_FIX.md`** - Dashboard API fix
- **`PATIENT_SESSION_FIX.md`** - Session structure

---

## Success Criteria

✅ All patient portal pages work without 404 errors
✅ Appointments page loads upcoming and past appointments
✅ Health records page displays medications, allergies, conditions, etc.
✅ Messages page shows conversations and allows messaging providers
✅ Proper authentication and authorization
✅ Consistent error handling
✅ Type-safe TypeScript implementation

---

## Files Created

1. `/src/app/api/patient/appointments/route.ts`
2. `/src/app/api/patient/appointments/book/route.ts`
3. `/src/app/api/patient/health-records/route.ts`
4. `/src/app/api/patient/messages/conversations/route.ts`
5. `/src/app/api/patient/messages/[conversationId]/route.ts`
6. `/src/app/api/patient/messages/send/route.ts`
7. `/src/app/api/patient/messages/new/route.ts`
8. `/src/app/api/patient/providers/route.ts`

---

**Status:** ✅ COMPLETE
**Version:** 2.0.5
**Date:** 2025-11-02

🎉 **All patient portal API routes are now implemented and working!**
