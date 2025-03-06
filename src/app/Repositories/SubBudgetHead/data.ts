import { BaseResponse } from "../BaseRepository";

export interface SubBudgetHeadResponseData extends BaseResponse {
  budget_head_id: number;
  name: string;
  label?: string;
  type: "capital" | "recurrent" | "personnel";
  is_logistics: number;
  is_blocked: number;
  has_fund?: boolean;
  created_at?: string;
  updated_at?: string;
}
