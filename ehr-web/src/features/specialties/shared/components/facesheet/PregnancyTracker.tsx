'use client';

import React from 'react';
import { Calendar, Baby, AlertTriangle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface PregnancyTrackerProps {
  lmp?: string;
  edd?: string;
  gravida?: number;
  para?: number;
  living?: number;
  gestationalAge?: string;
  trimester?: 1 | 2 | 3;
  numberOfFetuses?: number;
  highRisk?: boolean;
  riskFactors?: string[];
  nextVisit?: string;
}

export function PregnancyTracker({
  lmp,
  edd,
  gravida = 0,
  para = 0,
  living = 0,
  gestationalAge,
  numberOfFetuses = 1,
  highRisk = false,
  riskFactors = [],
  nextVisit
}: PregnancyTrackerProps) {
  const calculateGA = () => {
    if (!lmp) return null;
    const lmpDate = new Date(lmp);
    const now = new Date();
    const diffDays = differenceInDays(now, lmpDate);
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    return `${weeks}w ${days}d`;
  };

  const calculateProgress = () => {
    if (!lmp || !edd) return 0;
    const lmpDate = new Date(lmp);
    const eddDate = new Date(edd);
    const now = new Date();
    const totalDays = differenceInDays(eddDate, lmpDate);
    const elapsedDays = differenceInDays(now, lmpDate);
    return Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
  };

  const ga = gestationalAge || calculateGA();
  const progress = calculateProgress();
  const weeksLeft = edd ? Math.max(0, Math.floor(differenceInDays(new Date(edd), new Date()) / 7)) : 0;

  return (
    <div className="bg-white border border-gray-300 rounded shadow-sm p-3">
      {/* Compact Header Row */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Baby className="h-4 w-4 text-gray-600" />
          <span className="text-xs font-bold text-gray-800">ACTIVE PREGNANCY</span>
          {highRisk && (
            <span className="flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded text-[9px] font-semibold border border-red-200">
              <AlertTriangle className="h-2.5 w-2.5" />
              HIGH RISK
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <span>G{gravida}/P{para}</span>
          <span>Living: {living}</span>
          {numberOfFetuses > 1 && <span className="font-semibold text-gray-900">{numberOfFetuses} fetuses</span>}
        </div>
      </div>

      {/* Compact Metrics Grid */}
      <div className="grid grid-cols-6 gap-2 mb-2">
        <div className="col-span-2 bg-gray-50 border border-gray-200 rounded p-2">
          <div className="text-[9px] text-gray-500 uppercase mb-0.5">Gestational Age</div>
          <div className="text-base font-bold text-gray-900">{ga || 'N/A'}</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded p-2">
          <div className="text-[9px] text-gray-500 uppercase mb-0.5">LMP</div>
          <div className="text-xs font-semibold text-gray-900">
            {lmp ? format(new Date(lmp), 'MM/dd/yy') : '-'}
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded p-2">
          <div className="text-[9px] text-gray-500 uppercase mb-0.5">EDD</div>
          <div className="text-xs font-semibold text-gray-900">
            {edd ? format(new Date(edd), 'MM/dd/yy') : '-'}
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded p-2">
          <div className="text-[9px] text-gray-500 uppercase mb-0.5">Weeks Left</div>
          <div className="text-base font-bold text-gray-900">{weeksLeft}</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded p-2">
          <div className="text-[9px] text-gray-500 uppercase mb-0.5">Days Left</div>
          <div className="text-xs font-semibold text-gray-900">
            {edd ? Math.max(0, differenceInDays(new Date(edd), new Date())) : '-'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gray-600 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          {/* Trimester markers */}
          <div className="absolute top-0 left-1/3 w-px h-full bg-gray-400" />
          <div className="absolute top-0 left-2/3 w-px h-full bg-gray-400" />
        </div>
        <div className="flex justify-between text-[9px] text-gray-500 mt-0.5">
          <span>T1</span>
          <span>T2</span>
          <span>T3</span>
          <span>Due</span>
        </div>
      </div>

      {/* Risk Factors & Next Visit */}
      <div className="flex gap-2">
        {riskFactors.length > 0 && (
          <div className="flex-1 bg-red-50 border border-red-200 rounded p-1.5">
            <div className="text-[9px] font-semibold text-red-700 uppercase mb-0.5">Risk Factors</div>
            <div className="text-[10px] text-red-800 space-y-0.5">
              {riskFactors.slice(0, 2).map((factor, idx) => (
                <div key={idx}>• {factor}</div>
              ))}
            </div>
          </div>
        )}
        {nextVisit && (
          <div className="flex-1 bg-blue-50 border border-blue-200 rounded p-1.5">
            <div className="flex items-center gap-1 mb-0.5">
              <Calendar className="h-2.5 w-2.5 text-blue-600" />
              <span className="text-[9px] font-semibold text-blue-700 uppercase">Next Visit</span>
            </div>
            <div className="text-[10px] font-semibold text-blue-900">
              {format(new Date(nextVisit), 'EEE, MMM dd')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
