# VAPI / Voice Assistant Integration - API Documentation

## Overview
This document provides curl examples for integrating VAPI or other voice assistants with the EHRConnect system. These endpoints **do NOT require authentication**, making them perfect for voice assistant integrations.

**Base URL:** `http://localhost:8000`

---

## Table of Contents
1. [Health Check](#health-check)
2. [Patient APIs](#patient-apis)
3. [Appointment APIs](#appointment-apis)
4. [Complete Integration Example](#complete-integration-example)

---

## Health Check

### Check API Status
```bash
curl http://localhost:8000/api/public/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-23T13:58:53.360Z",
  "endpoints": {
    "patients": {
      "create": "POST /api/public/patients",
      "list": "GET /api/public/patients",
      "get": "GET /api/public/patients/:id",
      "update": "PUT /api/public/patients/:id"
    },
    "appointments": {
      "create": "POST /api/public/appointments",
      "list": "GET /api/public/appointments",
      "get": "GET /api/public/appointments/:id",
      "update": "PUT /api/public/appointments/:id",
      "cancel": "POST /api/public/appointments/:id/cancel",
      "book": "POST /api/public/book-appointment"
    }
  }
}
```

---

## Patient APIs

### 1. Create a Patient

**Endpoint:** `POST /api/public/patients`

**Example:**
```bash
curl -X POST http://localhost:8000/api/public/patients \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "Patient",
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
    }],
    "address": [{
      "use": "home",
      "type": "physical",
      "line": ["123 Main St"],
      "city": "Springfield",
      "state": "IL",
      "postalCode": "62701",
      "country": "US"
    }]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "resourceType": "Patient",
    "id": "06464849-0f16-4c92-8ce8-b4913fb10744",
    "meta": {
      "versionId": "1",
      "lastUpdated": "2025-10-23T13:59:07.733Z"
    },
    "name": [{"use": "official", "family": "Smith", "given": ["John"]}],
    "gender": "male",
    "birthDate": "1990-01-15",
    "telecom": [
      {"system": "phone", "value": "+1-555-123-4567", "use": "mobile"},
      {"system": "email", "value": "john.smith@example.com"}
    ]
  }
}
```

### 2. Get All Patients

**Endpoint:** `GET /api/public/patients`

```bash
curl http://localhost:8000/api/public/patients
```

**With Search Parameters:**
```bash
# Search by family name
curl "http://localhost:8000/api/public/patients?family=Smith"

# Search by given name
curl "http://localhost:8000/api/public/patients?given=John"

# Search by birthdate
curl "http://localhost:8000/api/public/patients?birthdate=1990-01-15"

# Search by gender
curl "http://localhost:8000/api/public/patients?gender=male"
```

### 3. Get a Specific Patient

**Endpoint:** `GET /api/public/patients/:id`

```bash
curl http://localhost:8000/api/public/patients/06464849-0f16-4c92-8ce8-b4913fb10744
```

### 4. Update a Patient

**Endpoint:** `PUT /api/public/patients/:id`

```bash
curl -X PUT http://localhost:8000/api/public/patients/06464849-0f16-4c92-8ce8-b4913fb10744 \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "Patient",
    "name": [{
      "use": "official",
      "family": "Smith",
      "given": ["John", "David"]
    }],
    "gender": "male",
    "birthDate": "1990-01-15",
    "telecom": [{
      "system": "phone",
      "value": "+1-555-999-8888",
      "use": "mobile"
    }]
  }'
```

---

## Appointment APIs

### 1. Book an Appointment (Simplified - Best for VAPI)

**Endpoint:** `POST /api/public/book-appointment`

This is the **easiest way** to book appointments from voice assistants.

**Example:**
```bash
curl -X POST http://localhost:8000/api/public/book-appointment \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "06464849-0f16-4c92-8ce8-b4913fb10744",
    "startTime": "2025-10-25T10:00:00Z",
    "endTime": "2025-10-25T10:30:00Z",
    "appointmentType": "ROUTINE",
    "reason": "Annual checkup"
  }'
```

**Parameters:**
- `patientId` (required): The patient's ID
- `startTime` (required): ISO 8601 datetime (e.g., "2025-10-25T10:00:00Z")
- `endTime` (optional): ISO 8601 datetime (defaults to 30 min after start)
- `practitionerId` (optional): The doctor's ID
- `appointmentType` (optional): Type of appointment (e.g., "ROUTINE", "EMERGENCY", "FOLLOWUP")
- `reason` (optional): Reason for the appointment

**Response:**
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "appointmentId": "c780ccb8-dac0-4473-a447-3a6d37d03991",
  "data": {
    "resourceType": "Appointment",
    "id": "c780ccb8-dac0-4473-a447-3a6d37d03991",
    "status": "booked",
    "start": "2025-10-25T10:00:00Z",
    "end": "2025-10-25T10:30:00Z",
    "appointmentType": {
      "coding": [{
        "system": "http://terminology.hl7.org/CodeSystem/v2-0276",
        "code": "ROUTINE",
        "display": "ROUTINE"
      }]
    },
    "reasonCode": [{"text": "Annual checkup"}],
    "participant": [{
      "actor": {
        "reference": "Patient/06464849-0f16-4c92-8ce8-b4913fb10744",
        "display": "Patient"
      },
      "required": "required",
      "status": "accepted"
    }]
  }
}
```

### 2. Create an Appointment (Full FHIR)

**Endpoint:** `POST /api/public/appointments`

For more control over the appointment structure:

```bash
curl -X POST http://localhost:8000/api/public/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "Appointment",
    "status": "booked",
    "start": "2025-10-26T14:00:00Z",
    "end": "2025-10-26T14:45:00Z",
    "participant": [{
      "actor": {
        "reference": "Patient/06464849-0f16-4c92-8ce8-b4913fb10744",
        "display": "John Smith"
      },
      "required": "required",
      "status": "accepted"
    }],
    "reasonCode": [{
      "text": "Follow-up consultation"
    }]
  }'
```

### 3. Get All Appointments

**Endpoint:** `GET /api/public/appointments`

```bash
curl http://localhost:8000/api/public/appointments
```

**With Search Parameters:**
```bash
# Get appointments for a specific patient
curl "http://localhost:8000/api/public/appointments?patient=06464849-0f16-4c92-8ce8-b4913fb10744"

# Get appointments by status
curl "http://localhost:8000/api/public/appointments?status=booked"

# Get appointments by date
curl "http://localhost:8000/api/public/appointments?date=2025-10-25"

# Get appointments for a practitioner
curl "http://localhost:8000/api/public/appointments?practitioner=doctor-id-here"
```

### 4. Get a Specific Appointment

**Endpoint:** `GET /api/public/appointments/:id`

```bash
curl http://localhost:8000/api/public/appointments/c780ccb8-dac0-4473-a447-3a6d37d03991
```

### 5. Update an Appointment

**Endpoint:** `PUT /api/public/appointments/:id`

```bash
curl -X PUT http://localhost:8000/api/public/appointments/c780ccb8-dac0-4473-a447-3a6d37d03991 \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "Appointment",
    "status": "booked",
    "start": "2025-10-25T11:00:00Z",
    "end": "2025-10-25T11:30:00Z",
    "participant": [{
      "actor": {
        "reference": "Patient/06464849-0f16-4c92-8ce8-b4913fb10744"
      },
      "status": "accepted"
    }]
  }'
```

### 6. Cancel an Appointment

**Endpoint:** `POST /api/public/appointments/:id/cancel`

```bash
curl -X POST http://localhost:8000/api/public/appointments/c780ccb8-dac0-4473-a447-3a6d37d03991/cancel \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Patient requested cancellation"
  }'
```

---

## Complete Integration Example

Here's a complete workflow for VAPI integration:

### Step 1: Create a Patient
```bash
# Create patient and save the ID
PATIENT_RESPONSE=$(curl -s -X POST http://localhost:8000/api/public/patients \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "Patient",
    "name": [{"use": "official", "family": "Doe", "given": ["Jane"]}],
    "gender": "female",
    "birthDate": "1985-05-20",
    "telecom": [{
      "system": "phone",
      "value": "+1-555-987-6543",
      "use": "mobile"
    }]
  }')

PATIENT_ID=$(echo $PATIENT_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['id'])")
echo "Patient ID: $PATIENT_ID"
```

### Step 2: Book an Appointment for the Patient
```bash
# Book appointment using the patient ID
curl -X POST http://localhost:8000/api/public/book-appointment \
  -H "Content-Type: application/json" \
  -d "{
    \"patientId\": \"$PATIENT_ID\",
    \"startTime\": \"2025-10-28T09:00:00Z\",
    \"appointmentType\": \"ROUTINE\",
    \"reason\": \"General consultation\"
  }"
```

### Step 3: Retrieve Patient's Appointments
```bash
# Get all appointments for this patient
curl "http://localhost:8000/api/public/appointments?patient=$PATIENT_ID"
```

---

## VAPI Integration Tips

### 1. Time Format
Always use ISO 8601 format for dates and times:
- `2025-10-25T10:00:00Z` (UTC)
- `2025-10-25T10:00:00-05:00` (with timezone offset)

### 2. Error Handling
All endpoints return standardized error responses:
```json
{
  "success": false,
  "error": "Error message here",
  "operationOutcome": {
    "resourceType": "OperationOutcome",
    "issue": [{
      "severity": "error",
      "code": "invalid",
      "details": {"text": "Detailed error message"}
    }]
  }
}
```

### 3. Success Response Format
All successful responses follow this format:
```json
{
  "success": true,
  "data": { /* resource data */ }
}
```

### 4. Appointment Statuses
Valid appointment statuses:
- `proposed` - Initial appointment proposal
- `pending` - Appointment is pending confirmation
- `booked` - Appointment is confirmed
- `arrived` - Patient has arrived
- `fulfilled` - Appointment completed
- `cancelled` - Appointment cancelled
- `noshow` - Patient did not show up

### 5. Testing in Production
When deploying, replace `http://localhost:8000` with your production URL.

---

## Visibility on UI

All patients and appointments created via these public APIs are:
- ✅ Stored in the FHIR database
- ✅ Visible in the EHRConnect web UI
- ✅ Accessible via FHIR R4 endpoints at `/fhir/R4/Patient` and `/fhir/R4/Appointment`
- ✅ Searchable through the UI's patient and appointment search features

To verify in UI:
1. Navigate to the Patients page - you'll see all patients including those created via API
2. Navigate to the Appointments page - you'll see all appointments including those created via API
3. Search by patient name, date, or other criteria

---

## Additional Notes

- **No Authentication Required**: These endpoints do not require any authentication headers
- **FHIR Compliant**: All data follows FHIR R4 standards
- **Real-time Updates**: Data is immediately available in the UI after API calls
- **Rate Limiting**: Consider implementing rate limiting for production use
- **Logging**: All requests are logged via the audit middleware

---

## Support

For issues or questions:
- Check the health endpoint: `http://localhost:8000/api/public/health`
- Review API logs in the server console
- Contact the development team

---

**Last Updated:** October 23, 2025
