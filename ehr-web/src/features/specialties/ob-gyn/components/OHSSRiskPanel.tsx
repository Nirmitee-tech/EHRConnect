'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { obgynService, OHSSRiskAssessment } from '@/services/obgyn.service';
import { useApiHeaders } from '@/hooks/useApiHeaders';

interface OHSSRiskPanelProps {
  patientId: string;
  cycleId: string;
}

export default function OHSSRiskPanel({ patientId, cycleId }: OHSSRiskPanelProps) {
  const headers = useApiHeaders();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [riskData, setRiskData] = useState<OHSSRiskAssessment | null>(null);

  useEffect(() => {
    loadRiskAssessment();
  }, [patientId, cycleId]);

  const loadRiskAssessment = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await obgynService.calculateOHSSRisk(patientId, cycleId, headers);
      setRiskData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate OHSS risk');
      console.error('Error loading OHSS risk:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-red-600" />
        <span className="ml-2 text-sm text-gray-600">Calculating OHSS risk...</span>
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

  if (!riskData) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Risk assessment not available</p>
      </div>
    );
  }

  // Risk meter gradient colors
  const getRiskGradient = () => {
    switch (riskData.riskCategory) {
      case 'critical':
        return 'from-red-500 to-red-700';
      case 'high':
        return 'from-orange-500 to-orange-600';
      case 'moderate':
        return 'from-yellow-500 to-yellow-600';
      default:
        return 'from-green-500 to-green-600';
    }
  };

  const getRiskIcon = () => {
    switch (riskData.riskCategory) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-5 w-5" />;
      case 'moderate':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <CheckCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Risk Meter Header */}
      <div className={`bg-gradient-to-r ${getRiskGradient()} text-white rounded-lg p-3 shadow-lg`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getRiskIcon()}
            <div>
              <h3 className="text-lg font-bold">{riskData.riskLevel}</h3>
              <p className="text-xs opacity-90">Venice 2016 Criteria</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{riskData.riskScore}</div>
            <div className="text-xs opacity-90">Risk Score</div>
          </div>
        </div>

        {/* Risk Score Bar */}
        <div className="mt-2">
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-500"
              style={{ width: `${Math.min((riskData.riskScore / 14) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1 opacity-90">
            <span>0 (Low)</span>
            <span>4 (Mod)</span>
            <span>7 (High)</span>
            <span>10+ (Critical)</span>
          </div>
        </div>
      </div>

      {/* Clinical Action */}
      <div className={`p-2 rounded-lg border-2 ${
        riskData.riskCategory === 'critical' ? 'bg-red-50 border-red-300' :
        riskData.riskCategory === 'high' ? 'bg-orange-50 border-orange-300' :
        riskData.riskCategory === 'moderate' ? 'bg-yellow-50 border-yellow-300' :
        'bg-green-50 border-green-300'
      }`}>
        <div className="flex items-start gap-2">
          <AlertCircle className={`h-4 w-4 mt-0.5 ${
            riskData.riskCategory === 'critical' ? 'text-red-700' :
            riskData.riskCategory === 'high' ? 'text-orange-700' :
            riskData.riskCategory === 'moderate' ? 'text-yellow-700' :
            'text-green-700'
          }`} />
          <div>
            <div className={`text-xs font-semibold ${
              riskData.riskCategory === 'critical' ? 'text-red-900' :
              riskData.riskCategory === 'high' ? 'text-orange-900' :
              riskData.riskCategory === 'moderate' ? 'text-yellow-900' :
              'text-green-900'
            }`}>
              Clinical Action Required
            </div>
            <div className={`text-xs mt-0.5 ${
              riskData.riskCategory === 'critical' ? 'text-red-800' :
              riskData.riskCategory === 'high' ? 'text-orange-800' :
              riskData.riskCategory === 'moderate' ? 'text-yellow-800' :
              'text-green-800'
            }`}>
              {riskData.clinicalAction}
            </div>
          </div>
        </div>
      </div>

      {/* Risk Factors */}
      {riskData.riskFactors.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-2">
          <h4 className="text-xs font-semibold text-gray-900 mb-1.5">Risk Factors Contributing to Score</h4>
          <div className="space-y-1">
            {riskData.riskFactors.map((factor, idx) => (
              <div key={idx} className="flex items-start gap-2 p-1.5 bg-gray-50 rounded">
                <div className="flex-shrink-0 w-10 text-center">
                  <div className="inline-block bg-red-100 text-red-700 text-xs font-bold px-1.5 py-0.5 rounded">
                    +{factor.points}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-900">{factor.factor}</div>
                  <div className="text-xs text-gray-600">
                    Value: <span className="font-medium">{factor.value}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{factor.interpretation}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prevention Strategies */}
      {riskData.preventionStrategies.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-2">
          <h4 className="text-xs font-semibold text-blue-900 mb-1.5">🛡️ OHSS Prevention Strategies</h4>
          <div className="space-y-0.5">
            {riskData.preventionStrategies.map((strategy, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-blue-800">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>{strategy}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Context */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
          <h4 className="text-xs font-semibold text-purple-900 mb-1">Baseline Data</h4>
          <div className="space-y-0.5 text-xs">
            <div className="flex justify-between">
              <span className="text-purple-700">AFC:</span>
              <span className="font-medium text-purple-900">{riskData.clinicalContext.baselineData.afc}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-700">AMH:</span>
              <span className="font-medium text-purple-900">{riskData.clinicalContext.baselineData.amh}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-700">Age:</span>
              <span className="font-medium text-purple-900">{riskData.clinicalContext.baselineData.age}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-purple-700">PCOS:</span>
              <span className="font-medium text-purple-900">{riskData.clinicalContext.baselineData.pcos}</span>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2">
          <h4 className="text-xs font-semibold text-indigo-900 mb-1">Current Cycle Data</h4>
          <div className="space-y-0.5 text-xs">
            <div className="flex justify-between">
              <span className="text-indigo-700">Peak E2:</span>
              <span className="font-medium text-indigo-900">{riskData.clinicalContext.currentCycleData.peakE2}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-indigo-700">Follicles:</span>
              <span className="font-medium text-indigo-900">{riskData.clinicalContext.currentCycleData.follicleCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-indigo-700">Oocytes:</span>
              <span className="font-medium text-indigo-900">{riskData.clinicalContext.currentCycleData.oocytesRetrieved}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 pt-1.5 border-t border-gray-200">
        Venice 2016 Criteria • {new Date(riskData.calculationDate).toLocaleString()}
      </div>
    </div>
  );
}
