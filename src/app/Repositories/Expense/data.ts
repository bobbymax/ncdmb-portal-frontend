import { BaseResponse } from "../BaseRepository";

export interface ExpenseResponseData extends BaseResponse {
  identifier: string;
  parent_id: number;
  allowance_id: number;
  remuneration_id: number;
  start_date: string;
  end_date: string;
  no_of_days: number;
  total_distance_covered: number;
  unit_price: number;
  total_amount_spent: number;
  description: string;
  type?: "flight-takeoff" | "flight-land" | "road" | "per-diem" | "wallet";
  status?: "pending" | "cleared" | "altered" | "rejected";
  created_at?: string;
  updated_at?: string;
}
