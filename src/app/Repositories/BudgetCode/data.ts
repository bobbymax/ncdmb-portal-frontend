import { BaseResponse } from "../BaseRepository";

export interface BudgetCodeResponseData extends BaseResponse {
  code: string;
  created_at?: string;
  updated_at?: string;
}
