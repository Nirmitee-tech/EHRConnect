-- Additional Healthcare Form Templates for Demo
-- Migration: 030_additional_form_templates.sql
-- Description: Comprehensive set of common healthcare forms

-- COVID-19 Screening Form
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
  '0af276ed-da4e-4bf7-bb45-26976a7f6c3d',
  'COVID-19 Screening',
  'Pre-visit COVID-19 screening questionnaire',
  'active',
  'screening',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/covid-screening',
  '{
    "resourceType": "Questionnaire",
    "id": "covid-screening",
    "url": "http://ehrconnect.com/fhir/Questionnaire/covid-screening",
    "status": "active",
    "title": "COVID-19 Screening",
    "description": "Pre-visit COVID-19 screening",
    "item": [
      {
        "linkId": "temperature",
        "type": "decimal",
        "text": "Current temperature (°F)",
        "required": true
      },
      {
        "linkId": "symptoms",
        "type": "group",
        "text": "Have you experienced any of the following symptoms in the last 14 days?",
        "required": true,
        "item": [
          {
            "linkId": "fever",
            "type": "boolean",
            "text": "Fever or chills"
          },
          {
            "linkId": "cough",
            "type": "boolean",
            "text": "Cough"
          },
          {
            "linkId": "breath",
            "type": "boolean",
            "text": "Shortness of breath or difficulty breathing"
          },
          {
            "linkId": "fatigue",
            "type": "boolean",
            "text": "Fatigue"
          },
          {
            "linkId": "body-aches",
            "type": "boolean",
            "text": "Muscle or body aches"
          },
          {
            "linkId": "headache",
            "type": "boolean",
            "text": "Headache"
          },
          {
            "linkId": "taste-smell",
            "type": "boolean",
            "text": "New loss of taste or smell"
          },
          {
            "linkId": "sore-throat",
            "type": "boolean",
            "text": "Sore throat"
          },
          {
            "linkId": "congestion",
            "type": "boolean",
            "text": "Congestion or runny nose"
          },
          {
            "linkId": "nausea",
            "type": "boolean",
            "text": "Nausea or vomiting"
          },
          {
            "linkId": "diarrhea",
            "type": "boolean",
            "text": "Diarrhea"
          }
        ]
      },
      {
        "linkId": "exposure",
        "type": "boolean",
        "text": "Have you been in close contact with anyone diagnosed with COVID-19 in the last 14 days?",
        "required": true
      },
      {
        "linkId": "travel",
        "type": "boolean",
        "text": "Have you traveled outside your state in the last 14 days?",
        "required": true
      },
      {
        "linkId": "vaccination",
        "type": "choice",
        "text": "COVID-19 Vaccination Status",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "not-vaccinated", "display": "Not Vaccinated"}},
          {"valueCoding": {"code": "partial", "display": "Partially Vaccinated"}},
          {"valueCoding": {"code": "fully", "display": "Fully Vaccinated"}},
          {"valueCoding": {"code": "boosted", "display": "Fully Vaccinated + Booster"}}
        ]
      }
    ]
  }'::jsonb,
  '187981d2-15fd-42ae-ad41-82a85f69b97e',
  '187981d2-15fd-42ae-ad41-82a85f69b97e'
);

-- Annual Physical Exam
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
  '0af276ed-da4e-4bf7-bb45-26976a7f6c3d',
  'Annual Physical Exam',
  'Comprehensive annual health assessment',
  'active',
  'clinical',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/annual-physical',
  '{
    "resourceType": "Questionnaire",
    "id": "annual-physical",
    "url": "http://ehrconnect.com/fhir/Questionnaire/annual-physical",
    "status": "active",
    "title": "Annual Physical Exam",
    "description": "Comprehensive annual health assessment",
    "item": [
      {
        "linkId": "reason",
        "type": "text",
        "text": "Reason for today visit",
        "required": true
      },
      {
        "linkId": "health-concerns",
        "type": "text",
        "text": "Any current health concerns or changes since last visit?"
      },
      {
        "linkId": "screenings",
        "type": "group",
        "text": "Screening History",
        "item": [
          {
            "linkId": "last-physical",
            "type": "date",
            "text": "Date of last physical exam"
          },
          {
            "linkId": "last-dental",
            "type": "date",
            "text": "Date of last dental exam"
          },
          {
            "linkId": "last-eye",
            "type": "date",
            "text": "Date of last eye exam"
          },
          {
            "linkId": "last-colonoscopy",
            "type": "date",
            "text": "Date of last colonoscopy (if applicable)"
          },
          {
            "linkId": "last-mammogram",
            "type": "date",
            "text": "Date of last mammogram (if applicable)"
          }
        ]
      },
      {
        "linkId": "preventive-care",
        "type": "group",
        "text": "Preventive Care",
        "item": [
          {
            "linkId": "flu-shot",
            "type": "boolean",
            "text": "Received flu shot this year?"
          },
          {
            "linkId": "pneumonia-vaccine",
            "type": "boolean",
            "text": "Received pneumonia vaccine?"
          },
          {
            "linkId": "shingles-vaccine",
            "type": "boolean",
            "text": "Received shingles vaccine?"
          }
        ]
      },
      {
        "linkId": "lifestyle",
        "type": "group",
        "text": "Lifestyle Assessment",
        "item": [
          {
            "linkId": "diet-quality",
            "type": "choice",
            "text": "How would you rate your diet?",
            "answerOption": [
              {"valueCoding": {"code": "poor", "display": "Poor"}},
              {"valueCoding": {"code": "fair", "display": "Fair"}},
              {"valueCoding": {"code": "good", "display": "Good"}},
              {"valueCoding": {"code": "excellent", "display": "Excellent"}}
            ]
          },
          {
            "linkId": "exercise-minutes",
            "type": "integer",
            "text": "Minutes of exercise per week"
          },
          {
            "linkId": "mental-health",
            "type": "choice",
            "text": "Overall mental health status",
            "answerOption": [
              {"valueCoding": {"code": "poor", "display": "Poor"}},
              {"valueCoding": {"code": "fair", "display": "Fair"}},
              {"valueCoding": {"code": "good", "display": "Good"}},
              {"valueCoding": {"code": "excellent", "display": "Excellent"}}
            ]
          }
        ]
      }
    ]
  }'::jsonb,
  '187981d2-15fd-42ae-ad41-82a85f69b97e',
  '187981d2-15fd-42ae-ad41-82a85f69b97e'
);

-- Pre-Surgery Assessment
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
  '0af276ed-da4e-4bf7-bb45-26976a7f6c3d',
  'Pre-Surgery Assessment',
  'Pre-operative evaluation and clearance form',
  'active',
  'clinical',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/pre-surgery',
  '{
    "resourceType": "Questionnaire",
    "id": "pre-surgery",
    "url": "http://ehrconnect.com/fhir/Questionnaire/pre-surgery",
    "status": "active",
    "title": "Pre-Surgery Assessment",
    "description": "Pre-operative evaluation",
    "item": [
      {
        "linkId": "procedure",
        "type": "text",
        "text": "Scheduled surgical procedure",
        "required": true
      },
      {
        "linkId": "surgeon",
        "type": "string",
        "text": "Surgeon name",
        "required": true
      },
      {
        "linkId": "surgery-date",
        "type": "date",
        "text": "Scheduled surgery date",
        "required": true
      },
      {
        "linkId": "anesthesia-history",
        "type": "group",
        "text": "Anesthesia History",
        "item": [
          {
            "linkId": "previous-anesthesia",
            "type": "boolean",
            "text": "Have you had anesthesia before?",
            "required": true
          },
          {
            "linkId": "anesthesia-problems",
            "type": "boolean",
            "text": "Any problems with previous anesthesia?"
          },
          {
            "linkId": "anesthesia-details",
            "type": "text",
            "text": "If yes, please describe"
          },
          {
            "linkId": "family-anesthesia-problems",
            "type": "boolean",
            "text": "Any family history of anesthesia complications?"
          }
        ]
      },
      {
        "linkId": "bleeding-risk",
        "type": "group",
        "text": "Bleeding Risk",
        "item": [
          {
            "linkId": "blood-thinners",
            "type": "boolean",
            "text": "Are you taking blood thinners?",
            "required": true
          },
          {
            "linkId": "blood-thinner-list",
            "type": "text",
            "text": "List all blood thinners"
          },
          {
            "linkId": "bleeding-disorder",
            "type": "boolean",
            "text": "Do you have a bleeding disorder?"
          },
          {
            "linkId": "easy-bruising",
            "type": "boolean",
            "text": "Do you bruise or bleed easily?"
          }
        ]
      },
      {
        "linkId": "cardiac-assessment",
        "type": "group",
        "text": "Cardiac Assessment",
        "item": [
          {
            "linkId": "chest-pain",
            "type": "boolean",
            "text": "Any chest pain or angina?"
          },
          {
            "linkId": "heart-attack",
            "type": "boolean",
            "text": "History of heart attack?"
          },
          {
            "linkId": "heart-attack-date",
            "type": "date",
            "text": "If yes, when?"
          },
          {
            "linkId": "pacemaker",
            "type": "boolean",
            "text": "Do you have a pacemaker or defibrillator?"
          }
        ]
      },
      {
        "linkId": "respiratory",
        "type": "group",
        "text": "Respiratory Assessment",
        "item": [
          {
            "linkId": "shortness-breath",
            "type": "boolean",
            "text": "Shortness of breath at rest?"
          },
          {
            "linkId": "sleep-apnea",
            "type": "boolean",
            "text": "Do you have sleep apnea?"
          },
          {
            "linkId": "cpap",
            "type": "boolean",
            "text": "Do you use CPAP?"
          },
          {
            "linkId": "smoking-current",
            "type": "boolean",
            "text": "Current smoker?"
          },
          {
            "linkId": "pack-years",
            "type": "integer",
            "text": "If yes, how many pack-years?"
          }
        ]
      },
      {
        "linkId": "functional-status",
        "type": "choice",
        "text": "Can you climb a flight of stairs or walk 2 blocks without stopping?",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "yes", "display": "Yes, without difficulty"}},
          {"valueCoding": {"code": "some-difficulty", "display": "Yes, with some difficulty"}},
          {"valueCoding": {"code": "no", "display": "No, unable to do this"}}
        ]
      },
      {
        "linkId": "fasting-confirmed",
        "type": "boolean",
        "text": "I understand the fasting instructions (nothing to eat or drink after midnight before surgery)",
        "required": true
      }
    ]
  }'::jsonb,
  '187981d2-15fd-42ae-ad41-82a85f69b97e',
  '187981d2-15fd-42ae-ad41-82a85f69b97e'
);

-- Pediatric Well-Child Visit
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
  '0af276ed-da4e-4bf7-bb45-26976a7f6c3d',
  'Pediatric Well-Child Visit',
  'Routine pediatric health assessment',
  'active',
  'pediatrics',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/pediatric-well-child',
  '{
    "resourceType": "Questionnaire",
    "id": "pediatric-well-child",
    "url": "http://ehrconnect.com/fhir/Questionnaire/pediatric-well-child",
    "status": "active",
    "title": "Pediatric Well-Child Visit",
    "description": "Routine pediatric assessment",
    "item": [
      {
        "linkId": "child-age",
        "type": "integer",
        "text": "Child age (months)",
        "required": true
      },
      {
        "linkId": "concerns",
        "type": "text",
        "text": "Any concerns about your child health or development?"
      },
      {
        "linkId": "development",
        "type": "group",
        "text": "Developmental Milestones",
        "item": [
          {
            "linkId": "social-smile",
            "type": "boolean",
            "text": "Smiles at people (2 months)"
          },
          {
            "linkId": "sits-unsupported",
            "type": "boolean",
            "text": "Sits without support (6 months)"
          },
          {
            "linkId": "crawls",
            "type": "boolean",
            "text": "Crawls (9 months)"
          },
          {
            "linkId": "walks",
            "type": "boolean",
            "text": "Walks alone (12-15 months)"
          },
          {
            "linkId": "words",
            "type": "integer",
            "text": "Number of words child says"
          }
        ]
      },
      {
        "linkId": "feeding",
        "type": "group",
        "text": "Feeding",
        "item": [
          {
            "linkId": "breastfeeding",
            "type": "boolean",
            "text": "Currently breastfeeding?"
          },
          {
            "linkId": "formula",
            "type": "boolean",
            "text": "Using formula?"
          },
          {
            "linkId": "solid-foods",
            "type": "boolean",
            "text": "Eating solid foods?"
          },
          {
            "linkId": "feeding-problems",
            "type": "text",
            "text": "Any feeding difficulties?"
          }
        ]
      },
      {
        "linkId": "sleep",
        "type": "group",
        "text": "Sleep",
        "item": [
          {
            "linkId": "sleep-hours",
            "type": "integer",
            "text": "Average hours of sleep per 24 hours"
          },
          {
            "linkId": "sleep-problems",
            "type": "text",
            "text": "Any sleep concerns?"
          }
        ]
      },
      {
        "linkId": "immunizations",
        "type": "boolean",
        "text": "Is your child up to date with immunizations?",
        "required": true
      },
      {
        "linkId": "safety",
        "type": "group",
        "text": "Safety",
        "item": [
          {
            "linkId": "car-seat",
            "type": "boolean",
            "text": "Uses car seat correctly?"
          },
          {
            "linkId": "poison-control",
            "type": "boolean",
            "text": "Have poison control number available?"
          },
          {
            "linkId": "smoke-detectors",
            "type": "boolean",
            "text": "Working smoke detectors in home?"
          }
        ]
      }
    ]
  }'::jsonb,
  '187981d2-15fd-42ae-ad41-82a85f69b97e',
  '187981d2-15fd-42ae-ad41-82a85f69b97e'
);

-- Pain Assessment
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
  '0af276ed-da4e-4bf7-bb45-26976a7f6c3d',
  'Comprehensive Pain Assessment',
  'Detailed pain evaluation and management form',
  'active',
  'clinical',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/pain-assessment',
  '{
    "resourceType": "Questionnaire",
    "id": "pain-assessment",
    "url": "http://ehrconnect.com/fhir/Questionnaire/pain-assessment",
    "status": "active",
    "title": "Comprehensive Pain Assessment",
    "description": "Detailed pain evaluation",
    "item": [
      {
        "linkId": "pain-location",
        "type": "text",
        "text": "Where is your pain located?",
        "required": true
      },
      {
        "linkId": "pain-scale",
        "type": "choice",
        "text": "Current pain level (0-10)",
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
          {"valueCoding": {"code": "10", "display": "10 - Worst Possible"}}
        ]
      },
      {
        "linkId": "pain-quality",
        "type": "group",
        "text": "Describe your pain (check all that apply)",
        "item": [
          {
            "linkId": "sharp",
            "type": "boolean",
            "text": "Sharp"
          },
          {
            "linkId": "dull",
            "type": "boolean",
            "text": "Dull"
          },
          {
            "linkId": "burning",
            "type": "boolean",
            "text": "Burning"
          },
          {
            "linkId": "aching",
            "type": "boolean",
            "text": "Aching"
          },
          {
            "linkId": "throbbing",
            "type": "boolean",
            "text": "Throbbing"
          },
          {
            "linkId": "shooting",
            "type": "boolean",
            "text": "Shooting"
          },
          {
            "linkId": "stabbing",
            "type": "boolean",
            "text": "Stabbing"
          }
        ]
      },
      {
        "linkId": "pain-pattern",
        "type": "choice",
        "text": "Pain pattern",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "constant", "display": "Constant"}},
          {"valueCoding": {"code": "intermittent", "display": "Comes and goes"}},
          {"valueCoding": {"code": "worse-activity", "display": "Worse with activity"}},
          {"valueCoding": {"code": "worse-rest", "display": "Worse at rest"}}
        ]
      },
      {
        "linkId": "pain-duration",
        "type": "text",
        "text": "How long have you had this pain?",
        "required": true
      },
      {
        "linkId": "pain-worse",
        "type": "text",
        "text": "What makes the pain worse?"
      },
      {
        "linkId": "pain-better",
        "type": "text",
        "text": "What makes the pain better?"
      },
      {
        "linkId": "pain-impact",
        "type": "group",
        "text": "How does the pain affect your daily activities?",
        "item": [
          {
            "linkId": "sleep-affected",
            "type": "boolean",
            "text": "Interferes with sleep"
          },
          {
            "linkId": "work-affected",
            "type": "boolean",
            "text": "Interferes with work"
          },
          {
            "linkId": "mood-affected",
            "type": "boolean",
            "text": "Affects mood"
          },
          {
            "linkId": "activities-affected",
            "type": "boolean",
            "text": "Limits daily activities"
          }
        ]
      },
      {
        "linkId": "current-treatments",
        "type": "text",
        "text": "What treatments have you tried for this pain?"
      },
      {
        "linkId": "treatment-effectiveness",
        "type": "choice",
        "text": "How effective have these treatments been?",
        "answerOption": [
          {"valueCoding": {"code": "not-effective", "display": "Not effective"}},
          {"valueCoding": {"code": "slightly", "display": "Slightly effective"}},
          {"valueCoding": {"code": "moderately", "display": "Moderately effective"}},
          {"valueCoding": {"code": "very", "display": "Very effective"}}
        ]
      }
    ]
  }'::jsonb,
  '187981d2-15fd-42ae-ad41-82a85f69b97e',
  '187981d2-15fd-42ae-ad41-82a85f69b97e'
);

-- Fall Risk Assessment
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
  '0af276ed-da4e-4bf7-bb45-26976a7f6c3d',
  'Fall Risk Assessment',
  'Evaluate patient risk for falls',
  'active',
  'screening',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/fall-risk',
  '{
    "resourceType": "Questionnaire",
    "id": "fall-risk",
    "url": "http://ehrconnect.com/fhir/Questionnaire/fall-risk",
    "status": "active",
    "title": "Fall Risk Assessment",
    "description": "Evaluate fall risk",
    "item": [
      {
        "linkId": "previous-falls",
        "type": "boolean",
        "text": "Have you fallen in the past year?",
        "required": true
      },
      {
        "linkId": "fall-count",
        "type": "integer",
        "text": "If yes, how many times?"
      },
      {
        "linkId": "fear-falling",
        "type": "boolean",
        "text": "Are you afraid of falling?",
        "required": true
      },
      {
        "linkId": "balance-problems",
        "type": "boolean",
        "text": "Do you have problems with balance or walking?",
        "required": true
      },
      {
        "linkId": "assistive-device",
        "type": "choice",
        "text": "Do you use any assistive devices?",
        "answerOption": [
          {"valueCoding": {"code": "none", "display": "None"}},
          {"valueCoding": {"code": "cane", "display": "Cane"}},
          {"valueCoding": {"code": "walker", "display": "Walker"}},
          {"valueCoding": {"code": "wheelchair", "display": "Wheelchair"}}
        ]
      },
      {
        "linkId": "medications",
        "type": "group",
        "text": "Medications",
        "item": [
          {
            "linkId": "blood-pressure-meds",
            "type": "boolean",
            "text": "Taking blood pressure medication?"
          },
          {
            "linkId": "sedatives",
            "type": "boolean",
            "text": "Taking sedatives or sleep aids?"
          },
          {
            "linkId": "pain-meds",
            "type": "boolean",
            "text": "Taking narcotic pain medication?"
          },
          {
            "linkId": "medication-count",
            "type": "integer",
            "text": "Total number of medications taken daily"
          }
        ]
      },
      {
        "linkId": "vision-problems",
        "type": "boolean",
        "text": "Do you have vision problems?",
        "required": true
      },
      {
        "linkId": "dizziness",
        "type": "boolean",
        "text": "Do you experience dizziness?",
        "required": true
      },
      {
        "linkId": "home-safety",
        "type": "group",
        "text": "Home Safety",
        "item": [
          {
            "linkId": "throw-rugs",
            "type": "boolean",
            "text": "Throw rugs in home?"
          },
          {
            "linkId": "stairs",
            "type": "boolean",
            "text": "Stairs in home?"
          },
          {
            "linkId": "grab-bars",
            "type": "boolean",
            "text": "Grab bars in bathroom?"
          },
          {
            "linkId": "adequate-lighting",
            "type": "boolean",
            "text": "Adequate lighting in home?"
          }
        ]
      },
      {
        "linkId": "get-up-chair",
        "type": "choice",
        "text": "Do you have difficulty getting up from a chair?",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "no", "display": "No difficulty"}},
          {"valueCoding": {"code": "some", "display": "Some difficulty"}},
          {"valueCoding": {"code": "unable", "display": "Unable without help"}}
        ]
      }
    ]
  }'::jsonb,
  '187981d2-15fd-42ae-ad41-82a85f69b97e',
  '187981d2-15fd-42ae-ad41-82a85f69b97e'
);

-- Diabetes Management
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
  '0af276ed-da4e-4bf7-bb45-26976a7f6c3d',
  'Diabetes Management Follow-up',
  'Diabetes monitoring and management assessment',
  'active',
  'clinical',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/diabetes-management',
  '{
    "resourceType": "Questionnaire",
    "id": "diabetes-management",
    "url": "http://ehrconnect.com/fhir/Questionnaire/diabetes-management",
    "status": "active",
    "title": "Diabetes Management Follow-up",
    "description": "Diabetes monitoring assessment",
    "item": [
      {
        "linkId": "diabetes-type",
        "type": "choice",
        "text": "Type of Diabetes",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "type-1", "display": "Type 1"}},
          {"valueCoding": {"code": "type-2", "display": "Type 2"}},
          {"valueCoding": {"code": "gestational", "display": "Gestational"}},
          {"valueCoding": {"code": "other", "display": "Other"}}
        ]
      },
      {
        "linkId": "blood-sugar-monitoring",
        "type": "group",
        "text": "Blood Sugar Monitoring",
        "item": [
          {
            "linkId": "monitor-frequency",
            "type": "choice",
            "text": "How often do you check your blood sugar?",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "never", "display": "Never"}},
              {"valueCoding": {"code": "rarely", "display": "Rarely"}},
              {"valueCoding": {"code": "weekly", "display": "Weekly"}},
              {"valueCoding": {"code": "daily", "display": "Daily"}},
              {"valueCoding": {"code": "multiple-daily", "display": "Multiple times daily"}}
            ]
          },
          {
            "linkId": "fasting-glucose",
            "type": "integer",
            "text": "Recent fasting blood sugar (mg/dL)"
          },
          {
            "linkId": "a1c-last",
            "type": "decimal",
            "text": "Most recent A1C (%)"
          },
          {
            "linkId": "a1c-date",
            "type": "date",
            "text": "Date of last A1C test"
          }
        ]
      },
      {
        "linkId": "medications",
        "type": "group",
        "text": "Diabetes Medications",
        "item": [
          {
            "linkId": "takes-insulin",
            "type": "boolean",
            "text": "Taking insulin?",
            "required": true
          },
          {
            "linkId": "insulin-type",
            "type": "text",
            "text": "Type(s) of insulin"
          },
          {
            "linkId": "oral-meds",
            "type": "text",
            "text": "List oral diabetes medications"
          },
          {
            "linkId": "medication-adherence",
            "type": "choice",
            "text": "How often do you take your medications as prescribed?",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "always", "display": "Always"}},
              {"valueCoding": {"code": "usually", "display": "Usually"}},
              {"valueCoding": {"code": "sometimes", "display": "Sometimes"}},
              {"valueCoding": {"code": "rarely", "display": "Rarely"}},
              {"valueCoding": {"code": "never", "display": "Never"}}
            ]
          }
        ]
      },
      {
        "linkId": "hypoglycemia",
        "type": "group",
        "text": "Low Blood Sugar Episodes",
        "item": [
          {
            "linkId": "hypo-episodes",
            "type": "integer",
            "text": "Number of low blood sugar episodes in past month"
          },
          {
            "linkId": "severe-hypo",
            "type": "boolean",
            "text": "Any severe episodes requiring assistance?"
          }
        ]
      },
      {
        "linkId": "complications",
        "type": "group",
        "text": "Diabetes Complications Screening",
        "item": [
          {
            "linkId": "eye-exam-date",
            "type": "date",
            "text": "Date of last diabetic eye exam"
          },
          {
            "linkId": "foot-exam-date",
            "type": "date",
            "text": "Date of last foot exam"
          },
          {
            "linkId": "numbness-tingling",
            "type": "boolean",
            "text": "Numbness or tingling in feet?"
          },
          {
            "linkId": "foot-wounds",
            "type": "boolean",
            "text": "Any foot wounds or sores?"
          }
        ]
      },
      {
        "linkId": "lifestyle",
        "type": "group",
        "text": "Lifestyle Management",
        "item": [
          {
            "linkId": "diet-plan",
            "type": "boolean",
            "text": "Following a meal plan?"
          },
          {
            "linkId": "exercise-frequency",
            "type": "choice",
            "text": "How often do you exercise?",
            "answerOption": [
              {"valueCoding": {"code": "never", "display": "Never"}},
              {"valueCoding": {"code": "1-2", "display": "1-2 times/week"}},
              {"valueCoding": {"code": "3-4", "display": "3-4 times/week"}},
              {"valueCoding": {"code": "5+", "display": "5+ times/week"}}
            ]
          }
        ]
      }
    ]
  }'::jsonb,
  '187981d2-15fd-42ae-ad41-82a85f69b97e',
  '187981d2-15fd-42ae-ad41-82a85f69b97e'
);

-- Maternity Intake
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
  '0af276ed-da4e-4bf7-bb45-26976a7f6c3d',
  'Maternity Intake Form',
  'Initial prenatal care assessment',
  'active',
  'obstetrics',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/maternity-intake',
  '{
    "resourceType": "Questionnaire",
    "id": "maternity-intake",
    "url": "http://ehrconnect.com/fhir/Questionnaire/maternity-intake",
    "status": "active",
    "title": "Maternity Intake Form",
    "description": "Initial prenatal assessment",
    "item": [
      {
        "linkId": "lmp",
        "type": "date",
        "text": "Last Menstrual Period (LMP)",
        "required": true
      },
      {
        "linkId": "edd",
        "type": "date",
        "text": "Estimated Due Date",
        "required": true
      },
      {
        "linkId": "pregnancy-history",
        "type": "group",
        "text": "Pregnancy History",
        "item": [
          {
            "linkId": "gravida",
            "type": "integer",
            "text": "Number of pregnancies (including current)",
            "required": true
          },
          {
            "linkId": "para",
            "type": "integer",
            "text": "Number of live births",
            "required": true
          },
          {
            "linkId": "miscarriages",
            "type": "integer",
            "text": "Number of miscarriages"
          },
          {
            "linkId": "abortions",
            "type": "integer",
            "text": "Number of abortions"
          }
        ]
      },
      {
        "linkId": "previous-complications",
        "type": "text",
        "text": "Any complications in previous pregnancies?"
      },
      {
        "linkId": "previous-delivery",
        "type": "choice",
        "text": "Previous delivery method",
        "answerOption": [
          {"valueCoding": {"code": "none", "display": "No previous deliveries"}},
          {"valueCoding": {"code": "vaginal", "display": "Vaginal"}},
          {"valueCoding": {"code": "c-section", "display": "C-Section"}},
          {"valueCoding": {"code": "both", "display": "Both"}}
        ]
      },
      {
        "linkId": "current-symptoms",
        "type": "group",
        "text": "Current Symptoms",
        "item": [
          {
            "linkId": "nausea",
            "type": "boolean",
            "text": "Nausea or vomiting"
          },
          {
            "linkId": "bleeding",
            "type": "boolean",
            "text": "Vaginal bleeding"
          },
          {
            "linkId": "cramping",
            "type": "boolean",
            "text": "Abdominal cramping"
          },
          {
            "linkId": "headaches",
            "type": "boolean",
            "text": "Severe headaches"
          }
        ]
      },
      {
        "linkId": "prenatal-vitamins",
        "type": "boolean",
        "text": "Taking prenatal vitamins?",
        "required": true
      },
      {
        "linkId": "chronic-conditions",
        "type": "group",
        "text": "Pre-existing Conditions",
        "item": [
          {
            "linkId": "diabetes",
            "type": "boolean",
            "text": "Diabetes"
          },
          {
            "linkId": "hypertension",
            "type": "boolean",
            "text": "High blood pressure"
          },
          {
            "linkId": "thyroid",
            "type": "boolean",
            "text": "Thyroid disorder"
          },
          {
            "linkId": "other-conditions",
            "type": "text",
            "text": "Other chronic conditions"
          }
        ]
      },
      {
        "linkId": "substance-use",
        "type": "group",
        "text": "Substance Use During Pregnancy",
        "item": [
          {
            "linkId": "smoking",
            "type": "boolean",
            "text": "Smoking cigarettes?"
          },
          {
            "linkId": "alcohol",
            "type": "boolean",
            "text": "Drinking alcohol?"
          },
          {
            "linkId": "drugs",
            "type": "boolean",
            "text": "Using recreational drugs?"
          }
        ]
      },
      {
        "linkId": "support-system",
        "type": "text",
        "text": "Who will be your support person(s) during pregnancy and delivery?"
      },
      {
        "linkId": "birth-plan",
        "type": "text",
        "text": "Do you have any specific preferences for your birth plan?"
      }
    ]
  }'::jsonb,
  '187981d2-15fd-42ae-ad41-82a85f69b97e',
  '187981d2-15fd-42ae-ad41-82a85f69b97e'
);

-- Dental History
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
  '0af276ed-da4e-4bf7-bb45-26976a7f6c3d',
  'Dental History Form',
  'Comprehensive dental health assessment',
  'active',
  'dental',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/dental-history',
  '{
    "resourceType": "Questionnaire",
    "id": "dental-history",
    "url": "http://ehrconnect.com/fhir/Questionnaire/dental-history",
    "status": "active",
    "title": "Dental History Form",
    "description": "Dental health assessment",
    "item": [
      {
        "linkId": "chief-complaint",
        "type": "text",
        "text": "What is your main dental concern today?",
        "required": true
      },
      {
        "linkId": "last-dental-visit",
        "type": "date",
        "text": "Date of last dental visit"
      },
      {
        "linkId": "last-cleaning",
        "type": "date",
        "text": "Date of last dental cleaning"
      },
      {
        "linkId": "current-problems",
        "type": "group",
        "text": "Current Dental Problems",
        "item": [
          {
            "linkId": "pain",
            "type": "boolean",
            "text": "Tooth pain"
          },
          {
            "linkId": "sensitivity",
            "type": "boolean",
            "text": "Sensitivity to hot/cold"
          },
          {
            "linkId": "bleeding-gums",
            "type": "boolean",
            "text": "Bleeding gums"
          },
          {
            "linkId": "loose-teeth",
            "type": "boolean",
            "text": "Loose teeth"
          },
          {
            "linkId": "jaw-pain",
            "type": "boolean",
            "text": "Jaw pain or clicking"
          },
          {
            "linkId": "sores",
            "type": "boolean",
            "text": "Mouth sores"
          }
        ]
      },
      {
        "linkId": "dental-history",
        "type": "group",
        "text": "Dental Treatment History",
        "item": [
          {
            "linkId": "fillings",
            "type": "boolean",
            "text": "Previous fillings?"
          },
          {
            "linkId": "root-canals",
            "type": "boolean",
            "text": "Previous root canals?"
          },
          {
            "linkId": "crowns-bridges",
            "type": "boolean",
            "text": "Crowns or bridges?"
          },
          {
            "linkId": "implants",
            "type": "boolean",
            "text": "Dental implants?"
          },
          {
            "linkId": "dentures",
            "type": "boolean",
            "text": "Dentures (full or partial)?"
          },
          {
            "linkId": "orthodontics",
            "type": "boolean",
            "text": "Previous orthodontic treatment?"
          }
        ]
      },
      {
        "linkId": "oral-hygiene",
        "type": "group",
        "text": "Oral Hygiene Habits",
        "item": [
          {
            "linkId": "brushing-frequency",
            "type": "choice",
            "text": "How often do you brush your teeth?",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "rarely", "display": "Rarely"}},
              {"valueCoding": {"code": "once", "display": "Once daily"}},
              {"valueCoding": {"code": "twice", "display": "Twice daily"}},
              {"valueCoding": {"code": "more", "display": "More than twice daily"}}
            ]
          },
          {
            "linkId": "flossing-frequency",
            "type": "choice",
            "text": "How often do you floss?",
            "answerOption": [
              {"valueCoding": {"code": "never", "display": "Never"}},
              {"valueCoding": {"code": "rarely", "display": "Rarely"}},
              {"valueCoding": {"code": "weekly", "display": "Few times per week"}},
              {"valueCoding": {"code": "daily", "display": "Daily"}}
            ]
          },
          {
            "linkId": "mouthwash",
            "type": "boolean",
            "text": "Use mouthwash regularly?"
          }
        ]
      },
      {
        "linkId": "habits",
        "type": "group",
        "text": "Habits",
        "item": [
          {
            "linkId": "grinding",
            "type": "boolean",
            "text": "Grind or clench teeth?"
          },
          {
            "linkId": "tobacco",
            "type": "boolean",
            "text": "Use tobacco products?"
          },
          {
            "linkId": "tobacco-type",
            "type": "text",
            "text": "If yes, what type and how much?"
          }
        ]
      },
      {
        "linkId": "dental-anxiety",
        "type": "choice",
        "text": "How anxious are you about dental treatment?",
        "answerOption": [
          {"valueCoding": {"code": "not-anxious", "display": "Not anxious"}},
          {"valueCoding": {"code": "slightly", "display": "Slightly anxious"}},
          {"valueCoding": {"code": "moderately", "display": "Moderately anxious"}},
          {"valueCoding": {"code": "very", "display": "Very anxious"}}
        ]
      },
      {
        "linkId": "anesthesia-concerns",
        "type": "text",
        "text": "Any concerns about dental anesthesia or sedation?"
      }
    ]
  }'::jsonb,
  '187981d2-15fd-42ae-ad41-82a85f69b97e',
  '187981d2-15fd-42ae-ad41-82a85f69b97e'
);

-- Immunization Record
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
  '0af276ed-da4e-4bf7-bb45-26976a7f6c3d',
  'Immunization History',
  'Vaccination history and record',
  'active',
  'screening',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/immunization-history',
  '{
    "resourceType": "Questionnaire",
    "id": "immunization-history",
    "url": "http://ehrconnect.com/fhir/Questionnaire/immunization-history",
    "status": "active",
    "title": "Immunization History",
    "description": "Vaccination record",
    "item": [
      {
        "linkId": "childhood-vaccines",
        "type": "group",
        "text": "Childhood Vaccinations",
        "item": [
          {
            "linkId": "mmr",
            "type": "boolean",
            "text": "MMR (Measles, Mumps, Rubella)"
          },
          {
            "linkId": "dtap",
            "type": "boolean",
            "text": "DTaP (Diphtheria, Tetanus, Pertussis)"
          },
          {
            "linkId": "polio",
            "type": "boolean",
            "text": "Polio"
          },
          {
            "linkId": "varicella",
            "type": "boolean",
            "text": "Varicella (Chickenpox)"
          },
          {
            "linkId": "hep-b",
            "type": "boolean",
            "text": "Hepatitis B"
          }
        ]
      },
      {
        "linkId": "tetanus",
        "type": "group",
        "text": "Tetanus (Tdap)",
        "item": [
          {
            "linkId": "tetanus-received",
            "type": "boolean",
            "text": "Received Tdap booster?",
            "required": true
          },
          {
            "linkId": "tetanus-date",
            "type": "date",
            "text": "Date of last Tdap"
          }
        ]
      },
      {
        "linkId": "flu",
        "type": "group",
        "text": "Influenza",
        "item": [
          {
            "linkId": "flu-this-year",
            "type": "boolean",
            "text": "Received flu vaccine this year?",
            "required": true
          },
          {
            "linkId": "flu-date",
            "type": "date",
            "text": "Date of flu vaccine"
          }
        ]
      },
      {
        "linkId": "covid-19",
        "type": "group",
        "text": "COVID-19 Vaccination",
        "item": [
          {
            "linkId": "covid-vaccinated",
            "type": "boolean",
            "text": "Received COVID-19 vaccine?",
            "required": true
          },
          {
            "linkId": "covid-type",
            "type": "choice",
            "text": "Vaccine type",
            "answerOption": [
              {"valueCoding": {"code": "pfizer", "display": "Pfizer-BioNTech"}},
              {"valueCoding": {"code": "moderna", "display": "Moderna"}},
              {"valueCoding": {"code": "jj", "display": "Johnson & Johnson"}},
              {"valueCoding": {"code": "other", "display": "Other"}}
            ]
          },
          {
            "linkId": "covid-doses",
            "type": "integer",
            "text": "Number of doses received"
          },
          {
            "linkId": "covid-last-date",
            "type": "date",
            "text": "Date of last dose"
          },
          {
            "linkId": "covid-booster",
            "type": "boolean",
            "text": "Received booster?"
          }
        ]
      },
      {
        "linkId": "pneumonia",
        "type": "group",
        "text": "Pneumococcal Vaccine",
        "item": [
          {
            "linkId": "pneumonia-received",
            "type": "boolean",
            "text": "Received pneumonia vaccine?"
          },
          {
            "linkId": "pneumonia-date",
            "type": "date",
            "text": "Date received"
          }
        ]
      },
      {
        "linkId": "shingles",
        "type": "group",
        "text": "Shingles Vaccine",
        "item": [
          {
            "linkId": "shingles-received",
            "type": "boolean",
            "text": "Received shingles vaccine?"
          },
          {
            "linkId": "shingles-date",
            "type": "date",
            "text": "Date received"
          }
        ]
      },
      {
        "linkId": "hpv",
        "type": "group",
        "text": "HPV Vaccine",
        "item": [
          {
            "linkId": "hpv-received",
            "type": "boolean",
            "text": "Received HPV vaccine?"
          },
          {
            "linkId": "hpv-doses",
            "type": "integer",
            "text": "Number of doses completed"
          }
        ]
      },
      {
        "linkId": "travel-vaccines",
        "type": "text",
        "text": "Any travel-related vaccines (Yellow Fever, Typhoid, etc.)?"
      },
      {
        "linkId": "vaccine-reactions",
        "type": "text",
        "text": "Any adverse reactions to vaccines in the past?"
      }
    ]
  }'::jsonb,
  '187981d2-15fd-42ae-ad41-82a85f69b97e',
  '187981d2-15fd-42ae-ad41-82a85f69b97e'
);
