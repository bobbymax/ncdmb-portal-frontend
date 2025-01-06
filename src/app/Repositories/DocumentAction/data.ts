import { BaseResponse } from "../BaseRepository";

export interface DocumentActionResponseData extends BaseResponse {
  workflow_stage_category_id: number;
  name: string;
  label: string;
  button_text: string;
  icon: string;
  variant: "primary" | "info" | "warning" | "success" | "danger" | "dark";
  process_status: "next" | "stall" | "goto" | "end" | "complete";
  status: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}
