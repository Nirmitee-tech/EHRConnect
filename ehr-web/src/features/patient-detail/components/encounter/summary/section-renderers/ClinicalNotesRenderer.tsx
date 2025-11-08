import React from 'react';

interface ClinicalNotesRendererProps {
  data: string | { notes?: string } | any;
}

/**
 * ClinicalNotesRenderer - Renders clinical notes content
 */
export function ClinicalNotesRenderer({ data }: ClinicalNotesRendererProps) {
  const content =
    typeof data === 'string'
      ? data
      : data.notes || JSON.stringify(data, null, 2);

  return (
    <div className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
      {content}
    </div>
  );
}
