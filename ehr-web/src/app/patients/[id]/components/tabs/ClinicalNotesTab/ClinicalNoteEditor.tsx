'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  FileText,
  Calendar,
  Tag as TagIcon,
  User,
  Sparkles,
  List,
  AlignLeft,
  Bold,
  Italic,
  Underline,
  ListOrdered,
  MessageSquare,
  Clock,
  Star
} from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@nirmitee.io/design-system';

interface ClinicalNote {
  id: string;
  date: Date | string;
  noteType: string;
  category: string;
  narrative: string;
  createdBy?: string;
  createdByName?: string;
  isFavorite?: boolean;
  tags?: string[];
}

interface ClinicalNoteEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (note: ClinicalNote) => Promise<void>;
  note?: ClinicalNote | null;
  mode?: 'create' | 'edit';
}

const NOTE_TYPES = [
  { value: 'Progress Note', description: 'Regular progress and follow-up notes' },
  { value: 'SOAP Note', description: 'Subjective, Objective, Assessment, Plan format' },
  { value: 'Consultation Note', description: 'Specialist consultation documentation' },
  { value: 'Discharge Summary', description: 'End of encounter summary' },
  { value: 'History & Physical', description: 'Initial comprehensive exam' },
  { value: 'Operative Note', description: 'Surgical procedure documentation' },
  { value: 'Procedure Note', description: 'Non-surgical procedure documentation' },
  { value: 'Follow-up Note', description: 'Follow-up visit documentation' },
  { value: 'Telephone Encounter', description: 'Phone consultation notes' },
  { value: 'Other', description: 'Other clinical documentation' }
];

const NOTE_CATEGORIES = [
  'General',
  'Follow-up',
  'Pre-operative',
  'Post-operative',
  'Emergency',
  'Consultation',
  'Lab Results',
  'Imaging Results',
  'Other'
];

const SOAP_TEMPLATE = `Subjective:
[Patient's chief complaint and history in their own words]

Objective:
[Physical examination findings, vital signs, lab/test results]

Assessment:
[Diagnosis, differential diagnoses, and clinical impression]

Plan:
[Treatment plan, medications, follow-up, patient education]`;

const PROGRESS_NOTE_TEMPLATE = `Chief Complaint:
[Brief description of the reason for visit]

History of Present Illness:
[Detailed description of symptoms, timeline, and relevant history]

Review of Systems:
[Systematic review of body systems]

Physical Examination:
[Findings from physical exam]

Assessment and Plan:
[Clinical assessment and treatment plan]`;

const TEMPLATES: { [key: string]: string } = {
  'SOAP Note': SOAP_TEMPLATE,
  'Progress Note': PROGRESS_NOTE_TEMPLATE
};

export function ClinicalNoteEditor({
  open,
  onOpenChange,
  onSave,
  note,
  mode = 'create'
}: ClinicalNoteEditorProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ClinicalNote>({
    id: '',
    date: new Date().toISOString().slice(0, 16),
    noteType: 'Progress Note',
    category: 'General',
    narrative: '',
    tags: [],
    isFavorite: false
  });
  const [newTag, setNewTag] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    if (note && mode === 'edit') {
      setFormData({
        ...note,
        date: typeof note.date === 'string' ? note.date : note.date.toISOString().slice(0, 16),
        tags: note.tags || []
      });
    } else if (!open) {
      // Reset form when drawer closes
      setFormData({
        id: '',
        date: new Date().toISOString().slice(0, 16),
        noteType: 'Progress Note',
        category: 'General',
        narrative: '',
        tags: [],
        isFavorite: false
      });
    }
  }, [note, mode, open]);

  const handleSave = async () => {
    if (!formData.narrative.trim()) {
      alert('Please enter note content');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const applyTemplate = (template: string) => {
    setFormData({ ...formData, narrative: template });
    setShowTemplates(false);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  const wordCount = formData.narrative.trim().split(/\s+/).filter(w => w.length > 0).length;
  const charCount = formData.narrative.length;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" size="2xl" className="overflow-y-auto">
        <DrawerHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-xl font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                {mode === 'edit' ? 'Edit Clinical Note' : 'New Clinical Note'}
              </DrawerTitle>
              <p className="text-xs text-gray-600 mt-1">
                Document encounter findings, assessments, and plans
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Templates
              </button>
            </div>
          </div>
        </DrawerHeader>

        <div className="p-6 space-y-6">
          {/* Templates Panel */}
          {showTemplates && (
            <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                Quick Start Templates
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(TEMPLATES).map(([name, template]) => (
                  <button
                    key={name}
                    onClick={() => applyTemplate(template)}
                    className="text-left p-3 bg-white rounded-lg border border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all"
                  >
                    <div className="text-sm font-semibold text-gray-900">{name}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      Pre-formatted {name.toLowerCase()} structure
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Note Details</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.date as string}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Favorite Toggle */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <Star className="h-3.5 w-3.5" />
                  Mark as Important
                </label>
                <button
                  onClick={() => setFormData({ ...formData, isFavorite: !formData.isFavorite })}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${formData.isFavorite
                      ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-400'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {formData.isFavorite ? (
                    <div className="flex items-center justify-center gap-2">
                      <Star className="h-4 w-4 fill-yellow-500" />
                      Marked as Important
                    </div>
                  ) : (
                    'Mark as Important'
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              {/* Note Type */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <List className="h-3.5 w-3.5" />
                  Note Type
                </label>
                <select
                  value={formData.noteType}
                  onChange={(e) => setFormData({ ...formData, noteType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {NOTE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.value}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {NOTE_TYPES.find(t => t.value === formData.noteType)?.description}
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <TagIcon className="h-3.5 w-3.5" />
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {NOTE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <TagIcon className="h-3.5 w-3.5" />
              Tags (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tag and press Enter"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                Add
              </button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Narrative */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <AlignLeft className="h-3.5 w-3.5" />
                Clinical Narrative
              </div>
              <div className="text-xs text-gray-500 font-normal">
                {wordCount} words, {charCount} characters
              </div>
            </label>
            <textarea
              value={formData.narrative}
              onChange={(e) => setFormData({ ...formData, narrative: e.target.value })}
              placeholder="Document your clinical findings, assessment, and plan here...

Tip: Use templates for structured note formats"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[400px] font-mono leading-relaxed"
            />
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <MessageSquare className="h-3 w-3" />
              Minimum 10 words recommended for comprehensive documentation
            </div>
          </div>

          {/* Validation Warning */}
          {formData.narrative.trim() && wordCount < 10 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800">Brief Note Detected</h4>
                  <p className="text-xs text-yellow-700 mt-1">
                    Consider adding more detail for better documentation. Current: {wordCount} words.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formData.narrative.trim()}
              className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {mode === 'edit' ? 'Update' : 'Save'} Note
                </>
              )}
            </button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
