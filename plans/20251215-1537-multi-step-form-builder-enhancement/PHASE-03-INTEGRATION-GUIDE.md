# Phase 3 Integration Guide: Responsive Preview System

**For**: Phase 2 Builder UI Integration
**Date**: 2025-12-15

---

## Overview

This guide shows how to integrate the Phase 3 Responsive Preview System with the existing form builder (Phase 2).

---

## Quick Start

### 1. Import PreviewPanel

```tsx
// In: ehr-web/src/app/forms/builder/[[...id]]/page.tsx

import { PreviewPanel } from '@/components/forms/preview';
```

### 2. Add to Layout

Find the main layout div in the builder page and add PreviewPanel:

```tsx
export default function FormBuilderPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<QuestionnaireItem[]>([]);

  return (
    <div className="h-screen flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b">
        {/* Existing toolbar */}
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Component Library */}
        <div className="w-64 shrink-0">
          {/* Existing component library */}
        </div>

        {/* Center: Builder Canvas */}
        <div className="flex-1">
          {/* Existing canvas */}
        </div>

        {/* Right Panel: Preview (NEW) */}
        <PreviewPanel
          title={title}
          description={description}
          questions={questions}
        />
      </div>
    </div>
  );
}
```

---

## Component API

### PreviewPanel Props

```tsx
interface PreviewPanelProps {
  title: string;          // Form title (from builder state)
  description?: string;   // Form description (optional)
  questions: QuestionnaireItem[];  // Array of form questions
}
```

### QuestionnaireItem Type

```tsx
interface QuestionnaireItem {
  linkId: string;         // Unique field identifier
  text?: string;          // Question text
  type: string;           // FHIR type (string, integer, choice, etc.)
  required?: boolean;     // Is field required?
  item?: QuestionnaireItem[];  // Nested fields (for groups)
  answerOption?: Array<{ valueString?: string }>;  // Options for choice fields
  [key: string]: any;     // Other FHIR extensions
}
```

---

## Features Available

### 1. Device Switching
Users can switch between:
- **Mobile**: 375 x 667px (iPhone SE)
- **Tablet**: 768 x 1024px (iPad)
- **Desktop**: 1920 x 1080px (Full HD)

### 2. Orientation Toggle
- Portrait (default)
- Landscape (swaps width/height)

### 3. Zoom Controls
- Range: 50% - 200%
- Increments: 10%
- Visual scaling via CSS transform

### 4. Test Mode
- Interactive field filling
- Real-time validation
- Required field checking
- Completion progress tracking

### 5. Live Sync
- Updates preview as questions change
- 300ms debounce (automatic)
- No manual refresh needed

---

## State Management

### Preview Store (Isolated)

The preview system uses its own Zustand store (`preview-store.ts`) that is **completely isolated** from builder state.

**Builder State → Preview State** (one-way via props)
- Builder changes questions → Preview renders updated questions
- Preview test data → Isolated (doesn't affect builder)

### Using the Preview Hook (Optional)

```tsx
import { useFormPreview } from '@/hooks/use-form-preview';

function MyComponent() {
  const {
    device,
    zoom,
    testMode,
    validation,
    setDevice,
    toggleTestMode
  } = useFormPreview(questions);

  // Access preview state and helpers
}
```

---

## Styling Considerations

### Responsive Classes

Preview applies these classes automatically based on viewport width:
- `.mobile-viewport` - < 640px
- `.tablet-viewport` - 640px - 1024px
- `.desktop-viewport` - > 1024px

### CSS Variables

Preview uses standard Tailwind theme variables. No custom CSS needed.

---

## Performance Notes

### Debouncing

Preview automatically debounces question updates (300ms) to prevent re-render thrashing when user rapidly edits.

```tsx
// Automatic in PreviewViewport component
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedQuestions(questions);
  }, 300);
  return () => clearTimeout(timer);
}, [questions]);
```

### Memoization

Viewport styles and classes are memoized for performance:

```tsx
const containerStyle = useMemo(() => ({
  width: `${dimensions.width}px`,
  height: `${dimensions.height}px`,
  transform: `scale(${zoom / 100})`,
  transformOrigin: 'top-left'
}), [dimensions, zoom]);
```

---

## Supported Field Types

### Basic Types
- ✅ `string` - Text input
- ✅ `text` - Long text (textarea)
- ✅ `integer` - Number input
- ✅ `decimal` - Decimal input
- ✅ `boolean` - Yes/No radio

### Date/Time Types
- ✅ `date` - Date picker
- ✅ `time` - Time picker
- ✅ `dateTime` - DateTime picker

### Selection Types
- ✅ `choice` - Single select (radio)
- ✅ `open-choice` - Multi-select (checkbox)

### Advanced Types
- ✅ `attachment` - File upload
- ✅ `display` - Display-only elements

### Layout Types
- ✅ `group` - Container for nested fields
- ✅ Columns layout (via extension)

### Display Elements
- ✅ Heading (via extension)
- ✅ Description (via extension)
- ✅ Separator (via extension)

---

## Common Patterns

### Pattern 1: Collapsible Preview

Preview panel has built-in collapse/expand functionality:
- Click chevron button to collapse
- Shows vertical "Preview" tab when collapsed
- Click tab to expand

### Pattern 2: Test Mode Workflow

```tsx
// 1. User enables test mode (toolbar button)
// 2. User fills out form in preview
// 3. Validation feedback shows in TestModePanel
// 4. User can reset test data anytime
```

### Pattern 3: Device Testing

```tsx
// 1. User selects mobile device
// 2. Preview resizes to 375px width
// 3. User can toggle orientation
// 4. User can zoom in/out to inspect
```

---

## Troubleshooting

### Issue: Preview not updating

**Cause**: Questions array reference not changing
**Solution**: Ensure questions array is immutably updated

```tsx
// Bad
questions.push(newQuestion);
setQuestions(questions);

// Good
setQuestions([...questions, newQuestion]);
```

### Issue: Preview too small/large

**Cause**: Container constraints
**Solution**: Ensure parent has flex layout

```tsx
<div className="flex-1 flex overflow-hidden">
  <PreviewPanel {...props} />
</div>
```

### Issue: Test data not resetting

**Cause**: Test mode not enabled
**Solution**: Enable test mode first, then click reset

---

## Advanced Usage

### Custom Preview Service

```tsx
import {
  validateTestData,
  flattenQuestions,
  getRequiredFields
} from '@/services/preview.service';

// Get all required field IDs
const requiredIds = getRequiredFields(questions);

// Validate test data
const validation = validateTestData(questions, testData);
console.log(validation.isValid); // true/false
```

### Custom Validation Logic

```tsx
import { usePreviewStore } from '@/stores/preview-store';

function MyComponent() {
  const testData = usePreviewStore(state => state.testData);

  // Add custom validation
  const hasEmail = testData['email_field']?.includes('@');
  const hasPhone = /^\d{10}$/.test(testData['phone_field']);
}
```

---

## Testing Integration

### Manual Testing Checklist

- [ ] Preview updates when questions change
- [ ] Device selector switches dimensions
- [ ] Orientation toggle works
- [ ] Zoom controls function (50%-200%)
- [ ] Test mode enables field interaction
- [ ] Validation shows required fields
- [ ] Test data resets properly
- [ ] Panel collapses/expands
- [ ] Responsive CSS applies correctly

### Automated Testing (Phase 5)

```tsx
// Example test (to be added in Phase 5)
import { render } from '@testing-library/react';
import { PreviewPanel } from '@/components/forms/preview';

test('renders preview with questions', () => {
  const questions = [
    { linkId: 'q1', text: 'Name', type: 'string' }
  ];

  const { getByText } = render(
    <PreviewPanel
      title="Test Form"
      questions={questions}
    />
  );

  expect(getByText('Test Form')).toBeInTheDocument();
  expect(getByText('Name')).toBeInTheDocument();
});
```

---

## Migration from Old Preview

If builder had existing preview functionality:

1. **Remove old preview components**
2. **Import new PreviewPanel**
3. **Pass same props** (title, description, questions)
4. **Remove manual sync code** (automatic now)
5. **Test all features**

---

## Future Enhancements

### Planned Features (Not Yet Implemented)
- Screenshot/PDF export
- Multi-step navigation preview
- Accessibility testing mode
- Custom device presets
- Preview themes (light/dark)

### Request Features
Open issue in project repo with "preview" label.

---

## Support

### Documentation
- [Phase 3 Report](./reports/251215-fullstack-dev-phase-03-report.md)
- [Phase 3 Spec](./phase-03-responsive-preview-system.md)

### Code Examples
- See `PreviewPanel.tsx` for full implementation
- Check `preview-store.ts` for state management
- Review `preview.service.ts` for utilities

---

## Summary

**Integration Steps**:
1. Import `PreviewPanel`
2. Add to builder layout (right side)
3. Pass `title`, `description`, `questions` props
4. Done! Preview works automatically

**Key Points**:
- ✅ Zero configuration needed
- ✅ Automatic live sync (300ms debounce)
- ✅ Isolated state (no conflicts)
- ✅ Full field type support
- ✅ Built-in validation feedback

**Ready to integrate!** 🚀

---
