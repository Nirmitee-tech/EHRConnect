import React from 'react';
import { Mic, Square } from 'lucide-react';

interface SpeechDictationFormData {
  transcription: string;
  category: string;
}

interface SpeechDictationSubTabProps {
  encounterId: string;
  formData: SpeechDictationFormData;
  onFieldChange: (field: keyof SpeechDictationFormData, value: string) => void;
  onSave: () => void;
  isEditing: boolean;
}

/**
 * SpeechDictationSubTab - Speech-to-text dictation interface
 */
export function SpeechDictationSubTab({
  encounterId,
  formData,
  onFieldChange,
  onSave,
  isEditing
}: SpeechDictationSubTabProps) {
  const [isRecording, setIsRecording] = React.useState(false);

  const handleStartRecording = () => {
    // Placeholder for speech recognition implementation
    setIsRecording(true);
    alert('Speech recognition would be implemented here using Web Speech API or similar service.');
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Speech Dictation</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => onFieldChange('category', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          >
            <option value="">Select category...</option>
            <option value="clinical-note">Clinical Note</option>
            <option value="consultation">Consultation</option>
            <option value="procedure-note">Procedure Note</option>
            <option value="discharge-summary">Discharge Summary</option>
            <option value="progress-note">Progress Note</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Recording Controls */}
        <div className="bg-gray-50 border border-gray-200 rounded p-4 text-center">
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
            >
              <Mic className="h-5 w-5" />
              Start Recording
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 animate-pulse"
            >
              <Square className="h-5 w-5" />
              Stop Recording
            </button>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Click the microphone to start voice dictation
          </p>
        </div>

        {/* Transcription Area */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Transcription
          </label>
          <textarea
            value={formData.transcription}
            onChange={(e) => onFieldChange('transcription', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm font-mono"
            rows={12}
            placeholder="Transcribed text will appear here... You can also type or edit directly."
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.transcription.length} characters
          </p>
        </div>

        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
        >
          {isEditing ? 'Update Dictation' : 'Save Dictation'}
        </button>
      </div>
    </div>
  );
}
