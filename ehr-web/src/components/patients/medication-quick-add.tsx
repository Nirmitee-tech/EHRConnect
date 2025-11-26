'use client';

import React, { useState } from 'react';
import { Prescription } from '@/types/encounter';
import { Plus, Zap, FileText, X, Save, Pill, Search } from 'lucide-react';
import { prescriptionTemplates, prescriptionCategories } from '@/data/prescription-templates';

interface MedicationQuickAddProps {
  patientId: string;
  onAdd: (prescription: Prescription) => Promise<void>;
  className?: string;
}

type QuickMode = 'closed' | 'quick' | 'template';

export function MedicationQuickAdd({ patientId, onAdd, className = '' }: MedicationQuickAddProps) {
  const [mode, setMode] = useState<QuickMode>('closed');
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Template state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');

  const frequencyOptions = [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'Four times daily',
    'Every 4 hours',
    'Every 6 hours',
    'Every 8 hours',
    'As needed',
    'Before meals',
    'After meals',
    'At bedtime'
  ];

  const resetForm = () => {
    setMedication('');
    setDosage('');
    setFrequency('');
    setDuration('');
    setInstructions('');
    setTemplateSearch('');
    setSelectedCategory('');
  };

  const handleQuickAdd = async () => {
    if (!medication.trim()) {
      alert('Medication name is required');
      return;
    }

    const prescription: Prescription = {
      id: `prescription-${Date.now()}`,
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: { text: medication },
      medication,
      dosage: dosage || undefined,
      frequency: frequency || undefined,
      duration: duration || undefined,
      instructions: instructions || undefined,
      authoredOn: new Date().toISOString(),
      subject: {
        reference: `Patient/${patientId}`
      }
    };

    setIsSaving(true);
    try {
      await onAdd(prescription);
      resetForm();
      setMode('closed');
    } catch (error) {
      console.error('Error adding prescription:', error);
      alert('Failed to add prescription. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTemplateSelect = async (templateId: string) => {
    const template = prescriptionTemplates.find(t => t.id === templateId);
    if (!template) return;

    const prescription: Prescription = {
      id: `prescription-${Date.now()}`,
      ...template.prescription,
      authoredOn: new Date().toISOString(),
      subject: {
        reference: `Patient/${patientId}`
      }
    };

    setIsSaving(true);
    try {
      await onAdd(prescription);
      resetForm();
      setMode('closed');
    } catch (error) {
      console.error('Error adding prescription:', error);
      alert('Failed to add prescription from template. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setMode('closed');
  };

  // Filter templates
  const filteredTemplates = prescriptionTemplates.filter(template => {
    const matchesSearch = templateSearch === '' ||
      template.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      template.description?.toLowerCase().includes(templateSearch.toLowerCase());
    const matchesCategory = selectedCategory === '' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (mode === 'closed') {
    return (
      <div className={`flex gap-2 ${className}`}>
        <button
          onClick={() => setMode('quick')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors shadow-sm"
        >
          <Zap className="h-4 w-4" />
          Quick Prescribe
        </button>
        <button
          onClick={() => setMode('template')}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium transition-colors shadow-sm"
        >
          <FileText className="h-4 w-4" />
          From Template
        </button>
      </div>
    );
  }

  if (mode === 'template') {
    return (
      <div className={`bg-purple-50 border-2 border-purple-300 rounded-lg p-4 space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-semibold text-purple-900">Select Template</span>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
            disabled={isSaving}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={templateSearch}
              onChange={(e) => setTemplateSearch(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isSaving}
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            disabled={isSaving}
          >
            <option value="">All Categories</option>
            {prescriptionCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
          {filteredTemplates.map(template => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template.id)}
              disabled={isSaving}
              className="text-left p-3 bg-white border border-purple-200 rounded-lg hover:border-purple-400 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start gap-2">
                <Pill className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">{template.name}</h4>
                  <p className="text-xs text-purple-600 font-medium">{template.category}</p>
                  {template.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{template.description}</p>
                  )}
                  <div className="mt-1 text-xs text-gray-500">
                    <div><span className="font-medium">Dosage:</span> {template.prescription.dosage}</div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            No templates found.
          </div>
        )}
      </div>
    );
  }

  // Quick mode
  return (
    <div className={`bg-green-50 border-2 border-green-400 rounded-lg p-4 space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-green-600" />
          <span className="text-sm font-semibold text-green-900">Quick Prescribe</span>
        </div>
        <button
          onClick={handleCancel}
          className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
          disabled={isSaving}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Medication <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={medication}
            onChange={(e) => setMedication(e.target.value)}
            placeholder="e.g., Amoxicillin 500mg"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isSaving}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Dosage</label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="1 tablet"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isSaving}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isSaving}
            >
              <option value="">Select...</option>
              {frequencyOptions.map(freq => (
                <option key={freq} value={freq}>{freq}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="7 days"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={isSaving}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Instructions (optional)</label>
          <input
            type="text"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Take with food"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-green-200">
        <button
          onClick={handleQuickAdd}
          disabled={isSaving || !medication.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1.5 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="px-4 py-2 bg-gray-400 text-white rounded-lg text-sm hover:bg-gray-500 flex items-center gap-1.5 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}
