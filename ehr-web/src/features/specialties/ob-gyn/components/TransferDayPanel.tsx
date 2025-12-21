'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Save, Plus, AlertCircle, Info, Star, Calendar } from 'lucide-react';
import {
  getIVFTransfers,
  createIVFTransfer,
  updateIVFTransfer,
  getIVFEmbryos,
  type IVFTransfer,
  type IVFEmbryoDevelopment
} from '@/services/obgyn.service';

interface TransferDayPanelProps {
  patientId: string;
  cycleId: string;
}

export default function TransferDayPanel({ patientId, cycleId }: TransferDayPanelProps) {
  const [transfers, setTransfers] = useState<IVFTransfer[]>([]);
  const [availableEmbryos, setAvailableEmbryos] = useState<IVFEmbryoDevelopment[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTransferId, setEditingTransferId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<IVFTransfer>>({
    transferDate: new Date().toISOString().split('T')[0],
    transferTime: '',
    transferType: 'frozen',
    numberTransferred: 1,
    embryoIds: [],
    embryoGrades: '',
    embryoDay: 'day5',
    prepProtocol: 'medicated',
    prepStartDate: '',
    estrogenMedication: '',
    estrogenDose: '',
    estrogenRoute: 'oral',
    progesteroneMedication: '',
    progesteroneDose: '',
    progesteroneRoute: 'injection',
    progesteroneStartDate: '',
    progesteroneDays: undefined,
    estradiolLevel: undefined,
    progesteroneLevel: undefined,
    endometrialThickness: undefined,
    endometrialPattern: 'trilaminar',
    catheterType: '',
    catheterLoadedBy: '',
    transferPerformedBy: '',
    difficulty: 'easy',
    difficultyReason: '',
    ultrasoundGuidance: true,
    bladderVolume: 'optimal',
    cervicalDilationNeeded: false,
    tenaculumUsed: false,
    trialTransferDone: false,
    distanceFromFundus: undefined,
    airBubbleVisible: undefined,
    embryoVisibilityConfirmed: undefined,
    bloodOnCatheter: false,
    mucusOnCatheter: false,
    bedRestMinutes: 15,
    patientToleratedWell: true,
    complications: '',
    dischargeTime: '',
    clinicianConfidence: 5,
    clinicianNotes: '',
    technicalQuality: 'excellent',
    betaHcgDate: '',
    continueMedications: true,
    activityRestrictions: 'Normal activity, avoid heavy lifting >10kg, pelvic rest for 48 hours',
    followUpInstructions: 'Beta hCG test scheduled. Continue all medications as prescribed. Call if fever, heavy bleeding, or severe pain.',
    predictedSuccessRate: undefined
  });

  useEffect(() => {
    loadTransfers();
    loadAvailableEmbryos();
  }, [patientId, cycleId]);

  const loadTransfers = async () => {
    try {
      const data = await getIVFTransfers(patientId, cycleId);
      setTransfers(data);
    } catch (err) {
      console.error('Error loading transfers:', err);
      setError('Failed to load transfer records');
    }
  };

  const loadAvailableEmbryos = async () => {
    try {
      const embryos = await getIVFEmbryos(patientId, cycleId);
      // Filter frozen embryos available for transfer
      const frozen = embryos.filter(
        e => e.finalDisposition === 'frozen' || e.finalDisposition === 'biopsied'
      );
      setAvailableEmbryos(frozen);
    } catch (err) {
      console.error('Error loading embryos:', err);
    }
  };

  const handleAddNew = () => {
    setIsEditing(true);
    setEditingTransferId(null);
    setFormData({
      transferDate: new Date().toISOString().split('T')[0],
      transferTime: '',
      transferType: 'frozen',
      numberTransferred: 1,
      embryoIds: [],
      embryoGrades: '',
      embryoDay: 'day5',
      prepProtocol: 'medicated',
      ultrasoundGuidance: true,
      bladderVolume: 'optimal',
      bedRestMinutes: 15,
      patientToleratedWell: true,
      continueMedications: true,
      clinicianConfidence: 5,
      technicalQuality: 'excellent',
      difficulty: 'easy',
      activityRestrictions: 'Normal activity, avoid heavy lifting >10kg, pelvic rest for 48 hours',
      followUpInstructions: 'Beta hCG test scheduled. Continue all medications as prescribed. Call if fever, heavy bleeding, or severe pain.'
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      if (!formData.transferDate) {
        throw new Error('Transfer date is required');
      }
      if (!formData.transferPerformedBy) {
        throw new Error('Clinician name is required');
      }
      if (!formData.numberTransferred || formData.numberTransferred < 1) {
        throw new Error('Number of embryos transferred must be at least 1');
      }

      if (editingTransferId) {
        await updateIVFTransfer(patientId, cycleId, editingTransferId, formData);
      } else {
        await createIVFTransfer(patientId, cycleId, formData);
      }

      await loadTransfers();
      setIsEditing(false);
      setEditingTransferId(null);
    } catch (err: any) {
      console.error('Error saving transfer:', err);
      setError(err.message || 'Failed to save transfer record');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (transfer: IVFTransfer) => {
    setIsEditing(true);
    setEditingTransferId(transfer.id);
    setFormData(transfer);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingTransferId(null);
  };

  const updateFormField = (field: keyof IVFTransfer, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate success rate based on embryo quality and patient age
  const calculateSuccessRate = useMemo(() => {
    if (!formData.embryoGrades) return null;

    const grades = formData.embryoGrades.split(',').map(g => g.trim());
    let baseRate = 0;

    grades.forEach(grade => {
      if (grade.includes('AA') || grade.includes('AB') || grade.includes('BA')) {
        baseRate += 60; // High quality
      } else if (grade.includes('BB')) {
        baseRate += 45; // Good quality
      } else {
        baseRate += 25; // Fair quality
      }
    });

    const avgRate = baseRate / grades.length;
    return avgRate.toFixed(1);
  }, [formData.embryoGrades]);

  // Render confidence stars
  const renderConfidenceStars = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => updateFormField('clinicianConfidence', star)}
            className={`text-2xl transition-colors ${
              (formData.clinicianConfidence || 0) >= star
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
          >
            <Star className={`h-6 w-6 ${(formData.clinicianConfidence || 0) >= star ? 'fill-current' : ''}`} />
          </button>
        ))}
      </div>
    );
  };

  if (!isEditing && transfers.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Transfer Day Report</h3>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Record Transfer
          </button>
        </div>
        <p className="text-sm text-gray-500 text-center py-8">
          No transfer records yet. Click "Record Transfer" to document an embryo transfer procedure.
        </p>
      </div>
    );
  }

  if (!isEditing) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Transfer History</h3>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Transfer
          </button>
        </div>

        <div className="space-y-4">
          {transfers.map(transfer => (
            <div
              key={transfer.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-primary/50 cursor-pointer transition-colors"
              onClick={() => handleEdit(transfer)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(transfer.transferDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                      {transfer.transferType?.toUpperCase() || 'FET'}
                    </span>
                    {transfer.embryoDay && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {transfer.embryoDay.toUpperCase().replace('DAY', 'Day ')}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <div>
                      <span className="text-gray-600">Embryos: </span>
                      <span className="font-medium">{transfer.numberTransferred}</span>
                      {transfer.embryoGrades && (
                        <span className="text-gray-600"> ({transfer.embryoGrades})</span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-600">Endometrium: </span>
                      <span className="font-medium">{transfer.endometrialThickness || '-'}mm</span>
                      {transfer.endometrialPattern && (
                        <span className="text-gray-600"> ({transfer.endometrialPattern})</span>
                      )}
                    </div>
                    <div>
                      <span className="text-gray-600">Difficulty: </span>
                      <span className={`font-medium ${
                        transfer.difficulty === 'easy' ? 'text-green-600' :
                        transfer.difficulty === 'moderate' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {transfer.difficulty?.toUpperCase() || 'EASY'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Confidence: </span>
                      <span className="font-medium text-yellow-600">
                        {'★'.repeat(transfer.clinicianConfidence || 5)}
                        {'☆'.repeat(5 - (transfer.clinicianConfidence || 5))}
                      </span>
                    </div>
                  </div>
                  {transfer.clinicianNotes && (
                    <p className="mt-2 text-sm text-gray-600 italic">"{transfer.clinicianNotes}"</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {editingTransferId ? 'Edit Transfer Record' : 'Document Embryo Transfer'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Record comprehensive transfer day details for optimal outcome tracking
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Transfer'}
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

      <div className="p-6 space-y-6">
        {/* SECTION 1: Transfer Basic Info */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Transfer Details</h4>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                Transfer Date *
                <span className="text-gray-400" title="Date of embryo transfer procedure">
                  <Info className="h-3 w-3" />
                </span>
              </label>
              <input
                type="date"
                value={formData.transferDate || ''}
                onChange={(e) => updateFormField('transferDate', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Transfer Time</label>
              <input
                type="time"
                value={formData.transferTime || ''}
                onChange={(e) => updateFormField('transferTime', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Transfer Type</label>
              <select
                value={formData.transferType || 'frozen'}
                onChange={(e) => updateFormField('transferType', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="fresh">Fresh</option>
                <option value="frozen">Frozen (FET)</option>
                <option value="donor">Donor</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Embryo Day</label>
              <select
                value={formData.embryoDay || 'day5'}
                onChange={(e) => updateFormField('embryoDay', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="day3">Day 3 Cleavage</option>
                <option value="day5">Day 5 Blastocyst</option>
                <option value="day6">Day 6 Blastocyst</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: Embryo Selection */}
        <div className="space-y-4 border-t border-gray-100 pt-6">
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Embryo Selection</h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                Number Transferred *
                <span className="text-gray-400" title="How many embryos were transferred (1-3)">
                  <Info className="h-3 w-3" />
                </span>
              </label>
              <input
                type="number"
                min="1"
                max="3"
                value={formData.numberTransferred || 1}
                onChange={(e) => updateFormField('numberTransferred', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                Embryo Grades
                <span className="text-gray-400" title="Gardner grades (e.g., 4AA, 5AB) separated by commas">
                  <Info className="h-3 w-3" />
                </span>
              </label>
              <input
                type="text"
                value={formData.embryoGrades || ''}
                onChange={(e) => updateFormField('embryoGrades', e.target.value)}
                placeholder="e.g., 4AA, 5AB"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              {calculateSuccessRate && (
                <p className="text-xs text-primary mt-1">
                  Predicted success rate: ~{calculateSuccessRate}% per transfer
                </p>
              )}
            </div>
          </div>

          {availableEmbryos.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-900 mb-2">
                {availableEmbryos.length} frozen embryo(s) available for transfer
              </p>
              <div className="flex flex-wrap gap-2">
                {availableEmbryos.map(embryo => (
                  <div
                    key={embryo.id}
                    className="px-2 py-1 text-xs bg-white border border-blue-300 rounded text-blue-900"
                  >
                    E{embryo.embryoNumber}: {embryo.day5OverallGrade || 'Day ' + (embryo.day3CellCount ? '3' : embryo.day5Stage ? '5' : '?')}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: Endometrial Preparation (FET) */}
        {formData.transferType === 'frozen' && (
          <div className="space-y-4 border-t border-gray-100 pt-6">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Endometrial Preparation (FET Protocol)</h4>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Prep Protocol</label>
                <select
                  value={formData.prepProtocol || 'medicated'}
                  onChange={(e) => updateFormField('prepProtocol', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="medicated">Medicated (HRT)</option>
                  <option value="natural">Natural Cycle</option>
                  <option value="modified_natural">Modified Natural</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Prep Start Date</label>
                <input
                  type="date"
                  value={formData.prepStartDate || ''}
                  onChange={(e) => updateFormField('prepStartDate', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Estrogen Medication</label>
                <input
                  type="text"
                  value={formData.estrogenMedication || ''}
                  onChange={(e) => updateFormField('estrogenMedication', e.target.value)}
                  placeholder="e.g., Estradiol valerate"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Estrogen Dose</label>
                <input
                  type="text"
                  value={formData.estrogenDose || ''}
                  onChange={(e) => updateFormField('estrogenDose', e.target.value)}
                  placeholder="e.g., 2mg TID"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Estrogen Route</label>
                <select
                  value={formData.estrogenRoute || 'oral'}
                  onChange={(e) => updateFormField('estrogenRoute', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="oral">Oral</option>
                  <option value="transdermal">Transdermal (Patch)</option>
                  <option value="vaginal">Vaginal</option>
                  <option value="injection">Injection</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Progesterone Medication</label>
                <input
                  type="text"
                  value={formData.progesteroneMedication || ''}
                  onChange={(e) => updateFormField('progesteroneMedication', e.target.value)}
                  placeholder="e.g., PIO, Endometrin"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Progesterone Dose</label>
                <input
                  type="text"
                  value={formData.progesteroneDose || ''}
                  onChange={(e) => updateFormField('progesteroneDose', e.target.value)}
                  placeholder="e.g., 50mg IM daily"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Progesterone Route</label>
                <select
                  value={formData.progesteroneRoute || 'injection'}
                  onChange={(e) => updateFormField('progesteroneRoute', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="injection">Injection (PIO)</option>
                  <option value="vaginal">Vaginal</option>
                  <option value="oral">Oral</option>
                  <option value="combined">Combined</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Progesterone Start Date
                  <span className="text-gray-400" title="Date when progesterone was initiated">
                    <Info className="h-3 w-3" />
                  </span>
                </label>
                <input
                  type="date"
                  value={formData.progesteroneStartDate || ''}
                  onChange={(e) => updateFormField('progesteroneStartDate', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                  Days on Progesterone
                  <span className="text-gray-400" title="Number of days on progesterone before transfer">
                    <Info className="h-3 w-3" />
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.progesteroneDays || ''}
                  onChange={(e) => updateFormField('progesteroneDays', parseInt(e.target.value) || undefined)}
                  placeholder="e.g., 5 for P+5"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: Transfer Day Labs */}
        <div className="space-y-4 border-t border-gray-100 pt-6">
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Transfer Day Labs & Measurements</h4>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                Estradiol (E2) Level
                <span className="text-gray-400" title="Serum estradiol in pg/mL (goal: 200-300)">
                  <Info className="h-3 w-3" />
                </span>
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.estradiolLevel || ''}
                onChange={(e) => updateFormField('estradiolLevel', parseFloat(e.target.value) || undefined)}
                placeholder="pg/mL"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              {formData.estradiolLevel && formData.estradiolLevel >= 200 && formData.estradiolLevel <= 300 && (
                <p className="text-xs text-green-600 mt-1">✓ Optimal range</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                Progesterone (P4) Level
                <span className="text-gray-400" title="Serum progesterone in ng/mL (goal: >10)">
                  <Info className="h-3 w-3" />
                </span>
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.progesteroneLevel || ''}
                onChange={(e) => updateFormField('progesteroneLevel', parseFloat(e.target.value) || undefined)}
                placeholder="ng/mL"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              {formData.progesteroneLevel && formData.progesteroneLevel >= 10 && (
                <p className="text-xs text-green-600 mt-1">✓ Adequate level</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                Endometrial Thickness
                <span className="text-gray-400" title="Endometrial thickness in mm (goal: 8-12mm)">
                  <Info className="h-3 w-3" />
                </span>
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.endometrialThickness || ''}
                onChange={(e) => updateFormField('endometrialThickness', parseFloat(e.target.value) || undefined)}
                placeholder="mm"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              {formData.endometrialThickness && formData.endometrialThickness >= 8 && (
                <p className="text-xs text-green-600 mt-1">✓ Adequate thickness</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Endometrial Pattern</label>
              <select
                value={formData.endometrialPattern || 'trilaminar'}
                onChange={(e) => updateFormField('endometrialPattern', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="trilaminar">Trilaminar (Ideal)</option>
                <option value="homogeneous">Homogeneous</option>
                <option value="heterogeneous">Heterogeneous</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 5: Procedure Details */}
        <div className="space-y-4 border-t border-gray-100 pt-6">
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Transfer Procedure Details</h4>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Catheter Type</label>
              <input
                type="text"
                value={formData.catheterType || ''}
                onChange={(e) => updateFormField('catheterType', e.target.value)}
                placeholder="e.g., Cook EchoTip"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Catheter Loaded By</label>
              <input
                type="text"
                value={formData.catheterLoadedBy || ''}
                onChange={(e) => updateFormField('catheterLoadedBy', e.target.value)}
                placeholder="Embryologist name"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Transfer Performed By *</label>
              <input
                type="text"
                value={formData.transferPerformedBy || ''}
                onChange={(e) => updateFormField('transferPerformedBy', e.target.value)}
                placeholder="Clinician name"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={formData.difficulty || 'easy'}
                onChange={(e) => updateFormField('difficulty', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="difficult">Difficult</option>
              </select>
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">Difficulty Reason (if applicable)</label>
              <input
                type="text"
                value={formData.difficultyReason || ''}
                onChange={(e) => updateFormField('difficultyReason', e.target.value)}
                placeholder="e.g., Cervical stenosis, sharp angle"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Bladder Volume</label>
              <select
                value={formData.bladderVolume || 'optimal'}
                onChange={(e) => updateFormField('bladderVolume', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="optimal">Optimal</option>
                <option value="adequate">Adequate</option>
                <option value="inadequate">Inadequate</option>
                <option value="overfilled">Overfilled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                Distance from Fundus
                <span className="text-gray-400" title="Distance from fundus in cm (goal: 1.5-2cm)">
                  <Info className="h-3 w-3" />
                </span>
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.distanceFromFundus || ''}
                onChange={(e) => updateFormField('distanceFromFundus', parseFloat(e.target.value) || undefined)}
                placeholder="cm"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Bed Rest (minutes)</label>
              <input
                type="number"
                value={formData.bedRestMinutes || 15}
                onChange={(e) => updateFormField('bedRestMinutes', parseInt(e.target.value) || 15)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Discharge Time</label>
              <input
                type="time"
                value={formData.dischargeTime || ''}
                onChange={(e) => updateFormField('dischargeTime', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.ultrasoundGuidance || false}
                onChange={(e) => updateFormField('ultrasoundGuidance', e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-gray-700">Ultrasound Guidance Used</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.airBubbleVisible || false}
                onChange={(e) => updateFormField('airBubbleVisible', e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-gray-700">Air Bubble Visible on US</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.embryoVisibilityConfirmed || false}
                onChange={(e) => updateFormField('embryoVisibilityConfirmed', e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-gray-700">Embryo Visibility Confirmed</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.cervicalDilationNeeded || false}
                onChange={(e) => updateFormField('cervicalDilationNeeded', e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-gray-700">Cervical Dilation Needed</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.tenaculumUsed || false}
                onChange={(e) => updateFormField('tenaculumUsed', e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-gray-700">Tenaculum Used</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.trialTransferDone || false}
                onChange={(e) => updateFormField('trialTransferDone', e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-gray-700">Trial Transfer Done Previously</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.bloodOnCatheter || false}
                onChange={(e) => updateFormField('bloodOnCatheter', e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-gray-700">Blood on Catheter</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.mucusOnCatheter || false}
                onChange={(e) => updateFormField('mucusOnCatheter', e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-gray-700">Mucus on Catheter</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formData.patientToleratedWell || false}
                onChange={(e) => updateFormField('patientToleratedWell', e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-gray-700">Patient Tolerated Well</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Complications (if any)</label>
            <textarea
              value={formData.complications || ''}
              onChange={(e) => updateFormField('complications', e.target.value)}
              rows={2}
              placeholder="Describe any complications or issues encountered"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* SECTION 6: Clinical Assessment */}
        <div className="space-y-4 border-t border-gray-100 pt-6">
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Clinical Assessment</h4>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Clinician Confidence Rating
            </label>
            <p className="text-xs text-gray-600 mb-3">
              How confident are you in this transfer? (1 = Poor, 5 = Excellent)
            </p>
            {renderConfidenceStars()}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Technical Quality</label>
              <select
                value={formData.technicalQuality || 'excellent'}
                onChange={(e) => updateFormField('technicalQuality', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Beta hCG Test Date</label>
              <input
                type="date"
                value={formData.betaHcgDate || ''}
                onChange={(e) => updateFormField('betaHcgDate', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Clinician Notes</label>
            <textarea
              value={formData.clinicianNotes || ''}
              onChange={(e) => updateFormField('clinicianNotes', e.target.value)}
              rows={3}
              placeholder='e.g., "Perfect transfer, excellent embryo, optimal endometrium - very hopeful!"'
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* SECTION 7: Post-Transfer Instructions */}
        <div className="space-y-4 border-t border-gray-100 pt-6">
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Post-Transfer Instructions</h4>

          <div>
            <label className="flex items-center gap-2 text-sm mb-2">
              <input
                type="checkbox"
                checked={formData.continueMedications || false}
                onChange={(e) => updateFormField('continueMedications', e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="font-medium text-gray-900">Continue All Medications as Prescribed</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Activity Restrictions</label>
            <textarea
              value={formData.activityRestrictions || ''}
              onChange={(e) => updateFormField('activityRestrictions', e.target.value)}
              rows={2}
              placeholder="e.g., Normal activity, avoid heavy lifting >10kg, pelvic rest for 48 hours"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Follow-up Instructions</label>
            <textarea
              value={formData.followUpInstructions || ''}
              onChange={(e) => updateFormField('followUpInstructions', e.target.value)}
              rows={3}
              placeholder="Beta hCG test date, when to call clinic, warning signs, etc."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
