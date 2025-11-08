import React from 'react';

interface ProcedureOrderFormData {
  procedureCode: string;
  procedureName: string;
  priority: string;
  status: string;
  reasonCode: string;
  reasonDescription: string;
  bodySite: string;
  performerType: string;
  scheduledDate: string;
  instructions: string;
  notes: string;
}

interface ProcedureOrderSubTabProps {
  encounterId: string;
  formData: ProcedureOrderFormData;
  onFieldChange: (field: keyof ProcedureOrderFormData, value: string) => void;
  onSave: () => void;
  isEditing: boolean;
}

/**
 * ProcedureOrderSubTab - Form for ordering procedures
 */
export function ProcedureOrderSubTab({
  encounterId,
  formData,
  onFieldChange,
  onSave,
  isEditing
}: ProcedureOrderSubTabProps) {
  return (
    <div className="bg-white border border-gray-200 rounded p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Procedure Order</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Procedure Code
            </label>
            <input
              type="text"
              value={formData.procedureCode}
              onChange={(e) => onFieldChange('procedureCode', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="CPT/HCPCS code"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Procedure Name
            </label>
            <input
              type="text"
              value={formData.procedureName}
              onChange={(e) => onFieldChange('procedureName', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="Procedure name"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
              <option value="asap">ASAP</option>
              <option value="stat">STAT</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => onFieldChange('status', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            >
              <option value="">Select status...</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Reason Code
            </label>
            <input
              type="text"
              value={formData.reasonCode}
              onChange={(e) => onFieldChange('reasonCode', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="ICD-10 code"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Reason Description
            </label>
            <input
              type="text"
              value={formData.reasonDescription}
              onChange={(e) => onFieldChange('reasonDescription', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
              placeholder="Clinical indication"
            />
          </div>
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
            placeholder="e.g., Right knee, Left shoulder"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Performer Type
            </label>
            <select
              value={formData.performerType}
              onChange={(e) => onFieldChange('performerType', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            >
              <option value="">Select performer...</option>
              <option value="physician">Physician</option>
              <option value="surgeon">Surgeon</option>
              <option value="specialist">Specialist</option>
              <option value="nurse">Nurse</option>
              <option value="technician">Technician</option>
              <option value="other">Other</option>
            </select>
          </div>
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
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Instructions
          </label>
          <textarea
            value={formData.instructions}
            onChange={(e) => onFieldChange('instructions', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows={3}
            placeholder="Special instructions for the procedure..."
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
