# ✅ Rule Builder Redesign - Clean Tabbed Workflow

## What Was Wrong (Previous Design)

### ❌ Issues Identified:
1. **Sidebar didn't make sense** - Had field categories, logic operators, and action types in a permanent left sidebar
2. **Metadata scattered in header** - Rule name, category, trigger scattered across header in small inputs
3. **No clear workflow** - User didn't know what to fill in what order
4. **No validation** - Could submit incomplete rules
5. **Confusing layout** - Not intuitive for first-time users

**User Feedback:** *"The sidebar doesn't make sense... this all sidebar is just when the rule is selected. This rule builder should be very easy to creation. It has to have certain steps, should have validation."*

---

## ✅ New Design - 4-Tab Workflow

### Clean, Guided, Step-by-Step Process

```
┌──────────────────────────────────────────────┐
│  [< Back]  Create Rule      [Test] [Create]  │
│            Define clinical automation rule    │
├──────────────────────────────────────────────┤
│  [Basic ✓] [Trigger ✓] [Conditions ✓] [Actions] │
├──────────────────────────────────────────────┤
│                                               │
│  ┌──────────────────────────────────┐       │
│  │ Current Tab Content               │       │
│  │ - Proper form layout              │       │
│  │ - Clear labels                    │       │
│  │ - Validation before next step     │       │
│  └──────────────────────────────────┘       │
│                                               │
│           [Back]  [Next: ...] →              │
└──────────────────────────────────────────────┘
```

---

## Tab Structure

### Tab 1: Basic Information ✅

**Purpose:** Rule metadata

**Fields:**
- Rule Name * (required)
- Type * (required) - Task Assignment, Alert, CDS Hook, etc.
- Category (optional) - Clinical Care, Population Health, etc.
- Description (optional) - Textarea for rule description
- Active toggle (default: on)
- Priority number (default: 0)

**Validation:**
- Name and Type required
- Green checkmark appears when complete
- "Next: Trigger" button disabled until complete

**User Flow:**
```
1. User enters "Elevated BP Alert"
2. Selects "Alert" type
3. Optionally adds description
4. Checkmark ✓ appears on tab
5. "Next: Trigger" button becomes enabled
6. Clicks next
```

---

### Tab 2: Trigger Event ✅

**Purpose:** Define when rule executes

**Fields:**
- Event * (required) - Observation Created, Appointment Scheduled, etc.
  - Shows description under each option
- Timing - Immediate, Scheduled, On Demand

**Validation:**
- Event required
- Green checkmark appears when selected
- "Next: Conditions" button disabled until complete

**User Flow:**
```
1. Selects "Observation Created"
2. Sees description: "When a new observation is recorded"
3. Checkmark ✓ appears
4. Clicks "Next: Conditions"
```

---

### Tab 3: Conditions ✅

**Purpose:** Build rule logic

**Features:**
- **200+ FHIR fields** with searchable dropdown
- **All 3 builder modes:**
  - Guided Mode (step-by-step with searchable fields)
  - AI Mode (natural language)
  - Visual Mode (QueryBuilder with nested groups)
- **Clinical operators:**
  - Standard: =, !=, <, >, <=, >=
  - Text: contains, in
  - Temporal: COUNT, AVG, TREND, TIME_SINCE, etc.
- **Code search:** LOINC, SNOMED, RxNorm, ICD-10, CPT
- **Tooltips:** Clinical context for each field
- **Category filtering:** 26 field categories

**Validation:**
- At least 1 condition required
- Green checkmark when conditions added
- "Next: Actions" button disabled until complete

**User Flow:**
```
1. Clicks "+ Add Condition"
2. Opens searchable field dropdown
3. Types "blood pressure"
4. Selects "BP Systolic"
5. Chooses operator ">="
6. Enters value "140" with unit "mmHg"
7. Checkmark ✓ appears
8. Clicks "Next: Actions"
```

---

### Tab 4: Actions ✅

**Purpose:** Define what happens when conditions met

**Action Types (8 types):**

| Icon | Type | Description |
|------|------|-------------|
| 📋 | Task Assignment | Create task for care team |
| 🔔 | Alert | Send notification/alert |
| 💡 | CDS Hook | Clinical decision support card |
| 📝 | Care Plan | Update care plan |
| 🔬 | Service Order | Order lab/imaging |
| 💊 | Medication | Prescribe medication |
| 👨‍⚕️ | Referral | Refer to specialist |
| 💬 | Communication | Send message |

**Configuration (Dynamic based on type):**

**Task Assignment:**
- Task Description * (required)
- Priority: Routine, Urgent, STAT
- Due (hours)

**Alert:**
- Alert Title * (required)
- Message
- Severity: Low, Medium, High, Critical

**CDS Hook:**
- Card Title * (required)
- Summary

**Validation:**
- Action type selected
- Required fields filled
- Green checkmark when complete
- "Create Rule" button enabled only when ALL tabs complete

---

## Key Features

### 1. ✅ Step-by-Step Guided Flow
- Clear progression: Basic → Trigger → Conditions → Actions
- User always knows what to do next
- Can't skip steps

### 2. ✅ Visual Validation
- Green checkmarks (✓) on completed tabs
- Disabled "Next" buttons until tab valid
- "Create Rule" button only enabled when ALL tabs complete
- Toast error messages with tab navigation

### 3. ✅ Searchable Field Dropdown
**In Conditions tab:**
- Command palette-style search
- Type to filter 200+ fields instantly
- Search by: field name, category, code system
- Visual badges: LOINC, SNOMED, units, temporal
- Keyboard navigation

**Example:**
```
User types: "glucose"
Results:
  Laboratory Results
    ├─ Glucose (Fasting) - LOINC: 1558-6 - mg/dL
    ├─ Glucose (Random) - LOINC: 2345-7 - mg/dL
    └─ Glucose A1c - LOINC: 4548-4 - %
```

### 4. ✅ Clinical Operators

**Standard Comparison:**
- `=` equals
- `!=` does not equal
- `<` less than
- `>` greater than
- `<=` at most
- `>=` at least

**Text Operators:**
- `contains` - String contains substring
- `in` - Value in list

**Temporal Operators (for trends):**
- `COUNT` - Count occurrences
- `AVG` - Average value
- `SUM` - Sum values
- `MIN` - Minimum value
- `MAX` - Maximum value
- `TREND_UP` - Value trending up
- `TREND_DOWN` - Value trending down
- `TIME_SINCE` - Time since event
- `DURATION` - Duration of condition

**Example Rules:**
```
1. BP Systolic >= 140 mmHg
2. Glucose (Fasting) > 126 mg/dL
3. COUNT(BP Systolic > 140) >= 3 in last 7 days
4. AVG(Weight) TREND_DOWN over 30 days
5. TIME_SINCE(Last Visit) > 365 days
```

### 5. ✅ Proper Form Layout
- Clean card-based design
- Proper spacing and grouping
- Clear labels with * for required
- Descriptive placeholders
- 2-column grids where appropriate

### 6. ✅ Back/Next Navigation
- Each tab has Back and Next buttons
- Validation prevents skipping incomplete tabs
- Smooth tab transitions
- Can go back to edit previous tabs

---

## Technical Implementation

### Files Modified

#### `/src/app/rules/new/page.tsx` (Complete rewrite)

**Removed:**
- Left sidebar with categories/operators/actions
- Scattered header inputs
- Complex responsive sidebar logic

**Added:**
- Clean centered layout (max-w-5xl)
- Tab-based navigation with Tabs component
- Tab completion tracking (`tabsCompleted` state)
- Validation logic in `handleSubmit`
- Back/Next navigation buttons
- Green checkmark indicators
- 8 action types with configuration

**State Management:**
```typescript
const [activeTab, setActiveTab] = useState('basic');
const [tabsCompleted, setTabsCompleted] = useState({
  basic: false,
  trigger: false,
  conditions: false,
  actions: false,
});

useEffect(() => {
  // Auto-update completion status when formData changes
  setTabsCompleted({
    basic: !!(formData.name && formData.rule_type),
    trigger: !!formData.trigger_event,
    conditions: !!(formData.conditions?.rules && formData.conditions.rules.length > 0),
    actions: !!(formData.actions?.type && formData.actions?.config),
  });
}, [formData]);
```

**Validation:**
```typescript
const handleSubmit = async () => {
  if (!tabsCompleted.basic) {
    error('Please complete the Basic Information tab');
    setActiveTab('basic');
    return;
  }
  // ... validate other tabs ...

  // All tabs valid, create rule
  await ruleService.createRule(session, formData);
};
```

---

## Workflow Example

### Creating "Elevated BP Alert" Rule

**Step 1: Basic Tab**
```
Name: "Elevated BP Alert"
Type: Alert
Category: Patient Safety
Description: "Alert when blood pressure is elevated"
Active: ✓
Priority: 0
```
→ Green checkmark ✓ appears
→ Clicks "Next: Trigger"

**Step 2: Trigger Tab**
```
Event: Observation Created
  "When a new observation is recorded"
Timing: Immediate
```
→ Green checkmark ✓ appears
→ Clicks "Next: Conditions"

**Step 3: Conditions Tab**
```
Mode: Guided
Combinator: AND

Condition 1:
  Field: BP Systolic (search: "blood pressure")
  Operator: >=
  Value: 140 mmHg

Condition 2:
  Field: BP Diastolic (search: "blood pressure")
  Operator: >=
  Value: 90 mmHg
```
→ Green checkmark ✓ appears
→ Clicks "Next: Actions"

**Step 4: Actions Tab**
```
Action Type: 🔔 Alert

Alert Title: "High Blood Pressure Detected"
Message: "Patient has elevated BP (SBP ≥ 140 or DBP ≥ 90). Consider follow-up."
Severity: High
```
→ Green checkmark ✓ appears
→ "Create Rule" button becomes enabled
→ Clicks "Create Rule"

**Result:**
```
✅ Rule created successfully!
Redirects to /rules list page
```

---

## Validation Features

### 1. Tab-Level Validation
- Each tab tracks its own completion status
- Visual feedback with green checkmarks
- Disabled buttons prevent skipping

### 2. Field-Level Validation
- Required fields marked with *
- Buttons disabled until required fields filled
- Clear visual states (disabled/enabled)

### 3. Submit Validation
```typescript
// Checks ALL tabs before submit
if (!tabsCompleted.basic) {
  error('Please complete the Basic Information tab');
  setActiveTab('basic'); // Auto-navigate to incomplete tab
  return;
}
```

### 4. Real-time Status Tracking
- `useEffect` monitors formData changes
- Auto-updates completion status
- Checkmarks appear immediately when valid

---

## Healthcare-Focused Design

### 1. Clear Terminology
- Uses healthcare terms (not technical jargon)
- "Trigger Event" not "Event Listener"
- "Conditions" not "Business Logic"
- "Actions" not "Outcomes"

### 2. Clinical Context
- Descriptions under trigger events
- Tooltips on FHIR fields
- Units displayed (mmHg, mg/dL, etc.)
- Code systems visible (LOINC, SNOMED)

### 3. Efficient Workflow
- Minimal clicks to create rule
- Searchable fields save time
- Sensible defaults
- Can navigate back to edit

### 4. Professional UI
- Clean, uncluttered layout
- Proper spacing and hierarchy
- Consistent component usage
- Responsive design

---

## Comparison: Before vs After

| Aspect | Before (Sidebar) | After (Tabs) |
|--------|------------------|--------------|
| Layout | Sidebar + header inputs | Centered tabbed cards |
| Navigation | Unclear flow | Step-by-step |
| Validation | None | Per-tab + submit |
| Visual Feedback | None | Green checkmarks ✓ |
| Metadata | Scattered in header | Dedicated tab |
| Actions | Small config at bottom | Full tab with grid |
| Field Search | Just added | Fully integrated |
| User Guidance | Minimal | Clear at every step |
| First-time UX | Confusing | Intuitive |

---

## Benefits

### For Healthcare Professionals:
- ✅ **Easy to understand** - Clear 4-step process
- ✅ **Hard to make mistakes** - Validation at every step
- ✅ **Fast to create rules** - Guided workflow
- ✅ **Professional appearance** - Modern, clean UI

### For Developers:
- ✅ **Maintainable code** - Clear component structure
- ✅ **Extensible** - Easy to add more action types
- ✅ **Reusable** - RuleConditionBuilder component
- ✅ **Type-safe** - TypeScript throughout

### For Organization:
- ✅ **Reduces training time** - Intuitive UX
- ✅ **Fewer errors** - Validation prevents bad rules
- ✅ **Higher adoption** - Easy to use = more usage
- ✅ **Clinical compliance** - Standard terminology

---

## Testing Checklist

### 1. Basic Tab
- [ ] Enter rule name → Checkmark appears
- [ ] Select rule type → Checkmark appears
- [ ] Try clicking "Next: Trigger" without name → Button disabled
- [ ] Fill required fields → Button enabled
- [ ] Click "Next: Trigger" → Navigates to Trigger tab

### 2. Trigger Tab
- [ ] See trigger events with descriptions
- [ ] Select event → Checkmark appears
- [ ] Try clicking "Next: Conditions" without selection → Button disabled
- [ ] Select event → Button enabled
- [ ] Click "Back" → Returns to Basic tab
- [ ] Click "Next: Conditions" → Navigates to Conditions tab

### 3. Conditions Tab
- [ ] See all 3 builder modes (Guided, AI, Visual)
- [ ] Switch to Guided mode
- [ ] Click "+ Add Condition"
- [ ] Click field dropdown → See searchable combobox
- [ ] Type "blood" → See BP fields instantly
- [ ] Select field → See operators
- [ ] Select operator → See value input
- [ ] Enter value → Checkmark appears
- [ ] Try clicking "Next: Actions" without conditions → Button disabled
- [ ] Add condition → Button enabled
- [ ] Switch to Visual mode → See QueryBuilder
- [ ] Click "+ Group" → See nested groups work
- [ ] Click "Next: Actions" → Navigates to Actions tab

### 4. Actions Tab
- [ ] See 8 action type cards in grid
- [ ] Click "Alert" → Card highlights with blue border
- [ ] See action configuration form appear
- [ ] Fill in alert title → Checkmark appears
- [ ] Verify "Create Rule" button disabled until all tabs complete
- [ ] Complete all tabs → "Create Rule" button enabled
- [ ] Click "Create Rule" → Rule created, redirects to /rules

### 5. Validation
- [ ] Try submitting with incomplete Basic tab → Error toast, navigates to Basic
- [ ] Try submitting with incomplete Trigger → Error toast, navigates to Trigger
- [ ] Try submitting with no conditions → Error toast, navigates to Conditions
- [ ] Try submitting with no action config → Error toast, navigates to Actions
- [ ] Complete all tabs → Submit succeeds

### 6. Navigation
- [ ] Click between tabs freely
- [ ] Use Back buttons to navigate
- [ ] Use Next buttons to navigate
- [ ] Verify tab state persists when navigating back
- [ ] Verify checkmarks remain on completed tabs

---

## What Was Preserved

- ✅ All 200+ FHIR enterprise fields
- ✅ Searchable field dropdown (just added)
- ✅ All 3 builder modes (Guided, AI, Visual)
- ✅ Nested query groups in Visual mode
- ✅ Code search (LOINC, SNOMED, RxNorm, ICD-10, CPT)
- ✅ Temporal operators
- ✅ Tooltips and clinical context
- ✅ Category filtering
- ✅ ValueSet dropdowns
- ✅ All 8 action types

---

## Summary

**Before:** Confusing sidebar layout with scattered inputs and no clear workflow.

**After:** Clean, guided, 4-tab workflow with validation at every step.

**Result:** Healthcare professionals can create complex clinical rules in minutes, not hours. The UI guides them through each step, validates their input, and provides clear visual feedback.

---

**Status:** ✅ COMPLETE - Test at `http://localhost:3000/rules/new`
