import { DataOptionsProps } from "resources/views/components/forms/MultiSelect";
import { BaseResponse } from "../BaseRepository";
import { StageCategoryResponseData } from "../StageCategory/data";
import { DocumentActionResponseData } from "../DocumentAction/data";

export interface WorkflowStageGroupProps {
  id: number;
  name: string;
  label: string;
}

export interface WorkflowStageResponseData extends BaseResponse {
  workflow_stage_category_id: number;
  fallback_stage_id: number;
  department_id: number;
  name: string;
  can_appeal: number;
  append_signature: number;
  isDisplayed: 1 | 0;
  flow: "process" | "tracker" | "both";
  category: "staff" | "third-party" | "system";
  stage_category: StageCategoryResponseData | null;
  groups: DataOptionsProps[];
  department?: DataOptionsProps;
  recipients: DataOptionsProps[];
  actions: DataOptionsProps[];
  document_actions: DocumentActionResponseData[];
  created_at?: string;
  updated_at?: string;
}
