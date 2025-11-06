# How to Integrate the 4 Prescription UIs

## ✅ What I Created

**2 integrated components** that contain all 4 UIs with easy mode switching:

1. **PrescriptionsIntegrated** - For encounters
2. **MedicationsTabIntegrated** - For patient medications tab

Each component has a **mode switcher** at the top to switch between the 4 UIs.

---

## 🎯 1. For Encounters (Prescription Section)

### Replace your current prescription component with:

```tsx
import { PrescriptionsIntegrated } from '@/components/prescriptions/prescriptions-integrated';

// In your encounter drawer/form
<PrescriptionsIntegrated
  prescriptions={encounter.prescriptions || []}
  onUpdate={(prescriptions) => {
    setEncounter({ ...encounter, prescriptions });
  }}
  defaultMode="cards"  // optional: 'inline' | 'cards' | 'quick' | 'detailed'
/>
```

### What you get:
```
┌──────────────────────────────────────────────────────────┐
│ Prescriptions (2)  [⚡Inline][📋Cards][⚡Quick][📄Detailed]│
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [Content changes based on selected mode]               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**4 mode buttons at top:**
- ⚡ **Inline** - Single row form (5s)
- 📋 **Cards** - Stacked cards (10-15s) - DEFAULT
- ⚡ **Quick** - One-click templates (2-5s)
- 📄 **Detailed** - Full form (30-60s)

---

## 🎯 2. For Patient Detail Page (Medications Tab)

### Replace your current MedicationsTab with:

```tsx
import { MedicationsTabIntegrated } from '@/components/patients/medications-tab-integrated';

// In your patient detail page
<MedicationsTabIntegrated
  patientId={patientId}
  medications={medications}
  onMedicationChange={() => {
    // Refresh medications
    fetchMedications();
  }}
/>
```

### What you get:
```
┌──────────────────────────────────────────────────────────┐
│ 💊 Active Medications [3]  [Quick][Template][Detailed]   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [Medication cards with edit/delete/duplicate]           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**3 add buttons at top:**
- ⚡ **Quick** - Single row form (5s)
- 🎯 **Template** - One-click common meds (2-5s)
- 📄 **Detailed** - Full form (30-60s)

Plus: **Edit, Delete, Duplicate** on each medication card

---

## 📁 File Locations

### Core Components (4 UIs):
```
/components/prescriptions/
  ├── prescription-inline-simple.tsx       (UI 1)
  ├── prescription-compact-cards.tsx       (UI 2)
  ├── prescription-quick-select.tsx        (UI 3)
  └── prescription-detailed-form.tsx       (UI 4)
```

### Integrated Components (Use These):
```
/components/prescriptions/
  └── prescriptions-integrated.tsx         (For encounters)

/components/patients/
  └── medications-tab-integrated.tsx       (For medications tab)
```

---

## 🚀 Quick Start

### Step 1: For Encounters

**Before:**
```tsx
<PrescriptionsSectionEnhanced
  prescriptions={encounter.prescriptions}
  onUpdate={handleUpdate}
/>
```

**After:**
```tsx
<PrescriptionsIntegrated
  prescriptions={encounter.prescriptions}
  onUpdate={handleUpdate}
/>
```

### Step 2: For Medications Tab

**Before:**
```tsx
<MedicationsTab
  patientId={patientId}
  medications={medications}
  onPrescribe={() => openDrawer()}
  onMedicationChange={refresh}
/>
```

**After:**
```tsx
<MedicationsTabIntegrated
  patientId={patientId}
  medications={medications}
  onMedicationChange={refresh}
/>
```

**That's it!** ✅

---

## 💡 Features You Get

### In Encounters (PrescriptionsIntegrated):
✅ Mode switcher (4 modes)
✅ All 4 UIs in one component
✅ Prescription list display
✅ Delete prescriptions
✅ Duplicate prescriptions
✅ Counts badge

### In Medications Tab (MedicationsTabIntegrated):
✅ 3 add modes (Quick/Template/Detailed)
✅ Edit medications inline
✅ Delete medications
✅ Duplicate medications
✅ Status badges (Active/Stopped)
✅ FHIR sync

---

## 🎨 Mode Details

### Mode 1: Inline (⚡ 5 seconds)
- Single row: `[Medication] [Dose] [Frequency] [Add]`
- Best for: Quick single additions
- Shows: Simple list after adding

### Mode 2: Cards (📋 10-15 seconds)
- Click "+ Add" → Fill form → See stacked cards
- Best for: Multiple prescriptions, encounters
- Shows: Cards with all details

### Mode 3: Quick/Template (⚡ 2-5 seconds)
- Big buttons with 6 common meds
- One-click prescribing
- Best for: Common meds, busy clinics
- Shows: Added list below

### Mode 4: Detailed (📄 30-60 seconds)
- Full FHIR form with all fields
- Best for: Complex prescriptions
- Shows: Detailed cards after adding

---

## 📊 Visual Comparison

### Encounters Component:
```
┌─────────────────────────────────────────────┐
│ Prescriptions (2)                           │
│ [⚡Inline] [📋Cards] [⚡Quick] [📄Detailed]  │
├─────────────────────────────────────────────┤
│                                             │
│ Click mode button → UI changes completely   │
│                                             │
│ - Inline: Shows simple row form             │
│ - Cards: Shows card form + cards            │
│ - Quick: Shows 6 medication buttons         │
│ - Detailed: Shows full form                 │
│                                             │
└─────────────────────────────────────────────┘
```

### Medications Tab:
```
┌─────────────────────────────────────────────┐
│ 💊 Active Medications [3]                   │
│               [Quick] [Template] [Detailed] │
├─────────────────────────────────────────────┤
│                                             │
│ Click button → Add form appears             │
│                                             │
│ Below: Medication cards with:               │
│ [📋 Duplicate] [✏️ Edit] [🗑️ Delete]        │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🔧 Customization

### Set Default Mode:
```tsx
// For encounters - default to quick select
<PrescriptionsIntegrated
  prescriptions={prescriptions}
  onUpdate={handleUpdate}
  defaultMode="quick"  // 'inline' | 'cards' | 'quick' | 'detailed'
/>
```

### User Preference:
```tsx
const userMode = getUserPreference('prescriptionMode');

<PrescriptionsIntegrated
  defaultMode={userMode}
  ...
/>
```

---

## ✅ Migration Checklist

### For Encounters:
- [ ] Import `PrescriptionsIntegrated`
- [ ] Replace old component
- [ ] Test all 4 modes
- [ ] Verify prescriptions save

### For Medications Tab:
- [ ] Import `MedicationsTabIntegrated`
- [ ] Replace old component
- [ ] Test add/edit/delete
- [ ] Verify FHIR sync

---

## 🎯 Real World Usage

### Scenario 1: Routine Visit
1. Doctor opens encounter
2. Clicks "Quick" mode
3. Clicks "Ibuprofen 400mg" button
4. Done in 3 seconds ✓

### Scenario 2: Complex Case
1. Doctor opens encounter
2. Clicks "Detailed" mode
3. Fills complete form with all fields
4. Saves prescription with full documentation ✓

### Scenario 3: Med Reconciliation
1. Doctor opens patient's medications tab
2. Clicks "Quick" button
3. Types each medication in inline form
4. Adds 5 medications in 30 seconds ✓

---

## 🐛 Troubleshooting

**Mode switcher not showing?**
- Check component import
- Verify prescriptions prop is passed

**Prescriptions not saving?**
- Check `onUpdate` callback
- Verify `onMedicationChange` is called
- Check MedicationService connection

**UI looks broken?**
- Ensure Tailwind CSS is configured
- Check icon imports (lucide-react)
- Verify all sub-components are imported

---

## 📚 Documentation

- `PRESCRIPTION_SIMPLE_GUIDE.md` - Quick overview of 4 UIs
- `PRESCRIPTION_UI_VARIATIONS.md` - Detailed guide for each UI
- `/demo/prescriptions` - Live demo page

---

## ✨ Summary

**2 Components to Use:**
1. `PrescriptionsIntegrated` - For encounters (4 modes)
2. `MedicationsTabIntegrated` - For medications tab (3 modes + edit)

**Benefits:**
- ✅ All 4 UIs in one component
- ✅ Easy mode switching
- ✅ No complex state management
- ✅ Works with FHIR
- ✅ Edit/delete/duplicate built-in
- ✅ Clean, simple integration

**Just import and use!**
