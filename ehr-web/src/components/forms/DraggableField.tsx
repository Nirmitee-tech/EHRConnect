/**
 * Draggable Field - Individual Form Field within Step
 * Supports drag-to-reorder within and across steps
 */

'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useFormBuilderStore } from '@/stores/form-builder-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GripVertical,
  Type,
  Hash,
  Calendar,
  CheckSquare,
  Circle,
  List,
  FileText,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraggableFieldProps {
  field: any;
  stepId: string;
}

const FIELD_ICONS: Record<string, React.ReactNode> = {
  string: <Type className="h-3.5 w-3.5" />,
  text: <FileText className="h-3.5 w-3.5" />,
  integer: <Hash className="h-3.5 w-3.5" />,
  decimal: <Hash className="h-3.5 w-3.5" />,
  date: <Calendar className="h-3.5 w-3.5" />,
  dateTime: <Calendar className="h-3.5 w-3.5" />,
  boolean: <CheckSquare className="h-3.5 w-3.5" />,
  choice: <Circle className="h-3.5 w-3.5" />,
  'open-choice': <Circle className="h-3.5 w-3.5" />,
  display: <List className="h-3.5 w-3.5" />,
};

const FIELD_TYPE_LABELS: Record<string, string> = {
  string: 'Short Text',
  text: 'Long Text',
  integer: 'Number',
  decimal: 'Decimal',
  date: 'Date',
  dateTime: 'Date & Time',
  boolean: 'Yes/No',
  choice: 'Multiple Choice',
  'open-choice': 'Choice + Text',
  display: 'Display Text',
};

export function DraggableField({ field, stepId }: DraggableFieldProps) {
  const { updateStep, steps } = useFormBuilderStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.linkId,
    data: {
      type: 'field',
      field,
      stepId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;

    if (confirm(`Delete field "${field.text || field.linkId}"?`)) {
      const newFields = step.fields?.filter((f) => f.linkId !== field.linkId) || [];
      updateStep(stepId, { fields: newFields });
    }
  };

  const icon = FIELD_ICONS[field.type] || <Type className="h-3.5 w-3.5" />;
  const typeLabel = FIELD_TYPE_LABELS[field.type] || field.type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative bg-background border rounded-lg transition-all hover:shadow-sm',
        isDragging && 'opacity-50'
      )}
    >
      <div className="flex items-center gap-2 p-2.5">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none hover:bg-muted rounded p-1 transition-colors"
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        {/* Field Icon */}
        <div className="flex-shrink-0 text-muted-foreground">{icon}</div>

        {/* Field Info */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">
            {field.text || field.linkId}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="secondary" className="text-xs">
              {typeLabel}
            </Badge>
            {field.required && (
              <span className="text-xs text-destructive font-medium">*</span>
            )}
          </div>
        </div>

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
