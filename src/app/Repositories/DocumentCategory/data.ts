import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { BaseResponse } from "../BaseRepository";
import { DocumentRequirementResponseData } from "../DocumentRequirement/data";
import { BlockResponseData } from "../Block/data";
import { TemplateResponseData } from "../Template/data";
import { PermissionTypes } from "../ProgressTracker/data";
import { SignatoryType } from "../Signatory/data";
import { ProcessFlowConfigProps } from "@/resources/views/crud/DocumentWorkflow";

export type CategoryProgressTrackerProps = {
  identifier: string;
  workflow_stage_id: number;
  group_id: number;
  department_id: number;
  carder_id: number;
  user_id: number;
  document_type_id: number;
  internal_process_id: number;
  order: number;
  permission: PermissionTypes;
  signatory_type: SignatoryType;
  should_be_signed: "yes" | "no";
};

export type CategoryWorkflowProps = {
  trackers: CategoryProgressTrackerProps[];
  handlers?: DataOptionsProps[];
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
  workflow?: CategoryWorkflowProps | null;
  created_at?: string;
  updated_at?: string;
}
