import React from 'react';
import { User, Edit, Calendar, Plus, ChevronDown, AlertTriangle, Activity, Phone, Mail, Heart, Clock, PlusCircle, Edit2, Pencil, Shield, ArrowLeft, Globe, CheckCircle2 } from 'lucide-react';
import { Button, Badge } from '@nirmitee.io/design-system';
import { PatientDetails } from './types';
import { useRouter } from 'next/navigation';
import { PortalAccessDialog } from '@/components/patients/portal-access-dialog';

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
  encounterIdFromQuery?: string | null;
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
  onOpenInsurance,
  encounterIdFromQuery
}: PatientHeaderProps) {
  const router = useRouter();
  const [showEncounterDropdown, setShowEncounterDropdown] = React.useState(false);
  const [portalAccessDialogOpen, setPortalAccessDialogOpen] = React.useState(false);
  const [hasPortalAccess, setHasPortalAccess] = React.useState(false);
  const [checkingPortalAccess, setCheckingPortalAccess] = React.useState(true);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Check if patient has portal access
  React.useEffect(() => {
    const checkPortalAccess = async () => {
      try {
        const response = await fetch(`/api/patient/check-portal-access?patientId=${patient.id}`);
        const data = await response.json();
        setHasPortalAccess(data.hasAccess || false);
      } catch (error) {
        console.error('Error checking portal access:', error);
      } finally {
        setCheckingPortalAccess(false);
      }
    };

    if (patient.id) {
      checkPortalAccess();
    }
  }, [patient.id]);

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
      {/* Compact Header - Responsive */}
      <div className="px-3 py-2 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
        {/* Left Side - Patient Info */}
        <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
          {/* Patient Avatar */}
          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-blue-600" />
          </div>

          {/* Patient Basic Info */}
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-sm font-bold text-gray-900">
                Mr Mr {patient.name} S/o
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="capitalize">{patient.gender}</span>
              <span className="text-gray-400">|</span>
              <span>#{patient.mrn}</span>
            </div>
          </div>

          {/* Contact Info - Responsive */}
          <div className="flex items-center gap-2 lg:gap-3 text-xs text-gray-600 lg:border-l border-gray-200 lg:pl-3 lg:ml-2">
            {patient.phone !== '-' && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span className="hidden sm:inline">{patient.phone}</span>
              </div>
            )}
            {patient.email !== '-' && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                <span className="hidden md:inline truncate max-w-[180px]">{patient.email}</span>
              </div>
            )}
          </div>

          {/* Quick Stats - Hide on small screens */}
          <div className="hidden xl:flex items-center gap-3 text-xs border-l border-gray-200 pl-3 ml-2">
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
        <div className="flex items-center gap-2 lg:ml-auto">
          {activeEncounters.length > 0 && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowEncounterDropdown(!showEncounterDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
              >
                <Activity className="h-3 w-3" />
                <span>Encounter ({activeEncounters.length})</span>
                <ChevronDown className="h-3 w-3" />
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
                            // Update URL with encounter ID as query param
                            const url = new URL(window.location.href);
                            url.searchParams.set('encounterId', encounter.id);
                            router.push(url.pathname + url.search);

                            // Call the original handler
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            <Plus className="h-3 w-3" />
            <span>New Visit</span>
          </button>
        </div>
      </div>

      {/* Clinical Info Row - Responsive with Wrapping */}
      <div className="px-3 py-2 bg-white border-t border-gray-200 overflow-x-auto">
        <div className="flex items-center flex-wrap lg:flex-nowrap gap-y-2 text-xs">
          {/* Medical Info */}
          <div className="flex items-center gap-1.5 pr-3 border-r border-gray-300 group flex-shrink-0">
            <Heart className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
            <div className="flex items-center gap-1.5 text-gray-800 whitespace-nowrap">
              <span className="text-gray-600 font-medium">Blood:</span>
              <span className="font-semibold">-</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 font-medium">Due:</span>
              <span className="font-bold text-green-600">₹0.00</span>
            </div>
            <button className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition-all whitespace-nowrap flex-shrink-0">
              Receive
            </button>
            <button className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium transition-all whitespace-nowrap flex-shrink-0">
              Link
            </button>
            <button
              onClick={onOpenMedicalInfo}
              className="p-0.5 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
              title="Edit Medical Info"
            >
              <Edit className="h-3.5 w-3.5 text-gray-400 hover:text-blue-600" />
            </button>
          </div>

          {/* History */}
          <div className="flex items-center gap-1.5 px-3 pr-3 border-r border-gray-300 group">
            <Clock className="h-3.5 w-3.5 text-indigo-600" />
            <span className="text-gray-600 font-medium">History:</span>
            <span className="text-gray-800 font-medium whitespace-nowrap">BP, Cholesterol</span>
            <button
              onClick={onOpenMedicalInfo}
              className="p-0.5 hover:bg-indigo-50 rounded transition-colors ml-1"
              title="Add/Edit History"
            >
              <Plus className="h-3.5 w-3.5 text-gray-400 hover:text-indigo-600" />
            </button>
          </div>

          {/* Allergies */}
          <div className="flex items-center gap-1.5 px-3 pr-3 border-r border-gray-300 group">
            <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
            <span className="text-red-700 font-semibold">Allergies:</span>
            {allergies.length > 0 ? (
              <>
                <div className="flex items-center gap-1 text-red-800 font-medium">
                  {allergies.slice(0, 2).map((allergy: any, idx: number) => (
                    <span key={idx}>
                      {allergy.code?.text || allergy.code?.coding?.[0]?.display || 'Unknown'}
                      {idx < Math.min(allergies.length, 2) - 1 ? ',' : ''}
                    </span>
                  ))}
                  {allergies.length > 2 && (
                    <button
                      onClick={onOpenAllergies}
                      className="px-1.5 py-0.5 bg-red-100 text-red-800 rounded font-semibold hover:bg-red-200 transition-colors ml-1"
                      title={`All allergies: ${allergies.map((a: any) => a.code?.text || a.code?.coding?.[0]?.display || 'Unknown').join(', ')}`}
                    >
                      +{allergies.length - 2} more
                    </button>
                  )}
                </div>
              </>
            ) : (
              <span className="text-gray-600 italic">None</span>
            )}
            <button
              onClick={onOpenAllergies}
              className="p-0.5 hover:bg-red-50 rounded transition-colors ml-1"
              title="Add/Edit Allergies"
            >
              <Plus className="h-3.5 w-3.5 text-gray-400 hover:text-red-600" />
            </button>
          </div>

          {/* Habits */}
          <div className="flex items-center gap-1.5 px-3 pr-3 border-r border-gray-300 group">
            <Activity className="h-3.5 w-3.5 text-purple-600" />
            <span className="text-gray-600 font-medium">Habits:</span>
            <span className="text-gray-800 font-medium whitespace-nowrap">Drinks, Alcohol (rare)</span>
            <button
              onClick={onOpenMedicalInfo}
              className="p-0.5 hover:bg-purple-50 rounded transition-colors ml-1"
              title="Add/Edit Habits"
            >
              <Plus className="h-3.5 w-3.5 text-gray-400 hover:text-purple-600" />
            </button>
          </div>

          {/* Insurance */}
          <div className="flex items-center gap-1.5 px-3 pr-3 border-r border-gray-300 group">
            <Shield className="h-3.5 w-3.5 text-green-600" />
            <span className="text-gray-600 font-medium">Insurance:</span>
            {insurances.length > 0 ? (
              <div className="flex items-center gap-1">
                <span className="text-gray-900 font-semibold">
                  {insurances[0].payor?.[0]?.display || 'Unknown'}
                </span>
                {insurances.length > 1 && (
                  <button
                    onClick={onOpenInsurance}
                    className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded font-semibold hover:bg-green-200 transition-colors"
                    title={`All insurance policies: ${insurances.map((ins: any) => ins.payor?.[0]?.display || 'Unknown').join(', ')}`}
                  >
                    +{insurances.length - 1} more
                  </button>
                )}
              </div>
            ) : (
              <span className="text-gray-600 font-medium">None</span>
            )}
            <button
              onClick={onOpenInsurance}
              className="p-0.5 hover:bg-green-50 rounded transition-colors ml-1"
              title="Add/Edit Insurance"
            >
              <Plus className="h-3.5 w-3.5 text-gray-400 hover:text-green-600" />
            </button>
          </div>

          {/* Patient Portal Access - Last item, no border */}
          <div className="flex items-center gap-1.5 px-3 group">
            <Globe className={`h-3.5 w-3.5 ${hasPortalAccess ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className="text-gray-600 font-medium">Portal:</span>
            {checkingPortalAccess ? (
              <span className="text-gray-500">Loading...</span>
            ) : hasPortalAccess ? (
              <div className="flex items-center gap-0.5">
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span className="text-green-700 font-semibold whitespace-nowrap">Granted</span>
              </div>
            ) : (
              <>
                <span className="text-gray-600 whitespace-nowrap">No Access</span>
                <button
                  onClick={() => setPortalAccessDialogOpen(true)}
                  className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition-all ml-1 whitespace-nowrap"
                  title="Grant Portal Access"
                >
                  Grant
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Portal Access Dialog */}
      <PortalAccessDialog
        open={portalAccessDialogOpen}
        onOpenChange={setPortalAccessDialogOpen}
        patientId={patient.id}
        patientEmail={patient.email}
        patientName={patient.name}
        onSuccess={() => {
          setHasPortalAccess(true);
        }}
      />

      {/* Active Problems Row - Responsive */}
      <div className="px-3 py-2 bg-white border-t border-gray-200 overflow-x-auto">
        <div className="flex items-center gap-2 text-xs flex-wrap lg:flex-nowrap">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Activity className="h-3.5 w-3.5 text-amber-700" />
            <span className="text-amber-800 font-semibold">Active Problems:</span>
          </div>

          {activeProblems.length > 0 ? (
            <div className="flex items-center gap-1 flex-wrap">
              {activeProblems.map((problem: any, idx: number) => (
                <span key={idx} className="text-amber-900 font-medium whitespace-nowrap">
                  {problem.code?.text || problem.code?.coding?.[0]?.display || 'Unknown'}
                  {idx < activeProblems.length - 1 ? ',' : ''}
                </span>
              ))}
              {activeProblems.length < problems.length && (
                <button
                  onClick={onOpenProblems}
                  className="px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded font-semibold hover:bg-amber-200 transition-colors whitespace-nowrap"
                  title={`All active problems: ${problems.filter((p: any) => p.clinicalStatus?.coding?.[0]?.code === 'active').map((p: any) => p.code?.text || p.code?.coding?.[0]?.display || 'Unknown').join(', ')}`}
                >
                  +{problems.filter((p: any) => p.clinicalStatus?.coding?.[0]?.code === 'active').length - activeProblems.length} more
                </button>
              )}
            </div>
          ) : (
            <span className="text-gray-600 font-medium">None</span>
          )}

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={onOpenProblems}
              className="p-0.5 hover:bg-amber-50 rounded transition-colors"
              title="Add Problem"
            >
              <Plus className="h-3.5 w-3.5 text-gray-400 hover:text-amber-600" />
            </button>
            <button
              onClick={onOpenProblems}
              className="p-0.5 hover:bg-amber-50 rounded transition-colors"
              title="View All Problems"
            >
              <Edit className="h-3.5 w-3.5 text-gray-400 hover:text-amber-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
