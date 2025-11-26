import React from 'react';

interface LabResultsData {
  testName: string;
  testCode: string;
  result: string;
  unit: string;
  referenceRange: string;
  interpretation: string;
  specimenType: string;
  collectionDate: string;
  resultDate: string;
  performingLab: string;
  notes: string;
}

/**
 * LabResultsRenderer - Displays saved lab result
 */
export function LabResultsRenderer({ data }: { data: any }) {
  const labData = data as LabResultsData;

  const getInterpretationColor = (interpretation: string) => {
    switch (interpretation) {
      case 'normal':
        return 'text-green-600';
      case 'low':
      case 'high':
        return 'text-yellow-600';
      case 'critical-low':
      case 'critical-high':
        return 'text-red-600';
      case 'abnormal':
        return 'text-orange-600';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <div className="space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-4">
        {labData.testName && (
          <div>
            <span className="font-semibold text-gray-700">Test:</span>
            <p className="text-gray-900 mt-1">{labData.testName}</p>
          </div>
        )}
        {labData.testCode && (
          <div>
            <span className="font-semibold text-gray-700">Code:</span>
            <p className="text-gray-900 mt-1 font-mono">{labData.testCode}</p>
          </div>
        )}
      </div>

      {labData.result && (
        <div className="bg-gray-50 border border-gray-200 rounded p-3">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-gray-700">Result:</span>
            <span className="text-lg font-bold text-gray-900">
              {labData.result} {labData.unit && <span className="text-sm">{labData.unit}</span>}
            </span>
            {labData.referenceRange && (
              <span className="text-xs text-gray-500">
                (Normal: {labData.referenceRange})
              </span>
            )}
          </div>
          {labData.interpretation && (
            <div className="mt-2">
              <span className="font-semibold text-gray-700">Interpretation:</span>
              <span className={`ml-2 capitalize font-medium ${getInterpretationColor(labData.interpretation)}`}>
                {labData.interpretation.replace(/-/g, ' ')}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {labData.specimenType && (
          <div>
            <span className="font-semibold text-gray-700">Specimen:</span>
            <p className="text-gray-900 mt-1 capitalize">{labData.specimenType}</p>
          </div>
        )}
        {labData.performingLab && (
          <div>
            <span className="font-semibold text-gray-700">Laboratory:</span>
            <p className="text-gray-900 mt-1">{labData.performingLab}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        {labData.collectionDate && (
          <div>
            <span className="font-semibold text-gray-700">Collected:</span>
            <p className="text-gray-900 mt-1">
              {new Date(labData.collectionDate).toLocaleString()}
            </p>
          </div>
        )}
        {labData.resultDate && (
          <div>
            <span className="font-semibold text-gray-700">Resulted:</span>
            <p className="text-gray-900 mt-1">
              {new Date(labData.resultDate).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {labData.notes && (
        <div>
          <span className="font-semibold text-gray-700">Notes:</span>
          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{labData.notes}</p>
        </div>
      )}
    </div>
  );
}
