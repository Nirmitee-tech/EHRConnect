'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Plus, Clock, CheckCircle, XCircle, Activity,
  Heart, Droplet, Baby, Brain, Save, X, ChevronDown, ChevronUp,
  FileText, AlertCircle, Loader2, Pill
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';

/**
 * COMPLICATIONS PANEL
 * ===================
 * 
 * Tracks pregnancy complications per docsv2/speciality/gynanc/complications:
 * - TTTS (Twin-to-Twin Transfusion Syndrome)
 * - Preeclampsia
 * - Gestational diabetes
 * - Placenta previa/accreta
 * - Cervical insufficiency
 * - Pregnancy loss events
 * 
 * Features:
 * - Complication logging with severity grades
 * - Action tracking (orders, referrals, tasks)
 * - Outcome documentation
 * - Alert generation for critical complications
 */

interface Complication {
  id: string;
  type: ComplicationType;
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  detectedAt: string; // GA or date
  detectedDate: string;
  status: 'active' | 'resolved' | 'monitoring' | 'resultedInLoss';
  description: string;
  actionsTaken: Action[];
  supportServices: string[];
  notes: string;
  lastUpdated: string;
  updatedBy: string;
}

interface Action {
  id: string;
  type: 'order' | 'referral' | 'task' | 'medication' | 'procedure';
  description: string;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
  provider?: string;
}

type ComplicationType = 
  | 'ttts'
  | 'preeclampsia'
  | 'gestational_diabetes'
  | 'placenta_previa'
  | 'placenta_accreta'
  | 'cervical_insufficiency'
  | 'iugr'
  | 'preterm_labor'
  | 'oligohydramnios'
  | 'polyhydramnios'
  | 'cholestasis'
  | 'prom'
  | 'bleeding'
  | 'other';

const COMPLICATION_TYPES: Record<ComplicationType, { label: string; icon: React.ReactNode; color: string }> = {
  ttts: { label: 'TTTS (Twin-to-Twin Transfusion)', icon: <Baby className="h-4 w-4" />, color: 'text-red-600' },
  preeclampsia: { label: 'Preeclampsia/Eclampsia', icon: <Heart className="h-4 w-4" />, color: 'text-orange-600' },
  gestational_diabetes: { label: 'Gestational Diabetes', icon: <Activity className="h-4 w-4" />, color: 'text-yellow-600' },
  placenta_previa: { label: 'Placenta Previa', icon: <AlertCircle className="h-4 w-4" />, color: 'text-red-500' },
  placenta_accreta: { label: 'Placenta Accreta Spectrum', icon: <AlertCircle className="h-4 w-4" />, color: 'text-red-700' },
  cervical_insufficiency: { label: 'Cervical Insufficiency', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-orange-500' },
  iugr: { label: 'IUGR (Fetal Growth Restriction)', icon: <Baby className="h-4 w-4" />, color: 'text-amber-600' },
  preterm_labor: { label: 'Preterm Labor', icon: <Clock className="h-4 w-4" />, color: 'text-red-500' },
  oligohydramnios: { label: 'Oligohydramnios', icon: <Droplet className="h-4 w-4" />, color: 'text-blue-600' },
  polyhydramnios: { label: 'Polyhydramnios', icon: <Droplet className="h-4 w-4" />, color: 'text-blue-500' },
  cholestasis: { label: 'Intrahepatic Cholestasis', icon: <Activity className="h-4 w-4" />, color: 'text-yellow-700' },
  prom: { label: 'PROM/PPROM', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-red-600' },
  bleeding: { label: 'Antepartum Hemorrhage', icon: <Droplet className="h-4 w-4" />, color: 'text-red-600' },
  other: { label: 'Other Complication', icon: <FileText className="h-4 w-4" />, color: 'text-gray-600' },
};

const SEVERITY_CONFIG = {
  mild: { label: 'Mild', color: 'bg-green-100 text-green-800 border-green-300' },
  moderate: { label: 'Moderate', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  severe: { label: 'Severe', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-800 border-red-300' },
};

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-red-100 text-red-700', icon: <AlertCircle className="h-3 w-3" /> },
  monitoring: { label: 'Monitoring', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="h-3 w-3" /> },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="h-3 w-3" /> },
  resultedInLoss: { label: 'Resulted in Loss', color: 'bg-gray-100 text-gray-700', icon: <XCircle className="h-3 w-3" /> },
};

interface ComplicationsPanelProps {
  patientId: string;
  episodeId?: string;
  isMultifetal?: boolean;
  onComplicationAdd?: (complication: Complication) => void;
  readOnly?: boolean;
}

export function ComplicationsPanel({
  patientId,
  episodeId,
  isMultifetal = false,
  onComplicationAdd,
  readOnly = false,
}: ComplicationsPanelProps) {
  const { data: session } = useSession();
  const [complications, setComplications] = useState<Complication[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // New complication form state
  const [newComplication, setNewComplication] = useState<Partial<Complication>>({
    type: 'other',
    severity: 'mild',
    status: 'active',
    detectedAt: '',
    detectedDate: new Date().toISOString().split('T')[0],
    description: '',
    actionsTaken: [],
    supportServices: [],
    notes: '',
  });

  // Mock data for demo - in production, fetch from API
  useEffect(() => {
    // Simulate fetching complications
    setComplications([
      {
        id: '1',
        type: 'gestational_diabetes',
        severity: 'moderate',
        detectedAt: '24w 3d',
        detectedDate: '2025-02-15',
        status: 'monitoring',
        description: 'Failed glucose challenge test (168 mg/dL). OGTT confirmed GDM.',
        actionsTaken: [
          { id: '1a', type: 'referral', description: 'Referred to MFM for dietary counseling', status: 'completed', date: '2025-02-16' },
          { id: '1b', type: 'medication', description: 'Started on Metformin 500mg BID', status: 'completed', date: '2025-02-18' },
          { id: '1c', type: 'task', description: 'Weekly glucose monitoring', status: 'pending', date: '2025-02-20' },
        ],
        supportServices: ['Diabetes education', 'Nutritional counseling'],
        notes: 'A1C at diagnosis: 5.9%. Target fasting <95, 2h PP <120.',
        lastUpdated: '2025-02-18',
        updatedBy: 'Dr. Smith',
      },
    ]);
  }, [patientId, episodeId]);

  const handleSaveComplication = async () => {
    if (!newComplication.type || !newComplication.detectedDate) return;
    
    setSaving(true);
    try {
      const complication: Complication = {
        id: Date.now().toString(),
        type: newComplication.type as ComplicationType,
        severity: newComplication.severity || 'mild',
        status: newComplication.status || 'active',
        detectedAt: newComplication.detectedAt || '',
        detectedDate: newComplication.detectedDate || '',
        description: newComplication.description || '',
        actionsTaken: newComplication.actionsTaken || [],
        supportServices: newComplication.supportServices || [],
        notes: newComplication.notes || '',
        lastUpdated: new Date().toISOString(),
        updatedBy: session?.user?.name || 'Unknown',
      };
      
      setComplications(prev => [complication, ...prev]);
      
      if (onComplicationAdd) {
        onComplicationAdd(complication);
      }
      
      // Reset form
      setNewComplication({
        type: 'other',
        severity: 'mild',
        status: 'active',
        detectedAt: '',
        detectedDate: new Date().toISOString().split('T')[0],
        description: '',
        actionsTaken: [],
        supportServices: [],
        notes: '',
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving complication:', error);
    } finally {
      setSaving(false);
    }
  };

  const activeComplications = complications.filter(c => c.status === 'active' || c.status === 'monitoring');
  const resolvedComplications = complications.filter(c => c.status === 'resolved' || c.status === 'resultedInLoss');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <h2 className="text-base font-bold">Complications & Risk Management</h2>
              <p className="text-[10px] text-red-100">
                {activeComplications.length} active • {resolvedComplications.length} resolved
              </p>
            </div>
          </div>
          {!readOnly && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 text-xs bg-white text-red-600 rounded hover:bg-red-50 font-semibold flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Complication
            </button>
          )}
        </div>
      </div>

      {/* TTTS Warning for Multifetal */}
      {isMultifetal && !complications.some(c => c.type === 'ttts') && (
        <div className="mx-4 mt-3 bg-amber-50 border border-amber-300 rounded p-2 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-amber-900">Multifetal Pregnancy Alert</div>
            <div className="text-[10px] text-amber-800">
              Monitor for TTTS (Twin-to-Twin Transfusion Syndrome). Schedule serial Doppler surveillance.
            </div>
          </div>
        </div>
      )}

      {/* Add Complication Form */}
      {showAddForm && (
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Type Selection */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">
                Complication Type
              </label>
              <select
                value={newComplication.type}
                onChange={(e) => setNewComplication(prev => ({ ...prev, type: e.target.value as ComplicationType }))}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500"
              >
                {Object.entries(COMPLICATION_TYPES).map(([key, value]) => (
                  <option key={key} value={key}>{value.label}</option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">
                Severity
              </label>
              <select
                value={newComplication.severity}
                onChange={(e) => setNewComplication(prev => ({ ...prev, severity: e.target.value as Complication['severity'] }))}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500"
              >
                {Object.entries(SEVERITY_CONFIG).map(([key, value]) => (
                  <option key={key} value={key}>{value.label}</option>
                ))}
              </select>
            </div>

            {/* Detected At (GA) */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">
                Gestational Age at Detection
              </label>
              <input
                type="text"
                value={newComplication.detectedAt}
                onChange={(e) => setNewComplication(prev => ({ ...prev, detectedAt: e.target.value }))}
                placeholder="e.g., 24w 3d"
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">
                Detection Date
              </label>
              <input
                type="date"
                value={newComplication.detectedDate}
                onChange={(e) => setNewComplication(prev => ({ ...prev, detectedDate: e.target.value }))}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">
                Description
              </label>
              <textarea
                value={newComplication.description}
                onChange={(e) => setNewComplication(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Clinical findings, test results, symptoms..."
                rows={2}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveComplication}
              disabled={saving || !newComplication.type}
              className="px-4 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Save Complication
            </button>
          </div>
        </div>
      )}

      {/* Complications List */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-red-600" />
          </div>
        ) : complications.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No complications recorded</p>
            <p className="text-xs text-gray-500 mt-1">Pregnancy proceeding normally</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Active Complications */}
            {activeComplications.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-red-600 uppercase mb-2 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Active Complications ({activeComplications.length})
                </div>
                <div className="space-y-2">
                  {activeComplications.map((comp) => (
                    <ComplicationCard
                      key={comp.id}
                      complication={comp}
                      expanded={expandedId === comp.id}
                      onToggle={() => setExpandedId(expandedId === comp.id ? null : comp.id)}
                      readOnly={readOnly}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Resolved Complications */}
            {resolvedComplications.length > 0 && (
              <div className="mt-4">
                <div className="text-[10px] font-bold text-gray-500 uppercase mb-2 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Resolved ({resolvedComplications.length})
                </div>
                <div className="space-y-2 opacity-75">
                  {resolvedComplications.map((comp) => (
                    <ComplicationCard
                      key={comp.id}
                      complication={comp}
                      expanded={expandedId === comp.id}
                      onToggle={() => setExpandedId(expandedId === comp.id ? null : comp.id)}
                      readOnly={readOnly}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Reference */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
        <div className="text-[9px] text-gray-500">
          <span className="font-semibold">Management Priorities:</span>{' '}
          Critical → immediate intervention | Severe → urgent referral | Moderate → close monitoring | Mild → routine follow-up
        </div>
      </div>
    </div>
  );
}

interface ComplicationCardProps {
  complication: Complication;
  expanded: boolean;
  onToggle: () => void;
  readOnly: boolean;
}

function ComplicationCard({ complication, expanded, onToggle, readOnly }: ComplicationCardProps) {
  const typeConfig = COMPLICATION_TYPES[complication.type];
  const severityConfig = SEVERITY_CONFIG[complication.severity];
  const statusConfig = STATUS_CONFIG[complication.status];

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className={`${typeConfig.color}`}>
            {typeConfig.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">
                {typeConfig.label}
              </span>
              <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${severityConfig.color}`}>
                {severityConfig.label}
              </span>
              <span className={`px-1.5 py-0.5 text-[9px] font-medium rounded flex items-center gap-1 ${statusConfig.color}`}>
                {statusConfig.icon}
                {statusConfig.label}
              </span>
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              Detected at {complication.detectedAt} ({format(new Date(complication.detectedDate), 'MMM d, yyyy')})
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400">
            {complication.actionsTaken.length} actions
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-200 p-3 space-y-3">
          {/* Description */}
          <div>
            <div className="text-[10px] font-semibold text-gray-700 uppercase mb-1">Description</div>
            <p className="text-xs text-gray-700">{complication.description}</p>
          </div>

          {/* Actions Taken */}
          {complication.actionsTaken.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-gray-700 uppercase mb-1">Actions Taken</div>
              <div className="space-y-1">
                {complication.actionsTaken.map((action) => (
                  <div key={action.id} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                    <div className="flex items-center gap-2">
                      {action.type === 'medication' && <Pill className="h-3 w-3 text-blue-500" />}
                      {action.type === 'referral' && <FileText className="h-3 w-3 text-purple-500" />}
                      {action.type === 'order' && <Activity className="h-3 w-3 text-green-500" />}
                      {action.type === 'task' && <Clock className="h-3 w-3 text-orange-500" />}
                      {action.type === 'procedure' && <Activity className="h-3 w-3 text-red-500" />}
                      <span className="text-gray-700">{action.description}</span>
                    </div>
                    <span className={`px-1.5 py-0.5 text-[9px] rounded ${
                      action.status === 'completed' ? 'bg-green-100 text-green-700' :
                      action.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {action.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Support Services */}
          {complication.supportServices.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-gray-700 uppercase mb-1">Support Services</div>
              <div className="flex flex-wrap gap-1">
                {complication.supportServices.map((service, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-[10px] bg-blue-50 text-blue-700 rounded">
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {complication.notes && (
            <div>
              <div className="text-[10px] font-semibold text-gray-700 uppercase mb-1">Clinical Notes</div>
              <p className="text-xs text-gray-600 italic">{complication.notes}</p>
            </div>
          )}

          {/* Last Updated */}
          <div className="text-[9px] text-gray-400 pt-2 border-t border-gray-100">
            Last updated: {format(new Date(complication.lastUpdated), 'MMM d, yyyy')} by {complication.updatedBy}
          </div>
        </div>
      )}
    </div>
  );
}
