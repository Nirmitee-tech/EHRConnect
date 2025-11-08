# Encounter Scoping Logic

## Overview
This document explains how the active encounter is tracked and how all forms, actions, and UI elements are properly scoped to the correct encounter.

## Core Concept

When working with multiple open encounters, the **active encounter** determines:
1. Which encounter's forms are displayed
2. Which data is being edited
3. Which actions are available in the contextual menu
4. Which encounter is highlighted in the sidebar

## Key Components

### 1. Active Tab State (`activeTab`)
- Stored in Zustand: `patient-detail-store.ts`
- Format for encounters: `encounter-{encounterId}`
- Examples:
  - `"encounter-abc123"` = Encounter tab with ID abc123
  - `"dashboard"` = Dashboard tab
  - `"allergies"` = Allergies tab

### 2. Utility Functions (`encounter-utils.ts`)

```typescript
// Extract encounter ID from tab ID
getEncounterIdFromTab("encounter-abc123") // Returns: "abc123"
getEncounterIdFromTab("dashboard")        // Returns: null

// Check if current tab is an encounter
isEncounterTab("encounter-abc123")        // Returns: true
isEncounterTab("dashboard")               // Returns: false

// Create tab ID from encounter ID
createEncounterTabId("abc123")            // Returns: "encounter-abc123"
```

### 3. Form Data Storage (Zustand Store)

All form data is stored per-encounter in the store:

```typescript
// Store structure
{
  soapForms: {
    "abc123": { subjective: "...", objective: "...", ... },
    "def456": { subjective: "...", objective: "...", ... }
  },
  eyeExamForms: {
    "abc123": { visualAcuityOD: "...", ... },
    "def456": { visualAcuityOD: "...", ... }
  },
  // ... all other form types
}
```

### 4. Visual Indicators

#### Sidebar Highlighting
- **Active encounter tab**: Blue background + Blue ring (`ring-2 ring-blue-500`)
- **Regular active tab**: Blue background only
- **Inactive tabs**: Gray text

```typescript
// In patient-sidebar.tsx
className={`
  ${isActive && isEncounter
    ? 'text-blue-700 bg-blue-50 ring-2 ring-blue-500 ring-opacity-50'  // Active encounter
    : isActive
    ? 'text-blue-700 bg-blue-50'                                        // Active regular tab
    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'            // Inactive
  }
`}
```

#### Contextual Actions Bar
Shows the active encounter with a prominent badge:

```
┌─────────────────────────────────────────────────────────────────┐
│ 📅 Active Encounter: Oct 30, 2024  [IN-PROGRESS]  │ Actions... │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Example

### Scenario: User opens 2 encounters and edits SOAP notes

1. **User clicks "Oct 30" encounter in sidebar**
   ```typescript
   setActiveTab("encounter-abc123")
   ```

2. **Sidebar updates**
   - "Oct 30" gets blue ring highlight
   - Shows it's the active encounter

3. **Contextual Actions Bar updates**
   - Shows: "Active Encounter: Oct 30, 2024 [IN-PROGRESS]"
   - Displays encounter-specific actions

4. **User navigates to SOAP sub-tab**
   - EncounterTab component receives: `encounterId="abc123"`
   - Form loads data from: `soapForms["abc123"]`
   - All changes save to: `soapForms["abc123"]`

5. **User switches to "Nov 5" encounter**
   ```typescript
   setActiveTab("encounter-def456")
   ```
   - Sidebar: "Nov 5" now has blue ring
   - Contextual bar: "Active Encounter: Nov 5, 2024"
   - Forms load data from: `soapForms["def456"]`
   - **Previous encounter data ("abc123") is preserved!**

6. **User switches back to "Oct 30"**
   - All previously entered SOAP data is still there
   - Each encounter maintains its own form state

## Implementation Checklist

### ✅ Sidebar (patient-sidebar.tsx)
- [x] Open encounters shown at top with header
- [x] Separator line after encounters
- [x] Active encounter has extra ring highlight
- [x] Close button on hover for each encounter
- [x] Click to activate encounter

### ✅ Contextual Actions Bar (contextual-actions-bar.tsx)
- [x] Shows active encounter badge when on encounter tab
- [x] Displays encounter date and status
- [x] Shows encounter-specific actions
- [x] Uses `getEncounterIdFromTab()` to extract ID

### ✅ Store (patient-detail-store.ts)
- [x] All forms keyed by encounter ID
- [x] Update functions: `updateSoapForm(encounterId, field, value)`
- [x] Set functions: `setSoapForm(encounterId, formData)`
- [x] Draft persistence per encounter
- [x] Validation per encounter

### ✅ Forms (All sub-tab components)
- [x] Receive `encounterId` as prop
- [x] Load data: `formData={forms[encounterId] || defaultForm}`
- [x] Update: `onFieldChange={(field, value) => updateForm(encounterId, field, value)}`
- [x] Save: `onSave={() => handleSave(encounterId, forms[encounterId])}`

## Benefits

1. **No Data Loss**: Switching between encounters preserves all form data
2. **Clear Visual Feedback**: Always know which encounter is active
3. **Scoped Actions**: Contextual menu shows relevant actions
4. **Draft Recovery**: localStorage saves per encounter
5. **Validation**: Each encounter validated independently
6. **Multiple Workflows**: Work on multiple encounters simultaneously

## Clinical Data Linking

### Critical Feature: All Clinical Data Links to Active Encounter

When adding clinical data (medications, problems, allergies, etc.), it's automatically linked to the active encounter context.

### Visual Indicators

#### 1. On Encounter Tab (Blue Badge)
```
📅 Active Encounter: Oct 30, 2024  [IN-PROGRESS]
```
- Shows when viewing an encounter directly
- Blue background color

#### 2. On Clinical Data Tabs (Amber Badge)
```
📅 Context Encounter: Oct 30  [IN-PROGRESS]  • Data will be linked to this encounter
```
- Shows when on: Allergies, Problems, Medications, Vaccines, Vitals, Lab, Imaging, Documents tabs
- Amber/orange background color
- Explicitly states data will be linked to this encounter

### How It Works

#### Store Handler Updates

All clinical data handlers now accept an optional `encounterContext` parameter:

```typescript
// Before
handleSaveVitals(vitalsData: VitalsFormData): Promise<void>

// After
handleSaveVitals(vitalsData: VitalsFormData, encounterContext?: string): Promise<void>
```

**Updated Handlers:**
- `handleSaveVitals(data, encounterContext?)` - Links Observation resources
- `handleSaveProblem(data, encounterContext?)` - Links Condition resources
- `handleSaveMedication(data, encounterContext?)` - Links MedicationRequest resources
- `handleSaveInsurance(data, encounterContext?)` - Insurance is patient-level (not encounter-linked)

#### FHIR Resource Linking

When `encounterContext` is provided, resources include encounter reference:

**Vitals (Observation):**
```json
{
  "resourceType": "Observation",
  "subject": { "reference": "Patient/123" },
  "encounter": { "reference": "Encounter/abc123" },  // <- Added!
  "code": { ... },
  "valueQuantity": { ... }
}
```

**Problems (Condition):**
```json
{
  "resourceType": "Condition",
  "subject": { "reference": "Patient/123" },
  "encounter": { "reference": "Encounter/abc123" },  // <- Added!
  "code": { ... },
  "clinicalStatus": { ... }
}
```

**Medications (MedicationRequest):**
```json
{
  "resourceType": "MedicationRequest",
  "subject": { "reference": "Patient/123" },
  "context": { "reference": "Encounter/abc123" },    // <- Added! (Note: field name is "context")
  "medicationCodeableConcept": { ... },
  "dosageInstruction": [ ... ]
}
```

### Example User Flow

**Scenario: Doctor adds medication during encounter**

1. **Doctor opens encounter "Oct 30, 2024"**
   - Active encounter ID: `abc123`
   - Sidebar shows blue ring around "Oct 30"
   - Contextual bar: "Active Encounter: Oct 30, 2024 [IN-PROGRESS]"

2. **Doctor clicks "Medications" tab**
   - Sidebar: "Oct 30" still highlighted (encounter context preserved)
   - Contextual bar changes to amber: "Context Encounter: Oct 30 [IN-PROGRESS] • Data will be linked to this encounter"
   - This makes it VERY CLEAR that any medication added will be linked to this encounter

3. **Doctor clicks "Prescribe" button**
   - Medication drawer opens
   - Doctor fills out: "Amoxicillin 500mg"
   - Clicks "Save"

4. **Behind the scenes:**
   ```typescript
   // Component calls with encounter context
   handleSaveMedication(medicationData, "abc123")

   // Store creates FHIR resource with encounter link
   {
     resourceType: "MedicationRequest",
     context: { reference: "Encounter/abc123" },
     // ... medication details
   }
   ```

5. **Result:**
   - Medication is saved to EHR
   - Medication is linked to "Oct 30" encounter
   - In future, can query: "What meds were prescribed during Oct 30 encounter?"
   - Encounter documentation shows this medication was added

### Context Encounter Logic

```typescript
// In contextual-actions-bar.tsx
const contextEncounterId = activeEncounterId || (encounters.length > 0 ? encounters[0].id : null);
```

**Rules:**
1. If viewing an encounter tab → Use that encounter as context
2. If viewing clinical data tab → Use most recent open encounter as context
3. If no encounters open → No context (data not linked to encounter)

**This means:**
- Open an encounter before adding clinical data
- All data added during that session links to that encounter
- Switch to different encounter → New data links to new encounter
- Close all encounters → Data saved without encounter link (not ideal in EHR workflow)

### Benefits

✅ **Complete Audit Trail**: Know exactly when and in which encounter each piece of data was added
✅ **Encounter Documentation**: Encounter summary shows all data added during that visit
✅ **Clinical Context**: Medications/problems/vitals tied to specific visit context
✅ **Billing/Coding**: Proper encounter linkage for billing and coding purposes
✅ **Medical-Legal**: Clear documentation of what was done during each encounter
✅ **EHR Compliance**: Meets EHR requirements for encounter-based documentation

## Future Enhancements

1. **Encounter Required Mode**: Setting to require open encounter before adding clinical data
2. **Encounter Auto-Creation**: Auto-create encounter when adding first clinical data if none exists
3. **Multi-Encounter View**: View all data from multiple encounters side-by-side
4. **Encounter Summary**: Quick view of all data added during specific encounter
5. **Encounter Templates**: Pre-populate encounter with common data sets
