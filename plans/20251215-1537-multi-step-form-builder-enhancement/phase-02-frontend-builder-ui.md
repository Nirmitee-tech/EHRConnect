# Phase 2: Frontend Form Builder UI

**Date**: 2025-12-15
**Phase**: 2 of 5
**Priority**: High
**Status**: ✅ COMPLETE
**Completion Date**: 2025-12-15
**Duration**: ~6 hours (Implementation) + 4-6 hours (Fixes)
**Review Date**: 2025-12-15
**Review Report**: [251215-from-code-reviewer-phase-02-review.md](./reports/251215-from-code-reviewer-phase-02-review.md)

---

## Parallelization Info

**Can Run With**: Phase 1 (Backend), Phase 3 (Preview - different components)
**Must Wait For**: None (can start immediately, API contracts known)
**Blocks**: Phase 5 (testing needs UI complete)
**Conflicts**: None - exclusive builder page/component ownership

---

## Context Links

**Research**:
- [researcher-01-multi-step-forms.md](./research/researcher-01-multi-step-forms.md) (Navigation patterns, UX principles)
- [code-standards.md](../../docs/code-standards.md) (React component standards)

**Existing Code**:
- ehr-web/src/app/forms/builder/[[...id]]/page.tsx (2078 lines - modify wizard UI)
- ehr-web/src/features/forms/components/form-renderer (existing renderer)
- ehr-web/src/types/forms.ts (573 lines - add step types)
- ehr-web/src/services/forms.service.ts (add step API methods)

---

## Overview

Transform existing single-page form builder into multi-step wizard interface with step navigation, progress tracking, screen editor, and state persistence. Maintain FHIR Questionnaire structure.

---

## Key Insights from Research

1. **Progress indicators**: Show step X of Y improves engagement by 25%
2. **Field limits**: 5-6 fields per screen optimal (tested threshold)
3. **Navigation**: Clear "Next"/"Previous"/"Save & Continue" CTAs
4. **Mobile-responsive**: Single column layout below 768px
5. **Validation timing**: Validate on "Next" not real-time (reduces friction)
6. **State management**: localStorage for recovery, API for persistence

---

## Requirements

### Wizard Navigation
- [ ] Step list sidebar (collapsible on mobile)
- [ ] Progress bar (linear indicator)
- [ ] Next/Previous buttons with keyboard shortcuts
- [ ] Step status indicators (incomplete/complete/error)
- [ ] "Save & Continue Later" button
- [ ] "Save Draft" auto-save (30s debounce)

### Step Editor
- [ ] Add/delete/reorder steps (drag-drop)
- [ ] Step title and description editor
- [ ] Field assignment to steps (drag from palette)
- [ ] Step navigation config (allow back, allow skip)
- [ ] Step validation rules (required fields)
- [ ] Preview current step button

### Builder UI Layout
- [ ] Three-column layout: Palette | Canvas (Steps) | Properties
- [ ] Step navigation mode toggle (wizard vs single-page)
- [ ] Collapsible sections for mobile (<768px)
- [ ] Context-aware toolbar (step-level actions)

### State Management
- [ ] Zustand store for builder state
- [ ] localStorage auto-save draft
- [ ] API auto-save on step change
- [ ] Resume from saved progress
- [ ] Dirty state tracking (unsaved changes)

---

## Architecture

### State Management (Zustand)
```typescript
// ehr-web/src/stores/form-builder-store.ts
interface FormBuilderState {
  formId: string | null;
  isMultiStep: boolean;
  steps: FormStep[];
  currentStepIndex: number;
  isDirty: boolean;

  // Actions
  addStep: (step: FormStep) => void;
  deleteStep: (stepId: string) => void;
  reorderSteps: (stepOrder: string[]) => void;
  setCurrentStep: (index: number) => void;
  updateStep: (stepId: string, data: Partial<FormStep>) => void;
  saveProgress: () => Promise<void>;
  loadProgress: (formId: string) => Promise<void>;
}

const useFormBuilderStore = create<FormBuilderState>((set, get) => ({
  // Implementation
}));
```

### Component Hierarchy
```
FormBuilderPage (page.tsx)
├── BuilderHeader (mode toggle, save actions)
├── BuilderLayout
│   ├── ComponentPalette (left)
│   ├── WizardCanvas (center)
│   │   ├── StepNavigator (sidebar)
│   │   ├── StepEditor (current step)
│   │   └── StepNavigation (next/prev buttons)
│   └── PropertiesPanel (right)
└── BuilderFooter (progress, auto-save indicator)
```

### Type Definitions
```typescript
// ehr-web/src/types/forms.ts - Add to end
interface FormStep {
  id: string;
  stepOrder: number;
  title: string;
  description?: string;
  fields: QuestionnaireItem[]; // FHIR items
  navigationConfig: StepNavigationConfig;
  validationConfig: StepValidationConfig;
  status: 'incomplete' | 'complete' | 'error';
}

interface StepNavigationConfig {
  allowBack: boolean;
  allowSkip: boolean;
  conditionalNext?: string; // Rule ID for conditional routing
}

interface StepValidationConfig {
  validateOnNext: boolean;
  requiredFields: string[]; // linkId[]
  customValidation?: ValidationRule[];
}

interface FormProgress {
  formId: string;
  userId: string;
  currentStep: number;
  stepData: Record<string, any>;
  lastSavedAt: Date;
  sessionId: string;
}
```

---

## Related Code Files (Exclusive to Phase 2)

**Frontend Files - Phase 2 Ownership**:
- `ehr-web/src/app/forms/builder/[[...id]]/page.tsx` (MODIFY - wizard layout)
- `ehr-web/src/components/forms/StepNavigator.tsx` (NEW)
- `ehr-web/src/components/forms/StepEditor.tsx` (NEW)
- `ehr-web/src/components/forms/WizardProgress.tsx` (NEW)
- `ehr-web/src/components/forms/StepNavigationControls.tsx` (NEW)
- `ehr-web/src/stores/form-builder-store.ts` (NEW)
- `ehr-web/src/services/forms.service.ts` (MODIFY - add step methods lines 200-350)
- `ehr-web/src/types/forms.ts` (MODIFY - add step types lines 574-650)
- `ehr-web/src/hooks/use-form-builder.ts` (NEW)

**No Other Phase Touches These Files**

---

## Implementation Steps

### Step 1: Type Definitions (30 mins)
```typescript
// ehr-web/src/types/forms.ts - Add to end

export interface FormStep {
  id: string;
  formId: string;
  stepOrder: number;
  title: string;
  description?: string;
  fields: QuestionnaireItem[];
  navigationConfig: StepNavigationConfig;
  validationConfig: StepValidationConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface StepNavigationConfig {
  allowBack: boolean;
  allowSkip: boolean;
  nextButtonText?: string;
  prevButtonText?: string;
  conditionalNext?: string;
}

export interface StepValidationConfig {
  validateOnNext: boolean;
  requiredFields: string[];
  customValidation?: ValidationRule[];
}

export interface FormProgress {
  id: string;
  formId: string;
  userId: string;
  orgId: string;
  currentStep: number;
  stepData: Record<string, any>;
  lastSavedAt: Date;
  sessionId: string;
  isCompleted: boolean;
}
```

### Step 2: API Service Methods (1 hour)
```typescript
// ehr-web/src/services/forms.service.ts - Add methods

/**
 * Multi-step form API methods
 */

async createStep(formId: string, stepData: Partial<FormStep>): Promise<FormStep> {
  const response = await apiClient.post(`/forms/${formId}/steps`, stepData);
  return response.data;
}

async getSteps(formId: string): Promise<FormStep[]> {
  const response = await apiClient.get(`/forms/${formId}/steps`);
  return response.data;
}

async updateStep(formId: string, stepId: string, data: Partial<FormStep>): Promise<FormStep> {
  const response = await apiClient.put(`/forms/${formId}/steps/${stepId}`, data);
  return response.data;
}

async deleteStep(formId: string, stepId: string): Promise<void> {
  await apiClient.delete(`/forms/${formId}/steps/${stepId}`);
}

async reorderSteps(formId: string, stepOrder: string[]): Promise<void> {
  await apiClient.put(`/forms/${formId}/steps/reorder`, { stepOrder });
}

async saveProgress(formId: string, progressData: Partial<FormProgress>): Promise<FormProgress> {
  const response = await apiClient.post(`/forms/${formId}/progress`, progressData);
  return response.data;
}

async getProgress(formId: string, sessionId: string): Promise<FormProgress | null> {
  const response = await apiClient.get(`/forms/${formId}/progress`, {
    params: { sessionId }
  });
  return response.data;
}
```

### Step 3: Zustand Store (1 hour)
```typescript
// ehr-web/src/stores/form-builder-store.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { formsService } from '@/services/forms.service';

interface FormBuilderState {
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
  saveProgress: () => Promise<void>;
  loadProgress: (formId: string) => Promise<void>;
  markDirty: () => void;
  resetStore: () => void;
}

export const useFormBuilderStore = create<FormBuilderState>()(
  persist(
    (set, get) => ({
      formId: null,
      isMultiStep: false,
      steps: [],
      currentStepIndex: 0,
      isDirty: false,
      isAutoSaving: false,
      sessionId: crypto.randomUUID(),

      setFormId: (id) => set({ formId: id }),

      setMultiStep: (enabled) => {
        set({ isMultiStep: enabled });
        if (enabled && get().steps.length === 0) {
          get().addStep({ title: 'Step 1', stepOrder: 0 });
        }
      },

      addStep: (step) => {
        const steps = get().steps;
        const newStep: FormStep = {
          id: crypto.randomUUID(),
          formId: get().formId!,
          stepOrder: steps.length,
          title: step.title || `Step ${steps.length + 1}`,
          description: step.description,
          fields: step.fields || [],
          navigationConfig: step.navigationConfig || {
            allowBack: true,
            allowSkip: false
          },
          validationConfig: step.validationConfig || {
            validateOnNext: true,
            requiredFields: []
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };

        set({ steps: [...steps, newStep], isDirty: true });
      },

      deleteStep: (stepId) => {
        const steps = get().steps.filter(s => s.id !== stepId);
        // Reorder remaining steps
        const reorderedSteps = steps.map((s, idx) => ({ ...s, stepOrder: idx }));
        set({ steps: reorderedSteps, isDirty: true });
      },

      reorderSteps: (newOrder) => {
        const steps = get().steps;
        const reordered = newOrder.map((id, idx) => {
          const step = steps.find(s => s.id === id);
          return { ...step!, stepOrder: idx };
        });
        set({ steps: reordered, isDirty: true });
      },

      setCurrentStep: (index) => {
        // Auto-save before switching
        if (get().isDirty) {
          get().saveProgress();
        }
        set({ currentStepIndex: index });
      },

      updateStep: (stepId, data) => {
        const steps = get().steps.map(s =>
          s.id === stepId ? { ...s, ...data, updatedAt: new Date() } : s
        );
        set({ steps, isDirty: true });
      },

      saveProgress: async () => {
        const { formId, currentStepIndex, steps, sessionId } = get();
        if (!formId) return;

        set({ isAutoSaving: true });

        try {
          await formsService.saveProgress(formId, {
            currentStep: currentStepIndex,
            stepData: steps[currentStepIndex]?.fields || {},
            sessionId
          });
          set({ isDirty: false });
        } catch (error) {
          console.error('Failed to save progress:', error);
        } finally {
          set({ isAutoSaving: false });
        }
      },

      loadProgress: async (formId) => {
        const { sessionId } = get();
        try {
          const progress = await formsService.getProgress(formId, sessionId);
          if (progress) {
            set({ currentStepIndex: progress.currentStep });
          }
        } catch (error) {
          console.error('Failed to load progress:', error);
        }
      },

      markDirty: () => set({ isDirty: true }),

      resetStore: () => set({
        formId: null,
        isMultiStep: false,
        steps: [],
        currentStepIndex: 0,
        isDirty: false,
        sessionId: crypto.randomUUID()
      })
    }),
    {
      name: 'form-builder-storage',
      partialize: (state) => ({
        formId: state.formId,
        steps: state.steps,
        currentStepIndex: state.currentStepIndex,
        sessionId: state.sessionId
      })
    }
  )
);
```

### Step 4: Step Navigator Component (1 hour)
```typescript
// ehr-web/src/components/forms/StepNavigator.tsx

'use client';

import { useFormBuilderStore } from '@/stores/form-builder-store';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

export function StepNavigator() {
  const { steps, currentStepIndex, setCurrentStep } = useFormBuilderStore();

  return (
    <div className="w-64 border-r bg-background p-4 overflow-y-auto">
      <div className="space-y-2">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => setCurrentStep(index)}
            className={`
              w-full text-left p-3 rounded-lg border transition-colors
              ${currentStepIndex === index
                ? 'border-primary bg-primary/10'
                : 'border-border hover:bg-accent'
              }
            `}
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5">
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
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{step.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Step {index + 1} of {steps.length}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => {
          const newStep = { title: `Step ${steps.length + 1}` };
          useFormBuilderStore.getState().addStep(newStep);
        }}
        className="w-full mt-4 p-2 border-2 border-dashed border-border rounded-lg
          hover:bg-accent transition-colors text-sm font-medium"
      >
        + Add Step
      </button>
    </div>
  );
}
```

### Step 5: Step Editor Component (1.5 hours)
```typescript
// ehr-web/src/components/forms/StepEditor.tsx

'use client';

import { useFormBuilderStore } from '@/stores/form-builder-store';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function StepEditor() {
  const { steps, currentStepIndex, updateStep } = useFormBuilderStore();
  const currentStep = steps[currentStepIndex];

  if (!currentStep) {
    return <div className="p-8 text-center text-muted-foreground">No step selected</div>;
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Step Header */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="step-title">Step Title</Label>
            <Input
              id="step-title"
              value={currentStep.title}
              onChange={(e) => updateStep(currentStep.id, { title: e.target.value })}
              placeholder="Enter step title..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="step-description">Description (Optional)</Label>
            <Textarea
              id="step-description"
              value={currentStep.description || ''}
              onChange={(e) => updateStep(currentStep.id, { description: e.target.value })}
              placeholder="Provide instructions or context..."
              className="mt-1"
              rows={2}
            />
          </div>
        </div>

        {/* Navigation Settings */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold">Navigation Settings</h3>

          <div className="flex items-center justify-between">
            <Label htmlFor="allow-back">Allow Back Navigation</Label>
            <Switch
              id="allow-back"
              checked={currentStep.navigationConfig.allowBack}
              onCheckedChange={(checked) =>
                updateStep(currentStep.id, {
                  navigationConfig: { ...currentStep.navigationConfig, allowBack: checked }
                })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="allow-skip">Allow Skip Step</Label>
            <Switch
              id="allow-skip"
              checked={currentStep.navigationConfig.allowSkip}
              onCheckedChange={(checked) =>
                updateStep(currentStep.id, {
                  navigationConfig: { ...currentStep.navigationConfig, allowSkip: checked }
                })
              }
            />
          </div>
        </div>

        {/* Validation Settings */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="font-semibold">Validation Settings</h3>

          <div className="flex items-center justify-between">
            <Label htmlFor="validate-on-next">Validate on Next</Label>
            <Switch
              id="validate-on-next"
              checked={currentStep.validationConfig.validateOnNext}
              onCheckedChange={(checked) =>
                updateStep(currentStep.id, {
                  validationConfig: { ...currentStep.validationConfig, validateOnNext: checked }
                })
              }
            />
          </div>
        </div>

        {/* Fields Section */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Form Fields</h3>
          <div className="text-sm text-muted-foreground">
            Drag fields from the palette to add them to this step
          </div>
          {/* Field list will be rendered here */}
        </div>
      </div>
    </div>
  );
}
```

### Step 6: Wizard Progress Component (30 mins)
```typescript
// ehr-web/src/components/forms/WizardProgress.tsx

'use client';

import { useFormBuilderStore } from '@/stores/form-builder-store';
import { Progress } from '@/components/ui/progress';

export function WizardProgress() {
  const { steps, currentStepIndex } = useFormBuilderStore();
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="border-b bg-background p-4">
      <div className="max-w-3xl mx-auto space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {currentStepIndex + 1} of {steps.length}
          </span>
          <span className="text-muted-foreground">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
}
```

### Step 7: Update Builder Page (1.5 hours)
```typescript
// ehr-web/src/app/forms/builder/[[...id]]/page.tsx - Modify layout

'use client';

import { useEffect } from 'react';
import { useFormBuilderStore } from '@/stores/form-builder-store';
import { StepNavigator } from '@/components/forms/StepNavigator';
import { StepEditor } from '@/components/forms/StepEditor';
import { WizardProgress } from '@/components/forms/WizardProgress';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function FormBuilderPage({ params }: { params: { id?: string[] } }) {
  const formId = params.id?.[0];
  const {
    isMultiStep,
    setMultiStep,
    setFormId,
    loadProgress,
    saveProgress,
    isDirty,
    isAutoSaving
  } = useFormBuilderStore();

  useEffect(() => {
    if (formId) {
      setFormId(formId);
      loadProgress(formId);
    }
  }, [formId]);

  // Auto-save on interval
  useEffect(() => {
    if (!isDirty) return;

    const timer = setTimeout(() => {
      saveProgress();
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [isDirty]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="border-b p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Form Builder</h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="multi-step-toggle">Multi-Step Mode</Label>
            <Switch
              id="multi-step-toggle"
              checked={isMultiStep}
              onCheckedChange={setMultiStep}
            />
          </div>

          <Button variant="outline" onClick={() => saveProgress()} disabled={!isDirty}>
            {isAutoSaving ? 'Saving...' : 'Save Draft'}
          </Button>

          <Button>Publish</Button>
        </div>
      </header>

      {/* Progress Bar (if multi-step) */}
      {isMultiStep && <WizardProgress />}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {isMultiStep ? (
          <>
            <StepNavigator />
            <StepEditor />
          </>
        ) : (
          <div className="flex-1 p-6">
            {/* Existing single-page builder */}
            <div>Single-page form builder (existing code)</div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Todo List

**Implementation (14/14 Complete - ALL DONE)**:
- [x] Add type definitions to `types/forms.ts`
- [x] Add API methods to `forms.service.ts`
- [x] Create Zustand store `form-builder-store.ts`
- [x] Create `StepNavigator` component
- [x] Create `StepEditor` component
- [x] Create `WizardProgress` component
- [x] Create `StepNavigationControls` component
- [x] Update builder page with multi-step layout
- [x] Add keyboard shortcuts (Ctrl+→ next, Ctrl+← prev)
- [x] Implement drag-drop step reordering
- [x] Add step validation before navigation
- [x] Test auto-save functionality
- [x] Test localStorage recovery
- [x] Mobile responsive testing (<768px)

**Critical Fixes Required (Before Merge) - ALL COMPLETE**:
- [x] Fix localStorage overflow - remove `steps` from persistence
- [x] Fix auto-save race condition - await save before navigation
- [x] Add input sanitization with DOMPurify
- [x] Replace native confirm() with AlertDialog component
- [x] Fix useEffect missing dependencies in keyboard shortcuts
- [x] Fix type mismatch in saveProgress (stepData format)

**High Priority Fixes - ALL COMPLETE**:
- [x] Add proper error handling with user feedback (toasts)
- [x] Add loading states to all async operations
- [x] Remove console.log statements for production
- [x] Add ARIA labels for accessibility
- [x] Implement max step limit (15 steps)
- [x] Add unit tests for store actions

---

## Success Criteria - ALL MET

- [x] Toggle between single-page and multi-step modes
- [x] Add/delete/reorder steps via UI
- [x] Navigate between steps with next/prev buttons
- [x] Progress bar updates correctly
- [x] Auto-save triggers every 30s when dirty
- [x] localStorage recovers state on refresh
- [x] Step validation prevents navigation with errors
- [x] Mobile layout collapses sidebar

---

## Conflict Prevention

**How Avoid Conflicts with Parallel Phases**:

1. **Phase 1 (Backend)**: Runs in parallel. This phase consumes API contracts defined there. No backend file overlap.
2. **Phase 3 (Preview)**: Runs in parallel. Preview components in separate files. No shared component files.
3. **Phase 4 (Rule Builder)**: Different component files (`StepRuleBuilder.tsx` vs `StepEditor.tsx`). Service methods in different sections.

**File Boundaries**:
- Phase 2 owns: Builder page, Step* components, form-builder-store.ts
- Phase 3 owns: Preview* components, preview service
- Phase 4 owns: Rule* components, rule builder methods

---

## Risk Assessment

**Risk**: Auto-save floods API with requests
**Mitigation**: 30s debounce, only save when isDirty, rate limit backend

**Risk**: localStorage quota exceeded (large forms)
**Mitigation**: Persist only essential state (formId, currentStep, sessionId), not full field data

**Risk**: Step navigation breaks with unsaved changes
**Mitigation**: Prompt user before navigation if isDirty, auto-save on step change

**Risk**: Mobile UX poor with three-column layout
**Mitigation**: Collapsible sidebar, responsive breakpoints, mobile-first testing

---

## Security Considerations

**Review Findings**:
- [ ] ⚠️ **XSS Risk**: Native confirm() vulnerable to XSS in step titles - Replace with AlertDialog
- [ ] ⚠️ **No Input Sanitization**: Step titles/descriptions not sanitized - Add DOMPurify
- [ ] ⚠️ **localStorage Overflow**: Full steps array persisted, can exceed quota - Remove from persistence
- [ ] ⚠️ **Race Condition**: Auto-save doesn't await before navigation - Fix async flow
- [ ] Validate sessionId format (UUID) - OK (uses crypto.randomUUID())
- [ ] Check form ownership before loading progress (backend responsibility)
- [ ] Rate limit auto-save endpoint (backend Phase 1)
- [ ] Encrypt localStorage data (optional - deferred)

---

## Next Steps

1. Deploy after Phase 1 backend changes live
2. Feature flag: `ENABLE_MULTI_STEP_FORMS=true` in ehr-web
3. Beta test with internal users
4. Phase 3 preview system integrates with this UI
5. Phase 4 rule builder adds conditional navigation

---

## Dependencies

**External**:
- Zustand 5.0 (already installed)
- Tailwind CSS 4 (already configured)
- Radix UI components (already installed)

**Internal**:
- Phase 1 backend API endpoints (can start in parallel, contracts known)
- Existing form builder component library
- FHIR types (existing)

---

## Unresolved Questions

1. Max steps recommended (10? 15?)?
2. Support nested sub-steps (steps within steps)?
3. Show field count per step in navigator?
4. Support step branching preview (flowchart view)?
