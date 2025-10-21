import { BaseResponse } from "../BaseRepository";
import { DocumentDraftResponseData } from "../DocumentDraft/data";
import { DocumentTypeResponseData } from "../DocumentType/data";
import { WorkflowResponseData } from "../Workflow/data";
import { DocumentUpdateResponseData } from "../DocumentUpdate/data";
import { DocumentActionResponseData } from "../DocumentAction/data";
import { DocumentMetaDataProps } from "../DocumentCategory/data";
import { ThreadResponseData } from "../Thread/data";
import { DocumentRequirementResponseData } from "../DocumentRequirement/data";
import {
  SettingsProps,
  WatcherProps,
} from "@/resources/views/components/DocumentGeneratorTab/SettingsGeneratorTab";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { ProcessFlowConfigProps } from "@/resources/views/crud/DocumentWorkflow";
import { ProgressTrackerResponseData } from "../ProgressTracker/data";
import { PaymentResponseData } from "../Payment/data";

export interface UploadResponseData extends BaseResponse {
  user_id: number;
  department_id: number;
  name: string;
  path: string;
  size: number;
  mime_type: string;
  file_path: string;
  extension: string;
  uploadable_id?: number;
  uploadable_type?: string;
  created_at?: string;
  updated_at?: string;
}

type DocumentActionProps = {
  id: number;
  name: string;
  action_status:
    | "passed"
    | "failed"
    | "attend"
    | "appeal"
    | "escalate"
    | "processing"
    | "stalled"
    | "cancelled"
    | "reversed"
    | "complete";
  status: string;
};

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
  staff_no: string;
}

export interface DocumentResponseData extends BaseResponse {
  user_id?: number;
  created_by?: number;
  department_id?: number;
  document_category_id: number;
  document_reference_id: number;
  document_type_id: number;
  workflow_id: number;
  vendor_id?: number;
  documentable_id: number;
  documentable_type: string;
  progress_tracker_id: number;
  title: string;
  ref: string;
  description: string;
  file_path: string;
  document_template: string;
  status: string;
  budget_year: number;
  is_completed: boolean;
  type: "staff" | "third-party";
  drafts: DocumentDraftResponseData[]; // ignore
  fund_id: number;
  // action?: DocumentActionProps | null // ignore
  workflow: WorkflowResponseData | null; // ignore
  processes?: ProgressTrackerResponseData[];
  uploads?: UploadResponseData[];
  owner: DocumentOwnerData | null;
  document_type: DocumentTypeResponseData | null;
  linked_drafts?: DocumentDraftResponseData[]; // ignore
  complete_or_linked_drafts?: DocumentDraftResponseData[]; // ignore
  documentable?: unknown;
  payments?: PaymentResponseData[];
  dept?: string;
  updates?: DocumentUpdateResponseData[]; // ignore
  action?: Partial<DocumentActionResponseData> | null; // ignore
  parents?: DocumentResponseData[]; // ignore
  meta_data?: DocumentMetaDataProps | null;
  uploaded_requirements?: DocumentRequirementResponseData[];
  preferences?: SettingsProps;
  pointer?: string;
  threads?: ThreadResponseData[];
  watchers?: WatcherProps[];
  contents?: ContentBlock[];
  config?: ProcessFlowConfigProps;
  approved_amount: number;
  sub_total_amount: number;
  vat_amount: number;
  variation_amount: number;
  admin_fee_amount: number;
  is_archived: number;
  created_at?: string;
  updated_at?: string;
}
