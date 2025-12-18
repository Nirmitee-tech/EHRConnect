'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  HabitsData,
  HabitStatus,
  HabitItem,
  HabitItemStatus,
  HabitFrequency,
  AllergiesData,
  AllergyStatus,
  AllergyItem,
  AllergyItemStatus,
  AllergySeverity,
  DrugAllergyItem,
  DrugAllergyType
} from '@/types/encounter';

interface MedicalInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  patientHistory?: string;
  patientHabitsStructured?: HabitsData;
  patientAllergiesStructured?: AllergiesData;
  onUpdate: (data: {
    patientHistory?: string;
    patientHabitsStructured?: HabitsData;
    patientAllergiesStructured?: AllergiesData;
  }) => void;
}

// Predefined medical conditions
const MEDICAL_CONDITIONS = [
  'Diabetes',
  'Blood Pressure',
  'Thyroid',
  'Epilepsy',
  'Heart Disease',
  'Asthma',
  'Dental History',
  'Acidity',
  'Cholesterol',
  'Kidney Disease',
  'Pregnant/Breast Feeding'
];

// Predefined habits list
const HABIT_NAMES = [
  'Aerated Drinks',
  'Alcohol',
  'Coffee',
  'Drugs',
  'Shisha/Hookah',
  'Smoking',
  'Tea',
  'Tobacco',
  'Other'
];

// Predefined allergies list
const ALLERGY_NAMES = [
  'Penicillin',
  'Sulfa Drugs',
  'Aspirin',
  'Ibuprofen',
  'Latex',
  'Local Anesthesia',
  'Food Allergies',
  'Pollen',
  'Dust',
  'Pet Dander',
  'Shellfish',
  'Nuts',
  'Other'
];

export function MedicalInfoDrawer({
  isOpen,
  onClose,
  patientHistory = '',
  patientHabitsStructured,
  patientAllergiesStructured,
  onUpdate
}: MedicalInfoDrawerProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'habits' | 'allergies'>('history');

  // Medical History state
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');

  // Habits state
  const [habitStatus, setHabitStatus] = useState<HabitStatus>('unknown');
  const [habits, setHabits] = useState<HabitItem[]>([]);

  // Allergies state
  const [allergyStatus, setAllergyStatus] = useState<AllergyStatus>('unknown');
  const [allergies, setAllergies] = useState<AllergyItem[]>([]);
  const [drugAllergies, setDrugAllergies] = useState<DrugAllergyItem[]>([]);

  // Initialize state when drawer opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('history');

      // Medical History
      setSelectedConditions(patientHistory ? patientHistory.split(', ').filter(Boolean) : []);

      // Habits
      if (patientHabitsStructured) {
        setHabitStatus(patientHabitsStructured.status);
        setHabits(patientHabitsStructured.habits);
      } else {
        setHabitStatus('unknown');
        setHabits(HABIT_NAMES.map(name => ({
          name,
          status: 'notSelected' as HabitItemStatus,
          frequency: 'unknown' as HabitFrequency
        })));
      }

      // Allergies
      if (patientAllergiesStructured) {
        setAllergyStatus(patientAllergiesStructured.status);
        setAllergies(patientAllergiesStructured.allergies);
        setDrugAllergies(patientAllergiesStructured.drugAllergies || []);
      } else {
        setAllergyStatus('unknown');
        setAllergies(ALLERGY_NAMES.map(name => ({
          name,
          status: 'notSelected' as AllergyItemStatus,
          severity: 'unknown' as AllergySeverity
        })));
        setDrugAllergies([]);
      }

      setCustomInput('');
    }
  }, [isOpen, patientHistory, patientHabitsStructured, patientAllergiesStructured]);

  const handleSave = () => {
    console.log('💾 Saving medical info:', {
      patientHistory: selectedConditions.join(', '),
      selectedConditions,
      habitStatus,
      allergyStatus
    });

    onUpdate({
      patientHistory: selectedConditions.join(', '),
      patientHabitsStructured: {
        status: habitStatus,
        habits: habits
      },
      patientAllergiesStructured: {
        status: allergyStatus,
        allergies: allergies,
        drugAllergies: drugAllergies
      }
    });
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  // Medical History handlers
  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const handleAddCustomCondition = () => {
    if (!customInput.trim()) return;
    setSelectedConditions(prev => [...prev, customInput.trim()]);
    setCustomInput('');
  };

  // Habits handlers
  const updateHabitStatus = (index: number, status: HabitItemStatus) => {
    const updated = [...habits];
    updated[index] = { ...updated[index], status };
    setHabits(updated);
  };

  const updateHabitFrequency = (index: number, frequency: HabitFrequency) => {
    const updated = [...habits];
    updated[index] = { ...updated[index], frequency };
    setHabits(updated);
  };

  const addCustomHabit = () => {
    if (!customInput.trim()) return;
    setHabits([...habits, {
      name: customInput.trim(),
      status: 'notSelected',
      frequency: 'unknown'
    }]);
    setCustomInput('');
  };

  // Allergies handlers
  const updateAllergyStatus = (index: number, status: AllergyItemStatus) => {
    const updated = [...allergies];
    updated[index] = { ...updated[index], status };
    setAllergies(updated);
  };

  const updateAllergySeverity = (index: number, severity: AllergySeverity) => {
    const updated = [...allergies];
    updated[index] = { ...updated[index], severity };
    setAllergies(updated);
  };

  const addCustomAllergy = () => {
    if (!customInput.trim()) return;
    setAllergies([...allergies, {
      name: customInput.trim(),
      status: 'notSelected',
      severity: 'unknown'
    }]);
    setCustomInput('');
  };

  // Drug Allergy handlers
  const addDrugAllergy = () => {
    const newDrugAllergy: DrugAllergyItem = {
      id: `drug-${Date.now()}`,
      type: 'medication',
      drugName: '',
      reaction: '',
      severity: 'unknown',
      status: 'active'
    };
    setDrugAllergies([...drugAllergies, newDrugAllergy]);
  };

  const updateDrugAllergy = (id: string, field: keyof DrugAllergyItem, value: any) => {
    setDrugAllergies(drugAllergies.map(drug =>
      drug.id === id ? { ...drug, [field]: value } : drug
    ));
  };

  const removeDrugAllergy = (id: string) => {
    setDrugAllergies(drugAllergies.filter(drug => drug.id !== id));
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
      <div className="fixed right-0 top-0 h-full w-full max-w-3xl bg-white shadow-xl z-[9999] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Medical History, Habits, Allergies</h2>
          <button
            onClick={handleCancel}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'history'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            MEDICAL HISTORY
          </button>
          <button
            onClick={() => setActiveTab('habits')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'habits'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            HABITS
          </button>
          <button
            onClick={() => setActiveTab('allergies')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'allergies'
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            ALLERGIES
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* MEDICAL HISTORY TAB */}
          {activeTab === 'history' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Medical Condition
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {/* Predefined conditions */}
                {MEDICAL_CONDITIONS.map((condition) => (
                  <button
                    key={condition}
                    onClick={() => toggleCondition(condition)}
                    className={`px-3 py-1.5 text-xs rounded border transition-colors ${selectedConditions.includes(condition)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary/50 hover:bg-primary/5'
                      }`}
                  >
                    {condition}
                  </button>
                ))}

                {/* User-added custom conditions */}
                {selectedConditions
                  .filter(condition => !MEDICAL_CONDITIONS.includes(condition))
                  .map((condition) => (
                    <button
                      key={condition}
                      onClick={() => toggleCondition(condition)}
                      className="px-3 py-1.5 text-xs rounded border transition-colors bg-primary text-primary-foreground border-primary relative pr-7"
                    >
                      {condition}
                      <span className="ml-1 opacity-70">(custom)</span>
                    </button>
                  ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCustomCondition()}
                  placeholder="Add custom condition..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                />
                <button
                  onClick={handleAddCustomCondition}
                  className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* HABITS TAB */}
          {activeTab === 'habits' && (
            <div className="space-y-4">
              {/* Radio buttons for habit status */}
              <div className="flex gap-4 mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="habitStatus"
                    checked={habitStatus === 'unknown'}
                    onChange={() => setHabitStatus('unknown')}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm text-gray-700">Unknown</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="habitStatus"
                    checked={habitStatus === 'noHabits'}
                    onChange={() => setHabitStatus('noHabits')}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm text-gray-700">No Habits</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="habitStatus"
                    checked={habitStatus === 'haveHabits'}
                    onChange={() => setHabitStatus('haveHabits')}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm text-gray-700">Have Habits</span>
                </label>
              </div>

              {/* Habits list - only show if "Have Habits" is selected */}
              {habitStatus === 'haveHabits' && (
                <div className="space-y-3">
                  {habits.map((habit, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4 space-y-3">
                      <div className="font-medium text-sm text-gray-800">{habit.name}</div>

                      {/* Status dropdown */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="text-xs text-gray-600 sm:w-20">Status:</label>
                        <select
                          value={habit.status}
                          onChange={(e) => updateHabitStatus(index, e.target.value as HabitItemStatus)}
                          className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                        >
                          <option value="notSelected">Select Status</option>
                          <option value="active">Active</option>
                          <option value="toBeConfirmed">To Be Confirmed</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>

                      {/* Frequency buttons */}
                      <div className="space-y-2">
                        <label className="text-xs text-gray-600 block">Frequency:</label>
                        <div className="flex flex-wrap gap-1.5">
                          {(['never', 'rare', 'occasional', 'low', 'medium', 'high', 'other', 'unknown'] as HabitFrequency[]).map((freq) => (
                            <button
                              key={freq}
                              onClick={() => updateHabitFrequency(index, freq)}
                              className={`px-2.5 py-1.5 text-xs rounded border transition-colors ${habit.frequency === freq
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-primary/50 hover:bg-primary/5'
                                }`}
                            >
                              {freq.charAt(0).toUpperCase() + freq.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add custom habit */}
                  <div className="flex gap-2 mt-4">
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCustomHabit()}
                      placeholder="Add custom habit..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                    />
                    <button
                      onClick={addCustomHabit}
                      className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ALLERGIES TAB */}
          {activeTab === 'allergies' && (
            <div className="space-y-4">
              {/* Radio buttons for allergy status */}
              <div className="flex gap-4 mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="allergyStatus"
                    checked={allergyStatus === 'unknown'}
                    onChange={() => setAllergyStatus('unknown')}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm text-gray-700">Unknown</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="allergyStatus"
                    checked={allergyStatus === 'noAllergies'}
                    onChange={() => setAllergyStatus('noAllergies')}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm text-gray-700">No Allergies</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="allergyStatus"
                    checked={allergyStatus === 'haveAllergies'}
                    onChange={() => setAllergyStatus('haveAllergies')}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm text-gray-700">Have Allergies</span>
                </label>
              </div>

              {/* Allergies list - only show if "Have Allergies" is selected */}
              {allergyStatus === 'haveAllergies' && (
                <div className="space-y-3">
                  {allergies.map((allergy, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4 space-y-3">
                      <div className="font-medium text-sm text-gray-800">{allergy.name}</div>

                      {/* Status dropdown */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="text-xs text-gray-600 sm:w-20">Status:</label>
                        <select
                          value={allergy.status}
                          onChange={(e) => updateAllergyStatus(index, e.target.value as AllergyItemStatus)}
                          className="flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                        >
                          <option value="notSelected">Select Status</option>
                          <option value="active">Active</option>
                          <option value="toBeConfirmed">To Be Confirmed</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>

                      {/* Severity buttons */}
                      <div className="space-y-2">
                        <label className="text-xs text-gray-600 block">Severity:</label>
                        <div className="flex flex-wrap gap-1.5">
                          {(['mild', 'moderate', 'severe', 'unknown'] as AllergySeverity[]).map((sev) => (
                            <button
                              key={sev}
                              onClick={() => updateAllergySeverity(index, sev)}
                              className={`px-2.5 py-1.5 text-xs rounded border transition-colors ${allergy.severity === sev
                                ? 'bg-red-600 text-white border-red-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-red-300 hover:bg-red-50'
                                }`}
                            >
                              {sev.charAt(0).toUpperCase() + sev.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add custom allergy */}
                  <div className="flex gap-2 mt-4">
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCustomAllergy()}
                      placeholder="Add custom allergy..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                    />
                    <button
                      onClick={addCustomAllergy}
                      className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      Add
                    </button>
                  </div>

                  {/* Drug Allergies Subsection */}
                  <div className="mt-8 pt-6 border-t border-gray-300">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-gray-900">Drug Allergies</h4>
                      <button
                        onClick={addDrugAllergy}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs hover:opacity-90 transition-colors"
                      >
                        + Add Drug Allergy
                      </button>
                    </div>

                    {drugAllergies.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No drug allergies recorded</p>
                    )}

                    <div className="space-y-4">
                      {drugAllergies.map((drug) => (
                        <div key={drug.id} className="border border-red-200 rounded-lg p-4 bg-red-50 space-y-3">
                          {/* Type and Status Row */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-gray-600 block mb-1">Type:</label>
                              <select
                                value={drug.type}
                                onChange={(e) => updateDrugAllergy(drug.id, 'type', e.target.value as DrugAllergyType)}
                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                              >
                                <option value="medication">Medication</option>
                                <option value="anesthesia">Anesthesia</option>
                                <option value="antibiotic">Antibiotic</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 block mb-1">Status:</label>
                              <select
                                value={drug.status}
                                onChange={(e) => updateDrugAllergy(drug.id, 'status', e.target.value as AllergyItemStatus)}
                                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                              >
                                <option value="active">Active</option>
                                <option value="toBeConfirmed">To Be Confirmed</option>
                                <option value="inactive">Inactive</option>
                              </select>
                            </div>
                          </div>

                          {/* Drug Name */}
                          <div>
                            <label className="text-xs text-gray-600 block mb-1">Drug Name: <span className="text-red-600">*</span></label>
                            <input
                              type="text"
                              value={drug.drugName}
                              onChange={(e) => updateDrugAllergy(drug.id, 'drugName', e.target.value)}
                              placeholder="Enter drug name..."
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                            />
                          </div>

                          {/* Reaction */}
                          <div>
                            <label className="text-xs text-gray-600 block mb-1">Reaction: <span className="text-red-600">*</span></label>
                            <input
                              type="text"
                              value={drug.reaction}
                              onChange={(e) => updateDrugAllergy(drug.id, 'reaction', e.target.value)}
                              placeholder="e.g., rash, swelling, difficulty breathing..."
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                            />
                          </div>

                          {/* Severity */}
                          <div>
                            <label className="text-xs text-gray-600 block mb-1">Severity:</label>
                            <div className="flex flex-wrap gap-1.5">
                              {(['mild', 'moderate', 'severe', 'unknown'] as AllergySeverity[]).map((sev) => (
                                <button
                                  key={sev}
                                  onClick={() => updateDrugAllergy(drug.id, 'severity', sev)}
                                  className={`px-2.5 py-1.5 text-xs rounded border transition-colors ${drug.severity === sev
                                    ? 'bg-red-600 text-white border-red-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-red-300 hover:bg-red-50'
                                    }`}
                                >
                                  {sev.charAt(0).toUpperCase() + sev.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Remove Button */}
                          <div className="flex justify-end">
                            <button
                              onClick={() => removeDrugAllergy(drug.id)}
                              className="px-3 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-100 rounded transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <a href="#" className="text-sm text-primary hover:text-primary/80">Need Help?</a>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 transition-colors"
            >
              SAVE
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
