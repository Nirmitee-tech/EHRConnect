# Multi-Step Form Builder Enhancement - Parallel Implementation Plan

**Date**: 2025-12-15
**Plan ID**: 20251215-1537
**Priority**: High
**Execution Strategy**: Parallel with explicit dependencies

---

## Executive Summary

Enhance EHRConnect form builder with multi-step wizard navigation, responsive preview system, advanced rule builder, and clinical trial (eCRF) support. Plan optimized for parallel execution with 5 independent phases.

**Key Enhancement Areas**:
- Multi-step/wizard form navigation with screen transitions
- Responsive preview (mobile/tablet/desktop) with live sync
- Enhanced rule builder for conditional logic and screen routing
- Clinical trial visit-based form templates
- Test/preview mode for validation

---

## Parallelization Strategy

### Execution Groups

**Group A - Parallel Execution (Start Immediately)**:
- Phase 1: Backend API & Database (ehr-api)
- Phase 2: Frontend Form Builder UI (ehr-web builder pages)
- Phase 3: Preview System Components (isolated components)

**Group B - Parallel Execution (After Group A Phase 1 Complete)**:
- Phase 4: Rule Builder Enhancement (after Phase 1 DB schema)
- Phase 5: Testing & Documentation (after all phases code complete)

### Dependency Matrix

```
Phase 1 (Backend) ────┬───→ Phase 4 (Rule Builder)
                      │
                      └───→ Phase 5 (Testing)

Phase 2 (Builder UI) ─────→ Phase 5 (Testing)

Phase 3 (Preview) ────────→ Phase 5 (Testing)
```

**Conflict-Free Guarantee**: No file modified in multiple phases. Each phase owns exclusive file set.

---

## Phase Overview

### Phase 1: Backend API & Database Schema
**Files**: ehr-api migrations, routes/forms.js, services/forms.service.js
**Can Run With**: Phase 2, Phase 3
**Must Wait For**: None
**Duration**: ~4 hours

Add multi-step metadata, visit templates, form progress tracking, preview mode support.

[Details: phase-01-backend-api-database.md](./phase-01-backend-api-database.md)

---

### Phase 2: Frontend Form Builder UI
**Files**: ehr-web/src/app/forms/builder, new wizard components
**Can Run With**: Phase 1, Phase 3
**Must Wait For**: None (types can be added incrementally)
**Duration**: ~6 hours

Step management, navigation controls, wizard layout, screen editor, progress indicators.

[Details: phase-02-frontend-builder-ui.md](./phase-02-frontend-builder-ui.md)

---

### Phase 3: Responsive Preview System
**Files**: New preview components, preview service
**Can Run With**: Phase 1, Phase 2
**Must Wait For**: None
**Duration**: ~4 hours

Device viewport emulation, live preview sync, test mode, breakpoint switching.

[Details: phase-03-responsive-preview-system.md](./phase-03-responsive-preview-system.md)

---

### Phase 4: Enhanced Rule Builder
**Files**: ehr-web/src/components/rules, forms.service.ts methods
**Can Run With**: Phase 2 (different files), Phase 3
**Must Wait For**: Phase 1 complete (DB schema for step-level rules)
**Duration**: ~5 hours

Step-level rules, screen skip logic, conditional branching, visual rule testing.

[Details: phase-04-enhanced-rule-builder.md](./phase-04-enhanced-rule-builder.md)

---

### Phase 5: Testing & Documentation
**Files**: Test files, docs
**Can Run With**: None (integration phase)
**Must Wait For**: Phases 1-4 code complete
**Duration**: ~3 hours

Integration testing, E2E wizard flows, documentation, migration guides.

[Details: phase-05-testing-documentation.md](./phase-05-testing-documentation.md)

---

## File Ownership Matrix

### Backend (ehr-api)
```
Phase 1 ONLY:
- src/database/migrations/251215000001-multi-step-forms.js
- src/routes/forms.js (multi-step endpoints)
- src/services/forms.service.js (step management)
- src/services/forms-versioning.service.js (minor)

Phase 4 ONLY:
- src/services/rule-engine.service.js (step rules)
```

### Frontend (ehr-web)
```
Phase 2 ONLY:
- src/app/forms/builder/[[...id]]/page.tsx (wizard UI)
- src/components/forms/StepNavigator.tsx (NEW)
- src/components/forms/StepEditor.tsx (NEW)
- src/components/forms/WizardProgress.tsx (NEW)
- src/services/forms.service.ts (step methods)

Phase 3 ONLY:
- src/components/forms/PreviewPane.tsx (NEW)
- src/components/forms/DeviceSelector.tsx (NEW)
- src/components/forms/TestModePanel.tsx (NEW)
- src/services/preview.service.ts (NEW)

Phase 4 ONLY:
- src/components/rules/StepRuleBuilder.tsx (NEW)
- src/components/rules/ConditionEditor.tsx (NEW)
- src/types/forms.ts (rule types section ONLY)
```

**Conflict Prevention**: No file appears in multiple phases. Service methods added to different sections.

---

## Technical Architecture

### Multi-Step Data Model (FHIR-Compliant)
```typescript
Questionnaire.item[] with type: "group" = screen/step
  - enableWhen: conditional visibility
  - extension: { stepOrder, navigation, validation }

QuestionnaireResponse: tracks current step, completion state
FormProgress table: auto-save per step
VisitTemplate: clinical trial visit definitions
```

### Preview Architecture
```
Builder State (Zustand) ←→ JSON Schema ←→ Preview Render (Isolated Context)
                              ↓
                        Device Wrapper (viewport CSS)
```

### State Management
- **Zustand**: Form builder state, current step, validation
- **localStorage**: Draft auto-save recovery
- **PostgreSQL**: Step progress, visit templates
- **Redis**: Preview schema caching (optional)

---

## Success Criteria

**Phase 1**: Multi-step tables exist, API endpoints return step data
**Phase 2**: Wizard UI navigates steps, saves progress
**Phase 3**: Preview switches devices, renders form correctly
**Phase 4**: Rules trigger step skips, conditional branching works
**Phase 5**: E2E test passes, docs published

---

## Risk Mitigation

**Risk**: Schema conflicts between phases
**Mitigation**: Phase 1 completes DB schema before Phase 4 rule changes

**Risk**: Type definition conflicts
**Mitigation**: Each phase owns type file sections, documented boundaries

**Risk**: Integration issues between phases
**Mitigation**: Phase 5 dedicated to integration testing, conflict resolution

**Risk**: API contract mismatches
**Mitigation**: Phase 1 defines API contracts, Phase 2/3/4 consume them

---

## Rollout Strategy

1. Deploy Phase 1 backend (DB migration, API endpoints)
2. Deploy Phases 2+3+4 frontend together (atomic release)
3. Feature flag: `ENABLE_MULTI_STEP_FORMS=true`
4. Gradual rollout: Internal → Beta users → All users

---

## Estimated Timeline

**Parallel Execution**:
- Group A (Phases 1+2+3): ~6 hours (longest phase = Phase 2)
- Phase 4: ~5 hours (after Phase 1)
- Phase 5: ~3 hours

**Total Sequential**: ~14 hours
**Total Parallel**: ~9 hours (36% faster)

---

## Dependencies

**External**:
- PostgreSQL (existing)
- Redis (optional caching)
- FHIR Questionnaire structure (existing)

**Internal**:
- Existing form builder (ehr-web/src/app/forms/builder)
- Existing rule engine (services/rule-engine.service.js)
- Component library (component-library.ts)

---

## Unresolved Questions

1. Should visit templates support nested sub-forms per visit?
2. Auto-save interval: 30s or real-time debounced (300ms)?
3. Preview iframe vs React Context isolation?
4. Max steps per form (recommend 10-15 for UX)?
5. Support dynamic step insertion at runtime?
