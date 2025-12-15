/**
 * Step Navigator Component
 * Sidebar showing list of steps with status indicators
 */

'use client';

import React from 'react';
import { useFormBuilderStore } from '@/stores/form-builder-store';
import { CheckCircle2, Circle, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function StepNavigator() {
  const { steps, currentStepIndex, setCurrentStep, addStep, deleteStep } = useFormBuilderStore();

  const handleAddStep = () => {
    addStep({ title: `Step ${steps.length + 1}` });
  };

  const handleDeleteStep = (stepId: string, index: number) => {
    // Prevent deleting last step
    if (steps.length <= 1) {
      return;
    }

    if (confirm('Are you sure you want to delete this step?')) {
      deleteStep(stepId);
    }
  };

  return (
    <div className="w-64 border-r bg-background overflow-y-auto flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          Form Steps
        </h3>
      </div>

      {/* Steps List */}
      <div className="flex-1 p-4 space-y-2">
        {steps.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No steps yet. Click below to add one.
          </div>
        ) : (
          steps.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                'group relative rounded-lg border transition-all duration-200',
                currentStepIndex === index
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border hover:border-primary/50 hover:bg-accent/50'
              )}
            >
              <button
                onClick={() => setCurrentStep(index)}
                className="w-full text-left p-3"
              >
                <div className="flex items-start gap-2">
                  {/* Status Icon */}
                  <div className="mt-0.5 flex-shrink-0">
                    {step.status === 'complete' && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                    {step.status === 'incomplete' && (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    {step.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{step.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Step {index + 1} of {steps.length}
                      {step.fields?.length > 0 && ` • ${step.fields.length} fields`}
                    </div>
                  </div>
                </div>
              </button>

              {/* Delete Button (shown on hover) */}
              {steps.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteStep(step.id, index);
                  }}
                  className={cn(
                    'absolute top-2 right-2 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-opacity',
                    'opacity-0 group-hover:opacity-100'
                  )}
                  title="Delete step"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Step Button */}
      <div className="p-4 border-t">
        <Button
          onClick={handleAddStep}
          variant="outline"
          className="w-full justify-start gap-2"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Add Step
        </Button>
      </div>
    </div>
  );
}
