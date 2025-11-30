# Rule Engine - Extensible Architecture

## 🎯 Overview

The Rule Engine provides **three seamless ways** to create rules:

1. **Guided Wizard** - Step-by-step, beginner-friendly
2. **AI Assistant** - Natural language + voice input
3. **Visual Builder** - Drag-and-drop with code view

## 🏗️ Architecture

### Core Components

```
rule-condition-builder-v2.tsx    # Main orchestrator
├── rule-builder-modes.tsx       # Mode selector UI
├── guided-rule-builder.tsx      # Wizard mode
├── ai-rule-builder.tsx          # AI/NLP mode
└── (legacy visual builder)      # QueryBuilder integration
```

### Data Flow

```
User Input → Mode Component → Unified Format → Parent onChange
```

All modes output the same format:
```typescript
{
  combinator: 'and' | 'or',
  rules: [
    { field: string, operator: string, value: any }
  ]
}
```

## 🔧 Extensibility

### 1. Adding New Field Types

```typescript
// In your component
const customFields = [
  {
    name: 'custom.score',
    label: 'Risk Score',
    type: 'number',
    inputType: 'number',
    validation: (value) => value >= 0 && value <= 100
  }
];

<RuleConditionBuilder
  availableFields={customFields}
  {...props}
/>
```

### 2. Adding Custom Operators

Edit `operators` array in any mode component:

```typescript
const operators = [
  ...existingOperators,
  { value: 'regex', label: 'matches pattern' },
  { value: 'geo_near', label: 'is near location' }
];
```

### 3. Adding New Builder Modes

**Step 1:** Create your mode component

```typescript
// custom-mode-builder.tsx
export function CustomModeBuilder({ value, onChange, availableFields }: Props) {
  // Your custom UI
  return <div>...</div>;
}
```

**Step 2:** Add to mode selector

```typescript
// rule-builder-modes.tsx
export type RuleBuilderMode = 'visual' | 'guided' | 'ai' | 'custom';

// Add button in selector
<button onClick={() => onChange('custom')}>
  <CustomIcon /> Custom
</button>
```

**Step 3:** Integrate in main component

```typescript
// rule-condition-builder-v2.tsx
{builderMode === 'custom' && (
  <CustomModeBuilder {...props} />
)}
```

### 4. Enhancing AI Mode

Replace `simulateAIProcessing` with real AI:

```typescript
const processNaturalLanguage = async () => {
  const response = await fetch('/api/ai/parse-rule', {
    method: 'POST',
    body: JSON.stringify({
      text: input,
      availableFields,
      context: 'healthcare'
    })
  });

  const result = await response.json();
  onChange(result);
};
```

### 5. Adding Rule Templates

```typescript
const templates = [
  {
    name: 'High BP Alert',
    description: 'Alert for elevated blood pressure',
    rule: {
      combinator: 'and',
      rules: [
        { field: 'var.bp_systolic', operator: '>', value: 140 },
        { field: 'var.bp_diastolic', operator: '>', value: 90 }
      ]
    }
  }
];

// Add template selector in UI
<TemplateSelector
  templates={templates}
  onSelect={(template) => onChange(template.rule)}
/>
```

### 6. Custom Validation

```typescript
interface ExtendedRuleConditionBuilderProps {
  value: any;
  onChange: (value: any) => void;
  validators?: Array<(rule: any) => { valid: boolean; message?: string }>;
}

const customValidators = [
  (rule) => ({
    valid: rule.rules.length > 0,
    message: 'At least one condition required'
  }),
  (rule) => ({
    valid: rule.rules.every(r => r.value !== ''),
    message: 'All fields must have values'
  })
];
```

### 7. Plugin Architecture Example

```typescript
// rule-plugin.interface.ts
export interface RulePlugin {
  id: string;
  name: string;
  icon: React.ComponentType;
  component: React.ComponentType<RuleBuilderProps>;
  convert: (value: any) => any; // Convert to standard format
}

// usage
const plugins: RulePlugin[] = [
  {
    id: 'flowchart',
    name: 'Flowchart Builder',
    icon: GitBranch,
    component: FlowchartRuleBuilder,
    convert: (flowchart) => convertFlowchartToRules(flowchart)
  }
];
```

## 🎨 UI Customization

### Ultra-Compact Mode

Already implemented:
- Reduced padding (p-3 → p-2)
- Smaller fonts (text-sm → text-xs)
- Tighter spacing (gap-4 → gap-2)
- Compact buttons (h-8 → h-7)

### Custom Styling

```typescript
// Override CSS module
import customStyles from './custom-rule-builder.module.css';

<Card className={`p-2 ${customStyles.myCustomStyle}`}>
```

## 🎤 Voice Integration

The AI mode includes Web Speech API integration:

```javascript
// Already works in Chrome/Edge
startVoiceInput() // Activates microphone
stopVoiceInput()  // Stops listening
```

To extend:
```javascript
// Add language support
recognition.lang = 'es-ES'; // Spanish

// Add continuous mode
recognition.continuous = true;

// Add interim results
recognition.interimResults = true;
```

## 🔌 Integration Points

### 1. Parent Component

```typescript
function RuleCreatePage() {
  const [conditions, setConditions] = useState({});

  return (
    <RuleConditionBuilder
      value={conditions}
      onChange={setConditions}
      availableFields={customFields}
    />
  );
}
```

### 2. API Integration

```typescript
// Auto-save draft
useEffect(() => {
  const timer = setTimeout(() => {
    saveDraft(conditions);
  }, 1000);
  return () => clearTimeout(timer);
}, [conditions]);
```

### 3. Real-time Validation

```typescript
const [errors, setErrors] = useState([]);

useEffect(() => {
  const validationErrors = validateRule(conditions);
  setErrors(validationErrors);
}, [conditions]);
```

## 📊 Performance Optimization

### Lazy Loading

```typescript
const AIRuleBuilder = dynamic(() =>
  import('./ai-rule-builder').then(mod => mod.AIRuleBuilder),
  { loading: () => <Spinner /> }
);
```

### Memoization

```typescript
const MemoizedGuidedBuilder = memo(GuidedRuleBuilder, (prev, next) => {
  return JSON.stringify(prev.value) === JSON.stringify(next.value);
});
```

## 🧪 Testing Extensions

```typescript
describe('Custom Field Type', () => {
  it('should validate custom field', () => {
    const field = { name: 'custom.score', type: 'number' };
    const result = validateField(field, 150);
    expect(result.valid).toBe(false);
  });
});
```

## 🚀 Future Enhancements

1. **Visual Flow Builder** - Flowchart-style rule creation
2. **Natural Language Templates** - Pre-built prompts
3. **Multi-language Support** - i18n for global use
4. **Collaborative Editing** - Real-time multi-user editing
5. **Rule Versioning** - Track changes and rollback
6. **A/B Testing** - Test rule variations
7. **Performance Metrics** - Built-in analytics
8. **Rule Marketplace** - Share and import templates

## 📝 Code Conventions

- **File naming**: `kebab-case.tsx`
- **Component naming**: `PascalCase`
- **Props interface**: `ComponentNameProps`
- **Mode naming**: `'lowercase'` string literals
- **Styling**: CSS modules with `.module.css`

## 🤝 Contributing

To add new features:

1. Create feature branch
2. Add component in `/components/rules/`
3. Update exports in `rule-condition-builder-v2.tsx`
4. Add documentation
5. Create PR with tests

## 📚 Examples

See `/docs/examples/` for:
- Custom operators
- Custom field types
- Template libraries
- AI integration patterns
- Plugin examples
