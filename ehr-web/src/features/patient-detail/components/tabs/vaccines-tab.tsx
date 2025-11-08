'use client';

import React from 'react';
import { Syringe, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { usePatientDetailStore } from '../../store/patient-detail-store';

/**
 * Vaccines Tab Component
 * - Displays patient immunization records (FHIR Immunization resources)
 * - All data from Zustand (no props, no API calls)
 * - Immunization data loaded once by PatientDetailProvider
 */
export function VaccinesTab() {
  // Get state from Zustand
  const immunizations = usePatientDetailStore((state) => state.immunizations);

  // Get actions from Zustand
  const setDrawerState = usePatientDetailStore((state) => state.setDrawerState);

  // Format date for display
  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const styles = {
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'not-done': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      'entered-in-error': { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle }
    };
    return styles[status as keyof typeof styles] || { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock };
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Immunization Records</h2>
        <button
          onClick={() => setDrawerState('immunization', true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Vaccine
        </button>
      </div>

      {immunizations.length > 0 ? (
        <div className="space-y-3">
          {immunizations.map((immunization: any, idx: number) => {
            const vaccineCode = immunization.vaccineCode?.text ||
                               immunization.vaccineCode?.coding?.[0]?.display ||
                               'Unknown Vaccine';
            const occurrenceDate = immunization.occurrenceDateTime || immunization.occurrenceString;
            const lotNumber = immunization.lotNumber || '-';
            const status = immunization.status || 'unknown';
            const statusBadge = getStatusBadge(status);
            const StatusIcon = statusBadge.icon;
            const manufacturer = immunization.manufacturer?.display || '-';
            const site = immunization.site?.text || immunization.site?.coding?.[0]?.display || '-';
            const route = immunization.route?.text || immunization.route?.coding?.[0]?.display || '-';
            const performer = immunization.performer?.[0]?.actor?.display || 'Unknown Provider';

            return (
              <div key={immunization.id || idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Syringe className="h-5 w-5 text-blue-600" />
                      <h3 className="text-base font-semibold text-gray-900">{vaccineCode}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusBadge.bg} ${statusBadge.text} flex items-center gap-1`}>
                        <StatusIcon className="h-3 w-3" />
                        {status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Date Given:</span>
                        <span className="ml-2 text-gray-900 font-medium">{formatDate(occurrenceDate)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Lot Number:</span>
                        <span className="ml-2 text-gray-900 font-medium">{lotNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Manufacturer:</span>
                        <span className="ml-2 text-gray-900 font-medium">{manufacturer}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Site:</span>
                        <span className="ml-2 text-gray-900 font-medium">{site}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Route:</span>
                        <span className="ml-2 text-gray-900 font-medium">{route}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Administered By:</span>
                        <span className="ml-2 text-gray-900 font-medium">{performer}</span>
                      </div>
                    </div>
                    {immunization.note && immunization.note.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <span className="text-xs text-gray-500 font-medium">Notes:</span>
                        <p className="text-sm text-gray-700 mt-1">{immunization.note[0].text}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Syringe className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium">No immunization records available</p>
          <p className="text-xs mt-1">Click "Add Vaccine" to record a new immunization</p>
        </div>
      )}
    </div>
  );
}
