import React from 'react';

interface ObservationData {
  observationType: string;
  observationCode: string;
  value: string;
  unit: string;
  interpretation: string;
  method: string;
  bodySite: string;
  notes: string;
}

/**
 * ObservationRenderer - Displays saved observation data
 */
export function ObservationRenderer({ data }: { data: any }) {
  const obsData = data as ObservationData;

  return (
    <div className="space-y-3 text-sm">
      {obsData.observationType && (
        <div>
          <span className="font-semibold text-gray-700">Type:</span>
          <p className="text-gray-900 mt-1 capitalize">{obsData.observationType.replace(/-/g, ' ')}</p>
        </div>
      )}

      {obsData.observationCode && (
        <div>
          <span className="font-semibold text-gray-700">Observation:</span>
          <p className="text-gray-900 mt-1">{obsData.observationCode}</p>
        </div>
      )}

      {obsData.value && (
        <div>
          <span className="font-semibold text-gray-700">Value:</span>
          <p className="text-gray-900 mt-1">
            {obsData.value} {obsData.unit && <span className="text-gray-600">{obsData.unit}</span>}
          </p>
        </div>
      )}

      {obsData.interpretation && (
        <div>
          <span className="font-semibold text-gray-700">Interpretation:</span>
          <p className="text-gray-900 mt-1 capitalize">{obsData.interpretation}</p>
        </div>
      )}

      {obsData.method && (
        <div>
          <span className="font-semibold text-gray-700">Method:</span>
          <p className="text-gray-900 mt-1">{obsData.method}</p>
        </div>
      )}

      {obsData.bodySite && (
        <div>
          <span className="font-semibold text-gray-700">Body Site:</span>
          <p className="text-gray-900 mt-1">{obsData.bodySite}</p>
        </div>
      )}

      {obsData.notes && (
        <div>
          <span className="font-semibold text-gray-700">Notes:</span>
          <p className="text-gray-900 mt-1 whitespace-pre-wrap">{obsData.notes}</p>
        </div>
      )}
    </div>
  );
}
