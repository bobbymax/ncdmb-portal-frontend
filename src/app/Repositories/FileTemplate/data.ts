import { BaseResponse } from "../BaseRepository";

export interface FileTemplateResponseData extends BaseResponse {
  name: string;
  service: string;
  component: string;
  tagline: string;
  repository: string;
  response_data_format: string;
  created_at?: string;
  updated_at?: string;
}
