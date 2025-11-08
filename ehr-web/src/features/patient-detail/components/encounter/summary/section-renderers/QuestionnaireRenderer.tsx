import React from 'react';

interface QuestionnaireData {
  questionnaireTitle: string;
  questionnaireType: string;
  responses: Array<{
    question: string;
    answer: string;
  }>;
  notes: string;
}

/**
 * QuestionnaireRenderer - Displays saved questionnaire responses
 */
export function QuestionnaireRenderer({ data }: { data: any }) {
  const questData = data as QuestionnaireData;

  return (
    <div className="space-y-3 text-sm">
      {questData.questionnaireTitle && (
        <div>
          <span className="font-semibold text-gray-700">Questionnaire:</span>
          <p className="text-gray-900 mt-1 text-base font-medium">{questData.questionnaireTitle}</p>
        </div>
      )}

      {questData.questionnaireType && (
        <div>
          <span className="font-semibold text-gray-700">Type:</span>
          <p className="text-gray-900 mt-1 capitalize">{questData.questionnaireType}</p>
        </div>
      )}

      {questData.responses && questData.responses.length > 0 && (
        <div>
          <span className="font-semibold text-gray-700">Responses:</span>
          <div className="mt-2 space-y-3">
            {questData.responses.map((response, index) => (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded p-3">
                <p className="font-medium text-gray-900 mb-1">{response.question}</p>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{response.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {questData.notes && (
        <div>
          <span className="font-semibold text-gray-700">Notes:</span>
          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{questData.notes}</p>
        </div>
      )}
    </div>
  );
}
