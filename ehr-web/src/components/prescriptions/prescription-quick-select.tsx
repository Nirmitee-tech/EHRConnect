'use client';

import React, { useState } from 'react';
import { Pill, ArrowRight } from 'lucide-react';
import { Prescription } from '@/types/encounter';

/**
 * VARIATION 3: TEMPLATE QUICK SELECT
 *
 * Use case: Common medications, one-click prescribing
 * Speed: 2-5 seconds
 * Layout: Big buttons with common meds, custom option
 */

interface PrescriptionQuickSelectProps {
  onAdd: (prescription: Prescription) => void;
}

const COMMON_MEDS = [
  { name: 'Amoxicillin 500mg', dose: '1 capsule', freq: '3x daily', days: '7', note: 'Complete full course' },
  { name: 'Ibuprofen 400mg', dose: '1 tablet', freq: '3x daily', days: '7', note: 'Take with food' },
  { name: 'Paracetamol 500mg', dose: '1-2 tablets', freq: 'Every 4-6h', days: '5', note: 'Max 8 tablets/day' },
  { name: 'Omeprazole 20mg', dose: '1 capsule', freq: 'Once daily', days: '14', note: 'Before breakfast' },
  { name: 'Metformin 500mg', dose: '1 tablet', freq: 'Twice daily', days: '30', note: 'With meals' },
  { name: 'Amlodipine 5mg', dose: '1 tablet', freq: 'Once daily', days: '30', note: 'Same time each day' },
];

export function PrescriptionQuickSelect({ onAdd }: PrescriptionQuickSelectProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customMed, setCustomMed] = useState('');
  const [customDose, setCustomDose] = useState('');
  const [customFreq, setCustomFreq] = useState('Twice daily');

  const handleQuickSelect = (med: typeof COMMON_MEDS[0]) => {
    onAdd({
      id: `rx-${Date.now()}`,
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      medication: med.name,
      medicationCodeableConcept: { text: med.name },
      dosage: med.dose,
      frequency: med.freq,
      duration: `${med.days} days`,
      instructions: med.note,
      authoredOn: new Date().toISOString()
    });
  };

  const handleCustomAdd = () => {
    if (!customMed) return;

    onAdd({
      id: `rx-${Date.now()}`,
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      medication: customMed,
      medicationCodeableConcept: { text: customMed },
      dosage: customDose,
      frequency: customFreq,
      authoredOn: new Date().toISOString()
    });

    setCustomMed('');
    setCustomDose('');
    setCustomFreq('Twice daily');
    setShowCustom(false);
  };

  if (showCustom) {
    return (
      <div className="p-4 bg-gray-50 border-2 border-gray-300 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Custom Medication</h3>
          <button
            onClick={() => setShowCustom(false)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            ← Back to common meds
          </button>
        </div>

        <input
          type="text"
          value={customMed}
          onChange={(e) => setCustomMed(e.target.value)}
          placeholder="Medication name"
          className="w-full px-3 py-2 border border-gray-300 rounded"
          autoFocus
        />

        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={customDose}
            onChange={(e) => setCustomDose(e.target.value)}
            placeholder="Dose"
            className="px-3 py-2 border border-gray-300 rounded"
          />
          <select
            value={customFreq}
            onChange={(e) => setCustomFreq(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded"
          >
            <option>Once daily</option>
            <option>Twice daily</option>
            <option>3x daily</option>
            <option>4x daily</option>
            <option>As needed</option>
          </select>
        </div>

        <button
          onClick={handleCustomAdd}
          disabled={!customMed}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50"
        >
          Add Prescription
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Common Medications</h3>

      {/* Common Meds Grid */}
      <div className="grid grid-cols-2 gap-2">
        {COMMON_MEDS.map((med) => (
          <button
            key={med.name}
            onClick={() => handleQuickSelect(med)}
            className="text-left p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Pill className="h-4 w-4 text-blue-600" />
                  <h4 className="text-sm font-semibold text-gray-900">{med.name}</h4>
                </div>
                <p className="text-xs text-gray-600">
                  {med.dose} • {med.freq}
                </p>
                <p className="text-xs text-gray-500 mt-1">{med.days} days</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition" />
            </div>
          </button>
        ))}
      </div>

      {/* Custom Option */}
      <button
        onClick={() => setShowCustom(true)}
        className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
      >
        + Other medication (custom)
      </button>
    </div>
  );
}
