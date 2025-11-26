'use client';

import React, { useState, useEffect } from 'react';
import { Prescription } from '@/types/encounter';
import { Plus, Trash2, Edit2, Save, X, Pill, Info, Zap, FileText, Layout, Search, Copy } from 'lucide-react';
import { prescriptionTemplates, prescriptionTemplatesByCategory, prescriptionCategories } from '@/data/prescription-templates';

interface PrescriptionsSectionEnhancedProps {
  prescriptions?: Prescription[];
  onUpdate: (prescriptions: Prescription[]) => void;
}

type AddMode = 'quick' | 'standard' | 'template';
type ViewMode = 'compact' | 'detailed';

// Helper functions to convert between FHIR and legacy format
const convertLegacyToFHIR = (prescription: Prescription): Prescription => {
  if (prescription.medicationCodeableConcept) {
    return prescription;
  }

  const fhirPrescription: Prescription = {
    ...prescription,
    resourceType: 'MedicationRequest',
    status: 'active',
    intent: 'order',
    medicationCodeableConcept: {
      text: prescription.medication || ''
    },
    authoredOn: new Date().toISOString()
  };

  if (prescription.dosage || prescription.frequency || prescription.duration) {
    fhirPrescription.dosageInstruction = [{
      text: prescription.instructions,
      doseAndRate: prescription.dosage ? [{
        doseQuantity: {
          value: parseFloat(prescription.dosage) || undefined,
          unit: prescription.dosage.replace(/[0-9.]/g, '').trim() || 'unit'
        }
      }] : undefined
    }];
  }

  return fhirPrescription;
};

const getMedicationName = (prescription: Prescription): string => {
  return (
    prescription.medicationCodeableConcept?.text ||
    prescription.medicationCodeableConcept?.coding?.[0]?.display ||
    prescription.medication ||
    ''
  );
};

const getDosageDisplay = (prescription: Prescription): string => {
  const dosageInstruction = prescription.dosageInstruction?.[0];
  if (dosageInstruction?.doseAndRate?.[0]?.doseQuantity) {
    const { value, unit } = dosageInstruction.doseAndRate[0].doseQuantity;
    return `${value || ''} ${unit || ''}`.trim();
  }
  return prescription.dosage || '';
};

const getFrequencyDisplay = (prescription: Prescription): string => {
  const dosageInstruction = prescription.dosageInstruction?.[0];
  if (dosageInstruction?.timing?.repeat) {
    const { frequency, period, periodUnit } = dosageInstruction.timing.repeat;
    if (frequency && period) {
      const unitMap: Record<string, string> = { h: 'hour', d: 'day', wk: 'week', mo: 'month' };
      const unit = unitMap[periodUnit || 'd'] || periodUnit;
      return `${frequency}x per ${period} ${unit}${period > 1 ? 's' : ''}`;
    }
  }
  return prescription.frequency || '';
};

const getDurationDisplay = (prescription: Prescription): string => {
  const dosageInstruction = prescription.dosageInstruction?.[0];
  if (dosageInstruction?.timing?.repeat) {
    const { duration, durationUnit } = dosageInstruction.timing.repeat;
    if (duration && durationUnit) {
      const unitMap: Record<string, string> = { h: 'hour', d: 'day', wk: 'week', mo: 'month' };
      const unit = unitMap[durationUnit] || durationUnit;
      return `${duration} ${unit}${duration > 1 ? 's' : ''}`;
    }
  }
  return prescription.duration || '';
};

const getInstructions = (prescription: Prescription): string => {
  return (
    prescription.dosageInstruction?.[0]?.text ||
    prescription.instructions ||
    ''
  );
};

export function PrescriptionsSectionEnhanced({
  prescriptions = [],
  onUpdate
}: PrescriptionsSectionEnhancedProps) {
  const [items, setItems] = useState<Prescription[]>(prescriptions);
  const [editingItem, setEditingItem] = useState<Prescription | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [addMode, setAddMode] = useState<AddMode>('quick');
  const [viewMode, setViewMode] = useState<ViewMode>('compact');

  // Template selection state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [templateSearch, setTemplateSearch] = useState('');

  useEffect(() => {
    setItems(prescriptions);
  }, [prescriptions]);

  const handleAddItem = (mode: AddMode = 'quick') => {
    const newItem: Prescription = {
      id: `prescription-${Date.now()}`,
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: { text: '' },
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      authoredOn: new Date().toISOString()
    };
    setEditingItem(newItem);
    setIsAddingItem(true);
    setAddMode(mode);
  };

  const handleUseTemplate = (templateId: string) => {
    const template = prescriptionTemplates.find(t => t.id === templateId);
    if (!template) return;

    const newItem: Prescription = {
      id: `prescription-${Date.now()}`,
      ...template.prescription,
      authoredOn: new Date().toISOString()
    };

    setEditingItem(newItem);
    setIsAddingItem(true);
    setAddMode('standard'); // Switch to standard mode for editing
  };

  const handleSaveItem = () => {
    const medName = getMedicationName(editingItem!);
    if (!editingItem || !medName) {
      alert('Medication name is required');
      return;
    }

    const fhirItem = convertLegacyToFHIR(editingItem);

    let updatedItems: Prescription[];
    if (isAddingItem) {
      updatedItems = [...items, fhirItem];
    } else {
      updatedItems = items.map(item =>
        item.id === fhirItem.id ? fhirItem : item
      );
    }

    setItems(updatedItems);
    onUpdate(updatedItems);
    setEditingItem(null);
    setIsAddingItem(false);
  };

  const handleQuickSave = () => {
    // For quick mode, allow saving with just medication name
    const medName = getMedicationName(editingItem!);
    if (!editingItem || !medName) {
      alert('Medication name is required');
      return;
    }
    handleSaveItem();
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Delete this prescription?')) {
      const updatedItems = items.filter(item => item.id !== id);
      setItems(updatedItems);
      onUpdate(updatedItems);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setIsAddingItem(false);
    setTemplateSearch('');
    setSelectedCategory('');
  };

  const handleDuplicate = (item: Prescription) => {
    const duplicatedItem: Prescription = {
      ...item,
      id: `prescription-${Date.now()}`,
      authoredOn: new Date().toISOString()
    };
    const updatedItems = [...items, duplicatedItem];
    setItems(updatedItems);
    onUpdate(updatedItems);
  };

  // Common options
  const frequencyOptions = [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'Four times daily',
    'Every 4 hours',
    'Every 6 hours',
    'Every 8 hours',
    'Every 12 hours',
    'As needed',
    'Before meals',
    'After meals',
    'At bedtime'
  ];

  const durationOptions = [
    '3 days',
    '5 days',
    '7 days',
    '10 days',
    '14 days',
    '1 month',
    '2 months',
    '3 months',
    'As needed'
  ];

  // Filter templates
  const filteredTemplates = prescriptionTemplates.filter(template => {
    const matchesSearch = templateSearch === '' ||
      template.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      template.description?.toLowerCase().includes(templateSearch.toLowerCase());
    const matchesCategory = selectedCategory === '' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs">
            <Info className="h-3 w-3 text-blue-600" />
            <span className="text-blue-700 font-medium">FHIR MedicationRequest</span>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('compact')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                viewMode === 'compact'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Layout className="h-3 w-3 inline mr-1" />
              Compact
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                viewMode === 'detailed'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="h-3 w-3 inline mr-1" />
              Detailed
            </button>
          </div>
        </div>

        {/* Add Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAddItem('quick')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium transition-colors"
            title="Quick add with minimal fields"
          >
            <Zap className="h-3.5 w-3.5" />
            Quick Add
          </button>
          <button
            onClick={() => handleAddItem('standard')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium transition-colors"
            title="Standard form with all fields"
          >
            <Plus className="h-3.5 w-3.5" />
            Standard
          </button>
          <button
            onClick={() => handleAddItem('template')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs font-medium transition-colors"
            title="Use pre-filled templates"
          >
            <FileText className="h-3.5 w-3.5" />
            Template
          </button>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-3">
        {items.length === 0 && !isAddingItem && (
          <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg">
            No prescriptions added. Choose a method to add one.
          </div>
        )}

        {items.map((item, index) => (
          editingItem?.id === item.id && !isAddingItem ? (
            // Edit mode
            <EditForm
              key={item.id}
              item={editingItem}
              index={index}
              mode="standard"
              onItemChange={setEditingItem}
              onSave={handleSaveItem}
              onCancel={handleCancelEdit}
              frequencyOptions={frequencyOptions}
              durationOptions={durationOptions}
            />
          ) : viewMode === 'compact' ? (
            // Compact view
            <CompactPrescriptionCard
              key={item.id}
              item={item}
              onEdit={() => setEditingItem(item)}
              onDelete={() => handleDeleteItem(item.id)}
              onDuplicate={() => handleDuplicate(item)}
            />
          ) : (
            // Detailed view
            <DetailedPrescriptionCard
              key={item.id}
              item={item}
              index={index}
              onEdit={() => setEditingItem(item)}
              onDelete={() => handleDeleteItem(item.id)}
              onDuplicate={() => handleDuplicate(item)}
            />
          )
        ))}

        {/* Add new item form */}
        {isAddingItem && editingItem && (
          <>
            {addMode === 'template' ? (
              <TemplateSelector
                templates={filteredTemplates}
                categories={prescriptionCategories}
                selectedCategory={selectedCategory}
                searchQuery={templateSearch}
                onCategoryChange={setSelectedCategory}
                onSearchChange={setTemplateSearch}
                onTemplateSelect={handleUseTemplate}
                onCancel={handleCancelEdit}
              />
            ) : addMode === 'quick' ? (
              <QuickAddForm
                item={editingItem}
                onItemChange={setEditingItem}
                onSave={handleQuickSave}
                onCancel={handleCancelEdit}
                frequencyOptions={frequencyOptions}
              />
            ) : (
              <EditForm
                item={editingItem}
                index={-1}
                mode="add"
                onItemChange={setEditingItem}
                onSave={handleSaveItem}
                onCancel={handleCancelEdit}
                frequencyOptions={frequencyOptions}
                durationOptions={durationOptions}
              />
            )}
          </>
        )}
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="text-sm font-medium text-purple-900">
            Total Prescriptions: <span className="text-lg font-bold">{items.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Quick Add Form Component
function QuickAddForm({
  item,
  onItemChange,
  onSave,
  onCancel,
  frequencyOptions
}: {
  item: Prescription;
  onItemChange: (item: Prescription) => void;
  onSave: () => void;
  onCancel: () => void;
  frequencyOptions: string[];
}) {
  return (
    <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="h-5 w-5 text-green-600" />
        <span className="text-sm font-semibold text-green-900">Quick Add Prescription</span>
        <span className="text-xs text-green-700">(Minimum required fields)</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Medication Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={getMedicationName(item)}
            onChange={(e) => onItemChange({
              ...item,
              medication: e.target.value,
              medicationCodeableConcept: { text: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="e.g., Amoxicillin 500mg"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Dosage</label>
          <input
            type="text"
            value={item.dosage || ''}
            onChange={(e) => onItemChange({ ...item, dosage: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="e.g., 1 tablet"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
          <select
            value={item.frequency || ''}
            onChange={(e) => onItemChange({ ...item, frequency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            value={item.duration || ''}
            onChange={(e) => onItemChange({ ...item, duration: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="e.g., 7 days"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-green-200">
        <button
          onClick={onSave}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1.5 font-medium transition-colors"
        >
          <Save className="h-4 w-4" />
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-400 text-white rounded-lg text-sm hover:bg-gray-500 flex items-center gap-1.5 font-medium transition-colors"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}

// Standard Edit Form Component
function EditForm({
  item,
  index,
  mode,
  onItemChange,
  onSave,
  onCancel,
  frequencyOptions,
  durationOptions
}: {
  item: Prescription;
  index: number;
  mode: 'add' | 'edit' | 'standard';
  onItemChange: (item: Prescription) => void;
  onSave: () => void;
  onCancel: () => void;
  frequencyOptions: string[];
  durationOptions: string[];
}) {
  const isAddMode = mode === 'add' || mode === 'standard';
  const bgColor = isAddMode ? 'bg-blue-50' : 'bg-blue-50';
  const borderColor = isAddMode ? 'border-blue-300' : 'border-blue-300';
  const iconColor = isAddMode ? 'text-blue-600' : 'text-blue-600';
  const titleColor = isAddMode ? 'text-blue-900' : 'text-blue-900';
  const ringColor = 'ring-blue-500';

  return (
    <div className={`${bgColor} border-2 ${borderColor} rounded-lg p-4 space-y-3`}>
      <div className="flex items-center gap-2 mb-2">
        <Pill className={`h-5 w-5 ${iconColor}`} />
        <span className={`text-sm font-semibold ${titleColor}`}>
          {isAddMode ? 'New Prescription' : `Editing Prescription #${index + 1}`}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Medication Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={getMedicationName(item)}
            onChange={(e) => onItemChange({
              ...item,
              medication: e.target.value,
              medicationCodeableConcept: { text: e.target.value }
            })}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:${ringColor} focus:border-transparent`}
            placeholder="e.g., Amoxicillin 500mg"
            autoFocus={isAddMode}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Dosage</label>
          <input
            type="text"
            value={item.dosage || ''}
            onChange={(e) => onItemChange({ ...item, dosage: e.target.value })}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:${ringColor} focus:border-transparent`}
            placeholder="e.g., 1 tablet, 5ml"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Frequency</label>
          <select
            value={item.frequency || ''}
            onChange={(e) => onItemChange({ ...item, frequency: e.target.value })}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:${ringColor} focus:border-transparent`}
          >
            <option value="">Select frequency...</option>
            {frequencyOptions.map(freq => (
              <option key={freq} value={freq}>{freq}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Duration</label>
          <select
            value={item.duration || ''}
            onChange={(e) => onItemChange({ ...item, duration: e.target.value })}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:${ringColor} focus:border-transparent`}
          >
            <option value="">Select duration...</option>
            {durationOptions.map(dur => (
              <option key={dur} value={dur}>{dur}</option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Instructions</label>
          <textarea
            value={item.instructions || ''}
            onChange={(e) => onItemChange({ ...item, instructions: e.target.value })}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:${ringColor} focus:border-transparent`}
            rows={2}
            placeholder="Special instructions for the patient..."
          />
        </div>
      </div>

      <div className={`flex justify-end gap-2 pt-2 border-t ${borderColor}`}>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-1.5 font-medium transition-colors"
        >
          <Save className="h-4 w-4" />
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-400 text-white rounded-lg text-sm hover:bg-gray-500 flex items-center gap-1.5 font-medium transition-colors"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}

// Template Selector Component
function TemplateSelector({
  templates,
  categories,
  selectedCategory,
  searchQuery,
  onCategoryChange,
  onSearchChange,
  onTemplateSelect,
  onCancel
}: {
  templates: any[];
  categories: string[];
  selectedCategory: string;
  searchQuery: string;
  onCategoryChange: (category: string) => void;
  onSearchChange: (query: string) => void;
  onTemplateSelect: (id: string) => void;
  onCancel: () => void;
}) {
  return (
    <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-semibold text-purple-900">Select Prescription Template</span>
        </div>
        <button
          onClick={onCancel}
          className="p-1 text-gray-500 hover:text-gray-700 rounded transition-colors"
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
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
        {templates.map(template => (
          <button
            key={template.id}
            onClick={() => onTemplateSelect(template.id)}
            className="text-left p-3 bg-white border border-purple-200 rounded-lg hover:border-purple-400 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-2">
              <Pill className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 truncate">{template.name}</h4>
                <p className="text-xs text-purple-600 font-medium">{template.category}</p>
                {template.description && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{template.description}</p>
                )}
                <div className="mt-1 text-xs text-gray-500 space-y-0.5">
                  <div><span className="font-medium">Dosage:</span> {template.prescription.dosage}</div>
                  <div><span className="font-medium">Frequency:</span> {template.prescription.frequency}</div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          No templates found matching your criteria.
        </div>
      )}
    </div>
  );
}

// Compact Prescription Card
function CompactPrescriptionCard({
  item,
  onEdit,
  onDelete,
  onDuplicate
}: {
  item: Prescription;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Pill className="h-4 w-4 text-purple-600" />
            <h4 className="text-sm font-bold text-gray-900 truncate">
              {getMedicationName(item)}
            </h4>
            {item.status && (
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {item.status}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600 mb-1">
            <span><span className="font-medium text-gray-700">Dose:</span> {getDosageDisplay(item) || '-'}</span>
            <span><span className="font-medium text-gray-700">Freq:</span> {getFrequencyDisplay(item) || '-'}</span>
            {getDurationDisplay(item) && (
              <span><span className="font-medium text-gray-700">Duration:</span> {getDurationDisplay(item)}</span>
            )}
          </div>

          {getInstructions(item) && (
            <div className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 mt-1">
              {getInstructions(item)}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onDuplicate}
            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
            title="Duplicate"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Detailed Prescription Card
function DetailedPrescriptionCard({
  item,
  index,
  onEdit,
  onDelete,
  onDuplicate
}: {
  item: Prescription;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Pill className="h-5 w-5 text-purple-600" />
            <h4 className="text-base font-bold text-gray-900">{getMedicationName(item)}</h4>
            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-medium">
              #{index + 1}
            </span>
            {item.status && (
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {item.status}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-2">
            <div>
              <span className="text-xs font-medium text-gray-500">Dosage:</span>
              <p className="text-sm text-gray-900">{getDosageDisplay(item) || '-'}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500">Frequency:</span>
              <p className="text-sm text-gray-900">{getFrequencyDisplay(item) || '-'}</p>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500">Duration:</span>
              <p className="text-sm text-gray-900">{getDurationDisplay(item) || '-'}</p>
            </div>
          </div>

          {getInstructions(item) && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <span className="text-xs font-medium text-yellow-800">Instructions:</span>
              <p className="text-sm text-yellow-900 mt-0.5">{getInstructions(item)}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 ml-3">
          <button
            onClick={onDuplicate}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors"
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
