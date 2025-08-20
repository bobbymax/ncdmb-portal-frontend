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
  group_id: number;
  department_id: number;
  document_category_id: number;
  page_id: number;
  type: SignatoryType;
  order: number;
  compound?: string;
  created_at?: string;
  updated_at?: string;
}
