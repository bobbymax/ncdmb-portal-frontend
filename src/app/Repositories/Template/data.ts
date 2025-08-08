import { ContentAreaProps } from "app/Hooks/useBuilder";
import { BaseResponse } from "../BaseRepository";
import { BlockResponseData } from "../Block/data";
import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { PermissionTypes } from "../ProgressTracker/data";
import { ConfigState } from "app/Hooks/useTemplateHeader";

export type TemplateProcessProps = {
  process_type: "from" | "to" | "through" | "cc" | "approvers";
  stage: DataOptionsProps | null;
  group: DataOptionsProps | null;
  department: DataOptionsProps | null;
  staff?: DataOptionsProps | null;
  is_approving?: DataOptionsProps | null;
  permissions: PermissionTypes;
};

export type TemplateProcessConfigProps = {
  subject: string;
  process: ConfigState;
};

export interface TemplateResponseData extends BaseResponse {
  document_category_id: number;
  name: string;
  header: "banner" | "memo" | "resource";
  config?: TemplateProcessConfigProps;
  body?: ContentAreaProps[];
  footer: string;
  active: number;
  blocks?: BlockResponseData[];
  created_at?: string;
  updated_at?: string;
}
