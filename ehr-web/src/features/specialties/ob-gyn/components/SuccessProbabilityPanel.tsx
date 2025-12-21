'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calculator,
  TrendingUp,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { obgynService, IVFSuccessProbability, IVFCycle } from '@/services/obgyn.service';
import { useApiHeaders } from '@/hooks/useApiHeaders';

interface SuccessProbabilityPanelProps {
  patientId: string;
  cycleId: string;
  cycle?: IVFCycle;
  patientAge?: number;
  patientData?: {
    amh?: number;
    afc?: number;
    bmi?: number;
  };
}

export default function SuccessProbabilityPanel({
  patientId,
  cycleId,
  cycle,
  patientAge,
  patientData
}: SuccessProbabilityPanelProps) {
  const headers = useApiHeaders();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [probability, setProbability] = useState<IVFSuccessProbability | null>(null);
  const [autoCalculate, setAutoCalculate] = useState(true);

  // Extract cycle data
  const cycleFactors = useMemo(() => {
    if (!cycle) return null;

    return {
      oocytesRetrieved: cycle.oocytesRetrieved || undefined,
      matureOocytes: cycle.matureOocytes || undefined,
      blastocysts: cycle.embryos?.filter((e: any) =>
        e.stage === 'blastocyst' || e.day5Grade
      ).length || undefined,
      topQualityBlastocysts: cycle.embryos?.filter((e: any) =>
        ['5AA', '4AA', '4AB', '4BA', '5AB', '5BA'].includes(e.day5Grade)
      ).length || undefined
    };
  }, [cycle]);

  // Count previous IVF cycles
  const [previousCycles, setPreviousCycles] = useState(0);
  useEffect(() => {
    const loadPreviousCycles = async () => {
      try {
        const comparison = await obgynService.compareIVFCycles(patientId, headers);
        const currentIdx = comparison.cycles.findIndex(c => c.cycleId === cycleId);
        setPreviousCycles(currentIdx >= 0 ? currentIdx : 0);
      } catch (err) {
        console.error('Error loading previous cycles:', err);
      }
    };
    loadPreviousCycles();
  }, [patientId, cycleId]);

  const calculateProbability = async () => {
    if (!patientAge) {
      setError('Patient age is required for calculation');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const factors = {
        age: patientAge,
        amh: patientData?.amh,
        afc: patientData?.afc || cycle?.baseline?.afc,
        bmi: patientData?.bmi,
        previousIVFCount: previousCycles,
        ...cycleFactors
      };

      const result = await obgynService.calculateSuccessProbability(
        patientId,
        cycleId,
        factors,
        headers
      );

      setProbability(result);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate success probability');
      console.error('Error calculating success probability:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoCalculate && patientAge && cycleFactors?.oocytesRetrieved) {
      calculateProbability();
    }
  }, [patientAge, cycleFactors, autoCalculate]);

  const getRiskCategoryColor = (category: string) => {
    switch (category) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'guarded':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRiskCategoryIcon = (category: string) => {
    switch (category) {
      case 'excellent':
        return <Award className="h-5 w-5" />;
      case 'good':
        return <CheckCircle className="h-5 w-5" />;
      case 'fair':
        return <Target className="h-5 w-5" />;
      case 'guarded':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Calculator className="h-5 w-5" />;
    }
  };

  const getProgressBarColor = (rate: number) => {
    if (rate >= 60) return 'bg-green-500';
    if (rate >= 40) return 'bg-blue-500';
    if (rate >= 25) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  if (!patientAge) {
    return (
      <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <AlertCircle className="h-5 w-5 text-yellow-600" />
        <span className="text-sm text-yellow-700">Patient age is required to calculate success probability</span>
      </div>
    );
  }

  if (!cycleFactors?.oocytesRetrieved) {
    return (
      <div className="text-center py-8">
        <Calculator className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Oocyte retrieval data required</p>
        <p className="text-xs text-gray-400 mt-1">Success probability will be calculated after retrieval</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Calculator className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Success Probability Calculator</h3>
            <p className="text-sm text-gray-500">Based on SART data (50,000+ cycles)</p>
          </div>
        </div>
        <button
          onClick={calculateProbability}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Recalculate
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {loading && !probability && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          <span className="ml-2 text-sm text-gray-600">Calculating probability...</span>
        </div>
      )}

      {probability && (
        <>
          {/* Risk Category */}
          <div className={`p-4 border-2 rounded-lg ${getRiskCategoryColor(probability.riskCategory)}`}>
            <div className="flex items-center gap-3 mb-2">
              {getRiskCategoryIcon(probability.riskCategory)}
              <div>
                <div className="text-sm font-semibold uppercase tracking-wide">
                  {probability.riskCategory} Prognosis
                </div>
                <div className="text-xs opacity-80 mt-0.5">
                  Based on patient factors and cycle outcomes
                </div>
              </div>
            </div>
          </div>

          {/* Predictions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fresh Transfer */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Fresh Transfer
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Clinical Pregnancy</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {probability.predictions.perEmbryoTransfer.fresh.clinicalPregnancy}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressBarColor(probability.predictions.perEmbryoTransfer.fresh.clinicalPregnancy)}`}
                      style={{ width: `${probability.predictions.perEmbryoTransfer.fresh.clinicalPregnancy}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Live Birth</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {probability.predictions.perEmbryoTransfer.fresh.liveBirth}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressBarColor(probability.predictions.perEmbryoTransfer.fresh.liveBirth)}`}
                      style={{ width: `${probability.predictions.perEmbryoTransfer.fresh.liveBirth}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Frozen Transfer (FET) */}
            <div className="border border-gray-200 rounded-lg p-4 bg-blue-50/30">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                Frozen Transfer (FET) - Preferred
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Clinical Pregnancy</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {probability.predictions.perEmbryoTransfer.frozen.clinicalPregnancy}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressBarColor(probability.predictions.perEmbryoTransfer.frozen.clinicalPregnancy)}`}
                      style={{ width: `${probability.predictions.perEmbryoTransfer.frozen.clinicalPregnancy}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Live Birth</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {probability.predictions.perEmbryoTransfer.frozen.liveBirth}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressBarColor(probability.predictions.perEmbryoTransfer.frozen.liveBirth)}`}
                      style={{ width: `${probability.predictions.perEmbryoTransfer.frozen.liveBirth}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cumulative Success */}
          {probability.predictions.cumulative.totalEmbryos > 0 && (
            <div className="border-2 border-purple-200 bg-purple-50 rounded-lg p-5">
              <h4 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Cumulative Success (All {probability.predictions.cumulative.totalEmbryos} Embryos)
              </h4>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <div className="text-3xl font-bold text-purple-900">
                    {probability.predictions.cumulative.atLeastOneLiveBirth}%
                  </div>
                  <div className="text-sm text-purple-700 mt-1">
                    Probability of at least one live birth
                  </div>
                  <div className="mt-3 w-full bg-purple-200 rounded-full h-3">
                    <div
                      className="bg-purple-600 h-3 rounded-full"
                      style={{ width: `${probability.predictions.cumulative.atLeastOneLiveBirth}%` }}
                    />
                  </div>
                </div>
                <div className="text-center pb-2">
                  <div className="text-xs text-purple-600 font-medium mb-1">Embryos</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {probability.predictions.cumulative.totalEmbryos}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-purple-200 rounded-lg p-5">
            <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-purple-600" />
              Clinical Recommendation
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {probability.recommendation}
            </p>
          </div>

          {/* Input Factors Summary */}
          <details className="border border-gray-200 rounded-lg">
            <summary className="px-4 py-3 cursor-pointer hover:bg-gray-50 text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              View Calculation Factors
            </summary>
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500">Age:</span>
                  <span className="ml-2 font-medium">{probability.inputFactors.age} years</span>
                </div>
                {probability.inputFactors.amh && (
                  <div>
                    <span className="text-gray-500">AMH:</span>
                    <span className="ml-2 font-medium">{probability.inputFactors.amh} ng/mL</span>
                  </div>
                )}
                {probability.inputFactors.afc && (
                  <div>
                    <span className="text-gray-500">AFC:</span>
                    <span className="ml-2 font-medium">{probability.inputFactors.afc}</span>
                  </div>
                )}
                {probability.inputFactors.oocytesRetrieved && (
                  <div>
                    <span className="text-gray-500">Oocytes:</span>
                    <span className="ml-2 font-medium">{probability.inputFactors.oocytesRetrieved}</span>
                  </div>
                )}
                {probability.inputFactors.blastocysts && (
                  <div>
                    <span className="text-gray-500">Blastocysts:</span>
                    <span className="ml-2 font-medium">{probability.inputFactors.blastocysts}</span>
                  </div>
                )}
                {probability.inputFactors.topQualityBlastocysts !== undefined && (
                  <div>
                    <span className="text-gray-500">Top Quality:</span>
                    <span className="ml-2 font-medium">{probability.inputFactors.topQualityBlastocysts}</span>
                  </div>
                )}
                {probability.inputFactors.previousIVFCount !== undefined && (
                  <div>
                    <span className="text-gray-500">Previous Cycles:</span>
                    <span className="ml-2 font-medium">{probability.inputFactors.previousIVFCount}</span>
                  </div>
                )}
              </div>
              <div className="text-[10px] text-gray-400 mt-2 pt-2 border-t border-gray-200">
                Calculated at: {new Date(probability.calculatedAt).toLocaleString()}
              </div>
            </div>
          </details>
        </>
      )}
    </div>
  );
}
