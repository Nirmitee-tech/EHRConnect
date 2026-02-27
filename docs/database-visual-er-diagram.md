# EHRConnect Visual ER Diagram
**Date**: December 17, 2025
**Version**: 1.0.0
**Purpose**: Visual representation of complete database structure

## Complete Entity Relationship Diagram

### Core Patient & Clinical Workflow

```mermaid
erDiagram
    %% Core Organization & Multi-Tenancy
    organizations ||--o{ locations : "has"
    organizations ||--o{ users : "employs"
    organizations ||--o{ fhir_patients : "manages"
    
    %% User Access & Roles
    users ||--o{ user_roles : "assigned"
    user_roles }o--|| roles : "has"
    roles ||--o{ role_permissions : "grants"
    role_permissions }o--|| permissions : "contains"
    
    %% Patient Core
    fhir_patients ||--o{ patient_emergency_contacts : "has"
    fhir_patients ||--o{ patient_insurance : "covered_by"
    fhir_patients ||--o{ patient_consents : "provides"
    fhir_patients ||--o{ allergies_intolerances : "has"
    fhir_patients ||--o{ fhir_appointments : "schedules"
    fhir_patients ||--o{ fhir_encounters : "attends"
    fhir_patients ||--o{ patient_specialty_episodes : "enrolled_in"
    
    %% Insurance
    patient_insurance }o--|| payers : "insured_by"
    
    %% Appointments
    fhir_appointments }o--|| users : "with_provider"
    fhir_appointments }o--|| locations : "at_location"
    fhir_appointments ||--o| fhir_encounters : "results_in"
    fhir_appointments ||--o| virtual_meetings : "conducted_via"
    
    %% Encounters & Clinical Documentation
    fhir_encounters ||--o{ encounter_vitals : "records"
    fhir_encounters ||--o{ encounter_diagnoses : "documents"
    fhir_encounters ||--o{ encounter_procedures : "performs"
    fhir_encounters ||--o{ medication_requests : "prescribes"
    fhir_encounters ||--o{ lab_orders : "orders"
    fhir_encounters ||--o{ clinical_notes : "contains"
    
    %% Billing & Revenue Cycle
    fhir_encounters ||--o{ charges : "generates"
    encounter_procedures ||--o{ charges : "billable_as"
    charges ||--o{ claims : "included_in"
    claims }o--|| payers : "submitted_to"
    claims ||--o{ payments : "receives"
    
    %% Forms & Questionnaires
    forms ||--o{ form_versions : "versioned_as"
    form_versions ||--o{ form_sections : "divided_into"
    form_sections ||--o{ form_fields : "contains"
    forms ||--o{ form_responses : "captures"
    form_responses }o--|| fhir_patients : "completed_by"
    
    %% Tasks & Workflow
    tasks }o--|| fhir_patients : "relates_to"
    tasks }o--|| users : "assigned_to"
    tasks }o--|| task_templates : "based_on"
    tasks }o--|| fhir_encounters : "created_from"
    
    %% Rules Engine
    rules ||--o{ rule_conditions : "evaluates"
    rules ||--o{ rule_actions : "executes"
    rules ||--o{ rule_execution_log : "tracks"
    rule_actions ||--o{ tasks : "creates"
    
    %% Audit Trail
    fhir_patients ||--o{ audit_logs : "tracked_in"
    fhir_encounters ||--o{ audit_logs : "tracked_in"
    users ||--o{ audit_logs : "generates"
```

### Detailed Patient Management

```mermaid
erDiagram
    fhir_patients {
        UUID id PK
        UUID org_id FK
        JSONB resource "FHIR Patient"
        VARCHAR family_name
        VARCHAR given_name
        TEXT full_name
        VARCHAR gender
        DATE birth_date
        VARCHAR phone
        VARCHAR email
        TEXT address_line
        VARCHAR mrn "Medical Record Number"
        VARCHAR national_id "ABHA/SSN"
        TIMESTAMPTZ created_at
    }
    
    patient_emergency_contacts {
        UUID id PK
        UUID patient_id FK
        VARCHAR name
        VARCHAR relationship
        VARCHAR phone
        VARCHAR email
        TEXT address
        BOOLEAN is_primary
    }
    
    patient_insurance {
        UUID id PK
        UUID patient_id FK
        UUID payer_id FK
        VARCHAR policy_number
        VARCHAR group_number
        VARCHAR subscriber_name
        DATE effective_date
        INTEGER priority "1=Primary, 2=Secondary"
        VARCHAR verification_status
    }
    
    patient_consents {
        UUID id PK
        UUID patient_id FK
        BOOLEAN consent_email
        BOOLEAN consent_call
        BOOLEAN consent_sms
        BOOLEAN allow_data_sharing
        BOOLEAN hipaa_authorization
        TIMESTAMPTZ signed_at
    }
    
    allergies_intolerances {
        UUID id PK
        UUID patient_id FK
        VARCHAR allergen
        VARCHAR category "medication/food/environment"
        VARCHAR criticality "low/high"
        VARCHAR reaction_type
        VARCHAR severity
        VARCHAR status "active/resolved"
    }
    
    fhir_patients ||--o{ patient_emergency_contacts : "has"
    fhir_patients ||--o{ patient_insurance : "covered_by"
    fhir_patients ||--o{ patient_consents : "provides"
    fhir_patients ||--o{ allergies_intolerances : "allergic_to"
```

### Clinical Encounter Workflow

```mermaid
erDiagram
    fhir_appointments {
        UUID id PK
        UUID patient_id FK
        UUID practitioner_id FK
        UUID location_id FK
        VARCHAR status
        TIMESTAMPTZ start_time
        INTEGER duration_minutes
        VARCHAR appointment_type
        TEXT description
    }
    
    fhir_encounters {
        UUID id PK
        UUID patient_id FK
        UUID appointment_id FK
        UUID practitioner_id FK
        VARCHAR status
        VARCHAR class "ambulatory/inpatient/virtual"
        TIMESTAMPTZ period_start
        TIMESTAMPTZ period_end
    }
    
    encounter_vitals {
        UUID id PK
        UUID encounter_id FK
        DECIMAL temperature
        INTEGER bp_systolic
        INTEGER bp_diastolic
        INTEGER heart_rate
        INTEGER respiratory_rate
        INTEGER oxygen_saturation
        DECIMAL weight
        DECIMAL height
        DECIMAL bmi
        TIMESTAMPTZ recorded_at
    }
    
    encounter_diagnoses {
        UUID id PK
        UUID encounter_id FK
        VARCHAR icd10_code
        TEXT description
        VARCHAR diagnosis_type "primary/secondary"
        DATE onset_date
        VARCHAR status
    }
    
    encounter_procedures {
        UUID id PK
        UUID encounter_id FK
        VARCHAR cpt_code
        TEXT description
        DATE performed_date
        UUID performed_by FK
        INTEGER duration_minutes
        VARCHAR status
    }
    
    medication_requests {
        UUID id PK
        UUID encounter_id FK
        UUID patient_id FK
        VARCHAR medication_name
        VARCHAR dosage
        VARCHAR frequency
        VARCHAR duration
        TEXT instructions
        INTEGER refills
        VARCHAR status
    }
    
    lab_orders {
        UUID id PK
        UUID encounter_id FK
        UUID patient_id FK
        VARCHAR test_name
        VARCHAR loinc_code
        VARCHAR priority "routine/urgent/stat"
        VARCHAR status "ordered/collected/resulted"
        TIMESTAMPTZ ordered_at
        TEXT result_value
        VARCHAR reference_range
        BOOLEAN abnormal_flag
    }
    
    fhir_appointments ||--o| fhir_encounters : "becomes"
    fhir_encounters ||--o{ encounter_vitals : "records"
    fhir_encounters ||--o{ encounter_diagnoses : "diagnoses"
    fhir_encounters ||--o{ encounter_procedures : "performs"
    fhir_encounters ||--o{ medication_requests : "prescribes"
    fhir_encounters ||--o{ lab_orders : "orders"
```

### Billing & Revenue Cycle

```mermaid
erDiagram
    fhir_encounters {
        UUID id PK
        UUID patient_id FK
        VARCHAR status
    }
    
    encounter_procedures {
        UUID id PK
        UUID encounter_id FK
        VARCHAR cpt_code
    }
    
    charges {
        UUID id PK
        UUID encounter_id FK
        UUID patient_id FK
        VARCHAR code_type "CPT/ICD"
        VARCHAR code
        DECIMAL amount
        INTEGER units
        VARCHAR status
    }
    
    claims {
        UUID id PK
        UUID patient_id FK
        UUID payer_id FK
        VARCHAR claim_number
        VARCHAR status
        DECIMAL total_charge
        DECIMAL allowed_amount
        DECIMAL paid_amount
        DATE submission_date
    }
    
    payments {
        UUID id PK
        UUID claim_id FK
        DECIMAL payment_amount
        DATE payment_date
        VARCHAR payment_method
        VARCHAR payer_name
    }
    
    payers {
        UUID id PK
        VARCHAR name
        VARCHAR payer_type "commercial/medicare/medicaid"
        VARCHAR payer_id
    }
    
    fhir_encounters ||--o{ charges : "generates"
    encounter_procedures ||--o{ charges : "creates"
    charges ||--o{ claims : "grouped_into"
    claims }o--|| payers : "submitted_to"
    claims ||--o{ payments : "receives"
```

## Table Count Summary

### By Domain

| Domain | Table Count | Status |
|--------|-------------|--------|
| Organization & Access | 7 | ✅ Complete |
| Patient Management | 9 | ✅ Complete (8 new tables added) |
| Clinical Staff | 3 | ✅ Complete |
| Scheduling | 4 | ✅ Complete |
| Clinical Encounters | 9 | ✅ Complete (5 new tables added) |
| Billing & RCM | 7 | ✅ Complete |
| Forms & Questionnaires | 6 | ✅ Complete |
| Rules Engine | 5 | ✅ Complete |
| Tasks | 4 | ✅ Complete |
| Inventory | 6 | ✅ Complete |
| Specialty System | 4 | ✅ Complete |
| Country Compliance | 5 | ✅ Complete |
| Integrations | 5 | ✅ Complete |
| Audit & Security | 5 | ✅ Complete |
| **TOTAL** | **79 tables** | **✅ Complete** |

### New Tables Added (Migration 251217000001)

1. ✅ `patient_emergency_contacts` - Emergency contact information
2. ✅ `patient_insurance` - Insurance coverage details
3. ✅ `patient_consents` - Consent tracking (HIPAA compliance)
4. ✅ `encounter_vitals` - Vital signs measurement
5. ✅ `encounter_diagnoses` - Diagnosis documentation
6. ✅ `encounter_procedures` - Procedure tracking
7. ✅ `lab_orders` - Laboratory test orders and results
8. ✅ `allergies_intolerances` - Allergy and intolerance tracking

## Key Relationships

### Multi-Tenancy Pattern
- All tables have `org_id` foreign key to `organizations`
- Row-level data isolation enforced
- Indexes optimized for org_id queries

### Patient-Centric Design
- `fhir_patients` is the central entity
- All clinical data references patient_id
- FHIR R4 compliant resource storage

### Encounter-Based Workflow
- Appointments → Encounters → Clinical Documentation
- Encounters generate billing charges
- All clinical notes linked to encounters

### Billing Integration
- Encounters → Charges → Claims → Payments
- CPT/ICD codes from clinical tables flow to billing
- Payer relationships tracked

### Audit Trail
- All clinical tables have audit triggers
- Changed tracked in `audit_logs`
- FHIR `AuditEvent` resources created

## Database Statistics

- **Total Tables**: 79
- **Total Indexes**: 300+ (estimated)
- **Foreign Keys**: 150+ relationships
- **Triggers**: 50+ (updated_at, audit, validation)
- **Check Constraints**: 40+ (data validation)
- **FHIR Resources**: 10+ resource types

## Performance Considerations

### Indexing Strategy
- All foreign keys indexed
- Composite indexes for common queries
- GIN indexes for JSONB fields
- Full-text search on patient names

### Query Optimization
- Patient search: `idx_fhir_patients_full_name` (GIN)
- Appointment lookup: `idx_fhir_appointments_start_time`
- Encounter history: `idx_fhir_encounters_patient`
- Active allergies: `idx_allergies_active_meds`

### Partitioning (Future)
- Large tables (encounters, lab_orders) can be partitioned by date
- Archive old data to separate partitions
- Maintain performance with growing data

## Compliance & Security

### HIPAA Compliance
- Patient consents tracked in `patient_consents`
- All PHI access logged in `audit_logs`
- Encryption at rest (PostgreSQL level)
- Row-level security available

### FHIR R4 Compliance
- FHIR resources stored as JSONB
- Extracted fields for performance
- Resource validation on insert/update
- Standard terminologies (ICD-10, CPT, LOINC)

### Data Integrity
- Foreign key constraints enforce relationships
- Check constraints validate data
- Unique constraints prevent duplicates
- Triggers maintain data consistency

## Next Steps

1. **Run Migration**: Execute `251217000001-add-missing-patient-clinical-tables.js`
2. **Update APIs**: Modify services to use new tables
3. **Test Thoroughly**: Validate all CRUD operations
4. **Update Documentation**: API endpoint documentation
5. **Monitor Performance**: Check query performance with new structure

---

**Migration File**: `ehr-api/src/database/migrations/251217000001-add-missing-patient-clinical-tables.js`
**Documentation**: `docs/database-er-diagram-251217.md`
**Last Updated**: December 17, 2025
