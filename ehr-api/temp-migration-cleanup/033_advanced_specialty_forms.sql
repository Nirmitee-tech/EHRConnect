-- Advanced Specialty Forms
-- Migration: 033_advanced_specialty_forms.sql

-- Neurology Intake Form
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
  'Neurology Intake Assessment',
  'Comprehensive neurological evaluation',
  'active',
  'neurology',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/neurology-intake',
  '{
    "resourceType": "Questionnaire",
    "id": "neurology-intake",
    "url": "http://ehrconnect.com/fhir/Questionnaire/neurology-intake",
    "status": "active",
    "title": "Neurology Intake Assessment",
    "description": "Comprehensive neurological evaluation",
    "item": [
      {
        "linkId": "chief-complaint",
        "type": "text",
        "text": "Primary neurological concern",
        "required": true
      },
      {
        "linkId": "symptom-onset",
        "type": "group",
        "text": "Symptom Onset and Duration",
        "item": [
          {
            "linkId": "onset-date",
            "type": "date",
            "text": "When did symptoms first begin?"
          },
          {
            "linkId": "onset-type",
            "type": "choice",
            "text": "How did symptoms start?",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "sudden", "display": "Suddenly (within minutes to hours)"}},
              {"valueCoding": {"code": "gradual", "display": "Gradually (over days to weeks)"}},
              {"valueCoding": {"code": "progressive", "display": "Progressive (worsening over time)"}},
              {"valueCoding": {"code": "intermittent", "display": "Intermittent (comes and goes)"}}
            ]
          },
          {
            "linkId": "progression",
            "type": "choice",
            "text": "Have symptoms changed over time?",
            "answerOption": [
              {"valueCoding": {"code": "worse", "display": "Getting worse"}},
              {"valueCoding": {"code": "better", "display": "Getting better"}},
              {"valueCoding": {"code": "stable", "display": "Staying the same"}},
              {"valueCoding": {"code": "fluctuating", "display": "Fluctuating"}}
            ]
          }
        ]
      },
      {
        "linkId": "headaches",
        "type": "group",
        "text": "Headaches",
        "item": [
          {
            "linkId": "has-headaches",
            "type": "boolean",
            "text": "Do you experience headaches?",
            "required": true
          },
          {
            "linkId": "headache-details",
            "type": "group",
            "text": "Headache Details",
            "enableWhen": [
              {
                "question": "has-headaches",
                "operator": "=",
                "answerBoolean": true
              }
            ],
            "item": [
              {
                "linkId": "headache-frequency",
                "type": "choice",
                "text": "How often do headaches occur?",
                "answerOption": [
                  {"valueCoding": {"code": "daily", "display": "Daily"}},
                  {"valueCoding": {"code": "weekly", "display": "Weekly"}},
                  {"valueCoding": {"code": "monthly", "display": "Monthly"}},
                  {"valueCoding": {"code": "occasionally", "display": "Occasionally"}}
                ]
              },
              {
                "linkId": "headache-severity",
                "type": "choice",
                "text": "Typical headache severity (0-10)",
                "answerOption": [
                  {"valueCoding": {"code": "1-3", "display": "Mild (1-3)"}},
                  {"valueCoding": {"code": "4-6", "display": "Moderate (4-6)"}},
                  {"valueCoding": {"code": "7-10", "display": "Severe (7-10)"}}
                ]
              },
              {
                "linkId": "headache-location",
                "type": "choice",
                "text": "Location of headache",
                "answerOption": [
                  {"valueCoding": {"code": "unilateral", "display": "One side"}},
                  {"valueCoding": {"code": "bilateral", "display": "Both sides"}},
                  {"valueCoding": {"code": "frontal", "display": "Front/forehead"}},
                  {"valueCoding": {"code": "occipital", "display": "Back of head"}},
                  {"valueCoding": {"code": "temporal", "display": "Temples"}}
                ]
              },
              {
                "linkId": "headache-character",
                "type": "choice",
                "text": "Character of pain",
                "answerOption": [
                  {"valueCoding": {"code": "throbbing", "display": "Throbbing/pulsating"}},
                  {"valueCoding": {"code": "pressure", "display": "Pressure/squeezing"}},
                  {"valueCoding": {"code": "sharp", "display": "Sharp/stabbing"}},
                  {"valueCoding": {"code": "dull", "display": "Dull ache"}}
                ]
              },
              {
                "linkId": "aura",
                "type": "boolean",
                "text": "Do you experience aura (visual changes, numbness) before headaches?"
              },
              {
                "linkId": "nausea-with-headache",
                "type": "boolean",
                "text": "Nausea or vomiting with headaches?"
              },
              {
                "linkId": "photophobia",
                "type": "boolean",
                "text": "Sensitivity to light or sound?"
              }
            ]
          }
        ]
      },
      {
        "linkId": "seizures",
        "type": "group",
        "text": "Seizures",
        "item": [
          {
            "linkId": "has-seizures",
            "type": "boolean",
            "text": "Have you ever had a seizure?",
            "required": true
          },
          {
            "linkId": "seizure-details",
            "type": "group",
            "text": "Seizure History",
            "enableWhen": [
              {
                "question": "has-seizures",
                "operator": "=",
                "answerBoolean": true
              }
            ],
            "item": [
              {
                "linkId": "first-seizure-date",
                "type": "date",
                "text": "Date of first seizure"
              },
              {
                "linkId": "last-seizure-date",
                "type": "date",
                "text": "Date of most recent seizure"
              },
              {
                "linkId": "seizure-frequency",
                "type": "text",
                "text": "How often do seizures occur?"
              },
              {
                "linkId": "seizure-type",
                "type": "choice",
                "text": "Type of seizures",
                "answerOption": [
                  {"valueCoding": {"code": "generalized", "display": "Generalized tonic-clonic (grand mal)"}},
                  {"valueCoding": {"code": "absence", "display": "Absence (petit mal)"}},
                  {"valueCoding": {"code": "focal", "display": "Focal/partial seizures"}},
                  {"valueCoding": {"code": "unknown", "display": "Unknown type"}}
                ]
              },
              {
                "linkId": "seizure-triggers",
                "type": "text",
                "text": "Known seizure triggers"
              },
              {
                "linkId": "post-ictal",
                "type": "text",
                "text": "What happens after a seizure (confusion, sleepiness, etc.)?"
              },
              {
                "linkId": "on-aed",
                "type": "boolean",
                "text": "Currently taking anti-epileptic medications?"
              }
            ]
          }
        ]
      },
      {
        "linkId": "motor-symptoms",
        "type": "group",
        "text": "Movement and Motor Symptoms",
        "item": [
          {
            "linkId": "weakness",
            "type": "boolean",
            "text": "Muscle weakness?"
          },
          {
            "linkId": "weakness-location",
            "type": "text",
            "text": "Location of weakness",
            "enableWhen": [
              {
                "question": "weakness",
                "operator": "=",
                "answerBoolean": true
              }
            ]
          },
          {
            "linkId": "tremor",
            "type": "boolean",
            "text": "Tremor or shaking?"
          },
          {
            "linkId": "tremor-type",
            "type": "choice",
            "text": "When does tremor occur?",
            "enableWhen": [
              {
                "question": "tremor",
                "operator": "=",
                "answerBoolean": true
              }
            ],
            "answerOption": [
              {"valueCoding": {"code": "rest", "display": "At rest"}},
              {"valueCoding": {"code": "action", "display": "With movement"}},
              {"valueCoding": {"code": "postural", "display": "Holding position"}},
              {"valueCoding": {"code": "intention", "display": "Reaching for objects"}}
            ]
          },
          {
            "linkId": "coordination",
            "type": "boolean",
            "text": "Problems with balance or coordination?"
          },
          {
            "linkId": "gait-changes",
            "type": "boolean",
            "text": "Changes in walking or gait?"
          },
          {
            "linkId": "falls",
            "type": "boolean",
            "text": "Frequent falls?"
          },
          {
            "linkId": "stiffness",
            "type": "boolean",
            "text": "Muscle stiffness or rigidity?"
          }
        ]
      },
      {
        "linkId": "sensory-symptoms",
        "type": "group",
        "text": "Sensory Symptoms",
        "item": [
          {
            "linkId": "numbness-tingling",
            "type": "boolean",
            "text": "Numbness or tingling?"
          },
          {
            "linkId": "numbness-location",
            "type": "text",
            "text": "Location of numbness/tingling",
            "enableWhen": [
              {
                "question": "numbness-tingling",
                "operator": "=",
                "answerBoolean": true
              }
            ]
          },
          {
            "linkId": "pain-burning",
            "type": "boolean",
            "text": "Burning pain or neuropathic pain?"
          },
          {
            "linkId": "vision-changes",
            "type": "boolean",
            "text": "Vision changes (double vision, blurriness, loss)?"
          },
          {
            "linkId": "hearing-changes",
            "type": "boolean",
            "text": "Hearing changes or ringing in ears?"
          }
        ]
      },
      {
        "linkId": "cognitive-symptoms",
        "type": "group",
        "text": "Cognitive and Memory Symptoms",
        "item": [
          {
            "linkId": "memory-problems",
            "type": "boolean",
            "text": "Memory problems or forgetfulness?",
            "required": true
          },
          {
            "linkId": "memory-type",
            "type": "choice",
            "text": "Type of memory problems",
            "enableWhen": [
              {
                "question": "memory-problems",
                "operator": "=",
                "answerBoolean": true
              }
            ],
            "answerOption": [
              {"valueCoding": {"code": "recent", "display": "Recent events (short-term memory)"}},
              {"valueCoding": {"code": "remote", "display": "Past events (long-term memory)"}},
              {"valueCoding": {"code": "both", "display": "Both"}}
            ]
          },
          {
            "linkId": "confusion",
            "type": "boolean",
            "text": "Episodes of confusion or disorientation?"
          },
          {
            "linkId": "concentration",
            "type": "boolean",
            "text": "Difficulty concentrating or focusing?"
          },
          {
            "linkId": "language",
            "type": "boolean",
            "text": "Trouble finding words or speaking?"
          }
        ]
      },
      {
        "linkId": "sleep-disorders",
        "type": "group",
        "text": "Sleep Disorders",
        "item": [
          {
            "linkId": "sleep-quality",
            "type": "choice",
            "text": "Quality of sleep",
            "answerOption": [
              {"valueCoding": {"code": "good", "display": "Good"}},
              {"valueCoding": {"code": "fair", "display": "Fair"}},
              {"valueCoding": {"code": "poor", "display": "Poor"}}
            ]
          },
          {
            "linkId": "insomnia",
            "type": "boolean",
            "text": "Difficulty falling or staying asleep?"
          },
          {
            "linkId": "excessive-daytime-sleepiness",
            "type": "boolean",
            "text": "Excessive daytime sleepiness?"
          },
          {
            "linkId": "sleep-apnea-symptoms",
            "type": "boolean",
            "text": "Snoring, gasping, or pauses in breathing during sleep?"
          },
          {
            "linkId": "restless-legs",
            "type": "boolean",
            "text": "Restless legs or urge to move legs at night?"
          },
          {
            "linkId": "abnormal-movements-sleep",
            "type": "boolean",
            "text": "Abnormal movements during sleep?"
          }
        ]
      },
      {
        "linkId": "neurological-history",
        "type": "group",
        "text": "Neurological Medical History",
        "item": [
          {
            "linkId": "stroke",
            "type": "boolean",
            "text": "History of stroke or TIA?"
          },
          {
            "linkId": "stroke-date",
            "type": "date",
            "text": "Date of stroke/TIA",
            "enableWhen": [
              {
                "question": "stroke",
                "operator": "=",
                "answerBoolean": true
              }
            ]
          },
          {
            "linkId": "head-injury",
            "type": "boolean",
            "text": "Significant head injury or concussion?"
          },
          {
            "linkId": "meningitis-encephalitis",
            "type": "boolean",
            "text": "History of meningitis or encephalitis?"
          },
          {
            "linkId": "multiple-sclerosis",
            "type": "boolean",
            "text": "Multiple sclerosis or demyelinating disease?"
          },
          {
            "linkId": "parkinsons",
            "type": "boolean",
            "text": "Parkinson disease?"
          },
          {
            "linkId": "neuropathy",
            "type": "boolean",
            "text": "Peripheral neuropathy?"
          }
        ]
      },
      {
        "linkId": "family-neuro-history",
        "type": "group",
        "text": "Family Neurological History",
        "item": [
          {
            "linkId": "family-stroke",
            "type": "boolean",
            "text": "Family history of stroke?"
          },
          {
            "linkId": "family-dementia",
            "type": "boolean",
            "text": "Family history of dementia or Alzheimer disease?"
          },
          {
            "linkId": "family-parkinsons",
            "type": "boolean",
            "text": "Family history of Parkinson disease?"
          },
          {
            "linkId": "family-ms",
            "type": "boolean",
            "text": "Family history of multiple sclerosis?"
          },
          {
            "linkId": "family-epilepsy",
            "type": "boolean",
            "text": "Family history of epilepsy?"
          },
          {
            "linkId": "family-other",
            "type": "text",
            "text": "Other neurological conditions in family"
          }
        ]
      },
      {
        "linkId": "functional-impact",
        "type": "group",
        "text": "Functional Impact",
        "item": [
          {
            "linkId": "adl-impact",
            "type": "choice",
            "text": "Impact on daily activities (dressing, bathing, eating)",
            "answerOption": [
              {"valueCoding": {"code": "none", "display": "No impact - fully independent"}},
              {"valueCoding": {"code": "mild", "display": "Mild difficulty but independent"}},
              {"valueCoding": {"code": "moderate", "display": "Moderate difficulty, need some help"}},
              {"valueCoding": {"code": "severe", "display": "Severe difficulty, need significant help"}}
            ]
          },
          {
            "linkId": "work-impact",
            "type": "boolean",
            "text": "Have symptoms affected your work or school performance?"
          },
          {
            "linkId": "driving",
            "type": "choice",
            "text": "Current driving status",
            "answerOption": [
              {"valueCoding": {"code": "active", "display": "Currently driving"}},
              {"valueCoding": {"code": "limited", "display": "Driving with restrictions"}},
              {"valueCoding": {"code": "stopped", "display": "Stopped driving due to symptoms"}},
              {"valueCoding": {"code": "never", "display": "Never drove"}}
            ]
          }
        ]
      },
      {
        "linkId": "recent-imaging",
        "type": "group",
        "text": "Recent Neurological Testing",
        "item": [
          {
            "linkId": "mri-brain-date",
            "type": "date",
            "text": "Date of last brain MRI"
          },
          {
            "linkId": "ct-head-date",
            "type": "date",
            "text": "Date of last head CT scan"
          },
          {
            "linkId": "eeg-date",
            "type": "date",
            "text": "Date of last EEG"
          },
          {
            "linkId": "emg-date",
            "type": "date",
            "text": "Date of last EMG/nerve conduction study"
          }
        ]
      }
    ]
  }'::jsonb,
  '187981d2-15fd-42ae-ad41-82a85f69b97e',
  '187981d2-15fd-42ae-ad41-82a85f69b97e'
);

-- Comprehensive Geriatric Assessment
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
  'Comprehensive Geriatric Assessment',
  'Multi-domain assessment for elderly patients',
  'active',
  'geriatrics',
  '1.0.0',
  'http://ehrconnect.com/fhir/Questionnaire/geriatric-assessment',
  '{
    "resourceType": "Questionnaire",
    "id": "geriatric-assessment",
    "url": "http://ehrconnect.com/fhir/Questionnaire/geriatric-assessment",
    "status": "active",
    "title": "Comprehensive Geriatric Assessment",
    "description": "Multi-domain elderly assessment",
    "item": [
      {
        "linkId": "demographics",
        "type": "group",
        "text": "Demographics",
        "item": [
          {
            "linkId": "age",
            "type": "integer",
            "text": "Age",
            "required": true
          },
          {
            "linkId": "living-situation",
            "type": "choice",
            "text": "Living situation",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "alone", "display": "Lives alone"}},
              {"valueCoding": {"code": "spouse", "display": "Lives with spouse/partner"}},
              {"valueCoding": {"code": "family", "display": "Lives with family members"}},
              {"valueCoding": {"code": "assisted", "display": "Assisted living facility"}},
              {"valueCoding": {"code": "nursing-home", "display": "Nursing home"}}
            ]
          },
          {
            "linkId": "marital-status",
            "type": "choice",
            "text": "Marital status",
            "answerOption": [
              {"valueCoding": {"code": "married", "display": "Married/partnered"}},
              {"valueCoding": {"code": "widowed", "display": "Widowed"}},
              {"valueCoding": {"code": "divorced", "display": "Divorced"}},
              {"valueCoding": {"code": "single", "display": "Single/never married"}}
            ]
          }
        ]
      },
      {
        "linkId": "functional-status",
        "type": "group",
        "text": "Functional Status - Activities of Daily Living (ADLs)",
        "item": [
          {
            "linkId": "adl-intro",
            "type": "display",
            "text": "For each activity, indicate level of independence"
          },
          {
            "linkId": "bathing",
            "type": "choice",
            "text": "Bathing",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "independent", "display": "Independent"}},
              {"valueCoding": {"code": "needs-help", "display": "Needs some help"}},
              {"valueCoding": {"code": "dependent", "display": "Completely dependent"}}
            ]
          },
          {
            "linkId": "dressing",
            "type": "choice",
            "text": "Dressing",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "independent", "display": "Independent"}},
              {"valueCoding": {"code": "needs-help", "display": "Needs some help"}},
              {"valueCoding": {"code": "dependent", "display": "Completely dependent"}}
            ]
          },
          {
            "linkId": "toileting",
            "type": "choice",
            "text": "Toileting",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "independent", "display": "Independent"}},
              {"valueCoding": {"code": "needs-help", "display": "Needs some help"}},
              {"valueCoding": {"code": "dependent", "display": "Completely dependent"}}
            ]
          },
          {
            "linkId": "transferring",
            "type": "choice",
            "text": "Transferring (bed to chair)",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "independent", "display": "Independent"}},
              {"valueCoding": {"code": "needs-help", "display": "Needs some help"}},
              {"valueCoding": {"code": "dependent", "display": "Completely dependent"}}
            ]
          },
          {
            "linkId": "continence",
            "type": "choice",
            "text": "Continence",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "continent", "display": "Fully continent"}},
              {"valueCoding": {"code": "occasional", "display": "Occasional accidents"}},
              {"valueCoding": {"code": "incontinent", "display": "Incontinent"}}
            ]
          },
          {
            "linkId": "feeding",
            "type": "choice",
            "text": "Feeding",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "independent", "display": "Independent"}},
              {"valueCoding": {"code": "needs-help", "display": "Needs some help"}},
              {"valueCoding": {"code": "dependent", "display": "Completely dependent"}}
            ]
          }
        ]
      },
      {
        "linkId": "iadl",
        "type": "group",
        "text": "Instrumental Activities of Daily Living (IADLs)",
        "item": [
          {
            "linkId": "phone",
            "type": "choice",
            "text": "Using telephone",
            "answerOption": [
              {"valueCoding": {"code": "independent", "display": "Independent"}},
              {"valueCoding": {"code": "needs-help", "display": "Needs some help"}},
              {"valueCoding": {"code": "unable", "display": "Unable to use"}}
            ]
          },
          {
            "linkId": "shopping",
            "type": "choice",
            "text": "Shopping",
            "answerOption": [
              {"valueCoding": {"code": "independent", "display": "Independent"}},
              {"valueCoding": {"code": "needs-help", "display": "Needs some help"}},
              {"valueCoding": {"code": "unable", "display": "Unable"}}
            ]
          },
          {
            "linkId": "meal-prep",
            "type": "choice",
            "text": "Preparing meals",
            "answerOption": [
              {"valueCoding": {"code": "independent", "display": "Independent"}},
              {"valueCoding": {"code": "needs-help", "display": "Needs some help"}},
              {"valueCoding": {"code": "unable", "display": "Unable"}}
            ]
          },
          {
            "linkId": "housekeeping",
            "type": "choice",
            "text": "Housekeeping",
            "answerOption": [
              {"valueCoding": {"code": "independent", "display": "Independent"}},
              {"valueCoding": {"code": "needs-help", "display": "Needs some help"}},
              {"valueCoding": {"code": "unable", "display": "Unable"}}
            ]
          },
          {
            "linkId": "laundry",
            "type": "choice",
            "text": "Doing laundry",
            "answerOption": [
              {"valueCoding": {"code": "independent", "display": "Independent"}},
              {"valueCoding": {"code": "needs-help", "display": "Needs some help"}},
              {"valueCoding": {"code": "unable", "display": "Unable"}}
            ]
          },
          {
            "linkId": "transportation",
            "type": "choice",
            "text": "Transportation",
            "answerOption": [
              {"valueCoding": {"code": "drives", "display": "Drives own car"}},
              {"valueCoding": {"code": "public", "display": "Uses public transport"}},
              {"valueCoding": {"code": "needs-arrangement", "display": "Needs someone to arrange"}},
              {"valueCoding": {"code": "unable", "display": "Unable to travel"}}
            ]
          },
          {
            "linkId": "medications",
            "type": "choice",
            "text": "Managing medications",
            "answerOption": [
              {"valueCoding": {"code": "independent", "display": "Independent"}},
              {"valueCoding": {"code": "needs-help", "display": "Needs reminders/help"}},
              {"valueCoding": {"code": "unable", "display": "Unable - needs full management"}}
            ]
          },
          {
            "linkId": "finances",
            "type": "choice",
            "text": "Managing finances",
            "answerOption": [
              {"valueCoding": {"code": "independent", "display": "Independent"}},
              {"valueCoding": {"code": "needs-help", "display": "Needs some help"}},
              {"valueCoding": {"code": "unable", "display": "Unable - needs full management"}}
            ]
          }
        ]
      },
      {
        "linkId": "mobility",
        "type": "group",
        "text": "Mobility and Fall Risk",
        "item": [
          {
            "linkId": "ambulatory-status",
            "type": "choice",
            "text": "Ambulatory status",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "independent", "display": "Walks independently"}},
              {"valueCoding": {"code": "cane", "display": "Uses cane"}},
              {"valueCoding": {"code": "walker", "display": "Uses walker"}},
              {"valueCoding": {"code": "wheelchair", "display": "Uses wheelchair"}},
              {"valueCoding": {"code": "bed-bound", "display": "Bed-bound"}}
            ]
          },
          {
            "linkId": "falls-past-year",
            "type": "integer",
            "text": "Number of falls in past year",
            "required": true
          },
          {
            "linkId": "fear-falling",
            "type": "boolean",
            "text": "Fear of falling that limits activities?",
            "required": true
          },
          {
            "linkId": "tug-test",
            "type": "integer",
            "text": "Timed Up and Go test (seconds) - if performed"
          }
        ]
      },
      {
        "linkId": "cognition",
        "type": "group",
        "text": "Cognitive Assessment",
        "item": [
          {
            "linkId": "memory-concerns",
            "type": "boolean",
            "text": "Patient or family concerned about memory?",
            "required": true
          },
          {
            "linkId": "memory-change",
            "type": "choice",
            "text": "Change in memory compared to 1 year ago",
            "answerOption": [
              {"valueCoding": {"code": "better", "display": "Better"}},
              {"valueCoding": {"code": "same", "display": "About the same"}},
              {"valueCoding": {"code": "worse", "display": "Worse"}},
              {"valueCoding": {"code": "much-worse", "display": "Much worse"}}
            ]
          },
          {
            "linkId": "decision-making",
            "type": "choice",
            "text": "Ability to make decisions",
            "answerOption": [
              {"valueCoding": {"code": "independent", "display": "Makes decisions independently"}},
              {"valueCoding": {"code": "some-difficulty", "display": "Some difficulty"}},
              {"valueCoding": {"code": "needs-help", "display": "Needs help with decisions"}},
              {"valueCoding": {"code": "unable", "display": "Unable to make decisions"}}
            ]
          },
          {
            "linkId": "mini-cog-score",
            "type": "integer",
            "text": "Mini-Cog score (0-5) - if performed"
          }
        ]
      },
      {
        "linkId": "mood",
        "type": "group",
        "text": "Mood and Depression Screening",
        "item": [
          {
            "linkId": "depressed-mood",
            "type": "boolean",
            "text": "During the past month, have you felt down, depressed, or hopeless?",
            "required": true
          },
          {
            "linkId": "anhedonia",
            "type": "boolean",
            "text": "During the past month, have you felt little interest or pleasure in doing things?",
            "required": true
          },
          {
            "linkId": "anxiety",
            "type": "choice",
            "text": "How much have you been bothered by anxiety?",
            "answerOption": [
              {"valueCoding": {"code": "not", "display": "Not at all"}},
              {"valueCoding": {"code": "somewhat", "display": "Somewhat"}},
              {"valueCoding": {"code": "moderate", "display": "Moderately"}},
              {"valueCoding": {"code": "severely", "display": "Severely"}}
            ]
          }
        ]
      },
      {
        "linkId": "nutrition",
        "type": "group",
        "text": "Nutritional Status",
        "item": [
          {
            "linkId": "weight-loss",
            "type": "boolean",
            "text": "Unintentional weight loss of 10+ pounds in past 6 months?",
            "required": true
          },
          {
            "linkId": "appetite",
            "type": "choice",
            "text": "Appetite",
            "answerOption": [
              {"valueCoding": {"code": "good", "display": "Good"}},
              {"valueCoding": {"code": "fair", "display": "Fair"}},
              {"valueCoding": {"code": "poor", "display": "Poor"}}
            ]
          },
          {
            "linkId": "meals-per-day",
            "type": "integer",
            "text": "Number of meals eaten per day"
          },
          {
            "linkId": "chewing-swallowing",
            "type": "boolean",
            "text": "Difficulty chewing or swallowing?"
          }
        ]
      },
      {
        "linkId": "sensory",
        "type": "group",
        "text": "Sensory Function",
        "item": [
          {
            "linkId": "vision",
            "type": "choice",
            "text": "Vision (with glasses if worn)",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "excellent", "display": "Excellent"}},
              {"valueCoding": {"code": "good", "display": "Good"}},
              {"valueCoding": {"code": "fair", "display": "Fair"}},
              {"valueCoding": {"code": "poor", "display": "Poor"}},
              {"valueCoding": {"code": "blind", "display": "Legally blind"}}
            ]
          },
          {
            "linkId": "hearing",
            "type": "choice",
            "text": "Hearing (with aids if worn)",
            "required": true,
            "answerOption": [
              {"valueCoding": {"code": "excellent", "display": "Excellent"}},
              {"valueCoding": {"code": "good", "display": "Good"}},
              {"valueCoding": {"code": "fair", "display": "Fair - some difficulty"}},
              {"valueCoding": {"code": "poor", "display": "Poor - significant difficulty"}},
              {"valueCoding": {"code": "deaf", "display": "Deaf"}}
            ]
          },
          {
            "linkId": "uses-hearing-aid",
            "type": "boolean",
            "text": "Uses hearing aid?"
          }
        ]
      },
      {
        "linkId": "polypharmacy",
        "type": "group",
        "text": "Medication Review",
        "item": [
          {
            "linkId": "medication-count",
            "type": "integer",
            "text": "Total number of medications (including OTC and supplements)",
            "required": true
          },
          {
            "linkId": "medication-adherence-geriatric",
            "type": "choice",
            "text": "Medication adherence",
            "answerOption": [
              {"valueCoding": {"code": "excellent", "display": "Takes all as prescribed"}},
              {"valueCoding": {"code": "good", "display": "Usually takes as prescribed"}},
              {"valueCoding": {"code": "fair", "display": "Sometimes forgets"}},
              {"valueCoding": {"code": "poor", "display": "Frequently misses doses"}}
            ]
          },
          {
            "linkId": "medication-management",
            "type": "choice",
            "text": "Who manages medications?",
            "answerOption": [
              {"valueCoding": {"code": "self", "display": "Patient manages independently"}},
              {"valueCoding": {"code": "family", "display": "Family member helps"}},
              {"valueCoding": {"code": "caregiver", "display": "Caregiver manages"}},
              {"valueCoding": {"code": "facility", "display": "Facility staff manages"}}
            ]
          }
        ]
      },
      {
        "linkId": "social-support",
        "type": "group",
        "text": "Social Support and Resources",
        "item": [
          {
            "linkId": "primary-caregiver-geriatric",
            "type": "string",
            "text": "Primary caregiver or support person"
          },
          {
            "linkId": "caregiver-burden",
            "type": "choice",
            "text": "Caregiver stress level (if applicable)",
            "answerOption": [
              {"valueCoding": {"code": "low", "display": "Low/manageable"}},
              {"valueCoding": {"code": "moderate", "display": "Moderate"}},
              {"valueCoding": {"code": "high", "display": "High/overwhelmed"}}
            ]
          },
          {
            "linkId": "social-isolation",
            "type": "boolean",
            "text": "Socially isolated or lonely?"
          },
          {
            "linkId": "home-services",
            "type": "boolean",
            "text": "Currently receives home health services?"
          }
        ]
      },
      {
        "linkId": "advance-care-planning-geriatric",
        "type": "group",
        "text": "Advance Care Planning",
        "item": [
          {
            "linkId": "advance-directive-geriatric",
            "type": "boolean",
            "text": "Has advance directive?",
            "required": true
          },
          {
            "linkId": "dnr",
            "type": "choice",
            "text": "Code status",
            "answerOption": [
              {"valueCoding": {"code": "full-code", "display": "Full code"}},
              {"valueCoding": {"code": "dnr", "display": "DNR (Do Not Resuscitate)"}},
              {"valueCoding": {"code": "dni", "display": "DNI (Do Not Intubate)"}},
              {"valueCoding": {"code": "comfort", "display": "Comfort care only"}}
            ]
          },
          {
            "linkId": "healthcare-proxy-geriatric",
            "type": "string",
            "text": "Healthcare proxy/POA name"
          }
        ]
      },
      {
        "linkId": "safety-concerns",
        "type": "group",
        "text": "Safety Concerns",
        "item": [
          {
            "linkId": "elder-abuse-concern",
            "type": "boolean",
            "text": "Any concerns about elder abuse or neglect?",
            "required": true
          },
          {
            "linkId": "unsafe-home",
            "type": "boolean",
            "text": "Concerns about home safety?"
          },
          {
            "linkId": "financial-exploitation",
            "type": "boolean",
            "text": "Concerns about financial exploitation?"
          }
        ]
      }
    ]
  }'::jsonb,
  '187981d2-15fd-42ae-ad41-82a85f69b97e',
  '187981d2-15fd-42ae-ad41-82a85f69b97e'
);
