'use client';

import React, { useState } from 'react';
import { Prescription } from '@/types/encounter';

/**
 * VARIATION 4: DETAILED FORM
 *
 * Use case: Complex prescriptions, teaching hospitals, detailed documentation
 * Speed: 30-60 seconds
 * Layout: Full form with all FHIR fields
 */

interface PrescriptionDetailedFormProps {
  onSave: (prescription: Prescription) => void;
  onCancel: () => void;
}

export function PrescriptionDetailedForm({
  onSave,
  onCancel
}: PrescriptionDetailedFormProps) {
  const [formData, setFormData] = useState({
    medication: '',
    dosageValue: '',
    dosageUnit: 'mg',
    route: 'oral',
    frequency: '1',
    period: '1',
    periodUnit: 'd',
    duration: '',
    durationUnit: 'd',
    instructions: '',
    indication: '',
    notes: ''
  });

  const handleSubmit = () => {
    if (!formData.medication || !formData.dosageValue) {
      alert('Medication name and dosage are required');
      return;
    }

    const prescription: Prescription = {
      id: `rx-${Date.now()}`,
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      medication: `${formData.medication} ${formData.dosageValue}${formData.dosageUnit}`,
      medicationCodeableConcept: {
        text: `${formData.medication} ${formData.dosageValue}${formData.dosageUnit}`
      },
      dosage: `${formData.dosageValue} ${formData.dosageUnit}`,
      frequency: `${formData.frequency}x per ${formData.period} ${formData.periodUnit}`,
      duration: formData.duration ? `${formData.duration} ${formData.durationUnit}` : undefined,
      instructions: formData.instructions,
      authoredOn: new Date().toISOString(),
      dosageInstruction: [{
        text: formData.instructions,
        timing: {
          repeat: {
            frequency: parseInt(formData.frequency),
            period: parseInt(formData.period),
            periodUnit: formData.periodUnit as any,
            duration: formData.duration ? parseInt(formData.duration) : undefined,
            durationUnit: formData.durationUnit as any
          }
        },
        route: {
          coding: [{
            display: formData.route
          }]
        },
        doseAndRate: [{
          doseQuantity: {
            value: parseFloat(formData.dosageValue),
            unit: formData.dosageUnit
          }
        }]
      }]
    };

    onSave(prescription);
  };

  const update = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-300 p-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">New Prescription</h2>

      {/* Section 1: Medication */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Medication</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Medication Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.medication}
            onChange={(e) => update('medication', e.target.value)}
            placeholder="e.g., Amoxicillin"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Indication / Reason
          </label>
          <input
            type="text"
            value={formData.indication}
            onChange={(e) => update('indication', e.target.value)}
            placeholder="e.g., Bacterial infection"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Section 2: Dosage */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Dosage</h3>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dose <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.dosageValue}
              onChange={(e) => update('dosageValue', e.target.value)}
              placeholder="500"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select
              value={formData.dosageUnit}
              onChange={(e) => update('dosageUnit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="mg">mg</option>
              <option value="g">g</option>
              <option value="ml">ml</option>
              <option value="mcg">mcg</option>
              <option value="IU">IU</option>
              <option value="tablet">tablet(s)</option>
              <option value="capsule">capsule(s)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
          <select
            value={formData.route}
            onChange={(e) => update('route', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="oral">Oral</option>
            <option value="intravenous">Intravenous (IV)</option>
            <option value="intramuscular">Intramuscular (IM)</option>
            <option value="subcutaneous">Subcutaneous</option>
            <option value="topical">Topical</option>
            <option value="inhalation">Inhalation</option>
            <option value="rectal">Rectal</option>
            <option value="sublingual">Sublingual</option>
          </select>
        </div>
      </div>

      {/* Section 3: Timing */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Timing & Frequency</h3>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Times</label>
            <input
              type="number"
              min="1"
              value={formData.frequency}
              onChange={(e) => update('frequency', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Per</label>
            <input
              type="number"
              min="1"
              value={formData.period}
              onChange={(e) => update('period', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select
              value={formData.periodUnit}
              onChange={(e) => update('periodUnit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="h">Hour(s)</option>
              <option value="d">Day(s)</option>
              <option value="wk">Week(s)</option>
              <option value="mo">Month(s)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => update('duration', e.target.value)}
              placeholder="7"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <select
              value={formData.durationUnit}
              onChange={(e) => update('durationUnit', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="d">Day(s)</option>
              <option value="wk">Week(s)</option>
              <option value="mo">Month(s)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 4: Instructions */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Patient Instructions</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instructions for Patient
          </label>
          <textarea
            value={formData.instructions}
            onChange={(e) => update('instructions', e.target.value)}
            placeholder="Take with food. Complete full course even if feeling better."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Clinical Notes (internal)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="Additional clinical notes..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!formData.medication || !formData.dosageValue}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Prescription
        </button>
      </div>
    </div>
  );
}
