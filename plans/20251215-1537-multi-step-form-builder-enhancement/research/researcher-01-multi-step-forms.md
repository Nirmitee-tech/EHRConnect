# Multi-Step Form Builder Research: Healthcare Forms with Clinical Trial Support

**Date**: 2025-12-15
**Research Focus**: Multi-step form patterns, eCRF requirements, visual rule builders
**Target Integration**: EHRConnect form builder enhancement

---

## 1. Multi-Step Form Patterns & Best Practices

### Screen Navigation Architecture

**Progression Model**:
- Linear wizard with forward/back navigation (most common)
- Progress indicators showing step X of Y (improves engagement by 25%)
- Save progress between steps (stateful forms)
- Optional skipping/backtracking (increases satisfaction)
- Conditional routing based on responses

**UX Principles**:
- Limit 5-6 fields per screen maximum (tested optimal threshold)
- Mobile-responsive: single column layout below 768px
- Clear CTAs: "Next", "Previous", "Save & Continue"
- Group logically related fields per screen
- Show all steps upfront to eliminate surprises

### State Management Requirements

- **Client-side**: Cache completed screens in memory/localStorage
- **Server-side**: Persist partial submissions (auto-save every 30s)
- **Session handling**: Resume from last completed step on re-entry
- **Validation timing**: Validate on "Next" not real-time (reduces friction)

### Healthcare-Specific Navigation Patterns

- Multi-step identity verification for record linkage
- Asynchronous attachments (photo uploads) between steps
- Conditional skips based on clinical pathways
- Mandatory field enforcement before progression
- Compliance checkpoints (consent confirmation)

---

## 2. Clinical Trial eCRF Requirements

### Visit-Based Data Collection Model

**Visit Architecture**:
- Per-protocol visit definitions tied to trial timeline
- Frequency configuration (weekly, monthly, quarterly, etc.)
- Baseline, interim, and closeout visit types
- Data available near-real-time post-entry
- Visit status tracking (scheduled, completed, missed)

**Protocol Compliance**:
- Only include fields directly tied to study endpoints
- No extraneous commentary fields (strict CDASH mapping)
- Data managers + clinicians + statisticians design forms together
- Standardized CDASH (Clinical Data Acquisition Standards Harmonization) annotations
- FDA/EMA submission readiness via CDISC standards

### Validation & Quality Gates

**Built-in Validation Rules**:
- Range checks (e.g., BP systolic 80-200)
- Cross-field validation (interdependent fields)
- Mandatory field enforcement at form completion
- Pre-population from baseline data
- Duplicate detection

**Audit Requirements**:
- Field-level change tracking (timestamp, user, old→new value)
- Query resolution workflow (investigator responses logged)
- Regulatory compliance for 21 CFR Part 11
- Data lock preparation (prevent post-lock edits)

### eCRF Design Patterns

**Form Library System**:
- Reusable form templates across studies
- Version control per protocol amendment
- Randomization & stratification data capture
- Adverse event/serious event escalation paths
- Subject visit tracking dashboard

---

## 3. Visual Rule Builder Integration

### Rule Types for Healthcare Forms

**Field-Level Rules**:
- Show/hide fields conditionally
- Populate fields from previous answers (auto-fill)
- Change field validation based on conditions
- Disable/enable fields (read-only states)
- Cascade dropdowns (dependent selects)

**Step-Level Rules**:
- Skip entire screens based on logic
- Conditional branching (2+ pathways)
- Repeat sections (e.g., multiple medications)
- Calculate derived fields (BMI from height/weight)

**Cross-Form Rules**:
- Pre-populate from questionnaires
- Conditional task creation (follow-up visits)
- Alert generation (abnormal values)
- Patient message triggers

### Visual Builder Syntax

**Natural Language Approach** (proven most effective):
```
IF [patient age] > 65 AND [diagnosis] includes "Hypertension"
THEN show [medication-review-fields] AND create [6-week-followup-task]
```

**Editor Characteristics**:
- Drag-drop condition blocks
- No-code condition building with templates
- JavaScript expressions for advanced logic
- Rule preview/simulation before activation
- Test against sample data

### Implementation Patterns

**Skip Logic** (entire screens hidden):
```
IF visit type == "Baseline"
THEN show [demographics, informed-consent, baseline-labs]
ELSE skip [demographics, informed-consent]
```

**Conditional Fields** (individual field visibility):
```
IF patient selects "Telehealth"
THEN show [video-preference, internet-quality, device-type]
```

**Validation Rules** (on field):
```
IF [form-purpose] == "Clinical Trial"
THEN [lab-results] must be numeric AND > 0
```

---

## 4. EHRConnect Specific Integration Points

### Current Form Builder Capabilities (Per PDR)

✅ FHIR Questionnaire-based architecture
✅ Form versioning with change tracking
✅ Multi-section forms
✅ Conditional logic support (basic)
✅ Field validation rules

### Required Enhancements

**Phase 1 (Priority High)**:
- Multi-step wizard interface with progress tracking
- Screen-level navigation (next/prev/conditional skip)
- Form state persistence (auto-save between steps)
- Visit-based form template system
- Clinical trial compliance checklist

**Phase 2 (Priority Medium)**:
- Visual rule builder (no-code condition blocks)
- Cross-field calculations (derived values)
- Dependency chains (cascade selects)
- Rule simulation/testing interface
- Bulk rule application per specialty pack

**Phase 3 (Priority Low)**:
- Advanced CDASH mapping UI
- eCRF audit trail visualization
- Query resolution workflow
- Data quality scoring
- Subject visit timeline dashboard

---

## 5. Technology Recommendations

### State Management Approach
- Use Zustand or Context API for form state (already in EHRConnect stack)
- localStorage for session recovery
- API endpoint for partial saves (/forms/{id}/progress)

### Validation Architecture
- Client-side: React hook-form + zod
- Server-side: JSON Schema validation
- Visit-based rules engine (leverage existing rule engine)

### FHIR Mapping Strategy
- Questionnaire.item[].type: "group" for screens
- Questionnaire.item[].enableWhen for conditional visibility
- Questionnaire.item[].initial for pre-population
- QuestionnaireResponse structure for multi-step capture

### Database Considerations
- FormProgress table (visit_id, step_completed, timestamp)
- RuleHistory table (rule_id, version, activated_date)
- VisitTemplate table (trial_id, visit_name, form_ids, frequency)

---

## 6. Clinical Trial Compliance Checklist

- [ ] Protocol-aligned data points only
- [ ] CDASH annotations mapped per CRF
- [ ] FDA 21 CFR Part 11 audit trails
- [ ] Visit type definitions with frequencies
- [ ] Data lock preparation workflow
- [ ] Query resolution tracking
- [ ] Subject discontinuation flags
- [ ] Amendment version tracking

---

## References

- [8 Best Multi-Step Form Examples in 2025 + Best Practices](https://www.webstacks.com/blog/multi-step-form)
- [Healthcare UI Design 2025: Best Practices + Examples](https://www.eleken.co/blog-posts/user-interface-design-for-healthcare-applications)
- [eCRF: Electronic Case Report Form in Clinical Trials](https://www.greenlight.guru/blog/electronic-case-report-form)
- [5 Key Steps of eCRF Design in Clinical Trials](https://www.quanticate.com/blog/ecrf-design-in-clinical-trials)
- [Guidance for Industry Electronic Source Data in Clinical Investigations (FDA)](https://www.fda.gov/media/85183/download)
- [Rule Builder - Forms - Easy Forms](https://docs.easyforms.dev/rule-builder.html)
- [Conditional Logic and Branching - Wufoo](https://www.wufoo.com/guides/conditional-logic-and-branching/)
- [5 Best Form Builders with Conditional Logic (2026 Update)](https://www.involve.me/blog/best-form-builders-with-conditional-logic)
- [Web Accessibility Initiative: Multi-page Forms (W3C)](https://www.w3.org/WAI/tutorials/forms/multi-page/)
- [Better Form Design: UX Tips, Tools, and Tutorial - LogRocket](https://blog.logrocket.com/ux-design/better-form-design-ux-tips-tools-tutorial/)

---

## Unresolved Questions

1. Should multi-step forms support dynamic step insertion (e.g., conditional additional steps beyond initial count)?
2. What's the target UI/UX pattern for rule builder—sentence-based or block-based?
3. Should clinical trial forms support randomization/stratification flow within form builder?
4. What's the retention policy for FormProgress auto-saves (e.g., 30 days)?
5. Should visit templates support nested forms (parent form with sub-forms per visit)?

