'use client';

import React, { useState } from 'react';
import { ClinicalFinding, Investigation, Diagnosis } from '@/types/encounter';
import { Plus, Trash2, Edit2, Save, X, Upload } from 'lucide-react';

interface ClinicalNoteSectionProps {
  chiefComplaint?: string;
  findings?: ClinicalFinding[];
  investigations?: Investigation[];
  diagnoses?: Diagnosis[];
  clinicalNotes?: string;
  onUpdate: (data: {
    chiefComplaint?: string;
    findings?: ClinicalFinding[];
    investigations?: Investigation[];
    diagnoses?: Diagnosis[];
    clinicalNotes?: string;
  }) => void;
}

export function ClinicalNoteSection({
  chiefComplaint = '',
  findings = [],
  investigations = [],
  diagnoses = [],
  clinicalNotes = '',
  onUpdate
}: ClinicalNoteSectionProps) {
  // Chief Complaint state
  const [localChiefComplaint, setLocalChiefComplaint] = useState(chiefComplaint);
  const [localClinicalNotes, setLocalClinicalNotes] = useState(clinicalNotes);

  // Findings state
  const [editingFinding, setEditingFinding] = useState<ClinicalFinding | null>(null);
  const [isAddingFinding, setIsAddingFinding] = useState(false);

  // Investigation state
  const [editingInvestigation, setEditingInvestigation] = useState<Investigation | null>(null);
  const [isAddingInvestigation, setIsAddingInvestigation] = useState(false);

  // Diagnosis state
  const [editingDiagnosis, setEditingDiagnosis] = useState<Diagnosis | null>(null);
  const [isAddingDiagnosis, setIsAddingDiagnosis] = useState(false);

  // Update parent
  const updateParent = (updates: Partial<ClinicalNoteSectionProps>) => {
    onUpdate({
      chiefComplaint: updates.chiefComplaint ?? localChiefComplaint,
      findings: updates.findings ?? findings,
      investigations: updates.investigations ?? investigations,
      diagnoses: updates.diagnoses ?? diagnoses,
      clinicalNotes: updates.clinicalNotes ?? localClinicalNotes
    });
  };

  // ============ FINDINGS CRUD ============
  const handleAddFinding = () => {
    const newFinding: ClinicalFinding = {
      id: `finding-${Date.now()}`,
      toothNumber: '',
      surface: '',
      pop: '',
      top: '',
      pulpSensibility: '',
      conclusion: ''
    };
    setEditingFinding(newFinding);
    setIsAddingFinding(true);
  };

  const handleSaveFinding = () => {
    if (!editingFinding) return;

    if (isAddingFinding) {
      updateParent({ findings: [...findings, editingFinding] });
    } else {
      updateParent({
        findings: findings.map(f => f.id === editingFinding.id ? editingFinding : f)
      });
    }

    setEditingFinding(null);
    setIsAddingFinding(false);
  };

  const handleDeleteFinding = (id: string) => {
    if (confirm('Delete this finding?')) {
      updateParent({ findings: findings.filter(f => f.id !== id) });
    }
  };

  const handleCancelFinding = () => {
    setEditingFinding(null);
    setIsAddingFinding(false);
  };

  // ============ INVESTIGATIONS CRUD ============
  const handleAddInvestigation = () => {
    const newInvestigation: Investigation = {
      id: `investigation-${Date.now()}`,
      name: '',
      result: '',
      notes: ''
    };
    setEditingInvestigation(newInvestigation);
    setIsAddingInvestigation(true);
  };

  const handleSaveInvestigation = () => {
    if (!editingInvestigation) return;

    if (isAddingInvestigation) {
      updateParent({ investigations: [...investigations, editingInvestigation] });
    } else {
      updateParent({
        investigations: investigations.map(i => i.id === editingInvestigation.id ? editingInvestigation : i)
      });
    }

    setEditingInvestigation(null);
    setIsAddingInvestigation(false);
  };

  const handleDeleteInvestigation = (id: string) => {
    if (confirm('Delete this investigation?')) {
      updateParent({ investigations: investigations.filter(i => i.id !== id) });
    }
  };

  const handleCancelInvestigation = () => {
    setEditingInvestigation(null);
    setIsAddingInvestigation(false);
  };

  // ============ DIAGNOSIS CRUD ============
  const handleAddDiagnosis = () => {
    const newDiagnosis: Diagnosis = {
      id: `diagnosis-${Date.now()}`,
      code: '',
      display: '',
      type: 'primary',
      notes: ''
    };
    setEditingDiagnosis(newDiagnosis);
    setIsAddingDiagnosis(true);
  };

  const handleSaveDiagnosis = () => {
    if (!editingDiagnosis) return;

    if (isAddingDiagnosis) {
      updateParent({ diagnoses: [...diagnoses, editingDiagnosis] });
    } else {
      updateParent({
        diagnoses: diagnoses.map(d => d.id === editingDiagnosis.id ? editingDiagnosis : d)
      });
    }

    setEditingDiagnosis(null);
    setIsAddingDiagnosis(false);
  };

  const handleDeleteDiagnosis = (id: string) => {
    if (confirm('Delete this diagnosis?')) {
      updateParent({ diagnoses: diagnoses.filter(d => d.id !== id) });
    }
  };

  const handleCancelDiagnosis = () => {
    setEditingDiagnosis(null);
    setIsAddingDiagnosis(false);
  };

  return (
    <div className="space-y-6">
      {/* Chief Complaint */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chief Complaint
        </label>
        <textarea
          value={localChiefComplaint}
          onChange={(e) => setLocalChiefComplaint(e.target.value)}
          onBlur={() => updateParent({ chiefComplaint: localChiefComplaint })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={2}
          placeholder="Patient's main concern or reason for visit..."
        />
      </div>

      {/* Clinical Findings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Clinical Findings</h3>
          <button
            onClick={handleAddFinding}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 text-xs font-medium transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Finding
          </button>
        </div>

        {findings.length === 0 && !isAddingFinding && (
          <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg">
            No clinical findings recorded. Click "Add Finding" to add one.
          </div>
        )}

        {findings.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b">#</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b">Tooth Number</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b">Surface</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b">POP</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b">TOP</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b">Pulp Sensibility</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 border-b">Conclusion</th>
                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-700 border-b w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {findings.map((finding, index) => (
                  editingFinding?.id === finding.id && !isAddingFinding ? (
                    <tr key={finding.id} className="bg-blue-50 border-b">
                      <td className="px-3 py-2 text-sm">{index + 1}</td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={editingFinding.toothNumber || ''}
                          onChange={(e) => setEditingFinding({ ...editingFinding, toothNumber: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={editingFinding.surface || ''}
                          onChange={(e) => setEditingFinding({ ...editingFinding, surface: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={editingFinding.pop || ''}
                          onChange={(e) => setEditingFinding({ ...editingFinding, pop: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={editingFinding.top || ''}
                          onChange={(e) => setEditingFinding({ ...editingFinding, top: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={editingFinding.pulpSensibility || ''}
                          onChange={(e) => setEditingFinding({ ...editingFinding, pulpSensibility: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={editingFinding.conclusion || ''}
                          onChange={(e) => setEditingFinding({ ...editingFinding, conclusion: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={handleSaveFinding}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Save"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancelFinding}
                            className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={finding.id} className="hover:bg-gray-50 border-b">
                      <td className="px-3 py-2 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{finding.toothNumber || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{finding.surface || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{finding.pop || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{finding.top || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{finding.pulpSensibility || '-'}</td>
                      <td className="px-3 py-2 text-sm text-gray-900">{finding.conclusion || '-'}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingFinding(finding)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFinding(finding.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                ))}

                {/* Add new finding row */}
                {isAddingFinding && editingFinding && (
                  <tr className="bg-green-50 border-b">
                    <td className="px-3 py-2 text-sm text-gray-600">{findings.length + 1}</td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={editingFinding.toothNumber || ''}
                        onChange={(e) => setEditingFinding({ ...editingFinding, toothNumber: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="e.g., 11"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={editingFinding.surface || ''}
                        onChange={(e) => setEditingFinding({ ...editingFinding, surface: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="e.g., Occlusal"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={editingFinding.pop || ''}
                        onChange={(e) => setEditingFinding({ ...editingFinding, pop: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={editingFinding.top || ''}
                        onChange={(e) => setEditingFinding({ ...editingFinding, top: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={editingFinding.pulpSensibility || ''}
                        onChange={(e) => setEditingFinding({ ...editingFinding, pulpSensibility: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="e.g., Normal"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={editingFinding.conclusion || ''}
                        onChange={(e) => setEditingFinding({ ...editingFinding, conclusion: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Conclusion"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={handleSaveFinding}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                          title="Save"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelFinding}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                          title="Cancel"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Investigations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Investigations</h3>
          <button
            onClick={handleAddInvestigation}
            className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs font-medium transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Investigation
          </button>
        </div>

        <div className="space-y-2">
          {investigations.map((investigation) => (
            editingInvestigation?.id === investigation.id && !isAddingInvestigation ? (
              <div key={investigation.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Investigation Name</label>
                    <input
                      type="text"
                      value={editingInvestigation.name}
                      onChange={(e) => setEditingInvestigation({ ...editingInvestigation, name: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Result</label>
                    <input
                      type="text"
                      value={editingInvestigation.result || ''}
                      onChange={(e) => setEditingInvestigation({ ...editingInvestigation, result: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={editingInvestigation.notes || ''}
                    onChange={(e) => setEditingInvestigation({ ...editingInvestigation, notes: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm resize-none"
                    rows={2}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleSaveInvestigation}
                    className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 flex items-center gap-1"
                  >
                    <Save className="h-3 w-3" />
                    Save
                  </button>
                  <button
                    onClick={handleCancelInvestigation}
                    className="px-3 py-1.5 bg-gray-400 text-white rounded text-xs hover:bg-gray-500 flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div key={investigation.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-gray-900">{investigation.name}</h4>
                      {investigation.result && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded">
                          {investigation.result}
                        </span>
                      )}
                    </div>
                    {investigation.notes && (
                      <p className="text-xs text-gray-600 mt-1">{investigation.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => setEditingInvestigation(investigation)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteInvestigation(investigation.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          ))}

          {isAddingInvestigation && editingInvestigation && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Investigation Name</label>
                  <input
                    type="text"
                    value={editingInvestigation.name}
                    onChange={(e) => setEditingInvestigation({ ...editingInvestigation, name: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    placeholder="e.g., X-Ray, Blood Test"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Result</label>
                  <input
                    type="text"
                    value={editingInvestigation.result || ''}
                    onChange={(e) => setEditingInvestigation({ ...editingInvestigation, result: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    placeholder="Result"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={editingInvestigation.notes || ''}
                  onChange={(e) => setEditingInvestigation({ ...editingInvestigation, notes: e.target.value })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm resize-none"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleSaveInvestigation}
                  className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 flex items-center gap-1"
                >
                  <Save className="h-3 w-3" />
                  Save
                </button>
                <button
                  onClick={handleCancelInvestigation}
                  className="px-3 py-1.5 bg-gray-400 text-white rounded text-xs hover:bg-gray-500 flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {investigations.length === 0 && !isAddingInvestigation && (
            <div className="text-center py-6 text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg">
              No investigations recorded
            </div>
          )}
        </div>
      </div>

      {/* Diagnoses */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Diagnosis</h3>
          <button
            onClick={handleAddDiagnosis}
            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Diagnosis
          </button>
        </div>

        <div className="space-y-2">
          {diagnoses.map((diagnosis) => (
            editingDiagnosis?.id === diagnosis.id && !isAddingDiagnosis ? (
              <div key={diagnosis.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Code</label>
                    <input
                      type="text"
                      value={editingDiagnosis.code || ''}
                      onChange={(e) => setEditingDiagnosis({ ...editingDiagnosis, code: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Diagnosis</label>
                    <input
                      type="text"
                      value={editingDiagnosis.display}
                      onChange={(e) => setEditingDiagnosis({ ...editingDiagnosis, display: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={editingDiagnosis.type}
                      onChange={(e) => setEditingDiagnosis({ ...editingDiagnosis, type: e.target.value as any })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    >
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                      <option value="differential">Differential</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={editingDiagnosis.notes || ''}
                    onChange={(e) => setEditingDiagnosis({ ...editingDiagnosis, notes: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm resize-none"
                    rows={2}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleSaveDiagnosis}
                    className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 flex items-center gap-1"
                  >
                    <Save className="h-3 w-3" />
                    Save
                  </button>
                  <button
                    onClick={handleCancelDiagnosis}
                    className="px-3 py-1.5 bg-gray-400 text-white rounded text-xs hover:bg-gray-500 flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div key={diagnosis.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-gray-900">{diagnosis.display}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        diagnosis.type === 'primary' ? 'bg-red-100 text-red-800' :
                        diagnosis.type === 'secondary' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {diagnosis.type}
                      </span>
                      {diagnosis.code && (
                        <span className="text-xs text-gray-500">({diagnosis.code})</span>
                      )}
                    </div>
                    {diagnosis.notes && (
                      <p className="text-xs text-gray-600 mt-1">{diagnosis.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => setEditingDiagnosis(diagnosis)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDiagnosis(diagnosis.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          ))}

          {isAddingDiagnosis && editingDiagnosis && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Code</label>
                  <input
                    type="text"
                    value={editingDiagnosis.code || ''}
                    onChange={(e) => setEditingDiagnosis({ ...editingDiagnosis, code: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    placeholder="e.g., K02.1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Diagnosis</label>
                  <input
                    type="text"
                    value={editingDiagnosis.display}
                    onChange={(e) => setEditingDiagnosis({ ...editingDiagnosis, display: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    placeholder="e.g., Dental Caries"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={editingDiagnosis.type}
                    onChange={(e) => setEditingDiagnosis({ ...editingDiagnosis, type: e.target.value as any })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                  >
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="differential">Differential</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={editingDiagnosis.notes || ''}
                  onChange={(e) => setEditingDiagnosis({ ...editingDiagnosis, notes: e.target.value })}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm resize-none"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleSaveDiagnosis}
                  className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 flex items-center gap-1"
                >
                  <Save className="h-3 w-3" />
                  Save
                </button>
                <button
                  onClick={handleCancelDiagnosis}
                  className="px-3 py-1.5 bg-gray-400 text-white rounded text-xs hover:bg-gray-500 flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Cancel
                </button>
              </div>
            </div>
          )}

          {diagnoses.length === 0 && !isAddingDiagnosis && (
            <div className="text-center py-6 text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg">
              No diagnoses recorded
            </div>
          )}
        </div>
      </div>

      {/* Clinical Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Clinical Notes
        </label>
        <textarea
          value={localClinicalNotes}
          onChange={(e) => setLocalClinicalNotes(e.target.value)}
          onBlur={() => updateParent({ clinicalNotes: localClinicalNotes })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={4}
          placeholder="Any additional clinical notes, observations, or important details..."
        />
      </div>
    </div>
  );
}
