'use client';

import React from 'react';
import { User, Edit, Plus, ChevronDown, AlertTriangle, Activity, Phone, Mail, Heart, Clock, Shield, Globe, CheckCircle2, MapPin, Languages, Flag, DollarSign, UserCircle, Calendar as CalendarIcon, Stethoscope, Users, FileText, X, Tag, History, Save, XCircle } from 'lucide-react';
import { PatientDetails } from './types';
import { useRouter } from 'next/navigation';
import { PortalAccessDialog } from '@/components/patients/portal-access-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { calculateAge } from '@/utils/shared';
import { format } from 'date-fns';

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
  patient?: PatientDetails | null;
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
  const [expandedSocialNote, setExpandedSocialNote] = React.useState(false);
  const [expandedInternalNote, setExpandedInternalNote] = React.useState(false);
  const [showTagInput, setShowTagInput] = React.useState(false);
  const [newTagValue, setNewTagValue] = React.useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const tagInputRef = React.useRef<HTMLInputElement>(null);

  // Note editing state
  const [editingSocialNote, setEditingSocialNote] = React.useState(false);
  const [editingInternalNote, setEditingInternalNote] = React.useState(false);
  const [socialNoteText, setSocialNoteText] = React.useState("Patient lives alone, has limited mobility. Needs assistance with groceries and transportation to appointments. Has support from daughter who visits weekly.");
  const [internalNoteText, setInternalNoteText] = React.useState("Collect payment before next visit. Follow up on lab results. Patient prefers morning appointments.");
  const [showSocialNoteHistory, setShowSocialNoteHistory] = React.useState(false);
  const [showInternalNoteHistory, setShowInternalNoteHistory] = React.useState(false);

  // Note history - replace with actual data from backend
  const [socialNoteHistory, setSocialNoteHistory] = React.useState<Array<{
    text: string;
    editedBy: string;
    editedAt: string;
  }>>([
    { text: "Patient lives alone, has limited mobility.", editedBy: "Dr. Smith", editedAt: "2025-01-10 10:30 AM" }
  ]);
  const [internalNoteHistory, setInternalNoteHistory] = React.useState<Array<{
    text: string;
    editedBy: string;
    editedAt: string;
  }>>([
    { text: "Collect payment before next visit.", editedBy: "Front Desk", editedAt: "2025-01-09 2:15 PM" }
  ]);

  // Clinical tags/flags - replace with actual data from patient record
  const [clinicalTags, setClinicalTags] = React.useState<string[]>([
    'VIP',
    'High Risk',
    'Requires Interpreter'
  ]);

  // Demographic fields state
  const [editingDemographics, setEditingDemographics] = React.useState(false);
  const [demographics, setDemographics] = React.useState({
    group: 'None',
    ratecard: 'Standard',
    membership: '-',
    race: 'Not specified',
    ethnicity: 'Not specified'
  });

  // Check if patient has portal access
  React.useEffect(() => {
    const patientId = patient?.id;
    if (!patientId) {
      setHasPortalAccess(false);
      setCheckingPortalAccess(false);
      return;
    }

    const checkPortalAccess = async () => {
      try {
        const response = await fetch(`/api/patient/check-portal-access?patientId=${patientId}`);
        const data = await response.json();
        setHasPortalAccess(data.hasAccess || false);
      } catch (error) {
        console.error('Error checking portal access:', error);
      } finally {
        setCheckingPortalAccess(false);
      }
    };

    checkPortalAccess();
  }, [patient?.id]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowEncounterDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus tag input when shown
  React.useEffect(() => {
    if (showTagInput && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [showTagInput]);

  // Handler to add a new tag
  const handleAddTag = () => {
    const trimmedTag = newTagValue.trim();
    if (trimmedTag && !clinicalTags.includes(trimmedTag)) {
      setClinicalTags([...clinicalTags, trimmedTag]);
      setNewTagValue('');
      setShowTagInput(false);
    }
  };

  // Handler for Enter key in tag input
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setShowTagInput(false);
      setNewTagValue('');
    }
  };

  // Save social note
  const handleSaveSocialNote = () => {
    // Add to history
    setSocialNoteHistory([
      {
        text: socialNoteText,
        editedBy: "Current User", // Replace with actual user
        editedAt: new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      ...socialNoteHistory
    ]);
    setEditingSocialNote(false);
    // TODO: Save to backend
  };

  // Save internal note
  const handleSaveInternalNote = () => {
    // Add to history
    setInternalNoteHistory([
      {
        text: internalNoteText,
        editedBy: "Current User", // Replace with actual user
        editedAt: new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      ...internalNoteHistory
    ]);
    setEditingInternalNote(false);
    // TODO: Save to backend
  };

  // Early return if patient data not loaded yet
  if (!patient) {
    return (
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6"></div>
          </div>
        </div>
      </div>
    );
  }

  const activeEncounters = encounters.filter(e => e.status === 'in-progress');
  const activeProblems = problems.filter((p: any) =>
    p.clinicalStatus?.coding?.[0]?.code === 'active'
  ).slice(0, 3);

  const age = patient.dob ? calculateAge(patient.dob) : null;
  const formattedDOB = patient.dob ? format(new Date(patient.dob), 'MM/dd/yyyy') : '-';

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Ultra Compact Text-Based Header */}
      <div className="px-3 py-1.5">
        <div className="flex items-center justify-between">
          {/* Left - Patient Info */}
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-primary" />
            </div>

            <div className="text-xs">
              {/* Name Row */}
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-900">{patient.name} (#{patient.mrn})</span>

                {/* Allergy Alert - Red */}
                {allergies.length > 0 && (
                  <button
                    onClick={onOpenAllergies}
                    className="flex items-center gap-1 text-red-600 font-semibold hover:underline"
                    title={`ALLERGIES: ${allergies.map((a: any) => a.code?.text || a.code?.coding?.[0]?.display).join(', ')}`}
                  >
                    <AlertTriangle className="h-3 w-3" />
                    {allergies.length} Allergy{allergies.length > 1 ? 'ies' : ''}
                  </button>
                )}
              </div>

              {/* Clinical Tags/Flags Row */}
              <div className="flex items-center gap-1 mb-1 flex-wrap">
                {clinicalTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-semibold rounded border border-orange-300"
                  >
                    <Flag className="h-2.5 w-2.5" />
                    {tag}
                    <button
                      onClick={() => setClinicalTags(clinicalTags.filter((_, i) => i !== idx))}
                      className="hover:text-orange-900"
                      title="Remove tag"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}

                {showTagInput ? (
                  <div className="inline-flex items-center gap-1">
                    <input
                      ref={tagInputRef}
                      type="text"
                      value={newTagValue}
                      onChange={(e) => setNewTagValue(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                      onBlur={() => {
                        if (newTagValue.trim()) {
                          handleAddTag();
                        } else {
                          setShowTagInput(false);
                        }
                      }}
                      placeholder="Enter tag..."
                      className="px-2 py-0.5 text-[10px] border border-orange-400 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 w-32"
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setShowTagInput(true)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-gray-500 hover:text-orange-600 text-[10px] border border-dashed border-gray-300 rounded hover:border-orange-400"
                    title="Add clinical tag"
                  >
                    <Tag className="h-2.5 w-2.5" />
                    Add Tag
                  </button>
                )}
              </div>

              {/* Demographics Row */}
              <div className="text-gray-600 mt-0.5">
                {formattedDOB} {age && `(${age}yrs)`} ({patient.gender?.charAt(0).toUpperCase()})
                {patient.email !== '-' && <> • {patient.email}</>}
                {patient.phone !== '-' && <> • {patient.phone}</>}
              </div>

              {/* Additional Info Row */}
              <div className="text-gray-500 mt-0.5 text-[11px] flex items-center gap-2">
                <div>
                  Group: <span className="text-gray-700 font-medium">{demographics.group}</span>
                  {' • '}
                  Ratecard: <span className="text-gray-700 font-medium">{demographics.ratecard}</span>
                  {' • '}
                  Membership: <span className="text-gray-700 font-medium">{demographics.membership}</span>
                  {' • '}
                  Race: <span className="text-gray-700 font-medium">{demographics.race}</span>
                  {' • '}
                  Ethnicity: <span className="text-gray-700 font-medium">{demographics.ethnicity}</span>
                </div>
                <button
                  onClick={() => setEditingDemographics(true)}
                  className="text-gray-500 hover:text-primary"
                  title="Edit demographics"
                >
                  <Edit className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Right - Clinical Context & Notes */}
          <div className="flex items-center gap-3 text-xs text-gray-700 border-l-2 border-gray-300 pl-4 ml-4">
            {/* Provider */}
            <div className="pr-3 border-r-2 border-gray-300">
              <div className="text-gray-500 text-[10px] uppercase font-medium">Provider</div>
              <span className="font-semibold text-primary">Dr. Smith</span>
            </div>

            {/* Last Visit */}
            {encounters.length > 0 && (
              <div className="pr-3 border-r-2 border-gray-300">
                <div className="text-gray-500 text-[10px] uppercase font-medium">Last Visit</div>
                <span className="font-medium">
                  {new Date(encounters[0].period?.start || encounters[0].startTime || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}

            {/* Notes Section - 2 Columns */}
            <div className="grid grid-cols-2 gap-4 divide-x-2 divide-gray-300">
              {/* Social Note */}
              <div className="max-w-[200px] pr-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-theme-secondary font-semibold text-[10px]">SOCIAL NOTE</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowSocialNoteHistory(true)}
                      className="text-theme-secondary hover:opacity-80"
                      title="View note history"
                    >
                      <History className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setEditingSocialNote(true)}
                      className="text-theme-secondary hover:opacity-80"
                      title="Edit social note"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="text-gray-700 text-[11px] leading-tight">
                  {socialNoteText ? (
                    <>
                      <span className={expandedSocialNote ? '' : 'line-clamp-2'}>
                        {socialNoteText}
                      </span>
                      {socialNoteText.length > 60 && (
                        <button
                          onClick={() => setExpandedSocialNote(!expandedSocialNote)}
                          className="text-primary hover:underline ml-1"
                        >
                          {expandedSocialNote ? 'Less' : 'More'}
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => setEditingSocialNote(true)}
                      className="text-gray-400 hover:text-theme-secondary"
                    >
                      + Add social note
                    </button>
                  )}
                </div>
              </div>

              {/* Internal Note */}
              <div className="max-w-[200px] pl-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-orange-600 font-semibold text-[10px]">INTERNAL NOTE</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowInternalNoteHistory(true)}
                      className="text-orange-600 hover:text-orange-700"
                      title="View note history"
                    >
                      <History className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setEditingInternalNote(true)}
                      className="text-orange-600 hover:text-orange-700"
                      title="Edit internal note"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="text-gray-700 text-[11px] leading-tight">
                  {internalNoteText ? (
                    <>
                      <span className={expandedInternalNote ? '' : 'line-clamp-2'}>
                        {internalNoteText}
                      </span>
                      {internalNoteText.length > 60 && (
                        <button
                          onClick={() => setExpandedInternalNote(!expandedInternalNote)}
                          className="text-primary hover:underline ml-1"
                        >
                          {expandedInternalNote ? 'Less' : 'More'}
                        </button>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => setEditingInternalNote(true)}
                      className="text-gray-400 hover:text-orange-600"
                    >
                      + Add internal note
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Portal Icon */}
            <button
              onClick={() => !hasPortalAccess && setPortalAccessDialogOpen(true)}
              className="hover:opacity-70"
              title={hasPortalAccess ? 'Portal Access Granted' : 'Grant Portal Access'}
            >
              {hasPortalAccess ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Globe className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-4">
            {activeEncounters.length > 0 && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowEncounterDropdown(!showEncounterDropdown)}
                  className="px-3 py-1 bg-theme-accent text-white rounded text-xs font-medium hover:opacity-90"
                >
                  Select Encounters ({activeEncounters.length})
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
                            className={`w-full text-left p-2.5 rounded hover:bg-gray-50 transition-colors ${selectedEncounter === encounter.id ? 'bg-primary/5 border border-primary/20' : ''
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
                              <span className="px-2 py-0.5 bg-theme-accent/10 text-theme-accent text-xs font-medium rounded">
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
              className="px-3 py-1 text-xs font-medium text-white bg-primary hover:opacity-90 rounded"
            >
              + New Visit
            </button>
          </div>
        </div>
      </div>

      {/* Clinical Info Row - Responsive with Wrapping */}
      <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 overflow-x-auto">
        <div className="flex items-center flex-wrap lg:flex-nowrap gap-y-2 text-xs gap-x-1">
          {/* Medical Info */}
          <div className="flex items-center gap-1.5 pr-4 border-r-2 border-gray-300 group flex-shrink-0">
            <Heart className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <div className="flex items-center gap-1.5 text-gray-800 whitespace-nowrap">
              <span className="text-gray-600 font-medium">Blood:</span>
              <span className="font-semibold">-</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 font-medium">Due:</span>
              <span className="font-bold text-green-600">₹0.00</span>
            </div>
            <button className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 font-medium transition-all whitespace-nowrap flex-shrink-0">
              Receive
            </button>
            <button className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium transition-all whitespace-nowrap flex-shrink-0">
              Link
            </button>
            <button
              onClick={onOpenMedicalInfo}
              className="p-0.5 hover:bg-primary/10 rounded transition-colors flex-shrink-0"
              title="Edit Medical Info"
            >
              <Edit className="h-3.5 w-3.5 text-gray-400 hover:text-primary" />
            </button>
          </div>

          {/* History */}
          <div className="flex items-center gap-1.5 px-4 pr-4 border-r-2 border-gray-300 group">
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
          <div className="flex items-center gap-1.5 px-4 pr-4 border-r-2 border-gray-300 group">
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
          <div className="flex items-center gap-1.5 px-4 pr-4 border-r-2 border-gray-300 group">
            <Activity className="h-3.5 w-3.5 text-purple-600" />
            <span className="text-gray-600 font-medium">Habits:</span>
            <span className="text-gray-800 font-medium whitespace-nowrap">Drinks, Alcohol (rare)</span>
            <button
              onClick={onOpenMedicalInfo}
              className="p-0.5 hover:bg-theme-secondary/10 rounded transition-colors ml-1"
              title="Add/Edit Habits"
            >
              <Plus className="h-3.5 w-3.5 text-gray-400 hover:text-theme-secondary" />
            </button>
          </div>

          {/* Insurance */}
          <div className="flex items-center gap-1.5 px-4 pr-4 border-r-2 border-gray-300 group">
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
          <div className="flex items-center gap-1.5 px-4 group">
            <Globe className={`h-3.5 w-3.5 ${hasPortalAccess ? 'text-primary' : 'text-gray-400'}`} />
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
                  className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded hover:opacity-90 font-medium transition-all ml-1 whitespace-nowrap"
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

      {/* Social Note Edit Dialog */}
      <Dialog open={editingSocialNote} onOpenChange={setEditingSocialNote}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Social Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="social-note">Note Content</Label>
              <Textarea
                id="social-note"
                value={socialNoteText}
                onChange={(e) => setSocialNoteText(e.target.value)}
                rows={6}
                className="mt-1"
                placeholder="Enter social notes about the patient..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSocialNote(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSocialNote}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Social Note History Dialog */}
      <Dialog open={showSocialNoteHistory} onOpenChange={setShowSocialNoteHistory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Social Note History</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {socialNoteHistory.map((entry, idx) => (
              <div key={idx} className="border-l-2 border-purple-500 pl-3 py-2">
                <div className="text-sm text-gray-700">{entry.text}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Edited by <span className="font-medium">{entry.editedBy}</span> on {entry.editedAt}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSocialNoteHistory(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Internal Note Edit Dialog */}
      <Dialog open={editingInternalNote} onOpenChange={setEditingInternalNote}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Internal Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="internal-note">Note Content</Label>
              <Textarea
                id="internal-note"
                value={internalNoteText}
                onChange={(e) => setInternalNoteText(e.target.value)}
                rows={6}
                className="mt-1"
                placeholder="Enter internal notes (not visible to patient)..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingInternalNote(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveInternalNote}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Internal Note History Dialog */}
      <Dialog open={showInternalNoteHistory} onOpenChange={setShowInternalNoteHistory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Internal Note History</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {internalNoteHistory.map((entry, idx) => (
              <div key={idx} className="border-l-2 border-orange-500 pl-3 py-2">
                <div className="text-sm text-gray-700">{entry.text}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Edited by <span className="font-medium">{entry.editedBy}</span> on {entry.editedAt}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowInternalNoteHistory(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Demographics Edit Dialog */}
      <Dialog open={editingDemographics} onOpenChange={setEditingDemographics}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Demographics</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="group">Group</Label>
                <Input
                  id="group"
                  value={demographics.group}
                  onChange={(e) => setDemographics({ ...demographics, group: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ratecard">Ratecard</Label>
                <Select
                  value={demographics.ratecard}
                  onValueChange={(value) => setDemographics({ ...demographics, ratecard: value })}
                >
                  <SelectTrigger id="ratecard" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                    <SelectItem value="Discounted">Discounted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="membership">Membership</Label>
              <Input
                id="membership"
                value={demographics.membership}
                onChange={(e) => setDemographics({ ...demographics, membership: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="race">Race</Label>
                <Select
                  value={demographics.race}
                  onValueChange={(value) => setDemographics({ ...demographics, race: value })}
                >
                  <SelectTrigger id="race" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not specified">Not specified</SelectItem>
                    <SelectItem value="American Indian or Alaska Native">American Indian or Alaska Native</SelectItem>
                    <SelectItem value="Asian">Asian</SelectItem>
                    <SelectItem value="Black or African American">Black or African American</SelectItem>
                    <SelectItem value="Native Hawaiian or Other Pacific Islander">Native Hawaiian or Other Pacific Islander</SelectItem>
                    <SelectItem value="White">White</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ethnicity">Ethnicity</Label>
                <Select
                  value={demographics.ethnicity}
                  onValueChange={(value) => setDemographics({ ...demographics, ethnicity: value })}
                >
                  <SelectTrigger id="ethnicity" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not specified">Not specified</SelectItem>
                    <SelectItem value="Hispanic or Latino">Hispanic or Latino</SelectItem>
                    <SelectItem value="Not Hispanic or Latino">Not Hispanic or Latino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDemographics(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setEditingDemographics(false);
              // TODO: Save to backend
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Active Problems Row - Responsive */}
      <div className="px-3 py-2 bg-white border-t-2 border-gray-300 overflow-x-auto">
        <div className="flex items-center gap-2 text-xs flex-wrap lg:flex-nowrap">
          <div className="flex items-center gap-1.5 whitespace-nowrap pr-3 border-r-2 border-gray-300">
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