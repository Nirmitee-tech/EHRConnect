# Claims System - Database Integration & Workflows

## Overview

The claims system is fully integrated with your backend database. All claims are saved, tracked, and can be managed through complete workflows from draft to payment.

---

## Database Storage

### Claims Table Schema

Claims are stored with the following key fields:

```typescript
interface Claim {
  // IDs
  id: string;                    // UUID primary key
  claim_number: string;          // Human-readable claim number (CLM-12345)
  claim_md_id: string;           // External claim ID from clearinghouse

  // Patient & Encounter
  patient_id: string;            // Reference to FHIR Patient
  encounter_id?: string;         // Reference to FHIR Encounter/Appointment

  // Provider NPIs
  billing_provider_npi: string;  // Required - who gets paid
  rendering_provider_npi?: string; // Who performed service
  service_location_npi?: string;   // Where service occurred

  // Insurance
  payer_id: string;              // Reference to Payers master table
  payer_name: string;            // Payer display name
  subscriber_member_id: string;  // Insurance member ID

  // Dates
  service_date_from: string;     // Date of service start
  service_date_to: string;       // Date of service end
  submission_date?: string;      // When submitted to payer
  created_at: string;            // Record creation timestamp
  updated_at: string;            // Last update timestamp

  // Financial
  total_charge: number;          // Sum of all line item charges
  total_paid: number;            // Sum of all payments received

  // Status & Workflow
  status: ClaimStatus;           // Current claim state

  // Additional data
  claim_payload: JSON;           // Full claim data (diagnosis codes, etc.)
  lines: ClaimLine[];            // Procedure line items
  rejection_reason?: string;     // If rejected
  denial_reason?: string;        // If denied
  auth_id?: string;              // Prior authorization reference
  auth_number?: string;          // Prior auth number
}
```

### Claim Statuses

```typescript
type ClaimStatus =
  | 'draft'       // Saved but not submitted
  | 'validated'   // Passed validation, ready to submit
  | 'submitted'   // Sent to payer
  | 'accepted'    // Payer received and accepted
  | 'paid'        // Payment received
  | 'denied'      // Payer denied the claim
  | 'rejected';   // Payer rejected the claim
```

---

## Complete Workflows

### 1. Create New Claim (From Appointment)

**URL**: `/billing/claims/new?patientId={id}&appointmentId={id}`

**Workflow**:
1. User clicks "Create Claim" from appointment sidebar
2. System loads:
   - Patient data from FHIR
   - Patient insurance/coverage from FHIR
   - Providers from billing masters
   - Prefills appointment data
3. User fills out accordion form:
   - Section 1: Search and add diagnosis codes (ICD-10)
   - Section 2: Add procedure codes (CPT) and link to diagnoses
   - Section 3: Select providers (billing, rendering, etc.)
   - Section 4: Select primary insurance
   - Section 5: Review summary
4. User clicks **"Save Draft"**
5. System calls: `POST /api/billing/claims`
6. Database stores claim with `status: 'draft'`
7. User receives confirmation with claim ID
8. Can return later to edit

**API Call**:
```typescript
const claimData = {
  patientId: '...',
  encounterId: '...',
  payerId: '...',
  claimType: 'professional',
  billingProviderNpi: '...',
  renderingProviderNpi: '...',
  subscriberMemberId: '...',
  serviceDateFrom: '2025-01-15',
  serviceDateTo: '2025-01-15',
  totalCharge: 352.00,
  status: 'draft',
  lines: [
    {
      serviceDate: '2025-01-15',
      placeOfService: '11',
      cptCode: '99213',
      modifiers: [],
      icdCodes: ['F43.23', 'I10'],
      units: 1,
      chargeAmount: 150.00
    },
    {
      serviceDate: '2025-01-15',
      placeOfService: '11',
      cptCode: '90834',
      modifiers: [],
      icdCodes: ['F43.23'],
      units: 1,
      chargeAmount: 202.00
    }
  ],
  metadata: {
    diagnosisCodes: [...], // Full diagnosis objects
    billingProviderId: '...',
    // ... additional form state for editing
  }
};

const result = await billingService.createClaim(claimData);
// Returns: { id: 'claim-uuid', claimNumber: 'CLM-12345' }
```

**Database Record**:
```sql
INSERT INTO claims (
  id,
  claim_number,
  patient_id,
  encounter_id,
  payer_id,
  billing_provider_npi,
  rendering_provider_npi,
  subscriber_member_id,
  service_date_from,
  service_date_to,
  total_charge,
  total_paid,
  status,
  claim_payload,
  created_at,
  updated_at
) VALUES (
  'uuid-...',
  'CLM-12345',
  'patient-123',
  'encounter-456',
  'payer-789',
  '1234567890',
  '1234567890',
  'MEM123456',
  '2025-01-15',
  '2025-01-15',
  352.00,
  0.00,
  'draft',
  '{"diagnosisCodes": [...], "lines": [...]}'::jsonb,
  NOW(),
  NOW()
);
```

---

### 2. View All Claims (Table View)

**URL**: `/billing/claims`

**Features**:
- Lists all claims from database
- Filter by status (draft, submitted, paid, etc.)
- Search by claim number, patient ID, or payer name
- Shows stats: Total, Draft, Submitted, Paid counts
- Actions: View, Edit (drafts), Submit (validated), Resubmit (denied)

**API Call**:
```typescript
const claims = await billingService.getClaims({
  status: 'draft', // or 'all', 'submitted', 'paid', etc.
  limit: 100,
  offset: 0
});

// Returns array of claims from database:
[
  {
    id: 'uuid-...',
    claim_number: 'CLM-12345',
    patient_id: 'pat-123',
    payer_name: 'Aetna Medicare',
    status: 'draft',
    service_date_from: '2025-01-15',
    service_date_to: '2025-01-15',
    total_charge: 352.00,
    total_paid: 0.00,
    created_at: '2025-01-15T10:30:00Z',
    ...
  },
  ...
]
```

**Database Query**:
```sql
SELECT
  c.id,
  c.claim_number,
  c.claim_md_id,
  c.patient_id,
  p.name as payer_name,
  c.status,
  c.service_date_from,
  c.service_date_to,
  c.total_charge,
  c.total_paid,
  c.submission_date,
  c.created_at,
  c.rejection_reason,
  c.denial_reason
FROM claims c
LEFT JOIN payers p ON c.payer_id = p.id
WHERE c.status = $1 -- if filtering
ORDER BY c.created_at DESC
LIMIT 100;
```

---

### 3. Edit Draft Claim

**URL**: `/billing/claims/{claim-id}`

**Workflow**:
1. User clicks "Edit" on draft claim
2. System loads claim from database
3. Pre-fills all form fields from saved data
4. User makes changes
5. User clicks "Save Draft" again
6. System calls: `PUT /api/billing/claims/{id}`
7. Database updates claim record
8. `updated_at` timestamp refreshed

**API Call**:
```typescript
await billingService.updateClaim(claimId, {
  // Updated fields only
  lines: [...], // Updated procedures
  totalCharge: 400.00,
  // ... other changed fields
});
```

**Database Update**:
```sql
UPDATE claims
SET
  total_charge = $1,
  claim_payload = $2,
  updated_at = NOW()
WHERE id = $3
  AND status = 'draft'; -- Only allow editing drafts
```

---

### 4. Validate Claim

**URL**: `/billing/claims/{claim-id}` (Detail view)

**Workflow**:
1. User opens claim detail page
2. User clicks **"Validate"** button
3. System calls: `POST /api/billing/claims/{id}/validate`
4. Backend validates:
   - Required fields present
   - Valid NPI numbers
   - Valid ICD-10 and CPT codes
   - Date ranges valid
   - Insurance eligibility
5. If valid:
   - Status updated to `'validated'`
   - "Submit Claim" button enabled
6. If invalid:
   - Errors displayed to user
   - Status remains `'draft'`

**API Call**:
```typescript
const result = await billingService.validateClaim(claimId);

// If valid:
{
  valid: true,
  message: 'Claim is valid and ready to submit'
}

// If invalid:
{
  valid: false,
  errors: [
    'Billing Provider NPI is required',
    'At least one diagnosis code is required',
    'Procedure 1 must be linked to at least one diagnosis'
  ]
}
```

**Database Update**:
```sql
UPDATE claims
SET
  status = 'validated',
  updated_at = NOW()
WHERE id = $1
  AND status = 'draft';
```

---

### 5. Submit Claim to Payer

**URL**: `/billing/claims/{claim-id}` (Detail view)

**Workflow**:
1. Claim must be in `'validated'` status
2. User clicks **"Submit Claim"** button
3. System calls: `POST /api/billing/claims/{id}/submit`
4. Backend:
   - Generates EDI 837 file
   - Submits to clearinghouse (e.g., Change Healthcare, Availity)
   - Receives control number
5. Database updated:
   - Status → `'submitted'`
   - `claim_md_id` → Control number from clearinghouse
   - `submission_date` → Current timestamp
6. User sees confirmation with control number

**API Call**:
```typescript
const result = await billingService.submitClaim(claimId);

// Returns:
{
  success: true,
  controlNumber: 'CHC20250115123456',
  submissionDate: '2025-01-15T14:30:00Z',
  message: 'Claim submitted successfully to Aetna Medicare'
}
```

**Database Update**:
```sql
UPDATE claims
SET
  status = 'submitted',
  claim_md_id = $1, -- Control number
  submission_date = NOW(),
  updated_at = NOW()
WHERE id = $2
  AND status = 'validated';
```

---

### 6. Check Claim Status

**URL**: `/billing/claims` (List view - status updates)

**Workflow**:
1. Background job polls clearinghouse API every 15 minutes
2. For each `'submitted'` claim:
   - Calls clearinghouse status API
   - Checks for updates (accepted, paid, denied)
3. When status changes:
   - Database updated
   - Status changed to `'accepted'`, `'paid'`, `'denied'`, or `'rejected'`
   - If denied/rejected, stores reason

**API Call**:
```typescript
const status = await billingService.checkClaimStatus(claimMdId);

// Returns:
{
  status: 'accepted',
  payerClaimNumber: 'AETNA20250115789',
  lastChecked: '2025-01-15T16:00:00Z',
  expectedPaymentDate: '2025-01-22'
}

// Or if denied:
{
  status: 'denied',
  denialReason: 'Missing prior authorization',
  denialCode: 'D123',
  appealDeadline: '2025-02-15'
}
```

**Database Update**:
```sql
UPDATE claims
SET
  status = $1, -- 'accepted', 'paid', 'denied', 'rejected'
  claim_md_id = $2, -- Payer claim number if available
  denial_reason = $3, -- If denied
  rejection_reason = $4, -- If rejected
  updated_at = NOW()
WHERE claim_md_id = $5;
```

---

### 7. Post Payment (ERA Processing)

**URL**: `/billing/remittance` (Separate page)

**Workflow**:
1. Payer sends ERA (Electronic Remittance Advice) file
2. System imports ERA via `/billing/remittance` page
3. ERA contains:
   - Claim payments
   - Adjustments
   - Denial codes
4. For each paid claim:
   - Status → `'paid'`
   - `total_paid` updated
   - Payment record created

**Database Update**:
```sql
UPDATE claims
SET
  status = 'paid',
  total_paid = $1,
  updated_at = NOW()
WHERE claim_md_id = $2; -- Match by payer claim number

-- Also create payment record
INSERT INTO payments (
  claim_id,
  amount,
  payment_date,
  check_number,
  payment_method
) VALUES (
  $claim_id,
  $amount,
  $payment_date,
  $check_number,
  'EFT'
);
```

---

### 8. Resubmit Denied Claim

**URL**: `/billing/claims/{claim-id}`

**Workflow**:
1. User views denied claim
2. Reads denial reason
3. Clicks **"Resubmit"** button
4. System loads claim in edit mode
5. User fixes issues (e.g., adds missing prior auth)
6. User clicks "Save Draft"
7. Status → `'draft'`
8. User validates and resubmits (repeats workflow 4-5)

**API Call**:
```typescript
// Essentially creates a corrected claim
const correctedClaim = await billingService.updateClaim(claimId, {
  ...originalClaimData,
  authNumber: 'AUTH123456', // Fix: Added prior auth
  status: 'draft' // Reset to draft for revalidation
});
```

---

## File Structure

### Pages
```
/src/app/billing/claims/
├── page.tsx                  # List view (table)
├── new/page.tsx              # Create new claim
└── [id]/page.tsx             # View/edit claim detail
```

### Components
```
/src/components/billing/
└── ClaimForm.tsx             # Accordion form component
```

### Services
```
/src/services/
└── billing.service.ts        # API client for claims
```

### Types
```
/src/types/
└── claim.ts                  # TypeScript interfaces
```

---

## API Endpoints Used

| Method | Endpoint | Purpose | DB Operation |
|--------|----------|---------|--------------|
| `GET` | `/api/billing/claims` | List all claims | `SELECT * FROM claims` |
| `GET` | `/api/billing/claims/{id}` | Get claim detail | `SELECT * FROM claims WHERE id = $1` |
| `POST` | `/api/billing/claims` | Create new claim (draft) | `INSERT INTO claims` |
| `PUT` | `/api/billing/claims/{id}` | Update draft claim | `UPDATE claims WHERE id = $1` |
| `POST` | `/api/billing/claims/{id}/validate` | Validate claim | `UPDATE claims SET status = 'validated'` |
| `POST` | `/api/billing/claims/{id}/submit` | Submit to payer | `UPDATE claims SET status = 'submitted'` |
| `GET` | `/api/billing/claims/{id}/status` | Check submission status | `SELECT status FROM claims` |
| `GET` | `/api/billing/masters/icd-codes?search=` | Search ICD-10 codes | `SELECT * FROM medical_codes WHERE type = 'icd10'` |
| `GET` | `/api/billing/masters/cpt-codes?search=` | Search CPT codes | `SELECT * FROM medical_codes WHERE type = 'cpt'` |
| `GET` | `/api/billing/masters/providers` | Get all providers | `SELECT * FROM providers` |
| `GET` | `/api/billing/masters/payers` | Get all payers | `SELECT * FROM payers` |
| `POST` | `/api/billing/eligibility/check` | Check insurance eligibility | External API call |

---

## Testing Guide

### 1. Create a Draft Claim

**Steps**:
1. Navigate to an appointment
2. Click "Create Claim" button in appointment sidebar
3. Should redirect to `/billing/claims/new?patientId=...&appointmentId=...`
4. Form loads with patient data, providers, and insurance
5. Section 1: Type "diabetes" in diagnosis search → Should see ICD codes
6. Add code "E11.9" (Type 2 diabetes)
7. Section 2: Add procedure "99213"
8. Link procedure to diagnosis A
9. Add charge amount $150
10. Section 3: Select billing provider from dropdown
11. Section 4: Select primary insurance
12. Section 5: Review summary
13. Click **"Save Draft"**
14. Should see success message with claim ID

**Expected Database Record**:
```sql
SELECT * FROM claims WHERE id = '<claim-id>';
-- Should show:
-- status = 'draft'
-- total_charge = 150.00
-- Lines populated
```

---

### 2. View Claims Table

**Steps**:
1. Navigate to `/billing/claims`
2. Should see table with all claims
3. Try status filter dropdown → Select "Draft"
4. Should only show draft claims
5. Try search box → Type claim number
6. Should filter results

**Expected API Call**:
```
GET /api/billing/claims?status=draft&limit=100
```

---

### 3. Edit Draft Claim

**Steps**:
1. From claims list, click "Edit" on draft claim
2. Should load `/billing/claims/{id}`
3. Form pre-filled with saved data
4. Change procedure charge to $200
5. Click "Save Draft"
6. Should update database
7. Reload page → Should show $200

**Expected Database Update**:
```sql
UPDATE claims
SET total_charge = 200.00, updated_at = NOW()
WHERE id = '<claim-id>';
```

---

### 4. Validate and Submit

**Steps**:
1. Open draft claim detail page
2. Click **"Validate"** button
3. If valid: Status → `'validated'`, Submit button appears
4. If invalid: Errors displayed, fix them
5. Once validated, click **"Submit Claim"**
6. Should call submission API
7. Status → `'submitted'`
8. Control number displayed

**Expected Database Updates**:
```sql
-- After validate:
UPDATE claims SET status = 'validated' WHERE id = '<claim-id>';

-- After submit:
UPDATE claims
SET status = 'submitted',
    claim_md_id = '<control-number>',
    submission_date = NOW()
WHERE id = '<claim-id>';
```

---

### 5. Check Database Directly

**Query All Claims**:
```sql
SELECT
  claim_number,
  patient_id,
  status,
  total_charge,
  total_paid,
  created_at
FROM claims
ORDER BY created_at DESC
LIMIT 10;
```

**Query Claim Lines**:
```sql
SELECT
  c.claim_number,
  l.cpt_code,
  l.charge_amount,
  l.units,
  l.service_date
FROM claims c
JOIN claim_lines l ON c.id = l.claim_id
WHERE c.claim_number = 'CLM-12345';
```

**Check Status Distribution**:
```sql
SELECT
  status,
  COUNT(*) as count,
  SUM(total_charge) as total_charges,
  SUM(total_paid) as total_paid
FROM claims
GROUP BY status;
```

---

## Workflow Summary

```
┌─────────────┐
│   Appointment│
│   Sidebar    │
└──────┬───────┘
       │ Click "Create Claim"
       ▼
┌─────────────────────┐
│ Create Claim Form   │
│ (Accordion UI)      │
│ - Load Patient      │
│ - Load Providers    │
│ - Load Insurance    │
└──────┬──────────────┘
       │ User fills form
       │ Click "Save Draft"
       ▼
┌─────────────────────┐
│  POST /api/claims   │
│  status: 'draft'    │
└──────┬──────────────┘
       │ INSERT INTO claims
       ▼
┌─────────────────────┐
│  Database: DRAFT    │
│  claim_number: CLM  │
│  id: uuid           │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Claims List Page   │
│  /billing/claims    │
│  - View all claims  │
│  - Filter by status │
└──────┬──────────────┘
       │ Click "Edit" or "View"
       ▼
┌─────────────────────┐
│ Claim Detail Page   │
│ /billing/claims/id  │
│ - View details      │
│ - Click "Validate"  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ POST .../validate   │
│ status: 'validated' │
└──────┬──────────────┘
       │ UPDATE claims SET status = 'validated'
       ▼
┌─────────────────────┐
│ Database: VALIDATED │
└──────┬──────────────┘
       │ Click "Submit Claim"
       ▼
┌─────────────────────┐
│ POST .../submit     │
│ - Generate EDI 837  │
│ - Send to payer     │
│ status: 'submitted' │
└──────┬──────────────┘
       │ UPDATE claims SET status = 'submitted'
       │ UPDATE claim_md_id, submission_date
       ▼
┌─────────────────────┐
│ Database: SUBMITTED │
│ claim_md_id: CHC... │
└──────┬──────────────┘
       │ Background job polls status
       ▼
┌─────────────────────┐
│ Payer Response      │
│ - Accepted          │
│ - Paid              │
│ - Denied            │
└──────┬──────────────┘
       │ UPDATE claims SET status = 'accepted'/'paid'/'denied'
       ▼
┌─────────────────────┐
│ Database: PAID      │
│ total_paid: $120.00 │
└─────────────────────┘
```

---

## Summary

✅ **Database Storage**: All claims stored in PostgreSQL
✅ **Draft Functionality**: Save incomplete claims, edit later
✅ **Table View**: View all claims with filtering
✅ **Detail View**: Edit and manage individual claims
✅ **Validation**: Check for errors before submission
✅ **Submission**: Send to payer clearinghouse
✅ **Status Tracking**: Monitor claim lifecycle
✅ **Payment Processing**: Update when payment received

**The complete system is production-ready for creating, managing, and tracking medical insurance claims from start to finish.**
