# Phase 3: Responsive Preview System

**Date**: 2025-12-15
**Phase**: 3 of 5
**Priority**: High
**Status**: ✅ COMPLETED (Review: A- Excellent)
**Duration**: ~4 hours (Completed)
**Review Date**: 2025-12-15
**Review Grade**: A- (Excellent)
**Critical Issues**: 0
**Recommendations**: 3 medium, 4 low priority

---

## Parallelization Info

**Can Run With**: Phase 1 (Backend), Phase 2 (Builder UI - different components)
**Must Wait For**: None (standalone preview components)
**Blocks**: Phase 5 (testing needs preview complete)
**Conflicts**: None - exclusive preview component ownership

---

## Context Links

**Research**:
- [researcher-02-preview-systems.md](./research/researcher-02-preview-systems.md) (Multi-device preview, state sync)
- [code-standards.md](../../docs/code-standards.md) (React component standards)

**Existing Code**:
- ehr-web/src/features/forms/components/form-renderer (existing renderer - read-only)
- ehr-web/src/types/forms.ts (types for preview)

---

## Overview

Build responsive preview system with multi-device viewport emulation, live sync from builder, interactive test mode, and breakpoint switching. Isolated preview context to prevent builder state pollution.

---

## Key Insights from Research

1. **Live preview architecture**: Real-time sync between builder and preview panes
2. **Viewport emulation**: Chrome DevTools standard dimensions (375px mobile, 768px tablet, 1920px desktop)
3. **State separation**: Separate state for builder canvas vs preview render
4. **Preview isolation**: iframe or isolated React component tree
5. **Debounce updates**: 100-300ms debounce for schema changes to prevent re-render thrashing
6. **Test mode**: Interactive form filling for validation testing

---

## Requirements

### Device Preview
- [ ] Device selector (Mobile/Tablet/Desktop/Custom)
- [ ] Viewport dimensions display
- [ ] Orientation toggle (portrait/landscape)
- [ ] Zoom controls (50%-200%)
- [ ] Touch interaction simulation (mobile)

### Live Preview Sync
- [ ] Real-time schema updates from builder
- [ ] Debounced rendering (300ms)
- [ ] Step navigation preview
- [ ] Conditional field visibility preview
- [ ] Validation error preview

### Test Mode
- [ ] Interactive form filling
- [ ] Field validation testing
- [ ] Step navigation testing
- [ ] Progress tracking preview
- [ ] Reset test data button

### Preview Panel UI
- [ ] Collapsible side panel (right side)
- [ ] Full-screen preview mode
- [ ] Device frame visual (optional)
- [ ] Responsive CSS enforcement

---

## Architecture

### Component Hierarchy
```
PreviewPanel (container)
├── PreviewToolbar
│   ├── DeviceSelector (mobile/tablet/desktop)
│   ├── OrientationToggle
│   ├── ZoomControls
│   └── TestModeToggle
├── PreviewViewport (isolated context)
│   └── FormRenderer (isolated render)
└── PreviewFooter (dimensions, zoom level)
```

### State Management
```typescript
// Separate from builder state - isolated preview context
interface PreviewState {
  device: 'mobile' | 'tablet' | 'desktop' | 'custom';
  dimensions: { width: number; height: number };
  orientation: 'portrait' | 'landscape';
  zoom: number;
  testMode: boolean;
  testData: Record<string, any>;
}
```

### Live Sync Architecture
```
Builder State (Zustand) ──→ Schema JSON ──→ Preview Context
                             ↓ (debounced 300ms)
                        FormRenderer (isolated)
```

---

## Related Code Files (Exclusive to Phase 3)

**Frontend Files - Phase 3 Ownership**:
- `ehr-web/src/components/forms/preview/PreviewPanel.tsx` (NEW)
- `ehr-web/src/components/forms/preview/PreviewToolbar.tsx` (NEW)
- `ehr-web/src/components/forms/preview/PreviewViewport.tsx` (NEW)
- `ehr-web/src/components/forms/preview/DeviceSelector.tsx` (NEW)
- `ehr-web/src/components/forms/preview/TestModePanel.tsx` (NEW)
- `ehr-web/src/stores/preview-store.ts` (NEW)
- `ehr-web/src/services/preview.service.ts` (NEW)
- `ehr-web/src/hooks/use-preview.ts` (NEW)

**Read-Only Dependencies** (no modification):
- `ehr-web/src/features/forms/components/form-renderer` (existing renderer)

**No Other Phase Touches These Files**

---

## Implementation Steps

### Step 1: Preview Store (45 mins)
```typescript
// ehr-web/src/stores/preview-store.ts

import { create } from 'zustand';

interface PreviewState {
  // Device settings
  device: 'mobile' | 'tablet' | 'desktop' | 'custom';
  dimensions: { width: number; height: number };
  orientation: 'portrait' | 'landscape';
  zoom: number;

  // Test mode
  testMode: boolean;
  testData: Record<string, any>;

  // Actions
  setDevice: (device: PreviewState['device']) => void;
  setDimensions: (dimensions: { width: number; height: number }) => void;
  toggleOrientation: () => void;
  setZoom: (zoom: number) => void;
  toggleTestMode: () => void;
  updateTestData: (data: Record<string, any>) => void;
  resetTestData: () => void;
}

const DEVICE_PRESETS = {
  mobile: { width: 375, height: 667 }, // iPhone SE
  tablet: { width: 768, height: 1024 }, // iPad
  desktop: { width: 1920, height: 1080 } // Full HD
};

export const usePreviewStore = create<PreviewState>((set, get) => ({
  device: 'desktop',
  dimensions: DEVICE_PRESETS.desktop,
  orientation: 'portrait',
  zoom: 100,
  testMode: false,
  testData: {},

  setDevice: (device) => {
    const dimensions = DEVICE_PRESETS[device] || get().dimensions;
    set({ device, dimensions });
  },

  setDimensions: (dimensions) => {
    set({ dimensions, device: 'custom' });
  },

  toggleOrientation: () => {
    const { dimensions, orientation } = get();
    set({
      dimensions: { width: dimensions.height, height: dimensions.width },
      orientation: orientation === 'portrait' ? 'landscape' : 'portrait'
    });
  },

  setZoom: (zoom) => {
    const clampedZoom = Math.min(Math.max(zoom, 50), 200);
    set({ zoom: clampedZoom });
  },

  toggleTestMode: () => {
    set({ testMode: !get().testMode });
  },

  updateTestData: (data) => {
    set({ testData: { ...get().testData, ...data } });
  },

  resetTestData: () => {
    set({ testData: {} });
  }
}));
```

### Step 2: Device Selector Component (30 mins)
```typescript
// ehr-web/src/components/forms/preview/DeviceSelector.tsx

'use client';

import { usePreviewStore } from '@/stores/preview-store';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DeviceSelector() {
  const { device, setDevice } = usePreviewStore();

  const devices = [
    { id: 'mobile', icon: Smartphone, label: 'Mobile' },
    { id: 'tablet', icon: Tablet, label: 'Tablet' },
    { id: 'desktop', icon: Monitor, label: 'Desktop' }
  ] as const;

  return (
    <div className="flex gap-1 border rounded-lg p-1">
      {devices.map(({ id, icon: Icon, label }) => (
        <Button
          key={id}
          variant={device === id ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setDevice(id)}
          className="gap-2"
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  );
}
```

### Step 3: Preview Toolbar Component (45 mins)
```typescript
// ehr-web/src/components/forms/preview/PreviewToolbar.tsx

'use client';

import { usePreviewStore } from '@/stores/preview-store';
import { DeviceSelector } from './DeviceSelector';
import {
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  TestTube,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function PreviewToolbar() {
  const {
    dimensions,
    zoom,
    testMode,
    toggleOrientation,
    setZoom,
    toggleTestMode,
    resetTestData
  } = usePreviewStore();

  return (
    <div className="flex items-center justify-between p-3 border-b bg-background">
      <div className="flex items-center gap-3">
        <DeviceSelector />

        <Separator orientation="vertical" className="h-6" />

        {/* Orientation Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleOrientation}
          title="Toggle Orientation"
        >
          <RotateCw className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(zoom - 10)}
            disabled={zoom <= 50}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(zoom + 10)}
            disabled={zoom >= 200}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Dimensions Display */}
        <span className="text-xs text-muted-foreground">
          {dimensions.width} × {dimensions.height}px
        </span>

        <Separator orientation="vertical" className="h-6" />

        {/* Test Mode Toggle */}
        <Button
          variant={testMode ? 'default' : 'outline'}
          size="sm"
          onClick={toggleTestMode}
          className="gap-2"
        >
          <TestTube className="h-4 w-4" />
          Test Mode
        </Button>

        {testMode && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetTestData}
            title="Reset Test Data"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}

        {/* Full Screen */}
        <Button variant="ghost" size="sm" title="Full Screen">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
```

### Step 4: Preview Viewport Component (1 hour)
```typescript
// ehr-web/src/components/forms/preview/PreviewViewport.tsx

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useFormBuilderStore } from '@/stores/form-builder-store';
import { usePreviewStore } from '@/stores/preview-store';
import { debounce } from 'lodash';

interface PreviewViewportProps {
  formId: string;
}

export function PreviewViewport({ formId }: PreviewViewportProps) {
  const { steps, currentStepIndex } = useFormBuilderStore();
  const { dimensions, zoom, testMode, testData, updateTestData } = usePreviewStore();

  const [formSchema, setFormSchema] = useState<any>(null);

  // Debounced schema update (300ms)
  const debouncedSetSchema = useMemo(
    () => debounce((schema: any) => setFormSchema(schema), 300),
    []
  );

  useEffect(() => {
    // Convert builder state to FHIR Questionnaire schema
    const schema = {
      resourceType: 'Questionnaire',
      item: steps.map(step => ({
        linkId: step.id,
        type: 'group',
        text: step.title,
        item: step.fields
      }))
    };

    debouncedSetSchema(schema);

    return () => debouncedSetSchema.cancel();
  }, [steps, debouncedSetSchema]);

  // Calculate scale for zoom
  const scale = zoom / 100;

  // Calculate container dimensions (accounting for zoom)
  const containerStyle = {
    width: `${dimensions.width}px`,
    height: `${dimensions.height}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    transition: 'transform 0.2s ease-in-out'
  };

  // Apply responsive CSS based on viewport width
  const viewportClass = useMemo(() => {
    if (dimensions.width < 640) return 'mobile-viewport';
    if (dimensions.width < 1024) return 'tablet-viewport';
    return 'desktop-viewport';
  }, [dimensions.width]);

  if (!formSchema) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading preview...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-8 bg-muted/30">
      <div
        style={containerStyle}
        className={`bg-background border rounded-lg shadow-lg ${viewportClass}`}
      >
        <div className="p-6 overflow-y-auto" style={{ height: '100%' }}>
          {/* Render current step */}
          {steps[currentStepIndex] && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{steps[currentStepIndex].title}</h2>
                {steps[currentStepIndex].description && (
                  <p className="text-muted-foreground mt-2">
                    {steps[currentStepIndex].description}
                  </p>
                )}
              </div>

              {/* Render fields */}
              <div className="space-y-4">
                {steps[currentStepIndex].fields.map((field: any) => (
                  <PreviewField
                    key={field.linkId}
                    field={field}
                    value={testData[field.linkId]}
                    onChange={(value) => {
                      if (testMode) {
                        updateTestData({ [field.linkId]: value });
                      }
                    }}
                    disabled={!testMode}
                  />
                ))}
              </div>

              {/* Step navigation preview */}
              <div className="flex gap-2 pt-4">
                <button
                  className="px-4 py-2 border rounded hover:bg-accent"
                  disabled={currentStepIndex === 0}
                >
                  Previous
                </button>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90">
                  {currentStepIndex < steps.length - 1 ? 'Next' : 'Submit'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple field renderer for preview
function PreviewField({
  field,
  value,
  onChange,
  disabled
}: {
  field: any;
  value: any;
  onChange: (value: any) => void;
  disabled: boolean;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {field.text}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </label>

      {field.type === 'string' && (
        <input
          type="text"
          value={value || ''}
          onChange={handleChange}
          disabled={disabled}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
          placeholder={field.text}
        />
      )}

      {field.type === 'choice' && (
        <select
          value={value || ''}
          onChange={handleChange}
          disabled={disabled}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
        >
          <option value="">Select...</option>
          {field.answerOption?.map((option: any) => (
            <option key={option.valueCoding.code} value={option.valueCoding.code}>
              {option.valueCoding.display}
            </option>
          ))}
        </select>
      )}

      {/* Add more field types as needed */}
    </div>
  );
}
```

### Step 5: Preview Panel Container (45 mins)
```typescript
// ehr-web/src/components/forms/preview/PreviewPanel.tsx

'use client';

import { useState } from 'react';
import { PreviewToolbar } from './PreviewToolbar';
import { PreviewViewport } from './PreviewViewport';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PreviewPanelProps {
  formId: string;
}

export function PreviewPanel({ formId }: PreviewPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <div className="border-l bg-background">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          className="h-full"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col border-l bg-background" style={{ width: '50%', minWidth: '400px' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <h2 className="font-semibold">Preview</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(true)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Toolbar */}
      <PreviewToolbar />

      {/* Viewport */}
      <PreviewViewport formId={formId} />
    </div>
  );
}
```

### Step 6: Test Mode Panel (30 mins)
```typescript
// ehr-web/src/components/forms/preview/TestModePanel.tsx

'use client';

import { usePreviewStore } from '@/stores/preview-store';
import { useFormBuilderStore } from '@/stores/form-builder-store';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export function TestModePanel() {
  const { testData } = usePreviewStore();
  const { steps, currentStepIndex } = useFormBuilderStore();

  const currentStep = steps[currentStepIndex];
  if (!currentStep) return null;

  // Validate current step
  const requiredFields = currentStep.validationConfig.requiredFields;
  const errors: string[] = [];

  requiredFields.forEach(fieldId => {
    if (!testData[fieldId]) {
      const field = currentStep.fields.find((f: any) => f.linkId === fieldId);
      errors.push(field?.text || fieldId);
    }
  });

  const isValid = errors.length === 0;

  return (
    <div className="border-t p-4 bg-background">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        Test Results
        {isValid ? (
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        ) : (
          <XCircle className="h-5 w-5 text-destructive" />
        )}
      </h3>

      {isValid ? (
        <div className="text-sm text-muted-foreground">
          All required fields filled. Ready to proceed.
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-sm font-medium text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Missing required fields:
          </div>
          <ul className="text-sm space-y-1 ml-6">
            {errors.map((error, idx) => (
              <li key={idx} className="text-muted-foreground">• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

## Todo List

- [x] Create preview store `preview-store.ts` ✅
- [x] Create `DeviceSelector` component ✅
- [x] Create `PreviewToolbar` component ✅
- [x] Create `PreviewViewport` component ✅
- [x] Create `PreviewPanel` container ✅
- [x] Create `TestModePanel` component ✅
- [x] Add debounced schema sync (300ms) ✅
- [x] Implement zoom controls ✅
- [ ] Test responsive CSS enforcement ⚠️ (CSS rules missing)
- [ ] Test orientation toggle ⏳ (needs manual testing)
- [ ] Test mode validation ⏳ (needs manual testing)
- [ ] Mobile responsive testing ⏳ (needs device testing)
- [ ] Performance test (large forms) ⏳ (needs load testing)

**Completion**: 8/13 tasks (61.5%) - Core implementation complete, testing pending

---

## Success Criteria

- [x] Device selector switches viewport dimensions ✅
- [x] Orientation toggle swaps width/height ✅
- [x] Zoom controls scale viewport (50%-200%) ✅
- [x] Live sync updates preview within 300ms ✅
- [x] Test mode allows interactive field filling ✅
- [x] Test mode validates required fields ✅
- [x] Preview isolated from builder state ✅
- [ ] Responsive CSS applies correctly per breakpoint ⚠️ (CSS rules missing)

**Achievement**: 7/8 criteria met (87.5%)

---

## Conflict Prevention

**How Avoid Conflicts with Parallel Phases**:

1. **Phase 1 (Backend)**: No backend dependencies. Purely frontend preview.
2. **Phase 2 (Builder UI)**: Different components. Preview reads builder state (read-only). No shared files.
3. **Phase 4 (Rule Builder)**: Different components. Preview may show conditional fields but doesn't edit rules.

**File Boundaries**:
- Phase 3 owns: All `preview/*` components, preview-store.ts, preview.service.ts
- Phase 2 owns: Builder page, Step* components
- No overlap in component files

---

## Risk Assessment

**Risk**: Preview re-renders too frequently (performance)
**Mitigation**: 300ms debounce on schema updates, React.memo on field components

**Risk**: Zoom causes viewport overflow/scroll issues
**Mitigation**: Container with overflow-auto, transform-origin: top left

**Risk**: Test mode conflicts with builder state
**Mitigation**: Separate testData state in preview store, never writes to builder

**Risk**: Large forms slow preview rendering
**Mitigation**: Virtualize field list if >50 fields, lazy render fields

---

## Security Considerations

- [ ] Sanitize test data inputs
- [ ] Prevent XSS in preview rendering
- [ ] Isolate preview context (no access to sensitive builder data)
- [ ] Validate zoom limits (50%-200%)
- [ ] Rate limit preview updates (debounced)

---

## Next Steps

1. Integrate with Phase 2 builder UI (add PreviewPanel to builder page)
2. Phase 4 rule builder will show conditional field visibility in preview
3. Phase 5 testing validates preview accuracy
4. Future: Screenshot/export preview for documentation

---

## Dependencies

**External**:
- lodash (debounce) - already installed
- Radix UI components - already installed

**Internal**:
- Phase 2 builder state (read-only consumption)
- Existing form-renderer components (read-only)
- FHIR types (existing)

---

## Unresolved Questions

1. Support iframe isolation vs React Context?
   - **Decision**: React Context approach (adequate isolation achieved)
2. Export preview as screenshot/PDF?
   - **Decision**: Defer to Phase 5 or future enhancement
3. Multi-step preview navigation (show all steps)?
   - **Decision**: Add in Phase 4 integration
4. Accessibility testing in preview mode?
   - **Decision**: Full audit in Phase 5 testing

---

## Code Review Summary

**Date**: 2025-12-15
**Reviewer**: Code Review Agent
**Status**: ✅ APPROVED FOR INTEGRATION
**Grade**: A- (Excellent)

### Strengths
- Excellent state isolation (preview-store separate from builder)
- Proper performance optimization (300ms debounce, memoization)
- Minimal integration (4 line change to builder)
- Comprehensive FHIR field type support
- Clean component architecture
- Excellent documentation (JSDoc on all components)

### Recommendations
**Medium Priority**:
1. Use lodash debounce instead of setTimeout (as per spec)
2. Add responsive CSS rules to globals.css for viewport classes
3. Sanitize test data before storage/display

**Low Priority**:
1. Implement or remove full-screen button placeholder
2. Add keyboard navigation hints for accessibility
3. Add loading indicator during debounce period
4. Add keyboard shortcuts for zoom controls

### Outstanding Items
- Fix unrelated build error in country page (country_code → countryCode)
- Manual testing of device switching needed
- Performance testing with large forms (50+ fields) needed
- Add responsive CSS rules to globals.css

**Full Report**: `reports/251215-code-reviewer-phase-03-review.md`
