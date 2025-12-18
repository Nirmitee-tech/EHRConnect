'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Eye,
  Settings2,
  Undo2,
  Redo2,
  Copy,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Type,
  Hash,
  Calendar,
  CheckSquare,
  List as ListIcon,
  FileText as FileTextIcon,
  Paperclip,
  Users,
  MapPin,
  Activity,
  Phone,
  Mail,
  Globe,
  PenTool,
  Sliders,
  Layout,
  Search,
  Grid3x3,
  Sparkles,
  Code,
  Filter,
  Link,
  HelpCircle,
  AlertCircle,
  Maximize2,
  Minimize2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  PanelBottomClose,
  PanelBottomOpen,
  ChevronLeft,
  ChevronUp,
  Upload,
  FileUp,
  Wand2,
  Loader2,
  X,
  Check,
  Heading,
  Minus,
  FileText,
  Columns,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { formsService } from '@/services/forms.service';
import type { FHIRQuestionnaire, QuestionnaireItem } from '@/types/forms';
import { cn } from '@/lib/utils';
import { useFormBuilderStore } from '@/stores/form-builder-store';
import { StepNavigator } from '@/components/forms/StepNavigator';
import { StepEditor } from '@/components/forms/StepEditor';
import { WizardProgress } from '@/components/forms/WizardProgress';
import { StepNavigationControls } from '@/components/forms/StepNavigationControls';
import { PreviewPanel } from '@/components/forms/preview/PreviewPanel';
import { VisualFormBuilder } from '@/components/forms/VisualFormBuilder';
import { useTranslation } from '@/i18n/client';
import '@/i18n/client';

// Component Categories
const COMPONENT_CATEGORIES = {
  layout: {
    label: 'Layout',
    components: [
      { type: 'columns', label: 'Columns', icon: Columns },
      { type: 'group', label: 'Group', icon: Layout },
      { type: 'separator', label: 'Separator', icon: Minus },
    ]
  },
  display: {
    label: 'Display',
    components: [
      { type: 'heading', label: 'Heading', icon: Heading },
      { type: 'description', label: 'Description', icon: FileText },
      { type: 'display', label: 'Info Text', icon: AlertCircle },
    ]
  },
  basic: {
    label: 'Basic',
    components: [
      { type: 'string', label: 'Text', icon: Type },
      { type: 'text', label: 'Long Text', icon: FileTextIcon },
      { type: 'integer', label: 'Number', icon: Hash },
      { type: 'decimal', label: 'Decimal', icon: Hash },
      { type: 'boolean', label: 'Yes/No', icon: CheckSquare },
    ]
  },
  datetime: {
    label: 'Date & Time',
    components: [
      { type: 'date', label: 'Date', icon: Calendar },
      { type: 'time', label: 'Time', icon: Calendar },
      { type: 'datetime', label: 'DateTime', icon: Calendar },
    ]
  },
  selection: {
    label: 'Selection',
    components: [
      { type: 'choice', label: 'Choice', icon: ListIcon },
      { type: 'open-choice', label: 'Open Choice', icon: ListIcon },
    ]
  },
  advanced: {
    label: 'Advanced',
    components: [
      { type: 'slider', label: 'Slider', icon: Sliders },
      { type: 'signature', label: 'Signature', icon: PenTool },
      { type: 'attachment', label: 'File', icon: Paperclip },
      { type: 'quantity', label: 'Quantity', icon: Hash },
      { type: 'reference', label: 'Reference', icon: Link },
    ]
  },
  formatted: {
    label: 'Formatted',
    components: [
      { type: 'phone', label: 'Phone', icon: Phone },
      { type: 'email', label: 'Email', icon: Mail },
      { type: 'url', label: 'URL', icon: Globe },
    ]
  },
  composite: {
    label: 'Composites',
    components: [
      { type: 'address', label: 'Address', icon: MapPin },
      { type: 'human-name', label: 'Name', icon: Users },
      { type: 'vitals-bp', label: 'BP', icon: Activity },
    ]
  }
};

export default function FormBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params?.id?.[0];

  // Multi-step wizard store
  const {
    isMultiStep,
    setMultiStep,
    setFormId,
    loadProgress,
    saveProgress: saveStoreProgress,
    isDirty: isStoreDirty,
    isAutoSaving,
  } = useFormBuilderStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [questions, setQuestions] = useState<QuestionnaireItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<QuestionnaireItem[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['root']));
  const [propertyTab, setPropertyTab] = useState<'basic' | 'validation' | 'logic' | 'advanced'>('basic');
  const [bottomTab, setBottomTab] = useState<'questionnaire' | 'response' | 'context'>('questionnaire');
  const [contextTypes, setContextTypes] = useState<string[]>([]);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [bottomPanelCollapsed, setBottomPanelCollapsed] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiGenerating, setAIGenerating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [aiPrompt, setAIPrompt] = useState('');

  // Initialize store with form ID
  useEffect(() => {
    if (templateId && templateId !== 'undefined') {
      setFormId(templateId);
      loadProgress(templateId);
    }
  }, [templateId, setFormId, loadProgress]);

  // Auto-save interval (30s)
  useEffect(() => {
    if (!isStoreDirty || !isMultiStep) return;

    const timer = setTimeout(() => {
      saveStoreProgress().catch(err => {
        console.error('Auto-save failed:', err);
      });
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [isStoreDirty, isMultiStep, saveStoreProgress]);

  useEffect(() => {
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
      const response = await formsService.getTemplate(templateId);
      setTitle(response.template.title);
      setDescription(response.template.description || '');
      setCategory(response.template.category || 'general');
      setQuestions(response.questionnaire.item || []);
      setHistory([response.questionnaire.item || []]);
      setHistoryIndex(0);
      if (response.template.settings?.contextTypes) {
        setContextTypes(response.template.settings.contextTypes);
      }
    } catch (error) {
      console.error('Failed to load template:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = useCallback((newQuestions: QuestionnaireItem[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newQuestions)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setQuestions(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setQuestions(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  const generateLinkId = () => `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const createQuestion = (type: string): QuestionnaireItem => {
    const baseId = generateLinkId();
    const baseQuestion: QuestionnaireItem = {
      linkId: baseId,
      text: '',
      type: type as any,
      required: false,
    };

    switch (type) {
      case 'heading':
        return {
          ...baseQuestion,
          text: 'Section Heading',
          type: 'display' as any,
          extension: [{
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory',
            valueCode: 'heading'
          }]
        };
      case 'description':
        return {
          ...baseQuestion,
          text: 'Add descriptive text here...',
          type: 'display' as any,
          extension: [{
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory',
            valueCode: 'description'
          }]
        };
      case 'separator':
        return {
          ...baseQuestion,
          text: '---',
          type: 'display' as any,
          extension: [{
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory',
            valueCode: 'separator'
          }]
        };
      case 'columns':
        return {
          ...baseQuestion,
          text: '2 Columns',
          type: 'group' as any,
          extension: [{
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
            valueCode: 'columns'
          }, {
            url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-columns',
            valueInteger: 2
          }],
          item: []
        };
      case 'group':
        return { ...baseQuestion, text: 'New Group', item: [] };
      case 'address':
        return {
          ...baseQuestion,
          text: 'Address',
          type: 'group',
          item: [
            { linkId: `${baseId}_street`, text: 'Street', type: 'string' },
            { linkId: `${baseId}_city`, text: 'City', type: 'string' },
            { linkId: `${baseId}_state`, text: 'State', type: 'string' },
            { linkId: `${baseId}_zip`, text: 'ZIP', type: 'string' },
          ]
        };
      case 'human-name':
        return {
          ...baseQuestion,
          text: 'Name',
          type: 'group',
          item: [
            { linkId: `${baseId}_first`, text: 'First Name', type: 'string' },
            { linkId: `${baseId}_last`, text: 'Last Name', type: 'string' },
          ]
        };
      case 'vitals-bp':
        return {
          ...baseQuestion,
          text: 'Blood Pressure',
          type: 'group',
          item: [
            { linkId: `${baseId}_sys`, text: 'Systolic', type: 'integer', unit: 'mmHg' } as any,
            { linkId: `${baseId}_dia`, text: 'Diastolic', type: 'integer', unit: 'mmHg' } as any,
          ]
        };
      case 'slider':
        return {
          ...baseQuestion,
          text: 'Rate 0-10',
          type: 'integer',
          extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl', valueCode: 'slider' }]
        };
      case 'signature':
        return {
          ...baseQuestion,
          text: 'Signature',
          type: 'attachment',
          extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-signature', valueBoolean: true }]
        };
      case 'phone':
        return {
          ...baseQuestion,
          text: 'Phone',
          type: 'string',
          extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl', valueCode: 'phone' }]
        };
      case 'email':
        return {
          ...baseQuestion,
          text: 'Email',
          type: 'string',
          extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl', valueCode: 'email' }]
        };
      default:
        return baseQuestion;
    }
  };

  const handleAddQuestion = (type: string, parentLinkId?: string) => {
    const newQuestion = createQuestion(type);

    if (parentLinkId) {
      const addToParent = (items: QuestionnaireItem[]): QuestionnaireItem[] => {
        return items.map(item => {
          if (item.linkId === parentLinkId) {
            return { ...item, item: [...(item.item || []), newQuestion] };
          }
          if (item.item) {
            return { ...item, item: addToParent(item.item) };
          }
          return item;
        });
      };
      const newQuestions = addToParent(questions);
      setQuestions(newQuestions);
      addToHistory(newQuestions);
      setExpandedItems(new Set([...expandedItems, parentLinkId]));
    } else {
      const newQuestions = [...questions, newQuestion];
      setQuestions(newQuestions);
      addToHistory(newQuestions);
    }

    setSelectedLinkId(newQuestion.linkId);
  };

  // Helper to check if item is a columns container
  const isColumnsLayout = (item: QuestionnaireItem) => {
    return item.type === 'group' && item.extension?.some(ext =>
      ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl' &&
      ext.valueCode === 'columns'
    );
  };

  // Helper to get display category
  const getDisplayCategory = (item: QuestionnaireItem) => {
    if (item.type !== 'display') return null;
    return item.extension?.find(ext =>
      ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory'
    )?.valueCode;
  };

  const handleUpdateQuestion = (linkId: string, updates: Partial<QuestionnaireItem>) => {
    const updateItem = (items: QuestionnaireItem[]): QuestionnaireItem[] => {
      return items.map(item => {
        if (item.linkId === linkId) {
          return { ...item, ...updates };
        }
        if (item.item) {
          return { ...item, item: updateItem(item.item) };
        }
        return item;
      });
    };

    const newQuestions = updateItem(questions);
    setQuestions(newQuestions);
    addToHistory(newQuestions);
  };

  const handleDeleteQuestion = (linkId: string) => {
    const deleteItem = (items: QuestionnaireItem[]): QuestionnaireItem[] => {
      return items.filter(item => {
        if (item.linkId === linkId) return false;
        if (item.item) {
          item.item = deleteItem(item.item);
        }
        return true;
      });
    };

    const newQuestions = deleteItem(questions);
    setQuestions(newQuestions);
    addToHistory(newQuestions);
    setSelectedLinkId(null);
  };

  const handleDuplicateQuestion = (linkId: string) => {
    const findAndDuplicate = (items: QuestionnaireItem[], targetId: string): QuestionnaireItem[] => {
      const result: QuestionnaireItem[] = [];
      for (const item of items) {
        result.push(item);
        if (item.linkId === targetId) {
          const duplicate = JSON.parse(JSON.stringify(item));
          duplicate.linkId = generateLinkId();
          result.push(duplicate);
        } else if (item.item) {
          item.item = findAndDuplicate(item.item, targetId);
        }
      }
      return result;
    };

    const newQuestions = findAndDuplicate(questions, linkId);
    setQuestions(newQuestions);
    addToHistory(newQuestions);
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

      if (templateId) {
        await formsService.updateTemplate(templateId, {
          title,
          description,
          category,
          questionnaire
        });
      } else {
        const result = await formsService.createTemplate({
          title,
          description,
          category,
          tags: ['custom'],
          questionnaire
        });

        // Update formId in store if it was temporary
        if (result?.id) {
          setFormId(result.id);
        }
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

  // AI Form Generation from PDF
  const handleAIGenerate = async () => {
    if (!uploadedFile && !aiPrompt) {
      alert('Please upload a PDF or enter a description');
      return;
    }

    setAIGenerating(true);

    try {
      // Create form data for API call
      const formData = new FormData();
      if (uploadedFile) {
        formData.append('file', uploadedFile);
      }
      formData.append('prompt', aiPrompt || 'Generate a comprehensive questionnaire from this document');

      // Call AI service to generate questions
      const response = await fetch('/api/ai/generate-form', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate form');
      }

      const data = await response.json();

      // Set form title and description from AI response
      if (data.title) setTitle(data.title);
      if (data.description) setDescription(data.description);

      // Convert AI response to QuestionnaireItems
      if (data.questions && Array.isArray(data.questions)) {
        const newQuestions: QuestionnaireItem[] = data.questions.map((q: any, index: number) => ({
          linkId: `ai_${Date.now()}_${index}`,
          text: q.text || q.question || '',
          type: mapAITypeToFHIR(q.type),
          required: q.required || false,
          answerOption: q.options?.map((opt: string) => ({ valueString: opt })),
        }));

        setQuestions(newQuestions);
        addToHistory(newQuestions);
      }

      setShowAIModal(false);
      setUploadedFile(null);
      setAIPrompt('');
    } catch (error) {
      console.error('AI generation failed:', error);
      alert('Failed to generate form. Please try again.');
    } finally {
      setAIGenerating(false);
    }
  };

  // Map AI response type to FHIR Questionnaire type
  const mapAITypeToFHIR = (aiType: string): string => {
    const typeMap: Record<string, string> = {
      'text': 'string',
      'short_text': 'string',
      'long_text': 'text',
      'paragraph': 'text',
      'number': 'integer',
      'decimal': 'decimal',
      'date': 'date',
      'time': 'time',
      'datetime': 'dateTime',
      'yes_no': 'boolean',
      'boolean': 'boolean',
      'single_choice': 'choice',
      'multiple_choice': 'choice',
      'dropdown': 'choice',
      'scale': 'integer',
      'rating': 'integer',
      'email': 'string',
      'phone': 'string',
      'url': 'url',
    };
    return typeMap[aiType?.toLowerCase()] || 'string';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB');
        return;
      }
      setUploadedFile(file);
    }
  };

  const findItem = (items: QuestionnaireItem[], linkId: string): QuestionnaireItem | null => {
    for (const item of items) {
      if (item.linkId === linkId) return item;
      if (item.item) {
        const found = findItem(item.item, linkId);
        if (found) return found;
      }
    }
    return null;
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

  const selectedQuestion = selectedLinkId ? findItem(questions, selectedLinkId) : null;

  const filteredCategories = Object.entries(COMPONENT_CATEGORIES).reduce((acc, [key, cat]) => {
    const filtered = cat.components.filter(comp =>
      comp.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[key as keyof typeof COMPONENT_CATEGORIES] = { ...cat, components: filtered };
    }
    return acc;
  }, {} as typeof COMPONENT_CATEGORIES);

  const generateQuestionnaire = (): FHIRQuestionnaire => ({
    resourceType: 'Questionnaire',
    title,
    status: 'draft',
    description,
    item: questions,
  });

  const generateQuestionnaireResponse = () => ({
    resourceType: 'QuestionnaireResponse',
    status: 'in-progress',
    authored: new Date().toISOString(),
    item: [],
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Compact Toolbar */}
      <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/forms')}
            className="h-8 px-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          <div className="h-5 w-px bg-gray-300 mx-1"></div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Form Title"
            className="text-sm font-semibold text-gray-900 bg-transparent border-none outline-none focus:ring-0 p-0 w-64"
          />
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0}
            className="h-8 w-8 p-0"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="h-8 w-8 p-0"
          >
            <Redo2 className="h-4 w-4" />
          </Button>

          <div className="h-5 w-px bg-gray-300 mx-1"></div>

          <Button
            onClick={() => setShowAIModal(true)}
            size="sm"
            variant="outline"
            className="h-8 px-3 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
          >
            <Wand2 className="h-4 w-4 mr-1" />
            AI Generate
          </Button>

          <div className="h-5 w-px bg-gray-300 mx-1"></div>

          {/* Multi-Step Toggle */}
          <div className="flex items-center gap-2 px-2">
            <Label htmlFor="multi-step-toggle" className="text-xs font-medium text-gray-700">
              Multi-Step
            </Label>
            <Switch
              id="multi-step-toggle"
              checked={isMultiStep}
              onCheckedChange={setMultiStep}
            />
          </div>

          <div className="h-5 w-px bg-gray-300 mx-1"></div>

          <Button
            onClick={handleSave}
            disabled={!title || saving}
            size="sm"
            className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-1" />
            {saving ? 'Saving...' : isAutoSaving ? 'Auto-saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Progress Bar (Multi-Step Mode) */}
      {isMultiStep && <WizardProgress />}

      {/* Main Layout */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {isMultiStep ? (
          /* New Visual Builder for Multi-Step Forms */
          <VisualFormBuilder />
        ) : (
        <>
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left: Component Library */}
          {leftPanelCollapsed ? (
            <div className="w-10 shrink-0 bg-white border-r border-gray-200 flex flex-col items-center py-2">
              <button
                onClick={() => setLeftPanelCollapsed(false)}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                title="Show components"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="mt-2 text-[10px] font-medium text-gray-400 writing-mode-vertical" style={{ writingMode: 'vertical-rl' }}>
                Components
              </div>
            </div>
          ) : (
          <div className="w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-2 border-b border-gray-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Components</span>
              <button
                onClick={() => setLeftPanelCollapsed(true)}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                title="Hide components"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs bg-gray-50"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {Object.entries(filteredCategories).map(([key, cat]) => (
                <div key={key} className="mb-4">
                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
                    {cat.label}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {cat.components.map((comp) => (
                      <button
                        key={comp.type}
                        onClick={() => handleAddQuestion(comp.type, selectedLinkId && findItem(questions, selectedLinkId)?.type === 'group' ? selectedLinkId : undefined)}
                        className="flex flex-col items-center justify-center p-2.5 rounded-lg border border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 transition-all text-center"
                        title={comp.type}
                      >
                        <comp.icon className="h-4 w-4 text-gray-600 mb-1.5" />
                        <span className="text-[11px] font-medium text-gray-700">
                          {comp.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Center: Tree + Canvas */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Tree View */}
            <div className="h-32 border-b border-gray-200 bg-white overflow-y-auto shrink-0">
              <div className="p-2">
                <div
                  onClick={() => {
                    setSelectedLinkId(null);
                    toggleExpand('root');
                  }}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1.5 rounded text-xs cursor-pointer hover:bg-gray-100",
                    selectedLinkId === null && "bg-blue-50"
                  )}
                >
                  {expandedItems.has('root') ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  <FileTextIcon className="h-3.5 w-3.5 text-blue-600" />
                  <span className="flex-1 font-medium">{title || 'Form'}</span>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddQuestion('string');
                    }}
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                {expandedItems.has('root') && (
                  <div className="ml-2 mt-1 space-y-0.5">
                    {questions.map((q) => (
                      <TreeItem
                        key={q.linkId}
                        item={q}
                        selectedId={selectedLinkId}
                        expandedIds={expandedItems}
                        onSelect={setSelectedLinkId}
                        onToggleExpand={toggleExpand}
                        onAddChild={handleAddQuestion}
                        onDelete={handleDeleteQuestion}
                        depth={0}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
              <CanvasPanel
                title={title}
                description={description}
                questions={questions}
                selectedId={selectedLinkId}
                onSelect={setSelectedLinkId}
                onUpdate={handleUpdateQuestion}
                showPreview={showPreview}
                onTogglePreview={() => setShowPreview(!showPreview)}
              />
            </div>
          </div>

          {/* Right: Properties Panel */}
          {rightPanelCollapsed ? (
            <div className="w-10 shrink-0 bg-white border-l border-gray-200 flex flex-col items-center py-2">
              <button
                onClick={() => setRightPanelCollapsed(false)}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                title="Show properties"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="mt-2 text-[10px] font-medium text-gray-400" style={{ writingMode: 'vertical-rl' }}>
                Properties
              </div>
            </div>
          ) : (
          <div className="w-72 shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
            {/* Panel Header with collapse button */}
            <div className="p-2 border-b border-gray-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">
                {selectedLinkId === null ? 'Form Settings' : 'Properties'}
              </span>
              <button
                onClick={() => setRightPanelCollapsed(true)}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                title="Hide properties"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            {selectedLinkId === null ? (
              /* Form Properties */
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-4">
                  <div>
                    <Label className="text-xs font-medium">Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Description</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 text-xs"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium">Category</Label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full mt-1 h-8 px-2 text-xs border rounded"
                    >
                      <option value="general">General</option>
                      <option value="medical">Medical</option>
                      <option value="administrative">Administrative</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : selectedQuestion ? (
              /* Question Properties */
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Property Tabs */}
                <div className="flex border-b border-gray-200 bg-gray-50">
                  {['basic', 'validation', 'logic', 'advanced'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setPropertyTab(tab as any)}
                      className={cn(
                        "flex-1 px-2 py-2 text-[10px] font-medium border-b-2 transition-colors uppercase",
                        propertyTab === tab
                          ? "border-blue-600 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Property Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  <PropertyPanel
                    question={selectedQuestion}
                    tab={propertyTab}
                    onUpdate={(updates) => handleUpdateQuestion(selectedQuestion.linkId, updates)}
                  />
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-gray-200 space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDuplicateQuestion(selectedQuestion.linkId)}
                    className="w-full h-8 text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Duplicate
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteQuestion(selectedQuestion.linkId)}
                    className="w-full h-8 text-xs"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
          )}

          {/* Preview Panel (Right Side) */}
          <PreviewPanel
            title={title || 'Untitled Form'}
            description={description}
            questions={questions}
          />
        </div>

        {/* Bottom Panel (for single-page forms) */}
        {bottomPanelCollapsed ? (
          <div className="h-8 shrink-0 border-t border-gray-200 bg-white flex items-center px-2">
            <button
              onClick={() => setBottomPanelCollapsed(false)}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 text-xs"
              title="Show output panel"
            >
              <ChevronUp className="h-3.5 w-3.5" />
              <span>Output</span>
            </button>
          </div>
        ) : (
        <div className="h-80 shrink-0 border-t border-gray-200 bg-white flex flex-col">
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setBottomPanelCollapsed(true)}
              className="px-2 py-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              title="Hide output panel"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            {['questionnaire', 'response', 'context'].map((tab) => (
              <button
                key={tab}
                onClick={() => setBottomTab(tab as any)}
                className={cn(
                  "px-4 py-2 text-xs font-medium border-b-2 transition-colors capitalize",
                  bottomTab === tab
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-3">
            {bottomTab === 'questionnaire' && (
              <div>
                <pre className="text-xs font-mono text-gray-700 overflow-auto">
                  {JSON.stringify(generateQuestionnaire(), null, 2)}
                </pre>
              </div>
            )}

            {bottomTab === 'response' && (
              <div>
                <pre className="text-xs font-mono text-gray-700 overflow-auto">
                  {JSON.stringify(generateQuestionnaireResponse(), null, 2)}
                </pre>
              </div>
            )}

            {bottomTab === 'context' && (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-semibold text-gray-900 mb-2 block">
                    Required Context Resources
                  </Label>
                  <p className="text-xs text-gray-500 mb-3">
                    Select which FHIR resources must be present when filling this form
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Patient', 'Practitioner', 'Encounter', 'EpisodeOfCare', 'Appointment', 'ServiceRequest', 'Organization', 'Location'].map((ctx) => (
                      <label
                        key={ctx}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors",
                          contextTypes.includes(ctx)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={contextTypes.includes(ctx)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setContextTypes([...contextTypes, ctx]);
                            } else {
                              setContextTypes(contextTypes.filter(c => c !== ctx));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-xs font-medium text-gray-700">{ctx}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {contextTypes.length > 0 && (
                  <div className="pt-3 border-t">
                    <Label className="text-xs font-semibold text-gray-900 mb-2 block">
                      Selected Contexts
                    </Label>
                    <div className="flex flex-wrap gap-1">
                      {contextTypes.map((ctx) => (
                        <span
                          key={ctx}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                        >
                          {ctx}
                          <button
                            onClick={() => setContextTypes(contextTypes.filter(c => c !== ctx))}
                            className="hover:text-blue-900"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        )}
        </>
        )}
      </div>

      {/* AI Generation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-blue-600" />
                  <h2 className="text-base font-semibold text-gray-900">AI Form Generator</h2>
                </div>
                <button
                  onClick={() => {
                    setShowAIModal(false);
                    setUploadedFile(null);
                    setAIPrompt('');
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Upload a PDF document or describe what form you need
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Step 1: PDF Upload */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">1</span>
                  <Label className="text-sm font-medium text-gray-700">Upload PDF (optional)</Label>
                </div>
                <div
                  className={cn(
                    "border rounded-lg p-4 text-center transition-all cursor-pointer",
                    uploadedFile
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                  )}
                  onClick={() => document.getElementById('pdf-upload')?.click()}
                >
                  <input
                    id="pdf-upload"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {uploadedFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700 truncate max-w-[200px]">{uploadedFile.name}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFile(null);
                        }}
                        className="p-1 hover:bg-green-100 rounded"
                      >
                        <X className="h-3.5 w-3.5 text-gray-500" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <FileUp className="h-4 w-4" />
                      <span className="text-sm">Click to upload PDF</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Description */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">2</span>
                  <Label className="text-sm font-medium text-gray-700">Describe your form</Label>
                </div>
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAIPrompt(e.target.value)}
                  placeholder="e.g., Create a diabetes screening form with questions about symptoms, family history, and lifestyle..."
                  className="min-h-[80px] text-sm resize-none"
                />
              </div>

              {/* Quick Templates */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Or try a template:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'COVID-19 screening',
                    'Pre-op assessment',
                    'Mental health intake',
                    'Pediatric wellness',
                  ].map((example) => (
                    <button
                      key={example}
                      onClick={() => setAIPrompt(example + ' questionnaire')}
                      className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded text-gray-600 transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 rounded-lg p-3 flex gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  AI will analyze your input and generate form questions. You can edit, add, or remove questions after generation.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAIModal(false);
                  setUploadedFile(null);
                  setAIPrompt('');
                }}
                disabled={aiGenerating}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAIGenerate}
                disabled={aiGenerating || (!uploadedFile && !aiPrompt)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {aiGenerating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Tree Item Component
function TreeItem({
  item,
  selectedId,
  expandedIds,
  onSelect,
  onToggleExpand,
  onAddChild,
  onDelete,
  depth,
}: {
  item: QuestionnaireItem;
  selectedId: string | null;
  expandedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onAddChild: (type: string, parentId: string) => void;
  onDelete: (id: string) => void;
  depth: number;
}) {
  const isSelected = selectedId === item.linkId;
  const isExpanded = expandedIds.has(item.linkId);
  const hasChildren = item.item && item.item.length > 0;
  const isGroup = item.type === 'group';

  // Check if it's a columns layout
  const isColumns = isGroup && item.extension?.some(ext =>
    ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl' &&
    ext.valueCode === 'columns'
  );

  // Check if it's a special display type
  const displayCategory = item.type === 'display' ? item.extension?.find(ext =>
    ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory'
  )?.valueCode : null;

  const getIcon = () => {
    if (isColumns) return 'COL';
    if (displayCategory === 'heading') return 'H';
    if (displayCategory === 'separator') return '---';
    if (displayCategory === 'description') return 'TXT';
    return item.type.substring(0, 3).toUpperCase();
  };

  return (
    <div>
      <div
        onClick={() => onSelect(item.linkId)}
        className={cn(
          "group flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer hover:bg-gray-100",
          isSelected && "bg-blue-50",
        )}
        style={{ paddingLeft: `${(depth * 12) + 8}px` }}
      >
        <div
          className={cn(
            "h-4 w-4 flex items-center justify-center",
            !isGroup && !hasChildren && "invisible"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(item.linkId);
          }}
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </div>

        <span className={cn(
          "text-[10px] font-mono px-1 py-0.5 rounded",
          isColumns ? "bg-blue-100 text-blue-700" :
          displayCategory === 'heading' ? "bg-purple-100 text-purple-700" :
          displayCategory === 'separator' ? "bg-gray-200 text-gray-600" :
          displayCategory === 'description' ? "bg-green-100 text-green-700" :
          "bg-gray-100"
        )}>
          {getIcon()}
        </span>

        <span className="flex-1 truncate">{item.text || item.linkId}</span>

        {item.required && <span className="text-red-500">*</span>}

        {isGroup && (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onAddChild('string', item.linkId);
            }}
            className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100"
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div className="mt-0.5 space-y-0.5">
          {item.item!.map((child) => (
            <TreeItem
              key={child.linkId}
              item={child}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              onAddChild={onAddChild}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Canvas Panel Component
function CanvasPanel({
  title,
  description,
  questions,
  selectedId,
  onSelect,
  onUpdate,
  showPreview,
  onTogglePreview,
}: {
  title: string;
  description: string;
  questions: QuestionnaireItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<QuestionnaireItem>) => void;
  showPreview: boolean;
  onTogglePreview: () => void;
}) {
  const renderItem = (item: QuestionnaireItem): React.ReactNode => {
    const isSelected = selectedId === item.linkId;

    // Check if this is a columns layout
    const isColumns = item.type === 'group' && item.extension?.some(ext =>
      ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl' &&
      ext.valueCode === 'columns'
    );

    const columnCount = isColumns ? (item.extension?.find(ext =>
      ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-columns'
    )?.valueInteger || 2) : 2;

    // Check for display category
    const displayCategory = item.type === 'display' ? item.extension?.find(ext =>
      ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory'
    )?.valueCode : null;

    // Render separator
    if (displayCategory === 'separator') {
      return (
        <div
          key={item.linkId}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(item.linkId);
          }}
          className={cn(
            "py-2 cursor-pointer",
            isSelected && "bg-blue-50 rounded px-2"
          )}
        >
          <hr className="border-t-2 border-gray-300" />
        </div>
      );
    }

    // Render heading
    if (displayCategory === 'heading') {
      return (
        <div
          key={item.linkId}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(item.linkId);
          }}
          className={cn(
            "cursor-pointer transition-all rounded",
            isSelected ? "bg-blue-50 px-3 py-2" : "py-2"
          )}
        >
          <Input
            value={item.text || ''}
            onChange={(e) => {
              e.stopPropagation();
              onUpdate(item.linkId, { text: e.target.value });
            }}
            placeholder="Heading text..."
            className="border-none bg-transparent p-0 h-auto text-xl font-bold focus:ring-0"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      );
    }

    // Render description
    if (displayCategory === 'description') {
      return (
        <div
          key={item.linkId}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(item.linkId);
          }}
          className={cn(
            "cursor-pointer transition-all rounded",
            isSelected ? "bg-blue-50 p-3" : "py-2"
          )}
        >
          <Textarea
            value={item.text || ''}
            onChange={(e) => {
              e.stopPropagation();
              onUpdate(item.linkId, { text: e.target.value });
            }}
            placeholder="Description text..."
            className="border-none bg-transparent p-0 text-sm text-gray-600 focus:ring-0 resize-none"
            onClick={(e) => e.stopPropagation()}
            rows={2}
          />
        </div>
      );
    }

    return (
      <div
        key={item.linkId}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(item.linkId);
        }}
        className={cn(
          "p-3 rounded border bg-white cursor-pointer transition-all",
          isSelected
            ? "border-blue-500 shadow-md"
            : "border-gray-200 hover:border-gray-300"
        )}
      >
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <Input
              value={item.text || ''}
              onChange={(e) => {
                e.stopPropagation();
                onUpdate(item.linkId, { text: e.target.value });
              }}
              placeholder="Question text..."
              className="border-none bg-transparent p-0 h-auto text-sm font-medium focus:ring-0 mb-1"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="text-xs text-gray-500">
              {isColumns ? `${columnCount} Columns` : item.type}
              {item.required && <span className="text-red-500 ml-1">* required</span>}
            </div>
          </div>
        </div>

        {/* Render columns layout */}
        {isColumns && item.item && item.item.length > 0 && (
          <div className={cn(
            "mt-3 grid gap-3",
            columnCount === 2 && "grid-cols-2",
            columnCount === 3 && "grid-cols-3",
            columnCount === 4 && "grid-cols-4"
          )}>
            {item.item.map(child => renderItem(child))}
          </div>
        )}

        {/* Render regular group */}
        {item.type === 'group' && !isColumns && item.item && item.item.length > 0 && (
          <div className="mt-3 pl-3 border-l-2 border-gray-200 space-y-2">
            {item.item.map(child => renderItem(child))}
          </div>
        )}
      </div>
    );
  };

  const renderPreview = (item: QuestionnaireItem): React.ReactNode => {
    // Check if this is a columns layout
    const isColumns = item.type === 'group' && item.extension?.some(ext =>
      ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl' &&
      ext.valueCode === 'columns'
    );

    const columnCount = isColumns ? (item.extension?.find(ext =>
      ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-columns'
    )?.valueInteger || 2) : 2;

    // Check for display category
    const displayCategory = item.type === 'display' ? item.extension?.find(ext =>
      ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-displayCategory'
    )?.valueCode : null;

    // Render separator
    if (displayCategory === 'separator') {
      return <hr key={item.linkId} className="my-4 border-t-2 border-gray-300" />;
    }

    // Render heading
    if (displayCategory === 'heading') {
      return (
        <h2 key={item.linkId} className="text-xl font-bold text-gray-900 mt-6 mb-3">
          {item.text || 'Heading'}
        </h2>
      );
    }

    // Render description
    if (displayCategory === 'description') {
      return (
        <p key={item.linkId} className="text-sm text-gray-600 mb-4">
          {item.text || 'Description text'}
        </p>
      );
    }

    return (
      <div key={item.linkId} className="space-y-2">
        {item.type !== 'display' && (
          <Label className="text-sm font-medium">
            {item.text || 'Untitled'}
            {item.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}

        {item.type === 'string' && <Input placeholder="Your answer" className="h-9" />}
        {item.type === 'text' && <Textarea placeholder="Your answer" rows={3} />}
        {item.type === 'integer' && <Input type="number" placeholder="0" className="h-9" />}
        {item.type === 'boolean' && (
          <div className="flex gap-3">
            <label className="flex items-center gap-2">
              <input type="radio" name={item.linkId} />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name={item.linkId} />
              <span className="text-sm">No</span>
            </label>
          </div>
        )}
        {item.type === 'date' && <Input type="date" className="h-9" />}
        {item.type === 'choice' && item.answerOption && (
          <div className="space-y-2">
            {item.answerOption.map((opt, idx) => (
              <label key={idx} className="flex items-center gap-2">
                <input type="radio" name={item.linkId} />
                <span className="text-sm">{opt.valueString}</span>
              </label>
            ))}
          </div>
        )}

        {/* Render columns layout */}
        {isColumns && item.item && (
          <div className={cn(
            "grid gap-4",
            columnCount === 2 && "grid-cols-2",
            columnCount === 3 && "grid-cols-3",
            columnCount === 4 && "grid-cols-4"
          )}>
            {item.item.map(child => renderPreview(child))}
          </div>
        )}

        {/* Render regular group */}
        {item.type === 'group' && !isColumns && item.item && (
          <div className="pl-4 space-y-3 border-l-2 border-gray-200">
            {item.item.map(child => renderPreview(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Preview Toggle - Top Right */}
      <div className="flex justify-end mb-4">
        <Button
          onClick={onTogglePreview}
          size="sm"
          variant={showPreview ? "default" : "outline"}
          className="h-8 px-3"
        >
          <Eye className="h-3.5 w-3.5 mr-1.5" />
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </Button>
      </div>

      {showPreview ? (
        /* Preview Mode */
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title || 'Form'}</h1>
          {description && <p className="text-sm text-gray-600 mb-6">{description}</p>}

          <div className="space-y-4">
            {questions.map(q => renderPreview(q))}
          </div>

          {questions.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Submit</Button>
            </div>
          )}
        </div>
      ) : (
        /* Edit Mode */
        <>
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
            <h2 className="text-xl font-bold text-gray-900">{title || 'Form Title'}</h2>
            {description && <p className="text-sm text-gray-600 mt-2">{description}</p>}
          </div>

          <div className="space-y-2">
            {questions.length === 0 ? (
              <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Add components from the left panel</p>
              </div>
            ) : (
              questions.map(q => renderItem(q))
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Property Panel Component (keeping existing implementation)
function PropertyPanel({
  question,
  tab,
  onUpdate,
}: {
  question: QuestionnaireItem;
  tab: 'basic' | 'validation' | 'logic' | 'advanced';
  onUpdate: (updates: Partial<QuestionnaireItem>) => void;
}) {
  // Check if this is a columns layout
  const isColumns = question.type === 'group' && question.extension?.some(ext =>
    ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl' &&
    ext.valueCode === 'columns'
  );

  const columnCount = isColumns ? (question.extension?.find(ext =>
    ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-columns'
  )?.valueInteger || 2) : 2;

  if (tab === 'basic') {
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-xs font-medium">Link ID</Label>
          <Input
            value={question.linkId}
            onChange={(e) => onUpdate({ linkId: e.target.value })}
            className="mt-1.5 h-8 text-sm font-mono"
          />
        </div>

        <div>
          <Label className="text-xs font-medium">Type</Label>
          <select
            value={question.type}
            onChange={(e) => onUpdate({ type: e.target.value as any })}
            className="w-full mt-1.5 h-8 px-3 text-sm border rounded-md"
          >
            <option value="string">Text</option>
            <option value="text">Long Text</option>
            <option value="integer">Integer</option>
            <option value="decimal">Decimal</option>
            <option value="boolean">Boolean</option>
            <option value="date">Date</option>
            <option value="time">Time</option>
            <option value="datetime">DateTime</option>
            <option value="choice">Choice</option>
            <option value="open-choice">Open Choice</option>
            <option value="attachment">Attachment</option>
            <option value="display">Display</option>
            <option value="group">Group</option>
          </select>
        </div>

        {/* Column Count for Columns Layout */}
        {isColumns && (
          <div>
            <Label className="text-xs font-medium">Number of Columns</Label>
            <select
              value={columnCount}
              onChange={(e) => {
                const newCount = parseInt(e.target.value);
                const newExtensions = question.extension?.map(ext => {
                  if (ext.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-columns') {
                    return { ...ext, valueInteger: newCount };
                  }
                  return ext;
                }) || [];
                onUpdate({ extension: newExtensions });
              }}
              className="w-full mt-1.5 h-8 px-3 text-sm border rounded-md"
            >
              <option value="2">2 Columns</option>
              <option value="3">3 Columns</option>
              <option value="4">4 Columns</option>
            </select>
          </div>
        )}

        <div>
          <Label className="text-xs font-medium">Question Text</Label>
          <Textarea
            value={question.text || ''}
            onChange={(e) => onUpdate({ text: e.target.value })}
            className="mt-1.5 text-sm"
            rows={3}
          />
        </div>

        <div>
          <Label className="text-xs font-medium">Prefix</Label>
          <Input
            value={(question as any).prefix || ''}
            onChange={(e) => onUpdate({ prefix: e.target.value } as any)}
            placeholder="e.g., 1., A)"
            className="mt-1.5 h-8 text-sm"
          />
        </div>

        {(question.type === 'string' || question.type === 'text') && (
          <>
            <div>
              <Label className="text-xs font-medium">Placeholder</Label>
              <Input
                value={(question as any)._placeholder || ''}
                onChange={(e) => onUpdate({ _placeholder: e.target.value } as any)}
                className="mt-1.5 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Max Length</Label>
              <Input
                type="number"
                value={question.maxLength || ''}
                onChange={(e) => onUpdate({ maxLength: parseInt(e.target.value) || undefined })}
                className="mt-1.5 h-8 text-sm"
              />
            </div>
          </>
        )}

        {(question.type === 'integer' || question.type === 'decimal' || question.type === 'quantity') && (
          <div>
            <Label className="text-xs font-medium">Unit</Label>
            <Input
              value={(question as any).unit || ''}
              onChange={(e) => onUpdate({ unit: e.target.value } as any)}
              placeholder="e.g., kg, cm"
              className="mt-1.5 h-8 text-sm"
            />
          </div>
        )}

        {(question.type === 'choice' || question.type === 'open-choice') && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-medium">Options</Label>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const newOptions = [...(question.answerOption || []), { valueString: '' }];
                  onUpdate({ answerOption: newOptions });
                }}
                className="h-7 px-2 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {question.answerOption?.map((option, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={option.valueString || ''}
                    onChange={(e) => {
                      const newOptions = [...(question.answerOption || [])];
                      newOptions[idx] = { valueString: e.target.value };
                      onUpdate({ answerOption: newOptions });
                    }}
                    placeholder={`Option ${idx + 1}`}
                    className="h-8 text-sm"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const newOptions = (question.answerOption || []).filter((_, i) => i !== idx);
                      onUpdate({ answerOption: newOptions });
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2 pt-2 border-t">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={question.required || false}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              className="rounded"
            />
            <span className="text-xs">Required</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={question.readOnly || false}
              onChange={(e) => onUpdate({ readOnly: e.target.checked })}
              className="rounded"
            />
            <span className="text-xs">Read Only</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={question.repeats || false}
              onChange={(e) => onUpdate({ repeats: e.target.checked })}
              className="rounded"
            />
            <span className="text-xs">Repeats</span>
          </label>
        </div>
      </div>
    );
  }

  if (tab === 'validation') {
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-xs font-medium">Min Value</Label>
          <Input
            type="number"
            value={(question as any).minValue || ''}
            onChange={(e) => onUpdate({ minValue: e.target.value } as any)}
            className="mt-1.5 h-8 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Max Value</Label>
          <Input
            type="number"
            value={(question as any).maxValue || ''}
            onChange={(e) => onUpdate({ maxValue: e.target.value } as any)}
            className="mt-1.5 h-8 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Regex Pattern</Label>
          <Input
            value={(question as any)._regex || ''}
            onChange={(e) => onUpdate({ _regex: e.target.value } as any)}
            placeholder="^[A-Z].*"
            className="mt-1.5 h-8 text-sm font-mono"
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Error Message</Label>
          <Input
            value={(question as any)._errorMessage || ''}
            onChange={(e) => onUpdate({ _errorMessage: e.target.value } as any)}
            className="mt-1.5 h-8 text-sm"
          />
        </div>
      </div>
    );
  }

  if (tab === 'logic') {
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-xs font-medium">Enable When</Label>
          <p className="text-xs text-gray-500 mb-3">Show this question conditionally</p>
          <div className="space-y-3">
            {question.enableWhen?.map((condition, idx) => (
              <div key={idx} className="p-3 border rounded-lg space-y-2">
                <Input
                  value={condition.question}
                  onChange={(e) => {
                    const newConditions = [...(question.enableWhen || [])];
                    newConditions[idx] = { ...condition, question: e.target.value };
                    onUpdate({ enableWhen: newConditions });
                  }}
                  placeholder="Question ID"
                  className="h-8 text-sm"
                />
                <select
                  value={condition.operator}
                  onChange={(e) => {
                    const newConditions = [...(question.enableWhen || [])];
                    newConditions[idx] = { ...condition, operator: e.target.value as any };
                    onUpdate({ enableWhen: newConditions });
                  }}
                  className="w-full h-8 px-3 text-sm border rounded-md"
                >
                  <option value="=">equals</option>
                  <option value="!=">not equals</option>
                  <option value=">">greater than</option>
                  <option value="<">less than</option>
                  <option value="exists">exists</option>
                </select>
                <Input
                  value={condition.answerString || condition.answerBoolean?.toString() || ''}
                  onChange={(e) => {
                    const newConditions = [...(question.enableWhen || [])];
                    newConditions[idx] = { ...condition, answerString: e.target.value };
                    onUpdate({ enableWhen: newConditions });
                  }}
                  placeholder="Value"
                  className="h-8 text-sm"
                />
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const newConditions = [
                  ...(question.enableWhen || []),
                  { question: '', operator: '=' as any, answerString: '' }
                ];
                onUpdate({ enableWhen: newConditions });
              }}
              className="w-full h-8 text-sm"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Condition
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'advanced') {
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-xs font-medium">Initial Value</Label>
          <Input
            value={(question as any).initial?.[0]?.valueString || ''}
            onChange={(e) => onUpdate({ initial: [{ valueString: e.target.value }] } as any)}
            className="mt-1.5 h-8 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Help Text</Label>
          <Textarea
            value={(question as any)._helpText || ''}
            onChange={(e) => onUpdate({ _helpText: e.target.value } as any)}
            className="mt-1.5 text-sm"
            rows={2}
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Definition URI</Label>
          <Input
            value={question.definition || ''}
            onChange={(e) => onUpdate({ definition: e.target.value })}
            placeholder="http://..."
            className="mt-1.5 h-8 text-sm"
          />
        </div>
        <div>
          <Label className="text-xs font-medium">Code System</Label>
          <Input
            value={(question as any)._codeSystem || ''}
            onChange={(e) => onUpdate({ _codeSystem: e.target.value } as any)}
            placeholder="LOINC, SNOMED, etc."
            className="mt-1.5 h-8 text-sm"
          />
        </div>
      </div>
    );
  }

  return null;
}
