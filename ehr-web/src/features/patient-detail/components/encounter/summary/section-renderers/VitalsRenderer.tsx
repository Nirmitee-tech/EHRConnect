import React from 'react';

interface Vital {
  name: string;
  value: string | number;
  unit: string;
}

interface VitalsData {
  vitals?: Vital[];
}

interface VitalsRendererProps {
  data: VitalsData;
}

/**
 * VitalsRenderer - Renders vital signs content
 */
export function VitalsRenderer({ data }: VitalsRendererProps) {
  return (
    <div className="grid grid-cols-3 gap-3 text-sm">
      {data.vitals?.map((vital, i) => (
        <div key={i} className="p-2 bg-gray-50 rounded">
          <p className="text-xs text-gray-600">{vital.name}</p>
          <p className="font-semibold text-gray-900">
            {vital.value} {vital.unit}
          </p>
        </div>
      ))}
    </div>
  );
}
