import { BaseResponse } from "../BaseRepository";
import { WorkflowStageResponseData } from "../WorkflowStage/data";

export interface WorkflowResponseData extends BaseResponse {
  name: string;
  document_type_id: number;
  type: "serialize" | "broadcast";
  stages?: WorkflowStageResponseData[];
  description: string;
  created_at?: string;
  updated_at?: string;
}
