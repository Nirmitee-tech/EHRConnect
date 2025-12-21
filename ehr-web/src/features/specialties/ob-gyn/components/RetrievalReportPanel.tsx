'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Syringe, Calendar, Clock, User, FileText, AlertTriangle, CheckCircle,
  Loader2, Save, X, TrendingUp, Info, Activity, Users
} from 'lucide-react';
import { obgynService, IVFRetrieval } from '@/services/obgyn.service';
import { useApiHeaders } from '@/hooks/useApiHeaders';

interface RetrievalReportPanelProps {
  patientId: string;
  cycleId: string;
}

/**
 * RetrievalReportPanel - IVF Egg Retrieval Documentation
 * =======================================================
 * Production-grade retrieval procedure tracking with:
 * - Comprehensive procedure documentation
 * - Trigger timing validation
 * - Oocyte yield tracking with maturity grading
 * - Aspiration quality assessment
 * - Complication tracking
 * - Clinical tooltips throughout
 * - Maturity rate calculator
 * - Visual indicators for procedure difficulty
 */
export function RetrievalReportPanel({ patientId, cycleId }: RetrievalReportPanelProps) {
  const headers = useApiHeaders();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [retrieval, setRetrieval] = useState<IVFRetrieval | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<IVFRetrieval>>({
    retrievalDate: new Date().toISOString().split('T')[0],
    retrievalTime: '',
    triggerDate: '',
    triggerTime: '',
    triggerMedication: '',
    anesthesiaType: 'conscious_sedation',
    anesthesiologist: '',
    rightOvaryFolliclesAspirated: 0,
    leftOvaryFolliclesAspirated: 0,
    aspirationDifficulty: 'easy',
    aspirationNotes: '',
    totalOocytesRetrieved: 0,
    matureOocytes: 0,
    immatureOocytes: 0,
    cumulusQuality: 'good',
    follicularFluidQuality: 'clear',
    complications: [],
    procedureDuration: 0,
    primaryPhysician: '',
    embryologist: '',
    physicianNotes: '',
    embryologistNotes: ''
  });

  useEffect(() => {
    fetchRetrieval();
  }, [cycleId]);

  const fetchRetrieval = async () => {
    if (!headers['x-org-id'] || !headers['x-user-id']) return;

    try {
      setLoading(true);
      const data = await obgynService.getIVFRetrieval(patientId, cycleId, headers);
      if (data) {
        setRetrieval(data);
        setFormData(data);
      } else {
        // No retrieval yet, start in editing mode
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error fetching retrieval:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!headers['x-org-id'] || !headers['x-user-id']) return;

    try {
      setSaving(true);

      if (retrieval) {
        // Update existing retrieval
        const updated = await obgynService.updateIVFRetrieval(
          patientId,
          cycleId,
          retrieval.id,
          formData,
          headers
        );
        setRetrieval(updated);
      } else {
        // Create new retrieval
        const created = await obgynService.createIVFRetrieval(
          patientId,
          cycleId,
          formData,
          headers
        );
        setRetrieval(created);
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving retrieval:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (retrieval) {
      setFormData(retrieval);
      setIsEditing(false);
    }
  };

  // Clinical calculators
  const maturityRate = useMemo(() => {
    const total = formData.totalOocytesRetrieved || 0;
    const mature = formData.matureOocytes || 0;
    return total > 0 ? ((mature / total) * 100).toFixed(1) : '0.0';
  }, [formData.totalOocytesRetrieved, formData.matureOocytes]);

  const triggerToRetrievalHours = useMemo(() => {
    if (!formData.triggerDate || !formData.retrievalDate) return null;

    const triggerDateTime = new Date(`${formData.triggerDate}T${formData.triggerTime || '00:00'}`);
    const retrievalDateTime = new Date(`${formData.retrievalDate}T${formData.retrievalTime || '00:00'}`);
    const hoursDiff = (retrievalDateTime.getTime() - triggerDateTime.getTime()) / (1000 * 60 * 60);

    return hoursDiff.toFixed(1);
  }, [formData.triggerDate, formData.triggerTime, formData.retrievalDate, formData.retrievalTime]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'difficult': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-300';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'fair': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'poor': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Syringe className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900">Retrieval Report</h2>
          {retrieval && (
            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded border border-green-300 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Completed
            </span>
          )}
        </div>
        {retrieval && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            <FileText className="h-4 w-4" />
            Edit Report
          </button>
        )}
      </div>

      {!retrieval && !isEditing ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Syringe className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No retrieval documented yet</p>
          <p className="text-sm text-gray-500 mt-1">Document the egg retrieval procedure when ready</p>
          <button
            onClick={() => setIsEditing(true)}
            className="mt-4 px-4 py-2 bg-primary text-white text-sm rounded-md hover:bg-primary/90"
          >
            Document Retrieval
          </button>
        </div>
      ) : isEditing ? (
        <div className="bg-white border-2 border-primary rounded-lg p-4 space-y-4">
          {/* Procedure Timing Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              Procedure Timing
              <span className="text-xs text-gray-500 font-normal ml-auto">
                Critical for oocyte maturity
              </span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Trigger Date
                  <span className="text-gray-400" title="Date when trigger shot (hCG/Lupron) was administered">
                    <Info className="h-3 w-3" />
                  </span>
                </label>
                <input
                  type="date"
                  value={formData.triggerDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, triggerDate: e.target.value }))}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Trigger Time
                </label>
                <input
                  type="time"
                  value={formData.triggerTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, triggerTime: e.target.value }))}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Retrieval Date
                </label>
                <input
                  type="date"
                  value={formData.retrievalDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, retrievalDate: e.target.value }))}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Retrieval Time
                </label>
                <input
                  type="time"
                  value={formData.retrievalTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, retrievalTime: e.target.value }))}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            {/* Trigger to Retrieval Time Indicator */}
            {triggerToRetrievalHours && (
              <div className={`mt-2 p-2 rounded border text-xs ${
                parseFloat(triggerToRetrievalHours) >= 34 && parseFloat(triggerToRetrievalHours) <= 36
                  ? 'bg-green-50 text-green-700 border-green-300'
                  : 'bg-yellow-50 text-yellow-700 border-yellow-300'
              }`}>
                <div className="flex items-center gap-1">
                  {parseFloat(triggerToRetrievalHours) >= 34 && parseFloat(triggerToRetrievalHours) <= 36 ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  <span className="font-medium">
                    Trigger to Retrieval: {triggerToRetrievalHours} hours
                  </span>
                </div>
                <p className="mt-0.5 text-[10px]">
                  {parseFloat(triggerToRetrievalHours) >= 34 && parseFloat(triggerToRetrievalHours) <= 36
                    ? 'Optimal timing (34-36 hours recommended)'
                    : 'Outside optimal window (34-36 hours recommended)'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Trigger Medication
                  <span className="text-gray-400" title="hCG, Lupron, or dual trigger">
                    <Info className="h-3 w-3" />
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.triggerMedication}
                  onChange={(e) => setFormData(prev => ({ ...prev, triggerMedication: e.target.value }))}
                  placeholder="e.g., Ovidrel 250mcg"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Procedure Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.procedureDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, procedureDuration: parseInt(e.target.value) || 0 }))}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Anesthesia Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              Anesthesia & Personnel
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Anesthesia Type
                </label>
                <select
                  value={formData.anesthesiaType}
                  onChange={(e) => setFormData(prev => ({ ...prev, anesthesiaType: e.target.value as any }))}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                >
                  <option value="conscious_sedation">Conscious Sedation</option>
                  <option value="general">General Anesthesia</option>
                  <option value="local">Local Only</option>
                  <option value="none">None</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Anesthesiologist
                </label>
                <input
                  type="text"
                  value={formData.anesthesiologist}
                  onChange={(e) => setFormData(prev => ({ ...prev, anesthesiologist: e.target.value }))}
                  placeholder="Dr. Name"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Primary Physician
                </label>
                <input
                  type="text"
                  value={formData.primaryPhysician}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryPhysician: e.target.value }))}
                  placeholder="Dr. Name"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Aspiration Details */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Syringe className="h-4 w-4 text-green-600" />
              Aspiration Details
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Right Ovary Follicles
                  <span className="text-gray-400" title="Number of follicles aspirated from right ovary">
                    <Info className="h-3 w-3" />
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.rightOvaryFolliclesAspirated}
                  onChange={(e) => setFormData(prev => ({ ...prev, rightOvaryFolliclesAspirated: parseInt(e.target.value) || 0 }))}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Left Ovary Follicles
                </label>
                <input
                  type="number"
                  value={formData.leftOvaryFolliclesAspirated}
                  onChange={(e) => setFormData(prev => ({ ...prev, leftOvaryFolliclesAspirated: parseInt(e.target.value) || 0 }))}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Aspiration Difficulty
                </label>
                <select
                  value={formData.aspirationDifficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, aspirationDifficulty: e.target.value as any }))}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                >
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="difficult">Difficult</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Embryologist
                </label>
                <input
                  type="text"
                  value={formData.embryologist}
                  onChange={(e) => setFormData(prev => ({ ...prev, embryologist: e.target.value }))}
                  placeholder="Name"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Aspiration Notes
              </label>
              <textarea
                value={formData.aspirationNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, aspirationNotes: e.target.value }))}
                rows={2}
                placeholder="Technical notes about the aspiration procedure..."
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Oocyte Yield */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              Oocyte Yield & Quality
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Total Oocytes Retrieved
                </label>
                <input
                  type="number"
                  value={formData.totalOocytesRetrieved}
                  onChange={(e) => {
                    const total = parseInt(e.target.value) || 0;
                    setFormData(prev => ({
                      ...prev,
                      totalOocytesRetrieved: total,
                      immatureOocytes: total - (prev.matureOocytes || 0)
                    }));
                  }}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Mature (MII)
                  <span className="text-gray-400" title="Metaphase II - ready for fertilization">
                    <Info className="h-3 w-3" />
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.matureOocytes}
                  onChange={(e) => {
                    const mature = parseInt(e.target.value) || 0;
                    setFormData(prev => ({
                      ...prev,
                      matureOocytes: mature,
                      immatureOocytes: (prev.totalOocytesRetrieved || 0) - mature
                    }));
                  }}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Immature (MI/GV)
                  <span className="text-gray-400" title="Metaphase I or Germinal Vesicle">
                    <Info className="h-3 w-3" />
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.immatureOocytes}
                  readOnly
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-gray-50 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            {/* Maturity Rate Indicator */}
            <div className={`mt-2 p-3 rounded border ${
              parseFloat(maturityRate) >= 80
                ? 'bg-green-50 border-green-300'
                : parseFloat(maturityRate) >= 60
                ? 'bg-yellow-50 border-yellow-300'
                : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${
                  parseFloat(maturityRate) >= 80
                    ? 'text-green-900'
                    : parseFloat(maturityRate) >= 60
                    ? 'text-yellow-900'
                    : 'text-red-900'
                }`}>
                  Maturity Rate: {maturityRate}%
                </span>
                <span className="text-xs text-gray-600">
                  {parseFloat(maturityRate) >= 80 ? 'Excellent' : parseFloat(maturityRate) >= 60 ? 'Good' : 'Below Expected'}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Expected: 70-85% | Your result: {formData.matureOocytes}/{formData.totalOocytesRetrieved}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Cumulus Quality
                  <span className="text-gray-400" title="Quality of cumulus cells surrounding oocytes">
                    <Info className="h-3 w-3" />
                  </span>
                </label>
                <select
                  value={formData.cumulusQuality}
                  onChange={(e) => setFormData(prev => ({ ...prev, cumulusQuality: e.target.value as any }))}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Follicular Fluid Quality
                  <span className="text-gray-400" title="Appearance of follicular fluid during aspiration">
                    <Info className="h-3 w-3" />
                  </span>
                </label>
                <select
                  value={formData.follicularFluidQuality}
                  onChange={(e) => setFormData(prev => ({ ...prev, follicularFluidQuality: e.target.value as any }))}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                >
                  <option value="clear">Clear</option>
                  <option value="bloody">Bloody</option>
                  <option value="cloudy">Cloudy</option>
                </select>
              </div>
            </div>
          </div>

          {/* Clinical Notes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-600" />
              Clinical Notes
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Physician Notes
                </label>
                <textarea
                  value={formData.physicianNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, physicianNotes: e.target.value }))}
                  rows={3}
                  placeholder="Clinical observations, complications, patient tolerance..."
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Embryologist Notes
                </label>
                <textarea
                  value={formData.embryologistNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, embryologistNotes: e.target.value }))}
                  rows={3}
                  placeholder="Oocyte quality observations, lab conditions, special handling..."
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formData.totalOocytesRetrieved}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Retrieval Report
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        // View Mode - Display saved retrieval
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <p className="text-xs text-purple-600 font-medium mb-1">Total Retrieved</p>
              <p className="text-2xl font-bold text-purple-900">{retrieval.totalOocytesRetrieved}</p>
              <p className="text-xs text-purple-700">oocytes</p>
            </div>

            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs text-green-600 font-medium mb-1">Mature (MII)</p>
              <p className="text-2xl font-bold text-green-900">{retrieval.matureOocytes || 0}</p>
              <p className="text-xs text-green-700">{maturityRate}% maturity</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-600 font-medium mb-1">Procedure Time</p>
              <p className="text-2xl font-bold text-blue-900">{retrieval.procedureDuration || 0}</p>
              <p className="text-xs text-blue-700">minutes</p>
            </div>

            <div className={`rounded-lg p-3 border ${getDifficultyColor(retrieval.aspirationDifficulty || 'easy')}`}>
              <p className="text-xs font-medium mb-1">Difficulty</p>
              <p className="text-lg font-bold capitalize">{retrieval.aspirationDifficulty || 'Easy'}</p>
              <p className="text-xs">aspiration</p>
            </div>
          </div>

          {/* Detailed Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">Retrieval Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(retrieval.retrievalDate).toLocaleDateString()}
                  {retrieval.retrievalTime && ` at ${retrieval.retrievalTime}`}
                </p>
              </div>

              {retrieval.triggerDate && (
                <div>
                  <p className="text-xs text-gray-500">Trigger</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(retrieval.triggerDate).toLocaleDateString()}
                    {retrieval.triggerTime && ` at ${retrieval.triggerTime}`}
                  </p>
                  <p className="text-xs text-gray-600">{retrieval.triggerMedication}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500">Anesthesia</p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {retrieval.anesthesiaType?.replace('_', ' ')}
                </p>
                {retrieval.anesthesiologist && (
                  <p className="text-xs text-gray-600">{retrieval.anesthesiologist}</p>
                )}
              </div>

              <div>
                <p className="text-xs text-gray-500">Follicles Aspirated</p>
                <p className="text-sm font-medium text-gray-900">
                  R: {retrieval.rightOvaryFolliclesAspirated || 0} | L: {retrieval.leftOvaryFolliclesAspirated || 0}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Cumulus Quality</p>
                <span className={`inline-block px-2 py-0.5 text-xs rounded border ${getQualityColor(retrieval.cumulusQuality || 'good')}`}>
                  {retrieval.cumulusQuality || 'N/A'}
                </span>
              </div>

              <div>
                <p className="text-xs text-gray-500">Follicular Fluid</p>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {retrieval.follicularFluidQuality || 'N/A'}
                </span>
              </div>
            </div>

            {retrieval.physicianNotes && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-1">Physician Notes</p>
                <p className="text-sm text-gray-600">{retrieval.physicianNotes}</p>
              </div>
            )}

            {retrieval.embryologistNotes && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-1">Embryologist Notes</p>
                <p className="text-sm text-gray-600">{retrieval.embryologistNotes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
