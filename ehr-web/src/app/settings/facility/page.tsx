'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Building2, Clock, MapPin, Phone, Mail, Globe, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useFacility } from '@/contexts/facility-context';
import { SettingsService } from '@/services/settings.service';
import { AppointmentSettings } from '@/types/settings';

export default function FacilitySettingsPage() {
  const { currentFacility } = useFacility();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Facility basic info
  const [facilityName, setFacilityName] = useState('');
  const [facilityType, setFacilityType] = useState('');

  // Calendar settings
  const [calendarSettings, setCalendarSettings] = useState<AppointmentSettings>({
    defaultDuration: 30,
    slotDuration: 60, // This is the key setting for calendar slots
    workingHours: {
      start: '09:00',
      end: '17:00'
    },
    allowedDurations: [15, 30, 45, 60, 90, 120],
    autoNavigateToEncounter: true
  });

  useEffect(() => {
    if (currentFacility) {
      loadSettings();
    }
  }, [currentFacility]);

  const loadSettings = async () => {
    if (!currentFacility?.id) return;

    try {
      setLoading(true);

      // Load facility basic info
      setFacilityName(currentFacility.name || '');
      setFacilityType(currentFacility.type || '');

      // Load calendar settings from organization
      const orgSettings = await SettingsService.getOrganizationSettings(currentFacility.id);
      setCalendarSettings(orgSettings.appointmentSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      showMessage('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentFacility?.id) return;

    try {
      setSaving(true);

      // Save calendar settings
      await SettingsService.updateAppointmentSettings(currentFacility.id, calendarSettings);

      showMessage('success', 'Settings saved successfully! Refresh the calendar to see changes.');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      showMessage('error', error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const updateCalendarSetting = (field: keyof AppointmentSettings, value: any) => {
    setCalendarSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateWorkingHours = (field: 'start' | 'end', value: string) => {
    setCalendarSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [field]: value
      }
    }));
  };

  // Slot duration options
  const slotDurationOptions = [
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 20, label: '20 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' }
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Facility Settings</h1>
            <p className="text-gray-600 mt-1">
              Manage your facility information and calendar configuration
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`flex items-center gap-3 p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          )}
          <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </p>
        </div>
      )}

      {/* Facility Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Facility Information</h2>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facility Name
            </label>
            <input
              type="text"
              value={facilityName}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Contact support to change facility name</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facility Type
            </label>
            <input
              type="text"
              value={facilityType || 'Hospital'}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Calendar Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Calendar Configuration</h2>
        </div>

        <div className="space-y-6">
          {/* Calendar Slot Duration - MAIN SETTING */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <label className="block text-sm font-medium text-gray-900 mb-3">
              <Clock className="inline h-4 w-4 mr-1" />
              Calendar Time Slot Duration
            </label>
            <p className="text-sm text-gray-700 mb-4">
              This controls how your calendar grid is divided. For example:
              <br />
              • <strong>60 minutes</strong>: 9:00 AM → 10:00 AM → 11:00 AM
              <br />
              • <strong>15 minutes</strong>: 9:00 AM → 9:15 AM → 9:30 AM → 9:45 AM → 10:00 AM
            </p>

            <div className="grid grid-cols-3 gap-3">
              {slotDurationOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => updateCalendarSetting('slotDuration', option.value)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    calendarSettings.slotDuration === option.value
                      ? 'border-blue-600 bg-blue-100 text-blue-900 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
              <div className="text-sm text-gray-700">
                <strong>Current Setting:</strong> Calendar shows slots every <strong className="text-blue-600">{calendarSettings.slotDuration} minutes</strong>
              </div>
              <div className="text-xs text-gray-600 mt-2">
                Example time slots: {
                  Array.from({ length: 4 }, (_, i) => {
                    const minutes = i * calendarSettings.slotDuration;
                    const hours = Math.floor((9 * 60 + minutes) / 60);
                    const mins = (9 * 60 + minutes) % 60;
                    return `${hours}:${mins.toString().padStart(2, '0')}`;
                  }).join(' → ')
                } ...
              </div>
            </div>
          </div>

          {/* Default Appointment Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Appointment Duration
            </label>
            <p className="text-sm text-gray-600 mb-3">
              This is the default duration when creating a new appointment
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="5"
                max="240"
                step="5"
                value={calendarSettings.defaultDuration}
                onChange={(e) => updateCalendarSetting('defaultDuration', parseInt(e.target.value) || 30)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <span className="text-sm text-gray-600">minutes</span>
            </div>
          </div>

          {/* Working Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Working Hours
            </label>
            <p className="text-sm text-gray-600 mb-3">
              Default operating hours for the facility
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                <input
                  type="time"
                  value={calendarSettings.workingHours.start}
                  onChange={(e) => updateWorkingHours('start', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">End Time</label>
                <input
                  type="time"
                  value={calendarSettings.workingHours.end}
                  onChange={(e) => updateWorkingHours('end', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Auto Navigate to Encounter Setting */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={calendarSettings.autoNavigateToEncounter ?? true}
                onChange={(e) => updateCalendarSetting('autoNavigateToEncounter', e.target.checked)}
                className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  Auto-Navigate to Encounter on Start
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  When enabled, clicking "Start" on an appointment will create an encounter and open it immediately (for doctors).
                  <br />
                  When disabled, clicking "Start" will only mark the appointment as in-progress without opening the encounter page (for receptionists).
                </p>
                <div className="mt-2 text-xs">
                  <span className="font-medium text-purple-700">Use Case:</span>
                  <ul className="list-disc list-inside text-gray-600 mt-1 space-y-0.5">
                    <li><strong>Enabled:</strong> Doctors can start and immediately document the encounter</li>
                    <li><strong>Disabled:</strong> Receptionists can check-in patients without opening encounter details</li>
                  </ul>
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-900 mb-1">Important Notes</h3>
            <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
              <li>Calendar slot duration changes will apply immediately after saving</li>
              <li>You may need to refresh the appointments page to see the new time slots</li>
              <li>Smaller time slots (5-15 min) work best for high-volume clinics</li>
              <li>Larger time slots (30-60 min) are better for longer consultations</li>
              <li>Existing appointments will not be affected by these changes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
