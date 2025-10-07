import { BaseResponse } from "../BaseRepository";

export interface LedgerAccountBalanceResponseData extends BaseResponse {
  chart_of_account_id: number;
  ledger_id: number;
  department_id: number;
  fund_id?: number;
  opening_balance: number;
  total_debits: number;
  total_credits: number;
  closing_balance: number;
  period: string;
  fiscal_year: number;
  is_closed: boolean;
  closed_at?: string;
  closed_by?: number;
  created_at?: string;
  updated_at?: string;
}
