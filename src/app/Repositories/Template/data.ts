import { BaseResponse } from "../BaseRepository";
import { BlockResponseData } from "../Block/data";

export interface TemplateResponseData extends BaseResponse {
  document_category_id: number;
  name: string;
  header: "banner" | "memo" | "resource";
  body?: any[];
  footer: string;
  active: number;
  blocks?: BlockResponseData[];
  created_at?: string;
  updated_at?: string;
}
