import React from 'react';

interface QuestionnaireFormData {
  questionnaireTitle: string;
  questionnaireType: string;
  responses: Array<{
    question: string;
    answer: string;
  }>;
  notes: string;
}

interface QuestionnaireSubTabProps {
  encounterId: string;
  formData: QuestionnaireFormData;
  onFieldChange: (field: keyof QuestionnaireFormData, value: any) => void;
  onSave: () => void;
  isEditing: boolean;
}

/**
 * QuestionnaireSubTab - Form for questionnaires and responses
 */
export function QuestionnaireSubTab({
  encounterId,
  formData,
  onFieldChange,
  onSave,
  isEditing
}: QuestionnaireSubTabProps) {
  const addResponse = () => {
    const responses = [...(formData.responses || []), { question: '', answer: '' }];
    onFieldChange('responses', responses);
  };

  const updateResponse = (index: number, field: 'question' | 'answer', value: string) => {
    const responses = [...(formData.responses || [])];
    responses[index] = { ...responses[index], [field]: value };
    onFieldChange('responses', responses);
  };

  const removeResponse = (index: number) => {
    const responses = (formData.responses || []).filter((_, i) => i !== index);
    onFieldChange('responses', responses);
  };

  return (
    <div className="bg-white border border-gray-300 rounded p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Questionnaire</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Questionnaire Title
          </label>
          <input
            type="text"
            value={formData.questionnaireTitle}
            onChange={(e) => onFieldChange('questionnaireTitle', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
            placeholder="e.g., PHQ-9, GAD-7, Patient Satisfaction"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Type
          </label>
          <select
            value={formData.questionnaireType}
            onChange={(e) => onFieldChange('questionnaireType', e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-sm"
          >
            <option value="">Select type...</option>
            <option value="screening">Screening</option>
            <option value="assessment">Assessment</option>
            <option value="satisfaction">Satisfaction Survey</option>
            <option value="intake">Intake Form</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-900">
              Questions & Responses
            </label>
            <button
              type="button"
              onClick={addResponse}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Add Question
            </button>
          </div>

          <div className="space-y-3">
            {(formData.responses || []).map((response, index) => (
              <div key={index} className="border border-gray-200 rounded p-3 bg-gray-50">
                <div className="space-y-2">
                  <input
                    type="text"
                    value={response.question}
                    onChange={(e) => updateResponse(index, 'question', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    placeholder="Question"
                  />
                  <textarea
                    value={response.answer}
                    onChange={(e) => updateResponse(index, 'answer', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    rows={2}
                    placeholder="Answer/Response"
                  />
                  <button
                    type="button"
                    onClick={() => removeResponse(index)}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Additional Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => onFieldChange('notes', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded text-sm"
            rows={3}
            placeholder="Additional notes..."
          />
        </div>

        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
        >
          {isEditing ? 'Update Questionnaire' : 'Save Questionnaire'}
        </button>
      </div>
    </div>
  );
}
