#!/bin/bash

# Create a test appointment for patient b1fa04de-f51b-4b64-82d2-e580c1c84341
# This patient is linked to feginy@mailinator.com

PATIENT_ID="b1fa04de-f51b-4b64-82d2-e580c1c84341"
PRACTITIONER_ID="045433da-9c68-4114-a794-cb5fd01de4ea"  # From the appointment you showed

# Calculate dates
START_DATE=$(date -u -v+2d +"%Y-%m-%dT10:00:00.000Z")  # 2 days from now at 10am
END_DATE=$(date -u -v+2d +"%Y-%m-%dT11:00:00.000Z")    # 2 days from now at 11am

# Create appointment JSON
APPOINTMENT_JSON=$(cat <<EOF
{
  "resourceType": "Appointment",
  "status": "booked",
  "start": "$START_DATE",
  "end": "$END_DATE",
  "minutesDuration": 60,
  "comment": "Test appointment for patient portal",
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
        "display": "Dr. Test"
      },
      "status": "accepted"
    }
  ]
}
EOF
)

echo "Creating appointment..."
echo "$APPOINTMENT_JSON" | jq '.'

# Post to FHIR server (adjust URL as needed)
curl -X POST "http://localhost:8103/fhir/R4/Appointment" \
  -H "Content-Type: application/fhir+json" \
  -d "$APPOINTMENT_JSON" | jq '.'
