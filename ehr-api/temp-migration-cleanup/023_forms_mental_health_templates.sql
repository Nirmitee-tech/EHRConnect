-- Mental Health Form Templates
-- Migration: 023_forms_mental_health_templates.sql
-- Description: Insert predefined mental health screening and assessment form templates

-- PHQ-9 Depression Screening
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
  'PHQ-9 Depression Screening',
  'Patient Health Questionnaire-9 for depression screening',
  'active',
  'mental-health',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/phq9',
  '{
    "resourceType": "Questionnaire",
    "id": "phq9",
    "url": "http://ehrconnect.com/fhir/Questionnaire/phq9",
    "status": "active",
    "title": "PHQ-9 Depression Screening",
    "description": "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
    "item": [
      {
        "linkId": "phq9-intro",
        "type": "display",
        "text": "Over the last 2 weeks, how often have you been bothered by any of the following problems? (0 = Not at all, 1 = Several days, 2 = More than half the days, 3 = Nearly every day)"
      },
      {
        "linkId": "phq9-1",
        "type": "choice",
        "text": "1. Little interest or pleasure in doing things",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "0", "display": "Not at all"}},
          {"valueCoding": {"code": "1", "display": "Several days"}},
          {"valueCoding": {"code": "2", "display": "More than half the days"}},
          {"valueCoding": {"code": "3", "display": "Nearly every day"}}
        ]
      },
      {
        "linkId": "phq9-2",
        "type": "choice",
        "text": "2. Feeling down, depressed, or hopeless",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "0", "display": "Not at all"}},
          {"valueCoding": {"code": "1", "display": "Several days"}},
          {"valueCoding": {"code": "2", "display": "More than half the days"}},
          {"valueCoding": {"code": "3", "display": "Nearly every day"}}
        ]
      },
      {
        "linkId": "phq9-3",
        "type": "choice",
        "text": "3. Trouble falling or staying asleep, or sleeping too much",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "0", "display": "Not at all"}},
          {"valueCoding": {"code": "1", "display": "Several days"}},
          {"valueCoding": {"code": "2", "display": "More than half the days"}},
          {"valueCoding": {"code": "3", "display": "Nearly every day"}}
        ]
      },
      {
        "linkId": "phq9-4",
        "type": "choice",
        "text": "4. Feeling tired or having little energy",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "0", "display": "Not at all"}},
          {"valueCoding": {"code": "1", "display": "Several days"}},
          {"valueCoding": {"code": "2", "display": "More than half the days"}},
          {"valueCoding": {"code": "3", "display": "Nearly every day"}}
        ]
      },
      {
        "linkId": "phq9-5",
        "type": "choice",
        "text": "5. Poor appetite or overeating",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "0", "display": "Not at all"}},
          {"valueCoding": {"code": "1", "display": "Several days"}},
          {"valueCoding": {"code": "2", "display": "More than half the days"}},
          {"valueCoding": {"code": "3", "display": "Nearly every day"}}
        ]
      },
      {
        "linkId": "phq9-6",
        "type": "choice",
        "text": "6. Feeling bad about yourself - or that you are a failure or have let yourself or your family down",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "0", "display": "Not at all"}},
          {"valueCoding": {"code": "1", "display": "Several days"}},
          {"valueCoding": {"code": "2", "display": "More than half the days"}},
          {"valueCoding": {"code": "3", "display": "Nearly every day"}}
        ]
      },
      {
        "linkId": "phq9-7",
        "type": "choice",
        "text": "7. Trouble concentrating on things, such as reading the newspaper or watching television",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "0", "display": "Not at all"}},
          {"valueCoding": {"code": "1", "display": "Several days"}},
          {"valueCoding": {"code": "2", "display": "More than half the days"}},
          {"valueCoding": {"code": "3", "display": "Nearly every day"}}
        ]
      },
      {
        "linkId": "phq9-8",
        "type": "choice",
        "text": "8. Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "0", "display": "Not at all"}},
          {"valueCoding": {"code": "1", "display": "Several days"}},
          {"valueCoding": {"code": "2", "display": "More than half the days"}},
          {"valueCoding": {"code": "3", "display": "Nearly every day"}}
        ]
      },
      {
        "linkId": "phq9-9",
        "type": "choice",
        "text": "9. Thoughts that you would be better off dead, or of hurting yourself in some way",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "0", "display": "Not at all"}},
          {"valueCoding": {"code": "1", "display": "Several days"}},
          {"valueCoding": {"code": "2", "display": "More than half the days"}},
          {"valueCoding": {"code": "3", "display": "Nearly every day"}}
        ]
      },
      {
        "linkId": "phq9-difficulty",
        "type": "choice",
        "text": "If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?",
        "answerOption": [
          {"valueCoding": {"code": "not-difficult", "display": "Not difficult at all"}},
          {"valueCoding": {"code": "somewhat", "display": "Somewhat difficult"}},
          {"valueCoding": {"code": "very", "display": "Very difficult"}},
          {"valueCoding": {"code": "extremely", "display": "Extremely difficult"}}
        ]
      }
    ]
  }'::jsonb,
  '0df77487-970d-4245-acd5-b2a6504e88cd',
  '0df77487-970d-4245-acd5-b2a6504e88cd'
);

-- GAD-7 Anxiety Screening
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
  'GAD-7 Anxiety Screening',
  'Generalized Anxiety Disorder-7 screening tool',
  'active',
  'mental-health',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/gad7',
  '{
    "resourceType": "Questionnaire",
    "id": "gad7",
    "url": "http://ehrconnect.com/fhir/Questionnaire/gad7",
    "status": "active",
    "title": "GAD-7 Anxiety Screening",
    "description": "Over the last 2 weeks, how often have you been bothered by the following problems?",
    "item": [
      {
        "linkId": "gad7-intro",
        "type": "display",
        "text": "Over the last 2 weeks, how often have you been bothered by the following problems? (0 = Not at all, 1 = Several days, 2 = More than half the days, 3 = Nearly every day)"
      },
      {
        "linkId": "gad7-1",
        "type": "choice",
        "text": "1. Feeling nervous, anxious, or on edge",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "0", "display": "Not at all"}},
          {"valueCoding": {"code": "1", "display": "Several days"}},
          {"valueCoding": {"code": "2", "display": "More than half the days"}},
          {"valueCoding": {"code": "3", "display": "Nearly every day"}}
        ]
      },
      {
        "linkId": "gad7-2",
        "type": "choice",
        "text": "2. Not being able to stop or control worrying",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "0", "display": "Not at all"}},
          {"valueCoding": {"code": "1", "display": "Several days"}},
          {"valueCoding": {"code": "2", "display": "More than half the days"}},
          {"valueCoding": {"code": "3", "display": "Nearly every day"}}
        ]
      },
      {
        "linkId": "gad7-3",
        "type": "choice",
        "text": "3. Worrying too much about different things",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "0", "display": "Not at all"}},
          {"valueCoding": {"code": "1", "display": "Several days"}},
          {"valueCoding": {"code": "2", "display": "More than half the days"}},
          {"valueCoding": {"code": "3", "display": "Nearly every day"}}
        ]
      },
      {
        "linkId": "gad7-4",
        "type": "choice",
        "text": "4. Trouble relaxing",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "0", "display": "Not at all"}},
          {"valueCoding": {"code": "1", "display": "Several days"}},
          {"valueCoding": {"code": "2", "display": "More than half the days"}},
          {"valueCoding": {"code": "3", "display": "Nearly every day"}}
        ]
      },
      {
        "linkId": "gad7-5",
        "type": "choice",
        "text": "5. Being so restless that it is hard to sit still",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "0", "display": "Not at all"}},
          {"valueCoding": {"code": "1", "display": "Several days"}},
          {"valueCoding": {"code": "2", "display": "More than half the days"}},
          {"valueCoding": {"code": "3", "display": "Nearly every day"}}
        ]
      },
      {
        "linkId": "gad7-6",
        "type": "choice",
        "text": "6. Becoming easily annoyed or irritable",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "0", "display": "Not at all"}},
          {"valueCoding": {"code": "1", "display": "Several days"}},
          {"valueCoding": {"code": "2", "display": "More than half the days"}},
          {"valueCoding": {"code": "3", "display": "Nearly every day"}}
        ]
      },
      {
        "linkId": "gad7-7",
        "type": "choice",
        "text": "7. Feeling afraid, as if something awful might happen",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "0", "display": "Not at all"}},
          {"valueCoding": {"code": "1", "display": "Several days"}},
          {"valueCoding": {"code": "2", "display": "More than half the days"}},
          {"valueCoding": {"code": "3", "display": "Nearly every day"}}
        ]
      },
      {
        "linkId": "gad7-difficulty",
        "type": "choice",
        "text": "If you checked off any problems, how difficult have these problems made it for you to do your work, take care of things at home, or get along with other people?",
        "answerOption": [
          {"valueCoding": {"code": "not-difficult", "display": "Not difficult at all"}},
          {"valueCoding": {"code": "somewhat", "display": "Somewhat difficult"}},
          {"valueCoding": {"code": "very", "display": "Very difficult"}},
          {"valueCoding": {"code": "extremely", "display": "Extremely difficult"}}
        ]
      }
    ]
  }'::jsonb,
  '0df77487-970d-4245-acd5-b2a6504e88cd',
  '0df77487-970d-4245-acd5-b2a6504e88cd'
);

-- Mood Tracking Form
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
  'Daily Mood Tracker',
  'Track daily mood, sleep, and activities',
  'active',
  'mental-health',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/mood-tracker',
  '{
    "resourceType": "Questionnaire",
    "id": "mood-tracker",
    "url": "http://ehrconnect.com/fhir/Questionnaire/mood-tracker",
    "status": "active",
    "title": "Daily Mood Tracker",
    "description": "Track your daily mood, sleep, and activities",
    "item": [
      {
        "linkId": "date",
        "type": "date",
        "text": "Date",
        "required": true
      },
      {
        "linkId": "overall-mood",
        "type": "choice",
        "text": "Overall Mood Today",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "very-poor", "display": "Very Poor"}},
          {"valueCoding": {"code": "poor", "display": "Poor"}},
          {"valueCoding": {"code": "fair", "display": "Fair"}},
          {"valueCoding": {"code": "good", "display": "Good"}},
          {"valueCoding": {"code": "excellent", "display": "Excellent"}}
        ]
      },
      {
        "linkId": "anxiety-level",
        "type": "choice",
        "text": "Anxiety Level",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "none", "display": "None"}},
          {"valueCoding": {"code": "mild", "display": "Mild"}},
          {"valueCoding": {"code": "moderate", "display": "Moderate"}},
          {"valueCoding": {"code": "severe", "display": "Severe"}}
        ]
      },
      {
        "linkId": "sleep-quality",
        "type": "choice",
        "text": "Sleep Quality Last Night",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "very-poor", "display": "Very Poor"}},
          {"valueCoding": {"code": "poor", "display": "Poor"}},
          {"valueCoding": {"code": "fair", "display": "Fair"}},
          {"valueCoding": {"code": "good", "display": "Good"}},
          {"valueCoding": {"code": "excellent", "display": "Excellent"}}
        ]
      },
      {
        "linkId": "sleep-hours",
        "type": "decimal",
        "text": "Hours of Sleep",
        "required": true
      },
      {
        "linkId": "energy-level",
        "type": "choice",
        "text": "Energy Level",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "very-low", "display": "Very Low"}},
          {"valueCoding": {"code": "low", "display": "Low"}},
          {"valueCoding": {"code": "moderate", "display": "Moderate"}},
          {"valueCoding": {"code": "high", "display": "High"}},
          {"valueCoding": {"code": "very-high", "display": "Very High"}}
        ]
      },
      {
        "linkId": "activities",
        "type": "group",
        "text": "Activities Today",
        "item": [
          {
            "linkId": "exercise",
            "type": "boolean",
            "text": "Exercise"
          },
          {
            "linkId": "social",
            "type": "boolean",
            "text": "Social Activities"
          },
          {
            "linkId": "meditation",
            "type": "boolean",
            "text": "Meditation/Mindfulness"
          },
          {
            "linkId": "therapy",
            "type": "boolean",
            "text": "Therapy Session"
          }
        ]
      },
      {
        "linkId": "medication-taken",
        "type": "boolean",
        "text": "Took prescribed medication as directed"
      },
      {
        "linkId": "notes",
        "type": "text",
        "text": "Additional Notes or Reflections"
      }
    ]
  }'::jsonb,
  '0df77487-970d-4245-acd5-b2a6504e88cd',
  '0df77487-970d-4245-acd5-b2a6504e88cd'
);

-- Mental Health Intake Form
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
  'Mental Health Intake',
  'Comprehensive mental health assessment and intake form',
  'active',
  'mental-health',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/mental-health-intake',
  '{
    "resourceType": "Questionnaire",
    "id": "mental-health-intake",
    "url": "http://ehrconnect.com/fhir/Questionnaire/mental-health-intake",
    "status": "active",
    "title": "Mental Health Intake",
    "description": "Comprehensive mental health assessment",
    "item": [
      {
        "linkId": "presenting-problem",
        "type": "group",
        "text": "Presenting Problem",
        "item": [
          {
            "linkId": "chief-complaint",
            "type": "text",
            "text": "What brings you in today? Please describe your main concerns.",
            "required": true
          },
          {
            "linkId": "onset",
            "type": "text",
            "text": "When did these concerns begin?"
          },
          {
            "linkId": "triggers",
            "type": "text",
            "text": "Are there any specific triggers or situations that make it worse?"
          }
        ]
      },
      {
        "linkId": "current-symptoms",
        "type": "group",
        "text": "Current Symptoms",
        "item": [
          {
            "linkId": "depression",
            "type": "boolean",
            "text": "Depression or persistent sadness"
          },
          {
            "linkId": "anxiety",
            "type": "boolean",
            "text": "Anxiety or excessive worry"
          },
          {
            "linkId": "panic",
            "type": "boolean",
            "text": "Panic attacks"
          },
          {
            "linkId": "sleep-issues",
            "type": "boolean",
            "text": "Sleep difficulties"
          },
          {
            "linkId": "concentration",
            "type": "boolean",
            "text": "Difficulty concentrating"
          },
          {
            "linkId": "irritability",
            "type": "boolean",
            "text": "Irritability or anger"
          },
          {
            "linkId": "social-withdrawal",
            "type": "boolean",
            "text": "Social withdrawal"
          }
        ]
      },
      {
        "linkId": "psychiatric-history",
        "type": "group",
        "text": "Psychiatric History",
        "item": [
          {
            "linkId": "previous-treatment",
            "type": "boolean",
            "text": "Have you received mental health treatment before?",
            "required": true
          },
          {
            "linkId": "treatment-details",
            "type": "text",
            "text": "If yes, please describe (when, where, type of treatment)"
          },
          {
            "linkId": "current-medications",
            "type": "text",
            "text": "Current psychiatric medications"
          },
          {
            "linkId": "hospitalizations",
            "type": "boolean",
            "text": "Any psychiatric hospitalizations?"
          },
          {
            "linkId": "hospitalization-details",
            "type": "text",
            "text": "If yes, please provide details"
          }
        ]
      },
      {
        "linkId": "risk-assessment",
        "type": "group",
        "text": "Safety Assessment",
        "item": [
          {
            "linkId": "suicidal-thoughts",
            "type": "boolean",
            "text": "Have you had thoughts of harming yourself?",
            "required": true
          },
          {
            "linkId": "suicidal-plan",
            "type": "boolean",
            "text": "Do you have a plan to harm yourself?"
          },
          {
            "linkId": "homicidal-thoughts",
            "type": "boolean",
            "text": "Have you had thoughts of harming others?",
            "required": true
          },
          {
            "linkId": "self-harm-history",
            "type": "text",
            "text": "History of self-harm or suicide attempts"
          }
        ]
      },
      {
        "linkId": "substance-use",
        "type": "group",
        "text": "Substance Use",
        "item": [
          {
            "linkId": "alcohol-use",
            "type": "choice",
            "text": "Alcohol use frequency",
            "answerOption": [
              {"valueCoding": {"code": "never", "display": "Never"}},
              {"valueCoding": {"code": "rarely", "display": "Rarely"}},
              {"valueCoding": {"code": "weekly", "display": "Weekly"}},
              {"valueCoding": {"code": "daily", "display": "Daily"}}
            ]
          },
          {
            "linkId": "drug-use",
            "type": "boolean",
            "text": "Use of recreational drugs"
          },
          {
            "linkId": "drug-details",
            "type": "text",
            "text": "If yes, please specify"
          }
        ]
      },
      {
        "linkId": "support-system",
        "type": "group",
        "text": "Support System",
        "item": [
          {
            "linkId": "living-situation",
            "type": "text",
            "text": "Current living situation"
          },
          {
            "linkId": "support-people",
            "type": "text",
            "text": "Who do you rely on for support?"
          },
          {
            "linkId": "employment",
            "type": "text",
            "text": "Employment/school status"
          }
        ]
      },
      {
        "linkId": "treatment-goals",
        "type": "text",
        "text": "What are your goals for treatment?",
        "required": true
      }
    ]
  }'::jsonb,
  '0df77487-970d-4245-acd5-b2a6504e88cd',
  '0df77487-970d-4245-acd5-b2a6504e88cd'
);
