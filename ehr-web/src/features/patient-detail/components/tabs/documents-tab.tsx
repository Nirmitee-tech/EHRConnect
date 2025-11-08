'use client';

import React from 'react';
import { FileText, Plus, Download, Eye } from 'lucide-react';
import { usePatientDetailStore } from '../../store/patient-detail-store';

/**
 * Documents Tab Component
 * - Displays patient documents (FHIR DocumentReference resources)
 * - All data from Zustand (no props, no API calls)
 * - Document data loaded once by PatientDetailProvider
 */
export function DocumentsTab() {
  // Get state from Zustand
  const documents = usePatientDetailStore((state) => state.documents);

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
      current: { bg: 'bg-green-100', text: 'text-green-800' },
      superseded: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'entered-in-error': { bg: 'bg-red-100', text: 'text-red-800' }
    };
    return styles[status as keyof typeof styles] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
        <button
          onClick={() => setDrawerState('document', true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Document
        </button>
      </div>

      {documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((doc: any, idx: number) => {
            const title = doc.description || doc.type?.text || 'Untitled Document';
            const docType = doc.type?.coding?.[0]?.display || doc.type?.text || 'Document';
            const date = doc.date || doc.indexed;
            const status = doc.status || 'current';
            const statusBadge = getStatusBadge(status);
            const author = doc.author?.[0]?.display || 'Unknown';
            const category = doc.category?.[0]?.coding?.[0]?.display || 'General';
            const hasAttachments = doc.content && doc.content.length > 0;

            return (
              <div key={doc.id || idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusBadge.bg} ${statusBadge.text}`}>
                        {status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Type:</span>
                        <span className="ml-2 text-gray-900 font-medium">{docType}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <span className="ml-2 text-gray-900 font-medium">{formatDate(date)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Category:</span>
                        <span className="ml-2 text-gray-900 font-medium">{category}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Author:</span>
                        <span className="ml-2 text-gray-900 font-medium">{author}</span>
                      </div>
                    </div>

                    {/* Attachments */}
                    {hasAttachments && (
                      <div className="mt-3 border-t border-gray-200 pt-3">
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          Attachments ({doc.content.length}):
                        </p>
                        <div className="space-y-1">
                          {doc.content.map((content: any, cidx: number) => (
                            <div key={cidx} className="flex items-center justify-between bg-gray-50 rounded p-2">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-400" />
                                <div>
                                  <p className="text-xs font-medium text-gray-900">
                                    {content.attachment?.title || `Attachment ${cidx + 1}`}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {content.attachment?.contentType}
                                    {content.attachment?.size && ` • ${(content.attachment.size / 1024).toFixed(1)} KB`}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button className="p-1 hover:bg-gray-200 rounded">
                                  <Eye className="h-3 w-3 text-gray-600" />
                                </button>
                                <button className="p-1 hover:bg-gray-200 rounded">
                                  <Download className="h-3 w-3 text-gray-600" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
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
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium">No documents available</p>
          <p className="text-xs mt-1">Click "Add Document" to upload or create a new document</p>
        </div>
      )}
    </div>
  );
}
