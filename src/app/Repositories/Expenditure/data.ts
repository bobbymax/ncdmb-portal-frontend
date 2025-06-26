import { BaseResponse, BeneficiaryProps } from "../BaseRepository";

export type FundProps = {
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

export type ExpenditureableProps = {
  [key: string]: unknown;
  id: number;
  user_id?: number;
  department_id?: number;
  fund_id?: number;
  code?: string;
  type: string;
  owner?: {
    grade_level: string;
    name: string;
    staff_no: string;
  };
  beneficiary: BeneficiaryProps;
  vendor?: {
    name: string;
    registration_no: string;
    address: string;
    phone: string;
    email: string;
  };
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
  expenditureable_id?: number;
  expenditureable_type?: string;
  expenditureable?: ExpenditureableProps | null;
  fund?: FundProps | null;
  controller?: ControllerProps | null;
  trackable_draft_id?: number;
  owner?: OwnerProps | null;
  beneficiary?: BeneficiaryProps | null;
  created_at?: string;
  updated_at?: string;
}
