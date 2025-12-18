'use client';

import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface AmcRequirement {
  id: string;
  label: string;
  tooltip: string;
  checked: boolean;
  indented?: boolean;
}

interface AmcRequiresPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  encounterId: string;
  onSave?: (requirements: AmcRequirement[]) => void;
}

const AMC_REQUIREMENTS: Omit<AmcRequirement, 'checked'>[] = [
  {
    id: 'education_resources',
    label: 'Provided Education Resource(s)?',
    tooltip: 'Patient-specific education resources were provided during this encounter (e.g., care instructions, educational materials, health information)',
  },
  {
    id: 'clinical_summary',
    label: 'Provided Clinical Summary?',
    tooltip: 'A clinical summary of the visit was provided to the patient within the required timeframe',
  },
  {
    id: 'transition_care',
    label: 'Transition/Transfer of Care?',
    tooltip: 'This encounter involves a care transition or transfer (e.g., hospital discharge, referral to specialist)',
  },
  {
    id: 'medication_reconciliation',
    label: 'Medication Reconciliation Performed?',
    tooltip: 'A complete medication reconciliation was performed and documented, comparing current medications with new orders',
    indented: true,
  },
  {
    id: 'summary_care_provided',
    label: 'Summary of Care Provided?',
    tooltip: 'A comprehensive summary of care document was created and transmitted electronically for transitions of care',
    indented: true,
  },
];

export default function AmcRequiresPopover({
  isOpen,
  onClose,
  encounterId,
  onSave,
}: AmcRequiresPopoverProps) {
  const [requirements, setRequirements] = useState<AmcRequirement[]>(
    AMC_REQUIREMENTS.map(req => ({ ...req, checked: false }))
  );
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckboxChange = (id: string) => {
    setRequirements(prev =>
      prev.map(req => (req.id === id ? { ...req, checked: !req.checked } : req))
    );
  };

  const handleSave = () => {
    onSave?.(requirements);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Popover */}
      <div className="absolute right-0 top-12 z-50 w-80 bg-white border border-gray-300 rounded-lg shadow-xl">
        {/* Header */}
        <div className="px-4 py-3 bg-blue-50 border-b border-gray-200 rounded-t-lg">
          <h3 className="text-sm font-semibold text-blue-700">AMC Requires</h3>
          <p className="text-xs text-gray-600 mt-1">
            Check applicable quality measures for this encounter
          </p>
        </div>

        {/* Requirements List */}
        <div className="px-4 py-3 space-y-3 max-h-96 overflow-y-auto">
          {requirements.map((req) => (
            <div
              key={req.id}
              className={`flex items-start gap-2 ${req.indented ? 'ml-6' : ''}`}
            >
              <input
                type="checkbox"
                id={req.id}
                checked={req.checked}
                onChange={() => handleCheckboxChange(req.id)}
                className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1 flex items-start gap-1">
                <label
                  htmlFor={req.id}
                  className="text-sm text-gray-700 cursor-pointer select-none"
                >
                  {req.label}
                </label>
                <div className="relative inline-block">
                  <button
                    type="button"
                    onMouseEnter={() => setHoveredTooltip(req.id)}
                    onMouseLeave={() => setHoveredTooltip(null)}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Info className="h-4 w-4" />
                  </button>

                  {/* Tooltip */}
                  {hoveredTooltip === req.id && (
                    <div className="absolute left-0 top-6 z-[100] w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                      <div className="absolute -top-2 left-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900" />
                      {req.tooltip}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:opacity-90 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
}
