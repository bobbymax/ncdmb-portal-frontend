import { BaseResponse } from "../BaseRepository";

type FundProps = {
  department: string;
  budget_code: string;
  sub_budget_head: string;
  type: string;
  total_approved_amount: number;
};

type ControllerProps = {
  name: string;
  staff_no: string;
  department: string;
  role: string;
};

// @owner means department here
// so this is the department the expenditure belongs to
type OwnerProps = {
  name: string;
  abv: string;
  department_payment_code: string;
};
export interface ExpenditureResponseData extends BaseResponse {
  user_id: number;
  department_id: number;
  fund_id: number;
  document_draft_id: number;
  document_reference_id?: number;
  code: string;
  purpose: string;
  additional_info: string;
  amount: string;
  type: string;
  status: string;
  currency: "NGN" | "USD" | "GBP" | "YEN" | "EUR";
  cbn_current_rate: string;
  budget_year: number;
  is_archived: number;
  expenditureable_id?: number;
  expenditureable_type?: string;
  fund?: FundProps | null;
  controller?: ControllerProps | null;
  owner?: OwnerProps | null;
  created_at?: string;
  updated_at?: string;
}
