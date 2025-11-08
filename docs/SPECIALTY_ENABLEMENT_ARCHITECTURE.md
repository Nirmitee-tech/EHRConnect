# Specialty Enablement Architecture Blueprint

> Purpose: describe the architecture, current gaps, multi-specialty handling strategy, and concrete implementation workstreams (with deliverables + definition of done) required to operationalize specialty packs across EHRConnect.

---

## 1. Architectural Objectives
1. **Modularity** – specialty features are delivered as metadata packs, not hard-coded modules.
2. **Multi-specialty concurrency** – a patient, department, or org can run multiple specialty packs simultaneously without conflict.
3. **Performance** – pack loading, template rendering, and workflow orchestration must meet existing SLAs (<250ms API p95, <1s page interactive).
4. **Governance** – every specialty change is versioned, auditable, and roll-backable.
5. **Interoperability** – specialty data maps to FHIR/openEHR artifacts for downstream analytics and integrations.

---

## 2. Gap Analysis (Current vs Target)
| Area | Current Gaps | Target State |
|------|--------------|--------------|
| Config management | Org specialties stored but not enforced; no dependency graph | Structured pack registry with schema validation, dependency resolution, hot reload |
| Template delivery | Forms hard-coded per page | Schema-driven templating resolved by specialty context |
| Scheduling | Limited to provider/practice filters | Visit-type taxonomy with specialty routing, resource bindings, recurrence protocols |
| Workflow engine | Generic checklists | Stage-based workflows defined in pack metadata, auto-triggered |
| Data model | Episodes not first-class | `patient_specialty_episodes`, pack-specific metadata tables, consistent FHIR mapping |
| Observability | No pack-level metrics | Telemetry per pack (usage, latency, errors), automated alerts |
| Deployment | Manual feature toggles | CLI + CI pipeline for pack validation/publish/rollback |

---

## 3. Target Architecture Overview
```
         +-------------------+
         | Org Config Store  |  <-- specialtiesEnabled[], overrides
         +---------+---------+
                   |
                   v
        +-----------------------+
        | Specialty Registry    |  <-- pack loader, validator, cache
        +-----+-----------+-----+
              |           |
   +----------+           +-------------+
   | Runtime Services                    |
   |  (API, forms, scheduling, workflow) |
   +----------+-----------+-------------+
              |           |
   +----------v--+     +--v-----------+
   | Frontend UI |     | Workflow/CDS |
   | (usePack)   |     | Engines      |
   +------+------+     +------+-------+
          |                   |
          v                   v
   +-------------+     +--------------+
   | Data Layer  |     | Telemetry/BI |
   +-------------+     +--------------+
```

### Key Components
1. **Org Config Store** – canonical source of enabled packs, overrides, pack versions per tenant/department.
2. **Specialty Registry** – validates pack artifacts, caches compiled schemas, exposes APIs/GraphQL for runtime services.
3. **Runtime Services** – intake/forms service, scheduling, workflow engine, reporting read registry output to determine behavior.
4. **Frontend Composition** – React hook (`useSpecialtyPack`) + dynamic components render pack-provided UI.
5. **Data & Telemetry** – specialized tables (episodes, pack audits) + metrics pipeline to track adoption, latency, errors.

### 3.1 Pack Schema Specification
| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `slug` | string | ✅ | Unique identifier (`ob-gyn`, `wound-care`). |
| `version` | semver | ✅ | Used for cache busting + audit. |
| `dependencies[]` | string[] | optional | Other packs/modules required (e.g., `core-bed-mgmt`). |
| `templates[]` | array | ✅ | Form/case-sheet definitions (JSON Schema references). |
| `visitTypes[]` | array | ✅ | Appointment definitions (id, duration, routing rules, required resources). |
| `workflows[]` | array | optional | Stage/checklist definitions with triggers + transitions. |
| `reports[]` | array | optional | KPI/dashboard descriptors. |
| `featureFlags` | object | optional | Flags to gate experimental features. |
| `devices` | array | optional | Device/connector metadata (e.g., fetal monitor integration). |

**Example `pack.json`:**
```json
{
  "slug": "ob-gyn",
  "version": "1.2.0",
  "dependencies": ["core-intake", "core-scheduling"],
  "templates": ["intake/prenatal.json", "case-sheets/antenatal.json"],
  "visitTypes": "visit-types.json",
  "workflows": "workflows/prenatal.yaml",
  "reports": "reports/prenatal-kpis.json",
  "featureFlags": { "enableTTTS": true }
}
```

### 3.2 Config Resolution Flow
1. **Org admin** toggles packs via catalog UI → writes to `org_specialty_settings`.
2. **SpecialtyRegistry** subscribes to config change events, pulls enabled pack slugs/versions.
3. Registry validates packs, resolves dependencies, stores compiled artifact in Redis (`pack:{slug}:{version}`).
4. **Context Resolver** (backend middleware) evaluates request context (org → location → department → service line) to produce `ResolvedSpecialtyContext` object.
5. Downstream services receive context via request-scoped header (e.g., `x-specialty-context`) and fetch required pack components from registry API.

### 3.3 Data Schemas
| Table | Critical Columns | Notes |
|-------|------------------|-------|
| `patient_specialty_episodes` | `id`, `patient_id`, `specialty_slug`, `episode_state`, `start_at`, `end_at`, `metadata` (JSONB), `active` | Stores concurrent episodes; `metadata` holds pack-specific fields (e.g., EDD). |
| `specialty_visit_types` | `id`, `specialty_slug`, `code`, `duration_min`, `required_roles[]`, `required_resources[]`, `recurrence_template` | Drives scheduling UI + validation. |
| `specialty_pack_audits` | `id`, `org_id`, `pack_slug`, `pack_version`, `action`, `actor_id`, `created_at` | Immutable audit trail. |
| `specialty_pack_cache` (Redis) | key `pack:{slug}:{version}` | Stores compiled templates/workflows. |
| `specialty_metrics` | time-series (Prometheus/Grafana) | Tracks usage, latency, error rates per pack. |

#### 3.3.1 Org Specialty Settings Table
| Column | Type | Notes |
|--------|------|-------|
| `org_id` | UUID | FK to organizations |
| `pack_slug` | text | Lowercase slug |
| `pack_version` | text | Semver |
| `enabled` | boolean | Soft enable/disable |
| `scope` | text | `org`, `location`, `department`, `service_line` |
| `scope_ref_id` | UUID | ID of scope entity |
| `overrides` | JSONB | e.g., template overrides |
| `created_by` / `updated_by` | UUID | audit |
| `created_at` / `updated_at` | timestamptz | audit timestamps |

Composite unique constraint: `(org_id, pack_slug, scope, scope_ref_id)`.

### 3.4 Pack Lifecycle States
| State | Description | Allowed Transitions |
|-------|-------------|---------------------|
| `draft` | Pack under active development | → `qa` |
| `qa` | Validated in staging sandbox | → `approved`, `draft` |
| `approved` | Cleared for production enablement | → `published`, `qa` |
| `published` | Available in registry for tenants | → `deprecated` |
| `deprecated` | Sunset, only existing tenants can run | → `retired` |
| `retired` | Removed from registry/cache | (none) |

Catalog UI must enforce lifecycle transitions based on user role (e.g., only release manager can promote to `published`).

### 3.5 Config Propagation & Caching
1. **Write Path:** Admin toggles pack → config table updated → event emitted (Kafka/SNS) containing org, pack, version, scope.
2. **Registry Subscribes:** Listens to event stream; if relevant pack cached, warm new version; flush old.
3. **Edge Cache:** CDN caches pack components per tenant; invalidated via webhook from registry when pack version changes.
4. **Client Cache:** `useSpecialtyPack` hook stores pack data in SWR cache keyed by `org+pack+version`, TTL 5 minutes; includes ETag from registry so clients revalidate efficiently.

Fallback order when cache miss occurs: Edge cache → Registry Redis → Pack artifact store (S3/git).

### 3.4 API Contracts
| Endpoint | Method | Payload | Response | Purpose |
|----------|--------|---------|----------|---------|
| `/api/specialties/packs` | GET | query `org_id` | `{ packs: [{ slug, version, status }] }` | List enabled packs. |
| `/api/specialties/packs/:slug/components` | GET | headers `x-specialty-context`, query `component=templates` | `{ templates: [...] }` | Fetch templates/visit types/workflows. |
| `/api/admin/orgs/:id/specialties` | PATCH | `{ enable: ["ob-gyn"], disable: [] }` | `{ success: true }` | Toggle packs via catalog. |
| `/api/forms` | GET | query `specialty`, `template` | JSON Schema | Provide dynamic form definitions. |

All APIs must include `pack_version` in responses for caching + troubleshooting.

---

## 4. Multi-Specialty Handling Strategy
| Layer | Strategy |
|-------|----------|
| Tenant | `specialtiesEnabled[]` + dependency checks ensure packs compatible before enabling. |
| Department/Location | Overrides permit enabling subsets (e.g., NICU only in maternity wing). Resolved priority: org < location < department < service line. |
| Patient | `patient_specialty_episodes` holds concurrent episodes; context resolver selects correct template/workflow per encounter. |
| Scheduling | Visit type can link to multiple episodes (e.g., postpartum + wound). Calendar color-codes specialties; conflicts resolved by policy engine. |
| Workflow | Stage-based workflows include guard rails (cannot close prenatal stage if TTTS tasks pending). Cross-specialty transitions defined in registry metadata. |
| Reporting | Metrics keyed by `specialty_slug`, `pack_version`, `episode_id` enabling multi-specialty analytics. |

### 4.1 Scenario Walkthrough (OB + Wound Care)
1. Patient has active `ob-gyn` episode and develops post-op wound complication → new `wound-care` episode opened concurrently.
2. Scheduler creates visit using `wound-care` visit type; resolver attaches both episode IDs to appointment.
3. Encounter UI loads prenatal case sheet (because encounter type = prenatal follow-up) plus wound-care panel via `useSpecialtyPack`.
4. Workflow engine enforces prenatal stage completion while also requiring wound debridement checklist.
5. Reporting aggregates prenatal adherence + wound healing velocity separately using `episode_id` + `specialty_slug`.
6. When prenatal episode closes, wound-care episode remains active and continues to drive templates/actions.

### 4.2 Failure Modes & Recovery
| Failure | Detection | Mitigation |
|---------|-----------|------------|
| Pack validation fails | Registry logs error, returns 422 | Block enablement, notify admin, provide schema diff |
| Cache outage | Elevated latency, cache miss metrics spike | Fall back to artifact store, throttle reloads, alert on-call |
| Conflicting overrides | Resolver detects multiple packs per scope | Apply deterministic priority, log conflict, surface warning in UI |
| Pack downgrade needed | Ops sets org to previous version | Registry supports version pinning, CLI rollback command |
| Partial deployment | Telemetry shows missing templates | Default pack fallback renders safe forms, auto-create incident |

---

## 5. Implementation Workstreams (Action → Deliverable → Definition of Done)

### 5.1 Pack Registry & Config
- **Action:** Implement `SpecialtyRegistry` service (validator, loader, cache, API).
  - Break down:
    1. Define pack JSON schema + AJV validator.
    2. Build loader that reads packs from filesystem/S3, compiles templates/workflows.
    3. Add Redis cache with TTL + manual invalidate endpoint.
    4. Expose REST/GraphQL endpoints returning pack metadata + components.
  - **Deliverable:** Service deployed with endpoints `GET /packs`, `GET /packs/:slug`, `POST /packs/:slug/reload`.
  - **DoD:** Pack upload triggers schema validation, cached in Redis, accessible from web + API layers, telemetry logs cache hits/misses, integration tests cover enable/disable flow, load test proves <150ms response for cached pack.

- **Action:** Build Org Specialty Catalog (UI + API).
  - Steps:
    1. Backend: endpoints `GET/PUT /admin/orgs/:id/specialties`.
    2. Frontend: wizard listing packs, dependency warnings, preview modal.
    3. Audit logging + rollback button.
  - **Deliverable:** Admin UI that toggles packs, shows dependency/status, writes to config store.
  - **DoD:** Changes propagate to registry within <60s, audit log entries created, unit/integration tests cover overrides, rollback button works, 404/422 errors localized.

### 5.2 Data Model Extensions
- **Action:** Add `patient_specialty_episodes`, `specialty_pack_audits`, `specialty_visit_types`.
  - Steps:
    1. Write SQL migrations with forward/backward scripts.
    2. Update ORM models + repositories.
    3. Seed default visit types for general pack.
    4. Instrument service to auto-create episodes when appointment booked with new specialty.
  - **Deliverable:** Migration scripts + models + service methods.
  - **DoD:** CRUD APIs exposed, unit tests for schema, data visible in admin UI, episodes auto-created from encounters, migration dry-run report attached to PR.

### 5.3 Runtime Service Hooks
- **Action:** Intake/Form service reads pack templates dynamically.
  - Steps:
    1. Add middleware that injects `ResolvedSpecialtyContext` into form service.
    2. Implement cache per template (LRU).
    3. Update form renderer to support pack-provided validation rules and localization.
  - **Deliverable:** API endpoint `GET /forms?specialty=ob` returns schema from registry; frontend renders without code change.
  - **DoD:** Form selection matches specialty context in >95% regression cases; fallback to default pack when disabled; latency <200ms p95; schema validation errors logged with pack slug/version.

- **Action:** Scheduling service consumes `visit-types.json`.
  - Steps:
    1. Load visit types at service start and watch for registry updates.
    2. Build resource-check middleware (beds, devices, staff).
    3. Update UI to show visit type description, required prep, forms.
  - **Deliverable:** Scheduling UI surfaces specialty visit types, resource validation, recurrence protocols.
  - **DoD:** Booking respects resource bindings, conflicts produce actionable errors, e2e tests pass for IVF + prenatal flows, scheduler logs include `visit_type_code`.

- **Action:** Workflow engine loads pack-defined stage/checklists.
  - Steps:
    1. Extend workflow DSL parser to accept pack YAML.
    2. Support conditionals referencing patient data (gestational age).
    3. Hook into notification service for stage triggers.
  - **Deliverable:** Generic workflow runner executes pack YAML; tasks auto-generated per stage.
  - **DoD:** Prenatal + wound workflows run without code change, overrides supported, telemetry logs stage completion times, manual override requires reason captured.

### 5.4 Frontend Composition
- **Action:** Implement `useSpecialtyPack()` hook and dynamic component registry.
  - Steps:
    1. Introduce `SpecialtyProvider` wrapping Next.js layout.
    2. Build component registry mapping pack component IDs to lazy-loaded React components.
    3. Add error boundary to fall back to default component when pack component fails.
  - **Deliverable:** Hook returns templates, nav items, widgets; pages consume via context provider.
  - **DoD:** Enabling/disabling pack updates UI without redeploy, fallback to default pack verified, Lighthouse perf unchanged (<5% delta), storybook examples provided.

### 5.5 Telemetry & Governance
- **Action:** Pack-level telemetry pipeline.
  - Steps:
    1. Instrument services with `pack_slug`, `pack_version` labels.
    2. Export metrics to Prometheus/Grafana dashboards.
    3. Define alert rules + PagerDuty routing.
  - **Deliverable:** Metrics: pack usage, template render time, errors, stored in observability stack (e.g., Prometheus + Grafana).
  - **DoD:** Dashboards exist, alerts fire when pack error rate >2% or latency >500ms, runbook documented, synthetic test sends sample alerts.

- **Action:** Pack publish CLI + CI.
  - Steps:
    1. CLI scaffolds pack, lints schema, bundles assets.
    2. CI job signs artifact, pushes to artifact store, notifies registry.
    3. Rollback command reverts to previous version.
  - **Deliverable:** `yarn specialty:publish` command bundling pack, uploading to registry, tagging release.
  - **DoD:** CI rejects invalid packs, artifact contains checksum/signature, release notes auto-generated, rollback script tested quarterly.

### 5.6 Multi-Specialty QA
- **Action:** Automated journeys for concurrent specialties.
  - Steps:
    1. Build fixtures to enable multiple packs in test tenant.
    2. Write E2E flows covering scheduling, encounter, workflow closure.
    3. Integrate pack regression suite into CI gating.
  - **Deliverable:** Playwright/Cypress suites covering prenatal+NICU and ortho+wound combos.
  - **DoD:** Suites run in CI with <2% flake, catch regressions on pack changes, results visible in dashboard, failures block pack publish pipeline.

### 5.7 Definition of Done Checklist
- ✅ Pack schema validated, dependencies resolved, cache warm.
- ✅ Config changes audited with actor/timestamp and rollback path.
- ✅ Data migrations applied with dry-run report + rollback script.
- ✅ Runtime services + UI load pack content dynamically with fallbacks.
- ✅ Telemetry dashboards + alerts in place, runbook linked.
- ✅ Automated multi-specialty tests passing in CI.
- ✅ Documentation updated (pack README, architecture doc, release notes).

---

## 6. Security, Privacy, and Compliance Considerations
| Area | Requirement | Implementation |
|------|-------------|----------------|
| Pack provenance | Prevent tampering | Sign pack artifacts (Sigstore/GPG), registry verifies signature before load. |
| Least privilege | Restrict who can enable packs | RBAC: only ORG_OWNER + CLINICAL_ADMIN can enable; release managers promote pack lifecycle. |
| Data segregation | Ensure tenant isolation | Pack configs stored per tenant; registry caches keyed by org. No cross-tenant pack data sharing. |
| PHI in templates | Keep sensitive fields encrypted | Template definitions cannot contain secrets; runtime enforces encryption at rest + TLS in transit. |
| Auditability | Track pack changes | `specialty_pack_audits` table + centralized log shipping. |
| Compliance | Regulatory exports | Pack metadata documents FHIR mappings + regulatory outputs (e.g., obstetric quality measures). |

---

## 7. Integration with FHIR/openEHR
- Each template field maps to FHIR resources (Observation, QuestionnaireResponse, Encounter) defined in pack metadata.
- Registry emits `pack_field_mappings.json` so analytics layer knows how to transform data.
- For openEHR adopters, pack includes archetype references; integration gateway handles conversion.
- Definition of done for each pack requires FHIR mapping unit tests + sample bundles.

---

## 8. Observability & SLOs
| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Registry API latency (p95) | <150ms | >250ms for 5 mins |
| Pack load error rate | <0.5% | >2% |
| Form render time (browser) | <800ms | >1.2s |
| Scheduling booking success | >99% | <97% |
| Workflow task creation | <1s delay | >5s |

SLO breaches trigger PagerDuty alerts and auto-create Jira incidents referencing pack slug/version.

---

## 9. Remaining Gaps & Open Questions
1. **Compatibility Matrix:** Need tooling to declare incompatible pack combinations (e.g., two packs modifying same template) and block enablement.
2. **Migration Strategy for Legacy Data:** Define how existing encounters map into episodes when pack enabled mid-stream.
3. **Localization:** Determine how packs supply translations—single JSON per language or use core i18n service?
4. **Device Integrations:** Standardize interface for packs requiring device drivers (fetal monitors) to avoid bespoke adapters.
5. **Billing/RCM Hooks:** Clarify how specialty visit types map to billing codes; may require additional pack metadata.
6. **Customer Overrides:** Process for tenants to customize pack templates safely without breaking upgrades.
7. **Testing Sandboxes:** Need automated creation of pack-specific sandbox tenants for QA/regression.
8. **Performance Budgets:** Establish budgets per pack (max template size, workflow complexity) to protect shared infrastructure.

Each gap should become a tracked task with owner, ETA, and acceptance criteria before GA.

---

## 6. Risk Mitigation
- **Config Drift:** enforce schema validation + version locking; packs cannot load if dependencies missing.
- **Performance Regression:** baseline metrics before enabling pack; add watchdog to disable pack automatically if latency spikes.
- **Data Integrity:** migration dry-runs + backup restore plan prior to pack rollout.
- **Security:** treat pack artifacts as code—sign releases, verify checksums, restrict who can publish.

---

## 7. Next Architectural Steps
1. Finalize pack schemas + validation tooling.
2. Implement registry MVP and integrate with admin catalog.
3. Extend data model + APIs for episodes and visit types.
4. Wire runtime services + frontend to registry outputs.
5. Stand up telemetry dashboards and CI pipelines.
6. Pilot default pack, then roll gynac pack per tasks in main README.

This document should be kept in sync with `docs/SPECIALTY_ENABLEMENT_README.md` as implementation progresses.
