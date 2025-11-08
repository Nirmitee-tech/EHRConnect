'use client';

import React from 'react';
import { ImageIcon, Plus, Eye, FileImage, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { usePatientDetailStore } from '../../store/patient-detail-store';

/**
 * Imaging Tab Component
 * - Displays patient imaging studies (FHIR ImagingStudy resources)
 * - All data from Zustand (no props, no API calls)
 * - Imaging data loaded once by PatientDetailProvider
 */
export function ImagingTab() {
  // Get state from Zustand
  const imagingStudies = usePatientDetailStore((state) => state.imagingStudies);

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
      available: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
      registered: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle },
      'entered-in-error': { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle },
      unknown: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock }
    };
    return styles[status as keyof typeof styles] || { bg: 'bg-gray-100', text: 'text-gray-800', icon: Clock };
  };

  // Get modality name
  const getModalityName = (code: string) => {
    const modalities: Record<string, string> = {
      'CT': 'CT Scan',
      'MR': 'MRI',
      'XR': 'X-Ray',
      'US': 'Ultrasound',
      'NM': 'Nuclear Medicine',
      'PET': 'PET Scan',
      'DX': 'Digital Radiography',
      'CR': 'Computed Radiography',
      'MG': 'Mammography'
    };
    return modalities[code] || code;
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Imaging Studies</h2>
        <button
          onClick={() => setDrawerState('imaging', true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Imaging
        </button>
      </div>

      {imagingStudies.length > 0 ? (
        <div className="space-y-3">
          {imagingStudies.map((study: any, idx: number) => {
            const description = study.description || study.procedureCode?.[0]?.text || 'Imaging Study';
            const started = study.started;
            const status = study.status || 'unknown';
            const statusBadge = getStatusBadge(status);
            const StatusIcon = statusBadge.icon;
            const numberOfSeries = study.numberOfSeries || 0;
            const numberOfInstances = study.numberOfInstances || 0;
            const modalities =
              study.series
                ?.map((s: any) => s.modality?.code || s.modality)
                .filter((code: string | undefined): code is string => Boolean(code)) || [];
            const uniqueModalities: string[] = Array.from(new Set(modalities));
            const referrer = study.referrer?.display || '-';
            const interpreter = study.interpreter?.[0]?.display || '-';
            const reasonCode = study.reasonCode?.[0]?.text || study.reasonCode?.[0]?.coding?.[0]?.display;

            return (
              <div key={study.id || idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon className="h-5 w-5 text-indigo-600" />
                      <h3 className="text-base font-semibold text-gray-900">{description}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusBadge.bg} ${statusBadge.text} flex items-center gap-1`}>
                        <StatusIcon className="h-3 w-3" />
                        {status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Study Date:</span>
                        <span className="ml-2 text-gray-900 font-medium">{formatDate(started)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Modality:</span>
                        <span className="ml-2 text-gray-900 font-medium">
                          {uniqueModalities.length > 0
                            ? uniqueModalities.map(m => getModalityName(m)).join(', ')
                            : '-'
                          }
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Series:</span>
                        <span className="ml-2 text-gray-900 font-medium">{numberOfSeries}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Images:</span>
                        <span className="ml-2 text-gray-900 font-medium">{numberOfInstances}</span>
                      </div>
                      {referrer !== '-' && (
                        <div>
                          <span className="text-gray-500">Referred By:</span>
                          <span className="ml-2 text-gray-900 font-medium">{referrer}</span>
                        </div>
                      )}
                      {interpreter !== '-' && (
                        <div>
                          <span className="text-gray-500">Interpreted By:</span>
                          <span className="ml-2 text-gray-900 font-medium">{interpreter}</span>
                        </div>
                      )}
                    </div>

                    {/* Reason for Study */}
                    {reasonCode && (
                      <div className="mt-3 border-t border-gray-200 pt-3">
                        <p className="text-xs font-medium text-gray-600 mb-1">Reason:</p>
                        <p className="text-sm text-gray-700">{reasonCode}</p>
                      </div>
                    )}

                    {/* Series Details */}
                    {study.series && study.series.length > 0 && (
                      <div className="mt-3 border-t border-gray-200 pt-3">
                        <p className="text-xs font-medium text-gray-600 mb-2">Series ({study.series.length}):</p>
                        <div className="space-y-2">
                          {study.series.slice(0, 3).map((series: any, sidx: number) => (
                            <div key={sidx} className="bg-gray-50 rounded p-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileImage className="h-4 w-4 text-gray-400" />
                                <div>
                                  <p className="text-xs font-medium text-gray-900">
                                    {series.description || `Series ${series.number || sidx + 1}`}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {getModalityName(series.modality?.code || series.modality)} • {series.numberOfInstances || 0} images
                                  </p>
                                </div>
                              </div>
                              <button className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                View
                              </button>
                            </div>
                          ))}
                          {study.series.length > 3 && (
                            <p className="text-xs text-gray-500 text-center">
                              +{study.series.length - 3} more series
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Note */}
                    {study.note && study.note.length > 0 && (
                      <div className="mt-3 border-t border-gray-200 pt-3">
                        <p className="text-xs font-medium text-gray-600 mb-1">Notes:</p>
                        <p className="text-sm text-gray-700">{study.note[0].text}</p>
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
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium">No imaging studies available</p>
          <p className="text-xs mt-1">Imaging studies will appear here when available</p>
        </div>
      )}
    </div>
  );
}
