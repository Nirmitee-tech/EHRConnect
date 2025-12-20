'use client';

import React, { useState, useEffect } from 'react';
import {
  Baby, Clock, AlertTriangle, CheckCircle, User, Activity,
  Droplet, Heart, FileText, Save, X, Calendar, Stethoscope,
  Scale, Ruler, Scissors, Syringe, Thermometer, Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import obgynService, { LaborDeliveryRecord } from '@/services/obgyn.service';

/**
 * LABOR & DELIVERY SUMMARY COMPONENT
 * ===================================
 * 
 * Compact documentation panel for delivery events.
 * Records essential delivery data for clinical and legal documentation.
 * 
 * KEY SECTIONS:
 * - Delivery Details (mode, indication, date/time)
 * - Labor Progress (stages, duration, interventions)
 * - Anesthesia & Medications
 * - Maternal Outcomes (blood loss, complications, lacerations)
 * - Newborn Summary (Apgar, weight, resuscitation)
 */

interface DeliveryData {
  // Delivery Info
  deliveryDateTime: string;
  gestationalAge: string;
  deliveryMode: 'SVD' | 'Cesarean' | 'Vacuum' | 'Forceps' | 'VBAC';
  indication?: string;
  
  // Labor Progress
  laborOnset: 'Spontaneous' | 'Induced' | 'Augmented';
  inductionMethod?: string;
  stage1Duration?: number; // hours
  stage2Duration?: number; // minutes
  stage3Duration?: number; // minutes
  ruptureOfMembranes: 'Spontaneous' | 'Artificial' | 'Intact at delivery';
  romDateTime?: string;
  amnioticFluid: 'Clear' | 'Meconium-stained' | 'Bloody' | 'Foul-smelling';
  
  // Anesthesia
  anesthesiaType: 'None' | 'Epidural' | 'Spinal' | 'Combined Spinal-Epidural' | 'General' | 'Local';
  anesthesiaProvider?: string;
  
  // Cesarean Details (if applicable)
  cesareanType?: 'Primary' | 'Repeat';
  uterineIncision?: 'Low transverse' | 'Classical' | 'Low vertical';
  cesareanIndication?: string;
  
  // Maternal Outcomes
  bloodLoss: number; // mL
  bloodLossCategory: 'Normal' | 'PPH' | 'Massive PPH';
  episiotomy: 'None' | 'Midline' | 'Mediolateral';
  laceration?: 'None' | '1st degree' | '2nd degree' | '3rd degree' | '4th degree';
  perinealRepair?: boolean;
  uterotonicGiven: boolean;
  uterotonic?: string;
  placentaDelivery: 'Spontaneous' | 'Manual removal' | 'Retained';
  
  // Complications
  maternalComplications: string[];
  
  // Newborn
  newborn: {
    sex: 'Male' | 'Female' | 'Unknown';
    birthWeight: number; // grams
    birthLength?: number; // cm
    headCircumference?: number; // cm
    apgar1: number;
    apgar5: number;
    apgar10?: number;
    resuscitation: 'None' | 'Stimulation' | 'Suction' | 'PPV' | 'Intubation' | 'CPR';
    cordClamping: 'Immediate' | 'Delayed';
    cordBlood: boolean;
    skinToSkin: boolean;
    breastfeedingInitiated: boolean;
    nicuAdmission: boolean;
    nicuReason?: string;
  };
  
  // Staff
  deliveryProvider: string;
  attendingPhysician?: string;
  pediatrician?: string;
  nurses?: string[];
  
  notes?: string;
}

interface LaborDeliverySummaryProps {
  patientId: string;
  episodeId?: string;
  existingData?: Partial<DeliveryData>;
  onSave?: (data: DeliveryData) => void;
  readOnly?: boolean;
}

export function LaborDeliverySummary({
  patientId,
  episodeId,
  existingData,
  onSave,
  readOnly = false
}: LaborDeliverySummaryProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(!existingData);
  const [activeTab, setActiveTab] = useState<'delivery' | 'labor' | 'maternal' | 'newborn'>('delivery');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state with defaults
  const [formData, setFormData] = useState<Partial<DeliveryData>>({
    deliveryDateTime: existingData?.deliveryDateTime || '',
    gestationalAge: existingData?.gestationalAge || '',
    deliveryMode: existingData?.deliveryMode || 'SVD',
    laborOnset: existingData?.laborOnset || 'Spontaneous',
    ruptureOfMembranes: existingData?.ruptureOfMembranes || 'Spontaneous',
    amnioticFluid: existingData?.amnioticFluid || 'Clear',
    anesthesiaType: existingData?.anesthesiaType || 'None',
    bloodLoss: existingData?.bloodLoss || 300,
    bloodLossCategory: existingData?.bloodLossCategory || 'Normal',
    episiotomy: existingData?.episiotomy || 'None',
    laceration: existingData?.laceration || 'None',
    uterotonicGiven: existingData?.uterotonicGiven ?? true,
    uterotonic: existingData?.uterotonic || 'Oxytocin 10 IU IM',
    placentaDelivery: existingData?.placentaDelivery || 'Spontaneous',
    maternalComplications: existingData?.maternalComplications || [],
    deliveryProvider: existingData?.deliveryProvider || '',
    newborn: {
      sex: existingData?.newborn?.sex || 'Male',
      birthWeight: existingData?.newborn?.birthWeight || 3200,
      apgar1: existingData?.newborn?.apgar1 || 8,
      apgar5: existingData?.newborn?.apgar5 || 9,
      resuscitation: existingData?.newborn?.resuscitation || 'None',
      cordClamping: existingData?.newborn?.cordClamping || 'Delayed',
      cordBlood: existingData?.newborn?.cordBlood || false,
      skinToSkin: existingData?.newborn?.skinToSkin || true,
      breastfeedingInitiated: existingData?.newborn?.breastfeedingInitiated || true,
      nicuAdmission: existingData?.newborn?.nicuAdmission || false,
    },
    ...existingData
  });

  // Fetch existing record from API
  useEffect(() => {
    async function fetchRecord() {
      if (!episodeId || existingData) return;
      setLoading(true);
      try {
        const headers = {
          'x-org-id': (session as any)?.org_id || '',
          'x-user-id': (session as any)?.user?.id || ''
        };
        const record = await obgynService.getLaborDeliveryRecord(patientId, episodeId, headers);
        if (record) {
          setFormData(record as any);
          setIsEditing(false);
        }
      } catch (error) {
        console.error('Error fetching labor/delivery record:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchRecord();
  }, [patientId, episodeId, existingData, session]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNewborn = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      newborn: {
        ...prev.newborn!,
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!formData) return;
    
    setSaving(true);
    try {
      const headers = {
        'x-org-id': (session as any)?.org_id || '',
        'x-user-id': (session as any)?.user?.id || ''
      };
      
      await obgynService.saveLaborDeliveryRecord(patientId, {
        ...formData,
        episodeId
      } as LaborDeliveryRecord, headers);
      
      if (onSave) {
        onSave(formData as DeliveryData);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving labor/delivery record:', error);
    } finally {
      setSaving(false);
    }
  };

  // Calculate blood loss category
  const getBloodLossCategory = (ml: number): string => {
    if (formData.deliveryMode === 'Cesarean') {
      if (ml >= 1500) return 'Massive PPH';
      if (ml >= 1000) return 'PPH';
      return 'Normal';
    }
    if (ml >= 1000) return 'Massive PPH';
    if (ml >= 500) return 'PPH';
    return 'Normal';
  };

  // Get Apgar interpretation
  const getApgarStatus = (score: number) => {
    if (score >= 7) return { label: 'Normal', color: 'text-green-600 bg-green-100' };
    if (score >= 4) return { label: 'Moderate', color: 'text-yellow-600 bg-yellow-100' };
    return { label: 'Low', color: 'text-red-600 bg-red-100' };
  };

  const tabs = [
    { id: 'delivery', label: 'Delivery', icon: Baby },
    { id: 'labor', label: 'Labor', icon: Clock },
    { id: 'maternal', label: 'Maternal', icon: Heart },
    { id: 'newborn', label: 'Newborn', icon: Scale }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Baby className="h-5 w-5" />
            <div>
              <h2 className="text-base font-bold">Labor & Delivery Summary</h2>
              <p className="text-[10px] text-pink-100">
                {formData.deliveryDateTime 
                  ? `Delivered: ${format(new Date(formData.deliveryDateTime), 'MMM d, yyyy HH:mm')}`
                  : 'Document delivery details'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!readOnly && (
              isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-2 py-1 text-xs bg-white/20 rounded hover:bg-white/30"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-2 py-1 text-xs bg-white text-pink-600 rounded hover:bg-white/90 flex items-center gap-1 font-semibold disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Save className="h-3 w-3" />
                    )}
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-2 py-1 text-xs bg-white/20 rounded hover:bg-white/30"
                >
                  Edit
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-3 py-2 text-xs font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-pink-500 text-pink-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Delivery Tab */}
        {activeTab === 'delivery' && (
          <div className="space-y-4">
            {/* Key Info Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Date/Time</label>
                {isEditing ? (
                  <input
                    type="datetime-local"
                    value={formData.deliveryDateTime || ''}
                    onChange={e => updateField('deliveryDateTime', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-pink-500"
                  />
                ) : (
                  <div className="text-sm font-semibold text-gray-900">
                    {formData.deliveryDateTime 
                      ? format(new Date(formData.deliveryDateTime), 'MM/dd/yyyy HH:mm')
                      : '—'
                    }
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">GA at Delivery</label>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="39w 2d"
                    value={formData.gestationalAge || ''}
                    onChange={e => updateField('gestationalAge', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-pink-500"
                  />
                ) : (
                  <div className="text-sm font-semibold text-gray-900">{formData.gestationalAge || '—'}</div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Delivery Mode</label>
                {isEditing ? (
                  <select
                    value={formData.deliveryMode || 'SVD'}
                    onChange={e => updateField('deliveryMode', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-pink-500"
                  >
                    <option value="SVD">SVD (Vaginal)</option>
                    <option value="Cesarean">Cesarean Section</option>
                    <option value="Vacuum">Vacuum Assisted</option>
                    <option value="Forceps">Forceps Assisted</option>
                    <option value="VBAC">VBAC</option>
                  </select>
                ) : (
                  <div className={`text-sm font-semibold ${
                    formData.deliveryMode === 'Cesarean' ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {formData.deliveryMode}
                  </div>
                )}
              </div>
            </div>

            {/* Cesarean Details (if applicable) */}
            {formData.deliveryMode === 'Cesarean' && (
              <div className="bg-orange-50 border border-orange-200 rounded p-3">
                <div className="text-xs font-semibold text-orange-800 mb-2 flex items-center gap-1">
                  <Scissors className="h-3 w-3" />
                  Cesarean Section Details
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-gray-600 mb-1">Type</label>
                    {isEditing ? (
                      <select
                        value={formData.cesareanType || 'Primary'}
                        onChange={e => updateField('cesareanType', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      >
                        <option value="Primary">Primary</option>
                        <option value="Repeat">Repeat</option>
                      </select>
                    ) : (
                      <div className="text-xs font-medium">{formData.cesareanType || '—'}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-600 mb-1">Uterine Incision</label>
                    {isEditing ? (
                      <select
                        value={formData.uterineIncision || 'Low transverse'}
                        onChange={e => updateField('uterineIncision', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      >
                        <option value="Low transverse">Low transverse</option>
                        <option value="Low vertical">Low vertical</option>
                        <option value="Classical">Classical</option>
                      </select>
                    ) : (
                      <div className="text-xs font-medium">{formData.uterineIncision || '—'}</div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-600 mb-1">Indication</label>
                    {isEditing ? (
                      <input
                        type="text"
                        placeholder="e.g., Failure to progress"
                        value={formData.cesareanIndication || ''}
                        onChange={e => updateField('cesareanIndication', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                      />
                    ) : (
                      <div className="text-xs font-medium">{formData.cesareanIndication || '—'}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Anesthesia */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Anesthesia</label>
                {isEditing ? (
                  <select
                    value={formData.anesthesiaType || 'None'}
                    onChange={e => updateField('anesthesiaType', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-pink-500"
                  >
                    <option value="None">None</option>
                    <option value="Epidural">Epidural</option>
                    <option value="Spinal">Spinal</option>
                    <option value="Combined Spinal-Epidural">Combined Spinal-Epidural</option>
                    <option value="General">General</option>
                    <option value="Local">Local</option>
                  </select>
                ) : (
                  <div className="text-sm font-semibold text-gray-900">{formData.anesthesiaType}</div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Delivery Provider</label>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="Dr. Smith"
                    value={formData.deliveryProvider || ''}
                    onChange={e => updateField('deliveryProvider', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-pink-500"
                  />
                ) : (
                  <div className="text-sm font-semibold text-gray-900">{formData.deliveryProvider || '—'}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Labor Tab */}
        {activeTab === 'labor' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Labor Onset</label>
                {isEditing ? (
                  <select
                    value={formData.laborOnset || 'Spontaneous'}
                    onChange={e => updateField('laborOnset', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                  >
                    <option value="Spontaneous">Spontaneous</option>
                    <option value="Induced">Induced</option>
                    <option value="Augmented">Augmented</option>
                  </select>
                ) : (
                  <div className="text-sm font-semibold">{formData.laborOnset}</div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">ROM</label>
                {isEditing ? (
                  <select
                    value={formData.ruptureOfMembranes || 'Spontaneous'}
                    onChange={e => updateField('ruptureOfMembranes', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                  >
                    <option value="Spontaneous">SROM</option>
                    <option value="Artificial">AROM</option>
                    <option value="Intact at delivery">Intact at delivery</option>
                  </select>
                ) : (
                  <div className="text-sm font-semibold">{formData.ruptureOfMembranes}</div>
                )}
              </div>
            </div>

            {/* Labor Stages */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <div className="text-xs font-semibold text-blue-800 mb-2">Labor Duration</div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-600 mb-1">Stage 1 (hrs)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.5"
                      value={formData.stage1Duration || ''}
                      onChange={e => updateField('stage1Duration', parseFloat(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  ) : (
                    <div className="text-sm font-semibold">{formData.stage1Duration || '—'} hrs</div>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] text-gray-600 mb-1">Stage 2 (min)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.stage2Duration || ''}
                      onChange={e => updateField('stage2Duration', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  ) : (
                    <div className="text-sm font-semibold">{formData.stage2Duration || '—'} min</div>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] text-gray-600 mb-1">Stage 3 (min)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.stage3Duration || ''}
                      onChange={e => updateField('stage3Duration', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  ) : (
                    <div className="text-sm font-semibold">{formData.stage3Duration || '—'} min</div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Amniotic Fluid</label>
              {isEditing ? (
                <select
                  value={formData.amnioticFluid || 'Clear'}
                  onChange={e => updateField('amnioticFluid', e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                >
                  <option value="Clear">Clear</option>
                  <option value="Meconium-stained">Meconium-stained</option>
                  <option value="Bloody">Bloody</option>
                  <option value="Foul-smelling">Foul-smelling</option>
                </select>
              ) : (
                <div className={`text-sm font-semibold ${
                  formData.amnioticFluid === 'Clear' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {formData.amnioticFluid}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Maternal Tab */}
        {activeTab === 'maternal' && (
          <div className="space-y-4">
            {/* Blood Loss */}
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <div className="text-xs font-semibold text-red-800 mb-2 flex items-center gap-1">
                <Droplet className="h-3 w-3" />
                Estimated Blood Loss
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-600 mb-1">Volume (mL)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="50"
                      value={formData.bloodLoss || ''}
                      onChange={e => {
                        const val = parseInt(e.target.value);
                        updateField('bloodLoss', val);
                        updateField('bloodLossCategory', getBloodLossCategory(val));
                      }}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                    />
                  ) : (
                    <div className="text-lg font-bold text-gray-900">{formData.bloodLoss} mL</div>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] text-gray-600 mb-1">Category</label>
                  <div className={`text-sm font-bold px-2 py-1 rounded ${
                    formData.bloodLossCategory === 'Normal' ? 'bg-green-100 text-green-700' :
                    formData.bloodLossCategory === 'PPH' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {formData.bloodLossCategory}
                  </div>
                </div>
              </div>
            </div>

            {/* Perineal Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Episiotomy</label>
                {isEditing ? (
                  <select
                    value={formData.episiotomy || 'None'}
                    onChange={e => updateField('episiotomy', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                  >
                    <option value="None">None</option>
                    <option value="Midline">Midline</option>
                    <option value="Mediolateral">Mediolateral</option>
                  </select>
                ) : (
                  <div className="text-sm font-semibold">{formData.episiotomy}</div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Laceration</label>
                {isEditing ? (
                  <select
                    value={formData.laceration || 'None'}
                    onChange={e => updateField('laceration', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                  >
                    <option value="None">None</option>
                    <option value="1st degree">1st degree</option>
                    <option value="2nd degree">2nd degree</option>
                    <option value="3rd degree">3rd degree</option>
                    <option value="4th degree">4th degree</option>
                  </select>
                ) : (
                  <div className={`text-sm font-semibold ${
                    formData.laceration === 'None' || formData.laceration === '1st degree' ? 'text-gray-700' :
                    formData.laceration === '2nd degree' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {formData.laceration}
                  </div>
                )}
              </div>
            </div>

            {/* Placenta & Uterotonic */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Placenta Delivery</label>
                {isEditing ? (
                  <select
                    value={formData.placentaDelivery || 'Spontaneous'}
                    onChange={e => updateField('placentaDelivery', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                  >
                    <option value="Spontaneous">Spontaneous</option>
                    <option value="Manual removal">Manual removal</option>
                    <option value="Retained">Retained</option>
                  </select>
                ) : (
                  <div className="text-sm font-semibold">{formData.placentaDelivery}</div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Uterotonic</label>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="Oxytocin 10 IU IM"
                    value={formData.uterotonic || ''}
                    onChange={e => updateField('uterotonic', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                  />
                ) : (
                  <div className="text-sm font-semibold text-gray-700">{formData.uterotonic || '—'}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Newborn Tab */}
        {activeTab === 'newborn' && (
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Sex</label>
                {isEditing ? (
                  <select
                    value={formData.newborn?.sex || 'Male'}
                    onChange={e => updateNewborn('sex', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                ) : (
                  <div className={`text-sm font-semibold ${
                    formData.newborn?.sex === 'Male' ? 'text-blue-600' : 'text-pink-600'
                  }`}>
                    {formData.newborn?.sex}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Weight (g)</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={formData.newborn?.birthWeight || ''}
                    onChange={e => updateNewborn('birthWeight', parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                  />
                ) : (
                  <div className="text-sm font-bold text-gray-900">
                    {formData.newborn?.birthWeight} g
                    <span className="text-[10px] text-gray-500 ml-1">
                      ({((formData.newborn?.birthWeight || 0) / 453.592).toFixed(1)} lbs)
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Length (cm)</label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.5"
                    value={formData.newborn?.birthLength || ''}
                    onChange={e => updateNewborn('birthLength', parseFloat(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                  />
                ) : (
                  <div className="text-sm font-semibold">{formData.newborn?.birthLength || '—'} cm</div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Head (cm)</label>
                {isEditing ? (
                  <input
                    type="number"
                    step="0.5"
                    value={formData.newborn?.headCircumference || ''}
                    onChange={e => updateNewborn('headCircumference', parseFloat(e.target.value))}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                  />
                ) : (
                  <div className="text-sm font-semibold">{formData.newborn?.headCircumference || '—'} cm</div>
                )}
              </div>
            </div>

            {/* Apgar Scores */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <div className="text-xs font-semibold text-blue-800 mb-2">Apgar Scores</div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <label className="block text-[10px] text-gray-600 mb-1">1 minute</label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={formData.newborn?.apgar1 || ''}
                      onChange={e => updateNewborn('apgar1', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded text-center"
                    />
                  ) : (
                    <div className={`text-2xl font-bold py-1 rounded ${
                      getApgarStatus(formData.newborn?.apgar1 || 0).color
                    }`}>
                      {formData.newborn?.apgar1}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <label className="block text-[10px] text-gray-600 mb-1">5 minutes</label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={formData.newborn?.apgar5 || ''}
                      onChange={e => updateNewborn('apgar5', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded text-center"
                    />
                  ) : (
                    <div className={`text-2xl font-bold py-1 rounded ${
                      getApgarStatus(formData.newborn?.apgar5 || 0).color
                    }`}>
                      {formData.newborn?.apgar5}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <label className="block text-[10px] text-gray-600 mb-1">10 minutes</label>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={formData.newborn?.apgar10 || ''}
                      onChange={e => updateNewborn('apgar10', parseInt(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded text-center"
                    />
                  ) : (
                    <div className={`text-2xl font-bold py-1 rounded ${
                      formData.newborn?.apgar10 ? getApgarStatus(formData.newborn.apgar10).color : 'bg-gray-100'
                    }`}>
                      {formData.newborn?.apgar10 || '—'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Resuscitation & Immediate Care */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Resuscitation</label>
                {isEditing ? (
                  <select
                    value={formData.newborn?.resuscitation || 'None'}
                    onChange={e => updateNewborn('resuscitation', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                  >
                    <option value="None">None required</option>
                    <option value="Stimulation">Stimulation only</option>
                    <option value="Suction">Suction</option>
                    <option value="PPV">PPV (Bag-mask)</option>
                    <option value="Intubation">Intubation</option>
                    <option value="CPR">CPR</option>
                  </select>
                ) : (
                  <div className={`text-sm font-semibold ${
                    formData.newborn?.resuscitation === 'None' ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {formData.newborn?.resuscitation}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Cord Clamping</label>
                {isEditing ? (
                  <select
                    value={formData.newborn?.cordClamping || 'Delayed'}
                    onChange={e => updateNewborn('cordClamping', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="Delayed">Delayed (≥60 sec)</option>
                  </select>
                ) : (
                  <div className="text-sm font-semibold">{formData.newborn?.cordClamping}</div>
                )}
              </div>
            </div>

            {/* Immediate Care Checkboxes */}
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <div className="text-xs font-semibold text-green-800 mb-2">Immediate Newborn Care</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'skinToSkin', label: 'Skin-to-skin contact' },
                  { key: 'breastfeedingInitiated', label: 'Breastfeeding initiated' },
                  { key: 'cordBlood', label: 'Cord blood collected' },
                  { key: 'nicuAdmission', label: 'NICU admission required' }
                ].map(item => (
                  <label key={item.key} className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.newborn?.[item.key as keyof typeof formData.newborn] as boolean || false}
                      onChange={e => updateNewborn(item.key, e.target.checked)}
                      disabled={!isEditing}
                      className="rounded border-gray-300"
                    />
                    <span className={item.key === 'nicuAdmission' && formData.newborn?.nicuAdmission ? 'text-red-700 font-semibold' : ''}>
                      {item.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* NICU Reason (if applicable) */}
            {formData.newborn?.nicuAdmission && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <label className="block text-[10px] font-semibold text-red-700 uppercase mb-1">NICU Admission Reason</label>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="e.g., Respiratory distress, prematurity"
                    value={formData.newborn?.nicuReason || ''}
                    onChange={e => updateNewborn('nicuReason', e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-red-300 rounded"
                  />
                ) : (
                  <div className="text-sm font-semibold text-red-800">{formData.newborn?.nicuReason || '—'}</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
