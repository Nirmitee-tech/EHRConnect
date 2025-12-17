/**
 * Draggable Step Card - Individual Step with Fields
 * Supports drag-to-reorder and field management
 */

'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useFormBuilderStore } from '@/stores/form-builder-store';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  GripVertical,
  Settings,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DraggableField } from './DraggableField';
import { cn } from '@/lib/utils';
import type { FormStep } from '@/types/forms';

interface DraggableStepCardProps {
  step: FormStep;
  index: number;
  isActive: boolean;
  isDragging: boolean;
  onSelect: () => void;
}

export function DraggableStepCard({
  step,
  index,
  isActive,
  isDragging,
  onSelect,
}: DraggableStepCardProps) {
  const { deleteStep } = useFormBuilderStore();
  const [isExpanded, setIsExpanded] = React.useState(true);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: step.id,
    data: {
      type: 'step',
      step,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete step "${step.title}"? This will remove all fields in this step.`)) {
      deleteStep(step.id);
    }
  };

  const fieldCount = step.fields?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex-shrink-0 w-[320px] transition-all',
        isDragging && 'opacity-50'
      )}
    >
      <Card
        onClick={onSelect}
        className={cn(
          'h-full border-2 transition-all hover:shadow-md cursor-pointer',
          isActive && 'border-primary ring-4 ring-primary/20 shadow-lg',
          !isActive && 'hover:border-primary/50'
        )}
      >
        <CardHeader className="pb-3 space-y-3">
          {/* Step Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              {/* Drag Handle */}
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing touch-none mt-1 hover:bg-muted rounded p-1"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </button>

              {/* Step Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs shrink-0">
                    Step {index + 1}
                  </Badge>
                  <h3 className="font-semibold text-sm truncate">
                    {step.title || 'Untitled Step'}
                  </h3>
                </div>
                {step.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {step.description}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
                title="Configure step"
              >
                <Settings className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Step Stats */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3 text-muted-foreground">
              <span>{fieldCount} field{fieldCount !== 1 ? 's' : ''}</span>
              {step.validationConfig.validateOnNext && (
                <Badge variant="secondary" className="text-xs">
                  Validation
                </Badge>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          </div>
        </CardHeader>

        {/* Fields List */}
        {isExpanded && (
          <CardContent className="pt-0">
            {fieldCount === 0 ? (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
                className="text-center py-8 text-xs text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20 hover:bg-muted/40 hover:border-primary/30 transition-colors cursor-pointer"
              >
                <p className="font-medium text-foreground">No fields yet</p>
                <p className="mt-2">Drag components from the left palette</p>
                <p className="mt-1">or click here to configure</p>
              </div>
            ) : (
              <SortableContext
                items={step.fields?.map((f) => f.linkId) || []}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {step.fields?.map((field) => (
                    <DraggableField
                      key={field.linkId}
                      field={field}
                      stepId={step.id}
                    />
                  ))}
                </div>
              </SortableContext>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
