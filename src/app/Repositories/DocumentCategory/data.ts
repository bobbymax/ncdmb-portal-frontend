import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { BaseResponse } from "../BaseRepository";
import { DocumentRequirementResponseData } from "../DocumentRequirement/data";
import { BlockResponseData } from "../Block/data";
import { TemplateResponseData } from "../Template/data";
import { PermissionTypes } from "../ProgressTracker/data";
import { SignatoryType } from "../Signatory/data";
import { ProcessFlowConfigProps } from "@/resources/views/crud/DocumentWorkflow";
import { ContentBlock } from "@/resources/views/crud/DocumentTemplateBuilder";
import { ProcessActivitiesProps } from "@/resources/views/crud/DocumentCategoryConfiguration";

export type CategoryProgressTrackerProps = {
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
  actions?: DataOptionsProps[];
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
  actions: DataOptionsProps[];
  activities: ProcessActivitiesProps[];
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
