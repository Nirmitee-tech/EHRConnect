'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { obgynService, IVFCycleComparison } from '@/services/obgyn.service';
import { useApiHeaders } from '@/hooks/useApiHeaders';

interface CycleComparisonPanelProps {
  patientId: string;
  currentCycleId?: string;
}

export default function CycleComparisonPanel({ patientId, currentCycleId }: CycleComparisonPanelProps) {
  const headers = useApiHeaders();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<IVFCycleComparison | null>(null);

  useEffect(() => {
    loadComparison();
  }, [patientId]);

  const loadComparison = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await obgynService.compareIVFCycles(patientId, headers);
      setComparison(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load cycle comparison');
      console.error('Error loading cycle comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (current: number | null, previous: number | null) => {
    if (current === null || previous === null) return null;

    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-green-600 inline" />;
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-red-600 inline" />;
    }
    return <Minus className="h-4 w-4 text-gray-400 inline" />;
  };

  const formatValue = (value: number | null, suffix: string = '') => {
    if (value === null) return '-';
    return `${value}${suffix}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-pink-600" />
        <span className="ml-2 text-sm text-gray-600">Loading cycle comparison...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <span className="text-sm text-red-700">{error}</span>
      </div>
    );
  }

  if (!comparison || comparison.totalCycles === 0) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No cycle data available for comparison</p>
        <p className="text-xs text-gray-400 mt-1">Comparison data will appear after multiple cycles</p>
      </div>
    );
  }

  const { cycles, insights } = comparison;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Cycle Comparison</h3>
          <p className="text-sm text-gray-500">{cycles.length} cycle{cycles.length > 1 ? 's' : ''} tracked</p>
        </div>
      </div>

      {/* Insights */}
      {insights && insights.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Key Insights</h4>
          <ul className="space-y-1.5">
            {insights.map((insight, idx) => (
              <li key={idx} className="text-sm text-blue-800 flex items-start">
                <span className="mr-2">•</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Comparison Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                Parameter
              </th>
              {cycles.map((cycle) => (
                <th
                  key={cycle.cycleId}
                  className={`px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider ${
                    cycle.cycleId === currentCycleId
                      ? 'bg-pink-100 text-pink-800'
                      : 'text-gray-700'
                  }`}
                >
                  Cycle {cycle.cycleNumber}
                  {cycle.cycleId === currentCycleId && (
                    <div className="text-[10px] font-normal text-pink-600 mt-0.5">Current</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Start Date */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                Start Date
              </td>
              {cycles.map((cycle, idx) => (
                <td
                  key={cycle.cycleId}
                  className={`px-4 py-3 text-sm text-center ${
                    cycle.cycleId === currentCycleId ? 'bg-pink-50' : ''
                  }`}
                >
                  {cycle.startDate ? new Date(cycle.startDate).toLocaleDateString() : '-'}
                </td>
              ))}
            </tr>

            {/* Protocol */}
            <tr className="bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-gray-50">
                Protocol
              </td>
              {cycles.map((cycle) => (
                <td
                  key={cycle.cycleId}
                  className={`px-4 py-3 text-sm text-center ${
                    cycle.cycleId === currentCycleId ? 'bg-pink-50' : ''
                  }`}
                >
                  {cycle.protocol || '-'}
                </td>
              ))}
            </tr>

            {/* AFC */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                AFC
              </td>
              {cycles.map((cycle, idx) => (
                <td
                  key={cycle.cycleId}
                  className={`px-4 py-3 text-sm text-center ${
                    cycle.cycleId === currentCycleId ? 'bg-pink-50' : ''
                  }`}
                >
                  {formatValue(cycle.afc)}
                  {idx > 0 && getTrendIcon(cycle.afc, cycles[idx - 1].afc)}
                </td>
              ))}
            </tr>

            {/* Stim Days */}
            <tr className="bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-gray-50">
                Stim Days
              </td>
              {cycles.map((cycle, idx) => (
                <td
                  key={cycle.cycleId}
                  className={`px-4 py-3 text-sm text-center ${
                    cycle.cycleId === currentCycleId ? 'bg-pink-50' : ''
                  }`}
                >
                  {formatValue(cycle.stimDays)}
                  {idx > 0 && getTrendIcon(cycle.stimDays, cycles[idx - 1].stimDays)}
                </td>
              ))}
            </tr>

            {/* Peak E2 */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                Peak E2 (pg/mL)
              </td>
              {cycles.map((cycle, idx) => (
                <td
                  key={cycle.cycleId}
                  className={`px-4 py-3 text-sm text-center ${
                    cycle.cycleId === currentCycleId ? 'bg-pink-50' : ''
                  }`}
                >
                  {formatValue(cycle.peakE2)}
                  {idx > 0 && getTrendIcon(cycle.peakE2, cycles[idx - 1].peakE2)}
                </td>
              ))}
            </tr>

            {/* Oocytes Retrieved */}
            <tr className="bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-gray-50">
                Oocytes Retrieved
              </td>
              {cycles.map((cycle, idx) => (
                <td
                  key={cycle.cycleId}
                  className={`px-4 py-3 text-sm text-center ${
                    cycle.cycleId === currentCycleId ? 'bg-pink-50' : ''
                  }`}
                >
                  {formatValue(cycle.oocytesRetrieved)}
                  {idx > 0 && getTrendIcon(cycle.oocytesRetrieved, cycles[idx - 1].oocytesRetrieved)}
                </td>
              ))}
            </tr>

            {/* Mature Oocytes */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                Mature (M2)
              </td>
              {cycles.map((cycle, idx) => (
                <td
                  key={cycle.cycleId}
                  className={`px-4 py-3 text-sm text-center ${
                    cycle.cycleId === currentCycleId ? 'bg-pink-50' : ''
                  }`}
                >
                  {formatValue(cycle.matureOocytes)}
                  {cycle.maturityRate && <span className="text-xs text-gray-500 ml-1">({cycle.maturityRate}%)</span>}
                </td>
              ))}
            </tr>

            {/* Fertilized */}
            <tr className="bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-gray-50">
                Fertilized (2PN)
              </td>
              {cycles.map((cycle, idx) => (
                <td
                  key={cycle.cycleId}
                  className={`px-4 py-3 text-sm text-center ${
                    cycle.cycleId === currentCycleId ? 'bg-pink-50' : ''
                  }`}
                >
                  {cycle.fertilized}
                  {cycle.fertilizationRate && <span className="text-xs text-gray-500 ml-1">({cycle.fertilizationRate}%)</span>}
                </td>
              ))}
            </tr>

            {/* Blastocysts */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                Blastocysts
              </td>
              {cycles.map((cycle, idx) => (
                <td
                  key={cycle.cycleId}
                  className={`px-4 py-3 text-sm text-center ${
                    cycle.cycleId === currentCycleId ? 'bg-pink-50' : ''
                  }`}
                >
                  {cycle.blastocysts}
                  {cycle.blastocystRate && <span className="text-xs text-gray-500 ml-1">({cycle.blastocystRate}%)</span>}
                  {idx > 0 && getTrendIcon(cycle.blastocysts, cycles[idx - 1].blastocysts)}
                </td>
              ))}
            </tr>

            {/* Top Quality */}
            <tr className="bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-gray-50">
                Top Quality (4-5AA/AB/BA)
              </td>
              {cycles.map((cycle, idx) => (
                <td
                  key={cycle.cycleId}
                  className={`px-4 py-3 text-sm text-center font-semibold ${
                    cycle.cycleId === currentCycleId ? 'bg-pink-50 text-pink-700' : 'text-green-700'
                  }`}
                >
                  {cycle.topQuality}
                  {idx > 0 && getTrendIcon(cycle.topQuality, cycles[idx - 1].topQuality)}
                </td>
              ))}
            </tr>

            {/* Outcome */}
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-white">
                Outcome
              </td>
              {cycles.map((cycle) => {
                let outcomeColor = 'text-gray-600';
                let outcomeText = cycle.outcome;

                if (cycle.outcome === 'live_birth' || cycle.outcome === 'ongoing') {
                  outcomeColor = 'text-green-600 font-semibold';
                } else if (cycle.outcome === 'clinical_pregnancy') {
                  outcomeColor = 'text-blue-600 font-semibold';
                } else if (cycle.outcome === 'biochemical' || cycle.outcome === 'miscarriage') {
                  outcomeColor = 'text-orange-600';
                } else if (cycle.outcome === 'pending') {
                  outcomeColor = 'text-gray-400';
                  outcomeText = 'Pending';
                }

                return (
                  <td
                    key={cycle.cycleId}
                    className={`px-4 py-3 text-sm text-center ${
                      cycle.cycleId === currentCycleId ? 'bg-pink-50' : ''
                    }`}
                  >
                    <span className={outcomeColor}>
                      {outcomeText.replace(/_/g, ' ')}
                    </span>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-green-600" />
          <span>Improved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <TrendingDown className="h-3.5 w-3.5 text-red-600" />
          <span>Decreased</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Minus className="h-3.5 w-3.5 text-gray-400" />
          <span>No change</span>
        </div>
      </div>
    </div>
  );
}
