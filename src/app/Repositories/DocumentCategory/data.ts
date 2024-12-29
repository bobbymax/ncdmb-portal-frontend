import { BaseResponse } from "../BaseRepository";

export interface DocumentCategoryResponseData extends BaseResponse {
  document_type_id: number;
  name: string;
  icon: string;
  label: string;
  document_type?: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}
