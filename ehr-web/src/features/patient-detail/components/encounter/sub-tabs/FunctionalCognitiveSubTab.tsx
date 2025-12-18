import React from 'react';

interface FunctionalCognitiveFormData {
  functionalStatus: string;
  mobility: string;
  adlIndependence: string;
  cognitiveStatus: string;
  orientation: string;
  memory: string;
  attention: string;
  language: string;
  executiveFunction: string;
  behavioralObservations: string;
  notes: string;
}

interface FunctionalCognitiveSubTabProps {
  encounterId: string;
  formData: FunctionalCognitiveFormData;
  onFieldChange: (field: keyof FunctionalCognitiveFormData, value: string) => void;
  onSave: () => void;
  isEditing: boolean;
}

/**
 * FunctionalCognitiveSubTab - Form for functional and cognitive status assessment
 */
export function FunctionalCognitiveSubTab({
  encounterId,
  formData,
  onFieldChange,
  onSave,
  isEditing
}: FunctionalCognitiveSubTabProps) {
  return (
    <div className="bg-white border border-gray-200 rounded p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Functional and Cognitive Status</h3>
      <div className="space-y-4">
        {/* Functional Status */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Functional Status
          </label>
          <select
            value={formData.functionalStatus}
            onChange={(e) => onFieldChange('functionalStatus', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          >
            <option value="">Select status...</option>
            <option value="independent">Independent</option>
            <option value="modified-independent">Modified Independent</option>
            <option value="supervised">Supervised</option>
            <option value="minimal-assistance">Minimal Assistance</option>
            <option value="moderate-assistance">Moderate Assistance</option>
            <option value="maximal-assistance">Maximal Assistance</option>
            <option value="total-assistance">Total Assistance</option>
          </select>
        </div>

        {/* Mobility */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Mobility
          </label>
          <textarea
            value={formData.mobility}
            onChange={(e) => onFieldChange('mobility', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows={3}
            placeholder="Ambulatory status, assistive devices, transfer ability..."
          />
        </div>

        {/* ADL Independence */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            ADL Independence
          </label>
          <textarea
            value={formData.adlIndependence}
            onChange={(e) => onFieldChange('adlIndependence', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows={3}
            placeholder="Bathing, dressing, feeding, toileting, grooming..."
          />
        </div>

        {/* Cognitive Status */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Cognitive Status
          </label>
          <select
            value={formData.cognitiveStatus}
            onChange={(e) => onFieldChange('cognitiveStatus', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          >
            <option value="">Select status...</option>
            <option value="normal">Normal</option>
            <option value="mild-impairment">Mild Impairment</option>
            <option value="moderate-impairment">Moderate Impairment</option>
            <option value="severe-impairment">Severe Impairment</option>
          </select>
        </div>

        {/* Orientation */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Orientation
          </label>
          <textarea
            value={formData.orientation}
            onChange={(e) => onFieldChange('orientation', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows={2}
            placeholder="Person, place, time, situation..."
          />
        </div>

        {/* Memory */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Memory
          </label>
          <textarea
            value={formData.memory}
            onChange={(e) => onFieldChange('memory', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows={2}
            placeholder="Immediate, recent, remote recall..."
          />
        </div>

        {/* Attention */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Attention & Concentration
          </label>
          <textarea
            value={formData.attention}
            onChange={(e) => onFieldChange('attention', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows={2}
            placeholder="Ability to focus and maintain attention..."
          />
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Language & Communication
          </label>
          <textarea
            value={formData.language}
            onChange={(e) => onFieldChange('language', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows={2}
            placeholder="Comprehension, expression, fluency..."
          />
        </div>

        {/* Executive Function */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Executive Function
          </label>
          <textarea
            value={formData.executiveFunction}
            onChange={(e) => onFieldChange('executiveFunction', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows={2}
            placeholder="Planning, problem-solving, decision-making, judgment..."
          />
        </div>

        {/* Behavioral Observations */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Behavioral Observations
          </label>
          <textarea
            value={formData.behavioralObservations}
            onChange={(e) => onFieldChange('behavioralObservations', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows={3}
            placeholder="Mood, affect, behavior, cooperation..."
          />
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Additional Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => onFieldChange('notes', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows={3}
            placeholder="Additional observations and notes..."
          />
        </div>

        <button
          onClick={onSave}
          className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90"
        >
          {isEditing ? 'Update Assessment' : 'Save Assessment'}
        </button>
      </div>
    </div>
  );
}
