import React from 'react';

interface VitalsTableProps {
  observations: any[];
}

export function VitalsTable({ observations }: VitalsTableProps) {
  const grouped: { [key: string]: any[] } = {};

  observations.forEach((obs: any) => {
    const dateTime = obs.effectiveDateTime
      ? new Date(obs.effectiveDateTime).toISOString()
      : 'unknown';

    if (!grouped[dateTime]) {
      grouped[dateTime] = [];
    }
    grouped[dateTime].push(obs);
  });

  const sortedDates = Object.keys(grouped).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold">Complete Vitals History by Date</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date & Time</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Blood Pressure</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Heart Rate</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Temperature</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Resp. Rate</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">O2 Sat</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Weight</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Height</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sortedDates.map((dateTime) => {
              const obsGroup = grouped[dateTime];
              const date = dateTime !== 'unknown' ? new Date(dateTime) : null;

              let bp = '-';
              let hr = '-';
              let temp = '-';
              let rr = '-';
              let o2 = '-';
              let weight = '-';
              let height = '-';

              obsGroup.forEach((obs: any) => {
                const code = obs.code?.coding?.[0]?.code;

                if (code === '85354-9' && obs.component) {
                  const sys = obs.component.find((c: any) =>
                    c.code?.coding?.some((code: any) => code.code === '8480-6')
                  );
                  const dia = obs.component.find((c: any) =>
                    c.code?.coding?.some((code: any) => code.code === '8462-4')
                  );
                  bp = `${sys?.valueQuantity?.value || '-'}/${dia?.valueQuantity?.value || '-'}`;
                } else if (code === '8867-4') {
                  hr = `${obs.valueQuantity?.value || '-'} ${obs.valueQuantity?.unit || 'bpm'}`;
                } else if (code === '8310-5') {
                  temp = `${obs.valueQuantity?.value || '-'} ${obs.valueQuantity?.unit || '°C'}`;
                } else if (code === '9279-1') {
                  rr = `${obs.valueQuantity?.value || '-'} ${obs.valueQuantity?.unit || '/min'}`;
                } else if (code === '59408-5') {
                  o2 = `${obs.valueQuantity?.value || '-'} ${obs.valueQuantity?.unit || '%'}`;
                } else if (code === '29463-7') {
                  weight = `${obs.valueQuantity?.value || '-'} ${obs.valueQuantity?.unit || 'kg'}`;
                } else if (code === '8302-2') {
                  height = `${obs.valueQuantity?.value || '-'} ${obs.valueQuantity?.unit || 'cm'}`;
                }
              });

              return (
                <tr key={dateTime} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    {date ? (
                      <div>
                        <div className="font-medium text-gray-900">
                          {date.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {date.toLocaleTimeString()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500">Unknown</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{bp}</td>
                  <td className="px-4 py-3 text-sm font-medium">{hr}</td>
                  <td className="px-4 py-3 text-sm font-medium">{temp}</td>
                  <td className="px-4 py-3 text-sm font-medium">{rr}</td>
                  <td className="px-4 py-3 text-sm font-medium">{o2}</td>
                  <td className="px-4 py-3 text-sm font-medium">{weight}</td>
                  <td className="px-4 py-3 text-sm font-medium">{height}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {observations.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No vitals recorded yet
          </div>
        )}
      </div>
    </div>
  );
}
