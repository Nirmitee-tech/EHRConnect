'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart as LineChartIcon,
  TrendingUp,
  Award,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { obgynService, IVFCycleAnalytics, IVFSuccessProbability } from '@/services/obgyn.service';
import { useApiHeaders } from '@/hooks/useApiHeaders';
import FollicleGrowthChart from './charts/FollicleGrowthChart';
import E2TrendChart from './charts/E2TrendChart';
import CumulativeSuccessChart from './charts/CumulativeSuccessChart';

interface AdvancedAnalyticsPanelProps {
  patientId: string;
  cycleId: string;
  totalEmbryos?: number;
  topQualityEmbryos?: number;
}

export default function AdvancedAnalyticsPanel({
  patientId,
  cycleId,
  totalEmbryos = 0,
  topQualityEmbryos = 0
}: AdvancedAnalyticsPanelProps) {
  const headers = useApiHeaders();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<IVFCycleAnalytics | null>(null);
  const [probability, setProbability] = useState<IVFSuccessProbability | null>(null);
  const [activeTab, setActiveTab] = useState<'follicles' | 'e2' | 'cumulative'>('follicles');

  useEffect(() => {
    loadData();
  }, [patientId, cycleId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load analytics data
      const analyticsData = await obgynService.getIVFCycleAnalytics(patientId, cycleId, headers);
      setAnalytics(analyticsData);

      // Try to load probability data if available
      try {
        // Note: This would need patient age and other factors - for now, using a simplified version
        // In production, you'd get this from the cycle data or patient demographics
        const probabilityData = await obgynService.calculateSuccessProbability(
          patientId,
          cycleId,
          {
            age: 32, // Default - should come from patient data
            oocytesRetrieved: analyticsData.summary.maxFollicles || undefined,
            blastocysts: totalEmbryos || undefined,
            topQualityBlastocysts: topQualityEmbryos || undefined
          },
          headers
        );
        setProbability(probabilityData);
      } catch (err) {
        // Probability calculation might fail if data is incomplete - that's okay
        console.log('Could not calculate probability:', err);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics data');
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
        <span className="ml-2 text-sm text-gray-600">Loading interactive charts...</span>
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
        <LineChartIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No monitoring data available</p>
        <p className="text-xs text-gray-400 mt-1">Interactive charts will appear after stimulation monitoring</p>
      </div>
    );
  }

  // Get follicle count from last monitoring entry
  const lastFollicleData = analytics.follicleGrowth[analytics.follicleGrowth.length - 1];
  const follicleCount = lastFollicleData?.totalCount || 0;

  // Get per transfer success rate from probability data or use default
  const perTransferSuccessRate = probability?.predictions.perEmbryoTransfer.frozen.liveBirth || 50;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Interactive Analytics</h3>
          <p className="text-sm text-gray-500">
            Advanced visualizations powered by Recharts
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full">
          <span className="font-medium">PHASE 6</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('follicles')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'follicles'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <LineChartIcon className="h-4 w-4" />
            Follicle Growth Trajectory
          </div>
        </button>
        <button
          onClick={() => setActiveTab('e2')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'e2'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            E2 Trend & OHSS Risk
          </div>
        </button>
        <button
          onClick={() => setActiveTab('cumulative')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'cumulative'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Cumulative Success
          </div>
        </button>
      </div>

      {/* Chart Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {activeTab === 'follicles' && (
          <FollicleGrowthChart
            data={analytics.follicleGrowth}
            growthVelocity={analytics.growthVelocity}
          />
        )}

        {activeTab === 'e2' && (
          <E2TrendChart
            data={analytics.e2Trend}
            follicleCount={follicleCount}
          />
        )}

        {activeTab === 'cumulative' && totalEmbryos > 0 && (
          <CumulativeSuccessChart
            totalEmbryos={totalEmbryos}
            topQualityCount={topQualityEmbryos}
            perTransferSuccessRate={perTransferSuccessRate}
            currentTransferNumber={0}
          />
        )}

        {activeTab === 'cumulative' && totalEmbryos === 0 && (
          <div className="text-center py-8">
            <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Embryo data required</p>
            <p className="text-xs text-gray-400 mt-1">
              Cumulative success chart will appear after embryo development
            </p>
          </div>
        )}
      </div>

      {/* Chart Description */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
        <div className="text-sm font-semibold text-purple-900 mb-2">
          {activeTab === 'follicles' && '📊 About Follicle Growth Trajectory'}
          {activeTab === 'e2' && '📈 About E2 Trend Analysis'}
          {activeTab === 'cumulative' && '🎯 About Cumulative Success'}
        </div>
        <div className="text-xs text-purple-800 space-y-1">
          {activeTab === 'follicles' && (
            <>
              <p>
                Tracks follicle development over stimulation days, showing how many follicles are in each size category.
                Ideal growth rate is 1.5-2.0mm per day. The lead follicle (largest) determines trigger timing.
              </p>
              <p className="mt-2">
                <strong>Clinical use:</strong> Identify slow responders, predict retrieval yield, optimize trigger timing
              </p>
            </>
          )}
          {activeTab === 'e2' && (
            <>
              <p>
                Estradiol (E2) levels should rise steadily with follicle growth. Expected range is 50-200 pg/mL per mature follicle.
                Levels above 3000 pg/mL indicate OHSS risk requiring preventive measures.
              </p>
              <p className="mt-2">
                <strong>Clinical use:</strong> OHSS risk assessment, response validation, protocol adjustment
              </p>
            </>
          )}
          {activeTab === 'cumulative' && (
            <>
              <p>
                Shows the probability of achieving at least one live birth across multiple embryo transfers.
                Based on individual embryo transfer success rates, calculated using complement probability.
              </p>
              <p className="mt-2">
                <strong>Clinical use:</strong> Patient counseling, realistic expectations, treatment planning
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
