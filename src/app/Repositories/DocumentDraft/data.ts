import { BaseResponse } from "../BaseRepository";
import { FileTemplateResponseData } from "../FileTemplate/data";

export type DraftableResponseData = {
  id: number;
  code: string;
  [key: string]: unknown;
};

export interface DocumentDraftResponseData extends BaseResponse {
  document_id: number;
  document_type_id: number;
  group_id: number;
  progress_tracker_id: number;
  created_by_user_id: number;
  current_workflow_stage_id: number;
  department_id: number;
  authorising_staff_id: number;
  document_draftable_id: number;
  document_draftable_type: string;
  file_path: string;
  digital_signature_path: string;
  draftable: DraftableResponseData | null;
  template: FileTemplateResponseData | null;
  signature: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}
