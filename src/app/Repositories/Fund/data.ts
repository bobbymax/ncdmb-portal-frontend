import { BaseResponse } from "../BaseRepository";

export interface FundResponseData extends BaseResponse {
  sub_budget_head_id: number;
  department_id: number;
  budget_code_id: number;
  total_approved_amount: string | number;
  budget_year: number;
  is_logistics: number;
  is_exhausted: number;
  type: "capital" | "recurrent" | "personnel";
  budget_code?: string;
  sub_budget_head?: string;
  owner?: string;
  name?: string;
  approved_amount?: string;
  exhausted?: string;
  created_at?: string;
  updated_at?: string;
}
