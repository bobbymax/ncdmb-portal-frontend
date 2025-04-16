import { BaseResponse } from "../BaseRepository";

export interface EntityResponseData extends BaseResponse {
  name: string;
  acronym: string;
  status: "active" | "inactive";
  payment_code: string;
  created_at?: string;
  updated_at?: string;
}
