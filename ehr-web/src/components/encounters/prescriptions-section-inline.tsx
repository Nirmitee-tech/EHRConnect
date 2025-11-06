'use client';

import React, { useState, useEffect } from 'react';
import { Prescription } from '@/types/encounter';
import { Trash2, Pill, Plus } from 'lucide-react';

interface PrescriptionsSectionInlineProps {
  prescriptions?: Prescription[];
  onUpdate: (prescriptions: Prescription[]) => void;
}

// Helper functions for FHIR format
const getMedicationName = (prescription: Prescription): string => {
  return (
    prescription.medicationCodeableConcept?.text ||
    prescription.medicationCodeableConcept?.coding?.[0]?.display ||
    prescription.medication ||
    ''
  );
};

const createFHIRPrescription = (formData: {
  medication: string;
  dosage: string;
  dosageUnit: string;
  morning: string;
  afternoon: string;
  night: string;
  duration: string;
  durationUnit: string;
  instructions: string;
  instructionType: 'before' | 'after' | 'with';
}): Prescription => {
  // Calculate frequency from morning/afternoon/night
  const timesPerDay = [
    formData.morning ? parseInt(formData.morning) || 0 : 0,
    formData.afternoon ? parseInt(formData.afternoon) || 0 : 0,
    formData.night ? parseInt(formData.night) || 0 : 0
  ].reduce((a, b) => a + b, 0);

  const instructionText = formData.instructions ||
    (formData.instructionType === 'before' ? 'Take before food' :
     formData.instructionType === 'after' ? 'Take after food' :
     formData.instructionType === 'with' ? 'Take with food' : '');

  const dosageValue = parseFloat(formData.dosage) || 0;
  const durationValue = parseFloat(formData.duration) || 0;

  return {
    id: `prescription-${Date.now()}-${Math.random()}`,
    resourceType: 'MedicationRequest',
    status: 'active',
    intent: 'order',
    medicationCodeableConcept: {
      text: formData.medication
    },
    medication: formData.medication,
    authoredOn: new Date().toISOString(),
    dosageInstruction: [{
      text: instructionText,
      timing: {
        repeat: {
          frequency: timesPerDay,
          period: 1,
          periodUnit: 'd',
          duration: durationValue,
          durationUnit: formData.durationUnit as 'h' | 'd' | 'wk' | 'mo'
        }
      },
      doseAndRate: [{
        doseQuantity: {
          value: dosageValue,
          unit: formData.dosageUnit,
          system: 'http://unitsofmeasure.org'
        }
      }]
    }],
    // Store timing details in legacy format for easy display
    dosage: `${formData.dosage} ${formData.dosageUnit}`,
    frequency: `${formData.morning || 0}-${formData.afternoon || 0}-${formData.night || 0}`,
    duration: `${formData.duration} ${formData.durationUnit}`,
    instructions: instructionText
  };
};

// Common drug suggestions
const commonDrugs = [
  'Paracetamol 500mg',
  'Ibuprofen 400mg',
  'Amoxicillin 500mg',
  'Azithromycin 250mg',
  'Cetirizine 10mg',
  'Omeprazole 20mg',
  'Metformin 500mg',
  'Amlodipine 5mg',
  'Atorvastatin 10mg',
  'Levothyroxine 50mcg'
];

export function PrescriptionsSectionInline({
  prescriptions = [],
  onUpdate
}: PrescriptionsSectionInlineProps) {
  const [items, setItems] = useState<Prescription[]>(prescriptions);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    medication: '',
    dosage: '',
    dosageUnit: 'mg',
    morning: '1',
    afternoon: '1',
    night: '1',
    duration: '',
    durationUnit: 'day(s)',
    instructions: '',
    instructionType: 'after' as 'before' | 'after' | 'with'
  });

  // Sync with parent
  useEffect(() => {
    setItems(prescriptions);
  }, [prescriptions]);

  const filteredDrugs = commonDrugs.filter(drug =>
    drug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPrescription = () => {
    if (!formData.medication || !formData.dosage) {
      alert('Medication name and dosage are required');
      return;
    }

    const newPrescription = createFHIRPrescription(formData);
    const updatedItems = [...items, newPrescription];

    setItems(updatedItems);
    onUpdate(updatedItems);

    // Reset form
    setFormData({
      medication: '',
      dosage: '',
      dosageUnit: 'mg',
      morning: '1',
      afternoon: '1',
      night: '1',
      duration: '',
      durationUnit: 'day(s)',
      instructions: '',
      instructionType: 'after'
    });
    setSearchQuery('');
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Delete this prescription?')) {
      const updatedItems = items.filter(item => item.id !== id);
      setItems(updatedItems);
      onUpdate(updatedItems);
    }
  };

  const selectDrug = (drug: string) => {
    setFormData({ ...formData, medication: drug });
    setSearchQuery(drug);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-4">
      {/* Inline Form */}
      <div className="bg-white border-2 border-purple-200 rounded-lg p-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Left Section - Form */}
          <div className="col-span-7 space-y-4">
            {/* Medication Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Tablet
              </label>
              <input
                type="text"
                value={formData.medication}
                onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
                placeholder="Enter medication name"
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Dosage */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  placeholder="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={formData.dosageUnit}
                  onChange={(e) => setFormData({ ...formData, dosageUnit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="mg">mg</option>
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                  <option value="mcg">mcg</option>
                  <option value="units">units</option>
                </select>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Duration
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="7"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <select
                  value={formData.durationUnit}
                  onChange={(e) => setFormData({ ...formData, durationUnit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="day(s)">day(s)</option>
                  <option value="wk">week(s)</option>
                  <option value="mo">month(s)</option>
                </select>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Instructions
              </label>
              <div className="flex gap-4">
                <label className="flex items-center text-sm">
                  <input
                    type="radio"
                    name="instructionType"
                    value="before"
                    checked={formData.instructionType === 'before'}
                    onChange={(e) => setFormData({ ...formData, instructionType: 'before' })}
                    className="mr-2"
                  />
                  Before Food
                </label>
                <label className="flex items-center text-sm">
                  <input
                    type="radio"
                    name="instructionType"
                    value="after"
                    checked={formData.instructionType === 'after'}
                    onChange={(e) => setFormData({ ...formData, instructionType: 'after' })}
                    className="mr-2"
                  />
                  After Food
                </label>
                <label className="flex items-center text-sm">
                  <input
                    type="radio"
                    name="instructionType"
                    value="with"
                    checked={formData.instructionType === 'with'}
                    onChange={(e) => setFormData({ ...formData, instructionType: 'with' })}
                    className="mr-2"
                  />
                  With Food
                </label>
              </div>
            </div>

            {/* Timing - Morning/Afternoon/Night */}
            <div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="flex items-center text-xs font-medium text-gray-600 mb-1">
                    <input
                      type="checkbox"
                      checked={!!formData.morning}
                      onChange={(e) => setFormData({ ...formData, morning: e.target.checked ? '1' : '' })}
                      className="mr-2"
                    />
                    Morning
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.morning}
                    onChange={(e) => setFormData({ ...formData, morning: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center"
                    disabled={!formData.morning}
                  />
                </div>
                <div>
                  <label className="flex items-center text-xs font-medium text-gray-600 mb-1">
                    <input
                      type="checkbox"
                      checked={!!formData.afternoon}
                      onChange={(e) => setFormData({ ...formData, afternoon: e.target.checked ? '1' : '' })}
                      className="mr-2"
                    />
                    Afternoon
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.afternoon}
                    onChange={(e) => setFormData({ ...formData, afternoon: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center"
                    disabled={!formData.afternoon}
                  />
                </div>
                <div>
                  <label className="flex items-center text-xs font-medium text-gray-600 mb-1">
                    <input
                      type="checkbox"
                      checked={!!formData.night}
                      onChange={(e) => setFormData({ ...formData, night: e.target.checked ? '1' : '' })}
                      className="mr-2"
                    />
                    Night
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.night}
                    onChange={(e) => setFormData({ ...formData, night: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-center"
                    disabled={!formData.night}
                  />
                </div>
              </div>
            </div>

            {/* Additional Instructions */}
            <div>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Add notes here..."
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={2}
              />
            </div>
          </div>

          {/* Right Section - Drug Search */}
          <div className="col-span-5 border-l pl-4">
            <div className="relative">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Search Drugs
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search..."
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />

              {/* Suggestions List */}
              {showSuggestions && (
                <div className="mt-2 max-h-64 overflow-y-auto border border-gray-200 rounded bg-white">
                  {filteredDrugs.length > 0 ? (
                    filteredDrugs.map((drug, index) => (
                      <div
                        key={index}
                        onClick={() => selectDrug(drug)}
                        className="px-3 py-2 text-sm hover:bg-purple-50 cursor-pointer border-b last:border-b-0 flex items-center justify-between"
                      >
                        <span className="text-gray-700">{drug}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectDrug(drug);
                          }}
                          className="text-purple-600 hover:text-purple-800 text-xs font-medium"
                        >
                          Select
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-sm text-gray-500 text-center">
                      No drugs found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Add Button */}
            <button
              onClick={handleAddPrescription}
              disabled={!formData.medication || !formData.dosage}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Prescription
            </button>
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-2">
        {items.length === 0 && (
          <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Pill className="h-6 w-6 mx-auto mb-2 text-gray-400" />
            <p>No prescriptions added yet</p>
          </div>
        )}

        {items.map((item, index) => {
          const timingText = item.frequency || '';
          const instructionText = item.dosageInstruction?.[0]?.text || item.instructions || '';

          return (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-purple-600">#{index + 1}</span>
                    <Pill className="h-4 w-4 text-purple-600" />
                    <h4 className="text-sm font-bold text-gray-900">
                      {getMedicationName(item)}
                    </h4>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
                    <span>
                      <span className="font-medium text-gray-700">Dose:</span> {item.dosage || '-'}
                    </span>
                    {timingText && (
                      <span>
                        <span className="font-medium text-gray-700">Timing:</span> {timingText}
                      </span>
                    )}
                    {item.duration && (
                      <span>
                        <span className="font-medium text-gray-700">Duration:</span> {item.duration}
                      </span>
                    )}
                  </div>

                  {instructionText && (
                    <div className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 mt-2">
                      {instructionText}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors shrink-0"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
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
