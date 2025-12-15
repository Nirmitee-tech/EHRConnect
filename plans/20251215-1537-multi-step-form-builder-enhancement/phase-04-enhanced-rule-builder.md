# Phase 4: Enhanced Rule Builder

**Date**: 2025-12-15
**Phase**: 4 of 5
**Priority**: Medium
**Status**: Pending
**Duration**: ~5 hours

---

## Parallelization Info

**Can Run With**: Phase 2 (different components), Phase 3 (different components)
**Must Wait For**: Phase 1 complete (DB schema for step-level rules)
**Blocks**: Phase 5 (testing needs rules complete)
**Conflicts**: None - exclusive rule component ownership

---

## Context Links

**Research**:
- [researcher-01-multi-step-forms.md](./research/researcher-01-multi-step-forms.md) (Rule types, skip logic)
- [code-standards.md](../../docs/code-standards.md)

**Existing Code**:
- ehr-api/src/services/rule-engine.service.js (existing rule engine - extend)
- ehr-web/src/components/rules/ (existing rule builder - extend)
- ehr-web/src/types/forms.ts (add rule types)

---

## Overview

Extend existing rule engine to support step-level rules: screen skip logic, conditional branching, step transitions, and visual rule testing for multi-step forms.

---

## Key Insights from Research

1. **Skip logic**: Entire screens hidden based on conditions (IF visit type == "Baseline" THEN skip [demographics])
2. **Conditional branching**: 2+ pathways based on responses (IF patient age > 65 THEN route to geriatric-assessment)
3. **Step-level rules**: Rules apply to entire steps, not just fields
4. **Visual builder**: Natural language approach most effective (IF [condition] THEN [action])
5. **Rule testing**: Preview/simulation before activation critical

---

## Requirements

### Step-Level Rule Types
- [ ] Skip step (hide entire screen)
- [ ] Conditional next (route to specific step)
- [ ] Require step (make optional step required)
- [ ] Repeat step (loop for multi-entry)
- [ ] Validate step (custom validation before next)

### Rule Builder UI
- [ ] Step selector (choose target step)
- [ ] Condition builder (visual query builder)
- [ ] Action selector (skip/route/require/repeat)
- [ ] Rule priority ordering
- [ ] Rule testing interface
- [ ] Active/inactive toggle

### Rule Execution
- [ ] Evaluate on step navigation
- [ ] Evaluate on field change (reactive)
- [ ] Cache evaluation results
- [ ] Log rule execution
- [ ] Handle rule conflicts

---

## Architecture

### Rule Data Model Extension
```typescript
// Extend existing Rule type
interface StepRule extends Rule {
  scope: 'step'; // vs 'field' or 'form'
  targetStepId: string;
  action: StepRuleAction;
  priority: number; // For conflict resolution
}

interface StepRuleAction {
  type: 'skip' | 'route' | 'require' | 'repeat' | 'validate';
  params: {
    nextStepId?: string; // For 'route'
    repeatCount?: number; // For 'repeat'
    validationRule?: ValidationRule; // For 'validate'
  };
}

// Condition structure (JSON Logic compatible)
interface RuleCondition {
  operator: 'and' | 'or' | 'not';
  conditions: Array<{
    field: string; // linkId or stepId
    operator: '==' | '!=' | '>' | '<' | 'contains' | 'in';
    value: any;
  }>;
}
```

### Rule Evaluation Flow
```
Step Navigation Event
→ Load Active Step Rules
→ Evaluate Conditions (JSON Logic)
→ Apply Actions (priority order)
→ Update Navigation State
→ Log Execution
→ Return Next Step
```

---

## Related Code Files (Exclusive to Phase 4)

**Backend Files - Phase 4 Ownership**:
- `ehr-api/src/services/rule-engine.service.js` (MODIFY - add step rule methods lines 500-700)
- `ehr-api/src/routes/rules.js` (MODIFY - add step rule endpoints lines 150-250)

**Frontend Files - Phase 4 Ownership**:
- `ehr-web/src/components/rules/StepRuleBuilder.tsx` (NEW)
- `ehr-web/src/components/rules/StepRuleConditionEditor.tsx` (NEW)
- `ehr-web/src/components/rules/StepRuleActionSelector.tsx` (NEW)
- `ehr-web/src/components/rules/RuleTestPanel.tsx` (NEW)
- `ehr-web/src/services/rule.service.ts` (MODIFY - add step methods lines 100-200)
- `ehr-web/src/types/forms.ts` (MODIFY - add rule types lines 651-720)

**No Other Phase Touches These Sections**

---

## Implementation Steps

### Step 1: Extend Backend Rule Engine (1.5 hours)
```javascript
// ehr-api/src/services/rule-engine.service.js - Add methods

/**
 * Evaluate step-level rules
 */
async evaluateStepRules(formId, currentStepId, context) {
  const rules = await this.getActiveStepRules(formId, currentStepId);

  const results = {
    skipStep: false,
    nextStepId: null,
    requireStep: false,
    validationErrors: []
  };

  // Sort by priority (higher first)
  const sortedRules = rules.sort((a, b) => b.priority - a.priority);

  for (const rule of sortedRules) {
    const conditionMet = await this.evaluateCondition(rule.conditions, context);

    if (conditionMet) {
      await this.logRuleExecution(rule.id, currentStepId, true);

      switch (rule.action.type) {
        case 'skip':
          results.skipStep = true;
          break;

        case 'route':
          results.nextStepId = rule.action.params.nextStepId;
          break;

        case 'require':
          results.requireStep = true;
          break;

        case 'validate':
          const validationResult = await this.validateStep(
            currentStepId,
            context,
            rule.action.params.validationRule
          );
          if (!validationResult.valid) {
            results.validationErrors.push(...validationResult.errors);
          }
          break;

        case 'repeat':
          // Handle repeat logic
          break;
      }

      // Stop after first matching rule (unless configured otherwise)
      if (!rule.config?.continueEvaluation) {
        break;
      }
    }
  }

  return results;
}

/**
 * Get active step rules for form
 */
async getActiveStepRules(formId, stepId) {
  const rules = await db.query(
    `SELECT r.* FROM rules r
    WHERE r.form_id = $1
      AND r.scope = 'step'
      AND r.target_step_id = $2
      AND r.is_active = true
    ORDER BY r.priority DESC`,
    [formId, stepId]
  );

  return rules;
}

/**
 * Create step rule
 */
async createStepRule(formId, ruleData) {
  const rule = await db.query(
    `INSERT INTO rules (form_id, name, description, scope, target_step_id,
      conditions, action, priority, is_active)
    VALUES ($1, $2, $3, 'step', $4, $5, $6, $7, true)
    RETURNING *`,
    [
      formId,
      ruleData.name,
      ruleData.description,
      ruleData.targetStepId,
      JSON.stringify(ruleData.conditions),
      JSON.stringify(ruleData.action),
      ruleData.priority || 0
    ]
  );

  return rule;
}

/**
 * Test step rule with sample data
 */
async testStepRule(ruleId, testContext) {
  const rule = await this.getRuleById(ruleId);
  if (!rule) throw new Error('Rule not found');

  const result = await this.evaluateCondition(rule.conditions, testContext);

  return {
    ruleId,
    conditionMet: result,
    action: result ? rule.action : null,
    testContext
  };
}
```

### Step 2: Backend API Routes (1 hour)
```javascript
// ehr-api/src/routes/rules.js - Add endpoints

/**
 * Step rule endpoints
 */

// Create step rule
router.post('/forms/:formId/step-rules', authenticateJWT, async (req, res) => {
  try {
    const rule = await ruleEngineService.createStepRule(
      req.params.formId,
      req.body
    );
    res.status(201).json(rule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Evaluate step rules
router.post('/forms/:formId/steps/:stepId/evaluate', authenticateJWT, async (req, res) => {
  try {
    const results = await ruleEngineService.evaluateStepRules(
      req.params.formId,
      req.params.stepId,
      req.body.context
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test step rule
router.post('/rules/:ruleId/test', authenticateJWT, async (req, res) => {
  try {
    const result = await ruleEngineService.testStepRule(
      req.params.ruleId,
      req.body.testContext
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get step rules for form
router.get('/forms/:formId/step-rules', authenticateJWT, async (req, res) => {
  try {
    const rules = await ruleEngineService.getStepRules(req.params.formId);
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Step 3: Frontend Type Definitions (30 mins)
```typescript
// ehr-web/src/types/forms.ts - Add to end

export interface StepRule {
  id: string;
  formId: string;
  name: string;
  description?: string;
  scope: 'step';
  targetStepId: string;
  conditions: RuleCondition;
  action: StepRuleAction;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RuleCondition {
  operator: 'and' | 'or' | 'not';
  conditions: Array<{
    field: string;
    operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'in' | 'notIn';
    value: any;
  }>;
}

export interface StepRuleAction {
  type: 'skip' | 'route' | 'require' | 'repeat' | 'validate';
  params: {
    nextStepId?: string;
    repeatCount?: number;
    validationRule?: ValidationRule;
  };
}

export interface RuleTestResult {
  ruleId: string;
  conditionMet: boolean;
  action: StepRuleAction | null;
  testContext: Record<string, any>;
}
```

### Step 4: Step Rule Builder Component (1.5 hours)
```typescript
// ehr-web/src/components/rules/StepRuleBuilder.tsx

'use client';

import { useState } from 'react';
import { useFormBuilderStore } from '@/stores/form-builder-store';
import { StepRuleConditionEditor } from './StepRuleConditionEditor';
import { StepRuleActionSelector } from './StepRuleActionSelector';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';

export function StepRuleBuilder() {
  const { steps } = useFormBuilderStore();
  const [rule, setRule] = useState<Partial<StepRule>>({
    name: '',
    targetStepId: '',
    conditions: { operator: 'and', conditions: [] },
    action: { type: 'skip', params: {} },
    priority: 0
  });

  const handleSave = async () => {
    // API call to save rule
    console.log('Saving rule:', rule);
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold">Create Step Rule</h2>
        <p className="text-muted-foreground mt-1">
          Define conditional logic for step navigation
        </p>
      </div>

      {/* Rule Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Rule Name</label>
        <Input
          value={rule.name}
          onChange={(e) => setRule({ ...rule, name: e.target.value })}
          placeholder="e.g., Skip demographics for returning patients"
        />
      </div>

      {/* Target Step */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Target Step</label>
        <Select
          value={rule.targetStepId}
          onValueChange={(value) => setRule({ ...rule, targetStepId: value })}
        >
          <option value="">Select step...</option>
          {steps.map((step) => (
            <option key={step.id} value={step.id}>
              {step.title}
            </option>
          ))}
        </Select>
      </div>

      {/* Conditions */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Conditions</label>
        <StepRuleConditionEditor
          conditions={rule.conditions!}
          onChange={(conditions) => setRule({ ...rule, conditions })}
        />
      </div>

      {/* Action */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Action</label>
        <StepRuleActionSelector
          action={rule.action!}
          onChange={(action) => setRule({ ...rule, action })}
          steps={steps}
        />
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Priority</label>
        <Input
          type="number"
          value={rule.priority}
          onChange={(e) => setRule({ ...rule, priority: parseInt(e.target.value) })}
          placeholder="0"
        />
        <p className="text-xs text-muted-foreground">
          Higher priority rules execute first
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={handleSave}>Save Rule</Button>
        <Button variant="outline">Test Rule</Button>
      </div>
    </div>
  );
}
```

### Step 5: Condition Editor Component (1 hour)
```typescript
// ehr-web/src/components/rules/StepRuleConditionEditor.tsx

'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface ConditionEditorProps {
  conditions: RuleCondition;
  onChange: (conditions: RuleCondition) => void;
}

export function StepRuleConditionEditor({ conditions, onChange }: ConditionEditorProps) {
  const addCondition = () => {
    onChange({
      ...conditions,
      conditions: [
        ...conditions.conditions,
        { field: '', operator: '==', value: '' }
      ]
    });
  };

  const removeCondition = (index: number) => {
    onChange({
      ...conditions,
      conditions: conditions.conditions.filter((_, i) => i !== index)
    });
  };

  const updateCondition = (index: number, updates: any) => {
    const newConditions = [...conditions.conditions];
    newConditions[index] = { ...newConditions[index], ...updates };
    onChange({ ...conditions, conditions: newConditions });
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      {/* Operator Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Match</span>
        <Select
          value={conditions.operator}
          onValueChange={(value: any) => onChange({ ...conditions, operator: value })}
        >
          <option value="and">All (AND)</option>
          <option value="or">Any (OR)</option>
        </Select>
        <span className="text-sm font-medium">of the following:</span>
      </div>

      {/* Conditions List */}
      <div className="space-y-3">
        {conditions.conditions.map((condition, index) => (
          <div key={index} className="flex gap-2 items-start">
            {/* Field Selector */}
            <Input
              placeholder="Field name"
              value={condition.field}
              onChange={(e) => updateCondition(index, { field: e.target.value })}
              className="flex-1"
            />

            {/* Operator */}
            <Select
              value={condition.operator}
              onValueChange={(value) => updateCondition(index, { operator: value })}
              className="w-32"
            >
              <option value="==">Equals</option>
              <option value="!=">Not Equals</option>
              <option value=">">Greater Than</option>
              <option value="<">Less Than</option>
              <option value="contains">Contains</option>
              <option value="in">In</option>
            </Select>

            {/* Value */}
            <Input
              placeholder="Value"
              value={condition.value}
              onChange={(e) => updateCondition(index, { value: e.target.value })}
              className="flex-1"
            />

            {/* Remove Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeCondition(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add Condition Button */}
      <Button variant="outline" size="sm" onClick={addCondition}>
        <Plus className="h-4 w-4 mr-2" />
        Add Condition
      </Button>
    </div>
  );
}
```

### Step 6: Action Selector Component (30 mins)
```typescript
// ehr-web/src/components/rules/StepRuleActionSelector.tsx

'use client';

import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface ActionSelectorProps {
  action: StepRuleAction;
  onChange: (action: StepRuleAction) => void;
  steps: FormStep[];
}

export function StepRuleActionSelector({ action, onChange, steps }: ActionSelectorProps) {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      {/* Action Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Action Type</label>
        <Select
          value={action.type}
          onValueChange={(value: any) => onChange({ ...action, type: value, params: {} })}
        >
          <option value="skip">Skip Step</option>
          <option value="route">Route to Specific Step</option>
          <option value="require">Require Step</option>
          <option value="repeat">Repeat Step</option>
          <option value="validate">Custom Validation</option>
        </Select>
      </div>

      {/* Action Parameters */}
      {action.type === 'route' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Next Step</label>
          <Select
            value={action.params.nextStepId}
            onValueChange={(value) =>
              onChange({ ...action, params: { ...action.params, nextStepId: value } })
            }
          >
            <option value="">Select step...</option>
            {steps.map((step) => (
              <option key={step.id} value={step.id}>
                {step.title}
              </option>
            ))}
          </Select>
        </div>
      )}

      {action.type === 'repeat' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Repeat Count</label>
          <Input
            type="number"
            value={action.params.repeatCount || 1}
            onChange={(e) =>
              onChange({
                ...action,
                params: { ...action.params, repeatCount: parseInt(e.target.value) }
              })
            }
            min={1}
            max={10}
          />
        </div>
      )}
    </div>
  );
}
```

---

## Todo List

- [ ] Extend backend rule engine service (step methods)
- [ ] Add step rule API endpoints
- [ ] Add step rule type definitions
- [ ] Create `StepRuleBuilder` component
- [ ] Create `StepRuleConditionEditor` component
- [ ] Create `StepRuleActionSelector` component
- [ ] Create `RuleTestPanel` component
- [ ] Add rule priority conflict resolution
- [ ] Test skip logic functionality
- [ ] Test conditional routing
- [ ] Test rule execution logging
- [ ] Integration test with Phase 2 navigation

---

## Success Criteria

- [ ] Create step rule via UI
- [ ] Edit existing step rules
- [ ] Rules evaluate on step navigation
- [ ] Skip logic hides steps correctly
- [ ] Conditional routing navigates to correct step
- [ ] Rule priority resolves conflicts
- [ ] Test mode validates rule logic
- [ ] Rule execution logged to audit trail

---

## Conflict Prevention

**How Avoid Conflicts with Parallel Phases**:

1. **Phase 1 (Backend)**: Wait for Phase 1 DB schema complete before starting. No table conflicts.
2. **Phase 2 (Builder UI)**: Different components. Rule builder separate from step editor. Service methods in different sections.
3. **Phase 3 (Preview)**: Different components. Preview may show conditional logic results but doesn't edit rules.

**File Boundaries**:
- Phase 4 owns: `StepRule*` components, rule-engine.service.js (step methods), routes/rules.js (step endpoints)
- Phase 2 owns: `Step*` components (editor, navigator)
- No component file overlap

---

## Risk Assessment

**Risk**: Rule conflicts (multiple rules affecting same step)
**Mitigation**: Priority system, first-match-wins or continue-evaluation flag

**Risk**: Infinite loops (rule routes back to same step)
**Mitigation**: Max evaluation depth (10), detect cycles, log warnings

**Risk**: Performance with complex rules
**Mitigation**: Cache evaluation results, index rules by target step, limit condition complexity

**Risk**: Rule testing doesn't match production behavior
**Mitigation**: Test environment identical to production, log all evaluations

---

## Security Considerations

- [ ] Validate rule conditions (prevent code injection)
- [ ] Sanitize condition values
- [ ] Check user permissions for rule creation (ORG_ADMIN only)
- [ ] Audit log all rule modifications
- [ ] Rate limit rule evaluation endpoint

---

## Next Steps

1. Integrate with Phase 2 step navigation (trigger rule evaluation)
2. Phase 5 testing validates rule logic end-to-end
3. Future: AI-assisted rule suggestions based on form structure
4. Future: Rule analytics dashboard (most triggered rules)

---

## Dependencies

**External**:
- JSON Logic library (evaluate conditions) - may need to add

**Internal**:
- Phase 1 complete (DB schema for step rules)
- Existing rule engine (extend)
- Phase 2 builder state (read step data)

---

## Unresolved Questions

1. Support rule versioning (track changes)?
2. Rule analytics (execution frequency, success rate)?
3. Natural language rule builder (AI-assisted)?
4. Import/export rules across forms?
