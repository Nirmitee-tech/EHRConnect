/**
 * Visual Form Builder - Compact Multi-Step Form Editor
 * Similar to single-page mode but with step management + responsive preview
 */

'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { useFormBuilderStore } from '@/stores/form-builder-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Trash2,
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
  Search,
  Monitor,
  Tablet,
  Smartphone,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Eye,
  EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuestionnaireItem } from '@/types/forms';

// Component Categories - Compact
const COMPONENT_CATEGORIES = {
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
      { type: 'dateTime', label: 'DateTime', icon: Calendar },
    ]
  },
  selection: {
    label: 'Selection',
    components: [
      { type: 'choice', label: 'Choice', icon: ListIcon },
      { type: 'open-choice', label: 'Open Choice', icon: ListIcon },
    ]
  },
};

type ViewportSize = 'mobile' | 'tablet' | 'desktop';

export function VisualFormBuilder() {
  const {
    steps,
    currentStepIndex,
    setCurrentStep,
    addStep,
    deleteStep,
    updateStep,
    addFieldToStep,
    updateField,
    deleteField,
  } = useFormBuilderStore();

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['root']));
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'properties' | 'preview'>('properties');
  const [previewViewport, setPreviewViewport] = useState<ViewportSize>('mobile');

  const currentStep = steps[currentStepIndex];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setDraggedItem(active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !currentStep) {
      setDraggedItem(null);
      return;
    }

    const activeData = active.data.current;

    // Handle dropping component from palette onto canvas
    if (activeData?.type === 'component') {
      const componentType = activeData.componentType;

      const newField: QuestionnaireItem = {
        linkId: `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        text: `New ${componentType} field`,
        type: componentType as any,
        required: false,
      };

      addFieldToStep(currentStep.id, newField);
      setSelectedFieldId(newField.linkId);
    }

    setDraggedItem(null);
  };

  const handleDragCancel = () => {
    setDraggedItem(null);
  };

  const generateLinkId = () => `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  const handleAddQuestion = (type: string) => {
    if (!currentStep) return;

    const newField: QuestionnaireItem = {
      linkId: generateLinkId(),
      text: '',
      type: type as any,
      required: false,
    };

    addFieldToStep(currentStep.id, newField);
    setSelectedFieldId(newField.linkId);
  };

  const handleUpdateField = (fieldLinkId: string, updates: Partial<QuestionnaireItem>) => {
    if (!currentStep) return;
    updateField(currentStep.id, fieldLinkId, updates);
  };

  const handleDeleteField = (fieldLinkId: string) => {
    if (!currentStep) return;
    deleteField(currentStep.id, fieldLinkId);
    setSelectedFieldId(null);
  };

  const handleDuplicateField = (fieldLinkId: string) => {
    if (!currentStep) return;

    const field = currentStep.fields?.find(f => f.linkId === fieldLinkId);
    if (!field) return;

    const duplicate: QuestionnaireItem = {
      ...field,
      linkId: generateLinkId(),
    };

    addFieldToStep(currentStep.id, duplicate);
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

  const selectedField = selectedFieldId && currentStep?.fields?.find(f => f.linkId === selectedFieldId);

  const filteredCategories = Object.entries(COMPONENT_CATEGORIES).reduce((acc, [key, cat]) => {
    const filtered = cat.components.filter(comp =>
      comp.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[key as keyof typeof COMPONENT_CATEGORIES] = { ...cat, components: filtered };
    }
    return acc;
  }, {} as typeof COMPONENT_CATEGORIES);

  if (!currentStep) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">No steps created</p>
          <Button onClick={() => addStep({ title: 'Step 1', stepOrder: 0 })} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Create First Step
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="h-full flex flex-col bg-gray-50">
        {/* Step Tabs - Compact */}
        <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {steps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(idx)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded transition-colors',
                  idx === currentStepIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {idx + 1}. {step.title}
              </button>
            ))}
            <Button
              onClick={() => {
                addStep({ title: `Step ${steps.length + 1}`, stepOrder: steps.length });
                setCurrentStep(steps.length);
              }}
              size="sm"
              variant="outline"
              className="h-7 px-2"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Step
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={rightPanelTab === 'preview' ? 'default' : 'outline'}
              className="h-7 px-2 text-xs"
              onClick={() => {
                setRightPanelTab('preview');
                setRightPanelCollapsed(false);
              }}
            >
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
          </div>
        </div>

        {/* Main Layout - Compact 3-4 Column */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Left: Component Library - Compact */}
          <div className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-2 border-b border-gray-200">
              <span className="text-xs font-semibold text-gray-700">Components</span>
            </div>
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-7 h-7 text-xs bg-gray-50"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {Object.entries(filteredCategories).map(([key, cat]) => (
                <div key={key} className="mb-3">
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 px-1">
                    {cat.label}
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {cat.components.map((comp) => (
                      <DraggableComponent
                        key={comp.type}
                        component={comp}
                        onAdd={() => handleAddQuestion(comp.type)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center: Tree + Canvas - Compact */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Tree View - Compact */}
            <div className="h-28 border-b border-gray-200 bg-white overflow-y-auto shrink-0">
              <div className="p-2">
                <div
                  onClick={() => {
                    setSelectedFieldId(null);
                    toggleExpand('root');
                  }}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer hover:bg-gray-100",
                    selectedFieldId === null && "bg-blue-50"
                  )}
                >
                  {expandedItems.has('root') ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  <FileTextIcon className="h-3 w-3 text-blue-600" />
                  <span className="flex-1 font-medium">{currentStep.title}</span>
                  <span className="text-[10px] text-gray-500">
                    {currentStep.fields?.length || 0} fields
                  </span>
                </div>

                {expandedItems.has('root') && (
                  <div className="ml-2 mt-0.5 space-y-0.5">
                    {currentStep.fields?.map((field) => (
                      <TreeItem
                        key={field.linkId}
                        item={field}
                        selectedId={selectedFieldId}
                        onSelect={setSelectedFieldId}
                        onDelete={handleDeleteField}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Canvas - Compact with Drop Zone */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-3">
              <CanvasDropZone
                stepId={currentStep.id}
                fields={currentStep.fields || []}
                selectedId={selectedFieldId}
                onSelect={setSelectedFieldId}
                onUpdate={handleUpdateField}
                isDragging={!!draggedItem}
              />
            </div>
          </div>

          {/* Right: Properties/Preview Panel - Collapsible */}
          {!rightPanelCollapsed && (
            <div className="w-80 shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
              <div className="p-2 border-b border-gray-200 flex items-center justify-between">
                <Tabs value={rightPanelTab} onValueChange={(v) => setRightPanelTab(v as any)} className="flex-1">
                  <TabsList className="h-7 p-0.5 bg-gray-100">
                    <TabsTrigger value="properties" className="text-xs h-6 px-3">
                      Properties
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="text-xs h-6 px-3">
                      Preview
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setRightPanelCollapsed(true)}
                  className="h-6 w-6 p-0 ml-2"
                >
                  <ChevronRightIcon className="h-3 w-3" />
                </Button>
              </div>

              {rightPanelTab === 'properties' ? (
                selectedFieldId === null ? (
                  <StepProperties step={currentStep} onDelete={() => deleteStep(currentStep.id)} />
                ) : selectedField ? (
                  <FieldProperties
                    field={selectedField}
                    onUpdate={(updates: any) => handleUpdateField(selectedField.linkId, updates)}
                    onDuplicate={() => handleDuplicateField(selectedField.linkId)}
                    onDelete={() => handleDeleteField(selectedField.linkId)}
                  />
                ) : null
              ) : (
                <PreviewPanel
                  step={currentStep}
                  viewport={previewViewport}
                  onViewportChange={setPreviewViewport}
                />
              )}
            </div>
          )}

          {/* Collapsed Panel Toggle */}
          {rightPanelCollapsed && (
            <div className="w-8 shrink-0 bg-white border-l border-gray-200 flex items-center justify-center">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setRightPanelCollapsed(false)}
                className="h-8 w-8 p-0"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {draggedItem && (
            <div className="bg-white border-2 border-blue-500 rounded p-2 shadow-lg">
              <div className="flex items-center gap-2 text-sm">
                <GripVertical className="h-4 w-4 text-blue-500" />
                <span>Adding component...</span>
              </div>
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}

// Draggable Component
function DraggableComponent({ component, onAdd }: any) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${component.type}`,
    data: {
      type: 'component',
      componentType: component.type,
    },
  });

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onAdd}
      className={cn(
        "flex flex-col items-center justify-center p-2 rounded border border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 transition-all text-center cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
      title={`Click or drag to add ${component.label}`}
    >
      <component.icon className="h-4 w-4 text-gray-600 mb-1" />
      <span className="text-[10px] font-medium text-gray-700">
        {component.label}
      </span>
    </button>
  );
}

// Canvas Drop Zone
function CanvasDropZone({ stepId, fields, selectedId, onSelect, onUpdate, isDragging }: any) {
  const { setNodeRef, isOver } = useDroppable({
    id: `canvas-${stepId}`,
    data: { type: 'canvas', stepId },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "max-w-3xl mx-auto min-h-full",
        isDragging && "ring-2 ring-blue-400 ring-offset-4 rounded-lg",
        isOver && "bg-blue-50"
      )}
    >
      {fields.length === 0 ? (
        <div className="bg-white rounded border-2 border-dashed border-gray-300 p-8 text-center">
          <div className="text-sm text-gray-500 mb-2">No fields yet</div>
          <div className="text-xs text-gray-400">
            {isDragging ? 'Drop component here' : 'Click or drag components from the left panel'}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((field: QuestionnaireItem) => (
            <FieldCard
              key={field.linkId}
              field={field}
              isSelected={selectedId === field.linkId}
              onSelect={() => onSelect(field.linkId)}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Tree Item
function TreeItem({ item, selectedId, onSelect, onDelete }: any) {
  const isSelected = selectedId === item.linkId;

  return (
    <div
      onClick={() => onSelect(item.linkId)}
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer hover:bg-gray-100",
        isSelected && "bg-blue-50",
      )}
    >
      <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-gray-100">
        {item.type.substring(0, 3).toUpperCase()}
      </span>
      <span className="flex-1 truncate">{item.text || item.linkId}</span>
      {item.required && <span className="text-red-500 text-xs">*</span>}
    </div>
  );
}

// Field Card
function FieldCard({ field, isSelected, onSelect, onUpdate }: any) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "p-3 rounded border bg-white cursor-pointer transition-all",
        isSelected
          ? "border-blue-500 shadow-md ring-2 ring-blue-100"
          : "border-gray-200 hover:border-gray-300"
      )}
    >
      <Input
        value={field.text || ''}
        onChange={(e) => {
          e.stopPropagation();
          onUpdate(field.linkId, { text: e.target.value });
        }}
        placeholder="Question text..."
        className="border-none bg-transparent p-0 h-auto text-sm font-medium focus:ring-0 mb-1"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="text-xs text-gray-500">
        {field.type}
        {field.required && <span className="text-red-500 ml-1">* required</span>}
      </div>
    </div>
  );
}

// Preview Panel with Responsive Views
function PreviewPanel({ step, viewport, onViewportChange }: any) {
  const viewportSizes = {
    mobile: { width: 375, icon: Smartphone, label: 'Mobile' },
    tablet: { width: 768, icon: Tablet, label: 'Tablet' },
    desktop: { width: 1024, icon: Monitor, label: 'Desktop' },
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Viewport Selector */}
      <div className="p-2 border-b border-gray-200 flex items-center gap-1">
        {Object.entries(viewportSizes).map(([key, config]) => (
          <Button
            key={key}
            size="sm"
            variant={viewport === key ? 'default' : 'ghost'}
            onClick={() => onViewportChange(key as ViewportSize)}
            className="h-7 px-2 text-xs"
          >
            <config.icon className="h-3 w-3 mr-1" />
            {config.label}
          </Button>
        ))}
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div className="mx-auto transition-all duration-300" style={{ maxWidth: viewportSizes[viewport as ViewportSize].width }}>
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {/* Step Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Step {step.stepOrder + 1} of {useFormBuilderStore.getState().steps.length}
                </div>
                <div className="text-xs text-gray-500">
                  {step.fields?.length || 0} fields
                </div>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">{step.title}</h2>
              {step.description && (
                <p className="text-sm text-gray-600">{step.description}</p>
              )}
            </div>

            {/* Form Fields */}
            <div className="p-4 space-y-4">
              {step.fields?.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-400">
                  No fields added yet
                </div>
              ) : (
                step.fields?.map((field: QuestionnaireItem) => (
                  <PreviewField key={field.linkId} field={field} />
                ))
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <Button size="sm" variant="outline" disabled={!step.navigationConfig?.allowBack}>
                ← Back
              </Button>
              <Button size="sm" className="bg-blue-600">
                Next →
              </Button>
            </div>
          </div>

          {/* Viewport Info */}
          <div className="mt-3 text-center text-xs text-gray-500">
            {viewportSizes[viewport as ViewportSize].width}px wide • {viewport} view
          </div>
        </div>
      </div>
    </div>
  );
}

// Preview Field Component
function PreviewField({ field }: { field: QuestionnaireItem }) {
  return (
    <div>
      <Label className="text-sm font-medium text-gray-900 mb-2 block">
        {field.text || field.linkId}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {(field.type === 'string' || field.type === 'integer' || field.type === 'decimal') && (
        <Input
          placeholder="Enter answer..."
          className="bg-white"
          type={field.type === 'string' ? 'text' : 'number'}
          disabled
        />
      )}

      {field.type === 'text' && (
        <Textarea
          placeholder="Enter answer..."
          rows={3}
          className="bg-white resize-none"
          disabled
        />
      )}

      {(field.type === 'date' || field.type === 'dateTime') && (
        <Input
          type={field.type === 'date' ? 'date' : 'datetime-local'}
          className="bg-white"
          disabled
        />
      )}

      {field.type === 'boolean' && (
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name={field.linkId} disabled className="text-blue-600" />
            <span className="text-sm">Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name={field.linkId} disabled className="text-blue-600" />
            <span className="text-sm">No</span>
          </label>
        </div>
      )}

      {(field.type === 'choice' || field.type === 'open-choice') && (
        <div className="space-y-2">
          {field.answerOption?.map((option: any, idx: number) => (
            <label key={idx} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
              <input type="radio" name={field.linkId} disabled className="text-blue-600" />
              <span className="text-sm">{option.valueString || option.valueCoding?.display || `Option ${idx + 1}`}</span>
            </label>
          )) || (
            <div className="text-xs text-gray-400 italic">No options configured</div>
          )}
          {field.type === 'open-choice' && (
            <Input placeholder="Other (please specify)..." className="bg-white mt-2" disabled />
          )}
        </div>
      )}

      {field.type === 'display' && (
        <div className="text-sm text-gray-700 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
          {field.text}
        </div>
      )}
    </div>
  );
}

// Step Properties
function StepProperties({ step, onDelete }: any) {
  const { updateStep } = useFormBuilderStore();

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3">
      <div>
        <Label className="text-xs font-medium">Title</Label>
        <Input
          value={step.title}
          onChange={(e) => updateStep(step.id, { title: e.target.value })}
          className="mt-1 h-7 text-xs"
        />
      </div>
      <div>
        <Label className="text-xs font-medium">Description</Label>
        <Textarea
          value={step.description || ''}
          onChange={(e) => updateStep(step.id, { description: e.target.value })}
          className="mt-1 text-xs"
          rows={2}
        />
      </div>
      <div className="space-y-2 pt-2 border-t">
        <label className="flex items-center justify-between text-xs">
          <span>Allow back</span>
          <Switch
            checked={step.navigationConfig?.allowBack ?? true}
            onCheckedChange={(checked) =>
              updateStep(step.id, {
                navigationConfig: { ...step.navigationConfig, allowBack: checked },
              })
            }
          />
        </label>
        <label className="flex items-center justify-between text-xs">
          <span>Allow skip</span>
          <Switch
            checked={step.navigationConfig?.allowSkip ?? false}
            onCheckedChange={(checked) =>
              updateStep(step.id, {
                navigationConfig: { ...step.navigationConfig, allowSkip: checked },
              })
            }
          />
        </label>
        <label className="flex items-center justify-between text-xs">
          <span>Validate on next</span>
          <Switch
            checked={step.validationConfig?.validateOnNext ?? true}
            onCheckedChange={(checked) =>
              updateStep(step.id, {
                validationConfig: { ...step.validationConfig, validateOnNext: checked },
              })
            }
          />
        </label>
      </div>
      <Button
        variant="destructive"
        size="sm"
        onClick={onDelete}
        className="w-full h-7 text-xs"
      >
        <Trash2 className="h-3 w-3 mr-1" />
        Delete Step
      </Button>
    </div>
  );
}

// Field Properties
function FieldProperties({ field, onUpdate, onDuplicate, onDelete }: any) {
  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3">
      <div>
        <Label className="text-xs font-medium">Link ID</Label>
        <Input
          value={field.linkId}
          disabled
          className="mt-1 h-7 text-xs bg-gray-50 font-mono"
        />
      </div>
      <div>
        <Label className="text-xs font-medium">Type</Label>
        <select
          value={field.type}
          onChange={(e) => onUpdate({ type: e.target.value })}
          className="w-full mt-1 h-7 px-2 text-xs border rounded"
        >
          <option value="string">Text</option>
          <option value="text">Long Text</option>
          <option value="integer">Integer</option>
          <option value="decimal">Decimal</option>
          <option value="boolean">Boolean</option>
          <option value="date">Date</option>
          <option value="dateTime">DateTime</option>
          <option value="choice">Choice</option>
          <option value="open-choice">Open Choice</option>
          <option value="display">Display</option>
        </select>
      </div>
      <div>
        <Label className="text-xs font-medium">Question Text</Label>
        <Textarea
          value={field.text || ''}
          onChange={(e) => onUpdate({ text: e.target.value })}
          className="mt-1 text-xs"
          rows={2}
        />
      </div>
      {(field.type === 'string' || field.type === 'text') && (
        <div>
          <Label className="text-xs font-medium">Max Length</Label>
          <Input
            type="number"
            value={field.maxLength || ''}
            onChange={(e) => onUpdate({ maxLength: parseInt(e.target.value) || undefined })}
            className="mt-1 h-7 text-xs"
          />
        </div>
      )}
      {(field.type === 'choice' || field.type === 'open-choice') && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-xs font-medium">Options</Label>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                const newOptions = [...(field.answerOption || []), { valueString: '' }];
                onUpdate({ answerOption: newOptions });
              }}
              className="h-6 px-2 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
          </div>
          <div className="space-y-1.5">
            {field.answerOption?.map((option: any, idx: number) => (
              <div key={idx} className="flex gap-1.5">
                <Input
                  value={option.valueString || ''}
                  onChange={(e) => {
                    const newOptions = [...(field.answerOption || [])];
                    newOptions[idx] = { valueString: e.target.value };
                    onUpdate({ answerOption: newOptions });
                  }}
                  placeholder={`Option ${idx + 1}`}
                  className="h-7 text-xs"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const newOptions = (field.answerOption || []).filter((_: any, i: number) => i !== idx);
                    onUpdate({ answerOption: newOptions });
                  }}
                  className="h-7 w-7 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-2 pt-2 border-t">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={field.required || false}
            onChange={(e) => onUpdate({ required: e.target.checked })}
            className="rounded"
          />
          <span>Required</span>
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={field.readOnly || false}
            onChange={(e) => onUpdate({ readOnly: e.target.checked })}
            className="rounded"
          />
          <span>Read Only</span>
        </label>
      </div>
      <div className="space-y-1.5 pt-2 border-t">
        <Button
          size="sm"
          variant="outline"
          onClick={onDuplicate}
          className="w-full h-7 text-xs"
        >
          <Copy className="h-3 w-3 mr-1" />
          Duplicate
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={onDelete}
          className="w-full h-7 text-xs"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
}
