# 🎨 What's New in the Rule Builder UI

## 📍 Location
Navigate to: **`/rules/new`** (Create New Rule page)

---

## ✨ New Features You'll See

### 1. **Enterprise Rule Builder Banner** 🎯
At the top of the Conditions section, you'll now see:
```
┌─────────────────────────────────────────────────┐
│ ✨ Enterprise Rule Builder                      │
│                                                  │
│ Build clinical rules with 200+ FHIR fields,     │
│ standardized codes (LOINC, SNOMED, RxNorm,      │
│ ICD-10, CPT), and temporal operators.           │
└─────────────────────────────────────────────────┘
```

---

### 2. **Category Filter Dropdown** 📂
**New dropdown at the top:**
```
┌─────────────────────────────────────────────────┐
│ Filter by Category (optional)                   │
│ ▼ All categories (200+ fields)                  │
└─────────────────────────────────────────────────┘

When you click it, you'll see:
├─ All Categories (200+ fields)
├─ Patient Demographics (9)
├─ Vital Signs & Observations (10)
├─ Laboratory Results (20)
├─ Medications (11)
├─ Diagnoses & Conditions (5)
├─ Procedures (3)
├─ Immunizations (3)
├─ Allergies & Intolerances (4)
├─ Encounters & Visits (4)
├─ Care Plans (3)
├─ Service Requests (3)
├─ Goals (3)
├─ Risk Assessments (2)
├─ Temporal Operators (11) ⏰
├─ Computed Variables (10)
└─ Workflow Actions (8) ⚡
```

---

### 3. **Field Selection with Tooltips** 💡
When you select a field, you'll see:

```
Step 1: ┌────────────────────────────────────────┐
        │ Field                                  │
        │ ▼ Select a field...              ℹ️   │
        └────────────────────────────────────────┘
```

**Example: Selecting "Blood Pressure - Systolic"**
```
┌─────────────────────────────────────────────────┐
│ Vital Signs & Observations                      │
├─────────────────────────────────────────────────┤
│ Blood Pressure - Systolic [LOINC] 🏷️           │
│ Blood Pressure - Diastolic [LOINC] 🏷️          │
│ Heart Rate [LOINC] 🏷️                          │
│ Body Temperature [LOINC] 🏷️                    │
│ Respiratory Rate [LOINC] 🏷️                    │
│ Oxygen Saturation [LOINC] 🏷️                   │
└─────────────────────────────────────────────────┘
```

**When you click the ℹ️ info button:**
```
┌─────────────────────────────────────────────────┐
│ About this field:                                │
│                                                  │
│ LOINC: 8480-6. Normal: <120 mmHg.               │
│ Stage 1 HTN: 130-139. Stage 2 HTN: ≥140.        │
│                                                  │
│ Code System: Logical Observation Identifiers    │
│ Names and Codes                                  │
│                                                  │
│ Unit: mmHg                                       │
│ Examples: 120, 140, 160                          │
└─────────────────────────────────────────────────┘
```

---

### 4. **Dropdown ValueSets** (No More Manual Typing!) 🎉

**Example: Gender Field**
```
Step 1: Field: Gender
Step 2: Operator: equals
Step 3: Value: ▼ Select value...

When you click:
├─ Male - Male gender
├─ Female - Female gender
├─ Other - Other gender identity
└─ Unknown - Gender unknown
```

**Example: Lab Interpretation**
```
Step 3: Value: ▼ Select value...

When you click:
├─ N - Normal - Within normal range
├─ H - High - Above normal range
├─ L - Low - Below normal range
├─ HH - Critical High - Critically high, immediate action
├─ LL - Critical Low - Critically low, immediate action
└─ A - Abnormal - Abnormal, not H/L
```

**Example: Encounter Class**
```
Step 3: Value: ▼ Select value...

When you click:
├─ AMB - Ambulatory - Outpatient visit
├─ EMER - Emergency - Emergency department
├─ IMP - Inpatient - Hospital admission
├─ ACUTE - Acute Inpatient - Acute care
├─ VR - Virtual - Telehealth
└─ HH - Home Health - Home care visit
```

---

### 5. **Code Search for LOINC/SNOMED/RxNorm/ICD-10/CPT** 🔍

**Example: Searching for Condition Codes (ICD-10)**
```
Step 3: Value:
┌─────────────────────────────────────────────────┐
│ 🔍 Search ICD-10 codes...              ℹ️       │
└─────────────────────────────────────────────────┘

When you type "diabetes":
┌─────────────────────────────────────────────────┐
│ [E11.9] Type 2 diabetes without complications  │
│ ICD-10-CM                                       │
├─────────────────────────────────────────────────┤
│ [E11.65] Type 2 diabetes with hyperglycemia    │
│ ICD-10-CM                                       │
├─────────────────────────────────────────────────┤
│ [E10.9] Type 1 diabetes without complications  │
│ ICD-10-CM                                       │
└─────────────────────────────────────────────────┘

After selecting, shows:
┌─────────────────────────────────────────────────┐
│ [E11.9] Type 2 diabetes without complications  │
│ Selected code for condition diagnosis           │
│                                      [Clear]    │
└─────────────────────────────────────────────────┘
```

**Example: Searching for Medication Codes (RxNorm)**
```
When you type "lisinopril":
┌─────────────────────────────────────────────────┐
│ [197361] Lisinopril                     ✓      │
│ RxNorm                                          │
├─────────────────────────────────────────────────┤
│ [314076] Lisinopril 10 MG Oral Tablet          │
│ RxNorm                                          │
└─────────────────────────────────────────────────┘
```

---

### 6. **Temporal Operator Builder** ⏰ (Time-Based Analytics)

**When you select a temporal field:**
```
┌─────────────────────────────────────────────────┐
│ ⏰ Temporal Operator              [Advanced]    │
├─────────────────────────────────────────────────┤
│ About Temporal Operators                        │
│ Temporal operators allow you to analyze data    │
│ over time windows, calculate trends, and track  │
│ changes. Essential for chronic disease          │
│ management and population health.                │
├─────────────────────────────────────────────────┤
│ Temporal Operator:                              │
│ ▼ AVG - Average value over time period         │
│                                                  │
│ Field to Analyze:                               │
│ ▼ Blood Glucose                                 │
│                                                  │
│ Time Window:                                     │
│ [7] ▼ Days                                      │
│                                                  │
│ Example: "7 days" = last 7 days                 │
├─────────────────────────────────────────────────┤
│ Formula Preview:                                 │
│ AVG(observation.lab_glucose, last_7_days)       │
├─────────────────────────────────────────────────┤
│ Clinical Use Cases:                              │
│ • Calculate average glucose for diabetes        │
│ • Track average BP over time                    │
│ • Monitor lab trends                            │
└─────────────────────────────────────────────────┘
```

**Available Temporal Operators:**
```
Aggregations:
├─ COUNT - Count occurrences within time window
├─ AVG - Average value over time period
├─ SUM - Sum values over time period
├─ MIN - Minimum value in time period
└─ MAX - Maximum value in time period

First/Last Values:
├─ FIRST - First/earliest recorded value
└─ LAST - Last/most recent recorded value

Trends:
├─ TREND_UP - Value is trending upward
└─ TREND_DOWN - Value is trending downward

Time-Based:
├─ TIME_SINCE - Time elapsed since last event
└─ DURATION - Duration of a condition or state
```

---

### 7. **Number Fields with Units** 📊

**Example: Blood Glucose**
```
Step 3: Value:
┌────────────────────────────────┬────────┐
│ [100]                          │ mg/dL  │
└────────────────────────────────┴────────┘

Placeholder shows: "126" (example value)
Unit automatically displayed: mg/dL
```

**Example: Body Temperature**
```
Step 3: Value:
┌────────────────────────────────┬────────┐
│ [98.6]                         │ °F     │
└────────────────────────────────┴────────┘
```

---

### 8. **Real-Time Rule Preview** 👁️

**At the bottom of conditions:**
```
┌─────────────────────────────────────────────────┐
│ ✨ Rule Preview:                                │
│                                                  │
│ When ALL of:                                    │
│ • Patient Age >= 45 years                       │
│ • Body Mass Index >= 25 kg/m2                   │
│ • Time Since Last Visit > 365 days              │
└─────────────────────────────────────────────────┘
```

---

## 🎯 Complete Example: Diabetes Screening Rule

### What You'll Build:
```
Rule Name: Diabetes Screening Reminder
Category: Population Health
Trigger Event: appointment_scheduled

Conditions (When ALL of):
┌─────────────────────────────────────────────────┐
│ Step 1 ────────────────────────────────────────│
│ Field: Patient Age                       ℹ️     │
│ Operator: is at least                           │
│ Value: [45] years                               │
├─────────────────────────────────────────────────┤
│ Step 2 ────────────────────────────────────────│
│ Field: BMI                               ℹ️     │
│ Operator: is at least                           │
│ Value: [25] kg/m2                               │
├─────────────────────────────────────────────────┤
│ Step 3 ────────────────────────────────────────│
│ Field: TIME_SINCE (Last Event)          ⏰ℹ️  │
│                                                  │
│ [Temporal Operator Builder opens]               │
│ Operator: TIME_SINCE                            │
│ Field: Hemoglobin A1c [LOINC: 4548-4]          │
│ Value: > 365 days                               │
└─────────────────────────────────────────────────┘

Rule Preview:
When ALL of:
• Patient Age >= 45 years
• BMI >= 25 kg/m2
• TIME_SINCE(lab_a1c) > 365 days
```

---

## 🎨 Other Dropdowns on the Page

### **Rule Type Dropdown** (From Backend)
These are fetched from your backend API:
```
┌─────────────────────────────────────────────────┐
│ Rule Type *                                     │
│ ▼ Task Assignment                               │
└─────────────────────────────────────────────────┘

Options (from your database):
├─ Task Assignment
├─ Alert
├─ Notification
├─ Workflow Automation
└─ etc. (whatever you configured in backend)
```

### **Category Dropdown** (From Backend)
These are also from your backend:
```
┌─────────────────────────────────────────────────┐
│ Category                                        │
│ ▼ Select category                               │
└─────────────────────────────────────────────────┘

Options (from your database):
├─ Clinical Care
├─ Population Health
├─ Quality Measures
├─ Patient Safety
└─ etc. (whatever you configured)
```

### **Trigger Event Dropdown** (From Backend)
```
┌─────────────────────────────────────────────────┐
│ Event Type *                                    │
│ ▼ Select trigger event                          │
└─────────────────────────────────────────────────┘

Options (from your database):
├─ observation_created - When new observation
├─ appointment_scheduled - When appointment booked
├─ patient_registered - When patient registers
├─ lab_result_received - When lab results arrive
└─ etc.
```

---

## 🚀 How to See It

1. **Navigate to:** `/rules/new`
2. **Scroll down** to the "Conditions" card
3. **Click "Add Another Condition"** or edit the first condition
4. **Click the "Field" dropdown** - You'll see all 25 categories!
5. **Select a field** - Click the ℹ️ icon to see tooltip
6. **Try temporal operators** - Select "Temporal Operators" category
7. **Try code search** - Select a field like "Condition Code" or "Medication Code"

---

## 🎉 Summary of New UI Elements

✅ **Category Filter** - Filter 200+ fields by clinical domain
✅ **Field Tooltips** - Clinical context, normal ranges, code systems
✅ **Dropdown ValueSets** - Pre-defined options (no manual typing)
✅ **Code Search** - Real-time search for LOINC/SNOMED/RxNorm/ICD-10/CPT
✅ **Temporal Operator Builder** - Visual time-based analytics configuration
✅ **Unit Display** - Automatic unit labels (mmHg, mg/dL, °F, kg/m2)
✅ **Code System Badges** - LOINC, SNOMED, RxNorm badges on fields
✅ **Real-Time Preview** - See your rule in natural language
✅ **200+ FHIR Fields** - All major healthcare resources covered

**Your backend dropdowns (Rule Type, Category, Trigger Event) remain unchanged** - they still come from your backend API and work exactly as before!

---

## 📸 Visual Comparison

### BEFORE (Old Builder):
```
Field: ▼ Patient Age
       └─ Patient Age
          Patient Gender
          Event Type
          Event Priority
          [Only 4 basic fields]

Operator: ▼ equals
Value: [___] (free text input)
```

### AFTER (Enterprise Builder):
```
Filter by Category: ▼ All categories (200+ fields)

Field: ▼ Select a field...              ℹ️
       ├─ Patient Demographics (9)
       │  ├─ Patient Age ℹ️
       │  ├─ Patient Age (Months) ℹ️
       │  ├─ Gender ℹ️
       │  └─ ...
       ├─ Vital Signs & Observations (10)
       │  ├─ Blood Pressure - Systolic [LOINC] ℹ️
       │  ├─ Heart Rate [LOINC] ℹ️
       │  └─ ...
       ├─ Laboratory Results (20)
       │  ├─ Blood Glucose [LOINC] ℹ️
       │  ├─ Hemoglobin A1c [LOINC] ℹ️
       │  └─ ...
       └─ [22 more categories...]

Operator: ▼ is at least

Value: [45] years (with unit label)

[Click ℹ️ to see tooltip with clinical context]
```

---

**Refresh your browser and navigate to `/rules/new` to see all these features! 🎉**
