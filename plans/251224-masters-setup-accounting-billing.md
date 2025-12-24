# Master Data Setup - Accounting & Billing System

**Plan ID**: 251224-masters-setup-accounting-billing
**Date**: 2025-12-24
**Status**: Draft
**Prerequisite for**: 251224-hospital-accounting-billing-system
**Priority**: CRITICAL - Must be completed FIRST

---

## Executive Summary

Complete master data setup and configuration for accounting and billing system. All master tables must be populated with reference data BEFORE implementing transactional workflows. This is Phase 0 - foundation setup.

**Setup Order:** Masters → Configuration → Validation → Testing → Ready for Transactions

---

## Table of Contents

1. [Master Data Tables Overview](#1-master-data-tables-overview)
2. [Setup Sequence](#2-setup-sequence)
3. [Chart of Accounts Setup](#3-chart-of-accounts-setup)
4. [Billing Masters Setup](#4-billing-masters-setup)
5. [Payment Configuration](#5-payment-configuration)
6. [Fee Schedule Setup](#6-fee-schedule-setup)
7. [Payer Master Setup](#7-payer-master-setup)
8. [Cost Centers & Departments](#8-cost-centers--departments)
9. [Bank Accounts Setup](#9-bank-accounts-setup)
10. [Settings & Configuration](#10-settings--configuration)
11. [Validation & Testing](#11-validation--testing)
12. [Seed Data Scripts](#12-seed-data-scripts)

---

## 1. Master Data Tables Overview

### 1.1 Critical Master Tables (Must Setup First)

**Accounting Masters:**
- `accounting_chart_of_accounts` - GL account structure
- `accounting_cost_centers` - Department/cost center structure
- `accounting_bank_accounts` - Bank account information

**Billing Masters:**
- `billing_cpt_codes` - Procedure codes (20,000+ codes)
- `billing_icd_codes` - Diagnosis codes (100,000+ codes)
- `billing_modifiers` - CPT/HCPCS modifiers (200+ codes)
- `billing_payers` - Insurance companies
- `billing_providers` - Provider NPI information
- `billing_fee_schedules` - Pricing by payer and service

**Configuration Tables:**
- `billing_tenant_settings` - ClaimMD credentials per org
- `billing_payment_gateways` - Stripe, SePay configuration
- `billing_collection_agencies` - Collection agency info
- `accounting_fiscal_periods` - Fiscal year/period definitions

### 1.2 Master Data Dependencies

```
Organization Setup
    ↓
Chart of Accounts → Cost Centers → Bank Accounts
    ↓
Billing Codes (CPT/ICD/Modifiers)
    ↓
Providers (NPI) + Payers (Insurance)
    ↓
Fee Schedules (Pricing)
    ↓
Payment Gateways Configuration
    ↓
Ready for Transactions!
```

---

## 2. Setup Sequence

### Phase 0.1: Organization Foundation (Day 1)

**Tables:**
- Organizations (already exists)
- Locations (already exists)
- Departments (already exists)

**Actions:**
1. Verify organization record exists
2. Create locations if needed
3. Setup departments

### Phase 0.2: Chart of Accounts (Day 1-2)

**Table:** `accounting_chart_of_accounts`

**Actions:**
1. Create standard hospital chart of accounts
2. Setup account hierarchy (parent-child)
3. Define account types and normal balances
4. Mark system accounts
5. Validate account code structure

**Timeline:** 1-2 days

### Phase 0.3: Cost Centers & Departments (Day 2)

**Table:** `accounting_cost_centers`

**Actions:**
1. Map departments to cost centers
2. Create revenue centers
3. Create support centers
4. Assign cost center codes
5. Set budget amounts

**Timeline:** 1 day

### Phase 0.4: Bank Accounts (Day 2)

**Table:** `accounting_bank_accounts`

**Actions:**
1. Add operating bank account
2. Add payroll account (if separate)
3. Add merchant account
4. Link to GL accounts
5. Set default account

**Timeline:** 0.5 days

### Phase 0.5: Billing Code Masters (Day 3-5)

**Tables:**
- `billing_cpt_codes`
- `billing_icd_codes`
- `billing_modifiers`

**Actions:**
1. Import CPT codes (2025 version)
2. Import ICD-10-CM codes (2025 version)
3. Import modifiers
4. Set effective dates
5. Mark active codes
6. Create indexes

**Timeline:** 2-3 days (bulk import)

### Phase 0.6: Provider Master (Day 5)

**Table:** `billing_providers`

**Actions:**
1. Add all providers with NPI
2. Verify NPI with registry
3. Add taxonomy codes
4. Add license numbers
5. Add provider addresses

**Timeline:** 0.5 days

### Phase 0.7: Payer Master (Day 5-6)

**Table:** `billing_payers`

**Actions:**
1. Add insurance companies
2. Add payer IDs
3. Set payer types (commercial, medicare, medicaid)
4. Configure ERA support flags
5. Add contact information
6. Set submission methods

**Timeline:** 1 day

### Phase 0.8: Fee Schedules (Day 6-7)

**Table:** `billing_fee_schedules`

**Actions:**
1. Create organizational default fee schedule
2. Create Medicare fee schedule
3. Create Medicaid fee schedule
4. Create commercial payer fee schedules
5. Set effective dates
6. Import CPT rates

**Timeline:** 1-2 days

### Phase 0.9: Payment Gateway Setup (Day 7)

**Table:** `billing_payment_gateways`

**Actions:**
1. Setup Stripe account
2. Configure Stripe API keys
3. Setup SePay account (if applicable)
4. Configure webhook endpoints
5. Test payment processing
6. Set default gateway

**Timeline:** 0.5 days

### Phase 0.10: Settings & Configuration (Day 7-8)

**Tables:**
- `billing_tenant_settings`
- Organization billing settings (JSONB)

**Actions:**
1. Configure ClaimMD credentials
2. Set billing policies
3. Set payment terms
4. Configure auto-workflows
5. Set statement frequency
6. Define approval thresholds

**Timeline:** 1 day

---

## 3. Chart of Accounts Setup

### 3.1 Standard Hospital Chart of Accounts

**Account Structure:** 4-digit codes

```
1000-1999: Assets
2000-2999: Liabilities
3000-3999: Equity
4000-4999: Revenue
5000-9999: Expenses
```

### 3.2 Core GL Accounts (Minimum Required)

**Assets:**
```sql
INSERT INTO accounting_chart_of_accounts (org_id, account_code, account_name, account_type, account_subtype, normal_balance, is_system, is_active) VALUES
-- Cash accounts
($ORG_ID, '1000', 'Cash - Operating Account', 'asset', 'current_asset', 'debit', TRUE, TRUE),
($ORG_ID, '1010', 'Cash - Payroll Account', 'asset', 'current_asset', 'debit', FALSE, TRUE),
($ORG_ID, '1020', 'Petty Cash', 'asset', 'current_asset', 'debit', FALSE, TRUE),

-- Accounts Receivable
($ORG_ID, '1100', 'Accounts Receivable - Patients', 'asset', 'current_asset', 'debit', TRUE, TRUE),
($ORG_ID, '1110', 'Accounts Receivable - Insurance', 'asset', 'current_asset', 'debit', TRUE, TRUE),
($ORG_ID, '1120', 'Allowance for Doubtful Accounts', 'contra_asset', 'current_asset', 'credit', TRUE, TRUE),

-- Inventory
($ORG_ID, '1200', 'Medical Supplies Inventory', 'asset', 'current_asset', 'debit', FALSE, TRUE),
($ORG_ID, '1210', 'Pharmaceutical Inventory', 'asset', 'current_asset', 'debit', FALSE, TRUE),

-- Prepaid
($ORG_ID, '1300', 'Prepaid Insurance', 'asset', 'current_asset', 'debit', FALSE, TRUE),
($ORG_ID, '1310', 'Prepaid Rent', 'asset', 'current_asset', 'debit', FALSE, TRUE),

-- Fixed Assets
($ORG_ID, '1400', 'Medical Equipment', 'asset', 'fixed_asset', 'debit', FALSE, TRUE),
($ORG_ID, '1410', 'Accumulated Depreciation - Equipment', 'contra_asset', 'fixed_asset', 'credit', FALSE, TRUE),
($ORG_ID, '1500', 'Buildings', 'asset', 'fixed_asset', 'debit', FALSE, TRUE),
($ORG_ID, '1510', 'Accumulated Depreciation - Buildings', 'contra_asset', 'fixed_asset', 'credit', FALSE, TRUE);
```

**Liabilities:**
```sql
INSERT INTO accounting_chart_of_accounts (org_id, account_code, account_name, account_type, account_subtype, normal_balance, is_system, is_active) VALUES
-- Current Liabilities
($ORG_ID, '2000', 'Accounts Payable', 'liability', 'current_liability', 'credit', TRUE, TRUE),
($ORG_ID, '2100', 'Accrued Salaries', 'liability', 'current_liability', 'credit', FALSE, TRUE),
($ORG_ID, '2110', 'Accrued Payroll Taxes', 'liability', 'current_liability', 'credit', FALSE, TRUE),
($ORG_ID, '2120', 'Accrued Benefits', 'liability', 'current_liability', 'credit', FALSE, TRUE),

-- Long-term Liabilities
($ORG_ID, '2200', 'Short-term Notes Payable', 'liability', 'current_liability', 'credit', FALSE, TRUE),
($ORG_ID, '2300', 'Long-term Debt', 'liability', 'long_term_liability', 'credit', FALSE, TRUE);
```

**Equity:**
```sql
INSERT INTO accounting_chart_of_accounts (org_id, account_code, account_name, account_type, account_subtype, normal_balance, is_system, is_active) VALUES
($ORG_ID, '3000', 'Owner''s Capital', 'equity', 'capital', 'credit', TRUE, TRUE),
($ORG_ID, '3100', 'Retained Earnings', 'equity', 'retained_earnings', 'credit', TRUE, TRUE),
($ORG_ID, '3200', 'Current Year Earnings', 'equity', 'current_earnings', 'credit', TRUE, TRUE);
```

**Revenue:**
```sql
INSERT INTO accounting_chart_of_accounts (org_id, account_code, account_name, account_type, account_subtype, normal_balance, is_system, is_active) VALUES
-- Patient Service Revenue
($ORG_ID, '4000', 'Patient Service Revenue - Inpatient', 'revenue', 'operating_revenue', 'credit', TRUE, TRUE),
($ORG_ID, '4010', 'Patient Service Revenue - Outpatient', 'revenue', 'operating_revenue', 'credit', TRUE, TRUE),
($ORG_ID, '4020', 'Patient Service Revenue - Emergency', 'revenue', 'operating_revenue', 'credit', TRUE, TRUE),
($ORG_ID, '4030', 'Patient Service Revenue - Surgery', 'revenue', 'operating_revenue', 'credit', TRUE, TRUE),
($ORG_ID, '4040', 'Patient Service Revenue - Laboratory', 'revenue', 'operating_revenue', 'credit', TRUE, TRUE),
($ORG_ID, '4050', 'Patient Service Revenue - Radiology', 'revenue', 'operating_revenue', 'credit', TRUE, TRUE),
($ORG_ID, '4060', 'Patient Service Revenue - Pharmacy', 'revenue', 'operating_revenue', 'credit', TRUE, TRUE),

-- Insurance Revenue
($ORG_ID, '4100', 'Insurance Revenue - Commercial', 'revenue', 'operating_revenue', 'credit', TRUE, TRUE),
($ORG_ID, '4110', 'Insurance Revenue - Medicare', 'revenue', 'operating_revenue', 'credit', TRUE, TRUE),
($ORG_ID, '4120', 'Insurance Revenue - Medicaid', 'revenue', 'operating_revenue', 'credit', TRUE, TRUE),

-- Other Revenue
($ORG_ID, '4200', 'Other Operating Revenue', 'revenue', 'operating_revenue', 'credit', FALSE, TRUE),
($ORG_ID, '4300', 'Non-Operating Revenue', 'revenue', 'non_operating_revenue', 'credit', FALSE, TRUE),

-- Contra-Revenue
($ORG_ID, '4900', 'Contractual Adjustments', 'revenue', 'contra_revenue', 'debit', TRUE, TRUE),
($ORG_ID, '4910', 'Prompt Pay Discounts', 'revenue', 'contra_revenue', 'debit', FALSE, TRUE),
($ORG_ID, '4920', 'Charity Care', 'revenue', 'contra_revenue', 'debit', FALSE, TRUE);
```

**Expenses:**
```sql
INSERT INTO accounting_chart_of_accounts (org_id, account_code, account_name, account_type, account_subtype, normal_balance, is_system, is_active) VALUES
-- Salaries & Wages
($ORG_ID, '5000', 'Salaries - Physicians', 'expense', 'operating_expense', 'debit', FALSE, TRUE),
($ORG_ID, '5100', 'Salaries - Nurses', 'expense', 'operating_expense', 'debit', FALSE, TRUE),
($ORG_ID, '5200', 'Salaries - Administrative', 'expense', 'operating_expense', 'debit', FALSE, TRUE),
($ORG_ID, '5300', 'Employee Benefits', 'expense', 'operating_expense', 'debit', FALSE, TRUE),
($ORG_ID, '5400', 'Payroll Taxes', 'expense', 'operating_expense', 'debit', FALSE, TRUE),

-- Medical Supplies & Drugs
($ORG_ID, '6000', 'Medical Supplies Expense', 'expense', 'operating_expense', 'debit', FALSE, TRUE),
($ORG_ID, '6100', 'Pharmaceutical Expense', 'expense', 'operating_expense', 'debit', FALSE, TRUE),
($ORG_ID, '6200', 'Laboratory Expense', 'expense', 'operating_expense', 'debit', FALSE, TRUE),
($ORG_ID, '6300', 'Radiology Expense', 'expense', 'operating_expense', 'debit', FALSE, TRUE),

-- Facility Expenses
($ORG_ID, '7000', 'Rent Expense', 'expense', 'operating_expense', 'debit', FALSE, TRUE),
($ORG_ID, '7100', 'Utilities Expense', 'expense', 'operating_expense', 'debit', FALSE, TRUE),
($ORG_ID, '7200', 'Insurance Expense', 'expense', 'operating_expense', 'debit', FALSE, TRUE),
($ORG_ID, '7300', 'Depreciation Expense', 'expense', 'operating_expense', 'debit', FALSE, TRUE),
($ORG_ID, '7400', 'Repairs & Maintenance', 'expense', 'operating_expense', 'debit', FALSE, TRUE),

-- Administrative Expenses
($ORG_ID, '8000', 'Marketing Expense', 'expense', 'administrative_expense', 'debit', FALSE, TRUE),
($ORG_ID, '8100', 'Professional Fees', 'expense', 'administrative_expense', 'debit', FALSE, TRUE),
($ORG_ID, '8200', 'Office Supplies', 'expense', 'administrative_expense', 'debit', FALSE, TRUE),
($ORG_ID, '8300', 'Software & Technology', 'expense', 'administrative_expense', 'debit', FALSE, TRUE),

-- Other Expenses
($ORG_ID, '9000', 'Bad Debt Expense', 'expense', 'operating_expense', 'debit', TRUE, TRUE),
($ORG_ID, '9100', 'Interest Expense', 'expense', 'non_operating_expense', 'debit', FALSE, TRUE);
```

### 3.3 Chart of Accounts Validation

**Validation Rules:**
1. ✅ All system accounts created (is_system = TRUE)
2. ✅ Account codes unique per organization
3. ✅ Normal balances set correctly (Assets/Expenses = Debit, Liabilities/Equity/Revenue = Credit)
4. ✅ Parent-child relationships valid
5. ✅ All active accounts have descriptions

**Validation Query:**
```sql
-- Check for required system accounts
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM accounting_chart_of_accounts WHERE account_code = '1000' AND org_id = $ORG_ID) THEN '✅'
    ELSE '❌'
  END AS cash_account,
  CASE
    WHEN EXISTS (SELECT 1 FROM accounting_chart_of_accounts WHERE account_code = '1100' AND org_id = $ORG_ID) THEN '✅'
    ELSE '❌'
  END AS ar_patient_account,
  CASE
    WHEN EXISTS (SELECT 1 FROM accounting_chart_of_accounts WHERE account_code = '2000' AND org_id = $ORG_ID) THEN '✅'
    ELSE '❌'
  END AS ap_account,
  CASE
    WHEN EXISTS (SELECT 1 FROM accounting_chart_of_accounts WHERE account_code = '4000' AND org_id = $ORG_ID) THEN '✅'
    ELSE '❌'
  END AS revenue_account,
  CASE
    WHEN EXISTS (SELECT 1 FROM accounting_chart_of_accounts WHERE account_code = '9000' AND org_id = $ORG_ID) THEN '✅'
    ELSE '❌'
  END AS bad_debt_account;
```

---

## 4. Billing Masters Setup

### 4.1 CPT Codes Import

**Source:** CMS HCPCS/CPT files (2025 version)

**Import Steps:**
1. Download 2025 CPT code file from CMS
2. Parse CSV/Excel file
3. Bulk insert into `billing_cpt_codes`
4. Set effective_date = 2025-01-01
5. Mark all as active

**Sample CPT Codes (E&M):**
```sql
INSERT INTO billing_cpt_codes (code, description, category, modifier_allowed, active, effective_date, version) VALUES
('99201', 'Office/outpatient visit new patient, level 1', 'E&M', TRUE, FALSE, '2021-01-01', '2021'), -- Deleted code
('99202', 'Office/outpatient visit new patient, level 2', 'E&M', TRUE, TRUE, '2021-01-01', '2025'),
('99203', 'Office/outpatient visit new patient, level 3', 'E&M', TRUE, TRUE, '2021-01-01', '2025'),
('99204', 'Office/outpatient visit new patient, level 4', 'E&M', TRUE, TRUE, '2021-01-01', '2025'),
('99205', 'Office/outpatient visit new patient, level 5', 'E&M', TRUE, TRUE, '2021-01-01', '2025'),
('99211', 'Office/outpatient visit established patient, level 1', 'E&M', TRUE, TRUE, '2021-01-01', '2025'),
('99212', 'Office/outpatient visit established patient, level 2', 'E&M', TRUE, TRUE, '2021-01-01', '2025'),
('99213', 'Office/outpatient visit established patient, level 3', 'E&M', TRUE, TRUE, '2021-01-01', '2025'),
('99214', 'Office/outpatient visit established patient, level 4', 'E&M', TRUE, TRUE, '2021-01-01', '2025'),
('99215', 'Office/outpatient visit established patient, level 5', 'E&M', TRUE, TRUE, '2021-01-01', '2025');
```

**Bulk Import Script:**
```javascript
// scripts/import-cpt-codes.js
const fs = require('fs');
const csv = require('csv-parser');
const { db } = require('../src/database/connection');

async function importCPTCodes(filePath) {
  const codes = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      codes.push({
        code: row.HCPCS_CODE,
        description: row.SHORT_DESCRIPTION,
        category: row.CATEGORY,
        modifier_allowed: true,
        active: true,
        effective_date: '2025-01-01',
        version: '2025'
      });
    })
    .on('end', async () => {
      console.log(`Importing ${codes.length} CPT codes...`);

      // Bulk insert in batches of 1000
      for (let i = 0; i < codes.length; i += 1000) {
        const batch = codes.slice(i, i + 1000);
        await db.query(`
          INSERT INTO billing_cpt_codes (code, description, category, modifier_allowed, active, effective_date, version)
          SELECT * FROM json_populate_recordset(NULL::billing_cpt_codes, $1)
          ON CONFLICT (code) DO UPDATE SET
            description = EXCLUDED.description,
            updated_at = CURRENT_TIMESTAMP
        `, [JSON.stringify(batch)]);

        console.log(`Imported ${i + batch.length} codes...`);
      }

      console.log('CPT import complete!');
    });
}

module.exports = { importCPTCodes };
```

### 4.2 ICD-10 Codes Import

**Source:** CMS ICD-10-CM files (2025 version)

**Import Steps:**
1. Download 2025 ICD-10-CM file
2. Parse code file
3. Bulk insert into `billing_icd_codes`
4. Set effective_date = 2025-10-01 (ICD updates October 1st annually)
5. Mark all as active

**Sample ICD-10 Codes:**
```sql
INSERT INTO billing_icd_codes (code, description, category, icd_version, active, effective_date) VALUES
('E11.9', 'Type 2 diabetes mellitus without complications', 'Endocrine', 'ICD-10', TRUE, '2025-10-01'),
('I10', 'Essential (primary) hypertension', 'Circulatory', 'ICD-10', TRUE, '2025-10-01'),
('J44.0', 'Chronic obstructive pulmonary disease with acute lower respiratory infection', 'Respiratory', 'ICD-10', TRUE, '2025-10-01'),
('M79.3', 'Panniculitis, unspecified', 'Musculoskeletal', 'ICD-10', TRUE, '2025-10-01'),
('Z00.00', 'Encounter for general adult medical examination without abnormal findings', 'Z codes', 'ICD-10', TRUE, '2025-10-01');
```

**Note:** Full ICD-10-CM has ~72,000 codes. Use bulk import script similar to CPT.

### 4.3 Modifiers Import

**Source:** CMS modifier list

**Common Modifiers:**
```sql
INSERT INTO billing_modifiers (code, description, modifier_type, active) VALUES
('25', 'Significant, separately identifiable evaluation and management service', 'CPT', TRUE),
('26', 'Professional component', 'CPT', TRUE),
('59', 'Distinct procedural service', 'CPT', TRUE),
('76', 'Repeat procedure by same physician', 'CPT', TRUE),
('77', 'Repeat procedure by another physician', 'CPT', TRUE),
('78', 'Unplanned return to operating room', 'CPT', TRUE),
('79', 'Unrelated procedure during postoperative period', 'CPT', TRUE),
('80', 'Assistant surgeon', 'CPT', TRUE),
('81', 'Minimum assistant surgeon', 'CPT', TRUE),
('82', 'Assistant surgeon when qualified resident not available', 'CPT', TRUE),
('GT', 'Via interactive audio and video telecommunication systems', 'CPT', TRUE),
('TC', 'Technical component', 'CPT', TRUE),
('XE', 'Separate encounter', 'CPT', TRUE),
('XS', 'Separate structure', 'CPT', TRUE),
('XP', 'Separate practitioner', 'CPT', TRUE),
('XU', 'Unusual non-overlapping service', 'CPT', TRUE);
```

### 4.4 Validation Scripts

**CPT Validation:**
```sql
-- Check CPT import
SELECT
  COUNT(*) as total_codes,
  COUNT(CASE WHEN active = TRUE THEN 1 END) as active_codes,
  COUNT(CASE WHEN active = FALSE THEN 1 END) as inactive_codes,
  COUNT(DISTINCT category) as categories,
  MIN(effective_date) as oldest_effective,
  MAX(effective_date) as newest_effective
FROM billing_cpt_codes;

-- Expected: 10,000+ total codes
```

**ICD Validation:**
```sql
-- Check ICD import
SELECT
  COUNT(*) as total_codes,
  COUNT(CASE WHEN active = TRUE THEN 1 END) as active_codes,
  COUNT(DISTINCT category) as categories,
  icd_version,
  COUNT(*) as count_per_version
FROM billing_icd_codes
GROUP BY icd_version;

-- Expected: 70,000+ ICD-10 codes
```

---

## 5. Payment Configuration

### 5.1 Payment Gateway Setup

**Stripe Configuration:**

```sql
INSERT INTO billing_payment_gateways (
  org_id,
  gateway_name,
  gateway_provider,
  api_key_encrypted,
  api_secret_encrypted,
  merchant_id,
  is_active,
  is_default,
  supported_methods,
  test_mode,
  configuration
) VALUES (
  $ORG_ID,
  'Stripe Payment Gateway',
  'stripe',
  encrypt('sk_live_xxxxx'), -- Replace with actual key
  encrypt('whsec_xxxxx'), -- Webhook secret
  'acct_xxxxx', -- Stripe account ID
  TRUE,
  TRUE,
  ARRAY['credit_card', 'debit_card', 'ach', 'digital_wallet'],
  FALSE, -- Set TRUE for test mode
  '{
    "api_version": "2024-12-18",
    "capture_method": "automatic",
    "confirmation_method": "automatic",
    "webhook_url": "https://yourdomain.com/api/webhooks/stripe",
    "return_url": "https://yourdomain.com/portal/billing/payment-confirmation",
    "statement_descriptor": "HOSPITAL PAYMENT"
  }'::jsonb
);
```

**SePay Configuration (Vietnam):**

```sql
INSERT INTO billing_payment_gateways (
  org_id,
  gateway_name,
  gateway_provider,
  api_key_encrypted,
  api_secret_encrypted,
  merchant_id,
  is_active,
  is_default,
  supported_methods,
  test_mode,
  configuration
) VALUES (
  $ORG_ID,
  'SePay Vietnam',
  'sepay',
  encrypt('sepay_api_key'), -- Replace with actual key
  encrypt('sepay_secret'), -- Secret key
  'MERCHANT_CODE', -- SePay merchant code
  TRUE,
  FALSE,
  ARRAY['bank_transfer', 'qr_code', 'vietqr'],
  FALSE,
  '{
    "webhook_url": "https://yourdomain.com/api/webhooks/sepay",
    "return_url": "https://yourdomain.com/portal/billing/payment-confirmation",
    "bank_accounts": [
      {
        "bank_code": "VCB",
        "account_number": "1234567890",
        "account_name": "Hospital Name"
      }
    ]
  }'::jsonb
);
```

### 5.2 Payment Method Configuration

**Enabled Payment Methods:**
```json
{
  "payment_methods": [
    {
      "method": "cash",
      "enabled": true,
      "require_receipt": true,
      "daily_limit": 50000.00
    },
    {
      "method": "check",
      "enabled": true,
      "require_check_number": true,
      "hold_days": 3
    },
    {
      "method": "credit_card",
      "enabled": true,
      "gateway": "stripe",
      "supported_cards": ["visa", "mastercard", "amex", "discover"],
      "processing_fee_percent": 2.9,
      "processing_fee_fixed": 0.30
    },
    {
      "method": "ach",
      "enabled": true,
      "gateway": "stripe",
      "processing_days": 3,
      "processing_fee_percent": 0.8
    },
    {
      "method": "bank_transfer",
      "enabled": true,
      "gateway": "sepay",
      "verification_required": true
    }
  ]
}
```

---

## 6. Fee Schedule Setup

### 6.1 Default Organizational Fee Schedule

**Create Default Schedule:**
```sql
-- Default fee schedule (self-pay rates)
INSERT INTO billing_fee_schedules (org_id, payer_id, cpt_code, amount, effective_from, effective_to, active)
VALUES
-- Evaluation & Management
($ORG_ID, NULL, '99202', 150.00, '2025-01-01', NULL, TRUE),
($ORG_ID, NULL, '99203', 200.00, '2025-01-01', NULL, TRUE),
($ORG_ID, NULL, '99204', 250.00, '2025-01-01', NULL, TRUE),
($ORG_ID, NULL, '99205', 300.00, '2025-01-01', NULL, TRUE),
($ORG_ID, NULL, '99212', 100.00, '2025-01-01', NULL, TRUE),
($ORG_ID, NULL, '99213', 140.00, '2025-01-01', NULL, TRUE),
($ORG_ID, NULL, '99214', 190.00, '2025-01-01', NULL, TRUE),
($ORG_ID, NULL, '99215', 240.00, '2025-01-01', NULL, TRUE),

-- Preventive Medicine
($ORG_ID, NULL, '99385', 180.00, '2025-01-01', NULL, TRUE),
($ORG_ID, NULL, '99386', 200.00, '2025-01-01', NULL, TRUE),
($ORG_ID, NULL, '99395', 160.00, '2025-01-01', NULL, TRUE),
($ORG_ID, NULL, '99396', 180.00, '2025-01-01', NULL, TRUE),

-- Procedures
($ORG_ID, NULL, '36415', 25.00, '2025-01-01', NULL, TRUE),  -- Venipuncture
($ORG_ID, NULL, '80053', 35.00, '2025-01-01', NULL, TRUE),  -- Comprehensive metabolic panel
($ORG_ID, NULL, '85025', 20.00, '2025-01-01', NULL, TRUE),  -- Complete blood count
($ORG_ID, NULL, '93000', 75.00, '2025-01-01', NULL, TRUE);  -- EKG
```

### 6.2 Medicare Fee Schedule

**Import Medicare Rates:**
```sql
-- Medicare fee schedule (example rates, use actual CMS rates)
INSERT INTO billing_fee_schedules (org_id, payer_id, cpt_code, amount, effective_from, effective_to, active)
SELECT
  $ORG_ID,
  (SELECT id FROM billing_payers WHERE payer_type = 'medicare' LIMIT 1),
  cpt_code,
  amount * 0.65, -- Medicare typically 65% of self-pay rates
  '2025-01-01',
  NULL,
  TRUE
FROM billing_fee_schedules
WHERE org_id = $ORG_ID AND payer_id IS NULL;
```

### 6.3 Commercial Payer Fee Schedules

**Create for Each Payer:**
```sql
-- Blue Cross Blue Shield (example)
INSERT INTO billing_fee_schedules (org_id, payer_id, cpt_code, amount, effective_from, effective_to, active)
SELECT
  $ORG_ID,
  (SELECT id FROM billing_payers WHERE name = 'Blue Cross Blue Shield' LIMIT 1),
  cpt_code,
  amount * 0.75, -- Commercial typically 75% of self-pay
  '2025-01-01',
  '2025-12-31',
  TRUE
FROM billing_fee_schedules
WHERE org_id = $ORG_ID AND payer_id IS NULL;
```

### 6.4 Fee Schedule Validation

```sql
-- Verify fee schedules exist for all common CPT codes
SELECT
  p.name as payer_name,
  COUNT(DISTINCT fs.cpt_code) as cpt_codes_with_rates,
  MIN(fs.amount) as min_rate,
  MAX(fs.amount) as max_rate,
  AVG(fs.amount) as avg_rate
FROM billing_fee_schedules fs
LEFT JOIN billing_payers p ON fs.payer_id = p.id
WHERE fs.org_id = $ORG_ID
  AND fs.active = TRUE
GROUP BY p.name;
```

---

## 7. Payer Master Setup

### 7.1 Common Insurance Payers

```sql
INSERT INTO billing_payers (
  name, payer_id, payer_type,
  address, contact_email, contact_phone,
  claim_submission_method, requires_prior_auth, era_supported, active
) VALUES
-- Medicare
('Medicare', '00120', 'medicare',
 '{"street": "7500 Security Blvd", "city": "Baltimore", "state": "MD", "zip": "21244"}'::jsonb,
 'medicare@cms.hhs.gov', '1-800-633-4227',
 'electronic', TRUE, TRUE, TRUE),

-- Medicaid (varies by state)
('Medicaid - State', '68069', 'medicaid',
 '{"street": "State Medicaid Office", "city": "City", "state": "XX", "zip": "00000"}'::jsonb,
 'medicaid@state.gov', '1-800-XXX-XXXX',
 'electronic', TRUE, TRUE, TRUE),

-- Commercial Payers
('Blue Cross Blue Shield', '00001', 'commercial',
 '{"street": "225 N Michigan Ave", "city": "Chicago", "state": "IL", "zip": "60601"}'::jsonb,
 'provider@bcbs.com', '1-800-XXX-XXXX',
 'electronic', TRUE, TRUE, TRUE),

('UnitedHealthcare', '87726', 'commercial',
 '{"street": "9900 Bren Road East", "city": "Minnetonka", "state": "MN", "zip": "55343"}'::jsonb,
 'provider@uhc.com', '1-800-XXX-XXXX',
 'electronic', TRUE, TRUE, TRUE),

('Aetna', '60054', 'commercial',
 '{"street": "151 Farmington Ave", "city": "Hartford", "state": "CT", "zip": "06156"}'::jsonb,
 'provider@aetna.com', '1-800-XXX-XXXX',
 'electronic', TRUE, TRUE, TRUE),

('Cigna', '62308', 'commercial',
 '{"street": "900 Cottage Grove Rd", "city": "Bloomfield", "state": "CT", "zip": "06002"}'::jsonb,
 'provider@cigna.com', '1-800-XXX-XXXX',
 'electronic', TRUE, TRUE, TRUE),

-- Self Pay
('Self Pay', NULL, 'self_pay',
 NULL, NULL, NULL,
 'paper', FALSE, FALSE, TRUE);
```

### 7.2 Payer-Specific Settings

```sql
-- Update payer settings with specific requirements
UPDATE billing_payers SET settings = '{
  "timely_filing_limit_days": 365,
  "requires_referral": true,
  "accepts_electronic_attachments": true,
  "max_units_per_day": {
    "99213": 10,
    "99214": 8
  },
  "bundling_rules": ["CCI"],
  "authorization_phone": "1-800-XXX-XXXX",
  "provider_portal": "https://provider.example.com"
}'::jsonb
WHERE name = 'Blue Cross Blue Shield';
```

---

## 8. Cost Centers & Departments

### 8.1 Clinical Cost Centers

```sql
INSERT INTO accounting_cost_centers (
  org_id, cost_center_code, cost_center_name,
  cost_center_type, budget_amount, is_active
) VALUES
-- Revenue-generating clinical centers
($ORG_ID, 'CC-100', 'Emergency Department', 'revenue_generating', 5000000.00, TRUE),
($ORG_ID, 'CC-101', 'Inpatient Medical', 'revenue_generating', 8000000.00, TRUE),
($ORG_ID, 'CC-102', 'Inpatient Surgical', 'revenue_generating', 10000000.00, TRUE),
($ORG_ID, 'CC-103', 'Outpatient Clinic', 'revenue_generating', 3000000.00, TRUE),
($ORG_ID, 'CC-104', 'Surgery Center', 'revenue_generating', 6000000.00, TRUE),
($ORG_ID, 'CC-105', 'Radiology', 'revenue_generating', 2000000.00, TRUE),
($ORG_ID, 'CC-106', 'Laboratory', 'revenue_generating', 1500000.00, TRUE),
($ORG_ID, 'CC-107', 'Pharmacy', 'revenue_generating', 2500000.00, TRUE);
```

### 8.2 Support Cost Centers

```sql
INSERT INTO accounting_cost_centers (
  org_id, cost_center_code, cost_center_name,
  cost_center_type, budget_amount, is_active
) VALUES
-- Non-revenue support centers
($ORG_ID, 'CC-200', 'Administration', 'administrative', 1000000.00, TRUE),
($ORG_ID, 'CC-201', 'Human Resources', 'administrative', 500000.00, TRUE),
($ORG_ID, 'CC-202', 'Finance & Accounting', 'administrative', 600000.00, TRUE),
($ORG_ID, 'CC-203', 'Information Technology', 'support', 800000.00, TRUE),
($ORG_ID, 'CC-204', 'Facilities & Maintenance', 'support', 700000.00, TRUE),
($ORG_ID, 'CC-205', 'Housekeeping', 'support', 400000.00, TRUE),
($ORG_ID, 'CC-206', 'Security', 'support', 300000.00, TRUE);
```

### 8.3 Link Cost Centers to Departments

```sql
-- Update existing departments with cost center links
UPDATE departments SET
  metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{cost_center_id}',
    to_jsonb((SELECT id::text FROM accounting_cost_centers WHERE cost_center_code = 'CC-103'))
  )
WHERE name = 'Outpatient Clinic' AND org_id = $ORG_ID;
```

---

## 9. Bank Accounts Setup

### 9.1 Primary Bank Accounts

```sql
INSERT INTO accounting_bank_accounts (
  org_id, account_name, account_number,
  bank_name, routing_number, account_type,
  gl_account_id, current_balance, is_active, is_default
) VALUES
-- Operating account
(
  $ORG_ID,
  'Operating - General Account',
  'XXXX1234', -- Last 4 digits
  'Bank of America',
  '026009593',
  'checking',
  (SELECT id FROM accounting_chart_of_accounts WHERE account_code = '1000' AND org_id = $ORG_ID),
  0.00,
  TRUE,
  TRUE
),

-- Payroll account
(
  $ORG_ID,
  'Payroll Account',
  'XXXX5678',
  'Bank of America',
  '026009593',
  'payroll',
  (SELECT id FROM accounting_chart_of_accounts WHERE account_code = '1010' AND org_id = $ORG_ID),
  0.00,
  TRUE,
  FALSE
),

-- Merchant account (credit card processing)
(
  $ORG_ID,
  'Merchant Services Account',
  'XXXX9012',
  'Stripe Connect',
  NULL,
  'merchant',
  (SELECT id FROM accounting_chart_of_accounts WHERE account_code = '1000' AND org_id = $ORG_ID),
  0.00,
  TRUE,
  FALSE
);
```

---

## 10. Settings & Configuration

### 10.1 Organization Billing Settings

```sql
-- Store in organizations table metadata or separate settings table
UPDATE organizations SET
  settings = jsonb_set(
    COALESCE(settings, '{}'::jsonb),
    '{billing}',
    '{
      "payment_terms": "Net 30",
      "late_payment_fee_percent": 1.5,
      "late_payment_grace_days": 10,
      "minimum_invoice_amount": 10.00,
      "auto_generate_invoices": true,
      "invoice_delivery_methods": ["email", "portal"],
      "statement_frequency": "monthly",
      "statement_generation_day": 1,
      "collections_threshold_days": 120,
      "auto_collections": false,
      "write_off_threshold_amount": 10.00,
      "patient_payment_plans_enabled": true,
      "max_payment_plan_months": 24,
      "payment_plan_min_down_payment_percent": 20,
      "payment_plan_interest_rate": 0.00,
      "online_payments_enabled": true,
      "credit_card_surcharge_percent": 0.00,
      "receipt_footer_text": "Thank you for your payment!",
      "invoice_footer_text": "Payment due within 30 days.",
      "tax_id": "XX-XXXXXXX",
      "npi": "1234567890"
    }'::jsonb
  )
WHERE id = $ORG_ID;
```

### 10.2 ClaimMD Tenant Settings

```sql
INSERT INTO billing_tenant_settings (
  org_id,
  claim_md_account_key,
  claim_md_token,
  claim_md_api_url,
  settings,
  active
) VALUES (
  $ORG_ID,
  'YOUR_ACCOUNT_KEY',
  'YOUR_API_TOKEN',
  'https://api.claim.md/v1',
  '{
    "auto_eligibility_check": true,
    "auto_submit_claims": false,
    "auto_post_payments": true,
    "notification_email": "billing@hospital.com",
    "claim_scrubbing_enabled": true
  }'::jsonb,
  TRUE
);
```

### 10.3 Approval Thresholds

```json
{
  "approval_thresholds": {
    "adjustments": {
      "tier1_limit": 50.00,
      "tier1_approver": "billing_clerk",
      "tier2_limit": 500.00,
      "tier2_approver": "billing_manager",
      "tier3_approver": "cfo"
    },
    "refunds": {
      "tier1_limit": 100.00,
      "tier1_approver": "billing_clerk",
      "tier2_limit": 1000.00,
      "tier2_approver": "billing_manager",
      "tier3_approver": "cfo"
    },
    "write_offs": {
      "tier1_limit": 50.00,
      "tier1_approver": "billing_manager",
      "tier2_limit": 500.00,
      "tier2_approver": "cfo"
    },
    "payment_plans": {
      "max_amount_without_approval": 5000.00,
      "approver": "financial_counselor"
    }
  }
}
```

---

## 11. Validation & Testing

### 11.1 Master Data Validation Checklist

```sql
-- Validation Query: Check all masters setup
SELECT
  'Chart of Accounts' as master_type,
  COUNT(*) as record_count,
  COUNT(CASE WHEN is_system = TRUE THEN 1 END) as system_accounts,
  CASE
    WHEN COUNT(*) >= 30 THEN '✅ READY'
    ELSE '❌ INCOMPLETE'
  END as status
FROM accounting_chart_of_accounts WHERE org_id = $ORG_ID

UNION ALL

SELECT
  'CPT Codes',
  COUNT(*),
  COUNT(CASE WHEN active = TRUE THEN 1 END),
  CASE
    WHEN COUNT(*) >= 10000 THEN '✅ READY'
    ELSE '❌ INCOMPLETE'
  END
FROM billing_cpt_codes

UNION ALL

SELECT
  'ICD Codes',
  COUNT(*),
  COUNT(CASE WHEN active = TRUE THEN 1 END),
  CASE
    WHEN COUNT(*) >= 50000 THEN '✅ READY'
    ELSE '❌ INCOMPLETE'
  END
FROM billing_icd_codes

UNION ALL

SELECT
  'Payers',
  COUNT(*),
  COUNT(CASE WHEN active = TRUE THEN 1 END),
  CASE
    WHEN COUNT(*) >= 3 THEN '✅ READY'
    ELSE '❌ INCOMPLETE'
  END
FROM billing_payers

UNION ALL

SELECT
  'Fee Schedules',
  COUNT(*),
  COUNT(DISTINCT payer_id),
  CASE
    WHEN COUNT(*) >= 50 THEN '✅ READY'
    ELSE '❌ INCOMPLETE'
  END
FROM billing_fee_schedules WHERE org_id = $ORG_ID

UNION ALL

SELECT
  'Cost Centers',
  COUNT(*),
  COUNT(CASE WHEN is_active = TRUE THEN 1 END),
  CASE
    WHEN COUNT(*) >= 5 THEN '✅ READY'
    ELSE '❌ INCOMPLETE'
  END
FROM accounting_cost_centers WHERE org_id = $ORG_ID

UNION ALL

SELECT
  'Bank Accounts',
  COUNT(*),
  COUNT(CASE WHEN is_active = TRUE THEN 1 END),
  CASE
    WHEN COUNT(*) >= 1 THEN '✅ READY'
    ELSE '❌ INCOMPLETE'
  END
FROM accounting_bank_accounts WHERE org_id = $ORG_ID

UNION ALL

SELECT
  'Payment Gateways',
  COUNT(*),
  COUNT(CASE WHEN is_active = TRUE THEN 1 END),
  CASE
    WHEN COUNT(*) >= 1 THEN '✅ READY'
    ELSE '❌ INCOMPLETE'
  END
FROM billing_payment_gateways WHERE org_id = $ORG_ID;
```

### 11.2 Required Data Checklist

**Before Going Live:**
- [ ] ✅ Chart of Accounts created (minimum 30 accounts)
- [ ] ✅ All system accounts (cash, A/R, revenue, bad debt) created
- [ ] ✅ CPT codes imported (10,000+)
- [ ] ✅ ICD-10 codes imported (50,000+)
- [ ] ✅ Modifiers imported (50+)
- [ ] ✅ Providers added with NPI
- [ ] ✅ Payers added (Medicare, Medicaid, top commercial)
- [ ] ✅ Default fee schedule created
- [ ] ✅ Payer-specific fee schedules created
- [ ] ✅ Cost centers setup
- [ ] ✅ Bank accounts configured
- [ ] ✅ Payment gateway configured and tested
- [ ] ✅ ClaimMD credentials configured
- [ ] ✅ Billing settings configured
- [ ] ✅ Approval workflows configured

### 11.3 Test Transactions

**Create Test Records:**
```sql
-- Test patient account
INSERT INTO billing_patient_accounts (
  org_id, patient_id, account_number, account_status, current_balance
) VALUES (
  $ORG_ID, 'test-patient-001', 'TEST-00001', 'active', 0.00
);

-- Test invoice
INSERT INTO billing_invoices (
  org_id, invoice_number, invoice_type, account_id, patient_id,
  invoice_date, due_date, service_date_from, service_date_to,
  subtotal, total_amount, amount_due, status
) VALUES (
  $ORG_ID, 'TEST-INV-00001', 'patient',
  (SELECT id FROM billing_patient_accounts WHERE account_number = 'TEST-00001'),
  'test-patient-001',
  CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days',
  CURRENT_DATE, CURRENT_DATE,
  100.00, 100.00, 100.00, 'draft'
);

-- Test payment (do NOT post to GL yet)
-- Verify workflow works end-to-end
```

---

## 12. Seed Data Scripts

### 12.1 Master Seed Script

**File:** `ehr-api/src/database/seed-scripts/seed-billing-masters.js`

```javascript
const { db } = require('../connection');

async function seedBillingMasters(orgId) {
  console.log('🌱 Seeding billing masters...');

  try {
    // 1. Chart of Accounts
    console.log('  📊 Creating chart of accounts...');
    await seedChartOfAccounts(orgId);

    // 2. Cost Centers
    console.log('  🏢 Creating cost centers...');
    await seedCostCenters(orgId);

    // 3. Bank Accounts
    console.log('  🏦 Creating bank accounts...');
    await seedBankAccounts(orgId);

    // 4. CPT Codes (bulk import)
    console.log('  💊 Importing CPT codes...');
    await importCPTCodes('./data/cpt-codes-2025.csv');

    // 5. ICD Codes (bulk import)
    console.log('  📋 Importing ICD-10 codes...');
    await importICDCodes('./data/icd10-codes-2025.csv');

    // 6. Modifiers
    console.log('  🔧 Creating modifiers...');
    await seedModifiers();

    // 7. Payers
    console.log('  🏥 Creating payers...');
    await seedPayers();

    // 8. Fee Schedules
    console.log('  💰 Creating fee schedules...');
    await seedFeeSchedules(orgId);

    // 9. Settings
    console.log('  ⚙️  Configuring settings...');
    await seedSettings(orgId);

    console.log('✅ Billing masters seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding masters:', error);
    throw error;
  }
}

async function seedChartOfAccounts(orgId) {
  const accounts = [
    // Assets
    { code: '1000', name: 'Cash - Operating', type: 'asset', subtype: 'current_asset', balance: 'debit', is_system: true },
    { code: '1100', name: 'Accounts Receivable - Patients', type: 'asset', subtype: 'current_asset', balance: 'debit', is_system: true },
    // ... (add all accounts from section 3.2)
  ];

  for (const account of accounts) {
    await db.query(`
      INSERT INTO accounting_chart_of_accounts
        (org_id, account_code, account_name, account_type, account_subtype, normal_balance, is_system, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
      ON CONFLICT (org_id, account_code) DO NOTHING
    `, [orgId, account.code, account.name, account.type, account.subtype, account.balance, account.is_system]);
  }
}

// ... other seed functions

module.exports = { seedBillingMasters };
```

### 12.2 Running Seed Scripts

**Command Line:**
```bash
# Seed all masters for organization
node ehr-api/src/database/seed-scripts/seed-billing-masters.js --org-id=<UUID>

# Seed specific master
node ehr-api/src/database/seed-scripts/seed-billing-masters.js --org-id=<UUID> --only=cpt

# Import from file
node ehr-api/src/database/seed-scripts/import-cpt-codes.js --file=./data/cpt-2025.csv
```

---

## Timeline Summary

**Total Time: 7-8 Days**

| Phase | Duration | Status |
|-------|----------|--------|
| 0.1: Organization Foundation | 0.5 days | ⏳ Not Started |
| 0.2: Chart of Accounts | 1-2 days | ⏳ Not Started |
| 0.3: Cost Centers | 1 day | ⏳ Not Started |
| 0.4: Bank Accounts | 0.5 days | ⏳ Not Started |
| 0.5: Billing Codes (CPT/ICD) | 2-3 days | ⏳ Not Started |
| 0.6: Provider Master | 0.5 days | ⏳ Not Started |
| 0.7: Payer Master | 1 day | ⏳ Not Started |
| 0.8: Fee Schedules | 1-2 days | ⏳ Not Started |
| 0.9: Payment Gateway | 0.5 days | ⏳ Not Started |
| 0.10: Settings | 1 day | ⏳ Not Started |
| **Validation & Testing** | 1 day | ⏳ Not Started |

---

## Success Criteria

**Masters Setup Complete When:**
1. ✅ All validation queries return "READY" status
2. ✅ Test invoice can be generated
3. ✅ Test payment can be recorded
4. ✅ Test journal entry can be created
5. ✅ Fee schedule lookup works for all common CPT codes
6. ✅ Payment gateway test transaction succeeds
7. ✅ No foreign key constraint errors on test data

---

## Next Steps

After completing this master setup:
1. ✅ Proceed to Phase 1 of main implementation plan
2. ✅ Begin patient account creation
3. ✅ Start invoice generation
4. ✅ Enable payment processing

---

## Appendix A: Data Sources

**CPT Codes:**
- Source: CMS HCPCS files
- URL: https://www.cms.gov/medicare/coding-billing/healthcare-common-procedure-system
- Update: Annually (January 1st)

**ICD-10 Codes:**
- Source: CMS ICD-10-CM files
- URL: https://www.cms.gov/medicare/coding-billing/icd-10-codes
- Update: Annually (October 1st)

**Medicare Fee Schedule:**
- Source: CMS Physician Fee Schedule
- URL: https://www.cms.gov/medicare/payment/fee-schedules/physician
- Update: Annually

**NPI Registry:**
- Source: NPPES NPI Registry
- URL: https://npiregistry.cms.hhs.gov/
- Use: Verify provider NPIs

---

## Appendix B: Useful Queries

**Find Missing Fee Schedules:**
```sql
-- CPT codes without fee schedules
SELECT c.code, c.description
FROM billing_cpt_codes c
WHERE c.active = TRUE
  AND c.code NOT IN (
    SELECT cpt_code
    FROM billing_fee_schedules
    WHERE org_id = $ORG_ID AND active = TRUE
  )
ORDER BY c.code
LIMIT 100;
```

**Validate Chart of Accounts Balance:**
```sql
-- Assets and Expenses should have debit balance
-- Liabilities, Equity, Revenue should have credit balance
SELECT
  account_code,
  account_name,
  account_type,
  normal_balance,
  CASE
    WHEN account_type IN ('asset', 'expense') AND normal_balance = 'debit' THEN '✅'
    WHEN account_type IN ('liability', 'equity', 'revenue') AND normal_balance = 'credit' THEN '✅'
    ELSE '❌ WRONG'
  END as validation
FROM accounting_chart_of_accounts
WHERE org_id = $ORG_ID
ORDER BY account_code;
```

---

**End of Master Setup Plan**
