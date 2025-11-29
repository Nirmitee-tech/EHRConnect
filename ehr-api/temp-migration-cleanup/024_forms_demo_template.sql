-- Demo Form Template
-- Migration: 024_forms_demo_template.sql
-- Description: Complete demo form showcasing all features and question types

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
  'DEMO: Complete Feature Showcase',
  'Comprehensive demo form with all question types, conditional logic, and advanced features',
  'active',
  'demo',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/demo-showcase',
  '{
    "resourceType": "Questionnaire",
    "id": "demo-showcase",
    "url": "http://ehrconnect.com/fhir/Questionnaire/demo-showcase",
    "status": "active",
    "title": "DEMO: Complete Feature Showcase",
    "description": "Comprehensive demo form with all question types and features",
    "item": [
      {
        "linkId": "intro",
        "type": "display",
        "text": "Welcome to the EHR Connect Forms Demo! This form demonstrates all available question types and features including conditional logic, validation, and more."
      },
      {
        "linkId": "section-1",
        "type": "group",
        "text": "Section 1: Basic Text Inputs",
        "item": [
          {
            "linkId": "short-text",
            "type": "string",
            "text": "What is your full name?",
            "required": true,
            "maxLength": 100,
            "prefix": "1.1"
          },
          {
            "linkId": "long-text",
            "type": "text",
            "text": "Please describe your current symptoms or concerns:",
            "required": false,
            "prefix": "1.2"
          },
          {
            "linkId": "email",
            "type": "string",
            "text": "Email Address",
            "required": true,
            "maxLength": 100,
            "prefix": "1.3"
          }
        ]
      },
      {
        "linkId": "section-2",
        "type": "group",
        "text": "Section 2: Numbers and Dates",
        "item": [
          {
            "linkId": "age",
            "type": "integer",
            "text": "What is your age?",
            "required": true,
            "prefix": "2.1"
          },
          {
            "linkId": "height",
            "type": "decimal",
            "text": "Height (in meters)",
            "required": false,
            "prefix": "2.2"
          },
          {
            "linkId": "dob",
            "type": "date",
            "text": "Date of Birth",
            "required": true,
            "prefix": "2.3"
          },
          {
            "linkId": "appointment-time",
            "type": "time",
            "text": "Preferred Appointment Time",
            "required": false,
            "prefix": "2.4"
          },
          {
            "linkId": "last-visit",
            "type": "dateTime",
            "text": "Last Doctor Visit",
            "required": false,
            "prefix": "2.5"
          }
        ]
      },
      {
        "linkId": "section-3",
        "type": "group",
        "text": "Section 3: Choice Questions (Single Select)",
        "item": [
          {
            "linkId": "gender",
            "type": "choice",
            "text": "Gender",
            "required": true,
            "prefix": "3.1",
            "answerOption": [
              {"valueCoding": {"code": "male", "display": "Male"}},
              {"valueCoding": {"code": "female", "display": "Female"}},
              {"valueCoding": {"code": "other", "display": "Other"}},
              {"valueCoding": {"code": "prefer-not-say", "display": "Prefer not to say"}}
            ]
          },
          {
            "linkId": "smoking-status",
            "type": "choice",
            "text": "Smoking Status",
            "required": true,
            "prefix": "3.2",
            "answerOption": [
              {"valueCoding": {"code": "never", "display": "Never Smoked"}},
              {"valueCoding": {"code": "former", "display": "Former Smoker"}},
              {"valueCoding": {"code": "current", "display": "Current Smoker"}}
            ]
          },
          {
            "linkId": "pain-level",
            "type": "choice",
            "text": "Current Pain Level (0-10)",
            "required": false,
            "prefix": "3.3",
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
          }
        ]
      },
      {
        "linkId": "section-4",
        "type": "group",
        "text": "Section 4: Boolean Questions (Yes/No)",
        "item": [
          {
            "linkId": "has-allergies",
            "type": "boolean",
            "text": "Do you have any known allergies?",
            "required": true,
            "prefix": "4.1"
          },
          {
            "linkId": "allergy-details",
            "type": "text",
            "text": "Please list all allergies:",
            "required": false,
            "prefix": "4.2",
            "enableWhen": [
              {
                "question": "has-allergies",
                "operator": "=",
                "answerBoolean": true
              }
            ]
          },
          {
            "linkId": "takes-medication",
            "type": "boolean",
            "text": "Are you currently taking any medications?",
            "required": true,
            "prefix": "4.3"
          },
          {
            "linkId": "medication-list",
            "type": "text",
            "text": "Please list all medications with dosage:",
            "required": false,
            "prefix": "4.4",
            "enableWhen": [
              {
                "question": "takes-medication",
                "operator": "=",
                "answerBoolean": true
              }
            ]
          },
          {
            "linkId": "has-insurance",
            "type": "boolean",
            "text": "Do you have health insurance?",
            "required": true,
            "prefix": "4.5"
          }
        ]
      },
      {
        "linkId": "section-5",
        "type": "group",
        "text": "Section 5: Conditional Logic Demo",
        "item": [
          {
            "linkId": "has-chronic-condition",
            "type": "boolean",
            "text": "Do you have any chronic health conditions?",
            "required": true,
            "prefix": "5.1"
          },
          {
            "linkId": "condition-type",
            "type": "choice",
            "text": "Which type of condition?",
            "required": false,
            "prefix": "5.2",
            "enableWhen": [
              {
                "question": "has-chronic-condition",
                "operator": "=",
                "answerBoolean": true
              }
            ],
            "answerOption": [
              {"valueCoding": {"code": "diabetes", "display": "Diabetes"}},
              {"valueCoding": {"code": "hypertension", "display": "Hypertension"}},
              {"valueCoding": {"code": "heart-disease", "display": "Heart Disease"}},
              {"valueCoding": {"code": "asthma", "display": "Asthma"}},
              {"valueCoding": {"code": "other", "display": "Other"}}
            ]
          },
          {
            "linkId": "condition-details",
            "type": "text",
            "text": "Please provide details about your condition:",
            "required": false,
            "prefix": "5.3",
            "enableWhen": [
              {
                "question": "has-chronic-condition",
                "operator": "=",
                "answerBoolean": true
              }
            ]
          },
          {
            "linkId": "diabetes-type",
            "type": "choice",
            "text": "What type of diabetes?",
            "required": false,
            "prefix": "5.4",
            "enableWhen": [
              {
                "question": "condition-type",
                "operator": "=",
                "answerCoding": {
                  "code": "diabetes"
                }
              }
            ],
            "answerOption": [
              {"valueCoding": {"code": "type-1", "display": "Type 1"}},
              {"valueCoding": {"code": "type-2", "display": "Type 2"}},
              {"valueCoding": {"code": "gestational", "display": "Gestational"}},
              {"valueCoding": {"code": "prediabetes", "display": "Prediabetes"}}
            ]
          }
        ]
      },
      {
        "linkId": "section-6",
        "type": "group",
        "text": "Section 6: Medical History",
        "item": [
          {
            "linkId": "had-surgery",
            "type": "boolean",
            "text": "Have you had any surgeries?",
            "required": true,
            "prefix": "6.1"
          },
          {
            "linkId": "surgery-details",
            "type": "text",
            "text": "Please list all surgeries with dates:",
            "required": false,
            "prefix": "6.2",
            "enableWhen": [
              {
                "question": "had-surgery",
                "operator": "=",
                "answerBoolean": true
              }
            ]
          },
          {
            "linkId": "family-history",
            "type": "group",
            "text": "Family Medical History",
            "prefix": "6.3",
            "item": [
              {
                "linkId": "family-heart-disease",
                "type": "boolean",
                "text": "Heart disease in immediate family",
                "prefix": "6.3.1"
              },
              {
                "linkId": "family-diabetes",
                "type": "boolean",
                "text": "Diabetes in immediate family",
                "prefix": "6.3.2"
              },
              {
                "linkId": "family-cancer",
                "type": "boolean",
                "text": "Cancer in immediate family",
                "prefix": "6.3.3"
              }
            ]
          }
        ]
      },
      {
        "linkId": "section-7",
        "type": "group",
        "text": "Section 7: Lifestyle & Wellness",
        "item": [
          {
            "linkId": "exercise-frequency",
            "type": "choice",
            "text": "How often do you exercise?",
            "required": false,
            "prefix": "7.1",
            "answerOption": [
              {"valueCoding": {"code": "none", "display": "Never"}},
              {"valueCoding": {"code": "1-2", "display": "1-2 times per week"}},
              {"valueCoding": {"code": "3-4", "display": "3-4 times per week"}},
              {"valueCoding": {"code": "5+", "display": "5+ times per week"}},
              {"valueCoding": {"code": "daily", "display": "Daily"}}
            ]
          },
          {
            "linkId": "alcohol-use",
            "type": "choice",
            "text": "Alcohol consumption",
            "required": false,
            "prefix": "7.2",
            "answerOption": [
              {"valueCoding": {"code": "none", "display": "None"}},
              {"valueCoding": {"code": "occasional", "display": "Occasional (1-2 drinks/week)"}},
              {"valueCoding": {"code": "moderate", "display": "Moderate (3-7 drinks/week)"}},
              {"valueCoding": {"code": "heavy", "display": "Heavy (8+ drinks/week)"}}
            ]
          },
          {
            "linkId": "sleep-hours",
            "type": "integer",
            "text": "Average hours of sleep per night",
            "required": false,
            "prefix": "7.3"
          },
          {
            "linkId": "stress-level",
            "type": "choice",
            "text": "Current stress level",
            "required": false,
            "prefix": "7.4",
            "answerOption": [
              {"valueCoding": {"code": "low", "display": "Low"}},
              {"valueCoding": {"code": "moderate", "display": "Moderate"}},
              {"valueCoding": {"code": "high", "display": "High"}},
              {"valueCoding": {"code": "severe", "display": "Severe"}}
            ]
          }
        ]
      },
      {
        "linkId": "section-8",
        "type": "group",
        "text": "Section 8: Additional Information",
        "item": [
          {
            "linkId": "emergency-contact-name",
            "type": "string",
            "text": "Emergency Contact Name",
            "required": true,
            "prefix": "8.1"
          },
          {
            "linkId": "emergency-contact-phone",
            "type": "string",
            "text": "Emergency Contact Phone",
            "required": true,
            "prefix": "8.2"
          },
          {
            "linkId": "emergency-contact-relationship",
            "type": "string",
            "text": "Relationship to Emergency Contact",
            "required": true,
            "prefix": "8.3"
          },
          {
            "linkId": "additional-notes",
            "type": "text",
            "text": "Any additional information you would like to share with your healthcare provider:",
            "required": false,
            "prefix": "8.4"
          }
        ]
      },
      {
        "linkId": "outro",
        "type": "display",
        "text": "Thank you for completing this form! Your responses have been recorded and will be reviewed by your healthcare provider. This demo showcases: ✓ All question types ✓ Conditional logic (enableWhen) ✓ Required/optional fields ✓ Grouped sections ✓ Validation ✓ Progress tracking ✓ Auto-save"
      }
    ]
  }'::jsonb,
  '0df77487-970d-4245-acd5-b2a6504e88cd',
  '0df77487-970d-4245-acd5-b2a6504e88cd'
);
