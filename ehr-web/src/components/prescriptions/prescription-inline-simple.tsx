'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Prescription } from '@/types/encounter';

/**
 * VARIATION 1: ULTRA-SIMPLE INLINE
 *
 * Use case: Quick add in medications tab, minimal UI
 * Speed: 5 seconds
 * Layout: Single row, all fields visible
 */

interface PrescriptionInlineSimpleProps {
  onAdd: (prescription: Prescription) => void;
  onCancel?: () => void;
}

export function PrescriptionInlineSimple({ onAdd, onCancel }: PrescriptionInlineSimpleProps) {
  const [med, setMed] = useState('');
  const [dose, setDose] = useState('');
  const [freq, setFreq] = useState('');

  const handleAdd = () => {
    if (!med) return;

    onAdd({
      id: `rx-${Date.now()}`,
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      medication: med,
      medicationCodeableConcept: { text: med },
      dosage: dose,
      frequency: freq,
      authoredOn: new Date().toISOString()
    });

    // Reset
    setMed('');
    setDose('');
    setFreq('');
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-white border-2 border-green-500 rounded-lg">
      {/* Medication */}
      <input
        type="text"
        value={med}
        onChange={(e) => setMed(e.target.value)}
        placeholder="Medication name"
        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
        autoFocus
      />

      {/* Dose */}
      <input
        type="text"
        value={dose}
        onChange={(e) => setDose(e.target.value)}
        placeholder="Dose"
        className="w-32 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />

      {/* Frequency */}
      <select
        value={freq}
        onChange={(e) => setFreq(e.target.value)}
        className="w-40 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
      >
        <option value="">Frequency</option>
        <option value="Once daily">Once daily</option>
        <option value="Twice daily">Twice daily</option>
        <option value="3x daily">3x daily</option>
        <option value="4x daily">4x daily</option>
        <option value="As needed">As needed</option>
      </select>

      {/* Actions */}
      <button
        onClick={handleAdd}
        disabled={!med}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        Add
      </button>

      {onCancel && (
        <button
          onClick={onCancel}
          className="p-2 text-gray-500 hover:text-gray-700 rounded"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
