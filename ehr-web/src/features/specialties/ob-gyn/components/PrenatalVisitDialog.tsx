'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Activity, Heart, AlertCircle, Ruler, Stethoscope, Baby } from 'lucide-react';
import { useEpisodeContext } from '@/contexts/episode-context';
import {
  calculateGestationalAge,
  formatGestationalAge,
  assessFundalHeight,
  calculateExpectedFundalHeight,
} from '../utils/pregnancy-calculators';

interface PrenatalVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  visitData?: PrenatalVisit | null;
  onSuccess?: () => void;
}

export interface PrenatalVisit {
  id?: string;
  visitDate: string;
  gestationalAge: { weeks: number; days: number };

  // Vitals
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  weight: number;

  // Measurements
  fundalHeight?: number;
  fetalHeartRate?: number;

  // Presentation
  fetalPresentation?: 'cephalic' | 'breech' | 'transverse' | 'unknown';

  // Symptoms
  symptoms: string[];
  edema?: boolean;
  edemaLocation?: string;

  // Assessment & Plan
  assessmentNotes: string;
  planNotes: string;

  // Next visit
  nextVisitDate?: string;

  metadata?: any;
}

export function PrenatalVisitDialog({
  open,
  onOpenChange,
  patientId,
  visitData,
  onSuccess,
}: PrenatalVisitDialogProps) {
  const { getEpisodeBySpecialty } = useEpisodeContext();
  const episode = getEpisodeBySpecialty('ob-gyn');

  // Form state
  const [visitDate, setVisitDate] = useState('');
  const [bpSystolic, setBpSystolic] = useState('');
  const [bpDiastolic, setBpDiastolic] = useState('');
  const [weight, setWeight] = useState('');
  const [fundalHeight, setFundalHeight] = useState('');
  const [fetalHeartRate, setFetalHeartRate] = useState('');
  const [fetalPresentation, setFetalPresentation] = useState<string>('unknown');
  const [edema, setEdema] = useState(false);
  const [edemaLocation, setEdemaLocation] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [assessmentNotes, setAssessmentNotes] = useState('');
  const [planNotes, setPlanNotes] = useState('');
  const [nextVisitDate, setNextVisitDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculated values
  const [gestationalAge, setGestationalAge] = useState<{ weeks: number; days: number } | null>(null);
  const [fundalHeightAssessment, setFundalHeightAssessment] = useState<any>(null);
  const [weightGain, setWeightGain] = useState<number | null>(null);

  // Get episode metadata
  const episodeMetadata = episode?.metadata as any;

  // Calculate gestational age when visit date changes
  useEffect(() => {
    if (visitDate && episodeMetadata?.lmp) {
      const lmpDate = new Date(episodeMetadata.lmp);
      const visitDateObj = new Date(visitDate);
      const ga = calculateGestationalAge(lmpDate, visitDateObj);
      setGestationalAge(ga);
    }
  }, [visitDate, episodeMetadata?.lmp]);

  // Assess fundal height
  useEffect(() => {
    if (fundalHeight && gestationalAge) {
      const fh = parseFloat(fundalHeight);
      if (!isNaN(fh)) {
        const assessment = assessFundalHeight(fh, gestationalAge.weeks);
        setFundalHeightAssessment(assessment);
      }
    } else {
      setFundalHeightAssessment(null);
    }
  }, [fundalHeight, gestationalAge]);

  // Calculate weight gain
  useEffect(() => {
    if (weight && episodeMetadata?.prePregnancyWeight) {
      const currentWeight = parseFloat(weight);
      const preWeight = episodeMetadata.prePregnancyWeight;
      if (!isNaN(currentWeight)) {
        setWeightGain(currentWeight - preWeight);
      }
    }
  }, [weight, episodeMetadata?.prePregnancyWeight]);

  // Initialize form with existing visit data
  useEffect(() => {
    if (visitData && open) {
      setVisitDate(visitData.visitDate);
      setBpSystolic(visitData.bloodPressureSystolic.toString());
      setBpDiastolic(visitData.bloodPressureDiastolic.toString());
      setWeight(visitData.weight.toString());
      setFundalHeight(visitData.fundalHeight?.toString() || '');
      setFetalHeartRate(visitData.fetalHeartRate?.toString() || '');
      setFetalPresentation(visitData.fetalPresentation || 'unknown');
      setEdema(visitData.edema || false);
      setEdemaLocation(visitData.edemaLocation || '');
      setSymptoms(visitData.symptoms || []);
      setAssessmentNotes(visitData.assessmentNotes);
      setPlanNotes(visitData.planNotes);
      setNextVisitDate(visitData.nextVisitDate || '');
    } else if (open && !visitData) {
      // Reset for new visit
      const today = new Date().toISOString().split('T')[0];
      setVisitDate(today);
      setBpSystolic('');
      setBpDiastolic('');
      setWeight('');
      setFundalHeight('');
      setFetalHeartRate('');
      setFetalPresentation('unknown');
      setEdema(false);
      setEdemaLocation('');
      setSymptoms([]);
      setSymptomInput('');
      setAssessmentNotes('');
      setPlanNotes('');
      setNextVisitDate('');
    }
  }, [visitData, open]);

  const addSymptom = () => {
    if (symptomInput.trim()) {
      setSymptoms([...symptoms, symptomInput.trim()]);
      setSymptomInput('');
    }
  };

  const removeSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!visitDate || !bpSystolic || !bpDiastolic || !weight) {
      setError('Please fill in all required fields (Date, BP, Weight)');
      return;
    }

    try {
      setLoading(true);

      const visitRecord: PrenatalVisit = {
        id: visitData?.id,
        visitDate,
        gestationalAge: gestationalAge!,
        bloodPressureSystolic: parseInt(bpSystolic),
        bloodPressureDiastolic: parseInt(bpDiastolic),
        weight: parseFloat(weight),
        fundalHeight: fundalHeight ? parseFloat(fundalHeight) : undefined,
        fetalHeartRate: fetalHeartRate ? parseInt(fetalHeartRate) : undefined,
        fetalPresentation: fetalPresentation as any,
        symptoms,
        edema,
        edemaLocation: edema ? edemaLocation : undefined,
        assessmentNotes,
        planNotes,
        nextVisitDate: nextVisitDate || undefined,
        metadata: {
          fundalHeightAssessment,
          weightGain,
        },
      };

      // TODO: Save to backend via FHIR Observation resources
      console.log('Saving prenatal visit:', visitRecord);

      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      console.error('Error saving prenatal visit:', err);
      setError(err instanceof Error ? err.message : 'Failed to save prenatal visit');
    } finally {
      setLoading(false);
    }
  };

  const expectedFundalHeight = gestationalAge ? calculateExpectedFundalHeight(gestationalAge.weeks) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-600" />
            {visitData ? 'Edit Prenatal Visit' : 'Record Prenatal Visit'}
          </DialogTitle>
          <DialogDescription>
            {gestationalAge && (
              <span className="text-pink-600 font-medium">
                Gestational Age: {formatGestationalAge(gestationalAge.weeks, gestationalAge.days)}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Visit Date */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Visit Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="visitDate" className="required">Visit Date</Label>
                <Input
                  id="visitDate"
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="nextVisitDate">Next Visit Date</Label>
                <Input
                  id="nextVisitDate"
                  type="date"
                  value={nextVisitDate}
                  onChange={(e) => setNextVisitDate(e.target.value)}
                  min={visitDate}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Vital Signs */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Vital Signs
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="bpSystolic" className="required">BP Systolic</Label>
                <Input
                  id="bpSystolic"
                  type="number"
                  value={bpSystolic}
                  onChange={(e) => setBpSystolic(e.target.value)}
                  required
                  placeholder="mmHg"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="bpDiastolic" className="required">BP Diastolic</Label>
                <Input
                  id="bpDiastolic"
                  type="number"
                  value={bpDiastolic}
                  onChange={(e) => setBpDiastolic(e.target.value)}
                  required
                  placeholder="mmHg"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="weight" className="required">Weight</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                  placeholder="kg"
                  className="mt-1"
                />
                {weightGain !== null && (
                  <p className={`text-xs mt-1 ${weightGain >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {weightGain >= 0 ? '+' : ''}{weightGain.toFixed(1)} kg from pre-pregnancy
                  </p>
                )}
              </div>
            </div>

            {/* BP Assessment */}
            {bpSystolic && bpDiastolic && (
              <div className={`mt-3 p-2 rounded text-xs ${
                parseInt(bpSystolic) >= 140 || parseInt(bpDiastolic) >= 90
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}>
                {parseInt(bpSystolic) >= 140 || parseInt(bpDiastolic) >= 90
                  ? '⚠️ Elevated BP - Consider preeclampsia evaluation'
                  : '✓ Normal blood pressure'}
              </div>
            )}
          </div>

          {/* Measurements */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Measurements
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fundalHeight">Fundal Height (cm)</Label>
                <Input
                  id="fundalHeight"
                  type="number"
                  step="0.1"
                  value={fundalHeight}
                  onChange={(e) => setFundalHeight(e.target.value)}
                  placeholder="cm"
                  className="mt-1"
                />
                {expectedFundalHeight && (
                  <p className="text-xs text-gray-500 mt-1">
                    Expected: {expectedFundalHeight.expected}cm (±2cm)
                  </p>
                )}
                {fundalHeightAssessment && (
                  <p className={`text-xs mt-1 ${fundalHeightAssessment.statusColor}`}>
                    {fundalHeightAssessment.status === 'normal' ? '✓' : '⚠️'} {fundalHeightAssessment.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="fetalHeartRate">Fetal Heart Rate (bpm)</Label>
                <Input
                  id="fetalHeartRate"
                  type="number"
                  value={fetalHeartRate}
                  onChange={(e) => setFetalHeartRate(e.target.value)}
                  placeholder="bpm"
                  className="mt-1"
                />
                {fetalHeartRate && (
                  <p className={`text-xs mt-1 ${
                    parseInt(fetalHeartRate) >= 110 && parseInt(fetalHeartRate) <= 160
                      ? 'text-green-600'
                      : 'text-orange-600'
                  }`}>
                    {parseInt(fetalHeartRate) >= 110 && parseInt(fetalHeartRate) <= 160
                      ? '✓ Normal FHR (110-160 bpm)'
                      : '⚠️ Abnormal FHR - consider further evaluation'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Fetal Presentation */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Baby className="h-4 w-4" />
              Fetal Assessment
            </h3>
            <div>
              <Label htmlFor="fetalPresentation">Fetal Presentation</Label>
              <select
                id="fetalPresentation"
                value={fetalPresentation}
                onChange={(e) => setFetalPresentation(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="unknown">Unknown/Not assessed</option>
                <option value="cephalic">Cephalic (head down)</option>
                <option value="breech">Breech</option>
                <option value="transverse">Transverse</option>
              </select>
            </div>
          </div>

          {/* Symptoms & Concerns */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Symptoms & Concerns
            </h3>

            <div className="mb-3">
              <Label htmlFor="symptomInput">Add Symptom</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="symptomInput"
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  placeholder="e.g., Headache, Nausea, Back pain"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSymptom();
                    }
                  }}
                />
                <Button type="button" onClick={addSymptom} variant="outline">
                  Add
                </Button>
              </div>
            </div>

            {symptoms.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {symptoms.map((symptom, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white rounded-full text-sm flex items-center gap-2 border border-orange-200"
                  >
                    {symptom}
                    <button
                      type="button"
                      onClick={() => removeSymptom(index)}
                      className="text-orange-600 hover:text-orange-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={edema}
                  onChange={(e) => setEdema(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Edema present</span>
              </label>

              {edema && (
                <Input
                  value={edemaLocation}
                  onChange={(e) => setEdemaLocation(e.target.value)}
                  placeholder="Location of edema (e.g., lower extremities, hands, face)"
                  className="mt-2"
                />
              )}
            </div>
          </div>

          {/* Assessment & Plan */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Assessment & Plan
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="assessmentNotes">Assessment Notes</Label>
                <Textarea
                  id="assessmentNotes"
                  value={assessmentNotes}
                  onChange={(e) => setAssessmentNotes(e.target.value)}
                  placeholder="Clinical assessment, findings, concerns..."
                  rows={3}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="planNotes">Plan Notes</Label>
                <Textarea
                  id="planNotes"
                  value={planNotes}
                  onChange={(e) => setPlanNotes(e.target.value)}
                  placeholder="Treatment plan, recommendations, follow-up..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-pink-600 hover:bg-pink-700"
            >
              {loading ? 'Saving...' : visitData ? 'Update Visit' : 'Save Visit'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
