import { BaseResponse } from "../BaseRepository";
import { DocumentDraftResponseData } from "../DocumentDraft/data";

export interface PaymentResponseData extends BaseResponse {
  user_id: number;
  department_id: number;
  workflow_id: number;
  document_category_id: number;
  document_type_id: number;
  code?: string;
  beneficiary?: string;
  transaction_type?: "debit" | "credit";
  transaction_date: string;
  payment_batch_id: number;
  expenditure_id: number;
  narration: string;
  total_amount_payable: string;
  total_approved_amount: number;
  total_amount_paid: number;
  total_taxable_amount: number;
  payable_id: number;
  payable_type: string;
  payment_method: "bank-transfer" | "cheque" | "cash" | "cheque-number";
  type: "staff" | "third-party";
  currency: "USD" | "EUR" | "NGN" | "GBP" | "YEN";
  period: string;
  fiscal_year: number;
  paid_at?: string;
  status?: "draft" | "posted" | "reversed";
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
