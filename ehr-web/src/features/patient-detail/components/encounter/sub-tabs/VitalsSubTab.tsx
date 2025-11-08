import React from 'react';
import { Activity } from 'lucide-react';
import { VitalsCards } from '@/app/patients/[id]/components/tabs/VitalsTab/VitalsCards';
import { VitalsTable } from '@/app/patients/[id]/components/tabs/VitalsTab/VitalsTable';

interface VitalsSubTabProps {
  observations: any[];
  onRecordVitals: () => void;
}

/**
 * VitalsSubTab - Displays vital signs for the encounter
 */
export function VitalsSubTab({ observations, onRecordVitals }: VitalsSubTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Vital Signs</h3>
            <p className="text-xs text-gray-500 mt-1">
              Latest measurements with intelligent alerts and trends
            </p>
          </div>
          <button
            onClick={onRecordVitals}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            Record Vitals
          </button>
        </div>

        {observations.length > 0 ? (
          <>
            {/* Enhanced Vitals Cards */}
            <div className="mb-6">
              <VitalsCards observations={observations} />
            </div>

            {/* Enhanced Vitals Table */}
            <VitalsTable observations={observations} />
          </>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-dashed border-gray-300">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium">No vitals recorded for this encounter</p>
            <p className="text-xs mt-2">Click &ldquo;Record Vitals&rdquo; to add measurements</p>
          </div>
        )}
      </div>
    </div>
  );
}
