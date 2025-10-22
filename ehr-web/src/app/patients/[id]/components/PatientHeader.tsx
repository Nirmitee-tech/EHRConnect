import React from 'react';
import { User, Edit, Calendar, X, Plus, ChevronDown } from 'lucide-react';
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
}

export function PatientHeader({ 
  patient, 
  onEdit, 
  onNewVisit,
  encounters = [],
  selectedEncounter,
  onEncounterSelect
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
  const currentEncounter = selectedEncounter 
    ? encounters.find(e => e.id === selectedEncounter)
    : null;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Patient Avatar */}
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          
          {/* Patient Info */}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-blue-600">{patient.name}</h1>
              <span className="text-sm text-gray-500">({patient.mrn})</span>
              <X className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5">
              <span>DOB: {patient.dob}</span>
              <span>•</span>
              <span>Age: {patient.age}</span>
            </div>
          </div>

          {/* Encounter Selector */}
          {activeEncounters.length > 0 && (
            <div className="relative ml-4" ref={dropdownRef}>
              <button
                onClick={() => setShowEncounterDropdown(!showEncounterDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <span>Select Encounter</span>
                <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                  ({activeEncounters.length})
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {showEncounterDropdown && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-auto">
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
                          className={`w-full text-left p-3 rounded-lg hover:bg-blue-50 transition-colors ${
                            selectedEncounter === encounter.id ? 'bg-blue-50 border border-blue-200' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-sm">
                                {(() => {
                                  // Handle FHIR Coding object or string
                                  const classValue = typeof encounter?.class === 'string' 
                                    ? encounter?.class 
                                    : encounter?.class?.display || encounter?.class?.code || 'Encounter';
                                  return typeof classValue === 'string' 
                                    ? classValue?.charAt(0)?.toUpperCase() + classValue?.slice(1)
                                    : 'Encounter';
                                })()}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {dateStr} • {timeStr}
                              </div>
                              {encounter.practitionerName && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  Provider: {encounter.practitionerName}
                                </div>
                              )}
                            </div>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
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

          {/* New Encounter Button */}
          <button
            onClick={onNewVisit}
            className="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium border border-blue-200"
          >
            <Plus className="h-4 w-4" />
            <span>New</span>
          </button>
        </div>
      </div>
    </div>
  );
}
