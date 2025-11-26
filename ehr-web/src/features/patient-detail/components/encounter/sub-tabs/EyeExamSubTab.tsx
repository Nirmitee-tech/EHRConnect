import React from 'react';

interface EyeExamFormData {
  visualAcuityOD: string;
  visualAcuityOS: string;
  intraocularPressureOD: string;
  intraocularPressureOS: string;
  pupilsOD: string;
  pupilsOS: string;
  externalExam: string;
  anteriorSegment: string;
  posteriorSegment: string;
  fundusOD: string;
  fundusOS: string;
  notes: string;
}

interface EyeExamSubTabProps {
  encounterId: string;
  formData: EyeExamFormData;
  onFieldChange: (field: keyof EyeExamFormData, value: string) => void;
  onSave: () => void;
  isEditing: boolean;
}

/**
 * EyeExamSubTab - Form for ophthalmology examination
 */
export function EyeExamSubTab({
  encounterId,
  formData,
  onFieldChange,
  onSave,
  isEditing
}: EyeExamSubTabProps) {
  return (
    <div className="bg-white border border-gray-200 rounded p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Eye Examination</h3>
      <div className="space-y-4">
        {/* Visual Acuity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Visual Acuity - OD (Right Eye)
            </label>
            <input
              type="text"
              value={formData.visualAcuityOD}
              onChange={(e) => onFieldChange('visualAcuityOD', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="e.g., 20/20"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Visual Acuity - OS (Left Eye)
            </label>
            <input
              type="text"
              value={formData.visualAcuityOS}
              onChange={(e) => onFieldChange('visualAcuityOS', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="e.g., 20/20"
            />
          </div>
        </div>

        {/* Intraocular Pressure */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              IOP - OD (mmHg)
            </label>
            <input
              type="text"
              value={formData.intraocularPressureOD}
              onChange={(e) => onFieldChange('intraocularPressureOD', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="e.g., 15"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              IOP - OS (mmHg)
            </label>
            <input
              type="text"
              value={formData.intraocularPressureOS}
              onChange={(e) => onFieldChange('intraocularPressureOS', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="e.g., 15"
            />
          </div>
        </div>

        {/* Pupils */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Pupils - OD
            </label>
            <input
              type="text"
              value={formData.pupilsOD}
              onChange={(e) => onFieldChange('pupilsOD', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="e.g., PERRLA"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Pupils - OS
            </label>
            <input
              type="text"
              value={formData.pupilsOS}
              onChange={(e) => onFieldChange('pupilsOS', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="e.g., PERRLA"
            />
          </div>
        </div>

        {/* External Exam */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            External Examination
          </label>
          <textarea
            value={formData.externalExam}
            onChange={(e) => onFieldChange('externalExam', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows={3}
            placeholder="Eyelids, lashes, lacrimal system..."
          />
        </div>

        {/* Anterior Segment */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Anterior Segment
          </label>
          <textarea
            value={formData.anteriorSegment}
            onChange={(e) => onFieldChange('anteriorSegment', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows={3}
            placeholder="Conjunctiva, cornea, anterior chamber, iris, lens..."
          />
        </div>

        {/* Posterior Segment */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Posterior Segment
          </label>
          <textarea
            value={formData.posteriorSegment}
            onChange={(e) => onFieldChange('posteriorSegment', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows={3}
            placeholder="Vitreous, optic disc, macula, vessels, retina..."
          />
        </div>

        {/* Fundus */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Fundus - OD
            </label>
            <textarea
              value={formData.fundusOD}
              onChange={(e) => onFieldChange('fundusOD', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded text-sm"
              rows={3}
              placeholder="Right eye fundus findings..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Fundus - OS
            </label>
            <textarea
              value={formData.fundusOS}
              onChange={(e) => onFieldChange('fundusOS', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded text-sm"
              rows={3}
              placeholder="Left eye fundus findings..."
            />
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Additional Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => onFieldChange('notes', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows={3}
            placeholder="Additional examination notes..."
          />
        </div>

        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
        >
          {isEditing ? 'Update Eye Exam' : 'Save Eye Exam'}
        </button>
      </div>
    </div>
  );
}
