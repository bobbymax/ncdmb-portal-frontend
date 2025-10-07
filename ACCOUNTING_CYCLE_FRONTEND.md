# 📊 Accounting Cycle - Frontend Implementation Guide

## Overview

This document explains the frontend TypeScript implementation for the complete accounting cycle system integrated with ProcessCards.

---

## 🎨 UI Components

### ProcessCard Configuration Form

**Location**: `src/resources/views/crud/ProcessCard.tsx`

Complete configuration interface with 8 sections:

1. **Basic Information**: Document Type, Ledger, Service, Name, Component
2. **Financial Settings**: Currency, Transaction Type, Book Type, etc.
3. **Access & Permissions**: Permission levels, visibility, group access
4. **Approval Settings**: Approval carder, dual approval requirements
5. **Settlement & Processing**: Auto-settlement, settlement stage, reversal rules
6. **Double Entry & Posting**: Chart of accounts mapping, posting priority
7. **Reconciliation & Validation**: Reconciliation frequency, validation rules
8. **Audit & Compliance**: Audit trail level, data retention

---

## 📦 Data Types

### Core Interfaces

#### ProcessCardRulesProps

```typescript
export type ProcessCardRulesProps = {
  // Financial & Transaction
  currency: CurrencyTypes;
  transaction: TransactionTypes;
  book_type: BookType;
  generate_transactions: boolean;
  post_to_journal: boolean;

  // Access & Permissions
  permission: PermissionTypes;
  visibility: VisibilityTypes;
  group_id: number;
  can_query: boolean;

  // Approval & Authorization
  requires_approval: boolean;
  approval_carder_id: number;

  // Settlement & Processing
  settle: boolean;
  settle_after_approval: boolean;
  auto_settle_fund: boolean;

  // Chart of Accounts Mapping
  default_debit_account_id?: number;
  default_credit_account_id?: number;

  // Posting & Journal Rules
  create_contra_entries: boolean;
  posting_priority: "immediate" | "batch" | "scheduled";
  settlement_stage: "on-approval" | "on-payment" | "on-posting" | "manual";

  // Balance & Reconciliation
  update_trial_balance: boolean;
  require_reconciliation: boolean;
  reconciliation_frequency: "daily" | "weekly" | "monthly" | "quarterly";

  // Reversal & Audit
  reverse_on_rejection: boolean;
  require_dual_approval: boolean;
  audit_trail_level: "basic" | "detailed" | "comprehensive";

  // AI & Automation
  ai_analysis: boolean;
  retain_history_days: number;
};
```

#### New Repository Data Types

```typescript
// LedgerAccountBalance
interface LedgerAccountBalanceResponseData {
  chart_of_account_id: number;
  ledger_id: number;
  period: string; // "2025-10"
  total_debits: number;
  total_credits: number;
  closing_balance: number;
}

// TrialBalance
interface TrialBalanceResponseData {
  department_id: number;
  period: string;
  total_debits: number;
  total_credits: number;
  variance: number;
  is_balanced: boolean;
}

// FundTransaction
interface FundTransactionResponseData {
  fund_id: number;
  transaction_type: string;
  movement: "debit" | "credit";
  amount: number;
  balance_before: number;
  balance_after: number;
}

// Reconciliation
interface ReconciliationResponseData {
  fund_id: number;
  system_balance: number;
  actual_balance: number;
  variance: number;
  status: "reconciled" | "discrepancy";
}
```

---

## 🔄 Frontend Usage

### Creating a ProcessCard

```typescript
import ProcessCardRepository from "app/Repositories/ProcessCard/ProcessCardRepository";

const repository = new ProcessCardRepository();

const newProcessCard = {
  document_type_id: 1,
  ledger_id: 2,
  service: "payment",
  name: "Staff Payment Processor",
  component: "PaymentProcessor",
  rules: {
    currency: "NGN",
    transaction: "debit",
    book_type: "journal",
    generate_transactions: true,
    post_to_journal: true,
    create_contra_entries: true,
    settle: true,
    auto_settle_fund: true,
    settlement_stage: "on-payment",
    posting_priority: "batch",
    update_trial_balance: true,
    require_reconciliation: true,
    reconciliation_frequency: "monthly",
    reverse_on_rejection: true,
    require_dual_approval: false,
    audit_trail_level: "detailed",
    retain_history_days: 365,
    // ... other properties use defaults from config
  },
  is_disabled: false,
};

const response = await repository.store("processCards", newProcessCard);
```

### Viewing Accounting Data

```typescript
// Get ledger balances for current period
const balances = await ledgerBalanceRepository.collection(
  "ledgerAccountBalances",
  { period: "2025-10", fiscal_year: 2025 }
);

// Get trial balance
const trialBalance = await trialBalanceRepository.collection("trialBalances", {
  department_id: 1,
  period: "2025-10",
});

// Check if balanced
if (trialBalance.data.is_balanced) {
  console.log("✅ Books are balanced!");
} else {
  console.log(`⚠️ Variance: ${trialBalance.data.variance}`);
}

// Get fund transaction history
const fundTxns = await fundTransactionRepository.collection(
  "fundTransactions",
  { fund_id: 1 }
);
```

---

## 📊 Dashboard Components (Future)

### Accounting Dashboard

```typescript
// Sample dashboard showing accounting status

const AccountingDashboard = () => {
  const [trialBalance, setTrialBalance] = useState<TrialBalanceResponseData>();
  const [reconciliations, setReconciliations] = useState<
    ReconciliationResponseData[]
  >([]);

  return (
    <div className="accounting-dashboard">
      {/* Trial Balance Card */}
      <div className="trial-balance-card">
        <h3>Trial Balance - October 2025</h3>
        <div className="balance-summary">
          <div>Debits: ₦{trialBalance?.total_debits.toLocaleString()}</div>
          <div>Credits: ₦{trialBalance?.total_credits.toLocaleString()}</div>
          <div
            className={trialBalance?.is_balanced ? "balanced" : "unbalanced"}
          >
            {trialBalance?.is_balanced
              ? "✅ Balanced"
              : `⚠️ Variance: ₦${trialBalance?.variance}`}
          </div>
        </div>
      </div>

      {/* Reconciliation Status */}
      <div className="reconciliation-card">
        <h3>Reconciliation Status</h3>
        {reconciliations.map((recon) => (
          <div key={recon.id} className={`recon-item ${recon.status}`}>
            <span>{recon.type}</span>
            <span>Variance: ₦{recon.variance.toLocaleString()}</span>
            <span className={`status-${recon.status}`}>{recon.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🔍 Data Validation

### Frontend Validation

```typescript
// In ProcessCard form
const validateRules = (rules: ProcessCardRulesProps): string[] => {
  const errors: string[] = [];

  // Validate chart of accounts if generating transactions
  if (rules.generate_transactions) {
    if (rules.create_contra_entries && !rules.default_debit_account_id) {
      errors.push("Default Debit Account required for contra entries");
    }
    if (rules.create_contra_entries && !rules.default_credit_account_id) {
      errors.push("Default Credit Account required for contra entries");
    }
  }

  // Validate settlement rules
  if (rules.settle_after_approval && !rules.requires_approval) {
    errors.push("Cannot settle after approval without requiring approval");
  }

  // Validate reconciliation
  if (rules.require_reconciliation && !rules.reconciliation_frequency) {
    errors.push(
      "Reconciliation frequency required when reconciliation is enabled"
    );
  }

  return errors;
};
```

---

## 🎯 Key Frontend Features

### 1. **Smart Form Defaults**

All missing properties automatically filled with sensible defaults from `config.ts`

### 2. **Conditional Disabling**

- "Settle After Approval" disabled when "Requires Approval" is off
- "Default accounts" highlighted when "Create Contra Entries" is on

### 3. **Real-time Validation**

- Form validates before submission
- User-friendly error messages

### 4. **Type Safety**

- Full TypeScript support
- IntelliSense for all properties
- Compile-time error checking

---

## 🚀 Next Steps

### 1. Create UI for Viewing Accounting Data

- Trial Balance viewer
- Reconciliation dashboard
- Fund transaction history
- Audit trail viewer

### 2. Create Reconciliation Interface

- Upload bank statements
- Compare system vs actual
- Create adjustment entries
- Approve reconciliations

### 3. Create Reporting Components

- Financial statements
- Period closing reports
- Variance analysis
- Audit reports

---

## 📁 File Structure

```
src/app/Repositories/
├── ProcessCard/
│   ├── data.ts ✅ (Enhanced with all accounting rules)
│   ├── config.ts ✅ (Default values for all rules)
│   └── ProcessCardRepository.ts ✅ (Updated fromJson)
├── LedgerAccountBalance/
│   └── data.ts ✅ (New)
├── TrialBalance/
│   └── data.ts ✅ (New)
├── Reconciliation/
│   └── data.ts ✅ (New)
├── FundTransaction/
│   └── data.ts ✅ (New)
├── AccountPosting/
│   └── data.ts ✅ (New)
├── PostingBatch/
│   └── data.ts ✅ (New)
└── AccountingAuditTrail/
    └── data.ts ✅ (New)

src/resources/views/crud/
└── ProcessCard.tsx ✅ (Complete 8-section form)

src/resources/views/components/forms/
└── Checkbox.tsx ✅ (Reusable checkbox component)
```

---

## ✅ Implementation Status

### Completed

- ✅ ProcessCard form with all accounting rules
- ✅ TypeScript data types for all new tables
- ✅ Default configurations
- ✅ Form validation
- ✅ Backward compatibility ensured

### Ready for Development

- 📋 Accounting dashboard components
- 📋 Trial balance viewer
- 📋 Reconciliation interface
- 📋 Reporting components
- 📋 Analytics dashboards

---

**The frontend is fully prepared to work with the new accounting cycle backend!** 🎉
