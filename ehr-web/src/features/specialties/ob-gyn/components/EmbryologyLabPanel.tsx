'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Microscope, Plus, Calendar, TrendingUp, AlertTriangle, CheckCircle,
  Loader2, Save, X, Edit2, Trash2, Info, Activity, Snowflake,
  Target, Zap, Clock, ChevronDown, ChevronRight
} from 'lucide-react';
import { obgynService, IVFEmbryoDevelopment } from '@/services/obgyn.service';
import { useApiHeaders } from '@/hooks/useApiHeaders';

interface EmbryologyLabPanelProps {
  patientId: string;
  cycleId: string;
}

/**
 * EmbryologyLabPanel - Day-by-Day Embryo Development Tracking
 * ===========================================================
 * World-class embryology lab interface with:
 * - Day 1-7 embryo tracking with clinical grading
 * - Blastocyst scoring (Gardner classification)
 * - Visual quality indicators
 * - Fertilization & blastulation calculators
 * - Culture condition tracking
 * - PGT-A biopsy documentation
 * - Final disposition tracking
 * - Comprehensive clinical tooltips
 */
export function EmbryologyLabPanel({ patientId, cycleId }: EmbryologyLabPanelProps) {
  const headers = useApiHeaders();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [embryos, setEmbryos] = useState<IVFEmbryoDevelopment[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmbryo, setEditingEmbryo] = useState<IVFEmbryoDevelopment | null>(null);
  const [expandedEmbryos, setExpandedEmbryos] = useState<Record<string, boolean>>({});
  const [activeDay, setActiveDay] = useState<number>(1);

  // Form state
  const [formData, setFormData] = useState<Partial<IVFEmbryoDevelopment>>({
    embryoNumber: 0,
    // Day 1
    day1CheckTime: '',
    day1Pronuclei: 2,
    day1PolarBodies: 2,
    day1Status: '2PN',
    day1Notes: '',
    // Day 2
    day2CheckTime: '',
    day2CellCount: 4,
    day2Fragmentation: 0,
    day2Symmetry: 'symmetric',
    day2Grade: '',
    day2Notes: '',
    // Day 3
    day3CheckTime: '',
    day3CellCount: 8,
    day3Fragmentation: 0,
    day3Symmetry: 'symmetric',
    day3Compaction: 'none',
    day3Grade: '',
    day3Notes: '',
    // Day 4
    day4CheckTime: '',
    day4Stage: 'morula',
    day4Notes: '',
    // Day 5
    day5CheckTime: '',
    day5Stage: 'blast',
    day5Expansion: '3',
    day5IcmGrade: 'A',
    day5TeGrade: 'A',
    day5OverallGrade: '',
    day5Notes: '',
    // Day 6
    day6CheckTime: '',
    day6Stage: '',
    day6Notes: '',
    // Day 7
    day7CheckTime: '',
    day7Stage: '',
    day7Notes: '',
    // Culture
    cultureMedia: '',
    incubatorType: 'standard',
    co2Concentration: 6.0,
    o2Concentration: 5.0,
    // Disposition
    finalDisposition: 'frozen',
    freezingMethod: 'vitrification',
    // PGT-A
    pgtResult: 'pending'
  });

  useEffect(() => {
    fetchEmbryos();
  }, [cycleId]);

  const fetchEmbryos = async () => {
    if (!headers['x-org-id'] || !headers['x-user-id']) return;

    try {
      setLoading(true);
      const data = await obgynService.getIVFEmbryos(patientId, cycleId, headers);
      setEmbryos(data);
    } catch (error) {
      console.error('Error fetching embryos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!headers['x-org-id'] || !headers['x-user-id']) return;

    try {
      setSaving(true);

      // Auto-generate overall grade for Day 5 if components are filled
      if (formData.day5Expansion && formData.day5IcmGrade && formData.day5TeGrade) {
        formData.day5OverallGrade = `${formData.day5Expansion}${formData.day5IcmGrade}${formData.day5TeGrade}`;
      }

      if (editingEmbryo) {
        // Update existing embryo
        const updated = await obgynService.updateIVFEmbryo(
          patientId,
          cycleId,
          editingEmbryo.id,
          formData,
          headers
        );
        setEmbryos(prev => prev.map(e => e.id === editingEmbryo.id ? updated : e));
      } else {
        // Create new embryo
        const created = await obgynService.createIVFEmbryo(
          patientId,
          cycleId,
          {
            ...formData,
            embryoNumber: embryos.length + 1
          },
          headers
        );
        setEmbryos(prev => [...prev, created]);
      }

      resetForm();
    } catch (error) {
      console.error('Error saving embryo:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (embryoId: string) => {
    if (!confirm('Delete this embryo record?')) return;

    // Note: Backend delete not implemented yet, would need to add DELETE route
    console.log('Delete embryo:', embryoId);
  };

  const resetForm = () => {
    setFormData({
      embryoNumber: 0,
      day1CheckTime: '',
      day1Pronuclei: 2,
      day1PolarBodies: 2,
      day1Status: '2PN',
      day2CellCount: 4,
      day2Fragmentation: 0,
      day2Symmetry: 'symmetric',
      day3CellCount: 8,
      day3Fragmentation: 0,
      day3Symmetry: 'symmetric',
      day3Compaction: 'none',
      day4Stage: 'morula',
      day5Stage: 'blast',
      day5Expansion: '3',
      day5IcmGrade: 'A',
      day5TeGrade: 'A',
      cultureMedia: '',
      incubatorType: 'standard',
      co2Concentration: 6.0,
      o2Concentration: 5.0,
      finalDisposition: 'frozen',
      freezingMethod: 'vitrification',
      pgtResult: 'pending'
    });
    setEditingEmbryo(null);
    setShowAddForm(false);
    setActiveDay(1);
  };

  const toggleEmbryo = (embryoId: string) => {
    setExpandedEmbryos(prev => ({ ...prev, [embryoId]: !prev[embryoId] }));
  };

  // Clinical Calculators
  const statistics = useMemo(() => {
    const total = embryos.length;
    const day3Embryos = embryos.filter(e => e.day3CellCount && e.day3CellCount > 0).length;
    const blastocysts = embryos.filter(e =>
      e.day5Stage && ['blast', 'expanded_blast', 'hatching_blast', 'hatched_blast'].includes(e.day5Stage)
    ).length;
    const goodQuality = embryos.filter(e =>
      e.day5OverallGrade && (e.day5OverallGrade.includes('AA') || e.day5OverallGrade.includes('AB') || e.day5OverallGrade.includes('BA'))
    ).length;
    const frozen = embryos.filter(e => e.finalDisposition === 'frozen').length;
    const euploid = embryos.filter(e => e.pgtResult === 'euploid').length;

    return {
      total,
      day3Embryos,
      blastocysts,
      blastulationRate: day3Embryos > 0 ? ((blastocysts / day3Embryos) * 100).toFixed(1) : '0.0',
      goodQuality,
      qualityRate: blastocysts > 0 ? ((goodQuality / blastocysts) * 100).toFixed(1) : '0.0',
      frozen,
      euploid
    };
  }, [embryos]);

  const getGradeColor = (grade: string | undefined) => {
    if (!grade) return 'bg-gray-100 text-gray-600';
    if (grade.includes('AA') || grade.includes('AB') || grade.includes('BA')) {
      return 'bg-green-100 text-green-800 border-green-300';
    }
    if (grade.includes('BB') || grade.includes('AC') || grade.includes('CA')) {
      return 'bg-blue-100 text-blue-800 border-blue-300';
    }
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  };

  const getStageIcon = (stage: string | undefined) => {
    if (!stage) return null;
    if (stage.includes('blast')) return <Target className="h-3 w-3" />;
    if (stage === 'morula') return <Activity className="h-3 w-3" />;
    if (stage === 'arrested') return <X className="h-3 w-3" />;
    return <TrendingUp className="h-3 w-3" />;
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
      {/* Header with Statistics */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Microscope className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-gray-900">Embryology Lab</h2>
            <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
              {statistics.total} embryos
            </span>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Embryo
          </button>
        </div>

        {/* Quick Statistics */}
        {embryos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <div className="bg-purple-50 rounded p-2 border border-purple-200">
              <p className="text-[10px] text-purple-600 font-medium">Day 3 Embryos</p>
              <p className="text-lg font-bold text-purple-900">{statistics.day3Embryos}</p>
            </div>
            <div className="bg-blue-50 rounded p-2 border border-blue-200">
              <p className="text-[10px] text-blue-600 font-medium">Blastocysts</p>
              <p className="text-lg font-bold text-blue-900">{statistics.blastocysts}</p>
              <p className="text-[9px] text-blue-700">{statistics.blastulationRate}% rate</p>
            </div>
            <div className="bg-green-50 rounded p-2 border border-green-200">
              <p className="text-[10px] text-green-600 font-medium">High Quality</p>
              <p className="text-lg font-bold text-green-900">{statistics.goodQuality}</p>
              <p className="text-[9px] text-green-700">{statistics.qualityRate}% of blasts</p>
            </div>
            <div className="bg-cyan-50 rounded p-2 border border-cyan-200">
              <p className="text-[10px] text-cyan-600 font-medium">Frozen</p>
              <p className="text-lg font-bold text-cyan-900">{statistics.frozen}</p>
            </div>
            {statistics.euploid > 0 && (
              <div className="bg-emerald-50 rounded p-2 border border-emerald-200">
                <p className="text-[10px] text-emerald-600 font-medium">Euploid</p>
                <p className="text-lg font-bold text-emerald-900">{statistics.euploid}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingEmbryo) && (
        <div className="bg-white border-2 border-primary rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              {editingEmbryo ? `Edit Embryo #${editingEmbryo.embryoNumber}` : `New Embryo #${embryos.length + 1}`}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Day Tabs */}
          <div className="flex gap-1 border-b border-gray-200">
            {[1, 2, 3, 4, 5, 6, 7].map(day => (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`px-3 py-1.5 text-xs font-medium rounded-t transition-colors ${
                  activeDay === day
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Day {day}
              </button>
            ))}
            <button
              onClick={() => setActiveDay(0)}
              className={`ml-auto px-3 py-1.5 text-xs font-medium rounded-t transition-colors ${
                activeDay === 0
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              Culture & Disposition
            </button>
          </div>

          {/* Day 1 - Fertilization Check */}
          {activeDay === 1 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Target className="h-4 w-4 text-primary" />
                Day 1: Fertilization Check (16-18h post-insemination)
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Check Time
                  </label>
                  <input
                    type="time"
                    value={formData.day1CheckTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, day1CheckTime: e.target.value }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                    Pronuclei (PN)
                    <span className="text-gray-400" title="Number of pronuclei - normal is 2">
                      <Info className="h-3 w-3" />
                    </span>
                  </label>
                  <select
                    value={formData.day1Pronuclei}
                    onChange={(e) => setFormData(prev => ({ ...prev, day1Pronuclei: parseInt(e.target.value) }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  >
                    <option value={0}>0PN</option>
                    <option value={1}>1PN</option>
                    <option value={2}>2PN (Normal)</option>
                    <option value={3}>3PN</option>
                    <option value={4}>4PN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Polar Bodies
                  </label>
                  <select
                    value={formData.day1PolarBodies}
                    onChange={(e) => setFormData(prev => ({ ...prev, day1PolarBodies: parseInt(e.target.value) }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  >
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.day1Status}
                    onChange={(e) => setFormData(prev => ({ ...prev, day1Status: e.target.value as any }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  >
                    <option value="2PN">2PN (Normal)</option>
                    <option value="1PN">1PN (Abnormal)</option>
                    <option value="3PN">3PN (Abnormal)</option>
                    <option value="unfertilized">Unfertilized</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Day 1 Notes
                </label>
                <textarea
                  value={formData.day1Notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, day1Notes: e.target.value }))}
                  rows={2}
                  placeholder="Observations..."
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          )}

          {/* Day 2 - 4-Cell Stage */}
          {activeDay === 2 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Activity className="h-4 w-4 text-primary" />
                Day 2: 4-Cell Stage (~48h post-insemination)
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Check Time
                  </label>
                  <input
                    type="time"
                    value={formData.day2CheckTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, day2CheckTime: e.target.value }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Cell Count
                  </label>
                  <input
                    type="number"
                    value={formData.day2CellCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, day2CellCount: parseInt(e.target.value) || 0 }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                    Fragmentation (%)
                    <span className="text-gray-400" title="Percentage of fragmented cytoplasm - lower is better">
                      <Info className="h-3 w-3" />
                    </span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.day2Fragmentation}
                    onChange={(e) => setFormData(prev => ({ ...prev, day2Fragmentation: parseInt(e.target.value) || 0 }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Symmetry
                  </label>
                  <select
                    value={formData.day2Symmetry}
                    onChange={(e) => setFormData(prev => ({ ...prev, day2Symmetry: e.target.value as any }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  >
                    <option value="symmetric">Symmetric</option>
                    <option value="mildly_asymmetric">Mildly Asymmetric</option>
                    <option value="asymmetric">Asymmetric</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Day 2 Grade
                </label>
                <input
                  type="text"
                  value={formData.day2Grade}
                  onChange={(e) => setFormData(prev => ({ ...prev, day2Grade: e.target.value }))}
                  placeholder="e.g., 4A, 4B"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Day 2 Notes
                </label>
                <textarea
                  value={formData.day2Notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, day2Notes: e.target.value }))}
                  rows={2}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          )}

          {/* Day 3 - 8-Cell Stage */}
          {activeDay === 3 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <TrendingUp className="h-4 w-4 text-primary" />
                Day 3: 8-Cell Stage (~72h post-insemination)
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Check Time
                  </label>
                  <input
                    type="time"
                    value={formData.day3CheckTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, day3CheckTime: e.target.value }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Cell Count
                  </label>
                  <input
                    type="number"
                    value={formData.day3CellCount}
                    onChange={(e) => setFormData(prev => ({ ...prev, day3CellCount: parseInt(e.target.value) || 0 }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Fragmentation (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.day3Fragmentation}
                    onChange={(e) => setFormData(prev => ({ ...prev, day3Fragmentation: parseInt(e.target.value) || 0 }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Symmetry
                  </label>
                  <select
                    value={formData.day3Symmetry}
                    onChange={(e) => setFormData(prev => ({ ...prev, day3Symmetry: e.target.value as any }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  >
                    <option value="symmetric">Symmetric</option>
                    <option value="mildly_asymmetric">Mildly Asymmetric</option>
                    <option value="asymmetric">Asymmetric</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                    Compaction
                    <span className="text-gray-400" title="Beginning of compaction indicates good progression">
                      <Info className="h-3 w-3" />
                    </span>
                  </label>
                  <select
                    value={formData.day3Compaction}
                    onChange={(e) => setFormData(prev => ({ ...prev, day3Compaction: e.target.value as any }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  >
                    <option value="none">None</option>
                    <option value="beginning">Beginning</option>
                    <option value="partial">Partial</option>
                    <option value="full">Full</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Day 3 Grade
                </label>
                <input
                  type="text"
                  value={formData.day3Grade}
                  onChange={(e) => setFormData(prev => ({ ...prev, day3Grade: e.target.value }))}
                  placeholder="e.g., 8A, 8B"
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Day 3 Notes
                </label>
                <textarea
                  value={formData.day3Notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, day3Notes: e.target.value }))}
                  rows={2}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          )}

          {/* Day 4 - Morula */}
          {activeDay === 4 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Activity className="h-4 w-4 text-primary" />
                Day 4: Morula Stage
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Check Time
                  </label>
                  <input
                    type="time"
                    value={formData.day4CheckTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, day4CheckTime: e.target.value }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Stage
                  </label>
                  <select
                    value={formData.day4Stage}
                    onChange={(e) => setFormData(prev => ({ ...prev, day4Stage: e.target.value as any }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  >
                    <option value="compacting">Compacting</option>
                    <option value="morula">Morula</option>
                    <option value="early_blast">Early Blastocyst</option>
                    <option value="arrested">Arrested</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Day 4 Notes
                </label>
                <textarea
                  value={formData.day4Notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, day4Notes: e.target.value }))}
                  rows={2}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          )}

          {/* Day 5 - Blastocyst (Most Important!) */}
          {activeDay === 5 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Target className="h-4 w-4 text-green-600" />
                Day 5: Blastocyst Stage (Gardner Classification)
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Check Time
                  </label>
                  <input
                    type="time"
                    value={formData.day5CheckTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, day5CheckTime: e.target.value }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Blastocyst Stage
                  </label>
                  <select
                    value={formData.day5Stage}
                    onChange={(e) => setFormData(prev => ({ ...prev, day5Stage: e.target.value as any }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  >
                    <option value="early_blast">Early Blastocyst</option>
                    <option value="blast">Blastocyst</option>
                    <option value="expanded_blast">Expanded Blastocyst</option>
                    <option value="hatching_blast">Hatching Blastocyst</option>
                    <option value="hatched_blast">Hatched Blastocyst</option>
                    <option value="arrested">Arrested</option>
                  </select>
                </div>
              </div>

              {/* Gardner Grading System */}
              <div className="p-3 bg-green-50 rounded border border-green-200">
                <p className="text-xs font-semibold text-green-900 mb-2 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Gardner Blastocyst Grading System
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Expansion (1-6)
                    </label>
                    <select
                      value={formData.day5Expansion}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        day5Expansion: e.target.value as any,
                        day5OverallGrade: `${e.target.value}${prev.day5IcmGrade || 'A'}${prev.day5TeGrade || 'A'}`
                      }))}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                    >
                      <option value="1">1 - Early cavity</option>
                      <option value="2">2 - Cavity ≤50%</option>
                      <option value="3">3 - Cavity &gt;50%</option>
                      <option value="4">4 - Expanded</option>
                      <option value="5">5 - Hatching</option>
                      <option value="6">6 - Hatched</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                      ICM Grade
                      <span className="text-gray-400" title="Inner Cell Mass - becomes the fetus">
                        <Info className="h-3 w-3" />
                      </span>
                    </label>
                    <select
                      value={formData.day5IcmGrade}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        day5IcmGrade: e.target.value as any,
                        day5OverallGrade: `${prev.day5Expansion || '3'}${e.target.value}${prev.day5TeGrade || 'A'}`
                      }))}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                    >
                      <option value="A">A - Many cells, compact</option>
                      <option value="B">B - Several cells, loose</option>
                      <option value="C">C - Few cells</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                      TE Grade
                      <span className="text-gray-400" title="Trophectoderm - becomes the placenta">
                        <Info className="h-3 w-3" />
                      </span>
                    </label>
                    <select
                      value={formData.day5TeGrade}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        day5TeGrade: e.target.value as any,
                        day5OverallGrade: `${prev.day5Expansion || '3'}${prev.day5IcmGrade || 'A'}${e.target.value}`
                      }))}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                    >
                      <option value="A">A - Many cells, cohesive</option>
                      <option value="B">B - Few cells, loose</option>
                      <option value="C">C - Very few cells</option>
                    </select>
                  </div>
                </div>

                <div className="mt-2 p-2 bg-white rounded border border-green-300">
                  <p className="text-xs text-gray-600">Overall Grade:</p>
                  <p className={`text-2xl font-bold ${
                    formData.day5OverallGrade?.includes('AA') ? 'text-green-700' :
                    formData.day5OverallGrade?.includes('A') ? 'text-blue-700' :
                    'text-yellow-700'
                  }`}>
                    {formData.day5OverallGrade || 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Day 5 Notes
                </label>
                <textarea
                  value={formData.day5Notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, day5Notes: e.target.value }))}
                  rows={2}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          )}

          {/* Day 6 */}
          {activeDay === 6 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Clock className="h-4 w-4 text-primary" />
                Day 6: Extended Culture
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Check Time
                  </label>
                  <input
                    type="time"
                    value={formData.day6CheckTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, day6CheckTime: e.target.value }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Stage
                  </label>
                  <input
                    type="text"
                    value={formData.day6Stage}
                    onChange={(e) => setFormData(prev => ({ ...prev, day6Stage: e.target.value }))}
                    placeholder="e.g., Expanded blastocyst"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Day 6 Notes
                </label>
                <textarea
                  value={formData.day6Notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, day6Notes: e.target.value }))}
                  rows={2}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          )}

          {/* Day 7 */}
          {activeDay === 7 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Clock className="h-4 w-4 text-gray-500" />
                Day 7: Very Extended Culture (Rare)
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Check Time
                  </label>
                  <input
                    type="time"
                    value={formData.day7CheckTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, day7CheckTime: e.target.value }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Stage
                  </label>
                  <input
                    type="text"
                    value={formData.day7Stage}
                    onChange={(e) => setFormData(prev => ({ ...prev, day7Stage: e.target.value }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Day 7 Notes
                </label>
                <textarea
                  value={formData.day7Notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, day7Notes: e.target.value }))}
                  rows={2}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          )}

          {/* Culture & Disposition */}
          {activeDay === 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Microscope className="h-4 w-4 text-purple-600" />
                Culture Conditions & Final Disposition
              </div>

              {/* Culture Conditions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Culture Media
                  </label>
                  <input
                    type="text"
                    value={formData.cultureMedia}
                    onChange={(e) => setFormData(prev => ({ ...prev, cultureMedia: e.target.value }))}
                    placeholder="e.g., G-TL"
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Incubator Type
                  </label>
                  <select
                    value={formData.incubatorType}
                    onChange={(e) => setFormData(prev => ({ ...prev, incubatorType: e.target.value as any }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  >
                    <option value="standard">Standard</option>
                    <option value="time_lapse">Time-Lapse</option>
                    <option value="benchtop">Benchtop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    CO₂ (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.co2Concentration}
                    onChange={(e) => setFormData(prev => ({ ...prev, co2Concentration: parseFloat(e.target.value) || 6.0 }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    O₂ (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.o2Concentration}
                    onChange={(e) => setFormData(prev => ({ ...prev, o2Concentration: parseFloat(e.target.value) || 5.0 }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              {/* Final Disposition */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Final Disposition
                  </label>
                  <select
                    value={formData.finalDisposition}
                    onChange={(e) => setFormData(prev => ({ ...prev, finalDisposition: e.target.value as any }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  >
                    <option value="fresh_transfer">Fresh Transfer</option>
                    <option value="frozen">Frozen</option>
                    <option value="biopsied">Biopsied (PGT-A)</option>
                    <option value="discarded">Discarded</option>
                    <option value="arrested">Arrested</option>
                    <option value="research">Research</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Freezing Method
                  </label>
                  <select
                    value={formData.freezingMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, freezingMethod: e.target.value as any }))}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                  >
                    <option value="vitrification">Vitrification (Fast Freeze)</option>
                    <option value="slow_freeze">Slow Freeze</option>
                    <option value="not_frozen">Not Frozen</option>
                  </select>
                </div>
              </div>

              {/* PGT-A */}
              <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
                <p className="text-xs font-semibold text-emerald-900 mb-2">
                  PGT-A Testing (Preimplantation Genetic Testing)
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Biopsy Date
                    </label>
                    <input
                      type="date"
                      value={formData.biopsyDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, biopsyDate: e.target.value }))}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Biopsy Day
                    </label>
                    <select
                      value={formData.biopsyDay}
                      onChange={(e) => setFormData(prev => ({ ...prev, biopsyDay: parseInt(e.target.value) || undefined }))}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                    >
                      <option value="">Not biopsied</option>
                      <option value={3}>Day 3</option>
                      <option value={5}>Day 5</option>
                      <option value={6}>Day 6</option>
                      <option value={7}>Day 7</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      PGT-A Result
                    </label>
                    <select
                      value={formData.pgtResult}
                      onChange={(e) => setFormData(prev => ({ ...prev, pgtResult: e.target.value as any }))}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-primary focus:border-primary"
                    >
                      <option value="pending">Pending</option>
                      <option value="euploid">Euploid (Normal)</option>
                      <option value="aneuploid">Aneuploid (Abnormal)</option>
                      <option value="mosaic">Mosaic</option>
                      <option value="no_result">No Result</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
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
                  Save Embryo
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Embryo List */}
      <div className="space-y-2">
        {embryos.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Microscope className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No embryos tracked yet</p>
            <p className="text-sm text-gray-500 mt-1">Add embryos to start tracking development</p>
          </div>
        ) : (
          embryos.map((embryo) => (
            <div
              key={embryo.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-primary transition-colors"
            >
              {/* Embryo Header */}
              <div className="p-3 flex items-center justify-between bg-gray-50 cursor-pointer" onClick={() => toggleEmbryo(embryo.id)}>
                <div className="flex items-center gap-3">
                  <button className="text-gray-400 hover:text-primary">
                    {expandedEmbryos[embryo.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>

                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 text-primary rounded-full font-bold text-sm">
                    #{embryo.embryoNumber}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      {embryo.day5Stage && getStageIcon(embryo.day5Stage)}
                      <span className="text-sm font-semibold text-gray-900">
                        Embryo #{embryo.embryoNumber}
                      </span>
                      {embryo.day5OverallGrade && (
                        <span className={`px-2 py-0.5 text-xs rounded border font-semibold ${getGradeColor(embryo.day5OverallGrade)}`}>
                          {embryo.day5OverallGrade}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {embryo.day5Stage ? embryo.day5Stage.replace('_', ' ').toUpperCase() : 'In culture'}
                      {embryo.finalDisposition && ` • ${embryo.finalDisposition.replace('_', ' ')}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {embryo.pgtResult === 'euploid' && (
                    <span className="px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                      Euploid
                    </span>
                  )}
                  {embryo.finalDisposition === 'frozen' && (
                    <Snowflake className="h-4 w-4 text-cyan-600" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingEmbryo(embryo);
                      setFormData(embryo);
                      setShowAddForm(false);
                    }}
                    className="p-1 text-gray-400 hover:text-primary"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedEmbryos[embryo.id] && (
                <div className="p-3 border-t border-gray-200 space-y-2">
                  {/* Day Timeline */}
                  <div className="grid grid-cols-7 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map(day => {
                      const hasData = embryo[`day${day}CheckTime` as keyof IVFEmbryoDevelopment];
                      return (
                        <div
                          key={day}
                          className={`p-2 rounded text-center border ${
                            hasData
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-gray-50 border-gray-200 text-gray-400'
                          }`}
                        >
                          <p className="text-[10px] font-medium">Day {day}</p>
                          {hasData && <CheckCircle className="h-3 w-3 mx-auto mt-1" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Day 1:</span>
                      <span className="ml-1 font-medium">{embryo.day1Status || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Day 3:</span>
                      <span className="ml-1 font-medium">{embryo.day3CellCount ? `${embryo.day3CellCount} cells` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Day 5:</span>
                      <span className="ml-1 font-medium">{embryo.day5OverallGrade || embryo.day5Stage || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Disposition:</span>
                      <span className="ml-1 font-medium capitalize">{embryo.finalDisposition?.replace('_', ' ') || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
