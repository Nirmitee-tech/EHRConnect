# Claims Management System - Development Progress

## 🎯 Product Vision (As SME)

A **world-class medical claims management system** that matches the polish of patient details with comprehensive billing functionality.

---

## ✅ Completed

### 1. **Comprehensive Type Definitions** (`/src/types/claim.ts`)

**Includes:**
- ✅ ClaimStatus (draft, submitted, paid, denied, etc.)
- ✅ ClaimType (professional, institutional, dental, pharmacy)
- ✅ Place of Service codes (CMS standard)
- ✅ DiagnosisCode interface (ICD-10 with pointer linking)
- ✅ ProcedureCode interface (CPT/HCPCS with modifiers, units, charges)
- ✅ ClaimProvider interface (with NPI, taxonomy, tax ID)
- ✅ ClaimInsurance interface (primary/secondary/tertiary)
- ✅ EligibilityCheck interface (copay, deductible, coinsurance)
- ✅ ClaimValidationError interface
- ✅ Complete Claim interface (all CMS-1500 fields)

### 2. **ClaimForm Component** (`/src/components/billing/ClaimForm.tsx`)

**Completed Sections:**
- ✅ **Header** with back button, patient info, validation status
- ✅ **Claim Settings** - Type, frequency, place of service, date
- ✅ **Tab Navigation** - 5 tabs with icons
- ✅ **Diagnosis Tab** (FULLY FUNCTIONAL):
  - ICD-10 code search
  - Add/remove diagnosis codes
  - Auto-assign pointer letters (A, B, C...)
  - Primary diagnosis marking
  - Beautiful blue-gradient cards
  - Maximum 12 codes validation
- ✅ **Sidebar** with 3 cards:
  - Patient Information (blue gradient)
  - Eligibility Check (green gradient)
  - Financial Summary (purple gradient)
- ✅ **Auto-calculations** for totals
- ✅ **Validation engine** with real-time error checking
- ✅ **State management** for all form fields

---

## 🚧 In Progress / To Do

### 3. **Procedures Tab** (NEEDS COMPLETION)

**What's Needed:**
- CPT/HCPCS code search
- Add/remove procedure rows
- Fields per procedure:
  - Code & Description
  - Modifiers (up to 4)
  - Date of Service
  - Place of Service
  - Units
  - Charge Amount
  - **Diagnosis Pointer Linking** (link to A, B, C, D...)
  - Rendering Provider (optional)
- Auto-calculate line totals
- Expandable section for diagnosis pointers
- Beautiful row-based layout

### 4. **Provider Tab** (NEEDS COMPLETION)

**What's Needed:**
- Billing Provider (required) with NPI
- Rendering Provider (optional) with NPI
- Referring Provider (optional) with NPI
- Facility Provider (optional) with NPI
- Display provider details (name, address, phone)
- Validation: Billing provider required

### 5. **Insurance Tab** (NEEDS COMPLETION)

**What's Needed:**
- Primary Insurance (required):
  - Payer selection
  - Member ID
  - Group Number
  - Policy Holder info
  - Relationship to patient
  - Prior Authorization number
- Secondary Insurance (optional)
- COB (Coordination of Benefits) information
- Eligibility check button
- Display coverage details

### 6. **Summary Tab** (NEEDS COMPLETION)

**What's Needed:**
- Review all entered data
- Financial breakdown:
  - Total Charges
  - Expected Reimbursement
  - Patient Responsibility
  - Adjustments
- Provider summary
- Insurance summary
- Diagnosis & Procedure summary
- Submit button with final validation
- Option to generate CMS-1500 PDF preview

### 7. **Page Route** (NEEDS CREATION)

**File:** `/src/app/billing/claims/new/page.tsx`

**What's Needed:**
- Fetch patient data from URL params
- Fetch appointment data if appointmentId provided
- Fetch available providers
- Fetch patient insurances
- Mock eligibility check
- Handle save draft
- Handle submit claim
- Success/error notifications

### 8. **Integration with Appointments** (NEEDS WORK)

**What's Needed:**
- Add "Create Claim" button to appointment sidebar
- Pass appointment data to claims page
- Pre-fill diagnosis codes from encounter
- Pre-fill procedures from super bill (if exists)

---

## 📊 Data Flow Architecture

```
Appointment → Create Claim
    ↓
Fetch Patient Data
Fetch Insurance Data
Fetch Provider Data
Check Eligibility
    ↓
Pre-fill Diagnosis (from encounter)
Pre-fill Procedures (from super bill or encounter)
    ↓
User adds/edits:
    - Diagnosis codes (ICD-10)
    - Procedure codes (CPT/HCPCS)
    - Links procedures to diagnosis (pointers)
    - Selects providers
    - Confirms insurance
    ↓
Validation Engine checks:
    - Required fields
    - Code validity
    - Diagnosis-procedure linking
    - Financial calculations
    ↓
Submit or Save Draft
    ↓
Generate CMS-1500 or 837P electronic file
    ↓
Send to Clearinghouse → Payer
```

---

## 🎨 UI/UX Design Principles

### **Matching Patient Details Aesthetic:**
1. ✅ **Gradient Cards** - Blue (patient), Green (eligibility), Purple (financial)
2. ✅ **Ultra-Compact** - Small spacing, tiny labels (text-[10px])
3. ✅ **Tab-Based Navigation** - Clean, modern tabs with icons
4. ✅ **Real-time Validation** - Show errors immediately
5. ✅ **Auto-calculations** - No manual math
6. ✅ **Professional Colors** - Medical billing aesthetic
7. 🚧 **Responsive** - Need to test mobile

### **Usability Features:**
- ✅ Search-based code entry (no memorization)
- ✅ Visual feedback on selections
- ✅ Pointer linking with letter badges (A, B, C...)
- ✅ Financial summary always visible in sidebar
- 🚧 Keyboard shortcuts
- 🚧 Form autosave (draft every 30 seconds)
- 🚧 Undo/redo capability

---

## 🔧 Technical Implementation

### **State Management:**
```typescript
// Form State
const [claimType, setClaimType] = useState('professional');
const [diagnosisCodes, setDiagnosisCodes] = useState([]);
const [procedureCodes, setProcedureCodes] = useState([]);
const [billingProviderId, setBillingProviderId] = useState('');
// ... etc

// Computed Values
const totalCharges = useMemo(() => { /* sum procedure charges */ }, [procedureCodes]);
const validationErrors = useMemo(() => { /* validate all fields */ }, [all deps]);
```

### **Validation Rules:**
1. Billing provider required
2. At least 1 diagnosis code required
3. At least 1 procedure code required
4. Each procedure must link to at least 1 diagnosis (warning)
5. Primary insurance required
6. All procedure charges > 0
7. All dates valid and in correct order

### **Auto-Calculations:**
- **Line Total** = Units × Charge Amount
- **Total Charges** = Sum of all line totals
- **Expected Reimbursement** = Sum of (line total × reimbursement rate)
- **Patient Responsibility** = Copay + (Total × Coinsurance%)

---

## 📁 File Structure

```
/src/types/
  claim.ts ✅ (Complete - 300 lines)

/src/components/billing/
  ClaimForm.tsx 🚧 (In Progress - 700 lines, ~50% complete)
    - Needs: Procedures, Provider, Insurance, Summary tabs

/src/app/billing/claims/
  new/
    page.tsx ❌ (Not started)

/src/components/appointments/
  appointment-detail-sidebar.tsx ❌ (Need to add "Create Claim" button)
```

---

## 🎯 Next Steps

### **Option A: Complete Incrementally**
1. Finish Procedures tab (most complex)
2. Add Provider tab (simple)
3. Add Insurance tab (medium complexity)
4. Add Summary tab (display only)
5. Create page route
6. Integrate with appointments

### **Option B: Simplify First Version**
1. Keep only essential tabs: Diagnosis, Procedures, Summary
2. Providers & Insurance in sidebar cards (simpler)
3. Launch MVP, iterate later

### **Option C: Split Into Multiple Components**
1. Create separate components:
   - `DiagnosisSection.tsx`
   - `ProceduresSection.tsx`
   - `ProviderSection.tsx`
   - `InsuranceSection.tsx`
   - `SummarySection.tsx`
2. Import into main ClaimForm (cleaner code)

---

## 💡 Recommendations (As Product Officer)

### **For MVP (Minimum Viable Product):**

**Must Have:**
- ✅ Diagnosis codes (ICD-10) - DONE
- 🚧 Procedure codes (CPT) with charges - IN PROGRESS
- 🚧 Diagnosis-procedure pointer linking - CRITICAL
- 🚧 Billing provider selection
- 🚧 Primary insurance selection
- 🚧 Financial summary
- 🚧 Submit claim workflow

**Should Have (Phase 2):**
- Secondary insurance
- Referring provider
- Attachments
- Authorization tracking
- Claim scrubbing (validation against payer rules)
- Real-time eligibility verification

**Nice to Have (Phase 3):**
- Templates for common claims
- Batch claim submission
- Claims status tracking
- Remittance processing
- Denial management
- Appeals workflow

---

## 🚀 Estimated Completion Time

**Remaining Work:**
- Procedures Tab: 2-3 hours (complex with pointer linking)
- Provider Tab: 30 minutes (simple selects)
- Insurance Tab: 1 hour (forms and validation)
- Summary Tab: 1 hour (display logic)
- Page Route: 1 hour (API integration)
- Testing & Polish: 2 hours
- **Total: ~8 hours of development**

---

## 📝 Questions for User

1. **Scope:** MVP with essential features only, or full-featured from start?
2. **Integration:** Should claims auto-create from super bills, or separate workflow?
3. **Providers:** Can we reuse provider data from super bills component?
4. **Insurance:** Real eligibility API, or mock data for now?
5. **Submission:** Electronic (837P) or PDF (CMS-1500) or both?

---

## Current Status: 50% Complete

**What Works:**
- ✅ Beautiful UI matching patient details
- ✅ Comprehensive data structure
- ✅ Diagnosis code management (fully functional)
- ✅ Validation engine
- ✅ Financial calculations
- ✅ Sidebar with patient context

**What's Next:**
- 🚧 Complete Procedures tab with pointer linking
- 🚧 Add Provider & Insurance tabs
- 🚧 Create page route
- 🚧 Integrate with appointments

This is a **solid foundation** for a world-class claims system. The hardest parts (data structure, validation, diagnosis management) are done. The remaining work is mostly UI forms and integration.

---

Let me know how you'd like to proceed! 🚀
