'use client';

import React from 'react';
import { TestTube, Plus, FileText, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { usePatientDetailStore } from '../../store/patient-detail-store';

/**
 * Lab Results Tab Component
 * - Displays patient laboratory results (FHIR DiagnosticReport resources)
 * - All data from Zustand (no props, no API calls)
 * - Lab data loaded once by PatientDetailProvider
 */
export function LabTab() {
  // Get state from Zustand
  const labResults = usePatientDetailStore((state) => state.labResults);

  // Get actions from Zustand
  const setDrawerState = usePatientDetailStore((state) => state.setDrawerState);

  // Format date for display
  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    const styles = {
      final: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
      preliminary: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      amended: { bg: 'bg-blue-100', text: 'text-blue-800', icon: FileText },
      corrected: { bg: 'bg-purple-100', text: 'text-purple-800', icon: FileText },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
      'entered-in-error': { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle }
    };
    return styles[status as keyof typeof styles] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: FileText };
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Laboratory Results</h2>
        <button
          onClick={() => setDrawerState('lab', true)}
          className="px-3 py-1 text-xs font-medium text-primary-foreground bg-primary hover:opacity-90 rounded"
        >
          + Add Lab Result
        </button>
      </div>

      {labResults.length > 0 ? (
        <div className="space-y-3">
          {labResults.map((report: any, idx: number) => {
            const code = report.code?.text ||
              report.code?.coding?.[0]?.display ||
              'Lab Test';
            const effectiveDate = report.effectiveDateTime || report.issued;
            const status = report.status || 'unknown';
            const statusBadge = getStatusBadge(status);
            const StatusIcon = statusBadge.icon;
            const category = report.category?.[0]?.coding?.[0]?.display || 'Laboratory';
            const performer = report.performer?.[0]?.display || 'Unknown Lab';
            const conclusion = report.conclusion;
            const resultCount = report.result?.length || 0;

            return (
              <div key={report.id || idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <TestTube className="h-5 w-5 text-purple-600" />
                      <h3 className="text-base font-semibold text-gray-900">{code}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusBadge.bg} ${statusBadge.text} flex items-center gap-1`}>
                        <StatusIcon className="h-3 w-3" />
                        {status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <span className="ml-2 text-gray-900 font-medium">{formatDate(effectiveDate)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <span className="ml-2 text-gray-900 font-medium">{category}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Performed By:</span>
                        <span className="ml-2 text-gray-900 font-medium">{performer}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Results:</span>
                        <span className="ml-2 text-gray-900 font-medium">{resultCount} result{resultCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {/* Results Table (if results are included) */}
                    {report.result && report.result.length > 0 && (
                      <div className="mt-3 border-t border-gray-200 pt-3">
                        <p className="text-xs font-medium text-gray-600 mb-2">Test Results:</p>
                        <div className="bg-gray-50 rounded p-2 space-y-1">
                          {report.result.map((result: any, ridx: number) => (
                            <div key={ridx} className="text-xs flex justify-between items-center">
                              <span className="text-gray-700">{result.display || `Result ${ridx + 1}`}</span>
                              <span className="text-blue-600 font-medium">View Details</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Conclusion */}
                    {conclusion && (
                      <div className="mt-3 border-t border-gray-200 pt-3">
                        <p className="text-xs font-medium text-gray-600 mb-1">Conclusion:</p>
                        <p className="text-sm text-gray-700">{conclusion}</p>
                      </div>
                    )}

                    {/* Presented Form (if available) */}
                    {report.presentedForm && report.presentedForm.length > 0 && (
                      <div className="mt-3">
                        <button className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          View Full Report
                        </button>
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
          <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium">No laboratory results available</p>
          <p className="text-xs mt-1">Lab results will appear here when available</p>
        </div>
      )}
    </div>
  );
}
