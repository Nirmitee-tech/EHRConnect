import React from 'react';
import { User, Edit, Calendar, Plus, ChevronDown, AlertTriangle, Activity, Phone, Mail, Heart, Clock, PlusCircle, Edit2, Pencil, Shield } from 'lucide-react';
import { Button, Badge } from '@nirmitee.io/design-system';
import { PatientDetails } from './types';

interface EncounterClass {
  code?: string;
  display?: string;
  system?: string;
}

interface Encounter {
  id: string;
  status: string;
  class?: string | EncounterClass;
  period?: {
    start?: string;
    end?: string;
  };
  startTime?: string;
  practitionerName?: string;
}

interface PatientHeaderProps {
  patient: PatientDetails;
  onEdit: () => void;
  onNewVisit: () => void;
  encounters?: Encounter[];
  selectedEncounter?: string;
  onEncounterSelect?: (encounterId: string) => void;
  allergies?: any[];
  problems?: any[];
  insurances?: any[];
  onOpenMedicalInfo?: () => void;
  onOpenAllergies?: () => void;
  onOpenProblems?: () => void;
  onOpenInsurance?: () => void;
}

export function PatientHeader({
  patient,
  onEdit,
  onNewVisit,
  encounters = [],
  selectedEncounter,
  onEncounterSelect,
  allergies = [],
  problems = [],
  insurances = [],
  onOpenMedicalInfo,
  onOpenAllergies,
  onOpenProblems,
  onOpenInsurance
}: PatientHeaderProps) {
  const [showEncounterDropdown, setShowEncounterDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowEncounterDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeEncounters = encounters.filter(e => e.status === 'in-progress');
  const activeProblems = problems.filter((p: any) =>
    p.clinicalStatus?.coding?.[0]?.code === 'active'
  ).slice(0, 3);

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      {/* Compact Header - Single Row */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        {/* Left Side - Patient Info */}
        <div className="flex items-center gap-3">
          {/* Patient Avatar */}
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-blue-600" />
          </div>

          {/* Patient Basic Info */}
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-sm font-bold text-gray-900">
                Mr Mr {patient.name} S/o
              </h1>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span className="capitalize">{patient.gender}</span>
              <span>•</span>
              <span>#{patient.mrn}</span>
            </div>
          </div>

          {/* Contact Info - Inline */}
          <div className="flex items-center gap-4 text-xs text-gray-600 border-l border-gray-200 pl-4 ml-2">
            {patient.phone !== '-' && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{patient.phone}</span>
              </div>
            )}
            {patient.email !== '-' && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span className="truncate max-w-[180px]">{patient.email}</span>
              </div>
            )}
          </div>

          {/* Quick Stats - Inline */}
          <div className="flex items-center gap-4 text-xs border-l border-gray-200 pl-4 ml-2">
            <div>
              <span className="text-gray-500">Group:</span>{' '}
              <span className="text-gray-700 font-medium">None</span>
            </div>
            <div>
              <span className="text-gray-500">Ratecard:</span>{' '}
              <span className="text-gray-700 font-medium">Standard</span>
            </div>
            <div>
              <span className="text-gray-500">Membership:</span>{' '}
              <span className="text-gray-700 font-medium">-</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {activeEncounters.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowEncounterDropdown(!showEncounterDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Select Encounter ({activeEncounters.length})</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {showEncounterDropdown && (
                <div className="absolute top-full right-0 mt-1 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-auto">
                  <div className="p-2">
                    {activeEncounters.map((encounter) => {
                      const encounterDate = new Date(encounter.period?.start || encounter.startTime || new Date());
                      const dateStr = encounterDate.toLocaleDateString();
                      const timeStr = encounterDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                      return (
                        <button
                          key={encounter.id}
                          onClick={() => {
                            onEncounterSelect?.(encounter.id);
                            setShowEncounterDropdown(false);
                          }}
                          className={`w-full text-left p-2.5 rounded hover:bg-gray-50 transition-colors ${
                            selectedEncounter === encounter.id ? 'bg-blue-50 border border-blue-200' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm">
                                {(() => {
                                  const classValue = typeof encounter?.class === 'string'
                                    ? encounter?.class
                                    : encounter?.class?.display || encounter?.class?.code || 'Encounter';
                                  return typeof classValue === 'string'
                                    ? classValue?.charAt(0)?.toUpperCase() + classValue?.slice(1)
                                    : 'Encounter';
                                })()}
                              </div>
                              <div className="text-xs text-gray-600 mt-0.5">
                                {dateStr} • {timeStr}
                              </div>
                            </div>
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                              Active
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onNewVisit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Visit</span>
          </button>
        </div>
      </div>

      {/* Clinical Info Row - Always Visible with Wow Factor */}
      <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 shadow-sm">
        <div className="flex items-center gap-4 text-xs">
          {/* Medical Info */}
          <div className="flex items-center gap-3 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 rounded">
                <Heart className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-gray-500 font-medium mb-0.5">Medical Information</div>
                <div className="flex items-center gap-2 text-gray-700">
                  <span className="text-gray-500">Blood Group:</span>
                  <span className="font-semibold">-</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">Payment Due:</span>
                  <span className="font-bold text-green-600">₹ 0.00</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 ml-2 border-l border-gray-200 pl-3">
              <button className="px-2.5 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-medium shadow-sm transition-all hover:shadow">
                Receive Payment
              </button>
              <button className="px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium transition-colors">
                Send Link
              </button>
            </div>
            <button
              onClick={onOpenMedicalInfo}
              className="p-1 hover:bg-gray-100 rounded transition-colors ml-1"
            >
              <Edit className="h-3.5 w-3.5 text-gray-400 hover:text-blue-600" />
            </button>
          </div>

          {/* History */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
            <div className="p-1.5 bg-indigo-50 rounded">
              <Clock className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <div className="text-gray-500 font-medium mb-0.5">History</div>
              <div className="text-gray-700 font-medium">Blood Pressure, Cholesterol</div>
            </div>
            <button
              onClick={onOpenMedicalInfo}
              className="p-1 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
            >
              <Plus className="h-3.5 w-3.5 text-gray-400 hover:text-indigo-600" />
            </button>
            <button
              onClick={onOpenMedicalInfo}
              className="p-1 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
            >
              <Edit className="h-3.5 w-3.5 text-gray-400 hover:text-indigo-600" />
            </button>
          </div>

          {/* Allergies */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-red-200 hover:shadow-md transition-shadow group">
            <div className="p-1.5 bg-red-50 rounded">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <div className="text-red-700 font-semibold mb-0.5">Allergies</div>
              {allergies.length > 0 ? (
                <div className="flex items-center gap-1.5">
                  {allergies.slice(0, 2).map((allergy: any, idx: number) => (
                    <span key={idx} className="text-red-700 font-medium">
                      {allergy.code?.text || allergy.code?.coding?.[0]?.display || 'Unknown'}
                      {idx < Math.min(allergies.length, 2) - 1 ? ',' : ''}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-600 italic">No Known Allergies</span>
              )}
            </div>
            <button
              onClick={onOpenAllergies}
              className="p-1 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
            >
              <Plus className="h-3.5 w-3.5 text-gray-400 hover:text-red-600" />
            </button>
            <button
              onClick={onOpenAllergies}
              className="p-1 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
            >
              <Edit className="h-3.5 w-3.5 text-gray-400 hover:text-red-600" />
            </button>
          </div>

          {/* Habits */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group">
            <div className="p-1.5 bg-purple-50 rounded">
              <Activity className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <div className="text-gray-500 font-medium mb-0.5">Habits</div>
              <div className="text-gray-700 font-medium">Aerated Drinks, Alcohol (rare)</div>
            </div>
            <button
              onClick={onOpenMedicalInfo}
              className="p-1 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
            >
              <Plus className="h-3.5 w-3.5 text-gray-400 hover:text-purple-600" />
            </button>
            <button
              onClick={onOpenMedicalInfo}
              className="p-1 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
            >
              <Edit className="h-3.5 w-3.5 text-gray-400 hover:text-purple-600" />
            </button>
          </div>

          {/* Insurance */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border border-green-200 hover:shadow-md transition-shadow group">
            <div className="p-1.5 bg-green-50 rounded">
              <Shield className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="text-gray-500 font-medium mb-0.5">Insurance</div>
              {insurances.length > 0 ? (
                <div className="text-gray-700 font-medium">
                  {insurances[0].payor?.[0]?.display || 'Unknown'} - Policy: {insurances[0].subscriberId || '-'}
                </div>
              ) : (
                <div className="text-gray-700 font-medium">No Insurance</div>
              )}
            </div>
            <button
              onClick={onOpenInsurance}
              className="p-1 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
            >
              <Plus className="h-3.5 w-3.5 text-gray-400 hover:text-green-600" />
            </button>
            <button
              onClick={onOpenInsurance}
              className="p-1 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
            >
              <Edit className="h-3.5 w-3.5 text-gray-400 hover:text-green-600" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="ml-auto">
            <span className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-semibold shadow-sm border border-yellow-200">
              On Hold
            </span>
          </div>
        </div>
      </div>

      {/* Active Problems Row with Wow Factor */}
      <div className="px-4 py-2 bg-white border-t border-gray-100">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            <div className="p-1 bg-amber-100 rounded">
              <Activity className="h-3.5 w-3.5 text-amber-700" />
            </div>
            <span className="text-amber-800 font-semibold">Active Problems</span>
          </div>

          {activeProblems.length > 0 ? (
            <div className="flex items-center gap-2">
              {activeProblems.map((problem: any, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-amber-50 text-amber-900 rounded-lg font-medium border border-amber-200 hover:bg-amber-100 transition-colors shadow-sm"
                >
                  {problem.code?.text || problem.code?.coding?.[0]?.display || 'Unknown'}
                </span>
              ))}
              {problems.length > 3 && (
                <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-lg font-semibold border border-amber-300 shadow-sm">
                  +{problems.length - 3} more
                </span>
              )}
            </div>
          ) : (
            <span className="px-3 py-1 bg-gray-50 text-gray-700 rounded-lg font-medium border border-gray-200">
              TEST
            </span>
          )}

          <button
            onClick={onOpenProblems}
            className="ml-auto p-1.5 hover:bg-amber-50 rounded-lg transition-colors group"
          >
            <Plus className="h-4 w-4 text-gray-400 group-hover:text-amber-600" />
          </button>
          <button
            onClick={onOpenProblems}
            className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors group"
          >
            <Edit className="h-4 w-4 text-gray-400 group-hover:text-amber-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
