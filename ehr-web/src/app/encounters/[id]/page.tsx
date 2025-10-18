'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  Calendar,
  Printer,
  User,
  Phone,
  Mail,
  MoreVertical,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Encounter, AddressData, NoteData, InsuranceData, EncounterStatus } from '@/types/encounter';
import { EncounterService } from '@/services/encounter.service';
import { AddressService } from '@/services/address.service';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { PatientSidebar } from '@/components/encounters/patient-sidebar';
import { MedicalInfoDrawer } from '@/components/encounters/medical-info-drawer';
import { MedicalHistoryDrawer } from '@/components/encounters/medical-history-drawer';
import { ClinicalNoteSection } from '@/components/encounters/clinical-note-section';
import { ClinicalNoteForm } from '@/components/encounters/clinical-note-form';
import { TreatmentPlanSection } from '@/components/encounters/treatment-plan-section';
import { PrescriptionsSection } from '@/components/encounters/prescriptions-section';
import { InstructionsSection } from '@/components/encounters/instructions-section';
import { PackageSection } from '@/components/encounters/package-section';

export default function EncounterPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const encounterId = params.id as string;

  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showMedicalInfoDrawer, setShowMedicalInfoDrawer] = useState(false);
  const [showMedicalHistoryDrawer, setShowMedicalHistoryDrawer] = useState(false);

  // Expanded sections for accordion
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    clinicalNote: false,
    treatmentPlan: false,
    prescriptions: false,
    instructions: false,
    packages: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    loadEncounter();
  }, [encounterId]);

  const loadEncounter = async () => {
    try {
      setLoading(true);
      const data = await EncounterService.getById(encounterId);

      // Load patient addresses, notes, and medical info
      if (data.patientId) {
        try {
          console.log('📥 Loading patient data for patient:', data.patientId);
          const patientData = await AddressService.getPatientData(data.patientId);
          console.log('📥 Patient data loaded:', patientData);
          data.addresses = patientData.addresses;
          data.socialNotes = patientData.socialNotes;
          data.internalNotes = patientData.internalNotes;
          data.insuranceCards = patientData.insuranceCards;
          data.patientHistory = patientData.patientHistory;
          data.patientHabitsStructured = patientData.habitsStructured;
          data.patientAllergiesStructured = patientData.allergiesStructured;

          // Also get patient resource to check active status
          try {
            const patientResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/fhir/R4/Patient/${data.patientId}`, {
              credentials: 'include',
            });
            if (patientResponse.ok) {
              const patient = await patientResponse.json();
              data.patientActive = patient.active !== false; // Default to true if not set
              console.log('📥 Patient active status:', data.patientActive);
            }
          } catch (error) {
            console.error('Error loading patient active status:', error);
            data.patientActive = true; // Default to active
          }

          console.log('📥 Setting encounter with addresses:', data.addresses);
        } catch (error) {
          console.error('Error loading patient data:', error);
          // Continue with empty arrays if patient data fails to load
          data.addresses = [];
          data.socialNotes = [];
          data.internalNotes = [];
          data.patientActive = true;
        }
      }

      console.log('📥 Final encounter data before setState:', data);
      setEncounter(data);
    } catch (error) {
      console.error('Error loading encounter:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEncounterField = (field: keyof Encounter, value: any) => {
    if (!encounter) return;
    setEncounter({
      ...encounter,
      [field]: value
    });
  };

  if (loading) {
    return (
      <div className="flex h-full -m-6">
        {/* Left Sidebar Skeleton */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
        {/* Main Content Skeleton */}
        <div className="flex-1 bg-gray-50 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-white rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!encounter) {
    return (
      <div className="flex h-full items-center justify-center -m-6">
        <div className="text-center">
          <p className="text-gray-600">Encounter not found</p>
          <button
            onClick={() => router.push('/appointments')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  // Get primary address for header display
  const primaryAddress = encounter.addresses?.find(addr => addr.isPrimary && addr.isActive) ||
                        encounter.addresses?.find(addr => addr.isActive);

  // Helper function to format structured habits for display
  const formatHabitsDisplay = (): string => {
    if (encounter.patientHabitsStructured) {
      const { status, habits } = encounter.patientHabitsStructured;
      if (status === 'noHabits') return 'No Habits';
      if (status === 'unknown') return 'Unknown';
      if (status === 'haveHabits') {
        const activeHabits = habits
          .filter(h => h.status === 'active')
          .map(h => `${h.name} (${h.frequency})`)
          .join(', ');
        return activeHabits || 'Have Habits (none specified)';
      }
    }
    return encounter.patientHabits || '-';
  };

  // Helper function to format structured allergies for display
  const formatAllergiesDisplay = (): string => {
    if (encounter.patientAllergiesStructured) {
      const { status, allergies } = encounter.patientAllergiesStructured;
      if (status === 'noAllergies') return 'No Allergies';
      if (status === 'unknown') return 'Unknown';
      if (status === 'haveAllergies') {
        const activeAllergies = allergies
          .filter(a => a.status === 'active')
          .map(a => `${a.name} (${a.severity})`)
          .join(', ');
        return activeAllergies || 'Have Allergies (none specified)';
      }
    }
    return encounter.patientAllergies || '-';
  };

  return (
    <div className="flex h-full overflow-hidden bg-gray-50 -m-6">
      {/* Left Sidebar - Patient Info - STICKY */}
      <PatientSidebar
        patientName={encounter.patientName}
        patientId={encounter.patientId}
        relationshipDate={new Date(encounter.startTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        patientHistory={encounter.patientHistory}
        patientAllergies={encounter.patientAllergies}
        patientHabits={encounter.patientHabits}
        patientActive={encounter.patientActive}
        addresses={encounter.addresses || []}
        socialNotes={encounter.socialNotes || []}
        internalNotes={encounter.internalNotes || []}
        insuranceCards={encounter.insuranceCards || []}
        currentUserId={session?.fhirUser || session?.user?.email || 'unknown'}
        currentUserName={session?.user?.name || 'Unknown User'}
        onBack={() => router.push('/appointments')}
        onUpdateMedicalInfo={(data) => {
          setEncounter({
            ...encounter,
            ...data
          });
        }}
        onUpdateAddresses={async (addresses: AddressData[]) => {
          try {
            // Update addresses along with preserving existing notes
            await AddressService.updatePatientData(
              encounter.patientId,
              addresses,
              encounter.socialNotes || [],
              encounter.internalNotes || []
            );
            console.log('✅ Addresses saved successfully:', addresses);
            // Update the encounter state with new addresses
            setEncounter({
              ...encounter,
              addresses
            });
            console.log('✅ Encounter state updated with new addresses');
          } catch (error) {
            console.error('❌ Failed to update addresses:', error);
            throw error;
          }
        }}
        onUpdateSocialNotes={async (notes: NoteData[]) => {
          try {
            // Update social notes along with preserving addresses and internal notes
            await AddressService.updatePatientData(
              encounter.patientId,
              encounter.addresses || [],
              notes,
              encounter.internalNotes || []
            );
            setEncounter({
              ...encounter,
              socialNotes: notes
            });
          } catch (error) {
            console.error('Failed to update social notes:', error);
            throw error;
          }
        }}
        onUpdateInternalNotes={async (notes: NoteData[]) => {
          try {
            // Update internal notes along with preserving addresses and social notes
            await AddressService.updatePatientData(
              encounter.patientId,
              encounter.addresses || [],
              encounter.socialNotes || [],
              notes
            );
            setEncounter({
              ...encounter,
              internalNotes: notes
            });
          } catch (error) {
            console.error('Failed to update internal notes:', error);
            throw error;
          }
        }}
        onUpdateInsuranceCards={async (cards: InsuranceData[]) => {
          try {
            // Update insurance cards
            await AddressService.updateInsuranceCards(encounter.patientId, cards);
            setEncounter({
              ...encounter,
              insuranceCards: cards
            });
            console.log('✅ Insurance cards updated successfully');
          } catch (error) {
            console.error('❌ Failed to update insurance cards:', error);
            throw error;
          }
        }}
        onUpdatePatientStatus={async (active: boolean) => {
          try {
            await AddressService.updatePatientStatus(encounter.patientId, active);
            setEncounter({
              ...encounter,
              patientActive: active
            });
            console.log('✅ Patient status updated in encounter state:', active);
          } catch (error) {
            console.error('❌ Failed to update patient status:', error);
            throw error;
          }
        }}
      />

      {/* Medical Info Drawer */}
      <MedicalInfoDrawer
        isOpen={showMedicalInfoDrawer}
        onClose={() => setShowMedicalInfoDrawer(false)}
        patientHistory={encounter.patientHistory}
        patientHabitsStructured={encounter.patientHabitsStructured}
        patientAllergiesStructured={encounter.patientAllergiesStructured}
        onUpdate={async (data) => {
          try {
            console.log('📝 Updating medical info with data:', data);

            // Update encounter state locally
            setEncounter({
              ...encounter,
              ...data
            });

            // Save all medical data to FHIR (including patient history)
            await AddressService.updatePatientMedicalInfo(
              encounter.patientId,
              data.patientHistory || encounter.patientHistory,
              data.patientHabitsStructured || encounter.patientHabitsStructured,
              data.patientAllergiesStructured || encounter.patientAllergiesStructured
            );
            console.log('✅ Medical info saved successfully');
          } catch (error) {
            console.error('❌ Failed to save medical info:', error);
            alert('Failed to save medical information. Please try again.');
          }
        }}
      />

      {/* Medical History Drawer */}
      <MedicalHistoryDrawer
        isOpen={showMedicalHistoryDrawer}
        onClose={() => setShowMedicalHistoryDrawer(false)}
        patientId={encounter.patientId}
        currentEncounterDate={new Date(encounter.startTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Top Header Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-start justify-between gap-8">
            {/* Left Section - Medical Information */}
            <div className="flex-1 min-w-0" style={{ maxWidth: 'calc(100% - 250px)' }}>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-sm font-semibold text-gray-900">Medical Information</h3>
                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium">Latest</span>
                <button
                  onClick={() => setShowMedicalInfoDrawer(true)}
                  className="text-blue-600 hover:text-blue-700"
                  title="Edit Medical Information"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <span className="text-xs text-gray-400">•</span>
                <button
                  onClick={() => setShowMedicalHistoryDrawer(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  View History
                </button>
              </div>
              <div className="grid grid-cols-3 gap-x-6 text-xs">
                <div>
                  <span className="text-gray-600 block mb-0.5">History</span>
                  <p className="text-red-600 font-medium">{encounter.patientHistory || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-600 block mb-0.5">Allergies</span>
                  <p className="text-red-600 font-medium truncate" title={formatAllergiesDisplay()}>{formatAllergiesDisplay()}</p>
                </div>
                <div>
                  <span className="text-gray-600 block mb-0.5">Habits</span>
                  <p className="text-gray-900 truncate" title={formatHabitsDisplay()}>{formatHabitsDisplay()}</p>
                </div>
              </div>
            </div>

            {/* Right Section - Status & Emergency Contact */}
            <div className="flex flex-col gap-3">
              {/* Encounter Status */}
              <div className="min-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">Status</h3>
                  {updatingStatus && (
                    <span className="text-[10px] text-blue-600 font-medium">Updating...</span>
                  )}
                </div>
                <div className="compact-select">
                  <SearchableSelect
                    value={encounter.status}
                    onChange={async (newStatus) => {
                      const previousStatus = encounter.status;

                      try {
                        setUpdatingStatus(true);
                        console.log(`🔄 Updating encounter status from ${previousStatus} to ${newStatus}`);

                        // Optimistically update UI
                        setEncounter({ ...encounter, status: newStatus as EncounterStatus });

                        // Update backend
                        await EncounterService.updateStatus(encounter.id, newStatus as EncounterStatus);

                        console.log('✅ Encounter status updated successfully');
                      } catch (error) {
                        console.error('❌ Error updating encounter status:', error);

                        // Revert on error
                        setEncounter({ ...encounter, status: previousStatus });
                        alert('Failed to update encounter status. Please try again.');
                      } finally {
                        setUpdatingStatus(false);
                      }
                    }}
                    options={[
                      {
                        value: 'planned',
                        label: 'Planned',
                        color: '#dbeafe',
                        textColor: '#1e40af'
                      },
                      {
                        value: 'in-progress',
                        label: 'In Progress',
                        color: '#dcfce7',
                        textColor: '#15803d'
                      },
                      {
                        value: 'on-hold',
                        label: 'On Hold',
                        color: '#fef3c7',
                        textColor: '#92400e'
                      },
                      {
                        value: 'completed',
                        label: 'Completed',
                        color: '#f3f4f6',
                        textColor: '#4b5563'
                      },
                      {
                        value: 'cancelled',
                        label: 'Cancelled',
                        color: '#fee2e2',
                        textColor: '#991b1b'
                      },
                      {
                        value: 'entered-in-error',
                        label: 'Entered in Error',
                        color: '#fecaca',
                        textColor: '#7f1d1d'
                      }
                    ]}
                    disabled={updatingStatus}
                    showColorInButton={true}
                    placeholder="Select..."
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900">Emergency Contact</h3>
                  <button className="text-blue-600 hover:text-blue-700">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
                <div className="text-xs space-y-0.5">
                  <div>
                    <span className="text-gray-600">Name: </span>
                    <span className="text-gray-900 font-medium">{primaryAddress?.emergencyContactName || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone: </span>
                    <span className="text-gray-900 font-medium">{primaryAddress?.emergencyContactNumber || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Practitioner: </span>
                    <span className="text-gray-900 font-medium">{primaryAddress?.generalPractitioner || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex px-6">
            <button className="px-4 py-3 text-sm font-medium border-b-2 border-blue-600 text-blue-600">
              VISITS
            </button>
            <button className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
              DOCS & IMAGES
            </button>
            <button className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
              MEMBERSHIP
            </button>
            <button className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
              ORTHODONTIC
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="container-fluid px-6 py-6 space-y-4 max-w-full">
            {/* Visit Card */}
            <div className="bg-white rounded-lg border border-gray-200">
              {/* Visit Header */}
              <div className="flex items-center justify-between px-6 py-3 bg-yellow-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-yellow-400 text-white font-semibold text-sm rounded">
                    {new Date(encounter.startTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                  </div>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <Printer className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <MoreVertical className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              {/* Clinical Note Section */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => toggleSection('clinicalNote')}
                  className="w-full px-6 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <h3 className="font-semibold text-sm">CLINICAL NOTE</h3>
                  </div>
                  {expandedSections.clinicalNote ? (
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  )}
                </button>
                <div className="px-6 py-4">
                  {/* Summary Table */}
                  <div className="mb-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Chief Complaint</span>
                      <span className="text-gray-600">{encounter.chiefComplaint ? '1' : '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Findings</span>
                      <span className="text-gray-600">{encounter.findings?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Investigation</span>
                      <span className="text-gray-600">{encounter.investigations?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Diagnosis</span>
                      <span className="text-gray-600">{encounter.diagnoses?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Notes</span>
                      <span className="text-gray-600">{encounter.clinicalNotes ? '1' : '0'}</span>
                    </div>
                  </div>

                  {/* Findings Table if exists */}
                  {encounter.findings && encounter.findings.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">#</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Surface</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Pop</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">TOP</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Pulp Sensibility</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Conclusion</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Files</th>
                          </tr>
                        </thead>
                        <tbody>
                          {encounter.findings.map((finding, idx) => (
                            <tr key={finding.id} className="border-t border-gray-200">
                              <td className="px-3 py-2">{idx + 1}</td>
                              <td className="px-3 py-2">{finding.surface || '-'}</td>
                              <td className="px-3 py-2">{finding.pop || '-'}</td>
                              <td className="px-3 py-2">{finding.top || '-'}</td>
                              <td className="px-3 py-2">{finding.pulpSensibility || '-'}</td>
                              <td className="px-3 py-2">{finding.conclusion || '-'}</td>
                              <td className="px-3 py-2">-</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Expandable content */}
                  {expandedSections.clinicalNote && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <ClinicalNoteForm
                        encounter={encounter}
                        onUpdate={async (data) => {
                          try {
                            console.log('💾 Saving clinical note data:', data);

                            // Update local state immediately for responsive UI
                            setEncounter({
                              ...encounter,
                              ...data
                            });

                            // Save to backend
                            await EncounterService.update(encounter.id, data);

                            console.log('✅ Clinical note data saved successfully');
                          } catch (error) {
                            console.error('❌ Failed to save clinical note data:', error);
                            throw error;
                          }
                        }}
                        practitioners={[
                          { id: encounter.practitionerId, name: encounter.practitionerName }
                        ]}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Treatment Plan Section */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => toggleSection('treatmentPlan')}
                  className="w-full px-6 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <h3 className="font-semibold text-sm">TREATMENT PLAN</h3>
                  </div>
                  {expandedSections.treatmentPlan ? (
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  )}
                </button>
                <div className="px-6 py-4">
                  {encounter.treatmentPlan && encounter.treatmentPlan.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Treatment</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Charges</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Gross Amt</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Disc</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Net Amt</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">GST</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold text-gray-700">Total</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Note</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Files</th>
                          </tr>
                        </thead>
                        <tbody>
                          {encounter.treatmentPlan.map((item) => (
                            <tr key={item.id} className="border-t border-gray-200">
                              <td className="px-3 py-2">{item.treatment}</td>
                              <td className="px-3 py-2 text-right">{item.charges.toFixed(2)}</td>
                              <td className="px-3 py-2 text-right">{item.grossAmount.toFixed(2)}</td>
                              <td className="px-3 py-2 text-right">{item.discount.toFixed(2)}</td>
                              <td className="px-3 py-2 text-right">{item.netAmount.toFixed(2)}</td>
                              <td className="px-3 py-2 text-right">{item.gst.toFixed(2)}</td>
                              <td className="px-3 py-2 text-right font-medium">{item.total.toFixed(2)}</td>
                              <td className="px-3 py-2">{item.note || '-'}</td>
                              <td className="px-3 py-2">-</td>
                            </tr>
                          ))}
                          <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
                            <td className="px-3 py-2">Total</td>
                            <td className="px-3 py-2 text-right">
                              {encounter.treatmentPlan.reduce((sum, item) => sum + item.charges, 0).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {encounter.treatmentPlan.reduce((sum, item) => sum + item.grossAmount, 0).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {encounter.treatmentPlan.reduce((sum, item) => sum + item.discount, 0).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {encounter.treatmentPlan.reduce((sum, item) => sum + item.netAmount, 0).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {encounter.treatmentPlan.reduce((sum, item) => sum + item.gst, 0).toFixed(2)}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {encounter.treatmentPlan.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                            </td>
                            <td className="px-3 py-2" colSpan={2}></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No treatment plan added</p>
                  )}

                  {/* Expandable content */}
                  {expandedSections.treatmentPlan && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <TreatmentPlanSection
                        treatmentPlan={encounter.treatmentPlan}
                        onUpdate={(treatmentPlan) => updateEncounterField('treatmentPlan', treatmentPlan)}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Instructions Section */}
              <div>
                <button
                  onClick={() => toggleSection('instructions')}
                  className="w-full px-6 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <h3 className="font-semibold text-sm">INSTRUCTIONS</h3>
                  </div>
                  {expandedSections.instructions ? (
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-600" />
                  )}
                </button>
                <div className="px-6 py-4">
                  {encounter.instructions && encounter.instructions.length > 0 ? (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{encounter.instructions.map(i => i.text).join(', ')}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No instructions added</p>
                  )}

                  {/* Expandable content */}
                  {expandedSections.instructions && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <InstructionsSection
                        instructions={encounter.instructions}
                        onUpdate={(instructions) => updateEncounterField('instructions', instructions)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Expand All Visits Button */}
            <div className="text-center">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Expand all visits
              </button>
            </div>

            {/* Get Lifetime Data Button */}
            <div className="text-center py-8">
              <button className="px-6 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors">
                Get Lifetime Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
