import { BaseResponse } from "../BaseRepository";

export interface ProjectCategoryResponseData extends BaseResponse {
  name: string;
  label?: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}
