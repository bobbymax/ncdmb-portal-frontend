import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { BaseResponse } from "../BaseRepository";
import { DocumentRequirementResponseData } from "../DocumentRequirement/data";
import { BlockResponseData } from "../Block/data";
import { TemplateResponseData } from "../Template/data";
import { PermissionTypes } from "../ProgressTracker/data";
import { SignatoryType } from "../Signatory/data";
import {
  ProcessFlowConfigProps,
  ProcessFlowType,
} from "@/resources/views/crud/DocumentWorkflow";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import {
  ProcessActivitiesProps,
  SelectedActionsProps,
} from "@/resources/views/crud/DocumentCategoryConfiguration";
import { CommentProps } from "@/resources/views/components/DocumentGeneratorTab/ThreadsGeneratorTab";
import { SettingsProps } from "@/resources/views/components/DocumentGeneratorTab/SettingsGeneratorTab";
import { DocumentActionResponseData } from "../DocumentAction/data";

export type PointerActivityTypesProps =
  | "commented"
  | "reviewed"
  | "queried"
  | "escalated"
  | "question"
  | "approved"
  | "signed"
  | "rejected"
  | "cancelled"
  | "completed"
  | "reopened"
  | "reassigned"
  | "responded";

export type PointerThreadConversationProps = {
  id: string | number;
  thread_id: number | string;
  document_id: number;
  sender_id?: number;
  message: string;
  created_at: string;
  updated_at?: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatar: string;
  };
  replies?: string[];
  type: "comment" | "reply";
  category: PointerActivityTypesProps;
  is_pinned: boolean;
  is_deleted: boolean;
  delivered: boolean;
  marked_as_read: boolean;
};

export type CategoryProgressTrackerProps = {
  flow_type: ProcessFlowType;
  identifier: string;
  workflow_stage_id: number;
  group_id: number;
  department_id: number;
  carder_id: number;
  user_id: number;
  order: number;
  permission: PermissionTypes;
  signatory_type: SignatoryType;
  should_be_signed: "yes" | "no";
  actions: DocumentActionResponseData[];
};

export type CategoryWorkflowProps = {
  trackers: CategoryProgressTrackerProps[];
  handlers?: DataOptionsProps[];
};

export type DocumentPolicy = {
  strict: boolean;
  scope: "public" | "private" | "confidential" | "restricted";
  access_token?: string;
  can_override: boolean;
  clearance_level: DataOptionsProps | null;
  fallback_approver: DataOptionsProps | null;
  for_signed: boolean;
  days: number;
  frequency: "days" | "weeks" | "months" | "years";
};

export type DocumentMetaDataProps = {
  policy: DocumentPolicy | null;
  recipients: DataOptionsProps[];
  actions: SelectedActionsProps[];
  activities: ProcessActivitiesProps[];
  comments: CommentProps[];
  settings: SettingsProps;
};

export interface DocumentCategoryResponseData extends BaseResponse {
  document_type_id: number;
  workflow_id: number;
  type: "staff" | "third-party";
  name: string;
  icon: string;
  label: string;
  selectedBlocks: DataOptionsProps[];
  service: string;
  document_type?: string;
  blocks?: BlockResponseData[];
  description: string;
  signature_type: "none" | "flex" | "boxed" | "flush" | "stacked";
  with_date: 0 | 1;
  requirements: DocumentRequirementResponseData[];
  selectedRequirements: DataOptionsProps[];
  config?: ProcessFlowConfigProps | null;
  template?: TemplateResponseData | null;
  content?: ContentBlock[];
  workflow?: CategoryWorkflowProps | null;
  meta_data?: DocumentMetaDataProps | null;
  created_at?: string;
  updated_at?: string;
}
