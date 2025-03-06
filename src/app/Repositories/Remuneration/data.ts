import { BaseResponse } from "../BaseRepository";

export interface RemunerationResponseData extends BaseResponse {
  allowance_id: number;
  grade_level_id: number;
  amount: number;
  is_active: number;
  start_date: string;
  expiration_date: string;
  currency: "NGN" | "EUR" | "USD" | "GBP";
  created_at?: string;
  updated_at?: string;
}
