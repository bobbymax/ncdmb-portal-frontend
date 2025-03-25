import { BaseResponse } from "../BaseRepository";

export interface DocumentTrailResponseData extends BaseResponse {
  document_id: number;
  user_id: number;
  document_draft_id: number;
  document_action_id: number;
  reason: string;
  document_trailable_id: number;
  document_trailable_type: string;
  created_at?: string;
  updated_at?: string;
}
