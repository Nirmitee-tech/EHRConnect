'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@nirmitee.io/design-system';
import { Button } from '@/components/ui/button';
import {
  Heart, Calendar, Activity, AlertCircle, Plus,
  TrendingUp, Weight, Clock, Baby, FileText
} from 'lucide-react';
import { useEpisodeContext } from '@/contexts/episode-context';
import { CreatePrenatalEpisodeDialog } from './CreatePrenatalEpisodeDialog';
import {
  calculateGestationalAge,
  calculateDaysToDelivery,
  calculateTrimester,
  calculatePregnancyProgress,
  formatGestationalAge,
  formatDate,
} from '../utils/pregnancy-calculators';

interface PrenatalOverviewProps {
  patientId: string;
}

/**
 * PrenatalOverview Component
 * Comprehensive dashboard for prenatal care showing key pregnancy information
 */
export function PrenatalOverview({ patientId }: PrenatalOverviewProps) {
  const { getEpisodeBySpecialty } = useEpisodeContext();
  const episode = getEpisodeBySpecialty('ob-gyn');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  if (!episode) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">
              <Heart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">No Active Prenatal Episode</p>
              <p className="text-sm mt-2 mb-4">Start a prenatal episode to track pregnancy care.</p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Start Prenatal Care
              </Button>
            </div>
          </CardContent>
        </Card>

        <CreatePrenatalEpisodeDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          patientId={patientId}
          onSuccess={() => {
            // Episode will be reloaded automatically by EpisodeProvider
            setShowCreateDialog(false);
          }}
        />
      </div>
    );
  }

  const metadata = episode.metadata as {
    edd?: string;
    lmp?: string;
    gravida?: number;
    para?: number;
    prePregnancyWeight?: number;
    height?: number;
    maternalAge?: number;
    bmi?: number;
    bmiCategory?: string;
    riskFactors?: string[];
    riskLevel?: 'low' | 'moderate' | 'high';
    isHighRisk?: boolean;
    previousCesarean?: boolean;
    previousPreterm?: boolean;
    multipleGestation?: boolean;
    chronicConditions?: string[];
    previousLoss?: boolean;
    gestationalAgeAtStart?: { weeks: number; days: number };
  };

  // Calculate current pregnancy metrics using our medical-grade calculators
  const pregnancyMetrics = useMemo(() => {
    if (!metadata.lmp) {
      return null;
    }

    const lmpDate = new Date(metadata.lmp);
    const eddDate = metadata.edd ? new Date(metadata.edd) : null;
    const ga = calculateGestationalAge(lmpDate);
    const trimester = calculateTrimester(ga.weeks);
    const daysToDelivery = eddDate ? calculateDaysToDelivery(eddDate) : null;
    const progress = calculatePregnancyProgress(ga.weeks);

    return {
      gestationalAge: ga,
      trimester,
      daysToDelivery,
      progress,
      lmpDate,
      eddDate,
    };
  }, [metadata.lmp, metadata.edd]);

  if (!pregnancyMetrics) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-400" />
            <p>Incomplete episode data. LMP date is required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Heart className="h-7 w-7 text-pink-600" />
            Prenatal Care
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {metadata.isHighRisk && (
              <span className={`inline-flex items-center gap-1 font-medium ${
                metadata.riskLevel === 'high' ? 'text-red-600' :
                metadata.riskLevel === 'moderate' ? 'text-orange-600' :
                'text-yellow-600'
              }`}>
                <AlertCircle className="h-4 w-4" />
                {metadata.riskLevel === 'high' ? 'High' : metadata.riskLevel === 'moderate' ? 'Moderate' : 'Low'} Risk Pregnancy
              </span>
            )}
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Episode Status</div>
          <div className={`text-lg font-semibold capitalize ${
            episode.status === 'active' ? 'text-green-600' :
            episode.status === 'completed' ? 'text-blue-600' :
            'text-gray-600'
          }`}>
            {episode.status}
          </div>
        </div>
      </div>

      {/* Pregnancy Progress Bar */}
      <Card className="border-2 border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatGestationalAge(pregnancyMetrics.gestationalAge.weeks, pregnancyMetrics.gestationalAge.days)}
              </div>
              <div className="text-sm text-gray-600">
                {pregnancyMetrics.trimester.label}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-pink-600">
                {pregnancyMetrics.daysToDelivery !== null && pregnancyMetrics.daysToDelivery >= 0
                  ? `${pregnancyMetrics.daysToDelivery} days`
                  : 'Past due'}
              </div>
              <div className="text-sm text-gray-600">until delivery</div>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden h-4 text-xs flex rounded-full bg-pink-200">
              <div
                style={{ width: `${pregnancyMetrics.progress}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-pink-500 to-pink-600 transition-all duration-500"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0 weeks</span>
              <span className="font-medium text-pink-600">{pregnancyMetrics.progress}% complete</span>
              <span>40 weeks</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-pink-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-gray-500 mb-1">Estimated Due Date</div>
                <div className="text-lg font-bold text-gray-900">
                  {pregnancyMetrics.eddDate ? formatDate(pregnancyMetrics.eddDate) : 'Not set'}
                </div>
              </div>
              <Calendar className="h-5 w-5 text-pink-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-gray-500 mb-1">Last Menstrual Period</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatDate(pregnancyMetrics.lmpDate)}
                </div>
              </div>
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-gray-500 mb-1">Gravida / Para</div>
                <div className="text-lg font-bold text-gray-900">
                  G{metadata.gravida || 0} P{metadata.para || 0}
                </div>
              </div>
              <Baby className="h-5 w-5 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs text-gray-500 mb-1">BMI / Category</div>
                <div className="text-lg font-bold text-gray-900">
                  {metadata.bmi ? `${metadata.bmi.toFixed(1)} - ${metadata.bmiCategory}` : 'Not recorded'}
                </div>
              </div>
              <Weight className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Factors Alert */}
      {metadata.isHighRisk && metadata.riskFactors && metadata.riskFactors.length > 0 && (
        <Card className={`border-2 ${
          metadata.riskLevel === 'high' ? 'border-red-300 bg-red-50' :
          metadata.riskLevel === 'moderate' ? 'border-orange-300 bg-orange-50' :
          'border-yellow-300 bg-yellow-50'
        }`}>
          <CardHeader>
            <CardTitle className={`text-sm flex items-center gap-2 ${
              metadata.riskLevel === 'high' ? 'text-red-800' :
              metadata.riskLevel === 'moderate' ? 'text-orange-800' :
              'text-yellow-800'
            }`}>
              <AlertCircle className="h-5 w-5" />
              Risk Assessment - {metadata.riskLevel?.toUpperCase()} RISK
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metadata.riskFactors.map((factor, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className={`mt-1 ${
                    metadata.riskLevel === 'high' ? 'text-red-600' :
                    metadata.riskLevel === 'moderate' ? 'text-orange-600' :
                    'text-yellow-600'
                  }`}>
                    •
                  </span>
                  <span className={`text-sm ${
                    metadata.riskLevel === 'high' ? 'text-red-700' :
                    metadata.riskLevel === 'moderate' ? 'text-orange-700' :
                    'text-yellow-700'
                  }`}>
                    {factor}
                  </span>
                </div>
              ))}
            </div>

            {/* Additional Risk Information */}
            {metadata.chronicConditions && metadata.chronicConditions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-orange-200">
                <div className="text-xs font-medium text-gray-700 mb-1">Chronic Conditions:</div>
                <div className="flex flex-wrap gap-2">
                  {metadata.chronicConditions.map((condition, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white rounded-full text-xs text-gray-700 border border-orange-200"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Maternal Demographics */}
      {(metadata.maternalAge || metadata.prePregnancyWeight || metadata.height) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Maternal Demographics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-sm">
              {metadata.maternalAge && (
                <div>
                  <div className="text-gray-500 mb-1">Maternal Age</div>
                  <div className="font-semibold text-gray-900">{metadata.maternalAge} years</div>
                </div>
              )}
              {metadata.prePregnancyWeight && (
                <div>
                  <div className="text-gray-500 mb-1">Pre-Pregnancy Weight</div>
                  <div className="font-semibold text-gray-900">{metadata.prePregnancyWeight} kg</div>
                </div>
              )}
              {metadata.height && (
                <div>
                  <div className="text-gray-500 mb-1">Height</div>
                  <div className="font-semibold text-gray-900">{metadata.height} cm</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="h-auto flex flex-col items-start p-4 text-left hover:bg-pink-50 hover:border-pink-300"
            >
              <div className="text-sm font-medium text-gray-900 mb-1">Record Visit</div>
              <div className="text-xs text-gray-500">Document prenatal visit</div>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex flex-col items-start p-4 text-left hover:bg-purple-50 hover:border-purple-300"
            >
              <div className="text-sm font-medium text-gray-900 mb-1">Add Ultrasound</div>
              <div className="text-xs text-gray-500">Record imaging findings</div>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex flex-col items-start p-4 text-left hover:bg-blue-50 hover:border-blue-300"
            >
              <div className="text-sm font-medium text-gray-900 mb-1">Order Labs</div>
              <div className="text-xs text-gray-500">Request lab work</div>
            </Button>
            <Button
              variant="outline"
              className="h-auto flex flex-col items-start p-4 text-left hover:bg-green-50 hover:border-green-300"
            >
              <div className="text-sm font-medium text-gray-900 mb-1">View Flowsheet</div>
              <div className="text-xs text-gray-500">Vitals & trends</div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
