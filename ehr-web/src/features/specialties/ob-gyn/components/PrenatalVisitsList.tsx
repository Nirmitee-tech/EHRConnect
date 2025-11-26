'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@nirmitee.io/design-system';
import { Button } from '@/components/ui/button';
import {
  Calendar, Plus, Edit, Trash2, Activity, Heart,
  TrendingUp, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { PrenatalVisitDialog, PrenatalVisit } from './PrenatalVisitDialog';
import { formatGestationalAge, formatDate } from '../utils/pregnancy-calculators';

interface PrenatalVisitsListProps {
  patientId: string;
}

export function PrenatalVisitsList({ patientId }: PrenatalVisitsListProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<PrenatalVisit | null>(null);
  const [expandedVisitId, setExpandedVisitId] = useState<string | null>(null);

  // TODO: Fetch visits from backend
  const [visits, setVisits] = useState<PrenatalVisit[]>([
    // Mock data for demonstration
  ]);

  const handleAddVisit = () => {
    setSelectedVisit(null);
    setShowDialog(true);
  };

  const handleEditVisit = (visit: PrenatalVisit) => {
    setSelectedVisit(visit);
    setShowDialog(true);
  };

  const handleDeleteVisit = async (visitId: string) => {
    if (confirm('Are you sure you want to delete this visit?')) {
      // TODO: Delete from backend
      setVisits(visits.filter(v => v.id !== visitId));
    }
  };

  const handleSuccess = () => {
    // TODO: Refresh visits from backend
    setShowDialog(false);
  };

  const toggleExpand = (visitId: string) => {
    setExpandedVisitId(expandedVisitId === visitId ? null : visitId);
  };

  const getBPStatus = (systolic: number, diastolic: number) => {
    if (systolic >= 140 || diastolic >= 90) {
      return { label: 'Elevated', color: 'text-red-600 bg-red-50' };
    } else if (systolic >= 120 || diastolic >= 80) {
      return { label: 'Pre-hypertension', color: 'text-orange-600 bg-orange-50' };
    }
    return { label: 'Normal', color: 'text-green-600 bg-green-50' };
  };

  const getFHRStatus = (fhr: number) => {
    if (fhr >= 110 && fhr <= 160) {
      return { label: 'Normal', color: 'text-green-600' };
    }
    return { label: 'Abnormal', color: 'text-red-600' };
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-pink-600" />
            Prenatal Visits
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {visits.length} visit{visits.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <Button
          onClick={handleAddVisit}
          className="bg-pink-600 hover:bg-pink-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Record Visit
        </Button>
      </div>

      {/* Visits List */}
      {visits.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No Prenatal Visits Recorded</p>
            <p className="text-sm mt-2 mb-4">Start documenting prenatal care visits</p>
            <Button
              onClick={handleAddVisit}
              variant="outline"
              className="border-pink-600 text-pink-600 hover:bg-pink-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Record First Visit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visits.map((visit) => {
            const isExpanded = expandedVisitId === visit.id;
            const bpStatus = getBPStatus(visit.bloodPressureSystolic, visit.bloodPressureDiastolic);
            const fhrStatus = visit.fetalHeartRate ? getFHRStatus(visit.fetalHeartRate) : null;

            return (
              <Card key={visit.id} className="border-l-4 border-l-pink-500 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {/* Visit Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <Calendar className="h-5 w-5 text-pink-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="text-lg font-semibold text-gray-900">
                            {formatDate(new Date(visit.visitDate))}
                          </div>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                            {formatGestationalAge(visit.gestationalAge.weeks, visit.gestationalAge.days)}
                          </span>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                          <div className="flex items-center gap-1">
                            <Activity className="h-4 w-4 text-gray-400" />
                            <span className={`font-medium px-2 py-0.5 rounded ${bpStatus.color}`}>
                              {visit.bloodPressureSystolic}/{visit.bloodPressureDiastolic}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-700">{visit.weight} kg</span>
                          </div>
                          {visit.fundalHeight && (
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500 text-xs">FH:</span>
                              <span className="text-gray-700">{visit.fundalHeight} cm</span>
                            </div>
                          )}
                          {visit.fetalHeartRate && fhrStatus && (
                            <div className="flex items-center gap-1">
                              <Heart className={`h-4 w-4 ${fhrStatus.color}`} />
                              <span className="text-gray-700">{visit.fetalHeartRate} bpm</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditVisit(visit)}
                        className="hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteVisit(visit.id!)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(visit.id!)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      {/* Symptoms */}
                      {visit.symptoms && visit.symptoms.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            Symptoms
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {visit.symptoms.map((symptom, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-orange-50 text-orange-700 text-xs rounded-full border border-orange-200"
                              >
                                {symptom}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Edema */}
                      {visit.edema && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Edema:</span>{' '}
                          <span className="text-gray-600">
                            {visit.edemaLocation || 'Present'}
                          </span>
                        </div>
                      )}

                      {/* Fetal Presentation */}
                      {visit.fetalPresentation && visit.fetalPresentation !== 'unknown' && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Fetal Presentation:</span>{' '}
                          <span className="text-gray-600 capitalize">{visit.fetalPresentation}</span>
                        </div>
                      )}

                      {/* Assessment Notes */}
                      {visit.assessmentNotes && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-sm font-medium text-gray-700 mb-1">Assessment</div>
                          <div className="text-sm text-gray-600">{visit.assessmentNotes}</div>
                        </div>
                      )}

                      {/* Plan Notes */}
                      {visit.planNotes && (
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="text-sm font-medium text-gray-700 mb-1">Plan</div>
                          <div className="text-sm text-gray-600">{visit.planNotes}</div>
                        </div>
                      )}

                      {/* Next Visit */}
                      {visit.nextVisitDate && (
                        <div className="bg-green-50 rounded-lg p-3 text-sm">
                          <span className="font-medium text-gray-700">Next Visit:</span>{' '}
                          <span className="text-gray-600">{formatDate(new Date(visit.nextVisitDate))}</span>
                        </div>
                      )}

                      {/* Assessments */}
                      {visit.metadata?.fundalHeightAssessment && (
                        <div className={`p-2 rounded text-xs ${
                          visit.metadata.fundalHeightAssessment.status === 'normal'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-orange-50 text-orange-700'
                        }`}>
                          <strong>Fundal Height:</strong> {visit.metadata.fundalHeightAssessment.message}
                        </div>
                      )}

                      {visit.metadata?.weightGain !== undefined && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Weight Gain:</span>{' '}
                          <span className={visit.metadata.weightGain >= 0 ? 'text-green-600' : 'text-orange-600'}>
                            {visit.metadata.weightGain >= 0 ? '+' : ''}{visit.metadata.weightGain.toFixed(1)} kg
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Visit Dialog */}
      <PrenatalVisitDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        patientId={patientId}
        visitData={selectedVisit}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
