'use client';

import React, { useState } from 'react';
import { usePatientDetailStore } from '../../store/patient-detail-store';
import { GeneralFacesheet } from '@/features/specialties/shared/components/GeneralFacesheet';
import { format } from 'date-fns';
import { Calendar, FileText, Activity, AlertCircle, Pill, TestTube } from 'lucide-react';

interface FacesheetTabProps {
  patientId: string;
}

export function FacesheetTab({ patientId }: FacesheetTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'summary' | 'timeline' | 'forms'>('summary');
  const {
    patient,
    encounters,
    problems,
    medications,
    observations,
    allergies,
    documents,
    labResults,
    immunizations
  } = usePatientDetailStore();

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Sub-tabs */}
      <div className="border-b border-gray-200 bg-white px-4">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveSubTab('summary')}
            className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${activeSubTab === 'summary'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
          >
            Face Sheet
          </button>
          <button
            onClick={() => setActiveSubTab('timeline')}
            className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${activeSubTab === 'timeline'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setActiveSubTab('forms')}
            className={`py-3 px-1 border-b-2 text-sm font-medium transition-colors ${activeSubTab === 'forms'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
          >
            Forms
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {/* Summary Tab - Main Facesheet */}
        {activeSubTab === 'summary' && (
          <GeneralFacesheet patientId={patientId} />
        )}

        {/* Timeline Tab */}
        {activeSubTab === 'timeline' && (
          <div className="p-4 max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Clinical Timeline</h2>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-300"></div>

              <div className="space-y-4">
                {/* Encounters */}
                {encounters?.map((encounter: any) => {
                  const date = encounter.period?.start || encounter.meta?.lastUpdated;
                  const type = encounter.type?.[0]?.text || encounter.type?.[0]?.coding?.[0]?.display || 'Visit';

                  return (
                    <div key={encounter.id} className="relative pl-10">
                      <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-primary border-2 border-white"></div>
                      <div className="bg-white border border-gray-300 rounded p-3 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-sm text-gray-900">{type}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {date ? format(new Date(date), 'MMM dd, yyyy hh:mm a') : '-'}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                          Status: <span className="font-medium">{encounter.status}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Problems */}
                {problems?.slice(0, 10).map((problem: any) => {
                  const date = problem.recordedDate;
                  const name = problem.code?.text || problem.code?.coding?.[0]?.display || 'Unknown';

                  return (
                    <div key={problem.id} className="relative pl-10">
                      <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-orange-600 border-2 border-white"></div>
                      <div className="bg-white border border-gray-300 rounded p-3 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <span className="font-semibold text-sm text-gray-900">{name}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {date ? format(new Date(date), 'MMM dd, yyyy') : '-'}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                          Type: <span className="font-medium">Diagnosis</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Medications */}
                {medications?.slice(0, 10).map((medication: any) => {
                  const date = medication.authoredOn;
                  const name = medication.medicationCodeableConcept?.text ||
                    medication.medicationCodeableConcept?.coding?.[0]?.display ||
                    'Unknown';

                  return (
                    <div key={medication.id} className="relative pl-10">
                      <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-green-600 border-2 border-white"></div>
                      <div className="bg-white border border-gray-300 rounded p-3 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Pill className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-sm text-gray-900">{name}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {date ? format(new Date(date), 'MMM dd, yyyy') : '-'}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                          Type: <span className="font-medium">Medication</span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Lab Results */}
                {labResults?.slice(0, 10).map((lab: any) => {
                  const date = lab.effectiveDateTime || lab.issued;
                  const name = lab.code?.text || lab.code?.coding?.[0]?.display || 'Unknown Test';
                  const value = lab.valueQuantity?.value;
                  const unit = lab.valueQuantity?.unit;

                  return (
                    <div key={lab.id} className="relative pl-10">
                      <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-theme-secondary border-2 border-white"></div>
                      <div className="bg-white border border-gray-300 rounded p-3 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <TestTube className="h-4 w-4 text-theme-secondary" />
                            <span className="font-semibold text-sm text-gray-900">{name}</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {date ? format(new Date(date), 'MMM dd, yyyy') : '-'}
                          </span>
                        </div>
                        {value && (
                          <div className="mt-2 text-xs text-gray-600">
                            Result: <span className="font-bold text-gray-900">{value} {unit}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {(!encounters || encounters.length === 0) && (!problems || problems.length === 0) && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No clinical events recorded
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Forms Tab */}
        {activeSubTab === 'forms' && (
          <div className="p-4 max-w-6xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Forms & Questionnaires</h2>

            <div className="grid grid-cols-3 gap-3">
              {/* Custom Forms */}
              {documents?.filter((doc: any) =>
                doc.type?.text?.toLowerCase().includes('form') ||
                doc.type?.text?.toLowerCase().includes('questionnaire')
              ).map((doc: any) => {
                const name = doc.description || doc.type?.text || 'Form';
                const date = doc.date || doc.meta?.lastUpdated;

                return (
                  <div key={doc.id} className="bg-white border border-gray-300 rounded p-3 shadow-sm hover:shadow transition-shadow cursor-pointer">
                    <div className="flex items-start gap-2 mb-2">
                      <FileText className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900 truncate">{name}</div>
                        {date && (
                          <div className="text-xs text-gray-500 mt-1">
                            {format(new Date(date), 'MMM dd, yyyy')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      Status: <span className="font-medium text-green-600">Completed</span>
                    </div>
                  </div>
                );
              })}

              {/* Standard Forms */}
              <div className="bg-white border border-gray-300 rounded p-3 shadow-sm hover:shadow transition-shadow cursor-pointer">
                <div className="flex items-start gap-2 mb-2">
                  <FileText className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900">Consent Form</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {format(new Date(), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  Status: <span className="font-medium text-yellow-600">Pending</span>
                </div>
              </div>

              <div className="bg-white border border-gray-300 rounded p-3 shadow-sm hover:shadow transition-shadow cursor-pointer">
                <div className="flex items-start gap-2 mb-2">
                  <FileText className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900">Medical History Questionnaire</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {format(new Date(), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  Status: <span className="font-medium text-green-600">Completed</span>
                </div>
              </div>

              <div className="bg-white border border-gray-300 rounded p-3 shadow-sm hover:shadow transition-shadow cursor-pointer">
                <div className="flex items-start gap-2 mb-2">
                  <FileText className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-900">Privacy Notice (HIPAA)</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {format(new Date(), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  Status: <span className="font-medium text-green-600">Signed</span>
                </div>
              </div>
            </div>

            {(!documents || documents.length === 0) && (
              <div className="text-center py-8 text-gray-500 text-sm">
                No forms available
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
