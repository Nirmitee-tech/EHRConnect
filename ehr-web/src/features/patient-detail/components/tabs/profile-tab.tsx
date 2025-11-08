'use client';

import React from 'react';
import { usePatientDetailStore } from '../../store/patient-detail-store';

/**
 * Profile Tab Component
 * - Displays basic patient profile information
 * - All data from Zustand (no props, no API calls)
 * - Patient data loaded once by PatientDetailProvider
 */
export function ProfileTab() {
  // Get state from Zustand
  const patient = usePatientDetailStore((state) => state.patient);

  if (!patient) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Patient Profile</h2>
        <p className="text-sm text-gray-500">Loading patient information...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Patient Profile</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Name</label>
            <p className="text-sm text-gray-900 mt-1">{patient.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Date of Birth</label>
            <p className="text-sm text-gray-900 mt-1">{patient.dob || '-'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Gender</label>
            <p className="text-sm text-gray-900 mt-1 capitalize">{patient.gender}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Contact</label>
            <p className="text-sm text-gray-900 mt-1">{patient.phone || patient.email || '-'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
