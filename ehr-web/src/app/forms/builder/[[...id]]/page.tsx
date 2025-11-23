'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Eye,
  FileText,
  Search,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formsService } from '@/services/forms.service';
import type { FHIRQuestionnaire, QuestionnaireItem } from '@/types/forms';
import { cn } from '@/lib/utils';

const COMPONENT_TYPES = [
  { value: 'group', label: 'Group', icon: 'GRP', description: 'Container for grouping items' },
  { value: 'choice', label: 'Choice', icon: 'CHC', description: 'Single or multiple choice' },
  { value: 'string', label: 'Text', icon: 'TXT', description: 'Short text input' },
  { value: 'text', label: 'Textarea', icon: 'TXA', description: 'Long text input' },
  { value: 'integer', label: 'Integer', icon: '123', description: 'Whole number input' },
  { value: 'decimal', label: 'Decimal', icon: '1.0', description: 'Decimal number' },
  { value: 'date', label: 'Date', icon: 'DTE', description: 'Date picker' },
  { value: 'time', label: 'Time', icon: 'TIM', description: 'Time picker' },
  { value: 'datetime', label: 'Datetime', icon: 'DTM', description: 'Date and time picker' },
  { value: 'boolean', label: 'Checkbox', icon: 'CHK', description: 'Yes/No checkbox' },
  { value: 'quantity', label: 'Quantity', icon: 'QTY', description: 'Number with unit' },
  { value: 'display', label: 'Display', icon: 'DSP', description: 'Static text display' },
  { value: 'attachment', label: 'Attachment', icon: 'ATT', description: 'File upload' },
  { value: 'reference', label: 'Reference', icon: 'REF', description: 'Resource reference' },
];

export default function FormBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id?.[0];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [questions, setQuestions] = useState<QuestionnaireItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['root']));
  const [leftPanelTab, setLeftPanelTab] = useState<'items' | 'components'>('items');
  const [bottomPanelTab, setBottomPanelTab] = useState<'questionnaire' | 'response' | 'population' | 'extraction' | 'expressions'>('questionnaire');
  const [componentSearch, setComponentSearch] = useState('');

  useEffect(() => {
    // Ensure auth headers are set in localStorage
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('userId')) {
        localStorage.setItem('userId', '0df77487-970d-4245-acd5-b2a6504e88cd');
      }
      if (!localStorage.getItem('orgId')) {
        localStorage.setItem('orgId', '1200d873-8725-439a-8bbe-e6d4e7c26338');
      }
    }

    if (templateId) {
      loadTemplate();
    }
  }, [templateId]);

  const loadTemplate = async () => {
    if (!templateId || templateId === 'undefined') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const template = await formsService.getTemplate(templateId);
      setTitle(template.title);
      setDescription(template.description || '');
      setCategory(template.category);
      setQuestions(template.questionnaire.item || []);
    } catch (error) {
      console.error('Failed to load template:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = (type: string = 'string') => {
    const newQuestion: QuestionnaireItem = {
      linkId: `question_${Date.now()}`,
      text: '',
      type: type as any,
      required: false,
    };
    setQuestions([...questions, newQuestion]);
    setSelectedQuestionIndex(questions.length);
  };

  const updateQuestion = (index: number, field: keyof QuestionnaireItem, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addChoice = (questionIndex: number) => {
    const updated = [...questions];
    if (!updated[questionIndex].answerOption) {
      updated[questionIndex].answerOption = [];
    }
    updated[questionIndex].answerOption!.push({ valueString: '' });
    setQuestions(updated);
  };

  const updateChoice = (questionIndex: number, choiceIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].answerOption![choiceIndex] = { valueString: value };
    setQuestions(updated);
  };

  const deleteChoice = (questionIndex: number, choiceIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].answerOption = updated[questionIndex].answerOption!.filter((_, i) => i !== choiceIndex);
    setQuestions(updated);
  };

  const handleSave = async () => {
    if (!title) {
      alert('Please enter a form title');
      return;
    }

    try {
      setSaving(true);

      const questionnaire: FHIRQuestionnaire = {
        resourceType: 'Questionnaire',
        title,
        status: 'draft',
        item: questions,
      };

      let result;
      if (templateId) {
        result = await formsService.updateTemplate(templateId, {
          title,
          description,
          category,
          questionnaire
        });
        console.log('Template updated:', result);
      } else {
        result = await formsService.createTemplate({
          title,
          description,
          category,
          tags: ['custom'],
          questionnaire
        });
        console.log('Template created:', result);
      }

      alert('Form saved successfully!');
      router.push('/forms');
    } catch (error: any) {
      console.error('Failed to save template:', error);
      alert(`Failed to save form: ${error.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleExpand = (linkId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(linkId)) {
      newExpanded.delete(linkId);
    } else {
      newExpanded.add(linkId);
    }
    setExpandedItems(newExpanded);
  };

  const getQuestionIcon = (type: string) => {
    const component = COMPONENT_TYPES.find(t => t.value === type);
    return component?.icon || 'A';
  };

  const filteredComponents = COMPONENT_TYPES.filter(comp =>
    comp.label.toLowerCase().includes(componentSearch.toLowerCase()) ||
    comp.description.toLowerCase().includes(componentSearch.toLowerCase())
  );

  const generateQuestionnaire = (): FHIRQuestionnaire => ({
    resourceType: 'Questionnaire',
    title,
    status: 'draft',
    item: questions,
  });

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const selectedQuestion = selectedQuestionIndex !== null ? questions[selectedQuestionIndex] : null;

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top Toolbar */}
      <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between h-11">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push('/forms')} className="h-7 px-2">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">{title || 'New form'}</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2 text-xs gap-1"
            onClick={() => {
              if (templateId) {
                router.push(`/forms/preview/${templateId}`);
              } else {
                alert('Please save the form first before previewing');
              }
            }}
          >
            <Eye className="h-3 w-3" />
            Preview
          </Button>
          <span className="text-xs text-gray-400">Saved</span>
          <Button
            onClick={handleSave}
            disabled={!title || saving}
            size="sm"
            className="h-7 px-3 text-xs gap-1 bg-[#6366f1] hover:bg-[#5558e3] text-white"
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Four-Panel Layout */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Items/Components */}
          <div className="w-72 bg-gray-50 border-r border-gray-200 flex flex-col">
            {/* Tabs */}
            <div className="flex bg-white border-b border-gray-200">
              <button
                onClick={() => setLeftPanelTab('items')}
                className={cn(
                  "flex-1 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors",
                  leftPanelTab === 'items'
                    ? "border-blue-500 text-blue-600 bg-gray-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                Items
              </button>
              <button
                onClick={() => setLeftPanelTab('components')}
                className={cn(
                  "flex-1 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors",
                  leftPanelTab === 'components'
                    ? "border-blue-500 text-blue-600 bg-gray-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                Components
              </button>
            </div>

            {leftPanelTab === 'items' ? (
              /* Items Tab - Tree View */
              <div className="flex-1 overflow-y-auto p-2">
                <div className="group">
                  <div
                    onClick={() => {
                      setSelectedQuestionIndex(null);
                      toggleExpand('root');
                    }}
                    className={cn(
                      "w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-xs hover:bg-white transition-colors cursor-pointer",
                      selectedQuestionIndex === null && "bg-white shadow-sm"
                    )}
                  >
                    {expandedItems.has('root') ? (
                      <ChevronDown className="h-3 w-3 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-3 w-3 text-gray-500" />
                    )}
                    <FileText className="h-3.5 w-3.5 text-blue-500" />
                    <span className="flex-1 text-left truncate font-medium">
                      {title || 'New form'}
                    </span>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        addQuestion();
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {expandedItems.has('root') && (
                    <div className="ml-5 mt-1 space-y-0.5">
                      {questions.length === 0 ? (
                        <div className="px-2 py-6 text-xs text-gray-400 text-center">
                          No items yet
                        </div>
                      ) : (
                        questions.map((q, idx) => {
                          const icon = getQuestionIcon(q.type);
                          return (
                            <button
                              key={q.linkId}
                              onClick={() => setSelectedQuestionIndex(idx)}
                              className={cn(
                                "w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-xs hover:bg-white transition-colors",
                                selectedQuestionIndex === idx && "bg-white shadow-sm"
                              )}
                            >
                              <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{icon}</span>
                              <span className="flex-1 text-left truncate">
                                {q.text || `Question ${idx + 1}`}
                              </span>
                              {q.required && (
                                <span className="text-xs text-red-500">*</span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Components Tab - Library */
              <div className="flex-1 flex flex-col">
                {/* Search */}
                <div className="p-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <Input
                      placeholder="Search"
                      value={componentSearch}
                      onChange={(e) => setComponentSearch(e.target.value)}
                      className="pl-7 h-7 text-xs bg-white"
                    />
                  </div>
                </div>

                {/* Component Grid */}
                <div className="flex-1 overflow-y-auto p-2">
                  <div className="grid grid-cols-3 gap-1.5">
                    {filteredComponents.map((comp) => (
                      <button
                        key={comp.value}
                        onClick={() => addQuestion(comp.value)}
                        className="flex flex-col items-center justify-center p-3 rounded border border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                        title={comp.description}
                      >
                        <span className="text-xs font-bold text-gray-500 group-hover:text-blue-600 mb-1 bg-gray-100 group-hover:bg-blue-100 px-2 py-1 rounded">
                          {comp.icon}
                        </span>
                        <span className="text-[10px] text-gray-600 group-hover:text-blue-600 text-center leading-tight">
                          {comp.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Center Panel - Properties */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b border-gray-200 flex items-center gap-2 bg-gray-50">
              <FileText className="h-3.5 w-3.5 text-gray-500" />
              <h3 className="text-xs font-medium text-gray-700">Form</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {selectedQuestionIndex === null ? (
                /* Form Properties */
                <>
                  <div>
                    <Label htmlFor="form-title" className="text-xs font-medium text-gray-700">Form Title</Label>
                    <Input
                      id="form-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="New form"
                      className="mt-1 h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="form-url" className="text-xs font-medium text-gray-700">URL</Label>
                    <Input
                      id="form-url"
                      value={`http://company.com/questionnaire/${title ? title.toLowerCase().replace(/\s+/g, '-') : 'new-form'}`}
                      disabled
                      className="mt-1 h-7 text-xs bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="form-version" className="text-xs font-medium text-gray-700">Version</Label>
                    <Input
                      id="form-version"
                      value="1.0.0"
                      readOnly
                      className="mt-1 h-7 text-xs bg-gray-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="form-status" className="text-xs font-medium text-gray-700">Status</Label>
                    <select
                      id="form-status"
                      value="draft"
                      readOnly
                      disabled
                      className="w-full mt-1 h-7 px-2 text-xs border border-gray-300 rounded-md bg-gray-50"
                    >
                      <option value="draft">draft</option>
                      <option value="active">active</option>
                      <option value="retired">retired</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 py-1">
                    <input type="checkbox" id="show-outline" className="rounded" />
                    <Label htmlFor="show-outline" className="text-xs cursor-pointer">Show outline</Label>
                  </div>
                </>
              ) : selectedQuestion ? (
                /* Question Properties */
                <div className="space-y-3">
                  {/* Link ID */}
                  <div>
                    <Label htmlFor="q-linkid" className="text-xs font-medium text-gray-700">Link Id *</Label>
                    <Input
                      id="q-linkid"
                      value={selectedQuestion.linkId}
                      onChange={(e) => updateQuestion(selectedQuestionIndex, 'linkId', e.target.value)}
                      placeholder="unique-id"
                      className="mt-1 h-7 text-xs font-mono"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <Label htmlFor="q-type" className="text-xs font-medium text-gray-700">Type</Label>
                    <select
                      id="q-type"
                      value={selectedQuestion.type}
                      onChange={(e) => updateQuestion(selectedQuestionIndex, 'type', e.target.value)}
                      className="w-full mt-1 h-7 px-2 text-xs border border-gray-300 rounded-md"
                    >
                      {COMPONENT_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Text / Question */}
                  <div>
                    <Label htmlFor="q-text" className="text-xs font-medium text-gray-700">Text</Label>
                    <Textarea
                      id="q-text"
                      value={selectedQuestion.text}
                      onChange={(e) => updateQuestion(selectedQuestionIndex, 'text', e.target.value)}
                      placeholder="Enter question"
                      rows={3}
                      className="mt-1 text-xs"
                    />
                  </div>

                  {/* Prefix */}
                  <div>
                    <Label htmlFor="q-prefix" className="text-xs font-medium text-gray-700">Prefix</Label>
                    <Input
                      id="q-prefix"
                      value={(selectedQuestion as any).prefix || ''}
                      onChange={(e) => updateQuestion(selectedQuestionIndex, 'prefix' as any, e.target.value)}
                      placeholder="e.g., 1., A)"
                      className="mt-1 h-7 text-xs"
                    />
                  </div>

                  {/* Text Input Specific */}
                  {(selectedQuestion.type === 'string' || selectedQuestion.type === 'text') && (
                    <>
                      <div>
                        <Label htmlFor="q-placeholder" className="text-xs font-medium text-gray-700">Placeholder</Label>
                        <Input
                          id="q-placeholder"
                          value={(selectedQuestion as any)._placeholder || ''}
                          onChange={(e) => updateQuestion(selectedQuestionIndex, '_placeholder' as any, e.target.value)}
                          placeholder="Placeholder text"
                          className="mt-1 h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label htmlFor="q-maxlength" className="text-xs font-medium text-gray-700">Max Length</Label>
                        <Input
                          id="q-maxlength"
                          type="number"
                          value={selectedQuestion.maxLength || ''}
                          onChange={(e) => updateQuestion(selectedQuestionIndex, 'maxLength', parseInt(e.target.value) || undefined)}
                          placeholder="e.g., 255"
                          className="mt-1 h-7 text-xs"
                        />
                      </div>
                    </>
                  )}

                  {/* Width */}
                  <div>
                    <Label htmlFor="q-width" className="text-xs font-medium text-gray-700">Width (percentage)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="q-width"
                        type="number"
                        value={(selectedQuestion as any)._width || 'auto'}
                        onChange={(e) => updateQuestion(selectedQuestionIndex, '_width' as any, e.target.value)}
                        placeholder="auto"
                        className="h-7 text-xs"
                      />
                      <span className="text-xs text-gray-500 flex items-center">%</span>
                    </div>
                  </div>

                  {/* Boolean Flags */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="q-hidden"
                        checked={(selectedQuestion as any).hidden || false}
                        onChange={(e) => updateQuestion(selectedQuestionIndex, 'hidden' as any, e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="q-hidden" className="text-xs cursor-pointer">Hidden</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="q-required"
                        checked={selectedQuestion.required || false}
                        onChange={(e) => updateQuestion(selectedQuestionIndex, 'required', e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="q-required" className="text-xs cursor-pointer">Required</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="q-repeats"
                        checked={selectedQuestion.repeats || false}
                        onChange={(e) => updateQuestion(selectedQuestionIndex, 'repeats', e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="q-repeats" className="text-xs cursor-pointer">Repeats</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="q-readonly"
                        checked={selectedQuestion.readOnly || false}
                        onChange={(e) => updateQuestion(selectedQuestionIndex, 'readOnly', e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="q-readonly" className="text-xs cursor-pointer">Read only</Label>
                    </div>
                  </div>

                  {/* Choice Options */}
                  {selectedQuestion.type === 'choice' && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs font-medium text-gray-700">Options</Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addChoice(selectedQuestionIndex)}
                          className="h-6 px-2 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add option
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {selectedQuestion.answerOption?.map((option, choiceIdx) => (
                          <div key={choiceIdx} className="border border-gray-200 rounded p-2 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-gray-600">Option {choiceIdx + 1}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteChoice(selectedQuestionIndex, choiceIdx)}
                                className="h-5 w-5 p-0"
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-600">Code</Label>
                              <Input
                                value={option.valueCoding?.code || option.valueString || ''}
                                onChange={(e) => {
                                  const updated = [...questions];
                                  if (!updated[selectedQuestionIndex].answerOption![choiceIdx].valueCoding) {
                                    updated[selectedQuestionIndex].answerOption![choiceIdx] = {
                                      valueCoding: { code: e.target.value, display: e.target.value }
                                    };
                                  } else {
                                    updated[selectedQuestionIndex].answerOption![choiceIdx].valueCoding!.code = e.target.value;
                                  }
                                  setQuestions(updated);
                                }}
                                placeholder="code"
                                className="h-6 text-xs mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-600">Display</Label>
                              <Input
                                value={option.valueCoding?.display || option.valueString || ''}
                                onChange={(e) => {
                                  const updated = [...questions];
                                  if (!updated[selectedQuestionIndex].answerOption![choiceIdx].valueCoding) {
                                    updated[selectedQuestionIndex].answerOption![choiceIdx] = {
                                      valueCoding: { code: e.target.value, display: e.target.value }
                                    };
                                  } else {
                                    updated[selectedQuestionIndex].answerOption![choiceIdx].valueCoding!.display = e.target.value;
                                  }
                                  setQuestions(updated);
                                }}
                                placeholder="Display text"
                                className="h-6 text-xs mt-1"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Media */}
                  <div className="pt-2 border-t">
                    <Label htmlFor="q-media" className="text-xs font-medium text-gray-700">Media (Image/Video URL)</Label>
                    <Input
                      id="q-media"
                      value={(selectedQuestion as any)._mediaUrl || ''}
                      onChange={(e) => updateQuestion(selectedQuestionIndex, '_mediaUrl' as any, e.target.value)}
                      placeholder="https://..."
                      className="mt-1 h-7 text-xs"
                    />
                  </div>

                  {/* Tooltip */}
                  <div>
                    <Label htmlFor="q-tooltip" className="text-xs font-medium text-gray-700">Tooltip</Label>
                    <Input
                      id="q-tooltip"
                      value={(selectedQuestion as any)._tooltip || ''}
                      onChange={(e) => updateQuestion(selectedQuestionIndex, '_tooltip' as any, e.target.value)}
                      placeholder="Help text"
                      className="mt-1 h-7 text-xs"
                    />
                  </div>

                  {/* Enable When (Conditional Logic) */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs font-medium text-gray-700">Enable When (Rules)</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const updated = [...questions];
                          if (!updated[selectedQuestionIndex].enableWhen) {
                            updated[selectedQuestionIndex].enableWhen = [];
                          }
                          updated[selectedQuestionIndex].enableWhen!.push({
                            question: '',
                            operator: 'exists',
                            answerBoolean: true
                          });
                          setQuestions(updated);
                        }}
                        className="h-6 px-2 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add rule
                      </Button>
                    </div>
                    {selectedQuestion.enableWhen?.map((rule, ruleIdx) => (
                      <div key={ruleIdx} className="border border-gray-200 rounded p-2 mb-2 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600">Rule {ruleIdx + 1}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const updated = [...questions];
                              updated[selectedQuestionIndex].enableWhen = updated[selectedQuestionIndex].enableWhen!.filter((_, i) => i !== ruleIdx);
                              setQuestions(updated);
                            }}
                            className="h-5 w-5 p-0"
                          >
                            <Trash2 className="h-3 w-3 text-red-500" />
                          </Button>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Question</Label>
                          <Input
                            value={rule.question}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[selectedQuestionIndex].enableWhen![ruleIdx].question = e.target.value;
                              setQuestions(updated);
                            }}
                            placeholder="linkId of question"
                            className="h-6 text-xs mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Operator</Label>
                          <select
                            value={rule.operator}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[selectedQuestionIndex].enableWhen![ruleIdx].operator = e.target.value as any;
                              setQuestions(updated);
                            }}
                            className="w-full mt-1 h-6 px-2 text-xs border border-gray-300 rounded-md"
                          >
                            <option value="exists">exists</option>
                            <option value="=">equals (=)</option>
                            <option value="!=">not equals (!=)</option>
                            <option value=">">greater than (&gt;)</option>
                            <option value="<">less than (&lt;)</option>
                            <option value=">=">greater or equal (&gt;=)</option>
                            <option value="<=">less or equal (&lt;=)</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delete Button */}
                  <div className="pt-3 border-t border-gray-200">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        deleteQuestion(selectedQuestionIndex);
                        setSelectedQuestionIndex(null);
                      }}
                      className="w-full h-7 text-xs"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete Item
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="flex-1 bg-gray-50 overflow-y-auto">
            <div className="max-w-3xl mx-auto p-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {title || 'New form'}
                  </h2>
                  {description && (
                    <p className="text-sm text-gray-600 mt-2">{description}</p>
                  )}
                </div>

                <div className="space-y-4">
                  {questions.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">No questions added yet</p>
                    </div>
                  ) : (
                    questions.map((q, idx) => {
                      const icon = getQuestionIcon(q.type);
                      return (
                        <div
                          key={q.linkId}
                          className={cn(
                            "p-3 rounded border transition-all cursor-pointer",
                            selectedQuestionIndex === idx
                              ? "border-blue-500 bg-blue-50/30 shadow-sm"
                              : "border-gray-200 hover:border-gray-300 bg-white"
                          )}
                          onClick={() => setSelectedQuestionIndex(idx)}
                        >
                          <Label className="flex items-center gap-2 mb-2 text-sm">
                            <span>{icon}</span>
                            <span className="font-medium">
                              {q.text || `Question ${idx + 1}`}
                              {q.required && <span className="text-red-500 ml-1">*</span>}
                            </span>
                          </Label>

                          {q.type === 'string' && (
                            <Input placeholder="Short answer" disabled className="bg-gray-50 text-xs h-8" />
                          )}
                          {q.type === 'text' && (
                            <Textarea placeholder="Long answer" disabled rows={3} className="bg-gray-50 text-xs" />
                          )}
                          {q.type === 'integer' && (
                            <Input type="number" placeholder="0" disabled className="bg-gray-50 text-xs h-8" />
                          )}
                          {q.type === 'date' && (
                            <Input type="date" disabled className="bg-gray-50 text-xs h-8" />
                          )}
                          {q.type === 'time' && (
                            <Input type="time" disabled className="bg-gray-50 text-xs h-8" />
                          )}
                          {q.type === 'boolean' && (
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2">
                                <input type="radio" disabled />
                                <span className="text-xs">Yes</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input type="radio" disabled />
                                <span className="text-xs">No</span>
                              </label>
                            </div>
                          )}
                          {q.type === 'choice' && (
                            <div className="space-y-1.5">
                              {q.answerOption && q.answerOption.length > 0 ? (
                                q.answerOption.map((option, optIdx) => (
                                  <label key={optIdx} className="flex items-center gap-2">
                                    <input type="radio" disabled />
                                    <span className="text-xs">{option.valueString || `Option ${optIdx + 1}`}</span>
                                  </label>
                                ))
                              ) : (
                                <p className="text-xs text-gray-400">No options added</p>
                              )}
                            </div>
                          )}
                          {q.type === 'display' && (
                            <div className="text-xs text-gray-600 italic">Display text</div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Panel - Debug Console */}
        <div className="h-64 border-t border-gray-200 bg-white flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            {['questionnaire', 'response', 'population', 'extraction', 'expressions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setBottomPanelTab(tab as any)}
                className={cn(
                  "px-3 py-2 text-xs font-medium border-b-2 transition-colors capitalize",
                  bottomPanelTab === tab
                    ? "border-blue-500 text-blue-600 bg-white"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                )}
              >
                {tab === 'extraction' ? 'Data Extraction' : tab === 'expressions' ? 'Named Expressions' : tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-3">
            {bottomPanelTab === 'questionnaire' && (
              <div className="relative">
                <div className="absolute top-2 right-2">
                  <Button size="sm" className="h-6 px-2 text-xs bg-[#6366f1] hover:bg-[#5558e3] text-white">
                    ⚡ Validate
                  </Button>
                </div>
                <pre className="text-xs font-mono text-gray-700 overflow-auto">
                  {JSON.stringify(generateQuestionnaire(), null, 2)}
                </pre>
              </div>
            )}
            {bottomPanelTab === 'response' && (
              <pre className="text-xs font-mono text-gray-700">
                {JSON.stringify({ resourceType: 'QuestionnaireResponse', status: 'in-progress', item: [] }, null, 2)}
              </pre>
            )}
            {bottomPanelTab === 'population' && (
              <div className="text-xs text-gray-500">Population settings will appear here</div>
            )}
            {bottomPanelTab === 'extraction' && (
              <div className="text-xs text-gray-500">Data extraction mappings will appear here</div>
            )}
            {bottomPanelTab === 'expressions' && (
              <div className="text-xs text-gray-500">Named expressions will appear here</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
