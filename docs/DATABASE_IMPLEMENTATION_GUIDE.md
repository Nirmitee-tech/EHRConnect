# Database Structure Implementation Guide
**Date**: December 17, 2025
**Migration**: 251217000001
**Status**: Ready for Implementation

## Overview

This guide provides step-by-step instructions for implementing the complete database structure with proper UI-to-database field mapping.

## Problem Statement

**User Issue**: 
> "I actually want to have a proper ER integration diagram with actual database field mapping with whatever I have in the UI with all the healthcare things which Epic Surgeon may have. It should map whatever my APIs are right now jumping in one file server but which is wrong. On the UI has so much data points; I want each and every one should have a table associated with it so we can actually build APIs and implement changes."

**Root Cause**: UI forms capture 50+ fields per patient, but several fields were not mapped to proper database tables, causing APIs to store data in file servers or JSON blobs instead of relational tables.

**Solution**: Created 8 new tables to complete the database structure, now providing proper table mappings for ALL UI data points.

## What Was Delivered

### 1. Documentation
- ✅ **Comprehensive ER Diagram** (`docs/database-er-diagram-251217.md`)
  - 1038 lines of detailed documentation
  - Complete UI-to-database field mapping for all forms
  - Table schemas with SQL definitions
  - Missing tables analysis
  - API update recommendations

- ✅ **Visual ER Diagrams** (`docs/database-visual-er-diagram.md`)
  - Mermaid diagrams for all relationships
  - Domain-specific workflow diagrams
  - Complete table structure overview
  - 79 total tables documented

### 2. Database Migration
- ✅ **New Migration File** (`ehr-api/src/database/migrations/251217000001-add-missing-patient-clinical-tables.js`)
  - Creates 8 new tables
  - Adds proper indexes and constraints
  - Includes audit triggers
  - Full rollback support

## New Tables Created

### 1. patient_emergency_contacts
**Purpose**: Store multiple emergency contacts per patient

**Columns**:
- id, org_id, patient_id (FKs)
- name, relationship, phone, email, address
- is_primary (boolean, only one per patient)

**UI Mapping**: Patient Form → "Emergency Contact" section

### 2. patient_insurance
**Purpose**: Store patient insurance coverage (multiple policies)

**Columns**:
- id, org_id, patient_id, payer_id (FKs)
- policy_number, group_number
- subscriber_name, subscriber_dob, relationship_to_subscriber
- effective_date, termination_date
- priority (1=Primary, 2=Secondary, 3=Tertiary)
- card_front_url, card_back_url
- verification_status, last_verified_at

**UI Mapping**: Patient Form → "Insurance" section

### 3. patient_consents
**Purpose**: Track patient consent for communications and data sharing (HIPAA compliance)

**Columns**:
- id, org_id, patient_id (FKs)
- consent_email, consent_call, consent_sms (booleans)
- allow_data_sharing, hipaa_authorization (booleans)
- research_consent, marketing_consent (booleans)
- consent_form_signed, consent_form_url
- signed_at, signed_by

**UI Mapping**: Patient Form → "Privacy & Consent" section

### 4. encounter_vitals
**Purpose**: Store vital signs captured during clinical encounters

**Columns**:
- id, org_id, encounter_id, patient_id (FKs)
- temperature, temperature_unit (F/C)
- bp_systolic, bp_diastolic (mmHg)
- heart_rate (bpm), respiratory_rate (breaths/min)
- oxygen_saturation (%)
- weight, weight_unit (kg/lbs)
- height, height_unit (cm/in)
- bmi (calculated)
- pain_score (0-10), head_circumference
- recorded_at, recorded_by

**UI Mapping**: Encounter Form → "Objective - Vitals" section

### 5. encounter_diagnoses
**Purpose**: Link diagnoses to encounters with ICD-10 codes

**Columns**:
- id, org_id, encounter_id, patient_id (FKs)
- icd10_code, description
- diagnosis_type (primary/secondary/differential/working)
- onset_date, resolution_date
- status (active/resolved/inactive/recurrence)
- notes
- created_by (FK to users)

**UI Mapping**: Encounter Form → "Assessment - Diagnoses" section

### 6. encounter_procedures
**Purpose**: Track procedures performed during encounters with CPT codes

**Columns**:
- id, org_id, encounter_id, patient_id (FKs)
- cpt_code, description
- performed_date, performed_by, assisted_by (FKs)
- duration_minutes, location
- status (preparation/in-progress/completed/aborted/cancelled)
- notes, complications

**UI Mapping**: Encounter Form → "Plan - Procedures" section

### 7. lab_orders
**Purpose**: Track laboratory test orders and results

**Columns**:
- id, org_id, encounter_id, patient_id (FKs)
- test_name, loinc_code, category
- priority (routine/urgent/stat/asap)
- status (ordered/collected/in-transit/in-lab/resulted/cancelled)
- ordered_by, ordered_at
- specimen_type, collection_method
- collected_by, collected_at
- resulted_at, resulted_by
- instructions, fasting_required
- result_value, result_unit, reference_range
- abnormal_flag, critical_flag, result_notes

**UI Mapping**: Encounter Form → "Plan - Lab Orders" section

### 8. allergies_intolerances
**Purpose**: Track patient allergies and intolerances (medication safety)

**Columns**:
- id, org_id, patient_id (FKs)
- allergen, allergen_code, allergen_system
- category (medication/food/environment/biologic/other)
- criticality (low/high/unable-to-assess)
- reaction_type, severity (mild/moderate/severe)
- onset_date, last_occurrence_date
- notes
- status (active/inactive/resolved)
- verification_status (unconfirmed/confirmed/refuted/entered-in-error)
- recorded_at, recorded_by

**UI Mapping**: Patient Form → "Clinical Context - Allergies" section

## Implementation Steps

### Step 1: Run Database Migration

```bash
cd ehr-api
npm run db:setup
```

This will execute migration `251217000001-add-missing-patient-clinical-tables.js` and create all 8 tables.

**Expected Output**:
```
🔄 Executing 251217000001-add-missing-patient-clinical-tables...
📋 Creating 8 new tables for complete UI-to-database field mapping:
   1. patient_emergency_contacts
   2. patient_insurance
   3. patient_consents
   4. encounter_vitals
   5. encounter_diagnoses
   6. encounter_procedures
   7. lab_orders
   8. allergies_intolerances
✅ 251217000001-add-missing-patient-clinical-tables completed successfully
✨ All UI data points now have proper database table mappings
```

### Step 2: Verify Migration

```bash
# Check migration status
npm run db:status

# Verify tables were created
psql $DATABASE_URL -c "\dt patient_*"
psql $DATABASE_URL -c "\dt encounter_*"
psql $DATABASE_URL -c "\dt allergies_*"
psql $DATABASE_URL -c "\dt lab_*"
```

### Step 3: Update API Services

Update the following service files to use the new tables:

#### A. Patient Service (`src/services/patient.service.js`)

**Add methods**:
```javascript
// Emergency Contacts
async addEmergencyContact(patientId, contactData) {
  const query = `
    INSERT INTO patient_emergency_contacts 
    (org_id, patient_id, name, relationship, phone, email, address, is_primary)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  // Implementation...
}

async getEmergencyContacts(patientId) {
  const query = `
    SELECT * FROM patient_emergency_contacts
    WHERE patient_id = $1 AND deleted_at IS NULL
    ORDER BY is_primary DESC, created_at ASC
  `;
  // Implementation...
}

// Insurance
async addInsurance(patientId, insuranceData) {
  const query = `
    INSERT INTO patient_insurance 
    (org_id, patient_id, payer_id, policy_number, group_number, ...)
    VALUES ($1, $2, $3, $4, $5, ...)
    RETURNING *
  `;
  // Implementation...
}

async getInsurances(patientId) {
  const query = `
    SELECT pi.*, p.name as payer_name
    FROM patient_insurance pi
    LEFT JOIN payers p ON pi.payer_id = p.id
    WHERE pi.patient_id = $1
    ORDER BY pi.priority ASC
  `;
  // Implementation...
}

// Consents
async updateConsents(patientId, consents) {
  const query = `
    INSERT INTO patient_consents 
    (org_id, patient_id, consent_email, consent_call, consent_sms, ...)
    VALUES ($1, $2, $3, $4, $5, ...)
    ON CONFLICT (org_id, patient_id) 
    DO UPDATE SET
      consent_email = EXCLUDED.consent_email,
      consent_call = EXCLUDED.consent_call,
      ...
    RETURNING *
  `;
  // Implementation...
}

// Allergies
async addAllergy(patientId, allergyData) {
  const query = `
    INSERT INTO allergies_intolerances 
    (org_id, patient_id, allergen, category, criticality, ...)
    VALUES ($1, $2, $3, $4, $5, ...)
    RETURNING *
  `;
  // Implementation...
}

async getAllergies(patientId, activeOnly = true) {
  const query = `
    SELECT * FROM allergies_intolerances
    WHERE patient_id = $1
    ${activeOnly ? "AND status = 'active'" : ''}
    ORDER BY criticality DESC, created_at DESC
  `;
  // Implementation...
}
```

#### B. Encounter Service (`src/services/encounter.service.js`)

**Add methods**:
```javascript
// Vitals
async recordVitals(encounterId, vitalsData) {
  // Calculate BMI if weight and height provided
  const bmi = calculateBMI(vitalsData.weight, vitalsData.height);
  
  const query = `
    INSERT INTO encounter_vitals 
    (org_id, encounter_id, patient_id, temperature, bp_systolic, 
     bp_diastolic, heart_rate, respiratory_rate, oxygen_saturation,
     weight, height, bmi, recorded_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *
  `;
  // Implementation...
}

// Diagnoses
async addDiagnosis(encounterId, diagnosisData) {
  const query = `
    INSERT INTO encounter_diagnoses 
    (org_id, encounter_id, patient_id, icd10_code, description, 
     diagnosis_type, onset_date, status, notes, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;
  // Implementation...
}

// Procedures
async recordProcedure(encounterId, procedureData) {
  const query = `
    INSERT INTO encounter_procedures 
    (org_id, encounter_id, patient_id, cpt_code, description,
     performed_date, performed_by, duration_minutes, status, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;
  // Implementation...
}

// Lab Orders
async orderLab(encounterId, labData) {
  const query = `
    INSERT INTO lab_orders 
    (org_id, encounter_id, patient_id, test_name, loinc_code,
     priority, status, ordered_by, specimen_type, instructions)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;
  // Implementation...
}

async updateLabResult(labOrderId, resultData) {
  const query = `
    UPDATE lab_orders 
    SET status = 'resulted',
        result_value = $1,
        result_unit = $2,
        reference_range = $3,
        abnormal_flag = $4,
        critical_flag = $5,
        result_notes = $6,
        resulted_at = CURRENT_TIMESTAMP,
        resulted_by = $7
    WHERE id = $8
    RETURNING *
  `;
  // Implementation...
}
```

### Step 4: Update API Routes

Add new endpoints in the respective route files:

#### Patient Routes (`src/routes/patients.js`)

```javascript
// Emergency Contacts
router.post('/:id/emergency-contacts', auth, rbac('patient:write'), async (req, res) => {
  const { id } = req.params;
  const contact = await patientService.addEmergencyContact(id, req.body);
  res.json(contact);
});

router.get('/:id/emergency-contacts', auth, rbac('patient:read'), async (req, res) => {
  const { id } = req.params;
  const contacts = await patientService.getEmergencyContacts(id);
  res.json(contacts);
});

// Insurance
router.post('/:id/insurance', auth, rbac('patient:write'), async (req, res) => {
  const { id } = req.params;
  const insurance = await patientService.addInsurance(id, req.body);
  res.json(insurance);
});

router.get('/:id/insurance', auth, rbac('patient:read'), async (req, res) => {
  const { id } = req.params;
  const insurances = await patientService.getInsurances(id);
  res.json(insurances);
});

// Consents
router.put('/:id/consents', auth, rbac('patient:write'), async (req, res) => {
  const { id } = req.params;
  const consents = await patientService.updateConsents(id, req.body);
  res.json(consents);
});

// Allergies
router.post('/:id/allergies', auth, rbac('patient:write'), async (req, res) => {
  const { id } = req.params;
  const allergy = await patientService.addAllergy(id, req.body);
  res.json(allergy);
});

router.get('/:id/allergies', auth, rbac('patient:read'), async (req, res) => {
  const { id } = req.params;
  const activeOnly = req.query.active !== 'false';
  const allergies = await patientService.getAllergies(id, activeOnly);
  res.json(allergies);
});
```

#### Encounter Routes (`src/routes/encounters.js`)

```javascript
// Vitals
router.post('/:id/vitals', auth, rbac('encounter:write'), async (req, res) => {
  const { id } = req.params;
  const vitals = await encounterService.recordVitals(id, req.body);
  res.json(vitals);
});

// Diagnoses
router.post('/:id/diagnoses', auth, rbac('encounter:write'), async (req, res) => {
  const { id } = req.params;
  const diagnosis = await encounterService.addDiagnosis(id, req.body);
  res.json(diagnosis);
});

// Procedures
router.post('/:id/procedures', auth, rbac('encounter:write'), async (req, res) => {
  const { id } = req.params;
  const procedure = await encounterService.recordProcedure(id, req.body);
  res.json(procedure);
});

// Lab Orders
router.post('/:id/labs', auth, rbac('encounter:write'), async (req, res) => {
  const { id } = req.params;
  const labOrder = await encounterService.orderLab(id, req.body);
  res.json(labOrder);
});

router.put('/labs/:labId/result', auth, rbac('lab:write'), async (req, res) => {
  const { labId } = req.params;
  const result = await encounterService.updateLabResult(labId, req.body);
  res.json(result);
});
```

### Step 5: Update Frontend Services

Update the frontend API client services to use the new endpoints:

#### `ehr-web/src/services/patient.service.ts`

```typescript
// Emergency Contacts
async addEmergencyContact(patientId: string, contact: EmergencyContact) {
  const response = await apiClient.post(
    `/patients/${patientId}/emergency-contacts`,
    contact
  );
  return response.data;
}

async getEmergencyContacts(patientId: string) {
  const response = await apiClient.get(`/patients/${patientId}/emergency-contacts`);
  return response.data;
}

// Insurance
async addInsurance(patientId: string, insurance: PatientInsurance) {
  const response = await apiClient.post(
    `/patients/${patientId}/insurance`,
    insurance
  );
  return response.data;
}

// Consents
async updateConsents(patientId: string, consents: PatientConsents) {
  const response = await apiClient.put(
    `/patients/${patientId}/consents`,
    consents
  );
  return response.data;
}

// Allergies
async addAllergy(patientId: string, allergy: AllergyIntolerance) {
  const response = await apiClient.post(
    `/patients/${patientId}/allergies`,
    allergy
  );
  return response.data;
}

async getAllergies(patientId: string, activeOnly = true) {
  const response = await apiClient.get(
    `/patients/${patientId}/allergies`,
    { params: { active: activeOnly } }
  );
  return response.data;
}
```

#### `ehr-web/src/services/encounter.service.ts`

```typescript
// Vitals
async recordVitals(encounterId: string, vitals: EncounterVitals) {
  const response = await apiClient.post(
    `/encounters/${encounterId}/vitals`,
    vitals
  );
  return response.data;
}

// Diagnoses
async addDiagnosis(encounterId: string, diagnosis: EncounterDiagnosis) {
  const response = await apiClient.post(
    `/encounters/${encounterId}/diagnoses`,
    diagnosis
  );
  return response.data;
}

// Procedures
async recordProcedure(encounterId: string, procedure: EncounterProcedure) {
  const response = await apiClient.post(
    `/encounters/${encounterId}/procedures`,
    procedure
  );
  return response.data;
}

// Lab Orders
async orderLab(encounterId: string, labOrder: LabOrder) {
  const response = await apiClient.post(
    `/encounters/${encounterId}/labs`,
    labOrder
  );
  return response.data;
}
```

### Step 6: Update Form Submission

Update form submission logic to use new APIs:

#### Patient Form (`ehr-web/src/components/forms/patient-form.tsx`)

```typescript
const handleSubmit = async (formData) => {
  try {
    // 1. Create/Update patient
    const patient = await patientService.createPatient(formData);
    
    // 2. Add emergency contacts
    for (const contact of formData.emergencyContacts) {
      await patientService.addEmergencyContact(patient.id, contact);
    }
    
    // 3. Add insurance
    for (const insurance of formData.insurance) {
      await patientService.addInsurance(patient.id, insurance);
    }
    
    // 4. Update consents
    await patientService.updateConsents(patient.id, formData.consents);
    
    // 5. Add allergies
    for (const allergy of formData.allergies) {
      await patientService.addAllergy(patient.id, allergy);
    }
    
    // Success!
    router.push(`/patients/${patient.id}`);
  } catch (error) {
    console.error('Error creating patient:', error);
  }
};
```

## Testing Checklist

### Database Testing
- [ ] Run migration successfully
- [ ] Verify all 8 tables created
- [ ] Check indexes are created
- [ ] Verify foreign key constraints
- [ ] Test unique constraints
- [ ] Verify triggers are working

### API Testing
- [ ] Test POST /api/patients/:id/emergency-contacts
- [ ] Test GET /api/patients/:id/emergency-contacts
- [ ] Test POST /api/patients/:id/insurance
- [ ] Test GET /api/patients/:id/insurance
- [ ] Test PUT /api/patients/:id/consents
- [ ] Test POST /api/patients/:id/allergies
- [ ] Test GET /api/patients/:id/allergies
- [ ] Test POST /api/encounters/:id/vitals
- [ ] Test POST /api/encounters/:id/diagnoses
- [ ] Test POST /api/encounters/:id/procedures
- [ ] Test POST /api/encounters/:id/labs

### Frontend Testing
- [ ] Patient form submits correctly
- [ ] Emergency contacts displayed
- [ ] Insurance cards displayed
- [ ] Consents tracked properly
- [ ] Allergies show warnings
- [ ] Encounter vitals recorded
- [ ] Diagnoses saved correctly
- [ ] Procedures tracked
- [ ] Lab orders created

## Data Migration (If Needed)

If you have existing data in file storage or JSON blobs:

```sql
-- Example: Migrate emergency contacts from JSONB to table
INSERT INTO patient_emergency_contacts (org_id, patient_id, name, relationship, phone, email)
SELECT 
  p.org_id,
  p.id,
  ec->>'name',
  ec->>'relationship',
  ec->>'phone',
  ec->>'email'
FROM fhir_patients p,
  LATERAL jsonb_array_elements(p.resource->'emergencyContacts') AS ec
WHERE p.resource ? 'emergencyContacts';

-- Verify migration
SELECT COUNT(*) FROM patient_emergency_contacts;
```

## Performance Monitoring

After implementation, monitor:

1. **Query Performance**
   - Check slow queries: `pg_stat_statements`
   - Optimize indexes if needed
   - Consider partitioning for large tables

2. **Table Sizes**
   ```sql
   SELECT 
     schemaname,
     tablename,
     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
   FROM pg_tables
   WHERE tablename LIKE 'patient_%' OR tablename LIKE 'encounter_%'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

3. **Index Usage**
   ```sql
   SELECT 
     schemaname,
     tablename,
     indexname,
     idx_scan,
     idx_tup_read
   FROM pg_stat_user_indexes
   WHERE tablename LIKE 'patient_%' OR tablename LIKE 'encounter_%'
   ORDER BY idx_scan ASC;
   ```

## Rollback Plan

If issues arise:

```bash
cd ehr-api
npm run db:rollback
```

This will drop all 8 tables created in this migration.

## Success Criteria

✅ Migration runs successfully  
✅ All 8 tables created with proper structure  
✅ All indexes and constraints in place  
✅ API endpoints updated and tested  
✅ Frontend forms submit correctly  
✅ Data is stored in proper tables (not files)  
✅ Queries perform well  
✅ No data loss or corruption  

## Support

For issues or questions:
1. Check migration logs: `ehr-api/logs/migrations.log`
2. Review ER diagram: `docs/database-er-diagram-251217.md`
3. Check visual diagrams: `docs/database-visual-er-diagram.md`
4. Consult implementation guide: `docs/DATABASE_IMPLEMENTATION_GUIDE.md` (this file)

## Timeline

- **Database Migration**: 1 hour
- **API Service Updates**: 4-6 hours
- **Frontend Updates**: 2-3 hours
- **Testing**: 3-4 hours
- **Documentation**: 1 hour
- **Total**: 11-15 hours (1.5-2 working days)

---

**Status**: ✅ Ready for Implementation  
**Next Step**: Run database migration  
**Contact**: Technical team for support
