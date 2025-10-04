import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface VitalsAlertsProps {
  alerts: string[];
}

export function VitalsAlerts({ alerts }: VitalsAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
            Clinical Alerts
            <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
              {alerts.length}
            </span>
          </h3>
          <ul className="space-y-1.5">
            {alerts.map((alert, i) => (
              <li key={i} className="text-xs text-red-800 flex items-start gap-1.5">
                <span className="text-red-600 mt-0.5">•</span>
                <span>{alert.replace(/[⚠️🔥❄️💨]/g, '').trim()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
