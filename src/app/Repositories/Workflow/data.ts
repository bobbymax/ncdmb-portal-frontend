import { BaseResponse } from "../BaseRepository";
import { ProgressTrackerResponseData } from "../ProgressTracker/data";
import { WorkflowStageResponseData } from "../WorkflowStage/data";

export interface WorkflowResponseData extends BaseResponse {
  name: string;
  type: "serialize" | "broadcast";
  stages?: WorkflowStageResponseData[];
  trackers: ProgressTrackerResponseData[];
  description: string;
  created_at?: string;
  updated_at?: string;
}
