-- Sample Healthcare Form Templates
-- Migration: 022_forms_sample_templates.sql
-- Description: Insert predefined healthcare and mental health form templates

-- Patient Intake Form
INSERT INTO form_templates (
  org_id,
  title,
  description,
  status,
  category,
  version,
  fhir_url,
  questionnaire,
  created_by,
  updated_by
) VALUES (
  '1200d873-8725-439a-8bbe-e6d4e7c26338',
  'Patient Intake Form',
  'Comprehensive patient registration and demographic information',
  'active',
  'registration',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/patient-intake',
  '{
    "resourceType": "Questionnaire",
    "id": "patient-intake",
    "url": "http://ehrconnect.com/fhir/Questionnaire/patient-intake",
    "status": "active",
    "title": "Patient Intake Form",
    "description": "Comprehensive patient registration and demographic information",
    "item": [
      {
        "linkId": "demographics",
        "type": "group",
        "text": "Demographics",
        "required": true,
        "item": [
          {
            "linkId": "first-name",
            "type": "string",
            "text": "First Name",
            "required": true,
            "maxLength": 50
          },
          {
            "linkId": "last-name",
            "type": "string",
            "text": "Last Name",
            "required": true,
            "maxLength": 50
          },
          {
            "linkId": "dob",
            "type": "date",
            "text": "Date of Birth",
            "required": true
          },
          {
            "linkId": "gender",
            "type": "choice",
            "text": "Gender",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "male", "display": "Male"}},
              {"valueCoding": {"code": "female", "display": "Female"}},
              {"valueCoding": {"code": "other", "display": "Other"}},
              {"valueCoding": {"code": "unknown", "display": "Prefer not to say"}}
            ]
          },
          {
            "linkId": "ssn",
            "type": "string",
            "text": "Social Security Number",
            "maxLength": 11
          }
        ]
      },
      {
        "linkId": "contact",
        "type": "group",
        "text": "Contact Information",
        "required": true,
        "item": [
          {
            "linkId": "phone",
            "type": "string",
            "text": "Phone Number",
            "required": true,
            "maxLength": 15
          },
          {
            "linkId": "email",
            "type": "string",
            "text": "Email Address",
            "maxLength": 100
          },
          {
            "linkId": "address",
            "type": "text",
            "text": "Home Address",
            "required": true
          },
          {
            "linkId": "city",
            "type": "string",
            "text": "City",
            "required": true
          },
          {
            "linkId": "state",
            "type": "string",
            "text": "State",
            "required": true,
            "maxLength": 2
          },
          {
            "linkId": "zip",
            "type": "string",
            "text": "ZIP Code",
            "required": true,
            "maxLength": 10
          }
        ]
      },
      {
        "linkId": "insurance",
        "type": "group",
        "text": "Insurance Information",
        "item": [
          {
            "linkId": "has-insurance",
            "type": "boolean",
            "text": "Do you have health insurance?"
          },
          {
            "linkId": "insurance-provider",
            "type": "string",
            "text": "Insurance Provider Name"
          },
          {
            "linkId": "policy-number",
            "type": "string",
            "text": "Policy Number"
          },
          {
            "linkId": "group-number",
            "type": "string",
            "text": "Group Number"
          }
        ]
      },
      {
        "linkId": "emergency",
        "type": "group",
        "text": "Emergency Contact",
        "required": true,
        "item": [
          {
            "linkId": "emergency-name",
            "type": "string",
            "text": "Contact Name",
            "required": true
          },
          {
            "linkId": "emergency-relationship",
            "type": "string",
            "text": "Relationship",
            "required": true
          },
          {
            "linkId": "emergency-phone",
            "type": "string",
            "text": "Phone Number",
            "required": true
          }
        ]
      }
    ]
  }'::jsonb,
  '0df77487-970d-4245-acd5-b2a6504e88cd',
  '0df77487-970d-4245-acd5-b2a6504e88cd'
);

-- Vital Signs Form
INSERT INTO form_templates (
  org_id,
  title,
  description,
  status,
  category,
  version,
  fhir_url,
  questionnaire,
  created_by,
  updated_by
) VALUES (
  '1200d873-8725-439a-8bbe-e6d4e7c26338',
  'Vital Signs Assessment',
  'Record patient vital signs including BP, HR, temperature, and more',
  'active',
  'clinical',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/vital-signs',
  '{
    "resourceType": "Questionnaire",
    "id": "vital-signs",
    "url": "http://ehrconnect.com/fhir/Questionnaire/vital-signs",
    "status": "active",
    "title": "Vital Signs Assessment",
    "description": "Record patient vital signs",
    "item": [
      {
        "linkId": "bp-systolic",
        "type": "integer",
        "text": "Blood Pressure - Systolic (mmHg)",
        "required": true
      },
      {
        "linkId": "bp-diastolic",
        "type": "integer",
        "text": "Blood Pressure - Diastolic (mmHg)",
        "required": true
      },
      {
        "linkId": "heart-rate",
        "type": "integer",
        "text": "Heart Rate (bpm)",
        "required": true
      },
      {
        "linkId": "temperature",
        "type": "decimal",
        "text": "Temperature (°F)",
        "required": true
      },
      {
        "linkId": "respiratory-rate",
        "type": "integer",
        "text": "Respiratory Rate (breaths/min)",
        "required": true
      },
      {
        "linkId": "spo2",
        "type": "integer",
        "text": "Oxygen Saturation (SpO2 %)",
        "required": true
      },
      {
        "linkId": "pain-scale",
        "type": "choice",
        "text": "Pain Scale (0-10)",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "0", "display": "0 - No Pain"}},
          {"valueCoding": {"code": "1", "display": "1"}},
          {"valueCoding": {"code": "2", "display": "2"}},
          {"valueCoding": {"code": "3", "display": "3"}},
          {"valueCoding": {"code": "4", "display": "4"}},
          {"valueCoding": {"code": "5", "display": "5 - Moderate"}},
          {"valueCoding": {"code": "6", "display": "6"}},
          {"valueCoding": {"code": "7", "display": "7"}},
          {"valueCoding": {"code": "8", "display": "8"}},
          {"valueCoding": {"code": "9", "display": "9"}},
          {"valueCoding": {"code": "10", "display": "10 - Worst Pain"}}
        ]
      },
      {
        "linkId": "weight",
        "type": "decimal",
        "text": "Weight (lbs)",
        "required": false
      },
      {
        "linkId": "height",
        "type": "integer",
        "text": "Height (inches)",
        "required": false
      },
      {
        "linkId": "notes",
        "type": "text",
        "text": "Additional Notes"
      }
    ]
  }'::jsonb,
  '0df77487-970d-4245-acd5-b2a6504e88cd',
  '0df77487-970d-4245-acd5-b2a6504e88cd'
);

-- Medical History Form
INSERT INTO form_templates (
  org_id,
  title,
  description,
  status,
  category,
  version,
  fhir_url,
  questionnaire,
  created_by,
  updated_by
) VALUES (
  '1200d873-8725-439a-8bbe-e6d4e7c26338',
  'Medical History',
  'Comprehensive medical history including conditions, medications, allergies, and surgeries',
  'active',
  'clinical',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/medical-history',
  '{
    "resourceType": "Questionnaire",
    "id": "medical-history",
    "url": "http://ehrconnect.com/fhir/Questionnaire/medical-history",
    "status": "active",
    "title": "Medical History",
    "description": "Comprehensive medical history",
    "item": [
      {
        "linkId": "current-medications",
        "type": "group",
        "text": "Current Medications",
        "item": [
          {
            "linkId": "taking-medications",
            "type": "boolean",
            "text": "Are you currently taking any medications?",
            "required": true
          },
          {
            "linkId": "medication-list",
            "type": "text",
            "text": "Please list all medications (include dosage and frequency)"
          }
        ]
      },
      {
        "linkId": "allergies",
        "type": "group",
        "text": "Allergies",
        "item": [
          {
            "linkId": "has-allergies",
            "type": "boolean",
            "text": "Do you have any allergies?",
            "required": true
          },
          {
            "linkId": "allergy-list",
            "type": "text",
            "text": "Please list all allergies (medications, food, environmental)"
          }
        ]
      },
      {
        "linkId": "chronic-conditions",
        "type": "group",
        "text": "Chronic Conditions",
        "item": [
          {
            "linkId": "diabetes",
            "type": "boolean",
            "text": "Diabetes"
          },
          {
            "linkId": "hypertension",
            "type": "boolean",
            "text": "Hypertension (High Blood Pressure)"
          },
          {
            "linkId": "heart-disease",
            "type": "boolean",
            "text": "Heart Disease"
          },
          {
            "linkId": "asthma",
            "type": "boolean",
            "text": "Asthma"
          },
          {
            "linkId": "copd",
            "type": "boolean",
            "text": "COPD"
          },
          {
            "linkId": "cancer",
            "type": "boolean",
            "text": "Cancer (current or history)"
          },
          {
            "linkId": "other-conditions",
            "type": "text",
            "text": "Other Chronic Conditions"
          }
        ]
      },
      {
        "linkId": "surgeries",
        "type": "group",
        "text": "Surgical History",
        "item": [
          {
            "linkId": "had-surgery",
            "type": "boolean",
            "text": "Have you had any surgeries?",
            "required": true
          },
          {
            "linkId": "surgery-list",
            "type": "text",
            "text": "Please list all surgeries with dates"
          }
        ]
      },
      {
        "linkId": "family-history",
        "type": "group",
        "text": "Family History",
        "item": [
          {
            "linkId": "family-heart-disease",
            "type": "boolean",
            "text": "Heart Disease in immediate family"
          },
          {
            "linkId": "family-diabetes",
            "type": "boolean",
            "text": "Diabetes in immediate family"
          },
          {
            "linkId": "family-cancer",
            "type": "boolean",
            "text": "Cancer in immediate family"
          },
          {
            "linkId": "family-other",
            "type": "text",
            "text": "Other significant family medical history"
          }
        ]
      },
      {
        "linkId": "social-history",
        "type": "group",
        "text": "Social History",
        "item": [
          {
            "linkId": "smoking",
            "type": "choice",
            "text": "Smoking Status",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "never", "display": "Never Smoked"}},
              {"valueCoding": {"code": "former", "display": "Former Smoker"}},
              {"valueCoding": {"code": "current", "display": "Current Smoker"}}
            ]
          },
          {
            "linkId": "alcohol",
            "type": "choice",
            "text": "Alcohol Use",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "none", "display": "None"}},
              {"valueCoding": {"code": "occasional", "display": "Occasional (1-2 drinks/week)"}},
              {"valueCoding": {"code": "moderate", "display": "Moderate (3-7 drinks/week)"}},
              {"valueCoding": {"code": "heavy", "display": "Heavy (8+ drinks/week)"}}
            ]
          },
          {
            "linkId": "exercise",
            "type": "choice",
            "text": "Exercise Frequency",
            "answerOption": [
              {"valueCoding": {"code": "none", "display": "None"}},
              {"valueCoding": {"code": "1-2", "display": "1-2 times per week"}},
              {"valueCoding": {"code": "3-4", "display": "3-4 times per week"}},
              {"valueCoding": {"code": "5+", "display": "5+ times per week"}}
            ]
          }
        ]
      }
    ]
  }'::jsonb,
  '0df77487-970d-4245-acd5-b2a6504e88cd',
  '0df77487-970d-4245-acd5-b2a6504e88cd'
);

-- Review of Systems Form
INSERT INTO form_templates (
  org_id,
  title,
  description,
  status,
  category,
  version,
  fhir_url,
  questionnaire,
  created_by,
  updated_by
) VALUES (
  '1200d873-8725-439a-8bbe-e6d4e7c26338',
  'Review of Systems',
  'Systematic review of symptoms across body systems',
  'active',
  'clinical',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/review-of-systems',
  '{
    "resourceType": "Questionnaire",
    "id": "review-of-systems",
    "url": "http://ehrconnect.com/fhir/Questionnaire/review-of-systems",
    "status": "active",
    "title": "Review of Systems",
    "description": "Systematic review of symptoms",
    "item": [
      {
        "linkId": "constitutional",
        "type": "group",
        "text": "Constitutional",
        "item": [
          {
            "linkId": "fever",
            "type": "boolean",
            "text": "Fever or chills"
          },
          {
            "linkId": "weight-change",
            "type": "boolean",
            "text": "Unintentional weight change"
          },
          {
            "linkId": "fatigue",
            "type": "boolean",
            "text": "Unusual fatigue or weakness"
          }
        ]
      },
      {
        "linkId": "cardiovascular",
        "type": "group",
        "text": "Cardiovascular",
        "item": [
          {
            "linkId": "chest-pain",
            "type": "boolean",
            "text": "Chest pain or discomfort"
          },
          {
            "linkId": "palpitations",
            "type": "boolean",
            "text": "Heart palpitations"
          },
          {
            "linkId": "leg-swelling",
            "type": "boolean",
            "text": "Leg swelling"
          }
        ]
      },
      {
        "linkId": "respiratory",
        "type": "group",
        "text": "Respiratory",
        "item": [
          {
            "linkId": "sob",
            "type": "boolean",
            "text": "Shortness of breath"
          },
          {
            "linkId": "cough",
            "type": "boolean",
            "text": "Persistent cough"
          },
          {
            "linkId": "wheezing",
            "type": "boolean",
            "text": "Wheezing"
          }
        ]
      },
      {
        "linkId": "gastrointestinal",
        "type": "group",
        "text": "Gastrointestinal",
        "item": [
          {
            "linkId": "nausea",
            "type": "boolean",
            "text": "Nausea or vomiting"
          },
          {
            "linkId": "abdominal-pain",
            "type": "boolean",
            "text": "Abdominal pain"
          },
          {
            "linkId": "diarrhea",
            "type": "boolean",
            "text": "Diarrhea or constipation"
          }
        ]
      },
      {
        "linkId": "neurological",
        "type": "group",
        "text": "Neurological",
        "item": [
          {
            "linkId": "headache",
            "type": "boolean",
            "text": "Frequent headaches"
          },
          {
            "linkId": "dizziness",
            "type": "boolean",
            "text": "Dizziness or lightheadedness"
          },
          {
            "linkId": "numbness",
            "type": "boolean",
            "text": "Numbness or tingling"
          }
        ]
      },
      {
        "linkId": "musculoskeletal",
        "type": "group",
        "text": "Musculoskeletal",
        "item": [
          {
            "linkId": "joint-pain",
            "type": "boolean",
            "text": "Joint pain or swelling"
          },
          {
            "linkId": "muscle-pain",
            "type": "boolean",
            "text": "Muscle pain or weakness"
          },
          {
            "linkId": "back-pain",
            "type": "boolean",
            "text": "Back pain"
          }
        ]
      },
      {
        "linkId": "ros-notes",
        "type": "text",
        "text": "Additional symptoms or concerns"
      }
    ]
  }'::jsonb,
  '0df77487-970d-4245-acd5-b2a6504e88cd',
  '0df77487-970d-4245-acd5-b2a6504e88cd'
);
