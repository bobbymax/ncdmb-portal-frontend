import { BaseResponse } from "../BaseRepository";

export interface ProductCategoryResponseData extends BaseResponse {
  name: string;
  label?: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}
