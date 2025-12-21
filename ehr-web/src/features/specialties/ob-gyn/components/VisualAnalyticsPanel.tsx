'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Ruler,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { obgynService, IVFCycleAnalytics } from '@/services/obgyn.service';
import { useApiHeaders } from '@/hooks/useApiHeaders';

interface VisualAnalyticsPanelProps {
  patientId: string;
  cycleId: string;
}

export default function VisualAnalyticsPanel({ patientId, cycleId }: VisualAnalyticsPanelProps) {
  const headers = useApiHeaders();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<IVFCycleAnalytics | null>(null);
  const [activeTab, setActiveTab] = useState<'follicles' | 'e2' | 'endo'>('follicles');

  useEffect(() => {
    loadAnalytics();
  }, [patientId, cycleId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await obgynService.getIVFCycleAnalytics(patientId, cycleId, headers);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-pink-600" />
        <span className="ml-2 text-sm text-gray-600">Loading analytics...</span>
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

  if (!analytics || analytics.follicleGrowth.length === 0) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No monitoring data available</p>
        <p className="text-xs text-gray-400 mt-1">Analytics will appear after stimulation monitoring</p>
      </div>
    );
  }

  const maxFollicles = Math.max(...analytics.follicleGrowth.map(f => f.totalCount));
  const maxE2 = Math.max(...analytics.e2Trend.map(e => e.value));
  const maxEndo = analytics.endoThicknessTrend.length > 0
    ? Math.max(...analytics.endoThicknessTrend.map(e => e.thickness))
    : 0;

  return (
    <div className="space-y-6">
      {/* Header & Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Visual Analytics</h3>
          <p className="text-sm text-gray-500">
            {analytics.summary.totalMonitoringVisits} monitoring visits •{' '}
            {analytics.summary.stimDaysTracked} stimulation days
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <div className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full">
            Peak E2: {analytics.summary.peakE2 ? `${analytics.summary.peakE2} pg/mL` : 'N/A'}
          </div>
          <div className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full">
            Max Follicles: {analytics.summary.maxFollicles}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('follicles')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'follicles'
              ? 'border-pink-600 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Follicle Growth
          </div>
        </button>
        <button
          onClick={() => setActiveTab('e2')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'e2'
              ? 'border-pink-600 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            E2 Trend
          </div>
        </button>
        <button
          onClick={() => setActiveTab('endo')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'endo'
              ? 'border-pink-600 text-pink-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Endometrium
          </div>
        </button>
      </div>

      {/* Follicle Growth Chart */}
      {activeTab === 'follicles' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 bg-gray-100 rounded">
              <div className="font-semibold text-gray-700">Small (&lt;10mm)</div>
              <div className="h-2 bg-gray-400 rounded mt-1"></div>
            </div>
            <div className="p-2 bg-yellow-100 rounded">
              <div className="font-semibold text-yellow-700">Medium (10-14mm)</div>
              <div className="h-2 bg-yellow-400 rounded mt-1"></div>
            </div>
            <div className="p-2 bg-orange-100 rounded">
              <div className="font-semibold text-orange-700">Large (14-18mm)</div>
              <div className="h-2 bg-orange-500 rounded mt-1"></div>
            </div>
            <div className="p-2 bg-red-100 rounded">
              <div className="font-semibold text-red-700">Mature (≥18mm)</div>
              <div className="h-2 bg-red-600 rounded mt-1"></div>
            </div>
          </div>

          <div className="space-y-3">
            {analytics.follicleGrowth.map((growth) => {
              const small = (growth.bySize.small / maxFollicles) * 100;
              const medium = (growth.bySize.medium / maxFollicles) * 100;
              const large = (growth.bySize.large / maxFollicles) * 100;
              const mature = (growth.bySize.mature / maxFollicles) * 100;

              return (
                <div key={growth.stimDay} className="flex items-center gap-3">
                  <div className="w-20 text-sm">
                    <div className="font-semibold text-gray-900">Day {growth.stimDay}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(growth.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex h-8 rounded-lg overflow-hidden border border-gray-200">
                      {small > 0 && (
                        <div
                          className="bg-gray-400 flex items-center justify-center text-xs text-white font-medium"
                          style={{ width: `${small}%` }}
                          title={`Small: ${growth.bySize.small}`}
                        >
                          {growth.bySize.small > 0 && growth.bySize.small}
                        </div>
                      )}
                      {medium > 0 && (
                        <div
                          className="bg-yellow-400 flex items-center justify-center text-xs text-gray-900 font-medium"
                          style={{ width: `${medium}%` }}
                          title={`Medium: ${growth.bySize.medium}`}
                        >
                          {growth.bySize.medium > 0 && growth.bySize.medium}
                        </div>
                      )}
                      {large > 0 && (
                        <div
                          className="bg-orange-500 flex items-center justify-center text-xs text-white font-medium"
                          style={{ width: `${large}%` }}
                          title={`Large: ${growth.bySize.large}`}
                        >
                          {growth.bySize.large > 0 && growth.bySize.large}
                        </div>
                      )}
                      {mature > 0 && (
                        <div
                          className="bg-red-600 flex items-center justify-center text-xs text-white font-medium"
                          style={{ width: `${mature}%` }}
                          title={`Mature: ${growth.bySize.mature}`}
                        >
                          {growth.bySize.mature > 0 && growth.bySize.mature}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-32 text-right text-xs space-y-0.5">
                    <div className="font-semibold text-gray-900">
                      Total: {growth.totalCount}
                    </div>
                    <div className="text-gray-500">
                      Avg: {growth.avgSize.toFixed(1)}mm
                    </div>
                    <div className="text-pink-600">
                      Lead: {growth.leadFollicleSize}mm
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Growth Velocity */}
          {analytics.growthVelocity.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Growth Velocity</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {analytics.growthVelocity.map((velocity) => (
                  <div key={`${velocity.fromDay}-${velocity.toDay}`} className="flex justify-between">
                    <span className="text-gray-600">Day {velocity.fromDay} → {velocity.toDay}:</span>
                    <span className="font-semibold text-gray-900">
                      {velocity.mmPerDay.toFixed(1)} mm/day
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* E2 Trend */}
      {activeTab === 'e2' && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-2">
            Expected range: 50-200 pg/mL per mature follicle
          </div>
          <div className="space-y-3">
            {analytics.e2Trend.map((e2) => {
              const percentage = (e2.value / maxE2) * 100;
              const perFollicleStatus =
                e2.perFollicle >= 50 && e2.perFollicle <= 200
                  ? 'text-green-600'
                  : e2.perFollicle > 200
                  ? 'text-orange-600'
                  : 'text-gray-500';

              return (
                <div key={e2.stimDay} className="flex items-center gap-3">
                  <div className="w-20 text-sm">
                    <div className="font-semibold text-gray-900">Day {e2.stimDay}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(e2.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-end pr-2"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      >
                        <span className="text-xs text-white font-semibold">
                          {e2.value} pg/mL
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-32 text-right">
                    <div className={`text-xs font-semibold ${perFollicleStatus}`}>
                      {e2.perFollicle} pg/mL per follicle
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Endometrial Thickness */}
      {activeTab === 'endo' && analytics.endoThicknessTrend.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 mb-2">
            Target: ≥8mm with trilaminar pattern for optimal implantation
          </div>
          <div className="space-y-3">
            {analytics.endoThicknessTrend.map((endo) => {
              const percentage = (endo.thickness / maxEndo) * 100;
              const isOptimal = endo.thickness >= 8 && endo.pattern === 'trilaminar';
              const barColor = isOptimal
                ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                : endo.thickness >= 7
                ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                : 'bg-gradient-to-r from-orange-400 to-red-500';

              return (
                <div key={endo.stimDay} className="flex items-center gap-3">
                  <div className="w-20 text-sm">
                    <div className="font-semibold text-gray-900">Day {endo.stimDay}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(endo.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      <div
                        className={`absolute inset-y-0 left-0 ${barColor} flex items-center justify-end pr-2`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      >
                        <span className="text-xs text-white font-semibold">
                          {endo.thickness.toFixed(1)} mm
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-32 text-right text-xs">
                    <div className={`font-semibold ${isOptimal ? 'text-green-600' : 'text-gray-600'}`}>
                      {endo.pattern || 'N/A'}
                    </div>
                    {isOptimal && (
                      <div className="text-green-600 text-[10px]">✓ Optimal</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'endo' && analytics.endoThicknessTrend.length === 0 && (
        <div className="text-center py-8 text-sm text-gray-500">
          No endometrial thickness data available
        </div>
      )}
    </div>
  );
}
