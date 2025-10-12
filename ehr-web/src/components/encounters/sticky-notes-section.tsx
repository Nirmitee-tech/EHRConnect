'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash2, ChevronUp, ChevronDown, Save, X } from 'lucide-react';
import { NoteData } from '@/types/encounter';

interface StickyNotesSectionProps {
  title: string;
  type: 'social' | 'internal';
  notes: NoteData[];
  onUpdate: (notes: NoteData[]) => Promise<void>;
  currentUserId: string;
  currentUserName: string;
}

export function StickyNotesSection({
  title,
  type,
  notes,
  onUpdate,
  currentUserId,
  currentUserName
}: StickyNotesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ content: '', remarks: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!formData.content.trim()) return;

    const newNote: NoteData = {
      id: `temp-${Date.now()}`,
      type,
      content: formData.content.trim(),
      remarks: formData.remarks.trim(),
      createdBy: currentUserId,
      createdByName: currentUserName,
      createdAt: new Date().toISOString(),
    };

    await onUpdate([...notes, newNote]);
    setFormData({ content: '', remarks: '' });
    setShowAddForm(false);
  };

  const handleEdit = async () => {
    if (!editingId || !formData.content.trim()) return;

    const updatedNotes = notes.map(note =>
      note.id === editingId
        ? {
            ...note,
            content: formData.content.trim(),
            remarks: formData.remarks.trim(),
            updatedAt: new Date().toISOString(),
          }
        : note
    );

    await onUpdate(updatedNotes);
    setEditingId(null);
    setFormData({ content: '', remarks: '' });
  };

  const handleDelete = async (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    await onUpdate(updatedNotes);
    setDeleteConfirm(null);
  };

  const startEdit = (note: NoteData) => {
    setEditingId(note.id);
    setFormData({
      content: note.content,
      remarks: note.remarks || '',
    });
    setShowAddForm(false);
    setIsExpanded(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ content: '', remarks: '' });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const emptyMessage =
    type === 'social'
      ? { title: 'Know your patient better.', subtitle: 'Nurture a bond.' }
      : { title: "Know your patient's preferences.", subtitle: 'Serve them better.' };

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-xs font-semibold text-blue-900">{title}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowAddForm(true);
              setEditingId(null);
              setFormData({ content: '', remarks: '' });
              setIsExpanded(true);
            }}
            className="p-0.5 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Plus className="h-3 w-3" />
          </button>
          {isExpanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-gray-600" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-gray-600" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3">
          {/* Empty State */}
          {notes.length === 0 && !showAddForm && !editingId ? (
            <div className="text-center py-3">
              <p className="text-xs text-gray-600 font-medium">{emptyMessage.title}</p>
              <p className="text-xs text-gray-500">{emptyMessage.subtitle}</p>
            </div>
          ) : (
            /* Notes List */
            <div className="space-y-2 mb-2">
              {notes.map((note) =>
                editingId === note.id ? (
                  /* Edit Form */
                  <div key={note.id} className="p-2 bg-yellow-50 border border-yellow-300 rounded shadow-sm">
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Note content..."
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs resize-none focus:ring-1 focus:ring-blue-500 mb-1"
                      rows={3}
                      autoFocus
                    />
                    <input
                      type="text"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      placeholder="Remarks (optional)..."
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 mb-2"
                    />
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleEdit}
                        className="flex-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 flex items-center justify-center gap-1"
                      >
                        <Save className="h-3 w-3" />
                        Update
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 flex items-center justify-center gap-1"
                      >
                        <X className="h-3 w-3" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Note Display */
                  <div
                    key={note.id}
                    className={`p-2 rounded shadow-sm relative ${
                      type === 'social'
                        ? 'bg-yellow-50 border border-yellow-200'
                        : 'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <div className="pr-12">
                      <p className="text-xs text-gray-800 whitespace-pre-wrap mb-1">{note.content}</p>
                      {note.remarks && (
                        <p className="text-xs text-gray-600 italic mb-1">Remarks: {note.remarks}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="font-medium">{note.createdByName}</span>
                        <span>•</span>
                        <span>{formatDate(note.createdAt)}</span>
                        {note.updatedAt && (
                          <>
                            <span>•</span>
                            <span className="text-orange-600">Edited</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <button
                        onClick={() => startEdit(note)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Edit note"
                      >
                        <Edit className="h-3 w-3 text-gray-600" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(note.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="h-3 w-3 text-red-600" />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* Add New Form */}
          {showAddForm && (
            <div className="p-2 bg-green-50 border border-green-300 rounded shadow-sm">
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Add a new note..."
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs resize-none focus:ring-1 focus:ring-blue-500 mb-1"
                rows={3}
                autoFocus
              />
              <input
                type="text"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Remarks (optional)..."
                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 mb-2"
              />
              <div className="flex items-center gap-1">
                <button
                  onClick={handleAdd}
                  className="flex-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center justify-center gap-1"
                >
                  <Save className="h-3 w-3" />
                  Add Note
                </button>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ content: '', remarks: '' });
                  }}
                  className="flex-1 px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 flex items-center justify-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Note</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
