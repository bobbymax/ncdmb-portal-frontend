import { BaseResponse } from "../BaseRepository";
import { DocumentActionResponseData } from "../DocumentAction/data";
import { FileTemplateResponseData } from "../FileTemplate/data";
import { SignatureResponseData } from "../Signature/data";

export type DraftableResponseData = {
  id: number;
  code: string;
  [key: string]: unknown;
};

export interface DocumentDraftResponseData extends BaseResponse {
  document_id: number;
  sub_document_reference_id?: number;
  document_type_id: number;
  document_action_id: number;
  group_id: number;
  progress_tracker_id: number;
  created_by_user_id: number;
  current_workflow_stage_id: number;
  department_id: number;
  authorising_staff_id: number;
  document_draftable_id: number;
  document_draftable_type: string;
  amount: string;
  taxable_amount: string;
  file_path: string;
  digital_signature_path: string;
  draftable: DraftableResponseData | null;
  template: FileTemplateResponseData | null;
  signature: string;
  resource_type: string;
  status: string;
  ref: string;
  order?: number;
  authorising_officer?: {
    id: number;
    name: string;
    staff_no: string | number;
    grade_level: string;
    email: string;
  } | null;
  staff?: {
    id: number;
    name: string;
    staff_no: string | number;
    grade_level: string;
    email: string;
  } | null;
  action?: Partial<DocumentActionResponseData> | null;
  approval?: SignatureResponseData | null;
  history?: Partial<DocumentDraftResponseData>[];
  type: "attention" | "paper" | "response";
  version_number?: number;
  created_at?: string;
  updated_at?: string;
}
