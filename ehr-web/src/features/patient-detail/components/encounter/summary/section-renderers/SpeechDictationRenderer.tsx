import React from 'react';

interface SpeechDictationData {
  transcription: string;
  category: string;
}

/**
 * SpeechDictationRenderer - Displays saved speech dictation
 */
export function SpeechDictationRenderer({ data }: { data: any }) {
  const dictData = data as SpeechDictationData;

  return (
    <div className="space-y-3 text-sm">
      {dictData.category && (
        <div>
          <span className="font-semibold text-gray-700">Category:</span>
          <p className="text-gray-900 mt-1 capitalize">{dictData.category.replace(/-/g, ' ')}</p>
        </div>
      )}

      {dictData.transcription && (
        <div>
          <span className="font-semibold text-gray-700">Transcription:</span>
          <p className="text-gray-900 mt-1 whitespace-pre-wrap font-mono text-xs leading-relaxed">
            {dictData.transcription}
          </p>
        </div>
      )}
    </div>
  );
}
