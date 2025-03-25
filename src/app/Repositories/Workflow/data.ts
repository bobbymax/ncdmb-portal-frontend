import { BaseResponse } from "../BaseRepository";
import { ProgressTrackerResponseData } from "../ProgressTracker/data";
import { SignatoryResponseData } from "../Signatory/data";
import { WorkflowStageResponseData } from "../WorkflowStage/data";

export interface WorkflowResponseData extends BaseResponse {
  name: string;
  type: "serialize" | "broadcast";
  stages?: WorkflowStageResponseData[];
  signatories?: SignatoryResponseData[];
  trackers: ProgressTrackerResponseData[];
  description: string;
  created_at?: string;
  updated_at?: string;
}
