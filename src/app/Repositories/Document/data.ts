import { BaseResponse } from "../BaseRepository";
import { DocumentDraftResponseData } from "../DocumentDraft/data";
import { WorkflowResponseData } from "../Workflow/data";

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

export interface DocumentOwnerData {
  id: number;
  name: string;
  email: string;
  role: string;
  groups: {
    id: number;
    name: string;
    label: string;
  }[];
  department: string;
  grade_level: string;
}

export interface DocumentResponseData extends BaseResponse {
  user_id?: number;
  department_id?: number;
  document_category_id: number;
  document_type_id: number;
  workflow_id: number;
  vendor_id?: number;
  documentable_id: number;
  documentable_type: string;
  title: string;
  ref: string;
  description: string;
  file_path: string;
  document_template: string;
  status: "pending" | "approved" | "rejected";
  drafts: DocumentDraftResponseData[];
  workflow: WorkflowResponseData | null;
  uploads?: UploadResponseData[];
  owner: DocumentOwnerData | null;
  is_archived: number;
  created_at?: string;
  updated_at?: string;
}
