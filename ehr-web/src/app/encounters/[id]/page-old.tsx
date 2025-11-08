'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  MapPin,
  Save,
  CheckCircle,
  XCircle,
  Heart,
  Activity,
  Thermometer,
  Wind,
  Droplet,
  TrendingUp,
  FileText,
  Stethoscope,
  Pill,
  ClipboardList
} from 'lucide-react';
import { Encounter } from '@/types/encounter';
import { EncounterService } from '@/services/encounter.service';

export default function EncounterPage() {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const encounterId = params?.id ?? '';

  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'vitals' | 'assessment' | 'plan' | 'notes'>('vitals');

  // Form state
  const [vitals, setVitals] = useState({
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    temperature: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    height: '',
  });

  const [chiefComplaint, setChiefComplaint] = useState('');
  const [presentingProblem, setPresentingProblem] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  useEffect(() => {
    if (encounterId) {
      loadEncounter();
    }
  }, [encounterId]);

  const loadEncounter = async () => {
    if (!encounterId) {
      return;
    }
    try {
      setLoading(true);
      const data = await EncounterService.getById(encounterId);
      setEncounter(data);

      // Populate form with existing data
      if (data.vitals) {
        setVitals({
          bloodPressureSystolic: data.vitals.bloodPressureSystolic?.toString() || '',
          bloodPressureDiastolic: data.vitals.bloodPressureDiastolic?.toString() || '',
          heartRate: data.vitals.heartRate?.toString() || '',
          temperature: data.vitals.temperature?.toString() || '',
          respiratoryRate: data.vitals.respiratoryRate?.toString() || '',
          oxygenSaturation: data.vitals.oxygenSaturation?.toString() || '',
          weight: data.vitals.weight?.toString() || '',
          height: data.vitals.height?.toString() || '',
        });
      }

      setChiefComplaint(data.chiefComplaint || '');
      setPresentingProblem(data.presentingProblem || '');
      setClinicalNotes(data.clinicalNotes || '');
    } catch (error) {
      console.error('Error loading encounter:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (skipReload = false) => {
    if (!encounter) return;

    try {
      setSaving(true);

      // Calculate BMI if height and weight are provided
      let bmi: number | undefined;
      if (vitals.height && vitals.weight) {
        const heightInMeters = parseFloat(vitals.height) / 100;
        bmi = parseFloat(vitals.weight) / (heightInMeters * heightInMeters);
      }

      await EncounterService.update(encounter.id, {
        vitals: {
          bloodPressureSystolic: vitals.bloodPressureSystolic ? parseFloat(vitals.bloodPressureSystolic) : undefined,
          bloodPressureDiastolic: vitals.bloodPressureDiastolic ? parseFloat(vitals.bloodPressureDiastolic) : undefined,
          heartRate: vitals.heartRate ? parseFloat(vitals.heartRate) : undefined,
          temperature: vitals.temperature ? parseFloat(vitals.temperature) : undefined,
          respiratoryRate: vitals.respiratoryRate ? parseFloat(vitals.respiratoryRate) : undefined,
          oxygenSaturation: vitals.oxygenSaturation ? parseFloat(vitals.oxygenSaturation) : undefined,
          weight: vitals.weight ? parseFloat(vitals.weight) : undefined,
          height: vitals.height ? parseFloat(vitals.height) : undefined,
          bmi,
        },
        chiefComplaint,
        presentingProblem,
        clinicalNotes,
      });

      if (!skipReload) {
        await loadEncounter();
      }
    } catch (error) {
      console.error('Error saving encounter:', error);
      throw error; // Re-throw to handle in complete function
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteEncounter = async () => {
    if (!encounter) return;

    if (confirm('Are you sure you want to complete this encounter? This will also mark the appointment as completed.')) {
      try {
        setSaving(true);

        // First save any pending changes (skip reload)
        await handleSave(true);

        // Then complete the encounter (which also completes the appointment)
        await EncounterService.complete(encounter.id);

        // Show success message
        alert('Encounter completed successfully! The appointment has been marked as completed.');

        // Navigate back to appointments
        router.push('/appointments');
      } catch (error) {
        console.error('Error completing encounter:', error);
        alert('Failed to complete encounter. Please try again.');
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading encounter...</p>
        </div>
      </div>
    );
  }

  if (!encounter) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Encounter Not Found</h2>
          <p className="text-gray-600 mb-4">The encounter you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/appointments')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/appointments')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{encounter.patientName}</h1>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Stethoscope className="h-4 w-4" />
                    {encounter.practitionerName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(encounter.startTime).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(encounter.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {encounter.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {encounter.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                encounter.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                encounter.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {encounter.status === 'in-progress' ? 'In Progress' : encounter.status}
              </span>

              <button
                onClick={() => handleSave()}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>

              {encounter.status === 'in-progress' && (
                <button
                  onClick={handleCompleteEncounter}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Complete Encounter
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-t border-gray-200">
            {[
              { id: 'vitals', label: 'Vitals', icon: Activity },
              { id: 'assessment', label: 'Assessment', icon: ClipboardList },
              { id: 'plan', label: 'Plan', icon: Pill },
              { id: 'notes', label: 'Notes', icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'vitals' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Vital Signs</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Blood Pressure */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Heart className="h-4 w-4 text-red-500" />
                  Blood Pressure
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Systolic"
                    value={vitals.bloodPressureSystolic}
                    onChange={(e) => setVitals({ ...vitals, bloodPressureSystolic: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-gray-500">/</span>
                  <input
                    type="number"
                    placeholder="Diastolic"
                    value={vitals.bloodPressureDiastolic}
                    onChange={(e) => setVitals({ ...vitals, bloodPressureDiastolic: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <span className="text-xs text-gray-500">mmHg</span>
              </div>

              {/* Heart Rate */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Activity className="h-4 w-4 text-pink-500" />
                  Heart Rate
                </label>
                <input
                  type="number"
                  placeholder="Enter heart rate"
                  value={vitals.heartRate}
                  onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-xs text-gray-500">bpm</span>
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  Temperature
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Enter temperature"
                  value={vitals.temperature}
                  onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-xs text-gray-500">°F</span>
              </div>

              {/* Respiratory Rate */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Wind className="h-4 w-4 text-cyan-500" />
                  Respiratory Rate
                </label>
                <input
                  type="number"
                  placeholder="Enter rate"
                  value={vitals.respiratoryRate}
                  onChange={(e) => setVitals({ ...vitals, respiratoryRate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-xs text-gray-500">breaths/min</span>
              </div>

              {/* Oxygen Saturation */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Droplet className="h-4 w-4 text-blue-500" />
                  O₂ Saturation
                </label>
                <input
                  type="number"
                  placeholder="Enter SpO2"
                  value={vitals.oxygenSaturation}
                  onChange={(e) => setVitals({ ...vitals, oxygenSaturation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-xs text-gray-500">%</span>
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  Weight
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Enter weight"
                  value={vitals.weight}
                  onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-xs text-gray-500">kg</span>
              </div>

              {/* Height */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Height
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Enter height"
                  value={vitals.height}
                  onChange={(e) => setVitals({ ...vitals, height: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-xs text-gray-500">cm</span>
              </div>

              {/* BMI (calculated) */}
              {vitals.weight && vitals.height && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User className="h-4 w-4 text-indigo-500" />
                    BMI
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                    <span className="text-lg font-semibold text-gray-900">
                      {(parseFloat(vitals.weight) / Math.pow(parseFloat(vitals.height) / 100, 2)).toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">kg/m²</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'assessment' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Chief Complaint</h2>
              <textarea
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What is the patient's main concern?"
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Presenting Problem</h2>
              <textarea
                value={presentingProblem}
                onChange={(e) => setPresentingProblem(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the presenting problem in detail (HPI, onset, duration, severity, etc.)"
              />
            </div>
          </div>
        )}

        {activeTab === 'plan' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Treatment Plan</h2>
            <p className="text-gray-600 mb-4">Treatment plan and prescriptions will be added here.</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Pill className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Prescription module coming soon</p>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Clinical Notes</h2>
            <textarea
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Enter clinical notes, observations, and documentation..."
            />
          </div>
        )}
      </div>
    </div>
  );
}
