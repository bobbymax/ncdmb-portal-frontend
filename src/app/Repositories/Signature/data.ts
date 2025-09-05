import { ProcessFlowType } from "@/resources/views/crud/DocumentWorkflow";
import { BaseResponse } from "../BaseRepository";
import { SignatoryType } from "../Signatory/data";

export interface SignatureResponseData extends BaseResponse {
  signatory_id: number;
  user_id: number;
  document_draft_id: number;
  type: SignatoryType;
  flow_type: ProcessFlowType;
  approving_officer?: {
    name: string;
    grade_level: string;
  } | null;
  signature: string;
  created_at?: string;
  updated_at?: string;
}
