import { BaseResponse } from "../BaseRepository";

export interface QueryResponseData extends BaseResponse {
  user_id: number;
  group_id: number;
  document_id: number;
  document_draft_id: number;
  message: string;
  response: unknown;
  priority: "low" | "medium" | "high";
  status: "open" | "closed";
  created_at?: string;
  updated_at?: string;
}
