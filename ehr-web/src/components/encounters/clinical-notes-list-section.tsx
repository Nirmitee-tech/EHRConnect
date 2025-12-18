'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { ClinicalNote } from '@/types/encounter';
import { v4 as uuidv4 } from 'uuid';

interface ClinicalNotesListSectionProps {
  notes: ClinicalNote[];
  onUpdate: (notes: ClinicalNote[]) => void;
  currentUserId?: string;
  currentUserName?: string;
}

// Note types following OpenEMR conventions
const NOTE_TYPES = [
  'Progress Note',
  'SOAP Note',
  'Consultation Note',
  'Discharge Summary',
  'History & Physical',
  'Operative Note',
  'Procedure Note',
  'Follow-up Note',
  'Telephone Encounter',
  'Other'
];

// Note categories
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

export function ClinicalNotesListSection({
  notes = [],
  onUpdate,
  currentUserId = 'unknown',
  currentUserName = 'Unknown User'
}: ClinicalNotesListSectionProps) {
  const [editingNote, setEditingNote] = useState<ClinicalNote | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Initialize new note
  const createNewNote = (): ClinicalNote => ({
    id: uuidv4(),
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    noteType: '',
    category: '',
    narrative: '',
    createdBy: currentUserId,
    createdByName: currentUserName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const handleAdd = () => {
    const newNote = createNewNote();
    setEditingNote(newNote);
    setIsAddingNew(true);
  };

  const handleSave = () => {
    if (!editingNote) return;

    // Validation
    if (!editingNote.noteType.trim()) {
      alert('Please select a note type');
      return;
    }
    if (!editingNote.category.trim()) {
      alert('Please select a category');
      return;
    }
    if (!editingNote.narrative.trim()) {
      alert('Please enter narrative content');
      return;
    }

    let updatedNotes: ClinicalNote[];
    if (isAddingNew) {
      // Add new note
      updatedNotes = [...notes, editingNote];
    } else {
      // Update existing note
      updatedNotes = notes.map(note =>
        note.id === editingNote.id
          ? { ...editingNote, updatedAt: new Date().toISOString() }
          : note
      );
    }

    onUpdate(updatedNotes);
    setEditingNote(null);
    setIsAddingNew(false);
  };

  const handleDelete = (noteId: string) => {
    if (!confirm('Are you sure you want to delete this clinical note?')) {
      return;
    }

    const updatedNotes = notes.filter(note => note.id !== noteId);
    onUpdate(updatedNotes);
  };

  const handleCancel = () => {
    setEditingNote(null);
    setIsAddingNew(false);
  };

  const handleEdit = (note: ClinicalNote) => {
    setEditingNote({ ...note });
    setIsAddingNew(false);
  };

  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Clinical Notes</h3>
        <button
          onClick={handleAdd}
          disabled={editingNote !== null}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Note
        </button>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        {notes.length === 0 && !editingNote && (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-500">No clinical notes added yet</p>
            <p className="text-xs text-gray-400 mt-1">Click "Add Note" to create your first note</p>
          </div>
        )}

        {notes.map((note) => (
          <div key={note.id} className="bg-white border border-gray-300 rounded-lg shadow-sm">
            {editingNote?.id === note.id && !isAddingNew ? (
              // Edit Mode
              <div className="p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Edit Clinical Note</h4>
                <div className="space-y-3">
                  {/* Date */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={editingNote.date.toString().split('T')[0]}
                      onChange={(e) => setEditingNote({ ...editingNote, date: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editingNote.noteType}
                      onChange={(e) => setEditingNote({ ...editingNote, noteType: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Note Type</option>
                      {NOTE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editingNote.category}
                      onChange={(e) => setEditingNote({ ...editingNote, category: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Note Category</option>
                      {NOTE_CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Narrative */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Narrative <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={editingNote.narrative}
                      onChange={(e) => setEditingNote({ ...editingNote, narrative: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={6}
                      placeholder="Enter detailed clinical narrative..."
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:opacity-90 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">
                      {formatDate(note.date)}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      {note.noteType}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                      {note.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(note)}
                      disabled={editingNote !== null}
                      className="text-blue-600 hover:text-blue-700 text-xs font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      disabled={editingNote !== null}
                      className="text-red-600 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.narrative}</p>
                </div>
                {note.createdByName && (
                  <div className="mt-2 text-xs text-gray-500">
                    Created by {note.createdByName} on {formatDate(note.createdAt || note.date)}
                    {note.updatedAt && note.updatedAt !== note.createdAt && (
                      <span> • Updated {formatDate(note.updatedAt)}</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* New Note Form */}
        {isAddingNew && editingNote && (
          <div className="bg-white border-2 border-blue-300 rounded-lg shadow-md p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">New Clinical Note</h4>
            <div className="space-y-3">
              {/* Date */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={editingNote.date.toString().split('T')[0]}
                  onChange={(e) => setEditingNote({ ...editingNote, date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={editingNote.noteType}
                  onChange={(e) => setEditingNote({ ...editingNote, noteType: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Note Type</option>
                  {NOTE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={editingNote.category}
                  onChange={(e) => setEditingNote({ ...editingNote, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Note Category</option>
                  {NOTE_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Narrative */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Narrative <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={editingNote.narrative}
                  onChange={(e) => setEditingNote({ ...editingNote, narrative: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={6}
                  placeholder="Enter detailed clinical narrative..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:opacity-90 transition-colors"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
