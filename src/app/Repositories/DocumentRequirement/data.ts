import { BaseResponse } from "../BaseRepository";

export interface DocumentRequirementResponseData extends BaseResponse {
  name: string;
  description: string;
  priority: "high" | "medium" | "low";
  created_at?: string;
  updated_at?: string;
}
