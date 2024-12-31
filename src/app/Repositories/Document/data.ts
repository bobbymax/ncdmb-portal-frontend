import { BaseResponse } from "../BaseRepository";

export interface UploadResponseData extends BaseResponse {
  user_id: number;
  department_id: number;
  name: string;
  path: string;
  size: bigint;
  mime_type: string;
  extension: string;
  created_at?: string;
  updated_at?: string;
}

export interface DocumentResponseData extends BaseResponse {
  user_id?: number;
  department_id?: number;
  document_category_id: number;
  document_type_id: number;
  vendor_id?: number;
  documentable_id: number;
  documentable_type: string;
  title: string;
  ref: string;
  description: string;
  file_path: string;
  status: "pending" | "approved" | "rejected";
  uploads?: UploadResponseData[];
  is_archived: number;
  created_at?: string;
  updated_at?: string;
}
