import React from 'react';

interface SystemFinding {
  name: string;
  findings: string;
}

interface ReviewOfSystemsData {
  systems?: SystemFinding[];
}

interface ReviewOfSystemsRendererProps {
  data: ReviewOfSystemsData;
}

/**
 * ReviewOfSystemsRenderer - Renders Review of Systems content
 */
export function ReviewOfSystemsRenderer({ data }: ReviewOfSystemsRendererProps) {
  return (
    <div className="space-y-2 text-sm">
      {data.systems?.map((sys, i) => (
        <div key={i}>
          <p className="font-semibold text-gray-900">{sys.name}:</p>
          <p className="text-gray-700">{sys.findings || 'Normal'}</p>
        </div>
      ))}
    </div>
  );
}
