# Inline Prescription Form - Usage Guide

## Overview
The new inline prescription form (`prescriptions-section-inline.tsx`) provides a compact, single-screen UI for adding medications similar to the traditional EMR systems.

## Features

### 1. **Inline Form Layout**
- Form and drug search side-by-side
- No side drawers or modals
- Quick data entry workflow

### 2. **FHIR MedicationRequest Compatible**
- All prescriptions saved as proper FHIR resources
- Automatic conversion from form data to FHIR structure
- Status tracking and dosage instructions

### 3. **Drug Search**
- Searchable drug dropdown
- Common medications pre-populated
- Quick selection with one click

### 4. **Timing Controls**
- Morning/Afternoon/Night checkboxes
- Individual dosage counts per timing
- Frequency automatically calculated (e.g., 1-1-1 = 3x per day)

### 5. **Instruction Options**
- Radio buttons for "Before Food", "After Food", "With Food"
- Custom instruction text area
- Automatically stored in FHIR dosageInstruction

## Usage

### In Encounter Forms

Replace the old `PrescriptionsSection` with `PrescriptionsSectionInline`:

```tsx
import { PrescriptionsSectionInline } from '@/components/encounters/prescriptions-section-inline';

// In your component
<PrescriptionsSectionInline
  prescriptions={encounterData.prescriptions || []}
  onUpdate={(prescriptions) => {
    setEncounterData(prev => ({
      ...prev,
      prescriptions
    }));
  }}
/>
```

### In Drawers or Modals

```tsx
import { PrescriptionsSectionInline } from '@/components/encounters/prescriptions-section-inline';

<Drawer open={open} onOpenChange={setOpen}>
  <DrawerContent>
    <PrescriptionsSectionInline
      prescriptions={prescriptions}
      onUpdate={handleUpdatePrescriptions}
    />
  </DrawerContent>
</Drawer>
```

## Data Format

### Form Data Structure
```typescript
{
  medication: string;          // Drug name
  dosage: string;             // Numeric value
  dosageUnit: string;         // mg, g, ml, mcg, units
  morning: string;            // Count for morning dose
  afternoon: string;          // Count for afternoon dose
  night: string;              // Count for night dose
  duration: string;           // Duration value
  durationUnit: string;       // day(s), week(s), month(s)
  instructions: string;       // Custom instructions
  instructionType: 'before' | 'after' | 'with'; // Food timing
}
```

### FHIR Output Structure
```typescript
{
  id: string;
  resourceType: 'MedicationRequest';
  status: 'active';
  intent: 'order';
  medicationCodeableConcept: {
    text: string;
  };
  dosageInstruction: [{
    text: string;
    timing: {
      repeat: {
        frequency: number;      // Sum of morning+afternoon+night
        period: 1;
        periodUnit: 'd';
        duration: number;
        durationUnit: 'h' | 'd' | 'wk' | 'mo';
      }
    };
    doseAndRate: [{
      doseQuantity: {
        value: number;
        unit: string;
        system: 'http://unitsofmeasure.org';
      }
    }]
  }];
  // Legacy format for easy display
  dosage: string;              // "50 mg"
  frequency: string;           // "1-1-1"
  duration: string;            // "7 day(s)"
  instructions: string;        // "Take after food"
}
```

## Customization

### Adding More Drugs
Edit the `commonDrugs` array in the component:

```typescript
const commonDrugs = [
  'Paracetamol 500mg',
  'Ibuprofen 400mg',
  // Add more...
];
```

### Styling
The component uses Tailwind CSS classes. Key colors:
- Purple theme for prescription UI (`purple-600`, `purple-50`)
- Amber for instructions (`amber-50`, `amber-700`)
- Standard grays for form elements

### Validation
Current validation:
- Medication name is required
- Dosage is required

Add more validation in `handleAddPrescription()` function.

## Comparison: Inline vs Side Drawer

### Inline Form (New)
✓ All controls visible at once
✓ Faster data entry
✓ No context switching
✓ Similar to traditional EMR systems
✓ Better for multiple prescriptions

### Side Drawer (Old)
✓ Saves screen space
✓ Modal focus on one task
✓ Better for simple forms
✗ Requires opening/closing
✗ Context switching

## Migration Path

Both components can coexist:
1. Use `PrescriptionsSectionInline` for encounter forms (main use case)
2. Use `PrescriptionsSection` for simple medication lists
3. Use `MedicationDrawer` for patient detail medication tab

## Complete Example

```tsx
'use client';

import { useState } from 'react';
import { PrescriptionsSectionInline } from '@/components/encounters/prescriptions-section-inline';
import { Encounter } from '@/types/encounter';

export function EncounterPrescriptions() {
  const [encounterData, setEncounterData] = useState<Encounter>({
    prescriptions: []
  });

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Prescriptions</h2>

      <PrescriptionsSectionInline
        prescriptions={encounterData.prescriptions}
        onUpdate={(prescriptions) => {
          setEncounterData(prev => ({
            ...prev,
            prescriptions
          }));
        }}
      />
    </div>
  );
}
```

## File Locations

- **Component**: `/src/components/encounters/prescriptions-section-inline.tsx`
- **Type Definitions**: `/src/types/encounter.ts` (Prescription interface)
- **Usage Guide**: `/PRESCRIPTION_INLINE_USAGE.md` (this file)
