'use client';

import React from 'react';
import { Shield, Globe, Loader2, Plus } from 'lucide-react';
import { usePatientDetailStore } from '../../store/patient-detail-store';

/**
 * Portal Access Tab Component
 * - Shows patient portal access status
 * - All data from Zustand (no props, no API calls)
 * - Data loaded once by PatientDetailProvider
 */
export function PortalAccessTab() {
  // Get state from Zustand
  const portalAccessStatus = usePatientDetailStore((state) => state.portalAccessStatus);
  const loadingPortalAccess = usePatientDetailStore((state) => state.loadingPortalAccess);

  // Get actions from Zustand
  const setPortalAccessDialogOpen = usePatientDetailStore((state) => state.setPortalAccessDialogOpen);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Portal Access</h2>
        {!portalAccessStatus.hasAccess && (
          <button
            onClick={() => setPortalAccessDialogOpen(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Enable Portal
          </button>
        )}
      </div>

      {loadingPortalAccess ? (
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-3 animate-spin" />
          <p className="text-sm text-gray-500">Loading portal access status...</p>
        </div>
      ) : portalAccessStatus.hasAccess ? (
        <div className="space-y-6">
          {/* Access Granted */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-green-900 mb-1">Portal Access Enabled</h3>
                <p className="text-sm text-green-700">
                  This patient has been granted access to the patient portal.
                </p>
              </div>
            </div>
          </div>

          {/* Access Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Email Address</label>
              <p className="text-sm text-gray-900 mt-1">{portalAccessStatus.email || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Access Granted On</label>
              <p className="text-sm text-gray-900 mt-1">
                {portalAccessStatus.grantedAt
                  ? new Date(portalAccessStatus.grantedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '-'}
              </p>
            </div>
          </div>

          {/* Portal Login Link */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <label className="text-sm font-medium text-gray-600 block mb-2">Patient Portal Link</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-white px-3 py-2 rounded border border-gray-300 text-gray-700">
                {typeof window !== 'undefined' ? `${window.location.origin}/patient-login` : '/patient-login'}
              </code>
              <button
                onClick={() => {
                  const link = typeof window !== 'undefined' ? `${window.location.origin}/patient-login` : '/patient-login';
                  navigator.clipboard.writeText(link);
                  // Could add a toast notification here
                }}
                className="px-3 py-2 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Share this link with the patient to access their portal.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setPortalAccessDialogOpen(true)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Update Access
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Globe className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">Portal Access Not Configured</p>
          <p className="text-xs text-gray-400">
            Click "Enable Portal" to grant this patient access to the patient portal.
          </p>
        </div>
      )}
    </div>
  );
}
