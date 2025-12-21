# Pediatrics API Reference

## Base URL

```
http://localhost:8000/api/patients/{patientId}/pediatrics
```

## Authentication

All endpoints require:
- `x-org-id` header: Organization UUID
- `x-user-id` header: User/Practitioner identifier
- Bearer token (OAuth 2.0 or session-based)

## Demographics

### Save Demographics
```http
POST /patients/:patientId/pediatrics/demographics
Content-Type: application/json

{
  "birthWeightGrams": 3400,
  "birthLengthCm": 51,
  "birthHeadCircumferenceCm": 35,
  "gestationalAgeWeeks": 39,
  "gestationalAgeDays": 2,
  "linkedMaternalPatientId": "Patient/mother-id",
  "birthHospital": "General Hospital",
  "apgar1min": 8,
  "apgar5min": 9,
  "multipleBirth": false
}
```

**Response:**
```json
{
  "success": true,
  "demographics": {
    "id": "uuid",
    "patientId": "Patient/child-id",
    "birthWeightGrams": 3400,
    ...
  }
}
```

### Get Demographics
```http
GET /patients/:patientId/pediatrics/demographics
```

## Growth Records

### Save Growth Record
```http
POST /patients/:patientId/pediatrics/growth

{
  "episodeId": "uuid",
  "measurementDate": "2024-12-21",
  "ageMonths": 6.5,
  "weightKg": 7.8,
  "lengthHeightCm": 67.5,
  "headCircumferenceCm": 43.2
}
```

**Response includes calculated percentiles:**
```json
{
  "success": true,
  "growthRecord": {
    "id": "uuid",
    "weightPercentile": 50,
    "weightZscore": 0,
    "lengthHeightPercentile": 55,
    "bmi": null,
    "bmiCategory": null,
    "growthChartType": "WHO"
  }
}
```

### Get Growth Records
```http
GET /patients/:patientId/pediatrics/growth?episodeId={uuid}&startDate=2024-01-01&endDate=2024-12-31
```

### Calculate Percentiles
```http
GET /patients/:patientId/pediatrics/growth/percentiles
```

**Response:**
```json
{
  "success": true,
  "percentiles": {
    "latestMeasurement": {...},
    "growthVelocity": {
      "weightVelocity": 0.5,
      "heightVelocity": 2.1
    },
    "percentiles": {
      "weight": 50,
      "lengthHeight": 55,
      "headCircumference": 48,
      "bmi": null
    }
  }
}
```

## Vital Signs

### Save Vital Signs
```http
POST /patients/:patientId/pediatrics/vitals

{
  "episodeId": "uuid",
  "measurementDatetime": "2024-12-21T10:30:00Z",
  "ageGroup": "infant",
  "heartRate": 120,
  "respiratoryRate": 30,
  "systolicBp": 85,
  "diastolicBp": 55,
  "temperatureCelsius": 37.0,
  "oxygenSaturation": 98,
  "painScore": 0
}
```

**Response includes automatic flagging:**
```json
{
  "success": true,
  "vitalSigns": {
    "heartRateFlag": "normal",
    "respiratoryRateFlag": "normal",
    "bpFlag": "normal"
  }
}
```

### Get Vital Signs
```http
GET /patients/:patientId/pediatrics/vitals?episodeId={uuid}&limit=20
```

## Well-Child Visits

### Save Well Visit
```http
POST /patients/:patientId/pediatrics/well-visits

{
  "episodeId": "uuid",
  "visitDate": "2024-12-21",
  "visitType": "well-child-6-month",
  "ageAtVisitMonths": 6.5,
  "completed": true,
  "chiefConcerns": "Routine well-child check",
  "developmentalMilestones": {
    "grossMotor": "Sits without support",
    "fineMotor": "Transfers objects",
    "language": "Babbles",
    "personalSocial": "Recognizes familiar faces"
  },
  "physicalExam": {...},
  "anticipatoryGuidanceProvided": ["solid foods", "injury prevention"],
  "nextVisitDue": "2025-03-21",
  "provider": "Dr. Smith"
}
```

### Get Well Visits
```http
GET /patients/:patientId/pediatrics/well-visits?episodeId={uuid}
```

### Get Well Visit Schedule
```http
GET /patients/:patientId/pediatrics/well-visits/schedule
```

## Immunizations

### Record Immunization
```http
POST /patients/:patientId/pediatrics/immunizations

{
  "episodeId": "uuid",
  "vaccineName": "DTaP",
  "vaccineCode": "107",
  "cvxCode": "20",
  "doseNumber": 3,
  "seriesDoses": 5,
  "administrationDate": "2024-12-21",
  "lotNumber": "ABC123XYZ",
  "manufacturer": "Sanofi Pasteur",
  "route": "Intramuscular",
  "site": "Left deltoid",
  "doseAmount": "0.5 mL",
  "visDate": "2024-06-01",
  "visProvided": true,
  "consentObtained": true
}
```

### Get Immunizations
```http
GET /patients/:patientId/pediatrics/immunizations?episodeId={uuid}
```

### Get Immunization Schedule
```http
GET /patients/:patientId/pediatrics/immunizations/schedule
```

**Response:**
```json
{
  "success": true,
  "schedule": {
    "dueVaccines": [
      {
        "vaccine": "Hepatitis A",
        "dueDate": "2025-06-21",
        "status": "due"
      }
    ],
    "overdueVaccines": [],
    "upcomingVaccines": [...]
  }
}
```

### Generate Catch-Up Schedule
```http
POST /patients/:patientId/pediatrics/immunizations/catch-up
```

## Developmental Screening

### Save Screening
```http
POST /patients/:patientId/pediatrics/developmental-screening

{
  "episodeId": "uuid",
  "screeningDate": "2024-12-21",
  "ageMonths": 18,
  "screeningTool": "ASQ-3",
  "domainsAssessed": {
    "communication": {...},
    "grossMotor": {...},
    "fineMotor": {...},
    "problemSolving": {...},
    "personalSocial": {...}
  },
  "overallResult": "normal",
  "referralRecommended": false
}
```

### Get Screenings
```http
GET /patients/:patientId/pediatrics/developmental-screening?episodeId={uuid}
```

## Newborn Screening

### Save Results
```http
POST /patients/:patientId/pediatrics/newborn-screening

{
  "episodeId": "uuid",
  "screeningDate": "2024-12-22",
  "stateProgram": "State NHS Program",
  "specimenCollectionTime": "2024-12-22T06:00:00Z",
  "testPanel": {
    "PKU": "negative",
    "hypothyroidism": "negative",
    "sickleCellDisease": "negative",
    ...
  },
  "overallResult": "normal",
  "followUpRequired": false
}
```

### Get Results
```http
GET /patients/:patientId/pediatrics/newborn-screening
```

## HEADSS Assessment

### Save Assessment
```http
POST /patients/:patientId/pediatrics/headss

{
  "episodeId": "uuid",
  "assessmentDate": "2024-12-21",
  "ageYears": 15,
  "homeEnvironment": {
    "livingWith": "Both parents",
    "safeEnvironment": true,
    "conflicts": "Minor"
  },
  "educationEmployment": {...},
  "activitiesPeers": {...},
  "drugsAlcoholTobacco": {...},
  "sexuality": {...},
  "suicideSafety": {...},
  "overallRiskLevel": "low",
  "concernsIdentified": [],
  "interventionsRecommended": [],
  "followUpRequired": false,
  "confidentialityDiscussed": true
}
```

### Get Assessments
```http
GET /patients/:patientId/pediatrics/headss?episodeId={uuid}
```

## Additional Screenings

### Lead Screening
```http
POST /patients/:patientId/pediatrics/lead-screening
GET /patients/:patientId/pediatrics/lead-screening
```

### Autism Screening
```http
POST /patients/:patientId/pediatrics/autism-screening
GET /patients/:patientId/pediatrics/autism-screening
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required headers: x-org-id, x-user-id"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Patient not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Error message details"
}
```

## Rate Limits

- 1000 requests per hour per organization
- 100 requests per minute per user

## Pagination

For list endpoints, use:
```http
GET /endpoint?page=1&limit=50
```

## Filtering

Common query parameters:
- `episodeId`: Filter by episode
- `startDate`, `endDate`: Date range filters
- `status`: Filter by status
- `limit`: Limit results (default: 20, max: 100)

## Best Practices

1. Always include proper headers
2. Validate data before submission
3. Handle errors gracefully
4. Use episode context when available
5. Cache frequently accessed data
6. Follow FHIR resource references
7. Implement retry logic for transient failures
