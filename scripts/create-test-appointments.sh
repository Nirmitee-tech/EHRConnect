#!/bin/bash

# Create test appointments for patient b1fa04de-f51b-4b64-82d2-e580c1c84341
# This patient is linked to feginy@mailinator.com

PATIENT_ID="b1fa04de-f51b-4b64-82d2-e580c1c84341"
PRACTITIONER_ID="5db29771-48f1-4644-b7f3-29fdb10a9418"
ORG_ID="27b52b74-4f64-4ad0-b48d-ae47a8659da2"
API_URL="http://localhost:8000"

echo "Creating test appointments for patient portal testing..."
echo "Patient ID: $PATIENT_ID"
echo ""

# Get auth token (you might need to adjust this)
# For now, we'll try to create via direct FHIR API

# Appointment 1: Upcoming appointment (2 days from now)
echo "1. Creating UPCOMING appointment..."
UPCOMING_START=$(date -u -v+2d +"%Y-%m-%dT10:00:00Z" 2>/dev/null || date -u -d "+2 days" +"%Y-%m-%dT10:00:00Z")
UPCOMING_END=$(date -u -v+2d +"%Y-%m-%dT11:00:00Z" 2>/dev/null || date -u -d "+2 days" +"%Y-%m-%dT11:00:00Z")

APPT1=$(cat <<EOF
{
  "resourceType": "Appointment",
  "status": "booked",
  "start": "$UPCOMING_START",
  "end": "$UPCOMING_END",
  "minutesDuration": 60,
  "comment": "Follow-up consultation",
  "serviceType": [
    {
      "text": "General Consultation"
    }
  ],
  "participant": [
    {
      "actor": {
        "reference": "Patient/$PATIENT_ID",
        "display": "Test Patient"
      },
      "status": "accepted"
    },
    {
      "actor": {
        "reference": "Practitioner/$PRACTITIONER_ID",
        "display": "Dr. Smith"
      },
      "status": "accepted"
    }
  ],
  "extension": [
    {
      "url": "http://ehrconnect.io/fhir/StructureDefinition/appointment-organization",
      "valueReference": {
        "reference": "Organization/$ORG_ID"
      }
    }
  ]
}
EOF
)

curl -X POST "$API_URL/fhir/R4/Appointment" \
  -H "Content-Type: application/fhir+json" \
  -d "$APPT1" \
  -s | jq -r '.id // .issue[0].diagnostics // "Error creating appointment"' | head -1

# Appointment 2: Another upcoming (5 days from now)
echo "2. Creating UPCOMING appointment (5 days out)..."
UPCOMING2_START=$(date -u -v+5d +"%Y-%m-%dT14:00:00Z" 2>/dev/null || date -u -d "+5 days" +"%Y-%m-%dT14:00:00Z")
UPCOMING2_END=$(date -u -v+5d +"%Y-%m-%dT15:00:00Z" 2>/dev/null || date -u -d "+5 days" +"%Y-%m-%dT15:00:00Z")

APPT2=$(cat <<EOF
{
  "resourceType": "Appointment",
  "status": "pending",
  "start": "$UPCOMING2_START",
  "end": "$UPCOMING2_END",
  "minutesDuration": 60,
  "comment": "Annual physical exam",
  "serviceType": [
    {
      "text": "Physical Examination"
    }
  ],
  "participant": [
    {
      "actor": {
        "reference": "Patient/$PATIENT_ID",
        "display": "Test Patient"
      },
      "status": "accepted"
    },
    {
      "actor": {
        "reference": "Practitioner/$PRACTITIONER_ID",
        "display": "Dr. Smith"
      },
      "status": "needs-action"
    }
  ],
  "extension": [
    {
      "url": "http://ehrconnect.io/fhir/StructureDefinition/appointment-organization",
      "valueReference": {
        "reference": "Organization/$ORG_ID"
      }
    }
  ]
}
EOF
)

curl -X POST "$API_URL/fhir/R4/Appointment" \
  -H "Content-Type: application/fhir+json" \
  -d "$APPT2" \
  -s | jq -r '.id // .issue[0].diagnostics // "Error creating appointment"' | head -1

# Appointment 3: Past appointment (5 days ago)
echo "3. Creating PAST appointment (completed)..."
PAST_START=$(date -u -v-5d +"%Y-%m-%dT09:00:00Z" 2>/dev/null || date -u -d "-5 days" +"%Y-%m-%dT09:00:00Z")
PAST_END=$(date -u -v-5d +"%Y-%m-%dT10:00:00Z" 2>/dev/null || date -u -d "-5 days" +"%Y-%m-%dT10:00:00Z")

APPT3=$(cat <<EOF
{
  "resourceType": "Appointment",
  "status": "fulfilled",
  "start": "$PAST_START",
  "end": "$PAST_END",
  "minutesDuration": 60,
  "comment": "Routine checkup - Completed",
  "serviceType": [
    {
      "text": "Routine Checkup"
    }
  ],
  "participant": [
    {
      "actor": {
        "reference": "Patient/$PATIENT_ID",
        "display": "Test Patient"
      },
      "status": "accepted"
    },
    {
      "actor": {
        "reference": "Practitioner/$PRACTITIONER_ID",
        "display": "Dr. Smith"
      },
      "status": "accepted"
    }
  ],
  "extension": [
    {
      "url": "http://ehrconnect.io/fhir/StructureDefinition/appointment-organization",
      "valueReference": {
        "reference": "Organization/$ORG_ID"
      }
    }
  ]
}
EOF
)

curl -X POST "$API_URL/fhir/R4/Appointment" \
  -H "Content-Type: application/fhir+json" \
  -d "$APPT3" \
  -s | jq -r '.id // .issue[0].diagnostics // "Error creating appointment"' | head -1

# Appointment 4: Past appointment (10 days ago) - cancelled
echo "4. Creating PAST appointment (cancelled)..."
PAST2_START=$(date -u -v-10d +"%Y-%m-%dT11:00:00Z" 2>/dev/null || date -u -d "-10 days" +"%Y-%m-%dT11:00:00Z")
PAST2_END=$(date -u -v-10d +"%Y-%m-%dT12:00:00Z" 2>/dev/null || date -u -d "-10 days" +"%Y-%m-%dT12:00:00Z")

APPT4=$(cat <<EOF
{
  "resourceType": "Appointment",
  "status": "cancelled",
  "start": "$PAST2_START",
  "end": "$PAST2_END",
  "minutesDuration": 60,
  "comment": "Patient cancelled",
  "cancelationReason": {
    "text": "Schedule conflict"
  },
  "serviceType": [
    {
      "text": "Consultation"
    }
  ],
  "participant": [
    {
      "actor": {
        "reference": "Patient/$PATIENT_ID",
        "display": "Test Patient"
      },
      "status": "declined"
    },
    {
      "actor": {
        "reference": "Practitioner/$PRACTITIONER_ID",
        "display": "Dr. Smith"
      },
      "status": "accepted"
    }
  ],
  "extension": [
    {
      "url": "http://ehrconnect.io/fhir/StructureDefinition/appointment-organization",
      "valueReference": {
        "reference": "Organization/$ORG_ID"
      }
    }
  ]
}
EOF
)

curl -X POST "$API_URL/fhir/R4/Appointment" \
  -H "Content-Type: application/fhir+json" \
  -d "$APPT4" \
  -s | jq -r '.id // .issue[0].diagnostics // "Error creating appointment"' | head -1

echo ""
echo "✅ Done! Created 4 test appointments:"
echo "   - 2 upcoming (booked, pending)"
echo "   - 2 past (fulfilled, cancelled)"
echo ""
echo "Now test the patient portal:"
echo "1. Login: http://localhost:3000/patient-login"
echo "   Email: feginy@mailinator.com"
echo "   Password: nilkamal0_Y"
echo ""
echo "2. Check appointments: http://localhost:3000/portal/appointments"
echo "3. Should see upcoming and past appointments!"
