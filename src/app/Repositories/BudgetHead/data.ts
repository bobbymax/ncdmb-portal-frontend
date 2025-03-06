import { BaseResponse } from "../BaseRepository";

export interface BudgetHeadResponseData extends BaseResponse {
  code: string | number;
  name: string;
  label?: string;
  is_blocked: number;
  created_at?: string;
  updated_at?: string;
}
