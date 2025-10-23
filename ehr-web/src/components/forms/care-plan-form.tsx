'use client';

import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';

interface CarePlanActivityReason {
  reasonCode: string;
  reasonStatus: string;
  reasonRecordingDate: string;
  reasonEndDate: string;
}

interface CarePlanActivity {
  code: string;
  date: string;
  type: string;
  description: string;
  status: string;
  reason?: CarePlanActivityReason;
}

interface CarePlanFormData {
  title?: string;
  description?: string;
  status: string;
  intent: string;
  activities: CarePlanActivity[];
}

interface CarePlanFormProps {
  encounterId: string;
  patientId: string;
  initialData?: CarePlanFormData;
  onSave: (data: CarePlanFormData) => Promise<void>;
  onCancel?: () => void;
}

// FHIR-compliant activity reference types
const ACTIVITY_TYPES = [
  'Appointment',
  'CommunicationRequest',
  'DeviceRequest',
  'MedicationRequest',
  'NutritionOrder',
  'Task',
  'ServiceRequest',
  'VisionPrescription'
];

// FHIR CarePlan statuses
const CAREPLAN_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'revoked', label: 'Revoked' },
  { value: 'completed', label: 'Completed' },
  { value: 'entered-in-error', label: 'Entered in Error' },
  { value: 'unknown', label: 'Unknown' }
];

// FHIR CarePlan intents
const CAREPLAN_INTENTS = [
  { value: 'proposal', label: 'Proposal' },
  { value: 'plan', label: 'Plan' },
  { value: 'order', label: 'Order' },
  { value: 'option', label: 'Option' }
];

// FHIR CarePlan activity statuses
const ACTIVITY_STATUSES = [
  { value: 'not-started', label: 'Not Started' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'stopped', label: 'Stopped' },
  { value: 'unknown', label: 'Unknown' },
  { value: 'entered-in-error', label: 'Entered in Error' }
];

export function CarePlanForm({
  encounterId,
  patientId,
  initialData,
  onSave,
  onCancel
}: CarePlanFormProps) {
  const [formData, setFormData] = useState<CarePlanFormData>(
    initialData || {
      title: '',
      description: '',
      status: 'active',
      intent: 'plan',
      activities: [
        {
          code: '',
          date: new Date().toISOString().split('T')[0],
          type: 'Task',
          description: '',
          status: 'not-started'
        }
      ]
    }
  );

  const [isSaving, setIsSaving] = useState(false);
  const [expandedReasons, setExpandedReasons] = useState<{ [key: number]: boolean }>({});

  const addActivity = () => {
    setFormData({
      ...formData,
      activities: [
        ...formData.activities,
        {
          code: '',
          date: new Date().toISOString().split('T')[0],
          type: 'Task',
          description: '',
          status: 'not-started'
        }
      ]
    });
  };

  const removeActivity = (index: number) => {
    if (formData.activities.length > 1) {
      const newActivities = formData.activities.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        activities: newActivities
      });
      const newExpandedReasons = { ...expandedReasons };
      delete newExpandedReasons[index];
      setExpandedReasons(newExpandedReasons);
    }
  };

  const updateActivity = (index: number, field: keyof CarePlanActivity, value: string) => {
    const newActivities = [...formData.activities];
    newActivities[index] = {
      ...newActivities[index],
      [field]: value
    };
    setFormData({
      ...formData,
      activities: newActivities
    });
  };

  const addReason = (activityIndex: number) => {
    const newActivities = [...formData.activities];
    newActivities[activityIndex] = {
      ...newActivities[activityIndex],
      reason: {
        reasonCode: '',
        reasonStatus: 'not-started',
        reasonRecordingDate: new Date().toISOString().split('T')[0],
        reasonEndDate: ''
      }
    };
    setFormData({
      ...formData,
      activities: newActivities
    });
    setExpandedReasons({
      ...expandedReasons,
      [activityIndex]: true
    });
  };

  const removeReason = (activityIndex: number) => {
    const newActivities = [...formData.activities];
    delete newActivities[activityIndex].reason;
    setFormData({
      ...formData,
      activities: newActivities
    });
    const newExpandedReasons = { ...expandedReasons };
    delete newExpandedReasons[activityIndex];
    setExpandedReasons(newExpandedReasons);
  };

  const updateActivityReason = (activityIndex: number, field: keyof CarePlanActivityReason, value: string) => {
    const newActivities = [...formData.activities];
    if (newActivities[activityIndex].reason) {
      newActivities[activityIndex] = {
        ...newActivities[activityIndex],
        reason: {
          ...newActivities[activityIndex].reason!,
          [field]: value
        }
      };
      setFormData({
        ...formData,
        activities: newActivities
      });
    }
  };

  const toggleReasonExpanded = (activityIndex: number) => {
    setExpandedReasons({
      ...expandedReasons,
      [activityIndex]: !expandedReasons[activityIndex]
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Care Plan Form</h2>

      {/* Care Plan Metadata */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Care Plan Status <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {CAREPLAN_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Intent <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.intent}
            onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {CAREPLAN_INTENTS.map((intent) => (
              <option key={intent.value} value={intent.value}>
                {intent.label}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title (Optional)
          </label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter care plan title"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            placeholder="Enter care plan description"
          />
        </div>
      </div>

      {/* Enter Details Section */}
      <div className="mb-6">
        <div className="bg-gray-100 px-4 py-2 mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Activities</h3>
          <span className="text-xs text-gray-500">FHIR CarePlan.activity</span>
        </div>

        {formData.activities.map((activity, index) => (
          <div key={index} className="mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
            {/* Activity Fields */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={activity.code}
                  onChange={(e) => updateActivity(index, 'code', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                  placeholder="Enter activity code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={activity.date}
                  onChange={(e) => updateActivity(index, 'date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type (FHIR Resource) <span className="text-red-500">*</span>
                </label>
                <select
                  value={activity.type}
                  onChange={(e) => updateActivity(index, 'type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {ACTIVITY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={activity.status}
                  onChange={(e) => updateActivity(index, 'status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {ACTIVITY_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={activity.description}
                  onChange={(e) => updateActivity(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                  rows={2}
                  placeholder="Enter activity description"
                />
              </div>
            </div>

            {/* Reason Section */}
            {activity.reason && (
              <div className="mt-4 pt-4 border-t border-gray-300">
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() => toggleReasonExpanded(index)}
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    {expandedReasons[index] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    Activity Reason Information
                  </button>
                  <button
                    type="button"
                    onClick={() => removeReason(index)}
                    className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Remove Reason
                  </button>
                </div>

                {expandedReasons[index] && (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-600 mb-3">
                      When recording a reason for the activity, both the reason code and status are required
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reason Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={activity.reason.reasonCode}
                          onChange={(e) => updateActivityReason(index, 'reasonCode', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                          placeholder="Enter reason code"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reason Status <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={activity.reason.reasonStatus}
                          onChange={(e) => updateActivityReason(index, 'reasonStatus', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                          {ACTIVITY_STATUSES.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reason Recording Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={activity.reason.reasonRecordingDate}
                          onChange={(e) => updateActivityReason(index, 'reasonRecordingDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Reason End Date (Leave empty if no end date)
                        </label>
                        <input
                          type="date"
                          value={activity.reason.reasonEndDate}
                          onChange={(e) => updateActivityReason(index, 'reasonEndDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons for Activity */}
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={addActivity}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                <Plus className="h-3 w-3" />
                Add Activity
              </button>
              {formData.activities.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeActivity(index)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-300 rounded hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete Activity
                </button>
              )}
              {!activity.reason && (
                <button
                  type="button"
                  onClick={() => addReason(index)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-white border border-blue-300 rounded hover:bg-blue-50"
                >
                  <Plus className="h-3 w-3" />
                  Add Reason
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save
            </>
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
