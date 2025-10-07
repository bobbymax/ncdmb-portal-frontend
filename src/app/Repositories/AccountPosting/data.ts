import { BaseResponse } from "../BaseRepository";

export type PostingType = "manual" | "auto" | "reversed" | "adjustment";

export interface AccountPostingResponseData extends BaseResponse {
  transaction_id: number;
  chart_of_account_id: number;
  ledger_id: number;
  process_card_id?: number;
  debit: number;
  credit: number;
  running_balance: number;
  posting_reference: string;
  posting_type: PostingType;
  posted_at: string;
  posted_by: number;
  is_reversed: boolean;
  reversed_by?: number;
  reversed_at?: string;
  reversal_reason?: string;
  created_at?: string;
  updated_at?: string;
}
