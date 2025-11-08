# Enhanced Prescription System Guide

## Overview

The enhanced prescription system provides a comprehensive FHIR-compliant medication management solution with multiple input modes, templates, and seamless integration between encounters and patient medications.

## Features

### 1. Multiple Add Modes

#### Quick Add Mode
- **Fast prescription entry** with minimal fields
- Fields: Medication name (required), Dosage, Frequency, Duration
- Perfect for routine prescriptions
- Accessible from both encounters and patient medications tab

#### Standard Mode
- **Complete prescription form** with all fields
- Includes: Medication, Dosage, Frequency, Duration, Instructions
- Validation and error handling
- Suitable for complex prescriptions

#### Template Mode
- **Pre-filled prescription templates** for common medications
- Categories: Pain Relief, Antibiotics, Cardiovascular, Diabetes, Respiratory, Gastrointestinal, Allergies, Vitamins
- Searchable and filterable
- One-click prescription with pre-filled dosages, frequencies, and instructions

### 2. View Modes

#### Compact View
- Single-line display of prescription info
- Shows: Medication name, Status, Dose, Frequency, Duration
- Instructions displayed in highlighted box
- Perfect for encounters and lists

#### Detailed View
- Expanded card layout
- Grid display of all prescription details
- Better for reviewing complete information
- Includes prescription number badge

### 3. FHIR Compliance

All prescriptions are stored as FHIR `MedicationRequest` resources with:
- `resourceType`: MedicationRequest
- `status`: active | stopped | completed | draft
- `intent`: order | proposal | plan
- `medicationCodeableConcept`: Medication information
- `dosageInstruction`: Structured dosage with timing and dose information
- `subject`: Patient reference
- `authoredOn`: Timestamp
- `encounter`: Optional encounter reference

### 4. Operations Supported

- **Create**: Add new prescriptions
- **Read**: View prescriptions in compact/detailed mode
- **Update**: Edit existing prescriptions
- **Delete**: Stop/cancel prescriptions (marks as 'stopped' in FHIR)
- **Duplicate**: Copy existing prescription with new timestamp

## Components

### PrescriptionsSectionEnhanced
Location: `/components/encounters/prescriptions-section-enhanced.tsx`

Enhanced prescription manager for encounters with:
- 3 add modes (Quick, Standard, Template)
- 2 view modes (Compact, Detailed)
- Edit and delete functionality
- Template browser with search and category filter
- Duplicate prescription feature

```tsx
import { PrescriptionsSectionEnhanced } from '@/components/encounters/prescriptions-section-enhanced';

<PrescriptionsSectionEnhanced
  prescriptions={encounter.prescriptions}
  onUpdate={(updatedPrescriptions) => {
    // Handle prescription updates
  }}
/>
```

### MedicationQuickAdd
Location: `/components/patients/medication-quick-add.tsx`

Inline quick add component for patient medication tab:
- Quick mode for fast entry
- Template mode for selecting from library
- Compact UI suitable for sidebars
- Async save with loading states

```tsx
import { MedicationQuickAdd } from '@/components/patients/medication-quick-add';

<MedicationQuickAdd
  patientId={patientId}
  onAdd={async (prescription) => {
    await MedicationService.createMedication(patientId, prescription);
    // Refresh medication list
  }}
/>
```

### MedicationsTab (Enhanced)
Location: `/app/patients/[id]/components/tabs/MedicationsTab.tsx`

Enhanced medications tab with:
- Quick Add button for inline prescribing
- Full Form button for encounter drawer
- Edit medication inline
- Delete (stop) medication
- Duplicate medication
- FHIR MedicationRequest integration

```tsx
<MedicationsTab
  patientId={patientId}
  medications={medications}
  onPrescribe={() => {
    // Open encounter drawer or full form
  }}
  onMedicationChange={() => {
    // Refresh medication list
  }}
/>
```

## Services

### MedicationService
Location: `/services/medication.service.ts`

FHIR MedicationRequest operations:

```typescript
// Create medication
await MedicationService.createMedication(patientId, prescription);

// Update medication
await MedicationService.updateMedication(medicationId, prescription);

// Delete (stop) medication
await MedicationService.deleteMedication(medicationId);

// Get patient medications
const meds = await MedicationService.getPatientMedications(patientId);

// Get encounter medications
const encounterMeds = await MedicationService.getEncounterMedications(encounterId);

// Convert FHIR to internal format
const prescription = MedicationService.convertFHIRToPrescription(fhirMed);
```

## Data

### Prescription Templates
Location: `/data/prescription-templates.ts`

Pre-configured prescription templates:

```typescript
import { prescriptionTemplates, prescriptionCategories } from '@/data/prescription-templates';

// Get all templates
const templates = prescriptionTemplates;

// Get templates by category
const antibiotics = prescriptionTemplates.filter(t => t.category === 'Antibiotics');

// Get all categories
const categories = prescriptionCategories;
```

**Available Categories:**
- Pain Relief (Ibuprofen, Paracetamol)
- Antibiotics (Amoxicillin, Azithromycin)
- Cardiovascular (Amlodipine)
- Diabetes (Metformin)
- Respiratory (Salbutamol Inhaler)
- Gastrointestinal (Omeprazole)
- Allergies (Cetirizine)
- Vitamins (Vitamin D3, Calcium)

## Integration

### Encounter to Medications

Prescriptions added in encounters can be:
1. Saved as part of encounter data
2. Automatically created as FHIR MedicationRequest resources
3. Displayed in patient's Medications tab
4. Linked to the encounter via `encounter` reference

### Patient Medications to Encounter

Medications can be:
1. Added directly via Quick Add in Medications tab
2. Viewed and edited in place
3. Duplicated for refills
4. Stopped/cancelled when no longer needed

## UI/UX Features

### Quick Add Flow
1. Click "Quick Add" button
2. Enter medication name (required)
3. Optionally add dosage, frequency, duration
4. Click "Save"
5. Prescription created immediately

### Template Flow
1. Click "Template" button
2. Search or filter by category
3. Click desired template
4. Template auto-fills form (switches to Standard mode)
5. Modify if needed
6. Click "Save"

### Edit Flow
1. Click Edit icon on prescription card
2. Fields populate with current values
3. Modify as needed
4. Click "Save" to update
5. Changes sync to FHIR server

### Delete Flow
1. Click Delete icon
2. Confirm deletion
3. Prescription status set to 'stopped'
4. Removed from active medication list

## Best Practices

1. **Use Quick Add** for routine, simple prescriptions
2. **Use Templates** for commonly prescribed medications
3. **Use Standard Mode** for complex prescriptions requiring detailed instructions
4. **Always include instructions** for patient clarity
5. **Link prescriptions to encounters** when prescribed during a visit
6. **Use duplicate feature** for medication refills
7. **Stop medications** rather than deleting to maintain history
8. **Review patient allergies** before prescribing

## Customization

### Adding New Templates

Edit `/data/prescription-templates.ts`:

```typescript
{
  id: 'unique-id',
  name: 'Medication Name',
  category: 'Category Name',
  description: 'Brief description',
  prescription: {
    resourceType: 'MedicationRequest',
    status: 'active',
    intent: 'order',
    medicationCodeableConcept: { text: 'Medication Name' },
    medication: 'Medication Name',
    dosage: '1 tablet',
    frequency: 'Once daily',
    duration: '30 days',
    instructions: 'Take with food'
  }
}
```

### Adding New Categories

Add to `prescriptionCategories` array in `/data/prescription-templates.ts`.

### Customizing Frequency Options

Edit the `frequencyOptions` array in components:

```typescript
const frequencyOptions = [
  'Once daily',
  'Twice daily',
  // Add more options...
];
```

## Future Enhancements

- Drug interaction checking
- Allergy alerts
- Prescription printing/PDF generation
- Electronic prescribing (e-Rx)
- Medication adherence tracking
- Refill management
- Prior authorization workflow
- Formulary integration
- Dosage calculators
- Medication reconciliation tools

## Troubleshooting

### Prescriptions not appearing in Medications tab
- Ensure `subject.reference` is set to correct Patient ID
- Check FHIR server connectivity
- Verify status is 'active'

### Template not loading
- Check template ID is unique
- Verify prescription object structure
- Ensure category exists in prescriptionCategories

### Edit not saving
- Verify medication ID exists in FHIR server
- Check network connectivity
- Review console for errors

## Support

For issues or questions:
1. Check console logs for errors
2. Verify FHIR server connectivity
3. Review component props
4. Check medication service responses
