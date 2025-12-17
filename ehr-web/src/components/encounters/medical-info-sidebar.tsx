'use client';

import React, { useState } from 'react';
import { Edit, Save, X, AlertCircle, Heart, Activity } from 'lucide-react';

interface MedicalInfoSidebarProps {
  patientHistory?: string;
  patientAllergies?: string;
  patientHabits?: string;
  onUpdate: (data: {
    patientHistory?: string;
    patientAllergies?: string;
    patientHabits?: string;
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

// Predefined allergies
const COMMON_ALLERGIES = [
  'Penicillin',
  'Sulfa Drugs',
  'Aspirin',
  'Ibuprofen',
  'Latex',
  'Local Anesthesia',
  'Food Allergies',
  'Pollen',
  'Dust',
  'None'
];

// Predefined habits
const COMMON_HABITS = [
  'Smoking',
  'Alcohol',
  'Tobacco Chewing',
  'Pan/Betel Nut',
  'Nail Biting',
  'Teeth Grinding',
  'Mouth Breathing',
  'None'
];

export function MedicalInfoSidebar({
  patientHistory = '',
  patientAllergies = '',
  patientHabits = '',
  onUpdate
}: MedicalInfoSidebarProps) {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'habits' | 'allergies'>('history');
  const [editedData, setEditedData] = useState({
    patientHistory,
    patientAllergies,
    patientHabits
  });

  // Track selected items for each category
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    patientHistory ? patientHistory.split(', ').filter(Boolean) : []
  );
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(
    patientAllergies ? patientAllergies.split(', ').filter(Boolean) : []
  );
  const [selectedHabits, setSelectedHabits] = useState<string[]>(
    patientHabits ? patientHabits.split(', ').filter(Boolean) : []
  );

  const [customInput, setCustomInput] = useState('');

  const handleOpenModal = () => {
    setShowModal(true);
    setActiveTab('history');
    setSelectedConditions(patientHistory ? patientHistory.split(', ').filter(Boolean) : []);
    setSelectedAllergies(patientAllergies ? patientAllergies.split(', ').filter(Boolean) : []);
    setSelectedHabits(patientHabits ? patientHabits.split(', ').filter(Boolean) : []);
  };

  const handleSave = () => {
    onUpdate({
      patientHistory: selectedConditions.join(', '),
      patientAllergies: selectedAllergies.join(', '),
      patientHabits: selectedHabits.join(', ')
    });
    setShowModal(false);
    setCustomInput('');
  };

  const handleCancel = () => {
    setShowModal(false);
    setCustomInput('');
    setSelectedConditions(patientHistory ? patientHistory.split(', ').filter(Boolean) : []);
    setSelectedAllergies(patientAllergies ? patientAllergies.split(', ').filter(Boolean) : []);
    setSelectedHabits(patientHabits ? patientHabits.split(', ').filter(Boolean) : []);
  };

  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const toggleAllergy = (allergy: string) => {
    if (allergy === 'None') {
      setSelectedAllergies(['None']);
    } else {
      setSelectedAllergies(prev =>
        prev.includes(allergy)
          ? prev.filter(a => a !== allergy)
          : prev.filter(a => a !== 'None').concat(allergy)
      );
    }
  };

  const toggleHabit = (habit: string) => {
    if (habit === 'None') {
      setSelectedHabits(['None']);
    } else {
      setSelectedHabits(prev =>
        prev.includes(habit)
          ? prev.filter(h => h !== habit)
          : prev.filter(h => h !== 'None').concat(habit)
      );
    }
  };

  const handleAddCustom = () => {
    if (!customInput.trim()) return;

    if (activeTab === 'history') {
      setSelectedConditions(prev => [...prev, customInput.trim()]);
    } else if (activeTab === 'allergies') {
      setSelectedAllergies(prev => prev.filter(a => a !== 'None').concat(customInput.trim()));
    } else if (activeTab === 'habits') {
      setSelectedHabits(prev => prev.filter(h => h !== 'None').concat(customInput.trim()));
    }

    setCustomInput('');
  };

  return (
    <>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Medical Information</h3>
          <button
            onClick={handleOpenModal}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            <Edit className="h-3 w-3" />
            Edit
          </button>
        </div>

        {/* Medical History */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-medium text-primary">History</h4>
          </div>
          <p className="text-xs text-primary/80 whitespace-pre-wrap">
            {patientHistory || 'No medical history recorded'}
          </p>
        </div>

        {/* Allergies */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <h4 className="text-xs font-medium text-red-900">Allergies</h4>
          </div>
          <p className="text-xs text-red-800 whitespace-pre-wrap">
            {patientAllergies || 'No known allergies'}
          </p>
        </div>

        {/* Habits */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-purple-600" />
            <h4 className="text-xs font-medium text-purple-900">Habits</h4>
          </div>
          <p className="text-xs text-purple-800 whitespace-pre-wrap">
            {patientHabits || 'No habits recorded'}
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-medium text-yellow-900 mb-1">Important</h4>
              <p className="text-xs text-yellow-800">
                Always verify medical information with the patient before proceeding with treatment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Medical History, Habits, Allergies</h2>
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
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

            {/* Modal Content */}
            <div className="px-6 py-4 max-h-96 overflow-y-auto">
              {activeTab === 'history' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Medical Condition
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
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
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
                      placeholder="Add custom condition..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                    />
                    <button
                      onClick={handleAddCustom}
                      className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'allergies' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Allergies
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {COMMON_ALLERGIES.map((allergy) => (
                      <button
                        key={allergy}
                        onClick={() => toggleAllergy(allergy)}
                        className={`px-3 py-1.5 text-xs rounded border transition-colors ${selectedAllergies.includes(allergy)
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-red-300 hover:bg-red-50'
                          }`}
                      >
                        {allergy}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
                      placeholder="Add custom allergy..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                    />
                    <button
                      onClick={handleAddCustom}
                      className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'habits' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Habits
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {COMMON_HABITS.map((habit) => (
                      <button
                        key={habit}
                        onClick={() => toggleHabit(habit)}
                        className={`px-3 py-1.5 text-xs rounded border transition-colors ${selectedHabits.includes(habit)
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                          }`}
                      >
                        {habit}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCustom()}
                      placeholder="Add custom habit..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary/20 focus:border-transparent"
                    />
                    <button
                      onClick={handleAddCustom}
                      className="px-4 py-2 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
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
        </div>
      )}
    </>
  );
}
