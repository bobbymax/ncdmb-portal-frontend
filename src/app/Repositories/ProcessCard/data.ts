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

export type ProcessCardRulesProps = {
  currency: CurrencyTypes;
  transaction: TransactionTypes;
  generate_transactions: boolean;
  permission: PermissionTypes;
  visibility: VisibilityTypes;
  requires_approval: boolean;
  can_query: boolean;
  group_id: number;
  settle: boolean;
  settle_after_approval: boolean;
  ai_analysis: boolean;
  approval_carder_id: number;
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
