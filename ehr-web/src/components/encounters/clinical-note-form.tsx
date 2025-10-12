'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Save, Search, X } from 'lucide-react';
import { Encounter } from '@/types/encounter';
import { TemplateSelector } from './template-selector';

interface ClinicalNoteFormProps {
  encounter: Encounter;
  onUpdate: (data: Partial<Encounter>) => void;
  practitioners?: Array<{ id: string; name: string }>;
}

interface VitalSign {
  id: string;
  label: string;
  unit?: string;
  category: string;
  type: 'number' | 'text';
  step?: string;
}

// Comprehensive list of vital signs organized by category
const ALL_VITALS: VitalSign[] = [
  // Basic Vitals
  { id: 'respiratoryRate', label: 'Respiratory Rate', unit: 'bpm', category: 'Basic Vitals', type: 'number' },
  { id: 'heartRate', label: 'Heart Rate', unit: 'bpm', category: 'Basic Vitals', type: 'number' },
  { id: 'temperature', label: 'Body Temperature', unit: '°F', category: 'Basic Vitals', type: 'number', step: '0.1' },
  { id: 'oxygenSaturation', label: 'O2 Saturation (SpO2)', unit: '%', category: 'Basic Vitals', type: 'number' },

  // Blood Pressure
  { id: 'bloodPressureSystolic', label: 'BP Systolic', unit: 'mmHg', category: 'Blood Pressure', type: 'number' },
  { id: 'bloodPressureDiastolic', label: 'BP Diastolic', unit: 'mmHg', category: 'Blood Pressure', type: 'number' },
  { id: 'meanArterialPressure', label: 'Mean Arterial Pressure (MAP)', unit: 'mmHg', category: 'Blood Pressure', type: 'number' },
  { id: 'pulsePresure', label: 'Pulse Pressure', unit: 'mmHg', category: 'Blood Pressure', type: 'number' },

  // Body Measurements
  { id: 'height', label: 'Height', unit: 'cm', category: 'Body Measurements', type: 'number', step: '0.1' },
  { id: 'weight', label: 'Weight', unit: 'kg', category: 'Body Measurements', type: 'number', step: '0.1' },
  { id: 'bmi', label: 'BMI (Body Mass Index)', unit: 'kg/m²', category: 'Body Measurements', type: 'number', step: '0.1' },
  { id: 'waistCircumference', label: 'Waist Circumference', unit: 'cm', category: 'Body Measurements', type: 'number', step: '0.1' },
  { id: 'hipCircumference', label: 'Hip Circumference', unit: 'cm', category: 'Body Measurements', type: 'number', step: '0.1' },
  { id: 'headCircumference', label: 'Head Circumference', unit: 'cm', category: 'Body Measurements', type: 'number', step: '0.1' },

  // Blood Sugar
  { id: 'bloodGlucoseFasting', label: 'Blood Glucose Fasting', unit: 'mg/dL', category: 'Blood Sugar', type: 'number' },
  { id: 'bloodGlucosePostprandial', label: 'Blood Glucose Postprandial', unit: 'mg/dL', category: 'Blood Sugar', type: 'number' },
  { id: 'bloodGlucoseRandom', label: 'Blood Glucose Random', unit: 'mg/dL', category: 'Blood Sugar', type: 'number' },
  { id: 'hba1c', label: 'HbA1c', unit: '%', category: 'Blood Sugar', type: 'number', step: '0.1' },

  // Cardiac
  { id: 'pulseRate', label: 'Pulse Rate', unit: 'bpm', category: 'Cardiac', type: 'number' },
  { id: 'pulseRhythm', label: 'Pulse Rhythm', category: 'Cardiac', type: 'text' },
  { id: 'capillaryRefillTime', label: 'Capillary Refill Time', unit: 'sec', category: 'Cardiac', type: 'number', step: '0.1' },

  // Respiratory
  { id: 'respiratoryDepth', label: 'Respiratory Depth', category: 'Respiratory', type: 'text' },
  { id: 'peakFlow', label: 'Peak Flow (PEFR)', unit: 'L/min', category: 'Respiratory', type: 'number' },

  // Pain Assessment
  { id: 'painScore', label: 'Pain Score (0-10)', category: 'Pain', type: 'number' },
  { id: 'painLocation', label: 'Pain Location', category: 'Pain', type: 'text' },

  // Neurological
  { id: 'glasgowComaScale', label: 'Glasgow Coma Scale (GCS)', category: 'Neurological', type: 'number' },
  { id: 'pupilReaction', label: 'Pupil Reaction', category: 'Neurological', type: 'text' },
];

export function ClinicalNoteForm({
  encounter,
  onUpdate,
  practitioners = []
}: ClinicalNoteFormProps) {
  const [vitalsExpanded, setVitalsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Basic Vitals']));
  const [isSaving, setIsSaving] = useState(false);

  // Vitals data state
  const [vitalsData, setVitalsData] = useState<Map<string, string>>(new Map());

  // Clinical data state
  const [chiefComplaint, setChiefComplaint] = useState(encounter.chiefComplaint || '');
  const [findings, setFindings] = useState(encounter.findingsText || '');
  const [investigation, setInvestigation] = useState(encounter.investigationsText || '');
  const [diagnosis, setDiagnosis] = useState(encounter.diagnosesText || '');
  const [notes, setNotes] = useState(encounter.clinicalNotes || '');

  // Initialize vitals from encounter
  useEffect(() => {
    if (encounter.vitals) {
      const initialVitals = new Map<string, string>();
      if (encounter.vitals.respiratoryRate) initialVitals.set('respiratoryRate', encounter.vitals.respiratoryRate.toString());
      if (encounter.vitals.heartRate) initialVitals.set('heartRate', encounter.vitals.heartRate.toString());
      if (encounter.vitals.temperature) initialVitals.set('temperature', encounter.vitals.temperature.toString());
      if (encounter.vitals.oxygenSaturation) initialVitals.set('oxygenSaturation', encounter.vitals.oxygenSaturation.toString());
      if (encounter.vitals.bloodPressureSystolic) initialVitals.set('bloodPressureSystolic', encounter.vitals.bloodPressureSystolic.toString());
      if (encounter.vitals.bloodPressureDiastolic) initialVitals.set('bloodPressureDiastolic', encounter.vitals.bloodPressureDiastolic.toString());
      if (encounter.vitals.height) initialVitals.set('height', encounter.vitals.height.toString());
      if (encounter.vitals.weight) initialVitals.set('weight', encounter.vitals.weight.toString());
      if (encounter.vitals.bmi) initialVitals.set('bmi', encounter.vitals.bmi.toString());
      setVitalsData(initialVitals);
    }
  }, [encounter.vitals]);

  const handleVitalChange = (vitalId: string, value: string) => {
    setVitalsData(prev => {
      const newMap = new Map(prev);
      if (value === '') {
        newMap.delete(vitalId);
      } else {
        newMap.set(vitalId, value);
      }
      return newMap;
    });
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleSaveVitals = async () => {
    setIsSaving(true);
    try {
      console.log('💾 Saving vitals...', vitalsData);

      const vitalsUpdate: any = {};

      // Map vitals data to encounter vitals structure
      vitalsData.forEach((value, key) => {
        if (value) {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            vitalsUpdate[key] = numValue;
          } else {
            // For text values, store as-is
            vitalsUpdate[key] = value;
          }
        }
      });

      console.log('📊 Vitals to save:', vitalsUpdate);

      await onUpdate({ vitals: vitalsUpdate });

      console.log('✅ Vitals saved successfully!');

      // Show success message
      alert('Vitals saved successfully!');
    } catch (error) {
      console.error('❌ Error saving vitals:', error);
      alert('Failed to save vitals. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter vitals based on search query
  const filteredVitals = searchQuery
    ? ALL_VITALS.filter(vital =>
        vital.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vital.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : ALL_VITALS;

  // Group vitals by category
  const vitalsByCategory = filteredVitals.reduce((acc, vital) => {
    if (!acc[vital.category]) {
      acc[vital.category] = [];
    }
    acc[vital.category].push(vital);
    return acc;
  }, {} as Record<string, VitalSign[]>);

  // Count filled vitals per category
  const getFilledCount = (categoryVitals: VitalSign[]) => {
    return categoryVitals.filter(v => vitalsData.get(v.id)).length;
  };

  return (
    <div className="space-y-3">
      {/* Doctor Dropdown */}
      <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <div className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Doctor</label>
        </div>
        <div className="p-3 bg-white">
          <select
            value={encounter.practitionerId}
            onChange={(e) => {
              const selectedPractitioner = practitioners.find(p => p.id === e.target.value);
              if (selectedPractitioner) {
                onUpdate({
                  practitionerId: selectedPractitioner.id,
                  practitionerName: selectedPractitioner.name
                });
              }
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value={encounter.practitionerId}>{encounter.practitionerName}</option>
            {practitioners.filter(p => p.id !== encounter.practitionerId).map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Vitals Section */}
      <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setVitalsExpanded(!vitalsExpanded)}
          className="w-full px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200 flex items-center justify-between hover:from-blue-100 hover:to-blue-200 transition-all"
        >
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-blue-900 uppercase tracking-wide cursor-pointer">Vitals</label>
            {vitalsData.size > 0 && (
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-medium">
                {vitalsData.size} recorded
              </span>
            )}
          </div>
          {vitalsExpanded ? (
            <ChevronUp className="h-4 w-4 text-blue-700" />
          ) : (
            <ChevronDown className="h-4 w-4 text-blue-700" />
          )}
        </button>

        {vitalsExpanded && (
          <div className="p-4 bg-white">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search vitals by name or category..."
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Vitals organized by category */}
            <div className="space-y-2 mb-4 max-h-[500px] overflow-y-auto pr-2">
              {Object.entries(vitalsByCategory).map(([category, vitals]) => {
                const filledCount = getFilledCount(vitals);
                return (
                  <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Category Header */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className="w-full px-3 py-2.5 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
                    >
                      <span className="text-xs font-bold text-gray-800">{category}</span>
                      <div className="flex items-center gap-3">
                        {filledCount > 0 && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-semibold">
                            {filledCount} / {vitals.length}
                          </span>
                        )}
                        {expandedCategories.has(category) ? (
                          <ChevronUp className="h-3.5 w-3.5 text-gray-600" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-gray-600" />
                        )}
                      </div>
                    </button>

                    {/* Category Vitals */}
                    {(expandedCategories.has(category) || searchQuery) && (
                      <div className="p-3 bg-white grid grid-cols-2 gap-3">
                        {vitals.map((vital) => (
                          <div key={vital.id} className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-gray-700">{vital.label}</label>
                            <div className="flex items-center gap-2">
                              <input
                                type={vital.type}
                                step={vital.step}
                                value={vitalsData.get(vital.id) || ''}
                                onChange={(e) => handleVitalChange(vital.id, e.target.value)}
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm"
                                placeholder={vital.type === 'number' ? '0' : 'Enter value'}
                              />
                              {vital.unit && (
                                <span className="text-xs font-medium text-gray-500 min-w-[50px]">{vital.unit}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Save Button for Vitals */}
            <div className="flex justify-end pt-2 border-t border-gray-200">
              <button
                type="button"
                onClick={handleSaveVitals}
                disabled={isSaving || vitalsData.size === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all text-sm font-semibold shadow-md hover:shadow-lg"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Vitals {vitalsData.size > 0 && `(${vitalsData.size})`}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Chief Complaint */}
      <div className="border border-gray-300 rounded-lg overflow-visible shadow-sm">
        <div className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Chief Complaint</label>
          <TemplateSelector
            category="chief-complaint"
            onSelect={(content) => {
              setChiefComplaint(content);
              onUpdate({ chiefComplaint: content });
            }}
            currentValue={chiefComplaint}
          />
        </div>
        <div className="p-3 bg-white">
          <textarea
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
            onBlur={() => onUpdate({ chiefComplaint })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm"
            rows={2}
            placeholder="Enter chief complaint or use a template..."
          />
        </div>
      </div>

      {/* Findings */}
      <div className="border border-gray-300 rounded-lg overflow-visible shadow-sm">
        <div className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Findings</label>
          <TemplateSelector
            category="findings"
            onSelect={setFindings}
            currentValue={findings}
          />
        </div>
        <div className="p-3 bg-white space-y-2">
          <textarea
            value={findings}
            onChange={(e) => setFindings(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm"
            rows={3}
            placeholder="Enter findings or use a template..."
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                onUpdate({ findingsText: findings });
                alert('Findings saved!');
              }}
              disabled={!findings.trim()}
              className="px-4 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save className="inline h-3 w-3 mr-1" />
              Save Findings
            </button>
          </div>
        </div>
      </div>

      {/* Investigation */}
      <div className="border border-gray-300 rounded-lg overflow-visible shadow-sm">
        <div className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Investigation</label>
          <TemplateSelector
            category="investigation"
            onSelect={setInvestigation}
            currentValue={investigation}
          />
        </div>
        <div className="p-3 bg-white space-y-2">
          <textarea
            value={investigation}
            onChange={(e) => setInvestigation(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm"
            rows={3}
            placeholder="Enter investigation or use a template..."
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                onUpdate({ investigationsText: investigation });
                alert('Investigation saved!');
              }}
              disabled={!investigation.trim()}
              className="px-4 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save className="inline h-3 w-3 mr-1" />
              Save Investigation
            </button>
          </div>
        </div>
      </div>

      {/* Diagnosis */}
      <div className="border border-gray-300 rounded-lg overflow-visible shadow-sm">
        <div className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Diagnosis</label>
          <TemplateSelector
            category="diagnosis"
            onSelect={setDiagnosis}
            currentValue={diagnosis}
          />
        </div>
        <div className="p-3 bg-white space-y-2">
          <textarea
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm"
            rows={3}
            placeholder="Enter diagnosis or use a template..."
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                onUpdate({ diagnosesText: diagnosis });
                alert('Diagnosis saved!');
              }}
              disabled={!diagnosis.trim()}
              className="px-4 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Save className="inline h-3 w-3 mr-1" />
              Save Diagnosis
            </button>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="border border-gray-300 rounded-lg overflow-visible shadow-sm">
        <div className="px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 flex items-center justify-between">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Clinical Notes</label>
          <TemplateSelector
            category="clinical-notes"
            onSelect={(content) => {
              setNotes(content);
              onUpdate({ clinicalNotes: content });
            }}
            currentValue={notes}
          />
        </div>
        <div className="p-3 bg-white">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => onUpdate({ clinicalNotes: notes })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm"
            rows={3}
            placeholder="Enter additional clinical notes or use a template..."
          />
        </div>
      </div>
    </div>
  );
}
