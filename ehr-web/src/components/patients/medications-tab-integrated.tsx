'use client';

import React, { useState } from 'react';
import { Pill, Edit2, Trash2, Copy, Save, X, Zap, Layout, Grid, FileText } from 'lucide-react';
import { Badge } from '@nirmitee.io/design-system';
import { MedicationService } from '@/services/medication.service';
import { Prescription } from '@/types/encounter';
import { PrescriptionInlineSimple } from '@/components/prescriptions/prescription-inline-simple';
import { PrescriptionQuickSelect } from '@/components/prescriptions/prescription-quick-select';
import { PrescriptionDetailedForm } from '@/components/prescriptions/prescription-detailed-form';

/**
 * INTEGRATED MEDICATIONS TAB
 *
 * All 4 UI variations in medications tab with mode switcher
 * Use in patient detail page
 */

type AddMode = 'inline' | 'quick' | 'detailed';

interface MedicationsTabIntegratedProps {
  patientId: string;
  medications: any[];
  onMedicationChange?: () => void;
}

// Helper functions
const getMedicationName = (med: any): string => {
  return (
    med.medicationCodeableConcept?.text ||
    med.medicationCodeableConcept?.coding?.[0]?.display ||
    med.medication ||
    'Unknown medication'
  );
};

const formatDosage = (med: any): string => {
  const dosageInstruction = med.dosageInstruction?.[0];
  if (!dosageInstruction) return med.dosage || '-';
  const doseQuantity = dosageInstruction.doseAndRate?.[0]?.doseQuantity;
  if (doseQuantity) {
    return `${doseQuantity.value || ''} ${doseQuantity.unit || ''}`.trim();
  }
  return '-';
};

const formatFrequency = (med: any): string => {
  const dosageInstruction = med.dosageInstruction?.[0];
  if (!dosageInstruction?.timing?.repeat) return med.frequency || '-';
  const { frequency, period, periodUnit } = dosageInstruction.timing.repeat;
  if (frequency && period) {
    const unitMap: Record<string, string> = { h: 'hour', d: 'day', wk: 'week', mo: 'month' };
    const unit = unitMap[periodUnit] || periodUnit;
    return `${frequency}x per ${period} ${unit}${period > 1 ? 's' : ''}`;
  }
  return '-';
};

const formatInstructions = (med: any): string => {
  return med.dosageInstruction?.[0]?.text || med.instructions || '';
};

export function MedicationsTabIntegrated({
  patientId,
  medications,
  onMedicationChange
}: MedicationsTabIntegratedProps) {
  const [addMode, setAddMode] = useState<AddMode | null>(null);
  const [editingMed, setEditingMed] = useState<any | null>(null);
  const [editDosage, setEditDosage] = useState('');
  const [editFrequency, setEditFrequency] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const frequencyOptions = [
    'Once daily', 'Twice daily', 'Three times daily', 'Four times daily',
    'Every 4 hours', 'Every 6 hours', 'Every 8 hours', 'As needed',
    'Before meals', 'After meals', 'At bedtime'
  ];

  const handleAdd = async (prescription: Prescription) => {
    setIsLoading(true);
    try {
      await MedicationService.createMedication(patientId, prescription);
      setAddMode(null);
      if (onMedicationChange) onMedicationChange();
    } catch (error) {
      console.error('Error adding medication:', error);
      alert('Failed to add medication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (med: any) => {
    setEditingMed(med);
    setEditDosage(formatDosage(med));
    setEditFrequency(formatFrequency(med));
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
      instructions: editInstructions,
      authoredOn: editingMed.authoredOn
    };

    setIsLoading(true);
    try {
      await MedicationService.updateMedication(editingMed.id, prescription);
      setEditingMed(null);
      if (onMedicationChange) onMedicationChange();
    } catch (error) {
      console.error('Error updating medication:', error);
      alert('Failed to update medication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (med: any) => {
    if (!confirm(`Stop prescribing ${getMedicationName(med)}?`)) return;

    setIsLoading(true);
    try {
      await MedicationService.deleteMedication(med.id);
      if (onMedicationChange) onMedicationChange();
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
      instructions: formatInstructions(med),
      authoredOn: new Date().toISOString()
    };

    setIsLoading(true);
    try {
      await MedicationService.createMedication(patientId, prescription);
      if (onMedicationChange) onMedicationChange();
    } catch (error) {
      console.error('Error duplicating medication:', error);
      alert('Failed to duplicate medication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with mode switcher */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Pill className="h-5 w-5 text-purple-600" />
          <h3 className="text-base font-semibold text-gray-900">Active Medications</h3>
          <Badge className="bg-purple-100 text-purple-800 text-xs">
            {medications.length}
          </Badge>
        </div>

        {/* Mode Switcher */}
        {!addMode ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAddMode('inline')}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              title="Quick Add (5s)"
            >
              <Zap className="h-3.5 w-3.5" />
              Quick
            </button>
            <button
              onClick={() => setAddMode('quick')}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
              title="Quick Select (2-5s)"
            >
              <Grid className="h-3.5 w-3.5" />
              Template
            </button>
            <button
              onClick={() => setAddMode('detailed')}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
              title="Detailed Form (30-60s)"
            >
              <FileText className="h-3.5 w-3.5" />
              Detailed
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddMode(null)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Cancel
          </button>
        )}
      </div>

      {/* Add Forms */}
      {addMode === 'inline' && (
        <PrescriptionInlineSimple
          onAdd={handleAdd}
          onCancel={() => setAddMode(null)}
        />
      )}

      {addMode === 'quick' && (
        <div className="border-2 border-purple-300 rounded-lg p-4 bg-purple-50">
          <PrescriptionQuickSelect onAdd={handleAdd} />
        </div>
      )}

      {addMode === 'detailed' && (
        <PrescriptionDetailedForm
          onSave={handleAdd}
          onCancel={() => setAddMode(null)}
        />
      )}

      {/* Medications List */}
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

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Dosage</label>
                    <input
                      type="text"
                      value={editDosage}
                      onChange={(e) => setEditDosage(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">Instructions</label>
                    <input
                      type="text"
                      value={editInstructions}
                      onChange={(e) => setEditInstructions(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
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
                    onClick={() => setEditingMed(null)}
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

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 mb-1">
                    <span><span className="font-medium text-gray-700">Dose:</span> {formatDosage(med)}</span>
                    <span><span className="font-medium text-gray-700">Frequency:</span> {formatFrequency(med)}</span>
                  </div>

                  {instructions && (
                    <div className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 mt-1">
                      {instructions}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
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
          );
        })}

        {medications.length === 0 && !addMode && (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Pill className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No active medications</p>
            <p className="text-xs text-gray-400 mt-1">Click Quick, Template, or Detailed to add</p>
          </div>
        )}
      </div>
    </div>
  );
}
