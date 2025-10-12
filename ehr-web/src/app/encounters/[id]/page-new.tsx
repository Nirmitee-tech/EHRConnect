'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  CheckCircle,
  Calendar,
  User,
  Edit,
  Printer,
  ChevronDown,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Encounter } from '@/types/encounter';
import { EncounterService } from '@/services/encounter.service';

export default function EncounterPageNew() {
  const params = useParams();
  const router = useRouter();
  const encounterId = params.id as string;

  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    clinicalNote: true,
    treatmentPlan: true,
    prescriptions: false,
    package: false,
    instructions: false,
  });

  useEffect(() => {
    loadEncounter();
  }, [encounterId]);

  const loadEncounter = async () => {
    try {
      setLoading(true);
      const data = await EncounterService.getById(encounterId);
      setEncounter(data);
    } catch (error) {
      console.error('Error loading encounter:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSave = async () => {
    if (!encounter) return;
    try {
      setSaving(true);
      // Save logic will be implemented
      await EncounterService.update(encounter.id, encounter);
      await loadEncounter();
    } catch (error) {
      console.error('Error saving encounter:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!encounter) return;
    if (confirm('Complete this encounter? This will mark the appointment as completed.')) {
      try {
        setSaving(true);
        await EncounterService.complete(encounter.id);
        alert('Encounter completed successfully!');
        router.push('/appointments');
      } catch (error) {
        console.error('Error completing encounter:', error);
        alert('Failed to complete encounter');
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading encounter...</p>
        </div>
      </div>
    );
  }

  if (!encounter) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left - Back button and Patient Info */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/appointments')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {encounter.patientName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{encounter.patientName}</h1>
                    <p className="text-sm text-gray-500">{encounter.patientId}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'SAVE'}
              </button>
              <button
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
            </div>
          </div>

          {/* Sub-header with Visit Info */}
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Visit Date:</span>
              <input
                type="date"
                value={new Date(encounter.startTime).toISOString().split('T')[0]}
                className="px-2 py-1 border border-gray-300 rounded"
                readOnly
              />
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Doctor:</span>
              <span className="font-medium">{encounter.practitionerName}</span>
              <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                Change Doctor
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Appointment:</span>
              <span className="font-medium">
                {new Date(encounter.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left Sidebar - Medical Information */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Medical Information</h3>
            <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
              <Edit className="h-3 w-3" />
              Update Medical History, Habits, Allergies
            </button>
          </div>

          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-1">History</h4>
            <p className="text-xs text-gray-600">
              {encounter.patientHistory || 'No medical history recorded'}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-1">Allergies</h4>
            <p className="text-xs text-gray-600">
              {encounter.patientAllergies || 'No known allergies'}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-1">Habits</h4>
            <p className="text-xs text-gray-600">
              {encounter.patientHabits || 'No habits recorded'}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 space-y-4">
          {/* Clinical Note Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <button
              onClick={() => toggleSection('clinicalNote')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">CLINICAL NOTE</h2>
              </div>
              {expandedSections.clinicalNote ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </button>
            {expandedSections.clinicalNote && (
              <div className="px-6 pb-6 border-t border-gray-200">
                {/* Clinical Note Content - Component will go here */}
                <div className="py-4 text-gray-500 text-center">
                  Clinical Note Component (Chief Complaint, Findings, Investigation, Diagnosis, Notes)
                </div>
              </div>
            )}
          </div>

          {/* Treatment Plan Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <button
              onClick={() => toggleSection('treatmentPlan')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">TREATMENT PLAN</h2>
              </div>
              {expandedSections.treatmentPlan ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </button>
            {expandedSections.treatmentPlan && (
              <div className="px-6 pb-6 border-t border-gray-200">
                {/* Treatment Plan Content - Component will go here */}
                <div className="py-4 text-gray-500 text-center">
                  Treatment Plan Component (Table with pricing, GST calculations)
                </div>
              </div>
            )}
          </div>

          {/* Prescriptions Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <button
              onClick={() => toggleSection('prescriptions')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">PRESCRIPTIONS</h2>
              </div>
              {expandedSections.prescriptions ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </button>
            {expandedSections.prescriptions && (
              <div className="px-6 pb-6 border-t border-gray-200">
                {/* Prescriptions Content - Component will go here */}
                <div className="py-4 text-gray-500 text-center">
                  Prescriptions Component (Medication list with CRUD)
                </div>
              </div>
            )}
          </div>

          {/* Package Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <button
              onClick={() => toggleSection('package')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">PACKAGE</h2>
              </div>
              {expandedSections.package ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </button>
            {expandedSections.package && (
              <div className="px-6 pb-6 border-t border-gray-200">
                {/* Package Content - Component will go here */}
                <div className="py-4 text-gray-500 text-center">
                  Package Component (Predefined treatment packages)
                </div>
              </div>
            )}
          </div>

          {/* Instructions Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <button
              onClick={() => toggleSection('instructions')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">INSTRUCTIONS</h2>
              </div>
              {expandedSections.instructions ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </button>
            {expandedSections.instructions && (
              <div className="px-6 pb-6 border-t border-gray-200">
                {/* Instructions Content - Component will go here */}
                <div className="py-4 text-gray-500 text-center">
                  Instructions Component (Post-treatment care instructions)
                </div>
              </div>
            )}
          </div>

          {/* Complete Encounter Button */}
          {encounter.status === 'in-progress' && (
            <div className="flex justify-end pt-4">
              <button
                onClick={handleComplete}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium transition-colors"
              >
                <CheckCircle className="h-5 w-5" />
                Complete Encounter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
