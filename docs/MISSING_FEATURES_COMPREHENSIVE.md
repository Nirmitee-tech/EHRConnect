# Missing Features - Comprehensive List for Enterprise EHR
**Date:** December 21, 2025  
**Version:** 2.0 - Complete Edition  
**Purpose:** Every single missing feature to match enterprise EHR systems

---

## Document Purpose

This document catalogs EVERY missing feature, workflow, integration, and capability needed to reach parity with major EHR systems (Epic, Cerner, Athenahealth, eClinicalWorks, Allscripts). Organized by functional area.

---

## A. Patient Management - Complete Missing Features

### Patient Registration & Demographics

**Missing Features:**

1. **Advanced Patient Search** 🔴
   - Fuzzy name matching (Soundex, Metaphone, Levenshtein distance)
   - Phonetic search
   - Nickname/alias search
   - Previous name search (maiden names)
   - Search by partial SSN
   - Search by phone number
   - Search by email
   - Search by address
   - Search by MRN from other facilities
   - Search by insurance member ID

2. **Master Patient Index (MPI)** 🔴
   - Probabilistic matching algorithm
   - Duplicate detection scores
   - Merge patient records workflow
   - Unmerge capability (if merged incorrectly)
   - Enterprise-wide patient ID (EMPI)
   - Cross-facility patient lookup
   - Match history audit trail

3. **Patient Photo Management** 🟡
   - Capture patient photo at registration
   - Display photo in patient banner
   - Photo verification at each visit
   - Update photo capability
   - Photo consent tracking

4. **Demographics Data Quality** 🟡
   - Address validation (USPS API)
   - Phone number validation
   - Email validation
   - Data completeness scoring
   - Missing data alerts
   - Duplicate address detection

5. **Family Relationships** 🟡
   - Link family members
   - Guarantor management
   - Family account view
   - Shared insurance
   - Family history inheritance
   - Pediatric parent/guardian assignment

6. **Patient Identifiers** 🟡
   - Multiple MRN support (per facility)
   - External system ID mapping
   - SSN encryption and masking
   - Driver's license capture
   - Passport information
   - State ID capture

7. **Patient Preferences** 🟡
   - Preferred name/pronouns
   - Preferred language
   - Communication preferences (call/text/email)
   - Best time to contact
   - Do not contact flags
   - VIP status
   - Special handling instructions

8. **Emergency Contacts** 🔴
   - Multiple emergency contacts
   - Contact priority
   - Relationship to patient
   - Contact preferences
   - Healthcare proxy information
   - Power of attorney documentation

9. **Guarantor Management** 🔴
   - Separate guarantor from patient
   - Guarantor demographics
   - Guarantor credit checking
   - Guarantor insurance
   - Multiple guarantors
   - Guarantor correspondence

10. **Patient Portal Auto-Enrollment** 🟡
    - Automatic portal invitation on registration
    - Activation link email/SMS
    - Portal activation tracking
    - Multi-factor authentication setup
    - Portal feature permissions

### Check-In & Arrival

**Missing Features:**

11. **Self-Service Kiosk** 🟡
    - Touchscreen check-in interface
    - Barcode/QR scan from reminder
    - ID scanner integration
    - Insurance card scanner
    - Signature pad integration
    - Payment terminal integration
    - Printer for receipts/labels
    - Kiosk management console

12. **Identity Verification** 🟡
    - Photo ID scanning
    - Face recognition matching
    - Two-factor patient authentication
    - Biometric options (fingerprint)
    - Identity theft prevention

13. **Waiting Room Management** 🟡
    - Digital queue board
    - Wait time estimation
    - Text notification when ready
    - Queue priority management
    - Provider running late alerts
    - Check-in time tracking

14. **Insurance Card Scanning** 🔴
    - Front and back card scan
    - OCR data extraction
    - Auto-population of insurance fields
    - Card image storage
    - Card comparison (previous vs current)
    - Insurance change detection

15. **Copay Collection** 🔴
    - Automated copay calculation
    - Multiple payment methods (card, cash, check)
    - Receipt printing
    - Email receipt option
    - Payment posting to account
    - Declined payment handling
    - Payment plan option

16. **Consent Forms Digital Signature** 🔴
    - HIPAA authorization
    - Consent to treat
    - Financial responsibility agreement
    - Photography consent
    - Research participation
    - Advanced directives
    - Canvas signature capture
    - PDF generation with signature
    - Document storage in DMS
    - Consent expiration tracking
    - Annual renewal reminders

17. **Pre-Printed Labels** 🟡
    - Patient demographic labels
    - Specimen labels
    - Chart labels
    - Prescription labels
    - Barcode labels
    - Label printer integration

---

## B. Scheduling & Appointments - Complete Missing Features

### Appointment Management

**Missing Features:**

18. **Provider Schedule Templates** 🟡
    - Default weekly schedule
    - Recurring blocked time
    - Vacation blocking
    - CME/meeting blocks
    - Multiple location schedules
    - Schedule overrides
    - Schedule copy/paste
    - Schedule templates by season

19. **Appointment Types Configuration** 🟡
    - Duration per appointment type
    - Required resources
    - Required room type
    - Color coding
    - Visit type restrictions by provider
    - Insurance restrictions
    - New vs established patient
    - Prep time before/after

20. **Online Scheduling Widget** 🟡
    - Embeddable website widget
    - White-label design
    - Real-time availability
    - Appointment type selection
    - Provider preference
    - New patient forms included
    - Confirmation email/SMS
    - Add to calendar link

21. **Recurring Appointments** 🟡
    - Create series of appointments
    - Weekly/monthly patterns
    - End date or number of occurrences
    - Skip holidays
    - Bulk cancellation
    - Series modification

22. **Appointment Reminders** 🔴
    - Automated reminder scheduling
    - 48-hour, 24-hour, 2-hour reminders
    - SMS reminders
    - Email reminders
    - Phone call reminders (IVR)
    - Confirmation tracking
    - Cancellation via reminder link
    - Reschedule via reminder link

23. **Waitlist Management** 🔴
    - Waitlist by provider
    - Waitlist by appointment type
    - Waitlist by date range
    - Auto-notification on cancellation
    - Priority ranking
    - Waitlist expiration

24. **Group Appointments** 🟡
    - Group visit scheduling
    - Maximum capacity
    - Group roster
    - Individual check-in within group
    - Group note template
    - Split billing

25. **Multi-Location Scheduling** 🟡
    - Provider schedules across locations
    - Location-specific resources
    - Travel time between locations
    - Location-specific visit types
    - Cross-location view

26. **Appointment Conflicts** 🟡
    - Double-booking prevention
    - Overlapping appointment alerts
    - Resource conflict detection
    - Provider availability validation

27. **No-Show Tracking** 🟡
    - No-show status flag
    - No-show rate per patient
    - No-show penalties/policies
    - No-show probability scoring
    - High-risk patient alerts

28. **Appointment Search & Filters** 🟡
    - Search by patient
    - Search by provider
    - Search by appointment type
    - Search by status
    - Search by location
    - Date range filter
    - Advanced search

29. **Calendar Views** 🟡
    - Day view
    - Week view
    - Month view
    - Provider view
    - Location view
    - Resource view
    - Print calendar

30. **Appointment Cancellation** 🟡
    - Cancellation reason tracking
    - Cancellation fee calculation
    - Rescheduling workflow
    - Cancellation notifications
    - Waitlist notification on cancel

---

## C. Clinical Documentation - Complete Missing Features

### SOAP Notes & Templates

**Missing Features:**

31. **Clinical Note Templates** 🟡
    - Specialty-specific templates
    - Chief complaint templates
    - Visit type templates
    - Provider personal templates
    - Shared templates library
    - Template versioning
    - Template import/export

32. **Smart Text/Macros** 🟡
    - Quick text phrases
    - Dot phrases (.phrase)
    - Auto-expansion
    - Variable insertion (patient name, date, etc.)
    - Conditional text
    - Macro library

33. **Voice-to-Text** 🟡
    - Speech recognition
    - Real-time transcription
    - Medical vocabulary
    - Punctuation commands
    - Correction commands
    - Multiple microphone support

34. **Copy Forward** 🟡
    - Copy previous note
    - Copy with modification
    - Copy selected sections
    - Copy attestation
    - Modified section highlighting

35. **Normal Findings Auto-Population** 🟡
    - One-click normal exam
    - Customizable normal templates
    - System-specific normals
    - Age-appropriate normals

36. **Encounter Forms (Superbills)** 🔴
    - Pre-printed encounter forms
    - Checkbox format
    - Scan and import
    - OCR charge capture
    - Custom form design

37. **Scribe Workflow** 🟡
    - Scribe role permissions
    - Provider review required
    - Scribe attestation
    - Scribe time tracking

38. **Note Addendum** 🟡
    - Add to locked note
    - Addendum reason
    - Addendum timestamp
    - Addendum author
    - Original note preserved

39. **Note Templates by Time** 🟡
    - Annual physical template
    - Well-child visit templates
    - Pre-op clearance template
    - Post-op visit template
    - Procedure note template

40. **Anatomical Drawings** 🟡
    - Body diagrams
    - Drawing tools
    - Annotation capability
    - Image storage
    - Print in note

### Clinical Data Entry

**Missing Features:**

41. **Vital Signs Device Integration** 🟡
    - Blood pressure cuff (Bluetooth/HL7)
    - Pulse oximeter
    - Thermometer
    - Scale
    - Height rod
    - Glucometer
    - Peak flow meter
    - ECG machine
    - Auto-import readings
    - Device calibration tracking

42. **Pain Assessment Tools** 🟡
    - Visual analog scale
    - Numeric rating scale
    - Wong-Baker faces
    - Body diagram pain location
    - Pain character descriptors
    - Pain impact on activities

43. **Growth Charts** 🟡
    - Pediatric growth curves (CDC/WHO)
    - Height/weight/BMI percentiles
    - Head circumference
    - Trend graphing
    - Milestone tracking

44. **Medication Reconciliation** 🔴
    - Home medication list
    - Hospital medication list
    - Comparison view
    - Reconciliation workflow
    - Discrepancy resolution
    - Reconciliation attestation
    - Discharge med rec

45. **Allergy Management** 🔴
    - Allergy list with reactions
    - Severity coding
    - Onset date
    - Allergy type (drug, food, environmental)
    - No known allergies (NKA) documentation
    - Allergy verification date
    - Cross-sensitivity checking

46. **Immunization Registry** 🟡
    - CVX coding
    - Lot number tracking
    - Expiration date
    - Administration site
    - Route
    - Dose
    - Manufacturer
    - VIS (Vaccine Information Statement) provided
    - State registry reporting
    - Immunization forecasting
    - Catch-up schedules

47. **Problem List Management** 🔴
    - Active problems
    - Resolved problems
    - Problem onset date
    - Problem resolved date
    - ICD-10 coding
    - SNOMED CT coding
    - Problem ranking/priority
    - Problem list review date

48. **Social History** 🟡
    - Tobacco use (packs per day, pack-years)
    - Alcohol use (drinks per week)
    - Drug use
    - Sexual history
    - Occupation
    - Living situation
    - Exercise habits
    - Diet
    - Social determinants of health

49. **Family History** 🟡
    - Family member relationship
    - Condition/disease
    - Age of onset
    - Current status (living/deceased)
    - Family pedigree chart
    - Genetic risk calculation

50. **Surgical History** 🟡
    - Procedure name
    - Date of surgery
    - Surgeon
    - Hospital
    - Complications
    - Current status

---

## D. Order Management - Complete Missing Features

### Medication Orders

**Missing Features:**

51. **ePrescribing (EPCS)** 🔴
    - Surescripts integration
    - Controlled substance prescribing
    - Two-factor authentication for EPCS
    - Pharmacy directory
    - Preferred pharmacy
    - Pharmacy hours
    - Formulary checking
    - Prior authorization checking
    - Generic substitution
    - Medication history from PBM
    - Refill requests from pharmacy
    - Cancel Rx capability

52. **PDMP Integration** 🔴
    - State prescription monitoring program
    - Auto-query on controlled substance Rx
    - PDMP report in chart
    - Multi-state PDMP
    - Morphine milligram equivalent (MME) calculation
    - Opioid risk scoring

53. **Drug Interaction Checking** 🔴
    - Drug-drug interactions
    - Drug-allergy interactions
    - Drug-disease interactions
    - Drug-food interactions
    - Drug-lab interactions
    - Duplicate therapy checking
    - Severity level display
    - Clinical significance
    - Management recommendations
    - Override capability with reason

54. **Dosing Calculators** 🟡
    - Weight-based dosing
    - BSA-based dosing (body surface area)
    - Renal dosing (CrCl adjustment)
    - Hepatic dosing
    - Pediatric dosing
    - Geriatric considerations

55. **Medication Administration Record (MAR)** 🟡
    - Inpatient MAR
    - Scheduled medications
    - PRN medications
    - Administration time
    - Administer button
    - Hold/discontinue
    - Missed dose documentation
    - Administration barcode scanning

56. **Medication Reconciliation** 🔴
    - Admission med rec
    - Transfer med rec
    - Discharge med rec
    - Home med list
    - Hospital med list
    - Discrepancy identification
    - Action documentation (continue/discontinue/change)

57. **Prescription Printing** 🟡
    - Prescription pad format
    - E-signature
    - Tamper-resistant paper
    - DEA number
    - State license number
    - Duplicate for patient
    - Multilingual prescriptions

58. **Refill Management** 🟡
    - Refill requests from patients
    - Refill requests from pharmacies
    - Refill approval workflow
    - Refill denial with reason
    - Auto-refill for chronic meds
    - Refill reminder to patients

59. **Prior Authorization** 🟡
    - Prior auth requirement checking
    - Electronic prior auth submission
    - Prior auth tracking
    - Prior auth status
    - Prior auth expiration alerts

60. **Medication Cost Transparency** 🟡
    - GoodRx integration
    - Cost display per medication
    - Generic vs brand cost comparison
    - Insurance copay display
    - Patient assistance programs
    - Coupon/discount cards

### Lab Orders

**Missing Features:**

61. **Lab Order Entry** 🔴
    - LOINC-coded test ordering
    - Lab compendium integration
    - Order sets/panels
    - Diagnosis linkage
    - Fasting requirements
    - Specimen type
    - Collection instructions
    - Special handling
    - AOE (Ask at Order Entry) questions
    - Preferred lab selection
    - STAT vs routine priority

62. **Lab Order Transmission (HL7)** 🔴
    - ORM (Order) message generation
    - HL7 v2.x interface
    - Order acknowledgment
    - Order status updates
    - Order modification
    - Order cancellation

63. **Specimen Collection** 🟡
    - Specimen labels with barcode
    - Collection workflow
    - Specimen tracking
    - Collection time
    - Collector name
    - Specimen transportation

64. **Lab Result Interface (HL7)** 🔴
    - ORU (Result) message reception
    - Auto-import to chart
    - Result notification
    - Critical result alerts
    - Abnormal flagging
    - Reference ranges
    - Previous result comparison
    - Result graphing/trending
    - Units of measure
    - Result comments

65. **Lab Result Review** 🟡
    - Unreviewed result queue
    - Provider acknowledgment
    - Result notification to patient
    - Result followup orders
    - Result-based clinical decision support

66. **Point-of-Care Testing** 🟡
    - In-office lab results entry
    - CLIA waived tests
    - Quality control tracking
    - Device interface
    - Glucometer results
    - Urine dipstick
    - Rapid strep
    - Rapid flu

67. **Lab Order Sets** 🟡
    - Pre-defined test panels
    - Condition-based order sets
    - One-click ordering
    - Customizable order sets

68. **Microbiology Results** 🟡
    - Culture results
    - Sensitivity testing
    - Organism identification
    - MIC values
    - Preliminary/final results

### Imaging Orders

**Missing Features:**

69. **Radiology Order Entry** 🔴
    - CPT-coded orders
    - Body part selection
    - Laterality (left/right)
    - With/without contrast
    - Clinical indication required
    - PACS integration
    - Preferred facility
    - Radiation dose tracking

70. **Imaging Prior Authorization** 🟡
    - Prior auth requirement checking
    - Electronic prior auth submission
    - Gold card criteria checking
    - Appropriateness criteria (ACR)

71. **Imaging Result Interface** 🟡
    - Radiology report import
    - Critical result alerts
    - Image viewing (PACS viewer)
    - DICOM image import
    - Comparison studies

72. **Radiation Dose Tracking** 🟡
    - Cumulative radiation exposure
    - Patient dose registry
    - Dose alerts for high exposure
    - ALARA principles

73. **Pregnancy Screening** 🟡
    - Pre-imaging pregnancy check
    - Last menstrual period
    - Pregnancy test if indicated
    - Pregnancy contraindication alerts

74. **Contrast Allergy Checking** 🟡
    - Iodine contrast allergy check
    - Pre-medication protocol
    - GFR verification for contrast
    - Metformin interaction checking

### Other Orders

**Missing Features:**

75. **Referral Orders** 🔴
    - Referral order entry
    - Specialist directory
    - Insurance network checking
    - Referral reason/diagnosis
    - Clinical summary generation
    - Prior authorization submission
    - Appointment scheduling integration
    - Referral tracking
    - Consultant report receipt
    - Loop closure

76. **DME Orders** 🟡
    - Durable medical equipment orders
    - Supplier directory
    - Medical necessity documentation
    - Prior authorization
    - Certificate of medical necessity (CMN)

77. **Home Health Orders** 🟡
    - Home health order entry
    - Agency directory
    - Plan of care
    - Frequency/duration
    - Skilled nursing vs aide
    - Authorization tracking

78. **Physical Therapy Orders** 🟡
    - PT/OT/ST orders
    - Body part/diagnosis
    - Frequency and duration
    - Precautions
    - Preferred facility
    - Progress notes receipt

79. **Nursing Orders** 🟡
    - Patient care orders
    - Vital signs frequency
    - Activity level
    - Diet orders
    - Intake/output monitoring
    - Fall precautions
    - Isolation precautions

80. **Patient Education Orders** 🟡
    - Education material assignment
    - Topic selection
    - Completion tracking
    - Patient acknowledgment

---

## E. Clinical Decision Support - Complete Missing Features

### Alerts & Reminders

**Missing Features:**

81. **Drug-Drug Interaction Alerts** 🔴
    - Real-time alerts during prescribing
    - Severity level display
    - Clinical significance
    - Alternative suggestions
    - Override with reason
    - Alert fatigue management
    - Alert customization by facility

82. **Drug-Allergy Alerts** 🔴
    - Real-time alerts during prescribing
    - Cross-sensitivity checking
    - Severity assessment
    - Override with reason

83. **Duplicate Therapy Alerts** 🟡
    - Same drug class detection
    - Therapeutic duplication
    - Override with reason

84. **Preventive Care Reminders** 🟡
    - Age-based screening recommendations
    - Immunization forecasting
    - Cancer screening reminders
    - Overdue preventive care alerts
    - USPSTF guidelines
    - HEDIS measures

85. **Disease-Specific Reminders** 🟡
    - Diabetes management reminders (A1c, eye exam)
    - Hypertension reminders (BP check)
    - Anticoagulation monitoring (INR)
    - CKD monitoring (GFR, urine protein)
    - Asthma action plan review

86. **Medication Monitoring Alerts** 🟡
    - Lab monitoring for high-risk meds
    - Warfarin INR reminders
    - Lithium level monitoring
    - Digoxin level monitoring
    - Thyroid monitoring for levothyroxine

87. **Critical Lab Value Alerts** 🔴
    - Critical high/low values
    - Notification to provider
    - Acknowledgment required
    - Escalation if not acknowledged
    - Documentation of action taken

### Clinical Guidelines

**Missing Features:**

88. **Evidence-Based Order Sets** 🟡
    - Condition-specific order sets
    - Pneumonia order set
    - CHF order set
    - COPD order set
    - Sepsis order set
    - Diabetic ketoacidosis order set
    - Chest pain order set

89. **Clinical Pathways** 🟡
    - Pathway builder
    - Step-by-step guidance
    - Condition-based pathways
    - Pathway adherence tracking
    - Variance analysis

90. **Risk Calculators** 🟡
    - ASCVD risk calculator
    - CHADS2/CHA2DS2-VASc
    - HAS-BLED
    - Wells criteria (DVT/PE)
    - Framingham risk score
    - TIMI risk score
    - CURB-65 (pneumonia)
    - CKD-EPI eGFR
    - BMI calculator
    - Pregnancy dating calculator
    - Drug dosing calculators

91. **Clinical Guidelines Integration** 🟡
    - Embed guideline links
    - UpToDate integration
    - PubMed search
    - Guideline alerts
    - Guideline adherence scoring

92. **Diagnosis Assistance** 🟡
    - Differential diagnosis suggestions
    - Symptom-based suggestions
    - Isabel DDx integration
    - AI-based suggestions

