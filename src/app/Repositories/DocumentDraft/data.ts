import { BaseResponse } from "../BaseRepository";
import { UploadResponseData } from "../Document/data";
import { DocumentActionResponseData } from "../DocumentAction/data";
import { FileTemplateResponseData } from "../FileTemplate/data";
import { SignatureResponseData } from "../Signature/data";

export type DraftableResponseData = {
  id: number;
  code: string;
  [key: string]: unknown;
};

export type AuthorisingOfficerProps = {
  id: number;
  name: string;
  staff_no: string | number;
  grade_level: string;
  email: string;
  avatar?: string;
};

export interface DocumentDraftResponseData extends BaseResponse {
  document_id: number;
  document_action_id: number;
  group_id: number;
  progress_tracker_id: number;
  current_workflow_stage_id: number;
  department_id: number;
  amount: string;
  taxable_amount: string;
  status: string;
  ref: string;
  order?: number;
  operator?: AuthorisingOfficerProps | null;
  action?: Partial<DocumentActionResponseData> | null;
  version_number?: number;
  created_at?: string;
  updated_at?: string;
}
