'use client';

import React, { useState, useEffect } from 'react';
import { Instruction, InstructionCategory } from '@/types/encounter';
import { Plus, Trash2, Edit2, Save, X, FileText, AlertCircle, Clock } from 'lucide-react';
import { EncounterService } from '@/services/encounter.service';
import { LabelWithTooltip } from '@/components/ui/tooltip';

interface ClinicalInstructionsSectionProps {
  encounterId: string;
  patientId: string;
  instructions?: Instruction[];
  onUpdate?: (instructions: Instruction[]) => void;
}

export function ClinicalInstructionsSection({
  encounterId,
  patientId,
  instructions = [],
  onUpdate
}: ClinicalInstructionsSectionProps) {
  const [items, setItems] = useState<Instruction[]>(instructions);
  const [editingItem, setEditingItem] = useState<Instruction | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load instructions from FHIR on mount
  useEffect(() => {
    loadInstructions();
  }, [encounterId]);

  const loadInstructions = async () => {
    try {
      setLoading(true);
      const clinicalInstructions = await EncounterService.getInstructions(encounterId, 'clinical');
      setItems(clinicalInstructions);
      onUpdate?.(clinicalInstructions);
    } catch (err) {
      console.error('Error loading clinical instructions:', err);
      setError('Failed to load clinical instructions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    const newItem: Instruction = {
      id: `instruction-${Date.now()}`,
      type: 'clinical',
      text: '',
      priority: 'medium',
      category: 'general',
      isActive: true
    };
    setEditingItem(newItem);
    setIsAddingItem(true);
  };

  const handleSaveItem = async () => {
    if (!editingItem || !editingItem.text.trim()) {
      setError('Instruction text is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const savedInstruction = await EncounterService.saveInstruction(
        encounterId,
        patientId,
        editingItem
      );

      let updatedItems: Instruction[];
      if (isAddingItem) {
        updatedItems = [...items, savedInstruction];
      } else {
        updatedItems = items.map(item =>
          item.id === editingItem.id ? savedInstruction : item
        );
      }

      setItems(updatedItems);
      onUpdate?.(updatedItems);
      setEditingItem(null);
      setIsAddingItem(false);
    } catch (err) {
      console.error('Error saving instruction:', err);
      setError('Failed to save instruction');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (instruction: Instruction) => {
    if (!confirm('Delete this clinical instruction?')) return;

    try {
      setLoading(true);
      setError(null);

      if (instruction.fhirId) {
        await EncounterService.deleteInstruction(instruction.fhirId);
      }

      const updatedItems = items.filter(item => item.id !== instruction.id);
      setItems(updatedItems);
      onUpdate?.(updatedItems);
    } catch (err) {
      console.error('Error deleting instruction:', err);
      setError('Failed to delete instruction');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setIsAddingItem(false);
    setError(null);
  };

  // Clinical instruction templates
  const clinicalTemplates = [
    { category: 'pre-procedure' as InstructionCategory, text: 'Review patient medical history and allergies before procedure' },
    { category: 'pre-procedure' as InstructionCategory, text: 'Verify patient consent form is signed' },
    { category: 'pre-procedure' as InstructionCategory, text: 'Check vital signs before starting procedure' },
    { category: 'post-procedure' as InstructionCategory, text: 'Monitor patient for adverse reactions for 30 minutes' },
    { category: 'post-procedure' as InstructionCategory, text: 'Document all findings and complications in clinical notes' },
    { category: 'medication' as InstructionCategory, text: 'Administer prescribed medications as per dosage schedule' },
    { category: 'follow-up' as InstructionCategory, text: 'Schedule follow-up appointment in 2 weeks' },
    { category: 'follow-up' as InstructionCategory, text: 'Call patient in 48 hours to check recovery progress' },
    { category: 'emergency' as InstructionCategory, text: 'Contact physician immediately if patient shows signs of complications' },
    { category: 'general' as InstructionCategory, text: 'Maintain sterile technique throughout procedure' }
  ];

  const handleUseTemplate = (template: { category: InstructionCategory; text: string }) => {
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        text: template.text,
        category: template.category
      });
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'pre-procedure': return 'bg-blue-100 text-blue-800';
      case 'post-procedure': return 'bg-purple-100 text-purple-800';
      case 'medication': return 'bg-pink-100 text-pink-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'follow-up': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Clock className="h-5 w-5 animate-spin text-blue-600 mr-2" />
        <span className="text-sm text-gray-600">Loading clinical instructions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Clinical Instructions</h3>
          <span className="text-xs text-gray-500">(For Healthcare Providers)</span>
        </div>
        <button
          onClick={handleAddItem}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium transition-colors disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Clinical Instruction
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Instructions List */}
      <div className="space-y-2">
        {items.length === 0 && !isAddingItem && (
          <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg">
            No clinical instructions added. Click "Add Clinical Instruction" to add one.
          </div>
        )}

        {items.map((item, index) => (
          editingItem?.id === item.id && !isAddingItem ? (
            <div key={item.id} className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Editing Clinical Instruction #{index + 1}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <LabelWithTooltip
                    label="Category"
                    tooltip="Select the type of clinical instruction. Pre-procedure instructions are for before treatment, post-procedure for after treatment, medication for drug administration, follow-up for ongoing care, and emergency for critical situations."
                    required
                  />
                  <select
                    value={editingItem.category || 'general'}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as InstructionCategory })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="pre-procedure">Pre-Procedure</option>
                    <option value="post-procedure">Post-Procedure</option>
                    <option value="medication">Medication</option>
                    <option value="follow-up">Follow-Up</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <LabelWithTooltip
                    label="Priority"
                    tooltip="Set the urgency level of this instruction. High priority instructions require immediate attention, medium for standard clinical procedures, and low for routine guidance."
                    required
                  />
                  <select
                    value={editingItem.priority || 'medium'}
                    onChange={(e) => setEditingItem({ ...editingItem, priority: e.target.value as 'high' | 'medium' | 'low' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <LabelWithTooltip
                  label="Instruction Text"
                  tooltip="Enter detailed clinical instructions for healthcare providers. Be specific about procedures, dosages, timing, and any special considerations. These instructions are for internal clinical use only."
                  required
                />
                <textarea
                  value={editingItem.text}
                  onChange={(e) => setEditingItem({ ...editingItem, text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter clinical instructions for healthcare providers..."
                />
              </div>

              {/* Quick Templates */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Quick Templates (click to use):</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {clinicalTemplates.map((template, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleUseTemplate(template)}
                      className="text-xs px-3 py-2 bg-white border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
                    >
                      <span className={`inline-block px-2 py-0.5 rounded text-xs mb-1 ${getCategoryColor(template.category)}`}>
                        {template.category}
                      </span>
                      <div className="text-gray-700">{template.text}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-blue-200">
                <button
                  onClick={handleSaveItem}
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1.5 font-medium transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg text-sm hover:bg-gray-500 flex items-center gap-1.5 font-medium transition-colors"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(item.category)}`}>
                        {item.category || 'general'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority || 'medium'} priority
                      </span>
                    </div>
                    <p className="text-sm text-gray-900">{item.text}</p>
                    {item.createdAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {new Date(item.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <button
                    onClick={() => setEditingItem(item)}
                    disabled={loading}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item)}
                    disabled={loading}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        ))}

        {/* Add new item form */}
        {isAddingItem && editingItem && (
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold text-green-900">New Clinical Instruction</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <LabelWithTooltip
                  label="Category"
                  tooltip="Select the type of clinical instruction. Pre-procedure instructions are for before treatment, post-procedure for after treatment, medication for drug administration, follow-up for ongoing care, and emergency for critical situations."
                  required
                />
                <select
                  value={editingItem.category || 'general'}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as InstructionCategory })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="pre-procedure">Pre-Procedure</option>
                  <option value="post-procedure">Post-Procedure</option>
                  <option value="medication">Medication</option>
                  <option value="follow-up">Follow-Up</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <LabelWithTooltip
                  label="Priority"
                  tooltip="Set the urgency level of this instruction. High priority instructions require immediate attention, medium for standard clinical procedures, and low for routine guidance."
                  required
                />
                <select
                  value={editingItem.priority || 'medium'}
                  onChange={(e) => setEditingItem({ ...editingItem, priority: e.target.value as 'high' | 'medium' | 'low' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <LabelWithTooltip
                label="Instruction Text"
                tooltip="Enter detailed clinical instructions for healthcare providers. Be specific about procedures, dosages, timing, and any special considerations. These instructions are for internal clinical use only."
                required
              />
              <textarea
                value={editingItem.text}
                onChange={(e) => setEditingItem({ ...editingItem, text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="Enter clinical instructions for healthcare providers..."
                autoFocus
              />
            </div>

            {/* Quick Templates */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Quick Templates (click to use):</label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {clinicalTemplates.map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleUseTemplate(template)}
                    className="text-xs px-3 py-2 bg-white border border-gray-300 rounded hover:bg-green-50 hover:border-green-300 transition-colors text-left"
                  >
                    <span className={`inline-block px-2 py-0.5 rounded text-xs mb-1 ${getCategoryColor(template.category)}`}>
                      {template.category}
                    </span>
                    <div className="text-gray-700">{template.text}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-green-200">
              <button
                onClick={handleSaveItem}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1.5 font-medium transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={loading}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg text-sm hover:bg-gray-500 flex items-center gap-1.5 font-medium transition-colors"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Total Clinical Instructions: <span className="text-lg font-bold">{items.length}</span>
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                High: {items.filter(i => i.priority === 'high').length}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-600"></span>
                Medium: {items.filter(i => i.priority === 'medium').length}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-600"></span>
                Low: {items.filter(i => i.priority === 'low').length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
