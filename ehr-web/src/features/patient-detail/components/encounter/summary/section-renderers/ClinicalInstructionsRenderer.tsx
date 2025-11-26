import React from 'react';

interface ClinicalInstructionsData {
  patientInstructions?: string;
  followUpInstructions?: string;
}

interface ClinicalInstructionsRendererProps {
  data: ClinicalInstructionsData;
}

/**
 * ClinicalInstructionsRenderer - Renders clinical instructions content
 */
export function ClinicalInstructionsRenderer({ data }: ClinicalInstructionsRendererProps) {
  return (
    <div className="space-y-3 text-sm">
      {data.patientInstructions && (
        <div>
          <p className="font-semibold text-gray-900">Patient Instructions:</p>
          <p className="text-gray-700 whitespace-pre-wrap">{data.patientInstructions}</p>
        </div>
      )}
      {data.followUpInstructions && (
        <div>
          <p className="font-semibold text-gray-900">Follow-up Instructions:</p>
          <p className="text-gray-700 whitespace-pre-wrap">{data.followUpInstructions}</p>
        </div>
      )}
    </div>
  );
}
