import { BaseResponse } from "../BaseRepository";

export type ReconciliationType = "fund" | "ledger" | "bank" | "account";
export type ReconciliationStatus =
  | "pending"
  | "in-progress"
  | "reconciled"
  | "discrepancy"
  | "escalated";

export interface ReconciliationResponseData extends BaseResponse {
  user_id: number;
  department_id: number;
  fund_id?: number;
  ledger_id?: number;
  type: ReconciliationType;
  period: string;
  fiscal_year: number;
  system_balance: number;
  actual_balance: number;
  variance: number;
  discrepancies?: Record<string, any>;
  notes?: string;
  status: ReconciliationStatus;
  reconciled_by?: number;
  reconciled_at?: string;
  created_at?: string;
  updated_at?: string;
}
