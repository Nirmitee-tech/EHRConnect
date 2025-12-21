'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity, Plus, Calendar, TrendingUp, AlertTriangle, CheckCircle,
  Loader2, Save, X, Edit2, Trash2, Target, Zap, Clock
} from 'lucide-react';
import { obgynService } from '@/services/obgyn.service';
import { useApiHeaders } from '@/hooks/useApiHeaders';

interface StimulationMonitoringPanelProps {
  patientId: string;
  cycleId: string;
}

interface MonitoringRecord {
  id: string;
  cycleId: string;
  patientId: string;
  monitoringDate: string;
  stimDay: number;
  folliclesRight: number[];
  folliclesLeft: number[];
  estradiolPgMl: number | null;
  lhMiuMl: number | null;
  progesteroneNgMl: number | null;
  endometrialThicknessMm: number | null;
  endometrialPattern: 'trilaminar' | 'homogeneous' | 'irregular' | null;
  medicationChanges: Array<{ medication: string; dosage: string; reason: string }>;
  assessment: string;
  plan: string;
  triggerReady: boolean;
  ohssRiskLevel: 'low' | 'moderate' | 'high' | 'critical' | null;
}

/**
 * StimulationMonitoringPanel - IVF Daily Monitoring
 * =================================================
 * Clinical-grade daily stimulation tracking:
 * - Follicle size measurements (bilateral)
 * - Serial hormone tracking (E2, LH, P4)
 * - Endometrial assessment
 * - OHSS risk calculation
 * - Trigger readiness scoring
 */
export function StimulationMonitoringPanel({ patientId, cycleId }: StimulationMonitoringPanelProps) {
  const headers = useApiHeaders();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [records, setRecords] = useState<MonitoringRecord[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MonitoringRecord | null>(null);

  // Form state for new/editing record
  const [formData, setFormData] = useState<Partial<MonitoringRecord>>({
    monitoringDate: new Date().toISOString().split('T')[0],
    stimDay: 1,
    folliclesRight: [],
    folliclesLeft: [],
    estradiolPgMl: null,
    lhMiuMl: null,
    progesteroneNgMl: null,
    endometrialThicknessMm: null,
    endometrialPattern: null,
    medicationChanges: [],
    assessment: '',
    plan: '',
    triggerReady: false,
    ohssRiskLevel: null
  });

  useEffect(() => {
    fetchRecords();
  }, [cycleId]);

  const fetchRecords = async () => {
    if (!headers['x-org-id'] || !headers['x-user-id']) return;

    try {
      setLoading(true);
      const data = await obgynService.getIVFMonitoring(patientId, cycleId, headers);
      setRecords(data.records || []);
    } catch (error) {
      console.error('Error fetching monitoring records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!headers['x-org-id'] || !headers['x-user-id']) return;

    try {
      setSaving(true);

      if (editingRecord) {
        // Update existing record
        await obgynService.updateIVFMonitoring(
          patientId,
          cycleId,
          editingRecord.id,
          formData,
          headers
        );
      } else {
        // Create new record
        await obgynService.createIVFMonitoring(
          patientId,
          cycleId,
          formData,
          headers
        );
      }

      await fetchRecords();
      resetForm();
    } catch (error) {
      console.error('Error saving monitoring record:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (recordId: string) => {
    if (!confirm('Delete this monitoring record?')) return;

    try {
      await obgynService.deleteIVFMonitoring(patientId, cycleId, recordId, headers);
      await fetchRecords();
    } catch (error) {
      console.error('Error deleting monitoring record:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      monitoringDate: new Date().toISOString().split('T')[0],
      stimDay: records.length + 1,
      folliclesRight: [],
      folliclesLeft: [],
      estradiolPgMl: null,
      lhMiuMl: null,
      progesteroneNgMl: null,
      endometrialThicknessMm: null,
      endometrialPattern: null,
      medicationChanges: [],
      assessment: '',
      plan: '',
      triggerReady: false,
      ohssRiskLevel: null
    });
    setEditingRecord(null);
    setShowAddForm(false);
  };

  const calculateOHSSRisk = (record: Partial<MonitoringRecord>): 'low' | 'moderate' | 'high' | 'critical' => {
    const totalFollicles = (record.folliclesRight?.length || 0) + (record.folliclesLeft?.length || 0);
    const e2 = record.estradiolPgMl || 0;

    // OHSS Risk Algorithm (simplified clinical criteria)
    if (e2 > 5000 || totalFollicles > 25) return 'critical';
    if (e2 > 3500 || totalFollicles > 20) return 'high';
    if (e2 > 2500 || totalFollicles > 15) return 'moderate';
    return 'low';
  };

  const assessTriggerReadiness = (record: Partial<MonitoringRecord>): boolean => {
    const leadFollicles = [
      ...(record.folliclesRight || []),
      ...(record.folliclesLeft || [])
    ].filter(size => size >= 18);

    // Trigger criteria: ≥3 follicles ≥18mm
    return leadFollicles.length >= 3;
  };

  const getOHSSColor = (level: string | null) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  // Add follicle measurement
  const addFollicle = (side: 'right' | 'left', size: number) => {
    const key = side === 'right' ? 'folliclesRight' : 'folliclesLeft';
    setFormData(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), size].sort((a, b) => b - a) // Sort descending
    }));
  };

  const removeFollicle = (side: 'right' | 'left', index: number) => {
    const key = side === 'right' ? 'folliclesRight' : 'folliclesLeft';
    setFormData(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter((_, i) => i !== index)
    }));
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
          <Activity className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-900">Stimulation Monitoring</h2>
          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
            {records.length} visits
          </span>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Visit
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingRecord) && (
        <div className="bg-white border-2 border-primary rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              {editingRecord ? 'Edit Monitoring Record' : 'New Monitoring Record'}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Date and Stim Day */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Visit Date
              </label>
              <input
                type="date"
                value={formData.monitoringDate}
                onChange={(e) => setFormData(prev => ({ ...prev, monitoringDate: e.target.value }))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Stim Day
              </label>
              <input
                type="number"
                value={formData.stimDay}
                onChange={(e) => setFormData(prev => ({ ...prev, stimDay: parseInt(e.target.value) }))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Endometrial (mm)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.endometrialThicknessMm || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, endometrialThicknessMm: parseFloat(e.target.value) || null }))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Follicle Measurements */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Right Ovary Follicles (mm)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="number"
                  placeholder="Size (mm)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const size = parseInt((e.target as HTMLInputElement).value);
                      if (size > 0) {
                        addFollicle('right', size);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {(formData.folliclesRight || []).map((size, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded"
                  >
                    {size}mm
                    <button
                      onClick={() => removeFollicle('right', idx)}
                      className="hover:text-purple-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Total: {(formData.folliclesRight || []).length} follicles
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Left Ovary Follicles (mm)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="number"
                  placeholder="Size (mm)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const size = parseInt((e.target as HTMLInputElement).value);
                      if (size > 0) {
                        addFollicle('left', size);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                  className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                {(formData.folliclesLeft || []).map((size, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-pink-100 text-pink-800 rounded"
                  >
                    {size}mm
                    <button
                      onClick={() => removeFollicle('left', idx)}
                      className="hover:text-pink-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Total: {(formData.folliclesLeft || []).length} follicles
              </p>
            </div>
          </div>

          {/* Hormone Levels */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Estradiol (pg/mL)
              </label>
              <input
                type="number"
                value={formData.estradiolPgMl || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, estradiolPgMl: parseFloat(e.target.value) || null }))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                LH (mIU/mL)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.lhMiuMl || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, lhMiuMl: parseFloat(e.target.value) || null }))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Progesterone (ng/mL)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.progesteroneNgMl || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, progesteroneNgMl: parseFloat(e.target.value) || null }))}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Clinical Assessment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Assessment
              </label>
              <textarea
                value={formData.assessment}
                onChange={(e) => setFormData(prev => ({ ...prev, assessment: e.target.value }))}
                rows={3}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                placeholder="Clinical assessment notes..."
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Plan
              </label>
              <textarea
                value={formData.plan}
                onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value }))}
                rows={3}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                placeholder="Management plan..."
              />
            </div>
          </div>

          {/* Auto-calculated indicators */}
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded border border-gray-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">OHSS Risk:</span>
              <span className={`px-2 py-0.5 text-xs rounded border ${getOHSSColor(calculateOHSSRisk(formData))}`}>
                {calculateOHSSRisk(formData).toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Trigger Ready:</span>
              <span className={`px-2 py-0.5 text-xs rounded border ${
                assessTriggerReadiness(formData)
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-gray-100 text-gray-600 border-gray-300'
              }`}>
                {assessTriggerReadiness(formData) ? 'YES' : 'NO'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
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
                  Save Record
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Monitoring Timeline */}
      <div className="space-y-2">
        {records.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No monitoring visits yet</p>
            <p className="text-sm text-gray-500 mt-1">Add your first monitoring visit to start tracking</p>
          </div>
        ) : (
          records.map((record, idx) => (
            <div
              key={record.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 text-primary rounded-full font-semibold">
                    D{record.stimDay}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(record.monitoringDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Stim Day {record.stimDay}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {record.triggerReady && (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded border border-green-300">
                      <Zap className="h-3 w-3" />
                      Ready
                    </span>
                  )}
                  {record.ohssRiskLevel && record.ohssRiskLevel !== 'low' && (
                    <span className={`px-2 py-1 text-xs rounded border ${getOHSSColor(record.ohssRiskLevel)}`}>
                      OHSS: {record.ohssRiskLevel}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setEditingRecord(record);
                      setFormData(record);
                      setShowAddForm(false);
                    }}
                    className="p-1 text-gray-400 hover:text-primary"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-3">
                {/* Follicle Summary */}
                <div className="bg-purple-50 rounded p-2 border border-purple-200">
                  <p className="text-xs text-purple-600 font-medium mb-1">Right Follicles</p>
                  <p className="text-lg font-bold text-purple-900">{record.folliclesRight.length}</p>
                  <p className="text-xs text-purple-700">
                    Lead: {Math.max(...record.folliclesRight, 0)}mm
                  </p>
                </div>

                <div className="bg-pink-50 rounded p-2 border border-pink-200">
                  <p className="text-xs text-pink-600 font-medium mb-1">Left Follicles</p>
                  <p className="text-lg font-bold text-pink-900">{record.folliclesLeft.length}</p>
                  <p className="text-xs text-pink-700">
                    Lead: {Math.max(...record.folliclesLeft, 0)}mm
                  </p>
                </div>

                <div className="bg-blue-50 rounded p-2 border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium mb-1">Estradiol</p>
                  <p className="text-lg font-bold text-blue-900">
                    {record.estradiolPgMl || '--'}
                  </p>
                  <p className="text-xs text-blue-700">pg/mL</p>
                </div>

                <div className="bg-green-50 rounded p-2 border border-green-200">
                  <p className="text-xs text-green-600 font-medium mb-1">Endometrium</p>
                  <p className="text-lg font-bold text-green-900">
                    {record.endometrialThicknessMm || '--'}
                  </p>
                  <p className="text-xs text-green-700">mm</p>
                </div>
              </div>

              {record.assessment && (
                <div className="text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">Assessment:</span> {record.assessment}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
