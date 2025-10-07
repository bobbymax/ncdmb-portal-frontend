import { BaseResponse } from "../BaseRepository";

export interface TrialBalanceResponseData extends BaseResponse {
  department_id: number;
  period: string;
  fiscal_year: number;
  total_debits: number;
  total_credits: number;
  variance: number;
  account_balances: Record<string, any>;
  ledger_summary: Record<string, any>;
  is_balanced: boolean;
  is_approved: boolean;
  approved_by?: number;
  approved_at?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}
