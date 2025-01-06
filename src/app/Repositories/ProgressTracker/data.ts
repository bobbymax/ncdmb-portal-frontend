import { BaseResponse } from "../BaseRepository";

export interface ProgressTrackerResponseData extends BaseResponse {
  workflow_id: number;
  workflow_stage_id: number;
  order: number;
  date_completed: string;
  status: "pending" | "passed" | "stalled" | "failed";
  is_closed: number;
  created_at?: string;
  updated_at?: string;
}
