/**
 * Step Swimlane - Horizontal Step Cards with Drag & Drop
 * Visual overview of all form steps with inline field management
 */

'use client';

import React from 'react';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useFormBuilderStore } from '@/stores/form-builder-store';
import { DraggableStepCard } from './DraggableStepCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface StepSwimlaneProps {
  draggedItem: { type: string; id: string } | null;
  onStepSelect: (stepId: string) => void;
}

export function StepSwimlane({ draggedItem, onStepSelect }: StepSwimlaneProps) {
  const { steps, currentStepIndex, addStep } = useFormBuilderStore();

  const handleAddStep = () => {
    const newStepId = `step_${Date.now()}`;
    const newStep = {
      id: newStepId,
      title: `Step ${steps.length + 1}`,
      description: '',
      order: steps.length,
      fields: [],
      navigationConfig: {
        allowBack: true,
        allowSkip: false,
      },
      validationConfig: {
        validateOnNext: true,
        requiredFields: [],
      },
    };

    addStep(newStep);

    // Auto-select the new step so user can configure it immediately
    setTimeout(() => {
      onStepSelect(newStepId);
    }, 50);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Swimlane Header */}
      <div className="border-b bg-muted/20 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-medium text-sm">Form Steps</h3>
          <div className="text-xs text-muted-foreground">
            Drag to reorder • Click to configure
          </div>
        </div>

        <Button size="sm" onClick={handleAddStep} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Step
        </Button>
      </div>

      {/* Horizontal Step Cards */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        {steps.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-muted-foreground text-sm">
                No steps yet
              </div>
              <Button onClick={handleAddStep} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Step
              </Button>
            </div>
          </div>
        ) : (
          <SortableContext
            items={steps.map((s) => s.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-6 pb-4 min-h-full">
              {steps.map((step, index) => (
                <DraggableStepCard
                  key={step.id}
                  step={step}
                  index={index}
                  isActive={index === currentStepIndex}
                  isDragging={draggedItem?.id === step.id}
                  onSelect={() => onStepSelect(step.id)}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
}
