# Billing System Structure - Superbills vs Claims

## Overview

The billing system is now properly organized into two distinct workflows:

### 1. **Superbills** (Billing Activities) - Internal Documents
📄 **What**: Internal billing documents created after patient encounters
🎯 **Purpose**: Record diagnosis codes, procedures, and charges for billing purposes
👥 **Users**: Clinical staff, billing coders
📍 **Location**: `/billing/superbills`

### 2. **Claims** (Insurance Submissions) - External Documents
📋 **What**: Formal submissions to insurance payers (CMS-1500 format)
🎯 **Purpose**: Get reimbursement from insurance companies
👥 **Users**: Billing managers, claims specialists
📍 **Location**: `/billing/claims`

---

## Key Differences

| Feature | Superbill | Insurance Claim |
|---------|-----------|-----------------|
| **Created** | After every encounter | From finalized superbill |
| **Format** | Internal format | CMS-1500 / 837 EDI |
| **Recipients** | Internal staff / Patient | Insurance payer |
| **Status Flow** | Draft → Finalized → Billed | Pending → Submitted → Paid/Denied |
| **Can Edit** | Yes (until billed) | No (once submitted) |
| **Contains** | Dx codes, procedures, charges | All superbill data + payer-specific fields |

---

## Workflow

```
┌─────────────────┐
│   Encounter     │
│   Completed     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│   Create Superbill      │
│   - Add diagnoses       │
│   - Add procedures      │
│   - Link Dx to Proc     │
│   - Calculate charges   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Save as Draft         │
│   Status: draft         │
└────────┬────────────────┘
         │
         ├─→ Edit as needed
         │
         ▼
┌─────────────────────────┐
│   Finalize Superbill    │
│   Status: finalized     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Convert to Claim      │
│   - Add payer info      │
│   - Add prior auth      │
│   - Add subscriber ID   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Submit Claim          │
│   - Generate EDI 837    │
│   - Send to payer       │
│   Status: submitted     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   Track Status          │
│   - Accepted            │
│   - Paid                │
│   - Denied              │
└─────────────────────────┘
```

---

## New File Structure

```
/src/app/billing/
├── superbills/
│   ├── page.tsx              # Superbill list (compact table)
│   ├── new/page.tsx          # Create new superbill
│   └── [id]/page.tsx         # View/edit superbill
│
├── claims/
│   ├── page.tsx              # Claims list
│   ├── new/page.tsx          # Convert superbill to claim
│   └── [id]/page.tsx         # View claim details
│
└── super-bills/
    └── create/page.tsx       # (Old page - can be deprecated)
```

---

## Superbills Page

**URL**: `/billing/superbills`

### Features

✅ **Compact Table Design** (matches patient page style)
- Small, dense rows
- Essential information only
- Icons for visual clarity
- Hover states
- Quick actions

### Table Columns

| Column | Info | Icon |
|--------|------|------|
| **Superbill #** | SB-12345 | 📄 FileText |
| **Patient** | Name + ID | 👤 User |
| **Provider** | Provider name | 🏥 Building2 |
| **Service Date** | Jan 15, 2025 | 📅 Calendar |
| **Dx/Proc** | 2 Dx / 3 Proc | Pills/Stethoscope |
| **Charges** | $450.00 | 💵 DollarSign |
| **Status** | Draft/Finalized/Billed | Badge |
| **Actions** | View / Edit / Create Claim | Buttons |

### Status Colors
- **Draft** - Gray (editable)
- **Finalized** - Blue (ready for billing)
- **Billed** - Green (converted to claim)

### Actions
- **Draft**: View, Edit
- **Finalized**: View, Create Claim
- **Billed**: View only

---

## Superbill Form

**URL**: `/billing/superbills/new?patientId={id}&appointmentId={id}`

### Accordion Sections (Clean, Professional)

#### 1️⃣ Diagnosis Codes
- Search ICD-10 codes
- Add with letter pointers (A, B, C...)
- Mark primary diagnosis

#### 2️⃣ Procedure Codes
- Enter CPT/HCPCS codes
- Link to diagnosis pointers
- Set charges and units
- Calculate line totals

#### 3️⃣ Provider Information
- Select billing provider (NPI)
- Select rendering provider (optional)

#### 4️⃣ Service Information
- Service dates
- Place of service
- Encounter details

#### 5️⃣ Review & Save
- Summary of all data
- Validation checks
- Save as draft or finalize

### Key Features
- ✅ No emojis (professional)
- ✅ Clean gray/blue color scheme
- ✅ Collapsible sections
- ✅ Real-time validation
- ✅ Auto-save drafts
- ✅ Links to diagnoses
- ✅ Charge calculations

---

## Claims Page (Separate)

**URL**: `/billing/claims`

### Purpose
Manage insurance claim submissions (formal CMS-1500 forms)

### Created From
- Finalized superbills
- Click "Create Claim" button from superbill

### Additional Fields (vs Superbill)
- **Prior Authorization #**
- **Referral #**
- **Subscriber Member ID**
- **Group #**
- **Payer-specific fields**
- **Place of Service codes**
- **Rendering Provider details**
- **Service Facility info**

### Workflow
1. Start from finalized superbill
2. Add insurance-specific details
3. Validate against payer rules
4. Generate EDI 837 or print CMS-1500
5. Submit electronically or by mail
6. Track submission status
7. Post payments/denials

---

## Database Schema

### Superbills Table
```sql
CREATE TABLE superbills (
  id UUID PRIMARY KEY,
  superbill_number VARCHAR(50) UNIQUE,
  patient_id VARCHAR(100),
  encounter_id VARCHAR(100),
  provider_id UUID,
  service_date DATE,
  diagnosis_codes JSONB,
  procedures JSONB,
  total_charge DECIMAL(10,2),
  status VARCHAR(20), -- draft, finalized, billed
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  finalized_at TIMESTAMP,
  finalized_by_user_id UUID
);
```

### Claims Table
```sql
CREATE TABLE claims (
  id UUID PRIMARY KEY,
  claim_number VARCHAR(50) UNIQUE,
  superbill_id UUID REFERENCES superbills(id),
  patient_id VARCHAR(100),
  payer_id UUID,
  subscriber_member_id VARCHAR(50),
  prior_auth_number VARCHAR(50),
  billing_provider_npi VARCHAR(10),
  rendering_provider_npi VARCHAR(10),
  service_location_npi VARCHAR(10),
  total_charge DECIMAL(10,2),
  total_paid DECIMAL(10,2),
  status VARCHAR(20), -- pending, submitted, accepted, paid, denied
  submission_date TIMESTAMP,
  claim_md_id VARCHAR(100), -- Control number from clearinghouse
  edi_837_file TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## Navigation Updates

### Sidebar/Menu
```
Billing
├── Dashboard
├── Superbills ⭐ NEW
│   └── Create Superbill
├── Claims
│   └── Submit Claim
├── Payments
├── Eligibility
└── Reports
```

### Appointment Actions
- ✅ **Create Superbill** (not "Create Claim")
- After superbill finalized → **Create Claim**

---

## Testing the New Structure

### Test 1: Create Superbill (2 min)
1. Go to appointment sidebar
2. Click **"Create Superbill"**
3. Redirects to `/billing/superbills/new?appointmentId=...`
4. Add diagnosis: E11.9 (Diabetes)
5. Add procedure: 99213, $150
6. Link procedure to diagnosis A
7. Save as draft
8. Verify in database: `status = 'draft'`

### Test 2: View Superbills Table (30 sec)
1. Navigate to `/billing/superbills`
2. See compact table with your superbill
3. Status badge shows "Draft" in gray
4. Stats card shows "1 Draft"
5. Click "View" to open detail page

### Test 3: Finalize Superbill (1 min)
1. Open draft superbill
2. Review all data
3. Click "Finalize"
4. Status changes to "Finalized" (blue)
5. "Create Claim" button appears

### Test 4: Create Insurance Claim (1 min)
1. From finalized superbill, click **"Create Claim"**
2. Redirects to `/billing/claims/new?superbillId=...`
3. Superbill data pre-filled
4. Add insurance details:
   - Subscriber member ID
   - Prior auth (if required)
   - Group number
5. Submit claim
6. Gets control number from clearinghouse

### Test 5: Track Claim (30 sec)
1. Navigate to `/billing/claims`
2. See submitted claim
3. Status: "Submitted" with control #
4. Background job checks status every 15 min
5. Status updates to "Accepted" → "Paid"

---

## API Endpoints

### Superbills
```
GET    /api/billing/superbills              # List all
GET    /api/billing/superbills/{id}         # Get one
POST   /api/billing/superbills              # Create draft
PUT    /api/billing/superbills/{id}         # Update
POST   /api/billing/superbills/{id}/finalize  # Finalize
```

### Claims
```
POST   /api/billing/claims                  # Create from superbill
GET    /api/billing/claims                  # List all
GET    /api/billing/claims/{id}             # Get one
POST   /api/billing/claims/{id}/submit      # Submit to payer
GET    /api/billing/claims/{id}/status      # Check status
```

---

## Summary

### ✅ What Changed

1. **Separated Superbills from Claims**
   - Superbills = internal billing documents
   - Claims = external insurance submissions

2. **New Compact Table Design**
   - Matches patient page style
   - Small, dense rows
   - Icons for clarity
   - Quick actions

3. **Clear Workflow**
   - Encounter → Superbill → Claim → Payment
   - Each step has distinct purpose

4. **Professional Design**
   - No emojis
   - Clean color scheme (gray/blue/green)
   - Compact and efficient

### 🎯 Key Pages

| Page | URL | Purpose |
|------|-----|---------|
| Superbills List | `/billing/superbills` | View all superbills (compact table) |
| Create Superbill | `/billing/superbills/new` | Create internal billing doc |
| Claims List | `/billing/claims` | View insurance claims |
| Submit Claim | `/billing/claims/new` | Convert superbill to claim |

### 📊 Status Flow

**Superbills**: Draft → Finalized → Billed
**Claims**: Pending → Submitted → Accepted → Paid/Denied

---

## Next Steps

1. ✅ Test superbill creation
2. ✅ Test compact table display
3. ⏳ Update appointment sidebar button text
4. ⏳ Add "Finalize" button to superbill detail page
5. ⏳ Create claim conversion flow
6. ⏳ Test end-to-end: Superbill → Claim → Paid

**The system now properly separates internal billing documents (superbills) from external insurance submissions (claims).**
