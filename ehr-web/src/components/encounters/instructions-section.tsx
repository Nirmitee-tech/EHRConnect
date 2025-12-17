'use client';

import React, { useState, useEffect } from 'react';
import { Instruction } from '@/types/encounter';
import { Plus, Trash2, Edit2, Save, X, FileText } from 'lucide-react';

interface InstructionsSectionProps {
  instructions?: Instruction[];
  onUpdate: (instructions: Instruction[]) => void;
}

export function InstructionsSection({
  instructions = [],
  onUpdate
}: InstructionsSectionProps) {
  const [items, setItems] = useState<Instruction[]>(instructions);
  const [editingItem, setEditingItem] = useState<Instruction | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Sync with parent
  useEffect(() => {
    setItems(instructions);
  }, [instructions]);

  const handleAddItem = () => {
    const newItem: Instruction = {
      id: `instruction-${Date.now()}`,
      type: 'patient', // Default type for legacy component
      text: ''
    };
    setEditingItem(newItem);
    setIsAddingItem(true);
  };

  const handleSaveItem = () => {
    if (!editingItem || !editingItem.text.trim()) {
      alert('Instruction text is required');
      return;
    }

    let updatedItems: Instruction[];
    if (isAddingItem) {
      updatedItems = [...items, editingItem];
    } else {
      updatedItems = items.map(item =>
        item.id === editingItem.id ? editingItem : item
      );
    }

    setItems(updatedItems);
    onUpdate(updatedItems);
    setEditingItem(null);
    setIsAddingItem(false);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Delete this instruction?')) {
      const updatedItems = items.filter(item => item.id !== id);
      setItems(updatedItems);
      onUpdate(updatedItems);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setIsAddingItem(false);
  };

  // Common instruction templates
  const instructionTemplates = [
    'Apply ice pack for 15-20 minutes every 2-3 hours for the first 24 hours',
    'Avoid hard or sticky foods for 24 hours',
    'Take prescribed medications as directed',
    'Rinse with warm salt water 3 times daily after 24 hours',
    'Avoid drinking through a straw for 24 hours',
    'Do not smoke or use tobacco products',
    'Maintain good oral hygiene',
    'Return for follow-up appointment as scheduled',
    'Contact office if excessive bleeding, swelling, or pain occurs',
    'Avoid vigorous exercise for 24-48 hours'
  ];

  const handleUseTemplate = (template: string) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, text: template });
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={handleAddItem}
          className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 text-xs font-medium transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Instruction
        </button>
      </div>

      {/* Instructions List */}
      <div className="space-y-2">
        {items.length === 0 && !isAddingItem && (
          <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg">
            No post-treatment instructions added. Click "Add Instruction" to add one.
          </div>
        )}

        {items.map((item, index) => (
          editingItem?.id === item.id && !isAddingItem ? (
            <div key={item.id} className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Editing Instruction #{index + 1}</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Instruction Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={editingItem.text}
                  onChange={(e) => setEditingItem({ ...editingItem, text: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter post-treatment care instructions..."
                />
              </div>

              {/* Quick Templates */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Quick Templates:</label>
                <div className="flex flex-wrap gap-1">
                  {instructionTemplates.slice(0, 5).map((template, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleUseTemplate(template)}
                      className="text-xs px-2 py-1 bg-white border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      title={template}
                    >
                      {template.substring(0, 30)}...
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-blue-200">
                <button
                  onClick={handleSaveItem}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1.5 font-medium transition-colors"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
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
                  <p className="text-sm text-gray-900 flex-1">{item.text}</p>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
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
              <span className="text-sm font-semibold text-green-900">New Instruction</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Instruction Text <span className="text-red-500">*</span>
              </label>
              <textarea
                value={editingItem.text}
                onChange={(e) => setEditingItem({ ...editingItem, text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="Enter post-treatment care instructions..."
                autoFocus
              />
            </div>

            {/* Quick Templates */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Quick Templates (click to use):</label>
              <div className="grid grid-cols-2 gap-2">
                {instructionTemplates.map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleUseTemplate(template)}
                    className="text-xs px-3 py-2 bg-white border border-gray-300 rounded hover:bg-green-50 hover:border-green-300 transition-colors text-left"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-green-200">
              <button
                onClick={handleSaveItem}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1.5 font-medium transition-colors"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
              <button
                onClick={handleCancelEdit}
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
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Total Instructions: <span className="text-lg font-bold">{items.length}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
