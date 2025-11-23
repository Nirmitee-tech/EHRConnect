# EHR Connect Forms System - Demo Guide 🎯

## Quick Start Demo

This guide will walk you through a complete demonstration of the EHR Connect Forms System in under 5 minutes.

---

## Prerequisites

1. **Start the application:**
   ```bash
   # Terminal 1 - API Server
   cd /Users/apple/EHRConnect/EHRConnect/ehr-api
   npm start

   # Terminal 2 - Web App
   cd /Users/apple/EHRConnect/EHRConnect/ehr-web
   npm run dev
   ```

2. **Open browser:**
   ```
   http://localhost:3000/forms
   ```

---

## Demo Script (5 Minutes)

### **Part 1: Forms List & Templates (1 min)**

1. Navigate to `http://localhost:3000/forms`

2. **Show existing templates:**
   - Point out the 9 pre-loaded templates
   - Show filters: ALL, Active, Draft, Archived
   - Search functionality
   - Status badges (Active, Draft)

3. **Available Templates:**
   - ✅ **DEMO: Complete Feature Showcase** ← Use this for demo!
   - ✅ Patient Intake Form
   - ✅ Vital Signs Assessment
   - ✅ Medical History
   - ✅ Review of Systems
   - ✅ PHQ-9 Depression Screening
   - ✅ GAD-7 Anxiety Screening
   - ✅ Daily Mood Tracker
   - ✅ Mental Health Intake

---

### **Part 2: Form Builder (2 min)**

**Option A: Use Demo Template (Easier)**

1. Click on "DEMO: Complete Feature Showcase"
2. Click "..." menu → "Edit"
3. Now in Form Builder - Show:

**Option B: Create New Form (Advanced)**

1. Click "CREATE TEMPLATE" button
2. Enter title: "Quick Demo Form"
3. Add questions using Components panel

**What to Show in Builder:**

✅ **Four-Panel Layout:**
- Left: Items tree + Components library (tabs)
- Center: Properties panel
- Right: Live preview
- Bottom: Debug console (5 tabs)

✅ **Add a Question:**
- Click "Components" tab
- Click "Text" component
- Fills into properties panel

✅ **Properties Panel (Show these):**
- Link ID: `demo-question-1`
- Type: Text (dropdown with 14 types)
- Text: "What is your main concern today?"
- Prefix: "1."
- Placeholder: "Enter your answer..."
- Max Length: 500
- ☑️ Required
- ☐ Hidden
- ☐ Repeats
- ☐ Read only

✅ **Add Choice Question:**
- Add "Choice" component
- Add options:
  - Code: `yes` / Display: `Yes`
  - Code: `no` / Display: `No`
  - Code: `maybe` / Display: `Maybe`

✅ **Conditional Logic:**
- Add another text question
- Click "Add rule" under "Enable When"
- Set: Show when previous question = "yes"
- Operators available: exists, =, !=, >, <, >=, <=

✅ **Save:**
- Click "Save" button
- Shows success message
- Redirects to forms list

---

### **Part 3: Preview & Fill Form (2 min)**

**Preview:**
1. From forms list, click "PREVIEW" on "DEMO: Complete Feature Showcase"
2. Show warning banner: "Preview Mode"
3. Show read-only form
4. Click "Fill Form" button

**Fill Form (The WOW moment!):**

✅ **Beautiful UI:**
- Gradient background (blue → white → purple)
- Animated progress bar at top
- Numbered question cards
- Text-based icons (TXT, CHC, 123, etc.)

✅ **Features to Demonstrate:**

1. **Progress Tracking:**
   - Top bar shows "0 of 45 questions completed (0%)"
   - Updates in real-time as you answer

2. **Question Types:** (Answer a few to show variety)
   - Text input (short-text, email)
   - Textarea (long-text)
   - Number (age, height)
   - Date picker (dob)
   - Time picker (appointment-time)
   - Choice dropdown (gender, smoking-status)
   - Boolean Yes/No (has-allergies)

3. **Conditional Logic in Action:**
   - Answer "Do you have any known allergies?" → YES
   - Watch "Please list all allergies:" appear automatically!
   - Answer "Do you have chronic conditions?" → YES
   - Watch follow-up questions appear
   - Select "Diabetes" → Watch "What type of diabetes?" appear

4. **Validation:**
   - Try to submit without required fields
   - Shows red errors only after you touch the field
   - Scroll to first error

5. **Auto-Save:**
   - Bottom shows "Last saved: X seconds ago"
   - Auto-saves every 30 seconds
   - Never lose your progress!

6. **Submit:**
   - Fill in at least the required fields
   - Click "Submit Form"
   - Beautiful success screen with confetti animation

---

### **Part 4: Response Viewer (30 sec)**

After submission, automatically redirects to response viewer:

✅ **Beautiful Response Display:**
- Large gradient icon header
- Status badge: "Completed"
- Metadata: Submitted date, user, questions count
- All answers in organized cards
- Checkmarks for answered questions
- Print button
- Download JSON button

---

## Advanced Features to Show

### **Status Management:**

1. Go back to forms list
2. Find a "Draft" template
3. Click "..." menu → "Publish (Make Active)"
4. Status changes to "Active"
5. Click "..." menu → "Archive"
6. Status changes to "Archived"

### **Predefined Templates:**

**Healthcare Templates:**
1. **Patient Intake Form** - Full registration
   - Demographics, contact, insurance, emergency contact

2. **Vital Signs Assessment** - Clinical measurements
   - BP, HR, Temperature, RR, SpO2, Pain Scale, Weight, Height

3. **Medical History** - Comprehensive history
   - Medications, allergies, chronic conditions, surgeries, family history, social history

4. **Review of Systems** - Symptom checklist
   - 6 body systems: Constitutional, Cardiovascular, Respiratory, GI, Neurological, Musculoskeletal

**Mental Health Templates:**
1. **PHQ-9** - Depression screening (9 questions, 0-3 scale)
2. **GAD-7** - Anxiety screening (7 questions, 0-3 scale)
3. **Daily Mood Tracker** - Track mood, sleep, energy, activities
4. **Mental Health Intake** - Comprehensive assessment with risk screening

---

## Key Talking Points

### **Why This is Industry-Leading:**

1. **Aidbox-Quality UI** ✅
   - 4-panel professional layout
   - Comprehensive properties panel
   - Live preview
   - Debug console

2. **Complete Feature Set** ✅
   - 14 question types
   - Conditional logic (enableWhen)
   - Validation
   - Auto-save
   - Progress tracking
   - Status management

3. **FHIR Compliant** ✅
   - FHIR R4 Questionnaire
   - FHIR R4 QuestionnaireResponse
   - FHIR SDC Implementation Guide

4. **Beautiful UX** ✅
   - Gradient backgrounds
   - Animated progress
   - Smart validation (only after touch)
   - Success celebrations
   - Print-optimized

5. **Production Ready** ✅
   - 9 predefined templates
   - Full CRUD operations
   - PostgreSQL storage
   - Audit logging
   - Multi-tenant support

---

## Demo Questions (5 min form fill)

For a quick demo, answer these questions in the DEMO form:

1. **Name:** "John Smith"
2. **Email:** "john@example.com"
3. **Age:** 35
4. **Date of Birth:** 01/15/1989
5. **Gender:** Male
6. **Smoking Status:** Never Smoked
7. **Has allergies:** YES → List: "Penicillin"
8. **Takes medication:** NO
9. **Has insurance:** YES
10. **Has chronic condition:** YES → Diabetes → Type 2
11. **Exercise frequency:** 3-4 times per week
12. **Emergency contact:** "Jane Smith"
13. **Emergency phone:** "555-0100"
14. **Emergency relationship:** "Spouse"

Submit and show the beautiful response viewer!

---

## Troubleshooting

**If forms don't load:**
```bash
# Check API is running
curl http://localhost:8000/api/forms/templates

# Check database has templates
PGPASSWORD=medplum123 psql -h localhost -U medplum -d medplum -c "SELECT COUNT(*) FROM form_templates;"
```

**If save doesn't work:**
- Open browser console (F12)
- Check for errors
- Verify localStorage has userId and orgId

**If 401 error:**
- Refresh the page (auth headers will be set automatically)
- Check browser console for localStorage values

---

## Success Metrics

After demo, you should have shown:

✅ Professional form builder (Aidbox quality)
✅ 14 question types working
✅ Conditional logic in action
✅ Beautiful form filling experience
✅ Progress tracking and auto-save
✅ Validation working correctly
✅ Complete submission workflow
✅ Beautiful response viewer
✅ Status management (publish/archive)
✅ 9 production-ready templates

---

## Quick Links

- **Forms List:** http://localhost:3000/forms
- **Create New:** http://localhost:3000/forms/builder
- **Demo Form:** http://localhost:3000/forms (click "DEMO: Complete Feature Showcase")

---

## Next Steps

After demo, discuss:

1. **Optional Enhancements:**
   - Calculated expressions (FHIRPath)
   - $populate (pre-fill from patient data)
   - $extract (create FHIR resources)
   - ValueSet integration
   - Score calculation
   - Custom themes

2. **Integration:**
   - Embed in patient portal
   - Embed in provider dashboard
   - Link to encounters
   - Link to episodes of care

3. **Customization:**
   - Custom branding
   - Custom themes
   - Custom validation rules
   - Custom workflows

---

*Built with ❤️ using Next.js, React, PostgreSQL, and FHIR R4*
*© 2025 EHR Connect - Healthcare Management System*
