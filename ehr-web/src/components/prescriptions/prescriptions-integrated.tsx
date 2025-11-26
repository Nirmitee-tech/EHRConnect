'use client';

import React, { useState, useEffect } from 'react';
import { Prescription } from '@/types/encounter';
import { Zap, Layout, Grid, FileText, Pill, Trash2, Copy } from 'lucide-react';
import { PrescriptionInlineSimple } from './prescription-inline-simple';
import { PrescriptionCompactCards } from './prescription-compact-cards';
import { PrescriptionQuickSelect } from './prescription-quick-select';
import { PrescriptionDetailedForm } from './prescription-detailed-form';

/**
 * INTEGRATED PRESCRIPTIONS COMPONENT
 *
 * All 4 UI variations in one component with mode switcher
 * Use in encounters and anywhere you need prescriptions
 */

type PrescriptionMode = 'inline' | 'cards' | 'quick' | 'detailed';

interface PrescriptionsIntegratedProps {
  prescriptions: Prescription[];
  onUpdate: (prescriptions: Prescription[]) => void;
  defaultMode?: PrescriptionMode;
}

export function PrescriptionsIntegrated({
  prescriptions = [],
  onUpdate,
  defaultMode = 'cards'
}: PrescriptionsIntegratedProps) {
  const [mode, setMode] = useState<PrescriptionMode>(defaultMode);
  const [items, setItems] = useState<Prescription[]>(prescriptions);
  const [showInlineAdd, setShowInlineAdd] = useState(false);
  const [showDetailedForm, setShowDetailedForm] = useState(false);

  useEffect(() => {
    setItems(prescriptions);
  }, [prescriptions]);

  const handleAdd = (prescription: Prescription) => {
    const updated = [...items, prescription];
    setItems(updated);
    onUpdate(updated);
    setShowInlineAdd(false);
    setShowDetailedForm(false);
  };

  const handleUpdate = (updated: Prescription[]) => {
    setItems(updated);
    onUpdate(updated);
  };

  const handleDelete = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    onUpdate(updated);
  };

  const handleDuplicate = (prescription: Prescription) => {
    const duplicated = {
      ...prescription,
      id: `rx-${Date.now()}`,
      authoredOn: new Date().toISOString()
    };
    const updated = [...items, duplicated];
    setItems(updated);
    onUpdate(updated);
  };

  return (
    <div className="space-y-4">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-700">Prescriptions ({items.length})</h3>
          <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-0.5 bg-white">
            <button
              onClick={() => setMode('inline')}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition ${
                mode === 'inline'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Inline Simple (5s)"
            >
              <Zap className="h-3 w-3" />
              Inline
            </button>
            <button
              onClick={() => setMode('cards')}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition ${
                mode === 'cards'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Compact Cards (10-15s)"
            >
              <Layout className="h-3 w-3" />
              Cards
            </button>
            <button
              onClick={() => setMode('quick')}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition ${
                mode === 'quick'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Quick Select (2-5s)"
            >
              <Grid className="h-3 w-3" />
              Quick
            </button>
            <button
              onClick={() => setMode('detailed')}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition ${
                mode === 'detailed'
                  ? 'bg-gray-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Detailed Form (30-60s)"
            >
              <FileText className="h-3 w-3" />
              Detailed
            </button>
          </div>
        </div>

        {/* Mode-specific action button */}
        {mode === 'inline' && !showInlineAdd && (
          <button
            onClick={() => setShowInlineAdd(true)}
            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            Quick Add
          </button>
        )}
        {mode === 'detailed' && !showDetailedForm && (
          <button
            onClick={() => setShowDetailedForm(true)}
            className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
          >
            Detailed Form
          </button>
        )}
      </div>

      {/* Content Area */}
      <div>
        {/* Mode 1: Inline Simple */}
        {mode === 'inline' && (
          <div className="space-y-3">
            {showInlineAdd && (
              <PrescriptionInlineSimple
                onAdd={handleAdd}
                onCancel={() => setShowInlineAdd(false)}
              />
            )}

            {/* Simple list view */}
            <div className="space-y-2">
              {items.map((rx) => (
                <div
                  key={rx.id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Pill className="h-4 w-4 text-green-600" />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {rx.medication || rx.medicationCodeableConcept?.text}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {rx.dosage} • {rx.frequency}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicate(rx)}
                      className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(rx.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {items.length === 0 && !showInlineAdd && (
                <div className="text-center py-6 text-sm text-gray-500 border border-dashed border-gray-300 rounded">
                  No prescriptions. Click "Quick Add" to add one.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mode 2: Compact Cards */}
        {mode === 'cards' && (
          <PrescriptionCompactCards
            prescriptions={items}
            onUpdate={handleUpdate}
          />
        )}

        {/* Mode 3: Quick Select */}
        {mode === 'quick' && (
          <div className="space-y-3">
            <PrescriptionQuickSelect onAdd={handleAdd} />

            {/* Show added prescriptions */}
            {items.length > 0 && (
              <div className="border-t pt-3">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Added ({items.length})</h4>
                <div className="space-y-2">
                  {items.map((rx) => (
                    <div
                      key={rx.id}
                      className="flex items-center justify-between p-2 bg-purple-50 border border-purple-200 rounded text-xs"
                    >
                      <span className="font-medium text-gray-900">
                        {rx.medication || rx.medicationCodeableConcept?.text}
                      </span>
                      <button
                        onClick={() => handleDelete(rx.id)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mode 4: Detailed Form */}
        {mode === 'detailed' && (
          <div className="space-y-3">
            {showDetailedForm && (
              <PrescriptionDetailedForm
                onSave={handleAdd}
                onCancel={() => setShowDetailedForm(false)}
              />
            )}

            {/* Show added prescriptions */}
            {items.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-2">Added Prescriptions ({items.length})</h4>
                <div className="space-y-2">
                  {items.map((rx) => (
                    <div
                      key={rx.id}
                      className="p-3 bg-white border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-gray-900">
                            {rx.medication || rx.medicationCodeableConcept?.text}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {rx.dosage} • {rx.frequency}
                            {rx.duration && ` • ${rx.duration}`}
                          </p>
                          {rx.instructions && (
                            <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded mt-1">
                              {rx.instructions}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(rx.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {items.length === 0 && !showDetailedForm && (
              <div className="text-center py-8 text-sm text-gray-500 border border-dashed border-gray-300 rounded">
                No prescriptions. Click "Detailed Form" to add one.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
