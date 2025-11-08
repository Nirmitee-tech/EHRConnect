import React from 'react';

interface SOAPData {
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
}

interface SOAPRendererProps {
  data: SOAPData;
}

/**
 * SOAPRenderer - Renders SOAP note content
 */
export function SOAPRenderer({ data }: SOAPRendererProps) {
  return (
    <div className="space-y-3 text-sm">
      {data.subjective && (
        <div>
          <p className="font-semibold text-gray-900">Subjective:</p>
          <p className="text-gray-700 whitespace-pre-wrap">{data.subjective}</p>
        </div>
      )}
      {data.objective && (
        <div>
          <p className="font-semibold text-gray-900">Objective:</p>
          <p className="text-gray-700 whitespace-pre-wrap">{data.objective}</p>
        </div>
      )}
      {data.assessment && (
        <div>
          <p className="font-semibold text-gray-900">Assessment:</p>
          <p className="text-gray-700 whitespace-pre-wrap">{data.assessment}</p>
        </div>
      )}
      {data.plan && (
        <div>
          <p className="font-semibold text-gray-900">Plan:</p>
          <p className="text-gray-700 whitespace-pre-wrap">{data.plan}</p>
        </div>
      )}
    </div>
  );
}
