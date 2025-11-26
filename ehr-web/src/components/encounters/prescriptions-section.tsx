'use client';

import React, { useState, useEffect } from 'react';
import { Prescription } from '@/types/encounter';
import { Plus, Trash2, Edit2, Save, X, Pill, Info } from 'lucide-react';

interface PrescriptionsSectionProps {
  prescriptions?: Prescription[];
  onUpdate: (prescriptions: Prescription[]) => void;
}

// Helper functions to convert between FHIR and legacy format
const convertLegacyToFHIR = (prescription: Prescription): Prescription => {
  if (prescription.medicationCodeableConcept) {
    return prescription; // Already in FHIR format
  }

  // Convert legacy format to FHIR
  const fhirPrescription: Prescription = {
    ...prescription,
    resourceType: 'MedicationRequest',
    status: 'active',
    intent: 'order',
    medicationCodeableConcept: {
      text: prescription.medication || ''
    },
    authoredOn: new Date().toISOString()
  };

  // Parse dosage, frequency, and duration to create dosageInstruction
  if (prescription.dosage || prescription.frequency || prescription.duration) {
    fhirPrescription.dosageInstruction = [{
      text: prescription.instructions,
      doseAndRate: prescription.dosage ? [{
        doseQuantity: {
          value: parseFloat(prescription.dosage) || undefined,
          unit: prescription.dosage.replace(/[0-9.]/g, '').trim() || 'unit'
        }
      }] : undefined
    }];
  }

  return fhirPrescription;
};

const getMedicationName = (prescription: Prescription): string => {
  return (
    prescription.medicationCodeableConcept?.text ||
    prescription.medicationCodeableConcept?.coding?.[0]?.display ||
    prescription.medication ||
    ''
  );
};

const getDosageDisplay = (prescription: Prescription): string => {
  const dosageInstruction = prescription.dosageInstruction?.[0];
  if (dosageInstruction?.doseAndRate?.[0]?.doseQuantity) {
    const { value, unit } = dosageInstruction.doseAndRate[0].doseQuantity;
    return `${value || ''} ${unit || ''}`.trim();
  }
  return prescription.dosage || '';
};

const getFrequencyDisplay = (prescription: Prescription): string => {
  const dosageInstruction = prescription.dosageInstruction?.[0];
  if (dosageInstruction?.timing?.repeat) {
    const { frequency, period, periodUnit } = dosageInstruction.timing.repeat;
    if (frequency && period) {
      const unitMap: Record<string, string> = { h: 'hour', d: 'day', wk: 'week', mo: 'month' };
      const unit = unitMap[periodUnit || 'd'] || periodUnit;
      return `${frequency}x per ${period} ${unit}${period > 1 ? 's' : ''}`;
    }
  }
  return prescription.frequency || '';
};

const getDurationDisplay = (prescription: Prescription): string => {
  const dosageInstruction = prescription.dosageInstruction?.[0];
  if (dosageInstruction?.timing?.repeat) {
    const { duration, durationUnit } = dosageInstruction.timing.repeat;
    if (duration && durationUnit) {
      const unitMap: Record<string, string> = { h: 'hour', d: 'day', wk: 'week', mo: 'month' };
      const unit = unitMap[durationUnit] || durationUnit;
      return `${duration} ${unit}${duration > 1 ? 's' : ''}`;
    }
  }
  return prescription.duration || '';
};

const getInstructions = (prescription: Prescription): string => {
  return (
    prescription.dosageInstruction?.[0]?.text ||
    prescription.instructions ||
    ''
  );
};

export function PrescriptionsSection({
  prescriptions = [],
  onUpdate
}: PrescriptionsSectionProps) {
  const [items, setItems] = useState<Prescription[]>(prescriptions);
  const [editingItem, setEditingItem] = useState<Prescription | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [compactView, setCompactView] = useState(true);

  // Sync with parent
  useEffect(() => {
    setItems(prescriptions);
  }, [prescriptions]);

  const handleAddItem = () => {
    const newItem: Prescription = {
      id: `prescription-${Date.now()}`,
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: { text: '' },
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      authoredOn: new Date().toISOString()
    };
    setEditingItem(newItem);
    setIsAddingItem(true);
  };

  const handleSaveItem = () => {
    const medName = getMedicationName(editingItem!);
    if (!editingItem || !medName) {
      alert('Medication name is required');
      return;
    }

    // Convert to FHIR format before saving
    const fhirItem = convertLegacyToFHIR(editingItem);

    let updatedItems: Prescription[];
    if (isAddingItem) {
      updatedItems = [...items, fhirItem];
    } else {
      updatedItems = items.map(item =>
        item.id === fhirItem.id ? fhirItem : item
      );
    }

    setItems(updatedItems);
    onUpdate(updatedItems);
    setEditingItem(null);
    setIsAddingItem(false);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Delete this prescription?')) {
      const updatedItems = items.filter(item => item.id !== id);
      setItems(updatedItems);
      onUpdate(updatedItems);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setIsAddingItem(false);
  };

  // Common frequency options
  const frequencyOptions = [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'Four times daily',
    'Every 4 hours',
    'Every 6 hours',
    'Every 8 hours',
    'Every 12 hours',
    'As needed',
    'Before meals',
    'After meals',
    'At bedtime'
  ];

  // Common duration options
  const durationOptions = [
    '3 days',
    '5 days',
    '7 days',
    '10 days',
    '14 days',
    '1 month',
    '2 months',
    '3 months',
    'As needed'
  ];

  return (
    <div className="space-y-4">
      {/* Header with FHIR badge and view toggle */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs">
            <Info className="h-3 w-3 text-blue-600" />
            <span className="text-blue-700 font-medium">FHIR MedicationRequest</span>
          </div>
          <button
            onClick={() => setCompactView(!compactView)}
            className="text-xs text-gray-600 hover:text-gray-900 underline"
          >
            {compactView ? 'Expand' : 'Compact'} View
          </button>
        </div>
        <button
          onClick={handleAddItem}
          className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs font-medium transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Prescription
        </button>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-3">
        {items.length === 0 && !isAddingItem && (
          <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg">
            No prescriptions added. Click &quot;Add Prescription&quot; to add one.
          </div>
        )}

        {items.map((item, index) => (
          editingItem?.id === item.id && !isAddingItem ? (
            <div key={item.id} className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Pill className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Editing Prescription #{index + 1}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Medication Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={getMedicationName(editingItem)}
                    onChange={(e) => setEditingItem({
                      ...editingItem,
                      medication: e.target.value,
                      medicationCodeableConcept: { text: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Amoxicillin 500mg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={editingItem.dosage}
                    onChange={(e) => setEditingItem({ ...editingItem, dosage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 1 tablet, 5ml"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
                  <select
                    value={editingItem.frequency}
                    onChange={(e) => setEditingItem({ ...editingItem, frequency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select frequency...</option>
                    {frequencyOptions.map(freq => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
                  <select
                    value={editingItem.duration}
                    onChange={(e) => setEditingItem({ ...editingItem, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select duration...</option>
                    {durationOptions.map(dur => (
                      <option key={dur} value={dur}>{dur}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Instructions</label>
                  <textarea
                    value={editingItem.instructions || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, instructions: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Special instructions for the patient..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-blue-200">
                <button
                  onClick={handleSaveItem}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1.5 font-medium transition-colors"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg text-sm hover:bg-gray-500 flex items-center gap-1.5 font-medium transition-colors"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : compactView ? (
            // Compact View - FHIR compatible
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Pill className="h-4 w-4 text-purple-600" />
                    <h4 className="text-sm font-bold text-gray-900 truncate">
                      {getMedicationName(item)}
                    </h4>
                    {item.status && (
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                    )}
                  </div>

                  {/* Compact single-line info */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600 mb-1">
                    <span><span className="font-medium text-gray-700">Dose:</span> {getDosageDisplay(item) || '-'}</span>
                    <span><span className="font-medium text-gray-700">Freq:</span> {getFrequencyDisplay(item) || '-'}</span>
                    {getDurationDisplay(item) && (
                      <span><span className="font-medium text-gray-700">Duration:</span> {getDurationDisplay(item)}</span>
                    )}
                  </div>

                  {getInstructions(item) && (
                    <div className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 mt-1">
                      {getInstructions(item)}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Expanded View - traditional format
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Pill className="h-5 w-5 text-purple-600" />
                    <h4 className="text-base font-bold text-gray-900">{getMedicationName(item)}</h4>
                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-medium">
                      #{index + 1}
                    </span>
                    {item.status && (
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-2">
                    <div>
                      <span className="text-xs font-medium text-gray-500">Dosage:</span>
                      <p className="text-sm text-gray-900">{getDosageDisplay(item) || '-'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Frequency:</span>
                      <p className="text-sm text-gray-900">{getFrequencyDisplay(item) || '-'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Duration:</span>
                      <p className="text-sm text-gray-900">{getDurationDisplay(item) || '-'}</p>
                    </div>
                  </div>

                  {getInstructions(item) && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <span className="text-xs font-medium text-yellow-800">Instructions:</span>
                      <p className="text-sm text-yellow-900 mt-0.5">{getInstructions(item)}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 ml-3">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        ))}

        {/* Add new item form */}
        {isAddingItem && editingItem && (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Pill className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold text-green-900">New Prescription</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Medication Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={getMedicationName(editingItem)}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    medication: e.target.value,
                    medicationCodeableConcept: { text: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Ibuprofen 400mg"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Dosage</label>
                <input
                  type="text"
                  value={editingItem.dosage}
                  onChange={(e) => setEditingItem({ ...editingItem, dosage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., 1 tablet, 5ml"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  value={editingItem.frequency}
                  onChange={(e) => setEditingItem({ ...editingItem, frequency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select frequency...</option>
                  {frequencyOptions.map(freq => (
                    <option key={freq} value={freq}>{freq}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
                <select
                  value={editingItem.duration}
                  onChange={(e) => setEditingItem({ ...editingItem, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select duration...</option>
                  {durationOptions.map(dur => (
                    <option key={dur} value={dur}>{dur}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Instructions</label>
                <textarea
                  value={editingItem.instructions || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                  placeholder="e.g., Take with food, avoid alcohol"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-green-200">
              <button
                onClick={handleSaveItem}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1.5 font-medium transition-colors"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg text-sm hover:bg-gray-500 flex items-center gap-1.5 font-medium transition-colors"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="text-sm font-medium text-purple-900">
            Total Prescriptions: <span className="text-lg font-bold">{items.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
