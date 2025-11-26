'use client';

import React from 'react';
import { Shield, Plus, Edit } from 'lucide-react';
import { usePatientDetailStore } from '../../store/patient-detail-store';

/**
 * Insurance Tab Component
 * - Displays patient insurance information
 * - All data from Zustand (no props, no API calls)
 * - Insurance data loaded once by PatientDetailProvider
 */
export function InsuranceTab() {
  // Get state from Zustand
  const insurances = usePatientDetailStore((state) => state.insurances);

  // Get actions from Zustand
  const setDrawerState = usePatientDetailStore((state) => state.setDrawerState);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Insurance Information</h2>
        <button
          onClick={() => setDrawerState('insurance', true)}
          className="px-3 py-1 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded"
        >
          + Add Insurance
        </button>
      </div>

      {insurances.length > 0 ? (
        <div className="space-y-3">
          {insurances.map((insurance, idx) => {
            const payorName = insurance.payor?.[0]?.display || 'Unknown Provider';
            const policyNumber = insurance.subscriberId || '-';
            const planName = insurance.type?.text || insurance.class?.[0]?.name || '-';
            const orderBadge = insurance.order === 1 ? 'Primary' : insurance.order === 2 ? 'Secondary' : 'Tertiary';
            const orderColor = insurance.order === 1 ? 'bg-blue-100 text-blue-800' : insurance.order === 2 ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800';

            return (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <h3 className="text-base font-semibold text-gray-900">{payorName}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${orderColor}`}>
                        {orderBadge}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${insurance.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {insurance.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">Policy Number:</span>
                        <span className="ml-2 text-gray-900 font-medium">{policyNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Plan:</span>
                        <span className="ml-2 text-gray-900 font-medium">{planName}</span>
                      </div>
                      {insurance.subscriber?.display && (
                        <div>
                          <span className="text-gray-500">Subscriber:</span>
                          <span className="ml-2 text-gray-900 font-medium">{insurance.subscriber.display}</span>
                        </div>
                      )}
                      {insurance.relationship?.coding?.[0]?.display && (
                        <div>
                          <span className="text-gray-500">Relationship:</span>
                          <span className="ml-2 text-gray-900 font-medium">{insurance.relationship.coding[0].display}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded transition-colors">
                    <Edit className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium">No insurance information available</p>
          <p className="text-xs mt-1">Click "Add Insurance" to get started</p>
        </div>
      )}
    </div>
  );
}
