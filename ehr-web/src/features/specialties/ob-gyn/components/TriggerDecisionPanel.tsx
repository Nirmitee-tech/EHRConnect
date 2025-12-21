'use client';

import React, { useState, useEffect } from 'react';
import {
  Target,
  Clock,
  Syringe,
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  Activity,
  X as XCircle,
  AlertTriangle
} from 'lucide-react';
import { obgynService, TriggerDecisionAssessment } from '@/services/obgyn.service';
import { useApiHeaders } from '@/hooks/useApiHeaders';

interface TriggerDecisionPanelProps {
  patientId: string;
  cycleId: string;
}

export default function TriggerDecisionPanel({ patientId, cycleId }: TriggerDecisionPanelProps) {
  const headers = useApiHeaders();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState<TriggerDecisionAssessment | null>(null);

  useEffect(() => {
    loadDecision();
  }, [patientId, cycleId]);

  const loadDecision = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await obgynService.calculateTriggerReadiness(patientId, cycleId, headers);
      setDecision(data);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate trigger readiness');
      console.error('Error loading trigger decision:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-gray-600">Analyzing trigger readiness...</span>
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

  if (!decision) {
    return (
      <div className="text-center py-8">
        <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Trigger assessment not available</p>
      </div>
    );
  }

  const getRecommendationColor = () => {
    if (decision.recommendation.includes('READY')) return 'green';
    if (decision.recommendation.includes('URGENT')) return 'red';
    if (decision.recommendation.includes('CAUTION') || decision.recommendation.includes('LIKELY')) return 'orange';
    return 'blue';
  };

  const getRecommendationBg = () => {
    const color = getRecommendationColor();
    return {
      green: 'from-green-500 to-green-600',
      red: 'from-red-500 to-red-600',
      orange: 'from-orange-500 to-orange-600',
      blue: 'from-blue-500 to-blue-600'
    }[color];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'normal':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'insufficient':
      case 'low':
      case 'thin':
        return <XCircle className="h-4 w-4 text-orange-600" />;
      case 'surge_detected':
      case 'elevated':
      case 'too_high':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Recommendation Header */}
      <div className={`bg-gradient-to-r ${getRecommendationBg()} text-white rounded-lg p-6 shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="h-8 w-8" />
            <div>
              <h3 className="text-2xl font-bold">{decision.recommendation}</h3>
              <p className="text-sm opacity-90 mt-1">
                Stimulation Day {decision.stimDay} • {new Date(decision.monitoringDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{decision.confidenceScore}%</div>
            <div className="text-xs opacity-90">Confidence</div>
          </div>
        </div>

        {/* Confidence Bar */}
        <div className="mt-4">
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-500"
              style={{ width: `${decision.confidenceScore}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1 opacity-90">
            <span>0%</span>
            <span>60% (Moderate)</span>
            <span>80% (High)</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Follicle Cohort Analysis */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-purple-600" />
          Follicle Cohort Analysis
        </h4>

        <div className="grid grid-cols-3 gap-4">
          {/* Lead Follicles */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <div className="text-xs text-purple-700 font-medium mb-1">Lead Follicles (≥18mm)</div>
            <div className="text-2xl font-bold text-purple-900">{decision.follicleAnalysis.lead.count}</div>
            <div className="text-xs text-purple-700 mt-2">
              <div>R: {decision.follicleAnalysis.lead.right.slice(0, 3).join(', ')}mm</div>
              <div>L: {decision.follicleAnalysis.lead.left.slice(0, 3).join(', ')}mm</div>
            </div>
            <div className="mt-2">
              {getStatusIcon(decision.checks.follicles.status)}
            </div>
          </div>

          {/* Supporting Cohort */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
            <div className="text-xs text-blue-700 font-medium mb-1">Supporting (16-17mm)</div>
            <div className="text-2xl font-bold text-blue-900">{decision.follicleAnalysis.supporting.count}</div>
            <div className="text-xs text-blue-700 mt-2">
              <div>R: {decision.follicleAnalysis.supporting.right.slice(0, 3).join(', ') || 'None'}mm</div>
              <div>L: {decision.follicleAnalysis.supporting.left.slice(0, 3).join(', ') || 'None'}mm</div>
            </div>
            <div className="mt-2">
              {getStatusIcon(decision.checks.cohortSync.status)}
            </div>
          </div>

          {/* Small Follicles */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
            <div className="text-xs text-gray-700 font-medium mb-1">Small (&lt;14mm)</div>
            <div className="text-2xl font-bold text-gray-900">{decision.follicleAnalysis.small.count}</div>
            <div className="text-xs text-gray-600 mt-2">{decision.follicleAnalysis.small.note}</div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-600 flex items-center justify-between">
            <span>Total Follicles:</span>
            <span className="font-semibold text-gray-900">{decision.follicleAnalysis.total}</span>
          </div>
        </div>
      </div>

      {/* Hormonal Readiness */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-600" />
          Hormonal Readiness
        </h4>

        <div className="space-y-3">
          {/* E2 */}
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-700">Estradiol (E2)</div>
              <div className="text-xs text-gray-500 mt-0.5">{decision.hormonalReadiness.e2.target}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                {decision.hormonalReadiness.e2.value ? `${Math.round(decision.hormonalReadiness.e2.value)} pg/mL` : 'N/A'}
              </div>
              {decision.hormonalReadiness.e2.perFollicle && (
                <div className="text-xs text-gray-600">
                  {decision.hormonalReadiness.e2.perFollicle} per follicle
                </div>
              )}
            </div>
            <div className="ml-2">
              {getStatusIcon(decision.hormonalReadiness.e2.status)}
            </div>
          </div>

          {/* LH */}
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-700">Luteinizing Hormone (LH)</div>
              <div className="text-xs text-gray-500 mt-0.5">{decision.hormonalReadiness.lh.target}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                {decision.hormonalReadiness.lh.value !== null ? `${decision.hormonalReadiness.lh.value} mIU/mL` : 'N/A'}
              </div>
            </div>
            <div className="ml-2">
              {getStatusIcon(decision.hormonalReadiness.lh.status)}
            </div>
          </div>

          {/* Progesterone */}
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-700">Progesterone (P4)</div>
              <div className="text-xs text-gray-500 mt-0.5">{decision.hormonalReadiness.progesterone.target}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                {decision.hormonalReadiness.progesterone.value !== null ? `${decision.hormonalReadiness.progesterone.value} ng/mL` : 'N/A'}
              </div>
            </div>
            <div className="ml-2">
              {getStatusIcon(decision.hormonalReadiness.progesterone.status)}
            </div>
          </div>
        </div>
      </div>

      {/* Endometrial Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Endometrial Status</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-pink-50 border border-pink-200 rounded">
            <div className="text-xs text-pink-700 font-medium mb-1">Thickness</div>
            <div className="text-xl font-bold text-pink-900">
              {decision.endometrialStatus.thickness ? `${decision.endometrialStatus.thickness}mm` : 'N/A'}
            </div>
            <div className="text-xs text-pink-700 mt-1">{decision.endometrialStatus.target}</div>
          </div>
          <div className="p-3 bg-pink-50 border border-pink-200 rounded">
            <div className="text-xs text-pink-700 font-medium mb-1">Pattern</div>
            <div className="text-xl font-bold text-pink-900 capitalize">
              {decision.endometrialStatus.pattern || 'Not recorded'}
            </div>
            <div className="mt-1">
              {getStatusIcon(decision.endometrialStatus.status)}
            </div>
          </div>
        </div>
      </div>

      {/* Trigger Recommendation */}
      <div className="bg-gradient-to-r from-green-50 to-cyan-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
          <Syringe className="h-4 w-4" />
          Trigger Recommendation
        </h4>
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="text-xs font-medium text-green-800 w-24">Medication:</div>
            <div className="text-sm font-semibold text-green-900 flex-1">
              {decision.triggerRecommendation.medication}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="text-xs font-medium text-green-800 w-24">Rationale:</div>
            <div className="text-xs text-green-800 flex-1">
              {decision.triggerRecommendation.rationale}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="text-xs font-medium text-green-800 w-24">Timing:</div>
            <div className="text-sm font-semibold text-green-900 flex-1">
              {decision.triggerRecommendation.timing}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="text-xs font-medium text-green-800 w-24">OHSS Risk:</div>
            <div className="text-xs text-green-800 flex-1 uppercase">
              {decision.triggerRecommendation.ohssRisk.replace('_', ' ')}
            </div>
          </div>
        </div>
      </div>

      {/* Expected Yield */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-purple-900 mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Expected Yield Prediction
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-900">{decision.expectedYield.matureOocytes}</div>
            <div className="text-xs text-purple-700 mt-1">Range</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-900">{decision.expectedYield.mostLikely}</div>
            <div className="text-xs text-purple-700 mt-1">Most Likely</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-purple-900">{decision.expectedYield.confidence}</div>
            <div className="text-xs text-purple-700 mt-1">Confidence</div>
          </div>
        </div>
        <div className="text-xs text-purple-800 mt-3 pt-3 border-t border-purple-200">
          {decision.expectedYield.basis}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-3">Next Steps</h4>
        <div className="space-y-2">
          {decision.nextSteps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-blue-800">
              <span className="text-blue-600 mt-0.5">{idx + 1}.</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-200">
        AI-powered trigger decision support • Last updated: {new Date(decision.calculationDate).toLocaleString()}
      </div>
    </div>
  );
}
