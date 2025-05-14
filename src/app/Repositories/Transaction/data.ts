import { BaseResponse } from "../BaseRepository";

export interface TransactionResponseData extends BaseResponse {
  user_id: number;
  department_id: number;
  payment_id: number;
  ledger_id: number;
  chart_of_account_id: number;
  reference?: string;
  type: "debit" | "credit";
  amount: number;
  narration: string;
  beneficiary_id: number;
  beneficiary_type: string;
  payment_method: "bank-transfer" | "cheque" | "cash" | "cheque-number";
  currency: "USD" | "EUR" | "NGN" | "GBP" | "YEN";
  status?: string;
  posted_at?: string;
  is_achived?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
