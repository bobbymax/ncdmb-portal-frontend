import { DocumentableData } from "app/Hooks/useWorkflow";
import { BaseResponse } from "../BaseRepository";
import { DocumentDraftResponseData } from "../DocumentDraft/data";
import { DocumentTypeResponseData } from "../DocumentType/data";
import { WorkflowResponseData } from "../Workflow/data";
import { DocumentUpdateResponseData } from "../DocumentUpdate/data";
import { DocumentActionResponseData } from "../DocumentAction/data";
import {
  DocumentMetaDataProps,
  PointerThreadProps,
} from "../DocumentCategory/data";
import { DocumentRequirementResponseData } from "../DocumentRequirement/data";
import {
  SettingsProps,
  WatcherProps,
} from "@/resources/views/components/DocumentGeneratorTab/SettingsGeneratorTab";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { ProcessFlowConfigProps } from "@/resources/views/crud/DocumentWorkflow";

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
  documentable?: DocumentableData;
  status: string;
  drafts: DocumentDraftResponseData[]; // ignore
  // action?: DocumentActionProps | null // ignore
  workflow: WorkflowResponseData | null; // ignore
  uploads?: UploadResponseData[];
  owner: DocumentOwnerData | null;
  document_type: DocumentTypeResponseData | null;
  linked_drafts?: DocumentDraftResponseData[]; // ignore
  complete_or_linked_drafts?: DocumentDraftResponseData[]; // ignore
  dept?: string;
  updates?: DocumentUpdateResponseData[]; // ignore
  action?: Partial<DocumentActionResponseData> | null; // ignore
  parents?: DocumentResponseData[]; // ignore
  meta_data?: DocumentMetaDataProps | null;
  uploaded_requirements?: DocumentRequirementResponseData[];
  preferences?: SettingsProps;
  pointer?: string;
  threads?: PointerThreadProps[];
  watchers?: WatcherProps[];
  contents?: ContentBlock[];
  config?: ProcessFlowConfigProps;
  amount?: number;
  is_archived: number;
  created_at?: string;
  updated_at?: string;
}
