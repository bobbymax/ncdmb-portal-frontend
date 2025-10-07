import { ConfigProp } from "../BaseRepository";
import { ProcessCardResponseData } from "./data";

export const processCardConfig: ConfigProp<ProcessCardResponseData> = {
  fillables: [
    "document_type_id",
    "ledger_id",
    "service",
    "name",
    "component",
    "rules",
    "is_disabled",
  ],
  associatedResources: [
    { url: "apiServices", name: "services" },
    { name: "documentTypes", url: "documentTypes" },
    { name: "ledgers", url: "ledgers" },
    { name: "groups", url: "groups" },
    { name: "carders", url: "carders" },
    { name: "chartOfAccounts", url: "chartOfAccounts" },
  ],
  state: {
    id: 0,
    document_type_id: 0,
    ledger_id: 0,
    service: "",
    name: "",
    component: "",
    rules: {
      // Financial & Transaction
      currency: "NGN",
      transaction: "debit",
      book_type: "ledger",
      generate_transactions: false,
      post_to_journal: false,

      // Access & Permissions
      permission: "r",
      visibility: "tracker-users",
      group_id: 0,
      can_query: false,

      // Approval & Authorization
      requires_approval: false,
      approval_carder_id: 0,

      // Settlement & Processing
      settle: false,
      settle_after_approval: false,
      auto_settle_fund: false,

      // Chart of Accounts Mapping
      default_debit_account_id: 0,
      default_credit_account_id: 0,

      // Posting & Journal Rules
      create_contra_entries: true,
      posting_priority: "batch",
      settlement_stage: "on-payment",

      // Balance & Reconciliation
      update_trial_balance: true,
      require_reconciliation: false,
      reconciliation_frequency: "monthly",

      // Reversal & Audit
      reverse_on_rejection: true,
      require_dual_approval: false,
      audit_trail_level: "detailed",

      // AI & Automation
      ai_analysis: false,
      retain_history_days: 365,
    },
    is_disabled: false,
  },
  actions: [
    {
      label: "manage",
      icon: "ri-settings-3-line",
      variant: "success",
      conditions: [],
      operator: "and",
      display: "Manage",
    },
  ],
};
