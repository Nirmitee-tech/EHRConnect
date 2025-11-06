# Prescription System - Implementation Examples

## Complete Integration Examples

### 1. Patient Detail Page Integration

Update your patient detail page to include the enhanced medications tab:

```tsx
// src/app/patients/[id]/page.tsx

import { MedicationsTab } from './components/tabs/MedicationsTab';
import { MedicationService } from '@/services/medication.service';

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const [medications, setMedications] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch medications
  const fetchMedications = async () => {
    const meds = await MedicationService.getPatientMedications(params.id);
    setMedications(meds);
  };

  useEffect(() => {
    fetchMedications();
  }, [params.id]);

  return (
    <div>
      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* ... other tabs ... */}

        <TabsContent value="medications">
          <MedicationsTab
            patientId={params.id}
            medications={medications}
            onPrescribe={() => {
              // Open encounter drawer or medication drawer
              setShowMedicationDrawer(true);
            }}
            onMedicationChange={() => {
              // Refresh medications after any change
              fetchMedications();
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 2. Encounter Drawer Integration

Replace the old prescription section with the enhanced version:

```tsx
// src/components/encounters/encounter-drawer.tsx

import { PrescriptionsSectionEnhanced } from './prescriptions-section-enhanced';

export function EncounterDrawer({ encounter, onUpdate }) {
  const [prescriptions, setPrescriptions] = useState(encounter.prescriptions || []);

  const handlePrescriptionsUpdate = (updatedPrescriptions) => {
    setPrescriptions(updatedPrescriptions);

    // Update encounter
    onUpdate({
      ...encounter,
      prescriptions: updatedPrescriptions
    });
  };

  return (
    <Drawer>
      {/* ... other encounter sections ... */}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Prescriptions</h3>

        <PrescriptionsSectionEnhanced
          prescriptions={prescriptions}
          onUpdate={handlePrescriptionsUpdate}
        />
      </div>
    </Drawer>
  );
}
```

### 3. Standalone Quick Prescribe Widget

Create a quick prescribe widget for dashboards or sidebars:

```tsx
// src/components/widgets/quick-prescribe-widget.tsx

import { MedicationQuickAdd } from '@/components/patients/medication-quick-add';
import { MedicationService } from '@/services/medication.service';

interface QuickPrescribeWidgetProps {
  patientId: string;
  patientName: string;
  onSuccess?: () => void;
}

export function QuickPrescribeWidget({
  patientId,
  patientName,
  onSuccess
}: QuickPrescribeWidgetProps) {
  const handleAdd = async (prescription: Prescription) => {
    await MedicationService.createMedication(patientId, prescription);

    // Show success notification
    toast.success(`Prescribed ${prescription.medication} to ${patientName}`);

    // Callback
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center gap-2 mb-3">
        <Pill className="h-5 w-5 text-purple-600" />
        <h3 className="font-semibold">Quick Prescribe</h3>
      </div>

      <MedicationQuickAdd
        patientId={patientId}
        onAdd={handleAdd}
      />
    </div>
  );
}
```

### 4. Custom Template Management

Create a custom template manager for your organization:

```tsx
// src/components/admin/template-manager.tsx

import {
  prescriptionTemplates,
  PrescriptionTemplate
} from '@/data/prescription-templates';

export function TemplateManager() {
  const [templates, setTemplates] = useState(prescriptionTemplates);
  const [editingTemplate, setEditingTemplate] = useState<PrescriptionTemplate | null>(null);

  const handleAddTemplate = (template: PrescriptionTemplate) => {
    // Add to local storage or API
    const newTemplates = [...templates, template];
    setTemplates(newTemplates);
    localStorage.setItem('customTemplates', JSON.stringify(newTemplates));
  };

  const handleDeleteTemplate = (templateId: string) => {
    const newTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(newTemplates);
    localStorage.setItem('customTemplates', JSON.stringify(newTemplates));
  };

  return (
    <div>
      <h2>Prescription Template Manager</h2>

      {/* Template list */}
      <div className="grid grid-cols-3 gap-4">
        {templates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={setEditingTemplate}
            onDelete={handleDeleteTemplate}
          />
        ))}
      </div>

      {/* Add template button */}
      <button onClick={() => setEditingTemplate({} as PrescriptionTemplate)}>
        Add New Template
      </button>

      {/* Template editor dialog */}
      {editingTemplate && (
        <TemplateEditor
          template={editingTemplate}
          onSave={handleAddTemplate}
          onCancel={() => setEditingTemplate(null)}
        />
      )}
    </div>
  );
}
```

### 5. Medication History View

Create a complete medication history view with timeline:

```tsx
// src/components/medications/medication-history.tsx

import { MedicationService } from '@/services/medication.service';

export function MedicationHistory({ patientId }: { patientId: string }) {
  const [medications, setMedications] = useState([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'stopped'>('all');

  useEffect(() => {
    async function fetchMedications() {
      // Get all medications including stopped ones
      const allMeds = await fhirService.search('MedicationRequest', {
        subject: `Patient/${patientId}`,
        _sort: '-authored'
      });

      setMedications(allMeds.entry?.map((e: any) => e.resource) || []);
    }

    fetchMedications();
  }, [patientId]);

  const filteredMeds = medications.filter(med => {
    if (filter === 'all') return true;
    return med.status === filter;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Medication History</h2>

        {/* Filter buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'active' : ''}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={filter === 'active' ? 'active' : ''}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('stopped')}
            className={filter === 'stopped' ? 'active' : ''}
          >
            Stopped
          </button>
        </div>
      </div>

      {/* Timeline view */}
      <div className="space-y-2">
        {filteredMeds.map(med => (
          <MedicationHistoryCard
            key={med.id}
            medication={med}
          />
        ))}
      </div>
    </div>
  );
}
```

### 6. Prescription Printing/Export

Create a prescription print component:

```tsx
// src/components/prescriptions/prescription-print.tsx

import { Prescription } from '@/types/encounter';

interface PrescriptionPrintProps {
  prescriptions: Prescription[];
  patientName: string;
  doctorName: string;
  date: string;
}

export function PrescriptionPrint({
  prescriptions,
  patientName,
  doctorName,
  date
}: PrescriptionPrintProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="prescription-print">
      {/* Header */}
      <div className="print-header">
        <h1>Medical Prescription</h1>
        <div>
          <p>Patient: {patientName}</p>
          <p>Doctor: {doctorName}</p>
          <p>Date: {date}</p>
        </div>
      </div>

      {/* Prescriptions */}
      <div className="prescriptions-list">
        {prescriptions.map((rx, index) => (
          <div key={rx.id} className="prescription-item">
            <h3>{index + 1}. {getMedicationName(rx)}</h3>
            <p><strong>Dosage:</strong> {getDosageDisplay(rx)}</p>
            <p><strong>Frequency:</strong> {getFrequencyDisplay(rx)}</p>
            <p><strong>Duration:</strong> {getDurationDisplay(rx)}</p>
            {getInstructions(rx) && (
              <p><strong>Instructions:</strong> {getInstructions(rx)}</p>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="print-footer">
        <p>Doctor's Signature: _______________</p>
        <p>Date: _______________</p>
      </div>

      {/* Print button */}
      <button onClick={handlePrint} className="no-print">
        Print Prescription
      </button>

      <style jsx>{`
        @media print {
          .no-print {
            display: none;
          }
          .prescription-print {
            padding: 20mm;
          }
        }
      `}</style>
    </div>
  );
}
```

### 7. Smart Prescribing with Suggestions

Add AI/rule-based prescription suggestions:

```tsx
// src/components/prescriptions/smart-prescribe.tsx

import { PrescriptionsSectionEnhanced } from '@/components/encounters/prescriptions-section-enhanced';

export function SmartPrescribe({
  diagnosis,
  patientAllergies,
  onUpdate
}: SmartPrescribeProps) {
  const [suggestions, setSuggestions] = useState<PrescriptionTemplate[]>([]);

  useEffect(() => {
    // Get prescription suggestions based on diagnosis
    const suggested = getSuggestedPrescriptions(diagnosis, patientAllergies);
    setSuggestions(suggested);
  }, [diagnosis, patientAllergies]);

  return (
    <div>
      {/* Suggestions banner */}
      {suggestions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <h4 className="font-semibold text-blue-900 mb-2">
            Suggested Prescriptions for {diagnosis}
          </h4>
          <div className="flex flex-wrap gap-2">
            {suggestions.map(suggestion => (
              <button
                key={suggestion.id}
                onClick={() => {
                  // Auto-add suggested prescription
                  const prescription = {
                    id: `prescription-${Date.now()}`,
                    ...suggestion.prescription,
                    authoredOn: new Date().toISOString()
                  };
                  onUpdate([prescription]);
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                + {suggestion.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Regular prescription section */}
      <PrescriptionsSectionEnhanced
        prescriptions={[]}
        onUpdate={onUpdate}
      />
    </div>
  );
}

// Suggestion logic
function getSuggestedPrescriptions(
  diagnosis: string,
  allergies: string[]
): PrescriptionTemplate[] {
  const rules: Record<string, string[]> = {
    'Hypertension': ['amlodipine-5'],
    'Type 2 Diabetes': ['metformin-500'],
    'Bacterial Infection': ['amoxicillin-500', 'azithromycin-500'],
    'Pain': ['ibuprofen-400', 'paracetamol-500'],
    'GERD': ['omeprazole-20'],
    'Allergic Rhinitis': ['cetirizine-10'],
    'Asthma': ['salbutamol-inhaler']
  };

  const templateIds = rules[diagnosis] || [];

  return prescriptionTemplates.filter(template => {
    // Check if template is in suggestions
    if (!templateIds.includes(template.id)) return false;

    // Check for allergies
    const medName = template.name.toLowerCase();
    return !allergies.some(allergy =>
      medName.includes(allergy.toLowerCase())
    );
  });
}
```

### 8. Medication Adherence Tracker

Create a medication adherence tracking component:

```tsx
// src/components/medications/adherence-tracker.tsx

interface AdherenceTrackerProps {
  patientId: string;
  medications: Prescription[];
}

export function AdherenceTracker({
  patientId,
  medications
}: AdherenceTrackerProps) {
  const [adherenceData, setAdherenceData] = useState<Record<string, number>>({});

  useEffect(() => {
    // Fetch adherence data from patient portal or tracking system
    async function fetchAdherence() {
      const data = await fetch(`/api/adherence/${patientId}`).then(r => r.json());
      setAdherenceData(data);
    }
    fetchAdherence();
  }, [patientId]);

  return (
    <div>
      <h3>Medication Adherence</h3>

      <div className="space-y-3">
        {medications.map(med => {
          const adherenceRate = adherenceData[med.id] || 0;
          const color = adherenceRate >= 80 ? 'green' : adherenceRate >= 50 ? 'yellow' : 'red';

          return (
            <div key={med.id} className="border rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">{getMedicationName(med)}</h4>
                <span className={`text-${color}-600 font-bold`}>
                  {adherenceRate}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`bg-${color}-500 h-2 rounded-full`}
                  style={{ width: `${adherenceRate}%` }}
                />
              </div>

              <p className="text-xs text-gray-600 mt-1">
                {getFrequencyDisplay(med)} - {getDurationDisplay(med)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

## API Integration Examples

### Create Medication with FHIR

```typescript
import { MedicationService } from '@/services/medication.service';

// Simple creation
const prescription: Prescription = {
  id: `prescription-${Date.now()}`,
  resourceType: 'MedicationRequest',
  status: 'active',
  intent: 'order',
  medication: 'Amoxicillin 500mg',
  medicationCodeableConcept: { text: 'Amoxicillin 500mg' },
  dosage: '1 capsule',
  frequency: 'Three times daily',
  duration: '7 days',
  instructions: 'Complete full course',
  authoredOn: new Date().toISOString()
};

await MedicationService.createMedication(patientId, prescription);
```

### Bulk Prescription Operations

```typescript
// Add multiple prescriptions at once
async function bulkPrescribe(
  patientId: string,
  prescriptions: Prescription[]
) {
  const promises = prescriptions.map(rx =>
    MedicationService.createMedication(patientId, rx)
  );

  const results = await Promise.allSettled(promises);

  const succeeded = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  console.log(`Successfully created ${succeeded} prescriptions`);
  if (failed > 0) {
    console.error(`Failed to create ${failed} prescriptions`);
  }
}
```

### Medication Reconciliation

```typescript
// Compare medications across different encounters
async function reconcileMedications(
  patientId: string,
  currentEncounterId: string
) {
  // Get all patient medications
  const allMeds = await MedicationService.getPatientMedications(patientId);

  // Get medications from current encounter
  const encounterMeds = await MedicationService.getEncounterMedications(currentEncounterId);

  // Find discrepancies
  const encounterMedNames = new Set(
    encounterMeds.map(m => m.medicationCodeableConcept?.text)
  );

  const missingMeds = allMeds.filter(
    m => !encounterMedNames.has(m.medicationCodeableConcept?.text)
  );

  return {
    allMedications: allMeds.length,
    encounterMedications: encounterMeds.length,
    missingFromEncounter: missingMeds
  };
}
```

## Testing Examples

### Unit Test Example

```typescript
// tests/medication-service.test.ts

import { MedicationService } from '@/services/medication.service';

describe('MedicationService', () => {
  it('should create a medication request', async () => {
    const prescription: Prescription = {
      id: 'test-1',
      medication: 'Test Med 100mg',
      dosage: '1 tablet',
      frequency: 'Once daily',
      duration: '30 days'
    };

    const result = await MedicationService.createMedication('patient-1', prescription);

    expect(result.resourceType).toBe('MedicationRequest');
    expect(result.status).toBe('active');
  });

  it('should convert FHIR to prescription format', () => {
    const fhirMed = {
      resourceType: 'MedicationRequest',
      status: 'active',
      medicationCodeableConcept: { text: 'Aspirin 81mg' }
    };

    const prescription = MedicationService.convertFHIRToPrescription(fhirMed);

    expect(prescription.medication).toBe('Aspirin 81mg');
  });
});
```

### Integration Test Example

```typescript
// tests/prescription-workflow.test.tsx

import { render, fireEvent, waitFor } from '@testing-library/react';
import { MedicationsTab } from '@/app/patients/[id]/components/tabs/MedicationsTab';

describe('Prescription Workflow', () => {
  it('should quick add a medication', async () => {
    const onMedicationChange = jest.fn();

    const { getByText, getByPlaceholderText } = render(
      <MedicationsTab
        patientId="patient-1"
        medications={[]}
        onPrescribe={jest.fn()}
        onMedicationChange={onMedicationChange}
      />
    );

    // Click Quick Add
    fireEvent.click(getByText('Quick Add'));

    // Fill form
    fireEvent.change(getByPlaceholderText('e.g., Amoxicillin 500mg'), {
      target: { value: 'Ibuprofen 400mg' }
    });

    // Save
    fireEvent.click(getByText('Save'));

    await waitFor(() => {
      expect(onMedicationChange).toHaveBeenCalled();
    });
  });
});
```

## Deployment Checklist

- [ ] Install dependencies
- [ ] Import prescription templates
- [ ] Update MedicationsTab props
- [ ] Test Quick Add functionality
- [ ] Test Template selection
- [ ] Test Edit operations
- [ ] Test Delete operations
- [ ] Verify FHIR sync
- [ ] Test on mobile devices
- [ ] Performance testing
- [ ] User acceptance testing
- [ ] Documentation reviewed
- [ ] Training materials prepared

## Support

For implementation help:
1. Review `PRESCRIPTION_SYSTEM_GUIDE.md`
2. Check `PRESCRIPTION_ENHANCEMENT_SUMMARY.md`
3. Examine component source code
4. Test with provided examples
