import { ProcessFlowType } from "@/resources/views/crud/DocumentWorkflow";
import { BaseResponse } from "../BaseRepository";

export type SignatoryType =
  | "owner"
  | "witness"
  | "approval"
  | "authorised"
  | "attestation"
  | "auditor"
  | "other"
  | "initiator"
  | "vendor";
export interface SignatoryResponseData extends BaseResponse {
  identifier: string;
  group_id: number;
  department_id: number;
  document_category_id: number;
  workflow_stage_id: number;
  user_id: number;
  page_id?: number;
  flow_type: ProcessFlowType;
  type: SignatoryType;
  should_sign: boolean;
  compound?: string;
  order: number;
  created_at?: string;
  updated_at?: string;
}
