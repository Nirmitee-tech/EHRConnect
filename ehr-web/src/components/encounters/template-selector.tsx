'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Star, Clock, X, ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';
import { TemplateService, ClinicalTemplate } from '@/services/template.service';

interface TemplateSelectorProps {
  category: ClinicalTemplate['category'];
  onSelect: (content: string) => void;
  currentValue?: string;
}

export function TemplateSelector({ category, onSelect, currentValue = '' }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [templates, setTemplates] = useState<ClinicalTemplate[]>([]);
  const [popularTemplates, setPopularTemplates] = useState<ClinicalTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'popular' | 'recent'>('popular');

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen, category]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const [allTemplates, popular] = await Promise.all([
        TemplateService.getTemplatesByCategory(category),
        TemplateService.getPopularTemplates(category, 5)
      ]);
      setTemplates(allTemplates);
      setPopularTemplates(popular);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = async (template: ClinicalTemplate) => {
    onSelect(template.content);
    await TemplateService.incrementUsageCount(template.id);
    setIsOpen(false);
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim() || !currentValue.trim()) {
      alert('Please provide a template name and content');
      return;
    }

    try {
      await TemplateService.createTemplate({
        name: newTemplateName,
        category: category,
        content: currentValue,
        tags: []
      });

      setNewTemplateName('');
      setShowCreateForm(false);
      loadTemplates();
      alert('Template created successfully!');
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await TemplateService.deleteTemplate(id);
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    }
  };

  const filteredTemplates = searchQuery
    ? templates.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : templates;

  const displayTemplates = selectedTab === 'popular'
    ? popularTemplates
    : selectedTab === 'recent'
    ? [...templates].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 10)
    : filteredTemplates;

  const getCategoryLabel = () => {
    switch (category) {
      case 'chief-complaint': return 'Chief Complaint';
      case 'findings': return 'Findings';
      case 'investigation': return 'Investigation';
      case 'diagnosis': return 'Diagnosis';
      case 'clinical-notes': return 'Clinical Notes';
      case 'instructions': return 'Instructions';
      default: return 'Template';
    }
  };

  return (
    <div className="relative">
      {/* Template Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
        title={`Use ${getCategoryLabel()} Template`}
      >
        <Star className="h-3.5 w-3.5" />
        Templates
        {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {/* Template Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-[90vw] sm:w-[500px] max-w-[500px] bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] max-h-[500px] flex flex-col">
          {/* Header */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">{getCategoryLabel()} Templates</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setSelectedTab('popular')}
                className={`px-3 py-1 text-xs font-medium rounded ${
                  selectedTab === 'popular'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Star className="inline h-3 w-3 mr-1" />
                Popular
              </button>
              <button
                onClick={() => setSelectedTab('recent')}
                className={`px-3 py-1 text-xs font-medium rounded ${
                  selectedTab === 'recent'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Clock className="inline h-3 w-3 mr-1" />
                Recent
              </button>
              <button
                onClick={() => setSelectedTab('all')}
                className={`px-3 py-1 text-xs font-medium rounded ${
                  selectedTab === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
            </div>

            {/* Search */}
            {selectedTab === 'all' && (
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Template List */}
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="text-center py-8 text-sm text-gray-500">Loading templates...</div>
            ) : displayTemplates.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500">
                No templates found. Create your first template!
              </div>
            ) : (
              <div className="space-y-1">
                {displayTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="group p-2 hover:bg-gray-50 rounded border border-transparent hover:border-gray-200 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        onClick={() => handleSelectTemplate(template)}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                          {template.usageCount && template.usageCount > 0 && (
                            <span className="text-xs text-gray-500">({template.usageCount} uses)</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{template.content}</p>
                        {template.tags && template.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {template.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-opacity"
                        title="Delete template"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-gray-200">
            {showCreateForm ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Template name..."
                  className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateTemplate}
                    className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700"
                  >
                    Save Template
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewTemplateName('');
                    }}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Current content will be saved as template
                </p>
              </div>
            ) : (
              <button
                onClick={() => setShowCreateForm(true)}
                disabled={!currentValue.trim()}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-3.5 w-3.5" />
                Save Current as Template
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
