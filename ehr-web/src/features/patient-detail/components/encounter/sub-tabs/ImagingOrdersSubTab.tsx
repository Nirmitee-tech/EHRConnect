import React from 'react';

interface ImagingOrdersFormData {
  imagingType: string;
  procedureCode: string;
  bodySite: string;
  laterality: string;
  priority: string;
  indication: string;
  clinicalQuestion: string;
  contrast: string;
  scheduledDate: string;
  performingFacility: string;
  specialInstructions: string;
  notes: string;
}

interface ImagingOrdersSubTabProps {
  encounterId: string;
  formData: ImagingOrdersFormData;
  onFieldChange: (field: keyof ImagingOrdersFormData, value: string) => void;
  onSave: () => void;
  isEditing: boolean;
}

/**
 * ImagingOrdersSubTab - Form for ordering imaging studies
 */
export function ImagingOrdersSubTab({
  encounterId,
  formData,
  onFieldChange,
  onSave,
  isEditing
}: ImagingOrdersSubTabProps) {
  return (
    <div className="bg-white border border-gray-200 rounded p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Imaging Order</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Imaging Type
            </label>
            <select
              value={formData.imagingType}
              onChange={(e) => onFieldChange('imagingType', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            >
              <option value="">Select type...</option>
              <option value="x-ray">X-Ray</option>
              <option value="ct">CT Scan</option>
              <option value="mri">MRI</option>
              <option value="ultrasound">Ultrasound</option>
              <option value="pet">PET Scan</option>
              <option value="mammography">Mammography</option>
              <option value="dexa">DEXA</option>
              <option value="fluoroscopy">Fluoroscopy</option>
              <option value="nuclear">Nuclear Medicine</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Procedure Code (CPT)
            </label>
            <input
              type="text"
              value={formData.procedureCode}
              onChange={(e) => onFieldChange('procedureCode', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="CPT code"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Body Site
            </label>
            <input
              type="text"
              value={formData.bodySite}
              onChange={(e) => onFieldChange('bodySite', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="e.g., Chest, Abdomen, Knee"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Laterality
            </label>
            <select
              value={formData.laterality}
              onChange={(e) => onFieldChange('laterality', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            >
              <option value="">Select laterality...</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="bilateral">Bilateral</option>
              <option value="n/a">N/A</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => onFieldChange('priority', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          >
            <option value="">Select priority...</option>
            <option value="routine">Routine</option>
            <option value="urgent">Urgent</option>
            <option value="stat">STAT</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Clinical Indication
          </label>
          <textarea
            value={formData.indication}
            onChange={(e) => onFieldChange('indication', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows={2}
            placeholder="Reason for the imaging study..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Clinical Question
          </label>
          <textarea
            value={formData.clinicalQuestion}
            onChange={(e) => onFieldChange('clinicalQuestion', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows={2}
            placeholder="What question should the imaging answer?"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Contrast
          </label>
          <select
            value={formData.contrast}
            onChange={(e) => onFieldChange('contrast', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          >
            <option value="">Select contrast...</option>
            <option value="without">Without Contrast</option>
            <option value="with">With Contrast</option>
            <option value="with-and-without">With and Without Contrast</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Scheduled Date
            </label>
            <input
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => onFieldChange('scheduledDate', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Performing Facility
            </label>
            <input
              type="text"
              value={formData.performingFacility}
              onChange={(e) => onFieldChange('performingFacility', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="Facility name"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Special Instructions
          </label>
          <textarea
            value={formData.specialInstructions}
            onChange={(e) => onFieldChange('specialInstructions', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows={2}
            placeholder="NPO instructions, prep requirements, etc..."
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
            rows={2}
            placeholder="Additional notes..."
          />
        </div>

        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
        >
          {isEditing ? 'Update Order' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}
