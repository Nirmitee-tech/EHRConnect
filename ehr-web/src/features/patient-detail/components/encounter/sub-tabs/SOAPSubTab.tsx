import React from 'react';

interface SOAPFormData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface SOAPSubTabProps {
  encounterId: string;
  formData: SOAPFormData;
  onFieldChange: (field: keyof SOAPFormData, value: string) => void;
  onSave: () => void;
  isEditing: boolean;
}

/**
 * SOAPSubTab - Form for creating/editing SOAP notes
 */
export function SOAPSubTab({
  encounterId,
  formData,
  onFieldChange,
  onSave,
  isEditing
}: SOAPSubTabProps) {
  return (
    <div className="bg-white border border-gray-200 rounded p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">SOAP Note</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Subjective
          </label>
          <textarea
            value={formData.subjective}
            onChange={(e) => onFieldChange('subjective', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows={4}
            placeholder="Patient's subjective complaints and history..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Objective
          </label>
          <textarea
            value={formData.objective}
            onChange={(e) => onFieldChange('objective', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows={4}
            placeholder="Clinical findings, vitals, exam results..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Assessment
          </label>
          <textarea
            value={formData.assessment}
            onChange={(e) => onFieldChange('assessment', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows={4}
            placeholder="Clinical assessment and diagnosis..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Plan
          </label>
          <textarea
            value={formData.plan}
            onChange={(e) => onFieldChange('plan', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows={4}
            placeholder="Treatment plan and follow-up..."
          />
        </div>

        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
        >
          {isEditing ? 'Update SOAP Note' : 'Save SOAP Note'}
        </button>
      </div>
    </div>
  );
}
