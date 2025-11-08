# Specialty Enablement Blueprint

> **Purpose:** document the end-to-end plan for making EHRConnect dynamically specialty-aware, covering patient data, workflow changes, scheduling, staffing, reporting, and the actionable engineering stories (with acceptance criteria) needed to deliver it. This is the authoritative reference for OB/NICU and Ortho/Wound bundles, and it generalizes to additional specialties.

---

## 1. Target State Overview

| Layer | Current State | Target State | Key Changes |
|-------|---------------|--------------|-------------|
| Org Config | Static org specialties stored in backend but not governed | Declarative “specialty packs” toggled per org/department | Specialty catalog UI, metadata propagation, audit |
| Patient Data | Generic demographics & encounters | Specialty-specific Questionnaires/Observations per visit type | Prenatal, neonatal, ortho, wound templates auto-bound to context |
| Scheduling | Standard appointment types & recurrence | Specialty visit taxonomy + resource-aware recurrence protocols | Routing by provider/location/supply availability, per-pack recurrences |
| Workflows | Generic encounter flow | Stage-based pathways (prenatal→postpartum, peri-op, wound-care) | Embedded checklists, auto-triggered tasks, telemetry |
| Staffing | Roles captured manually | Specialty role profiles, ward tagging, staffing boards | Age/specialty enforcement, escalation paths, workload KPIs |
| Reporting | Generic workload report | Specialty KPIs per pack | Prenatal adherence, NICU LOS, wound healing trends, ortho throughput |

---

## 2. Patient Journey Mapping

### 2.1 OB/NICU End-to-End Journey

1. **Registration & Intake**
   - Patient picks OB specialty during onboarding. The Org Specialty Catalog auto-assigns prenatal intake Questionnaire capturing gravida/para, LMP, EDD, risk factors.
   - Acceptance: intake form mapped to FHIR QuestionnaireResponse; missing mandatory fields block submission; maternal record tagged `specialty=OB`.

2. **Prenatal Visits**
   - Each scheduled visit type (Initial Prenatal, Trimester Check, NST) loads the prenatal flowsheet template capturing vitals, labs, doppler readings.
   - Alerts push to watchlists if thresholds breached (e.g., BP>140/90). Telemetry logs completion time.

3. **Labor & Delivery**
   - L&D encounter triggers stage-based checklist (admission, active labor, delivery, postpartum). When delivery recorded:
     - Auto-create newborn patient record linked to maternal patient.
     - Prompt bed manager to assign neonatal bed honoring `age_restriction=neonatal`.
     - Spawn NICU tasks (APGAR doc, feeding plan) if infant admitted.

4. **NICU Stay**
   - NICU rounding list auto-populates with newborn details, ventilator settings, parental consents.
   - Specialty staffing board shows neonatologist + NICU nurse assignments. Escalations triggered if workload > target ratio.

5. **Postpartum Follow-Up**
   - Scheduler creates postpartum visits (6-week visit, depression screening) via recurring protocol. Maternal record transitions from OB to general once protocol complete, but retains specialty history for analytics.

### 2.2 Ortho + Wound Journey

1. **Referral & Pre-Op**
   - Patient flagged `specialty=Orthopedics`. Intake collects injury mechanism, implant history, diagnostics. Pre-op visit uses Ortho assessment template.

2. **Surgery**
   - Peri-op workflow logs implant UDI, anesthesia notes, intra-op events. Inventory decremented via implant catalog tie-in.

3. **Post-Op + Rehab**
   - Post-op appointment automatically generates PT recurring series (e.g., 3x/week for 6 weeks) using recurrence engine.
   - Rehab plan delivered via patient portal; therapist documentation uses specialty templates.

4. **Wound Care Episode**
   - If wound develops, patient or wound team schedules wound visit type. Wound assessment template (location, stage, measurements, photo metadata) auto-loads and ties to encounter.
   - Daily wound dressing recurrence set up; supplies reserved (bandages, NPWT pumps) via resource dependency rules.

5. **Cross-Specialty Continuity**
   - Patient can have overlapping specialty episodes. The chart header displays active specialties, enabling clinicians to pick the correct template. Specialty packs record state transitions (OB episode closed, wound episode opened) for longitudinal analytics.

---

## 3. Workflow Changes (Existing → Target)

| Workflow | Today | Needed Change | Notes |
|----------|-------|---------------|-------|
| Encounter Start | Manual template selection | Auto-select template based on specialty context (location, provider, episode) | Use specialty metadata already stored in providers/wards |
| Intake | Single generic form | Specialty intake libraries (prenatal, ortho, wound) | Driven by No-Code Template Studio backlog item |
| Scheduling | Provider-first booking | Visit-type taxonomy with specialty routing & resource checks | Resource bindings ensure NICU beds, implant sets, wound supplies available |
| Recurrence | Manual recurrence entry | Prebuilt protocols (NST weekly, wound daily) | Recurring engine already supports examples |
| Workflow Tasks | Ad-hoc checklists | Stage-based checklists per specialty | Blocks progression unless required tasks done or override reason |
| Staff Assignment | Generic roles | Specialty roles + staffing board | Roles feed RBAC and reporting |
| Reporting | Generic workload counts | Specialty KPIs (prenatal adherence, NICU LOS, wound healing) | Extend existing specialty workload report |

---

## 4. Data Model & Integration Touchpoints

1. **Org Configuration**
   - Extend `organizations.settings` with:
     ```json
     {
       "specialtiesEnabled": ["ob", "nicu", "orthopedics", "wound"],
       "defaultSpecialty": "primary-care",
       "departmentOverrides": {
         "nicu": { "enabledPacks": ["nicu"], "templateOverrides": { ... } }
       }
     }
     ```
   - Surface via admin UI; propagate to NextAuth session (org_specialties) and frontend context.

2. **Patient Episodes**
   - Create `patient_specialty_episodes` table referencing patient, specialty, start/end, active templates, assigned care team.
   - Encounters reference the active episode to derive context.

3. **Questionnaires & Observations**
   - Store template metadata in `template_library` table; versioned per specialty pack.
   - Binding ensures submissions map to FHIR QuestionnaireResponse/Observation for reporting.

4. **Scheduling Metadata**
   - `visit_types` table keyed by specialty: fields for default duration, required roles, required resources, recurrence presets.
   - API returns visit type detail so frontend can drive UI.

5. **Resource Inventory**
   - Reuse inventory tables to track specialty supplies (implants, wound kits). Add linking table between visit type and resource SKU requirement.

6. **Staffing**
   - Extend practitioner profile with `specialtyRoles` array (e.g., `['ob_nurse', 'wound_rn']`). RBAC uses these scopes.
   - Ward table already includes `specialty`, `age_restriction`, `gender_restriction`; ensure UI enforces them.

---

## 5. Engineering Stories & Acceptance Criteria

> Legend: (BE) = backend owner, (FE) = frontend owner, (INF) = infrastructure/DevOps, (QA) = quality.

### Epic A: Org Specialty Catalog & Context Propagation
1. **Story A1 – Catalog API & Schema (BE)**
   - Implement backend endpoints to read/write specialty packs per org/department.
   - **AC:** CRUD endpoints secured; validation prevents enabling pack without required templates; config stored with version+audits; 400 error with actionable message when dependency missing.
2. **Story A2 – Admin UI (FE)**
   - Build UI wizard to toggle packs, upload overrides, preview impacted templates.
   - **AC:** Save updates without page reload; preview shows diff; audit log entry with actor/time; optimistic UI rollbacks on error.
3. **Story A3 – Context Injection (BE/FE)**
   - Inject specialty context into session + frontend provider so components know active packs.
   - **AC:** Feature toggles respected immediately after change; navigation auto-adjusts; telemetry event when pack toggled; SSR/CSR parity verified.
4. **Story A4 – Department Overrides & Propagation (BE)**
   - Support nested overrides (org default → location → department → service line).
   - **AC:** Highest-specificity override always wins; API returns resolved config; regression tests cover overlapping overrides.
5. **Story A5 – Change History & Rollback (INF)**
   - Store versioned snapshots; enable “rollback to previous config” button.
   - **AC:** Users can revert within 3 clicks; rollback emits audit + webhook; read replica reflects change within 30 seconds.

### Epic B: Patient Data Extensions
1. **Story B1 – Prenatal Questionnaire (FE/BE)**
   - Build template + binding as described earlier.
   - **AC:** Template versioning; translations supported; exports include full dataset; PDF preview matches current style guide.
2. **Story B2 – Newborn Auto-Creation (BE)**
   - Implementation details per journey above.
   - **AC:** Race conditions handled; duplicate prevention if twin births; error surfaced if NICU beds full; metrics recorded for newborn-creation success/failure.
3. **Story B3 – Ortho Implant Log (FE/BE)**
   - Capture UDI, tie to inventory, enforce catalog membership.
   - **AC:** Submission fails if SKU inactive; implant usage visible in case summary; inventory decremented atomically; audit log shows implant + surgeon.
4. **Story B4 – Wound Assessment & Media (FE/BE)**
   - Template with photo metadata storage.
   - **AC:** Upload limit enforcement; thumbnails accessible from encounter; secure URL with expiry; healing trend chart auto-updates; PHI storage encrypted at rest.
5. **Story B5 – Episode Timeline & State Machine (BE)**
   - Create `patient_specialty_episodes` table + APIs to open/close episodes, track milestones.
   - **AC:** Cannot open duplicate active episode for same specialty unless flag `allowConcurrent`; timeline view shows milestones; closing requires resolution reason.
6. **Story B6 – Episode Header Component (FE)**
   - Display active specialties, stage, responsible team on patient chart header.
   - **AC:** Header updates in <500ms when episode changes; clicking specialty opens episode drawer; responsive for mobile.
7. **Story B7 – Data Migration & Backfill (BE/INF)**
   - Script to backfill historical encounters into episodes, populate baseline specialty flags.
   - **AC:** Dry-run produces report; production run resumable; QA spot-check shows >95% accuracy; fallback plan documented.

### Epic C: Scheduling & Recurrence
1. **Story C1 – Visit Type Taxonomy (BE/FE)**
   - CRUD for specialty visit types with routing rules.
   - **AC:** API filters providers by specialty+location; UI auto-suggests best match; fallback to manual override with justification; analytics log chosen vs. overridden provider.
2. **Story C2 – Protocol Library (FE)**
   - Store recurrence presets; UI to pick preset.
   - **AC:** Changing preset updates all future instances; conflict detection warns if provider unavailable; log modifications; patient sees consolidated schedule.
3. **Story C3 – Resource Dependency Engine (BE)**
   - Validate resource availability during booking.
   - **AC:** Booking blocked when resources at zero; admin override records reason; resource usage tracked per appointment; nightly job reconciles shortages.
4. **Story C4 – Multi-Specialty Episode Scheduling (FE/BE)**
   - Support scheduling across overlapping episodes (e.g., postpartum + wound).
   - **AC:** UI warns if appointment conflicts with rest restrictions; scheduler can link visit to multiple episodes; calendar color-codes by specialty.
5. **Story C5 – Patient-Facing Specialty Journey View (FE)**
   - Update portal to show prenatal, NICU, ortho, wound timelines with upcoming visits/forms.
   - **AC:** Patients see step-by-step journey; can complete forms ahead; push notifications respect specialty context.

### Epic D: Workflow Automation
1. **Story D1 – Prenatal Flowsheet & Alerts (FE/BE)**
   - Implement flowsheet sections + alert rules.
   - **AC:** Alerts create watchlist entries; dismiss requires reason; flowsheet export shareable as PDF; integration test covers alert pipeline.
2. **Story D2 – Labor/NICU Hand-off (FE/BE)**
   - Stage checklists, newborn task generation.
   - **AC:** Stage cannot complete without required items; newborn tasks assigned automatically; notifications sent to NICU lead; concurrency-safe for twin deliveries.
3. **Story D3 – Ortho Peri-Op Pathway (FE/BE)**
   - Pre/intra/post-op templates + rehab plan generator.
   - **AC:** Changing implant auto-updates post-op orders; rehab plan delivered to patient portal; compliance tracked; cancellations trigger restock workflow.
4. **Story D4 – Wound Visit Flow (FE/BE)**
   - Multi-step visit wizard with supply handling.
   - **AC:** Closing visit enforces before/after photo or exception; supply reorder queue populated; patient education summary auto-sent; recurrence auto-updates if healing stage advances.
5. **Story D5 – Episode Transition Automation (BE)**
   - Automate transitions (OB→postpartum, surgery→wound-care) based on encounter outcomes.
   - **AC:** Transition rules configurable; events published to integration bus; manual override available with reason logging.
6. **Story D6 – Clinical Decision Support Hooks (BE)**
   - Specialty-specific CDS (e.g., prenatal risk scoring, wound infection alerts) via FHIR CDS Hooks.
   - **AC:** Hook triggered at appropriate context; recommendations displayed inline; acceptance/rejection recorded.

### Epic E: Staffing & Capacity
1. **Story E1 – Specialty Role Profiles (BE/FE)**
   - Extend practitioner model + RBAC.
   - **AC:** Roles editable in UI; API exposes roles; staff see only relevant templates; audit on role change.
2. **Story E2 – Ward Enforcement (FE/BE)**
   - UI + backend validation for ward specialty/age rules.
   - **AC:** Admission attempt to wrong ward blocked; override requires admin credentials; occupancy dashboards reflect restrictions; HL7 ADT feeds updated.
3. **Story E3 – Staffing Board (FE)**
   - Kanban-style board showing assignments & load.
   - **AC:** Drag-drop updates schedules; overload triggers alert; board filterable by specialty/location; board auto-refreshes every 30s without flicker.
4. **Story E4 – Escalation Matrix & Paging (BE/FE)**
   - Define escalation paths per specialty, integrate with notification service.
   - **AC:** On-call roster respects specialty; escalations logged; SLA timers tracked.
5. **Story E5 – Capacity Forecasting (BE/DS)**
   - Forecast NICU bed usage, OR block time, wound-clinic chair time using historical data.
   - **AC:** Forecast visible on dashboard; accuracy metrics calculated; manual adjustments possible.

### Epic F: Reporting & Telemetry
1. **Story F1 – Specialty KPI Dashboards (FE/BE)**
   - Extend provider specialty report with pack-specific metrics.
   - **AC:** Dashboards show metrics (prenatal adherence %, NICU LOS, wound healing velocity, ortho throughput); export works; empty state handled; data filters by org/department.
2. **Story F2 – Adoption Telemetry (INF/BE)**
   - Instrument pack usage events.
   - **AC:** Metrics available within 5 minutes; alerts when usage below threshold; data segmented by specialty/department; dashboards highlight outliers.
3. **Story F3 – Clinical Outcomes Reporting (BE/FE)**
   - Build reports for key outcomes (NICU LOS distribution, wound closure days, implant failure rate).
   - **AC:** Report definitions versioned; data validated against sample set; scheduled email exports available.
4. **Story F4 – Regulatory/Quality Exports (BE)**
   - Generate specialty-specific regulatory exports (e.g., obstetric quality measures, wound infection rates).
   - **AC:** Export aligns with specs; download history tracked; integration hook to send to external registries.
5. **Story F5 – Patient Journey Analytics (DS)**
   - Visualize patient transitions across specialties.
   - **AC:** Sankey/flow report showing counts; filters by timeframe/org; supports drill-down to patient list (PHI-protected).

### Epic G: Patient Experience Enhancements
1. **Story G1 – Journey Timeline in Portal (FE)**
   - Patients view active specialty journeys with milestones, tasks, forms.
   - **AC:** Timeline interactive; completed steps collapsible; overdue tasks highlighted.
2. **Story G2 – Specialty Education Libraries (FE/BE)**
   - Serve curated education content per specialty (prenatal, NICU parenting, wound care).
   - **AC:** Content localized; analytics track views; clinicians can assign resources.
3. **Story G3 – Secure Messaging Tagging (FE/BE)**
   - Auto-tag messages with specialty context to route to correct team.
   - **AC:** OB message routed to OB inbox; wound queries to wound team; manual retagging allowed.

### Epic H: Quality & Validation
1. **Story H1 – Automated Test Harness**
   - Create Cypress/Playwright suites covering specialty flows.
   - **AC:** CI runs journeys (prenatal-to-NICU, ortho-to-wound); flake rate <2%; artifacts stored.
2. **Story H2 – Data Validation Scripts**
   - SQL checks ensuring required Observations captured for each specialty encounter.
   - **AC:** Nightly job alerts when missing data; dashboard summarizing compliance.
3. **Story H3 – Security & Privacy Review**
   - Ensure new templates, photos, episodes follow HIPAA controls.
   - **AC:** Threat model updated; encryption verified; audit logging coverage documented.
4. **Story H4 – Performance Benchmarking**
   - Load tests for new dashboards/templates.
   - **AC:** P95 response time < specified SLA; remediation plan if exceeded.
5. **Story H5 – Rollout Playbook**
   - Document deployment steps, tenant readiness checklist, rollback plan.
   - **AC:** Runbook approved by ops; simulated rollback completed; knowledge base article published.

---

## 6. Assignment & Implementation Guidance

- **Sequencing:** deliver Epic A first (catalog/context), then B & C in parallel (data + scheduling), followed by D/E, and finally F. Each epic can be split across squads (e.g., “Maternal & Neonatal” vs “MSK & Wound”).
- **Dependencies:** Workflow automation depends on specialty templates (Epic B). Reporting needs telemetry from earlier epics.
- **Testing:** create staged tenants per specialty; run journey scripts (prenatal to NICU, ortho surgery to wound care) validating all state transitions.
- **Change Management:** every pack update follows dev→QA→pilot→prod promotion with rollback plan; document in release notes.

---

## 7. Existing Workflow Impact Summary

- **Encounter Launch:** Now specialty-aware—templates load automatically based on patient episode/provider/department.
- **Scheduling:** Booking flow asks for visit type first, then suggests providers/locations/resources; recurrence options pre-filled by specialty protocol.
- **Charting:** Clinicians see stage-based checklists; cannot skip required steps without justification.
- **Staffing:** Assignment boards replace manual spreadsheets; enforced specialty/age restrictions reduce placement errors.
- **Patient Continuity:** Episodes track active specialties so a patient can finish prenatal care, then start wound-care without losing history. Chart header shows active packs; cross-specialty alerts ensure context follows the patient.

---

## 8. Next Steps

1. Review this blueprint with clinical leads for scope validation.
2. Create Jira epics/stories per the breakdown above.
3. Stand up specialty-specific sandbox tenants to pilot OB/NICU and Ortho/Wound journeys.
4. Implement telemetry + reporting early to measure adoption and iterate quickly.

This README should evolve alongside implementation—update sections as packs are delivered or new specialties are added.

---

## 9. Extensible Specialty Module Framework

To keep specialty enablement extensible, high-performing, and manageable, treat every specialty as a modular pack rather than a code fork.

### 9.1 Pack Structure
- Location: `specialty-packs/{specialtySlug}` in repo or artifact store.
- Required files:
  - `pack.json` – metadata (name, version, dependencies, default roles, feature flags).
  - `templates/` – Questionnaire/form JSON + validations.
  - `workflows/` – Stage/checklist definitions, automation rules.
  - `visit-types.json` – Appointment taxonomy, resource bindings, recurrence presets.
  - `reports.json` – KPI definitions, dashboards to surface.
  - `resources/` – education content, device configs, consent templates.

### 9.2 Registry & Loader
- Build a `SpecialtyRegistry` service that:
  - Validates pack schema on load (CI + runtime).
  - Resolves dependencies (e.g., wound pack requires inventory module).
  - Caches compiled templates (Redis/memory) with version hash for fast lookup.
  - Exposes GraphQL/REST endpoints to fetch pack components lazily per request.
- Hot-reload support: toggle pack without redeploy; registry invalidates cache and propagates via pub/sub.

### 9.3 Frontend Composition
- Introduce a `useSpecialtyPack()` hook returning templates, nav nodes, and widgets for the active specialty.
- Components consume schema-driven configs; no hard-coded specialty logic in React/Next components.
- Feature flags: `pack.json` declares toggles; UI hides modules until flag enabled for tenant.

### 9.4 Backend Integration
- Service layer reads pack metadata to determine:
  - Required FHIR mappings.
  - Additional validation rules.
  - Automation triggers (CDS Hooks, notifications).
- When new specialty added, only metadata changes; services remain generic.

### 9.5 Performance Practices
- Precompile frequently used templates and store compressed JSON in CDN/edge cache.
- Memoize specialty resolution per request (org + department + location) to avoid repeated DB hits.
- Batch API responses (e.g., fetch all specialty components in one call) to reduce round trips.
- Telemetry monitors render time per specialty to catch regressions.

### 9.6 Developer Workflow
1. `yarn specialty:init <slug>` scaffolds pack directory with schema stubs.
2. Author templates/workflows using shared JSON schemas with linting.
3. Run `yarn specialty:validate` to ensure schema compliance and dependency graph integrity.
4. Publish pack artifact (tarball or OCI) to registry; CI tests load + integration suites.
5. Ops enables pack via Org Specialty Catalog; registry hot-loads and caches.

### 9.7 Adding New Specialties
- Define pack metadata + dependencies.
- Configure visit types, intake, workflows, reports as metadata.
- Provide migration scripts only when new tables unavoidable (versioned + reversible).
- Document pack-specific playbook (KPIs, templates) in `docs/speciality/{slug}/`.

This framework lets engineering add future specialties (cardio, oncology, wound, etc.) by shipping configuration-driven packs, ensuring maintainability and high performance even as service lines grow.

---

## 10. Implementation Task Checklist

### Phase 1 – Framework (Weeks 1‑4)
- [ ] Backend – Org Specialty Catalog API (CRUD, validation, audits)
- [ ] Frontend – Admin UI wizard for enabling/disabling packs with preview
- [ ] Platform – SpecialtyRegistry service (loader, cache, dependency resolver, APIs)
- [ ] Web – Session/context propagation + `useSpecialtyPack` hook
- [ ] DevEx – `yarn specialty:init` & `yarn specialty:validate` CLI + CI pipeline
- [ ] Forms/Clinical – Default/general pack metadata (intake, visit types, workflows, reports)

### Phase 2 – Default Pack Hardening (Weeks 3‑6)
- [ ] Map existing generic workflows into default pack templates
- [ ] Regression suite ensuring legacy tenants behave identically with pack enabled
- [ ] Performance benchmarks (template load latency, registry cache hit rate) with tuning plan

### Phase 3 – Gynac Pack Pilot (Weeks 5‑8)
- [ ] Author gynac pack configs per `docs/speciality/gynanc/*`
- [ ] Implement patient episode state machine + complication hooks
- [ ] Stand up sandbox tenant and run prenatal→postpartum E2E scripts
- [ ] Clinician review + iteration on pack schemas/automation rules

### Phase 4 – Production Enablement (Weeks 8‑10)
- [ ] Roll gynac pack to pilot tenants behind feature flag, monitor telemetry
- [ ] Publish enablement playbook + pack release process for future specialties
- [ ] Ops/support training (troubleshooting, rollback, reporting playbooks)

---

## 11. Org Specialty Configuration Blueprint

### 11.1 Backend Schema
| Table | Columns | Notes |
|-------|---------|-------|
| `org_specialty_settings` | `id`, `org_id`, `pack_slug`, `pack_version`, `enabled`, `scope` (`org`/`location`/`department`/`service_line`), `scope_ref_id`, `overrides` (JSONB), `created_by`, `updated_by`, timestamps | One row per scope-specific pack setting; composite unique constraint on `org_id+pack_slug+scope+scope_ref_id`. |
| `specialty_pack_audits` | `id`, `org_id`, `pack_slug`, `pack_version`, `action`, `actor_id`, `metadata`, `created_at` | Immutable audit log for enable/disable/rollback actions. |
| `specialty_dependency_graph` | `pack_slug`, `requires[]`, `conflicts[]` | Cached representation loaded from pack metadata to validate enablement. |

### 11.2 REST/GraphQL APIs
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/orgs/:orgId/specialties` | GET | Returns resolved specialty config (org + overrides) including dependency status and lifecycle state. |
| `/api/admin/orgs/:orgId/specialties` | PUT | Accepts `{ enable: [{ slug, version, scope, scopeRefId, overrides }], disable: [{ slug, scope, scopeRefId }] }`; validates dependencies, writes config rows, emits events. |
| `/api/admin/orgs/:orgId/specialties/:slug/history` | GET | Lists audit events (enable, disable, rollback) for compliance review. |
| `/api/specialties/context` | GET | Given headers (`org`, `location`, `department`, `user`), returns resolved `specialtiesEnabled[]` for runtime services. |
| `/api/specialties/packs/:slug/components` | GET | Returns pack templates/visit types/workflows for the requesting context with `pack_version` metadata. |

All APIs must:
1. Require JWT scopes (`org:manage_specialties` for admin endpoints, `specialties:read` for runtime).
2. Validate pack lifecycle (cannot enable `draft` packs in production).
3. Emit domain events (`specialty.pack.updated`) consumed by registry + telemetry services.

### 11.3 Web App Settings (Admin UI)
Screens to build:
1. **Specialty Catalog List**
   - Columns: Pack name, version, lifecycle, dependencies, status per scope.
   - Actions: Enable/Disable, Preview pack details, View history.
2. **Scope Overrides Drawer**
   - Allows selecting location/department/service line, toggling pack, adjusting overrides (template substitutions, feature flags).
   - Shows effective configuration (inheritance tree).
3. **Pack Detail Modal**
   - Displays templates/visit types/workflows included.
   - Shows dependency/conflict matrix, supported languages, release notes.
4. **Audit Trail View**
   - Timeline of enable/disable operations with actor, reason, diff.

UI Requirements:
- Real-time feedback: after enabling pack, show toast with status + background progress (registry warm-up).
- Validation messaging: dependency/conflict warnings must block submission.
- Rollback button per pack (reverts to previous version/scope combo).
- Accessibility/i18n: all controls keyboard accessible, labels localized.

Definition of Done for this blueprint:
- Backend schema merged with migrations + tests.
- REST APIs implemented with validation, audit logging, and event emission.
- Admin UI screens functional, tested (unit + E2E) covering enable, disable, overrides, history.
- Documentation (this README + API docs) updated; release plan covers tenant rollout.
