import { BaseResponse } from "../BaseRepository";

export interface SignatoryResponseData extends BaseResponse {
  group_id: number;
  department_id: number;
  page_id: number;
  type:
    | "owner"
    | "witness"
    | "approval"
    | "authorised"
    | "attestation"
    | "auditor"
    | "other"
    | "initiator"
    | "vendor";
  order: number;
  compound?: string;
  created_at?: string;
  updated_at?: string;
}
