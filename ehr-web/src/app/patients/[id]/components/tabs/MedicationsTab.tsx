import React, { memo, useState } from 'react';
import { Plus, Pill, Calendar, Edit2, Trash2, Copy, Save, X } from 'lucide-react';
import { Button, Badge } from '@nirmitee.io/design-system';
import { MedicationService } from '@/services/medication.service';
import { Prescription } from '@/types/encounter';
import { MedicationQuickAdd } from '@/components/patients/medication-quick-add';

interface MedicationsTabProps {
  patientId: string;
  medications: any[];
  onPrescribe: () => void;
  onMedicationChange?: () => void;
}

// Helper to extract medication name from FHIR resource
const getMedicationName = (med: any): string => {
  return (
    med.medicationCodeableConcept?.text ||
    med.medicationCodeableConcept?.coding?.[0]?.display ||
    med.medication ||
    'Unknown medication'
  );
};

// Helper to format dosage from FHIR resource
const formatDosage = (med: any): string => {
  const dosageInstruction = med.dosageInstruction?.[0];
  if (!dosageInstruction) {
    return med.dosage || '-';
  }

  const doseQuantity = dosageInstruction.doseAndRate?.[0]?.doseQuantity;
  if (doseQuantity) {
    return `${doseQuantity.value || ''} ${doseQuantity.unit || ''}`.trim();
  }

  return '-';
};

// Helper to format frequency from FHIR resource
const formatFrequency = (med: any): string => {
  const dosageInstruction = med.dosageInstruction?.[0];
  if (!dosageInstruction?.timing?.repeat) {
    return med.frequency || '-';
  }

  const { frequency, period, periodUnit } = dosageInstruction.timing.repeat;

  if (frequency && period) {
    const unitMap: Record<string, string> = {
      h: 'hour',
      d: 'day',
      wk: 'week',
      mo: 'month'
    };
    const unit = unitMap[periodUnit] || periodUnit;
    return `${frequency}x per ${period} ${unit}${period > 1 ? 's' : ''}`;
  }

  return '-';
};

// Helper to format route from FHIR resource
const formatRoute = (med: any): string => {
  return (
    med.dosageInstruction?.[0]?.route?.coding?.[0]?.display ||
    '-'
  );
};

// Helper to format instructions from FHIR resource
const formatInstructions = (med: any): string => {
  return (
    med.dosageInstruction?.[0]?.text ||
    med.instructions ||
    ''
  );
};

export const MedicationsTab = memo(function MedicationsTab({
  patientId,
  medications,
  onPrescribe,
  onMedicationChange
}: MedicationsTabProps) {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [editingMed, setEditingMed] = useState<any | null>(null);
  const [editDosage, setEditDosage] = useState('');
  const [editFrequency, setEditFrequency] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const frequencyOptions = [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'Four times daily',
    'Every 4 hours',
    'Every 6 hours',
    'Every 8 hours',
    'As needed',
    'Before meals',
    'After meals',
    'At bedtime'
  ];

  const handleEdit = (med: any) => {
    setEditingMed(med);
    setEditDosage(formatDosage(med));
    setEditFrequency(formatFrequency(med));
    setEditDuration(med.duration || '');
    setEditInstructions(formatInstructions(med));
  };

  const handleSaveEdit = async () => {
    if (!editingMed) return;

    const prescription: Prescription = {
      id: editingMed.id,
      resourceType: 'MedicationRequest',
      status: editingMed.status,
      intent: editingMed.intent,
      medicationCodeableConcept: editingMed.medicationCodeableConcept,
      medication: getMedicationName(editingMed),
      dosage: editDosage,
      frequency: editFrequency,
      duration: editDuration,
      instructions: editInstructions,
      authoredOn: editingMed.authoredOn
    };

    setIsLoading(true);
    try {
      await MedicationService.updateMedication(editingMed.id, prescription);
      setEditingMed(null);
      if (onMedicationChange) {
        onMedicationChange();
      }
    } catch (error) {
      console.error('Error updating medication:', error);
      alert('Failed to update medication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingMed(null);
  };

  const handleDelete = async (med: any) => {
    if (!confirm(`Stop prescribing ${getMedicationName(med)}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await MedicationService.deleteMedication(med.id);
      if (onMedicationChange) {
        onMedicationChange();
      }
    } catch (error) {
      console.error('Error deleting medication:', error);
      alert('Failed to stop medication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicate = async (med: any) => {
    const prescription: Prescription = {
      id: `prescription-${Date.now()}`,
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: med.medicationCodeableConcept,
      medication: getMedicationName(med),
      dosage: formatDosage(med),
      frequency: formatFrequency(med),
      duration: med.duration,
      instructions: formatInstructions(med),
      authoredOn: new Date().toISOString()
    };

    setIsLoading(true);
    try {
      await MedicationService.createMedication(patientId, prescription);
      if (onMedicationChange) {
        onMedicationChange();
      }
    } catch (error) {
      console.error('Error duplicating medication:', error);
      alert('Failed to duplicate medication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdd = async (prescription: Prescription) => {
    await MedicationService.createMedication(patientId, prescription);
    setShowQuickAdd(false);
    if (onMedicationChange) {
      onMedicationChange();
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Pill className="h-5 w-5 text-purple-600" />
          <h3 className="text-base font-semibold text-gray-900">Active Medications</h3>
          <Badge className="bg-purple-100 text-purple-800 text-xs">
            {medications.length}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="border-green-600 text-green-700 hover:bg-green-50"
          >
            <Plus className="h-4 w-4 mr-1" />
            Quick Add
          </Button>
          <Button size="sm" className="bg-primary" onClick={onPrescribe}>
            <Plus className="h-4 w-4 mr-1" />
            Full Form
          </Button>
        </div>
      </div>

      {/* Quick Add Component */}
      {showQuickAdd && (
        <MedicationQuickAdd
          patientId={patientId}
          onAdd={handleQuickAdd}
        />
      )}

      {/* Medication Cards */}
      <div className="space-y-2">
        {medications.map((med: any) => {
          const instructions = formatInstructions(med);
          const isEditing = editingMed?.id === med.id;

          if (isEditing) {
            return (
              <div
                key={med.id}
                className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-blue-600" />
                  <h4 className="text-sm font-bold text-blue-900">
                    Editing: {getMedicationName(med)}
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Dosage</label>
                    <input
                      type="text"
                      value={editDosage}
                      onChange={(e) => setEditDosage(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 1 tablet"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
                    <select
                      value={editFrequency}
                      onChange={(e) => setEditFrequency(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    >
                      <option value="">Select...</option>
                      {frequencyOptions.map(freq => (
                        <option key={freq} value={freq}>{freq}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
                    <input
                      type="text"
                      value={editDuration}
                      onChange={(e) => setEditDuration(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 7 days"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Instructions</label>
                    <input
                      type="text"
                      value={editInstructions}
                      onChange={(e) => setEditInstructions(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Take with food"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleSaveEdit}
                    disabled={isLoading}
                    className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 flex items-center gap-1 disabled:opacity-50"
                  >
                    <Save className="h-3 w-3" />
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                    className="px-3 py-1.5 bg-gray-400 text-white rounded text-xs hover:bg-gray-500 flex items-center gap-1 disabled:opacity-50"
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={med.id}
              className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-gray-900 truncate">
                      {getMedicationName(med)}
                    </h4>
                    <Badge className={`text-xs shrink-0 ${
                      med.status === 'active'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : med.status === 'stopped'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}>
                      {med.status || 'active'}
                    </Badge>
                  </div>

                  {/* Compact dosage info in a single line */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mb-1">
                    <span className="flex items-center gap-1">
                      <span className="font-medium text-gray-700">Dose:</span>
                      {formatDosage(med)}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-medium text-gray-700">Frequency:</span>
                      {formatFrequency(med)}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-medium text-gray-700">Route:</span>
                      {formatRoute(med)}
                    </span>
                  </div>

                  {/* Instructions if present */}
                  {instructions && (
                    <div className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 mt-1">
                      {instructions}
                    </div>
                  )}
                </div>

                {/* Actions and Date */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Date */}
                  {med.authoredOn && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(med.authoredOn).toLocaleDateString()}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicate(med)}
                      disabled={isLoading}
                      className="p-1 text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:opacity-50"
                      title="Duplicate"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleEdit(med)}
                      disabled={isLoading}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(med)}
                      disabled={isLoading}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Stop medication"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {medications.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Pill className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No active medications</p>
            <p className="text-xs text-gray-400 mt-1">Click "Quick Add" or "Full Form" to prescribe</p>
          </div>
        )}
      </div>
    </div>
  );
});
