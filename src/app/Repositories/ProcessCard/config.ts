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

      // Enhanced Automation (90% automation goal)
      auto_attach_to_payments: true,
      auto_execute_on_create: false,
      auto_execute_on_approval: true,
      auto_execute_on_settlement: false,

      // Matching Criteria
      match_by_service: true,
      match_by_document_type: true,
      match_by_ledger: true,
      match_by_amount_range: false,
      min_amount: 0,
      max_amount: 0,

      // Error Handling
      auto_retry_on_failure: true,
      retry_attempts: 3,
      notify_on_failure: true,
      escalate_on_repeated_failure: true,

      // Batch Processing
      auto_process_batch: true,
      batch_execution_time: "23:00",

      // Period Closing
      auto_close_period: false,
      period_close_day: 5,

      // Stage-Aware Execution
      min_stage_order: 1,
      max_stage_order: 99,
      execute_at_stages: [],
      execute_at_final_stage_only: false,
      requires_custom_inputs: false,
      custom_input_fields: [],
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
