import { BaseResponse } from "../BaseRepository";

export type PostingBatchStatus =
  | "draft"
  | "pending-approval"
  | "approved"
  | "posted"
  | "rejected";

export interface PostingBatchResponseData extends BaseResponse {
  batch_no: string;
  process_card_id?: number;
  created_by: number;
  department_id: number;
  total_debits: number;
  total_credits: number;
  is_balanced: boolean;
  status: PostingBatchStatus;
  approved_by?: number;
  approved_at?: string;
  posted_by?: number;
  posted_at?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}
