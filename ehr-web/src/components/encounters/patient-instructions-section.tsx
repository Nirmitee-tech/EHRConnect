'use client';

import React, { useState, useEffect } from 'react';
import { Instruction, InstructionCategory } from '@/types/encounter';
import { Plus, Trash2, Edit2, Save, X, FileText, AlertCircle, Clock, User } from 'lucide-react';
import { EncounterService } from '@/services/encounter.service';
import { LabelWithTooltip } from '@/components/ui/tooltip';

interface PatientInstructionsSectionProps {
  encounterId: string;
  patientId: string;
  instructions?: Instruction[];
  onUpdate?: (instructions: Instruction[]) => void;
}

export function PatientInstructionsSection({
  encounterId,
  patientId,
  instructions = [],
  onUpdate
}: PatientInstructionsSectionProps) {
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
      const patientInstructions = await EncounterService.getInstructions(encounterId, 'patient');
      setItems(patientInstructions);
      onUpdate?.(patientInstructions);
    } catch (err) {
      console.error('Error loading patient instructions:', err);
      setError('Failed to load patient instructions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    const newItem: Instruction = {
      id: `instruction-${Date.now()}`,
      type: 'patient',
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
    if (!confirm('Delete this patient instruction?')) return;

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

  // Patient instruction templates
  const patientTemplates = [
    { category: 'post-procedure' as InstructionCategory, text: 'Apply ice pack for 15-20 minutes every 2-3 hours for the first 24 hours' },
    { category: 'post-procedure' as InstructionCategory, text: 'Avoid hard or sticky foods for 24 hours' },
    { category: 'post-procedure' as InstructionCategory, text: 'Rinse with warm salt water 3 times daily after 24 hours' },
    { category: 'post-procedure' as InstructionCategory, text: 'Avoid drinking through a straw for 24 hours' },
    { category: 'medication' as InstructionCategory, text: 'Take prescribed medications with food as directed' },
    { category: 'medication' as InstructionCategory, text: 'Complete the full course of antibiotics even if you feel better' },
    { category: 'medication' as InstructionCategory, text: 'Take pain medication before discomfort becomes severe' },
    { category: 'lifestyle' as InstructionCategory, text: 'Do not smoke or use tobacco products for at least 72 hours' },
    { category: 'lifestyle' as InstructionCategory, text: 'Avoid vigorous exercise for 24-48 hours' },
    { category: 'lifestyle' as InstructionCategory, text: 'Get adequate rest and maintain proper hydration' },
    { category: 'general' as InstructionCategory, text: 'Maintain good oral hygiene by gentle brushing and flossing' },
    { category: 'general' as InstructionCategory, text: 'Keep the treatment area clean and dry' },
    { category: 'follow-up' as InstructionCategory, text: 'Return for follow-up appointment as scheduled' },
    { category: 'follow-up' as InstructionCategory, text: 'Schedule your next appointment within 2 weeks' },
    { category: 'emergency' as InstructionCategory, text: 'Contact office immediately if excessive bleeding occurs' },
    { category: 'emergency' as InstructionCategory, text: 'Seek immediate care if you experience severe pain or swelling' },
    { category: 'emergency' as InstructionCategory, text: 'Call 911 if you have difficulty breathing or swallowing' }
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
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'pre-procedure': return 'bg-blue-100 text-blue-800';
      case 'post-procedure': return 'bg-purple-100 text-purple-800';
      case 'medication': return 'bg-pink-100 text-pink-800';
      case 'lifestyle': return 'bg-teal-100 text-teal-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'follow-up': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Clock className="h-5 w-5 animate-spin text-purple-600 mr-2" />
        <span className="text-sm text-gray-600">Loading patient instructions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Patient Instructions</h3>
          <span className="text-xs text-gray-500">(For Patients)</span>
        </div>
        <button
          onClick={handleAddItem}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs font-medium transition-colors disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Patient Instruction
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
            No patient instructions added. Click "Add Patient Instruction" to add one.
          </div>
        )}

        {items.map((item, index) => (
          editingItem?.id === item.id && !isAddingItem ? (
            <div key={item.id} className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-semibold text-purple-900">Editing Patient Instruction #{index + 1}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <LabelWithTooltip
                    label="Category"
                    tooltip="Choose the type of patient instruction. Pre-procedure for preparation steps, post-procedure for recovery care, medication for taking medicines, lifestyle for daily habits, follow-up for next appointments, and emergency for urgent warning signs."
                    required
                  />
                  <select
                    value={editingItem.category || 'general'}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as InstructionCategory })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="pre-procedure">Pre-Procedure</option>
                    <option value="post-procedure">Post-Procedure</option>
                    <option value="medication">Medication</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="follow-up">Follow-Up</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                <div>
                  <LabelWithTooltip
                    label="Priority"
                    tooltip="Set the importance level for the patient. High priority means the patient must follow this instruction carefully, medium for important guidance, and low for helpful recommendations."
                    required
                  />
                  <select
                    value={editingItem.priority || 'medium'}
                    onChange={(e) => setEditingItem({ ...editingItem, priority: e.target.value as 'high' | 'medium' | 'low' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  tooltip="Write instructions in simple, clear language that patients can easily understand. Include specific steps, timing, and what to do if problems arise. These instructions will be shared with the patient."
                  required
                />
                <textarea
                  value={editingItem.text}
                  onChange={(e) => setEditingItem({ ...editingItem, text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter instructions for the patient in clear, easy-to-understand language..."
                />
              </div>

              {/* Quick Templates */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Quick Templates (click to use):</label>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                  {patientTemplates.map((template, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleUseTemplate(template)}
                      className="text-xs px-3 py-2 bg-white border border-gray-300 rounded hover:bg-purple-50 hover:border-purple-300 transition-colors text-left"
                    >
                      <span className={`inline-block px-2 py-0.5 rounded text-xs mb-1 ${getCategoryColor(template.category)}`}>
                        {template.category}
                      </span>
                      <div className="text-gray-700">{template.text}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-purple-200">
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
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex-shrink-0 mt-0.5">
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
                    className="p-1 text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:opacity-50"
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
              <User className="h-5 w-5 text-green-600" />
              <span className="text-sm font-semibold text-green-900">New Patient Instruction</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <LabelWithTooltip
                  label="Category"
                  tooltip="Choose the type of patient instruction. Pre-procedure for preparation steps, post-procedure for recovery care, medication for taking medicines, lifestyle for daily habits, follow-up for next appointments, and emergency for urgent warning signs."
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
                  <option value="lifestyle">Lifestyle</option>
                  <option value="follow-up">Follow-Up</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <LabelWithTooltip
                  label="Priority"
                  tooltip="Set the importance level for the patient. High priority means the patient must follow this instruction carefully, medium for important guidance, and low for helpful recommendations."
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
                tooltip="Write instructions in simple, clear language that patients can easily understand. Include specific steps, timing, and what to do if problems arise. These instructions will be shared with the patient."
                required
              />
              <textarea
                value={editingItem.text}
                onChange={(e) => setEditingItem({ ...editingItem, text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="Enter instructions for the patient in clear, easy-to-understand language..."
                autoFocus
              />
            </div>

            {/* Quick Templates */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Quick Templates (click to use):</label>
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                {patientTemplates.map((template, idx) => (
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
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">
                Total Patient Instructions: <span className="text-lg font-bold">{items.length}</span>
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                High: {items.filter(i => i.priority === 'high').length}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-600"></span>
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
