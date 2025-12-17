/**
 * Wizard Progress Component
 * Shows progress bar and current step information
 */

'use client';

import React from 'react';
import { useFormBuilderStore } from '@/stores/form-builder-store';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WizardProgress() {
  const { steps, currentStepIndex } = useFormBuilderStore();

  if (steps.length === 0) {
    return null;
  }

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  const completedSteps = steps.filter(s => s.status === 'complete').length;

  return (
    <div className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Step Info */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium">
              Step {currentStepIndex + 1} of {steps.length}
            </div>
            {currentStep && (
              <>
                <span className="text-muted-foreground">•</span>
                <div className="text-sm text-muted-foreground font-medium">
                  {currentStep.title}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {completedSteps > 0 && (
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>
                  {completedSteps} of {steps.length} completed
                </span>
              </div>
            )}
            <span>•</span>
            <span className="font-medium text-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="h-2" />

        {/* Step Indicators (optional - shows dots for each step) */}
        <div className="flex items-center justify-between mt-3">
          {steps.map((step, index) => (
            <div key={step.id} className="flex-1 flex items-center">
              {/* Dot */}
              <div
                className={cn(
                  'w-3 h-3 rounded-full transition-all duration-200',
                  index === currentStepIndex
                    ? 'bg-primary scale-125'
                    : step.status === 'complete'
                    ? 'bg-green-600'
                    : step.status === 'error'
                    ? 'bg-destructive'
                    : 'bg-muted-foreground/30'
                )}
              />
              {/* Line (except for last step) */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-1 transition-colors duration-200',
                    index < currentStepIndex ? 'bg-primary' : 'bg-muted-foreground/30'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
