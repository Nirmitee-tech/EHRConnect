/**
 * Step Navigation Controls Component
 * Next/Previous buttons for navigating between steps
 */

'use client';

import React, { useEffect } from 'react';
import { useFormBuilderStore } from '@/stores/form-builder-store';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StepNavigationControls() {
  const {
    steps,
    currentStepIndex,
    setCurrentStep,
    saveProgress,
    isDirty,
    isAutoSaving,
  } = useFormBuilderStore();

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const canGoBack = !isFirstStep && currentStep?.navigationConfig.allowBack !== false;
  const canSkip = currentStep?.navigationConfig.allowSkip === true;

  const handlePrevious = () => {
    if (canGoBack) {
      setCurrentStep(currentStepIndex - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(currentStepIndex + 1);
    }
  };

  const handleSave = async () => {
    try {
      await saveProgress();
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Arrow keys for navigation
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'ArrowLeft' && canGoBack) {
          e.preventDefault();
          handlePrevious();
        } else if (e.key === 'ArrowRight' && !isLastStep) {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStepIndex, steps.length, canGoBack, isLastStep]);

  if (steps.length === 0) {
    return null;
  }

  return (
    <div className="border-t bg-background px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Previous Button */}
        <div>
          {!isFirstStep && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={!canGoBack}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {currentStep?.navigationConfig.prevButtonText || 'Previous'}
            </Button>
          )}
        </div>

        {/* Center: Save Status */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {isAutoSaving && (
            <span className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Saving...
            </span>
          )}
          {isDirty && !isAutoSaving && (
            <Button variant="ghost" size="sm" onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Save Draft
            </Button>
          )}
          {!isDirty && !isAutoSaving && (
            <span className="text-green-600 flex items-center gap-2">
              All changes saved
            </span>
          )}
        </div>

        {/* Right: Next/Skip Button */}
        <div className="flex items-center gap-2">
          {canSkip && !isLastStep && (
            <Button variant="ghost" onClick={handleNext}>
              Skip
            </Button>
          )}
          {!isLastStep && (
            <Button onClick={handleNext} className="gap-2">
              {currentStep?.navigationConfig.nextButtonText || 'Next'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          {isLastStep && (
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Finish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
