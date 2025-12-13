-- Complex Healthcare Forms - Intake, Consent, and Advanced Clinical
-- Migration: 031_complex_forms.sql
-- Description: Complex forms with advanced features and conditional logic

-- Cardiology Intake Form
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
  'Cardiology Intake Assessment',
  'Comprehensive cardiac evaluation and risk assessment',
  'active',
  'cardiology',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/cardiology-intake',
  '{
    "resourceType": "Questionnaire",
    "id": "cardiology-intake",
    "url": "http://ehrconnect.com/fhir/Questionnaire/cardiology-intake",
    "status": "active",
    "title": "Cardiology Intake Assessment",
    "description": "Comprehensive cardiac evaluation",
    "item": [
      {
        "linkId": "chief-complaint",
        "type": "text",
        "text": "Primary cardiac concern or reason for visit",
        "required": true
      },
      {
        "linkId": "cardiac-symptoms",
        "type": "group",
        "text": "Cardiac Symptoms",
        "required": true,
        "item": [
          {
            "linkId": "chest-pain",
            "type": "boolean",
            "text": "Chest pain or discomfort",
            "required": true
          },
          {
            "linkId": "chest-pain-details",
            "type": "group",
            "text": "Chest Pain Details",
            "enableWhen": [
              {
                "question": "chest-pain",
                "operator": "=",
                "answerBoolean": true
              }
            ],
            "item": [
              {
                "linkId": "chest-pain-frequency",
                "type": "choice",
                "text": "How often does chest pain occur?",
                "required": true,
                "answerOption": [
                  {"valueCoding": {"code": "daily", "display": "Daily"}},
                  {"valueCoding": {"code": "weekly", "display": "Several times per week"}},
                  {"valueCoding": {"code": "monthly", "display": "Monthly"}},
                  {"valueCoding": {"code": "rarely", "display": "Rarely"}}
                ]
              },
              {
                "linkId": "chest-pain-character",
                "type": "choice",
                "text": "Character of chest pain",
                "required": true,
                "answerOption": [
                  {"valueCoding": {"code": "pressure", "display": "Pressure or squeezing"}},
                  {"valueCoding": {"code": "sharp", "display": "Sharp or stabbing"}},
                  {"valueCoding": {"code": "burning", "display": "Burning"}},
                  {"valueCoding": {"code": "dull", "display": "Dull ache"}}
                ]
              },
              {
                "linkId": "chest-pain-radiation",
                "type": "boolean",
                "text": "Does pain radiate to arm, jaw, or back?",
                "required": true
              },
              {
                "linkId": "chest-pain-triggers",
                "type": "text",
                "text": "What triggers the chest pain (e.g., exertion, stress, rest)?"
              },
              {
                "linkId": "chest-pain-relief",
                "type": "text",
                "text": "What relieves the chest pain?"
              }
            ]
          },
          {
            "linkId": "shortness-breath",
            "type": "boolean",
            "text": "Shortness of breath",
            "required": true
          },
          {
            "linkId": "sob-details",
            "type": "group",
            "text": "Shortness of Breath Details",
            "enableWhen": [
              {
                "question": "shortness-breath",
                "operator": "=",
                "answerBoolean": true
              }
            ],
            "item": [
              {
                "linkId": "sob-trigger",
                "type": "choice",
                "text": "When does shortness of breath occur?",
                "required": true,
                "answerOption": [
                  {"valueCoding": {"code": "rest", "display": "At rest"}},
                  {"valueCoding": {"code": "minimal", "display": "With minimal activity"}},
                  {"valueCoding": {"code": "moderate", "display": "With moderate activity"}},
                  {"valueCoding": {"code": "strenuous", "display": "Only with strenuous activity"}}
                ]
              },
              {
                "linkId": "orthopnea",
                "type": "boolean",
                "text": "Shortness of breath when lying flat (orthopnea)?",
                "required": true
              },
              {
                "linkId": "pillows",
                "type": "integer",
                "text": "How many pillows do you sleep on?",
                "enableWhen": [
                  {
                    "question": "orthopnea",
                    "operator": "=",
                    "answerBoolean": true
                  }
                ]
              }
            ]
          },
          {
            "linkId": "palpitations",
            "type": "boolean",
            "text": "Heart palpitations or irregular heartbeat",
            "required": true
          },
          {
            "linkId": "syncope",
            "type": "boolean",
            "text": "Fainting or near-fainting episodes",
            "required": true
          },
          {
            "linkId": "syncope-count",
            "type": "integer",
            "text": "Number of episodes in past 6 months",
            "enableWhen": [
              {
                "question": "syncope",
                "operator": "=",
                "answerBoolean": true
              }
            ]
          },
          {
            "linkId": "edema",
            "type": "boolean",
            "text": "Swelling in legs, ankles, or feet",
            "required": true
          },
          {
            "linkId": "fatigue",
            "type": "choice",
            "text": "Unusual fatigue or weakness",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "none", "display": "None"}},
              {"valueCoding": {"code": "mild", "display": "Mild"}},
              {"valueCoding": {"code": "moderate", "display": "Moderate"}},
              {"valueCoding": {"code": "severe", "display": "Severe"}}
            ]
          }
        ]
      },
      {
        "linkId": "cardiac-history",
        "type": "group",
        "text": "Cardiac History",
        "item": [
          {
            "linkId": "previous-mi",
            "type": "boolean",
            "text": "Previous heart attack (myocardial infarction)?",
            "required": true
          },
          {
            "linkId": "mi-date",
            "type": "date",
            "text": "Date of most recent heart attack",
            "enableWhen": [
              {
                "question": "previous-mi",
                "operator": "=",
                "answerBoolean": true
              }
            ]
          },
          {
            "linkId": "stents-cabg",
            "type": "choice",
            "text": "Previous cardiac procedures",
            "answerOption": [
              {"valueCoding": {"code": "none", "display": "None"}},
              {"valueCoding": {"code": "stents", "display": "Coronary stents"}},
              {"valueCoding": {"code": "cabg", "display": "CABG (bypass surgery)"}},
              {"valueCoding": {"code": "both", "display": "Both stents and CABG"}},
              {"valueCoding": {"code": "other", "display": "Other cardiac procedure"}}
            ]
          },
          {
            "linkId": "procedure-date",
            "type": "date",
            "text": "Date of most recent procedure",
            "enableWhen": [
              {
                "question": "stents-cabg",
                "operator": "!=",
                "answerCoding": {
                  "code": "none"
                }
              }
            ]
          },
          {
            "linkId": "arrhythmia",
            "type": "boolean",
            "text": "History of arrhythmia (irregular heart rhythm)?",
            "required": true
          },
          {
            "linkId": "arrhythmia-type",
            "type": "choice",
            "text": "Type of arrhythmia",
            "enableWhen": [
              {
                "question": "arrhythmia",
                "operator": "=",
                "answerBoolean": true
              }
            ],
            "answerOption": [
              {"valueCoding": {"code": "afib", "display": "Atrial fibrillation"}},
              {"valueCoding": {"code": "aflutter", "display": "Atrial flutter"}},
              {"valueCoding": {"code": "vtach", "display": "Ventricular tachycardia"}},
              {"valueCoding": {"code": "svt", "display": "Supraventricular tachycardia"}},
              {"valueCoding": {"code": "other", "display": "Other"}}
            ]
          },
          {
            "linkId": "pacemaker-icd",
            "type": "choice",
            "text": "Implanted cardiac device",
            "answerOption": [
              {"valueCoding": {"code": "none", "display": "None"}},
              {"valueCoding": {"code": "pacemaker", "display": "Pacemaker"}},
              {"valueCoding": {"code": "icd", "display": "ICD (defibrillator)"}},
              {"valueCoding": {"code": "crt", "display": "CRT (biventricular pacemaker)"}}
            ]
          },
          {
            "linkId": "valve-disease",
            "type": "boolean",
            "text": "Heart valve disease or replacement?",
            "required": true
          },
          {
            "linkId": "heart-failure",
            "type": "boolean",
            "text": "Diagnosed with heart failure?",
            "required": true
          },
          {
            "linkId": "ef-last",
            "type": "integer",
            "text": "Most recent ejection fraction (%)",
            "enableWhen": [
              {
                "question": "heart-failure",
                "operator": "=",
                "answerBoolean": true
              }
            ]
          }
        ]
      },
      {
        "linkId": "risk-factors",
        "type": "group",
        "text": "Cardiovascular Risk Factors",
        "item": [
          {
            "linkId": "hypertension",
            "type": "boolean",
            "text": "High blood pressure",
            "required": true
          },
          {
            "linkId": "diabetes",
            "type": "boolean",
            "text": "Diabetes",
            "required": true
          },
          {
            "linkId": "high-cholesterol",
            "type": "boolean",
            "text": "High cholesterol",
            "required": true
          },
          {
            "linkId": "smoking-status",
            "type": "choice",
            "text": "Smoking status",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "never", "display": "Never smoked"}},
              {"valueCoding": {"code": "former", "display": "Former smoker"}},
              {"valueCoding": {"code": "current", "display": "Current smoker"}}
            ]
          },
          {
            "linkId": "pack-years",
            "type": "decimal",
            "text": "Pack-years (if former or current smoker)",
            "enableWhen": [
              {
                "question": "smoking-status",
                "operator": "!=",
                "answerCoding": {
                  "code": "never"
                }
              }
            ]
          },
          {
            "linkId": "family-history-cad",
            "type": "boolean",
            "text": "Family history of early heart disease (men <55, women <65)?",
            "required": true
          }
        ]
      },
      {
        "linkId": "medications",
        "type": "group",
        "text": "Current Cardiac Medications",
        "item": [
          {
            "linkId": "takes-cardiac-meds",
            "type": "boolean",
            "text": "Currently taking cardiac medications?",
            "required": true
          },
          {
            "linkId": "medication-list",
            "type": "group",
            "text": "Check all medications you are currently taking",
            "enableWhen": [
              {
                "question": "takes-cardiac-meds",
                "operator": "=",
                "answerBoolean": true
              }
            ],
            "item": [
              {
                "linkId": "med-beta-blocker",
                "type": "boolean",
                "text": "Beta blocker (e.g., metoprolol, carvedilol)"
              },
              {
                "linkId": "med-ace-arb",
                "type": "boolean",
                "text": "ACE inhibitor or ARB (e.g., lisinopril, losartan)"
              },
              {
                "linkId": "med-statin",
                "type": "boolean",
                "text": "Statin (e.g., atorvastatin, simvastatin)"
              },
              {
                "linkId": "med-aspirin",
                "type": "boolean",
                "text": "Aspirin"
              },
              {
                "linkId": "med-blood-thinner",
                "type": "boolean",
                "text": "Blood thinner (e.g., warfarin, apixaban, rivaroxaban)"
              },
              {
                "linkId": "med-diuretic",
                "type": "boolean",
                "text": "Diuretic/water pill (e.g., furosemide, hydrochlorothiazide)"
              },
              {
                "linkId": "med-nitrate",
                "type": "boolean",
                "text": "Nitrate (e.g., nitroglycerin, isosorbide)"
              }
            ]
          },
          {
            "linkId": "medication-adherence",
            "type": "choice",
            "text": "How often do you take medications as prescribed?",
            "enableWhen": [
              {
                "question": "takes-cardiac-meds",
                "operator": "=",
                "answerBoolean": true
              }
            ],
            "answerOption": [
              {"valueCoding": {"code": "always", "display": "Always (100%)"}},
              {"valueCoding": {"code": "usually", "display": "Usually (75-99%)"}},
              {"valueCoding": {"code": "sometimes", "display": "Sometimes (50-74%)"}},
              {"valueCoding": {"code": "rarely", "display": "Rarely (<50%)"}}
            ]
          }
        ]
      },
      {
        "linkId": "functional-capacity",
        "type": "group",
        "text": "Functional Capacity (NYHA Classification)",
        "item": [
          {
            "linkId": "nyha-class",
            "type": "choice",
            "text": "Activity level without symptoms",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "class-1", "display": "Class I: No limitation, ordinary activity does not cause symptoms"}},
              {"valueCoding": {"code": "class-2", "display": "Class II: Slight limitation, comfortable at rest but symptoms with ordinary activity"}},
              {"valueCoding": {"code": "class-3", "display": "Class III: Marked limitation, comfortable at rest but symptoms with less than ordinary activity"}},
              {"valueCoding": {"code": "class-4", "display": "Class IV: Unable to carry out any activity without symptoms, symptoms at rest"}}
            ]
          },
          {
            "linkId": "stairs",
            "type": "choice",
            "text": "Can you climb one flight of stairs without stopping?",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "yes-easy", "display": "Yes, easily"}},
              {"valueCoding": {"code": "yes-difficulty", "display": "Yes, with difficulty"}},
              {"valueCoding": {"code": "no", "display": "No, unable"}}
            ]
          },
          {
            "linkId": "blocks",
            "type": "integer",
            "text": "How many blocks can you walk without stopping?"
          }
        ]
      },
      {
        "linkId": "recent-tests",
        "type": "group",
        "text": "Recent Cardiac Testing",
        "item": [
          {
            "linkId": "ekg-date",
            "type": "date",
            "text": "Date of last EKG"
          },
          {
            "linkId": "echo-date",
            "type": "date",
            "text": "Date of last echocardiogram"
          },
          {
            "linkId": "stress-test-date",
            "type": "date",
            "text": "Date of last stress test"
          },
          {
            "linkId": "cath-date",
            "type": "date",
            "text": "Date of last cardiac catheterization"
          }
        ]
      },
      {
        "linkId": "additional-notes",
        "type": "text",
        "text": "Additional cardiac history or concerns"
      }
    ]
  }'::jsonb,
  '187981d2-15fd-42ae-ad41-82a85f69b97e',
  '187981d2-15fd-42ae-ad41-82a85f69b97e'
);

-- Surgical Informed Consent
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
  'Surgical Informed Consent',
  'Comprehensive surgical procedure consent and acknowledgment',
  'active',
  'consent',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/surgical-consent',
  '{
    "resourceType": "Questionnaire",
    "id": "surgical-consent",
    "url": "http://ehrconnect.com/fhir/Questionnaire/surgical-consent",
    "status": "active",
    "title": "Surgical Informed Consent",
    "description": "Surgical procedure consent",
    "item": [
      {
        "linkId": "intro",
        "type": "display",
        "text": "INFORMED CONSENT FOR SURGICAL PROCEDURE - Please read this consent form carefully. This document provides information about the proposed surgical procedure, including its risks, benefits, and alternatives. You have the right to ask questions and have them answered before signing."
      },
      {
        "linkId": "patient-info",
        "type": "group",
        "text": "Patient Information",
        "item": [
          {
            "linkId": "patient-name",
            "type": "string",
            "text": "Patient Full Name",
            "required": true
          },
          {
            "linkId": "patient-dob",
            "type": "date",
            "text": "Date of Birth",
            "required": true
          },
          {
            "linkId": "patient-mrn",
            "type": "string",
            "text": "Medical Record Number",
            "required": true
          }
        ]
      },
      {
        "linkId": "procedure-info",
        "type": "group",
        "text": "Procedure Information",
        "item": [
          {
            "linkId": "procedure-name",
            "type": "text",
            "text": "Name of proposed surgical procedure",
            "required": true
          },
          {
            "linkId": "surgeon-name",
            "type": "string",
            "text": "Primary surgeon name",
            "required": true
          },
          {
            "linkId": "scheduled-date",
            "type": "date",
            "text": "Scheduled procedure date",
            "required": true
          },
          {
            "linkId": "procedure-site",
            "type": "text",
            "text": "Surgical site/laterality (e.g., right knee, left shoulder)",
            "required": true
          }
        ]
      },
      {
        "linkId": "understanding",
        "type": "group",
        "text": "Acknowledgment of Understanding",
        "item": [
          {
            "linkId": "nature-explained",
            "type": "boolean",
            "text": "I acknowledge that the nature and purpose of the surgery has been explained to me",
            "required": true
          },
          {
            "linkId": "nature-explained-check",
            "type": "display",
            "text": "You must acknowledge this to proceed",
            "enableWhen": [
              {
                "question": "nature-explained",
                "operator": "=",
                "answerBoolean": false
              }
            ]
          },
          {
            "linkId": "benefits-explained",
            "type": "boolean",
            "text": "The potential benefits of the surgery have been explained to me",
            "required": true
          },
          {
            "linkId": "risks-explained",
            "type": "boolean",
            "text": "The risks and potential complications have been explained to me, including but not limited to: infection, bleeding, adverse reaction to anesthesia, blood clots, organ damage, and death",
            "required": true
          },
          {
            "linkId": "alternatives-explained",
            "type": "boolean",
            "text": "Alternative treatment options, including non-surgical options and the option of no treatment, have been discussed",
            "required": true
          },
          {
            "linkId": "questions-answered",
            "type": "boolean",
            "text": "I have had the opportunity to ask questions and all my questions have been answered to my satisfaction",
            "required": true
          }
        ]
      },
      {
        "linkId": "specific-risks",
        "type": "group",
        "text": "Specific Risks Discussed",
        "item": [
          {
            "linkId": "risk-infection",
            "type": "boolean",
            "text": "Risk of infection",
            "required": true
          },
          {
            "linkId": "risk-bleeding",
            "type": "boolean",
            "text": "Risk of bleeding or hemorrhage",
            "required": true
          },
          {
            "linkId": "risk-anesthesia",
            "type": "boolean",
            "text": "Risks associated with anesthesia",
            "required": true
          },
          {
            "linkId": "risk-blood-clots",
            "type": "boolean",
            "text": "Risk of blood clots (DVT/PE)",
            "required": true
          },
          {
            "linkId": "risk-nerve-damage",
            "type": "boolean",
            "text": "Risk of nerve damage",
            "required": true
          },
          {
            "linkId": "risk-scarring",
            "type": "boolean",
            "text": "Risk of scarring",
            "required": true
          },
          {
            "linkId": "additional-risks",
            "type": "text",
            "text": "Additional procedure-specific risks discussed"
          }
        ]
      },
      {
        "linkId": "anesthesia-consent",
        "type": "group",
        "text": "Anesthesia Consent",
        "item": [
          {
            "linkId": "anesthesia-type",
            "type": "choice",
            "text": "Type of anesthesia planned",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "general", "display": "General anesthesia"}},
              {"valueCoding": {"code": "regional", "display": "Regional anesthesia (spinal/epidural)"}},
              {"valueCoding": {"code": "local", "display": "Local anesthesia with sedation"}},
              {"valueCoding": {"code": "local-only", "display": "Local anesthesia only"}}
            ]
          },
          {
            "linkId": "anesthesia-risks-discussed",
            "type": "boolean",
            "text": "I understand the risks of anesthesia have been explained by the anesthesia provider",
            "required": true
          },
          {
            "linkId": "anesthesia-consent-given",
            "type": "boolean",
            "text": "I consent to the administration of anesthesia",
            "required": true
          }
        ]
      },
      {
        "linkId": "additional-consents",
        "type": "group",
        "text": "Additional Authorizations",
        "item": [
          {
            "linkId": "blood-transfusion",
            "type": "choice",
            "text": "Blood transfusion consent",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "consent", "display": "I consent to blood transfusion if medically necessary"}},
              {"valueCoding": {"code": "refuse", "display": "I refuse blood transfusion"}},
              {"valueCoding": {"code": "discuss", "display": "I wish to discuss this further"}}
            ]
          },
          {
            "linkId": "tissue-disposal",
            "type": "boolean",
            "text": "I authorize the hospital to dispose of any tissue or specimens removed during surgery according to standard protocols",
            "required": true
          },
          {
            "linkId": "photography",
            "type": "choice",
            "text": "Consent for intraoperative photography",
            "answerOption": [
              {"valueCoding": {"code": "consent-medical", "display": "I consent for medical documentation only"}},
              {"valueCoding": {"code": "consent-education", "display": "I consent for medical education purposes"}},
              {"valueCoding": {"code": "refuse", "display": "I do not consent to photography"}}
            ]
          },
          {
            "linkId": "medical-students",
            "type": "boolean",
            "text": "I consent to the presence of medical students or residents during my surgery"
          }
        ]
      },
      {
        "linkId": "no-guarantees",
        "type": "group",
        "text": "Acknowledgment - No Guarantees",
        "item": [
          {
            "linkId": "no-guarantee-outcome",
            "type": "boolean",
            "text": "I understand that no guarantees have been made regarding the outcome of this surgery",
            "required": true
          },
          {
            "linkId": "unforeseen-conditions",
            "type": "boolean",
            "text": "I understand that unforeseen conditions may arise during surgery requiring procedures in addition to or different from those contemplated, and I authorize my surgeon to do what they deem advisable",
            "required": true
          }
        ]
      },
      {
        "linkId": "patient-responsibilities",
        "type": "group",
        "text": "Patient Responsibilities",
        "item": [
          {
            "linkId": "follow-instructions",
            "type": "boolean",
            "text": "I agree to follow all pre-operative and post-operative instructions",
            "required": true
          },
          {
            "linkId": "disclose-info",
            "type": "boolean",
            "text": "I have disclosed all relevant medical history, medications, allergies, and health conditions",
            "required": true
          }
        ]
      },
      {
        "linkId": "voluntary-consent",
        "type": "group",
        "text": "Voluntary Consent",
        "item": [
          {
            "linkId": "voluntary",
            "type": "boolean",
            "text": "I certify that I have read and fully understand this consent form, that my questions have been answered, and that I am voluntarily giving my consent for this surgery",
            "required": true
          },
          {
            "linkId": "competent",
            "type": "boolean",
            "text": "I certify that I am competent to give this consent",
            "required": true
          }
        ]
      },
      {
        "linkId": "signature-info",
        "type": "group",
        "text": "Signature Information",
        "item": [
          {
            "linkId": "patient-signature-name",
            "type": "string",
            "text": "Patient signature (full name)",
            "required": true
          },
          {
            "linkId": "signature-date",
            "type": "date",
            "text": "Date signed",
            "required": true
          },
          {
            "linkId": "signature-time",
            "type": "time",
            "text": "Time signed",
            "required": true
          },
          {
            "linkId": "relationship",
            "type": "choice",
            "text": "Signature as",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "patient", "display": "Patient"}},
              {"valueCoding": {"code": "legal-guardian", "display": "Legal guardian"}},
              {"valueCoding": {"code": "healthcare-proxy", "display": "Healthcare proxy"}},
              {"valueCoding": {"code": "poa", "display": "Power of attorney"}}
            ]
          },
          {
            "linkId": "guardian-name",
            "type": "string",
            "text": "If signing as legal representative, print your full name",
            "enableWhen": [
              {
                "question": "relationship",
                "operator": "!=",
                "answerCoding": {
                  "code": "patient"
                }
              }
            ]
          },
          {
            "linkId": "witness-name",
            "type": "string",
            "text": "Witness name (healthcare provider)",
            "required": true
          }
        ]
      }
    ]
  }'::jsonb,
  '187981d2-15fd-42ae-ad41-82a85f69b97e',
  '187981d2-15fd-42ae-ad41-82a85f69b97e'
);
