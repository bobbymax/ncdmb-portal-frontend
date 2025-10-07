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
  // Existing properties...
  permission: PermissionTypes;
  visibility: VisibilityTypes;
  requires_approval: boolean;
  can_query: boolean;
  group_id: number;
  settle: boolean;
  settle_after_approval: boolean;
  ai_analysis: boolean;
  approval_carder_id: number;
  currency: CurrencyTypes;
  transaction: TransactionTypes;
  generate_transactions: boolean;
  book_type: BookType;
  post_to_journal: boolean;

  // NEW: Enhanced accounting properties
  auto_settle_fund: boolean; // Auto-update fund balances
  require_reconciliation: boolean; // Require reconciliation before closing
  create_contra_entries: boolean; // Auto-create contra (opposite) entries
  update_trial_balance: boolean; // Auto-update trial balance
  posting_priority: "immediate" | "batch" | "scheduled";

  // Chart of Account mappings
  default_debit_account_id?: number; // Default COA for debits
  default_credit_account_id?: number; // Default COA for credits

  // Settlement rules
  settlement_stage: "on-approval" | "on-payment" | "on-posting" | "manual";
  reverse_on_rejection: boolean; // Auto-reverse if rejected

  // Reconciliation rules
  reconciliation_frequency: "daily" | "weekly" | "monthly" | "quarterly";
  require_dual_approval: boolean; // Require 2 approvals for posting

  // Audit & compliance
  audit_trail_level: "basic" | "detailed" | "comprehensive";
  retain_history_days: number; // How long to keep transaction history
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
