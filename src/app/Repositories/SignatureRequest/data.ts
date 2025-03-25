import { BaseResponse } from "../BaseRepository";

export interface SignatureRequestResponseData extends BaseResponse {
  user_id: number;
  document_id: number;
  document_draft_id: number;
  department_id: number;
  group_id: number;
  status: "pending" | "accepted" | "declined";
  authorising_officer?: {
    name: string;
    department: string;
    group: string;
  };
  created_at?: string;
  updated_at?: string;
}
