import { BaseResponse } from "../BaseRepository";
import { StageCategoryResponseData } from "../StageCategory/data";

export interface WorkflowStageGroupProps {
  id: number;
  name: string;
  label: string;
}

export interface WorkflowStageResponseData extends BaseResponse {
  group_id: number;
  workflow_stage_category_id: number;
  department_id: number;
  name: string;
  stage_category: StageCategoryResponseData | null;
  group: WorkflowStageGroupProps | null;
  status:
    | "passed"
    | "failed"
    | "attend"
    | "appeal"
    | "stalled"
    | "cancelled"
    | "complete";
  can_appeal: number;
  append_signature: number;
  should_upload: number;
  created_at?: string;
  updated_at?: string;
}
