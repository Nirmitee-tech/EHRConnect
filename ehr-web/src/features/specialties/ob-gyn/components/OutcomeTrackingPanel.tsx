'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Save, Plus, AlertCircle, Info, TrendingUp, Calendar, Heart, Baby } from 'lucide-react';
import {
  getIVFPregnancyOutcome,
  createIVFPregnancyOutcome,
  updateIVFPregnancyOutcome,
  type IVFPregnancyOutcome
} from '@/services/obgyn.service';

interface OutcomeTrackingPanelProps {
  patientId: string;
  cycleId: string;
}

export default function OutcomeTrackingPanel({ patientId, cycleId }: OutcomeTrackingPanelProps) {
  const [outcome, setOutcome] = useState<IVFPregnancyOutcome | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'beta' | 'ultrasound' | 'outcome'>('beta');

  const [formData, setFormData] = useState<Partial<IVFPregnancyOutcome>>({
    transferId: '',
    betaHcgSeries: [],
    firstBetaDate: '',
    firstBetaValue: undefined,
    secondBetaDate: '',
    secondBetaValue: undefined,
    doublingTimeHours: undefined,
    ultrasounds: [],
    outcome: 'pending',
    notes: ''
  });

  useEffect(() => {
    loadOutcome();
  }, [patientId, cycleId]);

  const loadOutcome = async () => {
    try {
      const data = await getIVFPregnancyOutcome(patientId, cycleId);
      if (data) {
        setOutcome(data);
        setFormData(data);
      }
    } catch (err) {
      console.error('Error loading outcome:', err);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      if (outcome?.id) {
        await updateIVFPregnancyOutcome(patientId, cycleId, outcome.id, formData);
      } else {
        await createIVFPregnancyOutcome(patientId, cycleId, formData);
      }

      await loadOutcome();
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error saving outcome:', err);
      setError(err.message || 'Failed to save outcome record');
    } finally {
      setIsSaving(false);
    }
  };

  const updateFormField = (field: keyof IVFPregnancyOutcome, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate doubling time from first and second beta
  const calculateDoublingTime = useMemo(() => {
    if (!formData.firstBetaDate || !formData.firstBetaValue ||
        !formData.secondBetaDate || !formData.secondBetaValue) {
      return null;
    }

    const date1 = new Date(formData.firstBetaDate);
    const date2 = new Date(formData.secondBetaDate);
    const hoursDiff = (date2.getTime() - date1.getTime()) / (1000 * 60 * 60);

    if (hoursDiff <= 0) return null;

    const doublingTime = (hoursDiff * Math.log(2)) / Math.log(formData.secondBetaValue / formData.firstBetaValue);
    return doublingTime.toFixed(1);
  }, [formData.firstBetaDate, formData.firstBetaValue, formData.secondBetaDate, formData.secondBetaValue]);

  // Beta hCG interpretation
  const betaInterpretation = useMemo(() => {
    if (!formData.firstBetaValue) return null;

    const value = formData.firstBetaValue;

    if (value < 5) {
      return { status: 'negative', color: 'red', message: 'Negative - Not pregnant' };
    } else if (value >= 5 && value < 25) {
      return { status: 'borderline', color: 'yellow', message: 'Borderline - Repeat in 48-72 hours' };
    } else if (value >= 25 && value < 100) {
      return { status: 'positive', color: 'green', message: 'Positive - Early pregnancy confirmed' };
    } else if (value >= 100 && value < 300) {
      return { status: 'strong', color: 'green', message: 'Strong positive - Excellent for early pregnancy' };
    } else {
      return { status: 'very_strong', color: 'green', message: 'Very strong positive - Twins possible' };
    }
  }, [formData.firstBetaValue]);

  // Doubling time interpretation
  const doublingInterpretation = useMemo(() => {
    if (!calculateDoublingTime) return null;

    const hours = parseFloat(calculateDoublingTime);

    if (hours < 24) {
      return { status: 'fast', color: 'green', message: '✓ Excellent doubling time' };
    } else if (hours >= 24 && hours <= 48) {
      return { status: 'optimal', color: 'green', message: '✓ Optimal doubling time (24-48h)' };
    } else if (hours > 48 && hours <= 72) {
      return { status: 'slow', color: 'yellow', message: 'Slower than optimal - monitor closely' };
    } else {
      return { status: 'concerning', color: 'red', message: 'Concerning - may indicate non-viable pregnancy' };
    }
  }, [calculateDoublingTime]);

  const addBetaEntry = () => {
    const newEntry = {
      date: new Date().toISOString().split('T')[0],
      value: 0,
      dpo: undefined,
      interpretation: ''
    };
    updateFormField('betaHcgSeries', [...(formData.betaHcgSeries || []), newEntry]);
  };

  const updateBetaEntry = (index: number, field: string, value: any) => {
    const series = [...(formData.betaHcgSeries || [])];
    series[index] = { ...series[index], [field]: value };
    updateFormField('betaHcgSeries', series);
  };

  const removeBetaEntry = (index: number) => {
    const series = [...(formData.betaHcgSeries || [])];
    series.splice(index, 1);
    updateFormField('betaHcgSeries', series);
  };

  const addUltrasound = () => {
    const newUS = {
      date: new Date().toISOString().split('T')[0],
      gestationalAge: '',
      gestationalSacs: 0,
      yolkSacs: 0,
      fetalPoles: 0,
      heartbeatDetected: false,
      heartbeatBpm: undefined,
      crlMm: undefined,
      notes: ''
    };
    updateFormField('ultrasounds', [...(formData.ultrasounds || []), newUS]);
  };

  const updateUltrasound = (index: number, field: string, value: any) => {
    const ultrasounds = [...(formData.ultrasounds || [])];
    ultrasounds[index] = { ...ultrasounds[index], [field]: value };
    updateFormField('ultrasounds', ultrasounds);
  };

  const removeUltrasound = (index: number) => {
    const ultrasounds = [...(formData.ultrasounds || [])];
    ultrasounds.splice(index, 1);
    updateFormField('ultrasounds', ultrasounds);
  };

  if (!isEditing && !outcome) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Pregnancy Outcome Tracking</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Start Tracking
          </button>
        </div>
        <p className="text-sm text-gray-500 text-center py-8">
          No outcome data yet. Start tracking when beta hCG results are available.
        </p>
      </div>
    );
  }

  if (!isEditing && outcome) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Pregnancy Outcome</h3>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Edit
          </button>
        </div>

        {/* Outcome Status */}
        <div className="mb-6">
          <div className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
            outcome.outcome === 'live_birth' ? 'bg-green-100 text-green-800' :
            outcome.outcome === 'clinical_pregnancy' ? 'bg-blue-100 text-blue-800' :
            outcome.outcome === 'ongoing' ? 'bg-purple-100 text-purple-800' :
            outcome.outcome === 'biochemical' ? 'bg-yellow-100 text-yellow-800' :
            outcome.outcome === 'miscarriage' || outcome.outcome === 'ectopic' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {outcome.outcome?.replace('_', ' ').toUpperCase() || 'PENDING'}
          </div>
        </div>

        {/* Beta hCG Summary */}
        {outcome.firstBetaValue && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Beta hCG Results</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">First Beta ({outcome.firstBetaDate}):</span>
                <span className="ml-2 font-semibold">{outcome.firstBetaValue} mIU/mL</span>
              </div>
              {outcome.secondBetaValue && (
                <>
                  <div>
                    <span className="text-gray-600">Second Beta ({outcome.secondBetaDate}):</span>
                    <span className="ml-2 font-semibold">{outcome.secondBetaValue} mIU/mL</span>
                  </div>
                  {outcome.doublingTimeHours && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Doubling Time:</span>
                      <span className="ml-2 font-semibold">{outcome.doublingTimeHours.toFixed(1)} hours</span>
                      {outcome.doublingTimeHours >= 24 && outcome.doublingTimeHours <= 48 && (
                        <span className="ml-2 text-green-600">✓ Optimal</span>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Ultrasound Summary */}
        {outcome.ultrasounds && outcome.ultrasounds.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Ultrasound Milestones</h4>
            <div className="space-y-2">
              {outcome.ultrasounds.map((us, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-purple-50 rounded">
                  <Heart className={`h-5 w-5 mt-0.5 ${us.heartbeatDetected ? 'text-red-600 fill-current' : 'text-gray-400'}`} />
                  <div className="flex-1 text-sm">
                    <div className="font-medium text-gray-900">
                      {us.date} - {us.gestationalAge || 'Week ?'}
                    </div>
                    <div className="text-gray-600 mt-1">
                      {us.gestationalSacs > 0 && <span>GS: {us.gestationalSacs} </span>}
                      {us.yolkSacs > 0 && <span>YS: {us.yolkSacs} </span>}
                      {us.fetalPoles > 0 && <span>FP: {us.fetalPoles} </span>}
                      {us.heartbeatDetected && <span className="text-red-600 font-medium">❤️ {us.heartbeatBpm} bpm</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {outcome.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-700">
            <span className="font-medium">Notes:</span> {outcome.notes}
          </div>
        )}
      </div>
    );
  }

  // Edit Mode
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pregnancy Outcome Tracking</h3>
            <p className="text-sm text-gray-600 mt-1">
              Track beta hCG series, ultrasound milestones & pregnancy outcome
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Outcome'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-900">Error</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 px-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('beta')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'beta'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <TrendingUp className="h-4 w-4 inline mr-2" />
            Beta hCG Series
          </button>
          <button
            onClick={() => setActiveTab('ultrasound')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'ultrasound'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Heart className="h-4 w-4 inline mr-2" />
            Ultrasound Milestones
          </button>
          <button
            onClick={() => setActiveTab('outcome')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'outcome'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Baby className="h-4 w-4 inline mr-2" />
            Final Outcome
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* BETA HCG TAB */}
        {activeTab === 'beta' && (
          <div className="space-y-6">
            {/* Quick Entry - First & Second Beta */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Quick Entry - Beta hCG Tracking</h4>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">First Beta Date</label>
                  <input
                    type="date"
                    value={formData.firstBetaDate || ''}
                    onChange={(e) => updateFormField('firstBetaDate', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">First Beta Value (mIU/mL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.firstBetaValue || ''}
                    onChange={(e) => updateFormField('firstBetaValue', parseFloat(e.target.value) || undefined)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {betaInterpretation && (
                <div className={`mb-4 p-3 rounded-lg ${
                  betaInterpretation.color === 'green' ? 'bg-green-100 text-green-800' :
                  betaInterpretation.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  <p className="text-sm font-medium">{betaInterpretation.message}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Second Beta Date</label>
                  <input
                    type="date"
                    value={formData.secondBetaDate || ''}
                    onChange={(e) => updateFormField('secondBetaDate', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Second Beta Value (mIU/mL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.secondBetaValue || ''}
                    onChange={(e) => updateFormField('secondBetaValue', parseFloat(e.target.value) || undefined)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {calculateDoublingTime && (
                <div className="mt-4 p-3 bg-white rounded border border-blue-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Doubling Time: {calculateDoublingTime} hours
                      </p>
                      {doublingInterpretation && (
                        <p className={`text-xs mt-1 ${
                          doublingInterpretation.color === 'green' ? 'text-green-600' :
                          doublingInterpretation.color === 'yellow' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {doublingInterpretation.message}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      Optimal: 24-48 hours
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Beta Series */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">Additional Beta Values (Optional)</h4>
                <button
                  onClick={addBetaEntry}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90"
                >
                  <Plus className="h-3 w-3" />
                  Add Beta
                </button>
              </div>

              {formData.betaHcgSeries && formData.betaHcgSeries.length > 0 && (
                <div className="space-y-3">
                  {formData.betaHcgSeries.map((beta, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                      <Calendar className="h-4 w-4 text-gray-400 mt-2" />
                      <div className="flex-1 grid grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Date</label>
                          <input
                            type="date"
                            value={beta.date}
                            onChange={(e) => updateBetaEntry(idx, 'date', e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Value (mIU/mL)</label>
                          <input
                            type="number"
                            value={beta.value}
                            onChange={(e) => updateBetaEntry(idx, 'value', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">DPO</label>
                          <input
                            type="number"
                            value={beta.dpo || ''}
                            onChange={(e) => updateBetaEntry(idx, 'dpo', parseInt(e.target.value) || undefined)}
                            placeholder="e.g., 10"
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => removeBetaEntry(idx)}
                            className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Next Steps Guidance */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-green-900 mb-2">✅ Next Steps</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Schedule OB ultrasound at 6-7 weeks gestation</li>
                <li>• Look for: Gestational sac, yolk sac, fetal pole, cardiac activity</li>
                <li>• Continue all medications until instructed otherwise (typically 10-12 weeks)</li>
              </ul>
            </div>
          </div>
        )}

        {/* ULTRASOUND TAB */}
        {activeTab === 'ultrasound' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Early Pregnancy Ultrasounds</h4>
                <p className="text-xs text-gray-600 mt-1">Track milestones week by week</p>
              </div>
              <button
                onClick={addUltrasound}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90"
              >
                <Plus className="h-3 w-3" />
                Add Ultrasound
              </button>
            </div>

            {formData.ultrasounds && formData.ultrasounds.length > 0 ? (
              <div className="space-y-4">
                {formData.ultrasounds.map((us, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          value={us.date}
                          onChange={(e) => updateUltrasound(idx, 'date', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Gestational Age</label>
                        <input
                          type="text"
                          value={us.gestationalAge || ''}
                          onChange={(e) => updateUltrasound(idx, 'gestationalAge', e.target.value)}
                          placeholder="e.g., 6w2d"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Gestational Sacs</label>
                        <input
                          type="number"
                          value={us.gestationalSacs || 0}
                          onChange={(e) => updateUltrasound(idx, 'gestationalSacs', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Yolk Sacs</label>
                        <input
                          type="number"
                          value={us.yolkSacs || 0}
                          onChange={(e) => updateUltrasound(idx, 'yolkSacs', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Fetal Poles</label>
                        <input
                          type="number"
                          value={us.fetalPoles || 0}
                          onChange={(e) => updateUltrasound(idx, 'fetalPoles', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1">
                          <input
                            type="checkbox"
                            checked={us.heartbeatDetected || false}
                            onChange={(e) => updateUltrasound(idx, 'heartbeatDetected', e.target.checked)}
                            className="w-4 h-4 text-primary border-gray-300 rounded"
                          />
                          Heartbeat Detected
                        </label>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Heart Rate (BPM)</label>
                        <input
                          type="number"
                          value={us.heartbeatBpm || ''}
                          onChange={(e) => updateUltrasound(idx, 'heartbeatBpm', parseInt(e.target.value) || undefined)}
                          disabled={!us.heartbeatDetected}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">CRL (mm)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={us.crlMm || ''}
                          onChange={(e) => updateUltrasound(idx, 'crlMm', parseFloat(e.target.value) || undefined)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={us.notes || ''}
                        onChange={(e) => updateUltrasound(idx, 'notes', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      />
                    </div>

                    <button
                      onClick={() => removeUltrasound(idx)}
                      className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded"
                    >
                      Remove Ultrasound
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-gray-500">
                No ultrasounds recorded. Click "Add Ultrasound" to track pregnancy milestones.
              </div>
            )}

            {/* Milestone Guidance */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-purple-900 mb-2">📋 Early Pregnancy Milestones</h4>
              <div className="text-xs text-purple-800 space-y-2">
                <div><strong>Week 5:</strong> Gestational sac visible (~5mm), yolk sac may be seen</div>
                <div><strong>Week 6:</strong> Fetal pole visible (~3mm CRL), cardiac activity 110-120 bpm ✓</div>
                <div><strong>Week 7-8:</strong> CRL 10-15mm, heart rate 140-170 bpm, viability confirmed</div>
                <div><strong>Week 8-10:</strong> Graduate to OB care - Congratulations! 🎉</div>
              </div>
            </div>
          </div>
        )}

        {/* OUTCOME TAB */}
        {activeTab === 'outcome' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pregnancy Outcome</label>
              <select
                value={formData.outcome || 'pending'}
                onChange={(e) => updateFormField('outcome', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              >
                <option value="pending">Pending</option>
                <option value="ongoing">Ongoing Pregnancy</option>
                <option value="biochemical">Biochemical Pregnancy</option>
                <option value="clinical_pregnancy">Clinical Pregnancy</option>
                <option value="miscarriage">Miscarriage</option>
                <option value="ectopic">Ectopic Pregnancy</option>
                <option value="live_birth">Live Birth 🎉</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Outcome Date</label>
                <input
                  type="date"
                  value={formData.outcomeDate || ''}
                  onChange={(e) => updateFormField('outcomeDate', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gestational Age at Outcome</label>
                <input
                  type="text"
                  value={formData.gestationalAgeAtOutcome || ''}
                  onChange={(e) => updateFormField('gestationalAgeAtOutcome', e.target.value)}
                  placeholder="e.g., 8w3d"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Clinical Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => updateFormField('notes', e.target.value)}
                rows={4}
                placeholder="Clinical observations, follow-up plan, patient counseling notes..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
