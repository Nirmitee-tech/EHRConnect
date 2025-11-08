import React from 'react';
import { ROS_SYSTEMS } from '../../../config/review-of-systems';

interface ReviewOfSystemsSubTabProps {
  encounterId: string;
  formData: { [system: string]: string };
  onFieldChange: (system: string, value: string) => void;
  onSave: () => void;
  isEditing: boolean;
}

/**
 * ReviewOfSystemsSubTab - Form for documenting Review of Systems
 */
export function ReviewOfSystemsSubTab({
  encounterId,
  formData,
  onFieldChange,
  onSave,
  isEditing
}: ReviewOfSystemsSubTabProps) {
  return (
    <div className="bg-white border border-gray-200 rounded p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Review of Systems
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {ROS_SYSTEMS.map((system) => (
          <div key={system} className="border border-gray-200 rounded p-3">
            <label className="flex items-center gap-2 mb-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm font-medium text-gray-900">{system}</span>
            </label>
            <textarea
              value={formData[system] || ''}
              onChange={(e) => onFieldChange(system, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-xs"
              rows={2}
              placeholder="Details..."
            />
          </div>
        ))}
      </div>
      <button
        onClick={onSave}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
      >
        {isEditing ? 'Update ROS' : 'Save ROS'}
      </button>
    </div>
  );
}
