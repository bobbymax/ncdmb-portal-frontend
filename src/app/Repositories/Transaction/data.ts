import { BaseResponse } from "../BaseRepository";
import { JournalTypeResponseData } from "../JournalType/data";

export interface TransactionResponseData extends BaseResponse {
  user_id: number;
  department_id: number;
  payment_id: number;
  ledger_id: number;
  chart_of_account_id: number;
  journal_type_id: number;
  reference?: string;
  type: "debit" | "credit";
  credit_amount: number;
  debit_amount: number;
  amount: number;
  narration: string;
  beneficiary_id: number;
  beneficiary_type: string;
  payment_method: "bank-transfer" | "cheque" | "cash" | "cheque-number";
  currency: "USD" | "EUR" | "NGN" | "GBP" | "YEN";
  status?: string;
  trail_balance: "left" | "right";
  flag: "payable" | "ledger" | "retire";
  journal_type?: JournalTypeResponseData | null;
  posted_at?: string;
  is_achived?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
