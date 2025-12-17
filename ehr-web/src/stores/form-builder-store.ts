/**
 * Form Builder Zustand Store
 * Manages multi-step form builder state with localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { formsService } from '@/services/forms.service';
import type { FormStep, StepNavigationConfig, StepValidationConfig, QuestionnaireItem } from '@/types/forms';

interface FormBuilderState {
  // State
  formId: string | null;
  isMultiStep: boolean;
  steps: FormStep[];
  currentStepIndex: number;
  isDirty: boolean;
  isAutoSaving: boolean;
  sessionId: string;

  // Actions
  setFormId: (id: string) => void;
  setMultiStep: (enabled: boolean) => void;
  addStep: (step: Partial<FormStep>) => void;
  deleteStep: (stepId: string) => void;
  reorderSteps: (newOrder: string[]) => void;
  setCurrentStep: (index: number) => void;
  updateStep: (stepId: string, data: Partial<FormStep>) => void;

  // Field Management Actions
  addFieldToStep: (stepId: string, field: QuestionnaireItem) => void;
  updateField: (stepId: string, fieldLinkId: string, updates: Partial<QuestionnaireItem>) => void;
  deleteField: (stepId: string, fieldLinkId: string) => void;
  reorderFieldsInStep: (stepId: string, newOrder: string[]) => void;
  moveFieldBetweenSteps: (sourceStepId: string, targetStepId: string, fieldLinkId: string) => void;

  saveProgress: () => Promise<void>;
  loadProgress: (formId: string) => Promise<void>;
  markDirty: () => void;
  resetStore: () => void;
}

export const useFormBuilderStore = create<FormBuilderState>()(
  persist(
    (set, get) => ({
      // Initial State
      formId: null,
      isMultiStep: false,
      steps: [],
      currentStepIndex: 0,
      isDirty: false,
      isAutoSaving: false,
      sessionId: typeof crypto !== 'undefined' ? crypto.randomUUID() : `session-${Date.now()}`,

      // Set form ID
      setFormId: (id: string) => {
        set({ formId: id });
      },

      // Toggle multi-step mode
      setMultiStep: (enabled: boolean) => {
        const { formId } = get();

        // If enabling multi-step and no formId exists, generate temporary one
        if (enabled && !formId) {
          const tempId = `temp-${Date.now()}`;
          set({ formId: tempId, isMultiStep: enabled });
          console.log('Generated temporary formId:', tempId);
        } else {
          set({ isMultiStep: enabled });
        }

        // Auto-create first step if enabling multi-step mode and no steps exist
        if (enabled && get().steps.length === 0) {
          get().addStep({ title: 'Step 1', stepOrder: 0 });
        }
      },

      // Add new step
      addStep: (step: Partial<FormStep>) => {
        const { steps, formId } = get();

        if (!formId) {
          console.warn('Cannot add step without formId');
          return;
        }

        const newStep: FormStep = {
          id: typeof crypto !== 'undefined' ? crypto.randomUUID() : `step-${Date.now()}`,
          formId,
          stepOrder: step.stepOrder ?? steps.length,
          title: step.title || `Step ${steps.length + 1}`,
          description: step.description,
          fields: step.fields || [],
          navigationConfig: step.navigationConfig || {
            allowBack: true,
            allowSkip: false,
          },
          validationConfig: step.validationConfig || {
            validateOnNext: true,
            requiredFields: [],
          },
          status: 'incomplete',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set({
          steps: [...steps, newStep],
          isDirty: true
        });
      },

      // Delete step
      deleteStep: (stepId: string) => {
        const steps = get().steps.filter(s => s.id !== stepId);

        // Reorder remaining steps
        const reorderedSteps = steps.map((s, idx) => ({
          ...s,
          stepOrder: idx,
          updatedAt: new Date()
        }));

        set({
          steps: reorderedSteps,
          isDirty: true,
          // Reset current step if it was deleted
          currentStepIndex: Math.min(get().currentStepIndex, reorderedSteps.length - 1)
        });
      },

      // Reorder steps
      reorderSteps: (newOrder: string[]) => {
        const steps = get().steps;
        const reordered = newOrder.map((id, idx) => {
          const step = steps.find(s => s.id === id);
          if (!step) return null;
          return {
            ...step,
            stepOrder: idx,
            updatedAt: new Date()
          };
        }).filter((s): s is FormStep => s !== null);

        set({
          steps: reordered,
          isDirty: true
        });
      },

      // Set current step (with auto-save)
      setCurrentStep: (index: number) => {
        const { steps, isDirty, saveProgress } = get();

        // Validate index
        if (index < 0 || index >= steps.length) {
          console.warn('Invalid step index:', index);
          return;
        }

        // Auto-save before switching if dirty
        if (isDirty) {
          saveProgress().catch(err => {
            console.error('Failed to auto-save before step switch:', err);
          });
        }

        set({ currentStepIndex: index });
      },

      // Update step data
      updateStep: (stepId: string, data: Partial<FormStep>) => {
        const steps = get().steps.map(s =>
          s.id === stepId
            ? {
                ...s,
                ...data,
                updatedAt: new Date()
              }
            : s
        );

        set({
          steps,
          isDirty: true
        });
      },

      // Save progress to backend
      saveProgress: async () => {
        const { formId, currentStepIndex, steps, sessionId } = get();

        if (!formId) {
          console.warn('Cannot save progress without formId');
          return;
        }

        set({ isAutoSaving: true });

        try {
          const currentStep = steps[currentStepIndex];

          await formsService.saveProgress(formId, {
            currentStep: currentStepIndex,
            stepData: currentStep?.fields || {},
            sessionId,
          });

          set({ isDirty: false });
        } catch (error) {
          console.error('Failed to save progress:', error);
          throw error;
        } finally {
          set({ isAutoSaving: false });
        }
      },

      // Load progress from backend
      loadProgress: async (formId: string) => {
        const { sessionId } = get();

        try {
          const progress = await formsService.getProgress(formId, sessionId);

          if (progress) {
            set({
              currentStepIndex: progress.currentStep,
              formId: progress.formId
            });
          }
        } catch (error) {
          console.error('Failed to load progress:', error);
        }
      },

      // Mark as dirty (unsaved changes)
      markDirty: () => {
        set({ isDirty: true });
      },

      // Add field to step
      addFieldToStep: (stepId: string, field: QuestionnaireItem) => {
        const steps = get().steps.map(s =>
          s.id === stepId
            ? {
                ...s,
                fields: [...(s.fields || []), field],
                updatedAt: new Date()
              }
            : s
        );

        set({
          steps,
          isDirty: true
        });
      },

      // Update field in step
      updateField: (stepId: string, fieldLinkId: string, updates: Partial<QuestionnaireItem>) => {
        const steps = get().steps.map(s =>
          s.id === stepId
            ? {
                ...s,
                fields: s.fields?.map(f =>
                  f.linkId === fieldLinkId
                    ? { ...f, ...updates }
                    : f
                ) || [],
                updatedAt: new Date()
              }
            : s
        );

        set({
          steps,
          isDirty: true
        });
      },

      // Delete field from step
      deleteField: (stepId: string, fieldLinkId: string) => {
        const steps = get().steps.map(s =>
          s.id === stepId
            ? {
                ...s,
                fields: s.fields?.filter(f => f.linkId !== fieldLinkId) || [],
                updatedAt: new Date()
              }
            : s
        );

        set({
          steps,
          isDirty: true
        });
      },

      // Reorder fields within a step
      reorderFieldsInStep: (stepId: string, newOrder: string[]) => {
        const steps = get().steps.map(s => {
          if (s.id !== stepId) return s;

          const fields = s.fields || [];
          const reordered = newOrder
            .map(linkId => fields.find(f => f.linkId === linkId))
            .filter((f): f is QuestionnaireItem => f !== undefined);

          return {
            ...s,
            fields: reordered,
            updatedAt: new Date()
          };
        });

        set({
          steps,
          isDirty: true
        });
      },

      // Move field between steps
      moveFieldBetweenSteps: (sourceStepId: string, targetStepId: string, fieldLinkId: string) => {
        const steps = get().steps;
        const sourceStep = steps.find(s => s.id === sourceStepId);
        const field = sourceStep?.fields?.find(f => f.linkId === fieldLinkId);

        if (!field) {
          console.warn('Field not found:', fieldLinkId);
          return;
        }

        // Remove from source step and add to target step
        const updatedSteps = steps.map(s => {
          if (s.id === sourceStepId) {
            return {
              ...s,
              fields: s.fields?.filter(f => f.linkId !== fieldLinkId) || [],
              updatedAt: new Date()
            };
          }
          if (s.id === targetStepId) {
            return {
              ...s,
              fields: [...(s.fields || []), field],
              updatedAt: new Date()
            };
          }
          return s;
        });

        set({
          steps: updatedSteps,
          isDirty: true
        });
      },

      // Reset store to initial state
      resetStore: () => {
        set({
          formId: null,
          isMultiStep: false,
          steps: [],
          currentStepIndex: 0,
          isDirty: false,
          isAutoSaving: false,
          sessionId: typeof crypto !== 'undefined' ? crypto.randomUUID() : `session-${Date.now()}`,
        });
      },
    }),
    {
      name: 'form-builder-storage',
      // Only persist essential data to localStorage
      partialize: (state) => ({
        formId: state.formId,
        steps: state.steps,
        currentStepIndex: state.currentStepIndex,
        sessionId: state.sessionId,
        isMultiStep: state.isMultiStep,
      }),
    }
  )
);
