# 🎨 Billing Module UI Implementation Status

## ✅ Completed UI Pages

### 1. **Billing Dashboard** ✅
**File:** `ehr-web/src/app/billing/page.tsx`

**Features:**
- Live KPI cards (Total Billed, Collected, Collection Rate, Denial Rate, Payment Lag)
- Date range filtering
- Claims by status breakdown
- Quick action buttons to navigate to sub-modules
- Responsive grid layout
- Professional card design matching roles page style

### 2. **Eligibility Check Page** ✅
**File:** `ehr-web/src/app/billing/eligibility/page.tsx`

**Features:**
- Comprehensive eligibility check form with:
  - Patient information (ID, name, DOB)
  - Insurance details (payer, member ID)
  - Service date selection
- Real-time eligibility verification
- Live results display with:
  - Coverage status (active/inactive/pending)
  - Plan details (copay, deductible, OOP max)
  - Progress bar for deductible usage
- Eligibility history table with past checks
- Status-based color coding (green=active, red=inactive, yellow=pending)
- Responsive 2-column layout

### 3. **Prior Authorization List** ✅
**File:** `ehr-web/src/app/billing/prior-auth/page.tsx`

**Features:**
- Comprehensive list of all prior authorizations
- Search functionality (auth number, patient ID, payer)
- Status filter (all, pending, approved, denied, expired)
- Color-coded status badges with icons
- Expandable cards showing:
  - Auth number and status
  - Patient ID and payer
  - CPT and ICD codes (chip display)
  - Request dates and validity period
  - Denial reason (if denied)
- "Submit New Prior Auth" button
- Empty state with call-to-action

### 4. **Prior Authorization Submission** ✅
**File:** `ehr-web/src/app/billing/prior-auth/new/page.tsx`

**Features:**
- Multi-section form:
  - Patient & Encounter Information
  - Provider & Payer Information
  - Service Details
  - Additional Notes
- **Smart CPT Code Search:**
  - Live autocomplete with descriptions
  - Multi-select with chip display
  - Remove functionality
- **Smart ICD Code Search:**
  - Live autocomplete with descriptions
  - Multi-select with chip display
  - Remove functionality
- Provider NPI validation (10 digits)
- Units input
- Service location
- Clinical notes textarea
- Form validation with error messages
- Success screen with auth number
- Auto-redirect after submission

---

## 🚧 Remaining UI Pages to Build

### 5. **Claims List Page** (To Do)
**File:** `ehr-web/src/app/billing/claims/page.tsx`

**Required Features:**
```tsx
- Claims list with search and filters:
  - Search by claim number, patient ID
  - Status filter (draft, submitted, paid, denied, etc.)
  - Date range filter
- Claim cards showing:
  - Claim number and status badge
  - Patient ID and payer
  - Service dates
  - Total billed vs paid
  - Denial reason (if rejected)
- Quick actions:
  - View detail
  - Edit (if draft)
  - Submit (if validated)
  - Resubmit (if denied)
- "Create New Claim" button
- Pagination
```

**Style Reference:**
- Similar to prior-auth/page.tsx
- Color-coded status badges
- Card-based layout with hover effects

### 6. **Claim Editor (Multi-Tab)** (To Do)
**File:** `ehr-web/src/app/billing/claims/[id]/page.tsx`

**Required Features:**
```tsx
// Tab-based interface (like settings pages)

Tabs:
1. **Diagnosis Tab**
   - Search and add ICD codes
   - Multi-select with chips
   - Validate ICD-CPT combinations

2. **Procedures Tab**
   - Line item grid with columns:
     - Line #, Service Date, CPT Code, Modifiers, ICD Codes, Units, Charge
   - Add/Edit/Delete rows
   - Auto-fetch fee schedule per CPT code
   - Calculate total charge

3. **Provider Tab**
   - Billing provider NPI
   - Rendering provider NPI
   - Service location NPI
   - Auto-validate NPI format

4. **Insurance Tab**
   - Payer selection
   - Subscriber member ID
   - Patient account number
   - Prior auth number (if applicable)

5. **Summary Tab**
   - Review all claim data
   - Validation status
   - Error messages (if any)
   - Submit button
```

**Example Line Item Grid:**
```tsx
<table>
  <thead>
    <tr>
      <th>Line</th>
      <th>Date</th>
      <th>CPT</th>
      <th>Modifiers</th>
      <th>ICD Codes</th>
      <th>Units</th>
      <th>Charge</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {lines.map((line, idx) => (
      <tr key={idx}>
        <td>{idx + 1}</td>
        <td><Input type="date" /></td>
        <td><CPTCodeSelect /></td>
        <td><ModifierSelect /></td>
        <td><ICDCodeSelect /></td>
        <td><Input type="number" /></td>
        <td><Input type="number" step="0.01" /></td>
        <td><Button>Delete</Button></td>
      </tr>
    ))}
  </tbody>
</table>
```

### 7. **Remittance (ERA) List** (To Do)
**File:** `ehr-web/src/app/billing/remittance/page.tsx`

**Required Features:**
```tsx
- Remittance list with:
  - Remittance number
  - Payer name
  - Payment date
  - Payment amount
  - Status (received, posted, reconciled)
- Status filter
- "Fetch New ERA Files" button (triggers API call)
- Click to view detail
```

### 8. **Remittance Detail & Posting** (To Do)
**File:** `ehr-web/src/app/billing/remittance/[id]/page.tsx`

**Required Features:**
```tsx
- ERA header info:
  - Check/EFT number
  - Payer name
  - Payment date
  - Total payment amount

- ERA line items table:
  Columns:
  - Claim Number
  - Billed Amount
  - Paid Amount
  - Adjustment Amount
  - Patient Responsibility
  - Adjustment Codes
  - Remark Codes

- "Post to Ledger" button:
  - Updates claim status to PAID
  - Creates payment ledger entries
  - Shows success confirmation

- Status badge (received/posted/reconciled)
```

### 9. **Reports Dashboard** (To Do)
**File:** `ehr-web/src/app/billing/reports/page.tsx`

**Required Features:**
```tsx
- Date range selector (start, end)
- Report cards:
  1. **Revenue Report**
     - Line chart: Billed vs Collected over time
     - Grouping: Day/Week/Month

  2. **Denial Analysis**
     - Bar chart: Top 10 denial reasons
     - Count and total amount

  3. **Payer Performance**
     - Table: Payer name, avg payment lag, denial rate, collection rate

  4. **Aging Receivables**
     - Table: 0-30 days, 31-60 days, 61-90 days, 90+ days
     - Amount in each bucket

- Export button (CSV/PDF)
```

**Use recharts library** (already in dependencies):
```tsx
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Revenue Chart
<LineChart data={revenueData}>
  <Line type="monotone" dataKey="billed" stroke="#3b82f6" />
  <Line type="monotone" dataKey="collected" stroke="#10b981" />
</LineChart>
```

---

## 📦 Reusable Components to Create

### `ehr-web/src/components/billing/`

#### 1. **ClaimStatusBadge.tsx**
```tsx
interface Props {
  status: string;
}

export function ClaimStatusBadge({ status }: Props) {
  const colors = {
    draft: 'bg-gray-100 text-gray-800',
    validated: 'bg-blue-100 text-blue-800',
    submitted: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    paid: 'bg-green-100 text-green-800',
    denied: 'bg-red-100 text-red-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
```

#### 2. **CPTCodeSelect.tsx**
```tsx
interface Props {
  value: string;
  onChange: (code: string) => void;
}

export function CPTCodeSelect({ value, onChange }: Props) {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // Autocomplete logic with billingService.getCPTCodes()
  // Similar to implementation in prior-auth/new/page.tsx
}
```

#### 3. **ICDCodeSelect.tsx**
- Similar to CPTCodeSelect
- Uses billingService.getICDCodes()

#### 4. **ClaimLineItemGrid.tsx**
```tsx
interface ClaimLine {
  lineNumber: number;
  serviceDate: string;
  cptCode: string;
  modifiers: string[];
  icdCodes: string[];
  units: number;
  chargeAmount: number;
}

interface Props {
  lines: ClaimLine[];
  onChange: (lines: ClaimLine[]) => void;
}

export function ClaimLineItemGrid({ lines, onChange }: Props) {
  // Editable grid with add/edit/delete
}
```

#### 5. **KPICard.tsx** (Reusable)
```tsx
interface Props {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'purple';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function KPICard({ title, value, icon, color = 'blue', trend }: Props) {
  // Reusable KPI card from dashboard
}
```

---

## 🎨 Design System Consistency

**All pages should follow the same style as:**
- `ehr-web/src/app/roles/page.tsx`
- `ehr-web/src/app/(dashboard)/settings/roles/page.tsx`

**Key Design Elements:**
1. **Header Section:**
   - Large icon + title (h1 text-3xl font-bold)
   - Subtitle (text-gray-600)
   - Action button (primary color, top right)

2. **Card Layout:**
   - White background
   - Rounded-xl
   - Shadow-sm
   - Border border-gray-200
   - Padding p-6

3. **Status Badges:**
   - Rounded-full
   - Text-xs font-medium
   - Color-coded (green, red, yellow, gray)
   - With icons

4. **Buttons:**
   - Primary: bg-{color}-600 hover:bg-{color}-700
   - Outline: variant="outline"
   - Size: sm for secondary actions
   - Icons from lucide-react

5. **Forms:**
   - Label component with uppercase text-xs
   - Input with border-gray-300
   - Grid layout for side-by-side fields
   - Section headers with border-b

6. **Tables:**
   - Header: bg-gray-50
   - Text-xs uppercase font-medium
   - Hover:bg-gray-50 on rows
   - Divide-y for row borders

7. **Loading States:**
   - Animate-spin border-b-2 (spinner)
   - Center aligned
   - Gray text

8. **Empty States:**
   - Large icon (h-12 w-12 text-gray-400)
   - Font-medium title
   - Smaller subtitle
   - Optional CTA button

---

## 🔧 Integration Points

### Link from Patient Page to Billing:
```tsx
// In ehr-web/src/app/patients/[id]/page.tsx

<Button onClick={() => router.push(`/billing/claims/new?patientId=${patientId}`)}>
  Create Claim
</Button>
```

### Link from Encounter to Billing:
```tsx
// After completing encounter

<Button onClick={() => router.push(`/billing/claims/new?encounterId=${encounterId}`)}>
  Bill Encounter
</Button>
```

---

## 📊 Testing Checklist

- [ ] Dashboard loads KPIs correctly
- [ ] Eligibility check returns coverage details
- [ ] Prior auth form validates required fields
- [ ] Prior auth CPT/ICD autocomplete works
- [ ] Prior auth submission creates record
- [ ] Claims list filters work (status, search)
- [ ] Claim editor tabs navigate properly
- [ ] Claim line item grid adds/edits/deletes rows
- [ ] Claim validation shows errors
- [ ] Claim submission updates status
- [ ] Remittance list shows ERA files
- [ ] Remittance posting creates ledger entries
- [ ] Reports charts render properly
- [ ] All responsive on mobile

---

## 🚀 Quick Start for Remaining Pages

### Claims List Template:
```tsx
'use client';
// Copy structure from prior-auth/page.tsx
// Replace PriorAuth interface with Claim interface
// Use billingService.getClaims() instead
// Update status badges for claim statuses
```

### Claim Editor Template:
```tsx
'use client';
// Use tab navigation (shadcn Tabs component)
// Each tab is a separate component
// Use useReducer for complex form state
// Implement validation before submit
```

### Remittance Template:
```tsx
'use client';
// Similar to claims list
// Use billingService.getRemittances()
// Detail page uses billingService.postRemittance()
```

### Reports Template:
```tsx
'use client';
// Use recharts for visualizations
// billingService.getRevenueReport()
// billingService.getDenialsReport()
```

---

## ✅ Summary

**Completed:** 4 / 9 UI pages (44%)

**Status:**
- ✅ Dashboard
- ✅ Eligibility Check
- ✅ Prior Auth List
- ✅ Prior Auth Submission
- 🚧 Claims List (to do)
- 🚧 Claim Editor (to do)
- 🚧 Remittance List (to do)
- 🚧 Remittance Detail (to do)
- 🚧 Reports (to do)

**Backend:** 100% complete and ready
**Frontend Service:** 100% complete with TypeScript types
**Remaining:** 5 UI pages + reusable components

All backend APIs are working and tested. The remaining UI pages follow the same patterns as the completed pages, with detailed specifications provided above.

---

**Next Developer Task:** Implement Claims List page following the prior-auth/page.tsx pattern, then proceed to Claim Editor with tab-based interface.
