/**
 * Component Palette - Draggable Field Types
 * Library of form components that can be dragged onto steps
 */

'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import {
  Type,
  Hash,
  Calendar,
  CheckSquare,
  Circle,
  FileText,
  ToggleLeft,
  AlignLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComponentType {
  type: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const COMPONENTS: ComponentType[] = [
  {
    type: 'string',
    label: 'Short Text',
    description: 'Single line text input',
    icon: <Type className="h-4 w-4" />,
    color: 'text-blue-500',
  },
  {
    type: 'text',
    label: 'Long Text',
    description: 'Multi-line text area',
    icon: <AlignLeft className="h-4 w-4" />,
    color: 'text-blue-600',
  },
  {
    type: 'integer',
    label: 'Number',
    description: 'Whole number input',
    icon: <Hash className="h-4 w-4" />,
    color: 'text-green-500',
  },
  {
    type: 'decimal',
    label: 'Decimal',
    description: 'Decimal number input',
    icon: <Hash className="h-4 w-4" />,
    color: 'text-green-600',
  },
  {
    type: 'date',
    label: 'Date',
    description: 'Date picker',
    icon: <Calendar className="h-4 w-4" />,
    color: 'text-purple-500',
  },
  {
    type: 'dateTime',
    label: 'Date & Time',
    description: 'Date and time picker',
    icon: <Calendar className="h-4 w-4" />,
    color: 'text-purple-600',
  },
  {
    type: 'boolean',
    label: 'Yes/No',
    description: 'Boolean toggle',
    icon: <ToggleLeft className="h-4 w-4" />,
    color: 'text-orange-500',
  },
  {
    type: 'choice',
    label: 'Multiple Choice',
    description: 'Radio or dropdown',
    icon: <Circle className="h-4 w-4" />,
    color: 'text-pink-500',
  },
  {
    type: 'open-choice',
    label: 'Choice + Text',
    description: 'Choice with other option',
    icon: <Circle className="h-4 w-4" />,
    color: 'text-pink-600',
  },
  {
    type: 'display',
    label: 'Display Text',
    description: 'Read-only information',
    icon: <FileText className="h-4 w-4" />,
    color: 'text-gray-500',
  },
];

function DraggableComponent({ component }: { component: ComponentType }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${component.type}`,
    data: {
      type: 'component',
      componentType: component.type,
    },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        'cursor-grab active:cursor-grabbing touch-none',
        isDragging && 'opacity-50'
      )}
    >
      <Card className="p-3 hover:shadow-md transition-all hover:border-primary/50 group">
        <div className="flex items-start gap-3">
          <div className={cn('mt-0.5', component.color)}>{component.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm group-hover:text-primary transition-colors">
              {component.label}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {component.description}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function ComponentPalette() {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-background px-4 py-3">
        <h3 className="font-semibold text-sm">Components</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Drag to add fields
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {COMPONENTS.map((component) => (
          <DraggableComponent key={component.type} component={component} />
        ))}
      </div>

      <div className="border-t bg-muted/30 px-4 py-3">
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium">Quick Tips:</p>
          <p>• Drag components to steps</p>
          <p>• Reorder fields within steps</p>
          <p>• Move fields between steps</p>
        </div>
      </div>
    </div>
  );
}
