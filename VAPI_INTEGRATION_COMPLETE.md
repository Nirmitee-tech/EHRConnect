# VAPI / Voice Assistant Integration - Complete Documentation

## 🎯 Overview

This document provides complete API documentation for integrating VAPI or other voice assistants with EHRConnect. These APIs enable voice-based appointment booking with **NO AUTHENTICATION REQUIRED** - perfect for voice assistant integrations.

**Base URL:** `http://localhost:8000/api/public/v2`
**Authentication:** None (org_id required instead)
**Format:** JSON

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Complete Voice Call Workflow](#complete-voice-call-workflow)
3. [API Endpoints](#api-endpoints)
4. [Testing Examples](#testing-examples)
5. [Integration in UI](#integration-in-ui)

---

## 🚀 Quick Start

### Requirements
- Organization ID (get from `/integrations/vapi-docs` page in UI)
- No authentication headers needed!

### Voice Call Flow
```
1. User calls → Voice assistant answers
2. Get caller's phone number
3. Check if patient exists (by phone/email)
4. If not, collect info and create patient
5. Show available doctors (practitioners)
6. User selects doctor
7. Show available time slots
8. User selects time
9. Book appointment
10. Confirmation sent
```

---

## 🔄 Complete Voice Call Workflow

### Step 1: Check if Patient Exists

**Endpoint:** `GET /api/public/v2/check-patient`

**Parameters:**
- `org_id` (required) - Your organization ID
- `phone` (optional) - Patient's phone number
- `email` (optional) - Patient's email address

**Example:**
```bash
curl "http://localhost:8000/api/public/v2/check-patient?org_id=YOUR_ORG_ID&phone=555-1234"
```

**Response - Patient Exists:**
```json
{
  "success": true,
  "exists": true,
  "patient": {
    "id": "08ccfa29-678f-4820-b78c-f875e2f85c82",
    "name": "John Smith",
    "phone": "555-1234",
    "email": "john@example.com",
    "birthDate": "1990-01-15",
    "gender": "male"
  }
}
```

**Response - Patient Does NOT Exist:**
```json
{
  "success": true,
  "exists": false,
  "message": "Patient not found. You may create a new patient."
}
```

---

### Step 2: Create Patient (if doesn't exist)

**Endpoint:** `POST /api/public/v2/patients`

**Example:**
```bash
curl -X POST http://localhost:8000/api/public/v2/patients \
  -H "Content-Type: application/json" \
  -d '{
    "org_id": "YOUR_ORG_ID",
    "name": [{
      "use": "official",
      "family": "Smith",
      "given": ["John"]
    }],
    "gender": "male",
    "birthDate": "1990-01-15",
    "telecom": [{
      "system": "phone",
      "value": "+1-555-123-4567",
      "use": "mobile"
    }, {
      "system": "email",
      "value": "john.smith@example.com"
    }]
  }'
```

**Response:**
```json
{
  "success": true,
  "orgId": "YOUR_ORG_ID",
  "patient": {
    "id": "newly-created-id",
    "name": "John Smith",
    "phone": "+1-555-123-4567",
    "email": "john.smith@example.com",
    "birthDate": "1990-01-15",
    "gender": "male"
  }
}
```

---

### Step 3: Get Available Practitioners (Doctors)

**Endpoint:** `GET /api/public/v2/practitioners`

**Example:**
```bash
curl "http://localhost:8000/api/public/v2/practitioners?org_id=YOUR_ORG_ID"
```

**Response:**
```json
{
  "success": true,
  "orgId": "YOUR_ORG_ID",
  "count": 3,
  "practitioners": [
    {
      "id": "bd025d83-f0ce-437f-ada9-9ea071279743",
      "name": "Dr. Sarah Johnson",
      "phone": "+1-555-999-8888",
      "email": "dr.johnson@clinic.com",
      "active": true,
      "specialty": "Family Medicine",
      "officeHours": "[{\"dayOfWeek\":1,\"startTime\":\"09:00\",\"endTime\":\"17:00\",\"isWorking\":true}...]"
    },
    {
      "id": "463840c9-916f-448d-a992-d420e2fad3c1",
      "name": "Dr. Michael Chen",
      "phone": "+1-555-888-7777",
      "email": "dr.chen@clinic.com",
      "active": true,
      "specialty": "Internal Medicine"
    }
  ]
}
```

**For Voice Assistant:**
```
"We have 3 doctors available:
1. Dr. Sarah Johnson - Family Medicine
2. Dr. Michael Chen - Internal Medicine
3. Dr. Emily Rodriguez - Pediatrics

Which doctor would you like to see?"
```

---

### Step 4: Get Available Time Slots

**Endpoint:** `GET /api/public/v2/available-slots`

**Parameters:**
- `org_id` (required) - Organization ID
- `practitioner_id` (optional) - Doctor's ID from step 3. If omitted, returns slots for ALL practitioners
- `date` (required) - Date in YYYY-MM-DD format

**Example - Specific Practitioner:**
```bash
curl "http://localhost:8000/api/public/v2/available-slots?org_id=YOUR_ORG_ID&practitioner_id=bd025d83-f0ce-437f-ada9-9ea071279743&date=2025-10-25"
```

**Example - All Practitioners:**
```bash
# NEW: Get slots for all practitioners at once
curl "http://localhost:8000/api/public/v2/available-slots?org_id=YOUR_ORG_ID&date=2025-10-25"
```

**Response - Specific Practitioner:**
```json
{
  "success": true,
  "orgId": "YOUR_ORG_ID",
  "practitionerId": "bd025d83-f0ce-437f-ada9-9ea071279743",
  "practitionerName": "Dr. Sarah Johnson",
  "date": "2025-10-25",
  "workingHours": {
    "start": "09:00",
    "end": "17:00"
  },
  "totalSlots": 16,
  "availableSlots": [
    {
      "start": "2025-10-25T14:00:00.000Z",
      "end": "2025-10-25T14:30:00.000Z",
      "duration": 30
    },
    {
      "start": "2025-10-25T14:30:00.000Z",
      "end": "2025-10-25T15:00:00.000Z",
      "duration": 30
    },
    {
      "start": "2025-10-25T15:00:00.000Z",
      "end": "2025-10-25T15:30:00.000Z",
      "duration": 30
    }
  ]
}
```

**Response - All Practitioners (NEW):**
```json
{
  "success": true,
  "orgId": "YOUR_ORG_ID",
  "date": "2025-10-25",
  "totalPractitioners": 5,
  "workingPractitioners": 3,
  "totalAvailableSlots": 48,
  "practitioners": [
    {
      "practitionerId": "pract-123",
      "practitionerName": "Dr. Sarah Johnson",
      "specialty": "Family Medicine",
      "phone": "+1-555-999-8888",
      "workingHours": {
        "start": "09:00",
        "end": "17:00"
      },
      "totalSlots": 16,
      "availableSlots": [
        {
          "start": "2025-10-25T14:00:00.000Z",
          "end": "2025-10-25T14:30:00.000Z",
          "duration": 30
        }
      ],
      "isWorking": true
    },
    {
      "practitionerId": "pract-456",
      "practitionerName": "Dr. Michael Chen",
      "specialty": "Internal Medicine",
      "phone": "+1-555-888-7777",
      "workingHours": {
        "start": "10:00",
        "end": "18:00"
      },
      "totalSlots": 16,
      "availableSlots": [
        {
          "start": "2025-10-25T15:00:00.000Z",
          "end": "2025-10-25T15:30:00.000Z",
          "duration": 30
        }
      ],
      "isWorking": true
    }
  ]
}
```

**For Voice Assistant:**
```
"Dr. Johnson has 16 available slots on October 25th.
The first available times are:
- 2:00 PM
- 2:30 PM
- 3:00 PM

What time works best for you?"
```

**Response - Not Working That Day:**
```json
{
  "success": true,
  "orgId": "YOUR_ORG_ID",
  "practitionerId": "bd025d83-f0ce-437f-ada9-9ea071279743",
  "date": "2025-10-24",
  "availableSlots": [],
  "message": "Practitioner is not working on this day"
}
```

---

### Step 5: Book the Appointment

**Endpoint:** `POST /api/public/v2/book-appointment`

**Example:**
```bash
curl -X POST http://localhost:8000/api/public/v2/book-appointment \
  -H "Content-Type: application/json" \
  -d '{
    "org_id": "YOUR_ORG_ID",
    "patientId": "08ccfa29-678f-4820-b78c-f875e2f85c82",
    "practitionerId": "bd025d83-f0ce-437f-ada9-9ea071279743",
    "startTime": "2025-10-25T14:00:00Z",
    "endTime": "2025-10-25T14:30:00Z",
    "appointmentType": "ROUTINE",
    "reason": "Annual checkup"
  }'
```

**Request Body Fields:**
- `org_id` (required) - Organization ID
- `patientId` (required) - Patient ID from step 1 or 2
- `practitionerId` (optional but recommended) - Doctor ID from step 3
- `startTime` (required) - ISO 8601 datetime from step 4
- `endTime` (optional) - Defaults to 30 min after start
- `appointmentType` (optional) - e.g., "ROUTINE", "FOLLOWUP", "EMERGENCY"
- `reason` (optional) - Reason for visit

**Response:**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "orgId": "YOUR_ORG_ID",
  "appointmentId": "c780ccb8-dac0-4473-a447-3a6d37d03991",
  "appointment": {
    "id": "c780ccb8-dac0-4473-a447-3a6d37d03991",
    "status": "booked",
    "start": "2025-10-25T14:00:00Z",
    "end": "2025-10-25T14:30:00Z",
    "patient": {
      "reference": "Patient/08ccfa29-678f-4820-b78c-f875e2f85c82",
      "display": "John Smith"
    },
    "practitioner": {
      "reference": "Practitioner/bd025d83-f0ce-437f-ada9-9ea071279743",
      "display": "Dr. Sarah Johnson"
    }
  }
}
```

**For Voice Assistant:**
```
"Perfect! I've booked your appointment with Dr. Sarah Johnson
on Friday, October 25th at 2:00 PM for your annual checkup.
Your confirmation number is c780ccb8.
You'll receive a text message confirmation shortly."
```

---

## 📚 Additional API Endpoints

### Get All Patients

```bash
# Get all patients for organization
GET /api/public/v2/patients?org_id=YOUR_ORG_ID

# Filter by phone
GET /api/public/v2/patients?org_id=YOUR_ORG_ID&phone=555-1234

# Filter by email
GET /api/public/v2/patients?org_id=YOUR_ORG_ID&email=patient@example.com
```

### Get All Appointments

```bash
# Get all appointments
GET /api/public/v2/appointments?org_id=YOUR_ORG_ID

# Filter by patient
GET /api/public/v2/appointments?org_id=YOUR_ORG_ID&patient_id=PATIENT_ID

# Filter by practitioner
GET /api/public/v2/appointments?org_id=YOUR_ORG_ID&practitioner_id=PRACT_ID

# Filter by date
GET /api/public/v2/appointments?org_id=YOUR_ORG_ID&date=2025-10-25

# Filter by status
GET /api/public/v2/appointments?org_id=YOUR_ORG_ID&status=booked
```

**Appointment Statuses:**
- `proposed` - Tentative/proposed
- `pending` - Awaiting confirmation
- `booked` - Confirmed appointment
- `arrived` - Patient has arrived
- `fulfilled` - Appointment completed
- `cancelled` - Appointment cancelled
- `noshow` - Patient didn't show

---

## 🧪 Complete Testing Script

Save this as `test-vapi-integration.sh`:

```bash
#!/bin/bash

# Configuration
ORG_ID="YOUR_ORG_ID"  # Replace with your org ID
BASE_URL="http://localhost:8000/api/public/v2"
PHONE="+1-555-TEST-123"

echo "=== VAPI Integration Test ==="
echo ""

# Step 1: Check patient
echo "1️⃣  Checking if patient exists..."
PATIENT_CHECK=$(curl -s "$BASE_URL/check-patient?org_id=$ORG_ID&phone=$PHONE")
echo $PATIENT_CHECK | jq '.'
EXISTS=$(echo $PATIENT_CHECK | jq -r '.exists')

# Step 2: Create patient if doesn't exist
if [ "$EXISTS" == "false" ]; then
  echo ""
  echo "2️⃣  Creating new patient..."
  PATIENT_RESPONSE=$(curl -s -X POST "$BASE_URL/patients" \
    -H "Content-Type: application/json" \
    -d "{
      \"org_id\": \"$ORG_ID\",
      \"name\": [{\"use\": \"official\", \"family\": \"TestUser\", \"given\": [\"VAPI\"]}],
      \"gender\": \"unknown\",
      \"birthDate\": \"1990-01-01\",
      \"telecom\": [{\"system\": \"phone\", \"value\": \"$PHONE\", \"use\": \"mobile\"}]
    }")
  echo $PATIENT_RESPONSE | jq '.'
  PATIENT_ID=$(echo $PATIENT_RESPONSE | jq -r '.patient.id')
else
  PATIENT_ID=$(echo $PATIENT_CHECK | jq -r '.patient.id')
fi

echo ""
echo "✓ Patient ID: $PATIENT_ID"

# Step 3: Get practitioners
echo ""
echo "3️⃣  Getting available practitioners..."
PRACTITIONERS=$(curl -s "$BASE_URL/practitioners?org_id=$ORG_ID")
echo $PRACTITIONERS | jq '{count: .count, practitioners: [.practitioners[] | {id, name}]}'
PRACTITIONER_ID=$(echo $PRACTITIONERS | jq -r '.practitioners[0].id')
PRACTITIONER_NAME=$(echo $PRACTITIONERS | jq -r '.practitioners[0].name')

echo ""
echo "✓ Selected: $PRACTITIONER_NAME ($PRACTITIONER_ID)"

# Step 4: Get available slots
DATE=$(date -v+7d +%Y-%m-%d)  # 7 days from now
echo ""
echo "4️⃣  Getting available slots for $DATE..."
SLOTS=$(curl -s "$BASE_URL/available-slots?org_id=$ORG_ID&practitioner_id=$PRACTITIONER_ID&date=$DATE")
echo $SLOTS | jq '{totalSlots: .totalSlots, firstThreeSlots: .availableSlots[0:3]}'

SLOT_COUNT=$(echo $SLOTS | jq -r '.totalSlots')
if [ "$SLOT_COUNT" == "0" ] || [ "$SLOT_COUNT" == "null" ]; then
  echo ""
  echo "⚠️  No slots available for $DATE. Try a different date."
  exit 1
fi

START_TIME=$(echo $SLOTS | jq -r '.availableSlots[0].start')
END_TIME=$(echo $SLOTS | jq -r '.availableSlots[0].end')

echo ""
echo "✓ Selected slot: $START_TIME"

# Step 5: Book appointment
echo ""
echo "5️⃣  Booking appointment..."
BOOKING=$(curl -s -X POST "$BASE_URL/book-appointment" \
  -H "Content-Type: application/json" \
  -d "{
    \"org_id\": \"$ORG_ID\",
    \"patientId\": \"$PATIENT_ID\",
    \"practitionerId\": \"$PRACTITIONER_ID\",
    \"startTime\": \"$START_TIME\",
    \"endTime\": \"$END_TIME\",
    \"appointmentType\": \"ROUTINE\",
    \"reason\": \"Test appointment via VAPI integration\"
  }")

echo $BOOKING | jq '.'
APPOINTMENT_ID=$(echo $BOOKING | jq -r '.appointmentId')

echo ""
echo "✅ SUCCESS! Appointment booked"
echo "   Appointment ID: $APPOINTMENT_ID"
echo "   Patient: $PATIENT_ID"
echo "   Doctor: $PRACTITIONER_NAME"
echo "   Time: $START_TIME"
echo ""
echo "Check the EHRConnect UI to see the appointment!"
```

**Run it:**
```bash
chmod +x test-vapi-integration.sh
./test-vapi-integration.sh
```

---

## 💻 Integration in UI

### Accessing Documentation Page

1. Navigate to: `http://localhost:3000/integrations/vapi-docs`
2. Your organization ID will be displayed at the top
3. All API examples will be pre-filled with your org ID
4. Copy-paste ready curl commands

### Viewing Created Data

All data created via these APIs is **immediately visible** in the UI:

1. **Patients Page** (`/patients`)
   - All patients created via API appear here
   - Search by name, phone, or email
   - View complete patient details

2. **Appointments Page** (`/appointments`)
   - All appointments booked via API appear here
   - Filter by date, status, doctor
   - View appointment details

3. **Practitioner Management** (`/staff` or `/practitioners`)
   - Configure doctor schedules
   - Set office hours
   - Manage availability

---

## ⚙️ Configuration

### Setting Up Practitioner Office Hours

For the available-slots API to work correctly, practitioners must have office hours configured:

1. Go to Practitioners/Staff page in UI
2. Select a practitioner
3. Configure office hours:
   ```json
   [
     {"dayOfWeek": 0, "startTime": "00:00", "endTime": "00:00", "isWorking": false},  // Sunday
     {"dayOfWeek": 1, "startTime": "09:00", "endTime": "17:00", "isWorking": true},   // Monday
     {"dayOfWeek": 2, "startTime": "09:00", "endTime": "17:00", "isWorking": true},   // Tuesday
     {"dayOfWeek": 3, "startTime": "09:00", "endTime": "17:00", "isWorking": true},   // Wednesday
     {"dayOfWeek": 4, "startTime": "09:00", "endTime": "17:00", "isWorking": true},   // Thursday
     {"dayOfWeek": 5, "startTime": "09:00", "endTime": "13:00", "isWorking": true},   // Friday (half day)
     {"dayOfWeek": 6, "startTime": "00:00", "endTime": "00:00", "isWorking": false}   // Saturday
   ]
   ```

---

## 🔍 Health Check & Debugging

### Health Check Endpoint

```bash
curl http://localhost:8000/api/public/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-23T14:00:00.000Z",
  "endpoints": {
    "v2": {
      "note": "V2 endpoints require org_id parameter",
      "practitioners": "GET /api/public/v2/practitioners?org_id=xxx",
      "patients": "GET /api/public/v2/patients?org_id=xxx",
      "appointments": "GET /api/public/v2/appointments?org_id=xxx",
      "availableSlots": "GET /api/public/v2/available-slots?org_id=xxx&practitioner_id=xxx&date=YYYY-MM-DD",
      "checkPatient": "GET /api/public/v2/check-patient?org_id=xxx&phone=xxx",
      "bookAppointment": "POST /api/public/v2/book-appointment"
    }
  }
}
```

### Common Issues

**"org_id is required"**
- Add `?org_id=YOUR_ORG_ID` to query string
- Or add to request body for POST requests
- Or add `x-org-id` header

**"Practitioner is not working on this day"**
- Check practitioner's office hours configuration
- Try a different date
- Verify `dayOfWeek` matches (0 = Sunday, 6 = Saturday)

**"Patient does not belong to this organization"**
- Patient must have been created with same org_id
- Check patient's `managingOrganization` field

**Empty available slots despite working hours**
- All slots may be booked
- Try a different date
- Check for appointment conflicts

---

## 🎭 VAPI-Specific Integration Tips

### Voice Response Examples

```javascript
// Example VAPI response handler
const handleAppointmentBooking = async (userInput) => {
  // Step 1: Extract phone from caller ID
  const phone = context.caller.phoneNumber;

  // Step 2: Check patient
  const patientCheck = await fetch(
    `${API_BASE}/check-patient?org_id=${ORG_ID}&phone=${phone}`
  );

  if (!patientCheck.exists) {
    // Collect patient info via voice
    const name = await askQuestion("What's your name?");
    const birthdate = await askQuestion("What's your date of birth?");

    // Create patient
    await createPatient({ name, birthdate, phone });
  }

  // Step 3: Get practitioners
  const docs = await fetch(`${API_BASE}/practitioners?org_id=${ORG_ID}`);
  const doctorList = docs.practitioners.map(d => d.name).join(", ");
  const selectedDoc = await askQuestion(
    `We have ${doctorList}. Which doctor would you like?`
  );

  // Step 4: Get slots
  const date = await askQuestion("What date works for you?");
  const slots = await fetch(
    `${API_BASE}/available-slots?org_id=${ORG_ID}&practitioner_id=${selectedDoc.id}&date=${date}`
  );

  // Step 5: Book appointment
  const booking = await bookAppointment({...});

  return `Your appointment is confirmed for ${date} at ${time}!`;
};
```

---

## 📊 Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Process response data |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Check request parameters |
| 403 | Forbidden | Check org_id matches patient's org |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Retry or contact support |

---

## 🔐 Security Notes

- **No authentication required** - APIs are public by design
- **Org isolation** - Each org only sees their own data
- **Rate limiting** - Consider implementing for production
- **HTTPS** - Use HTTPS in production
- **Input validation** - All inputs are validated server-side

---

## 📞 Support

- **Documentation Page:** `/integrations/vapi-docs` in UI
- **Health Check:** `GET /api/public/health`
- **GitHub Issues:** Report bugs and feature requests

---

**Last Updated:** October 23, 2025
**API Version:** v2
**FHIR Version:** R4
