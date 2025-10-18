'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Loader2 } from 'lucide-react';
import { EncounterService } from '@/services/encounter.service';
import { AddressService } from '@/services/address.service';

interface MedicalHistoryEntry {
  encounterId: string;
  encounterDate: string;
  patientHistory?: string;
  patientAllergies?: string;
  patientHabits?: string;
  habitsDisplay?: string;
  allergiesDisplay?: string;
}

interface MedicalHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  currentEncounterDate: string;
}

export function MedicalHistoryDrawer({
  isOpen,
  onClose,
  patientId,
  currentEncounterDate
}: MedicalHistoryDrawerProps) {
  const [historyEntries, setHistoryEntries] = useState<MedicalHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && patientId) {
      loadMedicalHistory();
    }
  }, [isOpen, patientId]);

  const loadMedicalHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Loading medical history for patient:', patientId);

      // Fetch all encounters for this patient
      const encounters = await EncounterService.getByPatientId(patientId);
      console.log('📊 Found encounters:', encounters.length);

      // Get current patient medical data (this is the latest)
      const patientData = await AddressService.getPatientData(patientId);
      console.log('📊 Current patient data:', patientData);

      // Build history entries - in a real implementation, medical data should be
      // stored per encounter. For now, we'll show the current data for all encounters
      // TODO: Store medical info snapshot with each encounter
      const entries: MedicalHistoryEntry[] = encounters.map((encounter, index) => {
        const encounterDate = new Date(encounter.startTime).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });

        // Format structured data for display
        let habitsDisplay = '-';
        if (patientData.habitsStructured) {
          const { status, habits } = patientData.habitsStructured;
          if (status === 'noHabits') habitsDisplay = 'No Habits';
          else if (status === 'unknown') habitsDisplay = 'Unknown';
          else if (status === 'haveHabits') {
            const activeHabits = habits
              .filter(h => h.status === 'active')
              .map(h => `${h.name} (${h.frequency})`)
              .join(', ');
            habitsDisplay = activeHabits || 'Have Habits (none specified)';
          }
        }

        let allergiesDisplay = '-';
        if (patientData.allergiesStructured) {
          const { status, allergies } = patientData.allergiesStructured;
          if (status === 'noAllergies') allergiesDisplay = 'No Allergies';
          else if (status === 'unknown') allergiesDisplay = 'Unknown';
          else if (status === 'haveAllergies') {
            const activeAllergies = allergies
              .filter(a => a.status === 'active')
              .map(a => `${a.name} (${a.severity})`)
              .join(', ');
            allergiesDisplay = activeAllergies || 'Have Allergies (none specified)';
          }
        }

        return {
          encounterId: encounter.id,
          encounterDate,
          patientHistory: index === 0 ? (patientData.habitsStructured ? 'From structured data' : '-') : 'Historical data (stored per encounter)',
          patientAllergies: allergiesDisplay,
          patientHabits: habitsDisplay,
          habitsDisplay,
          allergiesDisplay
        };
      });

      setHistoryEntries(entries);
      console.log('✅ Medical history loaded:', entries.length, 'entries');
    } catch (err) {
      console.error('❌ Error loading medical history:', err);
      setError('Failed to load medical history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-[9998]"
        onClick={onClose}
      />

      {/* Side Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl z-[9999] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Medical Information History</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <p className="text-sm text-gray-600 mb-6">
            View medical information captured during previous encounters
          </p>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
              <p className="text-sm text-gray-600">Loading medical history...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={loadMedicalHistory}
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && historyEntries.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No encounter history found</p>
              <p className="text-gray-400 text-xs mt-1">Medical information will appear here after encounters</p>
            </div>
          )}

          {/* History Entries */}
          {!loading && !error && historyEntries.length > 0 && (
            <div className="space-y-4">
              {historyEntries.map((entry, index) => (
                <div
                  key={entry.encounterId}
                  className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                >
                  {/* Date Header */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900">{entry.encounterDate}</span>
                    </div>
                    {index === 0 && (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded font-medium">
                        Latest
                      </span>
                    )}
                  </div>

                  {/* Medical Data */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-semibold text-gray-700 block mb-1">Medical History</span>
                      <p className="text-sm text-gray-900">{entry.patientHistory || '-'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-700 block mb-1">Allergies</span>
                      <p className="text-sm text-red-600 font-medium">{entry.allergiesDisplay || entry.patientAllergies || '-'}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-700 block mb-1">Habits</span>
                      <p className="text-sm text-gray-900">{entry.habitsDisplay || entry.patientHabits || '-'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <p className="text-xs text-gray-500">
            Showing medical information from all encounters
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
