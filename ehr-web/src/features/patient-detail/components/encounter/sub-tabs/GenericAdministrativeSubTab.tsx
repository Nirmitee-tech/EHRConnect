import React from 'react';

interface GenericAdministrativeFormData {
  title: string;
  category: string;
  content: string;
  dueDate?: string;
  priority?: string;
  status?: string;
  assignedTo?: string;
  notes: string;
}

interface GenericAdministrativeSubTabProps {
  encounterId: string;
  sectionType: string;
  sectionTitle: string;
  formData: GenericAdministrativeFormData;
  onFieldChange: (field: keyof GenericAdministrativeFormData, value: string) => void;
  onSave: () => void;
  isEditing: boolean;
}

/**
 * GenericAdministrativeSubTab - Flexible form for administrative sections
 * Used for Forms, Track Anything, Reminders, Amendments, Letters, ROS Checks
 */
export function GenericAdministrativeSubTab({
  encounterId,
  sectionType,
  sectionTitle,
  formData,
  onFieldChange,
  onSave,
  isEditing
}: GenericAdministrativeSubTabProps) {
  const getCategoryOptions = () => {
    switch (sectionType) {
      case 'forms':
        return ['Consent Form', 'Authorization', 'Release of Information', 'Custom Form'];
      case 'track-anything':
        return ['Measurement', 'Activity', 'Symptom', 'Goal', 'Custom'];
      case 'patient-reminders':
      case 'clinical-reminders':
        return ['Appointment', 'Medication', 'Test', 'Follow-up', 'Preventive Care'];
      case 'amendments':
        return ['Correction', 'Addition', 'Deletion', 'Update'];
      case 'letters':
        return ['Referral Letter', 'Consultation Request', 'Patient Letter', 'Insurance Letter'];
      case 'review-of-systems-checks':
        return ['Constitutional', 'Cardiovascular', 'Respiratory', 'GI', 'Other'];
      default:
        return ['General', 'Important', 'Follow-up'];
    }
  };

  const showDueDate = ['patient-reminders', 'clinical-reminders', 'track-anything'].includes(sectionType);
  const showPriority = ['patient-reminders', 'clinical-reminders', 'amendments'].includes(sectionType);
  const showStatus = ['track-anything', 'amendments', 'patient-reminders', 'clinical-reminders'].includes(sectionType);
  const showAssignedTo = ['track-anything', 'clinical-reminders'].includes(sectionType);

  return (
    <div className="bg-white border border-gray-200 rounded p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{sectionTitle}</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => onFieldChange('title', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
            placeholder="Title or subject"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => onFieldChange('category', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          >
            <option value="">Select category...</option>
            {getCategoryOptions().map(opt => (
              <option key={opt} value={opt.toLowerCase().replace(/\s+/g, '-')}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Content
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => onFieldChange('content', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows={8}
            placeholder="Enter the main content..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {showDueDate && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => onFieldChange('dueDate', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              />
            </div>
          )}

          {showPriority && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Priority
              </label>
              <select
                value={formData.priority || ''}
                onChange={(e) => onFieldChange('priority', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              >
                <option value="">Select priority...</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          )}

          {showStatus && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Status
              </label>
              <select
                value={formData.status || ''}
                onChange={(e) => onFieldChange('status', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              >
                <option value="">Select status...</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          {showAssignedTo && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Assigned To
              </label>
              <input
                type="text"
                value={formData.assignedTo || ''}
                onChange={(e) => onFieldChange('assignedTo', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="Person or role"
              />
            </div>
          )}
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
          className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90"
        >
          {isEditing ? 'Update' : 'Save'}
        </button>
      </div>
    </div>
  );
}
