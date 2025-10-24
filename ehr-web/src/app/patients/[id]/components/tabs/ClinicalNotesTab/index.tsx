'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Tag,
  Edit2,
  Trash2,
  Clock,
  Star,
  StarOff,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface ClinicalNote {
  id: string;
  date: Date | string;
  noteType: string;
  category: string;
  narrative: string;
  createdBy?: string;
  createdByName?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  isFavorite?: boolean;
  tags?: string[];
}

interface ClinicalNotesTabProps {
  notes: ClinicalNote[];
  onAddNote: () => void;
  onEditNote: (note: ClinicalNote) => void;
  onDeleteNote: (noteId: string) => void;
  onToggleFavorite?: (noteId: string) => void;
}

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

export function ClinicalNotesTab({
  notes,
  onAddNote,
  onEditNote,
  onDeleteNote,
  onToggleFavorite
}: ClinicalNotesTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort notes
  const filteredAndSortedNotes = useMemo(() => {
    let filtered = [...notes];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note =>
        note.narrative.toLowerCase().includes(query) ||
        note.noteType.toLowerCase().includes(query) ||
        note.category.toLowerCase().includes(query) ||
        note.createdByName?.toLowerCase().includes(query) ||
        note.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(note => note.noteType === selectedType);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(note => note.category === selectedCategory);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc'
          ? a.noteType.localeCompare(b.noteType)
          : b.noteType.localeCompare(a.noteType);
      }
    });

    return filtered;
  }, [notes, searchQuery, selectedType, selectedCategory, sortBy, sortOrder]);

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Progress Note': 'bg-blue-100 text-blue-700 border-blue-300',
      'SOAP Note': 'bg-purple-100 text-purple-700 border-purple-300',
      'Consultation Note': 'bg-green-100 text-green-700 border-green-300',
      'Discharge Summary': 'bg-orange-100 text-orange-700 border-orange-300',
      'History & Physical': 'bg-pink-100 text-pink-700 border-pink-300',
      'Operative Note': 'bg-red-100 text-red-700 border-red-300',
      'Procedure Note': 'bg-indigo-100 text-indigo-700 border-indigo-300',
      'Follow-up Note': 'bg-teal-100 text-teal-700 border-teal-300',
      'Telephone Encounter': 'bg-cyan-100 text-cyan-700 border-cyan-300'
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Statistics
  const stats = useMemo(() => {
    return {
      total: notes.length,
      favorites: notes.filter(n => n.isFavorite).length,
      thisWeek: notes.filter(n => {
        const noteDate = new Date(n.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return noteDate >= weekAgo;
      }).length,
      byType: NOTE_TYPES.reduce((acc, type) => {
        acc[type] = notes.filter(n => n.noteType === type).length;
        return acc;
      }, {} as { [key: string]: number })
    };
  }, [notes]);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              Clinical Notes
            </h2>
            <p className="text-sm text-gray-600 mt-1">Comprehensive encounter documentation and clinical narratives</p>
          </div>
          <button
            onClick={onAddNote}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <Plus className="h-4 w-4" />
            New Note
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-600 mt-1">Total Notes</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{stats.thisWeek}</div>
            <div className="text-xs text-gray-600 mt-1">This Week</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">{stats.favorites}</div>
            <div className="text-xs text-gray-600 mt-1">Favorites</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{filteredAndSortedNotes.length}</div>
            <div className="text-xs text-gray-600 mt-1">Filtered</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes by content, type, category, author, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${
              showFilters || selectedType !== 'all' || selectedCategory !== 'all'
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {(selectedType !== 'all' || selectedCategory !== 'all') && (
              <span className="ml-1 px-1.5 py-0.5 bg-blue-600 text-white rounded-full text-xs">
                {(selectedType !== 'all' ? 1 : 0) + (selectedCategory !== 'all' ? 1 : 0)}
              </span>
            )}
          </button>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'type')}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="type">Sort by Type</option>
            </select>
            <button
              onClick={toggleSort}
              className="p-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="h-4 w-4 text-gray-600" />
              ) : (
                <SortDesc className="h-4 w-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Note Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                {NOTE_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type} {stats.byType[type] > 0 && `(${stats.byType[type]})`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {NOTE_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {(selectedType !== 'all' || selectedCategory !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <span className="text-xs font-semibold text-gray-600">Active Filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                Search: &ldquo;{searchQuery}&rdquo;
                <button onClick={() => setSearchQuery('')} className="hover:text-blue-900">×</button>
              </span>
            )}
            {selectedType !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                Type: {selectedType}
                <button onClick={() => setSelectedType('all')} className="hover:text-purple-900">×</button>
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('all')} className="hover:text-green-900">×</button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedType('all');
                setSelectedCategory('all');
              }}
              className="ml-auto text-xs text-gray-600 hover:text-gray-900"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {filteredAndSortedNotes.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {notes.length === 0 ? 'No clinical notes yet' : 'No matching notes found'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {notes.length === 0
                ? 'Start documenting this encounter by creating your first clinical note'
                : 'Try adjusting your filters or search query'}
            </p>
            {notes.length === 0 && (
              <button
                onClick={onAddNote}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create First Note
              </button>
            )}
          </div>
        ) : (
          filteredAndSortedNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 group"
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getTypeColor(note.noteType)}`}>
                        {note.noteType}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {note.category}
                      </span>
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          {note.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                              <Tag className="h-2.5 w-2.5" />
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 2 && (
                            <span className="text-xs text-gray-500">+{note.tags.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(note.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatTime(note.date)}
                      </div>
                      {note.createdByName && (
                        <div className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {note.createdByName}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onToggleFavorite && (
                      <button
                        onClick={() => onToggleFavorite(note.id)}
                        className="p-2 hover:bg-yellow-50 rounded transition-colors"
                        title={note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {note.isFavorite ? (
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        ) : (
                          <StarOff className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => onEditNote(note)}
                      className="p-2 hover:bg-blue-50 rounded transition-colors"
                      title="Edit note"
                    >
                      <Edit2 className="h-4 w-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this clinical note?')) {
                          onDeleteNote(note.id);
                        }
                      }}
                      className="p-2 hover:bg-red-50 rounded transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="mt-3 text-sm text-gray-700 leading-relaxed">
                  {truncateText(note.narrative)}
                </div>

                {/* Footer */}
                {note.updatedAt && note.updatedAt !== note.createdAt && (
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    Last updated: {formatDate(note.updatedAt)} at {formatTime(note.updatedAt)}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Results Summary */}
      {filteredAndSortedNotes.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          Showing {filteredAndSortedNotes.length} of {notes.length} notes
        </div>
      )}
    </div>
  );
}
