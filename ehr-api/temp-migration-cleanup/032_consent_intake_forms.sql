-- Additional Consent and Intake Forms
-- Migration: 032_consent_intake_forms.sql

-- HIPAA Privacy Consent
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
  'HIPAA Privacy Authorization',
  'Health information privacy practices acknowledgment and authorization',
  'active',
  'consent',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/hipaa-consent',
  '{
    "resourceType": "Questionnaire",
    "id": "hipaa-consent",
    "url": "http://ehrconnect.com/fhir/Questionnaire/hipaa-consent",
    "status": "active",
    "title": "HIPAA Privacy Authorization",
    "description": "Privacy practices and health information authorization",
    "item": [
      {
        "linkId": "intro",
        "type": "display",
        "text": "NOTICE OF PRIVACY PRACTICES - This form explains how your medical information may be used and disclosed, and how you can access this information. Please review carefully."
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
          }
        ]
      },
      {
        "linkId": "notice-acknowledgment",
        "type": "group",
        "text": "Acknowledgment of Notice of Privacy Practices",
        "item": [
          {
            "linkId": "received-notice",
            "type": "boolean",
            "text": "I acknowledge that I have received a copy of the Notice of Privacy Practices",
            "required": true
          },
          {
            "linkId": "understand-rights",
            "type": "boolean",
            "text": "I understand that I have the right to request restrictions on how my health information is used and disclosed",
            "required": true
          },
          {
            "linkId": "understand-review",
            "type": "boolean",
            "text": "I understand that I have the right to review the Notice of Privacy Practices before signing this consent",
            "required": true
          }
        ]
      },
      {
        "linkId": "communication-preferences",
        "type": "group",
        "text": "Communication Preferences",
        "item": [
          {
            "linkId": "preferred-contact",
            "type": "choice",
            "text": "Preferred method of contact for appointment reminders and test results",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "phone", "display": "Phone call"}},
              {"valueCoding": {"code": "text", "display": "Text message"}},
              {"valueCoding": {"code": "email", "display": "Email"}},
              {"valueCoding": {"code": "mail", "display": "Postal mail"}},
              {"valueCoding": {"code": "patient-portal", "display": "Patient portal only"}}
            ]
          },
          {
            "linkId": "contact-phone",
            "type": "string",
            "text": "Best phone number to reach you",
            "required": true
          },
          {
            "linkId": "leave-message",
            "type": "boolean",
            "text": "May we leave a message with appointment information or test results?",
            "required": true
          },
          {
            "linkId": "contact-email",
            "type": "string",
            "text": "Email address (if email communication authorized)"
          }
        ]
      },
      {
        "linkId": "authorized-contacts",
        "type": "group",
        "text": "Authorization to Share Information",
        "item": [
          {
            "linkId": "has-authorized-contacts",
            "type": "boolean",
            "text": "I wish to authorize specific individuals to receive my health information",
            "required": true
          },
          {
            "linkId": "contact-1-name",
            "type": "string",
            "text": "Authorized Person 1: Full Name",
            "enableWhen": [
              {
                "question": "has-authorized-contacts",
                "operator": "=",
                "answerBoolean": true
              }
            ]
          },
          {
            "linkId": "contact-1-relationship",
            "type": "string",
            "text": "Relationship to Patient",
            "enableWhen": [
              {
                "question": "has-authorized-contacts",
                "operator": "=",
                "answerBoolean": true
              }
            ]
          },
          {
            "linkId": "contact-1-phone",
            "type": "string",
            "text": "Phone Number",
            "enableWhen": [
              {
                "question": "has-authorized-contacts",
                "operator": "=",
                "answerBoolean": true
              }
            ]
          },
          {
            "linkId": "contact-2-name",
            "type": "string",
            "text": "Authorized Person 2: Full Name",
            "enableWhen": [
              {
                "question": "has-authorized-contacts",
                "operator": "=",
                "answerBoolean": true
              }
            ]
          },
          {
            "linkId": "contact-2-relationship",
            "type": "string",
            "text": "Relationship to Patient",
            "enableWhen": [
              {
                "question": "has-authorized-contacts",
                "operator": "=",
                "answerBoolean": true
              }
            ]
          },
          {
            "linkId": "contact-2-phone",
            "type": "string",
            "text": "Phone Number",
            "enableWhen": [
              {
                "question": "has-authorized-contacts",
                "operator": "=",
                "answerBoolean": true
              }
            ]
          }
        ]
      },
      {
        "linkId": "special-restrictions",
        "type": "group",
        "text": "Special Restrictions (Optional)",
        "item": [
          {
            "linkId": "request-restrictions",
            "type": "boolean",
            "text": "I wish to request restrictions on disclosure of my health information"
          },
          {
            "linkId": "restriction-details",
            "type": "text",
            "text": "Describe any specific restrictions you are requesting",
            "enableWhen": [
              {
                "question": "request-restrictions",
                "operator": "=",
                "answerBoolean": true
              }
            ]
          }
        ]
      },
      {
        "linkId": "marketing-research",
        "type": "group",
        "text": "Marketing and Research Communications",
        "item": [
          {
            "linkId": "opt-in-marketing",
            "type": "boolean",
            "text": "I consent to receive marketing communications about health-related products and services"
          },
          {
            "linkId": "opt-in-research",
            "type": "boolean",
            "text": "I am willing to be contacted about participating in clinical research studies"
          }
        ]
      },
      {
        "linkId": "patient-portal",
        "type": "group",
        "text": "Patient Portal Access",
        "item": [
          {
            "linkId": "portal-access",
            "type": "boolean",
            "text": "I wish to activate my patient portal account for online access to my health records",
            "required": true
          },
          {
            "linkId": "portal-email",
            "type": "string",
            "text": "Email address for portal login",
            "enableWhen": [
              {
                "question": "portal-access",
                "operator": "=",
                "answerBoolean": true
              }
            ]
          }
        ]
      },
      {
        "linkId": "consent-signature",
        "type": "group",
        "text": "Signature",
        "item": [
          {
            "linkId": "signature-name",
            "type": "string",
            "text": "Patient or Legal Representative Signature (full name)",
            "required": true
          },
          {
            "linkId": "signature-date",
            "type": "date",
            "text": "Date",
            "required": true
          },
          {
            "linkId": "rep-capacity",
            "type": "string",
            "text": "If signing as legal representative, state capacity (e.g., parent, guardian, POA)"
          }
        ]
      }
    ]
  }'::jsonb,
  '187981d2-15fd-42ae-ad41-82a85f69b97e',
  '187981d2-15fd-42ae-ad41-82a85f69b97e'
);

-- Telemedicine Consent
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
  'Telemedicine Consent Form',
  'Informed consent for telehealth services',
  'active',
  'consent',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/telemedicine-consent',
  '{
    "resourceType": "Questionnaire",
    "id": "telemedicine-consent",
    "url": "http://ehrconnect.com/fhir/Questionnaire/telemedicine-consent",
    "status": "active",
    "title": "Telemedicine Consent Form",
    "description": "Consent for telehealth services",
    "item": [
      {
        "linkId": "intro",
        "type": "display",
        "text": "TELEMEDICINE INFORMED CONSENT - Telemedicine involves the use of electronic communications to provide healthcare services remotely. This consent explains what to expect from telemedicine services."
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
          }
        ]
      },
      {
        "linkId": "understanding",
        "type": "group",
        "text": "Understanding of Telemedicine",
        "item": [
          {
            "linkId": "understand-definition",
            "type": "boolean",
            "text": "I understand that telemedicine is the use of video conferencing and other electronic communications for healthcare consultations",
            "required": true
          },
          {
            "linkId": "understand-technology",
            "type": "boolean",
            "text": "I understand that telemedicine requires appropriate technology including internet access, camera, and microphone",
            "required": true
          },
          {
            "linkId": "technology-available",
            "type": "boolean",
            "text": "I confirm that I have access to the necessary technology for telemedicine visits",
            "required": true
          }
        ]
      },
      {
        "linkId": "benefits-risks",
        "type": "group",
        "text": "Benefits and Limitations",
        "item": [
          {
            "linkId": "understand-benefits",
            "type": "boolean",
            "text": "I understand the potential benefits of telemedicine including increased access to care and reduced travel",
            "required": true
          },
          {
            "linkId": "understand-limitations",
            "type": "boolean",
            "text": "I understand that telemedicine has limitations and may not be appropriate for all conditions or situations",
            "required": true
          },
          {
            "linkId": "understand-physical-exam",
            "type": "boolean",
            "text": "I understand that physical examination is limited during telemedicine visits",
            "required": true
          },
          {
            "linkId": "in-person-if-needed",
            "type": "boolean",
            "text": "I understand that I may need to schedule an in-person visit if deemed medically necessary",
            "required": true
          }
        ]
      },
      {
        "linkId": "privacy-security",
        "type": "group",
        "text": "Privacy and Security",
        "item": [
          {
            "linkId": "understand-hipaa",
            "type": "boolean",
            "text": "I understand that telemedicine sessions are protected by HIPAA and other privacy laws",
            "required": true
          },
          {
            "linkId": "secure-location",
            "type": "boolean",
            "text": "I agree to participate in telemedicine visits from a private, secure location",
            "required": true
          },
          {
            "linkId": "understand-recording",
            "type": "boolean",
            "text": "I understand that telemedicine sessions may be recorded for medical documentation purposes only",
            "required": true
          },
          {
            "linkId": "no-personal-recording",
            "type": "boolean",
            "text": "I agree not to record telemedicine sessions on my personal devices without provider consent",
            "required": true
          }
        ]
      },
      {
        "linkId": "technical-issues",
        "type": "group",
        "text": "Technical Requirements and Issues",
        "item": [
          {
            "linkId": "understand-technical-problems",
            "type": "boolean",
            "text": "I understand that technical difficulties may interrupt or prevent a telemedicine visit",
            "required": true
          },
          {
            "linkId": "backup-plan",
            "type": "boolean",
            "text": "I understand that if technical problems occur, we may continue by phone or reschedule",
            "required": true
          },
          {
            "linkId": "reliable-contact",
            "type": "string",
            "text": "Best phone number to reach you if connection is lost",
            "required": true
          }
        ]
      },
      {
        "linkId": "emergency-care",
        "type": "group",
        "text": "Emergency Care Understanding",
        "item": [
          {
            "linkId": "understand-not-emergency",
            "type": "boolean",
            "text": "I understand that telemedicine is NOT appropriate for medical emergencies",
            "required": true
          },
          {
            "linkId": "call-911",
            "type": "boolean",
            "text": "I understand that in case of emergency, I should call 911 or go to the nearest emergency room",
            "required": true
          },
          {
            "linkId": "current-location",
            "type": "text",
            "text": "Location where I will be during the telemedicine visit (city, state)",
            "required": true
          }
        ]
      },
      {
        "linkId": "payment-insurance",
        "type": "group",
        "text": "Payment and Insurance",
        "item": [
          {
            "linkId": "understand-billing",
            "type": "boolean",
            "text": "I understand that telemedicine visits will be billed similarly to in-person visits",
            "required": true
          },
          {
            "linkId": "insurance-coverage",
            "type": "choice",
            "text": "Payment method for telemedicine services",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "insurance", "display": "Insurance (will verify coverage)"}},
              {"valueCoding": {"code": "self-pay", "display": "Self-pay"}},
              {"valueCoding": {"code": "unsure", "display": "Unsure - need assistance"}}
            ]
          }
        ]
      },
      {
        "linkId": "patient-responsibilities",
        "type": "group",
        "text": "Patient Responsibilities",
        "item": [
          {
            "linkId": "accurate-information",
            "type": "boolean",
            "text": "I agree to provide accurate medical history and current symptoms",
            "required": true
          },
          {
            "linkId": "follow-instructions",
            "type": "boolean",
            "text": "I agree to follow all instructions given during the telemedicine visit",
            "required": true
          },
          {
            "linkId": "inform-changes",
            "type": "boolean",
            "text": "I agree to inform my provider of any changes in my condition",
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
            "text": "I voluntarily consent to receive healthcare services via telemedicine",
            "required": true
          },
          {
            "linkId": "can-withdraw",
            "type": "boolean",
            "text": "I understand that I may withdraw consent for telemedicine at any time",
            "required": true
          },
          {
            "linkId": "questions-answered",
            "type": "boolean",
            "text": "My questions about telemedicine have been answered to my satisfaction",
            "required": true
          }
        ]
      },
      {
        "linkId": "signature",
        "type": "group",
        "text": "Signature",
        "item": [
          {
            "linkId": "signature-name",
            "type": "string",
            "text": "Patient or Legal Guardian Signature (full name)",
            "required": true
          },
          {
            "linkId": "signature-date",
            "type": "date",
            "text": "Date",
            "required": true
          }
        ]
      }
    ]
  }'::jsonb,
  '187981d2-15fd-42ae-ad41-82a85f69b97e',
  '187981d2-15fd-42ae-ad41-82a85f69b97e'
);

-- Oncology Intake Form
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
  'Oncology New Patient Intake',
  'Comprehensive cancer care initial assessment',
  'active',
  'oncology',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/oncology-intake',
  '{
    "resourceType": "Questionnaire",
    "id": "oncology-intake",
    "url": "http://ehrconnect.com/fhir/Questionnaire/oncology-intake",
    "status": "active",
    "title": "Oncology New Patient Intake",
    "description": "Comprehensive cancer care intake",
    "item": [
      {
        "linkId": "diagnosis-info",
        "type": "group",
        "text": "Cancer Diagnosis Information",
        "item": [
          {
            "linkId": "cancer-type",
            "type": "text",
            "text": "Type of cancer diagnosed",
            "required": true
          },
          {
            "linkId": "diagnosis-date",
            "type": "date",
            "text": "Date of diagnosis",
            "required": true
          },
          {
            "linkId": "stage",
            "type": "choice",
            "text": "Cancer stage (if known)",
            "answerOption": [
              {"valueCoding": {"code": "stage-0", "display": "Stage 0 (Carcinoma in situ)"}},
              {"valueCoding": {"code": "stage-1", "display": "Stage I"}},
              {"valueCoding": {"code": "stage-2", "display": "Stage II"}},
              {"valueCoding": {"code": "stage-3", "display": "Stage III"}},
              {"valueCoding": {"code": "stage-4", "display": "Stage IV"}},
              {"valueCoding": {"code": "unknown", "display": "Unknown/Not yet staged"}}
            ]
          },
          {
            "linkId": "primary-site",
            "type": "text",
            "text": "Primary tumor site/location",
            "required": true
          },
          {
            "linkId": "metastasis",
            "type": "boolean",
            "text": "Has cancer spread (metastasized)?",
            "required": true
          },
          {
            "linkId": "metastasis-sites",
            "type": "text",
            "text": "If yes, sites of metastasis",
            "enableWhen": [
              {
                "question": "metastasis",
                "operator": "=",
                "answerBoolean": true
              }
            ]
          }
        ]
      },
      {
        "linkId": "how-discovered",
        "type": "group",
        "text": "How Cancer Was Discovered",
        "item": [
          {
            "linkId": "discovery-method",
            "type": "choice",
            "text": "How was the cancer first discovered?",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "symptoms", "display": "Symptoms prompted testing"}},
              {"valueCoding": {"code": "routine-screening", "display": "Routine screening"}},
              {"valueCoding": {"code": "incidental", "display": "Incidental finding during other testing"}},
              {"valueCoding": {"code": "other", "display": "Other"}}
            ]
          },
          {
            "linkId": "initial-symptoms",
            "type": "text",
            "text": "What were your initial symptoms (if any)?"
          }
        ]
      },
      {
        "linkId": "previous-treatment",
        "type": "group",
        "text": "Previous Cancer Treatment",
        "item": [
          {
            "linkId": "had-treatment",
            "type": "boolean",
            "text": "Have you received any cancer treatment?",
            "required": true
          },
          {
            "linkId": "treatment-types",
            "type": "group",
            "text": "Types of treatment received (check all that apply)",
            "enableWhen": [
              {
                "question": "had-treatment",
                "operator": "=",
                "answerBoolean": true
              }
            ],
            "item": [
              {
                "linkId": "had-surgery",
                "type": "boolean",
                "text": "Surgery"
              },
              {
                "linkId": "surgery-details",
                "type": "text",
                "text": "Surgery details (date, type, location)",
                "enableWhen": [
                  {
                    "question": "had-surgery",
                    "operator": "=",
                    "answerBoolean": true
                  }
                ]
              },
              {
                "linkId": "had-chemo",
                "type": "boolean",
                "text": "Chemotherapy"
              },
              {
                "linkId": "chemo-regimen",
                "type": "text",
                "text": "Chemotherapy regimen and dates",
                "enableWhen": [
                  {
                    "question": "had-chemo",
                    "operator": "=",
                    "answerBoolean": true
                  }
                ]
              },
              {
                "linkId": "had-radiation",
                "type": "boolean",
                "text": "Radiation therapy"
              },
              {
                "linkId": "radiation-details",
                "type": "text",
                "text": "Radiation details (site, dates, total dose)",
                "enableWhen": [
                  {
                    "question": "had-radiation",
                    "operator": "=",
                    "answerBoolean": true
                  }
                ]
              },
              {
                "linkId": "had-immunotherapy",
                "type": "boolean",
                "text": "Immunotherapy"
              },
              {
                "linkId": "had-targeted",
                "type": "boolean",
                "text": "Targeted therapy"
              },
              {
                "linkId": "had-hormone",
                "type": "boolean",
                "text": "Hormone therapy"
              }
            ]
          },
          {
            "linkId": "treatment-response",
            "type": "choice",
            "text": "Response to previous treatment",
            "enableWhen": [
              {
                "question": "had-treatment",
                "operator": "=",
                "answerBoolean": true
              }
            ],
            "answerOption": [
              {"valueCoding": {"code": "complete-response", "display": "Complete response"}},
              {"valueCoding": {"code": "partial-response", "display": "Partial response"}},
              {"valueCoding": {"code": "stable", "display": "Stable disease"}},
              {"valueCoding": {"code": "progression", "display": "Disease progression"}},
              {"valueCoding": {"code": "unknown", "display": "Unknown"}}
            ]
          }
        ]
      },
      {
        "linkId": "genetic-testing",
        "type": "group",
        "text": "Genetic Testing",
        "item": [
          {
            "linkId": "had-genetic-testing",
            "type": "boolean",
            "text": "Have you had genetic testing related to your cancer?",
            "required": true
          },
          {
            "linkId": "genetic-results",
            "type": "text",
            "text": "Results of genetic testing (e.g., BRCA, KRAS, etc.)",
            "enableWhen": [
              {
                "question": "had-genetic-testing",
                "operator": "=",
                "answerBoolean": true
              }
            ]
          }
        ]
      },
      {
        "linkId": "family-cancer-history",
        "type": "group",
        "text": "Family Cancer History",
        "item": [
          {
            "linkId": "family-history-cancer",
            "type": "boolean",
            "text": "Family history of cancer?",
            "required": true
          },
          {
            "linkId": "family-details",
            "type": "text",
            "text": "Details: who (relationship), type of cancer, age at diagnosis",
            "enableWhen": [
              {
                "question": "family-history-cancer",
                "operator": "=",
                "answerBoolean": true
              }
            ]
          },
          {
            "linkId": "hereditary-syndrome",
            "type": "boolean",
            "text": "Known hereditary cancer syndrome in family (e.g., Lynch syndrome, BRCA)?",
            "enableWhen": [
              {
                "question": "family-history-cancer",
                "operator": "=",
                "answerBoolean": true
              }
            ]
          }
        ]
      },
      {
        "linkId": "current-symptoms",
        "type": "group",
        "text": "Current Symptoms",
        "item": [
          {
            "linkId": "pain",
            "type": "choice",
            "text": "Current pain level",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "0", "display": "0 - No pain"}},
              {"valueCoding": {"code": "1-3", "display": "1-3 - Mild pain"}},
              {"valueCoding": {"code": "4-6", "display": "4-6 - Moderate pain"}},
              {"valueCoding": {"code": "7-9", "display": "7-9 - Severe pain"}},
              {"valueCoding": {"code": "10", "display": "10 - Worst possible pain"}}
            ]
          },
          {
            "linkId": "fatigue",
            "type": "choice",
            "text": "Fatigue level",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "none", "display": "None"}},
              {"valueCoding": {"code": "mild", "display": "Mild - Can do normal activities"}},
              {"valueCoding": {"code": "moderate", "display": "Moderate - Limited activities"}},
              {"valueCoding": {"code": "severe", "display": "Severe - Bed bound much of day"}}
            ]
          },
          {
            "linkId": "appetite",
            "type": "choice",
            "text": "Appetite changes",
            "answerOption": [
              {"valueCoding": {"code": "normal", "display": "Normal appetite"}},
              {"valueCoding": {"code": "decreased", "display": "Decreased appetite"}},
              {"valueCoding": {"code": "poor", "display": "Poor appetite"}},
              {"valueCoding": {"code": "none", "display": "No appetite"}}
            ]
          },
          {
            "linkId": "weight-change",
            "type": "group",
            "text": "Weight Changes",
            "item": [
              {
                "linkId": "weight-loss",
                "type": "boolean",
                "text": "Unintentional weight loss?"
              },
              {
                "linkId": "weight-amount",
                "type": "integer",
                "text": "Pounds lost",
                "enableWhen": [
                  {
                    "question": "weight-loss",
                    "operator": "=",
                    "answerBoolean": true
                  }
                ]
              },
              {
                "linkId": "weight-timeframe",
                "type": "text",
                "text": "Over what time period?",
                "enableWhen": [
                  {
                    "question": "weight-loss",
                    "operator": "=",
                    "answerBoolean": true
                  }
                ]
              }
            ]
          },
          {
            "linkId": "nausea-vomiting",
            "type": "boolean",
            "text": "Nausea or vomiting?"
          },
          {
            "linkId": "other-symptoms",
            "type": "text",
            "text": "Other concerning symptoms"
          }
        ]
      },
      {
        "linkId": "performance-status",
        "type": "choice",
        "text": "Functional Status (ECOG Performance Status)",
        "required": true,
        "answerOption": [
          {"valueCoding": {"code": "0", "display": "0 - Fully active, no restrictions"}},
          {"valueCoding": {"code": "1", "display": "1 - Restricted in strenuous activity but able to do light work"}},
          {"valueCoding": {"code": "2", "display": "2 - Able to care for self but unable to work, up >50% of day"}},
          {"valueCoding": {"code": "3", "display": "3 - Limited self-care, in bed/chair >50% of day"}},
          {"valueCoding": {"code": "4", "display": "4 - Completely disabled, bed/chair bound"}}
        ]
      },
      {
        "linkId": "support-system",
        "type": "group",
        "text": "Support System",
        "item": [
          {
            "linkId": "primary-caregiver",
            "type": "string",
            "text": "Primary caregiver or support person",
            "required": true
          },
          {
            "linkId": "caregiver-relationship",
            "type": "string",
            "text": "Relationship to patient"
          },
          {
            "linkId": "lives-alone",
            "type": "boolean",
            "text": "Do you live alone?",
            "required": true
          },
          {
            "linkId": "transportation",
            "type": "boolean",
            "text": "Do you have reliable transportation to appointments?",
            "required": true
          }
        ]
      },
      {
        "linkId": "advance-directives",
        "type": "group",
        "text": "Advance Directives",
        "item": [
          {
            "linkId": "has-advance-directive",
            "type": "boolean",
            "text": "Do you have an advance directive or living will?",
            "required": true
          },
          {
            "linkId": "has-healthcare-proxy",
            "type": "boolean",
            "text": "Do you have a healthcare proxy or power of attorney?",
            "required": true
          },
          {
            "linkId": "want-information",
            "type": "boolean",
            "text": "Would you like information about advance care planning?"
          }
        ]
      },
      {
        "linkId": "goals-concerns",
        "type": "group",
        "text": "Treatment Goals and Concerns",
        "item": [
          {
            "linkId": "treatment-goals",
            "type": "text",
            "text": "What are your main goals for cancer treatment?",
            "required": true
          },
          {
            "linkId": "concerns",
            "type": "text",
            "text": "What are your biggest concerns or fears about cancer treatment?"
          },
          {
            "linkId": "questions",
            "type": "text",
            "text": "Questions you would like to discuss with your oncologist"
          }
        ]
      }
    ]
  }'::jsonb,
  '187981d2-15fd-42ae-ad41-82a85f69b97e',
  '187981d2-15fd-42ae-ad41-82a85f69b97e'
);
