import { BaseResponse } from "../BaseRepository";

export interface WorkflowResponseData extends BaseResponse {
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}
