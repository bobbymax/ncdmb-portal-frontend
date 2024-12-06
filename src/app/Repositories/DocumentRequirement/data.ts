import { BaseResponse } from "../BaseRepository";

export interface DocumentRequirementResponseData extends BaseResponse {
  name: string;
  created_at?: string;
  updated_at?: string;
}
