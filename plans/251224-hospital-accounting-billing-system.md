# Hospital Accounting & Billing System - Comprehensive Implementation Plan

**Plan ID**: 251224-hospital-accounting-billing-system
**Date**: 2025-12-24
**Status**: Draft
**Scope**: Complete end-to-end accounting and billing system for small to large scale hospitals

---

## Executive Summary

Implement comprehensive accounting and billing system building on existing ClaimMD integration. System will handle complete revenue cycle management (RCM), patient accounting, general ledger, accounts receivable/payable, payment processing, reconciliation, and financial reporting for hospitals of all sizes.

**Current State**: Basic ClaimMD billing integration with claims management, eligibility checks, prior authorizations, remittance processing.

**Target State**: Full-featured hospital financial management system with double-entry accounting, patient billing, payment processing, reconciliation, and comprehensive financial reporting.

---

## Table of Contents

1. [Database Schema & Tables](#1-database-schema--tables)
2. [Workflow Architecture](#2-workflow-architecture)
3. [Billing Processes](#3-billing-processes)
4. [Use Cases](#4-use-cases)
5. [Settings & Configuration](#5-settings--configuration)
6. [Reconciliation](#6-reconciliation)
7. [Invoicing](#7-invoicing)
8. [Payment Capture](#8-payment-capture)
9. [Implementation Phases](#9-implementation-phases)
10. [Technical Architecture](#10-technical-architecture)

---

## 1. Database Schema & Tables

### 1.1 Chart of Accounts (General Ledger Structure)

**Table: `accounting_chart_of_accounts`**
```sql
CREATE TABLE accounting_chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  account_code VARCHAR(20) NOT NULL, -- 1000, 1100, 4000, etc.
  account_name VARCHAR(200) NOT NULL,
  account_type VARCHAR(50) NOT NULL CHECK (account_type IN
    ('asset', 'liability', 'equity', 'revenue', 'expense', 'contra_asset', 'contra_liability')),
  account_subtype VARCHAR(100), -- 'current_asset', 'fixed_asset', 'operating_revenue', etc.
  parent_account_id UUID REFERENCES accounting_chart_of_accounts(id),
  normal_balance VARCHAR(10) NOT NULL CHECK (normal_balance IN ('debit', 'credit')),
  is_system BOOLEAN DEFAULT FALSE, -- System accounts cannot be deleted
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT,
  current_balance DECIMAL(15,2) DEFAULT 0.00,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(org_id, account_code)
);

-- Standard Hospital Chart of Accounts Structure:
-- ASSETS (1000-1999)
--   1000-1099: Cash and Cash Equivalents
--   1100-1199: Accounts Receivable
--   1200-1299: Inventory
--   1300-1399: Prepaid Expenses
--   1400-1499: Property, Plant & Equipment
-- LIABILITIES (2000-2999)
--   2000-2099: Accounts Payable
--   2100-2199: Accrued Expenses
--   2200-2299: Short-term Debt
--   2300-2399: Long-term Debt
-- EQUITY (3000-3999)
--   3000-3099: Owner's Equity
--   3100-3199: Retained Earnings
-- REVENUE (4000-4999)
--   4000-4099: Patient Service Revenue
--   4100-4199: Insurance Revenue
--   4200-4299: Other Operating Revenue
-- EXPENSES (5000-9999)
--   5000-5999: Cost of Services
--   6000-6999: Operating Expenses
--   7000-7999: Administrative Expenses
```

### 1.2 General Ledger (Double-Entry Accounting)

**Table: `accounting_journal_entries`**
```sql
CREATE TABLE accounting_journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  entry_number VARCHAR(50) NOT NULL, -- JE-2025-00001
  entry_date DATE NOT NULL,
  entry_type VARCHAR(50) NOT NULL CHECK (entry_type IN
    ('standard', 'adjusting', 'closing', 'reversing', 'opening')),
  fiscal_period VARCHAR(10) NOT NULL, -- 2025-01, 2025-02
  source_module VARCHAR(50), -- 'billing', 'payroll', 'inventory', 'manual'
  source_document_id UUID, -- Reference to claim, invoice, payment, etc.
  reference_number VARCHAR(100),
  description TEXT NOT NULL,
  total_debit DECIMAL(15,2) NOT NULL,
  total_credit DECIMAL(15,2) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'posted', 'void')),
  posted_by UUID REFERENCES users(id),
  posted_at TIMESTAMP,
  voided_by UUID REFERENCES users(id),
  voided_at TIMESTAMP,
  void_reason TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  UNIQUE(org_id, entry_number),
  CONSTRAINT balanced_entry CHECK (total_debit = total_credit)
);
```

**Table: `accounting_journal_lines`**
```sql
CREATE TABLE accounting_journal_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_entry_id UUID NOT NULL REFERENCES accounting_journal_entries(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  account_id UUID NOT NULL REFERENCES accounting_chart_of_accounts(id),
  cost_center_id UUID REFERENCES accounting_cost_centers(id),
  debit_amount DECIMAL(15,2) DEFAULT 0.00,
  credit_amount DECIMAL(15,2) DEFAULT 0.00,
  description TEXT,
  reference_id UUID, -- Link to specific transaction
  reference_type VARCHAR(50), -- 'claim_line', 'payment', 'invoice_line'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(journal_entry_id, line_number),
  CONSTRAINT debit_or_credit CHECK (
    (debit_amount > 0 AND credit_amount = 0) OR
    (credit_amount > 0 AND debit_amount = 0)
  )
);
```

### 1.3 Patient Accounts Receivable

**Table: `billing_patient_accounts`**
```sql
CREATE TABLE billing_patient_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  patient_id TEXT NOT NULL, -- FHIR Patient ID
  account_number VARCHAR(50) NOT NULL UNIQUE,
  account_status VARCHAR(20) NOT NULL CHECK (account_status IN
    ('active', 'suspended', 'collections', 'closed', 'deceased')),
  credit_limit DECIMAL(10,2) DEFAULT 0.00,
  current_balance DECIMAL(10,2) DEFAULT 0.00,
  insurance_balance DECIMAL(10,2) DEFAULT 0.00,
  patient_balance DECIMAL(10,2) DEFAULT 0.00,

  -- Aging buckets
  current_0_30 DECIMAL(10,2) DEFAULT 0.00,
  aging_31_60 DECIMAL(10,2) DEFAULT 0.00,
  aging_61_90 DECIMAL(10,2) DEFAULT 0.00,
  aging_91_120 DECIMAL(10,2) DEFAULT 0.00,
  aging_over_120 DECIMAL(10,2) DEFAULT 0.00,

  last_statement_date DATE,
  last_payment_date DATE,
  last_payment_amount DECIMAL(10,2),

  guarantor_id TEXT, -- FHIR RelatedPerson ID
  guarantor_relationship VARCHAR(50),

  payment_plan_id UUID REFERENCES billing_payment_plans(id),
  collection_status VARCHAR(20),
  collection_agency_id UUID REFERENCES billing_collection_agencies(id),
  sent_to_collections_at DATE,

  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  UNIQUE(org_id, patient_id)
);

CREATE INDEX idx_billing_patient_accounts_status ON billing_patient_accounts(account_status);
CREATE INDEX idx_billing_patient_accounts_balance ON billing_patient_accounts(current_balance);
CREATE INDEX idx_billing_patient_accounts_patient_id ON billing_patient_accounts(patient_id);
```

**Table: `billing_patient_transactions`**
```sql
CREATE TABLE billing_patient_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  account_id UUID NOT NULL REFERENCES billing_patient_accounts(id),
  transaction_number VARCHAR(50) NOT NULL,
  transaction_date DATE NOT NULL,
  transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN
    ('charge', 'payment', 'adjustment', 'refund', 'transfer', 'write_off', 'credit')),

  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,

  -- Reference to source documents
  claim_id UUID REFERENCES billing_claims(id),
  invoice_id UUID REFERENCES billing_invoices(id),
  payment_id UUID REFERENCES billing_payments(id),
  adjustment_id UUID REFERENCES billing_adjustments(id),

  payer_type VARCHAR(20) CHECK (payer_type IN ('insurance', 'patient', 'guarantor', 'other')),
  payer_id UUID REFERENCES billing_payers(id),

  description TEXT NOT NULL,
  notes TEXT,

  posted_by UUID REFERENCES users(id),
  posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  void_flag BOOLEAN DEFAULT FALSE,
  voided_by UUID REFERENCES users(id),
  voided_at TIMESTAMP,
  void_reason TEXT,

  metadata JSONB DEFAULT '{}',
  UNIQUE(org_id, transaction_number)
);

CREATE INDEX idx_patient_transactions_account ON billing_patient_transactions(account_id);
CREATE INDEX idx_patient_transactions_date ON billing_patient_transactions(transaction_date DESC);
CREATE INDEX idx_patient_transactions_type ON billing_patient_transactions(transaction_type);
```

### 1.4 Invoicing & Patient Statements

**Table: `billing_invoices`**
```sql
CREATE TABLE billing_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  invoice_number VARCHAR(50) NOT NULL,
  invoice_type VARCHAR(20) NOT NULL CHECK (invoice_type IN
    ('patient', 'insurance', 'self_pay', 'institutional')),

  account_id UUID NOT NULL REFERENCES billing_patient_accounts(id),
  patient_id TEXT NOT NULL,
  encounter_id TEXT, -- FHIR Encounter ID

  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  service_date_from DATE NOT NULL,
  service_date_to DATE NOT NULL,

  -- Financial summary
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0.00,
  discount_amount DECIMAL(10,2) DEFAULT 0.00,
  adjustment_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0.00,
  amount_due DECIMAL(10,2) NOT NULL,

  -- Status
  status VARCHAR(20) NOT NULL CHECK (status IN
    ('draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'void', 'written_off')),
  sent_at TIMESTAMP,
  sent_method VARCHAR(20), -- 'email', 'mail', 'patient_portal'
  viewed_at TIMESTAMP,
  paid_at TIMESTAMP,

  -- Billing info
  bill_to_name VARCHAR(200),
  bill_to_address TEXT,
  bill_to_phone VARCHAR(20),
  bill_to_email VARCHAR(100),

  payment_terms VARCHAR(100),
  payment_instructions TEXT,

  notes TEXT,
  footer_text TEXT,

  generated_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  UNIQUE(org_id, invoice_number)
);

CREATE INDEX idx_billing_invoices_status ON billing_invoices(status);
CREATE INDEX idx_billing_invoices_due_date ON billing_invoices(due_date);
CREATE INDEX idx_billing_invoices_patient ON billing_invoices(patient_id);
CREATE INDEX idx_billing_invoices_account ON billing_invoices(account_id);
```

**Table: `billing_invoice_lines`**
```sql
CREATE TABLE billing_invoice_lines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES billing_invoices(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,

  service_date DATE NOT NULL,
  description TEXT NOT NULL,

  -- Service details
  cpt_code VARCHAR(10),
  icd_codes TEXT[], -- Diagnosis codes
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  line_total DECIMAL(10,2) NOT NULL,

  -- Optional references
  claim_line_id UUID REFERENCES billing_claim_lines(id),
  charge_id UUID,

  metadata JSONB DEFAULT '{}',
  UNIQUE(invoice_id, line_number)
);

CREATE INDEX idx_invoice_lines_invoice ON billing_invoice_lines(invoice_id);
```

### 1.5 Payment Processing

**Table: `billing_payments`**
```sql
CREATE TABLE billing_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  payment_number VARCHAR(50) NOT NULL,

  account_id UUID NOT NULL REFERENCES billing_patient_accounts(id),
  patient_id TEXT NOT NULL,

  payment_date DATE NOT NULL,
  payment_amount DECIMAL(10,2) NOT NULL,

  -- Payment method
  payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN
    ('cash', 'check', 'credit_card', 'debit_card', 'ach', 'wire', 'eft',
     'payment_plan', 'insurance', 'online', 'mobile', 'other')),

  -- Payment details
  reference_number VARCHAR(100), -- Check number, transaction ID, etc.
  bank_name VARCHAR(100),
  card_last_4 VARCHAR(4),
  card_type VARCHAR(20), -- 'visa', 'mastercard', 'amex', 'discover'

  -- Payment gateway info
  gateway_provider VARCHAR(50), -- 'stripe', 'sepay', 'square', 'paypal'
  gateway_transaction_id TEXT,
  gateway_response JSONB,

  -- Processing info
  status VARCHAR(20) NOT NULL CHECK (status IN
    ('pending', 'processing', 'completed', 'failed', 'refunded', 'void')),
  processed_at TIMESTAMP,

  -- Allocation to invoices
  unapplied_amount DECIMAL(10,2) DEFAULT 0.00,

  -- Bank deposit info
  deposit_id UUID REFERENCES billing_bank_deposits(id),
  deposit_date DATE,

  payer_name VARCHAR(200),
  notes TEXT,

  received_by UUID REFERENCES users(id),
  posted_by UUID REFERENCES users(id),
  posted_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  UNIQUE(org_id, payment_number)
);

CREATE INDEX idx_billing_payments_account ON billing_payments(account_id);
CREATE INDEX idx_billing_payments_patient ON billing_payments(patient_id);
CREATE INDEX idx_billing_payments_date ON billing_payments(payment_date DESC);
CREATE INDEX idx_billing_payments_status ON billing_payments(status);
CREATE INDEX idx_billing_payments_method ON billing_payments(payment_method);
```

**Table: `billing_payment_allocations`**
```sql
CREATE TABLE billing_payment_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES billing_payments(id) ON DELETE CASCADE,
  invoice_id UUID NOT NULL REFERENCES billing_invoices(id),

  allocated_amount DECIMAL(10,2) NOT NULL,
  allocated_date DATE NOT NULL,

  notes TEXT,
  posted_by UUID REFERENCES users(id),
  posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_payment_allocations_payment ON billing_payment_allocations(payment_id);
CREATE INDEX idx_payment_allocations_invoice ON billing_payment_allocations(invoice_id);
```

### 1.6 Payment Plans & Installments

**Table: `billing_payment_plans`**
```sql
CREATE TABLE billing_payment_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  plan_number VARCHAR(50) NOT NULL,

  account_id UUID NOT NULL REFERENCES billing_patient_accounts(id),
  patient_id TEXT NOT NULL,

  plan_name VARCHAR(100),
  total_amount DECIMAL(10,2) NOT NULL,
  down_payment DECIMAL(10,2) DEFAULT 0.00,
  amount_financed DECIMAL(10,2) NOT NULL,

  number_of_installments INTEGER NOT NULL,
  installment_amount DECIMAL(10,2) NOT NULL,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN
    ('weekly', 'biweekly', 'monthly', 'quarterly')),

  start_date DATE NOT NULL,
  first_payment_date DATE NOT NULL,

  interest_rate DECIMAL(5,2) DEFAULT 0.00,
  finance_charge DECIMAL(10,2) DEFAULT 0.00,

  status VARCHAR(20) NOT NULL CHECK (status IN
    ('active', 'completed', 'defaulted', 'cancelled')),

  amount_paid DECIMAL(10,2) DEFAULT 0.00,
  amount_remaining DECIMAL(10,2) NOT NULL,

  auto_pay BOOLEAN DEFAULT FALSE,
  auto_pay_method VARCHAR(30),
  auto_pay_token TEXT, -- Encrypted payment token

  missed_payments INTEGER DEFAULT 0,
  last_payment_date DATE,
  next_payment_date DATE,

  default_date DATE,
  default_reason TEXT,

  notes TEXT,
  terms_accepted BOOLEAN DEFAULT FALSE,
  terms_accepted_at TIMESTAMP,

  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  UNIQUE(org_id, plan_number)
);

CREATE INDEX idx_payment_plans_account ON billing_payment_plans(account_id);
CREATE INDEX idx_payment_plans_status ON billing_payment_plans(status);
CREATE INDEX idx_payment_plans_next_payment ON billing_payment_plans(next_payment_date);
```

**Table: `billing_payment_plan_installments`**
```sql
CREATE TABLE billing_payment_plan_installments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES billing_payment_plans(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,

  due_date DATE NOT NULL,
  due_amount DECIMAL(10,2) NOT NULL,

  paid_amount DECIMAL(10,2) DEFAULT 0.00,
  paid_date DATE,
  payment_id UUID REFERENCES billing_payments(id),

  status VARCHAR(20) NOT NULL CHECK (status IN
    ('pending', 'paid', 'partial', 'late', 'missed')),

  late_fee DECIMAL(10,2) DEFAULT 0.00,

  metadata JSONB DEFAULT '{}',
  UNIQUE(plan_id, installment_number)
);

CREATE INDEX idx_installments_plan ON billing_payment_plan_installments(plan_id);
CREATE INDEX idx_installments_due_date ON billing_payment_plan_installments(due_date);
CREATE INDEX idx_installments_status ON billing_payment_plan_installments(status);
```

### 1.7 Adjustments, Write-offs & Refunds

**Table: `billing_adjustments`**
```sql
CREATE TABLE billing_adjustments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  adjustment_number VARCHAR(50) NOT NULL,

  account_id UUID NOT NULL REFERENCES billing_patient_accounts(id),
  patient_id TEXT NOT NULL,

  adjustment_type VARCHAR(30) NOT NULL CHECK (adjustment_type IN
    ('contractual', 'discount', 'courtesy', 'write_off', 'bad_debt',
     'price_correction', 'coding_correction', 'other')),

  adjustment_date DATE NOT NULL,
  adjustment_amount DECIMAL(10,2) NOT NULL,

  reason_code VARCHAR(50),
  reason_description TEXT NOT NULL,

  -- References
  invoice_id UUID REFERENCES billing_invoices(id),
  claim_id UUID REFERENCES billing_claims(id),

  approval_required BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,

  posted_by UUID REFERENCES users(id),
  posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  void_flag BOOLEAN DEFAULT FALSE,
  voided_by UUID REFERENCES users(id),
  voided_at TIMESTAMP,
  void_reason TEXT,

  metadata JSONB DEFAULT '{}',
  UNIQUE(org_id, adjustment_number)
);

CREATE INDEX idx_adjustments_account ON billing_adjustments(account_id);
CREATE INDEX idx_adjustments_type ON billing_adjustments(adjustment_type);
CREATE INDEX idx_adjustments_date ON billing_adjustments(adjustment_date DESC);
```

**Table: `billing_refunds`**
```sql
CREATE TABLE billing_refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  refund_number VARCHAR(50) NOT NULL,

  account_id UUID NOT NULL REFERENCES billing_patient_accounts(id),
  patient_id TEXT NOT NULL,
  original_payment_id UUID REFERENCES billing_payments(id),

  refund_date DATE NOT NULL,
  refund_amount DECIMAL(10,2) NOT NULL,

  refund_method VARCHAR(30) NOT NULL CHECK (refund_method IN
    ('cash', 'check', 'credit_card_reversal', 'ach', 'wire', 'other')),

  refund_reason VARCHAR(50) NOT NULL,
  reason_description TEXT NOT NULL,

  check_number VARCHAR(50),
  bank_account VARCHAR(100),

  status VARCHAR(20) NOT NULL CHECK (status IN
    ('pending', 'approved', 'processed', 'completed', 'cancelled')),

  requested_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  processed_by UUID REFERENCES users(id),

  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  processed_at TIMESTAMP,

  notes TEXT,
  metadata JSONB DEFAULT '{}',
  UNIQUE(org_id, refund_number)
);

CREATE INDEX idx_refunds_account ON billing_refunds(account_id);
CREATE INDEX idx_refunds_status ON billing_refunds(status);
CREATE INDEX idx_refunds_date ON billing_refunds(refund_date DESC);
```

### 1.8 Bank & Cash Management

**Table: `accounting_bank_accounts`**
```sql
CREATE TABLE accounting_bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  account_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(50) NOT NULL,

  bank_name VARCHAR(100) NOT NULL,
  routing_number VARCHAR(20),
  swift_code VARCHAR(20),

  account_type VARCHAR(20) NOT NULL CHECK (account_type IN
    ('checking', 'savings', 'merchant', 'payroll')),

  currency VARCHAR(3) DEFAULT 'USD',

  gl_account_id UUID REFERENCES accounting_chart_of_accounts(id),

  current_balance DECIMAL(15,2) DEFAULT 0.00,
  available_balance DECIMAL(15,2) DEFAULT 0.00,

  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,

  last_reconciled_date DATE,
  last_reconciled_balance DECIMAL(15,2),

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bank_accounts_org ON accounting_bank_accounts(org_id);
```

**Table: `billing_bank_deposits`**
```sql
CREATE TABLE billing_bank_deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  deposit_number VARCHAR(50) NOT NULL,

  bank_account_id UUID NOT NULL REFERENCES accounting_bank_accounts(id),
  deposit_date DATE NOT NULL,

  deposit_amount DECIMAL(15,2) NOT NULL,

  -- Payment counts by method
  cash_count INTEGER DEFAULT 0,
  cash_amount DECIMAL(10,2) DEFAULT 0.00,
  check_count INTEGER DEFAULT 0,
  check_amount DECIMAL(10,2) DEFAULT 0.00,
  card_count INTEGER DEFAULT 0,
  card_amount DECIMAL(10,2) DEFAULT 0.00,

  status VARCHAR(20) NOT NULL CHECK (status IN
    ('pending', 'submitted', 'cleared', 'reconciled')),

  deposit_slip_number VARCHAR(50),
  cleared_date DATE,

  prepared_by UUID REFERENCES users(id),
  verified_by UUID REFERENCES users(id),

  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  UNIQUE(org_id, deposit_number)
);

CREATE INDEX idx_bank_deposits_bank_account ON billing_bank_deposits(bank_account_id);
CREATE INDEX idx_bank_deposits_date ON billing_bank_deposits(deposit_date DESC);
CREATE INDEX idx_bank_deposits_status ON billing_bank_deposits(status);
```

### 1.9 Reconciliation

**Table: `accounting_bank_reconciliation`**
```sql
CREATE TABLE accounting_bank_reconciliation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  reconciliation_number VARCHAR(50) NOT NULL,

  bank_account_id UUID NOT NULL REFERENCES accounting_bank_accounts(id),

  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  opening_balance DECIMAL(15,2) NOT NULL,
  closing_balance DECIMAL(15,2) NOT NULL,

  statement_balance DECIMAL(15,2) NOT NULL,
  book_balance DECIMAL(15,2) NOT NULL,

  difference DECIMAL(15,2) NOT NULL,

  status VARCHAR(20) NOT NULL CHECK (status IN
    ('in_progress', 'balanced', 'discrepancy', 'completed')),

  reconciled_by UUID REFERENCES users(id),
  reconciled_at TIMESTAMP,

  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  UNIQUE(org_id, reconciliation_number)
);

CREATE INDEX idx_reconciliation_bank_account ON accounting_bank_reconciliation(bank_account_id);
CREATE INDEX idx_reconciliation_period ON accounting_bank_reconciliation(period_end DESC);
```

**Table: `accounting_reconciliation_items`**
```sql
CREATE TABLE accounting_reconciliation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reconciliation_id UUID NOT NULL REFERENCES accounting_bank_reconciliation(id) ON DELETE CASCADE,

  item_type VARCHAR(20) NOT NULL CHECK (item_type IN
    ('deposit', 'payment', 'fee', 'adjustment', 'outstanding_check', 'outstanding_deposit')),

  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,

  reference_id UUID, -- Link to payment, deposit, etc.
  reference_type VARCHAR(30),

  amount DECIMAL(15,2) NOT NULL,

  is_cleared BOOLEAN DEFAULT FALSE,
  cleared_date DATE,

  notes TEXT,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_reconciliation_items_reconciliation ON accounting_reconciliation_items(reconciliation_id);
```

### 1.10 Cost Centers & Departments

**Table: `accounting_cost_centers`**
```sql
CREATE TABLE accounting_cost_centers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  cost_center_code VARCHAR(20) NOT NULL,
  cost_center_name VARCHAR(100) NOT NULL,

  department_id UUID REFERENCES departments(id),
  parent_cost_center_id UUID REFERENCES accounting_cost_centers(id),

  cost_center_type VARCHAR(30) CHECK (cost_center_type IN
    ('clinical', 'administrative', 'support', 'revenue_generating')),

  manager_user_id UUID REFERENCES users(id),

  budget_amount DECIMAL(15,2) DEFAULT 0.00,
  ytd_actual DECIMAL(15,2) DEFAULT 0.00,
  ytd_variance DECIMAL(15,2) DEFAULT 0.00,

  is_active BOOLEAN DEFAULT TRUE,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(org_id, cost_center_code)
);

CREATE INDEX idx_cost_centers_org ON accounting_cost_centers(org_id);
CREATE INDEX idx_cost_centers_department ON accounting_cost_centers(department_id);
```

### 1.11 Budget Management

**Table: `accounting_budgets`**
```sql
CREATE TABLE accounting_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  budget_name VARCHAR(100) NOT NULL,
  fiscal_year INTEGER NOT NULL,

  budget_type VARCHAR(20) NOT NULL CHECK (budget_type IN
    ('operating', 'capital', 'cash_flow')),

  cost_center_id UUID REFERENCES accounting_cost_centers(id),
  account_id UUID REFERENCES accounting_chart_of_accounts(id),

  period_type VARCHAR(20) NOT NULL CHECK (period_type IN
    ('monthly', 'quarterly', 'annual')),

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  budgeted_amount DECIMAL(15,2) NOT NULL,
  actual_amount DECIMAL(15,2) DEFAULT 0.00,
  variance_amount DECIMAL(15,2) DEFAULT 0.00,
  variance_percent DECIMAL(5,2) DEFAULT 0.00,

  status VARCHAR(20) NOT NULL CHECK (status IN
    ('draft', 'approved', 'active', 'closed')),

  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,

  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_budgets_org ON accounting_budgets(org_id);
CREATE INDEX idx_budgets_fiscal_year ON accounting_budgets(fiscal_year);
CREATE INDEX idx_budgets_cost_center ON accounting_budgets(cost_center_id);
```

### 1.12 Collections Management

**Table: `billing_collection_agencies`**
```sql
CREATE TABLE billing_collection_agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  agency_name VARCHAR(200) NOT NULL,

  contact_name VARCHAR(100),
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  address TEXT,

  commission_rate DECIMAL(5,2), -- Percentage

  is_active BOOLEAN DEFAULT TRUE,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Table: `billing_collections`**
```sql
CREATE TABLE billing_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  account_id UUID NOT NULL REFERENCES billing_patient_accounts(id),
  patient_id TEXT NOT NULL,

  collection_agency_id UUID REFERENCES billing_collection_agencies(id),

  original_balance DECIMAL(10,2) NOT NULL,
  current_balance DECIMAL(10,2) NOT NULL,

  sent_to_collections_date DATE NOT NULL,

  status VARCHAR(20) NOT NULL CHECK (status IN
    ('pending', 'active', 'recovered', 'settled', 'closed', 'recalled')),

  recovered_amount DECIMAL(10,2) DEFAULT 0.00,
  agency_commission DECIMAL(10,2) DEFAULT 0.00,

  notes TEXT,
  closed_date DATE,
  closed_reason TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_collections_account ON billing_collections(account_id);
CREATE INDEX idx_collections_agency ON billing_collections(collection_agency_id);
CREATE INDEX idx_collections_status ON billing_collections(status);
```

### 1.13 Credit Management

**Table: `billing_credit_memos`**
```sql
CREATE TABLE billing_credit_memos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  credit_memo_number VARCHAR(50) NOT NULL,

  account_id UUID NOT NULL REFERENCES billing_patient_accounts(id),
  patient_id TEXT NOT NULL,

  original_invoice_id UUID REFERENCES billing_invoices(id),

  credit_date DATE NOT NULL,
  credit_amount DECIMAL(10,2) NOT NULL,

  reason VARCHAR(100) NOT NULL,
  description TEXT,

  status VARCHAR(20) NOT NULL CHECK (status IN
    ('draft', 'issued', 'applied', 'void')),

  applied_amount DECIMAL(10,2) DEFAULT 0.00,
  remaining_amount DECIMAL(10,2) NOT NULL,

  issued_by UUID REFERENCES users(id),
  issued_at TIMESTAMP,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(org_id, credit_memo_number)
);

CREATE INDEX idx_credit_memos_account ON billing_credit_memos(account_id);
CREATE INDEX idx_credit_memos_status ON billing_credit_memos(status);
```

### 1.14 Payment Gateway Integration

**Table: `billing_payment_gateways`**
```sql
CREATE TABLE billing_payment_gateways (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id),

  gateway_name VARCHAR(50) NOT NULL,
  gateway_provider VARCHAR(30) NOT NULL CHECK (gateway_provider IN
    ('stripe', 'sepay', 'square', 'paypal', 'authorize_net', 'braintree')),

  api_key_encrypted TEXT NOT NULL,
  api_secret_encrypted TEXT,
  merchant_id TEXT,

  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,

  supported_methods TEXT[], -- ['credit_card', 'debit_card', 'ach', 'digital_wallet']

  test_mode BOOLEAN DEFAULT TRUE,

  configuration JSONB DEFAULT '{}',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_payment_gateways_org ON billing_payment_gateways(org_id);
```

---

## 2. Workflow Architecture

### 2.1 Patient Registration to Billing Workflow

```
┌─────────────────────┐
│ Patient Registration│
│  - Demographics      │
│  - Insurance Info    │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ Create Patient      │
│   Account           │
│  - Account Number   │
│  - Credit Limit     │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ Eligibility Check   │
│  - Verify Insurance │
│  - Coverage Details │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ Service Encounter   │
│  - Medical Services │
│  - Procedures       │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ Charge Capture      │
│  - CPT Codes        │
│  - Fee Schedule     │
└──────────┬──────────┘
           │
           ├─────────────────────┐
           ↓                     ↓
   ┌──────────────┐     ┌──────────────┐
   │ Insurance    │     │ Patient      │
   │ Claim        │     │ Invoice      │
   │ Generation   │     │ Generation   │
   └──────┬───────┘     └──────┬───────┘
          │                    │
          ↓                    ↓
   ┌──────────────┐     ┌──────────────┐
   │ Submit to    │     │ Send to      │
   │ ClaimMD/     │     │ Patient      │
   │ Payer        │     │ (Email/Mail/ │
   └──────┬───────┘     │  Portal)     │
          │             └──────┬───────┘
          ↓                    │
   ┌──────────────┐           │
   │ ERA/EOB      │           │
   │ Processing   │           │
   └──────┬───────┘           │
          │                   │
          ↓                   ↓
   ┌─────────────────────────────┐
   │    Payment Posting          │
   │   - Insurance Payment       │
   │   - Patient Payment         │
   └──────────┬──────────────────┘
              │
              ↓
   ┌─────────────────────────────┐
   │    Payment Allocation        │
   │   - Apply to Invoices        │
   │   - Update Account Balance   │
   └──────────┬──────────────────┘
              │
              ↓
   ┌─────────────────────────────┐
   │    Accounting Entry         │
   │   - Journal Entry (DR/CR)   │
   │   - Update GL Accounts      │
   └──────────┬──────────────────┘
              │
              ↓
   ┌─────────────────────────────┐
   │    Reconciliation           │
   │   - Bank Reconciliation     │
   │   - A/R Reconciliation      │
   └─────────────────────────────┘
```

### 2.2 Payment Processing Workflow

```
┌──────────────────────────────┐
│   Payment Received           │
│   - Cash/Check/Card/Online   │
└──────────────┬───────────────┘
               │
               ↓
    ┌──────────────────┐
    │ Is it Online?    │
    └─────┬───────┬────┘
          │ Yes   │ No
          ↓       ↓
  ┌───────────────┐   ┌──────────────┐
  │ Gateway       │   │ Manual Entry │
  │ Processing    │   │ by Staff     │
  └───────┬───────┘   └──────┬───────┘
          │                  │
          └──────────┬───────┘
                     ↓
         ┌──────────────────────┐
         │ Create Payment       │
         │ Record               │
         │  - Amount            │
         │  - Method            │
         │  - Reference         │
         └──────────┬───────────┘
                    │
                    ↓
         ┌──────────────────────┐
         │ Payment Validation   │
         │  - Sufficient Amount │
         │  - Account Active    │
         └──────────┬───────────┘
                    │
                    ↓
         ┌──────────────────────┐
         │ Payment Allocation   │
         │  - Select Invoices   │
         │  - Apply Amounts     │
         │  - Update Balances   │
         └──────────┬───────────┘
                    │
                    ↓
         ┌──────────────────────┐
         │ Generate Receipt     │
         │  - Receipt Number    │
         │  - Email/Print       │
         └──────────┬───────────┘
                    │
                    ↓
         ┌──────────────────────┐
         │ Accounting Entry     │
         │  DR: Cash/Bank       │
         │  CR: A/R             │
         └──────────┬───────────┘
                    │
                    ↓
         ┌──────────────────────┐
         │ Add to Bank Deposit  │
         │  - Group by Date     │
         │  - Group by Method   │
         └──────────────────────┘
```

### 2.3 Invoicing Workflow

```
┌──────────────────────────────┐
│ Trigger Invoice Generation   │
│  - Encounter Closed          │
│  - Manual Request            │
│  - Scheduled Billing Run     │
└──────────────┬───────────────┘
               │
               ↓
    ┌──────────────────────┐
    │ Gather Charges       │
    │  - Encounter Charges │
    │  - Unbilled Claims   │
    │  - Outstanding Items │
    └──────────┬───────────┘
               │
               ↓
    ┌──────────────────────┐
    │ Apply Fee Schedule   │
    │  - Lookup Payer      │
    │  - Get CPT Rates     │
    │  - Calculate Amounts │
    └──────────┬───────────┘
               │
               ↓
    ┌──────────────────────┐
    │ Insurance vs         │
    │ Patient Split        │
    └──────┬──────┬────────┘
           │ Ins  │ Patient
           ↓      ↓
  ┌────────────┐  ┌────────────┐
  │ Insurance  │  │ Patient    │
  │ Claim      │  │ Invoice    │
  └─────┬──────┘  └─────┬──────┘
        │               │
        └───────┬───────┘
                ↓
    ┌──────────────────────┐
    │ Generate Invoice     │
    │  - Invoice Number    │
    │  - Line Items        │
    │  - Totals            │
    └──────────┬───────────┘
               │
               ↓
    ┌──────────────────────┐
    │ Create Transaction   │
    │ in Patient Account   │
    │  Type: Charge        │
    └──────────┬───────────┘
               │
               ↓
    ┌──────────────────────┐
    │ Accounting Entry     │
    │  DR: A/R             │
    │  CR: Revenue         │
    └──────────┬───────────┘
               │
               ↓
    ┌──────────────────────┐
    │ Delivery              │
    │  - Email             │
    │  - Patient Portal    │
    │  - Print/Mail        │
    └──────────────────────┘
```

---

## 3. Billing Processes

### 3.1 Charge Capture Process

**Steps:**
1. **Service Delivery** - Clinical encounter completed
2. **Code Assignment** - Provider assigns CPT/ICD codes
3. **Fee Lookup** - System retrieves fee schedule rates
4. **Charge Creation** - Generate charge record
5. **Validation** - Validate codes, modifiers, medical necessity
6. **Submission** - Add to billing queue

**Business Rules:**
- Charges must be created within 24 hours of service
- CPT codes must be valid and active
- ICD codes must support medical necessity
- Fee schedule rates applied based on payer type
- Charges require provider signature/approval

### 3.2 Claims Submission Process

**Steps:**
1. **Claim Assembly** - Gather all charges for encounter
2. **Eligibility Verification** - Verify active coverage
3. **Prior Auth Check** - Validate prior authorization if required
4. **Claim Scrubbing** - Validate 837 format, edits
5. **ClaimMD Submission** - Submit via API
6. **Acknowledgment** - Receive submission confirmation
7. **Status Tracking** - Monitor claim status

**Business Rules:**
- Claims submitted within filing limit (typically 90-365 days)
- All required fields populated
- ICD codes link to CPT codes
- Duplicate claim check
- Clean claim rate target: >95%

### 3.3 Payment Posting Process

**Insurance Payments (ERA):**
1. **ERA Receipt** - Receive 835 file from ClaimMD/payer
2. **ERA Parsing** - Parse remittance details
3. **Auto-Posting** - Match payments to claims
4. **Adjustment Posting** - Post contractual adjustments
5. **Patient Responsibility** - Calculate patient balance
6. **Accounting Entry** - DR: Cash, CR: A/R

**Patient Payments:**
1. **Payment Receipt** - Accept payment (cash/card/check/online)
2. **Payment Recording** - Create payment record
3. **Invoice Selection** - Select invoices to pay
4. **Payment Allocation** - Allocate to specific invoices
5. **Receipt Generation** - Generate payment receipt
6. **Accounting Entry** - DR: Cash, CR: A/R

### 3.4 Statement Generation Process

**Monthly Statement Cycle:**
1. **Statement Run Date** - Last day of month
2. **Account Selection** - Select accounts with balances
3. **Aging Calculation** - Calculate 0-30, 31-60, 61-90, 90+
4. **Statement Generation** - Create PDF statement
5. **Delivery** - Email or mail statement
6. **Follow-up Schedule** - Set follow-up reminders

**Statement Content:**
- Account summary
- Previous balance
- New charges
- Payments received
- Current balance
- Aging buckets
- Payment instructions

### 3.5 Refund Process

**Steps:**
1. **Refund Request** - Identify overpayment
2. **Verification** - Verify overpayment amount
3. **Approval** - Manager approval required (>$100)
4. **Refund Processing** - Issue check/ACH/card reversal
5. **Accounting Entry** - DR: A/R, CR: Cash
6. **Notification** - Notify patient

**Business Rules:**
- Refunds >$100 require approval
- Refund within 30 days of overpayment detection
- Refund method matches original payment method when possible
- Credit card refunds process through gateway

### 3.6 Write-off Process

**Types:**
- **Contractual Adjustment** - Payer contract discount
- **Courtesy Discount** - Provider courtesy
- **Bad Debt** - Uncollectible after collection efforts
- **Coding Correction** - Correcting billing error

**Approval Levels:**
- <$50: Billing staff
- $50-$500: Billing manager
- >$500: CFO approval

---

## 4. Use Cases

### UC1: Patient Self-Service Payment

**Actor:** Patient
**Goal:** Pay outstanding balance online

**Flow:**
1. Patient logs into patient portal
2. Views account summary and outstanding invoices
3. Selects invoices to pay
4. Enters payment method (card/ACH)
5. Reviews payment summary
6. Confirms payment
7. Gateway processes payment
8. System posts payment, allocates to invoices
9. Generates receipt
10. Sends confirmation email

**Outcome:** Payment posted, invoices updated, receipt generated

### UC2: Insurance Claim Submission

**Actor:** Billing specialist
**Goal:** Submit insurance claim

**Flow:**
1. Navigate to billing queue
2. Select unbilled encounters
3. Review charges and codes
4. Verify eligibility
5. Check prior authorization
6. Generate claim (837)
7. Submit to ClaimMD
8. Receive submission confirmation
9. Track claim status

**Outcome:** Claim submitted, status tracked

### UC3: ERA Payment Posting

**Actor:** Billing specialist (automated)
**Goal:** Post insurance payments from ERA

**Flow:**
1. ERA file received from ClaimMD webhook
2. System parses 835 data
3. Matches remittance lines to claims
4. Posts payments to claims
5. Posts contractual adjustments
6. Updates patient responsibility
7. Creates accounting entries
8. Sends notification if issues found

**Outcome:** Insurance payments posted, adjustments applied

### UC4: Patient Statement Generation

**Actor:** Billing manager
**Goal:** Generate monthly patient statements

**Flow:**
1. Run statement batch process
2. System selects accounts with balances >$0
3. Calculates aging for each account
4. Generates PDF statements
5. Emails statements (if email on file)
6. Prints statements for mailing (if no email)
7. Updates last_statement_date
8. Creates follow-up tasks

**Outcome:** Statements sent to patients

### UC5: Payment Plan Setup

**Actor:** Financial counselor
**Goal:** Setup payment plan for patient

**Flow:**
1. Review patient account balance
2. Discuss payment options with patient
3. Calculate payment plan terms
4. Create payment plan record
5. Generate installment schedule
6. Setup auto-pay (optional)
7. Patient signs agreement
8. First payment processed
9. Schedule automatic reminders

**Outcome:** Payment plan active, installments scheduled

### UC6: Refund Processing

**Actor:** Billing specialist
**Goal:** Process patient refund

**Flow:**
1. Identify overpayment
2. Calculate refund amount
3. Create refund request
4. Route for approval (if >$100)
5. Manager approves refund
6. Process refund (check/ACH/card reversal)
7. Create accounting entry
8. Update patient account
9. Send refund notification

**Outcome:** Refund issued, account updated

### UC7: Bank Reconciliation

**Actor:** Accounting specialist
**Goal:** Reconcile bank account

**Flow:**
1. Create new reconciliation
2. Import bank statement
3. Match deposits to bank deposits
4. Match payments to withdrawals
5. Identify outstanding items
6. Record bank fees/adjustments
7. Verify balanced
8. Mark reconciliation complete
9. Generate reconciliation report

**Outcome:** Bank account reconciled

### UC8: Financial Reporting

**Actor:** CFO
**Goal:** Generate monthly financial reports

**Flow:**
1. Navigate to financial reports
2. Select report type (Income Statement/Balance Sheet/Cash Flow)
3. Set date range (monthly)
4. Select cost centers (optional)
5. Generate report
6. Review revenue, expenses, net income
7. Analyze variances vs budget
8. Export to PDF/Excel
9. Distribute to stakeholders

**Outcome:** Financial reports generated and distributed

---

## 5. Settings & Configuration

### 5.1 Organization Settings

**Billing Configuration:**
```json
{
  "billing_settings": {
    "default_payment_terms": "Net 30",
    "late_payment_fee_percent": 1.5,
    "minimum_invoice_amount": 10.00,
    "auto_generate_invoices": true,
    "invoice_delivery_method": ["email", "portal"],
    "statement_frequency": "monthly",
    "statement_day": 1,
    "collections_threshold_days": 120,
    "write_off_threshold": 10.00
  }
}
```

**Payment Gateway Configuration:**
```json
{
  "payment_gateways": [
    {
      "provider": "stripe",
      "is_default": true,
      "methods": ["credit_card", "debit_card", "ach"],
      "test_mode": false
    },
    {
      "provider": "sepay",
      "methods": ["bank_transfer", "qr_code"],
      "is_active": true
    }
  ]
}
```

### 5.2 Fee Schedule Management

**Fee Schedule Configuration:**
- Multiple fee schedules per organization
- Payer-specific fee schedules
- Default organizational fee schedule
- Effective date ranges
- CPT code-level pricing
- Modifier-based adjustments

**Example:**
```
Medicare Fee Schedule 2025
- CPT 99213: $75.00
- CPT 99214: $110.00
- CPT 99215: $145.00

Private Insurance Fee Schedule
- CPT 99213: $120.00
- CPT 99214: $165.00
- CPT 99215: $210.00
```

### 5.3 Payment Terms & Policies

**Payment Plan Policies:**
- Minimum down payment: 20%
- Maximum plan duration: 24 months
- Interest rate: 0% (promotional) or 5% APR
- Auto-pay discount: 5%
- Late fee: $25 or 5%, whichever is greater
- Missed payment grace period: 10 days

### 5.4 User Permissions

**Billing Roles:**
- **Billing Clerk**: Create invoices, post payments, view reports
- **Billing Manager**: All clerk permissions + adjustments <$500, refunds, write-offs
- **CFO**: All permissions + adjustments >$500, financial reports
- **Accounting Staff**: Post payments, bank reconciliation, GL management

### 5.5 Automated Workflows

**Auto-Billing Rules:**
- Auto-generate invoices when encounter closed
- Auto-send statements monthly
- Auto-apply payments from ERA
- Auto-send payment reminders (7, 14, 30, 60, 90 days overdue)
- Auto-flag accounts for collections (>120 days)

---

## 6. Reconciliation

### 6.1 Bank Reconciliation Process

**Daily Cash Reconciliation:**
1. Daily deposit summary prepared
2. Match deposits to bank statement
3. Identify discrepancies
4. Resolve variances
5. Post adjustments if needed

**Monthly Bank Reconciliation:**
1. Import bank statement
2. Match deposits and withdrawals
3. Identify outstanding checks
4. Identify deposits in transit
5. Record bank fees and interest
6. Verify balanced (book balance = statement balance ± reconciling items)
7. Generate reconciliation report

**Reconciliation Formula:**
```
Book Balance + Deposits in Transit - Outstanding Checks ± Bank Adjustments = Bank Statement Balance
```

### 6.2 Accounts Receivable Reconciliation

**Monthly A/R Reconciliation:**
1. A/R aging report
2. Match to GL A/R account balance
3. Identify discrepancies
4. Review unapplied payments
5. Review unapplied credits
6. Post adjustments
7. Verify balanced

**Key Metrics:**
- Days Sales Outstanding (DSO)
- Collection Rate
- Bad Debt Percentage
- Aging distribution

### 6.3 Payer Reconciliation

**Insurance Payer Reconciliation:**
1. Pull claims submitted by payer
2. Match to remittances received
3. Identify unpaid claims (>30 days)
4. Review denied/rejected claims
5. Resubmit or appeal as needed
6. Track claim aging

---

## 7. Invoicing

### 7.1 Invoice Generation

**Triggers:**
- Encounter closed
- Manual generation by staff
- Scheduled billing run (daily/weekly)
- On-demand patient request

**Invoice Components:**
- Header: Patient info, invoice number, dates
- Line Items: Service date, description, CPT code, quantity, unit price, total
- Summary: Subtotal, adjustments, tax, total, amount paid, amount due
- Footer: Payment instructions, terms, contact info

### 7.2 Invoice Templates

**Templates by Type:**
- **Patient Invoice**: Itemized services with patient-friendly descriptions
- **Detailed Invoice**: Complete breakdown with codes
- **Summary Invoice**: High-level summary for portal
- **Institutional Invoice**: UB-04 format for facility billing

### 7.3 Invoice Delivery

**Delivery Methods:**
- **Email**: PDF attachment
- **Patient Portal**: View and download
- **Print/Mail**: Physical mail for patients without email
- **SMS**: Text notification with portal link

### 7.4 Invoice Status Tracking

**Status Workflow:**
```
Draft → Sent → Viewed → Partial → Paid
                 ↓
              Overdue → Collections → Written Off
```

---

## 8. Payment Capture

### 8.1 Payment Methods

**Supported Methods:**
1. **Cash**: In-person, recorded in POS
2. **Check**: Manual entry, deposited
3. **Credit Card**: Terminal or online via Stripe
4. **Debit Card**: Terminal or online via Stripe
5. **ACH/Bank Transfer**: Online via Stripe or SePay
6. **Wire Transfer**: Manual posting
7. **Online Payment**: Patient portal via gateway
8. **Mobile Payment**: Apple Pay, Google Pay
9. **Payment Plan**: Automatic installment

### 8.2 Payment Gateway Integration

**Stripe Integration:**
```javascript
// Create payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: amountInCents,
  currency: 'usd',
  customer: stripeCustomerId,
  metadata: {
    patient_id: patientId,
    invoice_ids: invoiceIds.join(','),
    org_id: orgId
  }
});

// Webhook handling
app.post('/webhooks/stripe', async (req, res) => {
  const event = stripe.webhooks.constructEvent(
    req.body, req.headers['stripe-signature'], webhookSecret
  );

  if (event.type === 'payment_intent.succeeded') {
    await paymentService.processSuccessfulPayment(event.data.object);
  }
});
```

**SePay Integration (Vietnam):**
- VietQR payment
- Bank transfer
- QR code generation
- Webhook for payment confirmation

### 8.3 Payment Processing Flow

**Online Payment Flow:**
1. Patient selects invoices to pay
2. Enters payment amount
3. Selects payment method
4. Gateway processes payment
5. System receives webhook confirmation
6. Create payment record
7. Allocate to invoices
8. Update account balance
9. Create accounting entry
10. Generate receipt
11. Send confirmation email

**In-Person Payment Flow:**
1. Staff navigates to patient account
2. Selects "Record Payment"
3. Enters payment amount and method
4. Processes card (if card payment)
5. Allocates to invoices
6. Prints receipt
7. Adds to daily deposit
8. Posts accounting entry

### 8.4 Receipt Generation

**Receipt Content:**
- Receipt number
- Payment date and time
- Patient name and account number
- Payment amount
- Payment method
- Invoices paid (with amounts allocated)
- Remaining balance
- Payment confirmation number (if online)

---

## 9. Implementation Phases

### Phase 1: Foundation (Weeks 1-3)

**Database:**
- Create all accounting and billing tables
- Setup chart of accounts structure
- Seed default accounts
- Create indexes and constraints

**Backend Services:**
- Patient account service
- Invoice service
- Payment service
- Transaction service

**API Endpoints:**
- Patient accounts CRUD
- Invoice generation
- Payment recording
- Transaction history

**Deliverable:** Core accounting and billing database structure, basic services

---

### Phase 2: Patient Billing (Weeks 4-6)

**Features:**
- Invoice generation from encounters
- Patient invoice templates
- Invoice delivery (email, portal)
- Payment recording (manual)
- Payment allocation
- Receipt generation

**Backend:**
- Invoice generation service
- PDF generation service
- Email delivery service
- Payment allocation logic

**Frontend:**
- Invoice list and detail pages
- Payment recording form
- Receipt viewer
- Transaction history

**Deliverable:** Complete patient invoicing workflow

---

### Phase 3: Payment Gateway Integration (Weeks 7-9)

**Integration:**
- Stripe integration (cards, ACH)
- SePay integration (VietQR, bank transfer)
- Webhook handlers
- Payment status tracking

**Features:**
- Online payment page
- Patient portal payment
- Payment method management
- Failed payment handling
- Refund processing via gateway

**Frontend:**
- Payment widget
- Payment method selector
- Payment confirmation page
- Payment history

**Deliverable:** Live online payment processing

---

### Phase 4: Accounting & GL (Weeks 10-12)

**Features:**
- Chart of accounts management
- Journal entry creation (manual and automated)
- General ledger maintenance
- Cost center setup
- Budget management

**Automation:**
- Auto-generate journal entries for:
  - Patient charges (DR: A/R, CR: Revenue)
  - Payments (DR: Cash, CR: A/R)
  - Adjustments (DR: Adjustments, CR: A/R)
  - Write-offs (DR: Bad Debt, CR: A/R)

**Frontend:**
- Chart of accounts UI
- Journal entry form
- GL account ledger
- Cost center management

**Deliverable:** Full general ledger accounting system

---

### Phase 5: Payment Plans & Collections (Weeks 13-15)

**Features:**
- Payment plan setup
- Installment scheduling
- Auto-pay configuration
- Payment reminders
- Late fees
- Collections tracking

**Backend:**
- Payment plan service
- Installment scheduler
- Auto-pay processor (cron job)
- Collection agency interface

**Frontend:**
- Payment plan wizard
- Installment calendar
- Collections dashboard

**Deliverable:** Payment plan and collections management

---

### Phase 6: Reconciliation (Weeks 16-18)

**Features:**
- Bank reconciliation
- Daily deposit tracking
- Bank statement import
- Outstanding items tracking
- Reconciliation reports
- A/R reconciliation

**Backend:**
- Bank reconciliation service
- Statement parser
- Matching algorithm

**Frontend:**
- Reconciliation workspace
- Deposit management
- Outstanding items list

**Deliverable:** Complete reconciliation system

---

### Phase 7: Financial Reporting (Weeks 19-21)

**Reports:**
- Income Statement (P&L)
- Balance Sheet
- Cash Flow Statement
- A/R Aging Report
- Revenue by Service Report
- Payer Mix Report
- Collection Rate Report
- Budget vs Actual Report

**Backend:**
- Report generation service
- Data aggregation queries
- Export to PDF/Excel

**Frontend:**
- Report dashboard
- Report viewer
- Export functionality

**Deliverable:** Comprehensive financial reporting

---

### Phase 8: Advanced Features (Weeks 22-24)

**Features:**
- Credit memo management
- Bulk payment posting
- Automated statement runs
- Dunning letters
- Bad debt write-off workflow
- Multi-currency support
- Tax management
- Advanced reconciliation

**Optimization:**
- Performance tuning
- Query optimization
- Caching strategy
- Audit log cleanup

**Deliverable:** Production-ready billing system

---

## 10. Technical Architecture

### 10.1 Services Layer

```javascript
// services/billing/patient-account.service.js
class PatientAccountService {
  async createAccount(orgId, patientId, guarantorInfo)
  async getAccount(accountId)
  async updateBalance(accountId, amount, transactionType)
  async calculateAging(accountId)
  async getTransactionHistory(accountId, filters)
  async suspendAccount(accountId, reason)
}

// services/billing/invoice.service.js
class InvoiceService {
  async generateInvoice(encounterId, invoiceType)
  async sendInvoice(invoiceId, deliveryMethod)
  async applyPayment(invoiceId, paymentId, amount)
  async voidInvoice(invoiceId, reason)
  async getInvoicesPDF(invoiceIds)
}

// services/billing/payment.service.js
class PaymentService {
  async recordPayment(paymentData)
  async allocatePayment(paymentId, allocations)
  async processOnlinePayment(paymentIntent)
  async refundPayment(paymentId, amount, reason)
  async voidPayment(paymentId, reason)
}

// services/accounting/journal-entry.service.js
class JournalEntryService {
  async createEntry(entryData, lines)
  async postEntry(entryId, userId)
  async voidEntry(entryId, reason)
  async getAccountBalance(accountId, date)
  async getGeneralLedger(accountId, dateRange)
}

// services/billing/reconciliation.service.js
class ReconciliationService {
  async createBankReconciliation(bankAccountId, periodEnd)
  async matchTransactions(reconciliationId)
  async addReconciliationItem(reconciliationId, itemData)
  async completeReconciliation(reconciliationId)
}
```

### 10.2 API Routes

```javascript
// routes/billing/patient-accounts.js
router.get('/', getPatientAccounts);
router.post('/', createPatientAccount);
router.get('/:accountId', getPatientAccount);
router.put('/:accountId', updatePatientAccount);
router.get('/:accountId/transactions', getAccountTransactions);
router.get('/:accountId/aging', getAccountAging);

// routes/billing/invoices.js
router.get('/', getInvoices);
router.post('/', createInvoice);
router.get('/:invoiceId', getInvoice);
router.put('/:invoiceId', updateInvoice);
router.post('/:invoiceId/send', sendInvoice);
router.post('/:invoiceId/void', voidInvoice);
router.get('/:invoiceId/pdf', getInvoicePDF);

// routes/billing/payments.js
router.get('/', getPayments);
router.post('/', recordPayment);
router.post('/online', initiateOnlinePayment);
router.post('/webhooks/stripe', stripeWebhook);
router.post('/webhooks/sepay', sepayWebhook);
router.get('/:paymentId', getPayment);
router.post('/:paymentId/allocate', allocatePayment);
router.post('/:paymentId/refund', refundPayment);
router.get('/:paymentId/receipt', getReceipt);

// routes/accounting/journal-entries.js
router.get('/', getJournalEntries);
router.post('/', createJournalEntry);
router.get('/:entryId', getJournalEntry);
router.put('/:entryId', updateJournalEntry);
router.post('/:entryId/post', postJournalEntry);
router.post('/:entryId/void', voidJournalEntry);

// routes/accounting/chart-of-accounts.js
router.get('/', getChartOfAccounts);
router.post('/', createAccount);
router.get('/:accountId', getAccount);
router.put('/:accountId', updateAccount);
router.get('/:accountId/ledger', getAccountLedger);
router.get('/:accountId/balance', getAccountBalance);
```

### 10.3 Frontend Structure

```
ehr-web/src/app/
├── billing/
│   ├── patient-accounts/
│   │   ├── page.tsx                    # List view
│   │   ├── [accountId]/
│   │   │   ├── page.tsx                # Detail view
│   │   │   ├── transactions/page.tsx   # Transaction history
│   │   │   └── statements/page.tsx     # Statement history
│   │   └── new/page.tsx                # Create account
│   │
│   ├── invoices/
│   │   ├── page.tsx                    # List view
│   │   ├── [invoiceId]/
│   │   │   ├── page.tsx                # Detail view
│   │   │   └── pdf/page.tsx            # PDF viewer
│   │   └── generate/page.tsx           # Generate invoice
│   │
│   ├── payments/
│   │   ├── page.tsx                    # List view
│   │   ├── [paymentId]/page.tsx        # Detail view
│   │   ├── record/page.tsx             # Manual payment entry
│   │   └── online/page.tsx             # Online payment page
│   │
│   ├── payment-plans/
│   │   ├── page.tsx                    # List view
│   │   ├── [planId]/page.tsx           # Detail view
│   │   └── setup/page.tsx              # Setup wizard
│   │
│   └── reports/
│       ├── aging/page.tsx              # A/R aging
│       ├── revenue/page.tsx            # Revenue reports
│       └── collections/page.tsx        # Collections report
│
├── accounting/
│   ├── chart-of-accounts/
│   │   ├── page.tsx                    # List view
│   │   └── [accountId]/page.tsx        # Account ledger
│   │
│   ├── journal-entries/
│   │   ├── page.tsx                    # List view
│   │   ├── [entryId]/page.tsx          # Detail view
│   │   └── new/page.tsx                # Create entry
│   │
│   ├── reconciliation/
│   │   ├── bank/page.tsx               # Bank reconciliation
│   │   └── [reconciliationId]/page.tsx # Reconciliation detail
│   │
│   └── reports/
│       ├── income-statement/page.tsx   # P&L
│       ├── balance-sheet/page.tsx      # Balance sheet
│       └── cash-flow/page.tsx          # Cash flow statement
│
└── portal/
    └── billing/
        ├── page.tsx                    # Account summary
        ├── invoices/page.tsx           # View invoices
        ├── payments/page.tsx           # Make payment
        └── payment-plans/page.tsx      # View payment plan
```

### 10.4 Database Indexes Strategy

**Critical Indexes:**
- Patient account lookups by patient_id
- Invoice lookups by account_id, status, due_date
- Payment lookups by account_id, date, status
- Transaction lookups by account_id, date
- Journal entry lookups by org_id, fiscal_period, status
- Aging calculations by account_id, transaction_date

**Composite Indexes:**
```sql
CREATE INDEX idx_invoices_account_status ON billing_invoices(account_id, status);
CREATE INDEX idx_payments_account_date ON billing_payments(account_id, payment_date DESC);
CREATE INDEX idx_transactions_account_date_type ON billing_patient_transactions(account_id, transaction_date DESC, transaction_type);
CREATE INDEX idx_journal_lines_account_date ON accounting_journal_lines(account_id, created_at DESC);
```

### 10.5 Caching Strategy

**Redis Caching:**
- Account balances (TTL: 5 minutes)
- Invoice summaries (TTL: 10 minutes)
- Fee schedules (TTL: 1 hour)
- Chart of accounts (TTL: 1 hour)
- Payment gateway tokens (TTL: 24 hours)

**Cache Invalidation:**
- On payment posting: Invalidate account balance, invoice status
- On invoice generation: Invalidate account summary
- On adjustment posting: Invalidate account balance
- On fee schedule update: Invalidate fee schedule cache

### 10.6 Background Jobs

**Scheduled Jobs (Cron):**
```javascript
// Daily jobs
- 00:00: Generate daily financial summary
- 01:00: Process payment plan installments
- 02:00: Update aging buckets
- 03:00: Send payment reminders
- 04:00: Generate daily deposit report

// Weekly jobs
- Monday 00:00: Generate A/R aging report
- Friday 00:00: Generate weekly revenue report

// Monthly jobs
- 1st of month: Generate patient statements
- 1st of month: Close previous month accounting period
- 5th of month: Send overdue notices
```

---

## Success Metrics

**Financial Metrics:**
- Days Sales Outstanding (DSO): Target <40 days
- Collection Rate: Target >95%
- Clean Claim Rate: Target >95%
- Bad Debt Write-off: Target <2%
- Payment Plan Default Rate: Target <10%

**Operational Metrics:**
- Average time to generate invoice: <5 minutes
- Payment posting time: <2 minutes per payment
- Reconciliation completion time: <2 hours per month
- Statement generation time: <10 seconds per statement

**User Satisfaction:**
- Patient payment experience: >4.0/5.0
- Staff efficiency improvement: >30%
- Billing error reduction: >50%

---

## Unresolved Questions

1. Multi-currency support priority for international hospitals?
2. Tax calculation integration requirements?
3. Credit card PCI compliance - use hosted pages or direct integration?
4. Bad debt collection agency API integration requirements?
5. Historical data migration strategy from existing billing systems?
6. Payment plan interest calculation - simple vs compound interest?
7. Statement delivery preferences - email vs mail default by patient demographics?
8. Refund approval workflow - single approver or multi-level based on amount?
9. Integration with existing payroll system for commission calculations?
10. Support for insurance secondary/tertiary claims workflow?

---

## Appendix

### A. Standard Chart of Accounts Template

**Assets (1000-1999)**
- 1000: Cash - Operating Account
- 1010: Cash - Payroll Account
- 1020: Petty Cash
- 1100: Accounts Receivable - Patients
- 1110: Accounts Receivable - Insurance
- 1120: Allowance for Doubtful Accounts
- 1200: Medical Supplies Inventory
- 1210: Pharmaceutical Inventory
- 1300: Prepaid Insurance
- 1310: Prepaid Rent
- 1400: Medical Equipment
- 1410: Accumulated Depreciation - Equipment
- 1500: Buildings
- 1510: Accumulated Depreciation - Buildings

**Liabilities (2000-2999)**
- 2000: Accounts Payable
- 2100: Accrued Salaries
- 2110: Accrued Payroll Taxes
- 2200: Short-term Notes Payable
- 2300: Long-term Debt

**Equity (3000-3999)**
- 3000: Owner's Capital
- 3100: Retained Earnings
- 3200: Current Year Earnings

**Revenue (4000-4999)**
- 4000: Patient Service Revenue - Inpatient
- 4010: Patient Service Revenue - Outpatient
- 4020: Patient Service Revenue - Emergency
- 4100: Insurance Revenue - Commercial
- 4110: Insurance Revenue - Medicare
- 4120: Insurance Revenue - Medicaid
- 4200: Other Operating Revenue
- 4900: Contractual Adjustments (contra-revenue)

**Expenses (5000-9999)**
- 5000: Salaries - Physicians
- 5100: Salaries - Nurses
- 5200: Salaries - Administrative
- 5300: Employee Benefits
- 5400: Payroll Taxes
- 6000: Medical Supplies Expense
- 6100: Pharmaceutical Expense
- 6200: Laboratory Expense
- 6300: Radiology Expense
- 7000: Rent Expense
- 7100: Utilities Expense
- 7200: Insurance Expense
- 7300: Depreciation Expense
- 8000: Marketing Expense
- 8100: Professional Fees
- 9000: Bad Debt Expense
- 9100: Interest Expense

---

**End of Plan**
