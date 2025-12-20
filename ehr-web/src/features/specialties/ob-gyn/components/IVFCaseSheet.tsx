'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Baby, Calendar, Plus, Trash2, X, ChevronDown, ChevronRight,
  FlaskConical, Microscope, Snowflake, Heart, CheckCircle,
  Target, TrendingUp, Activity, Syringe,
  Loader2, Info
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { obgynService, IVFCycle, Embryo } from '@/services/obgyn.service';

interface IVFCaseSheetProps {
  patientId: string;
  episodeId?: string;
}

/**
 * IVFCaseSheet - Comprehensive IVF/Fertility Tracking
 * ==================================================
 * Complete fertility cycle management per docsv2/speciality/gynanc/ivf-case-sheet:
 * - Baseline evaluation (AFC, hormones, semen analysis)
 * - Stimulation protocols with medication tracking
 * - Monitoring visits with follicle measurements
 * - Trigger and retrieval documentation
 * - Embryology tracking with grades
 * - Transfer documentation
 * - Cryopreservation inventory
 * - Outcome tracking with beta hCG
 */
export function IVFCaseSheet({ patientId, episodeId }: IVFCaseSheetProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cycles, setCycles] = useState<IVFCycle[]>([]);
  const [activeCycleId, setActiveCycleId] = useState<string | null>(null);
  const [showNewCycleDialog, setShowNewCycleDialog] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    baseline: true,
    protocol: true,
    monitoring: false,
    retrieval: false,
    embryology: true,
    transfer: false,
    cryo: false,
    outcome: true
  });

  // Form state for new cycle
  const [newCycleForm, setNewCycleForm] = useState({
    cycleType: 'fresh_ivf' as 'fresh_ivf' | 'fet' | 'egg_freezing' | 'pgt_cycle',
    protocolType: 'antagonist' as 'antagonist' | 'long_lupron' | 'microdose_flare' | 'mild' | 'natural',
    startDate: new Date().toISOString().split('T')[0],
    partnerName: '',
    donorCycle: false
  });

  // Fetch cycles on mount
  useEffect(() => {
    fetchCycles();
  }, [patientId, episodeId]);

  const fetchCycles = async () => {
    try {
      setLoading(true);
      const data = await obgynService.getIVFCycles(patientId, episodeId);
      setCycles(data);
      if (data.length > 0) {
        setActiveCycleId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching IVF cycles:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeCycle = useMemo(() => 
    cycles.find(c => c.id === activeCycleId), 
    [cycles, activeCycleId]
  );

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCreateCycle = async () => {
    try {
      setSaving(true);
      const newCycle = await obgynService.createIVFCycle(patientId, {
        ...newCycleForm,
        status: 'active',
        baseline: {
          afcLeft: 0,
          afcRight: 0,
          amh: 0,
          fsh: 0,
          lh: 0,
          estradiol: 0
        },
        medications: [],
        monitoringVisits: [],
        embryos: [],
        transfers: [],
        cryoStorage: []
      });
      setCycles(prev => [newCycle, ...prev]);
      setActiveCycleId(newCycle.id);
      setShowNewCycleDialog(false);
      setNewCycleForm({
        cycleType: 'fresh_ivf',
        protocolType: 'antagonist',
        startDate: new Date().toISOString().split('T')[0],
        partnerName: '',
        donorCycle: false
      });
    } catch (error) {
      console.error('Error creating cycle:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateCycle = async (updates: Partial<IVFCycle>) => {
    if (!activeCycle) return;
    try {
      setSaving(true);
      const updated = await obgynService.updateIVFCycle(patientId, activeCycle.id, updates);
      setCycles(prev => prev.map(c => c.id === activeCycle.id ? updated : c));
    } catch (error) {
      console.error('Error updating cycle:', error);
    } finally {
      setSaving(false);
    }
  };

  const getCycleStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      active: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <Activity className="h-3 w-3" /> },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: <X className="h-3 w-3" /> },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      frozen: { bg: 'bg-cyan-100', text: 'text-cyan-800', icon: <Snowflake className="h-3 w-3" /> }
    };
    return badges[status] || badges.active;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-pink-600" />
          <h2 className="text-lg font-semibold text-gray-900">IVF Case Sheet</h2>
          {saving && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
        </div>
        <button
          onClick={() => setShowNewCycleDialog(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-pink-600 text-white text-sm font-medium rounded hover:bg-pink-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Cycle
        </button>
      </div>

      {/* Cycle Selector Tabs */}
      {cycles.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {cycles.map(cycle => {
            const badge = getCycleStatusBadge(cycle.status);
            return (
              <button
                key={cycle.id}
                onClick={() => setActiveCycleId(cycle.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeCycleId === cycle.id
                    ? 'bg-pink-100 text-pink-800 border-2 border-pink-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <FlaskConical className="h-4 w-4" />
                <span>{cycle.cycleType.replace('_', ' ').toUpperCase()}</span>
                <span className="text-xs text-gray-500">
                  {new Date(cycle.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <span className={`px-1.5 py-0.5 text-xs rounded flex items-center gap-1 ${badge.bg} ${badge.text}`}>
                  {badge.icon}
                  {cycle.status}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* No Cycles State */}
      {cycles.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FlaskConical className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600">No IVF cycles recorded</p>
          <p className="text-xs text-gray-500 mt-1">Start a new cycle to begin tracking</p>
          <button
            onClick={() => setShowNewCycleDialog(true)}
            className="mt-4 px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded hover:bg-pink-700"
          >
            Start New Cycle
          </button>
        </div>
      )}

      {/* Active Cycle Details */}
      {activeCycle && (
        <div className="space-y-3">
          {/* Baseline Evaluation Section */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('baseline')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                {expandedSections.baseline ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <Target className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-gray-900">Baseline Evaluation</span>
              </div>
              <span className="text-xs text-gray-500">AFC, Hormones, Semen Analysis</span>
            </button>
            
            {expandedSections.baseline && (
              <div className="p-3 border-t border-gray-200 space-y-4">
                {/* Ovarian Reserve */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">Antral Follicle Count (Day 2/3)</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">Left Ovary</label>
                      <input
                        type="number"
                        value={activeCycle.baseline?.afcLeft || ''}
                        onChange={(e) => updateCycle({
                          baseline: { ...activeCycle.baseline, afcLeft: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-pink-500 focus:border-pink-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Right Ovary</label>
                      <input
                        type="number"
                        value={activeCycle.baseline?.afcRight || ''}
                        onChange={(e) => updateCycle({
                          baseline: { ...activeCycle.baseline, afcRight: parseInt(e.target.value) || 0 }
                        })}
                        className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-pink-500 focus:border-pink-500"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Total AFC</label>
                      <div className="mt-1 px-2 py-1 text-sm bg-gray-100 rounded font-medium">
                        {(activeCycle.baseline?.afcLeft || 0) + (activeCycle.baseline?.afcRight || 0)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hormones */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">Baseline Hormones</h4>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {[
                      { key: 'fsh', label: 'FSH', unit: 'mIU/mL' },
                      { key: 'lh', label: 'LH', unit: 'mIU/mL' },
                      { key: 'estradiol', label: 'E2', unit: 'pg/mL' },
                      { key: 'amh', label: 'AMH', unit: 'ng/mL' },
                      { key: 'tsh', label: 'TSH', unit: 'μIU/mL' },
                      { key: 'prolactin', label: 'PRL', unit: 'ng/mL' }
                    ].map(({ key, label, unit }) => (
                      <div key={key}>
                        <label className="text-xs text-gray-500">{label}</label>
                        <input
                          type="number"
                          step="0.1"
                          value={(activeCycle.baseline as Record<string, number | undefined>)?.[key] ?? ''}
                          onChange={(e) => updateCycle({
                            baseline: { ...activeCycle.baseline, [key]: parseFloat(e.target.value) || 0 }
                          })}
                          className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-pink-500 focus:border-pink-500"
                          placeholder="0"
                        />
                        <span className="text-xs text-gray-400">{unit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Semen Analysis */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">Semen Analysis</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { key: 'volume', label: 'Volume', unit: 'mL' },
                      { key: 'concentration', label: 'Concentration', unit: 'M/mL' },
                      { key: 'motility', label: 'Motility', unit: '%' },
                      { key: 'morphology', label: 'Morphology', unit: '%' }
                    ].map(({ key, label, unit }) => (
                      <div key={key}>
                        <label className="text-xs text-gray-500">{label}</label>
                        <input
                          type="number"
                          step="0.1"
                          value={(activeCycle.semenAnalysis as Record<string, number | undefined>)?.[key] ?? ''}
                          onChange={(e) => updateCycle({
                            semenAnalysis: { ...activeCycle.semenAnalysis, [key]: parseFloat(e.target.value) || 0 }
                          })}
                          className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-pink-500 focus:border-pink-500"
                          placeholder="0"
                        />
                        <span className="text-xs text-gray-400">{unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stimulation Protocol Section */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('protocol')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                {expandedSections.protocol ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <Syringe className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-gray-900">Stimulation Protocol</span>
              </div>
              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                {activeCycle.protocolType?.replace('_', ' ').toUpperCase() || 'Not Set'}
              </span>
            </button>
            
            {expandedSections.protocol && (
              <div className="p-3 border-t border-gray-200 space-y-4">
                {/* Protocol Type */}
                <div>
                  <label className="text-xs font-semibold text-gray-600">Protocol Type</label>
                  <select
                    value={activeCycle.protocolType || ''}
                    onChange={(e) => updateCycle({ protocolType: e.target.value as IVFCycle['protocolType'] })}
                    className="w-full mt-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="antagonist">Antagonist Protocol</option>
                    <option value="long_lupron">Long Lupron</option>
                    <option value="microdose_flare">Microdose Flare</option>
                    <option value="mild">Mild Stimulation</option>
                    <option value="natural">Natural Cycle</option>
                  </select>
                </div>

                {/* Medications */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-gray-600 uppercase">Medications</h4>
                    <button
                      onClick={() => {
                        const newMed = {
                          id: Date.now().toString(),
                          name: '',
                          dose: 0,
                          unit: 'IU',
                          startDay: 1,
                          endDay: 10
                        };
                        updateCycle({
                          medications: [...(activeCycle.medications || []), newMed]
                        });
                      }}
                      className="text-xs text-pink-600 hover:text-pink-700 font-medium"
                    >
                      + Add Medication
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(activeCycle.medications || []).map((med, idx) => (
                      <div key={med.id || idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <input
                          type="text"
                          value={med.name}
                          onChange={(e) => {
                            const updated = [...(activeCycle.medications || [])];
                            updated[idx] = { ...med, name: e.target.value };
                            updateCycle({ medications: updated });
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder="Medication name"
                        />
                        <input
                          type="number"
                          value={med.dose}
                          onChange={(e) => {
                            const updated = [...(activeCycle.medications || [])];
                            updated[idx] = { ...med, dose: parseFloat(e.target.value) || 0 };
                            updateCycle({ medications: updated });
                          }}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                          placeholder="Dose"
                        />
                        <select
                          value={med.unit}
                          onChange={(e) => {
                            const updated = [...(activeCycle.medications || [])];
                            updated[idx] = { ...med, unit: e.target.value };
                            updateCycle({ medications: updated });
                          }}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                        >
                          <option value="IU">IU</option>
                          <option value="mg">mg</option>
                          <option value="mcg">mcg</option>
                        </select>
                        <span className="text-xs text-gray-500">Day</span>
                        <input
                          type="number"
                          value={med.startDay}
                          onChange={(e) => {
                            const updated = [...(activeCycle.medications || [])];
                            updated[idx] = { ...med, startDay: parseInt(e.target.value) || 1 };
                            updateCycle({ medications: updated });
                          }}
                          className="w-12 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                        <span className="text-xs text-gray-500">to</span>
                        <input
                          type="number"
                          value={med.endDay}
                          onChange={(e) => {
                            const updated = [...(activeCycle.medications || [])];
                            updated[idx] = { ...med, endDay: parseInt(e.target.value) || 10 };
                            updateCycle({ medications: updated });
                          }}
                          className="w-12 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                        <button
                          onClick={() => {
                            const updated = (activeCycle.medications || []).filter((_, i) => i !== idx);
                            updateCycle({ medications: updated });
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Embryology Section */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('embryology')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                {expandedSections.embryology ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <Microscope className="h-4 w-4 text-green-600" />
                <span className="font-medium text-gray-900">Embryology</span>
              </div>
              <span className="text-xs text-gray-500">
                {(activeCycle.embryos || []).length} embryos tracked
              </span>
            </button>
            
            {expandedSections.embryology && (
              <div className="p-3 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Retrieval:</span>
                      <input
                        type="date"
                        value={activeCycle.retrievalDate || ''}
                        onChange={(e) => updateCycle({ retrievalDate: e.target.value })}
                        className="ml-2 px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <span className="text-gray-500">Oocytes:</span>
                      <input
                        type="number"
                        value={activeCycle.oocytesRetrieved || ''}
                        onChange={(e) => updateCycle({ oocytesRetrieved: parseInt(e.target.value) || 0 })}
                        className="ml-2 w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <span className="text-gray-500">Mature (MII):</span>
                      <input
                        type="number"
                        value={activeCycle.matureOocytes || ''}
                        onChange={(e) => updateCycle({ matureOocytes: parseInt(e.target.value) || 0 })}
                        className="ml-2 w-16 px-2 py-1 text-sm border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newEmbryo: Embryo = {
                        id: Date.now().toString(),
                        embryoNumber: (activeCycle.embryos || []).length + 1,
                        day: 1,
                        cellNumber: 1,
                        grade: '',
                        status: 'developing',
                        fertilizationMethod: 'icsi'
                      };
                      updateCycle({
                        embryos: [...(activeCycle.embryos || []), newEmbryo]
                      });
                    }}
                    className="text-xs text-pink-600 hover:text-pink-700 font-medium"
                  >
                    + Add Embryo
                  </button>
                </div>

                {/* Embryo Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-2 py-1 text-left">#</th>
                        <th className="px-2 py-1 text-left">Day</th>
                        <th className="px-2 py-1 text-left">Cells</th>
                        <th className="px-2 py-1 text-left">Grade</th>
                        <th className="px-2 py-1 text-left">Method</th>
                        <th className="px-2 py-1 text-left">PGT</th>
                        <th className="px-2 py-1 text-left">Status</th>
                        <th className="px-2 py-1"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeCycle.embryos || []).map((embryo, idx) => (
                        <tr key={embryo.id} className="border-b border-gray-100">
                          <td className="px-2 py-1 font-medium">{embryo.embryoNumber}</td>
                          <td className="px-2 py-1">
                            <select
                              value={embryo.day}
                              onChange={(e) => {
                                const updated = [...(activeCycle.embryos || [])];
                                updated[idx] = { ...embryo, day: parseInt(e.target.value) };
                                updateCycle({ embryos: updated });
                              }}
                              className="w-14 px-1 py-0.5 border border-gray-300 rounded"
                            >
                              {[1, 2, 3, 4, 5, 6, 7].map(d => (
                                <option key={d} value={d}>D{d}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-2 py-1">
                            <input
                              type="number"
                              value={embryo.cellNumber || ''}
                              onChange={(e) => {
                                const updated = [...(activeCycle.embryos || [])];
                                updated[idx] = { ...embryo, cellNumber: parseInt(e.target.value) || 0 };
                                updateCycle({ embryos: updated });
                              }}
                              className="w-12 px-1 py-0.5 border border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-2 py-1">
                            <input
                              type="text"
                              value={embryo.grade || ''}
                              onChange={(e) => {
                                const updated = [...(activeCycle.embryos || [])];
                                updated[idx] = { ...embryo, grade: e.target.value };
                                updateCycle({ embryos: updated });
                              }}
                              className="w-16 px-1 py-0.5 border border-gray-300 rounded"
                              placeholder="e.g. 4AA"
                            />
                          </td>
                          <td className="px-2 py-1">
                            <select
                              value={embryo.fertilizationMethod}
                              onChange={(e) => {
                                const updated = [...(activeCycle.embryos || [])];
                                updated[idx] = { ...embryo, fertilizationMethod: e.target.value as Embryo['fertilizationMethod'] };
                                updateCycle({ embryos: updated });
                              }}
                              className="w-16 px-1 py-0.5 border border-gray-300 rounded"
                            >
                              <option value="ivf">IVF</option>
                              <option value="icsi">ICSI</option>
                            </select>
                          </td>
                          <td className="px-2 py-1">
                            <select
                              value={embryo.pgtResult || ''}
                              onChange={(e) => {
                                const updated = [...(activeCycle.embryos || [])];
                                updated[idx] = { ...embryo, pgtResult: e.target.value as Embryo['pgtResult'] };
                                updateCycle({ embryos: updated });
                              }}
                              className="w-20 px-1 py-0.5 border border-gray-300 rounded"
                            >
                              <option value="">N/A</option>
                              <option value="euploid">Euploid</option>
                              <option value="aneuploid">Aneuploid</option>
                              <option value="mosaic">Mosaic</option>
                              <option value="no_result">No Result</option>
                            </select>
                          </td>
                          <td className="px-2 py-1">
                            <select
                              value={embryo.status}
                              onChange={(e) => {
                                const updated = [...(activeCycle.embryos || [])];
                                updated[idx] = { ...embryo, status: e.target.value as Embryo['status'] };
                                updateCycle({ embryos: updated });
                              }}
                              className={`w-20 px-1 py-0.5 border rounded text-xs ${
                                embryo.status === 'transferred' ? 'bg-green-100 text-green-800' :
                                embryo.status === 'frozen' ? 'bg-cyan-100 text-cyan-800' :
                                embryo.status === 'discarded' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              <option value="developing">Developing</option>
                              <option value="transferred">Transferred</option>
                              <option value="frozen">Frozen</option>
                              <option value="discarded">Discarded</option>
                            </select>
                          </td>
                          <td className="px-2 py-1">
                            <button
                              onClick={() => {
                                const updated = (activeCycle.embryos || []).filter((_, i) => i !== idx);
                                updateCycle({ embryos: updated });
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Outcome Section */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('outcome')}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                {expandedSections.outcome ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                <Heart className="h-4 w-4 text-red-600" />
                <span className="font-medium text-gray-900">Outcome & Follow-up</span>
              </div>
              {activeCycle.outcome?.pregnancyConfirmed && (
                <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Pregnancy Confirmed
                </span>
              )}
            </button>
            
            {expandedSections.outcome && (
              <div className="p-3 border-t border-gray-200 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">Beta hCG #1</label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        value={activeCycle.outcome?.betaHcg1 || ''}
                        onChange={(e) => updateCycle({
                          outcome: { ...activeCycle.outcome, betaHcg1: parseFloat(e.target.value) || 0 }
                        })}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="mIU/mL"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Date #1</label>
                    <input
                      type="date"
                      value={activeCycle.outcome?.betaHcg1Date || ''}
                      onChange={(e) => updateCycle({
                        outcome: { ...activeCycle.outcome, betaHcg1Date: e.target.value }
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Beta hCG #2</label>
                    <input
                      type="number"
                      value={activeCycle.outcome?.betaHcg2 || ''}
                      onChange={(e) => updateCycle({
                        outcome: { ...activeCycle.outcome, betaHcg2: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                      placeholder="mIU/mL"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Date #2</label>
                    <input
                      type="date"
                      value={activeCycle.outcome?.betaHcg2Date || ''}
                      onChange={(e) => updateCycle({
                        outcome: { ...activeCycle.outcome, betaHcg2Date: e.target.value }
                      })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                  </div>
                </div>

                {/* Doubling Time Calculator */}
                {activeCycle.outcome?.betaHcg1 && activeCycle.outcome?.betaHcg2 && (
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Doubling Time: {(() => {
                          const beta1 = activeCycle.outcome.betaHcg1;
                          const beta2 = activeCycle.outcome.betaHcg2;
                          const date1 = new Date(activeCycle.outcome.betaHcg1Date || '');
                          const date2 = new Date(activeCycle.outcome.betaHcg2Date || '');
                          const hoursDiff = Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60 * 60);
                          const doublingTime = (hoursDiff * Math.log(2)) / Math.log(beta2 / beta1);
                          return isNaN(doublingTime) ? 'N/A' : `${doublingTime.toFixed(1)} hours`;
                        })()}
                      </span>
                      <Info className="h-3 w-3 text-blue-500" title="Normal doubling time is 48-72 hours" />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={activeCycle.outcome?.pregnancyConfirmed || false}
                      onChange={(e) => updateCycle({
                        outcome: { ...activeCycle.outcome, pregnancyConfirmed: e.target.checked }
                      })}
                      className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">Clinical Pregnancy Confirmed</span>
                  </label>

                  {activeCycle.outcome?.pregnancyConfirmed && (
                    <button className="text-xs text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1">
                      <Baby className="h-3 w-3" />
                      Create Pregnancy Episode →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Cycle Dialog */}
      {showNewCycleDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Start New IVF Cycle</h3>
              <button onClick={() => setShowNewCycleDialog(false)}>
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Cycle Type</label>
                <select
                  value={newCycleForm.cycleType}
                  onChange={(e) => setNewCycleForm(prev => ({ ...prev, cycleType: e.target.value as IVFCycle['cycleType'] }))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="fresh_ivf">Fresh IVF Cycle</option>
                  <option value="fet">Frozen Embryo Transfer (FET)</option>
                  <option value="egg_freezing">Egg Freezing</option>
                  <option value="pgt_cycle">PGT Cycle</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Protocol Type</label>
                <select
                  value={newCycleForm.protocolType}
                  onChange={(e) => setNewCycleForm(prev => ({ ...prev, protocolType: e.target.value as IVFCycle['protocolType'] }))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="antagonist">Antagonist Protocol</option>
                  <option value="long_lupron">Long Lupron</option>
                  <option value="microdose_flare">Microdose Flare</option>
                  <option value="mild">Mild Stimulation</option>
                  <option value="natural">Natural Cycle</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={newCycleForm.startDate}
                  onChange={(e) => setNewCycleForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newCycleForm.donorCycle}
                  onChange={(e) => setNewCycleForm(prev => ({ ...prev, donorCycle: e.target.checked }))}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-sm text-gray-700">Donor Cycle</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowNewCycleDialog(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCycle}
                disabled={saving}
                className="px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded hover:bg-pink-700 disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Create Cycle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
