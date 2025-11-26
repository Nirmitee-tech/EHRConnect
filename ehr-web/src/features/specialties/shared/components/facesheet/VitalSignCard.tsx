'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';

interface VitalReading {
  value: number;
  unit: string;
  timestamp: string;
}

interface VitalSignCardProps {
  label: string;
  currentValue: string;
  unit?: string;
  timestamp?: string;
  status?: 'normal' | 'high' | 'low' | 'critical';
  trend?: 'up' | 'down' | 'stable';
  history?: VitalReading[];
  icon?: React.ReactNode;
  referenceRange?: string;
}

export function VitalSignCard({
  label,
  currentValue,
  unit = '',
  timestamp,
  status = 'normal',
  trend,
  history = [],
  referenceRange
}: VitalSignCardProps) {
  const [showHistory, setShowHistory] = useState(false);

  const getStatusColor = () => {
    switch (status) {
      case 'critical':
        return 'text-red-700 bg-red-50 border-red-300';
      case 'high':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-900 bg-white border-gray-300';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-orange-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-blue-600" />;
      case 'stable':
        return <Minus className="h-3 w-3 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`relative border rounded p-2 cursor-pointer hover:shadow transition-shadow ${getStatusColor()}`}
      onMouseEnter={() => history.length > 0 && setShowHistory(true)}
      onMouseLeave={() => setShowHistory(false)}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
          {label}
        </span>
        {getTrendIcon()}
      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold">{currentValue}</span>
        {unit && <span className="text-xs opacity-70">{unit}</span>}
      </div>

      {referenceRange && (
        <div className="text-[9px] opacity-60 mt-0.5">
          Ref: {referenceRange}
        </div>
      )}

      {timestamp && (
        <div className="text-[9px] opacity-50 mt-0.5">
          {format(new Date(timestamp), 'MM/dd HH:mm')}
        </div>
      )}

      {/* History Tooltip */}
      {showHistory && history.length > 0 && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg p-2 z-10 w-48">
          <div className="text-[10px] font-semibold mb-1 text-gray-700">History</div>
          <div className="space-y-0.5">
            {history.slice(0, 5).map((reading, idx) => (
              <div key={idx} className="flex justify-between text-[10px] text-gray-600">
                <span>
                  {reading.value} {reading.unit}
                </span>
                <span className="opacity-60">
                  {format(new Date(reading.timestamp), 'MM/dd HH:mm')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
