import { BaseResponse } from "../BaseRepository";

export type FundTransactionType =
  | "allocation"
  | "reservation"
  | "expenditure"
  | "payment"
  | "refund"
  | "reversal"
  | "adjustment"
  | "transfer";

export type MovementType = "debit" | "credit";

export interface FundTransactionResponseData extends BaseResponse {
  fund_id: number;
  process_card_id?: number;
  reference: string;
  transaction_type: FundTransactionType;
  movement: MovementType;
  amount: number;
  balance_before: number;
  balance_after: number;
  source_id?: number;
  source_type?: string;
  narration: string;
  created_by: number;
  is_reversed: boolean;
  reversed_by?: number;
  reversed_at?: string;
  created_at?: string;
  updated_at?: string;
}
