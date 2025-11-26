'use client';

import React, { useState } from 'react';
import {
  FileText,
  X,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Stethoscope,
  Activity,
  Clipboard,
  ClipboardCheck
} from 'lucide-react';

interface ClinicalNotesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: ClinicalNote) => Promise<void>;
  patientName?: string;
  patientId: string;
  encounterId?: string;
}

interface ClinicalNote {
  chiefComplaint: string;
  historyOfPresentIllness: string;
  physicalExamination: string;
  assessment: string;
  plan: string;
  notes: string;
}

export function ClinicalNotesPanel({
  isOpen,
  onClose,
  onSave,
  patientName,
  patientId,
  encounterId
}: ClinicalNotesPanelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [note, setNote] = useState<ClinicalNote>({
    chiefComplaint: '',
    historyOfPresentIllness: '',
    physicalExamination: '',
    assessment: '',
    plan: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await onSave(note);
      setSuccessMessage('Clinical notes saved successfully!');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to save clinical notes');
    } finally {
      setIsSaving(false);
    }
  };

  const hasContent = Object.values(note).some(value => value.trim());

  return (
    <div className="fixed left-4 top-20 bottom-20 w-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-40">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">Clinical Notes</h3>
            <p className="text-xs text-purple-100">{patientName || 'Patient'}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mx-4 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Chief Complaint */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Stethoscope className="w-4 h-4 text-purple-600" />
            Chief Complaint
          </label>
          <textarea
            value={note.chiefComplaint}
            onChange={(e) => setNote({ ...note, chiefComplaint: e.target.value })}
            placeholder="What brings the patient in today?"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none"
          />
        </div>

        {/* History of Present Illness */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Clipboard className="w-4 h-4 text-purple-600" />
            History of Present Illness (HPI)
          </label>
          <textarea
            value={note.historyOfPresentIllness}
            onChange={(e) => setNote({ ...note, historyOfPresentIllness: e.target.value })}
            placeholder="Detailed history of the patient's symptoms, onset, duration, severity, etc."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none"
          />
        </div>

        {/* Physical Examination */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Activity className="w-4 h-4 text-purple-600" />
            Physical Examination
          </label>
          <textarea
            value={note.physicalExamination}
            onChange={(e) => setNote({ ...note, physicalExamination: e.target.value })}
            placeholder="Physical exam findings (general appearance, vitals review, system-specific findings)"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none"
          />
        </div>

        {/* Assessment */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <ClipboardCheck className="w-4 h-4 text-purple-600" />
            Assessment (Diagnosis)
          </label>
          <textarea
            value={note.assessment}
            onChange={(e) => setNote({ ...note, assessment: e.target.value })}
            placeholder="Clinical impression, differential diagnoses, ICD codes"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none"
          />
        </div>

        {/* Plan */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <FileText className="w-4 h-4 text-purple-600" />
            Plan (Treatment & Follow-up)
          </label>
          <textarea
            value={note.plan}
            onChange={(e) => setNote({ ...note, plan: e.target.value })}
            placeholder="Treatment plan, medications, follow-up instructions, referrals"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none"
          />
        </div>

        {/* Additional Notes */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <FileText className="w-4 h-4 text-purple-600" />
            Additional Notes
          </label>
          <textarea
            value={note.notes}
            onChange={(e) => setNote({ ...note, notes: e.target.value })}
            placeholder="Any additional observations or comments"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 rounded-b-2xl flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {hasContent ? 'Ready to save' : 'Enter clinical notes'}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 border border-gray-300 text-gray-700 font-medium text-sm rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !hasContent}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-sm rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Notes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
