'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Ruler, Plus, Trash2, AlertTriangle, CheckCircle, Clock,
  TrendingDown, Info, ChevronDown, ChevronRight, Loader2, Calendar,
  Activity, AlertCircle
} from 'lucide-react';
import { obgynService, CervicalLength } from '@/services/obgyn.service';

interface CervicalLengthPanelProps {
  patientId: string;
  episodeId?: string;
}

/**
 * CervicalLengthPanel - Preterm Risk Monitoring
 * =============================================
 * Tracks cervical length measurements for preterm birth risk assessment:
 * - Serial cervical length measurements with trending
 * - Risk stratification based on length cutoffs
 * - Intervention tracking (cerclage, progesterone)
 * - Automated alerts for short cervix
 */
export function CervicalLengthPanel({ patientId, episodeId }: CervicalLengthPanelProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [measurements, setMeasurements] = useState<CervicalLength[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showInterventions, setShowInterventions] = useState(true);

  // New measurement form
  const [newMeasurement, setNewMeasurement] = useState<Partial<CervicalLength>>({
    date: new Date().toISOString().split('T')[0],
    gestationalAge: '',
    length: undefined,
    method: 'transvaginal',
    funneling: false,
    funnelingLength: undefined,
    internalOsOpen: false
  });

  // Intervention tracking
  const [interventions, setInterventions] = useState({
    progesterone: { active: false, startDate: '', type: 'vaginal', dose: '200mg' },
    cerclage: { placed: false, date: '', type: 'mcdonald', indication: '' },
    bedRest: { recommended: false, startDate: '', type: 'modified' }
  });

  // Risk thresholds
  const RISK_THRESHOLDS = {
    normal: 30,     // >=30mm is normal
    borderline: 25, // 25-29mm is borderline
    short: 20,      // 20-24mm is short
    veryShort: 15   // <15mm is very short
  };

  useEffect(() => {
    fetchMeasurements();
  }, [patientId, episodeId]);

  const fetchMeasurements = async () => {
    try {
      setLoading(true);
      const data = await obgynService.getCervicalLengths(patientId, episodeId);
      setMeasurements(data);
    } catch (error) {
      console.error('Error fetching cervical lengths:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMeasurement = async () => {
    if (!newMeasurement.length || !newMeasurement.date) return;

    try {
      setSaving(true);
      const saved = await obgynService.saveCervicalLength(patientId, {
        ...newMeasurement as CervicalLength,
        episodeId
      });
      setMeasurements(prev => [saved, ...prev]);
      setShowAddForm(false);
      setNewMeasurement({
        date: new Date().toISOString().split('T')[0],
        gestationalAge: '',
        length: undefined,
        method: 'transvaginal',
        funneling: false,
        funnelingLength: undefined,
        internalOsOpen: false
      });
    } catch (error) {
      console.error('Error saving cervical length:', error);
    } finally {
      setSaving(false);
    }
  };

  const getRiskLevel = (length: number) => {
    if (length >= RISK_THRESHOLDS.normal) {
      return { level: 'normal', label: 'Normal', color: 'bg-green-100 text-green-800', icon: CheckCircle };
    } else if (length >= RISK_THRESHOLDS.borderline) {
      return { level: 'borderline', label: 'Borderline', color: 'bg-yellow-100 text-yellow-800', icon: Clock };
    } else if (length >= RISK_THRESHOLDS.short) {
      return { level: 'short', label: 'Short Cervix', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle };
    } else {
      return { level: 'veryShort', label: 'Very Short', color: 'bg-red-100 text-red-800', icon: AlertCircle };
    }
  };

  const latestMeasurement = useMemo(() => measurements[0], [measurements]);
  const trend = useMemo(() => {
    if (measurements.length < 2) return null;
    const diff = measurements[0].length - measurements[1].length;
    return {
      direction: diff < 0 ? 'decreasing' : diff > 0 ? 'increasing' : 'stable',
      change: Math.abs(diff)
    };
  }, [measurements]);

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
          <Ruler className="h-5 w-5 text-pink-600" />
          <h2 className="text-lg font-semibold text-gray-900">Cervical Length Monitoring</h2>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1 px-3 py-1.5 bg-pink-600 text-white text-sm font-medium rounded hover:bg-pink-700"
        >
          <Plus className="h-4 w-4" />
          Add Measurement
        </button>
      </div>

      {/* Summary Card */}
      {latestMeasurement && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600">Latest Measurement</h3>
            <span className="text-xs text-gray-500">
              {new Date(latestMeasurement.date).toLocaleDateString()} • {latestMeasurement.gestationalAge}
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Length display */}
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{latestMeasurement.length}</div>
              <div className="text-xs text-gray-500">mm</div>
            </div>

            {/* Risk badge */}
            {(() => {
              const risk = getRiskLevel(latestMeasurement.length);
              const RiskIcon = risk.icon;
              return (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${risk.color}`}>
                  <RiskIcon className="h-5 w-5" />
                  <span className="font-medium">{risk.label}</span>
                </div>
              );
            })()}

            {/* Trend */}
            {trend && (
              <div className="flex items-center gap-2">
                {trend.direction === 'decreasing' ? (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                ) : (
                  <Activity className="h-5 w-5 text-green-500" />
                )}
                <span className={`text-sm font-medium ${
                  trend.direction === 'decreasing' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {trend.direction === 'decreasing' ? '↓' : trend.direction === 'increasing' ? '↑' : '→'} {trend.change}mm
                </span>
              </div>
            )}

            {/* Funneling indicator */}
            {latestMeasurement.funneling && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">
                  Funneling {latestMeasurement.funnelingLength}mm
                </span>
              </div>
            )}
          </div>

          {/* Recommendations based on length */}
          {latestMeasurement.length < RISK_THRESHOLDS.borderline && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800">Recommended Actions:</p>
                  <ul className="text-amber-700 mt-1 list-disc list-inside">
                    {latestMeasurement.length < RISK_THRESHOLDS.short && (
                      <>
                        <li>Consider vaginal progesterone if not already initiated</li>
                        <li>Discuss cerclage if &lt;24 weeks and prior preterm birth</li>
                      </>
                    )}
                    <li>Repeat cervical length in 1-2 weeks</li>
                    <li>Activity modification counseling</li>
                    {latestMeasurement.length < RISK_THRESHOLDS.veryShort && (
                      <li>Consider MFM consultation</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Measurement History */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">Measurement History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">GA</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Length (mm)</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Method</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Funneling</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {measurements.map((m, idx) => {
                const risk = getRiskLevel(m.length);
                const RiskIcon = risk.icon;
                return (
                  <tr key={m.id || idx} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{new Date(m.date).toLocaleDateString()}</td>
                    <td className="px-3 py-2">{m.gestationalAge}</td>
                    <td className="px-3 py-2 font-medium">{m.length}</td>
                    <td className="px-3 py-2 capitalize text-gray-600">{m.method}</td>
                    <td className="px-3 py-2">
                      {m.funneling ? (
                        <span className="text-red-600">{m.funnelingLength}mm</span>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded ${risk.color}`}>
                        <RiskIcon className="h-3 w-3" />
                        {risk.label}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <button
                        onClick={async () => {
                          if (m.id && window.confirm('Delete this measurement?')) {
                            try {
                              // Remove from local state
                              setMeasurements(prev => prev.filter(item => item.id !== m.id));
                            } catch (error) {
                              console.error('Error deleting measurement:', error);
                            }
                          }
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {measurements.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                    No cervical length measurements recorded
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interventions Section */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <button
          onClick={() => setShowInterventions(!showInterventions)}
          className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
        >
          <div className="flex items-center gap-2">
            {showInterventions ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="font-medium text-gray-900">Interventions</span>
          </div>
          <span className="text-xs text-gray-500">
            {interventions.progesterone.active && 'Progesterone'} 
            {interventions.cerclage.placed && ' • Cerclage'}
          </span>
        </button>

        {showInterventions && (
          <div className="p-3 border-t border-gray-200 space-y-4">
            {/* Progesterone */}
            <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={interventions.progesterone.active}
                  onChange={(e) => setInterventions(prev => ({
                    ...prev,
                    progesterone: { ...prev.progesterone, active: e.target.checked }
                  }))}
                  className="rounded border-gray-300 text-pink-600"
                />
                <span className="text-sm font-medium text-gray-700">Progesterone</span>
              </label>
              
              {interventions.progesterone.active && (
                <div className="flex items-center gap-3">
                  <select
                    value={interventions.progesterone.type}
                    onChange={(e) => setInterventions(prev => ({
                      ...prev,
                      progesterone: { ...prev.progesterone, type: e.target.value }
                    }))}
                    className="px-2 py-1 text-sm border border-gray-300 rounded"
                  >
                    <option value="vaginal">Vaginal</option>
                    <option value="im">IM (17-OHP)</option>
                  </select>
                  <input
                    type="date"
                    value={interventions.progesterone.startDate}
                    onChange={(e) => setInterventions(prev => ({
                      ...prev,
                      progesterone: { ...prev.progesterone, startDate: e.target.value }
                    }))}
                    className="px-2 py-1 text-sm border border-gray-300 rounded"
                    placeholder="Start date"
                  />
                </div>
              )}
            </div>

            {/* Cerclage */}
            <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={interventions.cerclage.placed}
                  onChange={(e) => setInterventions(prev => ({
                    ...prev,
                    cerclage: { ...prev.cerclage, placed: e.target.checked }
                  }))}
                  className="rounded border-gray-300 text-pink-600"
                />
                <span className="text-sm font-medium text-gray-700">Cerclage</span>
              </label>
              
              {interventions.cerclage.placed && (
                <div className="flex items-center gap-3">
                  <select
                    value={interventions.cerclage.type}
                    onChange={(e) => setInterventions(prev => ({
                      ...prev,
                      cerclage: { ...prev.cerclage, type: e.target.value }
                    }))}
                    className="px-2 py-1 text-sm border border-gray-300 rounded"
                  >
                    <option value="mcdonald">McDonald</option>
                    <option value="shirodkar">Shirodkar</option>
                    <option value="abdominal">Abdominal</option>
                  </select>
                  <input
                    type="date"
                    value={interventions.cerclage.date}
                    onChange={(e) => setInterventions(prev => ({
                      ...prev,
                      cerclage: { ...prev.cerclage, date: e.target.value }
                    }))}
                    className="px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <select
                    value={interventions.cerclage.indication}
                    onChange={(e) => setInterventions(prev => ({
                      ...prev,
                      cerclage: { ...prev.cerclage, indication: e.target.value }
                    }))}
                    className="px-2 py-1 text-sm border border-gray-300 rounded"
                  >
                    <option value="">Indication...</option>
                    <option value="history-indicated">History Indicated</option>
                    <option value="ultrasound-indicated">US Indicated</option>
                    <option value="physical-exam-indicated">PE Indicated</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Measurement Dialog */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-semibold">Add Cervical Length Measurement</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={newMeasurement.date}
                    onChange={(e) => setNewMeasurement(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Gestational Age</label>
                  <input
                    type="text"
                    value={newMeasurement.gestationalAge}
                    onChange={(e) => setNewMeasurement(prev => ({ ...prev, gestationalAge: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g. 22w 3d"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Length (mm)</label>
                  <input
                    type="number"
                    value={newMeasurement.length || ''}
                    onChange={(e) => setNewMeasurement(prev => ({ ...prev, length: parseFloat(e.target.value) || undefined }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="mm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Method</label>
                  <select
                    value={newMeasurement.method}
                    onChange={(e) => setNewMeasurement(prev => ({ ...prev, method: e.target.value as CervicalLength['method'] }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="transvaginal">Transvaginal</option>
                    <option value="transabdominal">Transabdominal</option>
                    <option value="translabial">Translabial</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newMeasurement.funneling}
                    onChange={(e) => setNewMeasurement(prev => ({ ...prev, funneling: e.target.checked }))}
                    className="rounded border-gray-300 text-pink-600"
                  />
                  <span className="text-sm text-gray-700">Funneling Present</span>
                </label>

                {newMeasurement.funneling && (
                  <div>
                    <input
                      type="number"
                      value={newMeasurement.funnelingLength || ''}
                      onChange={(e) => setNewMeasurement(prev => ({ ...prev, funnelingLength: parseFloat(e.target.value) || undefined }))}
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                      placeholder="mm"
                    />
                    <span className="text-xs text-gray-500 ml-1">mm</span>
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newMeasurement.internalOsOpen}
                  onChange={(e) => setNewMeasurement(prev => ({ ...prev, internalOsOpen: e.target.checked }))}
                  className="rounded border-gray-300 text-pink-600"
                />
                <span className="text-sm text-gray-700">Internal Os Open</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMeasurement}
                disabled={saving || !newMeasurement.length}
                className="px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded hover:bg-pink-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
