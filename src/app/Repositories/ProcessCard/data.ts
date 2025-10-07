import { BaseResponse } from "../BaseRepository";
import { DocumentTypeResponseData } from "../DocumentType/data";
import { LedgerResponseData } from "../Ledger/data";
import { PermissionTypes } from "../ProgressTracker/data";

export type CurrencyTypes = "NGN" | "USD" | "GBP" | "YEN" | "EUR";
export type TransactionTypes = "debit" | "credit";
export type VisibilityTypes =
  | "all"
  | "owner"
  | "tracker-users"
  | "tracker-users-and-owner"
  | "specific-users";

export type BookType = "ledger" | "journal";

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

  // Enhanced Automation (90% automation goal)
  auto_attach_to_payments: boolean;
  auto_execute_on_create: boolean;
  auto_execute_on_approval: boolean;
  auto_execute_on_settlement: boolean;

  // Matching Criteria (for auto-attachment)
  match_by_service: boolean;
  match_by_document_type: boolean;
  match_by_ledger: boolean;
  match_by_amount_range: boolean;
  min_amount?: number;
  max_amount?: number;

  // Error Handling Automation
  auto_retry_on_failure: boolean;
  retry_attempts: number;
  notify_on_failure: boolean;
  escalate_on_repeated_failure: boolean;

  // Batch Processing Automation
  auto_process_batch: boolean;
  batch_execution_time: string;

  // Period Closing Automation
  auto_close_period: boolean;
  period_close_day: number;

  // Stage-Aware Execution (ProgressTracker Integration)
  min_stage_order?: number;
  max_stage_order?: number;
  execute_at_stages?: number[];
  execute_at_final_stage_only: boolean;
  requires_custom_inputs: boolean;
  custom_input_fields?: string[];
};

export interface ProcessCardResponseData extends BaseResponse {
  document_type_id: number;
  ledger_id: number;
  service: string;
  name: string;
  component: string;
  rules: ProcessCardRulesProps;
  is_disabled: boolean;
  document_type?: DocumentTypeResponseData | null;
  ledger?: LedgerResponseData | null;
  created_at?: string;
  updated_at?: string;
}
