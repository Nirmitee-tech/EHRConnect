'use client';

import React, { useState, useEffect } from 'react';
import {
  Baby, Plus, Save, X, CheckCircle, AlertTriangle, Heart,
  Scale, Ruler, Clock, Activity, FileText, Loader2, Edit2,
  Hospital, User, ChevronDown, ChevronUp
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';

/**
 * BABY LINKAGE PANEL
 * ==================
 * 
 * Per docsv2/speciality/gynanc/babies-linkage:
 * - Creates/links newborn records at delivery
 * - Tracks Apgar scores, birth weight, measurements
 * - NICU admission tracking
 * - Supports multiple births (twins, triplets)
 * - Links baby to maternal episode
 */

interface BabyRecord {
  id: string;
  birthOrder: 'A' | 'B' | 'C' | 'D';
  sex: 'Male' | 'Female' | 'Unknown';
  birthDateTime: string;
  gestationalAgeAtBirth: string;
  birthWeight: number; // grams
  birthLength?: number; // cm
  headCircumference?: number; // cm
  apgarScores: {
    oneMinute: number;
    fiveMinute: number;
    tenMinute?: number;
  };
  resuscitation: 'None' | 'Stimulation' | 'PPV' | 'Intubation' | 'CPR';
  cordBlood: boolean;
  skinToSkin: boolean;
  breastfeedingInitiated: boolean;
  vitaminK: boolean;
  eyeProphylaxis: boolean;
  nicuAdmission: {
    required: boolean;
    reason?: string;
    admissionTime?: string;
    wardId?: string;
    bedId?: string;
  };
  twinType?: 'Monochorionic-Monoamniotic' | 'Monochorionic-Diamniotic' | 'Dichorionic-Diamniotic';
  tttsStatus?: 'None' | 'Recipient' | 'Donor';
  maternalPatientId: string;
  deliveryEncounterId: string;
  createdAt: string;
  createdBy: string;
}

interface BabyLinkagePanelProps {
  patientId: string;
  episodeId?: string;
  deliveryEncounterId?: string;
  deliveryDateTime?: string;
  gestationalAge?: string;
  fetalCount?: number;
  isMultifetal?: boolean;
  onBabyCreated?: (baby: BabyRecord) => void;
  readOnly?: boolean;
}

const APGAR_CRITERIA = [
  { score: 0, label: 'Absent/Blue', color: 'bg-red-200 text-red-800' },
  { score: 1, label: 'Intermediate', color: 'bg-yellow-200 text-yellow-800' },
  { score: 2, label: 'Normal/Good', color: 'bg-green-200 text-green-800' },
];

function getApgarInterpretation(score: number): { label: string; color: string } {
  if (score >= 7) return { label: 'Normal', color: 'text-green-600 bg-green-100' };
  if (score >= 4) return { label: 'Moderate Depression', color: 'text-yellow-600 bg-yellow-100' };
  return { label: 'Severe Depression', color: 'text-red-600 bg-red-100' };
}

export function BabyLinkagePanel({
  patientId,
  episodeId,
  deliveryEncounterId,
  deliveryDateTime,
  gestationalAge,
  fetalCount = 1,
  isMultifetal = false,
  onBabyCreated,
  readOnly = false,
}: BabyLinkagePanelProps) {
  const { data: session } = useSession();
  const [babies, setBabies] = useState<BabyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedBaby, setExpandedBaby] = useState<string | null>(null);
  
  // Form state for new baby
  const [formData, setFormData] = useState<Partial<BabyRecord>>({
    birthOrder: 'A',
    sex: 'Unknown',
    birthDateTime: deliveryDateTime || '',
    gestationalAgeAtBirth: gestationalAge || '',
    birthWeight: 3000,
    birthLength: 50,
    headCircumference: 34,
    apgarScores: { oneMinute: 8, fiveMinute: 9, tenMinute: undefined },
    resuscitation: 'None',
    cordBlood: false,
    skinToSkin: true,
    breastfeedingInitiated: true,
    vitaminK: true,
    eyeProphylaxis: true,
    nicuAdmission: { required: false },
    twinType: undefined,
    tttsStatus: 'None',
  });

  // Auto-suggest next birth order
  useEffect(() => {
    if (babies.length > 0) {
      const orders = ['A', 'B', 'C', 'D'] as const;
      const usedOrders = babies.map(b => b.birthOrder);
      const nextOrder = orders.find(o => !usedOrders.includes(o)) || 'A';
      setFormData(prev => ({ ...prev, birthOrder: nextOrder }));
    }
  }, [babies]);

  const handleSaveBaby = async () => {
    if (!formData.birthWeight) return;
    
    setSaving(true);
    try {
      const newBaby: BabyRecord = {
        id: `baby-${Date.now()}`,
        birthOrder: formData.birthOrder || 'A',
        sex: formData.sex || 'Unknown',
        birthDateTime: formData.birthDateTime || new Date().toISOString(),
        gestationalAgeAtBirth: formData.gestationalAgeAtBirth || '',
        birthWeight: formData.birthWeight,
        birthLength: formData.birthLength,
        headCircumference: formData.headCircumference,
        apgarScores: formData.apgarScores || { oneMinute: 0, fiveMinute: 0 },
        resuscitation: formData.resuscitation || 'None',
        cordBlood: formData.cordBlood || false,
        skinToSkin: formData.skinToSkin || false,
        breastfeedingInitiated: formData.breastfeedingInitiated || false,
        vitaminK: formData.vitaminK || false,
        eyeProphylaxis: formData.eyeProphylaxis || false,
        nicuAdmission: formData.nicuAdmission || { required: false },
        twinType: isMultifetal ? formData.twinType : undefined,
        tttsStatus: isMultifetal ? formData.tttsStatus : undefined,
        maternalPatientId: patientId,
        deliveryEncounterId: deliveryEncounterId || '',
        createdAt: new Date().toISOString(),
        createdBy: session?.user?.name || 'Unknown',
      };

      setBabies(prev => [...prev, newBaby]);
      
      if (onBabyCreated) {
        onBabyCreated(newBaby);
      }

      // Reset form
      setFormData({
        birthOrder: (['A', 'B', 'C', 'D'] as const).find(o => ![...babies.map(b => b.birthOrder), newBaby.birthOrder].includes(o)) || 'A',
        sex: 'Unknown',
        birthDateTime: deliveryDateTime || '',
        gestationalAgeAtBirth: gestationalAge || '',
        birthWeight: 3000,
        birthLength: 50,
        headCircumference: 34,
        apgarScores: { oneMinute: 8, fiveMinute: 9 },
        resuscitation: 'None',
        cordBlood: false,
        skinToSkin: true,
        breastfeedingInitiated: true,
        vitaminK: true,
        eyeProphylaxis: true,
        nicuAdmission: { required: false },
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving baby record:', error);
    } finally {
      setSaving(false);
    }
  };

  const remainingBabies = fetalCount - babies.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Baby className="h-5 w-5" />
            <div>
              <h2 className="text-base font-bold">Newborn Records</h2>
              <p className="text-[10px] text-blue-100">
                {babies.length} of {fetalCount} baby record(s) created
              </p>
            </div>
          </div>
          {!readOnly && remainingBabies > 0 && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 text-xs bg-white text-blue-600 rounded hover:bg-blue-50 font-semibold flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Baby {String.fromCharCode(65 + babies.length)}
            </button>
          )}
        </div>
      </div>

      {/* Warning if babies remaining */}
      {remainingBabies > 0 && !showAddForm && (
        <div className="mx-4 mt-3 bg-amber-50 border border-amber-300 rounded p-2 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-amber-900">
              {remainingBabies} Baby Record{remainingBabies > 1 ? 's' : ''} Pending
            </div>
            <div className="text-[10px] text-amber-800">
              Delivery documentation requires newborn data for all {fetalCount} {fetalCount > 1 ? 'babies' : 'baby'}.
            </div>
          </div>
        </div>
      )}

      {/* Add Baby Form */}
      {showAddForm && (
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Baby className="h-4 w-4 text-blue-600" />
            Baby {formData.birthOrder} Details
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Birth Order & Sex */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">
                Birth Order
              </label>
              <select
                value={formData.birthOrder}
                onChange={(e) => setFormData(prev => ({ ...prev, birthOrder: e.target.value as 'A' | 'B' | 'C' | 'D' }))}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
              >
                {['A', 'B', 'C', 'D'].map(order => (
                  <option key={order} value={order} disabled={babies.some(b => b.birthOrder === order)}>
                    Baby {order}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">
                Sex
              </label>
              <select
                value={formData.sex}
                onChange={(e) => setFormData(prev => ({ ...prev, sex: e.target.value as BabyRecord['sex'] }))}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">
                Birth Date/Time
              </label>
              <input
                type="datetime-local"
                value={formData.birthDateTime}
                onChange={(e) => setFormData(prev => ({ ...prev, birthDateTime: e.target.value }))}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
              />
            </div>

            {/* Measurements */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">
                Birth Weight (g)
              </label>
              <input
                type="number"
                value={formData.birthWeight}
                onChange={(e) => setFormData(prev => ({ ...prev, birthWeight: parseInt(e.target.value) }))}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">
                Length (cm)
              </label>
              <input
                type="number"
                value={formData.birthLength}
                onChange={(e) => setFormData(prev => ({ ...prev, birthLength: parseInt(e.target.value) }))}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">
                Head Circumference (cm)
              </label>
              <input
                type="number"
                value={formData.headCircumference}
                onChange={(e) => setFormData(prev => ({ ...prev, headCircumference: parseInt(e.target.value) }))}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
              />
            </div>

            {/* Apgar Scores */}
            <div className="col-span-3">
              <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-2">
                Apgar Scores
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-600">1 min:</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.apgarScores?.oneMinute ?? 0}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      apgarScores: { ...prev.apgarScores!, oneMinute: parseInt(e.target.value) }
                    }))}
                    className="w-14 px-2 py-1 text-xs border border-gray-300 rounded text-center"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-600">5 min:</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.apgarScores?.fiveMinute ?? 0}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      apgarScores: { ...prev.apgarScores!, fiveMinute: parseInt(e.target.value) }
                    }))}
                    className="w-14 px-2 py-1 text-xs border border-gray-300 rounded text-center"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-600">10 min:</span>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.apgarScores?.tenMinute ?? ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      apgarScores: { ...prev.apgarScores!, tenMinute: e.target.value ? parseInt(e.target.value) : undefined }
                    }))}
                    className="w-14 px-2 py-1 text-xs border border-gray-300 rounded text-center"
                    placeholder="-"
                  />
                </div>
              </div>
            </div>

            {/* Resuscitation */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">
                Resuscitation
              </label>
              <select
                value={formData.resuscitation}
                onChange={(e) => setFormData(prev => ({ ...prev, resuscitation: e.target.value as BabyRecord['resuscitation'] }))}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
              >
                <option value="None">None required</option>
                <option value="Stimulation">Stimulation only</option>
                <option value="PPV">PPV (Bag-mask)</option>
                <option value="Intubation">Intubation</option>
                <option value="CPR">CPR + Medications</option>
              </select>
            </div>

            {/* NICU Admission */}
            <div className="col-span-2">
              <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">
                NICU Admission
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.nicuAdmission?.required}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      nicuAdmission: { ...prev.nicuAdmission!, required: e.target.checked }
                    }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-xs text-gray-700">Required</span>
                </label>
                {formData.nicuAdmission?.required && (
                  <input
                    type="text"
                    value={formData.nicuAdmission?.reason || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      nicuAdmission: { ...prev.nicuAdmission!, reason: e.target.value }
                    }))}
                    placeholder="Reason for admission"
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                )}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="col-span-3">
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.skinToSkin}
                    onChange={(e) => setFormData(prev => ({ ...prev, skinToSkin: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-xs text-gray-700">Skin-to-skin</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.breastfeedingInitiated}
                    onChange={(e) => setFormData(prev => ({ ...prev, breastfeedingInitiated: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-xs text-gray-700">Breastfeeding initiated</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.vitaminK}
                    onChange={(e) => setFormData(prev => ({ ...prev, vitaminK: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-xs text-gray-700">Vitamin K given</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.eyeProphylaxis}
                    onChange={(e) => setFormData(prev => ({ ...prev, eyeProphylaxis: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-xs text-gray-700">Eye prophylaxis</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.cordBlood}
                    onChange={(e) => setFormData(prev => ({ ...prev, cordBlood: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-xs text-gray-700">Cord blood collected</span>
                </label>
              </div>
            </div>

            {/* Twin-specific fields */}
            {isMultifetal && (
              <>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">
                    Twin Type
                  </label>
                  <select
                    value={formData.twinType || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, twinType: e.target.value as BabyRecord['twinType'] }))}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                  >
                    <option value="">Select...</option>
                    <option value="Monochorionic-Monoamniotic">Mo-Mo</option>
                    <option value="Monochorionic-Diamniotic">Mo-Di</option>
                    <option value="Dichorionic-Diamniotic">Di-Di</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-gray-700 uppercase mb-1">
                    TTTS Status
                  </label>
                  <select
                    value={formData.tttsStatus || 'None'}
                    onChange={(e) => setFormData(prev => ({ ...prev, tttsStatus: e.target.value as BabyRecord['tttsStatus'] }))}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                  >
                    <option value="None">N/A</option>
                    <option value="Recipient">Recipient</option>
                    <option value="Donor">Donor</option>
                  </select>
                </div>
              </>
            )}
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
              onClick={handleSaveBaby}
              disabled={saving || !formData.birthWeight}
              className="px-4 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Create Baby Record
            </button>
          </div>
        </div>
      )}

      {/* Baby Cards */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : babies.length === 0 && !showAddForm ? (
          <div className="text-center py-8">
            <Baby className="h-10 w-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No baby records yet</p>
            <p className="text-xs text-gray-500 mt-1">
              Add newborn data to complete delivery documentation
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {babies.map((baby) => (
              <BabyCard
                key={baby.id}
                baby={baby}
                expanded={expandedBaby === baby.id}
                onToggle={() => setExpandedBaby(expandedBaby === baby.id ? null : baby.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface BabyCardProps {
  baby: BabyRecord;
  expanded: boolean;
  onToggle: () => void;
}

function BabyCard({ baby, expanded, onToggle }: BabyCardProps) {
  const apgar1Interp = getApgarInterpretation(baby.apgarScores.oneMinute);
  const apgar5Interp = getApgarInterpretation(baby.apgarScores.fiveMinute);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            baby.sex === 'Male' ? 'bg-blue-100 text-blue-600' :
            baby.sex === 'Female' ? 'bg-pink-100 text-pink-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            <Baby className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">
                Baby {baby.birthOrder}
              </span>
              <span className={`px-1.5 py-0.5 text-[9px] font-medium rounded ${
                baby.sex === 'Male' ? 'bg-blue-100 text-blue-700' :
                baby.sex === 'Female' ? 'bg-pink-100 text-pink-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {baby.sex}
              </span>
              {baby.nicuAdmission.required && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-red-100 text-red-700 rounded flex items-center gap-1">
                  <Hospital className="h-2.5 w-2.5" />
                  NICU
                </span>
              )}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              {baby.birthWeight}g • Apgar {baby.apgarScores.oneMinute}/{baby.apgarScores.fiveMinute}
              {baby.apgarScores.tenMinute !== undefined && `/${baby.apgarScores.tenMinute}`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-1.5 py-0.5 text-[9px] font-medium rounded ${apgar5Interp.color}`}>
            {apgar5Interp.label}
          </div>
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
          {/* Measurements */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded p-2">
              <div className="text-[9px] text-gray-500 uppercase mb-0.5">Weight</div>
              <div className="text-sm font-bold text-gray-900">{baby.birthWeight} g</div>
              <div className="text-[10px] text-gray-500">
                {(baby.birthWeight / 1000).toFixed(2)} kg
              </div>
            </div>
            {baby.birthLength && (
              <div className="bg-gray-50 rounded p-2">
                <div className="text-[9px] text-gray-500 uppercase mb-0.5">Length</div>
                <div className="text-sm font-bold text-gray-900">{baby.birthLength} cm</div>
              </div>
            )}
            {baby.headCircumference && (
              <div className="bg-gray-50 rounded p-2">
                <div className="text-[9px] text-gray-500 uppercase mb-0.5">Head Circ.</div>
                <div className="text-sm font-bold text-gray-900">{baby.headCircumference} cm</div>
              </div>
            )}
          </div>

          {/* Apgar Details */}
          <div>
            <div className="text-[10px] font-semibold text-gray-700 uppercase mb-2">Apgar Scores</div>
            <div className="flex items-center gap-2">
              <div className={`px-2 py-1 rounded ${apgar1Interp.color}`}>
                <div className="text-[9px]">1 min</div>
                <div className="text-lg font-bold">{baby.apgarScores.oneMinute}</div>
              </div>
              <div className={`px-2 py-1 rounded ${apgar5Interp.color}`}>
                <div className="text-[9px]">5 min</div>
                <div className="text-lg font-bold">{baby.apgarScores.fiveMinute}</div>
              </div>
              {baby.apgarScores.tenMinute !== undefined && (
                <div className={`px-2 py-1 rounded ${getApgarInterpretation(baby.apgarScores.tenMinute).color}`}>
                  <div className="text-[9px]">10 min</div>
                  <div className="text-lg font-bold">{baby.apgarScores.tenMinute}</div>
                </div>
              )}
            </div>
          </div>

          {/* Care Items */}
          <div>
            <div className="text-[10px] font-semibold text-gray-700 uppercase mb-2">Immediate Care</div>
            <div className="flex flex-wrap gap-1">
              {baby.skinToSkin && (
                <span className="px-2 py-0.5 text-[10px] bg-green-50 text-green-700 rounded flex items-center gap-1">
                  <CheckCircle className="h-2.5 w-2.5" /> Skin-to-skin
                </span>
              )}
              {baby.breastfeedingInitiated && (
                <span className="px-2 py-0.5 text-[10px] bg-green-50 text-green-700 rounded flex items-center gap-1">
                  <CheckCircle className="h-2.5 w-2.5" /> Breastfeeding
                </span>
              )}
              {baby.vitaminK && (
                <span className="px-2 py-0.5 text-[10px] bg-blue-50 text-blue-700 rounded flex items-center gap-1">
                  <CheckCircle className="h-2.5 w-2.5" /> Vitamin K
                </span>
              )}
              {baby.eyeProphylaxis && (
                <span className="px-2 py-0.5 text-[10px] bg-blue-50 text-blue-700 rounded flex items-center gap-1">
                  <CheckCircle className="h-2.5 w-2.5" /> Eye prophylaxis
                </span>
              )}
              {baby.resuscitation !== 'None' && (
                <span className="px-2 py-0.5 text-[10px] bg-orange-50 text-orange-700 rounded flex items-center gap-1">
                  <Activity className="h-2.5 w-2.5" /> {baby.resuscitation}
                </span>
              )}
            </div>
          </div>

          {/* NICU Info */}
          {baby.nicuAdmission.required && (
            <div className="bg-red-50 border border-red-200 rounded p-2">
              <div className="text-[10px] font-semibold text-red-700 uppercase mb-1 flex items-center gap-1">
                <Hospital className="h-3 w-3" /> NICU Admission
              </div>
              <div className="text-xs text-red-800">{baby.nicuAdmission.reason}</div>
            </div>
          )}

          {/* Twin-specific */}
          {baby.twinType && (
            <div className="text-xs text-gray-600">
              <span className="font-semibold">Twin Type:</span> {baby.twinType}
              {baby.tttsStatus && baby.tttsStatus !== 'None' && (
                <span className="ml-2">• TTTS: {baby.tttsStatus}</span>
              )}
            </div>
          )}

          {/* Created Info */}
          <div className="text-[9px] text-gray-400 pt-2 border-t border-gray-100">
            Created: {format(new Date(baby.createdAt), 'MMM d, yyyy HH:mm')} by {baby.createdBy}
          </div>
        </div>
      )}
    </div>
  );
}
