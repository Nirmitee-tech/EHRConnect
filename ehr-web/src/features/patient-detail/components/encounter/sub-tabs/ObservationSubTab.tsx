import React from 'react';

interface ObservationFormData {
  observationType: string;
  observationCode: string;
  value: string;
  unit: string;
  interpretation: string;
  method: string;
  bodySite: string;
  notes: string;
}

interface ObservationSubTabProps {
  encounterId: string;
  formData: ObservationFormData;
  onFieldChange: (field: keyof ObservationFormData, value: string) => void;
  onSave: () => void;
  isEditing: boolean;
}

/**
 * ObservationSubTab - Form for clinical observations
 */
export function ObservationSubTab({
  encounterId,
  formData,
  onFieldChange,
  onSave,
  isEditing
}: ObservationSubTabProps) {
  return (
    <div className="bg-white border border-gray-200 rounded p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinical Observation</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Observation Type
          </label>
          <select
            value={formData.observationType}
            onChange={(e) => onFieldChange('observationType', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          >
            <option value="">Select type...</option>
            <option value="vital-sign">Vital Sign</option>
            <option value="laboratory">Laboratory</option>
            <option value="imaging">Imaging</option>
            <option value="procedure">Procedure</option>
            <option value="survey">Survey</option>
            <option value="exam">Exam</option>
            <option value="therapy">Therapy</option>
            <option value="activity">Activity</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Observation Code/Name
          </label>
          <input
            type="text"
            value={formData.observationCode}
            onChange={(e) => onFieldChange('observationCode', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
            placeholder="e.g., Blood Pressure, Blood Glucose"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Value
            </label>
            <input
              type="text"
              value={formData.value}
              onChange={(e) => onFieldChange('value', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="e.g., 120/80"
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
              placeholder="e.g., mmHg, mg/dL"
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
            <option value="critical">Critical</option>
            <option value="abnormal">Abnormal</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Method
          </label>
          <input
            type="text"
            value={formData.method}
            onChange={(e) => onFieldChange('method', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
            placeholder="Measurement method or technique"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Body Site
          </label>
          <input
            type="text"
            value={formData.bodySite}
            onChange={(e) => onFieldChange('bodySite', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
            placeholder="e.g., Left arm, Right thigh"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => onFieldChange('notes', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows={4}
            placeholder="Additional notes and context..."
          />
        </div>

        <button
          onClick={onSave}
          className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90"
        >
          {isEditing ? 'Update Observation' : 'Save Observation'}
        </button>
      </div>
    </div>
  );
}
