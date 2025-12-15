# Phase 5: Testing & Documentation

**Date**: 2025-12-15
**Phase**: 5 of 5
**Priority**: High (Quality Gate)
**Status**: Pending
**Duration**: ~3 hours

---

## Parallelization Info

**Can Run With**: None (integration & validation phase)
**Must Wait For**: Phases 1-4 code complete
**Blocks**: Production deployment
**Conflicts**: None (test files only)

---

## Context Links

**Code Standards**:
- [code-standards.md](../../docs/code-standards.md) (Testing standards)

**Existing Tests**:
- ehr-api/src/**/*.test.js (backend tests)
- ehr-web/src/**/*.test.tsx (frontend tests)

---

## Overview

Comprehensive testing suite for multi-step form builder: unit tests, integration tests, E2E flows, performance testing, and documentation. Ensure all phases integrate correctly.

---

## Requirements

### Backend Testing
- [ ] Unit tests for forms.service.js step methods
- [ ] Unit tests for rule-engine.service.js step rules
- [ ] Integration tests for multi-step API endpoints
- [ ] Database migration testing (up/down)
- [ ] Auto-save endpoint load testing

### Frontend Testing
- [ ] Unit tests for Zustand stores
- [ ] Component tests for Step* components
- [ ] Component tests for Preview* components
- [ ] Component tests for Rule* components
- [ ] Integration tests for builder workflows

### E2E Testing
- [ ] Create multi-step form workflow
- [ ] Navigate through wizard steps
- [ ] Auto-save and recovery flow
- [ ] Preview device switching
- [ ] Rule evaluation and skip logic
- [ ] Test mode form filling

### Performance Testing
- [ ] Large form rendering (50+ fields)
- [ ] Auto-save frequency under load
- [ ] Preview sync latency
- [ ] Rule evaluation performance

### Documentation
- [ ] Multi-step form user guide
- [ ] API endpoint documentation
- [ ] Component usage guide
- [ ] Migration guide (single → multi-step)
- [ ] Troubleshooting guide

---

## Architecture

### Test Structure
```
ehr-api/src/
├── services/
│   ├── forms.service.test.js (NEW - step methods)
│   └── rule-engine.service.test.js (NEW - step rules)
├── routes/
│   └── forms.test.js (EXTEND - step endpoints)

ehr-web/src/
├── stores/
│   ├── form-builder-store.test.ts (NEW)
│   └── preview-store.test.ts (NEW)
├── components/forms/
│   ├── StepNavigator.test.tsx (NEW)
│   ├── StepEditor.test.tsx (NEW)
│   ├── PreviewPanel.test.tsx (NEW)
│   └── ...
└── __e2e__/
    └── multi-step-form.spec.ts (NEW)
```

---

## Related Code Files (Exclusive to Phase 5)

**Test Files - Phase 5 Ownership**:
- `ehr-api/src/services/forms.service.test.js` (NEW)
- `ehr-api/src/services/rule-engine.service.test.js` (NEW)
- `ehr-api/src/routes/forms.test.js` (EXTEND)
- `ehr-web/src/stores/form-builder-store.test.ts` (NEW)
- `ehr-web/src/stores/preview-store.test.ts` (NEW)
- `ehr-web/src/components/forms/StepNavigator.test.tsx` (NEW)
- `ehr-web/src/components/forms/StepEditor.test.tsx` (NEW)
- `ehr-web/src/components/forms/preview/PreviewPanel.test.tsx` (NEW)
- `ehr-web/src/components/rules/StepRuleBuilder.test.tsx` (NEW)
- `ehr-web/src/__e2e__/multi-step-form.spec.ts` (NEW - if E2E configured)

**Documentation Files - Phase 5 Ownership**:
- `docs/features/multi-step-forms-guide.md` (NEW)
- `docs/api/forms-api-reference.md` (UPDATE)
- `docs/migration/single-to-multi-step.md` (NEW)

**No Other Phase Touches These Files**

---

## Implementation Steps

### Step 1: Backend Unit Tests (1 hour)
```javascript
// ehr-api/src/services/forms.service.test.js

const formsService = require('./forms.service');
const db = require('../database/connection');

describe('FormsService - Multi-Step', () => {
  describe('createStep', () => {
    it('should create step with valid data', async () => {
      const formId = 'test-form-id';
      const stepData = {
        step_order: 0,
        title: 'Step 1',
        fields: []
      };

      const step = await formsService.createStep(formId, stepData, 'user-id');

      expect(step).toBeDefined();
      expect(step.title).toBe('Step 1');
      expect(step.step_order).toBe(0);
    });

    it('should throw error if form not found', async () => {
      await expect(
        formsService.createStep('invalid-id', {}, 'user-id')
      ).rejects.toThrow('Form not found');
    });

    it('should reorder steps after deletion', async () => {
      // Test step reordering logic
    });
  });

  describe('saveProgress', () => {
    it('should save progress with valid data', async () => {
      const progressData = {
        org_id: 'org-1',
        current_step: 2,
        step_data: { field1: 'value1' }
      };

      const progress = await formsService.saveProgress(
        'form-1',
        'user-1',
        'session-1',
        progressData
      );

      expect(progress).toBeDefined();
      expect(progress.current_step).toBe(2);
    });

    it('should update existing progress on conflict', async () => {
      // Test upsert logic
    });
  });

  describe('getProgress', () => {
    it('should retrieve saved progress', async () => {
      // First save progress
      await formsService.saveProgress('form-1', 'user-1', 'session-1', {
        org_id: 'org-1',
        current_step: 1,
        step_data: {}
      });

      // Then retrieve
      const progress = await formsService.getProgress('form-1', 'user-1', 'session-1');

      expect(progress).toBeDefined();
      expect(progress.current_step).toBe(1);
    });

    it('should return null if no progress found', async () => {
      const progress = await formsService.getProgress('form-1', 'user-1', 'session-999');
      expect(progress).toBeNull();
    });
  });
});
```

```javascript
// ehr-api/src/services/rule-engine.service.test.js

const ruleEngineService = require('./rule-engine.service');

describe('RuleEngineService - Step Rules', () => {
  describe('evaluateStepRules', () => {
    it('should skip step when condition met', async () => {
      const context = { patientType: 'returning' };

      const result = await ruleEngineService.evaluateStepRules(
        'form-1',
        'step-demographics',
        context
      );

      expect(result.skipStep).toBe(true);
    });

    it('should route to specific step when condition met', async () => {
      const context = { age: 70 };

      const result = await ruleEngineService.evaluateStepRules(
        'form-1',
        'step-1',
        context
      );

      expect(result.nextStepId).toBe('step-geriatric');
    });

    it('should handle rule priority correctly', async () => {
      // Test that higher priority rules execute first
    });
  });

  describe('testStepRule', () => {
    it('should test rule with sample data', async () => {
      const testContext = { diagnosis: 'hypertension' };

      const result = await ruleEngineService.testStepRule('rule-1', testContext);

      expect(result).toBeDefined();
      expect(result.conditionMet).toBeDefined();
    });
  });
});
```

### Step 2: Frontend Unit Tests (1 hour)
```typescript
// ehr-web/src/stores/form-builder-store.test.ts

import { renderHook, act } from '@testing-library/react';
import { useFormBuilderStore } from './form-builder-store';

describe('useFormBuilderStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useFormBuilderStore.getState().resetStore();
  });

  it('should add step', () => {
    const { result } = renderHook(() => useFormBuilderStore());

    act(() => {
      result.current.addStep({ title: 'New Step' });
    });

    expect(result.current.steps).toHaveLength(1);
    expect(result.current.steps[0].title).toBe('New Step');
  });

  it('should delete step and reorder', () => {
    const { result } = renderHook(() => useFormBuilderStore());

    // Add 3 steps
    act(() => {
      result.current.addStep({ title: 'Step 1' });
      result.current.addStep({ title: 'Step 2' });
      result.current.addStep({ title: 'Step 3' });
    });

    const stepToDelete = result.current.steps[1].id;

    // Delete middle step
    act(() => {
      result.current.deleteStep(stepToDelete);
    });

    expect(result.current.steps).toHaveLength(2);
    expect(result.current.steps[1].stepOrder).toBe(1); // Reordered
  });

  it('should mark dirty on changes', () => {
    const { result } = renderHook(() => useFormBuilderStore());

    expect(result.current.isDirty).toBe(false);

    act(() => {
      result.current.addStep({ title: 'Step 1' });
    });

    expect(result.current.isDirty).toBe(true);
  });

  it('should auto-save on step change', async () => {
    const { result } = renderHook(() => useFormBuilderStore());

    act(() => {
      result.current.setFormId('form-1');
      result.current.addStep({ title: 'Step 1' });
      result.current.addStep({ title: 'Step 2' });
    });

    // Mock saveProgress
    const saveSpy = jest.spyOn(result.current, 'saveProgress');

    act(() => {
      result.current.setCurrentStep(1);
    });

    expect(saveSpy).toHaveBeenCalled();
  });
});
```

```typescript
// ehr-web/src/components/forms/StepNavigator.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { StepNavigator } from './StepNavigator';
import { useFormBuilderStore } from '@/stores/form-builder-store';

jest.mock('@/stores/form-builder-store');

describe('StepNavigator', () => {
  const mockSteps = [
    { id: '1', title: 'Step 1', stepOrder: 0, status: 'complete' },
    { id: '2', title: 'Step 2', stepOrder: 1, status: 'incomplete' },
    { id: '3', title: 'Step 3', stepOrder: 2, status: 'incomplete' }
  ];

  beforeEach(() => {
    (useFormBuilderStore as jest.Mock).mockReturnValue({
      steps: mockSteps,
      currentStepIndex: 0,
      setCurrentStep: jest.fn()
    });
  });

  it('renders all steps', () => {
    render(<StepNavigator />);

    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
  });

  it('highlights current step', () => {
    render(<StepNavigator />);

    const step1Button = screen.getByText('Step 1').closest('button');
    expect(step1Button).toHaveClass('border-primary');
  });

  it('calls setCurrentStep on click', () => {
    const setCurrentStep = jest.fn();
    (useFormBuilderStore as jest.Mock).mockReturnValue({
      steps: mockSteps,
      currentStepIndex: 0,
      setCurrentStep
    });

    render(<StepNavigator />);

    fireEvent.click(screen.getByText('Step 2'));
    expect(setCurrentStep).toHaveBeenCalledWith(1);
  });

  it('shows status icons correctly', () => {
    render(<StepNavigator />);

    // Step 1 complete (CheckCircle2)
    // Step 2 incomplete (Circle)
    // Add more specific icon checks
  });
});
```

### Step 3: Integration Tests (30 mins)
```typescript
// ehr-web/src/__tests__/integration/multi-step-workflow.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FormBuilderPage from '@/app/forms/builder/[[...id]]/page';

describe('Multi-Step Form Builder - Integration', () => {
  it('complete wizard workflow', async () => {
    render(<FormBuilderPage params={{ id: ['new'] }} />);

    // Enable multi-step mode
    const multiStepToggle = screen.getByLabelText('Multi-Step Mode');
    fireEvent.click(multiStepToggle);

    // Add second step
    const addStepButton = screen.getByText('+ Add Step');
    fireEvent.click(addStepButton);

    await waitFor(() => {
      expect(screen.getByText('Step 2')).toBeInTheDocument();
    });

    // Navigate to step 2
    fireEvent.click(screen.getByText('Step 2'));

    // Edit step title
    const titleInput = screen.getByLabelText('Step Title');
    fireEvent.change(titleInput, { target: { value: 'Contact Information' } });

    // Save draft
    const saveDraftButton = screen.getByText('Save Draft');
    fireEvent.click(saveDraftButton);

    await waitFor(() => {
      expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
    });

    // Verify state persisted
    expect(screen.getByDisplayValue('Contact Information')).toBeInTheDocument();
  });
});
```

### Step 4: E2E Tests (if Playwright/Cypress configured) (30 mins)
```typescript
// ehr-web/src/__e2e__/multi-step-form.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Multi-Step Form Builder E2E', () => {
  test('create and navigate multi-step form', async ({ page }) => {
    await page.goto('/forms/builder/new');

    // Enable multi-step mode
    await page.getByLabel('Multi-Step Mode').click();

    // Add steps
    await page.getByText('+ Add Step').click();
    await page.getByText('+ Add Step').click();

    // Verify 3 steps exist (1 default + 2 added)
    await expect(page.getByText('Step 1 of 3')).toBeVisible();

    // Navigate to step 2
    await page.getByText('Step 2').click();

    // Edit step
    await page.getByLabel('Step Title').fill('Medical History');
    await page.getByLabel('Description').fill('Please provide your medical history');

    // Preview in mobile
    await page.getByLabel('Mobile').click();
    await expect(page.getByText('Medical History')).toBeVisible();

    // Save
    await page.getByText('Save Draft').click();
    await expect(page.getByText('Saved')).toBeVisible();
  });

  test('rule-based step skip', async ({ page }) => {
    // Create form with skip rule
    // Trigger rule condition
    // Verify step skipped
  });
});
```

### Step 5: Documentation (1 hour)
```markdown
<!-- docs/features/multi-step-forms-guide.md -->

# Multi-Step Forms User Guide

## Overview
Multi-step forms (also called wizard forms) break long forms into manageable screens with step-by-step navigation.

## When to Use Multi-Step Forms
- Forms with 10+ fields
- Complex workflows (e.g., patient intake, clinical trials)
- Forms requiring conditional branching

## Creating a Multi-Step Form

### Step 1: Enable Multi-Step Mode
1. Navigate to Form Builder
2. Toggle "Multi-Step Mode" switch
3. A default Step 1 is created automatically

### Step 2: Add Steps
1. Click "+ Add Step" in the step navigator
2. Steps are numbered sequentially
3. Drag to reorder steps

### Step 3: Configure Each Step
- **Title**: Clear, descriptive step name
- **Description**: Optional instructions for users
- **Navigation**: Allow back, allow skip options
- **Validation**: Validate on next, required fields

### Step 4: Add Fields to Steps
- Drag fields from palette to current step
- Limit 5-6 fields per step for best UX
- Group related fields logically

### Step 5: Preview & Test
- Use device selector to preview responsiveness
- Enable test mode to fill form interactively
- Verify step navigation and validation

## Step Navigation Rules

### Skip Logic
Hide entire steps based on conditions:
- IF patient type = "returning" THEN skip demographics step

### Conditional Routing
Route to specific steps based on responses:
- IF age > 65 THEN route to geriatric assessment

### Validation Rules
Prevent navigation until requirements met:
- All required fields filled
- Custom validation passed

## Best Practices

### UX Guidelines
- Limit 5-6 fields per step
- Show progress indicator
- Allow back navigation
- Validate on "Next" not real-time
- Save progress between steps

### Performance Tips
- Keep forms under 50 fields total
- Use auto-save (30s debounce)
- Test on mobile devices

### Clinical Trial (eCRF) Features
- Visit-based form templates
- CDASH annotations
- Audit trail compliance
- Data lock preparation

## Troubleshooting

### Auto-save not working
- Check network connection
- Verify sessionId in localStorage
- Check API rate limits

### Preview not updating
- Preview updates debounced (300ms)
- Hard refresh browser if stuck

### Rule not triggering
- Verify rule is active
- Check condition logic in test mode
- Review rule priority

## API Reference
See [Forms API Reference](../api/forms-api-reference.md) for endpoints.
```

---

## Todo List

- [ ] Write backend unit tests (forms, rules services)
- [ ] Write frontend unit tests (stores, components)
- [ ] Write integration tests (workflows)
- [ ] Write E2E tests (if configured)
- [ ] Performance test auto-save under load
- [ ] Performance test large form rendering
- [ ] Write multi-step forms user guide
- [ ] Update API reference documentation
- [ ] Write migration guide (single → multi-step)
- [ ] Create troubleshooting guide
- [ ] Record demo video (optional)
- [ ] Update README with multi-step features

---

## Success Criteria

- [ ] All unit tests pass (>80% coverage)
- [ ] Integration tests pass
- [ ] E2E tests pass (if configured)
- [ ] Performance benchmarks met (<300ms preview sync)
- [ ] Documentation complete and reviewed
- [ ] Migration guide tested
- [ ] No regressions in existing form builder

---

## Conflict Prevention

**How Avoid Conflicts with Parallel Phases**:
- This phase only creates test files and docs
- No production code modified
- Can run after all other phases code-complete

**File Boundaries**:
- Phase 5 owns: All `*.test.js`, `*.test.tsx`, `*.spec.ts`, docs files
- No overlap with production code from Phases 1-4

---

## Risk Assessment

**Risk**: Tests fail due to integration issues
**Mitigation**: Run integration tests continuously during development, fix issues immediately

**Risk**: E2E tests flaky
**Mitigation**: Use wait strategies, retry mechanisms, stable test data

**Risk**: Performance tests unreliable (environment variance)
**Mitigation**: Run multiple iterations, use percentile metrics (p95, p99)

**Risk**: Documentation incomplete or outdated
**Mitigation**: Review docs with product team, include screenshots

---

## Security Considerations

- [ ] No sensitive data in test fixtures
- [ ] Use test database (not production)
- [ ] Clean up test data after runs
- [ ] Validate test user permissions
- [ ] No API keys in test code (use env vars)

---

## Next Steps

1. Code review all phases
2. Merge to main branch
3. Deploy to staging environment
4. Beta testing with internal users
5. Production rollout with feature flag
6. Monitor metrics (usage, errors, performance)

---

## Dependencies

**External**:
- Jest (backend testing) - installed
- React Testing Library (frontend) - installed
- Playwright/Cypress (E2E) - may need setup

**Internal**:
- All Phases 1-4 code complete
- Test database seeded
- Staging environment available

---

## Performance Benchmarks

**Target Metrics**:
- Auto-save latency: <500ms (p95)
- Preview sync delay: <300ms (debounced)
- Step navigation: <100ms
- Large form render (50 fields): <2s
- Rule evaluation: <50ms per rule

**Load Test Scenarios**:
- 100 concurrent users auto-saving
- 1000 forms with 20+ steps each
- 50 rules evaluated per step navigation

---

## Unresolved Questions

1. E2E test framework (Playwright vs Cypress)?
2. Visual regression testing (Percy, Chromatic)?
3. Load testing tool (k6, Artillery)?
4. Test coverage target (80%? 90%)?
