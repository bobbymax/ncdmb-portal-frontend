import { BaseResponse } from "../BaseRepository";

export interface MilestoneResponseData extends BaseResponse {
  milestoneable_id: number;
  milestoneable_type: string;
  description: string;
  percentage_completion: number;
  duration: number;
  frequency: "days" | "weeks" | "months" | "years";
  status: "active" | "inactive";
  is_closed: 0 | 1;
  created_at?: string;
  updated_at?: string;
}
