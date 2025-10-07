import { BaseResponse, BeneficiaryProps } from "../BaseRepository";

export type FundProps = {
  department: string;
  budget_code: string;
  sub_budget_head: string;
  type: string;
  total_approved_amount: number;
};

// @owner means department here
// so this is the department the expenditure belongs to
type LinkedDocumentProps = {
  title: string;
  ref: string;
  published_at: string;
  published_by: {
    name: string;
    staff_no: string;
    department: string;
  };
  approved_amount: number;
  type: string;
};
export interface ExpenditureResponseData extends BaseResponse {
  user_id: number;
  department_id: number;
  fund_id: number;
  document_draft_id: number;
  linked_document?: LinkedDocumentProps | null;
  code: string;
  purpose: string;
  additional_info: string;
  amount: string;
  sub_total_amount: number;
  admin_fee_amount: number;
  vat_amount: number;
  type: string;
  status: string;
  currency: "NGN" | "USD" | "GBP" | "YEN" | "EUR";
  cbn_current_rate: string;
  budget_year: number;
  expense_type: "staff" | "third-party";
  is_archived: number;
  fund?: FundProps | null;
  created_at?: string;
  updated_at?: string;
}
