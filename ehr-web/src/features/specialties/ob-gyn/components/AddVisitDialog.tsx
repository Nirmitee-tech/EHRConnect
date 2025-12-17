'use client';

import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface AddVisitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (visitData: any) => void;
  currentGA: string;
}

/**
 * Add Visit Dialog
 * Dialog form to add a new prenatal visit
 */
export function AddVisitDialog({ isOpen, onClose, onSave }: AddVisitDialogProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    ga: '',
    weight: '',
    fh: '',
    fpr: 'Vertex',
    fhr: '',
    fm: 'Present',
    bpSystolic: '',
    bpDiastolic: '',
    urineProtein: 'Neg',
    urineGlucose: 'Neg',
    edema: 'None',
    complaints: '',
    assessment: '',
    plan: '',
    provider: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert form data to visit format
    const visitData = {
      id: Date.now().toString(),
      date: formData.date,
      ga: formData.ga,
      gaWeeks: parseFloat(formData.ga.split('w')[0] || '0'),
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      fh: formData.fh ? parseFloat(formData.fh) : undefined,
      fpr: formData.fpr,
      fhr: formData.fhr ? parseInt(formData.fhr) : undefined,
      fm: formData.fm,
      bp: formData.bpSystolic && formData.bpDiastolic ? {
        systolic: parseInt(formData.bpSystolic),
        diastolic: parseInt(formData.bpDiastolic)
      } : undefined,
      urine: {
        protein: formData.urineProtein,
        glucose: formData.urineGlucose,
      },
      edema: formData.edema,
      complaints: formData.complaints,
      assessment: formData.assessment,
      plan: formData.plan,
      provider: formData.provider,
    };

    onSave(visitData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Add Prenatal Visit</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-primary/90 rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-2 gap-4">
            {/* Visit Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Visit Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Gestational Age */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Gestational Age <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">(e.g., 28w 3d)</span>
              </label>
              <input
                type="text"
                required
                placeholder="28w 3d"
                value={formData.ga}
                onChange={(e) => setFormData({ ...formData, ga: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Weight (lbs)
              </label>
              <input
                type="number"
                placeholder="165"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Fundal Height */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Fundal Height (cm)
              </label>
              <input
                type="number"
                placeholder="28"
                value={formData.fh}
                onChange={(e) => setFormData({ ...formData, fh: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Fetal Presentation */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Fetal Presentation
              </label>
              <select
                value={formData.fpr}
                onChange={(e) => setFormData({ ...formData, fpr: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Vertex">Vertex (head down)</option>
                <option value="Breech">Breech</option>
                <option value="Transverse">Transverse</option>
                <option value="Oblique">Oblique</option>
              </select>
            </div>

            {/* Fetal Heart Rate */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Fetal Heart Rate (bpm)
              </label>
              <input
                type="number"
                placeholder="145"
                value={formData.fhr}
                onChange={(e) => setFormData({ ...formData, fhr: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Fetal Movement */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Fetal Movement
              </label>
              <select
                value={formData.fm}
                onChange={(e) => setFormData({ ...formData, fm: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Present">Present</option>
                <option value="Reduced">Reduced</option>
                <option value="Absent">Absent</option>
              </select>
            </div>

            {/* Blood Pressure */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Blood Pressure (S/D)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="120"
                  value={formData.bpSystolic}
                  onChange={(e) => setFormData({ ...formData, bpSystolic: e.target.value })}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="self-center text-gray-500">/</span>
                <input
                  type="number"
                  placeholder="80"
                  value={formData.bpDiastolic}
                  onChange={(e) => setFormData({ ...formData, bpDiastolic: e.target.value })}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Urine Protein */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Urine Protein
              </label>
              <select
                value={formData.urineProtein}
                onChange={(e) => setFormData({ ...formData, urineProtein: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Neg">Negative</option>
                <option value="Trace">Trace</option>
                <option value="+1">+1</option>
                <option value="+2">+2</option>
                <option value="+3">+3</option>
              </select>
            </div>

            {/* Urine Glucose */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Urine Glucose
              </label>
              <select
                value={formData.urineGlucose}
                onChange={(e) => setFormData({ ...formData, urineGlucose: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Neg">Negative</option>
                <option value="Trace">Trace</option>
                <option value="+1">+1</option>
                <option value="+2">+2</option>
              </select>
            </div>

            {/* Edema */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Edema
              </label>
              <select
                value={formData.edema}
                onChange={(e) => setFormData({ ...formData, edema: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="None">None</option>
                <option value="Trace pedal">Trace pedal</option>
                <option value="+1 bilateral">+1 bilateral</option>
                <option value="+2 bilateral">+2 bilateral</option>
                <option value="+3 generalized">+3 generalized</option>
              </select>
            </div>

            {/* Provider */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Provider
              </label>
              <input
                type="text"
                placeholder="Dr. Smith"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Complaints */}
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Complaints
              </label>
              <textarea
                rows={2}
                placeholder="Patient complaints or symptoms..."
                value={formData.complaints}
                onChange={(e) => setFormData({ ...formData, complaints: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Assessment */}
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Assessment
              </label>
              <textarea
                rows={2}
                placeholder="Clinical assessment..."
                value={formData.assessment}
                onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Plan */}
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Plan
              </label>
              <textarea
                rows={2}
                placeholder="Treatment plan and next steps..."
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded hover:opacity-90 transition-colors flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Visit
          </button>
        </div>
      </div>
    </div>
  );
}
