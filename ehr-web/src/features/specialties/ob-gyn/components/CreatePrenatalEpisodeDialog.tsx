'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, AlertCircle, Calculator, Heart } from 'lucide-react';
import { useEpisodeContext } from '@/contexts/episode-context';
import {
  calculateEDDFromLMP,
  calculateGestationalAge,
  calculateBMI,
  assessHighRiskFactors,
  formatDate,
  formatGestationalAge,
} from '../utils/pregnancy-calculators';

interface CreatePrenatalEpisodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  onSuccess?: () => void;
}

export function CreatePrenatalEpisodeDialog({
  open,
  onOpenChange,
  patientId,
  onSuccess,
}: CreatePrenatalEpisodeDialogProps) {
  const { createEpisode } = useEpisodeContext();

  // Form state
  const [lmp, setLmp] = useState('');
  const [edd, setEdd] = useState('');
  const [gravida, setGravida] = useState('');
  const [para, setPara] = useState('');
  const [prePregnancyWeight, setPrePregnancyWeight] = useState('');
  const [height, setHeight] = useState('');
  const [maternalAge, setMaternalAge] = useState('');

  // Risk factors
  const [previousCesarean, setPreviousCesarean] = useState(false);
  const [previousPreterm, setPreviousPreterm] = useState(false);
  const [multipleGestation, setMultipleGestation] = useState(false);
  const [numberOfFetuses, setNumberOfFetuses] = useState('1');
  const [chorionicity, setChorionicity] = useState<'monochorionic' | 'dichorionic' | ''>('');
  const [amnionicity, setAmnionicity] = useState<'monoamniotic' | 'diamniotic' | ''>('');
  const [chronicConditions, setChronicConditions] = useState('');
  const [previousLoss, setPreviousLoss] = useState(false);

  // Calculated values
  const [calculatedEDD, setCalculatedEDD] = useState<Date | null>(null);
  const [gestationalAge, setGestationalAge] = useState<{ weeks: number; days: number } | null>(null);
  const [bmi, setBmi] = useState<{ bmi: number; category: string; color: string } | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-calculate EDD when LMP changes with smart validation
  useEffect(() => {
    if (lmp) {
      const lmpDate = new Date(lmp);
      const now = new Date();
      const daysSinceLMP = Math.floor((now.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24));

      // Smart validation: check for unrealistic dates
      if (daysSinceLMP > 300) {
        setError('⚠️ Something is wrong here - LMP date seems too old for current pregnancy');
        return;
      }
      if (daysSinceLMP < 0) {
        setError('⚠️ Something is wrong here - LMP date cannot be in the future');
        return;
      }
      setError(''); // Clear error if validation passes

      const calculatedDate = calculateEDDFromLMP(lmpDate);
      setCalculatedEDD(calculatedDate);
      setEdd(calculatedDate.toISOString().split('T')[0]);

      // Calculate current gestational age
      const ga = calculateGestationalAge(lmpDate);
      setGestationalAge(ga);
    }
  }, [lmp]);

  // Auto-set multipleGestation when numberOfFetuses > 1
  useEffect(() => {
    const fetusCount = parseInt(numberOfFetuses);
    if (fetusCount > 1) {
      setMultipleGestation(true);
    } else {
      setMultipleGestation(false);
      setChorionicity('');
      setAmnionicity('');
    }
  }, [numberOfFetuses]);

  // Calculate BMI when weight/height changes
  useEffect(() => {
    if (prePregnancyWeight && height) {
      const weightKg = parseFloat(prePregnancyWeight);
      const heightCm = parseFloat(height);
      if (!isNaN(weightKg) && !isNaN(heightCm)) {
        const bmiResult = calculateBMI(weightKg, heightCm);
        setBmi(bmiResult);
      }
    }
  }, [prePregnancyWeight, height]);

  // Assess risk factors
  useEffect(() => {
    const age = maternalAge ? parseInt(maternalAge) : undefined;
    const bmiValue = bmi?.bmi;
    const conditions = chronicConditions.split(',').map(c => c.trim()).filter(c => c);

    const assessment = assessHighRiskFactors({
      maternalAge: age,
      bmi: bmiValue,
      previousCesarean,
      previousPreterm,
      multipleGestation,
      chronicConditions: conditions.length > 0 ? conditions : undefined,
      previousLoss,
    });

    setRiskAssessment(assessment);
  }, [maternalAge, bmi, previousCesarean, previousPreterm, multipleGestation, chronicConditions, previousLoss]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!lmp || !gravida || !para) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      await createEpisode({
        patientId,
        specialtySlug: 'ob-gyn',
        status: 'active',
        metadata: {
          lmp,
          edd,
          gravida: parseInt(gravida),
          para: parseInt(para),
          prePregnancyWeight: prePregnancyWeight ? parseFloat(prePregnancyWeight) : undefined,
          height: height ? parseFloat(height) : undefined,
          maternalAge: maternalAge ? parseInt(maternalAge) : undefined,
          bmi: bmi?.bmi,
          bmiCategory: bmi?.category,
          riskFactors: riskAssessment?.riskFactors || [],
          riskLevel: riskAssessment?.riskLevel || 'low',
          isHighRisk: riskAssessment?.isHighRisk || false,
          previousCesarean,
          previousPreterm,
          multipleGestation,
          numberOfFetuses: parseInt(numberOfFetuses) || 1,
          chorionicity: multipleGestation && numberOfFetuses === '2' ? chorionicity : undefined,
          amnionicity: multipleGestation && numberOfFetuses === '2' ? amnionicity : undefined,
          chronicConditions: chronicConditions.split(',').map(c => c.trim()).filter(c => c),
          previousLoss,
          gestationalAgeAtStart: gestationalAge ? {
            weeks: gestationalAge.weeks,
            days: gestationalAge.days,
          } : undefined,
          createdAt: new Date().toISOString(),
        },
      });

      onSuccess?.();
      onOpenChange(false);

      // Reset form
      setLmp('');
      setEdd('');
      setGravida('');
      setPara('');
      setPrePregnancyWeight('');
      setHeight('');
      setMaternalAge('');
      setChronicConditions('');
      setPreviousCesarean(false);
      setPreviousPreterm(false);
      setMultipleGestation(false);
      setNumberOfFetuses('1');
      setChorionicity('');
      setAmnionicity('');
      setPreviousLoss(false);
    } catch (err) {
      console.error('Error creating prenatal episode:', err);
      setError(err instanceof Error ? err.message : 'Failed to create prenatal episode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-600" />
            Start Prenatal Care Episode
          </DialogTitle>
          <DialogDescription>
            Complete the information below to begin tracking this patient's pregnancy.
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

          {/* Pregnancy Dates */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Pregnancy Dates
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lmp" className="required">Last Menstrual Period (LMP)</Label>
                <Input
                  id="lmp"
                  type="date"
                  value={lmp}
                  onChange={(e) => setLmp(e.target.value)}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edd">Estimated Due Date (EDD)</Label>
                <Input
                  id="edd"
                  type="date"
                  value={edd}
                  onChange={(e) => setEdd(e.target.value)}
                  className="mt-1"
                  disabled
                />
                {calculatedEDD && (
                  <p className="text-xs text-gray-500 mt-1">
                    Auto-calculated: {formatDate(calculatedEDD)}
                  </p>
                )}
              </div>
            </div>

            {gestationalAge && (
              <div className="mt-4 p-3 bg-white rounded-md border border-blue-300">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Current Gestational Age:</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatGestationalAge(gestationalAge.weeks, gestationalAge.days)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Obstetric History */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Obstetric History (G/P)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gravida" className="required">Gravida</Label>
                <Input
                  id="gravida"
                  type="number"
                  min="1"
                  value={gravida}
                  onChange={(e) => setGravida(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="Total pregnancies"
                />
                <p className="text-xs text-gray-500 mt-1">Including current pregnancy</p>
              </div>
              <div>
                <Label htmlFor="para" className="required">Para</Label>
                <Input
                  id="para"
                  type="number"
                  min="0"
                  value={para}
                  onChange={(e) => setPara(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="Live births"
                />
                <p className="text-xs text-gray-500 mt-1">Number of live births ≥20 weeks</p>
              </div>
            </div>
          </div>

          {/* Maternal Demographics */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Maternal Demographics & BMI
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="maternalAge">Maternal Age</Label>
                <Input
                  id="maternalAge"
                  type="number"
                  min="10"
                  max="60"
                  value={maternalAge}
                  onChange={(e) => setMaternalAge(e.target.value)}
                  className="mt-1"
                  placeholder="Years"
                />
              </div>
              <div>
                <Label htmlFor="weight">Pre-Pregnancy Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={prePregnancyWeight}
                  onChange={(e) => setPrePregnancyWeight(e.target.value)}
                  className="mt-1"
                  placeholder="kg"
                />
              </div>
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="mt-1"
                  placeholder="cm"
                />
              </div>
            </div>

            {bmi && (
              <div className="mt-4 p-3 bg-white rounded-md border border-green-300">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">BMI:</span>
                  <span className={`text-lg font-bold ${bmi.color}`}>
                    {bmi.bmi} - {bmi.category}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Risk Factors */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Risk Factors Assessment
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={previousCesarean}
                  onChange={(e) => setPreviousCesarean(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Previous cesarean delivery</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={previousPreterm}
                  onChange={(e) => setPreviousPreterm(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">History of preterm birth</span>
              </label>

              <div className="border border-gray-200 rounded-md p-3 bg-white">
                <div className="grid grid-cols-3 gap-3 mb-2">
                  <div>
                    <Label htmlFor="numberOfFetuses" className="text-xs">Number of Fetuses</Label>
                    <select
                      id="numberOfFetuses"
                      value={numberOfFetuses}
                      onChange={(e) => setNumberOfFetuses(e.target.value)}
                      className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                    >
                      <option value="1">Singleton</option>
                      <option value="2">Twins</option>
                      <option value="3">Triplets</option>
                      <option value="4">Quadruplets</option>
                    </select>
                  </div>

                  {multipleGestation && numberOfFetuses === '2' && (
                    <>
                      <div>
                        <Label htmlFor="chorionicity" className="text-xs">Chorionicity</Label>
                        <select
                          id="chorionicity"
                          value={chorionicity}
                          onChange={(e) => setChorionicity(e.target.value as typeof chorionicity)}
                          className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                        >
                          <option value="">Select...</option>
                          <option value="monochorionic">Monochorionic</option>
                          <option value="dichorionic">Dichorionic</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="amnionicity" className="text-xs">Amnionicity</Label>
                        <select
                          id="amnionicity"
                          value={amnionicity}
                          onChange={(e) => setAmnionicity(e.target.value as typeof amnionicity)}
                          className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                        >
                          <option value="">Select...</option>
                          <option value="monoamniotic">Monoamniotic</option>
                          <option value="diamniotic">Diamniotic</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>

                {multipleGestation && (
                  <div className="text-xs bg-blue-50 p-2 rounded border border-blue-200">
                    <div className="font-semibold text-blue-800 mb-1">Multiple Pregnancy Detected</div>
                    <div className="text-blue-700">
                      {numberOfFetuses === '2' && chorionicity && amnionicity && (
                        <span>Type: {chorionicity.replace('chorionic', '')} / {amnionicity.replace('amniotic', '')} twins</span>
                      )}
                      {parseInt(numberOfFetuses) > 2 && (
                        <span>Higher-order multiple pregnancy - Refer to MFM specialist</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={previousLoss}
                  onChange={(e) => setPreviousLoss(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">History of pregnancy loss</span>
              </label>

              <div>
                <Label htmlFor="chronicConditions">Chronic Conditions (comma-separated)</Label>
                <Input
                  id="chronicConditions"
                  value={chronicConditions}
                  onChange={(e) => setChronicConditions(e.target.value)}
                  className="mt-1"
                  placeholder="e.g., Diabetes, Hypertension, Thyroid disorder"
                />
              </div>
            </div>

            {riskAssessment && riskAssessment.riskFactors.length > 0 && (
              <div className={`mt-4 p-3 rounded-md border ${
                riskAssessment.riskLevel === 'high' ? 'bg-red-50 border-red-300' :
                riskAssessment.riskLevel === 'moderate' ? 'bg-yellow-50 border-yellow-300' :
                'bg-green-50 border-green-300'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Risk Level:</span>
                  <span className={`text-sm font-bold uppercase ${
                    riskAssessment.riskLevel === 'high' ? 'text-red-600' :
                    riskAssessment.riskLevel === 'moderate' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {riskAssessment.riskLevel}
                  </span>
                </div>
                <ul className="text-xs space-y-1">
                  {riskAssessment.riskFactors.map((factor: string, i: number) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-orange-600">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
              {loading ? 'Creating Episode...' : 'Start Prenatal Care'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
