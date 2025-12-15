# Phase 1: Backend API & Database Schema

**Date**: 2025-12-15
**Phase**: 1 of 5
**Priority**: High (Critical Path)
**Status**: Pending
**Duration**: ~4 hours

---

## Parallelization Info

**Can Run With**: Phase 2 (Frontend Builder UI), Phase 3 (Preview System)
**Must Wait For**: None - this is the foundation phase
**Blocks**: Phase 4 (needs DB schema for step-level rules)
**Conflicts**: None - exclusive backend file ownership

---

## Context Links

**Research**:
- [researcher-01-multi-step-forms.md](./research/researcher-01-multi-step-forms.md) (Visit-based eCRF, state management)
- [researcher-02-preview-systems.md](./research/researcher-02-preview-systems.md) (Preview mode support)

**Code Standards**:
- [code-standards.md](../../docs/code-standards.md) (Migration patterns, API naming)
- [system-architecture.md](../../docs/system-architecture.md) (Database patterns)

**Existing Code**:
- ehr-api/src/routes/forms.js (635 lines - add endpoints)
- ehr-api/src/services/forms.service.js (867 lines - add methods)
- ehr-api/src/database/migrations/ (30+ existing migrations)

---

## Overview

Add database schema and API endpoints for multi-step forms, visit templates, form progress tracking, and preview mode support. Enable FHIR Questionnaire-based step grouping with conditional navigation.

---

## Key Insights from Research

1. **Visit-based eCRF model**: Clinical trials use per-protocol visit definitions with frequency configs (weekly/monthly/quarterly)
2. **State persistence**: Auto-save every 30s, resume from last step on re-entry
3. **Step validation**: Validate on "Next" not real-time to reduce friction
4. **FHIR mapping**: Questionnaire.item[].type: "group" for screens, enableWhen for conditional visibility
5. **Audit requirements**: Field-level change tracking, query resolution workflow

---

## Requirements

### Database Schema
- [ ] `form_steps` table: step definitions, order, navigation config
- [ ] `form_progress` table: user progress tracking, auto-save state
- [ ] `visit_templates` table: clinical trial visit definitions
- [ ] `step_validation_rules` table: step-level validation logic
- [ ] Add `is_multi_step`, `step_config` to `forms` table

### API Endpoints
- [ ] `POST /api/forms/:id/steps` - Create/reorder steps
- [ ] `GET /api/forms/:id/steps` - Retrieve steps with metadata
- [ ] `PUT /api/forms/:id/steps/:stepId` - Update step config
- [ ] `POST /api/forms/:id/progress` - Save step progress (auto-save)
- [ ] `GET /api/forms/:id/progress/:userId` - Resume from last step
- [ ] `POST /api/visit-templates` - CRUD for visit templates
- [ ] `GET /api/visit-templates/:trialId` - List templates by trial

### Service Methods
- [ ] `forms.service.js::createStep(formId, stepData)`
- [ ] `forms.service.js::reorderSteps(formId, stepOrder[])`
- [ ] `forms.service.js::saveProgress(formId, userId, stepIndex, data)`
- [ ] `forms.service.js::getProgress(formId, userId)`
- [ ] `forms.service.js::createVisitTemplate(trialId, templateData)`

---

## Architecture

### Data Model (FHIR-Compliant)

**Questionnaire Extension**:
```json
{
  "resourceType": "Questionnaire",
  "extension": [
    {
      "url": "http://ehrconnect.io/fhir/StructureDefinition/wizard-config",
      "valueCodeableConcept": {
        "coding": [{
          "code": "multi-step",
          "display": "Multi-Step Wizard"
        }]
      }
    }
  ],
  "item": [
    {
      "linkId": "step-1",
      "type": "group",
      "text": "Demographics",
      "extension": [
        {
          "url": "http://ehrconnect.io/fhir/StructureDefinition/step-order",
          "valueInteger": 1
        },
        {
          "url": "http://ehrconnect.io/fhir/StructureDefinition/navigation",
          "valueCodeableConcept": {
            "coding": [{"code": "forward-back", "display": "Allow Back Navigation"}]
          }
        }
      ],
      "item": [/* field definitions */]
    }
  ]
}
```

### Database Tables

**form_steps**:
```sql
CREATE TABLE form_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  navigation_config JSONB DEFAULT '{"allowBack": true, "allowSkip": false}',
  validation_config JSONB DEFAULT '{"validateOnNext": true}',
  fields JSONB NOT NULL, -- FHIR Questionnaire.item[]
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(form_id, step_order)
);

CREATE INDEX idx_form_steps_form_id ON form_steps(form_id);
```

**form_progress**:
```sql
CREATE TABLE form_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id),
  current_step INTEGER NOT NULL DEFAULT 0,
  step_data JSONB NOT NULL DEFAULT '{}', -- Partial QuestionnaireResponse
  last_saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_id VARCHAR(255),
  is_completed BOOLEAN DEFAULT FALSE,
  UNIQUE(form_id, user_id, session_id)
);

CREATE INDEX idx_form_progress_user ON form_progress(user_id, form_id);
```

**visit_templates**:
```sql
CREATE TABLE visit_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  trial_id VARCHAR(255) NOT NULL,
  visit_name VARCHAR(255) NOT NULL, -- "Baseline", "Week 4", "Closeout"
  visit_type VARCHAR(50) NOT NULL, -- "baseline", "interim", "closeout"
  frequency_config JSONB, -- {"type": "weekly", "interval": 4}
  form_ids UUID[] NOT NULL, -- Array of form IDs for this visit
  cdash_annotations JSONB, -- CDASH standard mappings
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(org_id, trial_id, visit_name)
);

CREATE INDEX idx_visit_templates_trial ON visit_templates(org_id, trial_id);
```

**forms table additions**:
```sql
ALTER TABLE forms ADD COLUMN is_multi_step BOOLEAN DEFAULT FALSE;
ALTER TABLE forms ADD COLUMN step_config JSONB DEFAULT '{"totalSteps": 1, "showProgress": true}';
ALTER TABLE forms ADD COLUMN visit_template_id UUID REFERENCES visit_templates(id);
```

---

## Related Code Files (Exclusive to Phase 1)

**Backend Files - Phase 1 Ownership**:
- `ehr-api/src/database/migrations/251215000001-multi-step-forms.js` (NEW)
- `ehr-api/src/routes/forms.js` (MODIFY - add endpoints lines 636-750)
- `ehr-api/src/services/forms.service.js` (MODIFY - add methods lines 868-1050)
- `ehr-api/src/services/forms-versioning.service.js` (MODIFY - minor version bump for steps)

**No Other Phase Touches These Sections**

---

## Implementation Steps

### Step 1: Database Migration (1 hour)
```javascript
// ehr-api/src/database/migrations/251215000001-multi-step-forms.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create form_steps table
    await queryInterface.createTable('form_steps', { /* schema */ });

    // Create form_progress table
    await queryInterface.createTable('form_progress', { /* schema */ });

    // Create visit_templates table
    await queryInterface.createTable('visit_templates', { /* schema */ });

    // Alter forms table
    await queryInterface.addColumn('forms', 'is_multi_step', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn('forms', 'step_config', {
      type: Sequelize.JSONB,
      defaultValue: { totalSteps: 1, showProgress: true }
    });

    // Create indexes
    await queryInterface.addIndex('form_steps', ['form_id']);
    await queryInterface.addIndex('form_progress', ['user_id', 'form_id']);
  },

  async down(queryInterface, Sequelize) {
    // Drop in reverse order
    await queryInterface.dropTable('form_progress');
    await queryInterface.dropTable('form_steps');
    await queryInterface.dropTable('visit_templates');
    await queryInterface.removeColumn('forms', 'is_multi_step');
    await queryInterface.removeColumn('forms', 'step_config');
  }
};
```

### Step 2: Service Layer Methods (1.5 hours)
```javascript
// ehr-api/src/services/forms.service.js - Add to end of class

/**
 * Create form step
 */
async createStep(formId, stepData, userId) {
  const form = await this.getFormById(formId);
  if (!form) throw new Error('Form not found');

  const step = await db.query(
    `INSERT INTO form_steps (form_id, step_order, title, description,
      navigation_config, validation_config, fields)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [
      formId,
      stepData.step_order,
      stepData.title,
      stepData.description || '',
      stepData.navigation_config || {},
      stepData.validation_config || {},
      stepData.fields || []
    ]
  );

  // Update form step count
  await this.updateFormStepConfig(formId);

  return step;
}

/**
 * Save form progress (auto-save)
 */
async saveProgress(formId, userId, sessionId, progressData) {
  const progress = await db.query(
    `INSERT INTO form_progress (form_id, user_id, org_id, current_step,
      step_data, session_id, last_saved_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    ON CONFLICT (form_id, user_id, session_id)
    DO UPDATE SET
      current_step = EXCLUDED.current_step,
      step_data = EXCLUDED.step_data,
      last_saved_at = NOW()
    RETURNING *`,
    [
      formId,
      userId,
      progressData.org_id,
      progressData.current_step,
      progressData.step_data,
      sessionId
    ]
  );

  return progress;
}

/**
 * Get user progress for form
 */
async getProgress(formId, userId, sessionId) {
  const progress = await db.query(
    `SELECT * FROM form_progress
    WHERE form_id = $1 AND user_id = $2 AND session_id = $3
    ORDER BY last_saved_at DESC LIMIT 1`,
    [formId, userId, sessionId]
  );

  return progress;
}

/**
 * Create visit template (eCRF)
 */
async createVisitTemplate(orgId, trialId, templateData) {
  const template = await db.query(
    `INSERT INTO visit_templates (org_id, trial_id, visit_name, visit_type,
      frequency_config, form_ids, cdash_annotations)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [
      orgId,
      trialId,
      templateData.visit_name,
      templateData.visit_type,
      templateData.frequency_config || null,
      templateData.form_ids || [],
      templateData.cdash_annotations || {}
    ]
  );

  return template;
}
```

### Step 3: API Routes (1.5 hours)
```javascript
// ehr-api/src/routes/forms.js - Add to end before module.exports

/**
 * Multi-step form endpoints
 */

// Create step
router.post('/:id/steps', authenticateJWT, async (req, res) => {
  try {
    const step = await formsService.createStep(
      req.params.id,
      req.body,
      req.user.id
    );
    res.status(201).json(step);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get steps
router.get('/:id/steps', authenticateJWT, async (req, res) => {
  try {
    const steps = await formsService.getSteps(req.params.id);
    res.json(steps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save progress (auto-save endpoint)
router.post('/:id/progress', authenticateJWT, async (req, res) => {
  try {
    const progress = await formsService.saveProgress(
      req.params.id,
      req.user.id,
      req.body.sessionId,
      req.body
    );
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get progress
router.get('/:id/progress', authenticateJWT, async (req, res) => {
  try {
    const progress = await formsService.getProgress(
      req.params.id,
      req.user.id,
      req.query.sessionId
    );
    res.json(progress);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Visit templates (eCRF)
router.post('/visit-templates', authenticateJWT, requireRole(['ORG_ADMIN']), async (req, res) => {
  try {
    const template = await formsService.createVisitTemplate(
      req.user.orgId,
      req.body.trialId,
      req.body
    );
    res.status(201).json(template);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/visit-templates/:trialId', authenticateJWT, async (req, res) => {
  try {
    const templates = await formsService.getVisitTemplates(
      req.user.orgId,
      req.params.trialId
    );
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Todo List

- [ ] Create migration file `251215000001-multi-step-forms.js`
- [ ] Run migration: `npm run migrate` in ehr-api
- [ ] Add service methods to `forms.service.js`
- [ ] Add API routes to `routes/forms.js`
- [ ] Test endpoints with Postman/curl
- [ ] Update API documentation (internal)
- [ ] Verify FHIR Questionnaire extension compatibility
- [ ] Seed sample multi-step form for testing

---

## Success Criteria

- [ ] Migration runs successfully, all tables created
- [ ] `POST /api/forms/:id/steps` creates step and returns 201
- [ ] `POST /api/forms/:id/progress` saves progress, returns saved state
- [ ] `GET /api/forms/:id/progress` retrieves last saved step
- [ ] Visit template CRUD endpoints operational
- [ ] No breaking changes to existing form endpoints

---

## Conflict Prevention

**How Avoid Conflicts with Parallel Phases**:

1. **Phase 2 (Builder UI)**: Runs in parallel, consumes API contracts defined here. No backend file overlap.
2. **Phase 3 (Preview)**: Runs in parallel, uses read-only GET endpoints. No write conflicts.
3. **Phase 4 (Rule Builder)**: Waits for this phase to complete DB schema. No table conflicts.

**File Boundaries**:
- Phase 1 owns: Migration, routes (lines 636-750), services (lines 868-1050)
- Phase 2 owns: ehr-web builder pages, new components
- Phase 4 owns: rule-engine.service.js modifications (separate section)

**API Contract Lock**: After this phase, API endpoints frozen for consumption by frontend phases.

---

## Risk Assessment

**Risk**: Migration fails on existing production data
**Mitigation**: Test on staging DB first, add `is_multi_step` with default FALSE (non-breaking)

**Risk**: Auto-save endpoint overwhelms DB (high frequency writes)
**Mitigation**: Debounce client-side to 30s, add rate limiting (10 req/min per user)

**Risk**: FHIR Questionnaire extension incompatibility
**Mitigation**: Use custom namespace `http://ehrconnect.io/fhir/`, test with Medplum

**Risk**: Large step_data JSONB performance
**Mitigation**: Add index on form_progress(form_id, user_id), limit to 100KB per save

---

## Security Considerations

- [ ] Validate org_id isolation for form_progress (multi-tenant)
- [ ] Rate limit auto-save endpoint (prevent abuse)
- [ ] Sanitize JSONB inputs (step_data, navigation_config)
- [ ] Audit log step creation/deletion
- [ ] Check user permissions for visit template creation (ORG_ADMIN only)

---

## Next Steps

1. **Phase 2** can start immediately (consumes API contracts)
2. **Phase 3** can start immediately (read-only consumption)
3. **Phase 4** waits for DB schema completion
4. Deploy backend changes before frontend phases complete
5. Feature flag: `ENABLE_MULTI_STEP_FORMS=true` in ehr-api/.env

---

## Dependencies

**External**:
- PostgreSQL 8.11+ (JSONB support)
- Sequelize 6.37 (migration runner)

**Internal**:
- Existing forms table and service
- Authentication middleware (authenticateJWT)
- RBAC middleware (requireRole)

---

## Unresolved Questions

1. Should form_progress have TTL (30 days auto-delete)?
2. Max step_data size limit (100KB, 500KB)?
3. Support concurrent editing (multi-user progress tracking)?
4. Visit template versioning (protocol amendments)?
