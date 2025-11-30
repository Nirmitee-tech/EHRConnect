# 🚀 Enterprise Rule Engine - Quick Implementation Guide

## 📋 Prerequisites

```bash
# Required dependencies (already installed)
- Next.js 14
- React 18
- @monaco-editor/react
- react-querybuilder
- lucide-react
- shadcn/ui components
```

## 🎯 Quick Start (5 Minutes)

### Option 1: Use Enterprise Builder (Recommended)

```typescript
// In your rule creation page
import { GuidedRuleBuilderEnterprise } from '@/components/rules/guided-rule-builder-enterprise';
import { FHIR_FIELDS_ENTERPRISE } from '@/components/rules/fhir-fields-enterprise.config';

export default function RuleCreatePage() {
  const [ruleConditions, setRuleConditions] = useState(null);

  return (
    <GuidedRuleBuilderEnterprise
      value={ruleConditions}
      onChange={setRuleConditions}
      availableFields={FHIR_FIELDS_ENTERPRISE} // All 200+ fields
    />
  );
}
```

### Option 2: Use Category-Filtered Fields

```typescript
import {
  FHIR_FIELDS_ENTERPRISE,
  getFieldsByCategory,
  FHIR_FIELD_CATEGORIES,
} from '@/components/rules/fhir-fields-enterprise.config';

// Use specific categories only
const diabetesFields = [
  ...getFieldsByCategory(FHIR_FIELD_CATEGORIES.LAB_RESULTS),
  ...getFieldsByCategory(FHIR_FIELD_CATEGORIES.MEDICATIONS),
  ...getFieldsByCategory(FHIR_FIELD_CATEGORIES.CONDITIONS),
];

<GuidedRuleBuilderEnterprise
  availableFields={diabetesFields}
  value={ruleConditions}
  onChange={setRuleConditions}
/>
```

---

## 🔧 Component Integration

### 1. Code Search (for LOINC/SNOMED/RxNorm/ICD-10/CPT)

```typescript
import { CodeSearchInput } from '@/components/rules/code-search-input';
import { CODE_SYSTEMS } from '@/components/rules/fhir-fields-enterprise.config';

// Example: Search ICD-10 diagnosis codes
<CodeSearchInput
  value={selectedCode}
  onChange={(code, display) => {
    console.log('Selected code:', code, display);
  }}
  codeSystem={CODE_SYSTEMS.ICD10}
  valueSet={[
    { code: 'E11.9', display: 'Type 2 diabetes without complications' },
    { code: 'I10', display: 'Essential hypertension' },
    { code: 'I50.9', display: 'Heart failure, unspecified' },
  ]}
  placeholder="Search ICD-10 codes..."
/>
```

### 2. Temporal Operator Builder

```typescript
import { TemporalOperatorBuilder } from '@/components/rules/temporal-operator-builder';

<TemporalOperatorBuilder
  value={{
    operator: 'AVG',
    field: 'observation.lab_glucose',
    timeValue: 7,
    timeUnit: 'days',
  }}
  onChange={(config) => {
    console.log('Temporal config:', config);
    // Result: AVG(observation.lab_glucose, last_7_days)
  }}
  availableFields={numericFields}
/>
```

---

## 📊 Working with Rules

### Creating a Rule

```typescript
const rule = {
  name: 'Diabetes Screening Reminder',
  description: 'Remind patients due for HbA1c screening',
  trigger_event: 'appointment_scheduled',
  conditions: {
    combinator: 'and',
    rules: [
      {
        field: 'patient.age',
        operator: '>=',
        value: 45,
      },
      {
        field: 'observation.bmi',
        operator: '>=',
        value: 25,
      },
      {
        field: 'temporal.time_since',
        operator: '>',
        value: 365,
        temporalConfig: {
          operator: 'TIME_SINCE',
          field: 'observation.lab_a1c',
          timeUnit: 'days',
        },
      },
    ],
  },
  actions: {
    type: 'create_servicerequest',
    config: {
      code: {
        system: 'LOINC',
        code: '4548-4',
        display: 'Hemoglobin A1c',
      },
    },
  },
};

// Save to backend
await ruleService.createRule(session, rule);
```

### Rule Evaluation (Backend)

```python
# Python backend example
from jsonlogic import jsonLogic

def evaluate_rule(rule, patient_data):
    """
    Evaluate rule conditions against patient data
    """
    conditions = rule['conditions']

    # Convert to JSONLogic format
    json_logic = convert_to_jsonlogic(conditions)

    # Evaluate
    result = jsonLogic(json_logic, patient_data)

    if result:
        # Execute actions
        execute_actions(rule['actions'], patient_data)

    return result

# Example patient data
patient_data = {
    'patient': {
        'age': 55,
    },
    'observation': {
        'bmi': 28.5,
        'lab_a1c': {
            'value': 5.9,
            'date': '2023-01-15',
        },
    },
}

# Evaluate
if evaluate_rule(rule, patient_data):
    print('Rule triggered! Creating HbA1c order...')
```

---

## 🏥 Clinical Use Case Examples

### Example 1: High Blood Pressure Alert

```typescript
const highBPRule = {
  name: 'High Blood Pressure Alert',
  conditions: {
    combinator: 'or',
    rules: [
      {
        field: 'observation.bp_systolic',
        operator: '>',
        value: 140,
      },
      {
        field: 'observation.bp_diastolic',
        operator: '>',
        value: 90,
      },
    ],
  },
  actions: {
    type: 'create_task',
    config: {
      title: 'High BP - Review and Adjust Medications',
      priority: 'high',
      assignTo: 'Primary Care Provider',
    },
  },
};
```

### Example 2: Diabetes Control (with Temporal)

```typescript
const diabetesControlRule = {
  name: 'Uncontrolled Diabetes',
  conditions: {
    combinator: 'and',
    rules: [
      {
        field: 'condition.code',
        operator: 'contains',
        value: 'E11', // ICD-10: Type 2 diabetes
      },
      {
        field: 'temporal.avg_within',
        operator: '>',
        value: 180,
        temporalConfig: {
          operator: 'AVG',
          field: 'observation.lab_glucose',
          timeValue: 7,
          timeUnit: 'days',
        },
      },
      {
        field: 'observation.lab_a1c',
        operator: '>',
        value: 9,
      },
    ],
  },
  actions: {
    type: 'create_careplan',
    config: {
      title: 'Diabetes Intensification',
      activities: [
        'Review medications',
        'Endocrinology referral',
        'Diabetes education',
        'Follow-up in 2 weeks',
      ],
    },
  },
};
```

### Example 3: AFib Stroke Prevention

```typescript
const afibStrokePreventionRule = {
  name: 'AFib Stroke Prevention',
  conditions: {
    combinator: 'and',
    rules: [
      {
        field: 'condition.code',
        operator: '=',
        value: 'I48', // ICD-10: Atrial fibrillation
        displayValue: 'Atrial fibrillation',
      },
      {
        field: 'var.cha2ds2_vasc_score',
        operator: '>=',
        value: 2,
      },
      {
        field: 'medication.class_anticoagulant',
        operator: '=',
        value: false,
      },
    ],
  },
  actions: {
    type: 'send_notification',
    config: {
      severity: 'high',
      title: 'Anticoagulation Recommended',
      message:
        'Patient has AFib with CHA2DS2-VASc ≥ 2 and is not on anticoagulation. Consider Apixaban or Rivaroxaban.',
      evidence: {
        guidelines: ['ACC/AHA 2023'],
        trials: ['ARISTOTLE', 'ROCKET-AF'],
      },
    },
  },
};
```

---

## 🔌 Backend API Integration

### Create Rule Endpoint

```typescript
// POST /api/rules
{
  "name": "Rule Name",
  "description": "Description",
  "trigger_event": "observation_created",
  "conditions": { /* JSONLogic */ },
  "actions": { /* Action config */ },
  "enabled": true,
  "priority": 1
}
```

### Evaluate Rule Endpoint

```typescript
// POST /api/rules/:id/evaluate
{
  "patient_id": "patient-123",
  "context": {
    "encounter_id": "encounter-456",
    "observation_id": "obs-789"
  }
}

// Response
{
  "rule_id": "rule-001",
  "evaluation_result": true,
  "actions_executed": [
    {
      "type": "create_task",
      "resource_id": "task-123",
      "status": "success"
    }
  ],
  "execution_time_ms": 45
}
```

---

## 🎨 Customization

### Add Custom Fields

```typescript
// In fhir-fields-enterprise.config.ts
export const CUSTOM_FIELDS: FHIRFieldEnterprise[] = [
  {
    name: 'observation.custom_score',
    label: 'Custom Clinical Score',
    type: 'number',
    inputType: 'number',
    category: FHIR_FIELD_CATEGORIES.COMPUTED,
    resource: 'Observation',
    fhirPath: 'Observation.valueQuantity.value',
    description: 'Your custom scoring system',
    tooltip: 'Custom score: 0-100. Higher = more risk.',
    unit: '{score}',
  },
];

// Merge with existing fields
export const ALL_FIELDS = [...FHIR_FIELDS_ENTERPRISE, ...CUSTOM_FIELDS];
```

### Add Custom Temporal Operator

```typescript
// In temporal-operator-builder.tsx
const CUSTOM_OPERATORS = [
  {
    value: 'PERCENTILE_95',
    label: '95th Percentile',
    description: '95th percentile value over time',
    example: 'PERCENTILE_95(BP_systolic, last_30_days)',
    requiresTimeWindow: true,
  },
];
```

---

## 📱 Mobile & Responsive

The enterprise builder is fully responsive:

```css
/* Automatically adjusts for mobile */
- Stacked layout on small screens
- Touch-friendly buttons (min 44px)
- Collapsible categories
- Horizontal scroll for wide tables
```

---

## 🧪 Testing

### Unit Tests

```typescript
import { render, screen } from '@testing-library/react';
import { GuidedRuleBuilderEnterprise } from './guided-rule-builder-enterprise';

describe('GuidedRuleBuilderEnterprise', () => {
  it('renders all field categories', () => {
    render(<GuidedRuleBuilderEnterprise value={null} onChange={jest.fn()} />);

    expect(screen.getByText('Patient Demographics')).toBeInTheDocument();
    expect(screen.getByText('Vital Signs & Observations')).toBeInTheDocument();
    expect(screen.getByText('Laboratory Results')).toBeInTheDocument();
  });

  it('filters fields by category', () => {
    const { getByLabelText } = render(
      <GuidedRuleBuilderEnterprise value={null} onChange={jest.fn()} />
    );

    const categorySelect = getByLabelText('Filter by Category');
    fireEvent.change(categorySelect, { target: { value: 'Laboratory Results' } });

    // Should only show lab fields
    expect(screen.queryByText('Patient Age')).not.toBeInTheDocument();
    expect(screen.getByText('Blood Glucose')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
import { createRule, evaluateRule } from '@/services/rule.service';

describe('Rule Evaluation', () => {
  it('triggers on high A1c', async () => {
    const rule = await createRule(session, {
      name: 'High A1c Alert',
      conditions: {
        combinator: 'and',
        rules: [
          { field: 'observation.lab_a1c', operator: '>', value: 9 },
        ],
      },
    });

    const result = await evaluateRule(session, rule.id, {
      patient_id: 'test-patient',
      data: {
        observation: { lab_a1c: 9.5 },
      },
    });

    expect(result.evaluation_result).toBe(true);
  });
});
```

---

## 🔒 Security Considerations

### 1. Access Control

```typescript
// Check user permissions before rule creation
if (!session.user.permissions.includes('create_rules')) {
  throw new Error('Insufficient permissions');
}

// Audit logging
await auditLog.create({
  user_id: session.user.id,
  action: 'create_rule',
  rule_id: rule.id,
  timestamp: new Date(),
});
```

### 2. Rule Validation

```typescript
// Validate rule before saving
function validateRule(rule: Rule): boolean {
  // Ensure no SQL injection in field names
  const validFields = FHIR_FIELDS_ENTERPRISE.map((f) => f.name);
  for (const condition of rule.conditions.rules) {
    if (!validFields.includes(condition.field)) {
      throw new Error(`Invalid field: ${condition.field}`);
    }
  }

  // Validate operators
  const validOperators = ['=', '!=', '>', '<', '>=', '<=', 'contains', 'in'];
  // ... validation logic

  return true;
}
```

### 3. Sandboxed Testing

```typescript
// Test rule in sandbox before activating
const sandboxResult = await evaluateRuleSandbox(rule, {
  patient_id: 'test-patient-123',
  dryRun: true, // Don't execute actions
});

if (sandboxResult.success) {
  await activateRule(rule.id);
}
```

---

## 📊 Performance Optimization

### 1. Field Memoization

```typescript
// In component
const memoizedFields = useMemo(
  () => getFieldsByCategory(selectedCategory),
  [selectedCategory]
);
```

### 2. Debounced Search

```typescript
// In CodeSearchInput
const debouncedSearch = useMemo(
  () =>
    debounce((term: string) => {
      searchTerminologyServer(term);
    }, 300),
  []
);
```

### 3. Lazy Loading

```typescript
// Load temporal operator builder only when needed
const TemporalOperatorBuilder = lazy(
  () => import('./temporal-operator-builder')
);
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Field Not Showing in Dropdown

**Problem**: Custom field doesn't appear in field selector

**Solution**: Ensure field is added to `FHIR_FIELDS_ENTERPRISE` array

```typescript
// Check field exists
import { getFieldByName } from './fhir-fields-enterprise.config';
const field = getFieldByName('your.field.name');
console.log(field); // Should not be undefined
```

#### 2. Temporal Operator Not Working

**Problem**: Temporal condition not evaluating correctly

**Solution**: Ensure backend supports temporal evaluation

```python
# Backend must implement temporal logic
def evaluate_temporal(operator, field, time_window, data):
    if operator == 'AVG':
        return calculate_average(field, time_window, data)
    elif operator == 'COUNT':
        return count_occurrences(field, time_window, data)
    # ... etc
```

#### 3. Code Search Returns No Results

**Problem**: Code search shows "No results"

**Solution**: Check valueSet is properly configured

```typescript
// Ensure valueSet has correct format
valueSet: [
  {
    code: 'CODE',
    display: 'Display Name',
    definition: 'Optional definition',
  },
];
```

---

## 📚 Additional Resources

- **FHIR R4 Spec**: https://hl7.org/fhir/R4/
- **LOINC Codes**: https://loinc.org/
- **SNOMED CT**: https://www.snomed.org/
- **RxNorm**: https://www.nlm.nih.gov/research/umls/rxnorm/
- **ICD-10-CM**: https://www.cdc.gov/nchs/icd/icd10cm.htm
- **CPT Codes**: https://www.ama-assn.org/practice-management/cpt
- **CDS Hooks**: https://cds-hooks.org/
- **CQL**: https://cql.hl7.org/

---

## 🤝 Support

Questions? Issues? Feature requests?
- GitHub: [Your repo URL]
- Email: [Your email]
- Docs: [Your docs URL]
- Slack: [Your Slack channel]

---

**Happy Rule Building! 🚀🏥**
