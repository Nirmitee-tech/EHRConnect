import React from 'react';

interface LabResultsFormData {
  testName: string;
  testCode: string;
  result: string;
  unit: string;
  referenceRange: string;
  interpretation: string;
  specimenType: string;
  collectionDate: string;
  resultDate: string;
  performingLab: string;
  notes: string;
}

interface LabResultsSubTabProps {
  encounterId: string;
  formData: LabResultsFormData;
  onFieldChange: (field: keyof LabResultsFormData, value: string) => void;
  onSave: () => void;
  isEditing: boolean;
}

/**
 * LabResultsSubTab - Form for recording lab results
 */
export function LabResultsSubTab({
  encounterId,
  formData,
  onFieldChange,
  onSave,
  isEditing
}: LabResultsSubTabProps) {
  return (
    <div className="bg-white border border-gray-200 rounded p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Lab Results</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Test Name
            </label>
            <input
              type="text"
              value={formData.testName}
              onChange={(e) => onFieldChange('testName', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="e.g., Complete Blood Count"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Test Code (LOINC)
            </label>
            <input
              type="text"
              value={formData.testCode}
              onChange={(e) => onFieldChange('testCode', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="LOINC code"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Result
            </label>
            <input
              type="text"
              value={formData.result}
              onChange={(e) => onFieldChange('result', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="Value"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Unit
            </label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => onFieldChange('unit', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="mg/dL, mmol/L, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Reference Range
            </label>
            <input
              type="text"
              value={formData.referenceRange}
              onChange={(e) => onFieldChange('referenceRange', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="Normal range"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Interpretation
          </label>
          <select
            value={formData.interpretation}
            onChange={(e) => onFieldChange('interpretation', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          >
            <option value="">Select interpretation...</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
            <option value="high">High</option>
            <option value="critical-low">Critical Low</option>
            <option value="critical-high">Critical High</option>
            <option value="abnormal">Abnormal</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Specimen Type
          </label>
          <select
            value={formData.specimenType}
            onChange={(e) => onFieldChange('specimenType', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          >
            <option value="">Select specimen...</option>
            <option value="blood">Blood</option>
            <option value="serum">Serum</option>
            <option value="plasma">Plasma</option>
            <option value="urine">Urine</option>
            <option value="tissue">Tissue</option>
            <option value="csf">CSF</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Collection Date
            </label>
            <input
              type="datetime-local"
              value={formData.collectionDate}
              onChange={(e) => onFieldChange('collectionDate', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Result Date
            </label>
            <input
              type="datetime-local"
              value={formData.resultDate}
              onChange={(e) => onFieldChange('resultDate', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Performing Laboratory
          </label>
          <input
            type="text"
            value={formData.performingLab}
            onChange={(e) => onFieldChange('performingLab', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
            placeholder="Lab facility name"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Additional Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => onFieldChange('notes', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows={3}
            placeholder="Additional notes and observations..."
          />
        </div>

        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
        >
          {isEditing ? 'Update Lab Result' : 'Save Lab Result'}
        </button>
      </div>
    </div>
  );
}
