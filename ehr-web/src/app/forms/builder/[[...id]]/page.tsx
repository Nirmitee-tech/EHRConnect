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
  Settings,
  Activity,
  User,
  MapPin,
  PenTool,
  Phone,
  Mail,
  Globe,
  List,
  Sliders,
  Database,
  FileCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formsService } from '@/services/forms.service';
import type { FHIRQuestionnaire, QuestionnaireItem } from '@/types/forms';
import { cn } from '@/lib/utils';
import { QuestionTreeItem } from '../components/QuestionTreeItem';
import { addItem, updateItem, deleteItem, findItem } from '../utils/tree-utils';

// Extended Component Types
const COMPONENT_TYPES = [
  // Basic Types
  { value: 'group', label: 'Group', icon: 'GRP', description: 'Container for grouping items' },
  { value: 'string', label: 'Text', icon: 'TXT', description: 'Short text input' },
  { value: 'text', label: 'Textarea', icon: 'TXA', description: 'Long text input' },
  { value: 'integer', label: 'Integer', icon: '123', description: 'Whole number input' },
  { value: 'decimal', label: 'Decimal', icon: '1.0', description: 'Decimal number' },
  { value: 'boolean', label: 'Checkbox', icon: 'CHK', description: 'Yes/No checkbox' },
  { value: 'date', label: 'Date', icon: 'DTE', description: 'Date picker' },
  { value: 'time', label: 'Time', icon: 'TIM', description: 'Time picker' },
  { value: 'datetime', label: 'Datetime', icon: 'DTM', description: 'Date and time picker' },

  // Selection
  { value: 'choice', label: 'Choice', icon: 'CHC', description: 'Single or multiple choice' },
  { value: 'open-choice', label: 'Open Choice', icon: <List className="w-4 h-4" />, description: 'Select or type custom value' },

  // Advanced Inputs
  { value: 'slider', label: 'Slider', icon: <Sliders className="w-4 h-4" />, description: 'Visual analog scale / Range' },
  { value: 'signature', label: 'Signature', icon: <PenTool className="w-4 h-4" />, description: 'Digital signature pad' },
  { value: 'attachment', label: 'Attachment', icon: 'ATT', description: 'File upload' },

  // Formatted Inputs
  { value: 'phone', label: 'Phone', icon: <Phone className="w-4 h-4" />, description: 'Phone number input' },
  { value: 'email', label: 'Email', icon: <Mail className="w-4 h-4" />, description: 'Email address input' },
  { value: 'url', label: 'URL', icon: <Globe className="w-4 h-4" />, description: 'Website link' },

  // Composites (Pre-configured Groups)
  { value: 'address', label: 'Address', icon: <MapPin className="w-4 h-4" />, description: 'Street, City, State, Zip' },
  { value: 'human-name', label: 'Name', icon: <User className="w-4 h-4" />, description: 'First, Last, Middle, Prefix' },
  { value: 'vitals-bp', label: 'Blood Pressure', icon: <Activity className="w-4 h-4" />, description: 'Systolic & Diastolic' },
  { value: 'vitals-hw', label: 'Height/Weight', icon: <Activity className="w-4 h-4" />, description: 'Height & Weight' },

  // FHIR Specific
  { value: 'reference', label: 'Reference', icon: 'REF', description: 'Resource reference' },
  { value: 'quantity', label: 'Quantity', icon: 'QTY', description: 'Number with unit' },
  { value: 'display', label: 'Display', icon: 'DSP', description: 'Static text display' },
];

// Example Templates
const EXAMPLE_TEMPLATES: Record<string, QuestionnaireItem[]> = {
  'patient-intake': [
    {
      linkId: 'p-1',
      text: 'Patient Demographics',
      type: 'group',
      item: [
        {
          linkId: 'p-1-1',
          text: 'Full Name',
          type: 'group',
          item: [
            { linkId: 'p-1-1-1', text: 'First Name', type: 'string', required: true },
            { linkId: 'p-1-1-2', text: 'Last Name', type: 'string', required: true }
          ]
        },
        { linkId: 'p-1-2', text: 'Date of Birth', type: 'date', required: true },
        { linkId: 'p-1-3', text: 'Contact Phone', type: 'string', extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl', valueCode: 'phone' }] }
      ]
    },
    {
      linkId: 'p-2',
      text: 'Medical History',
      type: 'group',
      item: [
        {
          linkId: 'p-2-1',
          text: 'Do you have any allergies?',
          type: 'boolean'
        },
        {
          linkId: 'p-2-2',
          text: 'Please list allergies',
          type: 'text',
          enableWhen: [{ question: 'p-2-1', operator: '=', answerBoolean: true }]
        }
      ]
    }
  ],
  'vitals-check': [
    {
      linkId: 'v-1',
      text: 'Vital Signs',
      type: 'group',
      item: [
        {
          linkId: 'v-1-1',
          text: 'Blood Pressure',
          type: 'group',
          item: [
            { linkId: 'v-1-1-1', text: 'Systolic', type: 'integer', unit: 'mmHg' } as any,
            { linkId: 'v-1-1-2', text: 'Diastolic', type: 'integer', unit: 'mmHg' } as any
          ]
        },
        {
          linkId: 'v-1-2',
          text: 'Heart Rate',
          type: 'integer',
          unit: 'bpm'
        } as any,
        {
          linkId: 'v-1-3',
          text: 'Pain Level (0-10)',
          type: 'integer',
          extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl', valueCode: 'slider' }]
        }
      ]
    }
  ]
};

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
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['root']));
  const [leftPanelTab, setLeftPanelTab] = useState<'items' | 'components'>('items');
  const [bottomPanelTab, setBottomPanelTab] = useState<'questionnaire' | 'response' | 'population' | 'extraction' | 'expressions'>('questionnaire');
  const [componentSearch, setComponentSearch] = useState('');
  const [contextTypes, setContextTypes] = useState<string[]>([]);

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
      const template = await formsService.getTemplate(templateId);
      setTitle(template.title);
      setDescription(template.description || '');
      setCategory(template.category || 'general');
      setQuestions(template.questionnaire.item || []);
      if (template.settings?.contextTypes) {
        setContextTypes(template.settings.contextTypes);
      }
    } catch (error) {
      console.error('Failed to load template:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateLinkId = () => `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const handleAddQuestion = (type: string = 'string', parentLinkId?: string) => {
    let newQuestion: QuestionnaireItem;
    const baseId = generateLinkId();

    // Handle Composite Types
    switch (type) {
      case 'address':
        newQuestion = {
          linkId: baseId,
          text: 'Address',
          type: 'group',
          item: [
            { linkId: `${baseId}_street`, text: 'Street Address', type: 'string' },
            { linkId: `${baseId}_city`, text: 'City', type: 'string', width: '50%' } as any,
            { linkId: `${baseId}_state`, text: 'State', type: 'string', width: '25%' } as any,
            { linkId: `${baseId}_zip`, text: 'Zip Code', type: 'string', width: '25%' } as any,
            { linkId: `${baseId}_country`, text: 'Country', type: 'string' }
          ]
        };
        break;
      case 'human-name':
        newQuestion = {
          linkId: baseId,
          text: 'Name',
          type: 'group',
          item: [
            { linkId: `${baseId}_first`, text: 'First Name', type: 'string', width: '40%' } as any,
            { linkId: `${baseId}_middle`, text: 'Middle', type: 'string', width: '20%' } as any,
            { linkId: `${baseId}_last`, text: 'Last Name', type: 'string', width: '40%' } as any,
          ]
        };
        break;
      case 'vitals-bp':
        newQuestion = {
          linkId: baseId,
          text: 'Blood Pressure',
          type: 'group',
          item: [
            { linkId: `${baseId}_sys`, text: 'Systolic', type: 'integer', unit: 'mmHg', width: '50%' } as any,
            { linkId: `${baseId}_dia`, text: 'Diastolic', type: 'integer', unit: 'mmHg', width: '50%' } as any,
          ]
        };
        break;
      case 'vitals-hw':
        newQuestion = {
          linkId: baseId,
          text: 'Body Measurements',
          type: 'group',
          item: [
            { linkId: `${baseId}_ht`, text: 'Height', type: 'quantity', unit: 'cm', width: '50%' } as any,
            { linkId: `${baseId}_wt`, text: 'Weight', type: 'quantity', unit: 'kg', width: '50%' } as any,
          ]
        };
        break;
      case 'slider':
        newQuestion = {
          linkId: baseId,
          text: 'Slider Question',
          type: 'integer',
          extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl', valueCode: 'slider' }]
        };
        break;
      case 'signature':
        newQuestion = {
          linkId: baseId,
          text: 'Signature',
          type: 'attachment',
          extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-signature', valueBoolean: true }]
        };
        break;
      case 'phone':
        newQuestion = {
          linkId: baseId,
          text: 'Phone Number',
          type: 'string',
          extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl', valueCode: 'phone' }]
        };
        break;
      case 'email':
        newQuestion = {
          linkId: baseId,
          text: 'Email Address',
          type: 'string',
          extension: [{ url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl', valueCode: 'email' }]
        };
        break;
      default:
        newQuestion = {
          linkId: baseId,
          text: type === 'group' ? 'New Group' : '',
          type: type as any,
          required: false,
          item: [],
        };
    }

    setQuestions(prev => addItem(prev, newQuestion, parentLinkId));

    if (parentLinkId) {
      const newExpanded = new Set(expandedItems);
      newExpanded.add(parentLinkId);
      setExpandedItems(newExpanded);
    }

    setSelectedLinkId(newQuestion.linkId);
  };

  const handleUpdateQuestion = (linkId: string, field: keyof QuestionnaireItem, value: any) => {
    setQuestions(prev => updateItem(prev, linkId, { [field]: value }));
  };

  const handleDeleteQuestion = (linkId: string) => {
    if (confirm('Are you sure you want to delete this item and all its children?')) {
      setQuestions(prev => deleteItem(prev, linkId));
      if (selectedLinkId === linkId) {
        setSelectedLinkId(null);
      }
    }
  };

  const addChoice = (linkId: string) => {
    const item = findItem(questions, linkId);
    if (!item) return;

    const currentOptions = item.answerOption || [];
    const newOptions = [...currentOptions, { valueString: '' }];
    handleUpdateQuestion(linkId, 'answerOption', newOptions);
  };

  const updateChoice = (linkId: string, choiceIndex: number, value: string) => {
    const item = findItem(questions, linkId);
    if (!item) return;

    const updatedOptions = [...(item.answerOption || [])];
    updatedOptions[choiceIndex] = { valueString: value };
    handleUpdateQuestion(linkId, 'answerOption', updatedOptions);
  };

  const deleteChoice = (linkId: string, choiceIndex: number) => {
    const item = findItem(questions, linkId);
    if (!item) return;

    const updatedOptions = (item.answerOption || []).filter((_, i) => i !== choiceIndex);
    handleUpdateQuestion(linkId, 'answerOption', updatedOptions);
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

      console.log('Saving with context types:', contextTypes);

      let result;
      if (templateId) {
        result = await formsService.updateTemplate(templateId, {
          title,
          description,
          category,
          questionnaire
        });
      } else {
        result = await formsService.createTemplate({
          title,
          description,
          category,
          tags: ['custom'],
          questionnaire
        });
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

  const loadExample = (key: string) => {
    if (confirm('This will replace your current form. Continue?')) {
      setQuestions(EXAMPLE_TEMPLATES[key]);
      setTitle(key === 'patient-intake' ? 'Patient Intake Form' : 'Vitals Check');
      setExpandedItems(new Set(['root']));
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const selectedQuestion = selectedLinkId ? findItem(questions, selectedLinkId) : null;

  // Recursive renderer for the preview panel
  const renderPreviewItem = (item: QuestionnaireItem, depth = 0) => {
    const icon = getQuestionIcon(item.type);
    const isSelected = selectedLinkId === item.linkId;

    // Check extensions for special rendering
    const isSlider = item.extension?.some(e => e.url.includes('itemControl') && e.valueCode === 'slider');
    const isSignature = item.extension?.some(e => e.url.includes('signature'));
    const isPhone = item.extension?.some(e => e.url.includes('itemControl') && e.valueCode === 'phone');
    const isEmail = item.extension?.some(e => e.url.includes('itemControl') && e.valueCode === 'email');

    // Width handling
    const width = (item as any)._width || (item as any).width || '100%';

    return (
      <div
        key={item.linkId}
        className={cn(
          "p-3 rounded border transition-all cursor-pointer mb-3",
          isSelected
            ? "border-blue-500 bg-blue-50/30 shadow-sm"
            : "border-gray-200 hover:border-gray-300 bg-white",
          item.type === 'group' && "bg-gray-50/50"
        )}
        style={{
          marginLeft: depth > 0 ? '20px' : '0',
          width: width !== '100%' ? width : undefined,
          display: width !== '100%' ? 'inline-block' : 'block',
          verticalAlign: 'top'
        }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedLinkId(item.linkId);
        }}
      >
        <Label className="flex items-center gap-2 mb-2 text-sm">
          <span className="text-gray-400 text-xs font-mono flex items-center justify-center w-4 h-4">
            {typeof icon === 'string' ? icon : icon}
          </span>
          <span className="font-medium">
            {item.text || <span className="text-gray-400 italic">Untitled {item.type}</span>}
            {item.required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </Label>

        {/* Render Logic based on Type and Extensions */}
        {isSlider ? (
          <div className="px-2">
            <input type="range" min="0" max="10" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" disabled />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>
        ) : isSignature ? (
          <div className="border-2 border-dashed border-gray-300 rounded h-24 flex items-center justify-center bg-white">
            <div className="text-center text-gray-400">
              <PenTool className="h-6 w-6 mx-auto mb-1" />
              <span className="text-xs">Sign here</span>
            </div>
          </div>
        ) : (
          <>
            {item.type === 'string' && (
              <div className="relative">
                {isPhone && <Phone className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />}
                {isEmail && <Mail className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />}
                <Input
                  placeholder={isPhone ? "(555) 555-5555" : isEmail ? "user@example.com" : "Short answer"}
                  disabled
                  className={cn("bg-gray-50 text-xs h-8", (isPhone || isEmail) && "pl-7")}
                />
              </div>
            )}
            {item.type === 'text' && (
              <Textarea placeholder="Long answer" disabled rows={3} className="bg-gray-50 text-xs" />
            )}
            {item.type === 'integer' && (
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="0" disabled className="bg-gray-50 text-xs h-8" />
                {(item as any).unit && <span className="text-xs text-gray-500">{(item as any).unit}</span>}
              </div>
            )}
            {item.type === 'decimal' && (
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="0.0" disabled className="bg-gray-50 text-xs h-8" />
                {(item as any).unit && <span className="text-xs text-gray-500">{(item as any).unit}</span>}
              </div>
            )}
            {item.type === 'quantity' && (
              <div className="flex gap-2">
                <Input type="number" placeholder="Value" disabled className="bg-gray-50 text-xs h-8 flex-1" />
                <Input placeholder="Unit" value={(item as any).unit || ''} disabled className="bg-gray-50 text-xs h-8 w-20" />
              </div>
            )}
            {item.type === 'date' && (
              <Input type="date" disabled className="bg-gray-50 text-xs h-8" />
            )}
            {item.type === 'time' && (
              <Input type="time" disabled className="bg-gray-50 text-xs h-8" />
            )}
            {item.type === 'datetime' && (
              <Input type="datetime-local" disabled className="bg-gray-50 text-xs h-8" />
            )}
            {item.type === 'boolean' && (
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
            {(item.type === 'choice' || item.type === 'open-choice') && (
              <div className="space-y-1.5">
                {item.type === 'open-choice' && (
                  <Input placeholder="Type or select..." disabled className="bg-gray-50 text-xs h-8 mb-2" />
                )}
                {item.answerOption && item.answerOption.length > 0 ? (
                  item.answerOption.map((option, optIdx) => (
                    <label key={optIdx} className="flex items-center gap-2">
                      <input type={item.repeats ? "checkbox" : "radio"} disabled />
                      <span className="text-xs">{option.valueString || option.valueCoding?.display || `Option ${optIdx + 1}`}</span>
                    </label>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">No options added</p>
                )}
              </div>
            )}
            {item.type === 'url' && (
              <div className="relative">
                <Globe className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input placeholder="https://example.com" disabled className="bg-gray-50 text-xs h-8 pl-7" />
              </div>
            )}
            {item.type === 'display' && (
              <div className="text-xs text-gray-600 italic">Display text</div>
            )}
            {item.type === 'attachment' && !isSignature && (
              <div className="border-2 border-dashed border-gray-200 rounded p-4 text-center">
                <p className="text-xs text-gray-500">File upload placeholder</p>
              </div>
            )}
            {item.type === 'group' && (
              <div className="mt-3 pl-2 border-l-2 border-gray-200 min-h-[20px]">
                {item.item && item.item.length > 0 ? (
                  item.item.map(child => renderPreviewItem(child, depth + 1))
                ) : (
                  <div className="text-xs text-gray-400 italic p-2">Empty group</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

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
          {/* Example Loader */}
          <div className="mr-2">
            <select
              className="h-7 text-xs border-gray-200 rounded bg-gray-50"
              onChange={(e) => {
                if (e.target.value) loadExample(e.target.value);
                e.target.value = '';
              }}
            >
              <option value="">Load Example...</option>
              <option value="patient-intake">Patient Intake</option>
              <option value="vitals-check">Vitals Check</option>
            </select>
          </div>

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
                      setSelectedLinkId(null);
                      toggleExpand('root');
                    }}
                    className={cn(
                      "w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-xs hover:bg-white transition-colors cursor-pointer",
                      selectedLinkId === null && "bg-white shadow-sm"
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
                        handleAddQuestion();
                      }}
                      size="sm"
                      variant="ghost"
                      className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {expandedItems.has('root') && (
                    <div className="mt-1 space-y-0.5">
                      {questions.length === 0 ? (
                        <div className="px-2 py-6 text-xs text-gray-400 text-center">
                          No items yet
                        </div>
                      ) : (
                        questions.map((q) => (
                          <QuestionTreeItem
                            key={q.linkId}
                            item={q}
                            selectedId={selectedLinkId}
                            expandedIds={expandedItems}
                            onSelect={setSelectedLinkId}
                            onToggleExpand={toggleExpand}
                            onAddChild={(parentId) => handleAddQuestion('string', parentId)}
                            onDelete={handleDeleteQuestion}
                            getIcon={getQuestionIcon}
                          />
                        ))
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
                        onClick={() => handleAddQuestion(comp.value, selectedLinkId || undefined)}
                        className="flex flex-col items-center justify-center p-3 rounded border border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                        title={comp.description}
                      >
                        <span className="text-xs font-bold text-gray-500 group-hover:text-blue-600 mb-1 bg-gray-100 group-hover:bg-blue-100 px-2 py-1 rounded flex items-center justify-center w-8 h-8">
                          {typeof comp.icon === 'string' ? comp.icon : comp.icon}
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
              <h3 className="text-xs font-medium text-gray-700">Properties</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {selectedLinkId === null ? (
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

                  {/* Context Configuration */}
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <h4 className="text-xs font-semibold text-gray-900 mb-2">Context Configuration</h4>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium text-gray-700">Required Context</Label>
                      <div className="space-y-1.5">
                        {['Encounter', 'EpisodeOfCare', 'Appointment', 'ServiceRequest'].map((ctx) => (
                          <div key={ctx} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`ctx-${ctx}`}
                              checked={contextTypes.includes(ctx)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setContextTypes([...contextTypes, ctx]);
                                } else {
                                  setContextTypes(contextTypes.filter(c => c !== ctx));
                                }
                              }}
                            />
                            <Label htmlFor={`ctx-${ctx}`} className="text-xs text-gray-600 cursor-pointer">
                              {ctx}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Select clinical resources that must be present when filling this form.
                      </p>
                    </div>
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
                      onChange={(e) => handleUpdateQuestion(selectedLinkId, 'linkId', e.target.value)}
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
                      onChange={(e) => handleUpdateQuestion(selectedLinkId, 'type', e.target.value)}
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
                      onChange={(e) => handleUpdateQuestion(selectedLinkId, 'text', e.target.value)}
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
                      onChange={(e) => handleUpdateQuestion(selectedLinkId, 'prefix' as any, e.target.value)}
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
                          onChange={(e) => handleUpdateQuestion(selectedLinkId, '_placeholder' as any, e.target.value)}
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
                          onChange={(e) => handleUpdateQuestion(selectedLinkId, 'maxLength', parseInt(e.target.value) || undefined)}
                          placeholder="e.g., 255"
                          className="mt-1 h-7 text-xs"
                        />
                      </div>
                    </>
                  )}

                  {/* Attachment Specific */}
                  {selectedQuestion.type === 'attachment' && (
                    <>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Allowed Types</Label>
                        <Input
                          value={(selectedQuestion as any)._allowedTypes || ''}
                          onChange={(e) => handleUpdateQuestion(selectedLinkId, '_allowedTypes' as any, e.target.value)}
                          placeholder="e.g. application/pdf, image/*"
                          className="mt-1 h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-medium text-gray-700">Max Size (MB)</Label>
                        <Input
                          type="number"
                          value={(selectedQuestion as any)._maxSize || ''}
                          onChange={(e) => handleUpdateQuestion(selectedLinkId, '_maxSize' as any, e.target.value)}
                          placeholder="e.g. 5"
                          className="mt-1 h-7 text-xs"
                        />
                      </div>
                    </>
                  )}

                  {/* Unit for Integer/Decimal/Quantity */}
                  {(selectedQuestion.type === 'integer' || selectedQuestion.type === 'decimal' || selectedQuestion.type === 'quantity') && (
                    <div>
                      <Label className="text-xs font-medium text-gray-700">Unit</Label>
                      <Input
                        value={(selectedQuestion as any).unit || ''}
                        onChange={(e) => handleUpdateQuestion(selectedLinkId, 'unit' as any, e.target.value)}
                        placeholder="e.g. kg, cm, mmHg"
                        className="mt-1 h-7 text-xs"
                      />
                    </div>
                  )}

                  {/* Width */}
                  <div>
                    <Label htmlFor="q-width" className="text-xs font-medium text-gray-700">Width (percentage)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="q-width"
                        type="text"
                        value={(selectedQuestion as any)._width || (selectedQuestion as any).width || '100%'}
                        onChange={(e) => handleUpdateQuestion(selectedLinkId, '_width' as any, e.target.value)}
                        placeholder="100%"
                        className="h-7 text-xs"
                      />
                    </div>
                  </div>

                  {/* Boolean Flags */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="q-hidden"
                        checked={(selectedQuestion as any).hidden || false}
                        onChange={(e) => handleUpdateQuestion(selectedLinkId, 'hidden' as any, e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="q-hidden" className="text-xs cursor-pointer">Hidden</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="q-required"
                        checked={selectedQuestion.required || false}
                        onChange={(e) => handleUpdateQuestion(selectedLinkId, 'required', e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="q-required" className="text-xs cursor-pointer">Required</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="q-repeats"
                        checked={selectedQuestion.repeats || false}
                        onChange={(e) => handleUpdateQuestion(selectedLinkId, 'repeats', e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="q-repeats" className="text-xs cursor-pointer">Repeats</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="q-readonly"
                        checked={selectedQuestion.readOnly || false}
                        onChange={(e) => handleUpdateQuestion(selectedLinkId, 'readOnly', e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="q-readonly" className="text-xs cursor-pointer">Read only</Label>
                    </div>
                  </div>

                  {/* Choice Options */}
                  {(selectedQuestion.type === 'choice' || selectedQuestion.type === 'open-choice') && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs font-medium text-gray-700">Options</Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => addChoice(selectedLinkId)}
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
                                onClick={() => deleteChoice(selectedLinkId, choiceIdx)}
                                className="h-5 w-5 p-0"
                                title="Delete option"
                              >
                                <Trash2 className="h-3 w-3 text-red-500" />
                              </Button>
                            </div>
                            <div>
                              <Label className="text-xs text-gray-600">Code</Label>
                              <Input
                                value={option.valueCoding?.code || option.valueString || ''}
                                onChange={(e) => updateChoice(selectedLinkId, choiceIdx, e.target.value)}
                                placeholder="code"
                                className="h-6 text-xs mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-xs text-gray-600">Display</Label>
                              <Input
                                value={option.valueCoding?.display || option.valueString || ''}
                                onChange={(e) => updateChoice(selectedLinkId, choiceIdx, e.target.value)}
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
                      onChange={(e) => handleUpdateQuestion(selectedLinkId, '_mediaUrl' as any, e.target.value)}
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
                      onChange={(e) => handleUpdateQuestion(selectedLinkId, '_tooltip' as any, e.target.value)}
                      placeholder="Help text"
                      className="mt-1 h-7 text-xs"
                    />
                  </div>

                  {/* Delete Button */}
                  <div className="pt-3 border-t border-gray-200">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteQuestion(selectedLinkId)}
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
                    questions.map(q => renderPreviewItem(q))
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
