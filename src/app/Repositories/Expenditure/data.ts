import { BaseResponse } from "../BaseRepository";

export interface ExpenditureResponseData extends BaseResponse {
  user_id: number;
  department_id: number;
  fund_id: number;
  document_draft_id: number;
  code: string;
  purpose: string;
  additional_info: string;
  amount: string;
  type: "staff-payment" | "third-party-payment";
  payment_category: "staff-claim" | "touring-advance" | "other";
  status: string;
  currency: "NGN" | "USD" | "GBP" | "YEN" | "EUR";
  cbn_current_rate: string;
  budget_year: number;
  is_archived: number;
  created_at?: string;
  updated_at?: string;
}
