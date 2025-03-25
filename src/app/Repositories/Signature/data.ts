import { BaseResponse } from "../BaseRepository";

export interface SignatureResponseData extends BaseResponse {
  signatory_id: number;
  user_id: number;
  document_draft_id: number;
  type?: string;
  approving_officer?: {
    name: string;
    grade_level: string;
  } | null;
  signature: string;
  created_at?: string;
  updated_at?: string;
}
