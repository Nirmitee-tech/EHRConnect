'use client';

import React, { useState } from 'react';
import { PrescriptionInlineSimple } from '@/components/prescriptions/prescription-inline-simple';
import { PrescriptionCompactCards } from '@/components/prescriptions/prescription-compact-cards';
import { PrescriptionQuickSelect } from '@/components/prescriptions/prescription-quick-select';
import { PrescriptionDetailedForm } from '@/components/prescriptions/prescription-detailed-form';
import { Prescription } from '@/types/encounter';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

/**
 * DEMO PAGE - All 4 Prescription UI Variations
 *
 * Navigate to: /demo/prescriptions
 *
 * Compare all 4 variations side by side
 */

export default function PrescriptionDemoPage() {
  const [variation, setVariation] = useState<1 | 2 | 3 | 4>(1);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [showInline, setShowInline] = useState(false);

  const handleAdd = (rx: Prescription) => {
    setPrescriptions([...prescriptions, rx]);
    setShowInline(false);
  };

  const handleUpdate = (rxs: Prescription[]) => {
    setPrescriptions(rxs);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Prescription UI Variations Demo
          </h1>
          <p className="text-gray-600">
            Compare 4 different prescription interfaces designed for clinical workflows
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setVariation(1)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
              variation === 1
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            1. Inline Simple
            <span className="block text-xs text-gray-500">⚡ 5 seconds</span>
          </button>
          <button
            onClick={() => setVariation(2)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
              variation === 2
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            2. Compact Cards
            <span className="block text-xs text-gray-500">⏱️ 10-15 seconds</span>
          </button>
          <button
            onClick={() => setVariation(3)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
              variation === 3
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            3. Quick Select
            <span className="block text-xs text-gray-500">🚀 2-5 seconds</span>
          </button>
          <button
            onClick={() => setVariation(4)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
              variation === 4
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            4. Detailed Form
            <span className="block text-xs text-gray-500">📋 30-60 seconds</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Demo UI */}
          <div className="col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Variation 1 */}
              {variation === 1 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Variation 1: Inline Simple</h2>
                    <p className="text-sm text-gray-600 mb-4">
                      Single-row form for quick medication entry. Perfect for medications tab.
                    </p>
                  </div>

                  {!showInline ? (
                    <button
                      onClick={() => setShowInline(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Show Quick Add Form
                    </button>
                  ) : (
                    <PrescriptionInlineSimple
                      onAdd={handleAdd}
                      onCancel={() => setShowInline(false)}
                    />
                  )}
                </div>
              )}

              {/* Variation 2 */}
              {variation === 2 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Variation 2: Compact Cards</h2>
                    <p className="text-sm text-gray-600 mb-4">
                      Stacked cards for multiple prescriptions. Great for encounters.
                    </p>
                  </div>

                  <PrescriptionCompactCards
                    prescriptions={prescriptions}
                    onUpdate={handleUpdate}
                  />
                </div>
              )}

              {/* Variation 3 */}
              {variation === 3 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Variation 3: Quick Select</h2>
                    <p className="text-sm text-gray-600 mb-4">
                      One-click common medications. Fastest option for busy clinics.
                    </p>
                  </div>

                  <PrescriptionQuickSelect onAdd={handleAdd} />
                </div>
              )}

              {/* Variation 4 */}
              {variation === 4 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Variation 4: Detailed Form</h2>
                    <p className="text-sm text-gray-600 mb-4">
                      Complete FHIR-compliant form. For complex prescriptions.
                    </p>
                  </div>

                  <PrescriptionDetailedForm
                    onSave={handleAdd}
                    onCancel={() => {}}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right: Info Panel */}
          <div className="col-span-1 space-y-4">
            {/* Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Prescriptions Added</h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {prescriptions.length}
              </div>
              <button
                onClick={() => setPrescriptions([])}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Clear all
              </button>
            </div>

            {/* Current Variation Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Current Variation</h3>

              {variation === 1 && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Speed:</span>
                    <span className="font-medium">⚡ 5 seconds</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fields:</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Clicks:</span>
                    <span className="font-medium">1</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-600">
                      <strong>Use for:</strong> Quick add in medications tab, routine prescriptions
                    </p>
                  </div>
                </div>
              )}

              {variation === 2 && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Speed:</span>
                    <span className="font-medium">⏱️ 10-15 seconds</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fields:</span>
                    <span className="font-medium">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Clicks:</span>
                    <span className="font-medium">2</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-600">
                      <strong>Use for:</strong> Encounter prescriptions, multiple medications
                    </p>
                  </div>
                </div>
              )}

              {variation === 3 && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Speed:</span>
                    <span className="font-medium">🚀 2-5 seconds</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fields:</span>
                    <span className="font-medium">0 (pre-filled)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Clicks:</span>
                    <span className="font-medium">1</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-600">
                      <strong>Use for:</strong> Common meds, high-volume clinics, ER
                    </p>
                  </div>
                </div>
              )}

              {variation === 4 && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Speed:</span>
                    <span className="font-medium">📋 30-60 seconds</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fields:</span>
                    <span className="font-medium">10+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Clicks:</span>
                    <span className="font-medium">1</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-600">
                      <strong>Use for:</strong> Complex prescriptions, teaching, chemotherapy
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Recent Prescriptions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Recent Prescriptions</h3>
              {prescriptions.length === 0 ? (
                <p className="text-xs text-gray-500">No prescriptions yet. Try adding one!</p>
              ) : (
                <div className="space-y-2">
                  {prescriptions.slice(-3).reverse().map((rx) => (
                    <div key={rx.id} className="text-xs p-2 bg-gray-50 rounded">
                      <div className="font-medium text-gray-900 truncate">
                        {rx.medication || rx.medicationCodeableConcept?.text}
                      </div>
                      <div className="text-gray-600 text-xs">
                        {rx.dosage} • {rx.frequency}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom: Comparison Table */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Comparison</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4">Variation</th>
                <th className="text-left py-2 px-4">Speed</th>
                <th className="text-left py-2 px-4">Fields</th>
                <th className="text-left py-2 px-4">Best For</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-2 px-4 font-medium">1. Inline Simple</td>
                <td className="py-2 px-4">⚡ 5s</td>
                <td className="py-2 px-4">3</td>
                <td className="py-2 px-4">Routine meds, fast workflow</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-2 px-4 font-medium">2. Compact Cards</td>
                <td className="py-2 px-4">⏱️ 10-15s</td>
                <td className="py-2 px-4">5</td>
                <td className="py-2 px-4">Encounter documentation</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-2 px-4 font-medium">3. Quick Select</td>
                <td className="py-2 px-4">🚀 2-5s</td>
                <td className="py-2 px-4">0</td>
                <td className="py-2 px-4">Outpatient clinic, ER</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-2 px-4 font-medium">4. Detailed Form</td>
                <td className="py-2 px-4">📋 30-60s</td>
                <td className="py-2 px-4">10+</td>
                <td className="py-2 px-4">Teaching, detailed cases</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
