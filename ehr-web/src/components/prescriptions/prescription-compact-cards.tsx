'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Pill } from 'lucide-react';
import { Prescription } from '@/types/encounter';

/**
 * VARIATION 2: COMPACT CARDS
 *
 * Use case: Encounter drawer, multiple prescriptions
 * Speed: 10-15 seconds per prescription
 * Layout: Stacked cards, inline add
 */

interface PrescriptionCompactCardsProps {
  prescriptions: Prescription[];
  onUpdate: (prescriptions: Prescription[]) => void;
}

export function PrescriptionCompactCards({
  prescriptions = [],
  onUpdate
}: PrescriptionCompactCardsProps) {
  const [items, setItems] = useState<Prescription[]>(prescriptions);
  const [showAdd, setShowAdd] = useState(false);

  // Add form state
  const [med, setMed] = useState('');
  const [dose, setDose] = useState('');
  const [freq, setFreq] = useState('Twice daily');
  const [days, setDays] = useState('7');
  const [instructions, setInstructions] = useState('');

  const handleAdd = () => {
    if (!med) return;

    const newRx: Prescription = {
      id: `rx-${Date.now()}`,
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      medication: med,
      medicationCodeableConcept: { text: med },
      dosage: dose,
      frequency: freq,
      duration: `${days} days`,
      instructions: instructions,
      authoredOn: new Date().toISOString()
    };

    const updated = [...items, newRx];
    setItems(updated);
    onUpdate(updated);

    // Reset
    setMed('');
    setDose('');
    setFreq('Twice daily');
    setDays('7');
    setInstructions('');
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    onUpdate(updated);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-700">Prescriptions ({items.length})</h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
          {/* Row 1: Medication + Dose */}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={med}
              onChange={(e) => setMed(e.target.value)}
              placeholder="Medication (e.g. Amoxicillin 500mg)"
              className="px-3 py-2 border border-gray-300 rounded text-sm"
              autoFocus
            />
            <input
              type="text"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder="Dose (e.g. 1 tablet)"
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            />
          </div>

          {/* Row 2: Frequency + Days */}
          <div className="grid grid-cols-2 gap-2">
            <select
              value={freq}
              onChange={(e) => setFreq(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option>Once daily</option>
              <option>Twice daily</option>
              <option>3x daily</option>
              <option>4x daily</option>
              <option>Every 6 hours</option>
              <option>As needed</option>
            </select>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-20 px-3 py-2 border border-gray-300 rounded text-sm"
              />
              <span className="text-sm text-gray-600">days</span>
            </div>
          </div>

          {/* Row 3: Instructions */}
          <input
            type="text"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Instructions (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          />

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!med}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Add Prescription
            </button>
          </div>
        </div>
      )}

      {/* Prescription List */}
      <div className="space-y-2">
        {items.map((rx) => (
          <div
            key={rx.id}
            className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition"
          >
            <Pill className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900">
                {rx.medication || rx.medicationCodeableConcept?.text}
              </h4>
              <p className="text-xs text-gray-600 mt-0.5">
                {rx.dosage} • {rx.frequency} • {rx.duration}
              </p>
              {rx.instructions && (
                <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded mt-1">
                  {rx.instructions}
                </p>
              )}
            </div>

            <button
              onClick={() => handleDelete(rx.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {items.length === 0 && !showAdd && (
          <div className="text-center py-6 text-sm text-gray-500">
            No prescriptions added yet
          </div>
        )}
      </div>
    </div>
  );
}
